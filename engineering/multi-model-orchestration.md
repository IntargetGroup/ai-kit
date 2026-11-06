# Multi-model orchestration from Claude Code

> **Dated snapshot.** Checked on 2026-11-06 against the Claude Code docs (v2.1.3xx) linked below and against `codex-cli 0.164.0` with its [non-interactive docs](https://developers.openai.com/codex/noninteractive). CLI flags change between releases: run `codex exec --help` and `claude --help` before you copy a command into automation.

One Claude Code session is the orchestrator. Other agents are disposable workers: Claude Code subagents and workflows, or another vendor's CLI such as Codex run through the shell. This page covers orchestrating your own development work. For orchestration inside the products you build, read [tool-orchestration.md](tool-orchestration.md).

## 1. The pattern

- **The orchestrator** holds the durable context: repo state, the conversation with you, the plan, and the judgement to accept or reject. It never delegates the accept/reject decision.
- **Workers** get a self-contained prompt, do one job, and return a result. They carry no state between runs; the repo and the run files do.

Why add workers at all:

1. **Clean context.** A worker reads the noisy material (search results, logs, whole files) and returns conclusions. The orchestrator's window stays on the task.
2. **Parallel breadth.** Independent sweeps run at once.
3. **Uncorrelated review.** A model from another vendor has different blind spots. A plan from one model reviewed by another catches failures that same-model review misses.
4. **A different meter.** A CLI signed in to a flat subscription bills that plan, not your Claude plan. This holds only for account auth: with an API key the same run is metered spend (§5).

Claude Code's own parallel features all run Claude sessions; the docs say "to involve a different tool, expose it to Claude as an MCP server" ([run agents in parallel](https://code.claude.com/docs/en/agents)). Running another vendor's CLI from the Bash tool, as in §5–§6, is a convention built on ordinary shell use, not a Claude Code feature. Treat its plumbing as yours to maintain.

## 2. Native workers first

| Mechanism | Who holds the plan | Use it when |
|---|---|---|
| [Subagent](https://code.claude.com/docs/en/sub-agents) | Claude, turn by turn | a side task would flood the main context; the work is self-contained and returns a summary |
| [Dynamic workflow](https://code.claude.com/docs/en/workflows) | a script | dozens of agents, a fan-out over many files, or findings cross-checked against each other |
| [Agent team](https://code.claude.com/docs/en/agent-teams) | a lead session | long-running peers that message each other; experimental and off by default |
| `/batch` | Claude | one large change split into 5–30 worktree-isolated subagents |

Facts that shape a design (from the linked pages):

- **A subagent starts with a fresh context.** It sees only Claude's delegation message, not your conversation, so the task must stand alone. Built-in Explore and Plan also start without `CLAUDE.md` and git status; other subagents load both, and `omitClaudeMd: true` in a definition drops the `CLAUDE.md` files.
- **Background by default.** A subagent spawned from the main conversation starts in the background, and its result arrives in a later turn. Permission prompts from background subagents surface in the main session.
- **Limits.** Subagents nest up to three layers below the main conversation (`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`). At 20 running subagents, spawning another fails (`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`).
- **Model and effort per worker.** A subagent definition sets `model` (an alias such as `sonnet`, `opus`, `haiku`, `fable`, a full id, or `inherit`) and `effort`; Claude can pass an alias per invocation. Resolution order: the per-invocation parameter, then frontmatter, then `CLAUDE_CODE_SUBAGENT_MODEL`, then the main model. An organisation's `availableModels` allow-list can substitute another model; `/tasks` shows which model each subagent runs on.
- **Isolation.** `isolation: worktree` gives a subagent its own git worktree. Use it for every worker that edits files in parallel with another. Agent-team teammates get no worktree: partition the files instead.
- **Bounds.** `maxTurns` stops a subagent and returns its output marked partial.
- **Workflows** run `agent()`, `pipeline()` and `parallel()` calls from a plain JavaScript script; intermediate results stay in script variables, not in Claude's context. An `agent()` call with a `schema` returns validated JSON. Limits: 16 concurrent agents by default, 4,096 items per `pipeline()` or `parallel()` call, 1,000 agents per run, no user input mid-run. A run is resumable within its session. Above 25 agents or a projected 1.5 million tokens, the run shows a `Large workflow` warning; `/workflows` shows per-agent tokens and stops a run. Try a large workflow on a small slice first.

## 3. Roles and model choice

| Role | Job | Mode | Model bar |
|---|---|---|---|
| Explorer | sweep code or docs, return a map or an answer | read-only | fast and cheap |
| Implementer | execute a clearly specified change: code, tests, migrations | write, own worktree | strong instruction following; the spec carries the taste |
| Adversarial reviewer | refute the work: find the bug, break the migration, reject the claim | read-only | the most capable you can afford |
| Second opinion | an independent take on a plan before you commit | read-only | a different vendor from the author, on purpose |

The reviewer roles are the underrated ones. Two models from different vendors, each prompted to attack the other's proposal, is a cheap quality mechanism; the weaker argument is usually obvious from the transcript.

Choosing a model:

- Rank the models you can reach on capability, judgement (UI, copy, API design) and what you actually pay. A model inside a flat plan you already own costs almost nothing per run; an API key is metered. Keep that ranking in your user `~/.claude/CLAUDE.md`, not in a repo: it is personal and changes monthly.
- For work that ships, capability first, judgement second, cost as the tie-breaker. Anything user-facing needs a model with strong judgement.
- Send well-specified mechanical work (migrations, bulk edits, data analysis) to the cheapest capable model.
- Escalate without ceremony. If a cheaper worker's output misses the bar, rerun with a stronger model. Judge the output, not the price.
- Set effort per worker (`effort` on a subagent or stage), not for the whole session.

How much process a task needs (direct, planned, specified, long-horizon) is in [knowledge-management-spec.md §2](knowledge-management-spec.md#2-ceremony-by-task-size). Delegation adds cost; do not spawn workers for a task one agent finishes in one pass.

## 4. The run-path contract

Every foreign-CLI run gets three files, allocated by the orchestrator before launch, in a scratch directory outside the repo:

```text
<scratch>/runs/<slug>.prompt.md   # the full task, written before launch
<scratch>/runs/<slug>.final.md    # the worker's final message: the only file anyone reads
<scratch>/runs/<slug>.log         # stdout and stderr: opened only on failure
```

- `<slug>` is a short kebab-case task name (`rls-migration`, `auth-refactor`), unique per run. A rerun gets `-2`, `-3`; never reuse a slug. Concurrent runs that share an output path overwrite each other, and the loser's result is gone.
- The orchestrator (or the workflow script) is the only allocator. A worker or wrapper never invents a path.
- The result survives on disk. If a wrapper dies or summarises badly, `<slug>.final.md` is still there.
- The prompt file is self-contained: repo path, task, constraints, files the worker may touch, acceptance check, and "end with conclusions only, no narration". The worker has none of your session context.

## 5. Codex CLI as a worker

`codex exec` runs Codex non-interactively. It streams progress to stderr, prints only the final message to stdout, and `-o` also writes that message to a file. The default sandbox is read-only. Codex refuses to start outside a git repository.

Implementation (writes inside the repo):

```bash
codex exec --sandbox workspace-write -C "$REPO" -m "$MODEL" -c 'model_reasoning_effort="high"' \
  -o "$RUNS/$SLUG.final.md" - < "$RUNS/$SLUG.prompt.md" > "$RUNS/$SLUG.log" 2>&1
```

Exploration, review and second opinions (no writes possible):

```bash
codex exec --sandbox read-only -C "$REPO" -m "$MODEL" -c 'model_reasoning_effort="high"' \
  -o "$RUNS/$SLUG.final.md" - < "$RUNS/$SLUG.prompt.md" > "$RUNS/$SLUG.log" 2>&1
```

- **`-` reads the whole prompt from stdin**, here the prompt file. This avoids the OS limit on one argument's size and gives Codex a stdin that ends (see §7.1).
- **Pin the sandbox explicitly.** A reviewer in `read-only` cannot "helpfully fix" the code it was told to attack. `--full-auto` is no longer supported; use `--sandbox workspace-write`. `danger-full-access` belongs only in an isolated runner.
- **`-C <dir>`** sets the working root; **`--add-dir <dir>`** grants one more writable directory; **`--skip-git-repo-check`** allows a non-repo directory. Every extra writable directory is one more place a worker can go wrong.
- **`$MODEL`** is whatever your Codex install exposes on your plan; `model =` in `~/.codex/config.toml` is the value you know works.
- **Structured results:** `--output-schema schema.json` makes the final message conform to a JSON Schema; combine it with `-o` for a parseable result file.
- **Other useful flags:** `--ephemeral` (no session files on disk), `codex exec resume --last "<follow-up>"` (two-stage runs), `--json` (a JSONL event stream; send it to the log, never to the orchestrator).
- **Auth decides the bill.** `codex exec` reuses the CLI's saved sign-in. An account sign-in uses that plan's limits; `CODEX_API_KEY` is metered. Set the key only on the one command that needs it, and never as a job-level variable in a CI job that runs repository code. In GitHub Actions, use `openai/codex-action` instead of installing the CLI.
- **Windows.** The commands are POSIX shell. Claude Code's Bash tool uses Git Bash on Windows when it is installed ([README.md §3](README.md#3-hooks-done-right)).

## 6. Codex inside a subagent or workflow

Workflow and subagent workers are Claude sessions, so a Codex stage needs a thin **wrapper**: a Claude worker on a small, cheap model at low effort whose whole job is one Codex run. It is plumbing, not a mind.

The wrapper prompt carries the slug, the three absolute paths and the task text. The wrapper:

1. Writes the task verbatim to `<slug>.prompt.md`.
2. Runs the §5 command with `-C <repo-root>` (its own working directory is wherever the harness put it), in the foreground, with an explicit Bash `timeout`. It never backgrounds the command and never ends its turn before the command returns.
3. On exit 0 with a non-empty `<slug>.final.md`: returns that file's contents verbatim, nothing else.
4. Otherwise (non-zero exit, or a missing or empty final file): returns the last 50 lines of `<slug>.log`, prefixed `CODEX FAILED:`.

It never reads the log on success, never summarises Codex output, and never chooses its own paths. Keep the contract in one factory in the workflow script, so every stage uses it the same way:

```js
// Sketch. Load /workflow-authoring for the exact agent() options.
const codexStage = ({ slug, task, label }) =>
  agent(wrapperPrompt({ slug, task, paths: runPaths(slug) }), { label, model: SMALL_MODEL });
```

Constraints from the Claude Code docs:

- **Bash time limits.** A foreground command gets 2 minutes by default and at most 10 (`BASH_DEFAULT_TIMEOUT_MS`, `BASH_MAX_TIMEOUT_MS` raise them). A command that reaches its timeout moves to the background. If a foreground subagent started it, it stops when that subagent ends ([tools reference](https://code.claude.com/docs/en/tools-reference#timeout-and-output-limits)); otherwise the wrapper can end its turn before Codex finishes. In both cases the stage returns without the result. Split long tasks into runs that fit the ceiling, or raise it. `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1` makes a timed-out command stop instead, which fails loudly.
- **Auto mode.** The classifier does not treat the prompt a workflow script passes to `agent()` as a request from you ([workflows](https://code.claude.com/docs/en/workflows)). A wrapper's write-mode `codex exec` can therefore be blocked or prompt. Expect the permission prompt in the main session, or pre-approve that exact command shape with a narrow permission rule.
- **Relay ceiling.** "Verbatim" passes through the wrapper's own response, which has an output limit. Ask workers for conclusions, and pass bulky results by file path.
- **Stages pass data through files and prompts, not context.** Keep stage outputs in strict, parseable formats (`--output-schema` on the Codex side, `schema` on the `agent()` side), or the handoff degrades.
- **An empty result is a silent failure.** A wrapper that returns nothing looks like a finished agent. Check the `final.md` files on disk before you trust a thin result.

## 7. Failure modes

1. **An open stdin hangs the run.** With a positional prompt, `codex exec` appends piped stdin to it; a harness that inherits a stdin that never closes leaves the run waiting, and a `| tail` hides the hang. The `- < prompt.md` form in §5 removes the problem. With a positional prompt, close stdin with `< /dev/null`.
2. **Wrong working root.** The launch directory is the sandbox's writable workspace. Launched from a subdirectory, writes elsewhere in the repo are rejected; outside a git repo, Codex does not start. Pass `-C <repo-root>`.
3. **A backgrounded run.** A wrapper that backgrounds the command and promises to "check later" has already returned; nobody collects the result. Foreground only (§6).
4. **Reading the trail.** Codex progress on stderr, and the `--json` stdout stream when you ask for it, contain the whole session: reasoning summaries, every command, every patch, token counters. It is expensive context and worthless evidence. Read `<slug>.final.md`; open the log only on failure, last 50 lines. What a worker changed is `git diff`, not its narration.
5. **Parallel writers in one checkout.** Two implementers editing one worktree overwrite each other. Give each its own worktree (`isolation: worktree`, `claude -w <name>`, or `codex exec --worktree`) and merge through git.

## 8. Accepting work

A worker's report is a claim. Before it counts:

- **Read the diff** yourself, hunk by hunk.
- **Rerun the checks** yourself: typecheck, tests, build. A worker's green output is a claim; your green output is a fact.
- **For migrations that recreate live functions, views or policies**, compare the body with the live definition before you apply it ([patterns.md](patterns.md#4-hand-authored-migrations)).
- **Rejected work** goes back as a fresh prompt file under a new slug, with the reviewer's findings pasted in. Two rejections mean the task was underspecified: fix the spec or move the task up a process tier.

The repo-level rules for long and parallel runs (one worktree and disjoint files per worker, one owner for `STATE.md` and ADR numbers) are in [knowledge-management-spec.md §9](knowledge-management-spec.md#9-long-horizon-and-parallel-work).

## 9. Any other CLI, and Claude Code as the worker

A headless CLI fits the contract when it:

1. accepts a prompt from a file or stdin;
2. writes its final answer to a known file, or prints it last;
3. runs non-interactively to completion in the foreground;
4. has a sandbox or permission model you have read before you grant it write access.

Keep the three-path contract and the acceptance rules identical across vendors. Swapping a vendor is then a one-line change in the launch command.

Claude Code itself works as the worker of another orchestrator through print mode (`claude -p`). The capped, pre-approved command for a repo step is in [knowledge-management-spec.md §9.2](knowledge-management-spec.md#92-many-sessions-one-step-each). For a worker, add ([CLI reference](https://code.claude.com/docs/en/cli-reference)):

- `--output-format json`, or `--json-schema '<schema>'` for validated JSON matching a schema, so the orchestrator parses a result instead of prose;
- `--no-session-persistence`, so worker sessions are not saved or resumable;
- `-w <name>`, so the worker edits its own git worktree.

`--max-budget-usd` checks a client-side cost estimate, which can differ from the bill. `--bare` starts faster but skips `CLAUDE.md`, hooks, skills and MCP servers, so the worker ignores the repo's `AGENTS.md`; keep it for tasks that need no repo rules. It is announced as the future default for `-p`: the check in [§9.2](knowledge-management-spec.md#92-many-sessions-one-step-each) catches the change. Keep `bypassPermissions` for disposable containers ([README.md §7](README.md#7-unattended-runs)).
