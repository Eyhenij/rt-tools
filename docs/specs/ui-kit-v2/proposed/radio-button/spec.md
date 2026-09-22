# The radio button

**Status:** proposed · **Revision:** 22 September 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the design of the kit — the colours come from its appointments; the material
preset — it repaints the radio button without a rule of its own; a boolean input and the bare
attribute — `disabled` and `card` take the bare attribute as truth
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A product agreement written before the code, task RT-2317. It merges into the spec of the second kit
as a subdomain of its own, with the scenario numbers it has here.

## Why

The second kit has no radio button. The table of the first kit draws its single choice of a row by
the Material radio button, and the table moving to the second kit has nothing to take instead: the
second kit is forbidden to import `@angular/material`. An application that needs "one of several"
in a form draws it itself or takes a group of segments, which reads as a switch, not as a choice.

The owner gave a sample — the radio button of the application, one component in three files. The
family repeats its behaviour: the value is an input, the choice is the value of the form, a label
and an explanation are texts, the card look is a framed box. The colours move from the variables of
Material to the kit's own appointments, so the material preset draws it in the look of the Material
radio button.

## Terminology

| Term          | What it is                                                                                |
| ------------- | ----------------------------------------------------------------------------------------- |
| the value     | what this radio button stands for; it is given by the caller and never changes by a press |
| the model     | the value the bound form control holds now                                                |
| chosen        | the value of the radio button is the model itself                                         |
| the circle    | the round mark of the choice; a chosen one has a dot inside                               |
| the card look | the radio button drawn as a framed box with the circle on the right                       |
| unavailable   | the radio button takes no press and no key; said by the input or by the form              |

### What it is called in the interface

| In the agreement      | On the screen                                                    |
| --------------------- | ---------------------------------------------------------------- |
| chosen                | the circle in the colour of the choice with a dot inside         |
| not chosen            | an empty circle with a neutral rim                               |
| the label             | the text next to the circle                                      |
| the explanation       | a smaller text under the label, in the muted colour              |
| the card look, chosen | the frame of the box takes the colour of the choice              |
| unavailable           | the whole radio button is dimmed, the pointer does not act on it |

## Rules

- **The radio button is chosen when its value is the model itself, not an equal one.** Two records
  with the same content are two different values: the choice follows the very value the caller gave.
- **A press on a radio button that is not chosen makes its value the model and gives it to the
  form.** The value goes to the form once per press, and the look changes by the same press.
- **A press on the chosen radio button does not take the choice off.** It gives nothing to the form:
  a radio button is left only by choosing another one.
- **A value written by the form does not come back to the form as an edit.** The form that set the
  model hears nothing back, and a model set on the start does not mark the form edited.
- **Any press marks the radio button touched, including one that changes nothing.** The form learns
  that the person reached the control even when the choice stayed where it was.
- **The radio button is unavailable when the input says so or the form says so.** The two sources
  do not overwrite one another: a control created switched off stays unavailable whatever the input
  holds, and the other way round.
- **An unavailable radio button changes the choice neither by a press nor by a key.** The model
  stays what it was, and the form hears nothing.
- **Every press is reported outward, whether or not it changed the choice.** The caller learns of
  the press on the chosen radio button as well — the table needs the press itself, not only the
  change.
- **A press on the radio button does not reach the element around it.** The row of a table under
  the radio button does not open and does not get chosen a second time; the browser's own action on
  the press does not run either.
- **Space and Enter choose the radio button from the keyboard.** The page does not scroll by the
  Space.
- **The radio button names its role, its choice and its unavailability to the assistive means.** A
  person reading the screen not by the eyes hears "radio button, chosen" or "not chosen", and
  "unavailable" at an unavailable one.
- **The radio button is one stop of the keyboard focus, the unavailable one included.** The sample
  keeps an unavailable radio button reachable by Tab and says it is unavailable; the neighbouring
  checkbox does the opposite, and the family follows the sample.
- **The focus reached from the keyboard is visible by the ring of the kit; the focus from a press
  is not.** The sample has no ring of its own; without one a person moving by Tab does not see
  where they are.
- **The label and the explanation are texts given by the caller, and each is drawn only when
  given.** Without both the radio button is the circle alone — the look the table takes.
- **The explanation is smaller than the label and drawn in the muted colour.** It reads as a note
  to the label, not as a second label.
- **The card look draws a framed box with the content on the left and the circle on the right.**
  The label in the card look is of medium weight.
- **In the card look the frame of a chosen radio button takes the colour of the choice.** A card
  that is not chosen keeps the neutral frame.
- **The unavailable radio button is dimmed as a whole and takes no pointer.** The dimming covers
  the circle, the dot, the texts and the frame of the card at once, by the kit's step for the
  unavailable look.
- **The choice is also given by an input without a form, and a change of it is reported by an
  output of its own.** The table of the first kit sets the choice of a row by an input and listens
  to the change; a form per row would be a second model of the same choice.
- **A radio button without a label takes its name for the assistive means from an input.** In the
  table the radio button is the circle alone, and without the name it is read as a nameless
  control.
- **Every colour of the radio button comes from an appointment of the kit.** The colour of the
  choice, the rim, the texts and the frame of the card are appointments, never values of its own —
  so the dark theme and the material preset repaint it without a rule of its own.

## What is out of scope

- **A group of radio buttons** — one name for several, the arrows between neighbours, one stop of
  the focus for the whole group. The sample has none, and the table does not need it.
- **The table itself.** The single choice of a row moves to the second kit by task RT-2316; this
  agreement gives it the component and nothing of the table.
- **The first kit.** It has no radio button of its own and is not edited: its table stays on the
  Material one until it is removed.
- **A label given as markup.** The sample takes texts; a projected label, as at the checkbox, is not
  promised.
- **The mark of an error of the form.** The sample draws no invalid state, and none is promised.

## Contract

Not applicable: the surface is the inputs and the output of a component of the kit, the subdomain
serves no procedures. The inputs are the value (required, of any type), `checked`, `disabled`,
`card`, `label`, `description` and `ariaLabel`; the outputs report the press and the change of the
choice; the choice goes through the form binding or through `checked`.

### Refusal codes

Not applicable.

## Data

Not applicable: the radio button keeps only the model the form wrote into it.

## Screens and states

| State                   | What is visible                                                        |
| ----------------------- | ---------------------------------------------------------------------- |
| not chosen              | an empty circle with a neutral rim                                     |
| chosen                  | the rim in the colour of the choice and a dot inside                   |
| focus from the keyboard | the ring of the kit around the radio button                            |
| hover                   | nothing changes: the sample has no hover look                          |
| unavailable             | the whole radio button dimmed, in either choice                        |
| with a label            | the label next to the circle                                           |
| with an explanation     | the smaller muted text under the label                                 |
| the card look           | a framed box, content left, circle right; chosen — frame of the choice |

The sample draws the circle of 16 px with a rim of 2 px, the dot of 6 px, and the card with a frame
of 1 px, a rounding of 8 px and inner spaces of 12 and 16 px. The family writes each of them by a
step of the kit's scale; a measure the scale has no step for goes to the open questions, not into
the styles as a number.

The showcase gets the family's set: `Overview`, `Playground`, one story per axis — `Value` (not
chosen, chosen), `Label` (none, a label, a label with an explanation), `Card` (the ordinary look, the
card look, each in both choices) — then `States`, `Themes` and `Presets`, the pair of the base and
the material halves. The choice is crossed with the card look and with the unavailability: the
unavailable look dims the rim, the dot and the frame at once, and one unavailable cell does not show
what became of the other choice.

## Cross-cutting requirements

### Locales

The kit adds no text of its own: the label and the explanation arrive from the caller already in
its language. The dictionary of the kit gets nothing.

### SEO

Not applicable.

### Mobile layout

Nothing of its own: the radio button has no threshold, and the card look takes the width its
container gives it.

### Several objects

Several radio buttons stand for one model, and choosing one must take the choice off the rest. How
exactly that is held is an open question: the framework's forms do not write a value that came from
one accessor back into the other accessors bound to the same control, and the sample has no group
that would do it instead.

## Decisions

- **The family is named `rt-radio-button`.** The checkbox of the kit carries the name of its
  Material counterpart, and the table replaces exactly `mat-radio-button`. Rejected: `rt-radio` —
  shorter, but the name of no counterpart.
- **The label and the explanation are texts, as in the sample, not a projection, as at the
  checkbox.** The card look needs two texts of different weight, and a projection would leave their
  look to every caller.
- **The focus ring and the hover look are taken from the house pattern of the checkbox**: a ring of
  the kit on the keyboard focus, no hover look. The sample has neither, and the state coverage
  demands both to be shown.
- **The open questions are settled by the sample, and beyond it only by what the table needs.** The
  owner's word of 22 September 2026: «если чего-то не хватает то пилим спрашивай я дам пример или
  скажу пили сам», and the sample was given. So: the choice by an input for the table and a name by
  an input for the circle alone; the measures of the sample, 16 and 6 px, under both presets; the
  unavailable one stays in the order of Tab; a choice by a key reports nothing outward; the dimming
  is the kit's step; no group; the rim that is not chosen takes the strong neutral border under the
  material preset.

## Open questions

The numbers are issued at the merge into the domain spec: neighbouring work of the same epic keeps
its own and has not reached the epic branch yet.

- **Several radio buttons on one control of a reactive form.** A press on one gives its value to the
  control, but the neighbours bound to the same control are not told, and the one chosen before may
  keep its dot. The template binding of the form rewrites every radio button by change detection;
  the reactive one does not. Whether the family needs a registry of its own, a group, or a word in
  its description that one model is shared through the template binding — the table does not meet
  it: it gives the choice by the input.

## History of changes

- 22 September 2026 — the agreement was written by the grilling of the owner's request and by the
  owner's sample.
