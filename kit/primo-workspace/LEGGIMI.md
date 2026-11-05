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

Copia il blocco qui sotto, incollalo nella casella del messaggio e invia. Rispondi alle domande. Claude chiede il tuo sì prima di modificare un file che esiste già, di scrivere fuori dalla cartella e di scrivere in Indeck.

<!-- Copia di inizia/prompt-di-setup.md: i due blocchi devono restare identici. -->
```text
Configura Claude per lavorare con me, collegato a Indeck. Segui i passi in ordine. A ogni passo dimmi in poche righe cosa hai fatto.
Puoi creare file nuovi in questa cartella senza chiedere. Prima di modificare un file che esiste già, di scrivere fuori da questa cartella o di scrivere in Indeck, mostrami cosa scrivi e dove, e aspetta il mio sì.
Scarica i file del kit solo dagli indirizzi esatti scritti qui. Non ricostruirli a memoria.

1. Indeck. Chiama whoami. Dimmi il mio nome, la mia email e i nomi dei workspace che vedo. Per i progetti basta il numero. Se whoami non c'è o non risponde, fermati e dimmi di collegare Indeck (inizia/README.md, passo 2).

2. Il mio CORE. Leggi CORE.md nello scope personal con memory_read. Riassumi in cinque righe cosa dice di me. Se la riga «Ultimo aggiornamento» manca o ha più di 30 giorni, dimmelo. Se il CORE è vuoto o la memoria personale è disattivata, dimmelo e continua.

3. Le domande. Fammi queste domande in un solo messaggio. Per ognuna proponi una risposta presa dal CORE, quando c'è, così posso solo confermare. Le prime cinque servono al file globale, le ultime due alla cartella.
   a. In che lingua vuoi le risposte?
   b. Che formato e che tono preferisci? Per esempio: prima la risposta, poi i dettagli; tabelle per i confronti; diretto.
   c. Che lavoro fai di solito con Claude?
   d. Cosa non devo mai fare senza chiederti, oltre a inviare, pubblicare, cancellare e spendere crediti?
   e. Come vuoi i numeri? Per esempio: fonte, periodo, arrotondamenti, formato.
   f. A cosa serve questa cartella? Per quale workspace e quale progetto Indeck? Elenca i workspace di whoami. Possono mancare tutti e due: allora la cartella usa solo il mio scope personale.
   g. Quali sono due o tre lavori tipici di questa cartella, e quando ognuno è finito?

4. Il CLAUDE.md globale.
   - Ricava tu il sistema operativo e la cartella utente. Il file è nella cartella utente, in .claude/CLAUDE.md: su Windows %USERPROFILE%\.claude\CLAUDE.md, su macOS ~/.claude/CLAUDE.md.
   - Scarica il modello così com'è, senza riassumerlo: https://raw.githubusercontent.com/IntargetGroup/ai-kit/main/inizia/modelli/CLAUDE-globale.md. Se il download fallisce, fermati e dimmi di aprire https://github.com/IntargetGroup/ai-kit/blob/main/inizia/modelli/CLAUDE-globale.md, cliccare «Raw», copiare tutto e incollartelo.
   - Compila i segnaposto «…» con il CORE e con le risposte da a a e. Togli i commenti <!-- … --> e le righe rimaste senza contenuto. Resta sotto le 60 righe. Non aggiungere regole che il modello non ha.
   - Se il file esiste già, non sovrascriverlo. Proponimi l'unione: cosa tieni, cosa aggiungi, cosa togli perché ripete il CORE o il modello. Scrivi dopo il mio sì.
   - Se non puoi scrivere fuori da questa cartella, come succede in Cowork, non scrivere il file. Dimmi che serve solo alla scheda Code e che lo creeremo da lì.

5. Lo stesso testo per Chat e Cowork. Chat e Cowork non leggono quel file: leggono le impostazioni. Mostrami il testo finale del passo 4 in un solo blocco da copiare. Dimmi dove va: clicco le mie iniziali in basso a sinistra, poi Impostazioni → Istruzioni per Claude (Settings → Instructions for Claude). Chiedimi se in quel campo c'è già un testo. Se sì, chiedimi di incollartelo e proponimi l'unione.

6. La cartella.
   - Per ogni file mancante tra CLAUDE.md, STATO.md, LEGGIMI.md, input/LEGGIMI.md e lavori/LEGGIMI.md, aggiungi il suo percorso a https://raw.githubusercontent.com/IntargetGroup/ai-kit/main/kit/primo-workspace/ e scarica il file originale. Non sostituire i file che ci sono già. Se un download fallisce, elenca i file mancanti e chiedimi il kit prima di crearli.
   - Se CLAUDE.md è il modello vuoto, compilalo con le risposte f e g. Se è già compilato, tienilo e proponimi solo le modifiche.
   - Per workspace e progetto scrivi nome e id esatti di whoami. Se un nome è ambiguo, chiedimi quale. Se non ce n'è nessuno, scrivi «nessuno» e non cercarne uno.
   - Leggi il CORE.md degli spazi confermati. Dimmi in tre righe cosa contengono e la data che dichiarano, oppure «data non disponibile».
   - Se STATO.md è nuovo, togli i segnaposto: scrivi «Nessun lavoro avviato», «Nessun blocco noto» e, come prossimo passo, il primo lavoro concordato, se c'è. Se STATO.md esiste già, leggilo e proponi un aggiornamento solo se il contenuto cambia. Scrivi la data (AAAA-MM-GG) solo insieme al contenuto.

7. Cowork. Dammi questa riga da incollare nelle istruzioni della cartella di Cowork: «All'inizio di ogni attività leggi CLAUDE.md e STATO.md in questa cartella e seguili.» Dimmi dove va: in Cowork seleziono questa cartella, poi apro il pannello Personalizza (Customize) e le istruzioni della cartella.

8. Le preferenze nel CORE. La sezione Preferences del mio CORE personale è la fonte delle mie preferenze: la legge anche l'app Indeck. La sezione «Come lavoro» del file globale ne è la copia di ripiego. Confronta le risposte a, b ed e con Preferences e proponi le righe da aggiungere o correggere. Non ripetere quello che c'è già. Se dico sì, leggi memory_guidance e segui le sue regole. Modifica solo la sezione Preferences e la riga «Ultimo aggiornamento». Poi rileggi il file e dimmi cosa è cambiato. Se la scrittura risponde requires_approval o denied_by_user, dimmi che non è stato scritto nulla. Se la connessione a Indeck è in sola lettura, dammi il testo da aggiungere io dall'app Indeck.

9. Il resoconto. Fai una tabella con tre colonne: verifica, esito (ok, non ok, resta a me), prova.
   - whoami risponde con la mia email
   - CORE personale letto, con la data di aggiornamento
   - CLAUDE.md globale scritto: percorso e numero di righe
   - testo per le Istruzioni per Claude consegnato
   - CLAUDE.md della cartella compilato: workspace e progetto con nome e id, oppure «solo scope personale»
   - CORE degli spazi letti, con la data
   - riga per Cowork consegnata
   - preferenze nel CORE: aggiornate, non richieste o non scritte, con il motivo
   - istruzioni aziendali Intarget osservate nel contesto: sì o no. Non è una prova che siano distribuite. Un «no» non è un errore del setup: le regole essenziali sono nel CLAUDE.md globale.
   Poi elenca cosa resta da fare a me: incollare il testo nelle Istruzioni per Claude, incollare la riga in Cowork se lo uso, aprire una sessione nuova e fare le prove finali (inizia/README.md, passo 6).
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
