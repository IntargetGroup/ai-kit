# Istruzioni aziendali — guida per gli amministratori

Per chi è Owner dell'organizzazione Intarget su Claude (piano Team). Qui trovi cosa pubblicare, dove, e come verificare che funzioni.

| File | Cosa è |
|---|---|
| [`istruzioni.md`](istruzioni.md) | il perché di ogni regola, per chi deve approvarle |
| [`rendering/claude-ai.md`](rendering/claude-ai.md) | **il testo canonico** (≤ 3.000 caratteri) |
| [`rendering/claude-code-managed-settings.json`](rendering/claude-code-managed-settings.json) | impostazioni gestite di Claude Code: lo stesso testo in `claudeMd`, l'MCP di Indeck per tutti, tre regole di sicurezza |
| [`rendering/indeck-mcp-server-instructions.md`](rendering/indeck-mcp-server-instructions.md) | proposta di nuove istruzioni del server MCP di Indeck (modifica di prodotto) |

## Prima di pubblicare

La v1 è una proposta. Prima della pubblicazione servono tre decisioni:

1. **Scrittura in memoria.** Il testo dice: Claude propone le decisioni e gli esiti a fine lavoro e scrive dopo il sì. Il principio: le discussioni di lavoro vanno in memoria, i contenuti personali mai. Resta da decidere il *come*: con una conferma a fine lavoro (v1) o in automatico, senza chiedere. L'automatico rende la memoria più completa, ma toglie alle persone il controllo su cosa entra. Va deciso insieme alla policy d'uso di Indeck; se si sceglie l'automatico, cambia una riga della sezione Memoria.
2. **Account aziendali.** Il testo chiede di usare solo account aziendali. Prima del rilascio, allinealo con chi gestisce gli accessi.
3. **Livello di accesso all'MCP.** Il kit consiglia scrittura, come la pagina di consenso di Indeck, perché il ciclo di lavoro salva in memoria a fine lavoro. Scrittura aggiunge anche la creazione di skill, i connettori che consumano crediti dell'organizzazione e le routine. La regola è in un posto solo: [guide/indeck.md](../guide/indeck.md#lettura-o-scrittura).

## Pubblicare, in quest'ordine

### 1. Il connettore di Indeck per tutta l'organizzazione

Su claude.ai, come Owner: Personalizza (Customize) → Connettori (Connectors) → Aggiungi (Add) → Personalizzato (Custom) → Web, indirizzo `https://mcp.intarget.net/mcp`, accesso con OAuth. Il connettore vale per tutta l'organizzazione. Dopo, ogni persona va in Personalizza → Connettori, clicca Connetti (Connect) e accede con il suo account Indeck.

Il connettore vale per Chat, Cowork, app desktop e mobile, e compare anche in Claude Code per chi accede con l'account claude.ai ([connettori](https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities), [Claude Code e connettori](https://code.claude.com/docs/en/mcp)).

Chi ha aggiunto Indeck da solo prima di novembre 2026 può avere un indirizzo vecchio, che smette di funzionare dopo la finestra di migrazione: deve rimuovere quel connettore e usare quello dell'organizzazione. Scollegare e ricollegare non cambia l'indirizzo.

### 2. Le istruzioni dell'organizzazione

Su claude.ai: Impostazioni dell'organizzazione → Organizzazione e accesso → Istruzioni dell'organizzazione. Incolla il blocco tra `<!-- begin -->` e `<!-- end -->` di [`rendering/claude-ai.md`](rendering/claude-ai.md). Limite: 3.000 caratteri. Le modifiche possono richiedere fino a un'ora ([istruzioni dell'organizzazione](https://support.claude.com/en/articles/14546867-set-organization-preferences)).

Se nelle istruzioni attuali c'è già un testo aziendale, sostituiscilo: due testi aziendali si sommano e si contraddicono.

La documentazione dice che queste istruzioni valgono "across Claude products", ma non nomina Cowork e la scheda Code. Verificalo (vedi sotto) prima di contarci.

### 3. Le impostazioni gestite di Claude Code

Su claude.ai: Impostazioni dell'organizzazione → Claude Code → Managed settings ([impostazioni gestite dal server](https://code.claude.com/docs/en/server-managed-settings)). Se c'è già un JSON, non sostituirlo: unisci le chiavi di [`rendering/claude-code-managed-settings.json`](rendering/claude-code-managed-settings.json) a quelle esistenti e conserva le altre regole.

Cosa fa:
- `claudeMd`: lo stesso testo delle istruzioni aziendali, caricato prima dei CLAUDE.md personali e di progetto. Le persone non possono disattivarlo.
- `managedMcpServers`: aggiunge l'MCP di Indeck in Claude Code per tutti. Se una persona ha anche il connettore claude.ai con lo stesso indirizzo, Claude Code ne tiene uno solo.
- `permissions.deny`: gli strumenti di file di Claude e i comandi riconosciuti non leggono chiavi SSH e credenziali cloud nella cartella personale. Non blocca ogni lettura fatta da uno script: per quello serve un isolamento del sistema.
- `companyAnnouncements`: un avviso con il link a questo kit all'avvio.

Limiti noti:
- Valgono per Claude Code in terminale, negli IDE e nella scheda Code dell'app desktop. **Non valgono in Cowork.**
- Sono uguali per tutti: oggi non si possono differenziare per gruppo.
- Le impostazioni che eseguono comandi (hook, variabili d'ambiente) chiedono un'approvazione a ogni persona. Questo file non ne contiene.

Il controllo `node scripts/check.mjs` fallisce se `claudeMd` e il blocco canonico divergono.

### 4. Le istruzioni del server MCP di Indeck

Il testo [proposto](rendering/indeck-mcp-server-instructions.md) aggiunge la regola che oggi manca: all'inizio del lavoro leggere il CORE personale. È l'unico testo che viaggia con il connettore verso ogni client, anche fuori da Claude (ChatGPT, Codex). Lo usa il client che legge il campo `instructions`: Claude Code sì; per claude.ai, Cowork e gli altri non è documentato. È una modifica al prodotto Indeck, con il suo processo di rilascio.

Nella stessa modifica allinea la pagina informativa dell'MCP a questi punti:
- per Claude Code il comando corretto è `claude mcp add --scope user --transport http indeck https://mcp.intarget.net/mcp` (senza `--scope user` Indeck vale solo nella cartella corrente);
- per Codex il comando corretto è `codex mcp add indeck --url https://mcp.intarget.net/mcp`;
- le scritture in memoria si applicano subito, salvo che la persona abbia attivato l'approvazione nelle impostazioni di Indeck.

### 5. Annunciare

Un messaggio breve, dopo che i passi 1–3 funzionano:

> Da oggi Claude può conoscerti come Indeck. Collega Indeck in Personalizza → Connettori, poi segui la guida "Inizia" del kit (15 minuti): github.com/IntargetGroup/ai-kit/tree/main/inizia. Problemi con Indeck o con l'accesso: Innovation Hub.

## Verificare

Fai ogni prova in una sessione nuova, con un account che non è Owner.

| Dove | Prova | Risultato atteso |
|---|---|---|
| Chat | "Quali istruzioni aziendali hai?" | riassume le regole della v1 |
| Chat | "Chiama whoami di Indeck e dimmi chi sono" | nome, email, workspace raggiungibili |
| Chat | una domanda generica (ricetta, traduzione) | nessuna chiamata a Indeck |
| Cowork | una domanda aziendale, una richiesta generica, una proposta di salvataggio | legge il CORE quando serve, non chiama Indeck per la richiesta generica, chiede prima di scrivere; se una prova fallisce, Cowork non è configurato |
| Code (app desktop) | `/context` | compare il testo gestito; compare Indeck tra gli MCP |
| Claude Code (terminale) | `claude doctor` | riga "Managed settings (remote)" presente |
| Claude Code | "Su cosa sto lavorando?" | legge il CORE personale prima di rispondere |

## Manutenzione

- Ogni modifica passa da una pull request su questo repository. Aggiorna sempre insieme il blocco canonico e `claudeMd`.
- Revisione mensile: togli le righe che non cambiano più nessun comportamento.
- Annota in [`../CHANGELOG.md`](../CHANGELOG.md) ogni modifica che cambia il comportamento di Claude.
