# AGENTS.md

Instructions for any agent (Claude Code, Codex, others) that edits this repository. `CLAUDE.md` imports this file.

## What this repo is

ai-kit is Intarget's public kit for working with Claude connected to Indeck, Intarget's internal AI platform (shared memory, skills, agent briefs). The readers are the people of an Italian digital agency. Most are not engineers, most use Windows, and most work in the Claude desktop app. A few engineers use the `engineering/` track. Claude itself reads these files too: the setup prompt and the templates run inside Claude.

`kit/primo-workspace/CLAUDE.md` and `inizia/modelli/` are templates for the reader's folders, not instructions for you. If Claude Code loads one while you edit it, do not follow it.

People-facing files are in Italian. `engineering/`, this file, `CONTRIBUTING.md` and the scripts are in English.

## A note from the maintainer

I want simple systems that feel obvious and are correct. Every page must earn its place: if a reader would not miss a sentence, delete it. Don't keep complexity because it already exists, and don't add machinery because it looks serious. A short page that is true beats a long page that is mostly true. These are defaults, not laws. If a rule here fights the task in front of you, say so loudly and get a human sign-off before you break it.

— Simone Bova

## Words

- **you**: the agent reading this file. **maintainer**: Simone Bova. **reader**: the Intarget person the page is for.
- **Indeck**: Intarget's AI platform. **MCP di Indeck**: its connector at `https://mcp.intarget.net/mcp`.
- **CORE**: the `CORE.md` index file at the root of each Indeck memory scope (personal, project, workspace).
- **Chat / Cowork / Code**: the three modes of the Claude desktop app. **Claude Code**: the coding agent (CLI, IDE, desktop Code tab).

## The four ways to hurt this repo

1. **Leaking.** This repo is public, and git history is forever. Never write names of colleagues or client people, client or brand names, costs, budgets, seat or people counts, Indeck internals (source paths, databases, auth, cloud project names), workspace or project IDs, incidents, contract or HR content, or anything from internal meetings. Simone Bova as maintainer is the only person named. `node scripts/check.mjs` catches common shapes. It is a seatbelt, not a guarantee: you are the control. When in doubt, leave it out.
2. **Drifting copies.** Each fact has one home. The org instructions live once, in `org/rendering/claude-ai.md`; `claude-code-managed-settings.json` carries a copy. `kit/primo-workspace/CLAUDE.md` is a copy of `inizia/modelli/CLAUDE-cartella.md`, and the prompt block in `kit/primo-workspace/LEGGIMI.md` is a copy of the one in `inizia/prompt-di-setup.md`. Change each pair together; the check script compares all three. The memory model lives in `guide/memoria.md`; other pages link to it and don't restate it. When you change a fact, find every page that states it (`grep -rn`) and fix or remove the duplicate.
3. **Unverified platform claims.** Claude products change monthly. Every claim about where a file loads, which mode reads what, a UI path or a command must come from official docs (code.claude.com, support.claude.com) or from the Indeck MCP's own behaviour. Cite the URL in the page when the reader benefits. If you can't verify it, write a check the reader can run, or leave it out. Never invent a UI label.
4. **Writing for engineers when the reader is a PM.** Outside `engineering/`, assume the reader has never opened a terminal. Give click paths, not commands, and Windows first. One instruction per sentence.

## Writing rules

- Short sentences, active voice, concrete words (ASD-STE100 spirit). No hype, no emoji headings, no badges.
- Budgets (enforced by `scripts/check.mjs`): global CLAUDE.md template ≤ 60 lines; folder template ≤ 80 lines; org instructions block ≤ 3,000 characters; Indeck server-instructions block ≤ 2,000 characters; README ≤ 120 lines; guides ≤ 250 lines.
- UI labels on Italian pages: the Italian label first, the official English label in parentheses at its first mention on each page, then Italian only. Example: «Personalizza → Connettori (Customize → Connectors)». If you cannot verify a label, describe the place.
- Model-facing text (templates, setup prompt, org instructions) is code. Don't use capitals or "IMPORTANT" for emphasis. Say the rule once, calmly, with its reason. Name tools by their bare MCP name (`whoami`, `memory_read`), never by a client prefix.
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
