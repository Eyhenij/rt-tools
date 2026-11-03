# What the push gate counts as a push

**Status:** in force · **Revision:** 2026-11-03 · **Scenario prefix:** `SC-AK`
**Depends on:** `delivery-gate`
**Laws:** `delivery`
**Procedures:** none

## Why

The push gate guard runs the whole gate set before a push, and the set takes minutes. Which call is
a push therefore decides two things at once: a call taken for a push waits for the set for nothing,
and a push not taken for one leaves unchecked. Three intake records named both misses in one guard.
A read of pipeline runs filtered by the event `push` waited more than ten minutes. A push of all
branches and a push typed into the session terminal tab went through with no set at all.

The subdomain stands apart from the delivery gate because the delivery gate texts are at the length
limit.

## Terminology

| Word        | What it means here                                                                    |
| ----------- | ------------------------------------------------------------------------------------- |
| a push call | a `git` call whose subcommand is `push`, from the separator before it to the next one |
| a recipient | a ref after the remote in a push call, or the keys `--all` and `--mirror`             |

### What it is called in the interface

There is no interface: the guard is visible only to the executor — as the text of a refusal in their
own turn.

## Rules

- **A push is the subcommand `push` of the same `git` call.** It is looked for after `git` and its
  keys, up to the nearest command separator. The word in another command of the line, in a filter
  or in quotes is no push: a read of pipeline runs filtered by the event `push` ran the whole set
  for more than ten minutes and then refused a command that sends nothing.
- **The command is parsed as the shell reads it, not by patterns over the line.** A separator
  inside quotes does not cut a call: `-c 'h: a; b'` hid the push behind it. Quoted text is data,
  except where the shell runs it — `$( )`, backticks, the string of `bash -c`, the words of `eval`.
  A push after `{`, `if` or `while` is a push. The body of a heredoc with a quoted delimiter is
  data; with a bare delimiter its `$( )` and backticks run, and they are parsed. A heredoc given to
  a shell runs whole and is parsed whole, and so does a here-string `<<<` and a shell reading
  `/dev/stdin`. A heredoc inside `$( )`, a line continuation, `$'…'`, arithmetic `(( ))` and a `}`
  without `;` before it, which zsh accepts, are read the way the shell reads them: an apostrophe in
  a commit message hid the push after it.
- **A command the parse cannot read is refused when its text names a push.** A shell reading its
  commands from a pipe, `source` of a substitution, function calls that grow without bound: what
  they run is seen only when they run, and a silent pass would let the push leave unchecked.
- **A wrapper is passed together with its keys and their values.** `time -p`, `timeout -s KILL`,
  `sudo -u`: a key value taken for the command name hid the push behind it. The string of `env -S`
  is parsed as a command. The zsh precommand modifiers `noglob`, `nocorrect`, `-` and `=git` stand
  before the command the same way.
- **A function body is judged at the call, not at the definition.** A definition sends nothing,
  and the former sign refused it as a push; a call of the function is judged as the push in its
  body, with the call words put in place of `$@` and `$1`. A function named `git` does not hide the
  git call.
- **A branch switch is found by the same parse as the push.** A pattern over the line did not see
  `git checkout` inside `bash -c` or `eval`, and the set ran on the former branch. A new branch
  from another start point and `gh pr checkout` are a switch; files restored after `--`, a new
  branch from the current tip and a switch after the push are not. The start point is the first
  word after the new name: a name glued to the key (`-bnew`) is its value, `-` is the previous
  branch, `HEAD` and `@` are the current tip, and a `--` after the start point does not cancel it.
- **Several recipients in one push are several pushes.** `--all`, `--mirror`, `--branches`, a ref
  with `*` and two refs after the remote send several branches, while the set judges only the
  current one. A ref with a brace expansion is several refs. A word in quotes or a `$( )` is one ref;
  a ref that starts with `:` deletes and is not counted. With `--repo` every word after the keys counts as a ref: git takes the first of them for
  the remote, and the sign errs towards a needless refusal rather than an unseen push.
- **A push in the body or the condition of a loop is several pushes; a push after it is one.** The
  loop runs from `for`, `while` or `until` to its `done`. A push inside `if` or after `done` is one
  push: the former sign took `then` and everything after a loop for a loop. The zsh loops
  `foreach … end` and `repeat` are loops too. `xargs`, `parallel`, `find -exec` and `watch` run
  their command more than once, and a push under them is a push in a loop.
- **A dry run of one call does not cover a real push next to it.** `--dry-run` and `-n` free only the
  call they stand in.
- **A push typed into the session terminal tab is judged like a shell call.** The tab tool puts the
  command into the same field. Left out of the guard's list, it carried a push past the gate after
  two refusals.

## What is out of scope

- **A deletion push.** `--delete` and a recipient that starts with a colon send no branch, and the
  recipients of such a call are not counted. Whether it is refused as a push into a merged branch
  is the subdomain `delivery-merged`.
- **The gate set itself.** What runs before a push and how a red line is named is the subdomain
  `delivery-gate`.
- **A push the text does not show.** A git alias for `push`, a word glued from parts (`pu""sh`), a
  script file that pushes, a variable run as a command. The parse reads the command text, and these
  are visible only when the command runs: a pre-push git hook holds them, task RT-3046.
- **A shell without perl.** The parse goes by perl, and without it the guard passes, as it does on
  any breakage of its own. The case stands in the `FAIL-OPEN` line of the guard header and has a
  test of its own; it is not in `Requires`, because that line names package resources, and perl
  is none.
- **A wrapper the list does not name.** The list holds the wrappers this tree calls; a command
  under another one is not judged until the wrapper is added.
- **What the parse counts too strictly.** `shift` inside a function body is not followed, and a ref
  with braces in quotes counts as several refs: both give a refusal the push did not need, and the
  push is split into separate calls.
- **A command without `git` in its text that a shell reads from its input.** It is not refused as
  unreadable: without the word the parse has no sign of a push at all.

## Contract

The subdomain has no procedures and no interface: it is the parse of a command inside the push gate
guard. Its surface is the tool list in the guard header and the command text of the call.

### Refusal codes

Not applicable: the guard answers with a refusal decision and a text, not with named codes.

## Data

Its own storage there is none: the parse reads the command text of one call.

## Screens and states

The subdomain has no screen: what it says is seen in the refusal text of the guard.

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

- **The parse is written in perl inside the guard, not by patterns of grep and sed.** The first
  version by patterns was green on 52 cases and, at review, let through seven push forms and
  refused five lawful pushes. Quotes, nested substitutions and loop boundaries need a reader of
  words, and perl stands on every machine git does. Rejected: node — the guard runs before any
  package is built.
- **A loop is counted by its keywords, not by the position of `do`.** A loop over several lines and
  a push after `done` both read right only when `for`, `while`, `until` and `done` are counted.

## Open questions

None open.

## History of changes

- 3 November 2026 — the subdomain is created by task RT-3044 from three intake records. After the
  owner's review of PR #3083 the parse by patterns is replaced by a parse of shell words. After the
  second review the parse learns wrapper keys with values, a heredoc with a bare delimiter,
  function definitions, `--repo` and the branch switch; after the executor's own review it reads a
  heredoc inside `$( )`, line continuations, `$'…'`, call words of a function and a shell given its
  commands on the input.

## Scenarios

The scenarios lie in `scenarios.md` next to it.
