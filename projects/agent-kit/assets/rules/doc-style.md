---
name: doc-style
kind: rule
law: project-documentation
description: Rule under the project-documentation law. Load when editing any .md, code comments, commit bodies and PR descriptions. Wording samples: pattern doc-style-write; the form of texts for the owner: doc-style-human.
---

# Project texts

Rule under the law `docs/constitution/project-documentation.md`. Cold part: `pitfalls.md`,
`pitfalls-2.md`.

## How the law applies here

- **A path named in a document exists.** Untracked drafts are not judged.
- **A bare name or directory is judged as a full path.**
- **The archive and the task folder are outside the path check.**
- **Portable text is outside the address check, like the archive.**
- **A directory index is checked against its contents both ways.**
- **An index is kept only for a directory read through it.** Listed by the tree; empty is legitimate.
- **An index entry is named by its file name in backticks.**
- **A name mentioned only as gone is listed in the exceptions.** Also build outputs, branches, linter rules.
- **A laid-out file needs no pair.**
- **A document ships in its change's commit.** Bypass: `Docs-skip: <reason>`, never empty.
- **A tree file is edited by the edit tool, not a shell command.**
- **A document is no longer than the length limit.** Prose: below code's, rules also in characters; an outgrown spec splits.
- **A file moving to the archive names its former address in its header.**
- **The glossary is edited where it is assembled, not where it is read.**
- **An override section replaces the same-named package section whole.** The tree's words take their own heading.
- **The working glossary is not the screen language.**
- **Machine state is written as the command asking it.**
- **An archive record has an expiry, then is removed.** The tree names it; the check allows a day more.
- **Expired records leave in a commit of their own.** The PR body names it unrelated.
- **A live text names a decision in words, not an archive address.**
- **A diagram changes with the text it depicts.**

## Texts for a person

- **A text's register follows its addressee, known first.**
- **A text for the owner uses the product's words, not the rules layer's.**
- **A task shows what broke for the person, not only the red check.**
- **No passive voice or metaphors in these texts.**
- **The rules layer is in English, owner texts in the owner's language.** Owner's: task, PR, commit body, chat, incident analysis, closed-work record.

## Skills without a law

- `archive-record` — the record of closed work.
