# A button with two positions

**Status:** in force · **Revision:** 31 August 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** none
**Laws:** `frontend-application`, `reuse-first`
**Procedures:** none

The subdomain names what a button declares itself two-position by and how that is visible to a person
and to the assistive means.

## Why

A button with a label knew only a press by the mouse — the one that ends together with the release. It
had no held state, and an application needing a button "on — off" with a label drew it itself: by a
filling of its own over the kit and by an attribute of its own for the assistive means. Both halves
diverged from the kit at the very first edit of the theme.

At that a button with an icon has such a state, and a group of segments has it too. One notion existed
at two parts of the set and was absent at the third.

## Terminology

| Term               | What it is                                                                     |
| ------------------ | ------------------------------------------------------------------------------ |
| two-position       | a button that stays pressed after the release                                  |
| a held press       | the look of a pressed button that does not disappear together with the release |
| an ordinary button | a button that has no position at all — it only starts an action                |

### What it is called in the interface

| In the agreement      | On the screen                                       |
| --------------------- | --------------------------------------------------- |
| the pressed position  | the filling as under a finger, but not disappearing |
| the released position | the ordinary look of the button                     |

## Rules

- **The sign of the position has three values: pressed, released, no position at all.** A button that
  is not a switch does not declare itself two-position: what is said to the assistive means — "this
  button is released" — is a lie at an ordinary button, not a default.
- **The released position is declared on a par with the pressed one.** A two-position button staying
  silent in the released look cannot be told from an ordinary one: a person reading the screen not by
  the eyes learns about the second position only by pressing.
- **The look of the pressed position is taken from the held press of the button itself.** A filling of
  its own would mean a third value of the same notion next to the two existing ones and would diverge
  from them at the first edit of the theme.
- **The position does not change by itself at a press.** The button says about the press outward, and
  the position is given back by the caller: otherwise the look of the button and the state of the
  application diverge at the very first refusal of the saving.
- **A switched-off button keeps its position.** The unavailability says whether it can be pressed and
  says nothing about whether what the button governs is on.

## What is out of scope

- The toggle: it has a markup of its own and an agreement of its own, and it stays a separate component.
- The group of segments: there the position belongs to a segment, not to a button.

## Contract

Not applicable: the surface is the inputs of a component of the kit, the subdomain serves no procedures.

### Refusal codes

Not applicable.

## Data

Not applicable.

## Screens and states

| State                    | What is visible                                        |
| ------------------------ | ------------------------------------------------------ |
| there is no position     | an ordinary button, nothing is said about the position |
| released                 | the ordinary look, the position is declared released   |
| pressed                  | the held filling, the position is declared pressed     |
| pressed and switched off | the same filling, muted by the unavailability          |

## Cross-cutting requirements

### Locales

Not applicable: the label arrives from the caller.

### SEO

Not applicable.

### Mobile layout

Nothing of its own.

### Several objects

Not applicable.

## Decisions

- **The sign has three values** — one with two would make every ordinary button of the set declare
  itself two-position. Rejected: a sign "yes or no" with the default "no", as at a button with an icon —
  there the released position is not declared at all, and about the second position one learns only by
  pressing.
- **The look is taken from the held press** — it is already declared at every theme and every design of
  a button. Rejected: a filling of one's own for the pressed position.

## Open questions

- `Q-5` — whether it is worth aligning a button with an icon by this sign: it declares the released
  position by an absence of the attribute. The work goes with the assumption that its agreement does not
  need changing now.

## History of changes

- 31 August 2026 — the subdomain was created: the position at a button with a label.
