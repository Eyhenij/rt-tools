# The language of the task flow description

**Status:** in force · **Revision:** 2026-11-15 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `work-conduct`
**Procedures:** none

## Why

The task flow is written in a narrow data language of its own, so that it is extended by editing the
description rather than the engine. A description that could run code would run it in every tree
that installs the package; so the description is data, read by a parser and checked by a model
before a single file it names is run.

## Terminology

- **The description** — the object that states the task flow: its sources, measurers, states,
  release cases, words and expected forms.
- **A section** — one of the six top-level keys of the description: `source`, `measure`, `state`,
  `release`, `words`, `expect`.
- **A reference** — `section.name[.field…]` without quotes: a pointer to an entry of the
  description, not a string.
- **A call** — a reference followed by arguments in parentheses.
- **A condition** — a reference to a measurer, or an object of one key `all`, `any` or `not` over
  other conditions.

### What it is called in the interface

There is no interface: the description is read by the engine and by the executor.

## Rules

- **The description is one object in parentheses closed by a semicolon, and nothing follows it.**
- **A value is a literal, a reference, a call of a reference, an array or an object.**
- **A function, an operator and a word that runs code are refused with the place they stand at.**
- **A reference starts with one of the six sections.**
- **A repeated key of an object is refused.**
- **A comment is skipped, and a comment or a dot inside a string is the string's own text.**
- **The description has exactly six sections.**
- **A name of an entry, a capability or a port matches `[A-Za-z][A-Za-z0-9]*`.**
- **An entry of `source` or `measure` is a file next to the description, and a capability is its named export.**
- **The ports of a capability equal the signature of its factory exactly.**
- **A missing capability is an error, never a substitute.**
- **The references between components form no cycle.**
- **The states keep the order of the description, and a title is unique.**
- **A file of the measurer directory imports only its neighbours and reaches no data past the ports.**
- **The exit of a state and the `when` of a release case are a condition over the measurers of the description.**
- **A condition object has exactly one key — `all`, `any` or `not` — and a reference in it names a measurer capability of the description.**
- **A condition is met by the results of the measurers, and an absent result counts as unmet.**
- **The literals of `words` are lists of non-empty strings under known keys, and `nudge` is a pattern that compiles.**
- **A form of the expected result is a pattern and a way of comparison of `exit`, `line`, `regex` or `number`.**
- **The release cases are asked in the order of the field `order`, and two cases never share one.**

## What is out of scope

The engine that measures the states by the description is the subdomain one level up,
`docs/specs/agent-kit/turn-guards/flow-script/`.

## Contract

The parser is called with the path of a description and answers with the parsed data as JSON, or
with `flow syntax: <what> at <line>:<column>` and code 1. The model is called the same way and
answers with the model, or with `flow model: <what>` naming the component, and code 1; with
`--exit <state> <results.json>` it prints the exit of that state by the results of the measurers.
Neither runs a file of the description: the files are read as text.

### Refusal codes

Not applicable: a refusal comes as text naming what is wrong and where.

## Data

The parser and the model hold no data of their own. They read one description and the files next
to it.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The refusal is written in the language of the tree.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable: one description is read at a time.

## Decisions

- **A data language, not code.** A description that could run code would run it in every tree that
  installs the package, at the minute the engine reads it; a reviewer would have to read it as code.
- **Nothing after the closing semicolon.** A tail is where code would be hidden.
- **Ports equal to the signature, without defaults.** A port the factory does not take is a wire to
  nowhere, and a default hides a missing wire.
- **The ban covers the whole measurer directory.** A neighbour file of a measurer would otherwise
  reach the disk for it.
- **A combination of facts is a line of the description, a new fact is a new measurer.** A condition
  written in code would hide the exit of a state from the reader of the description.
- **A word, a command, a menu option and a form are data.** A new one is a line of the description,
  and no guard is edited for it.

## Open questions

None.

## History of changes

- 2026-11-15 — split from the subdomain one level up when its scenarios outgrew the length limit:
  the language, its parser, its model, its conditions and its data.
