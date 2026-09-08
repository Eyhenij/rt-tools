# A field of the set and a signal form

**Status:** in force · **Revision:** 2026-08-30 · **Scenario prefix:** `SC-UKV`
**Depends on:** none
**Laws:** `frontend-application`, `verifiability`
**Procedures:** none

The agreement names where a field of the set takes the state of the form from and what happens to a
field bound by a signal form of Angular 22.

## Why

A field of the set takes the state from the former form of Angular: it subscribes to the events of the
control in its own start-up. A signal form gives back by the same name a bridge of its own that has no
events at all — the field falls out of the start-up, and the wrapper together with it draws nothing. On
the screen the headings of the sections stay, and there are zero fields of input.

A single field hides the miss: next to it stand fields on the former binding, and the fall of the
wrapper is not noticeable. Everything falls apart at the translation of a group of fields — that is,
exactly where a signal form is needed: a long form laid out over child components is not gathered by
the former binding, because the directive of the value does not go past the boundary of a child
component.

## Terminology

| Term                | What it is                                                                          |
| ------------------- | ----------------------------------------------------------------------------------- |
| A field of the set  | a component of the set inheriting the base of a field of a form                     |
| The former binding  | a form of Angular on controls: the field gets a control sending out events          |
| The signal binding  | a form of Angular 22 on signals: the field gets a bridge read by signals            |
| The state of a form | the unfitness, the errors, the obligatoriness and the switched-off state of a field |

### What it is called in the interface

| In the agreement   | On the screen                                                  |
| ------------------ | -------------------------------------------------------------- |
| The unfitness      | the red border of the field and the text of the error under it |
| The obligatoriness | an asterisk at the label of the field                          |

## Rules

- **The field works with both bindings.** The former one stays working word for word: the field chooses
  the source of the state by what it got, not by a setting from outside. A setting would mean that the
  consumer is obliged to name the kind of the form — and they have already named it by the binding
  itself.
- **An absence of events at a control is never a fall.** A control that sends no state out is a lawful
  case, not a breakage: the field reads the same state from it by a computing. While the fall came out of
  the start-up, the whole subtree of the markup was not drawn together with the field.
- **The state of the signal binding reaches the field whole.** The unfitness, the errors, the
  obligatoriness and the switched-off state — the same as the field takes from the former binding. Half
  of the state is worse than an absence of it: the field looks working and stays silent about the form
  having rejected it.
- **The unfitness is shown after a touch or an edit, not at once.** This is true at both bindings: a
  field that went red before the first input accuses a person of what they have not done yet.
- **The wrapper of a field takes the state from the field, not from the form.** It does not know which
  binding the field is bound by, and must not know: otherwise the kind of the form would have to be
  named to it by a second input.

## What is out of scope

- The agreement of a field of a signal form (`FormValueControl`) with the model of the value outward:
  while the field gives access to the value, the directive chooses it and does not reach the agreement.
  A work of its own, and it lifts the former road — that is, it breaks the backward compatibility.
- The check of the value: the form declares it, and the field shows the outcome.
- The first kit: it has a base of a field of its own.

## Contract

Not applicable: the surface is the inputs and the state of a component of the set, the domain serves no
procedures.

### Refusal codes

Not applicable: the field throws no refusals — an absence of the state is a lawful case for it.

## Data

Not applicable: the fields have no records of the storage of their own.

## Screens and states

| The state of a field     | What is visible                                                     |
| ------------------------ | ------------------------------------------------------------------- |
| Untouched                | the ordinary border, there is no error                              |
| Obligatory               | an asterisk at the label                                            |
| Unfit after a touch      | the red border and the text of the error under the field            |
| Switched off by the form | the field accepts no input, the button of the clearing is not shown |

## Cross-cutting requirements

### Locales

The work creates no labels of its own: the text of an error arrives from the form, the labels of the set
are already translated.

### SEO

Not applicable: the set of components gives out no pages.

### Mobile layout

It does not change: the work is about the state, not about the look.

### Several objects

Not applicable: the state of a form belongs to the screen, not to an object of the ownership.

## Decisions

- **The source of the state is chosen by the field, not by the consumer** — the binding is already named
  by the markup, and a second input about the same would diverge from it silently. Rejected: an input
  "the kind of the form".
- **The state of the signal binding is read by a computing** — the bridge sends no events out, and its
  readings are reactive. Rejected: a poll by a timer and a subscription to what is sent out by hand.

## Open questions

- `Q-SF-1` — whether the fields need an input of the value by a model outward. The work goes with the
  assumption that they do not: the value lives inside the field, and forms of both kinds get it by
  access.

## History of changes

- 2026-08-30 — the agreement was written by a proposal of the intake about the fields of the set and a
  signal form.
