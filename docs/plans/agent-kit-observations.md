# The feedback of the rules layer: the observations, the overrides, the sending

The package of the rules stands in several trees of the team, and the edits into its texts come from
the head of whoever writes them. What of what is laid out is used every day, what was not used once,
which section of which rule a tree rewrote for itself — is unknown to the package. The epic closes
this blindness.

The grill of the request of the owner lay as the record RT-496-feedback-loop.md: its term ran out,
and it can be found by the name of the file in the history.

## What already stands and works

| What                          | Where                                                                                             | The state                                                                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| the write of the observations | `projects/agent-kit/assets/hooks/observe.sh`                                                      | JSONL, a file per day, the cleaning of the values, the sign of the session is hashed, the path is not written at all                             |
| who emits                     | `skill-loaded.sh`, `skill-gate.sh`, `docs-guard.sh`, `git-guard-main.sh`, `git-guard-delivery.sh` | five guards, three kinds of an event: a loading of a rule, a refusal of the gate, a refusal of a guard                                           |
| the digest                    | `projects/agent-kit/src/lib/observations.ts`                                                      | the loadings, the refusals, the kinds of an edit, the guards, what was never loaded once, the term of the keeping is thirty days                 |
| the proposals                 | `projects/agent-kit/src/lib/proposals.ts`                                                         | a block per proposal, three addresses, a check of the text against the address of the tree                                                       |
| the sending                   | `projects/agent-kit/src/lib/ship.ts`, `shipment.ts`                                               | the gathering of the cargo of three kinds and a query into the intake; the snapshot of the overrides and what is not chosen are counted in place |
| the admission of a miss       | `projects/agent-kit/assets/hooks/postmortem-guard.sh`                                             | it catches by samples, demands a record about an incident on the same day                                                                        |

## What is missing

- **In the line of an observation there is no sign of the tree.** The cargo carries it — it is counted
  at the minute of the sending — but the line itself on the disk does not tell the trees apart, and
  there is nothing to take the archive of the past days apart by.
- **The format of the line is not versioned.** The version of the package is written, but not the
  version of the schema: the digest will break at a change of the fields silently.
- **The guard of an incident emits no observations.** The mechanism of the catching stands, the number
  of the incidents over a stretch is unknown to the digest.
- **The words of a person mid-work get no address.** The proposals are laid by the step of the review
  of a closed task, that is, after the fact.

Closed since this was written: the snapshot of the overrides and what is not chosen are counted by the
layout at the minute of the sending and leave with the digest; the cargo leaves at every run, not in
tow of a proposal. There is somewhere to roll the cargo out to — the receiver lives on a rented node
under a name of its own, with a protected connection and a rollout by the sha of the commit; the
agreement about that is merged into the spec of the domain.

## The tract

An observation is written onto the disk of the tree, the digest is gathered on demand and leaves by a
query to a closed receiver. The receiver is its own: the work queue of the repository of the package is
open to the whole world, and the digests in it would lay out the working habits of the team outward.

```
a hook during the work  →  a file on the disk of the tree  →  the digest  →  a query  →  the receiver
     bash, printf              .jsonl per day                    Node          HTTP      NestJS, Postgres
```

**The write.** A guard at the end of its work calls the write of an observation, and it appends a line
into the file of the day. Without locks, without a parsing, milliseconds. A breakage of the write lets
the action through: a guard that fell on an observation would stop the work for the sake of statistics.

**The overrides are not written by an event.** They lie on the disk and change once a month — that is a
state, not a stream. The digest reads the directory of the overrides at the minute of the output, takes
it apart into sections and compares with the resource of the package: replaced, appended, removed. The
source is one, there is nothing to diverge.

**The digest.** It reads the observations over a stretch, the directory of the overrides and the
setting of the tree, and gives back one object. It does not go into the network.

**The sending.** The launch line of the package sends the cargo by an ordinary query with the token of
the tree. One record per pair "a tree — a month": found — it is appended to, not found — it is created.
An instrument of the agent is not needed for this, and the sending works where there is no agent at all.

**The cargo of three kinds.** The digest of the observations, the proposals about the rules layer and
the reviews of the incidents. The proposals the package already knows how to send; the reviews now
leave for nowhere at all and lie only in the tree where they happened.

**The receiver.** An application of this monorepo on NestJS: the types of the cargo are common with the
package, and the format will not diverge silently. The storage is a Postgres next to it, in a volume of
its own. The access is by a token, the registry keeps only the hashes; in the variables of the
environment and in the rollout there are no tokens.

**The admin application.** An application on Angular over the tree's own kit. It shows the lists of the
reviews of the incidents and of the proposals; a click on a row opens a panel of the details. The entry
is by accounts with a password; the first is created by the console, further on it creates the rest and
gives out the tokens to the trees. There are no edits of the cargo from the web: the receiver takes in,
the admin application reads.

**The rollout.** A launch of the working flow by hand. A merge into the main branch rolls nothing out
here — it publishes the packages, and the receiver does not change that.

## What leaves outward

The law about the checkability demands that an observation carry out nothing apart from what is common
to all, and that this be held by a check on the carrying-out side. Hence the composition of the line:
the name of a resource of the package, the kind of the event, the kind of the edit, the version of the
package, the version of the schema, the sign of the session and the sign of the tree. A value with a
slash is not written at all — a path is never carried out under any circumstances.

The overrides have a subtlety of their own. The heading of a replaced or a removed section is the
package one, it is common to all and is carried out. The heading of an appended section is composed by
the tree and may name anything: only the count of them travels outward.

## Decisions

- **The digest is the cargo, a proposal is what is attached to it.** Before, the sending was built
  around a proposal, and the figures went as a backing, and a run without remarks lost the data. The
  limitation is lifted by a decision of the owner.
- **The mechanism gets a receiver of its own.** The work queue of the repository of the package is open
  to the whole world, and the digests in it would lay out the working habits of the team outward. A
  closed receiver at the same time lifts the question of the access: a token is given out to a tree,
  and nobody needs rights in the repository of the package.
- **The receiver is written on NestJS and lies in this monorepo as an application of its own.** The
  types of the cargo are common with the package, the runs, the linters and the layout are already set
  up. No second language is created in the tree.
- **The digest leaves by an ordinary query from the launch line of the package, not by an instrument of
  the agent.** Plugging the receiver into the agent in every tree is not needed, and the sending works
  where there is no agent at all.
- **The storage is Postgres, not a database on a file.** It cancels the former decision: the lists, the
  selection and the growth of the number of the trees lie on it without a rewriting of the storage.
- **The receiver has an admin application on Angular over the tree's own kit.** The kit is released here
  too, and the admin application becomes its first live consumer inside the repository.
- **The entry into the admin application is by accounts with a password.** One common token does not
  answer the question who looked at what, and its change knocks everybody out at once.
- **The cargo is of three kinds: the digests, the proposals, the reviews of the incidents.**
- **The receiver stands on the smallest rented node at DigitalOcean, in Singapore.** It closes the
  former open question of whom the node is rented from.
- **The rollout is a launch of the working flow by hand, not a consequence of a merge.**
- **A periodic gathering by a command of its own is not created.** Its place is taken by the step of the
  review of a closed task: a second command one has to remember does not live to the second month.
- **A personal switch over the setting of the tree is not created.** The team is one, the setting of the
  tree is enough.
- **The measurement of the time of a session and of the spending of the tokens is not gathered.**
- **No new kinds of events are created.** The observations are emitted by the guards that already catch
  their own.

## The tasks

What is divided is what rolls back apart: a write without a sending is meaningful, a sending without a
write is unexecutable.

### The first — what is written

The overrides in the digest, the sign of the tree, the version of the schema of the record, an
observation about an incident. It depends on nothing.

It is closed when the digest on this tree names by name which section of which rule is replaced,
appended and removed, shows the number of the incidents over a stretch and the sign of the tree; the
sets of the scenarios of the package are green; in the machine-readable digest there is not a single
path.

### The second — where the cargo arrives

The receiver and its admin application: the taking in of the cargo of three kinds, the summary by the
trees, the registry of the tokens, the accounts, the lists of the reviews and of the proposals with a
panel of the details. It is written in parallel with the first — the only thing common to them is the
description of the format of the cargo.

It is closed when the receiver, raised on a machine of its own, takes in the cargo by a token, refuses
without a token and with a revoked one; the admin application shows the lists of the reviews and of the
proposals, and a click on a row opens a panel; the sets of the scenarios of both applications are green.

Closed by three branches. The first: the receiver takes in three kinds of the cargo, the commands of
the trees give out and revoke the tokens, the sending side of the package is put together and run live.
The second: the accounts, the entry by a password and four commands of the records. The third: the
admin application — three sections with a list, a selection by the tree and a panel of the details, an
end-to-end set of twenty-seven specs and a stand of its own from the production builds.

What it ended with: the cargo taken in by the receiver is read by a person from a screen — the very
thing the line was created for. Open stayed the count "how many trees edit this place": it waits for a
third tree, not for code.

### The third — where the receiver stands

The rented node: the name, TLS, the rollout by a launch of the working flow, a volume under the
database, the unloading and the loading of a dump. It demands the second.

It is closed when the cargo from this tree reaches the receiver by the name, outlives a restart of the
node, and the loading of a dump gives back both a summary and the fitness of the issued tokens.

### The fourth — what sends

The step of the review of a closed task sends the digest to the receiver: the sending without
proposals, an updatable record per pair "a tree — a month", a command of the feedback from a person
mid-work. It demands the first three.

The sending side is created by the first branch of the second task whole, all three kinds of the cargo:
the stage of the live run demanded a real sending by the package. The command of the feedback mid-work
that was left after it is created by the task RT-714: the word of a person lands as a block in the file
of the day — the same the review of a closed task writes into — and leaves by the ordinary sending.

It is closed when a run of the review of a closed task sends the digest even at an empty file of the
proposals, a second run in the same month appends to the former record instead of a new one, and the
summary shows the sections rewritten by more than one tree.

What it ended with: the word of a person mid-work no longer dies together with the session — the command
lays it as a block into the file of the day, and it leaves by the ordinary sending, on a par with the
findings of a review. A run on this tree showed that: the file of the day is created from the sample,
the blocks in it landed side by side, fifteen proposals were taken in by the receiver in one run.

The line at that stays open by one sign, and it is not about the code: the summary will show the
sections rewritten by more than one tree only when the trees become more than one. It waits for a third
tree, not for an edit.

## What this line does not do

- It creates no background sending: into the network goes only what is called by a person.
- It gathers no content of an override — from it travel the resource, the section and the kind of the
  edit.
- It creates no instrument of the agent for the receiver: the cargo leaves by the launch line.
- It edits no cargo from the web: the receiver takes in, the admin application reads.
- It releases no new edition of the package: a release is a decision of the owner.

## Open questions

- **Q-2. What the layers inside the family of the backend are called. Closed.** Four: `api`,
  `data-access`, `feature`, `util` — read at the sample tree by a walk of the directories and copied
  verbatim. The tag is `scope:` plus the path from `libs/` with hyphens, the boundaries are written out
  by a line per edge in `eslint/boundaries/domains/message-bus-api.config.mjs`.
- **Q-3. What of a review of an incident leaves — the header or the text whole. Closed.** The decision
  of the owner: the text whole. The intake is closed and one's own, and a header without the mechanism
  of the miss explains nothing. The check against the address of the tree does not cover this kind of
  the cargo — a review by its device names the files of the tree where the miss happened.
- **Q-4. What the certificate on the node is issued and renewed by. Closed.** It is issued and renewed
  by the reverse proxy itself standing before the receiver: there is no ACME client of its own and no
  timing of its own on the node. A renewal hanging on a timer of its own breaks silently, and one learns
  of that by an unavailable receiver three months later.

Closed:

- **Q-1. From whom the node under the receiver is rented.** Closed by a decision of the owner:
  DigitalOcean, the smallest node, Singapore.
