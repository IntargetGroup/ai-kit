# Changelog

Changes that alter what a reader does, newest first.

## 2026-11-06 — English for Claude, technical tracks back

### Changed

- Everything Claude reads as instructions is now English: the two CLAUDE.md templates, `STATO.md`, the setup prompt, the Cowork folder line, the chat-export prompt and the organisation instructions (block and `claudeMd`). Models follow English instructions more reliably; Claude still answers in Italian. Pages for people stay Italian. If your global CLAUDE.md is the Italian v2 text, run the [setup prompt](inizia/prompt-di-setup.md) again: it proposes the merge and overwrites nothing.
- Organisation managed settings for Claude Code: `managedMcpServers` is removed. The claude.ai editor validates against a schema that types it differently from Claude Code, so it showed an error, and the organisation connector already brings Indeck to Claude Code. `permissions.deny` now also covers the Windows gcloud credentials folder. Admins: replace the published JSON with [the new one](org/rendering/claude-code-managed-settings.json) and the organisation instructions with [the new block](org/rendering/claude-ai.md).
- The Indeck MCP server instructions v2 (CORE bootstrap) are in production since 2026-11-06.

### Added

- [secondo-cervello/obsidian/](secondo-cervello/obsidian/SPEC.md): the full vault track, optional — the spec Claude Code executes, the build prompt and a dependency-free lint script. Obsidian is a viewer, not a requirement.
- [engineering/knowledge-management-spec.md](engineering/knowledge-management-spec.md) and [engineering/BOOTSTRAP.md](engineering/BOOTSTRAP.md): agent state, decisions, plans and long runs on a codebase, with a paste-in installer.
- [guide/presentazione.pdf](guide/presentazione.pdf): the kit in 20 slides, in Italian.
- [engineering/patterns.md](engineering/patterns.md), [multi-model-orchestration.md](engineering/multi-model-orchestration.md), [skills.md](engineering/skills.md); [tool-orchestration.md](engineering/tool-orchestration.md) regains its depth.

### Removed

- `engineering/repo-harness.md`: merged into the knowledge-management spec.

## 2026-11-05 — v2

The kit is rewritten from scratch. Links to v1 files no longer work. If you have a v1 clone, delete it and clone again.

### Added

- [inizia/](inizia/README.md): setup in 10–15 minutes in the desktop app, Windows first, with a check after each step. A paste-in prompt lets Claude set itself up: global CLAUDE.md (merged, never overwritten), Indeck check, personal CORE, first working folder.
- [guide/](guide/): one page each on why context matters, the memory map, the Indeck MCP, asking wide, connecting sources, and Chat vs Cowork vs Code tab.
- [org/](org/README.md): one canonical set of organisation instructions, with copies for admins to paste into claude.ai and into Claude Code managed settings.
- [kit/primo-workspace/](kit/primo-workspace/LEGGIMI.md): a starter working folder (`Lavoro-Claude`).
- [secondo-cervello/](secondo-cervello/README.md): a light variant (one folder plus Indeck, the default) and the full Obsidian vault pattern.
- [engineering/](engineering/README.md): per-repo AGENTS.md practice, a bounded agent-memory harness, the reference stack.
- [scripts/check.mjs](scripts/check.mjs) and CI: size budgets, copies kept identical, internal links (exact checks only), secret scan.

### Changed

- At the start of company work Claude now reads your Indeck CORE through the MCP of Indeck. Over MCP nothing is loaded for you.
- The MCP of Indeck lives at `https://mcp.intarget.net/mcp`. If you added Indeck yourself before November 2026, remove that connector and use the organisation's one, or add it again with this address. Disconnecting and connecting again does not change the address. To check, ask Claude: «Chiama whoami di Indeck e dimmi chi sono».

### Removed

- The onboarding PDF, the long memory and vault specs and the tech-stack examples. Their useful content moved into `guide/`, `secondo-cervello/` and `engineering/`.
- Obsidian, hooks and git are no longer needed to start. The full vault stays available as an option.
