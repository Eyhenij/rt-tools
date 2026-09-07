---
name: cargo-triage-mark
kind: pattern
rule: cargo-triage
description: A pattern of the rule cargo-triage. Take it when the arrived cargo is sorted out. The ready-made read and mark calls: take what is not sorted out, a dry run, a batch of records per call, the fix and the release version, sorting out a refused line.
---

# Reading the cargo and marking its records

A pattern of the rule `cargo-triage`. What must be true at that is the law
`docs/constitution/work-conduct.md`.

The calls below go by the launch line and are closed differently: the reading by a service
account's pair, the mark by the tree's token. Both the pair and the token lie outside the tree, and
without them the command refuses the call without going to the network.

## When to use

- The sorting out of the cargo begins, and what arrived has to be taken.
- The arrived cargo is being sorted out, and a decision on a record is made.
- The edit for a record is merged into the main branch.
- An edition that carried the fix to the consumer is published.
- The mark call returned a refused line.

## What is read before the call

The list of what is not sorted out is taken by the read command, filtered by the state "new" and in
arrival order. While the list is not narrowed, what is sorted out and what is untouched stand mixed
together, and the sorting out goes round a second time.

```bash
npm run cargo:pull -- --kind proposal --state new
npm run cargo:pull -- --kind postmortem --state new --tree <tree sign>
```

A list row carries the mark key, what the record is named, whose tree it is, the state and the
beginning of the text. The key is taken from here and substituted into the mark as it is: computed
from one's own disk, it finds only what still lies there.

The whole texts are printed by `--text` — they are read before the decision; `--brief` does not
read the texts to the end and is good only for an overview: without the text a proposal has no key
either.

The command name, the intake address, the place of the pair and the words of the states are each
tree's own — they are named in the rule's `implementation.md`. Below they stand as the package
calls them.

## Taking into work: the task and the mark in one turn

The task comes first — otherwise the mark says the record was taken and stays silent about where
the work goes:

```bash
npm run task:new -- --title '<what is wrong>' --slug <short-name> --label bug < body.md
```

The mark follows, in the same turn, and carries every record this task closes:

```bash
npm run cargo:mark -- --state in_work \
    --postmortem 2026-08-14-structure-invented-beside-the-sample.md \
    --postmortem 2026-08-15-guard-denied-shell-wrote-anyway.md \
    --proposal <proposal sign>
```

The kind of record is named by its own argument: an incident analysis by the file name, a proposal
by the text's sign. Records of both kinds travel in one call.

A dry run shows what would have travelled — it sends nothing and leaves no trace outward:

```bash
npm run cargo:mark -- --state in_work --postmortem <file> --dry-run
```

A dry run instead of a real call leaves the record in its former state. It does not count as a
mark.

## The fix: the move together with the answer to "what by"

It is set after the edit is merged into the main branch — not on an open request:

```bash
npm run cargo:mark -- --state fixed \
    --postmortem <file> \
    --fix 'an article of the rule about sorting out the cargo and a pattern with ready-made calls'
```

The text answers "what by", not "where": a rule's article, a guard, a check, a code edit. Without
it the line is refused — the receiver does not accept a move to the fixed state without an answer
to "what by".

It is set by the work state `влито` — where the merge has already happened while the turn about the
task is still going; the ready-made call stands in the pattern `task-flow-archive`. A lagging mark
is found by `npm run cargo:fixed`: it reads what was taken into work and names those whose work is
over — the article's heading stands in the sources, or the full key is named in the description of
the past. The key is substituted in full: the mark command does not accept eight characters.

## The release: the version is named by whoever publishes

It goes by the same motion as the publication of the edition:

```bash
npm run cargo:mark -- --state released --postmortem <file> --release '0.10.1'
```

The version is the one the release that carried the fix was named by. Not the receiver's edition
number and not the time of the rollout.

It is named by one number: the column already knows the package name — it stands next to the record
itself — and appended a second time it drifts in form. Two forms of one release,
`rt-agent-kit@0.17.0` and `@rt-tools/agent-kit 0.17.0`, stood in the intake next to each other, and
not one filter by version can be assembled over them. The intake does not judge this: it holds the
version's length and leaves the form to the tree.

## A foreign record: the edition's publisher closes it

A foreign record does not move by one's own token at all: the intake takes the tree from the token
and answers about it as it would about one not found. A neighbour's records whose edit entered an
edition of the package are closed by another command — under a person's sign-in, by the same
service account pair the cargo is read by:

```bash
npm run cargo:close -- --state fixed --proposal <sign in the intake> --fix 'by an article of the rule'
npm run cargo:close -- --state released --proposal <sign in the intake> --release '0.17.0'
```

A record's sign in the intake is not the mark key: by the latter a tree moves its own record, by the
former the publisher closes a foreign one. It is printed by the cargo read — as the line
`in the intake <sign>` next to the record.

Closing sets only `fixed` and `released` and only forward: `in_work` means work taken by a tree, and
the tree sets it.

## The answer is read

The call answers with three numbers and a list:

```
marked: moved 2, already stood 1, refused 1
  proposal <key> — the tree has no such record
```

- **Moved 0, already stood N** — this sorting out moved nothing: either the records were marked
  earlier or the keys were named wrongly.
- **Refused N** — these records stayed where they were. The reason is named next to the line, and a
  repeat of the same call is refused exactly the same way.

The reasons for a refusal and what to do with each:

| What is said                     | What it means                                          | What to do                                |
| -------------------------------- | ------------------------------------------------------ | ----------------------------------------- |
| the tree has no such record      | the key is named wrongly, or the record came elsewhere | match the key against the admin panel list |
| the move is not allowed          | a step over a state, or a move backwards               | pass the state that was skipped            |
| a move without text              | a fix without an answer to "what by"                   | add the argument with the fix text         |
| the text is not for that step    | the text arrived with a move that is not a fix         | remove the argument or change the state    |
| a move without a version         | a release without an answer to "where to look for the fix" | add the argument with the release version |
| the version is not for that step | the version arrived with a move that is not a release  | remove the argument or change the state    |

## Pitfalls

- **A call without a token is refused without the network.** The token lies outside the tree, and
  on a fresh working copy it is not there: the command says so outright rather than staying silent.
- **One's own tree is named by the sign from the token, not by an argument.** The intake matches it
  itself, and a call cannot name itself a foreign tree.
- **Records marked in one branch look unmarked in a neighbouring one only in the files.** The state
  lies in the intake rather than in the tree: it is looked at in the admin panel, not in a working
  copy.
- **A repeated mark with the same state does not count as a miss.** The working order is repeated,
  and a second identical mark is refused by the answer "already stood" rather than by a refusal.
