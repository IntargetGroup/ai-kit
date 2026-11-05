# L'app desktop: Chat, Cowork e Code

L'app desktop di Claude ha tre modalità: Chat, Cowork e Code. Ognuna legge istruzioni diverse. Questa pagina dice cosa legge ognuna, quando usarla e come prepararla su Windows.

Le voci dell'app sono scritte in italiano, con il nome inglese tra parentesi la prima volta. I nomi delle modalità della scheda Code restano in inglese, come nella documentazione.

## Quale modalità usare

| Se devi… | Usa |
|---|---|
| fare una domanda, scrivere una mail, preparare una bozza breve | **Chat** |
| lavorare su documenti in una cartella: riassumere PDF, preparare un documento o un Excel da più file, lavoro d'ufficio in più passaggi | **Cowork** o **Code** |
| analizzare un Excel grande o un export da molte righe, far girare uno script, aprire pagine web in un browser integrato | **Code** |
| preparare il kit: CLAUDE.md globale e prima cartella | **Code** |

Il nome inganna: la scheda Code lavora su qualsiasi file, non solo sul codice. Fa tutto quello che fa Cowork. In più ti mostra i comandi che usa, legge il CLAUDE.md globale e ti dà il controllo completo di istruzioni e skill ([documentazione](https://code.claude.com/docs/en/desktop)).

Il consiglio per chi non programma: fai il setup nella scheda Code, poi lavora ogni giorno in Code o in Cowork, come ti trovi meglio.

## Cosa legge ogni modalità

| | Chat | Cowork | Code |
|---|---|---|---|
| Istruzioni aziendali | sì | non documentato | solo dopo che l'amministratore le pubblica nelle impostazioni gestite di Claude Code |
| Le tue Istruzioni per Claude (Instructions for Claude) | sì | sì | non documentato |
| CLAUDE.md globale | no | no | sì |
| CLAUDE.md della cartella | no | non documentato | sì |
| Istruzioni della cartella (pannello Personalizza, Customize) | no | sì, quando selezioni una cartella | non documentato |
| Skill dell'account e dell'organizzazione su claude.ai | sì | sì | sì |
| Skill nella cartella `.claude\skills` del tuo computer | no | no | sì |
| Connettori, compreso l'MCP di Indeck | sì | sì | sì |
| File sul computer | solo quelli che alleghi | solo le cartelle che colleghi | la cartella della sessione; altri percorsi con il tuo permesso |
| Memoria | memoria di claude.ai, se l'organizzazione l'ha attivata | nessuna, nelle sessioni sul tuo computer | memoria automatica, sul tuo computer, per cartella |

Fonti: [Cowork](https://claude.com/docs/cowork/overview), [scheda Code](https://code.claude.com/docs/en/desktop), [istruzioni personali](https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features). Il testo delle istruzioni aziendali: [org/rendering/claude-ai.md](../org/rendering/claude-ai.md). Dove arriva: [org/istruzioni.md](../org/istruzioni.md#dove-arriva-ogni-testo).

### Lo stesso testo in due posti

Il CLAUDE.md globale e le Istruzioni per Claude sono lo stesso testo in due posti, perché Code legge il file e Chat e Cowork leggono le impostazioni.

- Il file: `%USERPROFILE%\.claude\CLAUDE.md` su Windows, cioè `C:\Users\<nome>\.claude\CLAUDE.md`. Su macOS: `~/.claude/CLAUDE.md`.
- Le impostazioni: clicca le tue iniziali in basso a sinistra, poi Impostazioni → Istruzioni per Claude (Settings → Instructions for Claude).

Il [prompt di setup](../inizia/prompt-di-setup.md) scrive il file e ti stampa il testo da incollare nelle impostazioni. Quando cambi uno dei due, copia la modifica nell'altro. Le preferenze di lavoro hanno la fonte nel CORE personale di Indeck: il testo globale ne tiene solo una riserva per quando Indeck non è disponibile ([guide/memoria.md](memoria.md)). Cosa scrivere: [modello di CLAUDE.md globale](../inizia/modelli/CLAUDE-globale.md).

## Prima di tutto: l'account giusto

Clicca le tue iniziali o il tuo nome in basso a sinistra. Il segno di spunta blu indica l'account attivo. Deve essere l'organizzazione Intarget, non il tuo account personale gratuito. Se manca Cowork o il connettore di Indeck, controlla questo per primo. I passi completi: [inizia/README.md](../inizia/README.md).

## Prepararsi su Windows

### Code

Non devi installare niente oltre all'app. Code su Windows usa PowerShell, che c'è sempre. Git per Windows è facoltativo: serve solo per lavorare in copie isolate del progetto e per alcune automazioni ([documentazione](https://code.claude.com/docs/en/troubleshoot-install)).

### Cowork

Cowork ha requisiti più stretti ([installazione](https://claude.com/docs/third-party/claude-desktop/installation), [checklist Windows](https://claude.com/docs/government/deploy-desktop/windows-checklist)):

- l'app installata dal pacchetto `.msix`: il vecchio installer `.exe` dà l'app senza Cowork;
- Windows 10 versione 2004 (build 19041) o successiva, oppure Windows 11, non in modalità S;
- la virtualizzazione hardware attiva e la funzione di Windows «Virtual Machine Platform»;
- i diritti di amministratore, per installare il pacchetto e attivare quella funzione;
- almeno 8 GB di memoria e circa 20 GB liberi sul disco.

Per sapere se il tuo computer è pronto, usa il controllo di Anthropic che trovi nella pagina di installazione. Se il computer è pronto, il controllo scrive «This computer is ready for Cowork». Se non lo è, chiedi a chi gestisce i computer in azienda e intanto lavora nella scheda Code.

Se il computer è pronto ma non vedi Cowork, l'organizzazione può averlo disattivato. Chiedilo all'Innovation Hub.

## Scegliere la cartella

Usa la stessa cartella di lavoro in Code e in Cowork: `C:\Users\<nome>\Lavoro-Claude` su Windows, `~/Lavoro-Claude` su macOS ([kit/primo-workspace](../kit/primo-workspace/LEGGIMI.md)). Non spostarla dopo: la memoria automatica della scheda Code è legata al percorso ([guide/memoria.md](memoria.md)). Per un secondo argomento crea una cartella accanto, `Lavoro-Claude-<argomento>`, mai una dentro l'altra.

### Nella scheda Code

1. Apri una nuova sessione. Sotto la casella del messaggio c'è una riga di controlli.
2. Nel primo controllo, l'ambiente, lascia il tuo computer. Una sessione nel cloud non legge il CLAUDE.md globale.
3. Clicca il controllo della cartella, accanto all'ambiente, e scegli la tua cartella di lavoro. Dovresti vedere il nome della cartella nella riga.
4. Scrivi `/context` e invia. Dovresti vedere, tra i file di istruzioni, il CLAUDE.md globale (`C:\Users\<nome>\.claude\CLAUDE.md`) e quello della cartella. Se l'elenco dei file non compare, chiedi: «Quali file di istruzioni hai caricato in questa sessione?».

Se manca il globale, controlla che il file sia in `%USERPROFILE%\.claude\CLAUDE.md` e apri una sessione nuova.

### In Cowork

La documentazione non dice se Cowork legge il CLAUDE.md di una cartella. Per non dipendere da questo, dopo aver collegato la cartella metti una riga nelle sue istruzioni.

1. Apri Cowork.
2. Collega la tua cartella di lavoro. Cowork non vede nessun file finché non colleghi una cartella. Puoi collegarne altre dopo. Dovresti vedere il nome della cartella nella sessione.
3. Apri il pannello Personalizza e trova le istruzioni della cartella. Valgono quando quella cartella è selezionata.
4. Incolla questa riga e salva:

   ```text
   All'inizio di ogni attività leggi CLAUDE.md e STATO.md in questa cartella e seguili.
   ```

5. Apri una nuova attività e chiedi: «Cosa dice il CLAUDE.md di questa cartella?». Dovresti vedere un riassunto del file, non una risposta generica.

Se nelle istruzioni della cartella compaiono regole nuove, spostale nel CLAUDE.md della cartella e lascia solo la riga del passo 4. Così le regole hanno un posto solo.

## Quanto lavora da solo

### Le modalità della scheda Code

Cambi modalità dal selettore nella riga sotto la casella del messaggio, anche a sessione avviata ([documentazione](https://code.claude.com/docs/en/desktop)).

| Modalità | Cosa fa Claude |
|---|---|
| Manual | Chiede prima di modificare un file o eseguire un comando. Vedi ogni modifica e la accetti o la rifiuti. |
| Accept edits | Modifica i file senza chiedere. Chiede prima degli altri comandi. |
| Plan | Legge ed esplora, poi propone un piano. Non modifica niente. |
| Auto | Chiede meno permessi. Un controllo automatico esamina le azioni rischiose prima che partano. |
| Bypass permissions | Non chiede niente. Sul piano Team la controlla l'organizzazione. |

- **Lavoro di ogni giorno: Auto**, se disponibile. Riduce le richieste di permesso con un controllo automatico; non garantisce che ogni azione rischiosa venga fermata. Per questo dici sempre a Claude cosa può fare ([chiedere in grande](chiedere-in-grande.md)).
- **Lavoro condiviso o irreversibile: Plan.** Leggi il piano, approvalo, poi fallo partire.
- **Se non vedi Auto**, l'organizzazione l'ha disattivato o il modello scelto non lo supporta. Usa Accept edits.

Auto non decide al posto tuo cosa inviare o pubblicare. Il CLAUDE.md globale del kit dice a Claude: «Tu prepari, io decido: chiedimi conferma prima di inviare, pubblicare, cancellare, spendere crediti o modificare un sistema in produzione o l'account di un cliente.» Nella scheda Code le istruzioni aziendali dicono lo stesso solo dopo che l'amministratore le pubblica nelle impostazioni gestite.

### I permessi in Cowork

Cowork ha un'impostazione dei permessi per ogni attività e una nelle impostazioni. Anche nella modalità che agisce senza chiedere, Cowork chiede conferma prima di scaricare, cancellare o cambiare una condivisione ([guida Cowork](https://claude.com/resources/guides/claude-cowork-product-guide/getting-started)). Sul piano Team, gli strumenti dei connettori che scrivono chiedono la tua approvazione a ogni attività, salvo diversa scelta dell'organizzazione.

## Indeck in ogni modalità

Il connettore di Indeck funziona in Chat, Cowork e Code. Lo colleghi una volta sola, da Personalizza → Connettori (Customize → Connectors), e scegli il livello di accesso: [lettura o scrittura](indeck.md#lettura-o-scrittura).

In ogni modalità fai la stessa prova: scrivi «Chiama whoami di Indeck e dimmi chi sono». Dovresti vedere il tuo nome e i workspace e progetti Indeck a cui hai accesso.

Le skill di Indeck arrivano in Chat e in Cowork tramite il connettore. Nella scheda Code puoi anche installarle sul computer. Come fare: [guide/indeck.md](indeck.md).

## Cosa non c'è sul piano Team

- **Controllo del computer** (Claude che usa mouse e tastiera sul tuo schermo): non disponibile sui piani Team ed Enterprise.
- **Dispatch** (attività inviate dal telefono): non disponibile sui piani Team ed Enterprise.

Fonte: [documentazione della scheda Code](https://code.claude.com/docs/en/desktop).

## Problemi frequenti

| Problema | Causa probabile | Cosa fare |
|---|---|---|
| Mancano Cowork o il connettore di Indeck | Sei nell'account personale | Controlla il segno di spunta blu sull'account Intarget. |
| Non vedi Cowork | App installata con il `.exe`, computer non pronto, o Cowork disattivato | Usa il controllo di Anthropic. Intanto lavora nella scheda Code. |
| In Cowork Claude ignora il tuo CLAUDE.md globale | È normale: Cowork non lo legge | Incolla lo stesso testo nelle Istruzioni per Claude. Se nelle Impostazioni c'è una sezione Cowork con le istruzioni globali (Global instructions), incollalo anche lì. |
| In Code Claude non sa chi sei | Sessione nel cloud, cartella sbagliata o Indeck non collegato | Ambiente sul tuo computer, cartella di lavoro, poi la prova con whoami. |
| Non vedi la modalità Auto | Disattivata dall'organizzazione o non supportata dal modello | Usa Accept edits. |
