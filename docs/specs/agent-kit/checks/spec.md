# The checks of the tree

**Status:** in force · **Revision:** 2026-08-20 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `verifiability`, `reuse-first`
**Procedures:** none

## Why

A check that has to be remembered does not live to its second month. The subdomain names what the
package carries as the checks of the tree — file length, repeats, uniformity signs, declarations of
markup classes — and what each of them judges and what it does not judge at all. What the road
outward is watched by is said by the subdomain of the delivery guards.

## Terminology

- **The length limit** — the number of lines past which a file counts as unreadable whole. One for
  all kinds of files.
- **The accumulated** — the files that stepped past the limit before it was declared. Listed by
  name.
- **Debt** — the accumulated that the tree intends to sort out; it differs from the accepted in that
  work is opened for it.
- **A uniformity sign** — a rule of the shape "the text holds such and such, so the ready-made was
  bypassed", together with what to replace it by.
- **A sign bundle** — the signs of one workshop package declared by one file: what this package
  carries and what is used in it instead of one's own.
- **A declared bundle** — a bundle the tree named as its own in the setting of the checks.
- **Own signs** — the signs of the consumer tree itself, declared by it at home and arriving on top
  of the declared bundles.
- **The scope of a sign** — what the sign reads: only the new text of the edit or the whole file.
- **The cancelling of a sign** — the sample at which the sign does not fire: the base is already
  inherited, the ready-made is already called.

### What it is called in the interface

| In the agreement                      | In the launch line                                  |
| ------------------------------------- | --------------------------------------------------- |
| the length check                      | `node <the root of the checks>/check-file-size.mjs` |
| the list of the accepted and the debt | a file next to the check, named by its setting      |
| the sweeping check                    | the command of the uniformity audit                 |
| the guard on an edit                  | the uniformity guard, the event of editing a file   |

## Rules

- **The directory of a foreign package is found by module resolution, not by a path in the
  dependency directory.** A package declared a dependency of a subproject does not lie in the root of
  the tree at all: the manager keeps it in its own store and has the right to keep several versions
  side by side. A hardwired path on such a layout does not go stale — it is never right at all, and
  the check ends with a refusal to read the directory before reaching the audit. Walking the store by
  a path sample picks, by the same miss, a version nobody installs.
- **A table of correspondences counts as a repeat by the share of matching pairs, not by full
  equality.** Full equality is blind exactly where a copy diverged from the original by one line —
  and that is the very case copies are gathered for. The share is taken from the larger table: from
  the smaller one, a table of two pairs lying whole inside a table of twenty would read as a full
  copy. The line of a finding names on how many pairs out of how many the tables diverged — without
  that an exact copy is indistinguishable from a diverged one.
- **The absence of a foreign package does not take the check down.** Its bundles are an addition to
  the audit of one's own repeats, not its condition: a tree where the package is absent gets the
  audit of its own, not a refusal.
- **The length limit is declared as one number for all kinds of files.** A number of its own for
  every kind means an argument about the number on every edit, not about the length of the file.
- **There are two length limits: code and the text of the rules layer.** A text needs the threshold
  earlier — the length of code is watched by the linter as well, and prose has only this number. A
  file is judged by the root it lies under, not by its extension: code lies in text files too. Every
  refusal line names the limit it judged by — otherwise one and the same number reads now as
  strictness, now as leniency. A tree that named no text roots is judged by one limit, as before.
- **The text of the rules layer has a third limit — its weight in characters.** Lines measure how
  much text fits on a screen, and they do not measure weight at all: the rule on requests takes 282
  lines at 13 595 characters, the delivery rule 272 lines at 21 508. Compression cuts characters and
  leaves the number of wraps the same, so without weight what was reached is not fixed and the text
  grows back silently. The number is assigned by the compressed layer: a little above the heaviest
  text — lower would mean cutting the already compressed anew, higher fixes nothing.
- **The companions are taken out of the weight count.** A rule companion and a list of scenarios are
  link tables: the heading of a binding repeats the statement verbatim, because the link goes by its
  text, and there is nothing to cut there without breaking the link itself. The weight of such a file
  grows with the number of statements, not with wordiness. The line limit stays on them: it catches
  something else.
- **A tree that named no weight number and no text roots is judged by lines alone.** A second figure
  in the digest would speak of a check that does not work there.
- **A binding is written in two shapes, and both are read.** A table and a list line
  "- **statement** — `file:symbol`" are equal: the link goes by the text of the statement, not by the
  shape of the line. The list shape was created because a third of the weight of a companion is the
  spaces the formatter pads the table columns to a common width with: in the companions of the tree
  that is 191 820 characters. A mixed companion is read whole — the translation goes file by file,
  and half the tree stands in the former shape for a while.
- **What accumulated before the limit was declared is listed by name.** The list marks debt, it does
  not issue permission: a file that got into it stays long and is visible in the list.
- **The accepted and the debt in the list are told apart.** The accepted is what the tree does not
  intend to split; the debt is what work is opened for. One list for both would mean there is nothing
  to sort out.
- **The list of the accepted is read by a shared parser, not by every check in its own way.** The
  shape of a record is one for all the lists of the tree: having diverged, they start demanding
  different things, and a record fit for one check turns out broken for the neighbouring one — and
  that is visible only to whoever put it there.
- **A record of the list carries a reason of its own and the number of the task that added it.** A
  prose reason for the whole list explains any line and therefore explains none; a record without a
  number cannot be asked of anyone. A record without a reason or without a number ends the parse with
  a refusal naming the file and the record itself.
- **A side of the list written as a list of lines refuses the parse, and the refusal shows the shape
  of a record.** A line has room for neither a reason nor a task number, and such a list reads as a
  list without explanations. A refusal naming one side sends the reader to the code of the parser:
  the sample stands next to it — a key, and at it a reason and a task number.
- **The side the check reads is named to the parser by a list.** Read past the parser, it loses both
  the demand for a reason and the demand for a number, and its absence from the list answers with
  emptiness instead of a refusal: the check turns green all the louder the more records the side
  holds.
- **There is no list at all — the parser gives back an empty one and refuses no work.** A check met
  for the first time shows everything found as new: that is more honest than a refusal over a missing
  file.
- **Data is taken out of the length count.** A locale dictionary and a build setting are read by
  search, not in a row; there is nothing in them to split.
- **The archive and the task folder are taken out of the count.** The archive by construction lists
  what is no longer in the tree, and the task folder dies with the merge.
- **What is generated is taken out by directory, not by names.** The generator rewrites it whole, and
  there is nobody to argue with it about length.
- **The length is counted the same way the linter counts it.** The number of line breaks plus one:
  two checks of the tree have one notion of length, otherwise one and the same file is long for one
  and short for the other.
- **A sign names its own scope.** Inheriting a base and a class mark do not get into a pointed edit,
  and a sign judging them by the added text stays silent always.
- **An empty field of a sign does not slide into the neighbouring one.** A sign with an empty
  cancelling reads the same as a sign without one: a parser that loses an empty field turns an advice
  into a sample and puts the guard out whole.
- **A guard that got not a single sign says so.** A silent guard is indistinguishable from a guard
  with nothing to refuse; a tree without declared bundles learns of it on the first edit.
- **The guard on an edit and the sweeping check read the same fields of a sign.** The skip of the
  backend roots acts on both, and the name sample both check against the path from the root of the
  tree. What is read differently diverges silently: the guard refuses an edit the check lets through,
  this can be seen only at the gate, and there is nothing else to make the edit with — the deviation
  marker declares a bypass of the ready-made, and there was no bypass here.
- **A declaration that arrived by a connected package is read on a par with one's own.** A screen
  assembled from the ready-made holds no declarations in the tree: they lie in the design-system
  package, and the application connects them by one line. The debt on such a class is eternal —
  writing a rule next to it means duplicating the package one and diverging from it silently, and
  removing the class means re-laying out a screen assembled from the ready-made.
- **What the application connected itself is read, and no deeper.** The connections inside a package
  file are not taken apart: the walk is one link long, otherwise the check goes over a foreign tree of
  connections and counts as declared what the application never called. The dependency directory does
  not get into the source roots at that — other checks read those too, and the package is not fit for
  their audit.
- **A divergence is recognised by the name of the class, not by the list of files at it.** The list
  is part of the key of the known list and changes with every markup edit: checked whole, it makes
  the former line surplus, and that same debt a new divergence.
- **A changed list of files is named by its own kind.** The debt grew — the added files are listed;
  it shrank — what is time to take out of the line. There is no instruction to remove the line whole
  at that, and no new line is offered: the list was gathered by the day the check was created and only
  shrinks, and the pair "remove the line" and "a new one appeared" gives no right move at all.
- **The name of an element is assembled from the nesting, not read as one line.** The declaration
  `&__<head> { &-<tail> }` gives the class `<head>-<tail>`, and it has as many joints as needed.
  Reading only what stands after `__` whole, the check counts sound markup as debt: half of what
  accumulated in this tree turned out to be exactly that — the rule works, the class paints, and
  removing it would mean breaking the screen. A tail without a head does not become a declaration at
  that: a name assembled outside the element block belongs to nobody.

- **A check declares a skip by the exit code, not by a line of output.** The line is read by a
  person, the code by the caller: zero on a skip stands in the digest of the set next to the checks
  that passed and differs from them in nothing, while the set reads as checked whole.
- **A skipped check is named aloud but refuses no push.** A check with nothing to look at is no
  breakage; silence about it is the very indistinguishability the code was created for.
- **A check that could not do its work refuses, it does not skip.** "There is nowhere to check" and
  "the check is broken" are different things, and zero for both makes the second indistinguishable
  from "checked and it came together". Nowhere is a state of the tree named by the check itself: there
  is no subject, no address is set, the service does not answer; every such exit is declared by name
  and gives back zero. Everything else — a missing package, an empty name in the setting, an
  unparsed answer of the service, an unforeseen exception — is a refusal with a non-zero code and a
  line saying that the check broke, not the subject. Otherwise it stands in the gate set, returns zero
  for years and never checks a thing.
- **"There is nowhere to check" stops being a skip when the branch touched the subject of the
  check.** A database on the machine is shut down as a matter of course, and there is nothing to
  refuse a documentation push for; but a branch that edited the schema or the migrations goes into the
  main branch blind without a run of the chain — and it is not the branch that falls, it is the
  rollout. That is how production fell: the fields appeared in the schema without migrations, part of
  the pages started answering "not found", half an hour of unavailability, it was fixed by a rollback,
  and the gate was green.
- **Touchedness is counted on both sides: the uncommitted and the contribution of the branch from
  main.** An edit that has not got into a commit yet leaves by the same push right after, and the
  contribution of the branch does not see it.
- **A refusal about an unavailable database names what to raise it with.** Said only as "nowhere", it
  reads as permission: the executor is not obliged to raise the database, and the gate is green at
  that.
- **The shadow database is created by the check itself.** A client that goes to the storage through
  an adapter creates nothing, and a database that is not there it names by the code of an unreachable
  server: the check left the creation to the deploy command and read its own miss as a defect of the
  machine.
- **A refusal of the deploy command about an unreachable server is told from a divergence of the
  migrations.** One code stands for both, and after the creation of the shadow database it means the
  check, not the chain: said as a refusal of the migrations, it sends the reader to look for a
  divergence that does not exist.

- **An empty name in the setting is asked about apart from a non-existent file.** Glued to the root
  of the tree, an empty name gives the root itself, and it is always there: the check reads that as
  "the subject is in place" and goes on with an empty argument. An empty name is a lawful answer of
  the tree, "I have no such subject", and it must be answered by a line of its own and by zero, not by
  the existence of the root.

- **A heavy step of the set is called by its own subject, not by the sign "the branch touched
  code".** Each has a subject of its own — the showcase of a kit, the receiver, the admin panel — and
  it is declared by paths; a branch that did not touch the paths of the subject does not pay for its
  step. The sign "all or nothing" errs in the right direction, but it skips the third case between
  "run everything" and "run nothing": running what the branch touched. It is paid for twice — by time
  and by a false refusal: an edit that never touched the display once stood over an unstable snapshot
  of a foreign component. The sign is still bound to err towards a surplus run: a path that fell into
  no subject, and the common base of the tree, raise the whole set — the unfamiliar reads as "could
  have touched anything". The composition of the set does not change at that: completeness is demanded
  separately, and what changes is the condition of the call, not the list.
- **A cheap check is not split by subject and is called at any composition of an edit.** The split by
  subject was created for the heavy steps: the stand, the snapshots, the image builds. A check running
  under a second wins nothing from such a split, and loses the very thing it stands for: an edit of a
  neighbouring subject passes it by, and a red check stays silent for days. Five checks of the styling
  layer of the second kit were called by nobody — neither the gate nor the pipeline — and the audit of
  the token graph stood red for several days in a row without ever refusing a push.

- **The check of the archive keeping time demands a day later than the cleanup removes.** The age of a
  record is counted by the minute of the commit. The cleanup goes at the minute of the push, the check
  in the pipeline minutes or hours later, and without a margin the next record crossed the threshold
  between them: three runs of one session turned red that way, not one of them over the edit of the
  branch. The pick is the same on both sides, the difference is in the margin, and everything the check
  names the cleanup removes.

## What is out of scope

- The scenarios of the uniformity signs — the subdomain `reuse` next to it: there are fifteen of
  them, and the scenario file of the domain outgrew the limit along with them.

- Splitting long files: the check names them, and a person splits them.
- Counting the length of code in a language where the linter watches the length: there it is judged
  already.
- A refusal of the uniformity guard over a missing file of one's own signs: a skip is cheaper than
  stopping the work.
- Moving the accumulated uniformity debt when the bundles change: the snapshot of divergences is
  re-read by the work that changed the bundles.
- A machine check that a name in a bundle belongs to the package and not to the consumer tree: the
  sign is read by a person — that is `Q-20`.
- **Taking connections apart deeper than the first link.** The file named by the application is read;
  what it connects itself is unknown to the check. Otherwise it goes over a foreign tree of
  connections and counts as declared what the application never called.
- **Editing the known list by a machine.** A changed list of files the check names, and a person edits
  the line: the list shrinks by a decision, not by a run.

## Contract

The surface is the checks the tree calls by the launch line. Each leaves with zero when there are no
divergences and with one when there are; what accumulated before the declaration is listed by name
and gives no refusal.

### Refusal codes

Not applicable: the checks answer with an exit code and a text, not with named codes.

| What happened                                             | Code | What it says                                                                              |
| --------------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------- |
| a file is longer than the limit and is not in the list    | `1`  | the path, the length and the limit                                                        |
| a line of the list that has no file                       | `1`  | the line and that there is no file by it                                                  |
| not a single sign is left — neither a bundle nor own ones | `1`  | that there are no signs, which bundles the package has and by which key they are declared |
| the named sign bundle is not found at the package         | `1`  | the name of the bundle and which bundles there are                                        |
| the file of one's own signs is named but not found        | `0`  | that there are no own signs, and the work goes on                                         |
| a uniformity sign was found in the text                   | `1`  | the key of the sign, the file and what to replace it by                                   |

## Data

There is no storage of its own. The list of the accepted and of the debt lies as a file next to the
check, and the uniformity signs are in the declared bundles at the package and in the file of one's
own signs in the tree.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

### Locales

Not applicable: the output of the checks is single-language.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The checks are one set for all trees, and the roots, the words and the declared bundles are read
from the setting of the tree. What the tree did not name is not judged at all: silence means "there
is no rule about this", not "the rule is kept".

## Decisions

- **The length limit is one for all kinds.** Rejected: a number of its own for every kind — then
  every edit starts with an argument about the number.
- **What accumulated is listed, not forgiven by a default.** The default "we do not judge the old"
  never ends: a new file next to an old one looks just as lawful.
- **Data is taken out of the count by kind, not by a list.** A list of locale dictionaries would have
  to be appended for every new locale.
- **The uniformity signs are data, not code.** The guard is written in shell, the check in JS; there
  can be no shared code between them, and shared data there can. Rejected: keeping the signs in a
  profile function of the tree — then the sweeping check would have to call the shell on every file.
- **The signs are cut by workshop packages, not by kinds of files.** The tree picks packages, not
  kinds: it knows whether it installs a kit, and does not know which kinds of files are touched by it.
- **The profile function stays at the uniformity guard.** The trees have already written it; it is
  read together with the declared bundles and cancels nothing.

## Open questions

The open questions of the domain are shared, and they live in the spec next to it.

## History of changes

- 2026-09-05 — the field `viewer` in the answers of the work queue helper, task RT-1800.

- 2026-09-05 — the day of margin at the check of the archive keeping time, task RT-1797.

- 2026-08-17 — the subdomain was split off from the domain spec, which had outgrown the length limit.
  The rules, the scenarios and the bindings of the tree checks and of the push gate moved here
  unchanged: the scenario numbers were not recounted.
- 2026-08-20 — the delivery guards and the push gate were split off from here into a subdomain of
  their own: the spec had outgrown the length limit, and two subjects in it read as one. The scenario
  numbers were not recounted.
