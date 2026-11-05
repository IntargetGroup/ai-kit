# Inizia qui

Alla fine di questa pagina Claude sa chi sei, su cosa lavori e dove vanno le cose, come l'agente dell'app Indeck.
Servono circa 15 minuti. Non serve il terminale.

Ogni passo finisce con una prova: «Dovresti vedere…». Se non la vedi, cerca il sintomo in [Se qualcosa non va](#se-qualcosa-non-va) prima di andare avanti.

## 0. Cosa ti serve

- **L'app desktop di Claude**, aggiornata: scaricala o aggiornala da [claude.com/download](https://claude.com/download).
- **Un posto nell'organizzazione Intarget su Claude.** Se non ce l'hai, chiedilo all'Innovation Hub.
- **Il tuo account Indeck**: lo stesso con cui entri nell'app Indeck.

Cowork non serve per questo kit. Se vuoi usarlo, controlla prima i requisiti su Windows: [guide/app-desktop.md](../guide/app-desktop.md#cowork). Di solito servono i diritti di amministratore: li ha chi gestisce i computer in azienda.

Dovresti vedere: l'app si apre e mostra le modalità Chat e Code. Cowork può mancare.

## 1. Entra nell'organizzazione Intarget

1. Clicca sulle tue iniziali o sul tuo nome, in basso a sinistra.
2. Scegli l'organizzazione Intarget.
3. Se l'app ti propone di portare nell'organizzazione i dati del tuo account personale, scegli di tenere i due account separati («Keep both»). Lo spostamento dei dati non si può annullare.

Lavora sempre nell'organizzazione Intarget, mai nell'account personale (Free o Pro). Gli account personali non sono coperti dai contratti aziendali.

Dovresti vedere: il segno di spunta blu accanto all'organizzazione Intarget.

## 2. Collega Indeck a Claude

Il collegamento si chiama MCP di Indeck: è il connettore che dà a Claude la tua memoria e le skill di Indeck. Un amministratore lo aggiunge ai connettori dell'organizzazione. Tu ti colleghi con il tuo account.

1. Apri **Personalizza → Connettori** (Customize → Connectors).
2. Trova Indeck e clicca **Connetti** (Connect).
3. Si apre il browser. Entra con il tuo account Indeck.
4. Scegli il livello di accesso **scrittura**: la pagina di Indeck lo segna come consigliato.
5. Torna nell'app.

Con scrittura Claude può salvare in Indeck quando dici «chiudiamo» e nel passo 8 del prompt di setup. Chiede comunque il tuo sì prima di ogni scrittura. Scegli lettura solo se non vuoi mai che Claude salvi. Cosa cambia tra i due livelli: [guide/indeck.md](../guide/indeck.md#lettura-o-scrittura).

Se hai aggiunto Indeck da solo prima di novembre 2026, rimuovi quel connettore e usa quello dell'organizzazione (o aggiungilo di nuovo con l'indirizzo `https://mcp.intarget.net/mcp`). Scollegare e ricollegare non cambia l'indirizzo. Se vedi due voci Indeck, tieni solo quella dell'organizzazione.

Dovresti vedere: Indeck tra i connettori, collegato.

## 3. Prova la connessione in Chat

1. Apri una chat nuova.
2. Scrivi: `Chiama whoami di Indeck e dimmi chi sono.`
3. Se Claude chiede il permesso di usare Indeck, consenti.

Dovresti vedere: la tua email Intarget, il tuo nome e l'elenco dei workspace e dei progetti Indeck che puoi vedere.

## 4. Crea la tua cartella di lavoro

Su Windows:

1. Apri Esplora file.
2. Nella barra dell'indirizzo scrivi `%USERPROFILE%` e premi Invio. Ora sei in `C:\Users\<nome>`.
3. Crea una cartella nuova e chiamala `Lavoro-Claude`.

Su macOS: nel Finder premi Maiusc+Cmd+H per aprire la tua cartella Inizio, poi crea una cartella `Lavoro-Claude`.

Se hai ricevuto un kit personale (un file zip), copia il suo contenuto dentro la cartella. Altrimenti lasciala vuota: il prompt di setup scarica i file del kit. Cosa contiene il kit: [kit/primo-workspace/LEGGIMI.md](../kit/primo-workspace/LEGGIMI.md).

Due regole:

- **Non metterla in OneDrive, iCloud o Google Drive.** Su Windows la cartella Documenti è spesso sincronizzata con OneDrive. `C:\Users\<nome>\Lavoro-Claude` non lo è.
- **Non spostarla e non rinominarla dopo.** Claude lega al percorso della cartella le note che prende su di essa. Se la sposti, riparte da zero.

Per un secondo cliente o progetto crea `Lavoro-Claude-<argomento>` accanto a questa, non dentro, e rifai il passo 5 lì. Il CLAUDE.md globale c'è già: Claude ti propone solo le modifiche. Dettagli: [secondo-cervello/leggero.md](../secondo-cervello/leggero.md).

Dovresti vedere: la cartella `C:\Users\<nome>\Lavoro-Claude` (su macOS `~/Lavoro-Claude`).

## 5. Esegui il prompt di setup nella scheda Code

Claude usa due file di istruzioni, e il prompt di setup li scrive tutti e due:

- il **CLAUDE.md globale**, in `C:\Users\<nome>\.claude\CLAUDE.md` (su macOS `~/.claude/CLAUDE.md`): chi sei in poche righe e come vuoi che Claude lavori. Vale in ogni cartella. `.claude`, con il punto, è la cartella delle impostazioni di Claude: non lavorarci dentro.
- il **CLAUDE.md della cartella**, in `C:\Users\<nome>\Lavoro-Claude\CLAUDE.md`: a cosa serve la cartella, quale workspace o progetto Indeck usa, quando un lavoro è finito. Vale solo lì.

1. Apri la **scheda Code** (Code tab). Il nome inganna: lavora su qualsiasi file, non solo sul codice.
2. Nel selettore dell'ambiente lascia la sessione sul tuo computer, non nel cloud.
3. Clicca il controllo della cartella di progetto, accanto al selettore dell'ambiente, e scegli la cartella `Lavoro-Claude`.
4. Scegli la modalità dei permessi **Auto**. Se non c'è, scegli **Accept edits**. Auto riduce le richieste di permesso con un controllo automatico; non garantisce che ogni azione rischiosa venga fermata.
5. Apri [prompt-di-setup.md](prompt-di-setup.md), copia il blocco e incollalo nella casella del messaggio. Invia.
6. Rispondi alle domande. Quando Claude ti mostra cosa vuole scrivere, leggi e rispondi sì o no.
7. Se l'app chiede il permesso di scrivere in `C:\Users\<nome>\.claude\`, controlla il percorso e consenti. È lì che va il tuo CLAUDE.md globale.

Alla fine Claude ti dà tre cose: un testo per le impostazioni, una riga per Cowork e un resoconto.

8. Clicca le tue iniziali in basso a sinistra, poi **Impostazioni → Istruzioni per Claude** (Settings → Instructions for Claude). Se il campo ha già un testo, non cancellarlo: Claude ti chiede di incollarglielo e ti propone l'unione. Incolla il testo finale e salva.
9. Se usi Cowork: in Cowork seleziona la cartella `Lavoro-Claude`, apri il pannello **Personalizza** e incolla la riga nelle istruzioni della cartella.

Il CLAUDE.md globale e le Istruzioni per Claude sono lo stesso testo in due posti, perché la scheda Code legge il file e Chat e Cowork leggono le impostazioni. Le tue preferenze (lingua, formato, tono, numeri) stanno nel CORE di Indeck: il testo ne tiene una copia di ripiego. Per cambiare una preferenza, chiedi a Claude di aggiornare il CORE e di prepararti le due copie. Cosa legge ogni modalità: [guide/app-desktop.md](../guide/app-desktop.md).

Dovresti vedere: il resoconto con ogni verifica «ok», oppure con quello che resta da fare a te. La riga sulle istruzioni aziendali dice solo se Claude le vede in questa sessione: un «no» non è un errore.

## 6. Prove finali

Nella scheda Code apri una sessione nuova nella cartella `Lavoro-Claude`.

1. Scrivi `/context`.
   Dovresti vedere: tra i file caricati, il CLAUDE.md globale (`C:\Users\<nome>\.claude\CLAUDE.md`) e il CLAUDE.md della cartella. Se l'elenco dei file non compare, chiedi: `Quali file di istruzioni hai caricato in questa sessione?`
2. Scrivi: `Chi sono e su cosa sto lavorando?`
   Dovresti vedere: una risposta presa dal tuo CORE di Indeck e da `STATO.md`, con la fonte. Quello che non sa, Claude dice di non saperlo. Non inventa.
3. Scrivi: `Ricordati che preferisco le tabelle ai paragrafi.`
   Dovresti vedere: Claude propone di scriverlo nelle Preferences del tuo CORE di Indeck, con la copia nel CLAUDE.md globale, e chiede il tuo sì prima di scrivere. Perché: [mappa della memoria](../guide/memoria.md).
4. In Chat apri una chat nuova e scrivi la stessa domanda: `Chi sono e su cosa sto lavorando?`
   Dovresti vedere: anche qui una risposta presa dal tuo CORE di Indeck.
5. Se usi Cowork: apri un'attività nuova con la cartella `Lavoro-Claude` e scrivi: `A che punto sono i lavori in questa cartella?`
   Dovresti vedere: il contenuto di `STATO.md`, senza che tu nomini il file. Se Claude chiede quale file leggere, manca la riga nelle istruzioni della cartella (passo 5, punto 9).

Se tutte le prove passano, hai finito. Il passo successivo è chiedere bene: [guide/chiedere-in-grande.md](../guide/chiedere-in-grande.md).

## Se qualcosa non va

| Cosa vedi | Cosa fare |
|---|---|
| Indeck non c'è tra i connettori | Lo aggiunge un amministratore dell'organizzazione. Scrivi all'Innovation Hub. |
| Claude dice che Indeck non è collegato | In Personalizza → Connettori, Indeck deve risultare collegato. Se lo è, scollegalo e ricollegalo. In Chat controlla che Indeck sia attivo tra gli strumenti della conversazione. |
| `whoami` risponde con un'altra email, o non vedi i tuoi workspace | Sei nell'account sbagliato. Rifai il passo 1, poi scollega e ricollega Indeck con il tuo account Indeck. |
| Indeck dice che la memoria è disattivata | La memoria personale è spenta nelle impostazioni di Indeck. Riaccendila dall'app Indeck. |
| Uno strumento di Indeck dà errore dopo un aggiornamento di Indeck | Chiudi e riapri l'app. Le sessioni aperte prima dell'aggiornamento vedono gli strumenti vecchi. |
| Nella scheda Code manca il CLAUDE.md globale | Chiedi: `Quali file di istruzioni hai caricato in questa sessione?` Il file deve stare in `C:\Users\<nome>\.claude\CLAUDE.md`. Controlla anche che la sessione sia sul tuo computer e non nel cloud. |
| In Cowork Claude non segue le tue preferenze | Cowork non legge la cartella `.claude`. Controlla il testo in Istruzioni per Claude. Se nelle impostazioni c'è una sezione Cowork con istruzioni globali (Global instructions), incolla lo stesso testo anche lì. |
| Non vedi la scheda Code, non si apre o chiede Git | Aggiorna l'app da [claude.com/download](https://claude.com/download) e riaprila. Se il problema resta, scrivi all'Innovation Hub. |
