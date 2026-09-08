# The inputs of a component created in code

**Status:** proposed · **Revision:** 31 August 2026 · **Scenario prefix:** `SC-CR`
**Depends on:** none
**Laws:** `frontend-application`
**Procedures:** none

An agreement about the product written before the code. It is merged into the spec of the domain by the
last commit of the PR — with the former scenario numbers. There is no domain of the core in the tree yet:
the agreement will become its beginning together with the neighbouring proposals, when the owner says to
create the domain.

## Why

A component created in code gets its inputs by a name as a string. The name is checked by nothing: a typo
compiles and falls already at the raising — by a message about an input the component does not have. The
value is not checked against the type of the input at all: a string goes away where a number was expected,
and that is discovered on the screen.

A component raised by markup catches both mistakes by the check of the template. One created in code
catches neither, although the same names and types are declared next to it, in the class itself.

## Terminology

| Term                | What it is                                                                  |
| ------------------- | --------------------------------------------------------------------------- |
| an input            | a field of a class declared a signal input                                  |
| what is accepted    | the value the input accepts from outside                                    |
| a set of the inputs | the object "the name of an input — the value" handed to a created component |

### What it is called in the interface

Not applicable: a type is not visible on the screen.

## Rules

- **The names of the set can be only the inputs of the component.** An ordinary field of a class is not an
  input, and an attempt to put a value into it falls at the raising, not at the build.
- **The names are picked by the type of the field, not by the name.** A field named like an input does not
  become an input; the class has no mark they can be told apart by.
- **As the value of every name serves what the input accepts from outside.** An input with a transformation
  has two of them — what is accepted and what is got — and the caller passes the first.
- **The set is incomplete by its arrangement: the inputs that are not in it stay with their defaults.** An
  obligatory input at that stays obligatory — that is the care of whoever raises the component.
- **The inputs are put by a function of their own, not by a string at the place.** A type declared and
  applied by nobody checks nothing.

## What is out of scope

- The outputs of a component: the subscription to them lives a life of its own and is typed apart.
- The creating of the component itself: where to create it and where to put it is decided by the caller.

## Contract

| Name                   | What it accepts or gives back                                             |
| ---------------------- | ------------------------------------------------------------------------- |
| `TRtComponentInputs`   | the type: the set "the name of an input — the accepted value" for a class |
| `setRtComponentInputs` | puts the set of the inputs to a created component                         |

### Refusal codes

Not applicable: there are no refusals — a wrong name and a wrong value are refused by the build.

## Data

Not applicable.

## Screens and states

Not applicable.

## Cross-cutting requirements

### Locales

Not applicable.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable.

## Decisions

- **The names are picked by the type of the field** — the class has no other sign of an input. Rejected: to
  list the names by hand at every place — the same list, only by hand and growing stale silently.
- **The type lives in the package of the core** — it is derived from the types of the signal inputs, and
  those arrive from the framework the utilities do not have. Rejected: to put it into the utilities, which
  were left without the framework.

## Open questions

- `Q-3` — whether to move the harness of the specs of the second kit onto this type: it accepts the set
  "a name — anything" and is convenient by that. The work goes with the assumption that the type is applied
  where the inputs are put by working code.

## History of changes

- 31 August 2026 — the agreement was written.
