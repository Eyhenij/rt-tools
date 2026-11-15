# The task flow as an executable scenario

**Status:** in force · **Revision:** 2026-11-15 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `work-conduct`
**Procedures:** none

## Why

The state of the work used to be declared by the executor in the progress, and the guards believed
the line. A step of the plan was marked done without its result being measured. The owner asked for
an executable scenario: every state of the task flow and every step of the plan has a measured
result, the next step does not begin until the previous one is met, and the turn is held until the
scenario ends or the owner says stop.

The task flow is written in a narrow data language of its own, so that it is extended by editing the
description rather than the engine. This subdomain grows together with the engine; for now it holds
the language and its parser.

## Terminology

- **The description** — the object that states the task flow: its sources, measurers, states,
  release cases, words and expected forms.
- **A section** — one of the six top-level keys of the description: `source`, `measure`, `state`,
  `release`, `words`, `expect`.
- **A reference** — `section.name[.field…]` without quotes: a pointer to an entry of the
  description, not a string.
- **A call** — a reference followed by arguments in parentheses.

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
- **A file of `measure/` imports only its neighbours and reaches no data past the ports.**

## What is out of scope

The guards of the end of a turn that judge the conversation are in the domain next to it. The check
that the steps of the plan and of the progress match is the subdomain `docs/specs/agent-kit/work-steps/`.

## Contract

The parser is called with the path of a description and answers with the parsed data as JSON, or
with `flow syntax: <what> at <line>:<column>` and code 1. The model is called the same way and
answers with the model, or with `flow model: <what>` naming the component, and code 1. Neither runs
a file of the description: the files are read as text.

### Refusal codes

Not applicable: a refusal comes as text naming what is wrong and where.

## Data

The parser holds no data of its own. It reads one file.

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
- **The ban covers the whole `measure/` directory.** A neighbour file of a measurer would otherwise
  reach the disk for it.

## Open questions

None.

## History of changes

- 2026-11-15 — the subdomain was started with the language of the description, its parser and its
  model.
