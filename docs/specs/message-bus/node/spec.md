# The node and the delivery

**Status:** in force · **Revision:** 2026-08-16 · **Scenario prefix:** `SC-MB`
**Depends on:** none
**Laws:** `delivery`
**Procedures:** none — the subdomain is about where the service stands, not about its operations

A subdomain of the domain "the intake of the cargo": where the intake stands, what it is raised by,
what outlives the loss of the node and what it is built by. What is shared — the terminology of the
domain, the cross-cutting requirements and the decisions — lies in the spec of the domain next to it.

## Why

A service living on the machine of the owner takes cargo in only when that machine is switched on,
and the trees have no address to reach it by. So the intake stands on a rented node, behind a name of
its own and a protected connection.

Here: what the node is raised by, what on it outlives the recreating of the containers, what a new
edition is rolled out by and what the build answers to the loss of what is generated outside the
history.

## Terminology

The vocabulary of the domain whole is in the spec next to it. Here only what lives on the node:

| Term                          | What it is                                                                                                                                               |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The node                      | A rented machine the intake lives on. It carries no code of its own — only the composition of production and its environment                             |
| The name                      | The domain name the intake is found by from outside; behind it stands the address of the node                                                            |
| The proxy                     | A container in front of the intake: it holds the name and the certificate, gives back the static of the admin application and the requests to the intake |
| The composition of production | The description of the containers of the node: the database, the rolling of the migrations, the intake, the proxy                                        |
| A rollout                     | A run that builds the image, puts it into the registry and asks the node to raise exactly that image                                                     |
| A dump                        | An unloading of the storage by one file: the digest, the trees, the tokens and the accounts whole                                                        |
| A rollback                    | The raising of the former image by its sha, when the new one did not come up                                                                             |
| The client of the storage     | The code of the access to the database that the generator of the schema puts; it does not go into the history                                            |
| A refusal of the build        | The build stops before the compilation and prints one line: what is missing and what it is created by                                                    |

### What it is called in the interface

The node has no interface of its own: its state is read by the probe of liveness, by the output of the
containers and by the answer of the browser to the name.

## Rules

**The name and the road to the intake.**

- **The intake answers only over a protected connection.** The token of a tree goes as a header, and
  over an open protocol it is read by anyone standing along the road. A request over the open protocol
  is not refused but led away to the protected one: a tree set to the old address must learn of it by a
  move, not by a refusal.
- **The certificate is issued and renewed by the proxy itself.** A renewal hanging as a separate timer
  breaks silently, and it is learned of by an unavailable intake three months later.
- **Outward the node opens only the two ports of the road.** Neither the database nor the intake itself
  publishes ports outward: they can be reached only through the proxy, and the database only from the
  node itself.
- **The admin application and the intake answer from one name.** The entry of a person lives by a
  cookie of its own address, and an admin application given from another name arrives at the intake
  without an entry. The static is held by the proxy: the intake does not give it at all, and a second
  container for the sake of giving files is not created on a node with 961 MB of memory.
- **The address of a section of the admin application opens by a direct link.** There is no file at
  such a path in the build, and a proxy that answered it with a refusal would show as broken the
  intake, which has nothing to do with it.

**What it is raised by.**

- **The node raises a ready image, it does not build it at its own place.** The node has 961 MB of
  memory: the build either does not fit or pushes the database out. The pipeline builds, the node pulls
  what was built.
- **The image on the node is recognised by the sha of the commit, not by a moving tag.** A tag falls
  behind the main branch, and the node silently stays on the former version, going on answering.
- **The migrations are rolled before the intake starts answering.** An intake raised next to a database
  that was not updated answers with a refusal to every request, and that looks like a breakage of the
  intake, not like an unfinished rollout.
- **The rollout starts by the hand of a person, not by a merge.** A merge into the main branch goes
  several times a day, and every one of them would restart the intake in the middle of the taking in of
  cargo.
- **The rollout ends with the probe of liveness, not with the raising of the containers.** A raised
  container and an answering service are different statements: between them lie both the rolling of the
  migrations and the connection to the database.
- **After a successful probe the node keeps the three last sha.** An image marked by a sha is never a
  dangling one, and the general cleaning does not touch it; the depth of three is what is rolled back
  to when a breakage is noticed two rollouts later.
- **The cleaning picks the images by the name of its own registry, not by the age.** The database and
  the proxy are old by definition, and a cleaning by the age would carry the storage away together with
  them.

**What outlives the loss of the node.**

- **The storage lies on a named volume, not inside a container.** The container is recreated by every
  rollout, and a storage inside it lives exactly until the first one.
- **The containers come up by themselves after a restart of the node.** The node is rebooted by an
  update of the kernel and by a fall at the provider, and an intake waiting for the hand of a person
  stays silent until somebody notices.
- **The dump is taken and loaded by one command each.** An unloading put together from four calls by
  memory is taken on the day it is written, and never again.
- **A loaded dump brings back both the digest and the validity of the issued tokens.** The token of a
  tree lives in the same storage: a dump that brought the cargo back without the tokens leaves the
  trees without the right to send.
- **The loading of a dump is checked on a one-off database next to it, not on the live one.** There is
  no second node, and a rollback after a loading that did not succeed would go by the very way that is
  being checked. The probe is one command: a database by the same image and environment, the same way
  of loading, a count of the rows and a fingerprint of every table against the live database; a
  divergence names the table. Without a file the probe takes a fresh dump itself, and cargo that
  arrived between the unloading and the check does not paint the probe.
- **The dump is taken by a schedule once a day, and the schedule is set by the rollout.** What is set by
  hand is taken off by the very first move of the node and is checked by nothing; the step of the
  rollout merges its own line into the schedule of the user of the node without touching the foreign
  ones, and a repeated rollout does not double it.
- **The seven last dumps live on the node, and they outlive a rollout.** Those older than the limit are
  taken off after a successful unloading, not before it; the move of the composition onto the node
  protects the directory of the dumps and the journal of the unloading from deletion — otherwise every
  rollout would carry away all the points of return at once.
- **The address of the intake in the settings of a tree is the name, not the local machine.** A tree
  left with the local address sends into emptiness and stays silent about it: the sending does not tell
  an absent service from a switched-off one.

**What the build answers to the loss of the client of the storage.**

- **The build of the intake refuses when there is no client of the storage.** The absence of the
  directory and a directory without an entry file are one and the same loss: what is built by half a
  client answers with a refusal already on the node.
- **The refusal names both the reason and the fix.** In the line stand the directory that is missing
  and the command it is created by. A reason without a command makes one look for it by the memory of
  the tree, and a command without a reason does not explain why the build stopped.
- **The check goes before the compilation.** Otherwise a hundred errors of types are added to one right
  line, and the one read first is not it.
- **The decision lives as a pure function, and the config of the build calls it.** A branching inside
  the config is checked only by a launch of the build, and a function by a call.
- **The pipeline builds the intake, and a refusal of the build fells the run.** A check living only on
  the machine of the executor answers to whoever remembered it.

## What is out of scope

- **Keeping the copies of the dump outside the node.** What is done is an unloading in place and a
  loading from a file; where the copy goes and how many generations live is separate work.
- **A second node and the switching between them.** The intake is one's own and small, there are two
  trees.
- **A separate container under the admin application.** Its static lies in the image of the proxy, and
  it has no process of its own on the node.
- **Watching the node by charts.** The space on the disk and the memory are looked at by a command when
  somebody comes for them.
- **The cache of the builds.** Whether it answers with a success after the loss of the client of the
  storage is work of its own.
- **Launching the generator of the client instead of a refusal of the build.** A build that fixes itself
  hides that the tree is installed by half.
- **A check of the client against the schema of the storage.** A divergence of the schema with the
  migrations is measured by a check of the tree of its own; the build judges the presence alone.

## Contract

The node has no surface of its own: it gives back the same one as the intake. The agreement about the
node changes not a single operation — what changed is the address this surface is available at, and the
protocol.

| What                             | It was                        | It became                              |
| -------------------------------- | ----------------------------- | -------------------------------------- |
| the address of the intake        | `http://localhost:3000`       | `https://message-bus.dev`              |
| where the intake is visible from | only the machine of the owner | any tree of the team                   |
| the probe of liveness            | `GET /api/health`             | the same one, and the rollout calls it |

The build of the intake at a loss of the client of the storage ends with a refusal and one line: the
directory that is missing and the command it is created by.

### Refusal codes

Not applicable: a refusal of the road is the business of the proxy, such a request does not reach the
intake at all, and it has no refusal code of its own. A refusal of the build is an exit code of the
command, not a code of the domain.

## Data

The node creates no tables of its own. The storage lies on a named volume of the node, not in a
directory of the machine of the owner. The dump carries it whole: the trees with their signs, the
tokens with their state, the accounts, the records of the months with the digests, the proposals and
the incident analyses. The unloading has no filter of its own — half a dump answers not a single
question it is taken for.

## Screens and states

The node has no screens of its own; its state is read by two answers:

| State                                    | What it is visible by                                                                            |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------ |
| the intake answers                       | the probe of liveness answers by the name, the browser does not complain about the certificate   |
| the intake is coming up                  | the probe answers with a refusal of the connection; the rolling of the migrations is still going |
| the intake did not come up               | the probe answers with a refusal longer than the term of the waiting of the rollout              |
| the node is alive, and the intake is not | the name resolves into the address of the node, and the ports of the road stay silent            |

## Cross-cutting requirements

### Locales

The language is one — Russian: the output of the node is read by whoever fixes the service.

### SEO

Not applicable: the service is closed.

### Mobile layout

Not applicable: there are no screens of its own.

### Several objects

The node is one, and the service on it is one.

## Decisions

- **The node is rented, not the machine of the owner.** The service takes cargo in when it is called,
  not when the machine is switched on.
- **The images are rolled out by the sha of the commit.** A moving tag falls behind the main branch, and
  the node silently stays on the former version, going on answering.
- **The rollout starts by the hand of a person, not by a merge.** A merge into the main branch goes
  several times a day, and every one of them would restart the intake in the middle of the taking in of
  cargo.
- **The refusal of the build lives in the config of the build of the intake, not as a separate check of
  the tree.** That way it works at any call of it: local, by the pipeline, from the image. Rejected: a
  target of its own in the layout of the intake — it is cached apart and is able to answer with a
  success from the cache.
- **An empty directory of the client counts as a loss on a par with an absent one.** A generation that
  broke off leaves the directory, and judging by its presence would mean missing exactly the case the
  check is created for.

## Open questions

The open questions of the domain are shared, and they live in the spec next to it.

## History of changes

- 2026-08-16 — the subdomain was split out of the spec of the domain, which had outgrown the length
  limit. The rules, the scenarios and the bindings of the node and the delivery moved here as they
  were: the scenario numbers were not recounted.
- 2026-09-06 — the probe of the loading of a dump by one command on a one-off database next to it, run
  on a copy of the composition of production; the rollout by the pipeline from the main branch was run
  live.
