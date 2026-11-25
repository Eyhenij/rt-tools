# The end of an epic

**Status:** in force · **Revision:** 2026-11-25 · **Scenario prefix:** `SC-AK`
**Depends on:** `docs/specs/agent-kit/turn-guards/flow-script/spec.md`
**Laws:** `work-conduct`, `delivery`
**Procedures:** none

## Why

After the PR of a task the engine leads the work through three states of the epic: the next task is
taken, the merged tasks are marked in the epic plan, and the PR of the epic into the main branch
opens. Each state has an exit measured from the epic plan, the branches and the hosting. The task
merged last has no next branch to mark it by, so its merged PR counts alone: otherwise the end of
every epic would wait for a menu of the owner.

Work outside an epic has none of this and starts by exit 2 alone: without it the engine held such work
at its second state, and an epic was declared above one task to let it through.

This subdomain of the engine holds the rules of exits 11, 12 and 13, and of exit 2 outside an epic. They carry the prefix `SC-AK`
of the domain, so the scenarios share one numbering.

## Terminology

- **The task merged last** — the task not deferred whose latest merged PR has the latest merge time
  among the tasks of the epic; tasks merged in the same second are all last.
- **The mark** — the word «влито» in the row of a task in the epic plan.

### What it is called in the interface

There is no interface: the engine prints the measured state and the exits read.

## Rules

- **Exit 11 is met when every unmerged, unblocked task of the epic other than the current one has a branch, and with no such task.**
  A task with a merged PR of its branch counts merged even without the mark: the hosting removes
  the branch on merge.
- **Exit 12 is met when every task not deferred with a merged PR of its branch is marked «влито», except the task merged last and the task of the last row, and no other task is left unmerged.**
  The mark is set by the branch of the next task, and the task merged last has none, whatever its
  row: its merged PR counts alone, and tasks merged in the same second are all last. So does the
  task of the last row, which a chain merged top-down leaves merged before the rest. A mark on a
  task whose merged PR the hosting no longer lists counts only when no branch of it is left on the
  server and no PR of its branches is open or closed unmerged.
- **Exit 13 is met when the tip of every task not deferred lies in the epic branch or the main branch, and the PR of the epic into the main branch exists.**
- **Exit 2 is met outside an epic by the line of the card.** A card that names no epic and carries the
  line of work outside one meets it, whatever the words. An epic named later is judged before the kept
  answer; the answer is kept for the branch and stands only while the hosting is silent.
- **Exit 2 is met outside an epic by the only draft that counts one task.** The branch has no number and
  the copy has no live epic: an epic of the copy is an open card with the label of an epic, wherever its
  plan lies. This answer is not kept, and a second draft takes it away.

## What is out of scope

The epic of the work, the epic of the copy and exit 2 in an epic are in the domain
`docs/specs/agent-kit/turn-guards/flow-script/`. The rule that a row of the epic plan is never marked «шаг владельца»
is of the same domain; exit 11 reads a row with the old mark as an ordinary row.

## Contract

The exits are read by the command `measure` of the engine, like every other exit. Each measurer
gets the git, the working copy and the hosting through its ports and answers met or unmet.

### Refusal codes

Not applicable: an exit is met or unmet, and the engine names it in the measured state.

## Data

The merged PRs of the hosting with their merge time, the branches on the server and locally, and the
rows of the epic plan. The list of merged PRs holds the last 300 of them.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

Not applicable.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Every task of the epic is measured at once, and an exit is met only when every task meets it.

## Decisions

- **The task merged last counts by its merged PR.** Rejected: a mark demanded of every task, which
  left the end of every epic to a menu of the owner.
- **A mark with no merged PR in view counts while no branch of the task is left on the server.** The
  hosting lists the last 300 merged PRs and removes a branch on merge; a mark of a task merged earlier
  than that window would otherwise hold the exit forever.

## Open questions

None.

## History of changes

- 2026-11-19 — exits 11, 12 and 13 moved here from the domain; the task merged last and the task of
  the last row count by the merged PR without the mark.
- 2026-11-25 — exit 2 outside an epic, by the line of the card and by the only draft.
