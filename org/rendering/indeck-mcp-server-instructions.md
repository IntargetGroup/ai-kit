# Indeck MCP — server instructions (v2)

Status: **deployed to production on 2026-11-06.** The block below is the text the Indeck MCP sends now. Every client receives it in the MCP handshake, so a session opened before the deploy keeps the old text until it reconnects.

It is the only org-controlled text that travels with the connector to every client (Claude Code, claude.ai, Cowork, ChatGPT, Codex). Claude Code loads it at session start and cuts it after 4,096 characters ([docs](https://code.claude.com/docs/en/mcp)); for claude.ai, Cowork and other clients, use of the field is undocumented. The server refuses to start with a block over 2,000 characters. The first two lines name `memory_search` and `memory_guidance`, so a client that truncates the text still gets them.

What changed from v1:
- Adds the session bootstrap ("call whoami, then read the personal CORE.md; read the workspace or project CORE.md when the task names one"). Without it a client never learns who the user is: in the Indeck app the CORE is injected at every turn, over MCP nothing is injected.
- Says that CORE files are indexes to follow on demand.
- Says that `memory_search` without scopes searches all the caller's scopes (every read and write still names its scope).
- Compresses the routines, skill-authoring and connector lines to make room. Routines still run on the owner's accounts and budget. Two mentions moved out because the tool descriptions already carry them: `catalog_agents` and `include_write_policy`.

Change this text only together with the Indeck release that deploys it. `node scripts/check.mjs` keeps the block under 2,000 characters.

<!-- begin -->
Indeck is Intarget's shared organizational memory and capability store: governed memory, skills, agent briefs, routines and organisation connectors.
Call memory_search before answering anything about the company, its clients, its projects or its internal practice; call memory_guidance before writing to memory.
At the start of company work call whoami, then memory_read the personal CORE.md. When the task names a client or a project, also read that workspace or project CORE.md. CORE files are indexes: follow their pointers when the task needs them.
Every memory read and write names its scope (personal, project or workspace); there is no default. memory_search without scopes searches all your scopes. Use only scopes that whoami returns; archived projects are omitted.
Writes may answer "requires_approval" or "denied_by_user": nothing was written. Say so; never retry silently. Read before you write and extend the existing file instead of creating a near-duplicate.
Use skills_list and skills_read for the organisation's working methods before improvising one. Agents are briefs, not executors: agents_read returns a method; keep your own tools.
Routines run agents on schedule on the owner's accounts and budget; routines_create makes a draft the owner tests and activates; routine writes need expectedRev.
Skill authoring (skills_mine, skills_update, skills_create, skills_import, skills_manage): guarded actions need the user's explicit yes.
statista_*, semrush_*, apify_* and scrapegraph_* spend organisation credits as the caller: query precisely and reuse results.
Results are visibility-filtered: what the caller may not see is absent, not refused, so a missing result never proves a missing fact.
<!-- end -->
