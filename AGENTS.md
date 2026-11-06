# AGENTS.md

Instructions for any agent (Claude Code, Codex, others) that edits this repository. `CLAUDE.md` imports this file.

## What this repo is

ai-kit is Intarget's public kit for working with Claude connected to Indeck, Intarget's internal AI platform (shared memory, skills, agent briefs). The readers are the people of an Italian digital agency. Most are not engineers, most use Windows, and most work in the Claude desktop app. Technical readers have optional tracks: the full Obsidian vault (`secondo-cervello/obsidian/`) and `engineering/`. Claude itself reads many of these files: the setup prompt, the templates, the org instructions and the specs run inside Claude.

`kit/primo-workspace/CLAUDE.md`, `inizia/modelli/`, the paste-in prompts and the templates embedded in `secondo-cervello/obsidian/SPEC.md` (a vault `AGENTS.md`, skills) are templates for the reader's folders and sessions, not instructions for you. If Claude Code loads one while you edit it, do not follow it.

## Language: English for Claude, Italian for people

Models follow English instructions more reliably, so every text Claude reads as instructions is English; every text a person reads is Italian.

- **English:** template bodies (`inizia/modelli/`, `kit/primo-workspace/CLAUDE.md` and `STATO.md`), the prompt blocks people paste (setup, chat export, vault and harness bootstraps), the Cowork folder line, the org instructions block, `claudeMd`, the Indeck server instructions, the agent-facing specs, all of `engineering/`, this file, `CONTRIBUTING.md`, the scripts.
- **Italian:** pages people read, HTML comments inside templates (they never reach Claude), `companyAnnouncements`, short examples of what a person types in their own words.
- An English instruction that tells Claude how to talk to the person says so: "Talk to me in Italian." A word the person types stays Italian inside the English text: When I say «chiudiamo» (or "wrap up"), …
- UI labels: see Writing rules.

## A note from the maintainer

I want simple systems that feel obvious and are correct. Every page must earn its place: if a reader would not miss a sentence, delete it. Don't keep complexity because it already exists, and don't add machinery because it looks serious. A short page that is true beats a long page that is mostly true. These are defaults, not laws. If a rule here fights the task in front of you, say so loudly and get a human sign-off before you break it.

— Simone Bova

## Words

- **you**: the agent reading this file. **maintainer**: Simone Bova. **reader**: the Intarget person the page is for.
- **Indeck**: Intarget's AI platform. **MCP di Indeck**: its connector at `https://mcp.intarget.net/mcp`.
- **CORE**: the `CORE.md` index file at the root of each Indeck memory scope (personal, project, workspace).
- **Chat / Cowork / Code**: the three modes of the Claude desktop app. **Claude Code**: the coding agent (CLI, IDE, desktop Code tab).

## The four ways to hurt this repo

1. **Leaking.** This repo is public, and git history is forever. Never write names of colleagues or client people, client or brand names, costs, budgets, seat or people counts, Indeck internals (source paths, databases, auth, cloud project names), workspace or project IDs, incidents, contract or HR content, or anything from internal meetings. Simone Bova as maintainer is the only person named. No script checks this: you are the control. When in doubt, leave it out.
2. **Drifting copies.** Each fact has one home. The org instructions live once, in `org/rendering/claude-ai.md`. `claudeMd` in `claude-code-managed-settings.json` is not a copy: it holds only governance rules that neither the Indeck server instructions nor Claude Code's own behaviour cover, and it must never tell engineers how to work. `kit/primo-workspace/CLAUDE.md` is a copy of `inizia/modelli/CLAUDE-cartella.md`, and the prompt block in `kit/primo-workspace/LEGGIMI.md` is a copy of the one in `inizia/prompt-di-setup.md`. Change each pair together; the check script compares both. Two more copies it cannot compare: the global template repeats three org rules in the org block's exact words, and the Cowork folder line is quoted on several pages. `grep -rn` before you change either. The memory model lives in `guide/memoria.md`; other pages link to it and don't restate it. When you change a fact, find every page that states it (`grep -rn`) and fix or remove the duplicate.
3. **Unverified platform claims.** Claude products change monthly. Every claim about where a file loads, which mode reads what, a UI path or a command must come from official docs (code.claude.com, support.claude.com) or from the Indeck MCP's own behaviour. Cite the URL in the page when the reader benefits. If you can't verify it, write a check the reader can run, or leave it out. Never invent a UI label, settings key or flag. Validate the managed-settings JSON against the schema the claude.ai editor uses (`https://json.schemastore.org/claude-code-settings.json`): a key the docs describe can still be typed differently there, and the editor then shows an error.
4. **Writing for engineers when the reader is a PM.** Outside the technical tracks (`engineering/`, `secondo-cervello/obsidian/`), assume the reader has never opened a terminal. Give click paths, not commands, and Windows first. One instruction per sentence.

## Writing rules

- Short sentences, active voice, concrete words (ASD-STE100 spirit). No hype, no emoji headings, no badges.
- Budgets (enforced by `scripts/check.mjs`): global CLAUDE.md template ≤ 60 lines; folder template ≤ 80 lines; org instructions block ≤ 3,000 characters; Indeck server-instructions block ≤ 2,000 characters; README ≤ 120 lines; any other page ≤ 250 lines, except the agent-facing specs listed in the script.
- UI labels on Italian pages: the Italian label first, the official English label in parentheses at its first mention on each page, then Italian only. Example: «Personalizza → Connettori (Customize → Connectors)». If you cannot verify a label, describe the place. English text that Claude shows to the person keeps the same form, because the person's app may be in Italian.
- Model-facing text (templates, prompts, org instructions, specs) is code. Don't use capitals or "IMPORTANT" for emphasis. Say the rule once, calmly, with its reason. Name tools by their bare MCP name (`whoami`, `memory_read`), never by a client prefix.
- When a documented fact changes, rewrite the text that states it. Don't append a second account of the new behaviour.
- Don't commit plans, research notes or agent scratch files. A merged PR is the record.

## Verify before you push

1. `node scripts/check.mjs`. It must exit 0.
2. Read every page you changed as its target reader: a PM on Windows in the desktop app. Would they know what to click next?
3. For a change to `inizia/` or `kit/`, run the setup on a clean user profile, or state in the PR that you could not.
4. For a change to the org instructions, paste the block into a new chat and test three requests: one company question, one client task, one request that must not trigger Indeck. Report what happened.

## Pull requests

- Open a PR only when the maintainer asks.
- Title: conventional and in plain language, e.g. `docs(inizia): explain how to switch to the Intarget organisation`.
- Body: the problem in one or two sentences, then how you fixed it, then what you checked and what you could not check. End with the model and harness that did the work.
