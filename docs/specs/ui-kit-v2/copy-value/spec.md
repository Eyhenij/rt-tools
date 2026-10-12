# The value with a copy button

**Status:** in force · **Revision:** 2026-10-08 · **Scenario prefix:** `SC-UKV`
**Depends on:** the icon button and the tooltip of the kit
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

A subdomain of the second kit about `rt-copy-value`: a short value a person carries to another
place, drawn with a copy button.

## Why

A reference number in an error message is selected with the mouse. The kit copies only inside a
table cell and the error box of a side panel; there is no part for a value standing on its own.

## Terminology

- **The value** — the text that is shown and goes to the clipboard.
- **The label** — the short word left of the value.

### What it is called in the interface

| In the domain | On the screen                                 |
| ------------- | --------------------------------------------- |
| The label     | «Reference» left of the value                 |
| The value     | the id on the grey plate                      |
| Copy          | the copy button and its tooltip «Copy»        |
| Copied        | the check and the tooltip «Copied» after copy |

## Rules

- **The value stands on a plate, and the label left of it is drawn only when given.**

- **A press puts exactly the value into the clipboard and reports it out.**

- **After a copy the button shows a check and «Copied» for two seconds, then «Copy» again.**

- **The consumer can give the button its own label at rest.** Without it the label is the kit's
  «Copy».

- **A long value is cut with an ellipsis, and the button stays visible.**

## What is out of scope

- Copying inside a table: that is `rt-copy-cell`.

## Contract

None: the part is a layout component and serves no procedure.

### Refusal codes

Not applicable.

## Data

None of its own.

## Screens and states

| state      | what is drawn                                      |
| ---------- | -------------------------------------------------- |
| at rest    | the label, the value on the plate, the copy icon   |
| copied     | the check and the tooltip «Copied»                 |
| long value | the value cut with an ellipsis, the button visible |

## Cross-cutting requirements

### Locales

«Copy» and «Copied» are kit labels, English in the package and translated by the consumer's
translator. The label and the value come from the consumer.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The part takes the width it is given; a long value is cut.

### Several objects

Not applicable.

## Decisions

- **A part of its own, not the table's copy cell.** The cell hides its button until the row is
  hovered and lives in the table entry; a value in a message needs neither.

## Open questions

None.

## History of changes

- 2026-10-08 — written by the task RT-2652 of the epic RT-2649, which brings the assistant chat
  into the kit.
