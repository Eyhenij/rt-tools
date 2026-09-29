# A boolean input of the kit and the bare attribute

**Status:** in force · **Revision:** 14 September 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** none
**Laws:** `frontend-application`, `reuse-first`
**Procedures:** none

The subdomain names what a boolean input of a kit component accepts, so that one written form does
not mean two different things at two components of one set.

## Why

A boolean input declared without coercion takes the bare attribute as an empty string, and an empty
string is false. So `<rt-bottom-sheet open>` leaves the sheet closed while the markup reads as
correct, and nothing says otherwise: neither the build, nor the typecheck, nor the linter looks at
the value an attribute carries.

The cost is not the one line. The same form works at the neighbours — a tab, a split button and a
pagination bar all coerce — so a person who learnt the set on them writes it everywhere and meets
one component that silently disagrees. Four showings of the sheet drew empty boxes because of
exactly this, and the defect was found by eye, not by a check.

## Terminology

| Term               | What it is                                                             |
| ------------------ | ---------------------------------------------------------------------- |
| a boolean input    | an input of a kit component whose declared type is `boolean`           |
| the bare attribute | the attribute written without a value — `open`, not `[open]="true"`    |
| coercion           | the input's transform that turns the attribute's string into a boolean |

### What it is called in the interface

Not applicable: the agreement is about the markup a consumer writes, and none of it reaches a
screen.

## Rules

- **A boolean input of a kit component accepts the bare attribute as truth.** Two components of one
  set answering one written form differently is worse than either answer alone: the consumer learns
  the set on the neighbours and carries the habit to the one that disagrees.

- **A required boolean input takes the bare attribute the same as an optional one.** Being required
  says the consumer must set the input and says nothing about the form. Without coercion it is worse
  than an optional one: the consumer is forced to write the input, writes the habitual form and gets
  the opposite of what they meant.

- **An input that is boolean only in its declared type is not one.** A tri-state input — yes, no,
  not said — carries a third value, and coercion would collapse it into false. Such an input is
  named apart with its reason, not coerced by the sweep.

- **The requirement is held by a check, not by the memory of whoever adds an input.** A boolean
  input without coercion builds, passes the typecheck and passes the linter; the miss shows only to
  the consumer who wrote the habitual form.

## What is out of scope

- **The showings of the kit and their markup.** A story that writes the bare attribute is cured in
  the story — the rule `rt-tools-storybook` and the record of the work that found this.
- **The first kit.** It is read as a sample and is not edited.
- **Inputs that are not boolean.** A number taken from an attribute has the same trap and its own
  answer; it is not decided here.

## Contract

Not applicable: the subdomain declares no procedures.

### Refusal codes

Not applicable: the subdomain throws no refusals.

## Data

Not applicable: the subdomain owns no storage records.

## Screens and states

Not applicable: the subdomain has no screens of its own.

## Cross-cutting requirements

### Locales

Not applicable: nothing of the subdomain is translated.

### SEO

Not applicable: the subdomain reaches no page.

### Mobile layout

Not applicable: the subdomain changes no layout.

### Several objects

Not applicable: the subdomain owns no objects.

## Decisions

- **The kit is brought to one form, not the consumer to two.** A note in the description saying
  "this input needs a binding" costs the reader a lookup at every input and is read by nobody.
  Rejected: leaving the input as it is and curing the showings — that cures only what is already
  written.

- **The form chosen is the one the neighbours already carry.** `booleanAttribute` is the framework's
  own and needs no code of the tree's. Rejected: a transform of the kit's own — it would differ from
  the framework's on the value `"false"`, and that difference would live where nobody looks for it.

- **The whole kit is brought to the form, not the one component the defect was found on.** The count
  named 107 boolean inputs, of which 96 already carried coercion and 11 did not. Eleven inputs
  standing apart from the set are not eleven separate misses but one requirement nothing holds.
  Rejected: coercing the sheet alone — the next input added would stand apart the same way.

## Open questions

Not applicable: both questions of the agreement are closed by the work. `Q-1` was closed by the
count, `Q-2` by the scenario about the string `false`.

## History of changes

- 14 September 2026 — written before the code of the work that brings it.
- 14 September 2026 — the count closed `Q-1`: eleven inputs of a hundred and seven stood without
  coercion, and all eleven took it. `Q-2` closed by the scenario `SC-UKV-135`.
- 14 September 2026 — brought into force and moved into the domain spec: the code is written, the
  check stands in the gate set, every scenario is closed by a test.
- 22 September 2026 — the main branch merged into the epic branch brought SC-UKV-133 already in force
  in the tokens spec. The scenario of this spec, issued in the epic branch alone, moved to SC-UKV-235
  together with its test.
