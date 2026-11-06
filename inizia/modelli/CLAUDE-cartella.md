<!--
Modello del CLAUDE.md di una cartella di lavoro. inizia/modelli/CLAUDE-cartella.md e kit/primo-workspace/CLAUDE.md sono identici: cambiali insieme.
Lo compila il prompt di setup (inizia/prompt-di-setup.md). Una cartella serve un solo workspace o progetto Indeck, oppure solo il tuo scope personale.
Qui va solo ciò che vale per questa cartella. Chi sei e come lavori sta nel CLAUDE.md globale e nel tuo CORE.
Il testo è in inglese perché lo legge Claude; ti risponde nella lingua scritta nel CLAUDE.md globale. I nomi di file e cartelle restano in italiano.
I segnaposto «…» contengono un esempio: sostituiscilo. I commenti HTML non arrivano a Claude. Massimo 80 righe.
-->
# «Folder name»

## What this folder is for
«One or two sentences: what work happens here, for which client, area or team, and who the result is for.»

## Indeck
- Workspace: «name» («id»), or: none
- Project: «name» («id»), or: none
If both are none, this folder uses only my personal scope.
At the start of work here, after my personal CORE, read the CORE.md of these spaces.
My personal CORE is for my profile and preferences. For the facts of this work, search only the spaces named here (my personal scope, if there are none) and name them in memory_search.
Before you cite a result, read its source with memory_read.
If a space does not appear in whoami or cannot be read, ask me to check it. Do not try other ids, do not use spaces with similar names and do not widen the search to other clients.

## Folder map
- `CLAUDE.md`: this file. Stable instructions for the folder.
- `STATO.md`: the work in progress. Read it at the start of the session.
- `input/`: files to process (exports, Excel, CSV, PDF, transcripts). Do not modify the originals: work on copies.
- `lavori/YYYY-MM-topic/`: one subfolder per piece of work, with calculations, drafts and results. Example: `lavori/2026-11-report-mensile/`.

## How we work here
- Acquire only the data the task needs. Save the exports you use in `input/`, then work from the file.
- Process with code every record in the agreed scope. Report source, period, filters, pages fetched, rows included and excluded; flag missing or truncated data.
- Reconcile totals with the source, using the same filters. If they do not match, quantify the difference and do not call the result verified.
- Final deliverable: «format, for example Excel or a presentation», named «YYYY-MM-DD-topic».
- Corrections that apply to this folder live in the "Corrections" section. It is the only place for them.

## Corrections
<!-- Una riga per ogni correzione che hai dato due volte. Oltre le dieci righe, riscrivile in poche regole. -->
- «None yet.»

## Done when
- «Monthly report»: «totals reconcile with the export; every change above 10% has a documented cause or is marked "da verificare"; the file is in lavori/».
- «Analysis»: «every record in scope processed, with rows included and excluded; every number has its source; hypotheses kept apart from facts».
- «Text for the client»: «draft ready for a person to review; nothing sent».

## End of session
When I say «chiudiamo» (or "wrap up"):
1. rewrite `STATO.md` with today's state and the date (YYYY-MM-DD), at most 40 lines;
2. propose in one message what to save in Indeck and in which space;
3. write after I say yes, or within an explicit authorisation I already gave; then tell me what was applied and what was not.
