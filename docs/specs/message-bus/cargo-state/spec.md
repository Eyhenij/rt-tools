# The edit of a state by a tree

**Status:** in force · **Revision:** 2026-08-21 · **Scenario prefix:** `SC-MB`
**Depends on:** `agent-kit` (the command of the launch line a tree calls the edit by)
**Laws:** `access`, `observability`, `verifiability`, `code-structure`
**Procedures:** none — the operations are declared by the controllers of the intake

A subdomain of the domain "the intake of the cargo": what a tree moves its records of the cargo from
state to state by and what the intake does with an unfit row of the edit. What is shared — the
terminology of the domain, the cross-cutting requirements and the decisions — lies in the spec of the
domain next to it.

## Why

A record of the cargo already has a state: an incident analysis and a proposal arrive in "new", and
the sections show it as a column. There is nobody to change that state. It is put by whoever takes a
report into work — the executor at the tree, not a person in the admin application.

By its token a tree today calls the intake of the cargo alone, and there is no edit of what was sent
at any operation of the intake: the reading is closed by the entry of a person, and a person reads the
cargo, they do not edit it.

This agreement creates the way of a record that a tree walks. It also makes the order of the
transitions executable: it is named by the agreement of the first task of the epic, and there is
nothing to guard it with yet.

## Terminology

The vocabulary of the domain whole is in the spec next to it. Here only what this work creates:

| Term                       | What it is                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| The edit of a state        | A request of a tree moving its records of the cargo into the named states                                    |
| A row of the edit          | One record in the bundle: the kind of the record, the key and the state it is moved into                     |
| The key of a record        | What a tree names its record by: the name of the file at an incident analysis, the sign at a proposal        |
| A refused row              | A row of the edit the intake did not carry out: the tree has no such record or the transition is not allowed |
| The way of the fix         | A short text about what the shortcoming was fixed by: an article of a rule, a guard, a check, an edit        |
| The text of the fix        | The same thing in the body of the request and in the storage                                                 |
| The version of the release | The string a tree named the release by that carried the fix to the consumer                                  |
| The mark of the release    | The same string at this tree: the name of the package and the number, of the form `rt-agent-kit@0.10.1`      |

The way of the fix is not a retelling of the analysis and not a link to the request: a link answers the
"where", and what is needed is an answer to the "what by". The version of the release is not the number
of the edition of the intake and not the time of the rollout: it belongs to the tree, and the intake
only keeps it and gives it back by the reading.

### What it is called in the interface

The edit has no interface of its own: the surface is an operation of a request and a command of the
launch line of the package. A person in the admin application reads the state by a column, they do not
edit it.

## Rules

**Who edits and what.**

- **The state is edited by the tree with its token, not by a person who entered.** This is a step of the
  working order of the executor: a person reads the cargo, and it is sorted out by whoever works by it.
- **The edit is closed by the token of a tree on a par with the intake of the cargo.** There is no third
  way of introducing oneself to the intake, and the entry of a person would open the edit to whoever
  does not work by the record.
- **A tree edits only its own records.** The sign of the tree is taken from the token, not from the body
  of the request: otherwise a tree would move the states of a neighbour, having named itself by them in
  the cargo.
- **A record of another tree answers the same way as one that was not found.** A difference of the
  answers would tell what the neighbours have.
- **Both kinds of records of the cargo are edited — an incident analysis and a proposal.** Both have a
  state, and they are sorted out the same way; a digest of a month has no state at all.
- **The edit of a state touches no other fields of a record.** The text, the address, the resource and
  the times arrive by the intake of the cargo, and a second way to them would set one record apart into
  two sources.
- **The edit does not change the recognising of a record.** An incident analysis is named by the name of
  its file, a proposal by the sign of the text: by the same ones they arrived by.
- **The sign of a proposal is counted by one way on both sides.** The tree names its record by it, the
  intake looks for it by it, and having diverged they would find not a single one.

**The order of the transitions.**

- **The states come as an enumeration, not as a string in the body of the request.** An unknown value
  refuses the request by the form, it does not land in the column as a typo.
- **A step goes forward to the neighbouring one: new, in progress, ready, released.** A jump over a step
  is refused: "ready" skipped on the way to "released" would mean the release of something nobody said
  was fixed.
- **Backwards goes one return — from "in progress" into "new".** It means the work was cancelled; the
  rest of the steps backwards would be moved only by rewriting the past.
- **An edit into the same state does not count as a transition and does not refuse the row.** The
  working order is repeated, and a second mark of the same kind is an ordinary thing, not a miss of the
  executor.
- **The transition is judged by what lies in the storage.** The tree does not name the former state:
  between the reading and the edit stands the network, and a former state that was sent has time to go
  stale.

**The bundle.**

- **The edit arrives as a bundle: one operation for several rows.** A tree sorts the cargo out by a
  bundle, and a request per record would cost as much as the sorting out itself.
- **The records of both kinds go by one bundle.** The kind is named at every row, and a sorting out of
  the cargo that touched both the analyses and the proposals stays one request.
- **A row of the bundle is refused on its own, it does not carry the bundle away whole.** The rows of the
  edit do not depend on one another: a mark by one record is right no matter what happened to the
  neighbouring one.
- **The answer names how many records were moved, how many already stood in the named state and which
  rows were refused.** Otherwise a tree prints "marked" also when nothing landed.
- **A refused row is named by its place in the bundle, by the key and by the reason.** There are six
  reasons: the tree has no such record, the transition is not allowed, a transition into the fix without
  a text, a text not at that transition, a transition into the release without a version and a version
  not at that transition; by them the executor gets what to do next.
- **A bundle without rows is refused by the form.** A request that has nothing to do is a miss of the
  sender, and a silent "accepted" would read as a mark that did not happen.

**The way of the fix.**

- **The text of the fix arrives as a field of a row of the edit of the state, not by an operation of its
  own.** The mark about what was done is one, and there is no reason for a tree to call the intake twice
  over one sorting out.
- **A transition into "fixed and not released" without a text of the fix is refused row by row.**
  Otherwise the list again shows a state that has no answer to the "what by" — that is, exactly what the
  work is created for.
- **The text of the fix is accepted only with a row moving into "fixed and not released".** With another
  transition it is a miss of the sender: "what it was fixed by" answers about the fix, not about the
  release, and the row is refused whole, it is not carried out by half. That refusal has a reason of its
  own: with one for both cases a tree would not tell "add the text" from "remove the text".
- **A row with a text lands also when the state is not changed by it.** Otherwise the text is edited only
  once: the record already stands in "fixed and not released", there is no second transition into it,
  and there is nothing to fix a typo in the text by. By the number of the moved ones such a row still
  does not count — it really does not change the state.
- **An empty text does not count as a text.** A string of spaces is refused the same way as an absence of
  the field: otherwise the requirement is gone around by one space.
- **The way of the fix is created for both kinds of records of the cargo.** A state is at an incident
  analysis and at a proposal, and they are sorted out the same way.
- **A refused row writes neither the state nor the text.** A record at which a text landed without a
  transition would read as fixed without being it.
- **A second arrival of the text of the fix overwrites the former one.** So does the arrival of the text
  of an analysis: a record carries the present state of things, not their history.
- **The text of the fix has no length limit of its own.** It is held by the common limit of the weight of
  the request, declared by a setting of the intake; a second limit would have to be held in two places,
  and their difference explained.

**The version of the release.**

- **The version of the release arrives as a field of a row of the edit of the state, not by an operation
  of its own.** The mark about the release is one, and there is no reason for a tree to call the intake
  twice over one release — by the same technique the text of the fix goes.
- **A transition into "released" without a version of the release is refused row by row.** Otherwise the
  list again shows a state that has no answer to the "where to look for the fix" — that is, exactly what
  the work is created for.
- **The version of the release is accepted only with a row moving into "released".** With another
  transition it is a miss of the sender: the version answers about the release, not about the fix, and
  the row is refused whole, it is not carried out by half. That refusal has a reason of its own: with one
  for both cases a tree would not tell "add the version" from "remove the version".
- **A row with a version lands also when the state is not changed by it.** Otherwise the version is
  edited only once: the record already stands in "released", there is no second transition into it, and
  there is nothing to fix a typo in the version by. By the number of the moved ones such a row still does
  not count — it really does not change the state.
- **An empty version does not count as a version.** A string of spaces is refused the same way as an
  absence of the field: otherwise the requirement is gone around by one space.
- **The intake does not take the form of the version apart.** A neighbouring tree may publish no packages
  at all, and an imposed form would refuse its edit whole. What to put into that field is an agreement of
  the tree itself.
- **The version of the release has a length limit of its own, and it is short.** A version is a mark, not
  a text: the limit catches a piece of a changelog sent instead of it before it lands in the column that
  will later be searched by.
- **The version of the release is created for both kinds of records of the cargo.** A state is at an
  incident analysis and at a proposal, and they are released by one release.
- **A refused row writes neither the state nor the version.** A record at which a version landed without a
  transition would read as released without being it.
- **A second arrival of the version overwrites the former one.** So do the arrival of the text of an
  analysis and the arrival of the text of the fix: a record carries the present state of things, not
  their history.
- **A row carrying the text of the fix and the version of the release at once is refused.** Both fields
  arrive each with a transition of its own, and together they mean the sender was wrong about the row; no
  reason of the refusal of its own is created for that case — the row is refused by whichever of the two
  fields came not with its own transition.

**What is visible from outside.**

- **A refused row is written into the journal of the intake on a par with a refusal of an operation.** An
  answer with refused rows is visible to one tree, and without a row of the journal an edit that did not
  land once is visible to nobody.
- **A row of the journal carries the kind of the record, the sign of the tree and the reason.** There is
  neither a token nor the text of a record in it: the journal is read to understand what broke, not to
  read what is somebody else's.
- **A refusal by a missing text lands as a row of the journal on a par with the former reasons.**
  Otherwise the owner gets the count of the refused rows and does not get what they were refused by.
- **A refusal by a missing version lands as a row of the journal on a par with the former reasons.** By
  the same row and for the same reason.

## What is out of scope

- **The showing of the way of the fix and of the version of the release to a person.** The panel of
  details and its rows "Чем исправлено" and "В какой версии" are described by the spec of the admin
  application next to it: `docs/specs/message-bus/admin/`.
- **Putting the version by the flow of the publication.** The version is sent by the tree by name over the
  records; the flows of the publication this work does not touch at all.
- **The history of the fixes and of the releases.** The present text and the present version are kept; a
  record of who put them and when the epic did not order.
- **The revocation of a release.** The version at a record whose release was revoked is edited by a second
  arrival; the agreement appoints no working order for that case.
- **The working order of the sorting out of the cargo.** What the executor decides what to take into work
  and when to call the edit by is said by the rules layer: `docs/specs/message-bus/cargo-triage/`.
- **The filter by state and the order by it.** The task RT-913.
- **The edit of a state from the admin application.** The admin application reads the cargo; it is edited
  by the tree.
- **The history of the transitions.** The current state is kept; a record of who changed it and when the
  epic did not order.
- **The edit of the text, the address and the resource of a record.** They are carried by the intake of
  the cargo.
- **The reading of its own records by a tree.** What a tree learns what lies at it by this work does not
  create: it knows the keys of its own records itself — the name of the file of an analysis and the text
  of a proposal lie at it.
- **A limiter of the frequency at the edit.** It is closed by the token of a tree, like the intake of the
  cargo.

## Contract

A tree introduces itself by the same header `X-Tree-Token`.

| Operation               | What it does                                              |
| ----------------------- | --------------------------------------------------------- |
| POST /api/intake/states | moves the named records of the tree into the named states |

The mandatory fields of the request are the same as at the intake of the cargo, plus the list of the rows
of the edit:

| Field                                  | What it carries                                                         |
| -------------------------------------- | ----------------------------------------------------------------------- |
| the version of the schema of the cargo | what to take the request apart by                                       |
| the sign of the tree                   | it is checked against the tree of the token                             |
| the list of the rows                   | at each: the kind of the record, the key and the state it is moved into |

A row of the edit has five fields:

| Field of the row           | What it carries                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| the kind of the record     | an incident analysis or a proposal                                                       |
| the key of the record      | the name of the file at an analysis, the sign of the text at a proposal                  |
| the state                  | which state the record is moved into                                                     |
| the text of the fix        | what the shortcoming was fixed by; mandatory at a transition into "fixed", otherwise not |
| the version of the release | in which version to look for the fix; mandatory at a transition into "released"          |

The command of the launch line of the package carries both values as arguments; the agreement about the
command itself is in the spec of that domain:

```
agent-kit mark --state fixed --postmortem <file> --fix '<what it was fixed by>'
agent-kit mark --state released --postmortem <file> --release 'rt-agent-kit@0.10.1'
```

The answer:

| Field of the answer | What it means                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------- |
| tree                | the sign of the tree whose records were edited                                            |
| changed             | how many records were moved by this request                                               |
| same                | how many already stood in the named state                                                 |
| rejected            | the refused rows: the place in the bundle, the kind of the record, the key and the reason |

### Refusal codes

Not applicable: the intake answers with a code of the answer of HTTP, not with named codes of the
domain. Where the edit is obliged to refuse instead of staying silent:

| What happened                                       | Code  | What it says                                                                    |
| --------------------------------------------------- | ----- | ------------------------------------------------------------------------------- |
| there is no token of a tree in the request          | `401` | that the operation demands a token of a tree                                    |
| the token is not found or is revoked                | `401` | that the token is not accepted; which of the two is not named                   |
| the version of the schema of the cargo is not named | `400` | that the version is mandatory                                                   |
| the sign of the tree did not match the token        | `400` | that the sign in the request belongs to another tree                            |
| there is no list of the rows or it is empty         | `400` | that the edit has nothing to do                                                 |
| a row has no kind, key or state                     | `400` | which field is missing and in which row                                         |
| the kind of the record or the state is unknown      | `400` | that the value is not from the set, and in which row it is                      |
| the text of the fix was sent not as a string        | `400` | that the field `fixNote` is expected as a string, and in which row it is        |
| the version of the release was sent not as a string | `400` | that the field `releaseVersion` is expected as a string, and in which row it is |
| the version of the release is longer than the limit | `400` | the length limit and the place of the row in the bundle                         |
| the request is heavier than the limit               | `413` | the limit, and the weight — when the request declared it itself                 |
| the storage is unavailable                          | `503` | that the edit did not land, and the number of the request                       |
| everything else                                     | `500` | that the edit did not land; the workings are not retold                         |

Carried out — `200`: the answer carries the count and the refused rows. A bundle refused row by row whole
has no code of its own: the form of the request is right at that, and the tree reads the list of the
refused ones, not the code of the answer.

A missing text at a transition into "fixed", a missing version at a transition into "released", an empty
value of either of the two and a value not with its own transition are not refused by a code of the
answer: the form of the request is right at that, the row is refused row by row, and the tree reads it in
the list of the refused ones.

## Data

The state lies as a column at an incident analysis and at a proposal since the first task of the epic.
The edit changes that column, and the way of the fix and the version of the release add two more to it —
the optional columns of the text of the fix and of the version of the release at both tables: a record
nobody fixed and released has none of them. The columns carry no constraints. An index is at one of them:
by the text of the fix nobody searches and sorts, while by the version of the release they filter, order
and gather the values that met — that index is created by the task RT-987 together with the filter
itself. The records that lay there got emptiness: neither a fix nor a release was marked at them, and
there is nowhere to invent them from.

- **A record is looked for within the tree of the token.** The pairs "tree — the name of the file of an
  analysis" and "tree — the sign of a proposal" are unique, and a search by the key without the tree would
  give back a foreign record.
- **A row of the edit lands as a record of the storage of its own.** A bundle of ten rows is ten edits, and
  a refused eleventh does not cancel those that landed.

## Screens and states

Not applicable: the edit has no screens of its own. The column of the state was created by the first task
of the epic, and the edit changes what is visible in it.

## Cross-cutting requirements

### Locales

The language is one — Russian; a refusal of the edit is read by the executor of the tree, not by a guest.
Neither the text of the fix nor the version of the release is translated: they are written by the tree,
and the intake does not interpret them.

### SEO

Not applicable: the service is closed, and nothing is shown to the search engines.

### Mobile layout

Not applicable: there are no screens of its own.

### Several objects

There are many trees, and each of them edits only its own records: a record is looked for within the tree
of the token, and a foreign one answers the same way as one that was not found.

## Decisions

- **The edit arrives as a bundle at a time.** The word of the owner. The edit of one record by its sign
  was rejected: a tree sorts the cargo out by a bundle, and a request per record would cost as much as the
  sorting out itself.
- **The operation guards the order of the transitions.** The word of the owner. The order was named by the
  first task of the epic, and there was nothing to carry it out — now it is judged by the edit of the
  state.
- **The command of the launch line of the package is part of this work.** The word of the owner. Without it
  there is nothing to call the operation by; the agreement about the command itself lies in the domain of
  the package.
- **A step forward goes to the neighbouring one, not over one.** The argument: a skipped "ready" would mean
  the release of something nobody said was fixed. A free move forward to any step was rejected.
- **A row is refused on its own, it does not carry the bundle away.** The word of the owner. The argument:
  the rows of the edit do not depend on one another, and a bundle lost because of one record the tree would
  send anew whole. A refusal of the whole operation by the sample of the intake of the cargo was rejected,
  where five proposals of one cargo are one parcel.
- **The answer carries two numbers and the list of the refused rows.** The word of the owner. The argument:
  by the sample of the answer to the proposals, where `added` and `known` stand, and the list of the
  refused ones names what cannot be said by numbers.
- **The edit stands as an operation of the intake, not at a root of the address of its own.** The argument:
  the operations closed by a token of a tree are under one root, and a second branch of them would set one
  way of introducing oneself apart into two places.
- **A foreign record answers the same way as one that was not found.** The argument: the manner of the
  intake is already written down — a not-found, a used-up, an expired and a revoked invitation answer the
  same way.
- **The text of the fix goes as a field of a row of the edit.** The word of the owner. An operation of the
  intake of the fix of its own was rejected: a tree would call the intake twice over one sorting out, while
  the subject of both requests is one.
- **A transition into "fixed" without a text is refused.** The word of the owner. An optional text was
  rejected: the list would again show "fixed" without an answer to the "what by".
- **The text is accepted only with a transition into "fixed".** The argument: "what it was fixed by"
  answers about the fix. Accepting it with any transition was rejected: then the text would land together
  with the release, and whoever reads would not know what it belongs to.
- **The text has no length limit of its own.** The argument: the limit of the weight of the request is
  already declared by a setting of the intake. A separate limit on the text was rejected: two limits would
  have to be held in two places, and their difference explained.
- **A second arrival overwrites the former text.** The argument: so does the arrival of the text of an
  analysis. Appending was rejected: a record carries the present state of things, and the history of the
  transitions was not ordered by the epic.
- **Two reasons of a refusal by the text are created.** Found at the assembly. The argument: with one
  reason for both cases a tree would not tell "add the text" from "remove the text". A common reason was
  rejected.
- **A row with a text lands also at the same state.** Found by a spec that fell. The argument: without that
  the rule about a second arrival is not carried out at all — there is no second transition into "fixed and
  not released", and there is nothing to fix a typo in the text by. Counting such a row as moved was
  rejected: it does not change the state.
- **The version is sent by the tree by name over the records.** The word of the owner. A step of the flow of
  the publication moving all the fixed records of a tree at once was rejected: it does not know what
  entered the release and would mark what was fixed yesterday on a par with what was fixed half a year ago.
- **The intake does not take the form of the version apart.** The word of the owner. Taking the string apart
  into the name of the package and the number was rejected: a neighbouring tree may publish no packages at
  all.
- **The version is mandatory at a transition into "released" and forbidden at the rest.** The word of the
  owner. An optional version was rejected: with it "released" without a version becomes an ordinary thing,
  and the question "where to look for the fix" is again without an answer.
- **The version has a length limit of its own.** The argument: at the text of the fix the limit is shared
  with the weight of the request, because it is a text; a version is a mark, and a piece of a changelog
  sent instead of it must be refused before it lands in the column. The common limit of the weight of the
  request was rejected.
- **An attached value is judged before the transition, and of two values the row is refused by the first.**
  Found at the assembly. The argument: a row carrying the text of the fix and the version at once is never
  lawful at any transition, and by a second reason a tree would learn nothing new. A separate reason of a
  refusal for that case was rejected.

## Open questions

The open questions of the domain are shared, and they live in the spec next to it. The subdomain has none
of its own.

## History of changes

- 2026-08-20 — the subdomain was created by the merged agreement of the task RT-909: the way of a record a
  tree edits the state of its records of the cargo by. The agreement was not merged into the spec of the
  intake — together they outgrew the length limit. The scenario numbers were not recounted.
- 2026-08-21 — the agreement of the task RT-910 was merged: the way of the fix as a field of a row of the
  edit, two new reasons of a refusal and a column of the text at both tables. The showing of the text to a
  person moved to the spec of the admin application, the argument of the command of the launch line to the
  spec of the package. The scenario numbers were not recounted.
- 2026-08-21 — the agreement of the task RT-911 was merged: the version of the release as the fifth field
  of a row of the edit, two new reasons of a refusal, a length limit of its own and a column of the version
  at both tables. The showing of the version to a person moved to the spec of the admin application, the
  argument of the command of the launch line to the spec of the package. The scenario numbers were not
  recounted.
