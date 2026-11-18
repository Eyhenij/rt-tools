---
name: doc-style
kind: rule
law: project-documentation
description: Rule under the project-documentation law. Load when editing any .md, code comments, commit bodies and PR descriptions. Patterns doc-style-write, -human, -sweep, -trace.
---
<!-- rt-kit v0.37.0 · rules/doc-style.md · af33b382d82e · правится надстройкой, не здесь -->

# Project texts

Rule under the law `docs/constitution/project-documentation.md`. Cold part: `pitfalls.md`,
`pitfalls-2.md`.

## How the law applies here

- **A path named in a document exists.** Gitignored drafts are not judged.
- **A bare name or directory is judged as a full path.**
- **The archive and the task folder are outside the path check.**
- **Portable text is outside the address check too.**
- **A directory index and its contents match both ways.**
- **An index is kept only for a directory read through it.** An empty list is legitimate.
- **An index entry is its file name in backticks.**
- **A name kept only as gone is in the exceptions.** Also build outputs, branches, linter rules.
- **A laid-out file needs no pair.**
- **A document ships in its change's commit.** Bypass: `Docs-skip: <reason>`, not empty.
- **A tree file is edited by the edit tool, not shell.**
- **A document is no longer than the length limit.** Prose: below code's, rules also in characters; an outgrown spec splits; the limit stays.
- **A file moving to the archive names its former address in its header.**
- **The glossary is edited where assembled, not where read.** A new word joins it in that change.
- **An override section replaces the same-named package section whole.** The tree's words take their own heading.
- **The working glossary is not the screen language.**
- **Machine state is written as a command and the answer to compare.**
- **An archive record has an expiry, then is removed.** Set by the tree; the check adds a day.
- **Expired records leave in their own commit.** The PR body names it unrelated.
- **A live text names a decision in words, not an archive address.**
- **A diagram changes with the text it depicts.**
- **A number in a text is recomputed by command in the same change; a check is run, not retold.**

## Texts for a person

- **A text's register follows its addressee, known first.**
- **Owner texts use product words, not layer words.** Not: PR, run, suite, agreement.
- **A task shows what broke for the person, not only the red check.**
- **No passive voice or metaphors in these texts.**
- **The rules layer is in English, owner texts in the owner's language.** Owner's: task, PR, commit body, chat, incident analysis, archive record.

## Skills without a law

- `archive-record` — the record of closed work.

## This tree

- **The archive has no index here.** No append-only list; union merge only where one remained.
- **Archive retention here is a week.** Key `archiveRetentionDays`.
- **Kit consumers are never named here.** A name in history stays; a request is retold by what it asks.
