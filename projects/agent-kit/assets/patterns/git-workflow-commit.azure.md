---
name: git-workflow-commit
kind: pattern
rule: git-workflow
description: Pattern of rule git-workflow. Load for creating a work item and a branch, commit and push — an item with area and iteration, state transition, merging two tasks into one, working as the machine account, skipping the document requirement. Opening a PR — pattern git-workflow-pr.
---

# Task, branch and commit

Pattern of the rule `git-workflow`. What must be true meanwhile — the law
`docs/constitution/delivery.md`.

## When to use

- A work item is being created, and the edit starts from it.
- A branch is being created for it.
- A commit or a push is being prepared.
- The work moved to the next step, and the item moves to another state.

## First the work item, then the branch

Creation is four steps: the item, the number in its title, the assignee, the state `New`. Area and
iteration are set right there: an item without them lies in the project root and does not reach
the team board — created, but not in the work queue.

All four are done by one tree command, not by hand: splitting them means forgetting the last.

**A command that does not exist is not replaced by client calls in the pattern.** A tree that
takes the package for the first time gets the check files, but not the entries about them in its
manifest: the layout edits resources, and the consumer's manifest does not belong to it. Two ways
from here: create the command in the same turn, or repeat all its steps by name from the list
above. A bypass by client calls looks like execution up to the last step of the list: it is
forgotten first, because the previous ones have already given a visible result.

```bash
npm run task:new -- --title 'Письма владельцу не уходят молча' \
    --type Bug --area '<проект>\<команда>' --slug mail-owner-silence < описание.md
```

The script under this command is created by the project — the package does not ship it. What it
does by `az` calls:

```bash
az boards work-item create --type Bug --title '[<номер>] …' \
    --org https://dev.azure.com/<организация> --project <проект> \
    --assigned-to <бот> --area '<проект>\<команда>' --iteration '<проект>\<итерация>'
az boards work-item update --id <номер> --title '[<номер>] …'   # the number is known after creation
```

The number is not written into the title by hand — it is known only after creation, and the
command appends it itself.

Creation ends not with the command's output but with the work queue's answer. The command asks
it itself and prints what it read — presence on the board, the state, the assignee; absence ends
it with a non-zero code. That answer goes into the comment, the PR body and the plan, not the
printed number: the number says "the call went through", not "the work is visible to whoever
comes for it".

Creations that go one after another are checked not by the last one but by an audit of the whole
queue: their miss is shared, and by one item it is invisible.

What to check the work queue with:

```bash
npm run check:board
```

It looks only at what is open: the state, the area and the assignee of every open item, and for
every open PR — the number in the title, the attached item and that there is no second PR with
the same number. It does not judge the branch name: an open PR cannot have it renamed.

## Two tasks fixed by one edit

If it turned out along the way that the edit closes the neighbouring item too — that is one task,
not two. They can be merged while the edit has not reached the main branch:

```bash
# what the absorbing item lacked is appended to its description
az boards work-item update --id <поглотивший> --description "$(cat тело.md)"
# the absorbed one is linked to it as a duplicate and closed
az boards work-item relation add --id <поглощённый> --relation-type duplicate-of \
    --target-id <поглотивший>
az boards work-item update --id <поглощённый> --state 'Removed'
```

The link is set before closing: an item closed without it reads as done, and it was not done. The
state of a removed item depends on the project process — `Removed` exists in Agile and Scrum, and
Basic does not have it; which one is here, `implementation.md` says.

After the branch is merged there is no absorbing: it went in, and it is reverted whole.

## The branch is created by a separate call

The main branch guard parses the command text and looks at the branch at launch, so a compound
command is rejected whole — the branch does not exist in it yet:

```bash
✗ git checkout -b 85-guest-token && git commit -m 'feat(admin): …'
✓ git checkout -b 85-guest-token
✓ git commit -F -
```

The name carries the item number, the slug in lowercase Latin letters joined by hyphens; the exact
form — in `implementation.md`. The delivery guard parses it on the spot and refuses a miss before
the first commit, and by the number it asks the board: the item must exist, be open and have an
assignee.

A name without a number (`feat/…`, `fix/…`) is legitimate while the branch lives locally — for a
trial and an analysis. No PR opens from it: an edit that reaches the main branch starts with a
task.

## The item state moves together with the work

Branch created — the item is no longer `New` but `Active`. PR opened — it awaits review. Both
moves are done by one command, as a second call right after the one that caused it:

```bash
npm run task:move -- 86 in-progress   # right after git checkout -b 86-…
npm run task:move -- 86 in-review     # right after az repos pr create
```

Under it — an edit of the state field:

```bash
az boards work-item update --id 86 --state 'Active'
```

State names are taken from the project process, not assigned by the rule: Agile, Scrum and Basic
call the same three steps differently, and a move to a state the process does not have answers
with a refusal on every task in a row.

The move is not put off for later: the work queue is read between steps, not after them.

## The commit is signed by the machine account

The token is read into a variable and not printed; author and committer are set by variables of
the same command. `git config` will not do — the config is shared with the main tree and would
rewrite the signature to the owner:

```bash
TOKEN=$(tr -d '\n' < ~/.config/<дерево>-bot-token)

GIT_AUTHOR_NAME="<бот>" GIT_AUTHOR_EMAIL="<почта бота>" \
GIT_COMMITTER_NAME="<бот>" GIT_COMMITTER_EMAIL="<почта бота>" \
    git commit -F -
```

The subject — `type(scope): description`. Types: `feat`, `fix`, `refactor`, `docs`, `style`,
`test`, `chore`, `perf`. Scopes are the tree's own, listed in `implementation.md`. A full stop
at the end of the subject is not accepted.

The line `AB#<номер>` in the commit body attaches it to the work item. It does not replace the
attachment of the PR itself: the commit is linked to the item, and the work queue reads the PR's
link.

## The document goes in the same commit

`docs-guard` demands the pair and names it itself. The bypass — a line in the body, the reason
is mandatory:

```
Docs-skip: правка только в тестах хука, зеркала у него нет
```

## Common misses

- **An audit right after adding answers "no" when the card already stands.** The work queue gives
  out a new item not in the same second it was created, and the last step reads it by the next
  call. The answer to this is to reread the whole queue, not to create the card a second time: two
  records about one task are removed only by an administrator. The creation command itself needs
  an edit here: the state is read right after the mutation, without a retry, and a false refusal
  here costs more than a delay.
- Area and iteration are not set: the item is created, but it did not reach the team board.
- The state is not taken from the project process: the move answers with a refusal on every task,
  and this reads as a broken command, not as a wrong state name.
- `git add` with several paths adds nothing if even one path does not exist: the command breaks
  off whole at the first miss. The next `git commit --amend` then carries into the commit
  everything left in the index. The commit contents are read by `git show --stat` right after it,
  not at PR review.
- The owner's edit takes neither the token nor the variables — they are only for machine work.
