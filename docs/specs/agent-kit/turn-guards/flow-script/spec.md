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

The task flow is written in a narrow data language of its own; the language, its parser and its
model are the subdomain `docs/specs/agent-kit/turn-guards/flow-script/language/`. Here is the engine
that measures the states by the description: its sources, its measurers and the measured state.

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

- **The engine reads the description that lies next to it and names the states of the scenario in their order.**
- **A factory of a source or a measurer that is not written yet throws, so an unmeasured exit is never read as met.**
- **The history of the branch is the commits the main branch on the server does not hold, and a fact read from it stays true in later states.**
- **The parsing of the steps reaches a measurer through a source, by the module every reader of the steps shares.**
- **Exit 1 is met by a grill of the branch or of a draft that holds the owner's request as a quote and an answer.**
- **Exit 3 is met by a line of the grill or the plan naming the agreement directory found on disk or in the history, or the reason there is none.**
- **Exit 5 is met by a plan the branch added whose every step has a check of a known form, and by an approval mark whose answer begins with «Одобряю».**
- **The marks lie in the common directory of git, and a mark that does not parse reads as absent.**
- **Exit 6 is met by a version of the progress in the commit of the plan or later that repeats its steps and marks exactly one of them as going on.**
- **Exit 7 is met when every step is done and every done step has a green mark, and a plan without check lines is judged by the marks of the progress alone.**
- **Exit 8 is met when every path of every edited footprint row has a changed file after the plan and no agreement directory under proposed/ stands in the head.**
- **Exit 9 is met by one commit that removed the task folder and added a record to the archive.**
- **A read of the hosting is repeated once, and failed twice it is named as the silent hosting.**
- **A met exit read from the hosting is kept for the life of the branch, and an answer for the later exits lives sixty seconds.**
- **The measured state is the first exit known to be unmet; an exit the hosting could not answer is passed over, and with no unmet exit it releases the turn with its reason.**
- **The epic of the work is the one the task card names, and its plan lies in the plans directory.**
- **Exit 2 is met by the epic branch on the server or merged into the main branch, with the epic card out of the first column or closed.**
- **Exit 4 is met by the task card out of the first column or closed, and by the commit that added the task folder.**
- **Exit 10 is met by the folder commit on the server, a PR of the branch with a reviewer, and the task out of the work column.**
- **Exit 11 is met by the branch of the next unblocked task of the epic, and with no such task.**
- **Exit 12 is met when every task of the epic with a merged PR is marked merged in the plan.**
- **Exit 13 is met when the tip of every task not deferred lies in the epic branch or the main branch, and the PR of the epic into the main branch exists.**
- **A branch without a task number, the epic branch among them, takes the epic of the working copy from the assignment table.**
- **The epic of the copy merged into the main branch or with its card closed counts as absent.**
- **A branch without a task number, without a live epic of the copy and without a draft is outside the scenario, and a draft keeps it in states 1–4.**

## What is out of scope

The language of the description is the subdomain `docs/specs/agent-kit/turn-guards/flow-script/language/`.
The guards of the end of a turn that judge the conversation are in the domain next to it. The check
that the steps of the plan and of the progress match is the subdomain `docs/specs/agent-kit/work-steps/`.

## Contract

The engine is called with a command: `states` prints the states of the scenario in their order, a
line each. A description that does not build is named with its reason and code 1. A measurer gets
its data through its ports and the data of the description; a source reads git, the working copy,
the hosting, the marks and the messages of the owner.

### Refusal codes

Not applicable: a refusal comes as text naming what is wrong and where.

## Data

The marks and the answers of the hosting lie in the common directory of git, `rt-kit/`: the approval
mark, the marks of the steps, the met exits of the hosting and the answers that live by the clock.

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

- **An exit is a fact of the history.** A fact read from the history stays true in later states, so
  the measured state never goes back when a folder is taken apart or a branch is removed.
- **An exit the hosting could not answer is unknown, not unmet.** Reading it as unmet would hold the
  work on a silence of the network; reading it as met would skip a state nobody measured.

## Open questions

None.

## History of changes

- 2026-11-15 — the subdomain was started with the language of the description, its parser and its
  model.
- 2026-11-15 — the language moved to the subdomain `language/`; here stay the engine, its sources
  and its measurers.
