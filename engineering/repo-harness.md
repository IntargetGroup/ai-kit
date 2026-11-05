# Repo harness

A small set of files and rules that lets Claude Code work on a codebase across many sessions, compactions and people without losing state or claiming work it did not do.
Use it when work on a repo spans several sessions or several people. Skip it for scripts, spikes and one-session repos: a good `AGENTS.md` ([README.md](README.md#1-one-instruction-file-per-repo)) is enough there.

## Principles

1. **The code, git and a passing check are the ground truth.** Files the agent writes about its work are claims. Reconcile them against the repo before you act on them.
2. **State files are bounded and rewritten.** An append-only log grows past what a session can read, and then nobody reads it. `git log` is the progress record.
3. **Process is proportional to the cost of being wrong.** A typo fix does not need a spec. A schema change does.
4. **Enforce with the harness, guide with prose.** Hooks and deny rules for must-never; files for judgement.
5. **No mandatory tooling.** Every tool in the harness must earn its place on this repo.

## Layout

```
AGENTS.md                      # instructions for every agent (SSoT)
CLAUDE.md                      # one line: @AGENTS.md
docs/agent/STATE.md            # current state, ≤150 lines, rewritten
docs/decisions/NNNN-<slug>.md  # one ADR per file
docs/agent/plans/<slug>.md     # only on a feature branch, deleted before merge
.claude/settings.json          # deny rules + hooks (committed)
.claude/hooks/                 # small, tested scripts
```

Add to `.gitignore`: `CLAUDE.local.md`, `.claude/settings.local.json`, `.env*` (keep `.env.example`), build output.

## AGENTS.md

Write it per [README.md §1](README.md#1-one-instruction-file-per-repo). Add one harness block:

```markdown
## Working state
At session start, read docs/agent/STATE.md and `git log --oneline -15`, then `git status`.
If STATE.md disagrees with the code or git, trust the code and fix STATE.md.
@docs/agent/STATE.md
```

The plain sentence serves agents that do not expand `@` imports. The import makes Claude Code load the file every session, which is why it must stay small.

## STATE.md — the only state file

Rewrite it at the end of each working session. Never append history to it. When a fact stops being current, delete it; git keeps the old version.

```markdown
# State
Updated: 2026-11-05 (absolute date, always)

## Goal
<the outcome the current work delivers, one or two lines>

## Now
- <current step, with the plan file or PR if any>

## Next
- <next 3–5 steps, in order>

## Blocked by
- <what, since when, who can unblock> — matches a `TODO(blocker: YYYY-MM-DD)` in code

## Verify with
- `<exact command>` — what passing means

## Known traps
- <short list; move a trap into AGENTS.md when it becomes permanent>
```

Over 150 lines means it has become a diary. Cut it back to what a new engineer needs on Monday morning.

## Decisions

One file per decision in `docs/decisions/`, numbered:

```markdown
# 0007 — <title>
Status: Accepted | Superseded by 0012 · Date: 2026-11-05
Context: <why a decision was needed>
Decision: <what we chose>
Consequences: <trade-offs, what this rules out>
```

- Once accepted, do not edit it. Write a new ADR and set the old one's status to `Superseded by NNNN`.
- Write an ADR for choices a future reader would otherwise reverse: data model, auth boundary, a dependency major, a deviation from [reference-stack.md](reference-stack.md).
- One person (or the orchestrating agent) assigns ADR numbers. Parallel workers that pick numbers collide.

## Spec, plan, small verified steps

| Change | Process |
|---|---|
| one-file fix, copy, config | prompt with the symptom and a check; no files |
| a feature or a non-trivial bug | spec in the PR description or `docs/agent/plans/<slug>.md`, steps with a check each, commit per step |
| crosses a public interface, schema or auth | spec reviewed by a person before code; ADR for the decision |

For a spec, have Claude interview you first: "Interview me until you could write the spec, then write it to `docs/agent/plans/<slug>.md`." Then build in a fresh session ([best practices](https://code.claude.com/docs/en/best-practices)).

A plan step is small enough to finish and commit in under an hour, and names its check: "write the failing test for X; it fails on main" or "implement Y until `pnpm test src/x` passes". Delete the plan file in the PR that finishes the work. A merged PR is the implementation record.

### Tests

- For a logic bug, write the failing test first. Test at the lowest layer that fails on `main`.
- Extend an existing test before you add a new one.
- Leave out tests for what types already guarantee, trivial logic, copy text and mock-call mirrors.
- A test that needs a timeout or a sleep to pass is wrong.

### Blockers

When a step stops making progress, stop. Write the blocker in `STATE.md` under "Blocked by" and, if code is involved, a `TODO(blocker: YYYY-MM-DD): <why>` at the place. Stub only when the requirement allows a fallback, and say so in the PR. A stub that silently drops a requirement is worse than an open blocker. Long-lived blockers belong in the issue tracker, not in a file.

## Session rhythm

- **Start.** Claude loads `AGENTS.md` and `STATE.md`. It reads recent `git log` and `git status`, and checks any state claim against the code before acting on it.
- **During.** One step at a time. Commit per step with `<type>(<scope>): <subject>`. Never stay more than an hour without a commit or a written blocker.
- **End.** Rewrite `STATE.md`. Commit it with the work.
- **New task.** Start a fresh session. Claude rebuilds state from the files and git well; a long compacted conversation does not.

Compaction keeps files, not conversation. The project-root `CLAUDE.md` is re-read from disk after `/compact`; an instruction given only in chat is lost ([memory docs](https://code.claude.com/docs/en/memory)). Put anything durable in a file.

## Hooks

Keep the set minimal and correct. Hooks done right: [README.md §3](README.md#3-hooks-done-right).

| Hook | Keep? | Why |
|---|---|---|
| `PreToolUse` safety gate on Bash | yes | emits `deny` on a short list of destructive shapes, nothing otherwise |
| `Stop` hook that runs the fast check | optional | exit code 2 sends Claude back to work; Claude Code caps consecutive blocks at 8 |
| commit logger appending to a progress file | **no** | duplicates git and leaves the tree dirty after every commit |
| session-start "rehydrate" printer | **no** | the `STATE.md` import does this |
| pre-compact "save what I learned" | **no** | a shell hook cannot prompt the model |

Test each hook script once with a sample JSON on stdin before you commit it. Read a hook aloud in the session when you change it, so you know what runs on the next tool call.

Deny rules do the simple cases without a script. They stop Claude's file tools and recognised commands, not a script that reads the file ([README.md §2](README.md#2-guidance-versus-enforcement)):

```json
{
  "permissions": {
    "deny": ["Read(./.env)", "Read(./.env.*)", "Bash(git push --force *)"]
  }
}
```

## Code intelligence

GitNexus (a local code graph exposed over MCP) is optional; install it only when a task needs it. Reach for it on a large or unfamiliar codebase, a risky refactor or a pre-merge impact review. Pin its version when you index (`npx gitnexus@<version> analyze`) and keep its generated index out of git.

Without it, the gate before editing a widely used symbol is the same idea with plain tools: list every call site (`git grep -n`, the language server plugin), and treat a public interface, a migration or a cross-service contract as high risk by default.

## Auto memory

Claude Code keeps its own notes in `~/.claude/projects/<project>/memory/`: a `MEMORY.md` index plus one file per memory, typed `user`, `feedback`, `project` or `reference` ([memory docs](https://code.claude.com/docs/en/memory#auto-memory)).

- Only the first 200 lines or 25 KB of `MEMORY.md` load at session start. Keep it an index.
- It is machine-local. It does not reach other machines, cloud sessions or your colleagues. Anything the team needs goes in the repo.
- Save: corrections and confirmed choices, non-obvious project facts with the why, pointers to external systems.
- Do not save: what the code shows, git history, what `AGENTS.md` already says, task state (that is `STATE.md`).
- A memory about a file or function can be stale. Check that it still exists before acting on it.
- "Remember X" writes auto memory. To change the repo rules, say "add this to AGENTS.md".

## Long and parallel runs

- Scope each unattended run to named plan steps, in its own worktree (`claude -w <name>`), on its own branch.
- Answer the five unattended-run questions first: [README.md §7](README.md#7-unattended-runs).
- Workers report claims. The orchestrator (you, or the lead session) reads the diff and reruns the checks before accepting a step.
- One owner per shared file (`STATE.md`, the ADR index). Parallel workers that edit it overwrite each other.

## Failure modes

| Symptom | Fix |
|---|---|
| Fresh session redoes finished work | `STATE.md` was not rewritten; rebuild it from `git log` and the code |
| `STATE.md` keeps growing | it is a diary; cut to current facts, let git hold history |
| Claude says done, check never ran | the check was not in the prompt or plan step; add it and ask for the output |
| Session contradicts an earlier decision | the decision has no ADR; write one |
| A step stays "in progress" across sessions | the step is too big or the plan is wrong; split and re-plan |
| A hook blocks a command you need | narrow the rule, commit it, retry |
| Instruction file passes 200 lines | move scoped rules to `.claude/rules/` with `paths:`; cut what Claude can derive |

## Install prompt

Paste this into Claude Code at the repo root:

```text
Set up the repo harness from https://github.com/IntargetGroup/ai-kit/blob/main/engineering/repo-harness.md in this repository.
Read the repo first: existing AGENTS.md/CLAUDE.md, CI, package scripts, how tests run.
Done when:
- AGENTS.md holds the repo's real foot-guns, invariants and the exact scoped verify command,
  plus the "Working state" block; CLAUDE.md is `@AGENTS.md`; nothing a reader could derive from the code.
- docs/agent/STATE.md exists, under 150 lines, filled from what you found (mark unknowns as unknown).
- .claude/settings.json has the deny rules and the PreToolUse gate; you ran the gate with a sample
  JSON for one blocked and one allowed command and show both outputs.
Limits: do not rewrite existing instructions silently; show me a merge proposal first.
Do not add tools, plugins or MCP servers. Do not commit until I say so.
```
