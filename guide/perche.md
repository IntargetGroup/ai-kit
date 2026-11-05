# Perché funziona così

Una schermata: cosa conta e perché. I dettagli sono nelle guide collegate.

## Il contesto è tutto

Il modello è lo stesso per tutti. Cambia quello che ha davanti: chi sei, per quale cliente lavori, quali file contano, cosa vuol dire «fatto». Senza questo contesto Claude è «un dipendente brillante ma nuovo, che non conosce le vostre regole» ([guida ufficiale](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)).

Conta il contesto giusto, non la quantità. Per questo il kit fa tre cose: collega Claude a Indeck, ti dà due file di istruzioni piccoli, ti insegna a chiedere in grande. Inizia da [inizia/README.md](../inizia/README.md).

## Cosa sa Claude e cosa no

```text
App Indeck                         Claude + MCP di Indeck
a ogni messaggio riceve già:       alla connessione riceve i nomi
  il tuo CORE                      degli strumenti e poche regole;
  il CORE dello spazio in cui      il resto lo deve chiedere:
  lavori                             whoami
                                     → il tuo CORE personale
tu non fai niente                    → il CORE del workspace o progetto
```

- Nell'app Indeck il contesto arriva da solo. In Claude non arriva niente su di te: Claude lo deve chiedere a Indeck.
- Chi glielo dice: nella scheda Code il tuo CLAUDE.md globale; in Chat e in Cowork lo stesso testo, incollato in Impostazioni → Istruzioni per Claude (Settings → Instructions for Claude).
- Le istruzioni dell'organizzazione valgono in Chat quando l'amministratore le pubblica. In Cowork e nella scheda Code non contarci: per questo il CLAUDE.md globale ripete le regole che servono ([cosa legge ogni modalità](app-desktop.md)).
- Alcune cose restano solo in Indeck: le Istruzioni di workspace e progetto, il tuo profilo, le chat. Dettagli: [guide/indeck.md](indeck.md).

## La memoria

Ogni fatto vive in un posto solo, con la sua fonte, e decidi tu cosa entra. La mappa di cosa va dove: [guide/memoria.md](memoria.md).

## Chiedere in grande

Scrivi tre righe: Obiettivo, Fatto quando, Limiti. Poi resta nel giro e chiedi una prova precisa del risultato. Metodo ed esempi: [guide/chiedere-in-grande.md](chiedere-in-grande.md).

## Cosa resta umano

- **Decidere.** Claude prepara, tu decidi. Claude ti chiede conferma prima di inviare, pubblicare, cancellare, spendere crediti o modificare un sistema in produzione o l'account di un cliente.
- **Rispondere.** Chi chiede risponde di quello che fa l'agente, anche quando ha scelto di non farsi chiedere conferma.
- **Firmare.** Un testo per un cliente lo rivede una persona prima dell'invio. Il tono di Intarget lo mette chi conosce il cliente.
- **Proteggere i dati.** Solo i dati che servono al compito. I dati di un cliente solo per quel cliente. Sempre l'account aziendale.

Le regole complete: [org/istruzioni.md](../org/istruzioni.md). Dati e fonti: [guide/fonti.md](fonti.md).
