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
AZURE_DEVOPS_EXT_PAT="$TOKEN" az repos pr create --draft true --title '[<КЛЮЧ>-86] …' \
    --description "$(cat тело.md)"
```

The check pipeline does not start on a draft by default: a run's silence is not taken for a
green run, and the set is run on one's own machine or by a manual start.

Everything waiting for a pipeline run, a rework or an answer to a question goes as a draft. The
question is asked in the PR itself, not kept in the executor's head: a person reads the PR, not
the session's conversation.

The draft is lifted by a separate call, and that is the very turn in which the executor says the
solution is ready:

```bash
AZURE_DEVOPS_EXT_PAT="$TOKEN" az repos pr update --id 86 --draft false
```

Before the lifting the executor's silence means "not ready yet", after — "may be merged".
Lifting the draft and asking to merge go in one turn: a lifted draft nobody told the person
about waits for review just like one not lifted.

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

Four sections, and one order between them: the link line, what was done, what confirms it, the
remaining step. A section with nothing to say says so in words — an empty heading and a removed
heading read alike and mean different things.

```markdown
Закрывает рабочий элемент 86.

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
body — in the turn that lifts the draft:

```markdown
## Оставшийся шаг

Не осталось: прогон зелёный, черновик снят. Можно вливать.
```

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

## What is checked before the PR is published

The pipeline sees only what was sent, and it is sent by a push. Linters, unit tests and hook
scenarios are taken by the push gate — below is what it does not know.

1. **The main branch is merged into this branch** — `git fetch origin && git merge origin/main`.
   Everything checked below is checked from this base: a PR from a diverged branch shows the
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
10. **The PR is bound to the work item**, reviewer and assignee are set, and the body is
    assembled by the sample — the sections "What was done", "What confirms it" and "Remaining
    step". By this moment the remaining step section says no steps are left: the draft is
    lifted after the folder is taken apart, not before.
11. **The PR title carries the work item number and names the work done:** `[<номер>] <Что
сделано>`, with the same number as the work item and the branch name.
12. **The work queue matches** — `npm run check:board`.
13. **The PR state is read, not derived from return codes.**
14. **The set is taken from the pipeline file, not assembled from memory.** The push gate is
    narrower by design: it stands between the command and the push, and everything longer than
    seconds is taken out of it. What the pipeline runs is written in its file — that list is
    repeated locally; a green gate is not completeness of the set.
15. **The set is revised after merging the main branch in.** It is chosen by what the branch now
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
