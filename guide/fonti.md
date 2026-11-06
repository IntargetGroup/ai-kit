# Le fonti: cosa può leggere Claude

Claude lavora bene quando legge la fonte giusta e solo i dati che servono al compito. Questa pagina spiega come collegare le fonti e le regole che valgono per tutte.

| Fonte | Cosa contiene | Come arriva a Claude |
|---|---|---|
| Indeck | memoria, skill, banche dati dell'organizzazione | l'MCP di Indeck ([guide/indeck.md](indeck.md)) |
| Connettori di Claude | posta, calendario, Drive e gli altri servizi attivati per Intarget | Personalizza → Connettori (Customize → Connectors) |
| File | Excel, CSV, PDF, export, trascrizioni | allegati in Chat; la cartella di lavoro in Cowork e nella scheda Code (Code tab) |

## Le regole

Valgono per ogni fonte e seguono le [istruzioni aziendali](../org/rendering/claude-ai.md).

- **Solo i dati che servono al compito.** Collegare un servizio non autorizza a copiarne tutto il contenuto.
- **I dati di un cliente servono solo per quel cliente.** Non portarli nel lavoro o nella memoria di un altro.
- **I dati grandi stanno in un file.** Non incollarli in chat. Su un file Claude lavora con il codice e può dirti cosa ha letto.
- **In memoria va il link, non la copia.** Un documento su Drive resta su Drive.
- **Nessun dato personale nelle ricerche su fonti esterne.** Niente nomi di persone in Statista, Semrush o negli strumenti di scraping.
- **Solo account aziendali.** Mai un account personale per dati di Intarget o dei clienti.
- **Tieni attivo solo ciò che usi.** Ogni connettore, skill o plugin attivo aggiunge strumenti tra cui Claude deve scegliere, in ogni conversazione. Collega quello che serve al tuo lavoro e scollega il resto in Personalizza → Connettori.
- **Niente strumenti di terzi che non sai valutare.** Prima di installare una skill, un server MCP o un'estensione di terzi, chiedi all'Innovation Hub.

## 1. Indeck

La memoria e le skill di Indeck arrivano con l'MCP: [guide/indeck.md](indeck.md).

Con il livello [scrittura](indeck.md#lettura-o-scrittura) Claude usa anche le banche dati dell'organizzazione:

| Strumenti | A cosa servono |
|---|---|
| `statista_*` | statistiche, mercati, consumatori |
| `semrush_*` | parole chiave, ricerca organica, backlink, trend |
| `apify_*`, `scrapegraph_*` | raccolta di dati da siti web e social |

Ogni chiamata spende crediti dell'organizzazione a tuo nome. Claude ti mostra cosa cercherà e chiede conferma prima di spenderli. Per una ricerca con più chiamate, concordate un limite. Per spenderne pochi:

1. Fai una domanda precisa: un mercato, un periodo, una metrica. Dovresti vedere Claude proporti cosa cercherà prima di lanciare la ricerca.
2. Fai salvare il risultato in un file nella cartella di lavoro. Dovresti vedere il file in `input/`.
3. La volta dopo, riparti dal file. Non rifare la stessa ricerca.

Esempio: «Cerca su Statista il valore dell'e-commerce di arredamento in Italia, 2023–2025. Prima dimmi quali ricerche farai. Salva i risultati in input/ come CSV con la fonte di ogni numero.»

## 2. I connettori di Claude

I connettori collegano Claude ai servizi di lavoro: per esempio Gmail, Google Calendar, Google Drive, Zoho. Vedi quelli attivati per Intarget in Personalizza → Connettori.

1. Apri **Personalizza → Connettori**. Dovresti vedere i connettori disponibili per l'organizzazione.
2. Clicca **Connetti (Connect)** sul connettore che ti serve. Dovresti vedere la pagina di accesso del servizio.
3. Accedi con l'account aziendale. Dovresti vedere il connettore segnato come collegato.
4. Apri una chat nuova e chiedi qualcosa di piccolo, per esempio «Quali riunioni ho domani?». Dovresti vedere una risposta con i dati del servizio.

Da sapere:

- **Un collegamento vale ovunque.** Il connettore collegato nell'app funziona in Chat, in Cowork e nella scheda Code ([documentazione](https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities)).
- **Collega Gmail e Calendar dall'app.** Claude Code nel terminale non può completare l'accesso a questi connettori ([documentazione](https://code.claude.com/docs/en/mcp)).
- **Un connettore nuovo lo aggiunge un Owner.** Sul piano Team la persona collega, l'Owner aggiunge. Per un servizio che manca, scrivi all'Innovation Hub.
- **I collegamenti di Indeck non passano a Claude.** Se in Indeck hai collegato Google o Zoho, in Claude li colleghi di nuovo, con i connettori di Claude.
- **In Cowork Claude chiede il permesso per le azioni che scrivono**, per esempio creare una bozza o un evento. L'impostazione dell'organizzazione decide se puoi dire «consenti sempre».

Chiedi in modo mirato. «Leggi la mia posta» porta dentro tutto. «Trova le mail con il cliente «nome» degli ultimi 14 giorni sul preventivo e riassumi cosa è stato deciso» porta dentro solo quello che serve. Claude prepara le bozze; le invii tu.

## 3. I file

### In Chat

Allega il file al messaggio. Va bene per documenti brevi. Per dati grandi o per molti file usa Cowork o la scheda Code.

### In Cowork e nella scheda Code

Claude lavora nella cartella che hai scelto ([guide/app-desktop.md](app-desktop.md)). Con la cartella del kit ([primo workspace](../kit/primo-workspace/LEGGIMI.md)):

- le fonti vanno in `input/`;
- i risultati vanno in `lavori/<AAAA-MM>-<argomento>/`.

**Excel e CSV grandi.** Concorda il perimetro: periodo, colonne, filtri. Claude elabora con il codice tutti i record di quel perimetro, non un'anteprima. Chiedilo nel «Fatto quando» della richiesta: «Dimmi fonte, periodo, filtri, righe incluse ed escluse. Riconcilia i totali con il file usando gli stessi filtri.» Dovresti vedere questi dati e i totali confrontati. Se i totali non tornano, Claude deve dirti di quanto e non presentare il risultato come verificato. Come scrivere richieste così: [guide/chiedere-in-grande.md](chiedere-in-grande.md).

**Dati da un'API o da uno strumento.** Quando Claude scarica dati da un servizio, chiedi di acquisire solo quelli che servono al compito, di salvarli in un file in `input/` e di lavorare sul file. Chiedi anche quante pagine ha acquisito e se il risultato è troncato. Dovresti vedere il file prima dell'analisi. Un'anteprima nella conversazione non prova che siano stati acquisiti tutti i dati necessari.

### Su Drive

Con il connettore Google Drive Claude legge i file e le cartelle che gli indichi. Dagli il link del file o della cartella, non il nome.

Per analizzare un file grande con il codice, scaricalo in `input/` e fai lavorare Claude sulla copia. L'originale resta su Drive. Il risultato finale lo rimetti su Drive tu, se serve ai colleghi.

Un foglio che il team aggiorna resta la fonte. In memoria vanno l'indirizzo, a cosa serve e chi lo aggiorna. Non copiare i valori in memoria: invecchiano il giorno dopo.

## 4. Riunioni e documenti in memoria

Le riunioni vanno nella memoria del workspace o del progetto, non solo su Drive. Lì le trovano i colleghi e gli agenti, in Indeck e in Claude. Serve il livello [scrittura](indeck.md#lettura-o-scrittura).

1. Prepara la fonte: la trascrizione o gli appunti della riunione, come file in `input/` o come link Drive. Dovresti vedere il file nella cartella, o Claude che apre il link.
2. Scrivi: «Porta questa riunione nella memoria del progetto «nome» con la skill «Ingestione in memoria Indeck». Lascia fuori le parti personali.» Dovresti vedere Claude leggere tutta la fonte e proporti cosa salva e dove.
3. Rispondi sì, oppure correggi la proposta. Claude scrive solo dopo il tuo sì. Dovresti vedere il file creato, di solito `meetings/AAAA-MM-GG-<argomento>.md`, e un resoconto di cosa è entrato e cosa no.
4. Apri una chat nuova e chiedi: «Cosa abbiamo deciso nella riunione del «data» sul progetto «nome»?» Dovresti vedere le decisioni, con la riunione come fonte.

Scegli lo spazio più stretto che serve al team: il progetto per le decisioni di un incarico, il workspace per quelle che valgono per tutto il cliente. Le regole su cosa entra in memoria: [guide/memoria.md](memoria.md).

Lo stesso vale per un documento lungo o una ricerca: stessa skill, stessi passi. Per conservare una conversazione con Claude che ha prodotto decisioni, usa il [prompt di esportazione](../secondo-cervello/prompt-export-chat.md).
