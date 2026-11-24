---
name: code-design-choose
kind: pattern
rule: code-design
description: Pattern of rule code-design. Load when a request is taken apart, a plan is written or a module is split — the table from the problem to the technique and its check, coupling, cohesion and isolation, the rows of the decision in the plan. Names and types — rule typescript-conventions.
---
<!-- rt-kit v0.39.1 · patterns/code-design-choose.md · 9cd345f16d08 · правится надстройкой, не здесь -->

# Choosing the design

Pattern of the rule `code-design`. What must be true — the law
`docs/constitution/code-structure.md`. Cold part: `pitfalls.md` of the rule.

## When to use

- A request is taken apart, or the plan of a task names modules.
- A module grew a second duty, a cycle or a third copy.
- A review named coupling.

## The table

| Problem | Technique | How it is checked |
| --- | --- | --- |
| A module has two duties | Single Responsibility, high Cohesion: split by the reason to change | each duty is one sentence; the halves do not import each other |
| A method has no clear home | Information Expert: to whoever holds the data | the method reads fields of its own module only |
| Modules import each other | Indirection: the shared part moves to a third module | the cycle check is silent |
| A decision reads disk or network | Dependency Inversion: the source is an argument | the decision is tested without a file |
| A chain of `if` by one sign grows | Strategy or a table of rows: Open–Closed | a new case adds a row and edits no branch |
| A foreign shape leaks in | Adapter: the foreign type ends at the boundary | the foreign name is found in one file |
| Callers know five steps of one thing | Facade: one entry | callers import the entry only |
| The same wrapping around many calls | Decorator: the same interface over the inner one | the inner module did not change by a line |
| Creation is repeated with its settings | Factory function: Creator | the constructor is called in one file |
| One event has several readers | Observer: a signal or a bus | the sender imports no reader |
| A subtype refuses what its base promised | Liskov: composition instead of inheritance | the tests of the base run on the subtype |
| A wide interface is taken for one method | Interface Segregation: the type names what is used | the parameter type lists only the called members |
| A change walks over neighbours | Protected Variations: the changing part behind a stable entry | the diff of the next change names one module |
| A file is too long to read whole | Split by duty, not by lines | the module size is under the limit of the tree |
| None of the above | No pattern: the plain function | the reason is one line of the plan |

## The words

- **Coupling** — how many modules know a module and how many it knows; counted by imports.
- **Cohesion** — the parts of a module serve one duty.
- **Isolation** — a module is tested and changed without its neighbours.

## The decision in the plan

A row each: modules, dependencies, coupling now and after, patterns with `file:symbol` and the
simpler way dropped, input forms, bounds, priority, budget. A row that does not apply says why.

| Row | Example |
| --- | --- |
| Coupling | the parser has one caller, `run`; it stays one; imports past the entry: none |
| Patterns | Adapter — `mail/reader.ts:readMail`, the mail format leaks into three callers; dropped: a cast at each |
| Budget | two files, 120 lines, no dependency |

## Common misses

- **The technique is named and its check is not.** Without the third column a row proves nothing.
- **A function appended to a list is called a Decorator.** Nothing is wrapped; that is no pattern.
- **The decision repeats the steps.** It names modules and links; the steps name the work.
