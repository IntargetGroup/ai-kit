# Primo workspace

Questa è la tua cartella di lavoro con Claude. Nella scheda Code Claude legge `CLAUDE.md` all'inizio di ogni sessione; in Cowork lo legge grazie alla riga nelle istruzioni della cartella.

| File | A cosa serve |
|---|---|
| `CLAUDE.md` | Istruzioni per Claude su questa cartella: a cosa serve, quale workspace e progetto Indeck, quando un lavoro è finito. Lo compila il prompt di setup. |
| `STATO.md` | Il lavoro in corso. Claude lo riscrive quando scrivi «chiudiamo». |
| `input/` | I file da elaborare: export, Excel, CSV, PDF, trascrizioni. |
| `lavori/` | Una sottocartella per ogni lavoro. |
| `LEGGIMI.md` | Questo file. Claude non lo usa. |

## Prima di iniziare

Claude deve essere collegato a Indeck. Se non l'hai ancora fatto, segui i passi 1–3 di [Inizia qui](https://github.com/IntargetGroup/ai-kit/blob/main/inizia/README.md) nel kit ai-kit.

Dovresti vedere: in una chat nuova, `Chiama whoami di Indeck e dimmi chi sono` risponde con la tua email Intarget.

## 1. Metti la cartella al suo posto

Se hai ricevuto il kit come file zip, prima estrailo: clic destro sul file, poi «Estrai tutto».

Su Windows:

1. Apri Esplora file.
2. Nella barra dell'indirizzo scrivi `%USERPROFILE%` e premi Invio. Ora sei in `C:\Users\<nome>`.
3. Crea una cartella nuova e chiamala `Lavoro-Claude`.
4. Copia dentro il contenuto di questa cartella: `CLAUDE.md`, `STATO.md`, `LEGGIMI.md`, `input` e `lavori`.

Su macOS: nel Finder premi Maiusc+Cmd+H, crea una cartella `Lavoro-Claude` e copia dentro gli stessi file.

- Non mettere la cartella in OneDrive, iCloud o Google Drive.
- Non spostarla e non rinominarla dopo: Claude lega al percorso le note che prende sulla cartella.
- Non confonderla con `C:\Users\<nome>\.claude`, con il punto: è la cartella delle impostazioni di Claude.

Dovresti vedere: il file `C:\Users\<nome>\Lavoro-Claude\CLAUDE.md` (su macOS `~/Lavoro-Claude/CLAUDE.md`).

## 2. Aprila nella scheda Code

1. Nell'app desktop apri la scheda Code (Code tab). Il nome inganna: lavora su qualsiasi file, non solo sul codice.
2. Nel selettore dell'ambiente lascia la sessione sul tuo computer, non nel cloud.
3. Clicca il controllo della cartella di progetto, accanto al selettore dell'ambiente, e scegli la cartella `Lavoro-Claude`.
4. Scegli la modalità dei permessi Auto. Se non c'è, scegli Accept edits.

Dovresti vedere: la cartella `Lavoro-Claude` scelta come cartella di progetto.

## 3. Esegui il prompt di setup

Copia il blocco qui sotto, incollalo nella casella del messaggio e invia. Il prompt è in inglese perché lo legge Claude; Claude ti parla in italiano. Rispondi alle domande. Claude chiede il tuo sì prima di modificare un file che esiste già, di scrivere fuori dalla cartella e di scrivere in Indeck.

<!-- Copia di inizia/prompt-di-setup.md: i due blocchi devono restare identici. -->
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

Alla fine Claude ti dà un testo e una riga da incollare:

1. il testo va in Impostazioni → Istruzioni per Claude (Settings → Instructions for Claude): clicca le tue iniziali in basso a sinistra per aprire le impostazioni. Chat e Cowork leggono le impostazioni, non il file;
2. la riga va nelle istruzioni della cartella di Cowork: in Cowork seleziona la cartella `Lavoro-Claude` e apri il pannello Personalizza (Customize).

Dovresti vedere: il resoconto di Claude con ogni verifica «ok», oppure con quello che resta da fare a te.

## 4. Controlla

In una sessione nuova della scheda Code, nella cartella `Lavoro-Claude`:

1. `/context` mostra il CLAUDE.md globale e il CLAUDE.md di questa cartella. Se l'elenco dei file non compare, chiedi: `Quali file di istruzioni hai caricato in questa sessione?`
2. `Chi sono e su cosa sto lavorando?` riceve una risposta presa dal tuo CORE di Indeck e da `STATO.md`, senza fatti inventati.
3. `Ricordati che preferisco le tabelle ai paragrafi.` fa proporre a Claude le Preferences del tuo CORE di Indeck, e Claude chiede il tuo sì prima di scrivere.

Tutte le prove e cosa fare se una non passa: [Inizia qui, passo 6](https://github.com/IntargetGroup/ai-kit/blob/main/inizia/README.md#6-prove-finali).

## Ogni giorno

1. Apri la cartella `Lavoro-Claude` nella scheda Code o in Cowork.
2. Metti in `input/` i file da elaborare.
3. Scrivi tre righe: Obiettivo (il risultato completo, per chi e per cosa), Fatto quando (un controllo verificabile: «mostrami l'esito»), Limiti (cosa può fare Claude e cosa richiede il tuo sì). Metodo ed esempi: [Chiedere in grande](https://github.com/IntargetGroup/ai-kit/blob/main/guide/chiedere-in-grande.md).
4. A fine lavoro scrivi `chiudiamo`. Claude riscrive `STATO.md` e ti propone cosa salvare in Indeck.
