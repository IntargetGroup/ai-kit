# Secondo cervello leggero

Una cartella sul tuo computer, collegata a Indeck. Niente app da imparare, niente script, niente git.
Per installarla segui [inizia/README.md](../inizia/README.md). Cosa contiene la cartella: [kit/primo-workspace](../kit/primo-workspace/LEGGIMI.md). Cosa va dove: [guide/memoria.md](../guide/memoria.md).
Questa pagina aggiunge due cose: come lavorare con più clienti e il ritmo di una sessione.

## Più clienti, più cartelle

Una cartella serve un solo workspace o progetto Indeck.

- Per un secondo cliente crea una cartella accanto alla prima: `C:\Users\<nome>\Lavoro-Claude-<argomento>` su Windows, `~/Lavoro-Claude-<argomento>` su macOS.
- Rifai lì il passo 5 di [inizia/README.md](../inizia/README.md): il prompt scarica i file del kit e compila il CLAUDE.md della cartella; il CLAUDE.md globale c'è già e Claude ti propone solo le modifiche. Se usi Cowork, incolla la riga anche nelle istruzioni di questa cartella.
- Non metterla dentro la prima. Nella scheda Code Claude legge anche il CLAUDE.md delle cartelle superiori ([documentazione](https://code.claude.com/docs/en/memory#how-claude-md-files-load)) e mescolerebbe le istruzioni dei due clienti.

## Il ritmo di una sessione

**Inizio.** Apri la cartella nella scheda Code o in Cowork ([quale scegliere](../guide/app-desktop.md)).

- Nella scheda Code Claude carica da solo il CLAUDE.md globale e quello della cartella. Per controllarlo scrivi `/context`. Se l'elenco dei file non compare, chiedi: «Quali file di istruzioni hai caricato in questa sessione?».
- In Cowork valgono le tue istruzioni personali, in Impostazioni → Istruzioni per Claude (Settings → Instructions for Claude), e la riga nelle istruzioni della cartella: «At the start of every task, read CLAUDE.md and STATO.md in this folder and follow them.»

Poi Claude chiama `whoami`, legge il tuo CORE personale e il CORE degli spazi Indeck indicati nel CLAUDE.md della cartella, e legge `STATO.md`. Tu scrivi cosa vuoi ottenere e come capire che è fatto ([come chiedere](../guide/chiedere-in-grande.md)).

**Durante.**

- Ogni lavoro ha la sua sottocartella in `lavori\`. Input, calcoli e output stanno lì.
- Gli export di strumenti e API vanno su file in `input\`, non incollati in chat. Claude acquisisce solo i dati che servono, li elabora con codice su tutto il perimetro concordato e ti dice quante righe ha incluso ed escluso.
- Una correzione che ripeti due volte va scritta nel CLAUDE.md della cartella. È l'unico posto dove cercarla.
- Se Claude non ha letto Indeck, chiediglielo in una riga: «Leggi il CORE del progetto prima di continuare».

**Fine.** Scrivi «chiudiamo». Claude:

1. riscrive `STATO.md` con lo stato attuale e la data;
2. propone cosa salvare in Indeck: decisioni ed esiti nel progetto, preferenze nella sezione Preferences del tuo CORE;
3. scrive in Indeck dopo il tuo sì, oppure dentro un'autorizzazione esplicita già ricevuta; poi ti dice cosa è stato applicato e cosa no.

## Non copiare Indeck nella cartella

Un file letto da Indeck e salvato nella cartella è una nuova copia. I permessi di Indeck non lo proteggono più, e in pochi mesi dice cose diverse dall'originale. Nella cartella tieni il nome dello spazio Indeck, non il suo contenuto.

## Quando non basta

- Vuoi collegare nel tempo molte fonti personali (letture, corsi, idee): vedi [completo.md](completo.md).
- Lavori su un repository di codice: vedi [engineering/](../engineering/README.md).
