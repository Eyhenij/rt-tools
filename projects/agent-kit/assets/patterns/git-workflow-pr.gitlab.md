---
name: git-workflow-pr
kind: pattern
rule: git-workflow
description: Pattern of rule git-workflow. Load for opening an MR and everything around it — title format, draft and leaving it, the link to the task, reviewer and labels, a description sample, reading the MR state, the checklist. Creating the task and committing — pattern git-workflow-commit.
---

# The MR

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
GITLAB_TOKEN="$TOKEN" glab mr create --draft --title '[<КЛЮЧ>-86] …' --description "$(cat тело.md)"
```

The draft sign here is the `Draft:` prefix in the MR title, and it is edited together with it:
rewriting the title by hand lifts the draft without anyone noticing.

Everything waiting for a pipeline run, a rework or an answer to a question goes as a draft. The
question is asked in the MR itself, not kept in the executor's head: a person reads the MR, not
the session's conversation.

The draft is lifted by a separate call, and that is the very turn in which the executor says the
solution is ready:

```bash
GITLAB_TOKEN="$TOKEN" glab mr update 86 --ready
```

Before the lifting the executor's silence means "not ready yet", after — "may be merged".
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

Four sections, and one order between them: the link line, what was done, what confirms it, the
remaining step. A section with nothing to say says so in words — an empty heading and a removed
heading read alike and mean different things.

```markdown
Closes #86

## Что сделано

- <правка, названная тем, что она меняет для читателя, а не тем, какие файлы задела>

## Чем подтверждено

- <проверка>: <её вывод одной строкой>
- Не гонялось: <что в набор не вошло и почему>

## Оставшийся шаг

Папка задачи разобрана коммитом `<sha>` — за работой убрано. Осталось дождаться прогона и снять
черновик; до этого кнопка слияния заблокирована хостингом.
```

The "Remaining step" section stands last and is rewritten by the same call as the rest of the
description — in the turn that lifts the draft:

```markdown
## Оставшийся шаг

Не осталось: прогон зелёный, черновик снят. Можно вливать.
```

It stands there because the merge decision is made on that page, not in the conversation: what
was said to the owner aloud lives until the next reply, and the description lies right by the
button. One does not cancel the other — the order of both messages to the owner is described by
the pattern for closing work.

There is nothing to check the description by machine: no audit reads it, and the host asks only
about the title. The sample is held by whoever writes the description — like the words said
aloud.

## The MR state is read, not guessed

The edit commands answer with a zero code even when they did nothing: a token without rights to
the project silently sets neither a label nor a reviewer. So after them the MR is reread:

```bash
glab mr view 205 --output json \
    | jq '{author: .author.username, reviewers: [.reviewers[].username], labels: .labels}'
```

The owner is told what was read, not what was ordered.

The account one had to push from does not carry into this call: push and MR authorship are
chosen separately, and the token for publishing is always the machine work's token.

It is reread by time too, not only after calls that silently did nothing: the MR state is read
before anything is said about it. Between "the run is green" and the next phrase the owner has
time to merge the MR, and everything said about it after that is about yesterday. That is how
the owner was offered to merge what they had merged an hour earlier.

An open MR means the task awaits review — the list is moved in the same motion:

```bash
npm run task:move -- 86 in-review
```

## What is checked before the MR is published

There are no checks on the MR itself until the pipeline is started, and a push starts it.
Linters, unit tests and hook scenarios are taken by the push gate — below is what it does not
know.

1. **The main branch is merged into this branch** — `git fetch origin && git merge origin/main`.
   Everything checked below is checked from this base: an MR from a diverged branch shows the
   reviewer the edit mixed with someone else's. Order and conflict resolution — pattern
   `git-workflow-merge`.
2. **The branch holds only the edit it was created for** — `git diff main...HEAD --stat`. A
   foreign domain in the file list means the edit has spread, and it must be brought back within
   its bounds.
3. **No mock, no substituted response, no debug line** — `git diff main...HEAD` is read whole,
   not by file names. They go to production silently and corrupt real data.
4. **The document goes in the same commit.** `docs-guard` names the pair, but it does not know
   the domain spec and an edit of its behaviour — that stays with the author.
5. **Text and layout checks are green** — those the tree created in `tools/`. Which ones exist
   here — the rule's `implementation.md`.
6. **All applications of the tree build** — `nx build` for each. The push gate does not run the
   build.
7. **Visible text is entered in all translation locales** — by the dictionary completeness test,
   if the tree is translated.
8. **A layout edit is confirmed by a measurement**, not by a look, and captured on a narrow
   screen — pattern `browser-verification-measure`.
9. **A markup edit of the public site is checked on the production build in all translation
   locales** — the search visibility rule of the tree that has one.
10. **The MR description is assembled by the sample** — starts with the line `Closes #<номер>`,
    carries the sections "What was done", "What confirms it" and "Remaining step", and labels,
    reviewer and assignee are set. By this moment the remaining step section says no steps are
    left: the draft is lifted after the folder is taken apart, not before.
11. **The MR title carries the task number and names it done:** `[<КЛЮЧ>-<номер>] <Что
сделано>`, with the same number as the task and the branch name.
12. **The work queue matches** — `npm run check:board`.
13. **The MR state is read, not derived from return codes.**
14. **The set is taken from the pipeline file, not assembled from memory.** The push gate is
    narrower by design: it stands between the command and the push, and everything longer than
    seconds is taken out of it. What the pipeline runs is written in its file — that list is
    repeated locally; a green gate is not completeness of the set.
15. **The set is revised after merging the main branch in.** It is chosen by what the branch now
    carries, not by what the author edited. A branch that touched no line of the showcase runs
    the showcase snapshots: since the merge the pipeline runs them on its code, and the red
    comes to its MR.

Right after publishing the task is moved to review, and the queue audit is run once more: before
the MR opens it does not judge the list, after the opening it sees the discrepancy.

What was done by reasoning and what was done by measurement are told apart plainly in the MR
description: the unchecked named as checked, the reviewer takes as checked.

**The "What confirms it" section names what was not run too.** A list of one run cannot be told
from the full set, and by it the reviewer decides what need not be rechecked. The price of a
mistake here is not a red pipeline but trust in the section: once read as complete, from then on
it is rechecked whole.

## Common misses

Misses about creating the task, the branch and the commit — pattern
`git-workflow-commit`.

- An MR opened without a reviewer: it never reaches the owner's inbox, and the queue stands
  while looking as if it works.
- Labels set by the MR title, not read from the task: the area is lost, and the board does not
  show that the edit touched a neighbouring domain too.
- A second `Closes` line in one MR: two tasks in one branch roll back only together. Either it
  is one task — and the second is absorbed — or two branches.
- Half a task that left by its own MR: the description of such an MR starts with the words
  `Часть #<номер>` instead of `Closes`, the task stays open, and after a rollback it shows as
  whole.
- `--remove-source-branch` forgotten: task branches pile up in the repository, and the branch
  list no longer shows which work is going on now.
