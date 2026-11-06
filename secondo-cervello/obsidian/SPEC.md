# Second brain vault: implementation spec

This spec is for Claude Code. It defines how to build and run a personal knowledge vault: a folder of Markdown files under git that you compile from raw sources into linked pages. The person reads the Italian summary in [completo.md](https://github.com/IntargetGroup/ai-kit/blob/main/secondo-cervello/completo.md). When the two disagree, this spec wins.

- Canonical URL: `https://raw.githubusercontent.com/IntargetGroup/ai-kit/main/secondo-cervello/obsidian/SPEC.md`. The build copies it to `docs/SPEC.md` in the vault.
- Talk to the person in Italian unless they write in another language.
- Code repositories do not use this spec. They use [engineering/knowledge-management-spec.md](https://github.com/IntargetGroup/ai-kit/blob/main/engineering/knowledge-management-spec.md).
- Claude Code mechanics cited here were checked against code.claude.com on 2026-11-06. If the docs and this spec disagree, the docs win; tell the person.

## 1. What you build

The pattern is Andrej Karpathy's "LLM Wiki" ([gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)). Three layers:

1. **Raw sources** (`raw/`): articles, papers, transcripts, chat captures. Immutable after capture.
2. **Wiki** (`wiki/`, `domains/`, `people/`): pages you compile from the sources. You write them; the person reads them.
3. **Schema** (`AGENTS.md`, `domains/<domain>/CLAUDE.md`, the skills): the rules you follow to compile, link and check.

Three operations: **ingest** (source to pages), **query** (answer from pages, with citations), **lint** (check the vault's health).

The vault holds **personal compiled knowledge**: what the person reads, learns and reasons about. Company and client knowledge lives in Indeck, Intarget's shared memory (section 4). Sensitive personal notes live in L1, a local folder outside the vault (section 4).

You read and write the vault folder directly. Obsidian is optional: a viewer, a graph and a mobile client (section 15). Nothing in this spec needs Obsidian to run.

The vault runs in Claude Code: the terminal CLI or the Code tab of the desktop app, started at the vault root. Both load the vault's `CLAUDE.md`, project skills and project settings. Cowork is out of scope: it loads skills from the claude.ai account, not from the machine ([skills in Cowork](https://code.claude.com/docs/en/skills#use-skills-in-cowork-and-cloud-sessions)).

## 2. Design decisions

Each decision below corrects a failure seen in earlier versions of this system. Do not reintroduce the rejected option without a recorded decision (section 6).

| # | Decision | Reason |
|---|---|---|
| D1 | No hooks by default. `CLAUDE.md` imports `AGENTS.md` and the state file `agent-memory/NOW.md`. | Imports load at launch, and the project-root `CLAUDE.md` is re-read from disk after compaction ([context window](https://code.claude.com/docs/en/context-window#what-survives-compaction)). That gives rehydration without a SessionStart hook. |
| D2 | State files are bounded and rewritten, never appended. History is `git log`. | Append-only logs (progress, blockers, threads, hot cache) grow past readability and cost context in every session. |
| D3 | A hook, if one is ever added, never writes a tracked file. A guard hook answers deny or nothing. | A hook that rewrites tracked files leaves the tree always dirty and can overwrite your edits. A PreToolUse `allow` skips the permission prompt ([hooks](https://code.claude.com/docs/en/hooks)), so a guard that answers `allow` for everything it does not block removes a safety layer. |
| D4 | Trust the disk, not reports. | An agent or subagent can report a file as written when it is not. Verify with `git status` and by reading the file. |
| D5 | One writer for hub pages and counters. Decisions are named by date, not by number. | Parallel agents gave the same number to different decisions and overwrote each other's hub edits. |
| D6 | `AGENTS.md` is the rulebook; `CLAUDE.md` imports it with `@AGENTS.md`. | Two instruction files (one for Claude, one for other agents) drift apart. An import keeps one source ([memory: AGENTS.md](https://code.claude.com/docs/en/memory#agents-md)). |
| D7 | Lint is a versioned, dependency-free script (`scripts/lint.mjs`). | A lint that you rewrite in each session gives different results in each session. |
| D8 | A large MCP result is read from its file. | Claude Code saves a text result longer than 50,000 characters to a file and gives you a reference ([MCP output limits](https://code.claude.com/docs/en/mcp)). Working from the preview drops data. |
| D9 | `raw/` is protected by a permission rule; the rule's limits are known (section 9). | A rule stops Claude's file tools and the Bash file commands Claude Code recognizes. It does not stop a script that opens files itself. |
| D10 | Obsidian is a viewer. No Obsidian MCP, no Local REST API. | They add a running app and an API key and give Claude Code no capability it lacks. |
| D11 | Client material never enters the vault. | A copy in a personal repository leaves Indeck's permissions and the client's perimeter. |

## 3. Layout

```text
<vault>/
├── AGENTS.md                  rulebook for any agent (section 7)
├── CLAUDE.md                  two lines: @AGENTS.md and @agent-memory/NOW.md
├── README.md                  for the person, in the vault language: what this is, the commands
├── .gitignore  .gitattributes
├── .claude/
│   ├── settings.json          permissions (section 9)
│   └── skills/<name>/SKILL.md ingest, query, lint, crystallize, weekly-review, new-domain (section 8)
├── docs/SPEC.md               copy of this spec, as built
├── scripts/lint.mjs           the vault lint (section 10)
├── agent-memory/
│   ├── NOW.md                 current state, at most 40 lines, rewritten (section 6)
│   └── decisions/             YYYY-MM-DD-<slug>.md, decisions about the vault itself
├── _templates/                page skeletons (section 5)
├── inbox/                     new captures; gitignored until ingested
├── raw/<kind>/YYYY-MM/        archived sources, immutable; raw/_archive/ for superseded ones
├── wiki/
│   ├── concepts/  entities/  sources/  syntheses/  questions/
│   ├── index.md               catalog of every wiki page, one line each
│   ├── overview.md            the compiled picture, rewritten at milestones
│   ├── contradictions.md      one line per page with an open contradiction
│   └── tag-dictionary.md      the closed tag vocabulary
├── domains/<domain>/
│   ├── _moc.md                map of content: the domain's hub page
│   ├── CLAUDE.md              domain rules (Claude Code loads it on demand)
│   ├── meetings/YYYY/         only personal meetings: a course, a talk, mentoring
│   └── decisions/             YYYY-MM-DD-<slug>.md, personal decisions in this domain
├── people/<firstname-lastname>.md
└── daily/YYYY/YYYY-MM-DD.md   optional, only if the person wants daily notes
```

`<kind>` is one of `articles`, `papers`, `clips`, `transcripts`, `conversations`, `books`, `courses`, `other`. Add a kind with a decision record, not ad hoc.

Location: outside any synced folder (OneDrive, iCloud Drive, Google Drive, Dropbox). File sync and git on the same folder produce conflict copies. Defaults: Windows `C:\Users\<name>\second-brain`, macOS `~/second-brain`. On Windows, `Documents` and `Desktop` are often redirected into OneDrive; do not use them.

One vault, many domains. Notes compound only when they can link; `domains/` gives namespaces without splitting the graph. `wiki/` is atemporal (concepts, entities, syntheses); `domains/` is time-bound (meetings, decisions).

Domain examples: `learning`, `craft` (the person's profession in general, not company specifics), `tech-news`, `reading`, `personal`. Two to five domains at the start. A domain the person does not fill is noise.

## 4. Boundaries: Indeck, vault, L1

| Knowledge | Home | In the vault only as |
|---|---|---|
| Clients, brands, projects, company decisions, internal methods, colleagues | Indeck workspace or project memory | nothing; at most a line naming the Indeck scope |
| The person's profile and preferences | personal Indeck CORE (`whoami`, then `memory_read` with scope `personal`) | nothing |
| What the person reads, learns, reasons about; personal decisions; public people | the vault | itself |
| Health, personal finances, contracts, private relationships | L1: a local folder outside the vault, never in git, never synced | nothing |
| Passwords, API keys, tokens | the person's password manager | nothing, and not in L1 either |

Rules:

- **Gate every capture.** Before you archive or compile a source, decide which row it belongs to. Client or company material stops at the gate: tell the person, leave the file in `inbox/` (gitignored, so it never reaches git), and propose ingesting it into the right Indeck workspace or project. The person deletes it from `inbox/` afterwards.
- **Promotion.** When a vault page becomes a fact the team needs, it goes to Indeck through the Indeck skill «Ingestione in memoria Indeck». Find it with `skills_list` and read it with `skills_read` before writing. Show the person the text and the destination scope; write after their yes. If a write answers `requires_approval`, `denied_by_user` or an error, nothing was written: say so and do not retry. The vault page keeps one line: `Promoted to Indeck: <scope name>, <file>, YYYY-MM-DD.` It does not keep a copy that can drift.
- **Indeck over MCP injects nothing.** You pull: `whoami`, then the personal CORE, then a workspace or project CORE when the task names one. Read Indeck only when the task needs it.
- **L1 direction.** You read or write L1 only when the person asks in the current message. Nothing moves from L1 into the vault. The settings in section 9 make every L1 access ask for approval.
- **Privacy placeholders.** When a source holds sensitive personal data that the person still wants archived, replace those parts in the `inbox/` copy before archiving, with `[removed for privacy: <kind>]`. A silent cut makes an incomplete source look complete.
- **`people/` pages** hold role, public context and what the person said where, with sources. Never judgments, evaluations or private data. Colleagues are company context: their pages belong in Indeck, if anywhere.

## 5. Page contract

### Frontmatter

Every page in `wiki/`, `domains/`, `people/` and `daily/` starts with this block. The meta pages `wiki/index.md` (and any `wiki/index-<domain>.md`), `wiki/overview.md`, `wiki/contradictions.md` and `wiki/tag-dictionary.md` are exempt.

```yaml
---
type: concept | entity | source | synthesis | question | meeting | decision | person | moc | daily
domain: <a folder name under domains/> | global
tags: [kebab-case, every-tag-in-wiki/tag-dictionary.md]
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: active | hypothesis | archived | contradicted | superseded
sources: [raw/articles/2026-11/2026-11-03-example.md]
---
```

- `sources:` lists vault-relative paths of files that justify the page. It is required on every page under `wiki/` (except the meta pages) unless `status: hypothesis`. A claim with no source is deleted or the page becomes `status: hypothesis`.
- `status: superseded` adds `superseded_by: "[[wiki/concepts/new-page]]"`.
- Source pages add `source_url`, `author`, `published` when known.
- Optional: `people: ["[[people/firstname-lastname]]"]`. Quote wikilinks in YAML.

### Page types

| Type | Folder | Holds | Link floor |
|---|---|---|---|
| concept | `wiki/concepts/` | an idea, technique, pattern | 3 outgoing links |
| entity | `wiki/entities/` | a specific product, organisation, work, place | 2 |
| source | `wiki/sources/` | one per raw source: what it argues, extracted claims, what it adds | 1 into concepts or entities |
| synthesis | `wiki/syntheses/` | an argument across sources | 3 |
| question | `wiki/questions/` | an open question the vault investigates | 1 |
| meeting | `domains/<d>/meetings/YYYY/` | a personal meeting | — |
| decision | `domains/<d>/decisions/` | a personal decision: context, choice, alternatives, consequences | — |
| person | `people/` | role, context, appearances | — |
| moc | `domains/<d>/_moc.md` | the domain's hub | — |
| daily | `daily/YYYY/` | optional day page | — |

Source pages exist so that a concept with 50 sources does not become a wall of text: each source is summarised once, and the concept cites the source page.

### Names and links

- File names: lowercase kebab-case. Sources and dated pages start with `YYYY-MM-DD-`. People: `firstname-lastname`.
- Links are wikilinks with the full vault path and no extension: `[[wiki/concepts/event-sourcing]]`, `[[people/ada-lovelace]]`. Full paths never become ambiguous when two files share a name.
- **Round trip.** When page A links page B, page B links page A, usually in its `## Related` section. Exempt: links from or to hub pages (`wiki/index.md`, `wiki/overview.md`, `wiki/contradictions.md`, `_moc.md` files, daily notes).
- **Hub anchor.** A page whose `domain` is not `global` links its domain hub `[[domains/<d>/_moc]]`.
- **Index.** Every page in `wiki/concepts|entities|sources|syntheses|questions/` has one line in `wiki/index.md` before the commit.
- **Owners.** Every open action item `- [ ]` names its owner as `[[people/<slug>]]`. The person has their own page in `people/`.
- **Tags** come from `wiki/tag-dictionary.md` (format: `` - `tag` — meaning ``). A new tag enters the dictionary first.

### Callouts

```markdown
> [!contradiction] 2026-11-03 — <topic>
> [[wiki/sources/2026-10-02-a]] says X. [[wiki/sources/2026-11-01-b]] says Y. Unresolved.

> [!blocker] 2026-11-03 — <what is blocked>
> Tried: … Next: …
```

The date in the callout title is required. A contradiction keeps both claims with both sources; resolving it adds a resolution line under the callout and changes the callout to `> [!contradiction-resolved]`. Each open contradiction has one line in `wiki/contradictions.md`. Never overwrite a claim silently, never drop one of the two.

### The reconstruction test

The most frequent ingestion defect is a summary that is too short. For every page you write, ask: can a future reader rebuild the decision, the alternatives and the reasons from this page alone?

For a meeting or transcript the test requires: decisions in the words used, action items with owner and date, every number, name and reason, and the open questions. Padding fails the test as much as cuts: repetition and invented detail are defects too. Length follows the source, not a target.

### Templates

Write these to `_templates/` at build time, with headings in the vault language. Section names, once chosen, stay fixed. Frontmatter is the block above with the type filled in.

- **concept:** `# Name`; one-line definition; `## Core claim` (the current best understanding across sources); `## Why it matters`; `## Key aspects`; `## Open questions`; `## Related`; `## Provenance` (one line per source page: what it contributed).
- **entity:** `# Name`; one-line identification; `## Facts` (each with its source page); `## Related`; `## Provenance`.
- **source:** `# Title`; one-line summary; `## What it argues`; `## Extracted claims` (each linked to the concept or entity it updates); `## New to this vault`; `## Contradicts` (if any); `## Related`.
- **synthesis:** `# Claim as a sentence`; `## Argument`; `## Evidence` (source pages); `## Counter-evidence`; `## Related`.
- **question:** `# Question?`; `## Why it matters`; `## What the vault knows`; `## What would answer it`; `## Related`.
- **meeting:** `# YYYY-MM-DD — Title`; attendees as `[[people/…]]`; `## Context`; `## Decisions` (verbatim where possible); `## Action items` (owner and date); `## Details` (numbers, names, reasons); `## Open questions`; `## Related`.
- **decision:** `# YYYY-MM-DD — Decision`; `## Context`; `## Decision`; `## Alternatives` (and why rejected); `## Consequences`; `## Supersedes`.
- **person:** `# Name`; role and public context; `## Appearances` (links to pages that mention them); `## Related`.
- **daily** (only if the person chose daily notes): `# YYYY-MM-DD`; `## Captured` (links to inbox items and pages touched today); `## Decisions`; `## Action items` (owner); `## Related`. `domain: global`.
- **moc:** `# Domain — map`; `## What this domain covers`; `## Key pages`; `## Recent decisions`; `## Open threads`.

## 6. Agent memory

`agent-memory/NOW.md` is the only state file. `CLAUDE.md` imports it, so it is in context at launch and again after compaction. Other agents read it at session start.

```markdown
# NOW
Updated: YYYY-MM-DD

## Focus
One to three lines: what the person is working on in the vault.

## In progress
The step you are in, the file you were writing, the next action. Empty when nothing is in flight.

## Open threads
At most 10 lines, each with a link.

## Blocked
One line per [!blocker], with a link to the page.
```

- At most 40 lines. Rewrite it; never append history to it. What happened lives in `git log`.
- Update `In progress` at each checkpoint of long work (a build phase, a batch ingestion), so a compaction or a new session resumes from disk.
- Vault decisions (sync method, Obsidian or not, a new source kind, a rule change) go to `agent-memory/decisions/YYYY-MM-DD-<slug>.md` with Context, Decision, Alternatives, Consequences. A decision is superseded by a newer one that says so; the old file stays.
- Claude Code's auto memory is for machine and tool quirks only, never facts about people or content ([auto memory](https://code.claude.com/docs/en/memory#auto-memory)).

## 7. The vault's AGENTS.md

Write this at build time. Fill the angle-bracket fields from the interview (section 12). Target: under 120 lines; the docs advise under 200 lines for instruction files because longer files reduce adherence, and imports count ([memory](https://code.claude.com/docs/en/memory#write-effective-instructions)).

`CLAUDE.md` holds exactly two lines: `@AGENTS.md` and `@agent-memory/NOW.md`.

````markdown
# Knowledge vault — rules

This vault is <name>'s personal compiled knowledge: what I read, learn and reason about. You maintain it. Talk to me in Italian. Write page prose in <vault language>; quote sources verbatim in their original language. File names, frontmatter keys and tags stay English kebab-case.

This vault follows docs/SPEC.md (from <spec URL>, copied <date>). When a rule here needs detail, read the matching section there.

## Session start
- Claude Code loads this file and agent-memory/NOW.md through CLAUDE.md. Other agents: read agent-memory/NOW.md now.
- Read nothing else until the task needs it. wiki/index.md is the catalog. domains/<d>/_moc.md is a domain's hub.
- Before you work on a domain, read domains/<d>/CLAUDE.md if it is not in context.

## Domains
- `<slug>` — <one line>. Hub: domains/<slug>/_moc.md
(one line per domain; /new-domain adds lines)

## What goes where
- My personal compiled knowledge goes here.
- Company and client knowledge (clients, brands, projects, company decisions, internal methods, colleagues) lives in Indeck. It never enters raw/, wiki/ or git. If you find some in inbox/, leave it there, tell me, and propose ingesting it into the right Indeck workspace or project; I delete it from inbox/ myself.
- My profile and preferences live in my personal Indeck CORE. Read it with whoami, then memory_read (scope personal), when a task needs them. Keep no copy here.
- Sensitive personal notes live in L1: <L1 path>. Read or write L1 only when I ask in the current message. Nothing moves from L1 into this vault.
- Passwords, keys and tokens live in my password manager, never here and never in L1.
- When a page here becomes a fact my team needs, propose promoting it to Indeck with the Indeck skill «Ingestione in memoria Indeck» (find it with skills_list). Show me the text and the destination; write after my yes. Here keep one line: "Promoted to Indeck: <scope>, <file>, <date>."

## Non-negotiables
1. raw/ is immutable. Sources enter raw/ only by moving them from inbox/ with: <move command verified at build>. A wrong source is moved to raw/_archive/ by me, not corrected.
2. You write the wiki; I read it. If I edit a page heavily, the schema is wrong: propose a rule change.
3. Every page under wiki/ has sources: in its frontmatter, or status: hypothesis.
4. A contradiction gets a dated [!contradiction] callout with both claims and both sources, and a line in wiki/contradictions.md. Never overwrite a claim.
5. One ingested source, one commit: ingest(<domain>): <title> — N pages (+M new).
6. If one page or source blocks you for 30 minutes, commit what you have as wip(<scope>): …, add a dated [!blocker] callout on the page and a line in NOW.md, and move on.
7. wiki/index.md, wiki/overview.md, wiki/contradictions.md, the _moc.md files and NOW.md have one writer per session: the main agent. Subagents write leaf pages and report back.
8. Trust the disk. Before you report work as done, check git status and read back what you wrote.

## Page contract
Frontmatter, page types, templates and callouts: docs/SPEC.md section 5. Templates: _templates/.
- Wikilinks use the full vault path without extension: [[wiki/concepts/slug]].
- When A links B, B links A in its Related section (hub pages exempt).
- A page with a non-global domain links its hub domains/<d>/_moc.
- Every new wiki page gets a line in wiki/index.md before the commit.
- Every open action item names its owner as [[people/<slug>]]. My page: people/<my-slug>.md.
- Tags come from wiki/tag-dictionary.md; add a tag there first.
- Reconstruction test: a future reader rebuilds the decision, the alternatives and the reasons from the page alone. For meetings: decisions in the words used, actions with owner and date, every number, name and reason, open questions. No padding.

## Tools
- When a tool result says it was saved to a file, read that file. Never compile from a preview.
- Read every source in full, in parts if it is long. Never compile from a summary of a source.
- Run node scripts/lint.mjs after each ingestion and fix the errors you introduced. Never edit the script to make a check pass.
- Daily notes: <on|off>. When on, /ingest and /crystallize link the pages they create from daily/YYYY/YYYY-MM-DD.md.

## Commits
- Format: <type>(<scope>): <subject>. Types: ingest, crystallize, lint, docs, feat, fix, refactor, chore, wip. Scope: a domain, wiki or meta.
- Commit after each unit of work. Never force-push, never rewrite history.
- When I say «chiudiamo» (or "wrap up"): rewrite agent-memory/NOW.md, list what you would promote to Indeck and wait for my yes, commit, then push if a remote exists.

## Skills
/ingest, /query, /lint, /crystallize, /weekly-review, /new-domain (in .claude/skills/).
````

### Domain rules: `domains/<d>/CLAUDE.md`

Claude Code loads a subdirectory's `CLAUDE.md` when you read or edit a file in that subdirectory ([how CLAUDE.md files load](https://code.claude.com/docs/en/memory#how-claude-md-files-load)). Wiki pages of the domain live in `wiki/`, so `AGENTS.md` also tells you to read it explicitly. Keep each under 40 lines:

```markdown
# <domain> — rules
- Covers: <what belongs here>. Does not cover: <what goes elsewhere>.
- Entity kinds specific to this domain and when they get a page (for example: a book gets an entity page when two sources cite it).
- Naming conventions beyond the global ones.
- Routing answers the person gave when a source was ambiguous (add one line each time, so the next similar source routes itself).
```

## 8. Skills

Skills live at `.claude/skills/<name>/SKILL.md` ([skills](https://code.claude.com/docs/en/skills)). Keep each short and put the critical steps first: after compaction an invoked skill body is re-injected only up to 5,000 tokens ([context window](https://code.claude.com/docs/en/context-window#what-survives-compaction)). Skills point to `AGENTS.md` and `docs/SPEC.md` instead of restating rules. Name MCP tools by their bare name (`memory_search`), never with a client prefix: the prefix depends on how each person connected the server.

Write them as follows. The person invokes them with `/name`. `$ARGUMENTS` is replaced by what follows the command.

````markdown
---
name: ingest
description: Compile sources from inbox/ (or a given path) into wiki pages with citations, one commit per source. Use when I add files to inbox/ or ask to process, file or ingest a source.
argument-hint: "[path]"
---
Ingest $ARGUMENTS (default: every file in inbox/, oldest first). Rules: AGENTS.md. Page contract: docs/SPEC.md section 5.

For each source:
1. Gate. Read the whole source (in parts if long; if a tool saved output to a file, read the file). Client or company material: stop, tell me, leave it in inbox/, propose Indeck ingestion. Secrets: stop and tell me. Sensitive personal parts I still want archived: replace them in the inbox copy with [removed for privacy: <kind>].
2. Archive. Move it to raw/<kind>/YYYY-MM/YYYY-MM-DD-<slug>.<ext> with the move command in AGENTS.md, then git add it.
3. Source page. Write wiki/sources/YYYY-MM-DD-<slug>.md from the template.
4. Touched pages. Find them through wiki/index.md and a search for the source's names and terms (typically 3 to 10). Add the source's claims to each, citing the source page. Create a concept or entity page when the source is about it or two pages already mention it.
5. Contradictions: dated callout, both claims, both sources, line in wiki/contradictions.md.
6. A personal meeting: page in domains/<d>/meetings/YYYY/, decisions in domains/<d>/decisions/, action items with owners.
7. Hubs: wiki/index.md, the domain _moc.md, back-links in Related sections. If daily notes are on (AGENTS.md, Tools), link each page you created today from daily/YYYY/YYYY-MM-DD.md; create it from the daily template if missing.
8. Check: the reconstruction test on each page you wrote; node scripts/lint.mjs; fix what you introduced.
9. Commit: ingest(<domain>): <title> — N pages (+M new). Run git status: the tree must be clean.
Up to 10 short clips on one topic may share one commit. If context runs out mid-source: commit as wip(<domain>): …, add a [!blocker] naming the depth gap, update NOW.md.
````

````markdown
---
name: query
description: Answer a question from the vault, citing wiki pages and their raw sources. Use when I ask what I know, read, decided or wrote about something.
argument-hint: "<question>"
---
1. Pick candidates in wiki/index.md. Read 3 to 5 pages and follow their links one hop. Domain question: read the domain _moc.md. Question about a time window: read the daily notes and meetings of that window.
2. Cite every claim: [[wiki/…]] and its raw source path. Mark your own inference as inference.
3. If the vault does not cover the question, say so. Do not fill the gap from general knowledge without saying that you do.
4. A question about clients, projects or company practice belongs to Indeck: use memory_search with explicit scopes and say which part of the answer came from Indeck.
5. If the gap matters, offer to record it as wiki/questions/<slug>.md.
````

````markdown
---
name: lint
description: Check vault health with scripts/lint.mjs and apply the safe fixes. Use when I ask to check, clean or lint the vault.
argument-hint: "[fix]"
---
1. Run node scripts/lint.mjs. Report errors grouped by check with counts, then notices.
2. Without "fix": stop. Propose an order of fixes.
3. With "fix": the tree must be clean (git status); if it is not, ask me to commit first. Apply only safe fixes: missing index lines, missing back-links, missing hub links. For dead links, sourceless pages, contradictions, unowned action items and unknown tags, show one proposed fix each and apply after my yes.
4. Re-run the script. Commit: lint(wiki): <what> — N fixes.
If a check is wrong, tell me. A change to the script is its own commit: fix(meta): lint — <what>.
````

````markdown
---
name: crystallize
description: Save reasoning that converged in this conversation (a decision, a framing, a synthesis) into the vault through inbox/ and the ingest procedure. Use when I say to keep, save or crystallize what we worked out.
---
1. Name what converged. If nothing converged yet, say so and stop.
2. Write inbox/YYYY-MM-DD-conversation-<slug>.md in the conversation's language: a header with the date, the domain and the participants, the question, decisions with reasons and rejected alternatives, claims tagged [user], [assistant] or [source: …], open questions. Quote me verbatim where my wording carries the reasoning.
3. Run the ingest procedure on it, with kind conversations. A claim about the world whose only source is this conversation gets status: hypothesis. My decisions and positions are facts of the conversation.
4. Close resolved threads in NOW.md. Commit: crystallize(<domain>): <title> — N pages.
````

````markdown
---
name: weekly-review
description: Weekly review of the vault: what changed, what waits, lint, a rewritten NOW.md and proposed Indeck promotions.
disable-model-invocation: true
---
1. git log --since="7 days ago" --oneline: summarise what changed.
2. List inbox/. Ingest the files I approve.
3. Run the lint skill without fix.
4. List contradictions older than 30 days, blockers and questions. Propose a resolution or a next step for each.
5. Rewrite the sections of wiki/overview.md that the week changed. No changelog in the page.
6. Rewrite agent-memory/NOW.md.
7. Propose promotions to Indeck: text and destination for each; write after my yes.
8. Commit: docs(meta): weekly review YYYY-Www.
````

````markdown
---
name: new-domain
description: Add a domain to the vault.
disable-model-invocation: true
argument-hint: "<slug>"
---
1. Check that $ARGUMENTS is kebab-case and not an existing folder under domains/. Ask me what the domain covers and what it does not.
2. Create domains/$ARGUMENTS/_moc.md (moc template) and domains/$ARGUMENTS/CLAUDE.md (docs/SPEC.md section 7).
3. Add the domain line to AGENTS.md and a tag to wiki/tag-dictionary.md.
4. Add an open thread to NOW.md: first sources for $ARGUMENTS.
5. Commit: feat(meta): add domain $ARGUMENTS.
A narrow topic inside an existing domain is not a domain: it is a page or a subfolder there.
````

`disable-model-invocation: true` keeps Claude from starting a skill on its own ([skills frontmatter](https://code.claude.com/docs/en/skills)). The first four skills stay model-invocable so a plain request ("process the inbox") works.

## 9. Settings, permissions and git files

`.claude/settings.json`:

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "deny": ["Edit(/raw/**)"],
    "ask": ["Read(~/.second-brain-local/**)", "Edit(~/.second-brain-local/**)"]
  }
}
```

Replace `~/.second-brain-local` with the L1 path from the interview, written home-relative with `~/` (or absolute with `//`). Semantics ([permissions](https://code.claude.com/docs/en/permissions#read-and-edit)):

- `Edit` rules cover every built-in tool that edits files, including creating a file. A `/path` pattern in project settings anchors at the directory where the session starts, so the vault rule holds only when sessions start at the vault root. Start them there.
- Read and Edit rules also cover the Bash file commands Claude Code recognizes (such as `cat`, `sed`, `tee`) and redirection targets. They do not cover a script or program that opens files itself. For OS-level enforcement, the docs point to the sandbox.
- Whether a move such as `mv inbox/x raw/…` counts as an edit of `raw/` is not documented. The build tests it (section 12, phase 5) and records the move command that works in `AGENTS.md`.
- On Windows, paths are normalised to POSIX form before matching.
- An `ask` rule makes every L1 access wait for the person's approval: that is the mechanical form of "only when I ask".

Hooks: none. If the person later wants a guard (for example, against a script writing into `raw/`), it is a PreToolUse command hook that reads the tool input as JSON on stdin and prints a deny decision or nothing ([hooks](https://code.claude.com/docs/en/hooks)). It never prints `allow`, never writes files and exits 0. On Windows a shell-form hook runs in Git Bash when Git for Windows is installed, otherwise in PowerShell; set the hook's `shell` field explicitly. Record the hook as a vault decision.

`.gitignore`:

```gitignore
# Captures stay out of git until /ingest archives them
inbox/*
!inbox/.gitkeep
# Obsidian per-device state, plugin data and trash
.obsidian/
.trash/
# Claude Code per-machine files
.claude/settings.local.json
CLAUDE.local.md
# OS files
.DS_Store
Thumbs.db
desktop.ini
# A net, not a control: secrets never belong here
.env
*.pem
*.key
```

`.gitattributes`: `* text=auto eol=lf`. One line-ending convention across Windows and macOS keeps diffs clean.

Remote: a private repository the person creates. You never handle tokens: when `git push` asks for authentication, the person completes it (Git Credential Manager on Windows opens a browser). L1 is never in any repository.

## 10. Lint

The lint is `scripts/lint.mjs`, downloaded at build from `https://raw.githubusercontent.com/IntargetGroup/ai-kit/main/secondo-cervello/obsidian/lint.mjs`. It needs Node.js 22 or newer and no packages. Run it from the vault root: `node scripts/lint.mjs`. It writes nothing. It exits 1 when it finds an error.

It scans `wiki/`, `domains/`, `people/` and `daily/` (not `CLAUDE.md` files) and skips text inside code. Errors:

| Check | Fails when |
|---|---|
| frontmatter | a page lacks the block, a required key, or a valid `type`, `status`, date or `domain` |
| sources | a `wiki/` page has no `sources:` and is not `status: hypothesis`; or a listed source file does not exist |
| dead-link | a wikilink resolves to no file, or a bare name matches several files |
| hub-anchor | a page with a non-global domain does not link `domains/<d>/_moc` |
| unindexed | a page in `wiki/concepts/`, `entities/`, `sources/`, `syntheses/` or `questions/` is not linked from `wiki/index.md` or a `wiki/index-<domain>.md` |
| orphan | a page has no incoming link except from the index pages (hubs and daily notes exempt) |
| round-trip | A links B and B does not link A (hub pages exempt) |
| density | a page is below its type's link floor (section 5) |
| owner | an open `- [ ]` item has no `[[people/…]]` link |
| tags | a tag is missing from `wiki/tag-dictionary.md` |
| contradictions | an open contradiction callout has no date, or its page is not linked from `wiki/contradictions.md` |

Notices (exit code unchanged): contradictions open for more than 30 days, blocker callouts, pages with `updated` older than 180 days, `inbox/` files older than 7 days, `raw/` files that no page lists in `sources:`.

Bare-name links (`[[event-sourcing]]`) resolve when exactly one page has that name, else exactly one file, as in Obsidian; full paths are still the rule. A source page and its raw file share a name, so a bare link reaches the page.

A vault-specific check goes into the script as a commit of its own, with the same rule: exact checks only, no guessing on content.

## 11. Capture

Everything enters through `inbox/`. One entry path keeps one gate (section 4).

| Source | How it reaches `inbox/` |
|---|---|
| Files (PDF, DOCX, Markdown, slides) | the person drops them in. Read PDFs in page ranges. |
| Web pages | save as Markdown, or Obsidian Web Clipper set to save into `inbox/` (optional) |
| A chat on claude.ai, ChatGPT, Gemini, NotebookLM | the export prompt in [prompt-export-chat.md](https://github.com/IntargetGroup/ai-kit/blob/main/secondo-cervello/prompt-export-chat.md) |
| Reasoning in a Claude Code session | `/crystallize` |
| A personal meeting (course, talk, mentoring) | the transcript export of the meeting tool |
| Quick thoughts | a Markdown note in `inbox/`, or the daily note if the person uses them |

Work meetings, work email and work chat are company material: they go to Indeck with its ingestion skill, never here.

**Batch mode.** A person who does not capture daily works in batches: pick a window (for example the last two weeks), walk each source of the window, ingest one commit per unit, then run `/lint` and fix. When a source is unreachable (no connector, unread attachments), write that on the page. A declared gap is better than a hidden one.

## 12. Build procedure

[BOOTSTRAP.md](https://github.com/IntargetGroup/ai-kit/blob/main/secondo-cervello/obsidian/BOOTSTRAP.md) holds the prompt that starts this procedure. Run each phase, verify it on disk, update `NOW.md`, commit. Ask the person only at the checkpoints, for personal facts, or before a destructive action.

**Phase 1: survival kit.** In the empty vault folder: `git init -b main`. If `docs/SPEC.md` is not there yet, download this spec with `curl` to it; download exact bytes, never through a summarising web-fetch tool. Write `agent-memory/NOW.md` with the phases below as the `In progress` checklist. Write a stub `AGENTS.md` ("Vault build in progress: follow agent-memory/NOW.md and docs/SPEC.md section 12.") and `CLAUDE.md` with its two imports. Commit `chore(meta): survival kit`. From here on, a compaction or a new session resumes from disk.

**Phase 2: interview (checkpoint).** Ask, one topic at a time, and never invent an answer:

1. Name and the slug for their `people/` page.
2. Vault language for page prose (default Italian).
3. Two to five domains, each with one line on what it covers. If the Indeck MCP is connected, offer to read the personal CORE (`whoami`, then `memory_read` with scope `personal`) to propose domains; read it only after a yes, and copy nothing from it into the vault.
4. L1 path (default `C:\Users\<name>\.second-brain-local\` on Windows, `~/.second-brain-local/` on macOS).
5. Remote repository URL, or none for now.
6. Obsidian: yes or no. Daily notes: yes or no.

Echo the answers as a list and wait for the person's confirmation. Record sync, Obsidian and daily-note choices as a decision in `agent-memory/decisions/`.

**Phase 3: scaffold.** Create the layout of section 3 (empty folders get `.gitkeep`), `.gitignore`, `.gitattributes`, `_templates/`, `wiki/index.md`, `wiki/overview.md` (a stub that links the person's `people/` page and says the picture is not compiled yet), `wiki/contradictions.md`, `wiki/tag-dictionary.md` (one tag per domain), each domain's `_moc.md` and `CLAUDE.md`, the person's `people/` page, the real `AGENTS.md` (section 7), `README.md`. Create the L1 folder outside the vault. Commit `chore(meta): scaffold vault`.

**Phase 4: lint and skills.** Download `lint.mjs` to `scripts/lint.mjs` with `curl`. Read the whole script before you run it, and tell the person what it does. Run it: zero errors on the scaffold, or fix the scaffold. Write the six skills (section 8). Commit `feat(meta): lint and skills`.

**Phase 5: permissions (checkpoint).** Show the person `.claude/settings.json` before you write it. Write it, set `In progress` in `NOW.md` to "phase 5 verification", and commit. Ask the person to start a new session at the vault root and paste the Resume block of BOOTSTRAP.md, so the settings and skills load. In the new session, verify and report each result:

1. Writing a new file under `raw/` with your file tools is denied.
2. Create `inbox/permission-test.md`, then move it to `raw/other/permission-test.md` with `mv`. If the move is denied, tell the person and propose changing the rule from `deny` to `ask`, so each archive move asks once. Record the command that works in `AGENTS.md` and as a decision. Ask the person to delete the test file from `raw/`.
3. `/context all` lists `CLAUDE.md` under Memory files ([memory](https://code.claude.com/docs/en/memory#set-up-a-project-claude-md)). The docs do not say that `@` imports appear there by name, so prove the imports another way: before reading any file, the new session states the `## Focus` line of `NOW.md`. A correct answer proves `AGENTS.md` and `NOW.md` loaded.
4. The six skills appear in the `/` menu.

Commit `chore(meta): permissions verified`.

**Phase 6: first ingestion (checkpoint).** The person drops one real source in `inbox/`. Run `/ingest`. Walk the person through what you created and why. Apply the reconstruction test with them. Fix the schema where they correct you.

**Phase 7: remote and close.** If there is a remote: `git remote add origin <url>`, `git push -u origin main`. If Obsidian is chosen: tell the person the settings of section 15. Rewrite `NOW.md` to the vault's normal state. Commit and push.

**Done when:** `node scripts/lint.mjs` exits 0; the permission results are recorded; `/context all` shows `CLAUDE.md` and the new session stated the `NOW.md` focus unprompted by a file read; one source is ingested and passed the reconstruction test with the person; `git status` is clean; the remote, if any, has the commits.

## 13. Operating rhythm

Propose these at the right moment; do not run them unasked except where a skill is model-invocable and the request matches.

| When | What |
|---|---|
| A source lands in `inbox/` | `/ingest` |
| A conversation produced a durable decision or synthesis | `/crystallize` |
| A question about what the person knows or decided | `/query` |
| End of a session | «chiudiamo»: rewrite `NOW.md`, propose promotions, commit, push |
| Weekly, or every two weeks in batch mode | `/weekly-review` |
| Monthly | `/lint fix` after a clean commit; reread `AGENTS.md` with the person and delete rules that no longer change your behaviour |
| A new long-lived area of the person's life | `/new-domain` |

After a skipped period: `/ingest` the inbox, then `/weekly-review`, then `/lint`. Never `/lint fix` on a stale, dirty tree.

## 14. Failure recovery

| Symptom | Action |
|---|---|
| A new session does not know where it stopped | `NOW.md` is stale. Rebuild it from `git log -20 --oneline` and `git status`, then keep it current at each checkpoint. |
| A session died mid-ingestion | `git status` shows the partial work. Finish the source from step 4 of `/ingest`, or `git restore` the half-written pages and restart the source. |
| Pages state facts about the person that no source supports | Find them with the lint `sources` check; turn each into `status: hypothesis` or delete the claim; ask the person. |
| Lint reports many errors after weeks | Commit, then fix by check in this order: frontmatter, dead links, sources, index, hubs, round-trip. One commit per check. |
| A raw source proves wrong | The person moves it to `raw/_archive/`. Update the pages that cite it with the new source, and add a decision if the change matters. |
| Client material was committed | Stop. Tell the person. It must leave the history, not only the tree; rewriting history is a destructive action the person decides and runs. |
| An instruction seems ignored | Check `/context all`. Check that the session started at the vault root. Look for a contradicting rule and remove one of the two. |

## 15. Obsidian (optional)

Obsidian adds a reader, a graph view and a mobile client. The person opens the vault folder with **Open folder as vault**; no plugin is required. Labels below are from the [Obsidian help](https://help.obsidian.md/).

- Settings → Files and links → **New link format**: "Absolute path in vault", so links the person creates match the full-path rule. Keep **Automatically update internal links** on, so a rename in Obsidian updates the links.
- Callouts such as `> [!contradiction]` render with a default style.
- Do not enable automatic commits from an Obsidian git plugin. You commit per ingestion; a timed auto-commit splits units of work and races your commits.
- Obsidian Web Clipper: set its save location to `inbox/`, never to `raw/`.
- Mobile: Obsidian Sync (paid) or another file sync can carry the vault to a phone. Let only one computer run git commits, and never put the vault folder inside OneDrive, iCloud Drive or Google Drive. Record the choice as a decision.
- Not needed: the Local REST API plugin, an Obsidian MCP server, Templater (you read `_templates/` directly), Dataview (useful only for live dashboards the person asks for).

## 16. Scaling and extensions

| Signal | Response |
|---|---|
| `wiki/index.md` passes about 400 lines | Split it into `wiki/index-<domain>.md` files that `index.md` lists. The lint already accepts them. |
| `/query` reads more than 10 pages for routine questions | Tighten the MoCs and the index lines; add syntheses for recurring questions. |
| Thousands of pages, broad questions get slow | Scope queries per domain. Archive daily notes older than a year into `daily/_archive/`. |
| Recall failures persist after the above | Evaluate a search or graph tool over the vault, as a recorded decision. Never as a default at build time. |

Do not install at build time: vector databases, memory layers, graph generators, transcription apps, extra MCP servers. Each one earns its place only after a recorded decision names the failure it fixes.
