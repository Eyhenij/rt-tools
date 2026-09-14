# The intake of the cargo

**Status:** in force · **Revision:** 2026-08-19 · **Scenario prefix:** `SC-MB`
**Depends on:** `agent-kit` (what a tree knows about itself and what goes outward)
**Laws:** `verifiability`, `code-structure`, `lib-imports`, `entity-models`
**Procedures:** none — the operations are declared by the controllers of the intake

A subdomain of the domain "the intake of the cargo": what the intake takes the cargo from the trees in
by and what it does with what did not arrive. What is shared — the terminology of the domain, the
cross-cutting requirements and the decisions — lies in the spec of the domain next to it.

## Why

The rules package stands in several trees, and what is used in it is known only to every tree about
itself. The cargo goes away by a run of the sending: a digest with a snapshot of the overrides,
proposals, incident analyses. There was nowhere for it to go — this half of the service names where
exactly.

Here: what the intake takes in, what it tells one tree from another by, what it does with a repeated
sending and where it is obliged to refuse instead of staying silent.

## Terminology

The vocabulary of the domain whole is in the spec next to it. Here only what lives in the intake:

| Term                                   | What it is                                                                                                                       |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Cargo                                  | What goes away by a run of the sending: a digest with a snapshot of the overrides, proposals, incident analyses                  |
| A kind of cargo                        | One of four: a digest, the observation lines, a proposal, an incident analysis. Each has its own operation                       |
| A tree                                 | A record about a repository the cargo arrives from. Trees are told apart by a sign, not by an address                            |
| A token of a tree                      | What a tree introduces itself to the intake by. The intake holds only a hash; the token itself is printed once                   |
| A record of a month                    | The digest of one tree over one calendar month. One per pair "tree — month"                                                      |
| A run                                  | One sending from a tree: up to four requests in a row, one per kind of cargo                                                     |
| The version of the schema of the cargo | The number of the format of the request of the intake. It changes when the composition of the fields of the cargo itself changes |
| A record of the cargo                  | An incident analysis or a proposal. A digest of a month is never a record of the cargo in this sense                             |
| The state of a record                  | The step an incident analysis or a proposal stands at: new, in progress, ready, released                                         |
| A reset of the state                   | The return of a record into "new" by an arrival that changed its text                                                            |

The invitation and everything around it lives right here: by it a tree creates itself.

| Term                                  | What it is                                                                                                                  |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| An invitation                         | A one-time code issued by the owner under one tree. It gives the right to get a token once and after that goes out          |
| The term of validity of an invitation | The time after which the invitation is not accepted, even if it was not used                                                |
| A request for a token                 | What a tree asks for a token by: the invitation and the sign of the tree. The intake answers with a token or with a refusal |
| A used-up invitation                  | An invitation a token was already issued by. It is not deleted: by it is read when and which tree was created               |
| A revoked invitation                  | An invitation taken off by the owner before it was used                                                                     |

### What it is called in the interface

The intake has no interface of its own: the surface is the operations of a request and the commands of
the launch line. What a person gets in the admin application is the subdomain of the reading of what
was taken in.

## Rules

**The form of the cargo.**

- **The form of the cargo is declared by one place, and the intake does not redeclare it.** The types
  come from the common lib, where this work puts them, and the sending package takes them from there
  too: a copy of a foreign type of one's own diverges from the original silently, while only one of
  them compiles.
- **Cargo of every kind is taken in by an operation of its own.** A digest, a proposal and an analysis
  are arranged differently, and a common operation "take something in" would put the taking apart of
  the form onto the intake.
- **The intake does not take the content of the digest apart.** It checks the mandatory fields of its
  kind, and keeps the counters and the snapshot of the overrides as they arrived: they are taken apart
  by whoever reads, and an intake knowing the fields by heart would refuse at every edit of the
  package.
- **The version of the schema of the cargo is mandatory, and the versions of the schema of the rows of
  the observations are a part of the content.** The first says what to take the request apart by, and
  without it the intake refuses; the second the intake does not judge at all.
- **Cargo of an unknown version of the schema is taken in and marked by it.** A refusal would lose the
  stretch whole, and a tree learns about a new edition of the package not at once and not always.
- **Cargo heavier than the limit is not taken in.** The limit is declared by a setting of the intake:
  without it a request of an arbitrary size fells the service on the smallest node. The weight of what
  arrived is named when the request declared it itself — a cut body does not know its weight.

**A tree and its token.**

- **A tree introduces itself by a token, and the intake holds only its hash.** A leaked rollout or a
  taken dump of the database gives no access: a token is not restored from a hash.
- **The token is printed once, at the issuing.** There is nowhere to show it a second time from; a lost
  one is not restored but replaced by a new one.
- **A tree has one valid token: a new one replaces the former one, marking it as revoked.** Otherwise
  the list of the trees speaks about the state of the token in the singular, while a tree has several
  tokens.
- **A revoked token stops being accepted at once.** A tree learns of that by a refusal of the sending,
  not by silence: a silent intake of thrown-away cargo looks like a working sending.
- **A revoked token is not deleted.** The cargo that arrived by it stays readable: having deleted the
  token, the intake would lose also who the former records were sent by.
- **The sign of a tree is named at the creating, it is not taken from the first cargo.** A tree counts
  it at its own place from the address of its repository; an intake that learned the sign from the
  cargo would take what was sent for its own.
- **The sign of the tree in the cargo is checked against the tree of the token.** Otherwise a tree
  would append to a foreign record of a month, having named itself a neighbour in the cargo.
- **The creating and the revocation of a token of a tree are not done by an operation of a request.**
  The token of a tree calls only the intake of the cargo; issuing and revoking the tokens is the
  business of the commands that go to the storage directly.

**A tree creates itself by an invitation.**

- **A token is issued only by a valid invitation.** A request without an invitation, with a used-up, an
  expired or a revoked one answers the same way — with a refusal, without naming what exactly did not
  match. A difference of the answers would tell which codes are created.
- **The invitation goes out in the same record of the storage the token is released by.** Otherwise two
  requests that came at once get a token each by one invitation: between the check and the issuing
  stands the network, and the second request has time to pass the check before the first one put the
  code out.
- **The name of the tree is set by the owner at the issuing of the invitation, not by the request.** The
  name is what the tree is called by in the admin application and in the digests; accepted from the
  request, it lets whoever obtained the code call themselves by a foreign name.
- **A sign of a tree that is already created is not recreated by a request.** A refusal, not a silent
  issuing of a new token: otherwise an obtained code hijacks an existing tree together with its cargo.
- **An invitation is valid for a limited time.** A code lying in a correspondence for months is no
  different from a shared secret of the installation.
- **A request for a token is a public operation creating a record, and it is closed by a limiter of the
  frequency.** Rights do not guard it, and without a limit the speed of the growth of the table is set
  by the sender.
- **Only the hash of the invitation lies in the storage.** By the same technique as the token: a taken
  dump gives not a single valid code.
- **The token goes away to the tree by the single answer to the request.** There is no second way to
  take it — the intake has none either.
- **The request goes only over a protected connection.** The package refuses an address of the intake
  without TLS itself, without reaching the network; the exception is the local machine, where the
  intake is raised for a check.
- **Neither the invitation nor the token gets into the observations and the logs.** What is written is
  that the request came, what it ended with and which tree was created — the values themselves are
  cleaned away.
- **The package does not overwrite a token that already lies there without asking.** A tree with a valid
  token that called the creating a second time would lose the link with the former cargo silently.
- **There is one valid invitation per name, and it is held by the storage.** Two valid invitations on
  one name would mean two trees with one name. The constraint is held by a separate column of the name,
  going out into emptiness at the using up and at the revocation: the storage does not count the
  uniqueness of empty values, and a partial unique index the schema of the client does not declare at
  all.
- **The reference to the created tree is filled in at the minute of the using up.** By it is read which
  tree the invitation was used up by; one not used up has none.
- **The invitation is issued by two — the command of the node and the operation of the admin application
  — and they decide one and the same.** Whether the name is free, what the code will be and until which
  hour it is valid is counted by one place for both ways: having diverged, they would differ in that to
  one the name is taken and to the other not.
- **A taken name refuses the issuing whole.** Taken counts the name of a created tree and the name of a
  valid invitation: two trees with one name will neither be created nor be told apart afterwards. What
  exactly the name is taken by the refusal names — the asking is done by the owner who entered, to whom
  both the list of the invitations and the list of the trees is visible whole.
- **The code goes away to whoever called the issuing, and nowhere else.** Only the hash lands in the
  storage; the code is printed by whoever called — the command by a line of the output, the operation by
  the single answer.

**The record of a month.**

- **A record of a month is one per pair "tree — month".** Found — it is updated, not found — it is
  created. A new record at every run would scatter the monthly picture of a tree over the runs.
- **The digest of the last run replaces the former one whole.** The counters, the snapshot of the
  overrides and what was not chosen are taken from the last run: the stretch of the digest is shorter
  than a month, the windows of the runs overlap, and adding up would overstate the numbers silently,
  while a repeat after a break of the connection would double them.
- **The proposals and the incident analyses pile up, they are not replaced.** The digest answers the
  question "how are things now", these two kinds "what happened over the month".
- **A record of a month remembers the time of the last run.** Without it the list of the trees does not
  answer the question of whether the tree reports at all, and a silent tree is indistinguishable from a
  sound one.
- **The month is taken by the clock of the intake, in universal time.** The trees stand in different
  zones, and a boundary of a month from the sender puts two records onto one month; the local time of
  the node does not outlive a move of the node.
- **The observations of the past month that arrived by the first run of the new one land in the new
  one.** The stretch of the digest is the last few days, and on the first day it is mostly about the
  past month. The intake cannot cut it: it gets the numbers, not the rows they were gathered from.
- **The simultaneous arrival of two runs of one tree is resolved by the storage, not by a check by
  reading.** Whoever lost the race rereads the record and updates it, it does not refuse: a refusal at
  an expected case would lose a run.
- **The pair "tree — month" is unique.** A constraint of the storage, not a check in the code: two runs
  from one tree arrive at once, and a check by reading would not set them apart.

**What the intake does with what did not arrive.**

- **Cargo that did not pass the check of the form is refused whole within its own operation.** There is
  no cross-request transaction: the kinds go by three requests, and "two out of three taken in" is a
  lawful state the sender tells the owner about itself.
- **All the records of one operation land together or do not land at all.** Five proposals of which the
  third fell would leave the record of a month in a state that was neither before nor after.
- **The proposals and the analyses that arrived before the digest create the record of a month
  themselves.** The intake does not appoint the order of the requests of a run, and a refusal "there
  has been no digest yet" would turn the order into a hidden requirement.
- **A refusal of the intake names the reason to the tree, not the details of its own workings.** The
  tree prints that reason to the owner, and an "internal error" in it means a lost run.
- **Every refusal is written into the journal of the intake with the kind of the cargo and the sign of
  the tree.** There is neither the token nor the text of the cargo there: the journal is read to
  understand what broke, not to read what is somebody else's.
- **The intake gives nothing without a token of a tree.** It has no open operations at all, apart from
  the probe of liveness.
- **The probe of liveness answers only when the storage answers too.** A service counts as raised when
  it has carried its task out, not when it reported readiness.
- **The probe of liveness names neither the edition nor the composition — neither in the body nor in the
  headers of the answer.** Everything except the answer "raised" is a hint to whoever is looking for a
  way in.

**The incident analyses and the proposals.**

- **An incident analysis arrives as text whole.** The intake is closed and one's own; a header without
  the mechanics of the miss explains nothing, while a rule is derived from an analysis by the
  mechanics.
- **The check for the address of a tree does not cover an incident analysis.** An analysis by its very
  nature names the files of the tree where the miss happened; a check that covered it would refuse
  every sending of this kind. The requirement stands at the sender: the check lives at it.
- **An analysis is recognised by the name of its file at the tree.** The heading is edited together with
  the text, and the name of the file outlives the edit — by it an analysis that arrived a second time
  updates the former one.
- **An analysis that arrived a second time updates the former one, it does not create a second one.** It
  is edited at the tree after it went away, and a second copy would read as a second incident.
- **An analysis that disappeared at the tree stays at the intake.** The intake takes in, it does not
  watch: a deletion by the silence of the sender would wipe the records of the very first tree that
  stopped sending.
- **A proposal is recognised by a sign — the hash of its text, not by the text in a constraint.** The
  texts of the proposals go in kilobytes, and uniqueness by such a field runs into the limit of the size
  of a row of an index: the insert would be refused by the storage at the first long proposal. The sign
  is counted by the intake.
- **The sign of a proposal is unique within the tree, not within the record of a month.** A tree sends
  the file of the proposals whole, and a repeat arrives in any month: the boundary of a month does not
  protect from it, and by two records there is no seeing that this is one and the same.
- **What already lay there is skipped, it does not refuse the request.** A repeat here is the rule, not
  a miss of the sender: the sender learns what went away by a mark in the file, and the file lives in
  the working tree and is lost at a switch of the branch.
- **The answer of the intake to the proposals names how many records landed and how many already lay
  there.** Otherwise the sender prints "went away" also in the case when nothing new went away, and a
  person reads that as an accepted proposal.
- **A proposal stays at its record of a month.** The uniqueness is held by the tree, and the link is
  not: by the record of a month it is visible in which month the proposal first arrived.
- **A proposal keeps the resource it belongs to.** The epic is created for the sake of the count "how
  many trees edit this place", and without the resource it comes from nowhere.

**The state of a record of the cargo.**

- **A state is at an incident analysis and at a proposal, and a digest of a month has none.** The digest
  answers the question "how are things now", and there is nothing to sort out in it: a state on it would
  read as a statement about work that does not happen.
- **There are five states, and there are no others.** The ready one and the released one are set apart
  not for the sake of order: between the fix and the release stands the edition of the package, and the
  consumer gets the fix only after the layout at their own place. The fifth is the quarantine, and it
  stands outside the order of the steps: a record goes into it from "new" and comes back only there.
  The subdomain about it is next door.
- **The state comes as an enumeration, not as a string at the place of the use.** A string written in
  the request, in the markup and in a comparison is neither found over the tree nor edited at once.
- **A record that arrived stands in "new".** The default is declared by the storage: a record without a
  state would demand a second kind of emptiness and a check at every way of the reading.
- **The records that arrived before the creating of the field are read as new.** The intake does not
  know what was done with them, and it says so directly, not by emptiness.
- **An arrival that changed the text of an analysis brings it back into "new".** An analysis is
  recognised by the name of the file and arrives on top of the former one; a text that became another
  one is sorted out anew.
- **An arrival that did not change the text does not touch the state.** The run of the sending carries
  the analyses whole and repeats by a schedule: a reset at every arrival would put out all the states by
  the very first run.
- **The intake of the cargo does not accept a state.** A tree sends a text, not a judgement about
  whether it was sorted out.

## What is out of scope

- **The edit of the taken-in cargo.** The intake takes in, the admin application reads; there are no
  edits at either side.
- **A sign of a run and protection from a repeated sending.** The replacement of the digest makes a
  repeat harmless, and the proposals and the analyses are picked out by the sign and by the name.
- **Notifications about arrived cargo.** No mail and no notifications: the cargo is read when somebody
  comes for it.
- **The cleaning of old records by a term.** The intake is one's own and small; a term of keeping is
  appointed when the volume becomes visible.
- **A limit of the frequency at the operations closed by a token.** It stands at one request for a
  token — the only operation of the intake called without a token. The rest are closed by it, and the
  address of the node is published nowhere.
- **The revocation of tokens by an operation of a request.** That is the business of the commands of the
  launch line. By an operation one first token of a tree is issued, and that by an invitation issued by
  the owner by the same command.
- **A term of validity of the token of a tree itself.** A token is valid until it is revoked: a term
  demands a renewal, otherwise the digests stop going in the middle of a month and silently.
- **A reissuing of a token by the tree itself.** A lost token is issued by a new invitation from the
  owner — otherwise the operation of the reissuing becomes a second way to a token.
- **The way a tree puts the state of a record by its token.** Today the token opens the intake of the
  cargo alone, and the state is put by whoever sorts the cargo out.
- **The history of the transitions of the state.** The current state is kept; a record of who changed it
  and when is not created.
- **The change of the name and of the sign of a created tree.**
- **The creating of the accounts of people:** an invitation is issued to a tree, not to a person.

## Contract

A tree introduces itself by the header `X-Tree-Token`. Without a token any operation of the intake,
apart from the probe of liveness, refuses.

| Operation                     | What it does                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| POST /api/intake/summary      | creates or updates the record of a month by the digest of the last run                                        |
| POST /api/intake/observations | replaces the days of one working copy by the observation lines of the run; the subdomain "Usage of the rules" |
| POST /api/intake/proposals    | puts to the record of a month the proposals the tree did not have yet                                         |
| POST /api/intake/postmortems  | creates or updates the incident analyses of the tree by the names of their files                              |
| POST /api/intake/enroll       | creates a tree by a valid invitation and gives back its first token                                           |
| GET /api/health               | answers that the service is raised and the storage answers                                                    |

The request for a token is the only operation of the intake without a token of a tree: the tree does
not have one yet. It is closed by the invitation and by a limiter of the frequency, and it carries the
invitation and the sign of the tree; the name is not passed in it at all — the intake takes it from the
invitation.

The owner issues, revokes and lists the invitations by the commands of the launch line: `tree:invite
<name>` prints the code once, `tree:uninvite <name>` revokes, `tree:invites` shows the state of each of
them. The same invitations are issued and revoked by the admin application — by operations closed by
the entry of a person; they are described by the subdomain of the reading next to it. The node stays
the second way at that: it is available to the owner also when the admin application is not raised.

The mandatory fields by the kinds of the cargo:

| Kind of cargo | What is obliged to be in the request                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| a digest      | the version of the schema of the cargo, the sign of the tree, the counters, the snapshot of the overrides, what was not chosen |
| the proposals | the version of the schema of the cargo, the sign of the tree, the list: the text, the address, the resource                    |
| the analyses  | the version of the schema of the cargo, the sign of the tree, the list: the name of the file, the text whole                   |

What is inside the counters and the snapshot the intake does not judge.

### Refusal codes

Not applicable: the intake answers with a code of the answer of HTTP, not with named codes of the
domain. Where the intake is obliged to refuse instead of staying silent:

| What happened                                       | Code  | What it says                                                                                      |
| --------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------- |
| there is no token of a tree in the request          | `401` | that the operation demands a token of a tree                                                      |
| the token is not found or is revoked                | `401` | that the token is not accepted; which of the two is not named                                     |
| the version of the schema of the cargo is not named | `400` | that the version is mandatory                                                                     |
| a mandatory field of its own kind is missing        | `400` | which field is missing and at which kind                                                          |
| the sign of the tree did not match the token        | `400` | that the sign in the cargo belongs to another tree                                                |
| the cargo is heavier than the limit                 | `413` | the limit, and the weight — when the request declared it itself                                   |
| the invitation is not valid                         | `401` | that it is not accepted; a not-found, a used-up, an expired and a revoked one answer the same way |
| the sign of the tree is already created             | `409` | that a tree with such a sign exists                                                               |
| there are more requests from a key than the limit   | `429` | that the requests come too often                                                                  |
| a request without a code or without a sign          | `400` | what is missing                                                                                   |
| the storage is unavailable                          | `503` | that the cargo is not taken in, and the number of the request                                     |
| everything else                                     | `500` | that the cargo is not taken in; the workings of the intake are not retold                         |

Taken in — `201` at a created record of a month and `200` at an updated one; in both cases the intake
names the month and the tree, so that the tree prints that to the owner. At the proposals it names two
more numbers:

| Field of the answer | What it means                                                       |
| ------------------- | ------------------------------------------------------------------- |
| added               | how many proposals landed as records by this request                |
| known               | how many arrived a second time: their sign was already at this tree |

## Data

The storage is Postgres, the schema is edited by migrations. The agreement names no columns and no
indexes: they are in the schema, here is the rule the constraint expresses.

| Entity               | What is in it                                                                                                                                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A tree               | the sign, the readable name, the date of the creating                                                                                                                                     |
| A token of a tree    | the hash, the date of the issuing, the mark of the revocation with a date; a token has one tree                                                                                           |
| A record of a month  | the tree, the month, the counters, the snapshot of the overrides, what was not chosen, the version of the schema, the time of the run                                                     |
| A proposal           | the record of a month, the tree, the text, the sign, the address, the resource, the state, the date of the arrival                                                                        |
| An incident analysis | the tree, the name of the file, the text whole, the state, the date of the arrival, the date of the update                                                                                |
| An invitation        | the hash of the code, the name of the future tree, the time of the issuing, the term of validity, the time of the using up, the time of the revocation, the reference to the created tree |

- **The pair "tree — month" is unique.** A constraint of the storage, not a check in the code: two runs
  from one tree arrive at once, and a check by reading would not set them apart.
- **The pair "tree — the name of the file of an analysis" is unique.** By it an analysis that arrived a
  second time updates the former one.
- **The pair "tree — the sign of a proposal" is unique.** By it the picking out of what already arrived
  is held, and it is held by the storage: two runs of one tree arrive at once, and what the first read
  goes stale before it appends its own.
- **The tree at a proposal stands as a column of its own, it is not read through the record of a
  month.** A constraint of the storage reads the columns of one row, and uniqueness by a field of a
  linked record is not declared.
- **The default of the state is held by the storage, not by the code.** A record created past the intake
  — by a command of the node or by a migration — would otherwise arrive without a state, and whoever
  reads would get emptiness.
- **The set of the values of the state is held by the storage.** A string without a constraint accepts a
  typo, and it is found by whoever reads the list, not by whoever put it there.
- **The snapshot of the overrides and the counters are kept as they arrived.** The intake does not take
  them apart, and columns under every field would drift from the package at its very first edit.

## Screens and states

Not applicable: the intake has no screens. The screens are the subdomain of the reading of what was
taken in.

## Cross-cutting requirements

### Locales

The language is one — Russian; a refusal of the intake is read by the executor of the tree, not by a
guest.

### SEO

Not applicable: the service is closed, and nothing is shown to the search engines.

### Mobile layout

Not applicable: there are no screens of its own.

### Several objects

There are many trees, and each one gets only its own cargo: the operation of the intake works from the
token, not from the passed sign of the tree. The sign named in the cargo is checked against the tree of
the token, and a divergence refuses the intake.

## Decisions

- **The intake of all three kinds of cargo in the first branch.** The kinds differ by the form of the
  record, but not by how they arrive. Rejected: the digest alone in the first branch — then the branches
  become four.
- **The digest of the last run replaces the former one.** A decision of the owner. The windows of the
  runs overlap, and adding up would overstate the numbers silently. Rejected: adding up the counters;
  and keeping the runs apart — it cancels one record per pair "tree — month".
- **An incident analysis goes away as text whole.** A decision of the owner. A header without the
  mechanics of the miss explains nothing, while a rule is derived from an analysis by the mechanics.
- **The sign of a proposal is the hash of its text, and the area of uniqueness is the tree.** Uniqueness
  by a field of kilobytes runs into the limit of the size of a row of an index, and the boundary of a
  month does not protect from a repeat: it arrives in any month. Rejected: uniqueness by the pair "tree
  — text"; a sign appointed by the sender.
- **The answer of the intake is widened, not created as a second one.** The sender already reads this
  answer, and a second request for the sake of the count of the repeats would add the run one more place
  where it tears.
- **The first token is issued by a command of the application itself.** A decision of the owner.
  Rejected: an initial seeding of the storage.
- **The sign of a tree is named as an argument of the command of the creating.** Otherwise the intake
  learns the sign from the cargo and takes what was sent for its own.

## Open questions

The open questions of the domain are shared, and they live in the spec next to it.

## History of changes

- 2026-08-16 — the subdomain was split out of the spec of the domain, which had outgrown the length
  limit. The rules, the scenarios and the bindings of the intake moved here as they were: the scenario
  numbers were not recounted.
- 2026-08-19 — the agreement of the task RT-878 was merged in the part about the issuing: an invitation
  is issued by two ways by one decision, a taken name refuses the issuing and names what it is taken by.
  The scenarios of the issuing stand in the subdomain of the reading: their "Then" names a person and
  what they get on the screen.
