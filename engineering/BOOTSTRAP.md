# Bootstrap the harness in a repo

One prompt that installs the [knowledge-management spec](knowledge-management-spec.md) in an existing repository: `AGENTS.md` with the working-state block, `docs/agent/STATE.md`, `docs/decisions/`, deny rules, a safety hook and the `.gitignore` entries for local-only files. Claude reads the repo first, asks you what the code cannot tell it, shows every change to an existing file before it makes it, and ends with a verification table.

Use it when work on the repo spans several sessions or several people. For a script or a one-session repo, [README.md §1](README.md#1-one-instruction-file-per-repo) is enough. Expect about 30 to 60 minutes, most of it waiting.

## Before you paste

1. **Install Claude Code** ([setup](https://code.claude.com/docs/en/setup)). Windows, in PowerShell: `irm https://claude.ai/install.ps1 | iex`. macOS, Linux and WSL: `curl -fsSL https://claude.ai/install.sh | bash`. Open a new terminal and run `claude --version`; `claude doctor` reports install and settings problems.
2. **On native Windows, install [Git for Windows](https://git-scm.com/downloads/win).** Without Git Bash, Claude Code uses PowerShell for its shell tool and for hooks, and the bash hook below does not run.
3. **Put [jq](https://jqlang.org/download/) on `PATH`.** The hook scripts parse their JSON input with it. Check with `jq --version`.
4. **Sign in once.** Run `claude`, log in with your work account, then `/exit`.
5. **Prepare the repo.** It needs at least one commit (worktrees fail without one) and a clean working tree. Create a branch: `git switch -c chore/agent-harness`.
6. **Know your check.** Find the command that proves a change works (`pnpm test`, `pytest -q`, `go test ./...`). If there is none, Claude will say so; that is the first blocker to fix.
7. **Optional: Indeck.** If the repo serves a client or an internal project, register the Indeck MCP server first ([README.md §4](README.md#4-connect-indeck-in-the-repo)).
8. **Read §1 to §5 of the spec** (10 minutes). You approve what Claude writes, so know what it is meant to write.

## Run it

1. Open a terminal at the repo root and run `claude`. Stay in the default permission mode, so Claude asks before each edit and command. Do not use `bypassPermissions` for this.
2. Paste the block below as your first message.
3. Claude stops three times: after it has read the repo, after it has proposed changes to existing files, and at the end. Answer at each stop.

```text
Install the agent harness from this spec in this repository:
https://raw.githubusercontent.com/IntargetGroup/ai-kit/main/engineering/knowledge-management-spec.md
Read the whole spec before you act. It links to https://raw.githubusercontent.com/IntargetGroup/ai-kit/main/engineering/README.md for the hook and permission rules; read the sections it cites. If you cannot fetch either file, stop and ask me for a local copy. Do not copy the spec into this repo: the AGENTS.md block in its §4 carries what sessions need.
Reply in the language I write in.

Ground rules for the whole install:
- Never overwrite, rename or delete an existing file without my explicit yes to the diff you showed me.
- Do not read the values in .env or any secrets file. Variable names found in the code are enough.
- Mark every fact you could not verify as unknown. Do not invent goals, decisions, briefs or plans.
- Do not add plugins, MCP servers, skills or code-intelligence tools.
- If the current branch is the default branch, stop and ask me to create a branch. Commit per step on that branch with `chore(harness): <subject>`. Never push.

Phase 1, read and report. Write nothing yet.
1. Read AGENTS.md, CLAUDE.md, .claude/ (settings, hooks, rules, skills), .gitignore, CI config, the task runner (package.json scripts, Makefile, justfile or similar), lockfiles, README and docs/. Note whether CLAUDE.local.md exists; do not print its content. Run `git log --oneline -30` and `git status`.
2. Find the scoped check and the full check, run both, and record the exit status.
3. Report in at most 20 lines: the stack; both check commands and their results; each existing instruction, state or decision file and where it maps in the spec; which optional documents from spec §3 apply and why; the files you plan to create and the existing files you plan to change.
4. Ask me, in one message, at most five questions the code cannot answer: the invariant that must never break; the goal and next steps of the current work; known traps; whether this repo is public or may become public; whether an Indeck project applies (the name only).
Stop and wait for my answers.

Phase 2, propose changes to existing files.
5. For every existing file you would change, show the full diff: AGENTS.md, CLAUDE.md, .gitignore, .claude/settings.json, existing hooks. If CLAUDE.md has content, propose moving it into AGENTS.md and reducing CLAUDE.md to `@AGENTS.md`.
6. If the repo already keeps state or decisions in another form (a progress log, a decisions file, a TODO file), propose the migration: current facts into STATE.md, one ADR file per accepted decision. Keep the originals until I confirm the migration.
Stop and wait for my yes. Apply only what I approve.

Phase 3, build.
7. CLAUDE.md is exactly one line: `@AGENTS.md`.
8. AGENTS.md holds what a reader of the code cannot derive: the foot-guns with their reasons, the invariants, the exact scoped and full check commands, PR and commit rules, and the "Working state" block from spec §4, copied exactly. No file maps, dependency lists or architecture overviews. Under 200 lines.
9. docs/agent/STATE.md in the format of spec §5, filled from phase 1 and my answers, under 150 lines, with an absolute date. Unknowns say unknown.
10. docs/decisions/NNNN-adopt-agent-harness.md (the next free number; 0001 in a new folder) recording this adoption, plus one ADR per decision I confirmed in phase 2.
11. .gitignore covers CLAUDE.local.md, .claude/settings.local.json, .claude/worktrees/, .env and .env.* with !.env.example. If the code reads environment variables and .env.example is missing, create it with the variable names and placeholder values.
12. .claude/settings.json: the deny and ask rules from spec §12, merged with what exists, and a PreToolUse safety gate as README §3 describes. It denies a short list of destructive command shapes and prints nothing otherwise; it never emits "allow". Reference the script as "${CLAUDE_PROJECT_DIR}/.claude/hooks/<name>.sh" and make it executable. If I said the team works on Windows without Git Bash, add the PowerShell variant with "shell": "powershell".
13. Ask me before you add the optional Stop hook from spec §12. Propose it only if the scoped check finishes in about a minute.
14. If I named an Indeck project and the Indeck MCP server is connected, call `whoami` and take the project id from its answer; if the project is not there, ask me. If the repo is or may become public, write the name and id only in CLAUDE.local.md, never in AGENTS.md.

Phase 4, verify and report. Run every check yourself. End your reply with this table, one row per check, with the command you ran and the decisive output, or "not run" and why:

| Check | How | Result |
|---|---|---|
| CLAUDE.md is exactly `@AGENTS.md` | print the file | |
| AGENTS.md under 200 lines and holds the Working state block | `wc -l`, search for the heading | |
| STATE.md under 150 lines, dated, unknowns marked | `wc -l`, read it | |
| settings.json is valid JSON | `jq . .claude/settings.json` | |
| gate denies a destructive command | pipe `{"tool_input":{"command":"git push --force origin main"}}` into the script | output carries "deny" |
| gate stays silent on a safe command | pipe `{"tool_input":{"command":"git status"}}` into the script | no output, exit 0 |
| Stop hook, if installed, does not loop | pipe `{"stop_hook_active":true}` into it | exit 0 |
| local-only files are ignored | `git check-ignore -v CLAUDE.local.md .claude/settings.local.json .env .claude/worktrees/x` | one rule per path |
| no secret, id or client name in the diff | read `git diff <default-branch>...HEAD`; run the secret scanner if the repo has one | |
| the full check still passes | the full check command | exit status |
| nothing was pushed | `git status -sb` | |
| STATE.md loads in a new session | I check it after the install | left to me |

After the table, list what you deferred and what I must decide.
```

## After it finishes

1. Start a new session in the repo and run `/context all`. Under **Memory files** you should see `CLAUDE.md`, which imports `AGENTS.md` and `STATE.md` ([memory](https://code.claude.com/docs/en/memory)). If `STATE.md` is not listed by name, ask Claude for the goal that `STATE.md` states before it reads any file.
2. Run `/hooks` and check that the safety gate is listed under project settings ([hooks](https://code.claude.com/docs/en/hooks)).
3. Give Claude a small real task. At the end, check that it ran the check, committed, and rewrote `STATE.md`.
4. Read the whole branch diff yourself, then open a PR under the team's rules.

## When to interrupt

- It writes a file before the phase 1 report, or changes an existing file you did not approve.
- It copies examples from the spec without adapting the check command, the paths or the shell to this repo.
- It proposes a plugin, an MCP server, a skill or a code graph.
- A command looks destructive, or it reads a `.env` file. Ask why; continue only if the answer is good.
- `AGENTS.md` or `STATE.md` states something you never said and no file shows. Ask it to replace the claim with "unknown" and to ask you instead.

## If something goes wrong

| Problem | What to do |
|---|---|
| the session dies or compacts mid-install | start `claude` again in the repo and write: "Resume the harness install. Read the spec, run `git log --oneline` on this branch, and continue from the first phase 3 step that has no commit." |
| the hook blocks a command you need | do not disable it. Narrow the pattern, commit the narrower rule, retry |
| the hook never fires | run `claude doctor` for settings errors and `/hooks` to see what loaded. Check the script is executable and the path uses `${CLAUDE_PROJECT_DIR}`. On Windows without Git Bash, a bash script does not run ([hooks](https://code.claude.com/docs/en/hooks)) |
| the check fails before any change | that is the repo's state, not the harness. Record it as the first blocker in `STATE.md` |
| an id or a client name reached a pushed commit | treat it as a leak: tell the repo owner privately. A new commit that removes it does not remove it from history |
