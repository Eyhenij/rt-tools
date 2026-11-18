# The PR — cold part

The pattern `git-workflow-pr` whole, in two files: every section with its code and its reasons. Its hot part names the sections and the opening of each.

## Pitfalls

The misses of this pattern stand where they happen: in its sections below and in its list of
common misses, when it has one.

Pattern of the rule `git-workflow`. What must be true — the law
`docs/constitution/delivery.md`. Creating the task, the branch and the commit — pattern
`git-workflow-commit`.

## When to use

- A PR is opened from a finished branch.
- The title, body or labels of an already open PR are edited.
- The draft is lifted, and the work is handed over for review.
- The PR state is read before anything is said about it to the owner.

## The work item number stands in its title and in the PR title

One form for both — `[<номер>] <текст>`. The number stands in the title itself, not only in the
body: the PR list shows no bodies. The branch name carries the same number, so work item,
branch and PR read as one.

The work item says what is wrong; the PR, under the same number, says what was done:

```
элемент  [86] Пустой адрес владельца — письма не уходят молча
PR       [86] Письмо владельцу с незаполненным адресом попадает в логи
```

The infinitive does not carry into the PR title: "fix" becomes "fixed", "restore" — "restored",
"add" — "added".

Type and scope — `fix(site):`, `docs(common):` — do not go into the PR title: that is the commit
subject format, and `commitlint` checks it there.

## What is not ready to merge opens as a draft

A code edit is handed to a person by an open PR: a pushed branch is shown to them nowhere. An
open PR reads as an invitation to merge, so unfinished work opens it as a draft — the host locks
a draft's completion itself:

```bash
AZURE_DEVOPS_EXT_PAT="$TOKEN" az repos pr create --draft true --title '[86] …' \
    --target-branch <ветка эпика> --work-items 86 --reviewers <владелец> \
    --description "$(cat тело.md)"
```

The check pipeline does not start on a draft by default: a run's silence is not taken for a
green run, and the set is run on one's own machine or by a manual start.

A PR the pipeline does not wake for opens ready, without `--draft true`: the branch policies name
the target branches that carry a build validation, and where no run comes a draft waits for nothing and costs a locked button and a second turn. The reviewer is set in
the same turn, and the push gate is then the only check behind the work. Without
`--target-branch` the host takes the default branch, and the work goes into `main` past its epic.

A rework or an unanswered question goes as a draft; a PR that waits only for the run opens
ready, because the run does not start on a draft. The
question is asked in the PR itself, not kept in the executor's head: a person reads the PR, not
the session's conversation.

The draft is lifted by a separate call, and that is the very turn in which the executor says the
solution is ready:

```bash
AZURE_DEVOPS_EXT_PAT="$TOKEN" az repos pr update --id 86 --draft false
```

Lifting the draft starts the run where a build validation stands on the target, and the merge is
asked in the turn the run is read green. Where none stands, lifting and asking go in one turn: a
lifted draft nobody told the person about waits for review just like one not lifted.

## The PR is bound to the work item at creation

The binding is set by a flag, not by an edit after: the token may lack the right to edit someone
else's work item, and the second command goes by silently, leaving the PR bound to nothing.

```bash
AZURE_DEVOPS_EXT_PAT="$TOKEN" az repos pr create \
    --title '[86] Письмо владельцу с незаполненным адресом попадает в логи' \
    --source-branch 86-mail-owner-silence --target-branch <ветка эпика> \
    --work-items 86 --reviewers <владелец> --delete-source-branch true \
    --description 'Закрывает рабочий элемент 86.'
```

Before the target branch is named, its presence on the host is checked: `git ls-remote --heads origin <ветка>`. An empty answer means the base was merged and removed; the request then takes the next branch up the chain as its base.

The target branch is the epic branch, and in a chain the previous branch; into `main` goes only the
PR of the epic itself. Completing a PR closes the bound work item on any target
branch when the person leaves the option "Complete associated work items after merging" checked in
the Complete dialog.

The reviewer is always the owner: without a review request the PR does not show in their queue.
One PR closes the work item whole — half a task is not rolled out by one PR: a task has one
branch, and work that does not fit it is split into tasks before the branch is created.

On an already open PR the same is set by an edit:

```bash
az repos pr work-item add --id 205 --work-items 86
az repos pr reviewer add --id 205 --reviewers <владелец>
az repos pr update --id 205 --description "$(cat тело.md)"
```

An edit of the description rewrites it whole. The body is reread whenever something merged into
the branch after publishing: the PR states things about the tree, and the tree has changed since.

## PR body sample

Six sections, and one order between them: the link line, what was done, the points, the goal, what
confirms it, the remaining step. A section with nothing to say says so in words — an empty heading
and a removed heading read alike and mean different things.

The table of points comes from the reply of the role `product-strategist`: a sign not run is
written as not run, and its point as not reached. The table of the goal comes from the reply of the
role `goal-critic`. Both go in word for word, and the critic reads the finished body against the
replies.

```markdown
Закрывает рабочий элемент 86.

## Что сделано

- <правка, названная тем, что она меняет для читателя, а не тем, какие файлы задела>

## Точки

| Точка | Признак | Результат |
| --- | --- | --- |
| <изменение, которое увидит человек> | <команда, страница или число> | <вывод признака: достигнута или промах> |

## Цель

| Слова владельца | Что показывает результат | Итог |
| --- | --- | --- |
| <дословная цитата> | <что видно в результате> | <выполнено или нет> |

## Чем подтверждено

- <проверка>: <её вывод одной строкой>
- Не гонялось: <что в набор не вошло и почему>

## Оставшийся шаг

Папка задачи разобрана коммитом `<sha>` — за работой убрано. Осталось дождаться прогона
проверки; сливать после зелёного. В окне Complete оставить отметку «Complete associated work items
after merging»: рабочий элемент 86 закрывается этим запросом.
```

The link line says the work item closes with this PR, and the "Remaining step" section names the
option for the one who presses Complete: the dialog remembers the last choice of that person.

The "Remaining step" section stands last and is rewritten by the same call as the rest of the
body — in the turn the run is read green:

```markdown
