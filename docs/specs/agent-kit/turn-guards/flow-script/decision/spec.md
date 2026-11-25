# The code against the decision of the plan

**Status:** in force · **Revision:** 2026-11-25 · **Scenario prefix:** `SC-AK`
**Depends on:** `docs/specs/agent-kit/turn-guards/flow-script/`
**Laws:** `work-conduct`, `code-structure`
**Procedures:** none

## Why

Exit 8 saw whether a path of the footprint was touched and did not see how the code was built. A
plan names its modules, its suites, its budget and its links in the section of the decision, and a
branch could end its stages with a symbol gone, a file nobody named or links past the plan. The
refusal named no reason. A footprint path with `*` was compared letter by letter, and such a state
never closed. Now the state `этапы-кончились` holds while the code of the head differs from the
decision, and the refusal names every mismatch.

## Terminology

- **A decision** — the section «Решение» («Decision») of a plan, a table of parts or the line
  «Решения нет» («No decision») with its reason.
- **A mismatch** — a line about what the decision promised and the code of the head does not hold:
  a place, a suite, a new file, a budget, a refusal of the coupling command, a decrease of links.
- **A lift** — an item of the decisions of the progress, or of the text of an own commit after the
  plan, that names the path or the symbol of a mismatch, the word «превышение» or «отказ от»
  («overrun», «waived») and a reason of two words at least.
- **An own commit** — a commit of the branch on its first-parent line that is no merge; what a merge
  brought is no edit of the branch.

### What it is called in the interface

There is no interface: the engine prints a mismatch as a line `not held: <text>` of `measure` and as
an item of the refusal at the end of a turn.

## Rules

- **Exit 8 holds while the code of the head differs from the decision of the plan as the first commit of the plan wrote it.**
- **A place of the modules or the patterns is declared in a file its path names, and a place written to be removed is declared in none.** A comment, an import and a call declare nothing. A short path names the files of the tree that end with it and are no laid-out copy. A place after «отброшено» is not promised; «переезжает в» judges the target.
- **A suite of an input row stands, carries a scenario number of its row and was touched by the branch or carried the number before.**
- **A new file of code is named by the modules or by an exact path of the footprint; a suite, a laid-out copy and a text are free.**
- **«No decision» holds no new file of code and no new function, class or export in an old file.**
- **A budget of lines, of new code files and of new dependencies is not exceeded, and what a merge brought is not counted.**
- **The refusal of the coupling command is a mismatch, and so is a promised decrease of outgoing links the module did not reach.** The command runs against the plan, or against the tip the newest merge after the plan brought.
- **The answer of the coupling command is kept by the head, the branch, the base and the unsaved edits, and a command that did not answer is asked again.**
- **A lift names the path of a mismatch whole or by its tail, or its symbol, and lifts it; a new cycle and an import past an entry are not lifted.**
- **What was not read is not judged: a plan without a decision, a binary file, a command that did not answer.**
- **A footprint path with a mask is touched by a file the mask unfolds to: one star holds no slash, two stars hold any.**
- **The measured state and the refusal at the end of a turn name every mismatch, one line each, and how to lift it.**

## What is out of scope

The quality of the decision, its dependencies and its boundaries in words: a role reads them. The
count of links: the coupling command makes it, and its own lines of overrun stay its own. A decrease
of a folder and the incoming links: the command prints neither. A symbol that stood before the plan
and was not edited matches without an edit. A budget «плюс N» is the difference of lengths, so an
equal number of removed and added lines goes unseen. The form of the plan: the subdomain one level
up and the check that writes the plan hold it.

## Contract

The measurer `measure.design` of the description has two capabilities: `held` — the list is empty,
`gaps` — the list of mismatches. It reads its ports `source.git`, `source.design` and
`source.coupling`. The engine reads `gaps` of an unmet exit and prints them.

- `measure`: a line `not held: <mismatch>` per mismatch under the state line.
- the refusal at the end of a turn: «The code does not hold what the decision of the plan
  promised:», a line `- <mismatch>` each, and the way to lift one.

### Refusal codes

Not applicable: a mismatch holds a state, it is no refusal of a call.

## Data

The plan as its first commit wrote it, the files of the head, the own commits after the plan with
their texts, the progress at its last version, and the answer of `check-coupling.mjs --base=<revision>`
kept in the directory `rt-kit/coupling` of the common directory of git.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The lines are in English: they are read by the executor and by checks, not by the owner.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable: one branch is measured at a time.

## Decisions

- **What is new is counted by own commits: what a commit has and its parent did not.** A merge of
  the base brings functions and dependencies into the same files.
- **The coupling command runs against the tip the newest merge after the plan brought.** Against
  the plan it called a cycle of the merged main branch new, and a new cycle is not lifted.
- **A lift takes the tail of a path.** The budget of a plan writes the full path, and the progress
  writes a short one.
- **The reading of the decision reaches the measurer through a port.** A measurer imports nothing
  outside its directory, and a second definition of a suite would part from the first.

## Open questions

None.

## History of changes

- 2026-11-25 — the subdomain was started: exit 8 compares the code of the head with the decision of
  the plan, and a footprint path with a mask is unfolded.
