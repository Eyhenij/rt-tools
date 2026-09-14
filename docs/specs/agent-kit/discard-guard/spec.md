# The guard of the working tree against discarding commands

**Status:** in force · **Revision:** 2026-09-14 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `delivery`
**Procedures:** none

## Why

`git reset --hard` erased the uncommitted edits of a neighbouring session in seven files, and
there was nothing to restore them from: git keeps no object of an uncommitted edit. The command
was taken to drop a commit — a job `--soft` does without touching the working tree. No guard
judged the call: the delivery guards read the branch, the base and the signature, and the
working tree is invisible to them.

The subdomain names which git commands discard edits, when such a call is refused and how it is
lawfully let through.

## Terminology

- **A discarding command** — `git reset --hard`, `git checkout -- <path>` (also `git checkout .`),
  `git restore <path>` without `--staged`, `git clean -f`.
- **A dirty tree** — a non-empty `git status --porcelain` in the directory the command runs in:
  changed tracked files for the first three, untracked files for `clean`.
- **The discard mark** — the comment `# discard: <reason>` in the same command.

### What it is called in the interface

There is no interface: the guard is visible only to the executor — as the text of a refusal in
their own turn.

## Rules

- **A discarding command on a dirty tree is refused, and the refusal names the files.** The
  files may be a neighbour's: two sessions work in one copy, and the erased edit has no owner
  written on it.
- **A clean tree lets the command through.** There is nothing to lose, and a refusal there is
  noise.
- **`clean` is judged by the untracked files, the other three by the changed tracked ones.** Each
  command loses its own part of the tree; judging all by one list refuses `reset --hard` on a tree
  it does not touch.
- **The lawful bypass is the discard mark with a non-empty reason.** The files thrown away are
  named by whoever throws them away; an empty reason is no bypass.
- **The verb is looked for in the command position, and a nested call of the environment is
  unwrapped.** The same parsing as the main-branch guard: a key between `git` and the verb does not
  hide the call, a word in a history search does not trigger it.

## What is out of scope

- `git stash drop`, `git branch -D` and the rewriting of history: the record that started the
  subdomain does not name them.
- Restoring what was erased: git holds no object of it.

## Contract

The surface is a guard called on the event of a command. The refusal arrives as the decision
`deny` with the text of the reason; silence means the command is allowed.

### Refusal codes

Not applicable: the guard answers with a decision and the text of a reason, not with a code.

## Data

There is no data of its own: the tree is read by `git status --porcelain` at the call.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The text of the refusal is in the language of the rules layer.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable: the guard judges one command of one turn.

## Decisions

- **The tree is read where the command runs, not at the project root.** A separate working copy
  has a tree of its own, and the root would answer for the wrong one.
- **The bypass is a comment in the command, like the task-folder bypass.** A flag would break the
  git call itself; a comment travels with it and is read by the guard alone.

## Open questions

None.

## History of changes

- 2026-09-14 — the subdomain was created together with the guard, from the intake record about
  a neighbour's edits erased by `reset --hard`.
