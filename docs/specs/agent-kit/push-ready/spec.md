# A PR asked about before the set

**Status:** in force · **Revision:** 25 November 2026 · **Scenario prefix:** `SC-AK`
**Depends on:** `push-gate-ahead`, `delivery-epic`
**Laws:** `verifiability`, `delivery`
**Procedures:** none

What the run ahead asks about a future PR before its first step, and how it ends when the PR would not open.

## Why

The opening of a PR refuses after the set: a missing end-to-end test, a moved branch of the epic, a task
folder that differs from its plan. The fix changes the tree, the marks fall, and the set runs again. From 21
to 25 November 2026 thirty PRs were opened in one tree and 14 openings were refused on 11 branches. Six of
those branches were refused for a test, a folder or a base; one of the six also for a base that moved under
the running set, which no question before it can tell.

## Terminology

- **The run ahead** — as in `push-gate-ahead`.
- **A condition of the PR** — what the opening of a PR refuses for and the branch already shows.
- **The base of the PR** — the branch the PR of this branch will go into, not the one the set is counted
  against.
- **The folder that cannot be taken apart** — a task folder with a step not done, an untouched footprint, or a
  plan or a grill that differs from the commit of the plan.

### What it is called in the interface

There is no interface: the run answers with lines of output and an exit code.

## Rules

- **A run ahead whose PR would not open starts no step.** It prints a line per unmet condition, all of them at
  once, ends with the line `push ahead: not ready for a PR` and the code 3, and leaves a line in the
  observations.
- **The conditions of the epic and of the tree are judged by the code the opening of a PR is judged by.** The
  functions of the epic helper of the delivery guard, and the guards the tree names, each called with an
  opening of a PR. A list of its own would drift from them. A moved main branch outside an epic repeats the
  line of the delivery guard, and a scenario compares the two; the folder is judged by an engine
  of its own: the steps by the measurer of the flow, the footprint by the rows of the plan.
- **The guards a tree opens a PR through are named by its profile.** Each is asked with the base of the PR and
  the root of the copy the run stands in, and the first line of its `deny` that holds words is the condition.
  With none named no guard is asked; a named guard that is absent, or one that answers otherwise, holds nothing.
- **The base of the PR is the branch of the epic where the set is counted against the main branch.** An epic
  moved by a plain commit is no base of the set, and its task would be judged by the whole epic. In a chain
  the base of the set is the branch below, and so is the base of the PR.
- **A moved base holds the run while the task folder lies in the branch.** Of a task of an epic the branch of
  the epic is asked, of a task outside one the main branch. Once the folder is taken apart the fix after a
  review goes on without a merge. A card that did not answer, or that the host does not know, judges no base.
- **A folder that cannot be taken apart holds the run, and each reason has a line of its own.** The folder that
  merely lies in the branch does not: it is taken apart after the green set. No other exit of the flow is read,
  so a lost approval mark holds nothing.
- **The folders of tasks left in the branch of an epic hold its run.** The branch of an epic is told by the
  label of its card.
- **A branch not going into a PR yet is run with a reason.** `--no-pr '<reason>'`, one line of at least three
  characters with no `<` and no control character: nothing is asked, the reason is printed, and the observations keep a line
  without its words — they hold no free text. Without a reason, or with any other argument, the run does not
  start. A branch that goes into a PR takes it in one case: the only line left is a path of the footprint the
  work turned out not to need, and a tree names the place of that decision.
- **What cannot be judged does not hold the run.** A branch with no task number, a silent host, no engine or
  one that breaks, a description of the flow that does not build, a tree whose main branch or directory of
  tasks is not the one the engine reads, a plan that lies in the main branch already: the opening of the PR
  judges it. An engine that answers nothing, and a question that ends with a code, are said in the log.
- **The question is a step of the run.** It comes after the line with the process number, reads no input of the
  caller and no terminal, runs in a group of its own, and a stop ends it with everything it holds.

## What is out of scope

- The title and the body of the PR: before the set there is none, and the set is not run again for them.
- The rerun of the done steps: about eighty seconds a branch, and it reads records written after the start.
- The card, the archive record and an unmerged agreement: not one of the 14 refusals named them.
- A conflicting PR of one's own: the set is what its fix goes through.
- A base that moves under a running set.
- A push past the run ahead: the git hook before a push runs the steps itself and asks nothing.

## Contract

The surface is the exit code and the lines of the run ahead, and the profile variable
`RT_PUSH_READY_HOOKS` — file names of guards, separated by spaces.

### Refusal codes

Not applicable: the run refuses nothing to an agent call. It exits with 3 and starts no step.

## Data

None of its own. The line in the observations is `push-ready` with `refused` or `skipped`.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The lines of the run are in English, as the rest of the guards.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

A run judges the copy it stands in: the profile and the folder are read from its root, and the guards are
called with it, whatever copy the session stands in. The guards themselves are those next to the called script.

## Decisions

- **The question stands in the run ahead, not in the list of steps.** A step would be asked of every push, a
  branch going into no PR included, and against the base of the push.
- **The delivery guard itself is not called in a mode of its own.** Such a mode locked the fix of a conflicting
  PR and the first run of the branch of an epic, and the conditions it added were in none of the refusals.
- **The open folder holds nothing by itself.** The set runs beside the second reading of a change, and the
  record of that reading goes into the folder.

## Open questions

None.

## History of changes

- 25 November 2026 — the subdomain was created: the set ran again after a refusal at the opening of a PR.
  Task RT-3628.
