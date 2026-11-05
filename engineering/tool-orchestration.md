# Tool orchestration for LLM agents

> **Snapshot: June 2026 — check dates.** Compiled in June 2026 from primary engineering publications (Anthropic, OpenAI, Google, Vercel, LangChain) and papers. On 2026-11-05 the Vercel AI SDK section moved to v7 names, model ids were removed and the benchmark catalogue was cut to the results that change a design. Provider APIs drift monthly: re-check any symbol against live docs before you pin it. Vendor magnitudes are illustrative ([Caveats](#caveats)).

Read §1 first; it holds across providers. §2–§5 are the per-vendor foot-guns. §6 is MCP, §7 frameworks, §8–§9 what the research supports.

## 1. Provider-agnostic principles

### 1.1 Fewer, higher-level tools
- More tools do not reliably improve outcomes. Consolidate operations: one `schedule_event` instead of `list_users` + `list_events` + `create_event`; one `get_customer_context` instead of three lookups.
- Overlapping tool sets are one of the most common agent failures. If an engineer cannot say which tool applies, the model cannot either.
- Write tool descriptions like a docstring for a new colleague: example usage, edge cases, input formats, boundaries with sibling tools. The agent-computer interface deserves the same care as a human UI.
- Return errors as readable results ("rate limited, retry after 30s"), not thrown exceptions. The model can only recover from a failure it can read.

Sources: Anthropic, *Writing effective tools for AI agents*; *Effective context engineering for AI agents*; *Building effective agents*.

### 1.2 Context is not free
- Return only the fields the task needs. Paginate, filter and truncate with sensible defaults (Anthropic's Slack example: about two thirds fewer tokens).
- Passing every intermediate tool result through the model is the main source of token waste. Filter and transform in the execution environment.
- For long tasks, compact: summarise near the limit, keep decisions, open bugs and implementation details, drop redundant tool output.
- Each added schema and each verbose output measurably erodes selection and reasoning (§9).

### 1.3 Start simple
- Workflows run LLMs and tools through predefined code paths. Agents direct their own process. Use the simplest one that works; add agency only when it measurably helps.
- The five composable patterns (Anthropic, *Building effective agents*): prompt chaining, routing, parallelization (sectioning and voting), orchestrator-workers, evaluator-optimizer.

### 1.4 Harden the loop, not the model
Cross-framework consensus on production loops (summarised by Steve Kinney, *Agent Loops*, 2026-03-19):
- Terminate in depth: step caps (about 15–25), wall-clock timeouts, token or cost budgets, loop detection by request fingerprint, error classes (retry 429/5xx, stop on 401/403).
- At the step cap, make one final tool-free call so the model summarises what it has, instead of returning nothing.
- Keep the system prompt and tool definitions stable at the front and history append-only, to maximise prompt-cache hits.

## 2. Anthropic / Claude

- **Namespacing has measurable effects.** Prefix (`asana_search`) versus suffix (`asana_projects_search`) naming changes tool-use eval results, and the effect varies by model. Validate with your own evals.
- **Subagents with clean context.** A lead agent plans; specialised subagents work in isolation and return a condensed summary, often 1,000–2,000 tokens. This is the basis of Anthropic's multi-agent research system. Use subagents for parallel breadth, noisy output or isolation, not for "smarter" answers: it is the same model.
- **Code execution with MCP.** Have the agent write code that calls MCP tools and filters results in the sandbox, so large intermediate data never enters context. Anthropic's Drive-to-CRM example went from 150,000 to 2,000 tokens (first-party, illustrative).
- **Programmatic tool calling.** A tool can be marked callable from inside the code-execution sandbox, so the model orchestrates many calls in code without a round trip each.
- **Reliability metric.** Anthropic model cards report pass^k (§9.1).

Sources: anthropic.com/engineering — *Writing effective tools for AI agents*, *Effective context engineering for AI agents*, *Code execution with MCP* (Nov 2025), *Advanced tool use*, *Multi-agent research system*; anthropic.com/research/building-effective-agents.

## 3. OpenAI

The forward path is the **Responses API** plus the open-source **Agents SDK** (runner, handoffs, guardrails, sessions, tracing). Assistants API is on a deprecation path.

- **One agent first.** "Start with one agent whenever you can. Add specialists only when they materially improve capability isolation, policy isolation, prompt clarity, or trace legibility." Mix model-driven orchestration (open-ended work) with code-driven orchestration (classify with structured output, then branch).
- **Agents as tools vs handoffs.** As a tool (`agent.asTool()`), a manager keeps control and writes the answer. With a handoff, the specialist owns the reply. Split only when branches need different instructions, tools or policies.
- **Strict tool arguments.** `strict: true` guarantees schema adherence; it needs `additionalProperties: false`, every field in `required`, optional fields as `["string","null"]`.
- **Tool control.** `parallel_tool_calls` defaults to `true`. `tool_choice` with `allowed_tools` restricts the callable subset while keeping definitions cached.
- **Evals.** Grade traces per step. Most failures are wrong routing or mistimed handoffs, not the final answer.

Sources: openai.github.io/openai-agents-python (multi_agent, running_agents, guardrails, tools); developers.openai.com/api/docs/guides (agents/orchestration, function-calling); developers.openai.com/cookbook (macro_evals_for_agentic_systems).

## 4. Google / Gemini

- **Keep the set small.** Declarations use an OpenAPI 3.0.3 subset; very large or deeply nested schemas can be rejected. Google's guidance: 10–20 active tools.
- **Echo call ids** in each `functionResponse`. Parallel results can return out of order.
- **Thought signatures** (Gemini 3) must be returned verbatim and in order; a missing one on function calling returns HTTP 400. Google's SDKs handle this; raw REST callers must.
- **Temperature.** The Gemini 3 guide recommends the default 1.0; lowering it can cause looping. Do not carry over "temperature 0 for tools".
- **ADK** composes `SequentialAgent`, `ParallelAgent`, `LoopAgent` and `LlmAgent` into hierarchies; pick it for products in the Google Cloud ecosystem.

Sources: ai.google.dev/gemini-api/docs (function-calling, gemini-3); google.github.io/adk-docs.

## 5. Vercel AI SDK (v7)

Names below follow the [v7 migration guide](https://ai-sdk.dev/docs/migration-guides/migration-guide-7-0) and [loop control docs](https://ai-sdk.dev/docs/agents/loop-control). Node 22+, ESM only.

```ts
import { ToolLoopAgent, isStepCount } from 'ai';

const agent = new ToolLoopAgent({
  model: '<provider>/<model-id>', // a gateway string, or a provider instance
  instructions: 'You answer weather questions.', // was `system` before v7
  tools: { weather: weatherTool },
  stopWhen: isStepCount(20), // was `stepCountIs`; set it explicitly
});
const { text } = await agent.generate({ prompt: '…' });
```

- **Stop conditions:** `isStepCount(n)`, `hasToolCall(...names)`, `isLoopFinished()` (removes the step limit; use with another bound), or a custom predicate. `stopWhen` takes one or an array; any match stops.
- **`prepareStep`** runs between steps and can override `model`, `activeTools` (narrow the tool surface per step), `toolChoice`, `messages`, and sampling settings. In v7, `instructions` and `messages` returned from it carry forward to later steps.
- **Step callbacks:** `onStepEnd` (was `onStepFinish`), `onEnd` (was `onFinish`); the stream is `stream` (was `fullStream`).
- **Tools:** `tool({ description, inputSchema, execute })`; `contextSchema` is new. Execution context is `context`, split into `runtimeContext` and per-tool `toolsContext` (was `experimental_context`). `dynamicTool` covers tools without static schemas (MCP).
- **Human in the loop:** use the `toolApproval` setting; per-tool `needsApproval` is deprecated.
- **Results:** `usage` and top-level `toolCalls` now aggregate all steps; use `finalStep` for the last step.
- **MCP:** `createMCPClient` from `@ai-sdk/mcp` with HTTP transport for remote servers; pass explicit `schemas` to expose a typed subset; close the client. MCP `redirect` now defaults to `'error'`.
- **Telemetry:** OpenTelemetry lives in `@ai-sdk/otel` and is on once an integration is registered.
- **Routing:** a `creator/model` string routes through Vercel AI Gateway (budgets, fallbacks, provider order). With `prepareStep`'s `model` override, route cheap steps (tool dispatch) and expensive steps (synthesis) to different models.

Flags: `dynamicTool` and the MCP `schemas` option are carried over from v6 and were not re-checked against v7 docs. Provider-executed tool version strings (code execution, shell) change often; re-verify before pinning.

## 6. Model Context Protocol (MCP)

MCP is the cross-provider tool protocol. The 2025–2026 theme is scaling tool selection without prompt bloat.

- **The problem.** Loading every tool definition up front costs time and tokens and degrades selection as the count grows. Teams report three MCP servers using 72% of a 200k window. Larger windows do not fix selection (§9).
- **Deferred loading.** Claude Code loads only tool names and server instructions at session start and fetches schemas on demand; server instructions are cut at 4,096 characters ([MCP docs](https://code.claude.com/docs/en/mcp)). Put the category of tasks, when to search, and key capabilities first in your server's instructions.
- **Code execution with MCP** (§2) keeps intermediate data out of context.
- **Retrieve tools, don't load them all.** Retrieving relevant tool descriptions from an index raised selection accuracy from 13.62% to 43.13% and saved more than half the prompt tokens (RAG-MCP, `arXiv:2505.03275`; preprint, one model and benchmark).

## 7. Orchestration frameworks

- **LangGraph** models an agent as a typed `StateGraph` with conditional edges. You trade terseness for inspectable routing, durable resumption (checkpoints per thread), `interrupt()` for human approval, and replay.
- **Multi-agent:** a central supervisor is simpler to debug than a swarm where any agent hands off. Pick the swarm only when latency data shows the central hop is the bottleneck.

| Framework | Pick when |
|---|---|
| LangGraph | explicit control flow, durable long-running workflows, approval gates |
| OpenAI Agents SDK | OpenAI-native, lighter orchestration with handoffs and guardrails |
| CrewAI | simple role-based multi-agent tasks |
| AutoGen / AG2 | conversation-driven agent groups |
| Vercel AI SDK / Mastra | TypeScript web stacks, streaming UIs |

This comparison is third-party and directional.

Sources: docs.langchain.com/oss/python/langgraph; reference.langchain.com (langgraph-supervisor, langgraph-swarm).

## 8. Multi-agent failure modes

- **MAST** (`arXiv:2503.13657`, Cemri et al., UC Berkeley, NeurIPS 2025, peer-reviewed): 14 failure modes in three groups (specification and design, inter-agent misalignment, verification and termination), from 1,600+ annotated traces across 7 frameworks. Multi-agent systems often gain little over single-agent baselines; most failures are design failures, fixable by design.

Synthesis: the model is rarely the bottleneck; the orchestration design is. Default to one agent. Add agents only for real capability or policy isolation, and instrument every handoff.

## 9. Evaluation and context

### 9.1 Measure reliability, not one run
- **τ-bench** (`arXiv:2406.12045`, Yao et al.): simulated users, tool-equipped agents with a written policy, scored on final database state. Introduces **pass^k**, success on the same task across all k trials. Function-calling agents of the time solved under 50% of tasks, with retail pass^8 under 25%.
- **τ²-bench** (`arXiv:2506.07982`, Barres et al.): dual control, where user and agent both act on shared state; up to a 25-point drop from solo mode.

### 9.2 More context degrades performance
- **Context Rot** (Chroma, July 2025, industry report): across 18 models, performance grows less reliable as input grows, even on trivial tasks; one distractor already lowers accuracy.
- **Lost in the Middle** (`arXiv:2307.03172`, Liu et al., TACL 2023, peer-reviewed): U-shaped accuracy; information in the middle is used worst, even by long-context models.
- **LongFuncEval** (`arXiv:2505.10570`, IBM, preprint): large tool catalogs cost 7–85%, long API responses 7–91%, long multi-turn 13–40%.

### 9.3 Build your own evals
- Define success as a checkable state change. Run many trials. Report pass^k.
- LLM-as-judge has position bias (verdicts flip in roughly 10–30% of swapped comparisons), verbosity bias and self-preference (`arXiv:2410.21819`, `arXiv:2410.02736`). Randomise order, normalise length, never let the same model generate and judge, validate the judge against human labels.
- Prefer programmatic checks (state, AST) wherever the outcome is verifiable. Keep LLM judges for subjective dimensions, and audit them.

Sources: github.com/sierra-research/tau2-bench; trychroma.com/research/context-rot; arxiv.org (ids above).

## Caveats

- **Vendor numbers are directional.** Anthropic's token reductions and LangChain's survey figures are first-party.
- **Peer review.** MAST and Lost in the Middle are peer-reviewed. RAG-MCP, τ²-bench, LongFuncEval and the judge-bias papers are preprints. Single-model results may not generalise.
- **API drift.** The AI SDK section was refreshed on 2026-11-05. The OpenAI and Gemini notes were not: re-check them before you rely on a symbol.
- **What is well supported:** fewer, higher-level tools; keep intermediate results out of context; retrieve tools rather than load them all; start with one agent and add agents only for real isolation; instrument handoffs; measure pass^k on your own evals. Multiple independent primary and peer-reviewed sources agree on these.
