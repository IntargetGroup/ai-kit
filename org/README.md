# Istruzioni aziendali — guida per gli amministratori

Per chi è Owner dell'organizzazione Intarget su Claude (piano Team). Qui trovi cosa pubblicare, dove, e come verificare che funzioni.

| File | Cosa è |
|---|---|
| [`istruzioni.md`](istruzioni.md) | il perché di ogni regola, per chi deve approvarle |
| [`rendering/claude-ai.md`](rendering/claude-ai.md) | **il testo canonico** (≤ 3.000 caratteri, in inglese perché lo legge Claude) |
| [`rendering/claude-code-managed-settings.json`](rendering/claude-code-managed-settings.json) | impostazioni gestite di Claude Code: lo stesso testo in `claudeMd`, il blocco della lettura delle credenziali, un avviso all'avvio |
| [`rendering/indeck-mcp-server-instructions.md`](rendering/indeck-mcp-server-instructions.md) | le istruzioni che il server MCP di Indeck invia a ogni client, in produzione dal 2026-11-06 |

## Prima di pubblicare

La v1 è una proposta. Prima della pubblicazione servono tre decisioni:

1. **Scrittura in memoria.** Il testo dice: Claude propone le decisioni e gli esiti a fine lavoro e scrive dopo il sì. Il principio: le discussioni di lavoro vanno in memoria, i contenuti personali mai. Resta da decidere il *come*: con una conferma a fine lavoro (v1) o in automatico, senza chiedere. L'automatico rende la memoria più completa, ma toglie alle persone il controllo su cosa entra. Va deciso insieme alla policy d'uso di Indeck; se si sceglie l'automatico, cambia una riga della sezione Memory.
2. **Account aziendali.** Il testo chiede di usare solo account aziendali. Prima del rilascio, allinealo con chi gestisce gli accessi.
3. **Livello di accesso all'MCP.** Il kit consiglia scrittura, come la pagina di consenso di Indeck, perché il ciclo di lavoro salva in memoria a fine lavoro. Scrittura aggiunge anche la creazione di skill, i connettori che consumano crediti dell'organizzazione e le routine. La regola è in un posto solo: [guide/indeck.md](../guide/indeck.md#lettura-o-scrittura).

## Pubblicare, in quest'ordine

### 1. Il connettore di Indeck per tutta l'organizzazione

Su claude.ai, come Owner: Impostazioni dell'organizzazione → Connettori (Organization settings → Connectors) → Aggiungi (Add) → Personalizzato (Custom) → Web. Nome `Indeck`, indirizzo `https://mcp.intarget.net/mcp`. Nell'autenticazione scegli l'accesso di ogni persona con OAuth, non una credenziale condivisa: con una credenziale condivisa ogni persona vede ciò che vede quella credenziale ([connettori personalizzati](https://support.claude.com/en/articles/11175166-getting-started-with-custom-connectors-using-remote-mcp)).

Aggiungere il connettore non collega nessuno. Ogni persona va in Personalizza → Connettori (Customize → Connectors), trova Indeck, clicca Connetti (Connect) e accede con il suo account Indeck.

Il connettore arriva in Chat, Cowork e nell'app desktop. Arriva anche in Claude Code per chi accede con l'account claude.ai: terminale e IDE lo scaricano da claude.ai, la scheda Code lo riceve dall'app ([come i connettori arrivano in Claude Code](https://code.claude.com/docs/en/mcp#how-connectors-reach-claude-code)). Per questo le impostazioni gestite del passo 3 non aggiungono Indeck.

Chi ha aggiunto Indeck da solo prima di novembre 2026 può avere un indirizzo vecchio, che smette di funzionare dopo la finestra di migrazione: deve rimuovere quel connettore e usare quello dell'organizzazione. Scollegare e ricollegare non cambia l'indirizzo. In Claude Code, un server aggiunto a mano con lo stesso indirizzo del connettore prevale su di esso, e `/mcp` mostra il connettore come nascosto: la connessione resta una sola ([precedenza](https://code.claude.com/docs/en/mcp#scope-hierarchy-and-precedence)).

### 2. Le istruzioni dell'organizzazione

Su claude.ai, come Owner: Impostazioni dell'organizzazione → Organizzazione e accesso (Organization settings → Organization and access), sezione Istruzioni dell'organizzazione (Organization instructions). Incolla il blocco tra `<!-- begin -->` e `<!-- end -->` di [`rendering/claude-ai.md`](rendering/claude-ai.md) e salva. Limite: 3.000 caratteri. Le modifiche possono richiedere fino a un'ora ([istruzioni dell'organizzazione](https://support.claude.com/en/articles/14546867-set-organization-preferences)).

Sostituisci il testo che c'è già nel campo: due versioni nello stesso campo si contraddicono. Se un'istruzione personale contraddice quelle dell'organizzazione, prevalgono quelle dell'organizzazione; le istruzioni personali valgono per tutto il resto.

La documentazione dice che le modifiche arrivano "across Claude products", ma non nomina Cowork e la scheda Code. Verificalo (vedi sotto) prima di contarci.

### 3. Le impostazioni gestite di Claude Code

Su claude.ai, come Owner: [Impostazioni dell'organizzazione → Claude Code (Organization settings → Claude Code)](https://claude.ai/admin-settings/claude-code), sezione Managed settings ([impostazioni gestite dal server](https://code.claude.com/docs/en/server-managed-settings)). Se c'è già un JSON, non sostituirlo: unisci le chiavi di [`rendering/claude-code-managed-settings.json`](rendering/claude-code-managed-settings.json) a quelle esistenti e conserva le altre regole.

Prima di salvare, guarda il pulsante. Se dice Add with errors o Update with errors, l'editor ha trovato un errore di schema nel JSON. Il pulsante salva lo stesso, ma questo file non deve produrre errori: correggi prima di salvare.

Cosa fa:
- `claudeMd`: lo stesso testo delle istruzioni aziendali, caricato come CLAUDE.md gestito prima dei CLAUDE.md personali e di progetto. I testi si sommano, non si sostituiscono. Una persona non può escluderlo con `claudeMdExcludes`; una sessione avviata con il caricamento dei CLAUDE.md disattivato non carica neanche questo ([CLAUDE.md per l'organizzazione](https://code.claude.com/docs/en/memory#deploy-organization-wide-claude-md)). È una guida per Claude, non un blocco tecnico.
- `permissions.deny`: un blocco tecnico. Gli strumenti di file di Claude, i comandi di file che Claude Code riconosce (`cat`, `head` e simili) e le redirezioni non leggono le chiavi SSH e le credenziali AWS e Google Cloud nella cartella personale (`~/.config/gcloud` su macOS, `~/AppData/Roaming/gcloud` su Windows). Nessuna impostazione personale o di progetto può annullarlo. Non ferma uno script che apre i file da solo: per quello serve il sandbox ([regole Read e Edit](https://code.claude.com/docs/en/permissions#read-and-edit)).
- `companyAnnouncements`: un avviso con il link a questo kit all'avvio di Claude Code nel terminale. La scheda Code non mostra gli avvisi ([differenze della scheda Code](https://code.claude.com/docs/en/desktop#claude-code-settings-that-behave-differently-in-the-code-tab)).

Il file non contiene `managedMcpServers`: Indeck arriva già dal connettore del passo 1. L'editor controlla il JSON con lo [schema pubblico](https://json.schemastore.org/claude-code-settings.json), che per questa chiave prevede una lista; Claude Code richiede un oggetto ([MCP gestiti](https://code.claude.com/docs/en/managed-mcp)), quindi la chiave produrrebbe un errore di schema.

Dove valgono: Claude Code nel terminale, negli IDE, nella scheda Code dell'app desktop e nelle sessioni cloud, per chi accede con l'account dell'organizzazione. Claude Code le scarica all'avvio e ogni ora. **Non valgono in Cowork**: lì Claude Code non scarica le impostazioni della console ([dove si applica una policy](https://code.claude.com/docs/en/managed-settings#where-and-when-a-policy-applies)).

Limiti noti:
- Sono uguali per tutti: oggi non si possono differenziare per gruppo.
- Le impostazioni che eseguono comandi (hook, alcune variabili d'ambiente) chiedono un'approvazione a ogni persona. `claudeMd` non la chiede da Claude Code v2.1.260; le versioni precedenti la chiedevano. Questo file non contiene impostazioni da approvare.
- Sono un controllo sul client, non un confine di sicurezza: su un computer non gestito una persona può aggirarle.

Il controllo `node scripts/check.mjs` fallisce se `claudeMd` e il blocco canonico divergono.

### 4. Le istruzioni del server MCP di Indeck

Sono [in produzione](rendering/indeck-mcp-server-instructions.md) dal 2026-11-06 e non richiedono azioni dell'amministratore. Aggiungono la regola che mancava: all'inizio del lavoro leggere il CORE personale. È l'unico testo che viaggia con il connettore verso ogni client, anche fuori da Claude (ChatGPT, Codex). Claude Code lo carica; per claude.ai e Cowork non è documentato. Ogni modifica passa dal rilascio di Indeck.

### 5. Annunciare

Un messaggio breve, dopo che i passi 1–3 funzionano:

> Da oggi Claude può conoscerti come Indeck. Collega Indeck in Personalizza → Connettori, poi segui la guida "Inizia" del kit (15 minuti): github.com/IntargetGroup/ai-kit/tree/main/inizia. Problemi con Indeck o con l'accesso: Innovation Hub.

## Verificare

Fai ogni prova in una sessione nuova, con un account che non è Owner. Claude deve rispondere in italiano.

| Dove | Prova | Risultato atteso |
|---|---|---|
| Chat | «Quali istruzioni aziendali hai?» | riassume le regole della v1 |
| Chat | «Chiama whoami di Indeck e dimmi chi sono» | nome, email, workspace raggiungibili |
| Chat | una domanda generica (ricetta, traduzione) | nessuna chiamata a Indeck |
| Cowork | una domanda aziendale, una richiesta generica, una proposta di salvataggio | legge il CORE quando serve, non chiama Indeck per la richiesta generica, chiede prima di scrivere; se una prova fallisce, le istruzioni aziendali non arrivano in Cowork |
| Code (app desktop) | «Quali istruzioni aziendali hai? Quali connettori hai in questa sessione?» | riassume le regole della v1; elenca Indeck |
| Claude Code (terminale) | `claude doctor` | la riga `Managed settings (remote)` dice che le impostazioni sono caricate (Claude Code v2.1.248 o successivo) |
| Claude Code (terminale) | `/status` | la riga `Setting sources` contiene `Enterprise managed settings (remote)` |
| Claude Code (terminale) | `/mcp` | Indeck compare tra i connettori claude.ai; se manca, `/status` mostra un accesso diverso dall'account claude.ai |
| Claude Code | «Su cosa sto lavorando?» | legge il CORE personale prima di rispondere |

Le prove dei comandi vengono da [verificare la consegna](https://code.claude.com/docs/en/server-managed-settings#verify-settings-delivery) e da [controllare che una policy sia attiva](https://code.claude.com/docs/en/managed-settings#check-that-a-policy-is-in-force).

## Manutenzione

- Ogni modifica passa da una pull request su questo repository. Aggiorna sempre insieme il blocco canonico e `claudeMd`.
- Revisione mensile: togli le righe che non cambiano più nessun comportamento.
- Annota in [`../CHANGELOG.md`](../CHANGELOG.md) ogni modifica che cambia il comportamento di Claude.
