---
description: Closing the session — the main branch pulled, merged branches removed, the handover written
argument-hint: '[empty | <what to add to the handover in your own words>]'
---
<!-- rt-kit v0.29.0 · commands/next-session.md · 6ea1e6d3fe83 · правится надстройкой, не здесь -->

Close the session: bring the tree to the main branch, remove the merged branches and write the
handover for the next session. The owner's addition to the handover: `$ARGUMENTS`

Called as **the last action of the session** — after the work is committed and the PR is open or
merged. The command merges nothing, pushes nothing and opens nothing: closing a session is
cleanup, not delivery.

## 1. Read the tree profile

The main branch name, the task folders directory and the handover directory differ from tree to
tree:

```bash
for profile in .claude/rt-kit/defaults/project.sh .claude/rt-kit/project.sh; do
    [ -f "$profile" ] && . "$profile"
done
printf 'главная: %s · задачи: %s · передача: %s\n' \
    "${RT_MAIN_BRANCH:-main}" "${RT_TASKS_DIR:-docs/tasks}" "${RT_HANDOFF_DIR:-.claude/handoff}"
```

Hard-coding these names into the command is not allowed: in the first tree that calls the main
branch differently, the cleanup goes to the wrong place.

## 2. Stop if the tree holds uncommitted changes

```bash
git status --short
```

Non-empty output ends the command. Name the files to the owner and touch neither the branches
nor main: a branch switch carries the edit along or is refused halfway, and the owner decides
what to do with it.

An untracked file is uncommitted too. Say it in a separate line: it may be left from work that
was abandoned.

## 3. Find out whether the work goes by the rule

```bash
git fetch --prune --quiet
branch="$(git branch --show-current)"
```

The work goes **by the rule** if the branch name carries the task number — that is
`rt_task_branch_ok` from the profile — or if the task folders directory holds a folder named after
the branch. The PR is **merged** when the branch commits are already in the remote main:

```bash
git merge-base --is-ancestor HEAD "origin/${RT_MAIN_BRANCH:-main}" && echo влит || echo 'не влит'
```

## 4. Bring the tree to the main branch

- **Work by the rule and the PR is merged** — the task is closed, the branch is no longer
  needed. The local main moves up to the remote one without switching to it:

    ```bash
    git fetch origin "${RT_MAIN_BRANCH:-main}:${RT_MAIN_BRANCH:-main}"
    ```

    The working tree is not touched at all, so the step runs even when uncommitted changes lie
    in it — and they lie there by the word of this very command, which a step earlier told not
    to touch them. Switching to main is needed only to work there; the cleanup does not need
    it, and `git pull` on the task branch pulls something other than main and answers
    "no such ref was fetched": by this minute the branch has already been removed from the
    remote by the merge of the PR.

- **Everything else** — the work is not over, and the branch stays the place where it goes on:

    ```bash
    git merge "origin/${RT_MAIN_BRANCH:-main}"
    ```

    A conflict is resolved now, not at the start of the next session: name it to the owner and
    stop the command until it is decided.

## 5. Remove the branches

Only those merged into main are removed: their commits are in it, and there is nothing to
restore.

```bash
git branch --merged "origin/${RT_MAIN_BRANCH:-main}" \
    | grep -vE "^\*|^\s*${RT_MAIN_BRANCH:-main}$" \
    | xargs -r git branch -d
```

Being merged is judged from the remote ref, not from the local main: the local one lags
silently, and a merged branch counts as unmerged against it. Three branches so appeared to carry
two commits past main each, while past the remote they had zero — the session would have ended
with a list of unmerged work that does not exist.

**Do not delete** an unmerged branch. Name it to the owner together with the number of commits
missing from main — by them it is visible what exactly is lost if it is deleted:

```bash
for b in $(git branch --no-merged "origin/${RT_MAIN_BRANCH:-main}" --format='%(refname:short)'); do
    printf '%s: %s коммитов мимо главной\n' "$b" "$(git rev-list --count "origin/${RT_MAIN_BRANCH:-main}..$b")"
done
```

Dead refs to remote branches were removed by `git fetch --prune` in step 3.

## 6. Write the handover

What stands in it and in which form — pattern `task-flow-handoff`; here only the place and the
order. One file per branch, and it lies outside the tree history:

```bash
mkdir -p "${RT_HANDOFF_DIR:-.claude/handoff}"
# the file — ${RT_HANDOFF_DIR:-.claude/handoff}/<branch>.md
```

The name is taken from the branch the work went on — not from the one the command switched to in
step 4.

To what the pattern demands, this command adds its own: what it removed — the removed branches,
the state of main, what stayed unmerged. The next session starts exactly from this.

A session that ended in nothing writes a handover too: "we tried so — it did not work, because"
is worth more than an empty file. Insert the owner's addition from `$ARGUMENTS` as a section of
its own, without retelling.

## 7. Hand over the result

The last line — the path to the handover: the owner pastes it into a new session with one paste.
Before it: what became of the main branch, which branches were removed, which stayed unmerged.
Do not retell the handover content — the owner will read it anyway.

## What the command does not do

- does not merge the PR and does not push: that is delivery, and it is not done blind;
- does not delete an unmerged branch and does not touch the task folder;
- does not commit the handover — it lies outside the tree on purpose, otherwise a second record
  of the same thing is started next to the progress.
