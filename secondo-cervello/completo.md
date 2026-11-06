# Secondo cervello completo

Un vault di note in Markdown, versionato con git, che Claude Code compila da fonti grezze in pagine collegate.
Questa pagina descrive lo schema, cosa ti serve e come si usa. Non è un requisito per nessuno: per il lavoro quotidiano basta la [variante leggera](leggero.md).

**Per chi:** chi usa già Claude Code e vuole una base di conoscenza personale costruita nel tempo da molte fonti.
**Tempo:** mezz'ora di preparazione, una o due ore con Claude per la costruzione, poi una sessione di aggiornamento ogni settimana o due.
**Per Claude** la versione autorevole è [obsidian/SPEC.md](obsidian/SPEC.md), in inglese. Se questa pagina e SPEC.md non coincidono, vale SPEC.md.

## L'idea

Lo schema viene dalla "LLM Wiki" di Andrej Karpathy ([gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)). Tre strati:

1. **Fonti grezze** (`raw/`): articoli, studi, trascrizioni, catture di chat. Non si modificano dopo l'acquisizione.
2. **Wiki** (`wiki/`, `domains/`, `people/`): pagine compilate da Claude a partire dalle fonti. Le scrive Claude; tu le leggi.
3. **Schema** (`AGENTS.md` nella radice del vault, le regole delle aree, le skill): le regole che Claude segue per compilare, collegare e controllare.

Tre operazioni: **ingest** (da fonte a pagine), **query** (rispondere citando le pagine), **lint** (controllare la salute del vault).

Obsidian è facoltativo. Claude Code legge e scrive le cartelle da solo; Obsidian serve a leggere, a vedere il grafo e ad avere le note sul telefono.

## Struttura

```
vault/
├── AGENTS.md               le regole per Claude e per gli altri agenti
├── CLAUDE.md               due righe: importa AGENTS.md e agent-memory/NOW.md
├── inbox/                  fonti appena arrivate; fuori da git finché non sono elaborate
├── raw/<tipo>/AAAA-MM/     fonti archiviate, immutabili
├── wiki/
│   ├── concepts/  entities/  sources/  syntheses/  questions/
│   ├── index.md            catalogo di tutte le pagine
│   ├── overview.md         il quadro d'insieme
│   ├── contradictions.md   indice delle contraddizioni aperte
│   └── tag-dictionary.md   il vocabolario chiuso dei tag
├── people/                 una pagina per persona
├── domains/<area>/         _moc.md (mappa dell'area), CLAUDE.md (regole dell'area), meetings/, decisions/
├── agent-memory/NOW.md     lo stato attuale: massimo 40 righe, riscritto e mai allungato
├── scripts/lint.mjs        il controllo di salute
└── .claude/
    ├── settings.json       permessi: niente modifiche a raw/, ogni accesso a L1 chiede conferma
    └── skills/             ingest, query, lint, crystallize, weekly-review, new-domain
```

Non c'è un file di registro: la storia è il `git log`. Fuori dal vault, mai versionata, c'è la cartella L1 per le note personali sensibili (vedi "L1 e L2").

## Le regole che tengono il vault vero

1. **`raw/` è immutabile.** Una fonte sbagliata si sposta in `raw/_archive/`, non si corregge.
2. **Ogni pagina ha una provenienza.** L'intestazione YAML ha un campo `sources:` con i file di `raw/` che la giustificano. Un'affermazione senza fonte si cancella o diventa `status: hypothesis`.
3. **Le contraddizioni si segnalano, non si sovrascrivono.** Un riquadro `> [!contradiction]` con la data tiene le due affermazioni con le due fonti. L'indice è `wiki/contradictions.md`.
4. **Un'ingestione, un commit.** Il messaggio dice cosa è entrato e quante pagine ha toccato: `ingest(<area>): <titolo> — N pages (+M new)`.
5. **Regola dei 30 minuti.** Se una pagina blocca il lavoro per mezz'ora, Claude lascia una nota di blocco e va avanti.
6. **Il grafo è parte del lavoro.** Ogni link da A a B ha il ritorno nella sezione "Correlati" di B. Ogni pagina di un'area punta alla mappa dell'area. Ogni pagina nuova entra in `wiki/index.md` prima del commit. Ogni azione ha un responsabile con link alla sua pagina.
7. **Tag da un vocabolario chiuso.** Un tag nuovo entra prima nel dizionario dei tag, poi nelle pagine.

### Il test di ricostruzione

Il difetto più frequente di un'ingestione è il riassunto troppo corto. Il test per ogni pagina: un lettore futuro ricostruisce la decisione, le alternative e il perché dalla sola pagina?

Per una riunione o una trascrizione il test chiede: decisioni con le parole usate, azioni con responsabile e data, ogni numero, nome e motivazione, le domande aperte.

Il riempitivo non è la soluzione: ripetizioni e dettagli inventati fanno fallire il test quanto i tagli. La stessa regola vale per le ingestioni in Indeck (`memory_guidance`).

## L1 e L2

La domanda per ogni informazione: *se l'agente sbagliasse con questo dato, sarebbe pericoloso o imbarazzante?*

- **Sì → L1.** Una cartella locale fuori dal vault, mai versionata, mai sincronizzata. Claude la apre solo quando glielo chiedi, e ogni accesso aspetta la tua conferma. Esempi: note su salute, finanze personali, contratto.
- **No → L2.** Il vault versionato, in un repository privato.
- **Segreti → nessuno dei due.** Password e chiavi stanno nel gestore di password. Una cartella nascosta non è un controllo di sicurezza.

Proteggi la direzione pericolosa: l'agente può scrivere in L1, ma niente passa da L1 a L2.

Quando archivi una fonte con parti sensibili, sostituiscile con un segnaposto esplicito, sempre nella stessa forma, che Claude riconosce: `[removed for privacy: <tipo>]`, per esempio `[removed for privacy: health]`. Una cancellazione silenziosa fa sembrare completa una fonte che non lo è.

## Convivenza con Indeck

- **Indeck è la memoria condivisa dell'azienda:** clienti, progetti, decisioni, metodi. **Il vault è conoscenza personale compilata:** letture, ragionamenti, apprendimento.
- **Il materiale riservato dei clienti non entra nel vault.** Né trascrizioni, né documenti, né dati. Una lettura da Indeck salvata in un repository personale esce dai permessi di Indeck. Se una fonte di questo tipo finisce in `inbox/`, Claude si ferma e ti propone di portarla in Indeck.
- **Riunioni, mail e chat di lavoro vanno in Indeck.** Nel vault entrano solo incontri personali: un corso, un talk, una sessione di mentoring.
- **Le pagine `people/` contengono ruolo e contesto.** Mai giudizi o valutazioni sulle persone.
- **Una pagina del vault che diventa un fatto del team va in Indeck** con la skill "Ingestione in memoria Indeck". Nel vault resta un link.
- **Il CORE personale di Indeck è la fonte del profilo.** Lo leggono sia l'app Indeck sia Claude. Nel vault non c'è una copia.

## Errori da evitare

| Rischio | Regola |
|---|---|
| Un file di registro che cresce a ogni sessione (progressi, blocchi, fili aperti) diventa illeggibile e costa contesto a ogni lettura | File di stato limitati, riscritti, con un tetto di righe. La storia è nel `git log` |
| Un hook di avvio che inietta un file grande consuma contesto in ogni sessione | All'avvio solo lo stato breve (`NOW.md`). Il resto si legge quando serve |
| Un hook che riscrive un file versionato lascia il repository sempre "modificato" e può sovrascrivere ciò che scrive l'agente | Un file generato da un hook non si versiona. Meglio ancora: non generarlo |
| Un hook di sicurezza che risponde `allow` per ogni comando non bloccato salta la richiesta di permesso ([hooks](https://code.claude.com/docs/en/hooks)) | Un hook di guardia risponde `deny` o niente |
| Un agente può riportare come "scritto" un file che non esiste | Credi al disco, non al resoconto: `git status` e lettura del file |
| Agenti in parallelo possono dare lo stesso numero a decisioni diverse | Un solo proprietario per numerazione e pagine hub (indice, mappe, contraddizioni) |
| Due copie delle istruzioni (una per Claude, una per Codex) divergono | Un solo file (`AGENTS.md`) e `CLAUDE.md` che lo importa con `@AGENTS.md` |
| Obsidian collegato via MCP solo per leggere le note aggiunge un componente inutile | Claude Code legge e scrive le cartelle da solo. Obsidian resta un lettore e una vista del grafo |
| Un risultato MCP molto lungo non arriva intero: oltre 50.000 caratteri Claude Code lo salva in un file ([MCP](https://code.claude.com/docs/en/mcp)) | Le skill dicono di leggere quel file, non l'anteprima |
| Un controllo riscritto a ogni sessione dà risultati diversi a ogni sessione | Uno script versionato, senza dipendenze: `scripts/lint.mjs` |

## Cosa ti serve

Prima di tutto la configurazione di base: [inizia/README.md](../inizia/README.md), con Indeck collegato anche in Claude Code ([guide/indeck.md](../guide/indeck.md)).

**Windows**

1. **Claude Code:** la scheda Code (Code tab) dell'app desktop, oppure il terminale ([installazione](https://code.claude.com/docs/en/setup)).
2. **Git per Windows** da [git-scm.com/downloads/win](https://git-scm.com/downloads/win). Installa anche Git Bash, la shell che Claude Code usa per i comandi ([documentazione](https://code.claude.com/docs/en/setup)).
3. **Node.js**, versione LTS, da [nodejs.org](https://nodejs.org/). Serve al controllo `/lint`. Verifica in PowerShell: `node --version` deve dare 22 o più.
4. **La cartella del vault**, vuota: `C:\Users\<nome>\second-brain`. Non metterla in Documenti o sul Desktop: su Windows sono spesso dentro OneDrive.

**macOS**

1. **Claude Code:** la scheda Code dell'app desktop, oppure il terminale ([installazione](https://code.claude.com/docs/en/setup)).
2. **Git:** apri il Terminale e scrivi `git --version`. Se git manca, macOS propone di installare gli strumenti da riga di comando: accetta.
3. **Node.js**, versione LTS, da [nodejs.org](https://nodejs.org/). Verifica: `node --version` deve dare 22 o più.
4. **La cartella del vault**, vuota: `~/second-brain`. Non dentro Scrivania o Documenti se iCloud Drive li sincronizza.

**Per tutti**

- **Un repository privato vuoto** (senza README), per la copia di sicurezza. Facoltativo, consigliato. Quando git chiede l'accesso la prima volta, completalo tu nel browser: Claude non gestisce credenziali.
- **Un gestore di password** per le credenziali. Non entrano né nel vault né in L1.
- **Obsidian, se vuoi:** da [obsidian.md](https://obsidian.md/). Alla fine della costruzione Claude ti dice come aprire il vault e quali impostazioni usare. Nessun plugin è necessario.
- **Il vault sul telefono, se ti serve:** Obsidian Sync o un'altra sincronizzazione, decisa con Claude durante la costruzione. Mai OneDrive, iCloud Drive, Google Drive o Dropbox sulla cartella del vault: git e la sincronizzazione di file insieme creano copie in conflitto.

## Costruzione

1. Apri la cartella vuota del vault in Claude Code: nella scheda Code scegli la cartella; nel terminale entra nella cartella e scrivi `claude`.
2. Copia il blocco «Build» di [obsidian/BOOTSTRAP.md](obsidian/BOOTSTRAP.md) e incollalo come primo messaggio.

Cosa vedi:

1. Claude scarica SPEC.md, lo legge e ti riassume il piano in massimo 10 righe. Rispondi «procedi».
2. Crea il "kit di sopravvivenza": git, `NOW.md` e i file di istruzioni. Da qui una sessione nuova riparte dal disco.
3. Ti fa sei domande: nome, lingua delle pagine, aree (da due a cinque), percorso di L1, indirizzo del repository, Obsidian e note giornaliere sì o no. Con Indeck collegato può proporti le aree a partire dal tuo CORE personale, se gli dici di sì. Ti ripete le risposte e aspetta la conferma.
4. Crea cartelle, modelli di pagina, regole, script di controllo e skill. Legge lo script prima di eseguirlo.
5. Ti mostra `.claude/settings.json` prima di scriverlo. Poi ti chiede di aprire una sessione nuova nella cartella del vault e di incollare il blocco «Resume» di [obsidian/BOOTSTRAP.md](obsidian/BOOTSTRAP.md): così i permessi e le skill si caricano. Prova i permessi: può chiederti di cancellare a mano un file di prova in `raw/`.
6. Ti chiede una fonte vera da mettere in `inbox/` e fa la prima ingestione con te. Correggi quello che non ti torna: è così che lo schema si adatta a te.
7. Ti mostra l'elenco di "fatto" con la prova di ogni punto.

Se la sessione si interrompe, usa il blocco «Resume» di [obsidian/BOOTSTRAP.md](obsidian/BOOTSTRAP.md) in una sessione nuova nella stessa cartella.

## Il ritmo

Apri sempre la sessione nella cartella del vault: i permessi valgono a partire da lì.

| Comando | Quando | Quando no |
|---|---|---|
| `/ingest` | Una fonte nuova in `inbox/`: un articolo, un PDF, una cattura di chat | Materiale di clienti o dell'azienda: va in Indeck. Una fonte già elaborata |
| `/query <domanda>` | «Cosa so di…», «Cosa avevo deciso su…», prima di iniziare un lavoro su un tema | Cultura generale o dati in tempo reale: il vault non li ha |
| `/crystallize` | Una conversazione con Claude ha prodotto una decisione o una sintesi da tenere | Un ragionamento non ancora concluso |
| `/lint` | Ogni settimana, o quando qualcosa non torna. `/lint fix` ogni mese, dopo un commit | `fix` con modifiche non salvate |
| `/weekly-review` | Ogni settimana, o ogni due nel lavoro a lotti | — |
| `/new-domain <nome>` | Un'area nuova e duratura | Un argomento stretto dentro un'area esistente |
| «chiudiamo» | Fine sessione: Claude riscrive `NOW.md`, propone cosa portare in Indeck, fa il commit | — |

Dopo un periodo di pausa: `/ingest`, poi `/weekly-review`, poi `/lint`.

Ogni mese rileggi `AGENTS.md` con Claude e togli le regole che non cambiano più il suo comportamento.

Una conversazione utile su claude.ai, ChatGPT, Gemini o NotebookLM entra con il prompt di [prompt-export-chat.md](prompt-export-chat.md): metti il file in `inbox/` ed esegui `/ingest`.

## Aggiornare a lotti

Se l'aggiornamento quotidiano non ti serve, lavora a **lotti**:

1. scegli una finestra di tempo (per esempio le ultime due settimane);
2. raccogli ogni fonte personale di quella finestra: letture, corsi, catture di chat, appunti;
3. mettile in `inbox/` ed esegui `/ingest`: un commit per fonte;
4. alla fine, `/lint` e correzione dei problemi trovati.

Se una fonte non è raggiungibile (nessun connettore, allegati non letti), Claude lo scrive nella pagina. Un buco dichiarato vale più di un buco nascosto.
