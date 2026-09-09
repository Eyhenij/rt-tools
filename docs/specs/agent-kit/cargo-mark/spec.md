# The state mark of a cargo record

**Status:** in force · **Revision:** 2026-08-24 · **Scenario prefix:** `SC-AK`
**Depends on:** `message-bus` (where the mark goes)
**Laws:** `work-conduct`, `verifiability`
**Procedures:** none

## Why

The cargo that arrived in the intake is sorted out by whoever works on it, and the state of a record
is the only thing that sorting out survives. The subdomain names what the state is moved by, what
the command refuses before the network and how its answer is read.

Sending the cargo is a neighbouring subdomain: the subject there is different — there the cargo
leaves, here the state of what has already arrived is moved.

## Terminology

- **A cargo record** — an incident analysis or a proposal lying in the intake.
- **A mark** — a call of the tree's command that moves the named records into one state.
- **The fix acceptance** — the text about what the miss was fixed by; it travels together with the
  move into "done".
- **The release version** — the line the tree named the edition by; it travels with the move into
  "released".

### What it is called in the interface

The list of records and their states is shown by the admin panel of the intake; the mark has no
interface — the executor sees it as lines of the answer.

## Rules

- **The mark is set by a command of the package, not by a request made by hand.** The address of the
  intake and the token of the tree lie in the package setting, and a second holder of them would
  split one tree between two places.
- **One mark carries one state and any number of records.** Sorting out the cargo ends with a batch
  of records going to one and the same step; different states are different calls.
- **Records of both kinds leave by one request.** The command gathers them into one packet: the
  intake edits both incident analyses and proposals.
- **The launch-line command carries the fix text as an argument.** The tree calls the edit by one
  command, and the fix acceptance does not force it to assemble the request body by hand.
- **The launch-line command carries the release version as an argument.** The tree calls the edit by
  one command, and the release mark does not force it to assemble the request body by hand. The
  argument is named by the release, not by the version: `--version` on a launch-line command reads
  as "show your version".
- **The launch-line command carries the reason of the quarantine as an argument.** The tree calls
  the edit by one command, and a move into the quarantine does not force it to assemble the request
  body by hand.
- **The records are named by the same keys they arrived by.** An incident analysis by the name of
  its file, a proposal by the sign of its text.
- **The sign of a proposal is counted the same way as at the intake.** Having diverged, the sides
  would find not a single record.
- **The sign of the tree is counted by one technique on the send and on the mark.** Two copies of the
  count diverge silently: the copy of one's own took the last word of the address, and the send took
  the address whole and in lower case, and the tree sent the cargo under one sign and marked under
  another. The intake answered that with a refusal about a foreign tree, and not one record was ever
  marked — while both sides looked as if they were working.
- **An unknown state is refused before the network.** The set of states is closed, and a typo costs a
  refusal here, not a refusal of the intake after the request.
- **A call without records is refused and names what is missing.** A mark with nothing to mark is a
  miss of the caller, not empty work.
- **Without the token of the tree the command goes to no network.** It names what the tree is created
  by: a request without a token would end with a refusal of the intake anyway.
- **A dry run prints what would leave and goes to no network.** By the same technique as sending the
  cargo: before the first mark it is visible what exactly will leave.
- **The records the intake refused are printed by name, with a reason.** A number by itself does not
  say which record the executor named wrongly.
- **A mark that moved nothing ends with a non-zero code.** Zero reads as work done, and a silent zero
  on a refused packet would leave the sorting out unmarked.
- **Neither the token of the tree nor the text of a record reaches the output.** What is printed is
  the key of the record, the state and the reason for the refusal.
- **The intake answers with a count, and the command retells it to the person.** How many were moved,
  how many already stood in this state and what was refused.

## What is out of scope

- Sorting out the cargo itself: what to take into work the executor decides, and that sign is not
  available to a machine.
- Editing records in the intake by a person's hand: a record is closed by the token of the tree.
- Sending the cargo: it travels by a call of its own and moves no states.

## Contract

The surface is the launch line of the tree's command and one request to the intake per call.

### Refusal codes

Not applicable: the command has no named codes — it answers with the exit code of the process and
with lines, and the table below says what is printed in each case.

| What happened                          | How it ends | What it says                                       |
| -------------------------------------- | ----------- | -------------------------------------------------- |
| an unknown state                       | code 1      | which states there are; makes no request           |
| not a single record in the arguments   | code 1      | what is missing and what a record is named by      |
| no token of the tree                   | code 1      | what the tree is created by                        |
| the intake refused at least one record | code 1      | the key of the record and the reason, line by line |
| everything was moved                   | code 0      | how many were moved and how many already stood     |

## Data

There is no storage of its own: the address of the intake and the token of the tree are read from
the setting, the states of the records live in the intake.

## Screens and states

Not applicable: the command has no screens — the list of records is shown by the admin panel of the
intake.

## Cross-cutting requirements

### Locales

Not applicable: the output of the command is single-language.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The command lives in the tree where the receiver stands: a tree that only installs the package has
neither the intake nor its admin panel, and there is nobody there to call it.

## Decisions

- **The command lives in the tree, not in the package.** The records are marked by whoever sorts the
  cargo out, and it is the tree with the receiver that sorts it out. Rejected: a package resource —
  a consumer has nothing to carry it out with.
- **The shape of the cargo is taken from the package, not declared a second time.** Both sides are
  bound to read one declaration: of two copies one is compiled, and they diverge silently.
- **Everything that can be refused before the network is refused before the network.** An unknown
  state, a call without records and a missing token are visible on the spot, and a request for the
  sake of a refusal is not made.

## Open questions

The open questions of the domain are shared, and they live in the spec next to it.

## History of changes

- 2026-08-24 — the subdomain was split off from the observations subdomain, which had outgrown the
  length limit. The rules, the scenarios and the bindings of the mark moved here unchanged: the
  scenario numbers were not recounted.
