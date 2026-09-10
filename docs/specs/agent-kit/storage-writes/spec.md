# Writing to the storage

**Status:** in force · **Revision:** 2026-09-10 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `verifiability`, `work-conduct`
**Procedures:** none

## Why

An edit of data is the only action an edit of code cannot undo. A delete by a mask one day carries
the real records away together with the trial ones: the mask matches wider than the author of the
query expected, and that is learned from the restore out of a copy.

Hence the subdomain: it names what counts as writing to the storage, what of it is refused outright,
what is asked about and what passes as reading. The guard of the second development server is a
neighbouring subdomain: the subject there is the ports of the machine, not the data.

## Terminology

- **A write** — everything that can change the content or the schema: a verb of a query, a delivery
  of a file, a pipeline into the client, a restore out of a dump, a command of the schema tool.
- **The destructive for certain** — emptying a table whole, an edit of the schema, a recreation of
  the database, a restore that deletes the objects first.
- **The production storage** — an address or an editor connection the tree named as production.
- **A throwaway database** — a copy raised for the time of one check on a port out of the range the
  tree set aside for them.
- **Addressing by identifier** — a condition by the primary key: it touches exactly as many rows as
  are listed, and a miss in it is visible before the execution.
- **The marker** — the word `destructive-ok` in the text of the query together with an explanation
  of why addressing by identifier does not fit.

### What it is called in the interface

The guard has no interface: only the executor sees it — as a refusal or a question in their own
turn.

## Rules

- **There are three levels, and the boundary between them is the price of a miss.** The destructive
  is refused, the rest of writing is asked about, reading passes. Only the owner's word decides on a
  data edit, and the guard's business is not to let it through in silence.
- **Rows are addressed by the primary key.** A condition by anything else may match wider than
  intended; without a condition at all the query touches the whole table.
- **A condition by a foreign key is asked about, not refused.** The guard sees the column name and
  not the schema, so it cannot tell a key of its own from a foreign one — but the warning names what
  falls under the query.
- **The addressing is looked for in the tail after the last `where`.** An assignment in the set part
  otherwise reads as addressing, and a query touching a whole section looks addressed.
- **On the production storage a read is proven, not guessed.** Sealing the forms of a write one by
  one leaves the neighbouring one open every time, so the question is turned around: a call passes
  only when the guard recognised it as a read, and each call of a chain is judged apart.
- **A write to production is refused without a bypass.** The schema there is changed by a migration
  through the rollout, the data by the owner's hands; the marker lowers nothing.
- **A delivery whose content the guard does not see counts as a write.** A file, a pipeline from a
  source into the client and a restore out of a dump name no verb at all, and by the verb alone they
  passed all three levels.
- **Taking a dump is a read, and it is judged in the segment of its own call.** Judged over the
  whole command, one mention of it took the protection off every other call of the chain.
- **A command that delivers nothing to the server is not parsed at all.** A search across the tree
  and a commit whose message holds the words of a query are read by the guard as a query, and going
  around that means spoiling the search pattern rather than the work.
- **Applying migrations to a local address passes, to production is refused, to any other is asked
  about.** A question at every routine application stops being read together with the one question
  that mattered; so the address is resolved, not guessed.
- **A migration passes only when it is the sole write of the command.** In a chain an early exit
  would take the check off the second link, and that is exactly the bypass the guard is written for.
- **A throwaway database is asked nothing.** There is no data there worth guarding, and it is torn
  down right after the check.
- **The marker lowers a refusal to a question and never lifts it.** The last word stays with the
  owner; what the guard owes is not to let the query through in silence.
- **Everything the guard could not parse passes.** No input parser, a missing helper, a foreign
  tool, an empty input: a broken check has no right to jam the work.

## What is out of scope

- The schema of the storage itself and its migrations: the guard judges the query, not the model.
- Reading the data and conclusions from it: the guard lets a read through and says nothing about it.
- Access to the machine where the storage lives: that is the business of the delivery guards.

## Contract

The surface is the agent's event before a shell command, a query through the editor connection, a
terminal call of the editor and the universal executor. The answer is a field of the reply: a
refusal, a question or silence.

### Refusal codes

Not applicable: the guard answers before the call is carried out, and such an answer has no command
exit code of its own.

| What happened                                   | How it ends | What it says                                   |
| ----------------------------------------------- | ----------- | ---------------------------------------------- |
| an edit of the schema or an emptying of a table | a refusal   | to address the rows by the primary key         |
| a delete or an edit without a condition         | a refusal   | that the query touches the whole table         |
| a condition not by an identifier                | a refusal   | that the condition may match wider             |
| a write to the production storage               | a refusal   | that production is edited by the owner's hands |
| a migration to the production address           | a refusal   | that the rollout applies migrations itself     |
| a condition by a foreign key                    | a question  | what falls under the query                     |
| the rest of writing                             | a question  | to check which rows are touched                |
| a connection unknown to the guard               | a question  | that the target of the query is not recognised |
| a read, a throwaway database, a foreign command | a pass      | nothing                                        |

## Data

There is no storage of its own. The production addresses, the connections of both kinds and the
range of throwaway ports are read from the tree profile; the address of a migration is resolved from
the command, from the environment and from the environment file next to the working directory.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

The guard lets the action through when it is itself broken. Its parsing lives in four helpers next
to it, and a missing one ends the call with a pass on a par with a missing input parser.

### Locales

Not applicable: the refusal texts are single-language.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The guard is one for all trees, and the addresses and connections arrive from the tree. A tree that
named no production storage loses the production tier and keeps the rest; the package has no
addresses of its own.

## Decisions

- **On production a read is proven, not a write forbidden.** Rejected: a list of prohibitions —
  every form of a write sealed leaves the neighbouring one open.
- **A condition by a foreign key is a question, not a refusal.** Rejected: refusing it — the guard
  does not see the schema, and a refusal would fall on lawful queries.
- **The address of a migration is resolved, not asked about.** Rejected: an unconditional question —
  on a local database migrations are run all the time, and a question at each adds nothing.
- **The parsing lives in four helpers next to the guard.** Rejected: one file — the guard had reached
  its length limit, and the subjects of the parsing are separable.

## Open questions

The open questions of the domain are shared, and they live in the spec next to it.

## History of changes

- 2026-09-10 — the subdomain was created. The guard stood in the package with neither an article nor
  a probe: its behaviour was held by the code and by the comments in it.
