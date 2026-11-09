---
name: epic-flow-declare
kind: pattern
rule: epic-flow
description: Pattern of rule epic-flow. Load when the grill gave a series of tasks — declaring the epic with its card, plan and all its tasks at once, then taking its branch from the main branch. One task — pattern task-flow-start.
---
<!-- rt-kit v0.36.0 · patterns/epic-flow-declare.md · 2bf220777bda · правится надстройкой, не здесь -->

# Declaring an epic

Pattern of the rule `epic-flow`. What must be true meanwhile — the law
`docs/constitution/work-conduct.md`.

## When to use

- The grill ended with several tasks, and the order between them matters.
- The epic is declared, and its branch is not taken yet.

## State `договорённость-записана`: a series of tasks is declared an epic

The grill ended with one task — the step is skipped. Several came out, and the order between them
matters — the epic is declared here, before the first of them, and twice. As a card in the work
queue with the epic label, and as a plan next to it.

```bash
npm run task:new -- --epic --title '<Возможность, которая разрабатывается>' --slug <slug> < тело.md
```

The call puts the epic label on the card, lays a draft of the plan in the tree's directory of plans
and writes the path to it into the body: the audit reads the plan by that path, and a card without
it points into emptiness. Everything the epic cannot be created without is asked before the card is
made — an administrator alone can take a made one off the board. What the call does not write — a
file of epics, an index of plans — the tree lists as hand steps of the same commit as the plan.

The draft is filled in by hand, and three things in it are derived from nothing: the opportunity in
one phrase, the makeup of the tasks in order, and how the branches of the tasks stand. A set without
an order is no order: two tasks whose order rested on understanding went into work the other way
round, and the second was redone under the first. The assigned order holds to the end of the epic; a
revision is the owner's decision.

The cards for all the tasks are created at once, right here — by the same call with `--epic-of`, for
every row of the makeup. The issued numbers return to the same table: "take the next" answers with a
number from now on.

**Next move:** the declared epic is committed together with the task numbers, and in the same turn
its branch is taken.

## State `эпик-заведён`: the branch of the epic

```bash
git checkout -b <КЛЮЧ>-<номер эпика>-<slug> origin/main
```

The branch is taken before the first task of the epic, not with it: taken later, it leaves the first
task standing on the main branch, and the epic starts as half of itself already merged.

The plan of the epic is committed into it and the branch is pushed at once — the branches of the
tasks are taken from it, and one that exists only on the machine is a base nobody else has. The card
names the branch: the reader comes to the epic from the queue, and the queue holds no branches.

Nothing else is committed into the epic branch: it carries the plan and the merges of the tasks; an
edit made in it directly reaches the main branch unreviewed.

**Next move:** the first task of the epic is taken — the branch of the task from the branch of the
epic, and the folder: pattern `task-flow-start`, state `договорённость-записана`.

## Common misses

- The epic branch taken together with the first task, not before it: the first task stands on the
  main branch, and the epic starts as half of itself already merged.
- The cards of the tasks created one at a time as the work reaches them: the volume of the epic is
  hidden, and "take the next" has no number to answer with.
