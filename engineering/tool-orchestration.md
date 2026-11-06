# Tool orchestration for LLM agents

> **Dated snapshot.** First compiled in June 2026 from primary engineering publications (Anthropic, OpenAI, Google, Vercel, LangChain) and papers. Re-verified on 2026-11-06 against the live pages linked in each section; claims that no longer held were rewritten or cut ([Caveats](#caveats) lists what was carried over unchanged). Provider APIs drift monthly: re-check a symbol against its live docs before you pin it. Vendor numbers are first-party and illustrative. No model ids appear here on purpose: pick models from current provider docs.

Scope: orchestration inside the products you build. To orchestrate your own development work across Claude Code and other CLIs, read [multi-model-orchestration.md](multi-model-orchestration.md). Code-level patterns (repositories, boundary parsing, provider wrappers) are in [patterns.md](patterns.md).

Read §1 first; it holds across providers. §2–§5 are per-vendor foot-guns, §6 is MCP, §7 frameworks, §8–§9 what the research supports, §10 the source index.

## 1. Provider-agnostic principles

### 1.1 Fewer, higher-level tools

- More tools do not reliably improve outcomes. A common failure is one tool per API endpoint. Consolidate: one `schedule_event` instead of `list_users` + `list_events` + `create_event`; one `get_customer_context` instead of `get_customer_by_id` + `list_transactions` + `list_notes`.
- Overlapping tool sets are one of the most common agent failures. If an engineer cannot say which tool applies, the model cannot either.
- Combine functions that are always called in sequence. Do not make the model fill arguments your code already knows: `submit_refund()` takes no parameters, and your code passes the order id (OpenAI function-calling guide).
- Make invalid states unrepresentable with enums and object structure: `toggle_light(on: bool, off: bool)` admits a call that is both.
- Write tool descriptions like a docstring for a new colleague: purpose, each parameter and its format, what the output means, example usage, edge cases, the boundary with sibling tools. The intern test: could a person use the tool correctly with only what you gave the model?
- Keep the set that is visible at the start of a turn small. OpenAI: fewer than 20, as a soft suggestion. Google: 10–20 active tools. Defer the rest (§6).

### 1.2 Tool responses

- Return only high-signal fields. Resolve opaque identifiers to meaningful names: Anthropic reports that replacing UUIDs with natural-language or 0-indexed ids "significantly improves Claude's precision in retrieval tasks". Drop fields like `uuid`, `mime_type` or `256px_image_url` unless a downstream call needs them.
- Let the agent choose verbosity with a `response_format` enum (`concise` | `detailed`). Anthropic's Slack example: 206 tokens detailed, 72 concise.
- Paginate, filter, range-select and truncate with sensible defaults. When you truncate, say so in the result and tell the agent how to narrow the query. Claude Code limits MCP tool output to 25,000 tokens by default and warns above 10,000 (`MAX_MCP_OUTPUT_TOKENS`, [MCP docs](https://code.claude.com/docs/en/mcp)).
- Return errors as readable results ("rate limited, retry after 30s"; "`date` must be ISO-8601, got `12/03`"), not thrown exceptions. The model can only recover from a failure it can read.
- Instrument tool use: calls per task, errors per tool, tokens, runtime. Many redundant calls point to wrong pagination defaults; many invalid-parameter errors point to a weak description.

Source: Anthropic, [*Writing effective tools for AI agents*](https://www.anthropic.com/engineering/writing-tools-for-agents).

### 1.3 Context is not free

- Every tool schema and every verbose result competes with the task for attention; selection and reasoning degrade as context grows (§9.2).
- Passing every intermediate result through the model is the main source of token waste. Filter and transform in the execution environment (§2.3).
- Long tasks have three levers: **compaction** (summarise near the limit and restart from the summary; tune the compaction prompt on real traces, recall first, then precision), **structured note-taking** (the agent writes notes outside the window and reads them back), and **subagents** that explore in their own window and return a condensed summary, often 1,000–2,000 tokens.

Source: Anthropic, [*Effective context engineering for AI agents*](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents).

### 1.4 Start simple

- **Workflows** run LLMs and tools through predefined code paths. **Agents** direct their own process and tool use. Use the simplest one that works; add agency only when it measurably improves outcomes.
- The five composable patterns (Anthropic, [*Building effective agents*](https://www.anthropic.com/research/building-effective-agents)):
  1. **Prompt chaining**: a sequence of steps, each processing the previous output, with programmatic gates between them.
  2. **Routing**: classify the input, send it to a specialised follow-up.
  3. **Parallelization**: *sectioning* (independent subtasks at once) and *voting* (the same task several times for diverse outputs).
  4. **Orchestrator-workers**: a central LLM breaks the task down at run time, delegates, and synthesises.
  5. **Evaluator-optimizer**: one LLM generates, another evaluates and feeds back, in a loop.

### 1.5 Harden the loop, not the model

The loop itself (call the model, run tools, append, repeat) is solved. The decisions live around it. Cross-framework consensus, summarised by Steve Kinney, [*Agent Loops*](https://stevekinney.com/writing/agent-loops) (2026-03-19), and reflected in every SDK below:

- **Terminate in depth.** Step caps (about 15–25), wall-clock timeouts, token or cost budgets, loop detection by request fingerprint, error classes (retry 429 and 5xx with backoff; stop on 401 and 403).
- **Degrade, don't vanish.** At the step cap, make one final call with tools disabled so the model summarises what it has, instead of returning nothing. The OpenAI Agents SDK has a `max_turns` error handler for the controlled final output (§3); in other stacks, write it.
- **Keep the prompt cache warm.** Keep the system prompt and tool definitions stable at the front and the history append-only. Where the API offers it, restrict callable tools with an allow-list that leaves the definitions in place (OpenAI `allowed_tools`, §3). Removing tools from the request per step (AI SDK `activeTools`, §5) narrows selection but changes the cached prefix.
- **Make every side-effecting tool idempotent or approval-gated.** A retried step must not double-charge, double-send or double-write ([patterns.md](patterns.md#5-human-approval-in-one-transaction)).

## 2. Anthropic / Claude

### 2.1 Naming

Prefix namespacing (`asana_search`, `jira_search`) versus resource namespacing (`asana_projects_search`, `asana_users_search`) has "non-trivial effects" on Anthropic's tool-use evals, and the effect varies by model. Choose by your own evals, then keep one scheme.

### 2.2 Advanced tool use (Claude API)

Three API features from [*Introducing advanced tool use*](https://www.anthropic.com/engineering/advanced-tool-use) (Nov 2025):

- **Tool Search Tool.** Mark tools `defer_loading: true`; Claude sees only the search tool plus the non-deferred tools and loads 3–5 relevant definitions on demand. In Anthropic's 50+ tool example, context spent before any work drops from about 77K tokens to about 8.7K, and internal MCP evals gained accuracy. Keep your few most-used tools non-deferred.
- **Programmatic Tool Calling.** A tool can be marked callable from the code-execution sandbox, so Claude orchestrates many calls in code and only the final result enters context. Use it for loops, joins and aggregation over large tool outputs.
- **Tool Use Examples.** Example inputs attached to a tool definition teach what a JSON schema cannot express: which optional parameters go together, formats, conventions.

### 2.3 Code execution with MCP

Present MCP servers to the agent as code APIs. The agent loads only the definitions it needs and filters data in the sandbox, so large intermediate payloads never enter context. Anthropic's Drive-to-CRM example went from 150,000 to 2,000 tokens; Cloudflare published the same idea as "Code Mode". Source: [*Code execution with MCP*](https://www.anthropic.com/engineering/code-execution-with-mcp).

### 2.4 Multi-agent research system

From [*How we built our multi-agent research system*](https://www.anthropic.com/engineering/multi-agent-research-system):

- A lead agent plans and spawns parallel subagents, each with its own window, each returning a condensed result. On Anthropic's internal research eval, this setup beat a single agent running the lead's model by 90.2%.
- Cost scales with it: agents used about 4× the tokens of chat, multi-agent systems about 15×. On BrowseComp, token usage alone explained 80% of the performance variance. Use multi-agent only where the work splits into independent breadth and its value pays for the tokens.
- Early prompt changes have large effects (30% to 80% success). About 20 realistic queries are enough to see them; you do not need a large eval set to start.

Use subagents for parallel breadth, noisy output or isolation, not for "smarter" answers: it is the same model.

### 2.5 Writing an MCP server for Claude Code

Claude Code defers MCP tool definitions by default: at session start only tool names and server instructions load, and Claude fetches schemas through tool search ([MCP docs](https://code.claude.com/docs/en/mcp#scale-with-mcp-tool-search)).

- Server instructions decide whether Claude searches for your tools. State the category of tasks, when to search, and the key capabilities, in that order.
- Claude Code cuts server instructions and upfront tool descriptions at 4,096 characters, and descriptions loaded through tool search at 16,384. Tool search matches against the text within the shorter limit, so put the words a user would search for first.
- Set `"anthropic/alwaysLoad"` in a tool's `_meta` for the one or two tools that must always be visible. Leave everything else deferred.

## 3. OpenAI

Build on the **Responses API** and the open-source **Agents SDK** (runner loop, handoffs, guardrails, sessions, tracing).

- **One agent first.** "Start with one agent whenever you can. Add specialists only when they materially improve capability isolation, policy isolation, prompt clarity, or trace legibility." Splitting too early adds prompts, traces and approval surfaces without improving the workflow ([orchestration guide](https://developers.openai.com/api/docs/guides/agents/orchestration)).
- **Agents as tools vs handoffs: who owns the answer.** With `Agent.as_tool()` a manager keeps control, calls specialists for bounded subtasks and writes the final answer. With a handoff, the specialist becomes the active agent for the rest of the turn and answers directly. The two combine ([multi-agent docs](https://openai.github.io/openai-agents-python/multi_agent/)).
- **Mix model-driven and code-driven orchestration.** Open-ended work goes to the model; predictable paths go to code: classify with structured output and branch; chain agents; loop until an evaluator passes; run independent agents in parallel.
- **Strict mode.** `strict: true` makes calls follow the schema instead of best effort, and OpenAI recommends it always. It requires `additionalProperties: false` on every object and every property in `required`; model an optional field as nullable (`["string", "null"]`). If you omit `strict`, Responses tries to normalise the schema to strict and falls back to best effort, shown as `strict: false` on the tool; Chat Completions stays non-strict. With a fine-tuned model, parallel calls disable strict for those calls ([function calling](https://developers.openai.com/api/docs/guides/function-calling)).
- **Tool control.** `parallel_tool_calls: false` allows at most one call per turn. `tool_choice` takes `auto` (default), `required`, `none`, one named function, or `allowed_tools` to restrict the callable subset while the full tool list stays in the cached prefix.
- **Large tool surfaces.** Group tools into **namespaces** (`crm`, `billing`) and defer them with `defer_loading` behind `tool_search`, which only newer models support (check the guide). Keep namespace descriptions short and put the detail in function descriptions. Tool definitions are injected into the system message and billed as input tokens.
- **Runner loop.** `Runner.run`, `run_sync`, `run_streamed`: call the model; stop on final output; switch agent on handoff; run tool calls and continue. Exceeding `max_turns` raises `MaxTurnsExceeded`; `max_turns=None` removes the cap. `error_handlers={"max_turns": ...}` returns a controlled final output instead (the §1.5 degrade path); the other keys are `"model_refusal"` and `"invalid_final_output"` ([running agents](https://openai.github.io/openai-agents-python/running_agents/)).
- **Guardrails.** Input, output and tool-level guardrails return a result with `tripwire_triggered`; a tripwire raises an exception. Input guardrails run in parallel with the agent (lower latency, tokens spent before the trip) or blocking.
- **Sessions and tracing.** Pluggable cross-turn memory (SQLite, SQLAlchemy, Redis, MongoDB, encrypted variants). Built-in tracing spans feed evals.
- **Evals.** Grade traces per step (routing, tool choice, handoff timing), not only the final answer: most multi-agent failures are wrong routing or mistimed handoffs, and the final answer is only the last event of the run.

## 4. Google / Gemini

Google's current request surface for agents is the **Interactions API**. Several older Gemini habits break on current models.

- **Keep conversation state on the server.** Chain turns, including function calling, with `previous_interaction_id`. In stateful mode the server stores and passes thought signatures for you; in stateless mode, reasoning sits in dedicated `thought` steps. Google's SDKs handle signatures automatically. If you hand-roll requests, follow the [thought-signatures guide](https://ai.google.dev/gemini-api/docs/thought-signatures) exactly.
- **Sampling parameters.** On Google's newest model, `temperature`, `top_p` and `top_k` are ignored; set reasoning depth with `thinking_level`. Do not port "temperature 0 for tool calls" from older stacks. Raise `max_output_tokens` (Google suggests at least 32,768) because thinking spends the same budget, and set client timeouts to at least 15 minutes or use background execution ([latest-model guide](https://ai.google.dev/gemini-api/docs/latest-model)).
- **Tool choice.** `tool_choice` takes `auto` (default), `any` (always call), `none`, or `validated` (schema adherence), with `allowed_tools` to force a subset. Match each `function_result` to its call by `call_id`; parallel results can arrive in any order.
- **Schema complexity is a hard limit.** In `any` mode, or with complex schemas, the API compiles declarations into a state machine with limits on states, branching and depth, and rejects an oversized set with `400 INVALID_ARGUMENT`. Fix it by splitting large tool sets, flattening nesting, making recursive references optional, marking fields `required` with `null` allowed instead of optional, trimming enums and `anyOf` unions, shortening property names, and moving rules into descriptions ([function calling](https://ai.google.dev/gemini-api/docs/function-calling)).
- **Text before a tool call.** A prompt that demands structured text (`<UPDATE>…</UPDATE>`) right before a call can fail with `Malformed_Function_Call`. Put the notes in a dedicated `update()` function call instead, or use Markdown headers, or drop the requirement.
- **Remote MCP** in the Gemini API works only with Streamable HTTP servers (not SSE), and server names must not contain `-`; use `snake_case`.
- **ADK.** Template workflow agents (`SequentialAgent`, `ParallelAgent`, `LoopAgent`) run sub-agents in a fixed order without asking a model. From ADK 2.0 (Python, Go), graph-based and dynamic workflows supersede them ([ADK docs](https://google.github.io/adk-docs/agents/workflow-agents/)). Pick ADK for products that live in Google Cloud.

## 5. Vercel AI SDK (v7)

Names follow the [v7 migration guide](https://ai-sdk.dev/docs/migration-guides/migration-guide-7-0), [loop control](https://ai-sdk.dev/docs/agents/loop-control), [tool calling](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling) and [MCP](https://ai-sdk.dev/docs/ai-sdk-core/mcp-tools) docs. Node 22+, ESM only.

```ts
import { ToolLoopAgent, isStepCount, hasToolCall } from 'ai';

const agent = new ToolLoopAgent({
  model: '<provider>/<model-id>', // a gateway string, or a provider instance
  instructions: 'You answer weather questions.', // was `system` before v7
  tools: { weather: weatherTool, done: doneTool },
  stopWhen: [isStepCount(20), hasToolCall('done')], // any match stops; set it explicitly
});
const { text } = await agent.generate({ prompt: '…' });
```

- **Stop conditions:** `isStepCount(n)` (was `stepCountIs`), `hasToolCall(...names)`, `isLoopFinished()` (removes the step limit; pair it with another bound), or a custom predicate over `steps`.
- **`prepareStep`** runs before each step. It can override `model` (send cheap tool-dispatch steps and expensive synthesis steps to different models), `activeTools` (narrow the tool surface per step), `toolChoice`, `messages` (trim or compact) and call settings. In v7, returned `instructions` and `messages` persist for later steps until another override.
- **Steering** (experimental): `experimental_createSteering()` plus `steer()` adds a user message to a running loop at the next step boundary, without interrupting running tools.
- **Callbacks and results:** `onStepEnd` (was `onStepFinish`), `onEnd` (was `onFinish`); the full event stream is `stream` (was `fullStream`). `usage` and top-level `toolCalls` aggregate all steps; `finalStep` holds the last one.
- **Tools:** `tool({ description, inputSchema, execute })`. `strict: true` is per tool, on providers that support it. `inputExamples` attaches examples; `toModelOutput` transforms a result before the model sees it. `dynamicTool` covers tools without static types (MCP). Execution context is `context`, split into `runtimeContext` and per-tool `toolsContext` (was `experimental_context`), typed with `contextSchema`.
- **Human in the loop:** the `toolApproval` setting on the call or agent; per-tool `needsApproval` is deprecated.
- **Structured output:** `generateText({ output: Output.object({ schema }) })`, then read `result.output` (`experimental_output` is removed).
- **MCP:** `createMCPClient` from `@ai-sdk/mcp`. Use HTTP transport (`transport: { type: 'http', url, authProvider }`) in production; stdio is for local servers only. Pass `schemas` to expose a typed subset. Redirects default to `'error'` to prevent SSRF; allow-list the OAuth origins you trust. Close the client when done.
- **Telemetry:** install `@ai-sdk/otel` and call `registerTelemetry(new OpenTelemetry())` once at startup (in Next.js, in `instrumentation.ts`). Telemetry is then on for every call; the v6 `isEnabled: true` flag is redundant.
- **Routing:** a `creator/model` string routes through Vercel AI Gateway (budgets, fallbacks, provider order).

Provider-executed tool version strings (code execution, shell) change often; re-verify them before you pin.

## 6. Model Context Protocol (MCP)

MCP is the cross-provider tool protocol. The 2025–2026 theme is scaling tool selection without prompt bloat.

- **The problem.** Loading every definition up front costs time and tokens and degrades selection as the count grows. In Anthropic's five-server example (58 tools), definitions take about 55K tokens before the conversation starts. Larger windows do not fix selection (§9.2).
- **The industry answer is deferral, and it has converged.** Claude Code tool search (§2.5), the Claude API Tool Search Tool (§2.2), OpenAI `tool_search` with namespaces (§3) and LangGraph's `langgraph-bigtool` (§7) all load a small relevant subset on demand. Design servers for it: clear server instructions, distinct tool names, search words early in each description.
- **Code execution with MCP** (§2.3) keeps intermediate data out of context.
- **Research.** RAG-MCP (`arXiv:2505.03275`) retrieves relevant tool descriptions from an index: selection accuracy 43.13% against 13.62% with every tool in the prompt, and more than half the prompt tokens saved (preprint; one model, one benchmark). ScaleMCP (`arXiv:2505.06416`) gives the agent a retrieval tool it calls repeatedly across turns, and keeps the index in sync with the servers by hashing tool metadata (preprint; the authors' own 5,000-server dataset). MCP-Bench (`arXiv:2508.20453`) tests retrieval from fuzzy instructions without tool names, multi-hop planning and cross-domain orchestration on real servers; 20 models show persistent failures.

## 7. Orchestration frameworks

### 7.1 LangGraph

- An agent is a typed `StateGraph` of nodes and conditional edges, not a free-form loop. Execution advances in **super-steps**: one tick in which every scheduled node runs, possibly in parallel. You trade terseness for inspectable routing, durable resumption, approval gates and replay.
- **Checkpointers** (`InMemorySaver`, SQLite, `PostgresSaver`) snapshot state at every super-step into threads keyed by `thread_id`. When a node fails mid-step, writes from the nodes that succeeded are kept, so a resume does not re-run them. `graph.invoke(None, config)` continues after an error; a snapshot from `get_state_history()` replays from that checkpoint; updating state from a past checkpoint forks a new branch. **Stores** hold cross-thread, long-term data ([persistence](https://docs.langchain.com/oss/python/langgraph/persistence), [checkpointers](https://docs.langchain.com/oss/python/langgraph/checkpointers)).
- **Durability modes** (`durability="exit" | "async" | "sync"`) trade speed for crash recovery: persist only at the end, while the next step runs, or before proceeding.
- **Human in the loop:** `interrupt()` pauses the graph; resume on the same thread.
- **Tool selection at scale:** `langgraph-bigtool` puts the tool catalogue in the store and retrieves a relevant subset per query.
- **Multi-agent:** a supervisor that mediates every hop is simpler to debug than a swarm where any agent hands off. Move to a swarm only when latency data shows the central hop is the bottleneck and misrouting is rare.
- **LangSmith** traces the full execution tree and runs offline and online evals; it works with any stack through SDKs.

### 7.2 Which framework

| Framework | Control model | Pick when |
|---|---|---|
| LangGraph | graph, checkpoints, time travel | explicit control flow, durable long-running workflows, approval gates |
| OpenAI Agents SDK | handoffs, guardrails, tracing | OpenAI-native, lighter orchestration |
| Google ADK | workflow agents, graph workflows | products in the Google Cloud ecosystem |
| Vercel AI SDK | tool loop, `prepareStep`, streaming UI | TypeScript web stacks; the default in [reference-stack.md](reference-stack.md#which-agent-sdk) |
| CrewAI | role-based crews | simple role-defined multi-agent tasks |
| AutoGen / AG2 | conversational group chat | conversation-driven agent groups |

The comparison is third-party and directional. Framework boundaries are blurring toward compositions of several.

## 8. Multi-agent failure modes

**MAST** (`arXiv:2503.13657`, Cemri et al., UC Berkeley; NeurIPS 2025, peer-reviewed) annotated 1,600+ traces across 7 frameworks (Cohen's κ 0.88) and found 14 failure modes in three groups:

1. **Specification and system design:** disobeyed task specification, disobeyed role specification, step repetition, loss of conversation history, unaware of termination conditions.
2. **Inter-agent misalignment:** conversation reset, failure to ask for clarification, task derailment, information withholding, ignored input from another agent, reasoning-action mismatch.
3. **Task verification and termination:** premature termination, no or incomplete verification, incorrect verification.

Multi-agent systems often gain little over single-agent baselines. The failures are mostly design failures that persist across model families, so better design fixes them.

Synthesis with §2.4, §3 and §9.1: the model is rarely the bottleneck; the orchestration design is. Default to one agent. Add agents for real capability or policy isolation, or for parallel breadth worth the tokens. Instrument every handoff, because misrouting and mistimed handoffs are the dominant failure class.

## 9. Evaluation and context

### 9.1 Measure reliability, not one run

- **τ-bench** (`arXiv:2406.12045`, Yao et al.): a simulated user, a tool-using agent with a written policy, success judged on the final database state. Introduces **pass^k**: success on the same task in all k trials. Function-calling agents of the time solved under 50% of tasks; retail pass^8 was under 25%.
- **τ²-bench** (`arXiv:2506.07982`, Barres et al.): dual control, where user and agent both act on shared state. Success drops by up to 25 points from solo to interactive mode.
- **BFCL** (Berkeley Function-Calling Leaderboard; PMLR 2025, peer-reviewed): AST-checked simple, parallel and multiple calls plus irrelevance detection; V3 adds multi-turn state-based evaluation, V4 agentic categories and abstention. Frontier models handle single-shot calls; they degrade on multi-turn, long context and "when not to act".

### 9.2 More context degrades performance

- **Context Rot** (Chroma, July 2025, industry report): across 18 models, performance grows less reliable as input grows, even on trivial tasks; one distractor already lowers accuracy.
- **Lost in the Middle** (`arXiv:2307.03172`, Liu et al.; TACL 2023, peer-reviewed): U-shaped accuracy; information in the middle is used worst, even by long-context models.
- **LongFuncEval** (`arXiv:2505.10570`, IBM; preprint): large tool catalogues cost 7–85% accuracy, long API responses 7–91%, long multi-turn 13–40%.

Together they are the evidence that a bigger window does not buy better tool selection.

### 9.3 Build your own evals

- Public leaderboards measure generic capability, not your tools, policies and failure costs. Define success as a checkable state change, run many trials, report pass^k.
- Prefer programmatic checks (final state, AST, schema) wherever the outcome is verifiable. Keep LLM judges for subjective dimensions.
- LLM judges have position bias (verdicts flip in roughly 10–30% of swapped comparisons), verbosity bias and self-preference (`arXiv:2410.21819`, `arXiv:2410.02736`). Randomise order, normalise length, never let the same model generate and judge, and validate the judge against human labels before you trust its trend ([patterns.md](patterns.md#14-calibrated-judges)).
- Collect tool metrics with every eval run: calls, errors, tokens, runtime (§1.2).

## 10. Sources

| Source | Covers |
|---|---|
| Anthropic: [*Building effective agents*](https://www.anthropic.com/research/building-effective-agents) | workflows vs agents, the five patterns |
| Anthropic: [*Writing effective tools for AI agents*](https://www.anthropic.com/engineering/writing-tools-for-agents) | tool design, namespacing, responses |
| Anthropic: [*Effective context engineering*](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) | compaction, notes, subagent summaries |
| Anthropic: [*Advanced tool use*](https://www.anthropic.com/engineering/advanced-tool-use), [*Code execution with MCP*](https://www.anthropic.com/engineering/code-execution-with-mcp) | deferred tools, programmatic calls |
| Anthropic: [*Multi-agent research system*](https://www.anthropic.com/engineering/multi-agent-research-system) | orchestrator-workers, token economics |
| OpenAI: [function calling](https://developers.openai.com/api/docs/guides/function-calling), [orchestration](https://developers.openai.com/api/docs/guides/agents/orchestration), [Agents SDK](https://openai.github.io/openai-agents-python/) | strict mode, tool search, handoffs, runner |
| Google: [function calling](https://ai.google.dev/gemini-api/docs/function-calling), [ADK](https://google.github.io/adk-docs/) | modes, schema limits, workflow agents |
| Vercel: [AI SDK docs](https://ai-sdk.dev/docs) | v7 loop, tools, MCP, telemetry |
| LangChain: [LangGraph docs](https://docs.langchain.com/oss/python/langgraph/overview) | graphs, persistence, interrupts |
| Steve Kinney: [*Agent Loops*](https://stevekinney.com/writing/agent-loops) | loop hardening |
| Papers (arXiv ids above), [τ²-bench repo](https://github.com/sierra-research/tau2-bench), [Context Rot](https://www.trychroma.com/research/context-rot) | the evidence in §6, §8, §9 |

## Caveats

- **Vendor numbers are directional.** Anthropic's token reductions, accuracy gains and multi-agent results are first-party examples, not audited benchmarks.
- **Peer review.** MAST, Lost in the Middle and BFCL are peer-reviewed. RAG-MCP, ScaleMCP, MCP-Bench, τ²-bench, LongFuncEval and the judge-bias papers are preprints or workshop papers. Single-model results may not generalise.
- **API drift.** The symbols and limits in §2–§5 and §7.1 were re-checked against the linked docs on 2026-11-06. The framework table (§7.2) and the research results (§6, §8, §9) carry over from June 2026. Model-gated features (OpenAI `tool_search`, Gemini sampling behaviour) depend on the model you call.
- **What is well supported:** fewer, higher-level tools; keep intermediate results out of context; defer and retrieve tools rather than load them all; start with one agent and add agents only for real isolation or valuable breadth; instrument handoffs; measure pass^k on your own evals. Several independent primary and peer-reviewed sources agree on these.
