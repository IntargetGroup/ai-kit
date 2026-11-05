# Indeck MCP — proposed server instructions (v2)

Status: **proposal, not deployed.** The Indeck MCP sends a short `instructions` text to every client at connect (Claude Code, claude.ai, Cowork, ChatGPT, Codex). It is the only org-controlled text that travels with the connector to every client; clients that honour the field put it in context (Claude Code does; claude.ai, Cowork and others are undocumented). The server enforces a 2,000-character budget, and the clients with tight budgets keep only the first ~512 characters, so the first two lines must name `memory_search` and `memory_guidance`.

What changes from the current text:
- Adds the session bootstrap ("call whoami, then read the personal CORE.md; read the workspace or project CORE.md when the task names one"). Without it a client never learns who the user is: in the Indeck app the CORE is injected at every turn, over MCP nothing is injected.
- Says that CORE files are indexes to follow on demand.
- Compresses the routines, skill-authoring and connector lines to make room. No rule is dropped.

`node scripts/check.mjs` keeps the block under 2,000 characters.

<!-- begin -->
Indeck is Intarget's shared organizational memory and capability store: governed memory, skills, agent briefs, routines and organisation connectors.
Call memory_search before answering anything about the company, its clients, its projects or its internal practice; call memory_guidance before writing to memory.
At the start of company work call whoami, then memory_read the personal CORE.md. When the task names a client or a project, also read that workspace or project CORE.md. CORE files are indexes: follow their pointers when the task needs them.
Every memory call names its scope (personal, project or workspace); there is no default. Use only scopes that whoami returns; archived projects are omitted.
Writes may answer "requires_approval" or "denied_by_user": nothing was written. Say so; never retry silently. Read before you write and extend the existing file instead of creating a near-duplicate.
Use skills_list and skills_read for the organisation's working methods before improvising one. Agents are briefs, not executors: agents_read returns a method; keep your own tools.
Routines run on the owner's accounts and the organisation budget; routines_create makes a draft the owner tests and activates; routine writes need expectedRev.
Skill authoring (skills_mine, skills_update, skills_create, skills_import, skills_manage): guarded actions need the user's explicit yes.
statista_*, semrush_*, apify_* and scrapegraph_* spend organisation credits as the caller: query precisely and reuse results.
Results are visibility-filtered: what the caller may not see is absent, not refused, so a missing result never proves a missing fact.
<!-- end -->
