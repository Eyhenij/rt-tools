# The intake of the cargo

**Status:** in force · **Revision:** 2026-08-19 · **Scenario prefix:** `SC-MB`
**Depends on:** `agent-kit` (what a tree knows about itself and what goes outward)
**Laws:** `verifiability`, `code-structure`, `lib-imports`, `delivery`, `observability`,
`frontend-application`, `reuse-first`, `lists`, `entity-editing`, `entity-models`, `navigation`
**Procedures:** none — the operations are declared by the controllers of the intake

## Why

The rules package stands in several trees, and what is used in it is known only to every tree about
itself. The spec of the rules package — `docs/specs/agent-kit/` — described what a tree knows about
itself and what of it goes outward; where exactly it goes it does not describe at all, and the
sending has nowhere to turn.

An open work queue cannot be the intake: the cargo speaks of the working habits of the team — what
is used, what is stumbled over, how many times a miss was admitted. Hence a closed service of one's
own.

This agreement names the intake: what it takes in, what it tells one tree from another by, what it
does with a repeated sending and where it is obliged to refuse instead of staying silent.

It also names the second half of the service — the reading of what was taken in. Reading the cargo
by a request to the database from the node itself can be done only by whoever has access to the
node, while the service goes out into the internet: knowing the tokens of the trees alone, it would
give what was taken in to anyone who reached its address and would not answer the question of who
read it. Hence the entry of a person and the admin application: what a person introduces themselves
to the intake by and what they get after the entry. There are three sections — by the kind of the
cargo.

## Terminology

| Term                                   | What it is                                                                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| The intake                             | A closed service taking the cargo in by a request. One's own work queue, not a foreign one                                            |
| Cargo                                  | What goes away by a run of the sending: a digest with a snapshot of the overrides, proposals, incident analyses                       |
| A kind of cargo                        | One of four: a digest, the observation lines, a proposal, an incident analysis. Each has its own operation                            |
| A tree                                 | A record about a repository the cargo arrives from. Trees are told apart by a sign, not by an address                                 |
| A token of a tree                      | What a tree introduces itself to the intake by. The intake holds only a hash; the token itself is printed once                        |
| A revocation of a token                | A mark that the token is no longer accepted. The token is not deleted: the former cargo is read by it                                 |
| A record of a month                    | The digest of one tree over one calendar month. One per pair "tree — month"                                                           |
| A run                                  | One sending from a tree: up to four requests in a row, one per kind of cargo                                                          |
| A snapshot of the overrides            | The state of the tree at the minute of the run: which sections of which resources of the package it edits and what it did not lay out |
| The version of the schema of the cargo | The number of the format of the request of the intake. It changes when the composition of the fields of the cargo itself changes      |
| The version of the schema of the rows  | The number of the format of a row of an observation at a tree. Several of them meet in one digest                                     |

The second half of the vocabulary is about the reading of what was taken in:

| Term                  | What it is                                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| The admin application | The application a person reads the taken-in cargo by. There are no edits of the cargo in it at all                    |
| An account            | The name and the password of one person. The first is created by the first-run screen, the rest by the people section |
| An entry              | The state in which the intake knows who is asking. It lives by a term and is broken off by an exit                    |
| The term of an entry  | The time after which the entry stops being accepted and the person introduces themselves anew                         |
| A section             | A screen of the admin application with an address of its own. An item of the menu leads into a section                |
| A list                | The page of a section: a row per record, a toolbar above it and a pagination below it                                 |
| A panel of details    | A panel with one record whole, sliding out at a press on a row                                                        |
| A filter              | A condition narrowing the list. It stands in the toolbar and is visible on the screen                                 |
| A page of a list      | A stretch of the list arriving by one request. The number of the page and the size are named by the request           |
| A selection           | The page, the size, the sorting and the filter together. It lives in the address of the section                       |

The third is about where the intake stands and what it is raised by:

| Term                          | What it is                                                                                                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The node                      | A rented machine the intake lives on. It carries no code of its own — only the composition of production and its environment                                            |
| The name                      | The domain name the intake is found by from outside; behind it stands the address of the node                                                                           |
| The proxy                     | A container in front of the intake: it holds the name, issues and renews the certificate, gives back the static of the admin application and the requests to the intake |
| The composition of production | The description of the containers of the node: the database, the rolling of the migrations, the intake, the proxy                                                       |
| A rollout                     | A run that builds the image, puts it into the registry and asks the node to raise exactly that image                                                                    |
| A dump                        | An unloading of the storage by one file: the digest, the trees, the tokens and the accounts whole                                                                       |
| A rollback                    | The raising of the former image by its sha, when the new one did not come up                                                                                            |

The fourth is about what the intake writes about itself:

| Term                 | What it is                                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| A row of the journal | One record of the output of the intake: the name, the level and the fields                                           |
| The name of a row    | The constant part of the record, by which rows of one kind are gathered together                                     |
| The fields of a row  | Everything variable the intake knows about what happened, as an object next to the name                              |
| A taken-apart reason | An error by fields: the class, the text, the code of the storage, its details, the answer of the driver, a cut stack |
| A cleaning           | The replacement of the value of a field by the name of the key before the row went into the output                   |
| A cut stack          | The first lines of the stack — further on goes the harness of the framework, one and the same at every refusal       |

The fifth is about what the intake is put together from:

| Term                        | What it is                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| The client of the storage   | The code of the access to the database that the generator of the schema puts; it does not go into the history |
| The directory of the client | The place the generator puts it into; named in the schema of the storage by the block of the generator        |
| The loss of the client      | There is no directory at all, or there is no entry file in it that the barrel of the lib of the storage calls |
| A refusal of the build      | The build stops before the compilation and prints one line: what is missing and what it is created by         |

### What it is called in the interface

The surface of the intake is the operations of the request and the commands of the launch line; the
interface belongs to the admin application.

| In the agreement             | In the launch line and on the screen                             |
| ---------------------------- | ---------------------------------------------------------------- |
| creating a tree              | `message-bus tree:add <name> <sign>`                             |
| issuing a new token          | `message-bus tree:token <name>`                                  |
| revoking the token of a tree | `message-bus tree:revoke <name>`                                 |
| the list of the trees        | `message-bus tree:list`                                          |
| the first record             | the screen "Первая запись": the name, the password and "Завести" |
| the people                   | the section "Пользователи": creating, disabling, a new password  |
| the entry                    | the screen "Вход": the name and the password                     |
| the exit                     | the item "Выйти" in the header                                   |
| the sections                 | "Разборы происшествий", "Предложения", "Сводки деревьев"         |
| the panel of details         | a panel sliding out at a press on a row                          |

## Rules

The subject rules live in the subdomains — the domain grew to twice the length limit, and reading it
whole for the sake of one detail became dearer than finding it. The boundaries between the
subdomains are the same ones that were drawn by the groups of the rules; a subdomain that outgrows
the limit is split further by the same technique.

- **The scenario prefix belongs to the domain together with its subdomains.** A domain is split when
  its spec has outgrown the length limit, and the scenarios move as they were: the number ties the
  scenario to the title of the test, and a numbering of its own at every subdomain would mean
  recounting all the numbers at once.

| Subdomain                                                               | About what                                                                                                 |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [The intake of the cargo](intake/spec.md)                               | the form of the cargo, the tree and the token, the record of a month, what did not arrive                  |
| [The edit of a state by a tree](cargo-state/spec.md)                    | the bundle of rows of the edit, the order of the transitions, a refused row and the journal                |
| [The quarantine of a disputable record](cargo-quarantine/spec.md)       | the fifth state, the reason at the move and the return into «new»                                          |
| [The closing of a record by a publisher](publisher-cargo-close/spec.md) | the second way to a state: a foreign record, the entry of a person, two steps                              |
| [The reading of what was taken in](admin/spec.md)                       | the entry of a person, the sections of the admin application, the lists, a refusal visible to a person     |
| [The version of the release in the lists](cargo-version/spec.md)        | the column of the version, the filter by it and the order by the numbers of the parts                      |
| [The common page of a list](admin-list-page/spec.md)                    | the look of the page, the slots of the toolbar, the host, the anchors of its elements                      |
| [The node and the delivery](node/spec.md)                               | the name and the road, what it is raised by, what outlives the loss of the node, the build                 |
| [The section of the invitations](invites/spec.md)                       | the list of the invitations, the revocation, the issuing by a panel, the showing of the code once          |
| [The shell of the admin application](admin-shell/spec.md)               | the top row of the sections, the popup of the profile, the theme and the language, the screen of the entry |
| [What the intake writes about itself](journal/spec.md)                  | the row of the journal, the taken-apart reason, the cleaning of the fields                                 |
| [A right, a role and the check that reads them](access-rights/spec.md)  | what a person may do after the entry: the closed set of rights, the role, the pointed edits over it        |
| [The usage of the rules in the sessions](usage/spec.md)                 | the observation lines: the intake of a day whole, the counting by skill over a period, the section         |
| [The list of people](people-list/spec.md)                               | who reaches the cargo: the name, the role, the state of the record and the last sign-in                    |
| [Creating, disabling and a new password](people-editing/spec.md)        | the three edits of a record from the section of people: two panels and a row menu under one right          |
| [Roles and rights on a screen](roles-page/spec.md)                      | the section of roles, the panel of a role and the panel of a person's access, all under `roles:manage`     |
| [The first record](first-run/spec.md)                                   | the first-run screen of an empty node: one public operation creates the owner and signs them in            |

## What is out of scope

The boundaries of the subjects are named in the subdomains. What is shared across the domain:

- **A digest over several trees and charts.** The word of the owner: the lists are shown, and a
  digest is appointed when there are three trees. The usage of one tree over a period is a section
  of its own — the subdomain of the usage; a digest over trees stays out.
- **The edit of the taken-in cargo by a person.** The text, the address and the resource of a record
  are carried by the intake of the cargo, and there is no second way to them. The state of a record
  is edited by the tree with its token — the subdomain of the edit of a state; a person in the admin
  application reads it as a column.
- **Notifications about arrived cargo.** No mail and no notifications: the cargo is read when
  somebody comes for it.
- **The cleaning of old records by a term.** The intake is one's own and small; a term of keeping is
  appointed when the volume becomes visible.

## Contract

The surface is the operations of HTTP and four commands of the launch line. A tree introduces itself
by the header `X-Tree-Token`, a person by the entry; one instead of the other is not accepted. The
operations of the intake are listed in the subdomain of the intake, the edit of a state in the
subdomain of the edit, the operations of the reading in the subdomain of the reading.

### Refusal codes

Not applicable: the intake answers with a code of the answer of HTTP, not with named codes of the
domain. Where it is obliged to refuse instead of staying silent — the tables in the subdomains of the
intake, of the edit of a state and of the reading.

## Data

The storage is Postgres, the schema is edited by migrations. Seven entities: a tree, a token of a
tree, a record of a month, a proposal, an incident analysis, an account, an entry. What is in each of
them and which pairs are unique — in the subdomains that put them.

## Screens and states

The intake has no screens; the screens belong to the admin application — the table of the states is
in the subdomain of the reading. The state of the node is read by two answers and is described in the
subdomain of the node.

## Cross-cutting requirements

### Locales

The language is one — Russian. The intake is read by the owner and the executor, and the labels of
the admin application lie in the dictionary of the application, not in the markup. The labels of the
kit are taken from there too: it has a dictionary of its own in eight languages, and without that the
pagination and the empty state come out in English next to Russian headings. A second language is
cheaper to add later.

### SEO

Not applicable: the service is closed, everything except the screen of the entry stands behind the
entry, and nothing is shown to the search engines.

### Mobile layout

A row of a list on a narrow screen is shown as a card — this is an entry of the table of the kit, not
markup of one's own. A screen put together past it loses the narrow layout silently.

### Several objects

There are many trees, and each one gets only its own cargo: the operation of the intake works from
the token, not from the passed sign of the tree. The sign named in the cargo is checked against the
tree of the token, and a divergence refuses the intake.

A person who has entered gets the cargo of all the trees at that: an account belongs to the service,
not to a tree, and a filter by tree narrows what is shown, not the access.

## Decisions

- **The intake is a closed service of one's own.** A decision of the owner. The work queue of the
  repository of the package is open to the whole world. Rejected: a private repository instead of a
  service — the role sorting out the need proposed exactly that, the owner read the argument and
  confirmed the decision.
- **Three branches, not one.** A decision of the owner. It rolls back apart: the intake without the
  admin application makes sense, the admin application without the intake is unexecutable. Every
  branch has its own task in the work queue, and it is created before its branch. Rejected: one
  branch for everything; and two branches.
- **The intake of all three kinds of cargo in the first branch.** The kinds differ by the form of the
  record, but not by how they arrive. Rejected: the digest alone in the first branch — then the
  branches become four.
- **The layers of the family of the backend — `api`, `data-access`, `feature`, `util`.** A decision
  of the owner, copied from the sample tree word for word; it closes `Q-2` of the epic. The tag and
  the alias are derived from the path of the lib, as the check of the layout demands. Rejected: the
  same layers with tag names of their own.
- **The specs of the new applications and libs are run by Vitest.** A decision of the owner. The
  packages in `projects/` stay on Jest, the boundary goes by the directory. Rejected: Jest
  everywhere.
- **An incident analysis goes away as text whole.** A decision of the owner; it closes `Q-14` of the
  agreement of the package. At the merge two articles of the spec of the sender are rewritten: about
  the check for the address of the tree covering the whole cargo, and about the issuing of a token
  from the admin application. Rejected: one header; and the text with a check for the address of the
  tree.
- **The digest of the last run replaces the former one.** A decision of the owner. The windows of the
  runs overlap, and adding up would overstate the numbers silently. Rejected: adding up the counters;
  and keeping the runs apart — it cancels one record per pair "tree — month".
- **The law on observability is laid out by this branch, the rule of the API layer stays dropped.** A
  decision of the owner. The journal of the refusals is needed from the first live run; the rule of
  the API layer demands procedures of Connect, and there will be none here.
- **The first token is issued by a command of the application itself.** A decision of the owner. It
  will stay after the admin application too — for the first account. Rejected: an initial seeding by
  Prisma.
- **The sign of a tree is named as an argument of the command of creating — an assumption of the
  executor.** The argument: otherwise the intake learns the sign from the cargo and takes what was
  sent for its own. It is cancelled by one edit.
- **An analysis is recognised by the name of its file — an assumption of the executor.** The heading
  is edited together with the text, the name of the file outlives the edit. Open as `Q-19`.
- **The sign of a proposal is the hash of its text, and the area of uniqueness is the tree.** An
  argument of the executor: uniqueness by a field of kilobytes runs into the limit of the size of a
  row of an index, and the boundary of a month does not protect from a repeat — it arrives in any
  month. It closes `Q-16`. Rejected: uniqueness by the pair "tree — text"; a sign appointed by the
  sender — it would have to be kept in the file of the proposal, that is, right where the mark lives
  that is lost at a switch of the branch.
- **The answer of the intake is widened, not created as a second one.** The sender already reads this
  answer, and a second request for the sake of the count of the repeats would add the run one more
  place where it tears.
- **The entry is by a password, and the accounts are created from the screens.** The service goes
  out into the internet — an entry is needed. Until the people section came, the records were
  created by commands of the launch line; with the section and the first-run screen in place the
  commands were removed as a second way in nobody checked.
- **Three list screens, not one.** The word of the owner on a divergence brought by an analysis: the
  analyses, the proposals and the digests by one piece of work. Rejected: one screen with the harness
  paying off on it. The price: the branch is longer, and a rollback carries away all three.
- **The look of a list screen is a requirement of the acceptance.** The word of the owner: a table
  with a toolbar and a pagination, a press on a row opens the panel of details. What is put together
  otherwise is not accepted.
- **The end-to-end set of scenarios is created by this work.** The word of the owner on a divergence:
  the rule `testing` demands such a set for a scenario whose "Then" names a person and what they get
  on the screen, and there is none in the tree at all. Rejected: closing the promise with units and
  measurements. The price: a stand from the production build, a seeding of the database and a run by
  one worker — work of a noticeable size.
- **Five laws are laid out: on the list of records, on the edit of an entity, on the models of the
  entities, on the navigation and on the access.** The word of the owner: the four named by them and
  the law on the access on top of that — the work creates an entry, and the law under it stood
  dropped. The price: at the rules of the edit of a record and of the navigation the companions will
  come out of the lines "not carried out", and they will have to be kept up at every check of the
  specs.
- **The entry is carried by a cookie unavailable to scripts.** The admin application and the intake
  are given from one name, so the cookie has no second source; a foreign transition does not send it.
  Rejected: a header with a token — it demands keeping the value where the script of the page
  reaches.
- **The giving of the application itself is not guarded by the entry.** Closed static is the proxy,
  and it is in a separate task; without cargo the application is empty. The price: the address of the
  admin application is visible to anyone.
- **The text of the cargo is shown as text.** A tree with a token would otherwise get the execution of
  its markup in the browser of whoever entered. Rejected: showing it as marked-up text with a
  cleaning — the cleaning costs more, and the readability wins little from it.
- **The selection lives in the address.** Otherwise the rule about a reload is broken to the letter.
  The price: taking apart and putting together the parameters of the address at every section.
- **The order by default is the fresh ones on top, the second key is the identifier of the record.**
  Without the second key records with equal time jump between the pages.
- **A refusal of the reading takes the place of the list, it is not served as a toast.** A divergence
  with the rule of a list screen, named as a divergence: a toast goes away by itself, and a person
  who came back to the screen has nothing to repeat it by. The reason, the number of the request and
  the repeat stand in the place of the table.
- **The number of the attempts of the entry is not limited, and the answer is lengthened — an
  assumption of the executor.** There is nobody to unlock a locked record: there is no admin
  application of the accounts. It is cancelled by one edit.
- **The language is one and the theme is one — an assumption of the executor.** Within the boundaries
  of the work the owner did not name them. It is cancelled by one edit, while the labels lie in the
  dictionary.
- **The first record is created by a public first-run operation, and it closes for good with the
  first record.** Without it an empty node has no way in at all: the people section needs an
  entry, and there is nobody to enter. Rejected: keeping one command of the launch line for the
  first record — a second way in that lives on the node and that no screen checks.
- **The proxy is taken as a ready image, it is not installed on the node by a package.** Everything
  that lives on the node is raised by one composition: a package installed by hand outlives the
  recreating of the node only in the memory of whoever installed it.
- **The domain is taken whole, the intake stands at the root.** A decision of the owner, taken before
  this work.
- **The secrets of the node lie as a file on the node itself, not in the pipeline.** The pipeline
  knows which node to go to and by which key, but knows neither the password of the database nor the
  keys of the service: the rollout is edited more often than the password, and every edit of it would
  otherwise touch the secrets.

## Open questions

- `Q-17` — how long the cargo is kept. A term is appointed when the volume becomes visible; until
  then nothing is deleted.
- `Q-18` — whether the cargo of a tree whose token is revoked is read in the admin application. The
  refusal of the intake is decided; the reading of the former cargo the work of the admin application
  did not decide — it shows it.
- `Q-19` — what an incident analysis is recognised by. The work goes by the assumption "by the name
  of the file". An analysis renamed at the tree will arrive as a second copy, and that is the price of
  the assumption.
- `Q-20` — whether all the analyses go away by every run or only the new ones. The selection is
  appointed by the sender, and until its edit the intake takes in as many as were sent; at a growth of
  the number of the analyses the cargo will run into the limit of the weight.
- `Q-21` — how long an entry lives and whether it is renewed by the work of a person. The work goes by
  the assumption "twelve hours, no renewal"; the number is named by the owner, and it changes by a
  setting.
- `Q-22` — what to do with a proposal whose text was edited after the sending. It arrives as a new
  record; there is nothing to sew them together by while the proposal has no name outliving an edit of
  the text.
- `Q-25` — which properties of a record stand as columns at each of the three sections. The work goes
  by an assumption: at the analyses — the tree, the name of the file, the state, the time of the
  arrival and the time of the update; at the proposals — the tree, the resource, the address, the
  state, the time of the arrival; at the digests — the tree, the month, the number of the sessions,
  the time of the run.
- `Q-26` — what the rollout does when the probe of liveness did not wait for an answer. Now it
  declares itself refused and leaves the node with the new image; the rollback stays the hand of a
  person. The bringing back of the former sha itself is described, but who calls it — a person or a
  run — is decided by the very first real breakage, not in advance.
- `Q-28` — whether to keep the command `tree:invite` after the issuing appeared in the admin
  application. For now it stays: the node is available to the owner also when the admin application is
  not raised.

## History of changes

- 2026-08-14 — created by the analysis of the request of the owner about the second task of the epic
  `docs/plans/agent-kit-observations.md`.
- 2026-08-14 — brought to an adversarial analysis: the contract named the operations, the header of
  the token and the mandatory fields; the rules named the fate of the record of a month at a repeated
  run, the reissuing of a token, the order of the operations, the race, the journal of the refusals
  and the recognising of an analysis.
- 2026-08-14 — merged into the spec of the domain: the intake takes in cargo of three kinds, the
  commands of the trees are carried out, a live run from the tree of the package went through. Every
  rule is bound to code in `implementation.md` next to it.
- 2026-08-15 — the agreement about the sign of a proposal was merged: a proposal is recognised by the
  hash of its text, the uniqueness is held by the pair "tree — sign", and the answer of the intake
  names how many records lay down and how many already lay there. `Q-16` was closed, a question about
  a text edited after the sending was created.
- 2026-08-15 — the agreement about the entry and the reading of the taken-in cargo was merged: the
  entry of a person by a password, four commands of the accounts, three sections of the admin
  application with a list, a filter by tree and a panel of details. The number of the question about
  the edited text of a proposal became `Q-22` at the merge: `Q-21` was taken by the question about the
  term of an entry, which the code refers to.
- 2026-08-16 — the agreement about the rented node was merged: the name and the protected road, the
  raising of a ready image by its sha, the rolling of the migrations before the answer of the intake,
  the probe of liveness as the sign of a rollout that succeeded, the depth of the rollback of three
  sha, a named volume under the storage and a dump by one command. The line "the rollout, the
  certificate, the proxy and the node" left "What is out of scope": all of that is in scope now. The
  number of the question about the behaviour of the rollout at a silent probe became `Q-26` at the
  merge.

- 2026-08-16 — the agreement about the details of a refusal was merged: the row of the journal became
  machine-readable with a constant name and fields, a taken-apart reason with the code of the client
  of the storage and the answer of the driver was added to a breakage, the fields are cleaned by the
  name of the key before the output. A refusal by the input is written without a stack. A storage of
  the refusals and a screen for the owner stayed out of scope.

- 2026-08-16 — the agreement about a build without the client of the storage was merged: the presence
  of the client is asked about before the compilation, the loss ends with one line with the directory
  and the command it is created by, a directory without an entry file counts as a loss on a par with
  an absent one. The cache of the builds, launching the generator instead of a refusal and checking
  the client against the schema stayed out of scope.
- 2026-08-19 — the task RT-878 gave the section of the invitations an entry of creating and a panel of
  the issuing. That closed `Q-27` — whether a list page needs an entry of creating: it is needed by
  one section, the one that creates a record, and it is at that one alone. The number of a closed
  question is not issued anew.
- 2026-08-20 — the agreement about the state of a record of cargo was merged: an analysis and a
  proposal got a state of four values, an arrival with another text brings an analysis back into
  "new", the reading gives the state back by a page and by one record, and the sections of the
  analyses and of the proposals show it as a column. `Q-30` was created — the order of the transitions
  is named, and there is nothing to guard it with yet.
- 2026-08-20 — the task RT-909 created the subdomain about the edit of a state by a tree: a tree moves
  its records of cargo by one request with its token, an unfit row refuses itself, not the bundle, and
  lands as a row of the journal. That closed `Q-30` — the order of the transitions is guarded by the
  edit of a state. The number of a closed question is not issued anew. The agreement was not merged
  into the spec of the intake: together they outgrew the length limit.
- 2026-08-22 — the task RT-987 created the subdomain about the version of the release in the lists:
  the column "В какой версии" at both sections of the cargo, a third filter in the strip and an order
  by the numbers of the parts, not by the letters of the string. The agreement was not merged into the
  spec of the reading: together they outgrew the length limit.
- 2026-08-28 — the task RT-1514 created the subdomain about the closing of a record of cargo by the
  publisher of an edition: the state of a record got two ways — its own tree moves it by the token,
  and whoever's edit entered the edition closes it under the entry of a person, over the two last
  steps and only forward. The record is named at that by the sign from the reading, not by the key of
  the sender, and carries the sign of whoever closed it: the sender otherwise reads a released record
  as its own mark. The agreement was not merged into the spec of the edit of a state: the operations
  have different ways of introducing themselves and a different order of the transitions, and together
  they outgrew the length limit.
- 2026-09-10 — the task RT-1899 created the subdomain about the list of people: the receiver answers
  with a page of accounts — the name, the role, the state and the last sign-in — and the admin panel
  shows them as a fifth section. Both sides are closed by the right `accounts:read`: without it the
  item is not in the row and the address does not open. The agreement was not merged into the spec of
  the rights: that one describes what a person may do after the entry, and together they outgrow the
  length limit.
- 2026-09-15 — the task RT-1900 created the subdomain about the editing of people: creating a
  record, a new password and disabling from the section of people under `accounts:manage`.
- 2026-09-15 — the task RT-1901 created the subdomain about roles on a screen: the section of
  roles, the panel of a role and the panel of a person's access under `roles:manage`. The open
  question of the rights about where roles come from is closed by it.
- 2026-09-15 — the task RT-1902 created the subdomain about the first record: the first-run screen
  of an empty node and one public operation behind it. The four account commands of the launch
  line were removed with it.
