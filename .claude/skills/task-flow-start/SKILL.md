---
name: task-flow-start
kind: pattern
rule: task-flow
description: Pattern of rule task-flow. Load at the start of work from the owner — exploration before the first question, the six mandatory questions, the product agreement, creating the task, the branch and the folder. Returning to work — pattern task-flow-resume.
---
<!-- rt-kit v0.41.0 · patterns/task-flow-start.md · c841fe908ee9 · правится надстройкой, не здесь -->

# Starting the work

Pattern of the rule `task-flow`. What must be true meanwhile — the law
`docs/constitution/work-conduct.md`. Cold part: `pitfalls.md` — every section below whole, with its code and reasons.

## When to use

- The owner asks for something to be done; the size of the request does not matter — a folder is
  created for any work.
- A defect noticed along the way becomes a task.

## Order

The steps below open one continuous count: a step number is one for the whole course of the work and does not start over in the next pattern.

### State `просьба-не-разобрана`: exploration — before the first question

The rule `code-design` and its table are loaded before the code is read, where the tree has them: bounds, terms and patterns are the executor's to choose, also when the plan is written in the plan mode of the host.

A question whose answer lies in the code is not put to the owner: it devalues the rest. The findings go into the grill section "What is already in the tree".

### State `просьба-не-разобрана`: the grill with the owner

Led by the main agent: a subagent cannot reach the owner. The command is `/grill-me`, one question at a time, each with its recommended answer and the reason. The card and the owner's words behind it are answers: an option that repeats the text of the task means the question is not asked, and its decision goes into the grill with a reference. A finding against a recorded decision is a cost line in the grill, not a new question.

### State `разбор-закрыт`: the pipeline after the grill

### State `договорённость-записана`: a series of tasks is declared an epic

The grill says how many tasks it gave, by the line `**Tasks of the grill:** <number>`. The grill gave one task — no epic is declared for it: it goes into the epic in work; a copy with no open epic creates it with `--single`. Beside an open epic a small order goes outside it only by the owner's word, with `--outside-epic`.

### State `договорённость-записана`: the task, the branch, the folder

The body comes as a file and is never empty: an empty task tells nothing to the executor or the owner, and it can be filled in later only on the owner's word.

### State `задача-взята`: the plan header

### State `замысел-записан`: the first stage begins in the same turn

The plan is committed — the work moves into the first stage at once, without giving up the turn.

## Common misses

- **The number never comes first.**
- **The grill is written to disk at once, not stored up in the conversation.**
