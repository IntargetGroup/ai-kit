# La memoria: cosa va dove

Questa pagina è la mappa della memoria. Ogni fatto ha un posto solo. Gli altri posti hanno al massimo un rimando o una copia di riserva dichiarata.

## La mappa

| Cosa | Dove vive | Altrove solo come |
|---|---|---|
| Chi sei: ruolo, team, cosa hai sul piatto, obiettivi | CORE personale di Indeck | CLAUDE.md globale: 3 righe su di te e «leggi il CORE» |
| Le tue preferenze: formato, tono, numeri, stile | CORE personale, sezione Preferences | CLAUDE.md globale: una riserva di massimo 4 righe |
| Come Claude si comporta ovunque: cosa fa senza chiedere, cosa ti chiede prima, come mostra le verifiche | CLAUDE.md globale | Istruzioni per Claude: lo stesso testo, per Chat e Cowork |
| A cosa serve una cartella, i suoi file, il workspace o progetto Indeck collegato, cosa vuol dire «fatto» lì | CLAUDE.md della cartella | in Cowork, una riga nelle istruzioni della cartella che dice di leggerlo |
| Conoscenza su un cliente o un brand che dura oltre i progetti, ruoli del team, convenzioni | memoria del **workspace** Indeck | il CLAUDE.md della cartella nomina il workspace |
| Un incarico o un deliverable: brief, decisioni, stakeholder, consegne, fili aperti | memoria del **progetto** Indeck | il CLAUDE.md della cartella nomina il progetto |
| Metodi («come facciamo un report di riunione») | catalogo skill di Indeck | niente |
| Il lavoro in corso nella cartella: prossimi passi, blocchi | `STATO.md` nella cartella, massimo 40 righe, riscritto e mai allungato | passa a Indeck quando diventa un fatto del team |
| Note di Claude su questo computer o cartella (stranezze degli strumenti, dove stanno le cose) | memoria automatica della scheda Code | mai fatti su persone o clienti |
| Bozze, Excel, export, risultati | file nella cartella (`input/`, `lavori/`) o su Drive | la memoria salva il link, non una copia |
| Password, chiavi, token, stipendi, salute, informazioni HR su altri | da nessuna parte | niente |

**Le preferenze hanno una fonte sola: il CORE personale.** Le leggono sia Claude sia l'app Indeck. Il CLAUDE.md globale ne tiene una riserva breve, sotto la frase «My personal Indeck CORE is the source of my preferences. The lines below are the fallback when Indeck is not available.» Se cambi una preferenza, cambiala nel CORE. Se è anche nella riserva, cambiala anche lì.

Quando dici «ricordati che…», la cosa va qui:

- **su di te o sulle tue preferenze** → CORE personale (le preferenze nella sezione Preferences). Claude chiede prima di scrivere.
- **su un cliente o un progetto** → memoria di quel workspace o progetto, il più ristretto che basta. Claude chiede prima di scrivere.
- **su questa cartella o sui suoi strumenti** → CLAUDE.md della cartella.
- **su come Claude si comporta ovunque** → CLAUDE.md globale e Istruzioni per Claude.

Per scrivere in Indeck Claude deve avere il livello scrittura: [guide/indeck.md](indeck.md#lettura-o-scrittura).

Nella scheda Code, senza istruzioni, «ricordati» finisce nella memoria automatica di quella cartella ([documentazione](https://code.claude.com/docs/en/memory)). Il [CLAUDE.md globale del kit](../inizia/modelli/CLAUDE-globale.md) dice a Claude di seguire invece questo elenco.

## CLAUDE.md globale e CLAUDE.md di cartella

Il **globale** vale per ogni sessione della scheda Code su questo computer. Chat e Cowork non leggono il file: leggono lo stesso testo in Impostazioni → Istruzioni per Claude (Settings → Instructions for Claude). Quando cambi uno dei due, copia la modifica nell'altro.

- Windows: `%USERPROFILE%\.claude\CLAUDE.md`, cioè `C:\Users\<nome>\.claude\CLAUDE.md`
- macOS: `~/.claude/CLAUDE.md`

Il globale dice come vuoi che Claude lavori e cosa ti chiede prima. Ripete anche, con le stesse parole, le regole aziendali su Indeck e sulle azioni: nella scheda Code le istruzioni dell'organizzazione arrivano solo con le impostazioni gestite, e per Cowork non è documentato. Non dice chi sei in dettaglio: quello è nel CORE.

Esempio (estratto). I due file sono in inglese perché li legge Claude; la prima riga di «How I work» gli dice di parlarti in italiano.

```markdown
## Who I am
Ads analyst in the performance team. I work on several clients every week.
My full profile is in my personal Indeck CORE.

## How I work
Talk to me in Italian.
My personal Indeck CORE is the source of my preferences. The lines below are the fallback when Indeck is not available.
- Format: answer first, then details.
- Use a table when you compare numbers.

## Autonomy and limits
- You prepare, I decide: ask for confirmation before you send, publish, delete, spend credits, or change a production system or a client's account.
```

Il **CLAUDE.md di cartella** vale solo quando lavori in quella cartella. Dice a cosa serve, a quale workspace o progetto Indeck appartiene, dove vanno i file e cosa vuol dire «fatto».

Esempio (estratto):

```markdown
## What this folder is for
Monthly performance reports for a client.

## Indeck
- Workspace: «name» («id»)
- Project: «name» («id»)

## How we work here
- Acquire only the data the task needs. Save the exports you use in `input/`, then work from the file.
- Process with code every record in the agreed scope. Report rows included and excluded.
- Finished reports go in `lavori/YYYY-MM-report/`.

## Done when
- Monthly report: totals reconcile with the export; every change above 10% has a documented cause or is marked "da verificare".
```

I modelli completi: [CLAUDE-globale.md](../inizia/modelli/CLAUDE-globale.md) e [CLAUDE-cartella.md](../inizia/modelli/CLAUDE-cartella.md).

### Prova: dove lo scrivi?

1. «Preferisco le tabelle ai paragrafi.»
2. «I report di questo cliente vanno in `lavori/`.»
3. «Le decisioni prese al tavolo di lunedì.»

<details>
<summary>Risposte</summary>

1. **CORE personale di Indeck**, sezione Preferences. È una tua preferenza: la seguono Claude e l'app Indeck. Claude ti chiede il sì prima di scriverla. Se la riserva nel CLAUDE.md globale parla di formato, aggiorna anche quella.
2. **CLAUDE.md della cartella**, sezione «How we work here». Vale solo lì.
3. **Memoria del progetto Indeck** (o del workspace, se la decisione vale oltre il progetto). Le decisioni servono ai colleghi, quindi stanno in Indeck. Non vanno nel CLAUDE.md e non vanno in `STATO.md`.

</details>

## Come si caricano i file

Nella scheda Code (e in Claude Code in generale) Claude legge all'avvio:

1. il CLAUDE.md globale;
2. i CLAUDE.md della cartella che hai aperto e delle cartelle sopra, dall'alto verso il basso.

I file si sommano. Nessuno cancella l'altro. Il file della cartella arriva per ultimo, ma non vince sul globale: se due righe si contraddicono, Claude può seguire l'una o l'altra ([documentazione](https://code.claude.com/docs/en/memory#how-claude-md-files-load)). Tieni i due file coerenti.

Per vedere quali file ha caricato, scrivi `/context` nella scheda Code. Se l'elenco dei file non compare, chiedi: «Quali file di istruzioni hai caricato in questa sessione?»

Il CLAUDE.md è contesto, non un lucchetto: Claude lo legge come informazione, il sistema non lo impone. Le azioni che non ammettono eccezioni passano da una persona che approva.

Tieni corti tutti e due i file. Un file lungo costa contesto e Claude lo segue peggio. Il modello globale del kit sta sotto le 60 righe.

Nelle altre modalità:

- **Chat** non legge nessun CLAUDE.md. Legge le Istruzioni per Claude e, se l'amministratore le ha pubblicate, le istruzioni dell'organizzazione.
- **Cowork** non legge la cartella `.claude` del tuo computer. Legge le Istruzioni per Claude e le istruzioni della cartella in Personalizza (Customize). Non è documentato che legga da solo il CLAUDE.md della cartella. Per questo, nelle istruzioni della cartella metti la riga: «At the start of every task, read CLAUDE.md and STATO.md in this folder and follow them.»

Cosa legge ogni modalità dell'app desktop: [guide/app-desktop.md](app-desktop.md).

## La memoria automatica della scheda Code

Nella scheda Code Claude prende appunti da solo: correzioni che gli dai, preferenze che confermi, dove trovare le cose. Li salva in una cartella per ogni cartella di lavoro:

- Windows: `%USERPROFILE%\.claude\projects\<cartella>\memory\`
- macOS: `~/.claude/projects/<cartella>/memory/`

`<cartella>` non è il nome della tua cartella di lavoro: Claude lo ricava dal percorso completo (su macOS, per esempio, `-Users-<nome>-Lavoro-Claude`). Per trovarla, chiedi nella scheda Code: «Dov'è la tua memoria automatica per questa cartella?»

Due cose da sapere ([documentazione](https://code.claude.com/docs/en/memory#auto-memory)):

- **Resta su questo computer.** Non arriva su altri computer, su Indeck o ai colleghi.
- **Dipende dal percorso della cartella.** Se sposti o rinomini la cartella di lavoro, Claude riparte con una memoria automatica vuota. Scegli il posto una volta e non spostarla più.

Sono file Markdown normali: puoi aprirli, correggerli e cancellarli. Qui devono restare solo note sul computer e sugli strumenti. Se trovi fatti su persone, clienti o progetti, portali in Indeck e cancellali da qui.

## Manutenzione

- **Una volta.** Il [prompt di setup](../inizia/prompt-di-setup.md) prepara il CLAUDE.md globale e ti dà il testo da incollare nelle Istruzioni per Claude. Poi rileggilo e correggilo a mano: 20–30 minuti. È il file che Claude legge più spesso.
- **Quando cambi qualcosa.** Chiedi a Claude di aggiornare la fonte (il CORE per le preferenze, il CLAUDE.md globale per il comportamento) e di prepararti il testo da incollare nelle Istruzioni per Claude.
- **Ogni mese, 15 minuti.** Rileggi il CLAUDE.md globale, la data di aggiornamento del tuo CORE e lo `STATO.md` delle cartelle attive. Togli quello che non è più vero.
- **Ogni giorno, con il comportamento.** Quando ripeti una correzione per la seconda volta, falla diventare una riga. Quando una regola non serve più, cambiala: «chiedimi sempre prima di…» diventa «non chiedermelo più».

## I cinque principi

1. **Ogni fatto ha una fonte.** Scrivi documento e data: «(fonte: verbale kick-off, 2026-10-14)». Le date sono sempre assolute, mai «ieri» o «la settimana scorsa». I documenti lunghi stanno in un file a parte, e il CORE dice che esistono.
2. **Non duplicare.** Prima di scrivere, cerca. Se un file sull'argomento esiste, estendilo. Un documento su Drive resta su Drive: la memoria salva il link.
3. **Separa fatti e ipotesi.** «Il cliente ha approvato la data di lancio (fonte: mail del 2026-10-20)» è un fatto. «Il cliente probabilmente sposterà il lancio» è un'ipotesi, e deve leggersi come tale.
4. **Le contraddizioni si segnalano, non si sovrascrivono.** Quando una fonte nuova contraddice la memoria, restano tutte e due con le loro fonti, sotto un avviso `> ⚠️ CONTRADDIZIONE:`. Decide una persona.
5. **Responsabilità.** La memoria è tua. Sai cosa c'è, perché c'è, e decidi cosa entra. Claude propone e scrive dopo il tuo sì, oppure dentro un'autorizzazione esplicita che gli hai già dato. Le informazioni private non vanno mai nella memoria condivisa. Le decisioni di lavoro che un collega dovrà ritrovare ci vanno.

## Errori tipici

| Errore | Come lo riconosci | Cosa fare |
|---|---|---|
| Memoria come diario | Lo stato attuale è sepolto sotto la storia | Riscrivi lo stato attuale in cima. La storia sta in file datati, o non serve. |
| Accumulo di correzioni | Ogni errore è diventato una regola nuova. Ci sono centinaia di regole e si contraddicono. | Distilla tutto in una guida breve e in una definizione di «fatto», per esempio: «un'analisi è completa solo se ha elaborato tutti i record del perimetro e i totali tornano con la fonte». |
| CORE che diventa archivio | Il CORE contiene i dettagli invece dei rimandi | Una o due righe per argomento. Il dettaglio va in un file a parte. |
| CORE scaduto | L'ultimo aggiornamento ha più di 30 giorni | Claude te lo dice. Aggiornalo prima di fidarti di «cosa hai sul piatto». |
| Preferenze in due posti che divergono | Il CLAUDE.md globale dice una cosa, il CORE un'altra | Vale il CORE. Riallinea la riserva nel CLAUDE.md globale e nelle Istruzioni per Claude. |
| Dati di un cliente nel progetto di un altro | Un copia e incolla tra due clienti | I dati di un cliente restano nel suo workspace. Sempre. |
| Riunioni lasciate su Drive | I colleghi e gli agenti non trovano le decisioni | Porta le riunioni nella memoria del workspace o del progetto con la skill di ingestione ([guide/fonti.md](fonti.md)). |
| Progetti aperti e mai usati | Un progetto contiene solo i file di partenza | Usa il progetto o archivialo. |
| Dati grandi incollati in chat | Claude analizza le prime righe e dichiara finito | Salva l'export in un file e fai elaborare con codice tutti i record che servono. |

## Il contratto del CORE di Indeck

Ogni memoria Indeck (personale, workspace, progetto) ha un file `CORE.md`.

- **È un indice, non un archivio.** Una o due righe per argomento, con il nome del file che ha il dettaglio.
- **Sta sotto i 4 KB (4.096 byte).** L'app Indeck passa all'agente solo i primi 4.096 byte del CORE: circa 4.000 caratteri, una pagina scarsa. Il resto l'agente in app non lo vede. Preferences è la sesta sezione su otto: in un CORE troppo lungo è tra le prime cose che l'app perde. Claude con l'MCP legge il file intero, ma tieni il limite perché tutti e due vedano lo stesso CORE.
- **Ha una riga di aggiornamento.** In cima: «Ultimo aggiornamento: AAAA-MM-GG». Chi modifica il CORE aggiorna la data. Se è più vecchia di 30 giorni, Claude lo dice.
- **Ha titoli fissi.** Indeck rifiuta un CORE con titoli diversi. Usa i titoli canonici, nell'ordine:
  - personale: Work context; Personal context; Top of mind; Goals; Projects; Preferences; Brief history; Long-term background
  - workspace: Contesto cliente e brand; Team e ruoli; Obiettivi di lungo periodo; Decisioni; Convenzioni e glossario; Fili aperti
  - progetto: Contesto cliente e brand; Obiettivi; Stakeholder; Deliverable attivi; Decisioni; Convenzioni e glossario; Fili aperti
- **Ha un responsabile.** Il CORE personale lo curi tu. Quello del workspace lo curano owner e admin. Quello del progetto lo cura chi l'ha creato, di solito il PM.
- **Cita gli altri spazi per nome.** Per rimandare a un altro workspace o progetto scrivi «progetto X» o «workspace Y». Un percorso come `/memories/project/...` non dice quale progetto.

Come Claude legge e scrive in Indeck, passo per passo: [guide/indeck.md](indeck.md).
