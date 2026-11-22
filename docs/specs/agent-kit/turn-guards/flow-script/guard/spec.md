# The guard of the course of work

**Status:** in force · **Revision:** 2026-11-15 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `work-conduct`
**Procedures:** none

## Why

The progress used to say what was done, and the guards believed the line: a step was marked done
without its check run, and a state line was moved ahead of the work. The engine now measures a step
by its check and a state by its exit. The guard holds the edits that would move the scenario past
that measurement, before they are written.

## Terminology

- **A green mark** — the mark the engine writes for a step whose check matched.
- **The owner's last word** — the last entry of the conversation the owner made: a message typed or
  the options chosen in a menu.
- **The tree override** — the description of the tree that adds to or replaces keys of the package
  description.

### What it is called in the interface

There is no interface: the guard answers the agent with a refusal or stays silent.

## Rules

- **A step of a plan with checks is marked done in the progress only by the engine, never by an edit.**
- **Done steps go first in the progress, and the one current step right after them.**
- **The state line of the progress is not set ahead of the state the engine measures.**
- **The progress, the plan, the epic plan and the marks are written by no shell command, and the marks by no tool but the engine.**
- **A plan without check lines and the plan of a branch planned before the engine keep the done marks as written.**
- **«отложено» in the epic plan is set and lifted only by the owner's last word naming the task.**
- **The tree override is edited only by the owner's last word naming the key it changes, and the reason of a removed key quotes that word.**
- **The description, its measurers and sources and the engine are edited only in a task whose approved plan names their path in a footprint row marked «(правится)».**
- **The owner's last word is a message the owner typed or the options the owner chose in a menu.**
- **The guard lets a call through when the engine is absent, fails or prints nothing.**
- **A tree override that does not build does not lift the hooks: they judge by the package description.**

## What is out of scope

The engine, its measurers and the marks it writes are the subdomain one level up. A shell command
is judged by its text: a script that computes a path itself is not seen. The plan write is judged by
the command `plan-check` of the engine, not here.

## Contract

The hook is called before Edit, Write, MultiEdit and a shell command with the input of the agent on
stdin. It hands the input to `task-flow-script.mjs guard`, which prints the reason of a refusal or
nothing; the hook turns a reason into a refusal of the call and stays silent otherwise.

### Refusal codes

Not applicable: a refusal comes as text naming what is wrong and the command that fixes it.

## Data

The guard reads the progress, the plan and the epic plan of the working copy, the marks in the
common directory of git and the record of the conversation the hook names. It writes nothing.

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

Not applicable: one call is judged at a time.

## Decisions

- **Only the steps an edit newly marks done are judged.** A done step written before the guard keeps
  its mark, and a whole rewrite of the progress is judged by the difference.
- **The state is measured only when an edit moves the state line.** A measurement reads git and the
  hosting, and an ordinary edit of the progress does not pay for it.
- **A shell command is refused only when it writes to a guarded file.** A read, a run of the engine,
  an inline script that only reads, `git restore --staged` and a file name inside the text of a
  commit message pass. A write by a literal path is judged by that path; a literal path under a
  temporary directory is outside the tree.
- **A write whose target is not a literal path errs towards firing.** A target built by a variable or
  a substitution, a copy or a removal of a directory that holds guarded files, and an interpreter
  script with a write call are refused when the command names a guarded file; a script with no
  write call passes. The path of the script an interpreter runs is not such a name. The price: a
  script that edits another file and quotes a guarded name in its text is refused too.

## Open questions

None.

## History of changes

- 2026-11-15 — the subdomain was started with the guard of the progress, the epic plan, the marks
  and the description.
- 2026-11-15 — the engine merges the tree override, and an override that does not build no longer
  lifts the hooks: they judge by the package description.
- 2026-11-22 — task RT-3423: a shell command is refused only when it writes to a guarded file;
  scenarios SC-AK-1819 and SC-AK-1820.
