# Secondo cervello completo

Un vault di note in Markdown, versionato con git, che Claude Code compila da fonti grezze in pagine collegate.
Questa pagina descrive lo schema e gli errori da evitare. Non è un requisito per nessuno: per il lavoro quotidiano basta la [variante leggera](leggero.md).

**Per chi:** chi usa già Claude Code e git, e vuole una base di conoscenza personale costruita nel tempo da molte fonti.
**Tempo:** qualche ora di avvio, poi una sessione di aggiornamento ogni settimana o due.

## L'idea

Lo schema viene dalla "LLM Wiki" di Andrej Karpathy ([gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)). Tre strati:

1. **Fonti grezze** (`raw/`): trascrizioni, articoli, mail, documenti. Non si modificano dopo l'acquisizione.
2. **Wiki** (`wiki/`): pagine compilate da Claude a partire dalle fonti. Le scrive Claude; tu le leggi.
3. **Schema** (`CLAUDE.md` nella radice del vault): le regole che Claude segue per compilare, collegare e controllare.

Tre operazioni: **ingest** (da fonte a pagine), **query** (rispondere citando le pagine), **lint** (controllare la salute del vault).

## Struttura

```
vault/
├── CLAUDE.md               schema: domini, intestazioni, regole di ingestione e di controllo
├── inbox/                  fonti appena arrivate, da elaborare
├── raw/<tipo>/AAAA-MM/     fonti archiviate, immutabili
├── wiki/
│   ├── concepts/  entities/  sources/  syntheses/
│   ├── index.md            catalogo di tutte le pagine
│   ├── log.md              una riga per ogni ingestione
│   └── contradictions.md   indice delle contraddizioni aperte
├── people/                 una pagina per persona
├── domains/<area>/         _moc.md (mappa dell'area), meetings/, decisions/
└── .claude/
    ├── settings.json       permessi e, se serve, un solo hook di sicurezza
    └── skills/             ingest, query, lint
```

Fuori dal vault, mai versionata: una cartella locale per le note personali sensibili (vedi "L1 e L2").

## Le regole che tengono il vault vero

1. **`raw/` è immutabile.** Una fonte sbagliata si sposta in `raw/_archive/`, non si corregge.
2. **Ogni pagina ha una provenienza.** L'intestazione YAML ha un campo `sources:` con i file di `raw/` che la giustificano. Un'affermazione senza fonte si cancella o diventa `status: hypothesis`.
3. **Le contraddizioni si segnalano, non si sovrascrivono.** Un riquadro `> [!contradiction]` tiene le due affermazioni con le due fonti. L'indice è `wiki/contradictions.md`.
4. **Un'ingestione, un commit.** Il messaggio dice cosa è entrato e quante pagine ha toccato: `ingest(<area>): <titolo> — N pagine (+M nuove)`.
5. **Regola dei 30 minuti.** Se una pagina blocca il lavoro per mezz'ora, lascia una nota di blocco e vai avanti.
6. **Il grafo è parte del lavoro.** Ogni link da A a B ha il ritorno nella sezione "Correlati" di B. Ogni pagina di un'area punta alla mappa dell'area. Ogni pagina nuova entra in `wiki/index.md` prima del commit. Ogni azione ha un responsabile con link alla sua pagina.
7. **Tag da un vocabolario chiuso.** Un tag nuovo entra prima nel dizionario dei tag, poi nelle pagine.

### Il test di ricostruzione

Il difetto più frequente di un'ingestione è il riassunto troppo corto. Il test per ogni pagina: un lettore futuro ricostruisce la decisione, le alternative e il perché dalla sola pagina?

Per una riunione o una trascrizione il test chiede: decisioni con le parole usate, azioni con responsabile e data, ogni numero, nome e motivazione, le domande aperte.

Il riempitivo non è la soluzione: ripetizioni e dettagli inventati fanno fallire il test quanto i tagli. La stessa regola vale per le ingestioni in Indeck (`memory_guidance`).

## Le skill

| Skill | Cosa fa |
|---|---|
| `/ingest` | Legge la fonte intera, trova le pagine che tocca, le estende con affermazioni citate, crea le pagine nuove, aggiorna indice e link di ritorno, archivia la fonte, fa il commit |
| `/query` | Risponde da `index.md` e dalle pagine pertinenti, con citazioni. Se la risposta scopre un buco, lo registra |
| `/lint` | Trova pagine orfane, link morti, pagine fuori indice, pagine senza fonte, tag sconosciuti, contraddizioni vecchie |

Le skill usano i nomi semplici degli strumenti MCP (`memory_read`, non `mcp__<server>__memory_read`): il prefisso cambia secondo come ciascuno ha collegato il server.

Un controllo `/lint` affidabile è uno script versionato in `scripts/`, senza dipendenze. Uno script riscritto a ogni sessione dà risultati diversi a ogni sessione.

## Aggiornare a lotti

Se l'aggiornamento quotidiano non ti serve, lavora a **lotti**:

1. scegli una finestra di tempo (per esempio le ultime due settimane);
2. passa ogni fonte di quella finestra: trascrizioni di riunioni, note di riunione su Drive, digest della posta tramite connettore, documenti ricevuti;
3. archivia in `raw/`, compila, un commit per unità;
4. alla fine, `/lint` e correzione dei problemi trovati.

Se una fonte non è raggiungibile (nessun connettore, allegati non letti), scrivilo nella pagina. Un buco dichiarato vale più di un buco nascosto.

## L1 e L2

La domanda per ogni informazione: *se l'agente sbagliasse con questo dato, sarebbe pericoloso o imbarazzante?*

- **Sì → L1.** Una cartella locale fuori dal vault, mai versionata, mai sincronizzata, mai letta da un MCP per default. Esempi: note su salute, finanze personali, contratto.
- **No → L2.** Il vault versionato, in un repository privato.
- **Segreti → nessuno dei due.** Password e chiavi stanno nel gestore di password. Una cartella nascosta non è un controllo di sicurezza.

Proteggi la direzione pericolosa: l'agente può scrivere in L1, ma niente passa da L1 a L2.

Quando archivi una fonte con parti sensibili, sostituiscile con un segnaposto esplicito, per esempio `[rimosso per privacy]`. Una cancellazione silenziosa fa sembrare completa una fonte che non lo è.

## Convivenza con Indeck

- **Indeck è la memoria condivisa dell'azienda:** clienti, progetti, decisioni, metodi. **Il vault è conoscenza personale compilata:** letture, ragionamenti, apprendimento.
- **Il materiale riservato dei clienti non entra nel vault.** Né trascrizioni, né documenti, né dati. Una lettura da Indeck salvata in un repository personale esce dai permessi di Indeck.
- **Le pagine `people/` contengono ruolo e contesto di lavoro.** Mai giudizi o valutazioni sulle persone.
- **Una pagina del vault che diventa un fatto del team va in Indeck** con la skill "Ingestione in memoria Indeck". Nel vault resta un link.
- **Il CORE personale di Indeck è la fonte del profilo.** Lo leggono sia l'app Indeck sia Claude. Nel vault conserva soltanto un rimando.

## Errori da evitare

| Rischio | Regola |
|---|---|
| Un file di registro che cresce a ogni sessione (progressi, blocchi, fili aperti) diventa illeggibile e costa contesto a ogni lettura | File di stato limitati, riscritti, con un tetto di righe. La storia è nel `git log` |
| Un hook di avvio che inietta un file grande consuma contesto in ogni sessione | All'avvio solo un indice breve. Il resto si legge quando serve |
| Un hook che riscrive un file versionato lascia il repository sempre "modificato" e può sovrascrivere ciò che scrive l'agente | Un file generato da un hook non si versiona. Meglio ancora: non generarlo |
| Un hook di sicurezza che risponde `allow` per ogni comando non bloccato salta la richiesta di permesso ([hooks](https://code.claude.com/docs/en/hooks)) | Un hook di guardia risponde `deny` o niente |
| Un agente può riportare come "scritto" un file che non esiste | Credi al disco, non al resoconto: `git status` e lettura del file |
| Agenti in parallelo possono dare lo stesso numero a decisioni diverse | Un solo proprietario per numerazione e pagine hub (indice, mappe, contraddizioni) |
| Due copie delle istruzioni (una per Claude, una per Codex) divergono | Un solo file (`AGENTS.md`) e `CLAUDE.md` che lo importa con `@AGENTS.md` |
| Obsidian collegato via MCP solo per leggere le note aggiunge un componente inutile | Claude Code legge e scrive le cartelle da solo. Obsidian resta un lettore e una vista del grafo |
| Un risultato MCP molto lungo non arriva intero: oltre 50.000 caratteri Claude Code lo salva in un file ([MCP](https://code.claude.com/docs/en/mcp)) | Le skill dicono di leggere quel file, non l'anteprima |

## Avvio in 12 passi

1. Verifica i prerequisiti: Claude Code (terminale o scheda Code dell'app desktop) e git. Obsidian è facoltativo.
2. Crea la cartella del vault fuori da OneDrive, iCloud e Google Drive. Inizializza git e collega un repository **privato**.
3. Crea la cartella L1 fuori dal vault. Scrivi il suo percorso nel `CLAUDE.md`.
4. Scrivi il `CLAUDE.md` del vault: le aree (domini), l'intestazione obbligatoria delle pagine, le regole qui sopra, il test di ricostruzione, L1/L2. Resta sotto le 200 righe ([memory](https://code.claude.com/docs/en/memory)).
5. Crea `inbox/`, `raw/`, `wiki/`, `people/`, `domains/` e i file `wiki/index.md`, `wiki/log.md`, `wiki/contradictions.md`, il dizionario dei tag.
6. Scrivi le tre skill in `.claude/skills/<nome>/SKILL.md`. Ogni skill rimanda allo schema invece di ripeterlo.
7. In `.claude/settings.json` aggiungi una regola di rifiuto per le fonti: `"deny": ["Edit(raw/**)"]` ([permessi](https://code.claude.com/docs/en/permissions)). La regola blocca anche la scrittura di file nuovi: le fonti entrano in `raw/` spostandole da `inbox/`, e la skill `/ingest` lo dice. La regola ferma gli strumenti di file di Claude e i comandi che riconosce, non ogni processo: uno script può ancora scrivere lì.
8. Aggiungi `.gitignore` per file di sistema, archivi pesanti ed export temporanei.
9. Collega l'MCP di Indeck a livello utente ([guide/indeck.md](../guide/indeck.md)).
10. Fai la prima ingestione con una fonte reale. Applica a mano il test di ricostruzione, poi fai il commit.
11. Esegui `/lint` e correggi.
12. Se vuoi, apri la cartella con Obsidian per leggere e vedere il grafo. Nessun plugin è necessario.

Ogni mese: rileggi il `CLAUDE.md` e togli le regole che non cambiano più il comportamento di Claude.
