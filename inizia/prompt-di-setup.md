# Prompt di setup

Con questo prompt Claude si configura da solo. Ci vogliono circa 10 minuti. Claude:

- controlla il collegamento a Indeck e legge il tuo CORE personale;
- ti fa sette domande, con le risposte già proposte dal tuo CORE;
- scrive il tuo CLAUDE.md globale e ti dà lo stesso testo per Chat e Cowork;
- compila il CLAUDE.md della cartella con il workspace e il progetto Indeck, se ci sono;
- ti propone di aggiornare le preferenze nel tuo CORE;
- ti dà un resoconto con le prove e quello che resta da fare a te.

Claude chiede il tuo sì prima di modificare un file che esiste già, di scrivere fuori dalla cartella e di scrivere in Indeck.

Il prompt è in inglese, come i file che Claude compila (i due CLAUDE.md e `STATO.md`): sono istruzioni per Claude, che le segue meglio in inglese ([perché](../org/istruzioni.md#come-è-scritto)). Claude ti parla in italiano.

## Come usarlo

Prima completa i passi 1–4 di [inizia/README.md](README.md).

1. Nell'app desktop apri la scheda Code (Code tab) e scegli la tua cartella di lavoro: `C:\Users\<nome>\Lavoro-Claude` (su macOS `~/Lavoro-Claude`).
2. Passa il mouse sul blocco qui sotto e clicca il pulsante di copia, in alto a destra.
3. Incolla nella casella del messaggio e invia.
4. Rispondi alle domande. Quando Claude ti mostra cosa vuole scrivere, leggi e rispondi sì o no.

Dovresti vedere: dopo pochi secondi Claude ti dice nome, email e workspace che vede in Indeck.

Usa la scheda Code. Cowork non può scrivere il CLAUDE.md globale, che sta fuori dalla cartella: lì Claude salta il file e ti dà comunque il testo per le impostazioni.

```text
Set up Claude to work with me, connected to Indeck. Talk to me in Italian. Follow the steps in order. After each step, tell me in a few lines what you did.
You may create new files in this folder without asking. Before you modify a file that already exists, write outside this folder or write to Indeck, show me what you will write and where, and wait for my yes.
Download the kit files only from the exact addresses written here. Do not rebuild them from memory. The templates (CLAUDE.md, STATO.md) are in English because they are instructions for Claude: keep them in English when you fill them in.

1. Indeck. Call whoami. Tell me my name, my email and the names of the workspaces I can see. For projects, the count is enough. If whoami is missing or does not answer, stop and tell me to connect Indeck (inizia/README.md, step 2).

2. My CORE. Read CORE.md in the personal scope with memory_read. Summarise in five lines what it says about me. If the «Ultimo aggiornamento» line is missing or older than 30 days, tell me. If the CORE is empty or personal memory is turned off, tell me and continue.

3. The questions. Ask me these questions in one message. For each one, propose an answer taken from the CORE, when there is one, so that I can just confirm. The first five are for the global file, the last two for the folder.
   a. In which language do you want answers?
   b. Which format and tone do you prefer? For example: answer first, then details; tables for comparisons; direct.
   c. What work do you usually do with Claude?
   d. What must I never do without asking you, beyond sending, publishing, deleting and spending credits?
   e. How do you want numbers? For example: source, period, rounding, format.
   f. What is this folder for? For which Indeck workspace and which project? List the workspaces from whoami. Both can be missing: then the folder uses only my personal scope.
   g. What are two or three typical pieces of work in this folder, and when is each one done?

4. The global CLAUDE.md.
   - Work out the operating system and the user folder yourself. The file is in the user folder, at .claude/CLAUDE.md: on Windows %USERPROFILE%\.claude\CLAUDE.md, on macOS ~/.claude/CLAUDE.md.
   - Download the template as it is, without summarising it: https://raw.githubusercontent.com/IntargetGroup/ai-kit/main/inizia/modelli/CLAUDE-globale.md. If the download fails, stop and tell me to open https://github.com/IntargetGroup/ai-kit/blob/main/inizia/modelli/CLAUDE-globale.md, click «Raw», copy everything and paste it to you.
   - Fill the «…» placeholders from the CORE and from answers a to e. Remove the <!-- … --> comments and the lines left without content. Stay under 60 lines. Do not add rules that the template does not have.
   - If the file already exists, do not overwrite it. Propose the merge: what you keep, what you add, what you remove because it repeats the CORE or the template. Write after my yes.
   - If you cannot write outside this folder, as in Cowork, do not write the file. Tell me that only the Code tab needs it and that we will create it from there.

5. The same text for Chat and Cowork. Chat and Cowork do not read that file: they read the settings. Show me the final text from step 4 in one block to copy. Tell me where it goes: I click my initials at the bottom left, then Impostazioni → Istruzioni per Claude (Settings → Instructions for Claude). Ask me whether that field already has text. If it does, ask me to paste it to you and propose the merge.

6. The folder.
   - For each missing file among CLAUDE.md, STATO.md, LEGGIMI.md, input/LEGGIMI.md and lavori/LEGGIMI.md, append its path to https://raw.githubusercontent.com/IntargetGroup/ai-kit/main/kit/primo-workspace/ and download the original file. Do not replace files that already exist. If a download fails, list the missing files and ask me for the kit before you create them.
   - If CLAUDE.md is the empty template, fill it in with answers f and g. If it is already filled in, keep it and propose only the changes.
   - For workspace and project, write the exact name and id from whoami. If a name is ambiguous, ask me which one. If there is none, write "none" and do not look for one.
   - Read the CORE.md of the confirmed spaces. Tell me in three lines what they contain and the date they state, or "date not available".
   - If STATO.md is new, remove the placeholders: write "No work started", "No known blockers" and, as the next step, the first agreed piece of work, if there is one. If STATO.md already exists, read it and propose an update only if the content changes. Write the date (YYYY-MM-DD) only together with the content.

7. Cowork. Give me this line, exactly as written and in English, to paste into the Cowork folder instructions: "At the start of every task, read CLAUDE.md and STATO.md in this folder and follow them." Tell me where it goes: in Cowork I select this folder, then open the Personalizza (Customize) panel and the folder instructions.

8. Preferences in the CORE. The Preferences section of my personal CORE is the source of my preferences: the Indeck app reads it too. The "How I work" section of the global file is its fallback copy. Compare answers a, b and e with Preferences and propose the lines to add or correct. Do not repeat what is already there. If I say yes, read memory_guidance and follow its rules. Change only the Preferences section and the «Ultimo aggiornamento» line. Then re-read the file and tell me what changed. If the write returns requires_approval or denied_by_user, tell me that nothing was written. If the Indeck connection is read-only, give me the text to add myself from the Indeck app.

9. The report. Make a table with three columns: check, result ("ok", "non ok" or "resta a me"), evidence.
   - whoami answers with my email
   - personal CORE read, with its update date
   - global CLAUDE.md written: path and line count
   - text for Istruzioni per Claude delivered
   - folder CLAUDE.md filled in: workspace and project with name and id, or "personal scope only"
   - CORE of the spaces read, with the date
   - Cowork line delivered
   - preferences in the CORE: updated, not requested or not written, with the reason
   - Intarget organisation instructions seen in the context: yes or no. This does not prove that they are deployed. A "no" is not a setup error: the essential rules are in the global CLAUDE.md.
   Then list what is left for me to do: paste the text into Istruzioni per Claude, paste the line into Cowork if I use it, open a new session and run the final checks (inizia/README.md, step 6).
```

## Dopo il setup

Segui i passi 8 e 9 di [inizia/README.md](README.md#5-esegui-il-prompt-di-setup-nella-scheda-code), poi le [prove finali](README.md#6-prove-finali). Se il resoconto ha una riga «non ok», cerca il sintomo in [Se qualcosa non va](README.md#se-qualcosa-non-va).
