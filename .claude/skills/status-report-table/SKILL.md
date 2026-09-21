---
name: status-report-table
kind: pattern
rule: status-report
description: Pattern of rule status-report. Load when answering the owner where the work stands. Ready-made calls for every cell: the branch and its commits, the PR state, the pipeline run checked against the head, the task on the board, the task order from the epic plan. A filled-in sample table is attached.
---
<!-- rt-kit v0.29.0 · patterns/status-report-table.github.md · 7d2c7290a4e0 · правится надстройкой, не здесь -->

# What the state is asked with and how it lands in the table

Pattern of the rule `status-report`. What must be true — the work-conduct law.

## When to use

- The owner asked where the work stands: "what is the status", "which epic", "what are you doing
  now".
- The turn ends with an account of what was done, and it names the state of a PR or a run.
- The work runs under an epic, and the reply lists all its tasks.

## Calls

The whole table at once — the command of the checks layer: it takes the order of the tasks from the
epic plan, the state of each of them from the hosting, and prints the paragraph and the table ready
to be carried to the owner. The tree names the call in the companion of the rule.

```bash
<the command of the tree> [<the number of the epic>]
```

Everything below is what the command is assembled from: it is asked by hand where the answer is not
about an epic — one task, one branch, one run.

The branch, its commits beyond main, what is uncommitted and the tip:

```bash
git branch --show-current
git log --oneline <main>..HEAD
git status --short
git rev-parse --short HEAD
```

The order of the epic's tasks is taken from its plan, not from the board: it is assigned there,
and the task numbers on the board do not run in sequence.

```bash
sed -n '/## Порядок задач/,/^## /p' <epic plan>
```

The state of the PR — whether it is a draft, whether it merges with main, how many files:

```bash
gh api repos/:owner/:repo/pulls/<number> \
  --jq '{n:.number,draft:.draft,state:.state,mergeable:.mergeable,changed:.changed_files}'
```

The pipeline run on the branch and the breakdown of one run:

```bash
gh run list --branch <branch> --limit 5
gh run view <id>
```

The task on the board — title, state, labels:

```bash
gh api repos/:owner/:repo/issues/<number> --jq '{t:.title,s:.state,labels:[.labels[].name]}'
```

What the host's executable is called and where the epic plans lie is said by the rule's companion.
The command name in the shell is sometimes taken by someone else's alias, and then the call goes
into an interactive sign-in instead of an answer.

## Common misses

- **On the epic's own branch the number is asked as an argument.** Without an argument the
  command takes the number from the branch and looks in that card's body for the line declaring
  an epic. On a task branch that line is there; on the epic branch the card is the epic itself
  and declares no other. The answer — "the task declares no epic" — then reads as a broken card
  rather than as a question asked the wrong way.

- **The task on the board is read by a request, not by the view subcommand.** The subcommand
  drags in boards of the old kind, the host answers with a refusal about them, and the call turns
  red whole, showing nothing. A direct request is taken.

- **The run is older than the tip.** The run list shows the last run of the branch, not the run of
  the current commit. It is checked against the tip before the number goes into the reply.

- **The task folder is from the template.** A copied but unfilled grill and plan keep the
  template's angle brackets. That is "created, not started", and the "State" cell says so.

- **The PR is green but a draft.** The run succeeded, while the merge is locked by the host; the
  "Remaining" cell holds lifting the draft or a wait named aloud.

## Sample

The epic above the table — as a paragraph, not as a row:

> **Эпик «<название>» (<ключ>)** — <зачем он, одной фразой>. Задач <сколько>, идёт <номер по
> порядку>.

| №   | Задача                       | Номер   | О чём                          | Состояние                                  |
| --- | ---------------------------- | ------- | ------------------------------ | ------------------------------------------ |
| 1   | <название задачи из замысла> | <ключ>  | <одной фразой, что она делает> | код готов, прогон `<id>` success 12 м 14 с |
| 2   | <название задачи из замысла> | —       | <одной фразой>                 | не заведена                                |
| —   | <заведённая вне эпика>       | <ключ>  | <одной фразой>                 | заведена, папка — пустой шаблон, ветки нет |

Under the table — a line about what we wait for from the owner, and the call that lifts it.
