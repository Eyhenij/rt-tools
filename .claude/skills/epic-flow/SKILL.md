---
name: epic-flow
kind: rule
law: work-conduct
description: Rule under work-conduct — the epic as the unit of delivery. Load when an epic is declared, its branch taken, its next task chosen and its PR into the main branch opened. Pattern epic-flow-declare; one task — task-flow.
---
<!-- rt-kit v0.42.0 · rules/epic-flow.md · d38cbac68600 · правится надстройкой, не здесь -->

# Epics — how it works here

Rule under the law `docs/constitution/work-conduct.md`; the main branch takes the epic whole by
`docs/constitution/delivery.md`. Cold part: `pitfalls.md`; paths: `implementation.md`;
end of a turn — `turn-conduct`.

**Requires:** `hooks/tree-assignment-guard.sh`, `checks/tree-assignment.mjs`

## What it is called here

| In the law | Here |
| --- | --- |
| an epic — the unit of delivery | a card in the work queue with the epic label, a branch of its own from the main branch and a plan next to it. The plan holds the capability, the tasks and their order |
| the epic branch | `<КЛЮЧ>-<номер эпика>-<короткий-slug>`; the branches of its tasks are taken from it, and their PRs go into it |
| the epic plan | a record outside the task folder: the folder dies with the merge, the epic outlives it; the directory — in the rule's companion |
| who leads which epic | the table of assignments: a row for each working copy, written by the owner |

## How the law applies here

- **Work begins with the epic, and a task outside one is not taken.** Except by the owner's word
  on that work, or where the grill gave one task and the copy leads no open epic.
- **The epic branch is taken before the first task of the epic, not with it.**
- **The epic card moves to in progress by the same turn that takes its first task.**
- **The next task is taken from the epic plan, and the queue list is asked only where there is no
  epic.**
- **Which epic this working copy leads is read from the table of assignments, and the owner writes
  it.** A queue card is no order; a guard refuses work until then.
- **An epic is not closed by a sign confirmed by reading alone.** Checked: a command and its
  output.
- **The tasks of an epic are created all at once, by the same turn as the epic itself.**
- **A task of an epic is linked to the epic card as a sub-issue, not only named in the plan.**
  Closed tasks too.
- **The epic plan names how the branches of its tasks stand, on a par with their order.** Each from
  the epic branch, or a stack, each from the previous; the written one binds whoever branches.
- **The PR of the epic opens when its last folder is taken apart, and not a task earlier.** Until
  then nobody is offered its branch.
- **The epic plan lies where it is found without the network and after the merge.** The owner's
  later words go there that turn.

## What of the law is not here

The audit reads card and plan as a pair, not the makeup, order, branch arrangement or how an end
sign was checked. The gate demands it only for a new epic or its task; else load it yourself.

## Patterns

- `epic-flow-declare` — declaring an epic and its branch.
