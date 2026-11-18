---
name: doc-style
kind: rule
law: project-documentation
description: Rule under the project-documentation law. Load when editing any .md, code comments, commits and PR descriptions. Patterns doc-style-write, -human, -sweep, -trace.
---

# Project texts

Rule under the law `docs/constitution/project-documentation.md`. Companion `implementation.md`; cold part
`pitfalls.md`, `pitfalls-2.md`.

## How the law applies here

- **A path named in a document exists.** Ignored drafts (info/exclude too) aren't judged.
- **A bare name or directory counts as a full path.**
- **The archive and task folder are outside the path check.**
- **Portable text is outside the address check too.**
- **A directory index and its contents match both ways.**
- **An index is kept only for a directory read through it.** Empty is fine.
- **An index entry is its file name in backticks.** A titled link may join it.
- **A name kept only as gone is in the exceptions.** Also builds, branches, lint rules.
- **A laid-out file needs no pair.**
- **A document ships in its change's commit.** Bypass: nonempty `Docs-skip: <reason>`.
- **A tree file is edited by the edit tool, not shell.**
- **A document is no longer than the length limit.** Prose below code's, rules in characters too; an outgrown spec splits, a rule at the ceiling folds an argument or splits; the limit stays.
- **A file moving to the archive names its former address in its header.**
- **The glossary is edited where assembled, not where read.** A new word joins it in that change, or a plain word is used.
- **An override section replaces the same-named package section whole.** Tree words take their own heading.
- **The working glossary is not the screen language.**
- **Machine state is written as a command and the answer to compare.**
- **An archive record has an expiry, then is removed.** Tree-set; the check adds a day.
- **Expired records leave in their own commit.** The PR names it unrelated.
- **A live text names a decision in words, not an archive address.**
- **A diagram changes with the text it depicts.**
- **A text's number is recomputed by command in that change, or not written; a check is run, not retold.**

## Texts for a person

- **Register follows the addressee.**
- **Owner texts use product words.** Not: PR, run, suite, agreement.
- **A task shows what broke for the person, not just a red check.**
- **No passive voice or metaphors here.**
- **Rules layer in English, owner texts in the owner's language.** Owner's: task, PR, commit, chat, analyses.

## Skills without a law

- `archive-record` — the record of closed work.
