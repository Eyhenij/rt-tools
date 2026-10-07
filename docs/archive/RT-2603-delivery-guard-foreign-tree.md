# Grill

Task RT-2603 · the request — the PR into main ·

## The owner request

> Поправь охранник дерева

The answer to a menu after the delivery guard of a consumer tree refused a request into this
repository: the command moved here by a path with a tilde.

## What the tree already has

- The helper `git-guard-delivery-tree.sh` takes the tree of execution from `cd <path>` at the start
  of the command and checks it with `[ -d ]`. A path with `~` names no directory, and the command
  counts as running in the tree of the session.
- With the tree recognised, the branch, the task and the base are judged by that tree. The title
  form stays the session's: `title_re` is read from the session profile only.

## Decisions

- **The helper expands `~` and `$HOME` at the start of the path.** The shell does it before `cd`;
  the guard reads the text unexpanded. Rejected: asking the shell to expand the path — that runs a
  piece of foreign command text.
- **The title form is read from the profile of the tree of execution.** The helper sources that
  profile in a subshell with the variable unset, the same way it already asks the task. Without a
  profile the session form stays.

## What is left unclear

- None.
