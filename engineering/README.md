# Engineering track

For engineers who run Claude Code (terminal, IDE or the desktop Code tab) on a codebase. Everyone else starts at [../inizia/README.md](../inizia/README.md).

| File | Read it when |
|---|---|
| this page | you set up a repo for agents, or you review how a repo instructs them |
| [knowledge-management-spec.md](knowledge-management-spec.md) | work on the repo spans many sessions, compactions or people: state, decisions, plans, long runs |
| [BOOTSTRAP.md](BOOTSTRAP.md) | you install that harness in an existing repo (paste-in prompt) |
| [reference-stack.md](reference-stack.md) | you start a new TypeScript web or AI product |
| [patterns.md](patterns.md) | you build the code around an AI or web product: boundaries, approvals, durable work, audit, scaling past the MVP |
| [tool-orchestration.md](tool-orchestration.md) | you design tools, MCP servers or agent loops (dated research snapshot) |
| [multi-model-orchestration.md](multi-model-orchestration.md) | you delegate work from Claude Code to subagents, workflows or another vendor's CLI (dated snapshot) |
| [skills.md](skills.md) | you choose, install, audit or write a skill |

Platform facts below come from the Claude Code docs as of 2026-11-05 (Claude Code v2.1.3xx). Check `/status` and the linked page before you rely on a version gate.

## 1. One instruction file per repo

Keep `AGENTS.md` as the single source of truth for every coding agent. Make `CLAUDE.md` one line:

```markdown
@AGENTS.md
```

Why the import and not native loading: Claude Code reads `AGENTS.md` natively (v2.1.277+) only when no `CLAUDE.md`, `.claude/CLAUDE.md` or `CLAUDE.local.md` exists in the working directory or above it. A personal `CLAUDE.local.md` silently turns `AGENTS.md` off, and some sessions cannot read `AGENTS.md` at all. The import works in every case ([memory docs](https://code.claude.com/docs/en/memory#agents-md)).

How the files load:
- All levels are concatenated, root to working directory. Nothing overrides anything; files closer to the launch directory are read last. Keep levels consistent.
- The content arrives as a user message after the system prompt. It is context, not configuration.
- HTML comments (`<!-- -->`) are stripped before loading. Use them for maintainer notes.
- Scope a rule to a part of the tree with `.claude/rules/<topic>.md` and a `paths:` glob in frontmatter. Rules without `paths:` load at launch like `CLAUDE.md`.
- `@` imports organise text. They do not reduce its context cost.

### What to write

Write only what the agent cannot derive by reading the repo:
- foot-guns specific to this environment, each with the reason;
- invariants a change must not break;
- the exact verify commands, scoped to changed files;
- the owner's taste in a few lines, and the override protocol: "If a rule here fights the task, say so loudly and get a human sign-off before breaking it.";
- PR and commit rules.

Do not write file maps, dependency lists or architecture overviews. Claude reads the repo. `/doctor` proposes cutting exactly these, and `/doctor prompt-audit` flags instructions written for older models, dead file references and contradictions. Target under 200 lines per file ([best practices](https://code.claude.com/docs/en/best-practices)).

### Reference: t3code

[pingdotgg/t3code](https://github.com/pingdotgg/t3code/blob/main/AGENTS.md) is the best public example of the pattern. `CLAUDE.md` is `@AGENTS.md`; `.claude/skills` is a symlink to `.agents/skills`, so Claude Code and Codex share one skills folder. Copy the structure, not the length:

| Section | What it does |
|---|---|
| A note from the owner | taste and priorities in the owner's voice; "good defaults", not hard rules |
| Glossary | fixes "you", "we", "user" so instructions are unambiguous |
| The ways to hurt yourself | three concrete, local foot-guns, each with the why |
| Hit every surface | a checklist of places a change must reach (entry points, clients, reverse states, docs); "A one-way door is a bug" |
| Verifying | one scoped command (`check:changed`); "Do not run repo-wide checks. CI owns the full suite." |
| Test policy | "Test at one layer: the lowest one that fails on `main`"; leave out tests for what types guarantee; "A test that needs a timeout to pass is wrong" |
| PR rules | never open a PR unless asked; body = problem, then fix, then the model and harness that did the work |
| Documentation rules | "Before adding a paragraph, ask what a maintainer would get wrong without it"; rewrite, never append; no plans or scratch files committed |

### Model-facing text is code

- Budget it in CI. t3code fails a PR that grows its agent context byte budget unless a maintainer labels the increase.
- Eval it when it changes behaviour. Add the eval case before the fix: it fails on the old text and passes on the new. Add control cases where the right action is ordinary work, so an overcorrection shows up.
- Turn a repeated agent mistake into a lint rule or a test, not another sentence. t3code ships a custom lint plugin for this.

## 2. Guidance versus enforcement

`CLAUDE.md`, `AGENTS.md`, skills and prompts are guidance: Claude decides. These are enforcement: the harness decides ([best practices](https://code.claude.com/docs/en/best-practices)).

| Need | Control |
|---|---|
| keep Claude out of `.env` and other sensitive files | `permissions.deny` in `.claude/settings.json` (applies before folder trust). It blocks Claude's file tools and the commands it recognises, not every process: a script can still read the file. When every process must be blocked, isolate at the OS level (sandbox, container) ([permissions](https://code.claude.com/docs/en/permissions)) |
| block a command shape | `PreToolUse` hook that returns `deny` |
| the same rule for every engineer | managed settings (claude.ai admin console) |
| the change works | tests and CI on every PR |
| nothing reaches `main` unreviewed | branch protection and restricted credentials on the server; a local deny rule on `git push` is an extra guard |
| an unattended run stops | `--max-turns` in print mode is a hard cap; `--max-budget-usd` stops on a client-side cost estimate and spend can pass it ([CLI reference](https://code.claude.com/docs/en/cli-reference)). A turn bound in `/goal` is evaluated by the model, not enforced ([goal](https://code.claude.com/docs/en/goal)) |

If you keep adding emphasis to a line and Claude still misses it, the line belongs in a hook or a deny rule. The reverse holds too: a rule with legitimate exceptions belongs in prose. Keep the enforced set small.

## 3. Hooks done right

A `PreToolUse` hook has three useful answers: `deny`, `ask`, or nothing. **Never emit `allow` by default.** `"allow"` skips the permission prompt, so a gate that answers `allow` to every command it does not block turns off Bash prompts for the whole repo ([hooks docs](https://code.claude.com/docs/en/hooks#pretooluse-decision-control)).

```bash
#!/bin/bash
# .claude/hooks/block-dangerous.sh  (PreToolUse, matcher "Bash")
cmd=$(jq -r '.tool_input.command')
if printf '%s' "$cmd" | grep -Eq 'rm -rf (/|~)|git push (-f|--force)|DROP DATABASE'; then
  jq -n '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",
    permissionDecisionReason:"Destructive command blocked by repo hook"}}'
fi
exit 0  # no output = no decision; the normal permission flow applies
```

- Narrow the spawn with `"if": "Bash(rm *)"` on the handler, so the script runs only for matching subcommands.
- String matching cannot police a shell. The hook catches mistakes; deny rules, sandboxing and review carry the weight.
- On Windows, Claude Code uses Git Bash when installed, else PowerShell. The hooks page shows a PowerShell variant with matcher `Bash|PowerShell`. Bash hooks need `jq` on `PATH`.
- `SessionStart` hooks of type `mcp_tool` are skipped at launch because MCP servers are not connected yet. Use a `command` hook for launch-time work.
- Never disable a hook to unblock yourself. Narrow the rule and commit the narrower rule.

## 4. Connect Indeck in the repo

Register the Indeck MCP server once, at user scope, so every repo on the machine has it:

```bash
claude mcp add --scope user --transport http indeck https://mcp.intarget.net/mcp
```

Then run `/mcp`, select `indeck` and log in. Without `--scope user` the server is registered for the current folder only. If you added Indeck with another address before November 2026, run `claude mcp remove indeck` and add it again: logging in again keeps the old address. If you also enabled the Indeck connector on claude.ai, Claude Code connects once: the server you added wins and `/mcp` lists the connector as hidden ([MCP docs](https://code.claude.com/docs/en/mcp#scope-hierarchy-and-precedence)). Pull order, scopes and writes: [../guide/indeck.md](../guide/indeck.md).

In a public repo, never write Indeck workspace or project ids, client names or internal URLs into `AGENTS.md`. Keep them in a gitignored `CLAUDE.local.md`. That is safe here because `CLAUDE.md` imports `AGENTS.md`; without the import, `CLAUDE.local.md` would switch `AGENTS.md` off.

## 5. Plugins and MCP servers worth it

Keep only what you strictly need in this project. Every plugin, skill and MCP server adds tool names, skill listings and possibly hooks to every session; more tools do not make outcomes better, and overlapping ones make the agent pick wrong ([tool-orchestration.md §1.1](tool-orchestration.md#11-fewer-higher-level-tools)).

- Install at project or local scope, not user scope, unless you need the tool in every repo ([plugin scopes](https://code.claude.com/docs/en/plugins/install#choose-an-install-scope); `claude mcp add` writes to local scope by default, [MCP scopes](https://code.claude.com/docs/en/mcp#mcp-installation-scopes)).
- Turn off a server you do not need here in `/mcp`: Claude Code records the choice for this project only and keeps the configuration ([disable a server](https://code.claude.com/docs/en/mcp#disable-a-server-without-removing-it)).
- Every month, remove what you did not use. `/skill-doctor` flags skills that never run ([skills.md §3](skills.md#3-what-a-skill-costs)).

| Tool | Why | Install |
|---|---|---|
| language server plugin (`typescript-lsp`, others per language) | symbols, references and errors instead of grep | `/plugin install typescript-lsp@claude-plugins-official` ([code intelligence](https://code.claude.com/docs/en/plugins/code-intelligence)) |
| `security-guidance` | Claude reviews its own edits for injection and unsafe APIs while it works; needs Python 3.7+, and its turn and commit reviews need a git repo | `/plugin install security-guidance@claude-plugins-official` |
| `code-review` | independent review of a diff or PR | official marketplace |
| Context7 (third-party) | current library docs instead of training-data recall | its README; prefer an HTTP server with your own key |
| Playwright MCP or Chrome DevTools MCP | drive and inspect a real browser to verify UI | pin a version: `npx -y @playwright/mcp@<version>` |
| GitNexus (optional) | code graph and impact analysis on a large unfamiliar codebase | only when a task needs it; see [knowledge-management-spec.md](knowledge-management-spec.md#14-code-intelligence) |

Rules:
- Pin versions. Never `@latest` in a command that other people copy.
- Audit a third-party plugin before install: read `SKILL.md`, hooks, scripts and `bin/`. After install, `claude plugin details <name>` prints its component inventory ([plugin security](https://code.claude.com/docs/en/plugins/security)). Hooks must not write outside the working directory, call undocumented URLs or read credentials.
- Asking a second model to read a plugin is triage, not an audit. Treat any plugin as a capable but untrusted intern: least permission, sandbox, review.
- If you cannot evaluate a tool, ask the Innovation Hub before you install it.
- Skill-specific audit checks (allowed tools, injected shell commands, hooks in frontmatter): [skills.md](skills.md).

## 6. Verification

- Give Claude a check that returns pass or fail, and ask for a precise proof of the result: the command it ran and its output, or totals reconciled with the source. "Double-check" names no check; Anthropic's Opus 5 guide warns that generic instructions like it cause over-verification ([Opus 5 prompting](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5)).
- For a review, use a fresh context (`/code-review`, a new session) and say "skip style". A reviewer asked to find problems always finds something.
- For UI, run the app and exercise the golden path plus the two most likely edge cases. Static markup tests do not prove interaction.

## 7. Unattended runs

Before you leave a run alone, answer the five questions from the [best practices](https://code.claude.com/docs/en/best-practices):

1. Does it know what done looks like? Write it as a check.
2. Can it check its own work? Name the command.
3. What is it allowed to touch? Narrow the scope ("steps 4 to 7 of the plan"), not "finish the refactor"; use a worktree (`claude -w <name>`).
4. What stops it? `--max-turns` (print mode) is a hard cap; `--max-budget-usd` stops on an estimate, so leave headroom. A `/goal` clause such as "or stop after N turns" is judged by the model; pair it with a hard cap.
5. Where does the result go, and who signs off? A branch and a PR. A person approves the merge.

Treat a text-only end of turn as a report, not as proof the task is done. Run `bypassPermissions` only in a disposable container with disposable code and no credentials. Pushes, merges, deploys, migrations on shared databases and anything client-visible need a person.
