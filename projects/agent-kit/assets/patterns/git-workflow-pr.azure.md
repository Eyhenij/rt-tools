---
name: git-workflow-pr
kind: pattern
rule: git-workflow
description: Pattern of rule git-workflow. Load for opening a PR and everything around it — title format, draft and leaving it, linking to the work item, the reviewer, a body sample, reading the PR state, the checklist. Creating the item and committing — pattern git-workflow-commit.
---

# The PR

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
## Оставшийся шаг

Не осталось: прогон зелёный. Можно вливать, отметка «Complete associated work items after
merging» в окне Complete остаётся.
```

Where no build validation stands on the target, the section says from the opening that nothing is
left and names the push gate as the only check, not a green run.

It stands there because the merge decision is made on that page, not in the conversation: what
was said to the owner aloud lives until the next reply, and the body lies right by the button.
One does not cancel the other — the order of both messages to the owner is described by the
pattern for closing work.

There is nothing to check the body by machine: no audit reads it, and the host asks only about
the title. The sample is held by whoever writes the body — like the words said aloud.

## The PR state is read, not guessed

The edit commands answer with a zero code even when they did nothing. So after them the PR is
reread:

```bash
az repos pr show --id 205 \
    --query '{author: createdBy.uniqueName, reviewers: reviewers[].uniqueName, work: workItemRefs[].id}'
```

The owner is told what was read, not what was ordered.

It is reread by time too, not only after calls that silently did nothing: the PR state is read
before anything is said about it. Between "the run is green" and the next phrase the owner has
time to merge the PR, and everything said about it after that is about yesterday. That is how
the owner was offered to merge what they had merged an hour earlier.

An open PR means the work item awaits review — the state is moved in the same motion:

```bash
npm run task:move -- 86 in-review
```

## Answering under remarks

Remarks on a PR live in threads, and the client has no command for them, so they go through the
REST call of the same client. They are read at once, before the first edit:

```bash
az devops invoke --area git --resource pullRequestThreads \
    --route-parameters project=<проект> repositoryId=<репозиторий> pullRequestId=<номер> \
    --api-version 7.1 --query "value[?comments[0].commentType=='text'].{id:id, text:comments[0].content}"
```

The person is asked by the asking tool whether to answer under them, in the turn the remarks were
read. The answer holds for this PR. Silence is not a yes: a message on the host stays there, and
it goes out under an account the person answers for.

After a yes every thread gets its own answer, once the edit has reached the host: a commit named
before the push does not exist for the reader yet.

```bash
az devops invoke --area git --resource pullRequestThreadComments --http-method POST \
    --route-parameters project=<проект> repositoryId=<репозиторий> pullRequestId=<номер> threadId=<id> \
    --in-file ответ.json --api-version 7.1
```

The file holds `{"content": "<текст>", "commentType": 1}`.

An answer is written in the owner's language and names one of two things: the commit that closes
the remark, or why the remark is declined. The count of answers is compared with the count of
threads read at the start: a remark left without one is a remark the person checks again by hand.

## What is checked before the PR is published

The pipeline sees only what was sent, and it is sent by a push. Linters, unit tests and hook
scenarios are taken by the push gate — below is what it does not know.

1. **The base is merged into this branch** — `git fetch origin && git merge origin/<база>`: for a
   work item branch that is the epic branch, for an epic branch the main one.
   Everything checked below is checked from this base: a PR from a diverged branch shows the
   reviewer the edit mixed with someone else's. Order and conflict resolution — pattern
   `git-workflow-merge`.
2. **The branch holds only the edit it was created for** — `git diff origin/<база>...HEAD --stat`. A
   foreign domain in the file list means the edit has spread, and it must be brought back within
   its bounds.
3. **No mock, no substituted response, no debug line** — `git diff origin/<база>...HEAD` is read whole,
   not by file names. They go to production silently and corrupt real data.
4. **The document goes in the same commit.** `docs-guard` names the pair, but it does not know
   the domain spec and an edit of its behaviour — that stays with the author.
5. **Text and layout checks are green** — those the tree created in `tools/`. Which ones exist
   here — the rule's `implementation.md`.
6. **All applications of the tree build** — `nx build` for each; the push gate runs the build of
   what the branch touched, and an application nothing touched is built here.
7. **Visible text is entered in all translation locales** — by the dictionary completeness test,
   if the tree is translated.
8. **A layout edit is confirmed by a measurement**, not by a look, and captured on a narrow
   screen — pattern `browser-verification-measure`.
9. **A markup edit of the public site is checked on the production build in all translation
   locales** — the search visibility rule of the tree that has one.
10. **The PR is bound to the work item**, the reviewer is set, and the body is
    assembled by the sample — the sections "What was done", "Points", "Goal", "What confirms it" and "Remaining
    step". By this moment the remaining step section names what is left: the run, where a build
    validation stands on the target, or nothing. The folder is taken apart before the PR opens.
11. **The PR title carries the work item number and names the work done:** `[<номер>] <Что
сделано>`, with the same number as the work item and the branch name.
12. **The work queue matches** — `npm run check:board`.
13. **The PR state is read, not derived from return codes.**
14. **The set is taken from the pipeline file, not assembled from memory.** The push gate is
    never narrower than the pipeline, and a check judges that. The declared exclusions of
    the set are read in its settings and run by hand.
15. **The set is revised after merging the base in.** It is chosen by what the branch now
    carries, not by what the author edited. A branch that touched no line of the showcase runs
    the showcase snapshots: since the merge the pipeline runs them on its code, and the red
    comes to its PR.

Right after publishing the work item is moved to review, and the queue audit is run once more:
before the PR opens it does not judge the state, after the opening it sees the discrepancy.

What was done by reasoning and what was done by measurement are told apart plainly in the PR
body: the unchecked named as checked, the reviewer takes as checked.

**The "What confirms it" section names what was not run too.** A list of one run cannot be told
from the full set, and by it the reviewer decides what need not be rechecked. The price of a
mistake here is not a red pipeline but trust in the section: once read as complete, from then on
it is rechecked whole.

The list is about opening: a PR that waits only for the run opens ready, so the items are passed
before the opening, and an unmet item means the PR does not open yet. The run is then waited for on
the open PR. A draft stands only for a rework or a question, and the same items are passed before
`az repos pr update --id <номер> --draft false`. Where no build validation stands on the target, no
item asks for a run: its place is taken by the push gate, green before the sending.

## A chain of branches: the calls of this host

The order is the pattern `git-workflow-stack`, with one difference: here the upper PR is retargeted
before the lower one completes, not after. The calls:

```bash
# the upper PR, before the lower one completes; the file holds {"targetRefName": "refs/heads/<ветка эпика>"}
az devops invoke --area git --resource pullRequests --http-method PATCH \
    --route-parameters project=<проект> repositoryId=<репозиторий> pullRequestId=87 \
    --in-file цель.json --api-version 7.1
az repos pr show --id 87 --query targetRefName -o tsv              # reread: the call finds its resource by name
az repos pr show --id 87 --query mergeStatus -o tsv                # whether the PR can be completed
az boards work-item update --id 86 --state <закрытое состояние>    # an item the host did not move itself
```

`az repos pr update` has no flag for the target branch, so the retargeting goes through the REST
call. It goes first because completing with `--delete-source-branch true` removes the branch the
upper PR targets.

The host takes no PR description longer than 4000 characters, so the length is counted before the
call. When the two tables do not fit, their rows stay and the cells are shortened to the verdict;
the word-for-word replies of the roles go into the first comment.

## Common misses

Misses about creating the task, the branch and the commit — pattern
`git-workflow-commit`.

- A PR opened without `--work-items`: there is no link, and the work queue does not show what
  this edit is for.
- `AB#<номер>` in a commit taken for the PR binding: it binds the commit, and the queue reads
  the PR's link.
- A PR opened without a reviewer: it never reaches the owner's inbox, and the queue stands
  while looking as if it works.
- `--delete-source-branch` forgotten: task branches pile up in the repository, and the branch
  list no longer shows which work is going on now.
- Auto-complete turned on before the checks before a push were run: the pipeline is green on
  what it knows how to do, and the merge happens without all the rest.
