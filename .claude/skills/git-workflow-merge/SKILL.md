---
name: git-workflow-merge
kind: pattern
rule: git-workflow
description: Pattern of rule git-workflow. Load when the base of a branch is merged into it and a conflict is resolved — the merge order, handling by file kind, checking what was appended against the work queue, re-reading the body of the open request. Branch and commit — pattern git-workflow-commit.
---
<!-- rt-kit v0.41.0 · patterns/git-workflow-merge.md · 854b4b0e9a46 · правится надстройкой, не здесь -->

# Merging the base of a branch into it

Pattern of the rule `git-workflow`. What must be true — the law
`docs/constitution/delivery.md`.

**The calls here are given with the GitHub client.** A tree on another host reads them as the
form and takes the command from its own client: field and subcommand names differ between
clients, and what is asked is one. The match is named by the edition of the delivery rule laid
out in that tree. Cold part: `pitfalls.md` — every section below whole, with its code and reasons.

## When to use

- The PR is marked conflicting, and it must be brought back to a mergeable state.

## Order

The merge of the base takes the conflict markers off the guards in the same call: a guard with markers
refuses every later call.

```bash
GIT_AUTHOR_NAME="<бот>" GIT_AUTHOR_EMAIL="<номер>+<бот>@users.noreply.github.com" \
GIT_COMMITTER_NAME="<бот>" GIT_COMMITTER_EMAIL="<номер>+<бот>@users.noreply.github.com" \
    git merge --no-edit origin/<база> || {
    git diff --name-only --diff-filter=U -- .claude/hooks | while IFS= read -r f; do git checkout --ours -- "$f"; done
    false
}
```

The block is run on a clean tree, and its code stays non-zero while a conflict is left. Only the guards
in conflict are touched: `git merge … || git checkout --ours -- .claude/hooks` gives the whole directory
back, with an edit nobody committed, and answers zero. A tree that keeps its guards in history adds the
line `.claude/hooks/*.sh -merge` to `.gitattributes`: git then writes no markers into them at all, the
dispatcher of the guards included — with markers in it every call is refused, and only the owner's
terminal helps.

`--ours` gives every hook in conflict this side's text: a laid-out one is put back by the layout, and a
hook the tree wrote itself loses the base's edit. What the base changed is read by
`git diff HEAD...MERGE_HEAD -- .claude/hooks` and applied to the tree's own hooks before the merge
commit. A guard already broken names the same way out, and it passes.

## A commit is carried over by a cherry-pick

The branch the commit was meant to leave with is gone: merged, removed by the host or created under the wrong task.

## What the branch appended is seen only from the divergence point

## What the branch appended is checked against the work queue, not carried over by default

## Checks after the resolution

## The body of the open PR is reread after the merge

The PR described the tree on the day it was written.

## The task of a merged PR is asked, not assumed closed

The host closes the task by the `Closes` line only when the base is the default branch.

## A green run ages together with the base

A run speaks about the base it went on.

## Other people's task folders arrive with the main branch

## Common misses

- **A merge carries edits of files, not edits of an application.**
