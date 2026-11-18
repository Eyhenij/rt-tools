# The MR — cold part

The pattern `git-workflow-pr` whole, in two files: every section with its code and its reasons. Its hot part names the sections and the opening of each.

## Pitfalls

The misses of this pattern stand where they happen: in its sections below and in its list of
common misses, when it has one.

Pattern of the rule `git-workflow`. What must be true — the law
`docs/constitution/delivery.md`. Creating the task, the branch and the commit — pattern
`git-workflow-commit`.

## When to use

- An MR is opened from a finished branch.
- The title, description or labels of an already open MR are edited.
- The draft is lifted, and the work is handed over for review.
- The MR state is read before anything is said about it to the owner.

## The task number stands in its title and in the MR title

One form for both — `[<КЛЮЧ>-<номер>] <текст>`. The number stands in the title itself, not only
in the description: the MR list shows no descriptions, and in the task list the number otherwise
has to be found by eye. The branch name carries the same number, so task, branch and MR read as
one.

The task says what is wrong; the MR, under the same number, says what was done:

```
задача  [<КЛЮЧ>-86] Пустой адрес владельца — письма не уходят молча
MR      [<КЛЮЧ>-86] Письмо владельцу с незаполненным адресом попадает в логи
```

The infinitive of the task does not carry into the MR title: "fix" becomes "fixed", "restore" —
"restored", "add" — "added".

Type and scope — `fix(site):`, `docs(common):` — do not go into the MR title: that is the commit
subject format, and `commitlint` checks it there. In the MR list it takes room and adds nothing:
the kind of edit and the area are already visible by the labels.

## What is not ready to merge opens as a draft

A code edit is handed to a person by an open MR: a pushed branch is shown to them nowhere. An
open MR reads as an invitation to merge, so unfinished work opens it as a draft — the host locks
a draft's merge button itself:

```bash
GITLAB_TOKEN="$TOKEN" glab mr create --draft --title '[<КЛЮЧ>-86] …' \
    --target-branch <ветка эпика> --description "$(cat тело.md)"
```

The draft sign here is the `Draft:` prefix in the MR title, and it is edited together with it:
rewriting the title by hand lifts the draft without anyone noticing.

An MR the pipeline does not wake for opens ready, without `--draft`: the pipeline file names the
target branches it wakes for, and where no run comes a draft waits for nothing and costs a locked button and a second turn. The reviewer is set in
the same turn, and the push gate is then the only check behind the work. Without
`--target-branch` the host takes the default branch, and the work goes into `main` past its epic.

Everything waiting for a pipeline run, a rework or an answer to a question goes as a draft, and
the question is asked in the MR itself: a person reads the MR, not the session's conversation.
The draft is lifted by a separate call, in the turn in which the executor says the work is ready:

```bash
GITLAB_TOKEN="$TOKEN" glab mr update 86 --ready
```

Lifting the draft and asking to merge go in one turn: a lifted draft nobody told the person
about waits for review just like one not lifted.

## The MR is attached to the task

The description starts with the link line. Reviewer, assignee and labels are set by the same
command, and an MR does not open without them:

```bash
GITLAB_TOKEN="$TOKEN" glab mr create \
    --title '[<КЛЮЧ>-86] Письмо владельцу с незаполненным адресом попадает в логи' \
    --assignee <бот> --reviewer <владелец> --label bug --label area:api \
    --target-branch <ветка эпика> --remove-source-branch \
    --description 'Closes #86

…'
```

Before the target branch is named, its presence on the host is checked: `git ls-remote --heads origin <ветка>`. An empty answer means the base was merged and removed; the request then takes the next branch up the chain as its base.

The target branch is the epic branch, and in a chain the previous branch; into `main` goes only the
MR of the epic itself. The host closes the task by the `Closes` line only on a merge into the
default branch: with another target the tree closes it by its pipeline or by hand, and the link
line says which.

The reviewer is always the owner: without a review request the MR does not show in their queue.
The assignee is the same account the machine work goes from. Labels are read from the task, not
picked from memory:

```bash
glab issue view 86 --output json | jq -r '[.labels[]] | join(",")'
```

The line `Closes #<номер>` is mandatory: without it the MR is not attached to the task, and the
queue audit finds this. It also means the task closes whole — half a task is not rolled out by
one MR: a task has one branch, and work that does not fit it is split into tasks before the
branch is created.

On an already open MR the same is set by an edit:

```bash
glab mr update 205 --label bug --label area:api --assignee <бот> --reviewer <владелец>
glab mr update 205 --description "$(cat тело.md)"
```

An edit of the description rewrites it whole, so the line `Closes #<номер>` is written anew
together with the rest of the text. The description is reread whenever something merged into the
branch after publishing: the MR states things about the tree, and the tree has changed since.

## MR description sample

Six sections, and one order between them: the link line, what was done, the points, the goal, what
confirms it, the remaining step. A section with nothing to say says so in words — an empty heading
and a removed heading read alike and mean different things.

The table of points comes from the reply of the role `product-strategist`: a sign not run is
written as not run, and its point as not reached. The table of the goal comes from the reply of the
role `goal-critic`. Both go in word for word, and the critic reads the finished description against the
replies.

```markdown
Closes #86

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
