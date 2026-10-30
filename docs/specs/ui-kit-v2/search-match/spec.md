# The match rule of a search

**Status:** in force · **Revision:** 2026-10-20 · **Scenario prefix:** `SC-UKV`
**Laws:** `reuse-first`, `verifiability`
**Procedures:** none

A subdomain of the second kit about one rule by which every search of the kit decides whether a
row matches a query, and which pieces of its label it marks.

## Why

The kit searched by two rules. The side menu, the select, the multiselect and the tree kept a row
only when the whole query stood in its label as one phrase. The dynamic selector and the tree
selector kept it when every word stood anywhere. The highlight marked by words everywhere. A query
«отчёт март» then marked words in rows the filter should have dropped, and did not find «Март,
отчёт» at all. One field taught the person one way to search, and the next one refused it.

## Terminology

- **A query** — the text the person typed into a search field.
- **A word of the query** — a piece of the query between spaces.

### What it is called in the interface

The rule has no text of its own: the search fields keep their labels.

## Rules

- **A row matches when every word of the query stands in its text, in any order.** A word may
  stand inside a longer word.

- **Case does not matter, and «ё» matches «е».** «ЁЛКА», «елка» and «Ёлка» find each other.

- **A query of spaces alone is no query.** Every row stays, and nothing is marked.

- **The highlight marks every place where a word of the query stands, by the same rule.** Pieces
  that overlap are marked as one piece, and the label keeps the case it was written in.

- **Every search of the kit filters and marks by this rule.** It is the side menu, the select, the
  multiselect, the tree, the dynamic selector and the tree selector; the tag and the chat mark by
  it.

## What is out of scope

- A search by a typing mistake or by a word form: «отчёты» does not find «отчёт».
- Which text of a row is searched: each place keeps its own, the label or the label with the
  description and the badges.

## Contract

None: the rule is a pure function of the kit and serves no procedure.

### Refusal codes

Not applicable.

## Data

None of its own.

## Screens and states

| state                    | what is drawn                                 |
| ------------------------ | --------------------------------------------- |
| no query                 | every row, nothing marked                     |
| a query of several words | the rows holding every word, each word marked |
| a query no row holds     | the empty state of the place                  |

## Cross-cutting requirements

### Locales

The rule compares letters, not words of a language. «ё» and «е» are the only letters it treats as
one.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

Not applicable: the rule draws nothing.

### Several objects

Not applicable.

## Decisions

- **Every word in any order, not the whole phrase.** Two fields already searched so, and the
  highlight already marked so.
- **«ё» matches «е».** People often type «е» for «ё», and a label may be written either way.

## Open questions

None.

## History of changes

- 2026-10-20 — written and carried out by the task RT-2869 of the epic RT-2861.
