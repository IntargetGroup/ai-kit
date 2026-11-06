# Skills

> **Dated snapshot.** Checked on 2026-11-06 against the [skills docs](https://code.claude.com/docs/en/skills), [plugin security](https://code.claude.com/docs/en/plugins/security) and [plugin install](https://code.claude.com/docs/en/plugins/install) pages (Claude Code v2.1.3xx). Version gates are noted where the docs give them; check `/status` before you rely on one.

How to choose, install, audit and write skills for Claude Code. General plugin and MCP rules live in [README.md §5](README.md#5-plugins-and-mcp-servers-worth-it); this page adds what is specific to skills.

## 1. What a skill is, and when to write one

A skill is a folder with a `SKILL.md`: YAML frontmatter that says what it does and when to use it, then the instructions. Claude Code follows the open [Agent Skills](https://agentskills.io) standard and extends it. Custom commands in `.claude/commands/` still work; a skill of the same name wins.

Write a skill when you keep pasting the same procedure into chat, or when a section of `AGENTS.md` has grown from a fact into a procedure. Pick the mechanism by what the text must do:

| The text must | Put it in |
|---|---|
| hold in every session, as a fact or a short rule | `AGENTS.md` ([README.md §1](README.md#1-one-instruction-file-per-repo)) |
| run as a procedure when relevant or when called | a skill |
| hold every time, with no exceptions | a hook or a deny rule ([README.md §2](README.md#2-guidance-versus-enforcement)) |
| do noisy work in its own context and return a summary | a subagent, or a skill with `context: fork` |

Intarget's validated working methods live in the Indeck skills catalogue (`skills_list`, `skills_read`). Before you write a team skill, look there; to use an Indeck skill in Claude Code, see [../guide/indeck.md](../guide/indeck.md#le-skill-di-indeck-in-claude).

## 2. Where skills load

| Location | Path | Loads in |
|---|---|---|
| Enterprise | `.claude/skills/<name>/SKILL.md` in the managed settings directory | every session on machines where the organisation deploys it |
| Personal | `~/.claude/skills/<name>/SKILL.md` | all your projects on this machine; not Cowork or cloud sessions |
| Project | `.claude/skills/<name>/SKILL.md`, committed | sessions in this repo, started at or below the root |
| Nested | `<subdir>/.claude/skills/<name>/SKILL.md` | sessions started in `<subdir>`; otherwise once Claude touches a file there |
| Plugin | `<plugin>/skills/<name>/SKILL.md` | wherever the plugin is enabled, as `/<plugin>:<name>` |
| claude.ai account | skills enabled on your account | Cowork, cloud sessions, and terminal sessions signed in with that account |

- Same name in several places: enterprise beats personal, personal beats project. Plugin skills never clash, because they are namespaced.
- Cowork and cloud sessions, cloud scheduled tasks included, do not read `~/.claude/skills/`. A skill they need must be enabled on the claude.ai account (or, for cloud sessions outside projects, committed to the repo).
- To share skills with other coding agents, keep them in one folder such as `.agents/skills` and symlink them into `.claude/skills` ([README.md §1](README.md#reference-t3code) shows the t3code layout). Claude Code reads a symlinked skill folder from its target and loads it once.

## 3. What a skill costs

- **Every turn:** the skill listing. Each skill's `description` plus `when_to_use` is capped at 1,536 characters, and the whole listing at about 1% of the context window. When it overflows, Claude Code drops the descriptions of the skills you use least, and Claude can no longer match them. A skill with `disable-model-invocation: true` is not in the listing.
- **When invoked:** the rendered `SKILL.md` enters the conversation once and stays. Claude Code does not re-read the file on later turns.
- **After compaction:** Claude Code re-attaches the most recent invocation of each skill, keeping its first 5,000 tokens, within 25,000 tokens for all skills together. Older skills can drop out. Put the instructions that matter most at the top, and invoke the skill again after a compaction.
- **Measure:** `/doctor` estimates the listing cost; `/skill-doctor` (v2.1.252+) reports each skill's context cost and how often it runs, and flags skills never invoked. Hide a personal or project skill with `skillOverrides` (`"on"`, `"name-only"`, `"user-invocable-only"`, `"off"`) in settings; plugin skills are managed in `/plugin` instead.

## 4. Choosing skills

Install few. Every installed skill costs listing space on every turn, and every plugin can bring hooks and servers ([README.md §5](README.md#5-plugins-and-mcp-servers-worth-it)).

**Bundled skills first.** They ship with Claude Code and need no audit:

| Skill | Use it for |
|---|---|
| `/doctor`, `/doctor prompt-audit` | setup checkup; instructions written for older models, dead references, contradictions |
| `/code-review` | an independent review of a diff or PR |
| `/run`, `/verify`, `/run-skill-generator` | launch the app and confirm a change in the running app; record the launch recipe once as a project skill |
| `/batch` | one large change split across worktree-isolated subagents |
| `/claude-api` | Claude API and SDK work: migrations, evals, cost review |
| `/deep-research` | a bundled workflow that researches a question across many sources and cross-checks them |

When a project or personal skill named `verify` or `simplify` exists at session start and Claude may invoke it, Claude Code's commit instructions tell Claude to run it right before each commit, except for changes to docs or tests (v2.1.286+). The recipe `/verify` records at the repo root is such a skill, so recording it adds a pre-commit check.

**Plugins from the official marketplace** (`claude-plugins-official`) worth knowing, beyond the README list:

| Plugin | What it adds | Use when |
|---|---|---|
| `skill-creator` | create, eval, benchmark and tune skills (§8) | you write or maintain skills |
| `superpowers` | a methodology: brainstorming, written plans, subagent-driven development with review, red/green TDD | work that earns the full process ([knowledge-management-spec.md §2](knowledge-management-spec.md#2-ceremony-by-task-size)); overhead for small tasks |
| `pr-review-toolkit` | review agents for comments, tests, error handling, type design, simplification | a deep PR review |
| `frontend-design` | guidance for distinctive UI instead of generic defaults | UI work |
| `hookify` | writes hooks from rules you state | a rule keeps getting missed and belongs in a hook |
| `claude-md-management` | audits and updates `CLAUDE.md` files | keeping instruction files current |
| `github` | the GitHub MCP server | issue and PR work beyond the `gh` CLI |

A listing in the official marketplace does not mean Anthropic wrote the plugin. `superpowers` and others point at third-party repositories, pinned to a commit. Audit them like any third-party code.

## 5. Installing pinned

- **Marketplaces:** pin a tag or branch when you add one: `/plugin marketplace add your-org/plugins#v1.2.0`, or a git URL with `#ref` ([install docs](https://code.claude.com/docs/en/plugins/install#add-a-marketplace)).
- **Auto-update** is on by default for the official marketplace names (except `knowledge-work-plugins` and `first-party-plugins`) and for marketplaces added from claude.ai, and off for every other marketplace ([discover plugins](https://code.claude.com/docs/en/discover-plugins)). Auto-update replaces the files you reviewed. Leave it off for third-party marketplaces, and re-read the diff before you update one. Toggle it in `/plugin` → **Marketplaces**.
- **Project scope:** `claude plugin install <name>@<marketplace> --scope project` writes the entry to `.claude/settings.json`. Committing that entry enables the plugin for collaborators but does not download it; each collaborator runs the same install once.
- **Vendored skills:** a skill folder copied into `.claude/skills/` is pinned by git. Record the source URL and commit in the PR that adds it, and update it only by PR.
- **Installer commands** (`npx <tool> add ...`): pin the package version. Never `@latest` in a command other people copy.

## 6. Auditing a skill

Apply the plugin audit in [README.md §5](README.md#5-plugins-and-mcp-servers-worth-it) first: read `SKILL.md`, hooks, scripts and `bin/`; check the inventory with `claude plugin details <name>`. Then check what is specific to skills:

- **`allowed-tools`** pre-approves tools for the turn that invokes the skill. Workspace trust does not gate it: a project skill's grant applies even in a `-p` run in a folder you never trusted. Read the `allowed-tools` of every skill in a repo you clone before you run Claude Code there.
- **Dynamic context injection.** A line starting with `` !`command` `` or a ` ```! ` block runs a shell command before Claude sees the skill. Permission rules apply (a deny rule aborts the invocation), but the command runs at render time. `"disableSkillShellExecution": true` turns this off for every non-bundled, non-managed skill; it belongs in managed settings.
- **`hooks`** in frontmatter register hooks that run for the rest of the session after the first invocation.
- **`model`, `effort`, `context: fork`, `agent`** change which model and which agent type run the skill.
- **Supporting files.** `scripts/` run with your privileges. Read every file the body tells Claude to run.
- **The text itself.** Reject a skill whose instructions tell Claude to ignore other instructions, fetch undeclared URLs, read credentials or send data out. Treat an over-broad `description` as a defect: the skill then loads on unrelated requests.
- **Mechanical checks:** `claude plugin validate .claude/skills` (v2.1.233+) finds `SKILL.md` frontmatter that does not parse.

Organisation-wide controls, set in managed settings: `allowManagedPermissionRulesOnly` (ignores `allowed-tools` in project and personal skills, v2.1.282+), `strictPluginOnlyCustomization`, `disableSkillShellExecution`.

## 7. Writing a skill

```markdown
---
name: release-notes
description: Drafts release notes from recent merge commits. Use when the user asks for release notes, a changelog entry, or what shipped.
disable-model-invocation: true
allowed-tools: Bash(git log *)
---

## Recent merges
!`git log --oneline --merges -30`

Group the changes above into Added, Changed and Fixed. One line per change, user-facing wording, no commit hashes.
If the list is empty, say there is nothing to release.
```

- **Description** says what the skill does and when to use it, with the key use case and the words people actually type first. Avoid `<` and `>` in it; they display escaped. Use `[branch]` or `argument-hint`.
- **Who invokes it.** `disable-model-invocation: true` for anything with side effects (commit, deploy, send): only a person runs it. `user-invocable: false` for background knowledge only Claude should load.
- **Body.** State what to do, concisely: every line stays in context. Write standing instructions ("run the tests after every edit"), not one-time steps, because the file is not re-read. Keep `SKILL.md` under 500 lines and move reference material to supporting files that the body names and describes.
- **Rules that must always hold** go in a hook, not in the body: a skill can be skipped, a hook cannot.
- **Bundled scripts.** Reference them as `${CLAUDE_SKILL_DIR}/scripts/<file>`, and put the same path in `allowed-tools` (`Bash(${CLAUDE_SKILL_DIR}/scripts/render.sh *)`), so the exact command runs without a prompt and nothing broader is allowed.
- **Arguments:** `$ARGUMENTS`, `$0`, `$1`, or named ones declared in `arguments:`. Quote multi-word values.
- **Scope:** `paths:` globs load the skill only when Claude works on matching files.
- **`context: fork`** only for a skill with an explicit task: the forked agent sees the skill content, not your conversation. With `agent: Explore`, it also starts without `CLAUDE.md`, so the skill must carry everything it needs.
- **Windows.** Injected commands run through bash when it is available and fall back to PowerShell when it is not; an explicit `shell: bash` fails without Git Bash. Write commands that run in both shells, or set `shell: powershell` and write PowerShell.
- **Portability.** Uploads to claude.ai and the Skills API accept only `name`, `description`, `license`, `compatibility`, `metadata` and `allowed-tools`; any other key is a hard error, and dynamic context injection does not run there. Write to that subset when the skill must also work in Cowork.

## 8. Evaluating a skill

A skill that triggers is not a skill that works. Measure two things separately: does Claude invoke it on the prompts it should, and is the output right when it does.

- **Baseline.** Run a few realistic prompts in a fresh session with the skill and again with it off (`skillOverrides: { "<name>": "off" }`). A fresh session matters: leftover authoring context hides gaps in the written instructions.
- **`skill-creator`** automates the loop: test cases in `evals/evals.json`, one isolated subagent per case, graded assertions, a with/without benchmark of pass rate, time and tokens, blind A/B between two versions, and description tuning against should-trigger and should-not-trigger prompts.
- **Plugin skills:** `claude plugin eval` runs each prompt with and without the plugin, scores it, and exits non-zero below a threshold, so CI can gate on it ([plugin evals](https://code.claude.com/docs/en/plugin-evals)).

| Symptom | Fix |
|---|---|
| never triggers | put the words people type into `description`; ask "What skills are available?"; run with `--debug` to find a YAML parse error (a broken frontmatter loads the body with no description) |
| triggers on unrelated requests | narrow the `description`, or set `disable-model-invocation: true` |
| followed at first, then ignored | move must-hold rules into a hook; reword steps as standing instructions; invoke again after compaction |
| description cut short | trim it, put the key use case first, or set low-priority skills to `"name-only"` |
