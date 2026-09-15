# The consumer's own trigger of a choice from a list

**Status:** in force · **Revision:** 2026-09-15 · **Scenario prefix:** `SC-UKV`
**Depends on:** the popover directive of the kit, the select family and the multiselect family
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

## Why

Both families that choose from a list — one value and several — draw the same trigger: a button
shaped like an input field, with the chosen label, an icon on the left, a clearing cross and a
chevron. That shape is right on a form and wrong everywhere else. A row of actions in a table needs
a bare icon; a filter above a list needs a badge with a count; a switch of workspaces needs a pill
with the current name.

A consumer who needs one of those writes the whole thing anew — the panel, the keys, the overlay,
the closing — and ends up with a third copy of what the kit already has. Two such copies stand in
the application today, and one of them pulls in a foreign component library for its own trigger.

The families give the consumer one input: the markup of the trigger. Everything else — the panel,
the choosing, the keys, the closing — stays with the kit.

## Terminology

- **The trigger** — what a person presses to open the list. The kit draws it as a button and carries
  the behaviour on it; what is drawn inside the button is the subject of this agreement.
- **The kit's own trigger** — the field-shaped markup the families draw when the consumer declares
  nothing.
- **The state of the trigger** — the three values the kit hands to the consumer's markup: whether the
  list is open, what is chosen, whether the choice is switched off.

### What it is called in the interface

The person behind the screen sees no trigger and no template. They see the thing they press to open
a list: a field, a badge, an icon, a pill with a name.

## Rules

- **The behaviour of the trigger stays with the kit, and the consumer gives only what is drawn
  inside.** Opening the list, its width, the marks of accessibility, the switched-off state, the keys
  and the closing hang on the button. Handed over together with the markup, they would be written
  anew by every consumer, and each would forget a different one of them.

- **A consumer who declares no trigger sees what they saw before.** The kit's own trigger stays the
  default, and the input moves not one of today's consumers of either family.

- **The consumer's markup receives three values and no more: whether the list is open, what is
  chosen, whether the choice is switched off.** Those are what a trigger is drawn by — a chevron that
  turns, a label made of the choice, a muted look. More would tie the consumer's markup to the inner
  workings of the family, and then the family cannot be edited without breaking them.

- **One input serves both families.** They differ inside the button and nowhere else: one draws a
  label, the other a row of chips. Two inputs for one thing drift apart at the first edit.

- **The consumer's markup goes inside the button, not instead of it.** A consumer's own button inside
  it would be a button inside a button: no browser draws that and no screen reader announces it.

- **The kit's own look of the trigger goes away together with its markup.** The button is shaped like
  an input field — a ground, a border, a height, paddings — and under a badge or a bare icon that
  field stays visible around the consumer's markup. The whole point of the input is then lost: the
  consumer gets their badge inside somebody else's field. What stays is the behaviour, not the look.

## What is out of scope

- The look of the consumer's trigger: the kit gives no badge, no pill and no icon trigger of its own.
- The panel of the list: it belongs to the families themselves and does not change here.
- The row of actions of the table and the filter cell of its header: they are consumers of this
  input, and they arrive with the task that carries the dynamic list over.

## Contract

None: both families are layout components and serve no procedure. The trigger is declared by a
content template and read as a content child.

### Refusal codes

Not applicable: a family without a declared trigger draws its own, and refuses nothing.

## Data

None of its own. What is chosen belongs to the family and reaches the consumer's markup as a value
of the template context; nothing is stored between visits.

## Screens and states

| state                                       | what is drawn                                       |
| ------------------------------------------- | --------------------------------------------------- |
| no trigger declared                         | the kit's own field-shaped trigger                  |
| a trigger declared, the list closed         | the consumer's markup inside the kit's button       |
| a trigger declared, the list open           | the same, and the context says the list is open     |
| a trigger declared, the choice switched off | the same, and the button is switched off by the kit |

## Cross-cutting requirements

### Locales

The input draws no text of its own: everything visible in the consumer's trigger is written by the
consumer, in their own language.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The input changes nothing at any width: the panel takes its width from the trigger as before, and
the consumer's markup is theirs to lay out.

### Several objects

Not applicable: the families belong to no owning entity.

## Decisions

- **A family of its own for such a trigger is not started.** The kit already holds the panel, the
  choosing, the keys and the overlay in two families; a third copy of them is what the rule of
  uniformity forbids outright — the ready-made is extended, not cloned next to it.

- **The context of the template carries values, not the family itself.** Handed the component, the
  consumer's markup would reach its every method, and the family would stop being editable.

## Open questions

None.

## History of changes

- 2026-09-15 — written by the task RT-2152, which gives the families a trigger of the consumer's own.
