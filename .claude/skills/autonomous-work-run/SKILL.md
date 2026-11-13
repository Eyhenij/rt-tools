---
name: autonomous-work-run
kind: pattern
rule: autonomous-work
description: Pattern of rule autonomous-work. Load when the owner has left and the work runs through the night — the cycle of one piece of work, chained branching, a written default instead of a question, the list by morning, handling a guard refusal. Not for ordinary work — patterns task-flow-start and -resume.
---
<!-- rt-kit v0.37.0 · patterns/autonomous-work-run.md · e98428fdb35b · правится надстройкой, не здесь -->

# A night without the owner

Pattern of the rule `autonomous-work`. What must be true — the law
`docs/constitution/autonomous-work.md`.

## When to use

- The owner said they are leaving and asked for work on one's own.
- More than one task in a row is taken in a session, and they cannot be handed outside.
- The work ran into a question, and there is nobody to ask.

## The chain of branches

The first work branches from the epic branch — or from main where the work has no epic — each
next one from the previous:

```bash
git checkout -b <КЛЮЧ>-<номер-1>-<slug> <база>         # the first of the night
git checkout -b <КЛЮЧ>-<номер-2>-<slug> <КЛЮЧ>-<номер-1>-<slug>
git checkout -b <КЛЮЧ>-<номер-3>-<slug> <КЛЮЧ>-<номер-2>-<slug>
```

The merge order is from the bottom up, and it is named in the morning list by numbers. A branch
created from the base in the middle of the chain will collide with its neighbour in shared files —
indexes, counters, journals — and the owner will be the one to sort it out.

```bash
git log --oneline --graph --decorate <база>..HEAD | head -20   # what the chain stands on now
git branch --list '<КЛЮЧ>-*' --format='%(refname:short) %(upstream:short)'
```

The base moved during the night — it is merged into the previous branch locally, and only then the
next one is created. Taking the base fresh instead breaks the chain:

```bash
git fetch origin
git merge-base --is-ancestor origin/<база> <прошлая ветка> || {
    git checkout <прошлая ветка> && git merge origin/<база>
}
git checkout -b <КЛЮЧ>-<номер>-<slug> <прошлая ветка>
```

## The cycle of one piece of work

```bash
npm run task:move -- <номер> in-progress                 # taken
git checkout -b <КЛЮЧ>-<номер>-<slug> <прошлая ветка>    # a chain, not a fan
dir="${RT_TASKS_DIR:-docs/tasks}/<КЛЮЧ>-<номер>-<slug>"
mkdir -p "$dir" && cp "${RT_TASKS_DIR:-docs/tasks}"/_template/*.md "$dir"/
# the grill with defaults, the plan, the state «этап-идёт»
git add "$dir" && git commit                              # the folder goes into history at once
# work by stages: each ends with a commit and a run of the readiness sign
# the folder is taken apart into the archive by the last commit
```

Nothing goes outside during the night: no `git push`, no `gh pr create`, no publishing, no cargo
mark. The branch stays local, and in the morning the owner decides what to hand out of it.

## A default instead of a question

Written into the grill, into the decisions section — where the owner's answer would have been
written:

```markdown
- **<что принято>** — <довод>. Спросить было некого: заход автономный. Цена ошибки:
  <что придётся переделать, если владелец решит иначе>.
```

The cost of a mistake is not politeness but a sign: it separates a default that can be replayed in
ten minutes from one for whose sake the work is better postponed whole.

## A postponed task

A task that needs the owner's word is not taken: its state on the board stays as it was, and a
line goes into the morning list.

```markdown
- **<КЛЮЧ>-<номер> — <заголовок>.** Отложена: <какой вопрос и почему умолчания у него нет>.
```

A task stopped halfway — by red that cannot be fixed or by a question — goes back to its former
column, and its line says the branch is not merged:

```bash
npm run task:move -- <номер> <прежняя колонка>
```

```markdown
- **<КЛЮЧ>-<номер> — <заголовок>.** Остановлена: <что красное или какой вопрос>. Ветка
  `<ветка>` не вливается; следующая работа идёт от `<последняя зелёная>`.
```

## The morning list

Appended along the way, after each closed piece of work, not assembled at the end.

```markdown
| Работа | Ветка | Чем подтверждена | Чего ждёт |
| ------ | ----- | ---------------- | --------- |
| <КЛЮЧ>-… — <что сделано> | `<ветка>` (на `<предыдущей>`) | `<команда>` — <вывод> | заявки и слияния |
```

The order of rows is the merge order. Below the list — the postponed tasks with their questions.

## A guard's refusal

The refusal names the skipped step: the step is done, the call is repeated, the work goes on. The
night ends with work, not with an argument with the guard.

- The refusal demands what must not be done (a push, a PR). The work is brought to the place where
  the demand can be met in the morning and goes into the morning list as the line "waits for a PR".
- The refusal repeats at the same place twice — then the skipped step was understood wrongly: the
  rule named in the refusal is read, not the wording rewritten.

## Common misses

- **The branch was created from the base by habit.** The chain breaks silently, and the cost
  surfaces for the owner at the second merge.
- **A default was taken and not written down.** In the morning it cannot be told from knowledge,
  and the owner learns of it only when the work was done wrong.
- **A task was taken and postponed halfway.** On the board it is in progress, in the branch — half
  an edit; the next session reads it as begun and does not start over.
- **The morning list was assembled from memory at the last minute.** By that hour the window was
  already shrinking, and half of the night did not get into it.
