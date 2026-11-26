---
name: archive-record
description: A record about closed work in the description of the past — what goes into it, how it is found without an index, what it is not. Take it when sorting out a closed task folder and when editing any file in docs/archive/. A skill of this tree; the "why" is in the rules doc-style and task-flow.
---

# A record about closed work

A skill of this tree, not from the package. It does not repeat `task-flow` — there it is said
when a task folder is sorted out and what leaves it. Here is what the record itself looks like and
how it is found afterwards.

## When to use

- A closed task's folder is being sorted out, and its content leaves for the description of the
  past.
- Any file in `docs/archive/` is edited.
- One has to find what held an old decision that gets in the way of a new one.

## The file name is the only index

There is no index of records in this tree: it took every branch that appended to it into a
conflict. So the name carries everything a record is found by.

```
RT-<task number>-<branch slug>.md
```

The name matches the name of the branch the work was done in, and from it there is a road to the
request, to the discussion of the edit and to the commits. A closed epic arrives under its own
name with the suffix `-line` and without a number: it outlives several tasks.

```bash
ls docs/archive/ | grep -i <word>          # by subject
ls docs/archive/RT-1130-*                  # by task number
grep -rl "<what was done>" docs/archive/   # by content
```

## The record is built, not written

```bash
npm run task:archive -- <body of the PR> --title '<title of the PR>'
```

The command writes the record of the branch, takes the task folder off the disk and the index and
leaves the commit to the executor. It runs after the push set is green, the body is whole and
`goal-critic` has read it.

- **From the folder, word for word:** the approvals of the kit; the grill, all but what it says of the
  tree and of the rules, its head with the keys of the cargo included; the decisions of the progress and
  each section of it of its own name. The comments are dropped. The rounds of the review go under the
  sessions: a section of their own makes the record long.
- **«Цитаты из разбора и хода работы»** — of what the grill says of the tree, and of the place of work, the
  steps, the sessions and the handover of the progress: each block that names the owner, a menu, a question
  or an approval and holds a quote; each quoted block; what a line naming the owner announces by a colon,
  all under a heading and all rows of a table that name the owner. A quote longer than 20 characters
  the record already holds is not repeated when it stands alone. Words with no quotation marks in other
  places and words in a code block are not found: they are quoted in the progress.
- **From the approval mark:** the answer that approved the plan; a mark of another plan says so.
- **From the body:** «Чем подтверждено» and «Оставшийся шаг». What the work leaves outside itself
  goes into «Оставшийся шаг»: nothing else of the body reaches the record.

What the command cannot know the executor writes into the decisions of the progress before the set,
by the commit of the last round, and without either item it refuses: `- **Цена:** …` and
`- **Отменено:** …` — each decision of the grill or of the progress the work cancelled, or «нет». The folder
goes with no files but its own; a script the commit of the plan holds leaves with it. A refusal writes
and removes nothing.

A grill in the layer's language is put into the owner's language in the record, after the command and
before its commit: the grill itself is frozen by the plan. After that commit the record does not change:
a red at the push and the remarks of the owner live in the body of the PR. A fix that needs the folder takes it back by `git revert` of the commit that took
it apart, and the record is built anew. The epic is named by the one plan in `docs/plans/` whose table
holds the task; with none or two the record names no epic.

## What goes into a record

On the third line — the task number, the epic and the day the record is written. Then what
explains the decision that took place:

- the grill of the request: the owner's answers in their own words, there is nowhere else to
  restore them from;
- the decisions along the way with their arguments — the place where the matter diverged from the
  plan;
- the price of the decision: what was paid for it and how that came out.

One work — one file, not a folder of three: the description of the past is read by eye.

## What does not go into a record

- **The plan.** After the rollout the question "what was intended" is answered by the code, "how
  it works" by the domain spec.
- **The progress of the work without the decisions.** "Where we stand" leaves together with the task
  folder.
- **Edits after the fact.** A record is edited only together with an admission that it described
  things wrongly — not because the tree has changed since.

## A record lives a week

The term is set by the owner: a record older than a week is removed from the tree and stays in the
history. It is taken out of there by the same file name it is found by while alive.

```bash
node tools/archive-prune.mjs            # a dry run: it names what has overstayed and touches none
node tools/archive-prune.mjs --apply    # it removes them
node tools/check-archive-age.mjs        # turns red if what has overstayed is still there
```

The dry run is the default not out of caution in general, but because the command removes the
grill of the request: the owner's words are nowhere else.

The check stands in the push gate set and as a pipeline step. The selection is one for it and for
the command — the module `tools/archive-age.mjs`; the number of days is there too.

## A record of the past is not linked to

A link to it lives exactly until its term, and the address check does not read the archive at all:
a dead link turns red not there but in the text that referred to it. The very first pruning broke
two such links — in a plan and in a rule's companion.

A live text names the decision in its own words: "the line is closed", "the decision was taken
then and then". The record stays the place people come to for the details — by name, not by a
link.

## Pitfalls

- **A record is not an instruction to act.** The paths and names in it are true on the day of the
  move; the description of the past is taken out of the address audit entirely, so a dead link in
  it never turns red.
- **A file leaving for the description of the past names its former address in its header.**
  Records referred to it while it was alive, and a search by the former name will not show them.
- **Sorting out costs more than removing, and the grill of the request leaves first.** It is the
  only thing that is nowhere else.
