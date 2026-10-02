# The guard of the commit hooks against a skip

**Status:** in force · **Revision:** 2026-10-01 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `delivery`
**Procedures:** none

## Why

An amend that fixed a one-letter typo in a commit subject was made with the key that skips the
commit hooks. The push gate does not read commit messages, so the message no hook had seen
reached the host. Nothing judged the call: the delivery guards read the branch, the base and the
signature, and the git hooks themselves are exactly what the key switches off.

The subdomain names which calls skip the commit hooks and how such a call is refused.

## Terminology

- **A skip of the hooks** — on `git commit` or `git push`: the key `--no-verify` or its
  abbreviation down to `--no-veri`; `-n` on `git commit`, alone or in a cluster of short keys; the
  setting `-c core.hooksPath=<path>` between `git` and the verb; the assignment `HUSKY=0` in front
  of the call.
- **The command position** — the word after `git` and its own keys; a word inside quotes or the
  value of a key that takes one is not a key.

### What it is called in the interface

There is no interface: the guard is visible only to the executor — as the text of a refusal in
their own turn.

## Rules

- **A commit or a push that skips the hooks is refused, and the refusal names the form of the
  skip.** The commit hooks check the message, the formatting and the document pair, and the push
  gate reads none of the messages.
- **There is no lawful bypass.** The owner forbade skipping the checks for any edit; a refused
  call is repeated without the skip, and a hook refusal is fixed by what it names.
- **The skip is read in the command position, and a nested call of the environment is
  unwrapped.** A key between `git` and the verb does not hide the call; a message or a history
  search naming the key does not trigger it.
- **`-n` is a skip on `git commit` only.** On `git push` it is a dry run, which sends nothing.

## What is out of scope

- `git am`, `git merge` and `git rebase` with the same key: the record that started the
  subdomain names only a commit and a push.
- A hook switched off by a change of the repository settings outside the command: the guard reads
  one command, not the configuration.

## Contract

The surface is a guard called on the event of a command. The refusal arrives as the decision
`deny` with the text of the reason; silence means the command is allowed.

### Refusal codes

Not applicable: the guard answers with a decision and the text of a reason, not with a code.

## Data

There is no data of its own: the guard reads the command text alone.

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

- **A line of the command ends a call the same way a separator does.** A verb carried over to the
  next line would read the body of a document under a heredoc as keys of the call above it.
- **The guard does not look at the working tree.** A skip is wrong on a clean tree as much as on a
  dirty one: what it skips is the check of the commit, not of the files.

## Open questions

None.

## History of changes

- 2026-10-01 — the subdomain was created together with the guard, from the incident analysis of
  an amend made past the hooks.
