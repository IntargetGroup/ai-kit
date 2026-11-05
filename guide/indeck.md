# Indeck in Claude

L'MCP di Indeck collega Claude alla memoria e ai metodi di lavoro di Intarget. Questa pagina spiega come collegarlo, cosa legge Claude, come scrive e cosa non può fare.

## Cosa ti dà

| Cosa | Strumenti | Livello |
|---|---|---|
| Chi sei e quali workspace e progetti vedi | `whoami` | lettura |
| Cercare e leggere la memoria personale, di workspace e di progetto | `memory_search`, `memory_list`, `memory_read` | lettura |
| Scrivere in memoria | `memory_guidance`, `memory_write`, `memory_delete` | scrittura |
| I metodi di lavoro (skill) | `skills_list`, `skills_read` | lettura |
| Creare e modificare le tue skill | `skills_mine`, `skills_create`, `skills_update`, `skills_import`, `skills_manage` | scrittura |
| I brief degli agenti Indeck | `catalog_agents`, `agents_read` | lettura |
| Le routine di Indeck | `routines_*` | lettura; scrittura per crearle e gestirle |
| Banche dati e scraping dell'organizzazione | `statista_*`, `semrush_*`, `apify_*`, `scrapegraph_*` | scrittura; spendono crediti dell'organizzazione |

Non devi ricordare i nomi. Ti servono per capire cosa fa Claude quando li vedi nelle sue risposte.

## Collegare Indeck

L'indirizzo è uno solo: `https://mcp.intarget.net/mcp`. Gli indirizzi precedenti smettono di funzionare dopo il periodo di migrazione.

### App desktop e claude.ai

Colleghi il connettore una volta. Vale in Chat, in Cowork e nella scheda Code (Code tab), su Windows e su macOS ([documentazione](https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities)).

Prima di iniziare controlla due cose: sei nell'organizzazione Intarget e non nel tuo account personale ([come controllare](../inizia/README.md)); hai un account Indeck attivo.

1. Apri **Personalizza → Connettori (Customize → Connectors)**. Dovresti vedere Indeck nell'elenco. Se non c'è, lo deve aggiungere un Owner dell'organizzazione: scrivi all'Innovation Hub.
2. Clicca **Connetti (Connect)** accanto a Indeck. Dovresti vedere il browser aprirsi sulla pagina di accesso di Indeck.
3. Accedi con il tuo account Indeck. Dovresti vedere la pagina che chiede il livello di accesso.
4. Scegli **scrittura** (perché: [Lettura o scrittura](#lettura-o-scrittura)) e conferma. Dovresti vedere Indeck segnato come collegato in Personalizza → Connettori.
5. Apri una chat nuova e scrivi: «Chiama whoami di Indeck e dimmi chi sono.» Dovresti vedere il tuo nome, la tua email e i workspace e progetti a cui hai accesso.

Se hai aggiunto Indeck da solo prima di novembre 2026, rimuovi quel connettore e usa quello dell'organizzazione (o aggiungilo di nuovo con l'indirizzo `https://mcp.intarget.net/mcp`). Scollegare e ricollegare non cambia l'indirizzo. Poi rifai la prova del passo 5.

### Claude Code nel terminale

Se accedi a Claude Code con l'account Intarget, i connettori dell'app arrivano anche lì. Scrivi `/mcp` in una sessione: se Indeck c'è, hai finito.

Se Indeck non c'è, aggiungilo per tutte le cartelle:

```text
claude mcp add --scope user --transport http indeck https://mcp.intarget.net/mcp
```

Senza `--scope user` Indeck vale solo nella cartella in cui hai lanciato il comando. Poi scrivi `/mcp`, scegli `indeck` e completa l'accesso nel browser ([documentazione](https://code.claude.com/docs/en/mcp)). Dovresti vedere Indeck come collegato nell'elenco di `/mcp`.

### ChatGPT e Codex

- **ChatGPT**: nelle impostazioni, sezione dei connettori, aggiungi un connettore MCP personalizzato con l'indirizzo di Indeck. Poi accedi con l'account Indeck e scegli il livello.
- **Codex**: `codex mcp add indeck --url https://mcp.intarget.net/mcp`. Se il login non parte da solo: `codex mcp login indeck`.

Usa sempre l'account aziendale, anche in questi client.

## Lettura o scrittura

Al primo accesso Indeck ti chiede il livello di accesso. La pagina di Indeck segna **scrittura** come «consigliato». Il kit consiglia lo stesso.

| Cosa può fare Claude | Lettura | Scrittura |
|---|---|---|
| Leggere e cercare nella memoria, leggere skill, brief degli agenti e routine | sì | sì |
| Scrivere e cancellare file in memoria | no | sì |
| Creare e modificare le tue skill | no | sì |
| Usare Statista, Semrush, Apify e ScrapeGraph con i crediti dell'organizzazione | no | sì |
| Creare e avviare routine con i tuoi account e il budget dell'organizzazione | no | sì |

Scegli **scrittura**. Il kit salva in Indeck in due momenti: a fine lavoro, quando dici «chiudiamo», e nel setup, quando Claude aggiorna le preferenze del tuo CORE. Scrittura aggiunge anche le skill che crei, le banche dati che spendono crediti dell'organizzazione e le routine. Claude ti mostra cosa vuole scrivere o spendere e aspetta il tuo sì: lo chiedono le istruzioni aziendali, il tuo CLAUDE.md globale e il CLAUDE.md della cartella.

Scegli **lettura** solo se non vuoi mai che Claude salvi in Indeck. Il kit funziona lo stesso: Claude ti dà il testo e tu lo incolli nell'app Indeck.

Per cambiare livello, scollega e ricollega Indeck in Personalizza → Connettori e scegli l'altro livello.

Con il livello scrittura, una scrittura di Claude entra subito in memoria, senza un clic in Indeck. Il tuo sì in Claude è una regola per il modello, non un blocco. Se vuoi approvare tu ogni scrittura anche in Indeck, attiva l'approvazione nelle impostazioni dell'app Indeck. La puoi attivare separatamente per memoria personale, di progetto e di workspace.

## Cosa legge Claude all'inizio di un lavoro

Nell'app Indeck il tuo contesto arriva all'agente da solo. Con l'MCP non arriva niente: Claude lo deve chiedere, in quest'ordine.

1. `whoami`: chi sei e quali workspace e progetti vedi, con i loro id.
2. `memory_read` del `CORE.md` personale: il tuo lavoro, cosa hai sul piatto, le tue preferenze.
3. `memory_read` del `CORE.md` del workspace o del progetto, quando il lavoro ne riguarda uno. Il CLAUDE.md della cartella dice quale. Se non è chiaro, Claude te lo chiede.
4. `memory_search` prima di affermare fatti su Intarget, sui clienti o sui progetti, solo negli spazi del lavoro. Poi `memory_read` della fonte prima di citarla.
5. `skills_list` e `skills_read` prima di inventare un metodo.
6. `memory_guidance` prima di scrivere.

Se uno spazio non compare in `whoami` o non si legge, Claude te lo chiede. Non prova altri id.

Non devi chiederlo tu a ogni chat. Nella scheda Code lo chiede a Claude il tuo [CLAUDE.md globale](../inizia/modelli/CLAUDE-globale.md). In Chat e in Cowork lo chiede lo stesso testo, incollato in **Impostazioni → Istruzioni per Claude (Settings → Instructions for Claude)**. Su claude.ai valgono anche le [istruzioni aziendali](../org/rendering/claude-ai.md). Nella scheda Code arrivano solo se un amministratore le pubblica nelle impostazioni gestite; per Cowork la documentazione non lo dice. Per questo il tuo testo personale ripete le regole su Indeck. Claude legge il contesto una volta all'inizio del lavoro, non a ogni messaggio. Una richiesta generica non ha bisogno di Indeck.

Se Claude risponde senza conoscerti, scrivi: «Leggi il mio CORE di Indeck e il CORE del progetto «nome».» Dovresti vedere un riassunto di chi sei e del progetto. Se il CORE non è aggiornato da più di 30 giorni, Claude te lo dice: aggiornalo prima di fidarti di «cosa hai sul piatto».

Cosa scrivere nel CORE e come tenerlo corto: [guide/memoria.md](memoria.md#il-contratto-del-core-di-indeck).

## Workspace e progetto

| | Workspace | Progetto |
|---|---|---|
| Cos'è | uno per cliente o brand, o per un team interno | un incarico, un deliverable o una gara, dentro un workspace o personale |
| Dura | finché dura il rapporto | finché dura l'incarico |
| La memoria contiene | contesto del cliente e del brand, ruoli del team, convenzioni, decisioni che valgono oltre un progetto | brief, decisioni, stakeholder, consegne, fili aperti di quell'incarico |
| Chi cura la memoria | owner e admin del workspace | chi ha creato il progetto, di solito il PM |

Le regole:

- Il contesto del brand vive nel workspace. Non copiarlo nei progetti.
- Un prospect o una gara è un progetto nel workspace del team, non un workspace nuovo.
- Dai accesso solo a chi serve.
- Condividi i risultati e la memoria, non le chat. Le chat sono appunti di lavoro.
- Per citare un altro spazio, scrivi il tipo e il nome: «progetto X», «workspace Y».

**Fissa l'id nel CLAUDE.md della cartella.** Due progetti possono avere lo stesso nome, e `whoami` non dice a quale workspace appartiene un progetto. Per questo il CLAUDE.md della cartella riporta nome e id: «Workspace: «nome» («id»)». Il [prompt di setup](../inizia/prompt-di-setup.md) lo compila con te. Per trovare un id a mano, chiedi: «Chiama whoami e dammi l'id del progetto «nome».»

Se un workspace o un progetto non compare in `whoami`, non ne sei membro oppure il progetto è archiviato. Chiedi l'accesso a chi lo cura.

## Scrivere in memoria

Serve il livello [scrittura](#lettura-o-scrittura).

1. Chiedi a Claude cosa salvare e dove, per esempio: «Salva le decisioni di oggi nel progetto «nome».» Dovresti vedere una proposta: lo scope, il file, il testo.
2. Per più di un fatto (una riunione, un documento, una ricerca), Claude usa la skill «Ingestione in memoria Indeck». La trova con `skills_list` cercando «ingestione». Dovresti vedere Claude leggere la skill prima di scrivere.
3. Rispondi sì, oppure correggi la proposta. Dovresti vedere Claude scrivere e poi rileggere il file salvato.
4. Leggi il resoconto finale. Dovresti vedere cosa è stato scritto, dove, e cosa della fonte è rimasto fuori e perché.

Prima di scrivere Claude legge `memory_guidance`: sono le regole della casa su struttura, fonti e collegamenti. Tu non devi leggerle.

Se una scrittura risponde `requires_approval`, `denied_by_user` o con un errore, non è stato scritto niente. Claude te lo dice e non riprova da solo. Approvala nell'app Indeck, o lascia stare.

## Le skill di Indeck in Claude

Le skill di Indeck sono i metodi di lavoro validati di Intarget. Claude le usa in due modi.

- **Le legge al momento.** Chiedi: «C'è una skill di Indeck per un report di riunione?» Claude usa `skills_list` e `skills_read`. Così la skill è sempre l'ultima versione.
- **Le installa.** Per una skill che usi spesso, Claude può usare una copia installata quando la richiesta corrisponde, senza che tu la nomini. `skills_read` con `bundle: true` dà un link a uno ZIP della skill, con `SKILL.md` alla radice. Il link dura 5 minuti: Claude lo usa subito.
  - **scheda Code**: chiedi «Installa la skill «nome» di Indeck tra le mie skill personali.» Claude estrae lo ZIP in una sottocartella con il nome della skill: `%USERPROFILE%\.claude\skills\<nome-skill>\` (Windows) o `~/.claude/skills/<nome-skill>/` (macOS). Il file deve risultare `...\skills\<nome-skill>\SKILL.md`. In una sessione nuova chiedi «Quali skill personali vedi?». Dovresti vedere la skill nell'elenco.
  - **Cowork**: Cowork non legge quella cartella. Scarica lo ZIP dal link e caricalo in **Personalizza → Skill (Customize → Skills)**, pulsante + → **Crea skill (Create skill)** ([documentazione](https://support.claude.com/en/articles/12512180-using-skills-in-claude)). Dovresti vedere la skill nell'elenco delle tue skill.

Una copia installata non si aggiorna da sola. Quando la skill cambia in Indeck, installala di nuovo. Se una skill serve a tutti, chiedi all'Innovation Hub di renderla una skill dell'organizzazione.

Alcune skill usano strumenti che esistono solo nell'app Indeck. Claude può leggerle ma non eseguirle: in quel caso fai quel lavoro in Indeck.

## Agenti e routine

**Gli agenti sono brief, non esecutori.** `catalog_agents` elenca gli agenti di Indeck. `agents_read` dà a Claude il metodo di uno di loro. Claude lavora con quel metodo e con i propri strumenti. L'agente di Indeck non parte. Esempio: «Leggi il brief dell'agente «nome» e prepara l'analisi con il suo metodo.»

**Le routine di Indeck girano sul budget dell'organizzazione e con i tuoi account.** Claude può prepararne una bozza (`routines_create`). Tu la provi e la attivi nell'app Indeck. Usa una routine di Indeck quando i risultati devono arrivare ai colleghi in Indeck. Se il risultato serve solo a te, un'attività programmata di Claude Code (`/schedule`) gira con il tuo account Claude e legge Indeck tramite il connettore.

## Cosa l'MCP non può fare

Queste cose restano nell'app Indeck:

- le «Istruzioni» dei workspace e dei progetti;
- il tuo profilo e la personalizzazione di Indeck (ruolo, tono, istruzioni aggiuntive);
- le chat di Indeck;
- l'esecuzione degli agenti di Indeck;
- i file caricati nei progetti, salvo i riassunti che Indeck ha scritto in memoria;
- i tuoi collegamenti Google e Zoho dentro Indeck. In Claude usi i connettori di Claude: [guide/fonti.md](fonti.md).

## Limiti da conoscere

- **Indeck mostra a Claude solo quello che vedi tu.** Un file riservato non compare. Un risultato assente non prova che il fatto non esista.
- **La ricerca funziona meglio con parole chiave precise.** Se Claude non trova, chiedigli di cercare il nome del cliente, del progetto o del documento.
- **Strumenti nuovi arrivano con una sessione nuova.** Dopo un aggiornamento di Indeck, apri una chat nuova o riavvia l'app.
- **I risultati molto grandi nella scheda Code finiscono in un file.** Claude deve leggere il file, non fermarsi all'anteprima.

## Problemi frequenti

| Cosa vedi | Cosa fare |
|---|---|
| Claude dice che non ha strumenti di Indeck | Controlla in Personalizza → Connettori che Indeck sia collegato. Poi apri una chat nuova. |
| Indeck non c'è tra i connettori | Lo aggiunge un Owner dell'organizzazione. Scrivi all'Innovation Hub. |
| Sei nell'account personale | Passa all'organizzazione Intarget ([come](../inizia/README.md)), poi collega Indeck lì. |
| Il login di Indeck non si completa | Entra prima in Indeck nel browser con il tuo account, poi riprova Connetti. |
| Hai aggiunto Indeck da solo prima di novembre 2026 e ora dà errore | Rimuovi quel connettore e usa quello dell'organizzazione, o aggiungilo di nuovo con l'indirizzo `https://mcp.intarget.net/mcp`. Poi chiedi «Chiama whoami di Indeck e dimmi chi sono». |
| In Cowork o nella scheda Code Claude non legge il tuo CORE | Nella scheda Code scrivi `/context`. Se l'elenco dei file non compare, chiedi «Quali file di istruzioni hai caricato in questa sessione?». In Cowork controlla che il testo del globale sia in Istruzioni per Claude. |
| La memoria personale risponde «Memory is disabled» | La memoria è spenta nelle impostazioni dell'app Indeck. Riaccendila. |
| Una scrittura non va a buon fine per mancanza di permessi | Sei collegato in lettura. Ricollega Indeck e scegli scrittura. |
| Uno strumento di Indeck dà un errore subito dopo un aggiornamento di Indeck | La sessione vede gli strumenti vecchi. Riavvia l'app o apri una sessione nuova. |
| Un workspace o un progetto non compare | Non ne sei membro o il progetto è archiviato. Chiedi l'accesso a chi lo cura. |
| Aprendo l'indirizzo nel browser vedi una pagina informativa | È normale: l'indirizzo è un server MCP, non un sito. |
