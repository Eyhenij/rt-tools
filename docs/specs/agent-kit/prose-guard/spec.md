# The guard of the wording

**Status:** in force · **Revision:** 2026-08-20 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `project-documentation`
**Procedures:** none

## Why

The wording agreements of the rules layer were checked by nothing: plain words, the absence of
officialese, the words from the left column of the glossary — all of it was held by the memory of
whoever writes, and surfaced already in the owner's edit. The subdomain names what the guard of the
wording checks, what it does not judge and why a finding comes together with a replacement.

## Terminology

- **A finding** — a word or a turn of phrase that is not written in this tree, together with what to
  replace it with.
- **The new text of an edit** — the lines the edit adds; what has accumulated in the file the guard
  does not judge.

### What it is called in the interface

The guard has no interface: only the executor sees it — as the text of a refusal in their own turn.

## Rules

- **Officialese and words not written in the tree do not go away into a document.** The wording
  agreements were checked by nothing and were held by the memory of whoever writes.
- **Every finding is named together with a replacement.** A list of bans without a replacement reads
  as a ban on writing, and the author goes around it instead of editing the text.
- **A write by a shell command is judged the same as one by the edit tool.** The same text with the
  name of the shell instead of the name of the edit gave silence, and a document written by a heredoc
  went past the wording convention whole. The target is taken by the shared parse of write targets,
  and the new text is the body of the command: the written text stands inside it.
- **Only the new text of the edit is judged.** What has accumulated is fixed by separate work;
  refusing an edit of a neighbouring line for it would make the guard avoidable out of necessity.
- **The boundaries of a word are counted by letters, not by the class `\w`.** It is ASCII-only: a
  sample with it on Cyrillic never fires once and stays silent about that.
- **The signs of officialese exist in each language of the layer, and both sets judge every line.**
  The rules layer is written in English, and the texts for the owner in their language; the set of
  one language on a line of the other matches nothing, and there is no need to work out the language
  of the file.
- **A word that is also a noun is checked by what stands after it.** The plural form of the pronoun
  coincides with a noun that has no replacement: the data of the stand are data, and there is nothing
  to rewrite the line with. It reads as a pronoun before the word it itself defines — that is what it
  is recognised by. The list of such words is short on purpose: what is recognised is what has been
  met, and a false refusal here costs more than a miss — the check stands in the suite of the push
  gate, and red on a word without a replacement stops the work whole.

## What is out of scope

The wording of an answer to the owner is not judged by the guard: an edit of a file is visible to it,
a remark is not.

## Contract

The surface is the file of the hook the tree calls at an edit of a file. The refusal comes as the
decision `deny` with the text of the reason, where every finding is named together with a
replacement; silence means the edit is allowed.

### Refusal codes

Not applicable: the guard answers with a decision and the text of a reason, not with a code.

## Data

The lists of words and replacements live in the check of the wording, next to the guard.

## Screens and states

The subdomain has no screens: it lives as a guard and a check.

## Cross-cutting requirements

### Locales

The rules layer and the documents of the tree are written in English, the task, the request and the
answer to the owner in their language; the guard holds a set of signs for each of the two and judges
every line by both.

### SEO

Does not apply.

### Mobile layout

Does not apply.

### Several objects

Does not apply.

## Decisions

- **A finding comes together with a replacement.** A list of bans without a replacement reads as a
  ban on writing, and the author goes around it instead of editing the text.
- **Only the new text of the edit is judged.** What has accumulated is fixed by separate work.

## Open questions

None.

## History of changes

- 2026-08-20 — the subdomain was split out of the guards spec: the scenario file had outgrown the
  length limit, and the subject in it was double.
