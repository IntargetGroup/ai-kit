# Portare dentro una chat

Un prompt da incollare in una chat già fatta (claude.ai, ChatGPT, Gemini, NotebookLM). Il modello produce un unico file Markdown con il contenuto utile della conversazione, pronto per Indeck o per un vault.

Il risultato è una **cattura derivata**: un testo che il modello scrive sulla conversazione. Non è una trascrizione e non è un'esportazione fedele. Il prompt chiede al modello di dichiarare cosa vede e cosa manca, così chi lo legge sa quanto fidarsi.

## Quando usarlo

- Una conversazione lunga ha prodotto decisioni, ragionamenti o numeri che vuoi ritrovare.
- Un notebook di NotebookLM ha sintetizzato fonti che vuoi conservare.

Non usarlo per domande banali, né per conversazioni con password, chiavi, dati sanitari o dati personali di altre persone.
Se la conversazione riguarda un cliente, la cattura va solo nel progetto o nel workspace di quel cliente.

## Come si usa

1. Apri la conversazione. Usa solo l'account aziendale.
2. Copia il blocco tra `===== INIZIO PROMPT =====` e `===== FINE PROMPT =====` e incollalo come messaggio successivo.
3. Copia la risposta in un file `.md`. Nome: `<piattaforma>-<argomento>-AAAA-MM-GG.md`. Nella variante leggera mettilo in `input\` della tua cartella di lavoro.
4. Confronta tre affermazioni con la conversazione originale. Controlla anche la sezione "Limiti della cattura". Se trovi un'invenzione, rifai (vedi "Se qualcosa va storto").
5. Portalo dove serve:
   - **Indeck:** in Claude, con l'MCP di Indeck collegato con accesso in scrittura ([livelli di accesso](../guide/indeck.md#lettura-o-scrittura)), chiedi: "Ingerisci `input/<file>.md` nel progetto «nome» di Indeck con la skill Ingestione in memoria Indeck". Claude propone cosa scrivere e scrive dopo il tuo sì.
   - **Vault completo:** mettilo in `inbox/` ed esegui `/ingest inbox/`.

Se la piattaforma offre un'esportazione ufficiale dei dati, conserva anche quella accanto alla cattura: è la fonte, la cattura è un riassunto.

## Il prompt

```text
===== INIZIO PROMPT =====

Scrivi una cattura di questa conversazione (o, se questo è un notebook di NotebookLM, della conoscenza sintetizzata nel notebook e delle sue fonti) in un unico documento Markdown. Il documento entrerà in una memoria di lungo periodo e un altro sistema lo elaborerà: il formato qui sotto è un contratto. Seguilo.

## Regole

1. Conserva il dettaglio. Questa cattura serve a ricostruire decisioni e ragionamenti, non a riassumere. La lunghezza è proporzionata alla conversazione: tutto ciò che serve a ricostruire una decisione, nessun riempitivo. Una decisione, un numero, un nome, una motivazione o un'alternativa scartata che manca è un errore.
2. Non inventare. Se una sezione non ha materiale, scrivi _(niente in questa conversazione)_. Se non sei sicuro che una cosa sia stata detta, scrivi _(implicito, non detto: …)_ invece di affermarla.
3. Attribuisci ogni affermazione: [utente] per ciò che ha detto l'utente, [assistente] per ciò che hai detto tu, [fonte: titolo o URL] per un documento o un link citato nella conversazione.
4. Copia numeri e nomi esattamente come compaiono: cifre, percentuali, date, importi, nomi di persone, aziende, prodotti, identificativi. Non arrotondare, non tradurre, non normalizzare.
5. Dichiara cosa vedi. Riporta le prime dieci parole del primo messaggio che vedi e dell'ultimo. Indica allegati, immagini o file che non hai potuto leggere.
6. Non trascrivere password, chiavi, token, dati sanitari o giudizi su persone. Al loro posto scrivi [rimosso per privacy].
7. Rispondi con il solo documento. Nessuna frase prima o dopo. Il documento inizia con --- e finisce con l'ultima riga di contenuto.

## Formato

---
tipo: cattura-conversazione
piattaforma: <claude.ai | chatgpt | gemini | notebooklm | altro>
titolo: "<titolo della conversazione, o un titolo descrittivo di massimo 80 caratteri>"
link: "<link permanente se la piattaforma lo mostra, altrimenti vuoto>"
periodo: "AAAA-MM-GG / AAAA-MM-GG"
catturato_il: "AAAA-MM-GG"
generato_da: "<nome del modello, se lo conosci>"
---

# <titolo>

> Cattura generata da un modello a partire dalla conversazione. Non è una trascrizione. Verifica sui messaggi originali prima di citarla.

## Sintesi
Da due a quattro paragrafi: cosa si cercava di capire, come si è evoluta la conversazione, a cosa si è arrivati o perché non si è arrivati.

## Affermazioni chiave
- Un'affermazione per riga, comprensibile da sola, con attribuzione. [utente]

## Decisioni
- **Decisione:** … **Motivo:** … **Alternative considerate:** … (oppure _(nessuna indicata)_) [utente]

## Azioni
- [ ] Azione. [responsabile: come indicato nella conversazione, oppure "non indicato"] [entro: come indicato, oppure "non indicato"]

## Domande aperte
- Domande poste e non risolte.

## Entità citate
- <nome>: <tipo>, <contesto in una riga>

## Concetti
- **<concetto>:** definizione o distinzione emersa, in una riga.

## Citazioni testuali
Da zero a cinque passaggi in cui la formulazione porta il ragionamento. Ognuno con una riga di contesto e l'attribuzione.

## Contraddizioni
- Affermazioni in conflitto tra loro o con fonti citate, con le due fonti.

## Prossimi passi
- Cosa la conversazione indica come seguito, anche se non è un impegno preciso.

## Limiti della cattura
- Primo messaggio visibile: "<prime dieci parole>"
- Ultimo messaggio visibile: "<prime dieci parole>"
- Parti, allegati o file non letti: …
- Passaggi ricostruiti con incertezza: …

## Trascrizione (solo se la conversazione ha al massimo 20 scambi)
### Scambio N [utente | assistente]
Testo del messaggio.

Per NotebookLM, sostituisci "Trascrizione" con:

## Fonti del notebook
- <titolo>: <tipo>, <URL o "file locale">, <cosa apporta in una riga>

## Sintesi del notebook
Le risposte o i briefing generati dal notebook che vale la pena conservare, ognuno con le fonti che lo sostengono.

## Controlli prima di rispondere
- Numeri e nomi sono identici all'originale?
- Ogni affermazione ha un'attribuzione?
- C'è qualcosa che non era nella conversazione? Se sì, toglilo.
- La sezione "Limiti della cattura" è compilata?
- La risposta è solo il documento?

===== FINE PROMPT =====
```

## Se qualcosa va storto

| Sintomo | Cosa scrivere nella stessa chat |
|---|---|
| La cattura è troppo corta per la conversazione | "La cattura è troppo compressa. Conserva entità, numeri, motivazioni e alternative. Rifalla." |
| Contiene cose mai dette | "La sezione «…» contiene contenuti inventati. Rifalla attenendoti solo alla conversazione." |
| Mancano le attribuzioni | "Ogni affermazione ha bisogno di [utente], [assistente] o [fonte: …]. Rifalla." |
| Il primo messaggio visibile non è il primo della conversazione | Il modello non vede tutto. Cattura la conversazione a parti, oppure parti dall'esportazione ufficiale. |
| Frasi prima o dopo il documento | Cancellale a mano. |

Se l'invenzione si ripete due volte, non fidarti di quella cattura. Conserva l'esportazione ufficiale o le parti che hai verificato.

Note per piattaforma:
- **NotebookLM:** incolla il prompt nella chat del notebook. I documenti da cui il notebook è costruito non entrano nella cattura: se ti servono, portali dentro come fonti a parte.
- **Chat con memoria o con documenti di progetto:** la cattura contiene solo ciò che è emerso nella conversazione, non tutta la memoria o tutti i documenti.
