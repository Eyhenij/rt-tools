---
name: git-workflow-commit
kind: pattern
rule: git-workflow
description: Pattern of rule git-workflow. Load for creating a task and a branch, commit and push — creating a task with a list label, moving across board lists, merging two tasks into one, working as the machine account, skipping the document requirement. Opening an MR — pattern git-workflow-pr.
---

# Branch, commit and MR

Pattern of the rule `git-workflow`. What must be true meanwhile — the law
`docs/constitution/delivery.md`.

## When to use

- A task is being created, and the edit starts from it.
- A branch is being created for a task.
- A commit or a push is being prepared.
- The work moved to the next step, and the task moves to another list of the board.

## First the task on the board, then the branch

Creation is four steps: the issue, the number in its title, the assignee, the label of the
board's first list. The board shows the issues whose label it knows — so the fourth step does not
happen by itself, and without it the task is created, but it is not in the work queue.

All four are done by one tree command, not by hand: splitting them means forgetting the last.

**A command that does not exist is not replaced by client calls in the pattern.** A tree that
takes the package for the first time gets the check files, but not the entries about them in its
manifest: the layout edits resources, and the consumer's manifest does not belong to it. Two ways
from here: create the command in the same turn, or repeat all its steps by name from the list
above. A bypass by client calls looks like execution up to the last step of the list: it is
forgotten first, because the previous ones have already given a visible result.

```bash
npm run task:new -- --title 'Письма владельцу не уходят молча' \
    --label bug --label area:api --slug mail-owner-silence < описание.md
```

The body is read from standard input, `--slug` is optional and goes only into the hint with the
branch name. Author and assignee — the machine account; the command reads the token itself, from
a file outside the repository.

The script under this command is created by the project — the package does not ship it. What it
does by `glab` calls:

```bash
glab issue create --title '[<КЛЮЧ>-<номер>] …' --label bug --label 'status::backlog' \
    --assignee <бот> --description-file -
glab issue update <номер> --title '[<КЛЮЧ>-<номер>] …'   # the number is known only after creation
```

The list label is set at creation, not after: an issue without it lies outside the board, and it
can be seen only by a search over the project.

Creation ends not with the command's output but with the work queue's answer. The command asks
it itself and prints what it read — presence on the board, the list, the assignee; absence ends
it with a non-zero code. That answer goes into the comment, the MR description and the plan, not
the printed number: the number says "the call went through", not "the task is visible to whoever
works on it".

Creations that go one after another are checked not by the last one but by an audit of the whole
queue: their miss is shared, and by one task it is invisible.

What to check the work queue with:

```bash
npm run check:board
```

It looks only at what is open: the list label, the number and the assignee of every open task,
and for every open MR — the number in the title, the `Closes` line, the open task behind it and
that there is no second MR with the same number. It does not judge the branch name: an open MR
cannot have it renamed.

## Two tasks fixed by one edit

If it turned out along the way that the edit closes the neighbouring task too — that is one task,
not two. They can be merged while the edit has not reached the main branch:

```bash
# what the absorbing task lacked is appended to its description
glab issue update <поглотившая> --description "$(cat тело.md)"
# the absorbed one is closed as a duplicate, with a link to the absorbing one
glab issue note <поглощённая> --message 'Дубликат #<поглотившая>: чинится той же правкой.'
glab issue close <поглощённая>
```

One closed as a duplicate leaves the work queue, and its number stays in the history — by this
GitLab differs from hosts where a task can be erased. The link to the absorbing one is mandatory:
without it the closed task reads as done, and it was not done.

After the branch is merged there is no absorbing: it went in, and it is reverted whole.

## The branch is created by a separate call

The main branch guard parses the command text and looks at the branch at launch, so a compound
command is rejected whole — the branch does not exist in it yet:

```bash
✗ git checkout -b <КЛЮЧ>-85-guest-token && git commit -m 'feat(admin): …'
✓ git checkout -b <КЛЮЧ>-85-guest-token <ветка эпика>
✓ git commit -F -
```

The name — `<КЛЮЧ>-<номер задачи>-<короткий-slug>`, the slug in lowercase Latin letters joined by
hyphens. The delivery guard parses it on the spot and refuses a miss in the form before the first
commit, and by the number it asks the board: the task must exist, be open, stand in the queue and
have an assignee.

A name without a number (`feat/…`, `fix/…`) is legitimate while the branch lives locally — for a
trial and an analysis. No MR opens from it: an edit that reaches the main branch starts with a
task.

## The task list moves together with the work

Branch created — the task is no longer in the first list but in progress. MR opened — it awaits
review. Both moves are done by one command, as a second call right after the one that caused it:

```bash
npm run task:move -- 86 in-progress   # right after git checkout -b <КЛЮЧ>-86-…
npm run task:move -- 86 in-review     # right after glab mr create
```

Board lists are labels, so the move must remove the previous one:

```bash
glab issue update 86 --label 'status::in-progress' --unlabel 'status::backlog'
```

A move that did not remove the previous label leaves the task in two lists at once, and the queue
reads wrong — in both places it looks real.

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

```
feat(site): availability calendar with season prices
fix(api): reject overlapping booking dates
chore(deploy): docker-compose for vps
```

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
- The list label was not set at creation: the task exists, and it is not on the board. The board
  shows only what carries a label it knows.
- A move across lists did not remove the previous label: the task stands in two lists at once.
- `glab` does not see the project: the token's scope is `read_api` instead of `api`. Editing
  commands then answer with success and do nothing.
- `git add` with several paths adds nothing if even one path does not exist: the command breaks
  off whole at the first miss. The next `git commit --amend` then carries into the commit
  everything left in the index. The commit contents are read by `git show --stat` right after it,
  not at MR review.
- The owner's edit takes neither the token nor the variables — they are only for machine work.
