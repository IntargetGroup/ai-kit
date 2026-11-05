# Contributing

Most readers of this kit are not engineers. A change is good when one of them does the right thing sooner after reading it. Agents that maintain the repo follow [AGENTS.md](AGENTS.md), which also holds the full writing rules.

## This repository is public

Never commit names of colleagues or client people, client or brand names, costs, seat or people counts, Indeck internals (source paths, database, cloud project names), workspace or project IDs, internal incidents, contract or HR content, or quotes from internal meetings. Roles ("un PM", "il tuo responsabile") are fine. When unsure, leave it out.

Pushing a branch to this repository publishes it, even before a PR.

`node scripts/check.mjs` catches the mechanical part in file text and file paths: emails, ID-shaped strings, key shapes, cloud hosts, currency amounts, binary files nobody has reviewed, and the patterns in [scripts/denylist.txt](scripts/denylist.txt). Names never go in that file, because it is public too. They go in the `CHECK_DENYLIST` repository secret, one regex per line. CI runs the secret only on push to `main`, because a pull request runs its own copy of the script. Before your first push, ask the maintainer for the private pattern file through an internal channel and run the check with it ([below](#check-locally)). Without it, the first name check runs after merge, when the text is already public.

A false positive on `email`, `indeck-id`, `cloud-host` or `money`: add `<!-- check:allow=<rule> -->` to that line. Credentials and denylist matches cannot be allowed.

### If something leaked

Deleting it in a new commit does not remove it: the old commit stays public. Do not open a public issue about it. Tell the maintainer, Simone Bova, privately and at once. If it is a password, key or token, revoke it first. The maintainer then rewrites the history and, if needed, asks GitHub Support to remove cached views ([GitHub: removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)).

## Start from a problem

Describe what a reader hit: their role, the surface (app desktop, Cowork, Code tab), Windows or macOS, what they tried, what happened, what they expected.

- Typo, broken link, or a stale fact you can source: open the PR directly.
- A new page, a change to the folder structure, or a change to what the setup does: open an issue first and get the maintainer's agreement on scope.
- One problem per PR. Two independent fixes are two PRs.

## Bring evidence

- A platform claim (Claude, Cowork, Claude Code, Windows) cites the official page in the text. No source, no claim.
- A change to the setup or a paste-in prompt is run on a clean Windows profile in the app desktop, then on macOS if you can. Say which surface you used.
- State what you could not check. A passing CI run alone does not show that the change works.

## Write it

- Italian for pages people read. English for `engineering/`, `AGENTS.md`, `CLAUDE.md` and this file.
- Rewrite the paragraph that changed. Do not append a second account of the same thing.
- One home per fact. Link to it instead of copying it. The organisation instructions live once, in `org/rendering/claude-ai.md`; `org/rendering/claude-code-managed-settings.json` carries a copy, and `org/istruzioni.md` explains the rules. `kit/primo-workspace/CLAUDE.md` is a copy of `inizia/modelli/CLAUDE-cartella.md`, and the prompt block in `kit/primo-workspace/LEGGIMI.md` is a copy of the one in `inizia/prompt-di-setup.md`. Change each pair together: `scripts/check.mjs` compares all three.
- Size budgets are enforced by `scripts/check.mjs` (for example: a guide has at most 250 lines). Cut before you ask for more room.
- No plans, research notes or agent scratch files in the repo. The merged PR is the record.

## Check locally

Node 22 or newer, no install step:

```sh
node scripts/check.mjs
```

To include the private patterns, keep the maintainer's file outside the repo and load it into `CHECK_DENYLIST`. Patterns run with the `u` flag: next to accented letters, use `(?<![\p{L}\p{N}])` and `(?![\p{L}\p{N}])` as word edges, because `\b` only knows ASCII. Windows (PowerShell):

```powershell
$env:CHECK_DENYLIST = Get-Content -Raw ~\ai-kit-denylist.txt; node scripts/check.mjs
```

macOS:

```sh
CHECK_DENYLIST="$(cat ~/ai-kit-denylist.txt)" node scripts/check.mjs
```

CI runs the same script (with the private patterns on push to `main`), a secret scan of the full history ([gitleaks](https://github.com/gitleaks/gitleaks)) and an external link check ([lychee](https://github.com/lycheeverse/lychee)). All three must pass before merge.

## Open the pull request

- Title: a conventional commit in plain language, for example `fix(inizia): setup prompt no longer overwrites an existing CLAUDE.md`.
- Body: fill in the template. The problem first, then the fix, then the verification.
- A change that alters what a reader does gets an entry in [CHANGELOG.md](CHANGELOG.md) in the same PR.
- If an agent did the work, end the body with the model and harness that did it.
- The maintainer reviews and merges. Agents never open a PR unless a person asked for it.
