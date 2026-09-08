# The length limit of a rule description

**Status:** in force · **Revision:** 2026-08-25 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `project-documentation`, `work-conduct`
**Procedures:** none

## Why

The description of a rule goes into the system prompt of every session — all seventy-four of them,
and the session pays for them whatever it works on. The measurement of 25 August 2026: 23 830
characters of descriptions at an entry into work of 55 142 characters, that is, more than two fifths
of everything the session gets before the first line of work.

It grows on its own: the description is written after the rule and retells its content in it — what
the rule names, which sections it holds, what it ends with. No check counts the length of a
description, and forty descriptions out of seventy-four have outgrown three hundred characters.

The price is not in the kilobytes but in what this teaches: a rule is picked by the description, and
a pick is a decision on one question. A description retelling the rule answers a question asked
below, and the same text arrives a second time together with the rule itself.

## Terminology

| Term                       | What it is                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| the description of a rule  | the field `description` in the header of the skill; it goes into the system prompt of every session |
| the limit of a description | the greatest number of characters a description takes                                               |
| accepted debt              | a description longer than the limit, left deliberately and named by name                            |

### What it is called in the interface

Not applicable: the rules layer has no screen.

## Rules

- **The description of a rule is no longer than three hundred characters.** The number was assigned
  by the owner from the first measurement: forty descriptions out of seventy-four are longer today,
  and what is cut in them is the retelling of the content, not what the rule is picked by.
- **The description answers one question — take this rule or not.** It names when the rule is taken
  and — at a pattern — when it is not taken, sending to a neighbouring one. A list of sections, a
  retelling of the articles and the argument why the rule was created do not go into the description:
  they are read in the rule itself, and they arrive together with it.
- **The length of a description is counted by a command, not by eye.** The check reads the header of
  every skill and names those that exceeded by name, with the number of characters; without it a
  description grows back over a few edits, and there is nothing to see it by.
- **A description left longer than the limit stands in the list of the accepted debt by name.** A
  rule that would otherwise stop being found by its subject is more important than three hundred
  characters; but a silent excess and a deliberate one look the same, so the second is named by a
  list.
- **The rule is still found by its subject.** The trim is judged not by the length but by the rule
  being picked where it was picked before: the words it was called by do not leave the description.

## What is out of scope

- The compression of the rules and the patterns themselves — the tasks RT-1132…RT-1135 of the same
  epic.
- The glossary and the map of the turn, which go by the startup hooks — the task RT-1137.
- The length limit of the rule itself — the task RT-1139: it is about the body, not about the header.

## Contract

Not applicable: the domain serves no procedures.

### Refusal codes

Not applicable.

## Data

Not applicable: the domain has no storage records of its own.

## Screens and states

Not applicable.

## Cross-cutting requirements

### Locales

Not applicable: the rules layer is not translated.

### Access

Not applicable.

### Observability

The check of the length prints the descriptions that exceeded as a list: the name of the skill, the
number of characters, the limit. Silence means all the descriptions are within the limit.

### SEO

Not applicable: the rules layer is not shown outward.

### Mobile layout

Not applicable: the rules layer has no screen.

### Several objects

Not applicable: the rules layer has no ownership — it is one per tree.

## Decisions

- **The limit is three hundred characters** — the owner's number, assigned from the first
  measurement. Rejected: a hundred and fifty, giving half the volume of the descriptions — at them a
  description stops telling the neighbouring patterns of one rule apart from each other.
- **Characters are counted, not bytes** — a byte says nothing about the price of the window, and
  Cyrillic makes it one and a half times bigger than a character. Rejected: bytes, which the command
  of counting the price of the layer measures by.
- **An excess is lifted by the list of the accepted debt, not by raising the limit** — a rule that
  would otherwise stop being found by its subject is more important than three hundred characters,
  but it must be named by name. Rejected: a threshold at which the exception stays silent.

## Open questions

- `Q-1` — whether to count the descriptions of skills the tree does not lay out. The work goes with
  the assumption that the check judges the laid-out: there is nothing unlaid-out in the tree at all,
  and in the package the description is edited in the source and falls under the same check at a
  consumer.

## History of changes

- 2026-08-25 — the agreement was written before the code: the limit, the shape of the description,
  the list of the accepted debt.
