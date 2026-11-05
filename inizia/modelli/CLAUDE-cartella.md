<!--
Modello del CLAUDE.md di una cartella di lavoro. inizia/modelli/CLAUDE-cartella.md e kit/primo-workspace/CLAUDE.md sono identici: cambiali insieme.
Lo compila il prompt di setup (inizia/prompt-di-setup.md). Una cartella serve un solo workspace o progetto Indeck, oppure solo il tuo scope personale.
Qui va solo ciò che vale per questa cartella. Chi sei e come lavori sta nel CLAUDE.md globale e nel tuo CORE.
I segnaposto «…» contengono un esempio: sostituiscilo. I commenti HTML non arrivano a Claude. Massimo 80 righe.
-->
# «Nome della cartella»

## A cosa serve questa cartella
«Una o due frasi: che lavoro si fa qui, per quale cliente, area o team, per chi è il risultato.»

## Indeck
- Workspace: «nome» («id»), oppure: nessuno
- Progetto: «nome» («id»), oppure: nessuno
Se sono tutti e due «nessuno», questa cartella usa solo il mio scope personale.
All'inizio di un lavoro qui, dopo il mio CORE personale, leggi il CORE.md di questi spazi.
Il CORE personale serve al mio profilo e alle preferenze. Per i fatti di questo lavoro cerca solo negli spazi indicati qui (nel mio scope personale, se non ce ne sono) e nominali in memory_search.
Prima di citare un risultato, leggi la fonte con memory_read.
Se uno spazio non compare in whoami o non è leggibile, chiedimi di verificarlo. Non provare altri id, non usare spazi con nomi simili e non allargare la ricerca ad altri clienti.

## Mappa della cartella
- `CLAUDE.md`: questo file. Istruzioni stabili per la cartella.
- `STATO.md`: il lavoro in corso. Leggilo all'inizio della sessione.
- `input/`: i file da elaborare (export, Excel, CSV, PDF, trascrizioni). Non modificare gli originali: lavora su copie.
- `lavori/AAAA-MM-argomento/`: una sottocartella per ogni lavoro, con calcoli, bozze e risultati. Esempio: `lavori/2026-11-report-mensile/`.

## Come si lavora qui
- Acquisisci solo i dati che servono al compito. Salva in `input/` gli export che usi, poi lavora dal file.
- Elabora con codice tutti i record del perimetro concordato. Riporta fonte, periodo, filtri, pagine acquisite, righe incluse ed escluse; segnala dati mancanti o troncati.
- Riconcilia i totali con la fonte, con gli stessi filtri. Se non tornano, quantifica la differenza e non chiamare il risultato verificato.
- Risultato finale: «formato, per esempio Excel o presentazione», con nome «AAAA-MM-GG-argomento».
- Le correzioni che valgono per questa cartella stanno nella sezione «Correzioni». È l'unico posto.

## Correzioni
<!-- Una riga per ogni correzione che hai dato due volte. Oltre le dieci righe, riscrivile in poche regole. -->
- «Nessuna per ora.»

## Fatto quando
- «Report mensile»: «i totali sono riconciliati con l'export; ogni variazione sopra il 10% ha una causa documentata oppure è segnata «da verificare»; il file è in lavori/».
- «Analisi»: «tutti i record del perimetro elaborati, con righe incluse ed escluse; ogni numero ha la fonte; ipotesi separate dai fatti».
- «Testo per il cliente»: «bozza pronta per la revisione di una persona; niente inviato».

## Fine sessione
Quando dico «chiudiamo»:
1. riscrivi `STATO.md` con lo stato di oggi e la data (AAAA-MM-GG), massimo 40 righe;
2. proponi in un solo messaggio cosa salvare in Indeck e in quale spazio;
3. scrivi dopo il mio sì, oppure dentro un'autorizzazione esplicita già ricevuta; poi dimmi cosa è stato applicato e cosa no.
