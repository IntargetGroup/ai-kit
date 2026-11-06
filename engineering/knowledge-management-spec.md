# Knowledge-management spec for agentic work on a codebase

The files, formats and procedures that let a coding agent work on one repository across many sessions, compactions, worktrees and people without losing state, repeating work or claiming work it did not do. Stack-agnostic: commands below name Node, Python and Go variants; use the repo's own.

- **Readers.** Claude Code reads this page when it installs or changes the harness ([BOOTSTRAP.md](BOOTSTRAP.md)). Engineers read it to decide what to adopt. Day-to-day sessions do not need it: the `AGENTS.md` block in §4 carries the per-session rules.
- **Neighbours.** [README.md](README.md) owns the instruction-file pattern (§1), guidance versus enforcement (§2), hook mechanics (§3), Indeck setup (§4), plugins (§5), verification (§6) and unattended-run rules (§7). This page links to them and does not restate them.
- **Checked 2026-11-06** against the Claude Code docs at code.claude.com. Each platform claim links its page. Re-check a claim before you build on it.

## 1. Principles

1. **The code, git history and a passing check are the ground truth.** Every file an agent writes about its own work is a claim. Reconcile claims against the repo before acting on them.
2. **State files are bounded and rewritten, not appended.** An append-only log grows past what a session reads, and then nobody reads it. `git log` is the progress record.
3. **Process is proportional to the cost of being wrong** (§2). A typo fix needs no spec. A schema change needs a reviewed one.
4. **Enforce with the harness, guide with prose.** Must-never rules become deny rules, hooks or CI. Judgement stays in text ([README.md §2](README.md#2-guidance-versus-enforcement)).
5. **One home per fact.** A fact stated in two files drifts. Link instead of copying. Lockfiles hold versions; code holds structure; `AGENTS.md` holds rules; `STATE.md` holds the present; ADRs hold reasons.
6. **No mandatory tooling.** Every plugin, MCP server and hook must earn its place on this repo. The harness works with git, a shell and Claude Code.
7. **Absolute dates.** `2026-11-06`, never "yesterday" or "last sprint". Relative dates rot the day after they are written.

## 2. Ceremony by task size

Pick the lowest tier that is safe. Move up when the work proves bigger than planned, not before.

| Tier | Typical change | Written artefacts | Process |
|---|---|---|---|
| 0 Direct | typo, copy, config value, one-file fix with an obvious check | none | prompt with the symptom and the check; one commit |
| 1 Planned | feature or non-trivial bug inside one module, one session | the plan in the conversation or the PR description | steps with a check each; commit per step |
| 2 Specified | crosses a public interface, schema, auth boundary or data migration; or will span sessions | `docs/agent/plans/<slug>.md` on the feature branch; ADR for each lasting decision | interview, spec, human review, then build in a fresh session |
| 3 Long-horizon | multi-day work, parallel workers, unattended runs | tier 2 plus a single owner for `STATE.md` | §9 |

The survival kit (§3) pays off only when a repo sees multi-session work. For scripts, spikes and one-session repos, a good `AGENTS.md` ([README.md §1](README.md#1-one-instruction-file-per-repo)) is enough.

## 3. Layers and layout

| Layer | Job | Home | Failure when missing |
|---|---|---|---|
| Instructions | rules a reader of the code cannot derive | `AGENTS.md`, imported by `CLAUDE.md`; scoped rules in `.claude/rules/` | agent drifts from invariants |
| State | where the work stands now | `docs/agent/STATE.md` | fresh session redoes or contradicts work |
| Decisions | why a choice was made | `docs/decisions/NNNN-<slug>.md` | a later session reverses a settled choice |
| Plans | ordered steps for work in flight | `docs/agent/plans/<slug>.md`, feature branch only | unscoped, unordered changes |
| Ground truth | what actually exists and passes | code, `git log`, the check command | claims replace evidence |
| Enforcement | must-never rules | `.claude/settings.json`, `.claude/hooks/`, CI, branch protection | destructive or unreviewed changes |
| Local-only (L1) | personal ids, secrets, machine notes | gitignored files and `~/.claude/` (§11) | leaks, or private facts in shared files |
| Org memory | company, client and cross-project context | Indeck, read over MCP (§10) | agent guesses context it could have read |

```
AGENTS.md                      # instructions for every agent; the single source of truth
CLAUDE.md                      # one line: @AGENTS.md
docs/agent/STATE.md            # current state, ≤150 lines, rewritten (§5)
docs/agent/plans/<slug>.md     # feature branch only, deleted before merge (§7)
docs/decisions/NNNN-<slug>.md  # one ADR per file (§6)
.claude/settings.json          # deny/ask rules and hooks, committed (§12)
.claude/hooks/                 # small, tested scripts
.claude/rules/<area>.md        # optional, path-scoped rules (§13)
.env.example                   # every variable the code reads, placeholder values (§11)
```

Add to `.gitignore`: `CLAUDE.local.md`, `.claude/settings.local.json`, `.claude/worktrees/`, `.env` and `.env.*` with `!.env.example`, build output, and any generated code-intelligence index. Claude Code creates worktrees under `.claude/worktrees/` and its docs ask you to ignore that folder ([worktrees](https://code.claude.com/docs/en/worktrees)).

Optional documents. Create one only when its condition holds, and give each fact one home:

| Document | Create when | Rule |
|---|---|---|
| `RUNBOOK.md` | the repo runs services | what runs and how to start it, required env, deployment target, known issues with workarounds. No status and no to-do list: those are `STATE.md`. |
| `docs/brief/` | humans hand over inputs (PRD, research, contracts of scope) | inputs are immutable: a revision is a new file. `docs/brief/index.md` gives one line per file and says which file overrides which. In a public repo, briefs stay out of git (§11). |
| `.claude/rules/<area>.md` with `paths:` | a framework major changed idioms that the model's training data gets wrong | the idioms the repo uses, the stale idiom to avoid, the command and date that proved it. Re-audit on the next major. |
| `docs/perf.md` | the code has a performance budget | baseline numbers with command, date, hardware and commit. |

Not in the harness: `VERSIONS.md` (the lockfile and image tags are the truth), `STACK.md` (the code shows the stack; reasons go in ADRs), `PROGRESS.md` (git), `BLOCKERS.md` (`STATE.md` and the tracker), `SECRETS.md` with values (never; the inventory is `.env.example`).

## 4. AGENTS.md harness block

Write `AGENTS.md` as [README.md §1](README.md#1-one-instruction-file-per-repo) describes. The harness adds one block. It carries the per-session rules, so a session never needs this spec:

```markdown
## Working state
- At session start, run `git status` and `git log --oneline -15`, read docs/agent/STATE.md (imported below) and, on a feature branch, its plan in docs/agent/plans/. If STATE.md disagrees with the code or git, trust the code and fix STATE.md.
- Work one plan step at a time. Each step names its check; run it and show the output before you call the step done. Commit per step.
- When a step makes no progress for 30 minutes or after two failed approaches, stop. Record it under "Blocked by" in STATE.md and, in code, as `TODO(blocker: YYYY-MM-DD): <why>`.
- Record a choice a future reader could reverse as an ADR in docs/decisions/. Do not edit an accepted ADR; supersede it.
- At session end, and before /clear or a planned /compact, rewrite STATE.md to current facts (≤150 lines, absolute dates) and commit it with the work.
@docs/agent/STATE.md
```

- The plain sentences serve agents that do not expand `@` imports. The import makes Claude Code load `STATE.md` in every session; imports resolve up to four hops deep ([memory](https://code.claude.com/docs/en/memory#import-additional-files)). That is why `STATE.md` stays small.
- Inside backticks an `@path` is literal, not an import. Keep the import on its own line, outside code spans.
- Check that it loaded: in a new session, run `/context all` and look under **Memory files** ([memory](https://code.claude.com/docs/en/memory)). If `STATE.md` is not listed by name, ask Claude for the goal that `STATE.md` states before it reads any file.

## 5. STATE.md

The only state file. It answers: what a new engineer, or a fresh session, needs on Monday morning.

```markdown
# State
Updated: 2026-11-06 · Branch: main

## Goal
<the outcome the current work delivers, one or two lines>

## Now
- <current step, with plan file or PR>
- <uncommitted or half-done work, if any, and where it is>

## Next
- <next 3–5 steps, in order>

## Blocked by
- <what> · since <date> · unblocks when <condition> · owner <role> · `TODO(blocker: <date>)` in <file>

## Verify with
- `<exact command>`: what passing means

## Known traps
- <short list; move a trap into AGENTS.md when it becomes permanent>
```

Rules:
- **Rewrite, never append.** When a fact stops being current, delete it. Git keeps the old version.
- **Bound: 150 lines.** Past that it has become a diary. Cut to current facts.
- **Writers.** The session that does the work rewrites it at session end. In parallel runs only the orchestrator writes it (§9.3). After a merge, rewrite it on the target branch instead of resolving conflicts line by line.
- **Reconcile on read.** If "Now" names a step that `git log` shows done, or "Next" names a file that no longer exists, fix the file before acting.
- **No secrets, no personal data, no client names in a public repo.** It is committed.
- **Commit it with the work** it describes, in the same commit or the next one. A `STATE.md` that changes without code is a smell unless it records a blocker.

## 6. Decisions (ADRs)

One file per decision in `docs/decisions/`, numbered from `0001`. The directory listing is the index; keep no separate index file.

```markdown
# 0007: <title>
Status: Proposed | Accepted | Superseded by 0012 · Date: 2026-11-06
Context: <the forces that required a decision>
Decision: <what we chose, in one or two sentences>
Alternatives: <what we rejected and why, one line each>
Consequences: <trade-offs, what this rules out, what to watch>
```

- Write an ADR for a choice a future reader would otherwise reverse: data model, auth boundary, a dependency major, a deployment target, a deviation from [reference-stack.md](reference-stack.md), a seam you keep on purpose.
- Once accepted, never edit the body. Write a new ADR and change only the old one's status line to `Superseded by NNNN`.
- One owner assigns numbers: the person or the orchestrating session. Parallel workers that pick numbers collide; a worker proposes the ADR text and the orchestrator files it.
- Reference ADR numbers from code comments only where the code looks wrong without the reason.

## 7. Specs and plans

### 7.1 Spec

For tier 2, have Claude interview you first: "Interview me until you could write the spec, then write it to `docs/agent/plans/<slug>.md`." Then build in a fresh session, so the build starts from the written definition of done and a clean context ([best practices](https://code.claude.com/docs/en/best-practices)).

```markdown
# <slug>: <one-line outcome>
Status: Draft | Reviewed by <role> on <date> · Branch: feat/<slug>

## Problem
<one paragraph: who hits what, and why now>
## Non-goals
- <explicit exclusions; they stop scope creep>
## Design
<what changes and where; an ASCII diagram if it crosses components>
## Interfaces
<signatures, endpoints, tables, events: shapes only>
## Acceptance
- <observable condition> → `<command>` passes
## Rollout and rollback
<migrations, flags, the exact undo; "re-run with -1" is not a plan>
## Steps
- [ ] 1. <what> · check: `<command>` · <files>
```

### 7.2 Steps

- A step finishes and commits in under an hour and names its check: "write the failing test for X; it fails on main", "implement Y until `pnpm test src/x` passes".
- A step that touches a public interface, a migration or a cross-service contract names its rollback.
- Tick the box in the same commit as the step.
- When a step stays open across two sessions, the step is too big or the plan is wrong. Split it or re-plan; do not keep pushing.

### 7.3 Lifecycle

- Plans exist only on feature branches. The PR that finishes the work deletes the plan file. The merged PR (description, commits, diff) is the record. Keep no `executed/` archive.
- A lasting reason found while building becomes an ADR before merge, not a paragraph left in the deleted plan.
- For tier 1, the plan lives in the conversation or the PR description. No file.

## 8. Operating procedures

### 8.1 Session start

What loads by itself: `CLAUDE.md`, `AGENTS.md` through the import, `STATE.md` through its import, unscoped `.claude/rules/`, auto memory ([memory](https://code.claude.com/docs/en/memory)). What the session does before any edit:

1. `git status` and `git branch --show-current`: uncommitted work and the branch.
2. `git log --oneline -15`: what actually shipped.
3. On a feature branch, read its plan; resume at the first unticked step.
4. Reconcile `STATE.md` and the plan against steps 1–2. Trust the code.
5. Run the "Verify with" command once if the last session ended mid-step. A red check at start is information, not your fault: record it.

### 8.2 Before editing a widely used symbol

1. List every call site: the language server plugin ([README.md §5](README.md#5-plugins-and-mcp-servers-worth-it)), or `git grep -n '<symbol>'`.
2. Classify risk. A public API, a migration, a cross-service contract, auth and anything that writes persistent data are high by default, whatever the caller count.
3. High risk: tier 2 at least. State the blast radius and the rollback in the plan before you edit.
4. Rename with the language server or IDE refactoring, not text replace.
5. A code graph (§14) helps on large, unfamiliar code. It is optional.

### 8.3 TDD-sized steps

1. For a logic bug, write the failing test first, at the lowest layer that fails on `main`. Extend an existing test before you add a file.
2. Make it pass with the smallest change.
3. Refactor while green.
4. Run the scoped check for the changed files, then the repo's full fast check before the commit.
5. Commit.

Leave out tests for what types guarantee, trivial logic, copy text and mock-call mirrors. A test that needs a sleep or a timeout to pass is wrong.

### 8.4 Commits

- One commit per plan step, not per file. Message: `<type>(<scope>): <subject>`, types `feat | fix | refactor | test | docs | chore | perf`.
- Never more than 60 minutes without a commit or a written blocker. There is no third case: you either finished a step or you are stuck. A six-hour run is six or more commits, so a compaction or crash loses at most one step.
- Never `--no-verify`, never amend a pushed commit, never force-push a shared branch. Squash `WIP` commits before merge.
- Read `git diff --staged` before each commit. Scope must match the step.

### 8.5 Blockers

When a step makes no progress for 30 minutes or after two failed approaches:

1. Stop. A third attempt in the same context mostly re-reads the first two failures.
2. Write it under "Blocked by" in `STATE.md`: what, since when, what unblocks it, who can.
3. In code, mark the place: `TODO(blocker: 2026-11-06): <why>`.
4. Stub only when the requirement allows a fallback, and say so in the PR. A stub that silently drops a requirement is worse than an open blocker.
5. Continue with the next independent step, or end the session.
6. A blocker older than a week goes to the issue tracker; `STATE.md` keeps the link.

### 8.6 Verification before completion

Rules for the check itself: [README.md §6](README.md#6-verification). The harness adds the evidence format. Every "done" names the command, its exit status and the decisive output lines, or the reconciled totals. "Should work", "looks correct" and a text-only end of turn are reports, not evidence. Tick the plan box and rewrite `STATE.md` only after the evidence.

### 8.7 Compaction and context

What survives compaction ([context window](https://code.claude.com/docs/en/context-window#what-survives-compaction)):

| Kept | Lost or reduced |
|---|---|
| project-root `CLAUDE.md` and unscoped rules, re-injected from disk; auto memory | the conversation, replaced by a summary |
| up to five recently modified files Claude read or edited; a file over 5,000 tokens returns as a path only | context that hooks added earlier: summarised |
| invoked skill bodies, capped at 5,000 tokens each and 25,000 in total | path-scoped rules and nested `CLAUDE.md`: reload only when a matching file is touched again |
| the plan written in plan mode | instructions given only in chat |

Procedure:
- **Before a planned compaction or `/clear`:** rewrite `STATE.md`, commit, then `/compact <focus>`, for example `/compact keep plan step 4, the failing test name and the open decision on retries`.
- **After compaction:** `git status`, `git diff --stat`, re-read the current plan step. Confirm `STATE.md` is loaded with `/context all`.
- **Prefer a fresh session per task.** `/clear` between unrelated tasks, and after two failed corrections start over with a better prompt ([best practices](https://code.claude.com/docs/en/best-practices)). A rebuilt context from files and git beats a long compacted conversation.
- Optional hooks for this are in §12.

### 8.8 Session end

1. Commit finished work. Uncommitted work stays only if "Now" in `STATE.md` says where it is and why.
2. Rewrite `STATE.md`. Commit it.
3. If the session made a lasting choice, the ADR exists.
4. If the work produced a fact the wider team needs outside this repo, propose an Indeck write (§10). Do not write it without a yes.

## 9. Long-horizon and parallel work

Before any unattended run, answer the five questions in [README.md §7](README.md#7-unattended-runs). This section adds what the harness needs.

### 9.1 One session, many hours

- Scope the run to named plan steps ("steps 4 to 7 of `docs/agent/plans/retry-queue.md`"), never "finish the refactor".
- With `/goal`, make the condition a check ("`pnpm test src/queue` passes and step 7 is ticked"). Its limits are judged by the model; pair it with a hard cap ([README.md §7](README.md#7-unattended-runs)).
- A `Stop` hook that runs the fast check returns Claude to work while the check fails (§12).

### 9.2 Many sessions, one step each

A fresh session per step is the most robust loop: each one rehydrates from files and git (§8.1) and cannot inherit a bad summary. In print mode:

```bash
claude -p "Do the next unticked step of docs/agent/plans/retry-queue.md. Follow AGENTS.md. Stop after one step." \
  --permission-mode dontAsk \
  --allowedTools "Read,Edit,Write,Bash(pnpm test *),Bash(git add *),Bash(git commit *)" \
  --max-turns 40 --max-budget-usd 5
```

- `--max-turns` is a hard cap in print mode. `--max-budget-usd` stops the run when Claude Code's client-side cost estimate reaches the amount; spend can pass it, so leave headroom. `dontAsk` refuses any tool not pre-approved ([CLI reference](https://code.claude.com/docs/en/cli-reference)).
- The run must load the repo rules. `--bare` skips `CLAUDE.md` and hooks, so the run would ignore `AGENTS.md`, `STATE.md` and the safety gate, and the docs announce `--bare` as the future default for `-p` ([headless](https://code.claude.com/docs/en/headless)). Check after every Claude Code upgrade: the first run of a loop quotes the `## Working state` heading of `AGENTS.md`, or the gate denies a test command. If not, the default changed: pass the setting that loads them, or stop.
- Without `--bare`, `-p` runs the repo's hooks and `.mcp.json` servers with no trust dialog. Run it only in a checkout you trust.
- Loop in the shell until the plan has no unticked step or a run reports a blocker. Read each step's diff before the next run, or let CI gate it.

### 9.3 Parallel workers

- One worktree and one branch per worker: `claude -w <name>` ([worktrees](https://code.claude.com/docs/en/worktrees)). A worktree starts without gitignored files; list `.env` in `.worktreeinclude` to copy it.
- Each worker gets disjoint files. Two workers on one file overwrite each other.
- Workers do not edit `STATE.md` or number ADRs. They report; the orchestrator (you, or the lead session) reads each diff, re-runs the checks, files ADRs and rewrites `STATE.md` on the integration branch.
- A worker's summary is a claim. The diff and a re-run check are the evidence.
- Merges, pushes to shared branches, deploys, migrations on shared databases and anything client-visible need a person.

## 10. Org memory: Indeck

Repo state lives in the repo. Indeck holds what the repo cannot: company practice, client context, decisions taken outside the code. Setup of the Indeck MCP server in Claude Code: [README.md §4](README.md#4-connect-indeck-in-the-repo).

- **Reading.** Over MCP nothing is injected; Claude pulls: `whoami`, then the personal `CORE.md`, then the workspace or project `CORE.md` (`memory_read`), then `memory_search` for a specific fact, reading the source before citing it. Full order: [guide/indeck.md](../guide/indeck.md#cosa-legge-claude-allinizio-di-un-lavoro). Look for a method with `skills_list` and `skills_read` before inventing one.
- **Which project.** A private repo may name its Indeck project in `AGENTS.md`. A public repo never carries Indeck workspace or project ids, client names or internal URLs; put them in `CLAUDE.local.md` (§11).
- **Writing.** Never mirror `STATE.md`, plans or ADRs into Indeck: two homes drift. Propose a write only for an outcome other teams need (a shipped capability, a decision that binds other projects), at session end, with text and destination in one request. Call `memory_guidance` first. An answer of `requires_approval` or `denied_by_user` means nothing was written.
- **Conflicts.** For code behaviour, the repo wins. For client or company facts, Indeck wins. Report a conflict to the person; do not resolve it silently.

## 11. Local-only files (L1) and secrets

Two classes of storage:
- **L2, shared:** everything git tracks. Assume it becomes public: history is forever, and a fork or a cached view outlives a later delete.
- **L1, local-only:** gitignored files and `~/.claude/`. Test for every fact: if it reached L2 by mistake, would that be dangerous or embarrassing? Then it is L1.

| L1 file | Holds | Note |
|---|---|---|
| `CLAUDE.local.md` | personal ids, Indeck project ids, sandbox URLs | safe only because `CLAUDE.md` imports `AGENTS.md` ([README.md §4](README.md#4-connect-indeck-in-the-repo)). It exists only in the worktree where you created it; to share it across worktrees, import a file from your home directory instead ([memory](https://code.claude.com/docs/en/memory)) |
| `.claude/settings.local.json` | personal permission approvals | Claude Code writes "don't ask again" approvals here |
| `.env`, `.env.*` | secret values | `.env.example` is the committed inventory |
| auto memory, `~/.claude/projects/<project>/memory/` | Claude's own notes (§11.1) | machine-local |

Secrets hygiene:
- **Never in source.** A pre-commit secret scanner (for example gitleaks) and a CI scan. A local hook is a guard; CI is the gate.
- **Inventory without values.** `.env.example` lists every variable the code reads, grouped by purpose, with placeholder values and the source of each real value. The app tolerates a missing optional key and fails closed on a missing required one.
- **Keep Claude away from values.** `permissions.deny` on `Read(./.env)` and `Read(./.env.*)` blocks Claude's file tools and the commands it recognises, not every process ([README.md §2](README.md#2-guidance-versus-enforcement)). Use the sandbox or a container when every process must be blocked.
- **Never in prompts, logs or traces.** Do not paste a secret into a session. Code redacts keys matching `*_KEY`, `*_SECRET`, `*_TOKEN`, `password` and `authorization` before logging or sending to a model.
- **Production values live in one managed secret store per environment**, named in an ADR.
- **If a secret leaks:** revoke it first. A new commit that deletes it does not remove it from history. Then rewrite history and tell the repo owner privately.

### 11.1 Auto memory

Claude Code keeps its own notes: a `MEMORY.md` index plus topic files in `~/.claude/projects/<project>/memory/` ([memory](https://code.claude.com/docs/en/memory#auto-memory)).

- Only the first 200 lines or 25 KB of `MEMORY.md` load at session start; topic files load on demand. Keep the index to one line per entry.
- It is machine-local, shared by all worktrees of the repo, and absent on other machines, in cloud sessions and for colleagues. Anything the team needs goes in the repo.
- Save there: corrections and confirmed choices, non-obvious facts with the reason, pointers to external systems. Do not save what the code shows, git history, what `AGENTS.md` says, or task state (`STATE.md`).
- A memory about a file or function can be stale. Check that it still exists before acting on it.
- "Remember X" writes auto memory. To change the repo's rules, say "add this to AGENTS.md".

## 12. Hooks in the harness

Mechanics and the `deny`-never-`allow` rule: [README.md §3](README.md#3-hooks-done-right). Keep the set small; test each script with a sample JSON on stdin before you commit it; show its body in the session when you change it.

| Hook | Keep? | Why |
|---|---|---|
| `PreToolUse` safety gate, matcher `Bash` (and `PowerShell` on Windows) | yes | emits `deny` on a short list of destructive shapes, nothing otherwise |
| `Stop` hook that runs the fast check | optional | exit code 2 keeps Claude working and its stderr is the reason. Check `stop_hook_active` to avoid a loop; Claude Code ends the turn after 8 consecutive continuations ([hooks](https://code.claude.com/docs/en/hooks)) |
| `SessionStart`, matcher `compact` | optional | its stdout is added to the compacted context; print `git status --short` and `git log --oneline -5` ([hooks guide](https://code.claude.com/docs/en/hooks-guide)) |
| `PreCompact` | optional | its stdout becomes instructions for the compaction summary, up to 10,000 characters: "Keep the current plan step, failing test names and open decisions." It cannot make Claude write files |
| `PostToolUse` logger appending commits to a progress file | no | duplicates git and dirties the tree after every commit |
| `SessionStart` printer of the state file | no | the `STATE.md` import does this |

Stop hook sketch. Replace `pnpm check:changed` with the repo's scoped check (`pytest -q <paths>`, `go test ./pkg/...`):

```bash
#!/bin/bash
# .claude/hooks/check-on-stop.sh  (Stop). Needs jq.
input=$(cat)
[ "$(printf '%s' "$input" | jq -r '.stop_hook_active')" = "true" ] && exit 0
git diff --quiet HEAD && exit 0          # no tracked file changed since the last commit
if ! out=$(pnpm check:changed 2>&1); then
  printf 'Fast check failed. Fix it, or record a blocker in docs/agent/STATE.md:\n%s\n' \
    "$(printf '%s' "$out" | tail -30)" >&2
  exit 2
fi
exit 0
```

Deny and ask rules cover simple cases without a script ([permissions](https://code.claude.com/docs/en/permissions)). Rules match the command as written, so they are a guard, not a boundary:

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "deny": ["Read(./.env)", "Read(./.env.*)"],
    "ask": ["Bash(git push *)"]
  }
}
```

Never disable a hook to unblock yourself. Narrow the rule and commit the narrower rule.

## 13. Versions and stale knowledge

- **The lockfile is the version record.** Pin exact versions; commit the lockfile. Never `latest` in anything reproducible: images, CI actions, `npx` commands others copy.
- **Verify before pinning.** Query the registry at install time (`npm view <pkg> version`, `pip index versions <pkg>`, the image's tag list) instead of the model's memory. A major bump gets an ADR.
- **Infra images.** Pin a tag on a stable or LTS line. Distrust `-alpine` variants for data stores. When a container is unhealthy, read its own log before the orchestrator's: OS-level warnings are often noise.
- **A major upgrade mid-feature** is a blocker entry and a follow-up, not a detour, unless it fixes a security issue.
- **Framework idioms the model gets wrong** go in `.claude/rules/<area>.md` with a `paths:` glob (§3). Rules without `paths:` load at launch; path-scoped ones load when Claude touches a matching file ([memory](https://code.claude.com/docs/en/memory)).

## 14. Code intelligence

- **Language server first.** A language server plugin gives definitions, references and diagnostics instead of grep ([README.md §5](README.md#5-plugins-and-mcp-servers-worth-it)).
- **A code graph is optional.** GitNexus (a local code graph exposed over MCP) helps on a large or unfamiliar codebase, a risky refactor or a pre-merge impact review. Install it only when a task needs it, pin its version when you index (`npx gitnexus@<version> analyze`) and keep its generated index out of git. Do not paste its generated MUST/NEVER block into `AGENTS.md`: tool rules belong in the tool's skill, not in every session.
- **Without either,** the gate in §8.2 works with `git grep` and judgement.

## 15. One command surface

The agent and the engineer run the same verbs. Expose them through the repo's task runner (`package.json` scripts, `make`, `just`, `task`) and name them in `AGENTS.md`:

| Verb | Contract |
|---|---|
| `check:changed` (or equivalent) | lint, typecheck and tests for changed files; seconds to a minute; what sessions run |
| `check` | the full fast suite; what CI runs on every PR |
| `test:integration` | needs real services; gated by an environment flag |
| `dev` | starts the app for manual or browser verification |

A verb the agent cannot discover in one file is a verb it will guess.

## 16. Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| fresh session redoes finished work | `STATE.md` not rewritten | rebuild it from `git log` and the code; enforce the session-end rule |
| `STATE.md` keeps growing | used as a diary | cut to current facts; history is git |
| "done", but the check never ran | check missing from the step or the prompt | add it; ask for command and output (§8.6) |
| a session reverses an earlier choice | no ADR | write it, retroactively from `git log` if needed |
| a step stays in progress across sessions | step too big or plan wrong | split or re-plan (§7.2) |
| instructions lost after compaction | given only in chat, or in a path-scoped rule | move them to `AGENTS.md` or an unscoped rule |
| parallel workers clobber a file | shared file without an owner | disjoint files per worker; orchestrator owns `STATE.md` and ADR numbers |
| a hook blocks a command you need | rule too broad | narrow it, commit, retry |
| instruction file passes 200 lines | file maps and derivable facts | move scoped rules to `.claude/rules/` with `paths:`; cut what Claude can derive |
| Claude cites a memory about a deleted file | stale auto memory | verify before acting; delete the entry |
| Claude writes last year's framework idiom | training data predates the major | a path-scoped rule with the audited idiom (§13) |
| unhealthy container, misleading error | reading the orchestrator log first | read the container's own log; record the fix in `RUNBOOK.md` |
| an id or client name appears in a public diff | L1 fact written to L2 | remove it before push; if pushed, treat it as a leak (§11) |

## 17. Anti-patterns

- Append-only progress or blocker logs, and hooks that write them.
- A generated `CLAUDE.md` nobody would write by hand, or one that restates the spec. Every line costs context in every session.
- Copying this spec into the target repo. It drifts from the source; the `AGENTS.md` block carries what sessions need.
- Plans or specs committed to `main`, or kept after merge.
- Briefs, ADRs or plans invented to fill a template. Unknown facts are marked unknown and asked for.
- Speculative skills, MCP servers or plugins "in case". Each adds tool names and context to every session and makes selection worse.
- Two homes for one fact: versions in a doc and a lockfile, state in a file and in Indeck, rules in `AGENTS.md` and in auto memory.

## 18. Changing this spec

Adopt the harness in a target repo with [BOOTSTRAP.md](BOOTSTRAP.md). A target repo that departs from this spec records the departure in an ADR. When you wish this page had told you something, propose the change here: rewrite the rule that was wrong, with the evidence, and do not append a second account.
