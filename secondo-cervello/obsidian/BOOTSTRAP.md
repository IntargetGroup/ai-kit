# Prompt per costruire il vault

Copia il blocco «Build» in Claude Code, aperto nella cartella vuota del vault. Prerequisiti e cosa aspettarti: [completo.md](../completo.md).

## Build

```text
Build my personal knowledge vault in this folder, following the spec at
https://raw.githubusercontent.com/IntargetGroup/ai-kit/main/secondo-cervello/obsidian/SPEC.md

Talk to me in Italian. I am not necessarily an engineer: explain each checkpoint in plain words.

1. Check this folder: it must be empty, and it must not be inside OneDrive, iCloud Drive, Google Drive or Dropbox. If a check fails, stop and tell me.
2. Download the spec with curl to docs/SPEC.md. Download the exact file; do not use a web-fetch tool, which can summarise. Read the whole spec before you do anything else.
3. Summarise the build plan back to me in at most 10 lines, then wait until I say «procedi» (or "proceed").
4. Run spec section 12, phase by phase. Phase 1 (the survival kit: git, docs/SPEC.md, agent-memory/NOW.md, the stub AGENTS.md, CLAUDE.md) comes before anything else, so that a compaction or a new session can resume from disk.
5. Stop and wait for me at the checkpoints the spec names: after the interview, before you write .claude/settings.json, during the first ingestion. Between checkpoints, work without asking for approval of routine steps.

Rules for the whole build:
- Never invent facts about me. If I skip a question, leave a visible TODO in the file and an open thread in NOW.md.
- Client or company material never enters this vault. Secrets never enter it or L1.
- Before you mark a phase done, verify on disk (ls, git status, read the file back) and update the In progress section of NOW.md. Then commit with the spec's message format.
- Read lint.mjs in full before you run it, and tell me what it does.
- Install nothing the spec does not name. Ask before any destructive command.
- If one step blocks you for 30 minutes, follow the stall rule in the spec and move on.
- At the end, show me the "Done when" list from section 12 with the evidence for each item.
```

## Resume

Se la sessione si interrompe durante la costruzione, apri una sessione nuova nella stessa cartella e incolla:

```text
Resume the vault build. Read agent-memory/NOW.md and docs/SPEC.md section 12. Check git log -10 --oneline and git status. If NOW.md and git disagree, trust git and rewrite NOW.md. Tell me in Italian, in at most 5 lines, where the build stopped and what comes next, then continue from there.
```
