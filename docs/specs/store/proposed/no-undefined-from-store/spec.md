# The store gives no emptiness

**Status:** proposed · **Revision:** 20 August 2026 · **Scenario prefix:** `SC-ST`
**Depends on:** none
**Laws:** `frontend-application`, `code-structure`
**Procedures:** none

An agreement about the product written before the code. It is merged into the spec of the domain by the
last commit of the PR — with the former scenario numbers. There is no domain of the store in the tree yet:
the agreement will become its beginning when the owner says to create the domain.

## Why

A selector declares a non-empty type and gives back an emptiness: the state of an heir is put together by
an object of its own, and the field of a sign of the waiting may not be in it at all. A screen reads such a
sign as "we are not waiting" and shows an empty list instead of a waiting. Neither the build nor the linter
sees that — the type promises a non-empty value.

The second place is the taking apart of a refusal: it judges the truthfulness, not the presence. A refusal
equal to zero or to an empty string is thrown away together with the action that was to follow it.

## Terminology

| Term           | What it is                                                                    |
| -------------- | ----------------------------------------------------------------------------- |
| A selector     | A derived value of the store: a sign of the waiting or the state of a request |
| A spare answer | The value of a selector when the field is not in the state                    |
| An emptiness   | `null` or `undefined` — an absence of a value                                 |

### What it is called in the interface

Not applicable: the package has no screens — its surface is read from the code of an application.

## Rules

- **A selector gives back the declared type even when the field is not in the state.** The signs of the
  waiting answer "we are not waiting", the states of a request answer with the initial state: a screen that
  read an emptiness as "we are not waiting" shows an empty list instead of a waiting.
- **The spare answer is chosen by the emptiness of the value, not by its truthfulness.** The initial state of
  a request is the first member of the enumeration, and by the truthfulness it cannot be told from an absence
  of the field.
- **The taking apart of a refusal judges the emptiness, not the truthfulness.** A refusal equal to zero or to
  an empty string is a refusal all the same: thrown away, it carries with it the action that stood behind it.
- **An absence of a value in the common state of a list is named by one way.** The stores of the tree declare
  it by an empty reference; a common type allowing a second emptiness too sets apart two answers to one
  question.
- **The initial state declares exactly the fields that stand in the type.** A field that is not in the type
  an heir will not see at all, and a field that is not in the initial state will stay empty after a reset.

## What is out of scope

- A check of a state arriving from the tools of the developer: a return to the former state is a work of its
  own.
- The type of the payload of a message: it demands a bond of a message with its payload.
- A ban of the emptiness in the states of the heirs themselves: the store answers for what it gives back, not
  for what was put into it.

## Contract

Not applicable: the surface is the classes of the package, the domain serves no procedures.

### Refusal codes

Not applicable.

## Data

The package has no records of the storage of its own: the state lives in the memory of the application.

## Screens and states

Not applicable: the package has no screens.

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

- **The spare answer is put at the selector, not by a check of the initial state.** The argument: the state
  is put together by the heir, and to check it at the input means to demand of it a form it did not promise.
  Rejected: a refusal at an incomplete initial state — it breaks the working stores.
- **The emptiness differs from the falsehood by an open taking apart.** The argument: at the signs of the
  waiting the falsehood is lawful, and there must be no emptiness, and by the truthfulness they cannot be
  told apart. Rejected: to leave the former "or" — it brings back the initial state at a lawful first member
  of the enumeration too.

## Open questions

- `Q-1` — whether it is worth the store refusing an incomplete initial state. The work goes with the
  assumption that no: the heirs are many, and a refusal at the raising would fell the working screens.

## History of changes

- 20 August 2026 — created.
