# Prompt di setup

Con questo prompt Claude si configura da solo. Ci vogliono circa 10 minuti. Claude:

- controlla il collegamento a Indeck e legge il tuo CORE personale;
- ti fa sette domande, con le risposte già proposte dal tuo CORE;
- scrive il tuo CLAUDE.md globale e ti dà lo stesso testo per Chat e Cowork;
- compila il CLAUDE.md della cartella con il workspace e il progetto Indeck, se ci sono;
- ti propone di aggiornare le preferenze nel tuo CORE;
- ti dà un resoconto con le prove e quello che resta da fare a te.

Claude chiede il tuo sì prima di modificare un file che esiste già, di scrivere fuori dalla cartella e di scrivere in Indeck.

## Come usarlo

Prima completa i passi 1–4 di [inizia/README.md](README.md).

1. Nell'app desktop apri la scheda Code (Code tab) e scegli la tua cartella di lavoro: `C:\Users\<nome>\Lavoro-Claude` (su macOS `~/Lavoro-Claude`).
2. Passa il mouse sul blocco qui sotto e clicca il pulsante di copia, in alto a destra.
3. Incolla nella casella del messaggio e invia.
4. Rispondi alle domande. Quando Claude ti mostra cosa vuole scrivere, leggi e rispondi sì o no.

Dovresti vedere: dopo pochi secondi Claude ti dice nome, email e workspace che vede in Indeck.

Usa la scheda Code. Cowork non può scrivere il CLAUDE.md globale, che sta fuori dalla cartella: lì Claude salta il file e ti dà comunque il testo per le impostazioni.

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

## Dopo il setup

Segui i passi 8 e 9 di [inizia/README.md](README.md#5-esegui-il-prompt-di-setup-nella-scheda-code), poi le [prove finali](README.md#6-prove-finali). Se il resoconto ha una riga «non ok», cerca il sintomo in [Se qualcosa non va](README.md#se-qualcosa-non-va).
