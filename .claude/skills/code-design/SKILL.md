---
name: code-design
kind: rule
law: code-structure
description: Rule under the code-structure law. Load when a request is taken apart, a plan is written and code with behaviour is edited — modules, their duty and links, coupling, isolation, patterns, the decision in the plan. Pattern code-design-choose. Names and types — rule typescript-conventions.
---
<!-- rt-kit v0.42.1 · rules/code-design.md · 21aa91e4c462 · правится надстройкой, не здесь -->

# Code design — how it works here

Rule under the law `docs/constitution/code-structure.md`. Cold part: `pitfalls.md` — cases before and
after, where it lives.

## How the law applies here

- **The executor chooses modules, bounds, terms and patterns before the code and writes them in the
  plan.** The owner gives the goal; a gap in these is not a question to them.
- **A chosen pattern is written with its place, its problem and the simpler way dropped.** SOLID,
  GRASP, Gang of Four; no problem — «no pattern» and why. For a new module, a split and the host's
  plan mode the table is loaded by a call.
- **Code is read first: who imports the module and whom it imports.**
- **Coupling is counted before and after the edit.** By `check-coupling`: links, cycles, imports past
  the entry; growth is named in the plan.
- **A module has one duty, said in one sentence without «and».** Cohesion: two sentences are two
  modules.
- **Isolation: from outside a module is called through its entry and tested without its
  neighbours.**
- **An import goes from the detail to the decision.** A decision reads no disk and no network: data
  comes as an argument.
- **Only what a neighbour calls is exported.**
- **A decision lives in one module.** A place edited together with it moves there. Two checks that
  only look alike are not copies.
- **A cycle between modules is broken by moving the shared part out.** Not by a late import. A cycle
  through the module's own entry: import the file instead.
- **Each input form is named with its source and an example and has a test case, a refused one
  too.**
- **Bounds are written: contracts, versions and safety that stay, imports that are forbidden.**
- **The priority is named: which of speed, memory, simplicity and reliability wins.**
- **The budget is a number before the code: files, lines, dependencies.** An overrun and a step
  aside from the plan are decisions in the progress.
- **The diff holds only what the steps need.**

## Patterns

- `code-design-choose` — the table "problem, technique, how to check".
