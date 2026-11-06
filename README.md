# ai-kit

Il kit di Intarget per lavorare con Claude come con un collega che ti conosce.
In 15 minuti Claude legge da Indeck chi sei e su cosa lavori, e tu gli chiedi risultati interi, non singoli passi.

## Il problema che risolve

Nell'app Indeck l'agente sa già chi sei: a ogni messaggio riceve la tua memoria personale e quella del workspace in cui lavori.
Claude no. Anche collegato a Indeck, all'inizio non sa niente di te: deve andare a leggere. Senza istruzioni non lo fa, e tu devi spiegargli tutto da capo.

Il kit sistema tre cose:

1. **Claude collegato a Indeck.** All'inizio di ogni lavoro legge il tuo CORE personale e quello del workspace o del progetto giusto. Lavora con la stessa memoria di Indeck e la aggiorna con il tuo consenso.
2. **Due file di istruzioni, piccoli.** Uno globale ("chi sono e come lavoro") e uno per ogni cartella di lavoro ("cosa si fa qui e quando è fatto").
3. **Chiedere in grande.** Dai a Claude l'obiettivo, il controllo che dice "fatto" e i limiti. Lui fa il resto e tu decidi su ciò che conta.

## Inizia qui

→ **[inizia/README.md](inizia/README.md)**: configurazione nell'app desktop, Windows e macOS, con una verifica dopo ogni passo.

Se vuoi capire prima il perché: [guide/perche.md](guide/perche.md), una pagina.
In 20 slide, da proiettare o da girare a un collega: [guide/presentazione.pdf](guide/presentazione.pdf).

## Per chi

| Sei… | Parti da |
|---|---|
| Chiunque in Intarget con un account Claude | [inizia/](inizia/README.md), poi [chiedere in grande](guide/chiedere-in-grande.md) |
| Chi lavora con file, Excel, report e analisi pesanti | [inizia/](inizia/README.md) e la [cartella di lavoro](kit/primo-workspace/LEGGIMI.md) |
| Chi vuole una base di conoscenza personale | [secondo-cervello/](secondo-cervello/README.md) |
| Sviluppatore | [engineering/](engineering/README.md) |
| Owner dell'organizzazione Claude | [org/](org/README.md) |

## Cosa c'è

| Cartella | Contenuto |
|---|---|
| [`inizia/`](inizia/README.md) | la configurazione passo per passo, il prompt che fa configurare Claude da solo, i modelli dei due CLAUDE.md |
| [`guide/`](guide/) | [perché](guide/perche.md) · [memoria](guide/memoria.md) · [Indeck](guide/indeck.md) · [chiedere in grande](guide/chiedere-in-grande.md) · [fonti](guide/fonti.md) · [Chat, Cowork e Code](guide/app-desktop.md) |
| [`kit/primo-workspace/`](kit/primo-workspace/LEGGIMI.md) | una cartella di lavoro pronta da copiare |
| [`org/`](org/README.md) | le istruzioni aziendali per claude.ai e Claude Code, e come pubblicarle |
| [`secondo-cervello/`](secondo-cervello/README.md) | la versione leggera (una cartella + Indeck) e quella completa, facoltativa: un vault con git compilato da Claude, Obsidian come vista, con la specifica che Claude esegue |
| [`engineering/`](engineering/README.md) | per i repository di codice: AGENTS.md, la specifica della memoria per agenti, stack e pattern di riferimento, orchestrazione di strumenti e modelli, skill (in inglese) |
| [`risorse.md`](risorse.md) | persone da seguire, strumenti, documentazione ufficiale |

## Perché i modelli e i prompt sono in inglese

I testi che Claude legge come istruzioni (i modelli dei CLAUDE.md, i prompt da incollare, le istruzioni aziendali, le specifiche) sono in inglese: i modelli seguono meglio le istruzioni in inglese. Claude ti risponde comunque in italiano. Le pagine per le persone sono in italiano.

## Cosa non c'è, di proposito

- **Obsidian obbligatorio, hook, script, git.** Per iniziare non servono. La versione completa resta disponibile come scelta.
- **Copie della memoria di Indeck sul computer.** Ogni fatto ha un posto solo: la mappa è in [guide/memoria.md](guide/memoria.md).
- **Liste di passi da dare a Claude.** Funzionano peggio di un obiettivo chiaro con un controllo finale.

## Contribuire

Questo repository è pubblico. Prima di proporre una modifica leggi [CONTRIBUTING.md](CONTRIBUTING.md): niente nomi, clienti, costi o dettagli interni.
Le modifiche passano da una pull request. Manutenzione: Simone Bova, Innovation Hub.
