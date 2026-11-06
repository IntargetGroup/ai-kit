# Chiedere in grande

Claude tende a leggere una richiesta nel modo più stretto, perché non vede quanto speri di ottenere ([best practice di Claude Code](https://code.claude.com/docs/en/best-practices)). Se chiedi poco, ottieni il minimo. Se chiedi tanto senza dire quando hai finito, ottieni un lavoro che non sai controllare.

Questa pagina insegna il terzo modo: chiedi il risultato completo, dai un controllo che dice «fatto», metti i limiti. Poi resti nel giro.

## Tre righe per iniziare

Copia questo schema in un messaggio e riempi le righe:

```text
Obiettivo: «risultato completo, per chi, per cosa»
Fatto quando: «controllo verificabile». Mostrami l'esito.
Limiti: «cosa puoi fare, cosa richiede il mio sì»
```

Aggiungi solo il contesto che manca: file, periodo, workspace o progetto Indeck, decisioni prese a voce.

**Obiettivo.** Di' il risultato, non i passaggi. Di' chi lo legge e a cosa serve: un deck per la direzione e una nota per il team non sono lo stesso lavoro. Di' anche quanto lo vuoi completo: «fai la versione da presentare: tabella, grafico, tre azioni ordinate per impatto, cosa va validato». Oppure il contrario: «cambia solo il titolo della slide 4».

**Fatto quando.** È la riga più importante. Senza un controllo, Claude si ferma quando gli sembra di aver finito. Con un controllo, sa quando ha finito e te lo può mostrare. Scrivi una condizione che risponde sì o no: «i totali coincidono con l'export», non «un'analisi accurata». Chiedi una prova precisa: quale file, quante righe, quale totale.

**Limiti.** Scrivi cosa Claude può fare e cosa non deve cambiare: un file su Drive, un account pubblicitario, la memoria condivisa. Se hai fatto il setup del kit, il CLAUDE.md globale e le Istruzioni per Claude (Instructions for Claude) contengono già la regola «You prepare, I decide»: Claude chiede conferma prima di inviare, pubblicare, cancellare, spendere crediti o modificare un sistema in produzione o l'account di un cliente ([modello](../inizia/modelli/CLAUDE-globale.md)). Nel prompt aggiungi solo i limiti di questo lavoro.

**Il contesto che manca.** Claude non sa cosa è stato deciso a voce, quale cliente è in gioco, quale versione del file è quella buona. Diglielo in una riga. Claude legge da Indeck il tuo CORE e quelli degli spazi nominati nel CLAUDE.md della cartella: non incollarli ([guide/memoria.md](memoria.md)).

## Le domande, solo quando servono

Un deck di venti slide, una ricerca, uno scraping o un'analisi su mesi di dati costano tempo e crediti. Se il primo risultato parte da una scelta sbagliata, paghi due volte. Per questi lavori aggiungi una riga:

```text
Se manca una scelta che cambia il risultato, fammi fino a tre domande; altrimenti inizia e dichiara le assunzioni.
```

Le domande giuste sono strategiche: «presentazione lineare o di forte impatto?», «il pubblico conosce già i numeri?». Se Claude chiede se serve la slide dei ringraziamenti, rispondi «decidi tu» e fallo partire.

## Esempi per ruolo

Ogni esempio mostra una richiesta stretta e la stessa richiesta fatta in grande. Le parti tra «» sono da sostituire.

### Analista ADV: spesa e performance

Richiesta stretta: «Analizza la spesa di ottobre.»

In grande:

```text
Obiettivo: spiegare lo scostamento tra budget e speso di ottobre per campagna, per la call di venerdì con il cliente. Versione completa: tabella per campagna, tre azioni ordinate per impatto, cosa va validato.
Fatto quando: la somma per campagna coincide con il totale dell'export, con gli stessi filtri; ogni scostamento sopra il 10% ha una causa documentata oppure è segnato «da verificare». Mostrami i due totali.
Limiti: non modificare niente negli account pubblicitari. Se servono cambi, prepara il file e lo carico io.
Contesto: export in input/«nome-file»; il budget concordato è nella memoria del progetto.
```

Resta a te: caricare i cambi nell'account.

### PM: pacchetto di kick-off

Richiesta stretta: «Fammi una scaletta per il kick-off.»

In grande:

```text
Obiettivo: pacchetto per il kick-off con il cliente, più una checklist interna per il team. Versione completa: agenda, ruoli, prossimi passi con responsabile e data.
Fatto quando: ogni deliverable e ogni scadenza del brief compare nel pacchetto con la sua fonte; quello che non è nel brief né in memoria è segnato «da validare».
Limiti: non inviare niente al cliente.
Contesto: brief firmato in input/; il progetto Indeck «nome» ha decisioni e stakeholder.
Se manca una scelta che cambia il risultato, fammi fino a tre domande; altrimenti inizia e dichiara le assunzioni.
```

Resta a te: cosa promettere al cliente.

### Contenuti: varianti di copy

Richiesta stretta: «Scrivimi cinque post per il lancio.»

In grande:

```text
Obiettivo: dieci varianti di copy per il lancio di «prodotto», per «pubblico», su «canale», in tre direzioni diverse. Per ogni direzione, un nome e una riga che spiega a chi parla.
Fatto quando: ogni variante sta sotto «N» caratteri, rispetta le convenzioni del workspace del brand e non promette niente che non sia nel brief.
Limiti: non pubblicare niente.
Contesto: brief in input/; tono e parole da evitare nella memoria del workspace.
```

Resta a te: Claude scrive testi buoni, il tono «nostro» lo mette chi conosce il brand. Scegli, riscrivi, firma.

### Dati: numeri per un cliente

Richiesta stretta: «Calcola il tasso di conversione di settembre.»

In grande:

```text
Obiettivo: i numeri di settembre per il report al cliente.
Fatto quando: hai elaborato con codice tutte le righe di settembre dell'export; mi dici fonte, filtri, righe incluse ed escluse; i totali coincidono con la dashboard di riferimento «nome» con gli stessi filtri, oppure la differenza è quantificata e il numero è segnato «da verificare»; ogni numero ha file e colonna.
Limiti: non toccare la configurazione della piattaforma. Nessun numero va al cliente prima del mio sì.
Contesto: export in input/; la definizione della metrica è nella memoria del progetto.
```

Senza la prima condizione, Claude può leggere le prime mille righe di un export da milioni e dichiarare finito. Con un file grande, lavora nella scheda Code: Claude scrive uno script che elabora tutto il file ([guide/app-desktop.md](app-desktop.md)).

### Direzione e processi: report settimanale

Richiesta stretta: «Fammi le slide del weekly.»

In grande:

```text
Obiettivo: il deck del report settimanale per la direzione, otto-dieci slide, prima l'insight e poi i numeri. Versione completa: titoli che dicono l'insight, un grafico per slide, una slide finale con cosa va validato.
Fatto quando: hai elaborato tutte le righe dei fogli che servono; i totali per servizio coincidono con il totale del file; ogni confronto anno su anno usa periodi omogenei; ogni slide cita foglio e intervallo.
Limiti: non modificare il file su Drive. Non inviare il deck.
Contesto: il file è «link Drive»; la logica di ripartizione è nella memoria del workspace.
Se manca una scelta che cambia il risultato, fammi fino a tre domande; altrimenti inizia e dichiara le assunzioni.
```

Resta a te: quali insight portare in riunione.

## Restare al comando

Chiedere in grande non vuol dire lasciare andare. Guarda il primo minuto di lavoro.

- **Piano prima, per il lavoro condiviso o irreversibile.** Nella scheda Code scegli la modalità Plan: Claude esplora e propone un piano senza modificare niente. In Chat e in Cowork scrivi «proponi un piano e aspetta il mio sì». Approva il piano, poi fallo partire.
- **Fermalo appena sbaglia strada.** Nella scheda Code premi Esc o il pulsante di stop. Puoi anche scrivere una correzione mentre lavora: Claude la legge appena finisce l'azione in corso ([documentazione](https://code.claude.com/docs/en/desktop)).
- **Dopo due correzioni a vuoto, ricomincia.** Apri una chat o una sessione nuova. Scrivi una richiesta migliore, con quello che hai capito nei due tentativi. Una terza correzione di solito non serve ([best practice](https://code.claude.com/docs/en/best-practices)).
- **Lavori lunghi nella scheda Code: `/goal`.** Scrivi `/goal` seguito dalla condizione di arrivo. Dopo ogni turno un modello controlla se la condizione è vera. Se non lo è, Claude continua da solo ([documentazione](https://code.claude.com/docs/en/goal)).

Per `/goal` scrivi un solo stato finale misurabile e un limite di turni. Il controllo legge solo la conversazione, quindi Claude deve mostrare la prova nella chat:

```text
/goal ogni file in input/ ha un riepilogo in lavori/«AAAA-MM»-riepiloghi/ e l'indice li elenca tutti, con il numero di pagine lette per ciascuno; oppure fermati dopo 20 turni
```

Il limite di turni lo valuta il modello che fa il controllo: non è un blocco garantito. Guarda i primi turni e premi Esc se il lavoro va fuori strada.

Prima di lasciare Claude da solo, rispondi a cinque domande. Sa cosa vuol dire «fatto»? Può controllarlo? Cosa può toccare? Cosa lo ferma? Chi approva il risultato?

## Cose da smettere di fare

| Abitudine | Perché non serve | Cosa fare invece |
|---|---|---|
| Elencare i passaggi uno per uno | Claude sa fare i passaggi meccanici. La lista lo obbliga a seguire la tua strada anche quando ce n'è una migliore. | Di' il risultato e il controllo. Scrivi un ordine solo quando è una regola di lavoro. |
| «Pensa bene», «ricontrolla», «sii preciso» | Non definiscono un controllo utile. Producono verifiche generiche ([guida ufficiale](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5)). | Chiedi una prova precisa del risultato: «i totali coincidono con l'export; mostrami i due numeri». |
| MAIUSCOLE, «IMPORTANTE», punti esclamativi | Claude applica la regola anche dove non serve ([best practice](https://code.claude.com/docs/en/best-practices)). | Scrivi la regola una volta, con il motivo. |
| Usare una chat lunghissima come memoria | Nelle sessioni lunghe Claude riassume la conversazione e può perdere le correzioni. La chat dopo non le sa. | Una correzione che vale anche domani va nel CLAUDE.md della cartella. Una preferenza tua va nel CORE personale. Una decisione va in Indeck ([guide/memoria.md](memoria.md)). |
| Incollare dati grandi in chat | Claude vede solo una parte e può dichiarare finito. | Salva l'export in `input/` e chiedi di elaborare con codice tutte le righe che servono. |
| Trasformare ogni errore in una regola nuova | Dopo un mese hai centinaia di regole che si contraddicono. | Ogni tanto chiedi a Claude di distillarle in una guida breve, con una definizione di «fatto». |
