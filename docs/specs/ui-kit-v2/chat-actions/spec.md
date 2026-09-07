# The actions at a reply of a correspondence

**Status:** in force · **Revision:** 2026-08-30 · **Scenario prefix:** `SC-UKV`
**Depends on:** none
**Laws:** `frontend-application`, `reuse-first`
**Procedures:** none

The subdomain names what a consumer of the correspondence declares its own action at a reply by and
where the boundary runs between those actions and the ones the correspondence knows itself.

## Why

The correspondence projects content above the dialogue and under it, and at the reply itself there is
no point of projection. Every action at a reply the kit declares one at a time — by a field of the
model of its own and an output of its own — and a consumer who needs one of their own is left with two
roads: to wait for an edit of the kit, or to put a button above the dialogue, that is, not where the
reply is read.

## Terminology

| Term                     | What it is                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------ |
| A reply                  | One message of a thread                                                              |
| The point of the actions | The menu at a reply the consumer puts its own actions into by a template             |
| The sign of the actions  | The predicate of the consumer: has this reply at least one action of theirs          |
| A pinpoint action        | An action the correspondence knows itself: the deleting, the repeat, the downloading |

### What it is called in the interface

| In the spec              | On the screen                          |
| ------------------------ | -------------------------------------- |
| The point of the actions | the button "…" at a reply and its menu |

## Rules

- **The consumer declares its own action at a reply by a template, not by an edit of the kit.** The
  template is caught by a directive and gets the reply as the context; the correspondence draws it in
  the menu at the reply.
- **The visibility of the point of the actions is held by the predicate of the consumer, not by a
  count of the drawn items.** The content of a projected template is known only after the drawing, and
  the button would manage to blink on the first frame.
- **The predicate is not set — the point of the actions is shown.** It is arranged the same way at a
  row of the table, and a divergence between two points of projection of one kit would read as a
  defect.
- **The template is not declared — the markup of the reply is the former one.** No extra button appears
  at the reply, and a correspondence that needs no foreign actions does not change by a single pixel.
- **The pinpoint actions stay in place.** The deleting, the repeat of the sending and the downloading
  are common to any correspondence, and they do not move into the template of the consumer.
- **An action of the consumer is not described by the model of a reply.** A field of the model would
  describe an action the kit does not know; it arrives as markup.

## What is out of scope

- **A slot at every part of a reply.** The point is one — the menu at a reply; separate slots at the
  author, the text and an attachment are created as the need arises, not by a bundle in advance.
- **Actions of one's own at a system reply and at a deleted one.** The template gets the reply whole,
  and the predicate of the consumer decides.
- **Moving the pinpoint actions into the template.** They are common to any correspondence, and a
  consumer who needs only the deleting must not declare it themselves.

## Contract

Not applicable: the subdomain describes the surface of a component, not an exchange with the server.

### Refusal codes

Not applicable.

## Data

Not applicable: an action of one's own arrives as markup, and it is not in the model of a reply.

## Screens and states

| State                                            | What is visible                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------ |
| The template is not declared                     | the markup of the reply is the former one, there is no button "…"  |
| The template is declared, the predicate says yes | the button "…" at the reply, the items of the consumer in the menu |
| The template is declared, the predicate says no  | there is no button "…" at this reply at all                        |

## Cross-cutting requirements

### Locales

The labels of the items arrive from the consumer together with the template: the kit does not know them.

### SEO

Not applicable.

### Mobile layout

The point of the actions lives in the flow of the reply and on a narrow screen behaves like the rest of
its buttons.

### Several objects

Not applicable.

## Decisions

- **The technique is taken from a row of the table whole.** The argument: the same task at the table is
  solved by a template, a predicate and a menu, and a second technique about the same would give birth
  to two answers to one question. Rejected: a field of the actions in the model of a reply and an output
  at every new action.
- **The context of the template has no generic.** The argument: the type of a reply at a correspondence
  is one, and the type-carrier that at a row of the table carries the type of the row is not needed here.

## Open questions

- **`Q-10` — whether a point of the actions is needed at a part of a reply, not at it whole.** The
  assumption accepted is that one point is enough while no case has been named that it is too little for.

## History of changes

- 2026-08-30 — created by the work about the actions of a consumer at a reply of a correspondence.
