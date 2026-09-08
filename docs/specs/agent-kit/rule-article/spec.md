# The applicability sign at an article of a rule

**Status:** in force · **Revision:** 2026-08-22 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `project-documentation`, `verifiability`
**Procedures:** none

## Why

The refusal of the rules gate called the whole rule, while one of its articles covers the specific
edit. A rule weighs from twenty to sixty kilobytes: the executor pays the full price of the rule for
a decision and learns the wrong thing — it is cheaper not to read what is surplus, that is, to work
worse than what was explored.

The subdomain names what an article speaks of its own applicability by, and how that article gets
into the refusal instead of the whole file of the rule.

## Terminology

- **An article of a rule** — an item of the top-level list in the section of the application of the
  law: a bold heading and the text under it.
- **The applicability sign** — the line `<!-- rt-when: <samples> -->` inside an article; the samples
  are separated by a space.
- **A matching article** — the one whose sample matched the path of the edit.
- **An unmarked rule** — a rule that has the sign at not one of its articles.

## Rules

- **An article of a rule speaks of its own applicability itself, by a sign line at its side.** The
  gate map knows the path and the rule, but does not know which of two dozen articles is about that
  path.
- **The refusal names the matching articles by headings, it does not retell them by their body.** The
  session loads the rule after that, and the text of the articles arrives in the context together
  with it: a retelling in the refusal is paying for one text twice. At the rule of the texts the
  refusal printed 4 134 characters in eleven articles, and their headings weigh 718. The heading at
  that is no decoration: the binding of a statement to code goes by it, and it is also what finds the
  article in the rule by eye.
- **The sample is compared against the path of the edit as a shell sample, not by a word search.** A
  search names the wrong article and stays silent about it.
- **A sample without a directory is compared against the file name too.** The article says "about
  such files", and the edit arrives as a full path.
- **The expansion of names at the parse of the samples is switched off.** Otherwise `*.scss` unfolds
  into the file names of the working directory, and the article is picked by where it was called
  from.
- **The sign itself does not go into the printed article.** It says nothing to a person.
- **An article without a sign is lawful, and a rule without a single sign is too.** Nothing matched —
  whoever calls is left with the former refusal.
- **The article lifts the reading of the whole rule, not the refusal itself.** The whole rule stays
  the second move — for whoever finds the article too little.

## What is out of scope

- **Picking an article by a match of words.** Rejected by the owner's decision: such a search names
  the wrong article and stays silent about it.
- **The sign in the gate map instead of at the article.** Rejected by the owner's decision: the map
  is cheaper to edit, but it spreads the knowledge about the rule over two files, and they will
  diverge silently.
- **The lifting of the refusal by an article.** An article will lift it only at a rule with a cold
  part; the mechanism of the cold part is created separately.
- **Marking the articles of all the rules at once.** What is marked is the rules that refuse at an
  edit of a file; the rest as their refusals reach the digest.
- **The sign at a pattern and at a law.** The gate demands a rule, not a pattern; a law knows no
  paths at all.

## Contract

The surface is a parse helper next to the gate: two functions, the signs of the rule and the text of
the matching article. The text of the articles is printed whole; nothing matched — nothing is
printed, and the exit code is zero.

### Refusal codes

Not applicable: the helper answers with text and a zero code. It has no refusal at all — it stays
silent where there is nothing to judge.

## Data

Not applicable: the helper reads the file of the rule and the path of the edit, it has no storage of
its own.

## Screens and states

Not applicable: the subdomain is about the text of a refusal, not about a screen.

## Cross-cutting requirements

- **Refusing in favour of the work.** There is no file of the rule, the path of the edit is empty,
  there is not a single sign — the helper stays silent and gives back zero.
- **Portability.** Not a single name of a tree: the samples are set by the rule that is being marked.

### What it is called in the interface

Not applicable: the subdomain has no screen, its surface is the text of the gate refusal.

### Locales

Not applicable: the output of the gate is single-language.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The parse is one for all the trees: it reads the rule it was named and the path of the edit. The
samples belong to the rule, not to the tree, and they move together with it.

## Decisions

- **The shape of the sign is a markup comment.** It is invisible in the assembled markup, so the
  article is read by a person as before, while the machine sees the line whole.
- **The parse lives as a helper, not inside the gate.** The gate stands at every call, and the parse
  of a rule inside its body would be paid for at every one.

## Open questions

- **Q-1. Whether to mark the articles of sections beyond the section of the application of the law.**
  The pitfalls and the incident analyses are also tied to the kind of a file, but they do not go into
  the refusal: it is decided together with the cold part of the rule.

## History of changes

- 2026-08-22 — the subdomain was created: the applicability sign at an article and the printing of
  the article in the refusal.
