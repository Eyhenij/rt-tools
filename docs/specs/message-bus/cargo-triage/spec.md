# The working order of the sorting out of the cargo

**Status:** in force · **Revision:** 2026-08-22 · **Scenario prefix:** `SC-MB`
**Depends on:** none
**Laws:** `work-conduct`, `delivery`, `project-documentation`
**Procedures:** none

A subdomain of the domain "the package of the rules of the agent": what the executor reads the arrived
cargo by, what it means to take a report into work and when a record gets the marks of the fix and of
the release. What is shared — the terminology of the domain, the cross-cutting requirements and the
decisions — lies in the spec of the domain next to it.

## Why

The cargo arrives at the intake and lies there. The intake remembers everything about a record: the
state, the number of the task, the way of the fix, the version of the release — and it is not the one
who puts these marks: they are put by whoever works by the record. While their steps are described
nowhere, the mark is held by the memory of the executor and is put every other time — exactly like the
number of the task in the header of an incident analysis, which five records out of twenty carry.

The price of that is visible on the cargo itself. Over five days 107 records arrived from two trees,
and by the list what was sorted out cannot be told from what was untouched: the state is one and the
same at all of them, because nobody thought to move it. Having sorted the cargo out today, tomorrow
they start from zero.

The tool for the mark is ready whole: the command `agent-kit mark` moves the records by a bundle,
accepts the way of the fix and the version of the release and refuses an unknown state without a
network. What is not described is the working order — when to call it and what else is done at that.

The agreement names the order of the sorting out of the cargo: what the cargo is read by, what it means
to take a report into work, when "ready" is put, when "released" and by which version.

## Terminology

The vocabulary of the domain whole is in the spec next to it. Here only what this work creates:

| Term                         | What it is                                                                                                            |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| The sorting out of the cargo | A step of the working order: the executor reads the arrived records and decides about each of them what to do with it |
| The taking into work         | The creating of a task by a record of the cargo and the marking of the record by the same movement                    |
| A mark                       | A call of a command of the package moving the records into the named state                                            |
| A bundle of the mark         | One call of the command on all the records decided over this sorting out                                              |
| The way of the fix           | A short text about what the shortcoming was fixed by: an article of a rule, a guard, a check, an edit                 |
| The version of the release   | The string the tree named the release by that carried the fix to the consumer                                         |
| What is not sorted out       | The records in the state "new": nobody has yet read them by the eyes of the executor                                  |

The sorting out of the cargo is not the digest of the proposals: the digest divides what came in into
what repeated and what was one-off and decides what becomes an edit of the package, while the sorting
out of the cargo marks the state of every record. One goes after the other, and they must not be
confused: the digest is called once in a few days over a stretch, and the sorting out every time work
is taken.

### What it is called in the interface

The order has no interface of its own: the surface is the admin application of the intake for the
reading and the command of the launch line of the package for the mark. A person in the admin
application reads the state by a column and a filter, they do not edit it.

## Rules

**What the cargo is read by.**

- **The cargo is read by the admin application of the intake, not by the work queue.** The digest speaks
  of the working habits of the team, and in an open queue that is laid out for the whole world. The
  records created in the queue by the former order stayed and will not go anywhere, but new ones are
  not created there.
- **The sorting out starts with what is not sorted out.** The list is narrowed by the filter of the
  state "new" and goes by the order of the arrival: the records that arrived earlier are sorted out
  earlier. Without the filter the list shows what was sorted out and what was untouched mixed together
  — exactly the state the states were created to get away from.
- **What is already sorted out is asked of the intake, it is not recalled.** The state outlives the
  session, the memory of the executor does not.

**The taking of a report into work.**

- **To take a report into work means to create a task by it.** A mark "in progress" without a task says
  that somebody took the record and stays silent about where that work goes; a task without a mark
  leaves the record in the list of the ones not sorted out.
- **The task and the mark go by one turn.** A postponed mark is not put: between the creating of the
  task and the next step a day passes, and by that day the executor remembers the task, not the record
  of the cargo.
- **One edit — one task, however many records of the cargo called it up.** The records fixed together are
  marked by one bundle and by one task: what is divided is what will have to be rolled back apart.
- **A record no work will be done by is not moved into "in progress".** A state of a refusal is not
  created by the set, and there is nothing to mark such a record with — this is the open question
  `Q-CT-1`.

**The mark about the fix.**

- **"Ready" is put when the edit is merged into the main branch.** Not when the request is open and not
  when the run is green: before the merge the edit is not in the tree, while the mark states that it is.
- **With the transition into "ready" goes the way of the fix.** It answers the "what by", not the
  "where": an article of a rule, a guard, a check, an edit of code. A link to the task answers the
  "where", and it does not count as a way of the fix.
- **The way of the fix is written in the words of the edit, not as a retelling of the analysis.** The
  record of the cargo already carries what was wrong; the mark says what was done about it.

**The mark about the release.**

- **"Released" is put by whoever publishes the edition, and by the same movement as the publication.**
  They have the version at hand; a release postponed to the next session is marked by memory or is not
  marked at all.
- **The version of the release is the one the release was named by that carried the fix.** Not the number
  of the edition of the intake and not the time of the rollout.
- **Between "ready" and "released" stands the edition of the package.** The consumer gets the fix only
  after the layout at their own place, and the two states are set apart exactly for that.

**How the mark is put.**

- **The mark is put by a command of the package, not by the hand of a person in the admin application.**
  The edit is closed by the token of the tree: a person reads the cargo, and it is sorted out by whoever
  works by it.
- **The records of the whole sorting out go by one bundle.** The command accepts several records per
  call, and a call per record would cost as much as the sorting out itself.
- **The answer of the command is read, it is not implied.** It names how many records were moved, how
  many already stood in the named state and which rows were refused; a refused row means the record
  stayed where it was.
- **A refused row is taken apart, it is not repeated by the same call.** The reason of the refusal is
  named by the answer, and a repeat without taking it apart is refused in exactly the same way.

## What is out of scope

- **The edit of the code of the intake and of the admin application.** The states, the filter, the
  column, the way of the fix and the version of the release are ready by six tasks of the epic; this work
  has nothing to write in them.
- **The sorting out of the findings about the rules layer gathered by the epic.** They lie as a separate
  file and are read when the epic ends.
- **The release of a new edition of the package.** The rule lands in the set of the resources and is laid
  out; when to release is a separate decision of the owner.
- **The sorting out of the accumulated cargo itself.** The agreement describes the order, it does not walk
  over the arrived records.
- **A state of a refusal.** The records no work will be done by are not provided for by the set of the
  states; that is an open question, not a default of this work.
- **Demanding the rule by the gate.** A branch in the map of the gate is not created here: the rule
  starts working by words, and whether it needs a machine will be visible by whether the order gets
  forgotten.

## Contract

The order has no contract of its own: it creates neither an operation nor a field. The mark goes by the
operation of the edit of a state the intake already gives, and by the command of the package that calls
it.

### Refusal codes

Not applicable: the order creates no refusals of its own. The refusals of the mark are named by the
agreement about the edit of a state by a tree.

## Data

The order creates no data of its own. It reads and edits those that already lie at a record of the
cargo: the state, the way of the fix and the version of the release.

## Screens and states

There are no screens of its own. The order stands on two ready ones:

| What the order needs                   | Where it already is                                                                |
| -------------------------------------- | ---------------------------------------------------------------------------------- |
| A list of what is not sorted out       | The sections of the cargo of the admin application, the filter by the state "new"  |
| What stands at a record now            | The column of the state and the panel of the record                                |
| What was fixed by and in which version | The panel of the record: the way of the fix and the version of the release as rows |

## Cross-cutting requirements

### Locales

Not applicable: the order is a text of the rules layer, not a showing to a person. Its language is the
same as at the rest of the resources of the set.

### SEO

Not applicable: nothing is given outward.

### Mobile layout

Not applicable: the order has no screens of its own.

### Several objects

The order is written for a tree sorting the cargo out, and there may be several such trees: the command
of the mark names the tree by the sign from the token, and each of them edits only its own records.

## Decisions

- **The order lands as a rule of its own with a pattern at it, not as a pattern at the leading of the
  work.** The subject has five states of a record, marks of its own and a version of the release of its
  own; as a pattern at a foreign rule it would stand in one row with the start, the return and the
  closing of work, while it speaks of something else. Rejected also: appending to the command of the
  digest of the proposals — it is called once in a few days over a stretch, while the sorting out of the
  cargo goes every time work is taken.
- **The agreement is written although the work does not touch the intake.** A decision of the owner: the
  work creates a new requirement of the executor, and its place is where the rest of the requirements of
  the package are. The bypass by the line "Behaviour: unchanged" in the plan was rejected — it would lift
  the refusal of the guard and leave the requirement without a written agreement.
- **The mark "in progress" is tied to the creating of the task, not to the reading of the record.** A
  record that was read is no different from an unread one a day later, and a created task is.
- **"Ready" is tied to the merge, not to the opening of the request.** An open request waits for a
  person, and between it and the merge a day and more passes; a mark put earlier states about the tree
  what is not in it.

## Open questions

- **`Q-CT-1` — what a record no work will be done by is marked with.** The set of the states does not
  provide for it: "new" leaves it among the not-sorted-out ones forever, "in progress" lies. It is
  decided by the owner: either the set gets a fifth state, or such records stay in "new" and are sorted
  out anew every time.
- **`Q-CT-2` — whether the rule needs a branch in the map of the gate.** For now the order is held by
  words. A branch is created if the sorting out of the cargo starts going past the order; the sign of
  that is records whose edit is merged while the state stayed the former one.

## History of changes

| Date       | What changed                                 |
| ---------- | -------------------------------------------- |
| 2026-08-22 | The agreement was created by the task RT-914 |
