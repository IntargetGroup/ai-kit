# Istruzioni aziendali per Claude — v1

Versione 1 · 2026-11-05, testo in inglese dal 2026-11-06 · stato: **proposta**, da approvare prima della pubblicazione.

Il testo che Claude legge è uno solo: [`rendering/claude-ai.md`](rendering/claude-ai.md). Questa pagina spiega le scelte che qualcuno potrebbe contestare. Come pubblicarlo: [`README.md`](README.md).

## Lo scopo

Claude deve lavorare come un collega che conosce Intarget: parte dal contesto giusto in Indeck, non sparge dati, non decide al posto delle persone, e non intralcia chi sa già cosa vuole.

## Come è scritto

- **In inglese:** il testo lo legge Claude, e Claude segue le istruzioni in inglese in modo più affidabile. La prima riga gli chiede di rispondere in italiano. Questa pagina e le guide restano in italiano perché le leggono le persone.
- **Corto:** meno di 3.000 caratteri, il limite delle istruzioni dell'organizzazione su claude.ai. Le istruzioni lunghe peggiorano i risultati: il modello applica le regole anche dove non servono.
- **Calmo:** niente maiuscole, niente "IMPORTANTE". Una regola, detta una volta, con il suo confine.
- **Per l'agente, non per le persone:** la policy d'uso di Indeck resta il documento per le persone. Le istruzioni dicono all'agente cosa fare e quando, in modo coerente con la policy.
- **Un solo testo:** lo stesso blocco va su claude.ai e nelle impostazioni gestite di Claude Code. `scripts/check.mjs` verifica che coincidano.

## Le scelte, e perché

| Scelta | Perché |
|---|---|
| Leggere il CORE personale quando il lavoro richiede contesto aziendale | Nell'app Indeck il CORE arriva all'agente a ogni messaggio. Tramite MCP non arriva niente: senza questa riga Claude non sa chi sei. |
| Usare lo spazio indicato nella richiesta o nel CLAUDE.md della cartella; se è ambiguo, chiedere | Tramite MCP non esiste un workspace "corrente". Leggere tutto costa e mescola i clienti. Una domanda costa meno di un errore di cliente. |
| Per un cliente, cercare solo nei suoi spazi e leggere la fonte prima di citarla | Senza scope la ricerca guarda tutto ciò che la persona può vedere. Un estratto di ricerca non è la fonte. |
| Le richieste generiche non richiedono Indeck | Chiamare Indeck per una traduzione o una ricetta rallenta e non aggiunge niente. |
| Se Indeck non risponde, dirlo e continuare | Bloccare il lavoro per una connessione mancante è peggio che lavorare senza memoria, purché la persona lo sappia. |
| Profilo e preferenze nello scope personale; decisioni ed esiti nello spazio condiviso più ristretto | La memoria personale serve a conoscere la persona; quella condivisa vale solo se contiene le decisioni del team. |
| Proporre gli aggiornamenti in un'unica richiesta, scrivere dopo il sì o dentro un'autorizzazione già data | Il lavoro deve entrare in memoria, e le persone vogliono sapere cosa entra. Una sola richiesta a fine lavoro rispetta le due cose. Chi vuole aggiornamenti automatici lo autorizza una volta. |
| «Salvato» solo dopo l'esito applied e una rilettura | Un agente che dice "salvato" quando non ha salvato rompe la fiducia nella memoria. |
| I dati di un cliente solo per quel cliente | Evita che fonti e decisioni di clienti diversi finiscano nello stesso lavoro. È anche un obbligo contrattuale. |
| Conferma prima di inviare, pubblicare, cancellare, spendere crediti, toccare la produzione | Chi chiede risponde di ciò che l'agente fa. La conferma vale per l'azione mostrata: niente richieste a ogni passo. |
| Non valutare e non profilare i colleghi | Gli strumenti servono al lavoro. Una valutazione delle persone non spetta a un agente. |
| Innovation Hub solo per sicurezza, guasti di Indeck, nuovi strumenti | Rimandare all'Innovation Hub domande che hanno risposta nell'area della persona rallenta tutti. |

## Cosa abbiamo lasciato fuori, di proposito

- **"Chiedi sempre prima di fare qualcosa".** Insegna a confermare senza leggere.
- **"Lavora sempre in autonomia fino alla fine".** Porta a inventare requisiti e a sbagliare cliente.
- **"Ricontrolla sempre tutto".** Non definisce un controllo utile. Serve un controllo di "fatto" preciso, e la prova del suo esito.
- **"Ricorda tutto e rileggi tutto a ogni sessione".** Costa, duplica e porta in memoria ciò che non deve entrarci.
- **Processi obbligatori** (specifica, piano, test per ogni richiesta). Servono a una parte del lavoro di sviluppo, non a un'analisi o a un documento.
- **"Chiedi l'approvazione per ogni nuovo strumento AI".** È una regola per le persone, non per l'agente.

## Dove arriva ogni testo

| Canale | Contenuto | Dove arriva |
|---|---|---|
| claude.ai → istruzioni dell'organizzazione ([percorso](README.md#2-le-istruzioni-dellorganizzazione)) | il blocco canonico | Chat. La documentazione dice "across Claude products" senza nominare Cowork e Code: va verificato. Se contraddicono le istruzioni personali, prevalgono. |
| Claude Code → impostazioni gestite (`claudeMd`) | lo stesso blocco | terminale, IDE, scheda Code dell'app desktop e sessioni cloud. Mai Cowork. |
| MCP di Indeck → istruzioni del server | regole d'uso degli strumenti Indeck ([v2, in produzione dal 2026-11-06](rendering/indeck-mcp-server-instructions.md)) | i client che leggono le istruzioni del server: Claude Code sì, gli altri da verificare |
| CLAUDE.md globale + Istruzioni per Claude | chi sono, come lavoro, i limiti essenziali ([modello](../inizia/modelli/CLAUDE-globale.md)) | solo quella persona |
| CLAUDE.md della cartella | cosa si fa lì e con quale spazio Indeck ([modello](../inizia/modelli/CLAUDE-cartella.md)) | chi lavora in quella cartella |

I file CLAUDE.md caricati da Claude Code si sommano alle istruzioni aziendali: non si annullano ([caricamento dei CLAUDE.md](https://code.claude.com/docs/en/memory#how-claude-md-files-load)). Il modello globale ripete apposta tre regole aziendali (lettura del CORE, scrittura dopo il sì, conferma prima delle azioni), con le stesse parole in inglese, perché senza impostazioni gestite e in Cowork le istruzioni aziendali possono non arrivare.

## Come cambia

- Ogni modifica passa da una pull request, con il motivo e un esempio del comportamento che corregge.
- Prove minime dopo ogni modifica: una richiesta generica, una richiesta su un cliente con spazio ambiguo, una preferenza personale, una scrittura autorizzata, una scrittura rifiutata, Indeck non collegato.
- Revisione ogni mese: togliere le righe che non cambiano più nessun comportamento.
