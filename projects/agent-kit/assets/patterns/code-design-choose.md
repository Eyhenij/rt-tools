---
name: code-design-choose
kind: pattern
rule: code-design
description: Pattern of rule code-design. Load when a request is taken apart, a plan is written or a module is split — the table from the problem to the technique and its check, coupling, cohesion and isolation, the rows of the decision in the plan. Names and types — rule typescript-conventions.
---

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
| Modules import each other | Indirection: the shared part moves to a third module | `check-coupling` names no new cycle |
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
| A branch depends on what was done before | State: the states are a table | a forbidden move has a case |
| A technical duty fits no domain module | Pure Fabrication: a module of its own | the domain module imports no disk or network |
| A problem has no row here | the pattern by its name, with the same three columns | the third column is written |
| There is no problem | No pattern: the plain function | the reason is one line of the plan |

## The words

SOLID, GRASP and Gang of Four name the techniques of the table. Coupling, cohesion and isolation are
defined in the glossary. Coupling is counted by the check of the tree:

```bash
node <checks>/check-coupling.mjs --module=<path>      # the numbers now, who imports and is imported
node <checks>/check-coupling.mjs --base=<base>        # was → became on the branch, before the review
grep -rlw "<shown symbol>" <sources>                  # a link the check does not see: who names a symbol
```

The check does not see a name in a variable, a path assembled in pieces, a script started from code
and a template: those links are searched by the symbol the module shows.

## The decision in the plan

The section stands before the footprint of the plan and is named «Решение» in a tree that writes its
plans in Russian and «Decision» otherwise. A row each; a row that does not apply says why. A module is
named down to the class or the function that gets the edit, and a thing the goal does not need has no
row. A decision that outlives the task goes to the spec of the domain, where the texts keep it.

The check reads the row Coupling: the path in backticks, then the outgoing links with an arrow. A new
folder is named by one number, the path with a slash at the end: what it imports from outside. In a
folder that stood before every module is named by itself. Growth named nowhere refuses the push; an
overrun is the same line with its reason after the numbers — among the decisions of the progress or, once
the folder of the task is taken apart, in the text of a commit.

| Row | Example |
| --- | --- |
| Modules | `mail/reader.ts:readMail` — turns a letter into a record; shows `readMail` alone |
| Dependencies | the reader imports the record; the record imports nobody; the screen never imports the reader |
| Coupling | `mail/reader.ts` incoming 1 → 1, outgoing 2 → 3; cycles none; imports past the entry none |
| Patterns | Adapter — `mail/reader.ts:readMail`; the mail format leaks into three callers; dropped: a cast at each |
| Terms | letter — what came by mail; record — what the domain keeps; both stand in the glossary |
| Input | from the mail server: a letter with a file, a letter without one, a broken header — refused |
| Bounds | the record keeps its fields; the old letters are read; no new network address |
| Priority | reliability over speed: a lost letter costs more than a second; a letter in under 2 s, 50 MB |
| Budget | two files, 120 lines, no dependency |

## Common misses

- **The technique is named and its check is not.** Without the third column a row proves nothing.
- **A function appended to a list is called a Decorator.** Nothing is wrapped; that is no pattern.
- **The decision repeats the steps.** It names modules and links; the steps name the work.
