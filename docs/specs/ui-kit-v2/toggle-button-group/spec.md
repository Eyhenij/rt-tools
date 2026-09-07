# The segmented switch

**Status:** in force · **Revision:** 31 August 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** none
**Laws:** `frontend-application`, `reuse-first`
**Procedures:** none

The subdomain names what the switch promises about the choice: how many segments are chosen at once
and what happens to a segment that is unavailable now.

## Why

The switch could choose one segment out of several and switch itself off whole. Two things it did not
have: the choice of several segments at once and the switching off of one segment apart from the group.

Both are gone around dearly. A multiple choice the consumer puts together by a row of buttons of their
own — and that row diverges from the kit in look, in size and in the taking apart of the edges of the
group. An unavailable segment the consumer removes from the list — and a person sees a group that came
to have fewer segments, without a single word about why.

## Terminology

| Term              | What it is                                                              |
| ----------------- | ----------------------------------------------------------------------- |
| a segment         | one button of the group                                                 |
| a single choice   | exactly one segment is chosen, and a press carries the choice over      |
| a multiple choice | any number of segments is chosen, and a press adds one or takes one off |

### What it is called in the interface

| In the agreement       | On the screen                                       |
| ---------------------- | --------------------------------------------------- |
| a chosen segment       | a segment with the filling of a chosen one          |
| an unavailable segment | a segment with a muted label, a press does not pass |

## Rules

- **The single and the multiple choice are declared by different inputs.** One input whose type of the
  value changes by another input is checked neither by the build nor by the linter: the consumer learns
  about their mistake when the group stops highlighting what is chosen.
- **In the multiple choice a press adds a segment or takes it off.** Otherwise there is nothing to take
  what is chosen off by: the group has no second place where the choice is taken off.
- **The multiple choice gives back the whole set of what is chosen, not the difference.** The difference
  the caller brings together with their own state themselves, and each brings it together in their own
  way.
- **An unavailable segment stays visible and does not let a press through.** Hidden, it leaves the group
  without an explanation of why the neighbouring segments came to be fewer — and the reason is always
  temporary.
- **A switched-off group makes all its segments unavailable.** The sign of the group is above the sign of
  a segment: an available segment inside a switched-off group reads as its only live place.
- **The unavailability of a segment is declared next to its label, not by a separate list.** A separate
  list of the values diverges from the list of the segments itself silently — a value that is not in the
  group any more stays in it.

## What is out of scope

- A ban on an empty choice: a multiple choice without a ban is more honest, and a ban is added by an
  input when it is asked for.
- A template of a segment of one's own: a segment is a label and an icon, and that is enough for every
  section of the tree.

## Contract

Not applicable: the surface is the inputs and the outputs of a component of the kit, the subdomain
serves no procedures. The multiplicity is declared by a sign of its own, the set of what is chosen
arrives by an input of its own and goes away by an output of its own whole, and the unavailability of
one segment lies in the segment itself — the list with their names lives in the description of the
component, where the consumer reads it.

### Refusal codes

Not applicable: the component has no refusals.

## Data

Not applicable: the component has no records of the storage of its own.

## Screens and states

| State                  | What is visible                                            |
| ---------------------- | ---------------------------------------------------------- |
| a single choice        | one segment is chosen, the rest are ordinary               |
| a multiple choice      | any number of segments is chosen, including none           |
| an unavailable segment | a muted label, a press does not pass                       |
| a switched-off group   | all the segments are unavailable, the chosen ones included |

## Cross-cutting requirements

### Locales

The labels of the segments arrive from the caller: the component has no strings of its own.

### SEO

Not applicable.

### Mobile layout

Nothing of its own: the group is stretched by the same input as on a wide screen.

### Several objects

Not applicable.

## Decisions

- **The multiple choice is declared by inputs of its own** — the former single agreement stays working,
  and the consumers do not have to be broken. Rejected: widening the type of the former input to a value
  and a set — then the mistake of the consumer is visible only on the screen.
- **The unavailability of a segment lies in the segment itself** — the list of the segments and the list
  of the bans diverge silently. Rejected: a separate input with a set of the unavailable values.

## Open questions

- `Q-3` — whether a ban on an empty choice is needed. The work goes with the assumption that an empty
  choice is lawful.

## History of changes

- 31 August 2026 — the subdomain was created: the multiple choice and an unavailable segment.
