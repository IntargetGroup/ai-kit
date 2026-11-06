# Secondo cervello

Un secondo cervello è il posto dove Claude ritrova ciò che sai, da una sessione all'altra.
Qui ci sono due varianti. Parti dalla leggera: basta a quasi tutti.

| | [Leggero](leggero.md) | [Completo](completo.md) |
|---|---|---|
| Cos'è | Una cartella di lavoro sul tuo computer + Indeck | Un vault personale di note in Markdown, compilato da Claude Code, con git |
| Per chi | Tutti | Chi usa Claude Code e vuole una base di conoscenza personale costruita in mesi, da molte fonti |
| Cosa installi | Niente oltre all'app desktop di Claude | Git e Node.js. Claude Code c'è già nella scheda Code (Code tab) dell'app desktop. Obsidian se vuoi leggere le note e vedere il grafo |
| Tempo di avvio | 15 minuti | Mezz'ora di preparazione e una o due ore con Claude, poi una sessione ogni settimana o due |
| Dove vive la conoscenza di lavoro | In Indeck | In Indeck. Il vault contiene solo conoscenza personale |
| Punto di partenza | [inizia/README.md](../inizia/README.md) | [completo.md](completo.md), poi il prompt in [obsidian/BOOTSTRAP.md](obsidian/BOOTSTRAP.md) |
| Cosa legge Claude | Il CLAUDE.md globale, quello della cartella e i CORE di Indeck | [obsidian/SPEC.md](obsidian/SPEC.md), la specifica in inglese da cui costruisce e gestisce il vault |

## Le regole che valgono per entrambe

- **Indeck resta la memoria condivisa.** Clienti, progetti, decisioni e metodi stanno in Indeck. Il tuo computer contiene i file su cui lavori.
- **Un fatto, un posto.** Una copia locale di una memoria Indeck diverge in pochi mesi. Tieni un link, non una copia. La mappa completa è in [guide/memoria.md](../guide/memoria.md).
- **Il materiale dei clienti non va in un archivio personale.** Né in una cartella sincronizzata privata, né in un repository personale.
- **Niente segreti.** Password e chiavi stanno solo nel gestore di password. Dati sanitari e dati HR su altre persone non entrano né in Indeck né nel vault. Le tue note personali sensibili stanno fuori dal vault, nella cartella L1 della variante completa.

## Hai lavorato in un'altra chat?

Una conversazione utile su claude.ai, ChatGPT, Gemini o NotebookLM si porta dentro con [prompt-export-chat.md](prompt-export-chat.md). Il risultato va in Indeck con la skill di ingestione, oppure in `inbox/` del vault completo.
