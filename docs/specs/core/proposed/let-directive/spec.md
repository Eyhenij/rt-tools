# A local value of a template

**Status:** proposed · **Revision:** 31 August 2026 · **Scenario prefix:** `SC-CR`
**Depends on:** none
**Laws:** `frontend-application`
**Procedures:** none

An agreement about the product written before the code. It is merged into the spec of the domain by the
last commit of the PR — with the former scenario numbers. There is no domain of the core in the tree yet:
the agreement will become its beginning when the owner says to create the domain.

## Why

An expression a template needs several times is repeated in it as many times as it is needed — and is
counted anew at every redrawing. A long chain of fields has to be written whole in every place, and a
condition setting the emptiness apart has to be written next to every one of them too. Hence two troubles:
one of the copies is edited and the rest are forgotten, and the cost of the expression is multiplied by the
number of the copies.

A name of its own for the value lifts both: the expression stands in the template once, and further on it
is read by the name.

## Terminology

| Term              | What it is                                                          |
| ----------------- | ------------------------------------------------------------------- |
| a local value     | a value named by a name inside one piece of markup                  |
| the content       | the markup that name is available to                                |
| a substitute name | a second name of the same value named by the consumer through `let` |

### What it is called in the interface

Not applicable: the directive draws nothing and is not visible on the screen.

## Rules

- **The directive declares a name and does not dispose of the showing.** The content is drawn at any value
  of the input — an empty one, a false one, a zero one. A directive hiding the content by the emptiness
  cancels the condition written next to it, and does it silently: the author sees their own condition in the
  markup and does not see the foreign one.
- **The view is created once, and a new value arrives into it.** Recreated at every change of the value, it
  loses the state of everything inside: the typed text, the opened panel, the position of the scroll.
- **The name is available both as the value by default and under the name of the directive.** The first is
  an ordinary reading, the second is needed where the content declares several names at once and the default
  is already taken.
- **The type of the value reaches the content.** Otherwise a strict check of the template derives it as
  unknown, and every address to a field has to be brought to a type by hand — that is, to give up the check
  in the very place the name was created for.
- **The content is redrawn together with the host, and the directive puts no mark of its own.** The value
  arrives by a binding from the template of the host, and the host itself becomes dirty from it — the view
  created by the directive is checked together with it. A mark of the redrawing put just in case is dead
  code: lifted, it changes nothing, and standing, it promises that the directive closes a case that does not
  exist.

## What is out of scope

- The conditional showing and the branch "otherwise": that is the work of a condition, and it is already in
  the language of the markup.
- The taking apart of the streams and of the signs of the waiting: the value arrives ready, and where from
  is decided by the consumer.

## Contract

Not applicable: the domain serves no procedures.

### Refusal codes

Not applicable: the directive has no refusals — it accepts any value and throws nothing.

## Data

Not applicable: the directive has no records of the storage of its own.

## Screens and states

Not applicable: the directive draws nothing.

## Cross-cutting requirements

### Locales

Not applicable: the directive has no labels.

### SEO

Not applicable.

### Mobile layout

Not applicable: the directive sets no layout.

### Several objects

Not applicable.

## Decisions

- **The directive does not dispose of the showing** — the declaration of a name and the condition of the
  showing joined in one directive cancel each other silently. Rejected: to hide the content at an empty value
  — that is what a part of the similar directives does, and it is exactly on that that whoever wrote a
  condition next to it is caught.
- **The value is given both by the default and under the name of the directive** — the second name costs one
  line and lifts a clash when the content declares several names. Rejected: one default — it is cheaper, but
  the clash is fixed by a renaming at the consumer.

## Open questions

- `Q-1` — whether the directive is needed where the value is already a signal: the reading of a signal in a
  template is repeated cheaply, and the gain stays only at a long expression. The work goes with the
  assumption that the case of a long expression and a foreign value without a signal exists at both kits.

## History of changes

- 31 August 2026 — the agreement was written.
