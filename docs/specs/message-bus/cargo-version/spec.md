# The column, the filter and the order by the version of the release

**Status:** in force · **Revision:** 2026-08-22 · **Scenario prefix:** `SC-MB`
**Depends on:** none
**Laws:** `lists`, `reuse-first`, `frontend-application`
**Procedures:** none — the operations are declared by the controllers of the intake

A subdomain of the domain "the intake of the cargo": what a list of the cargo is narrowed to one
release by and how the versions in it are ordered. It stands next to the subdomain about the edit of a
state by a tree — that one says who writes the version, this one what a person gets of it. What is
shared — the terminology of the domain, the cross-cutting requirements and the decisions — lies in the
spec of the domain.

The agreement arrived as a subdomain of its own, not by a merge into the spec of the reading of what
was taken in: together they outgrew the length limit — that one has 499 lines at a limit of 500. By
the same technique the agreement about the edit of a state by a tree arrived. The scenarios moved with
their former numbers.

## Why

A record has a version of the release, and the panel shows it. To the list it is not visible at all: a
person who needs what went away with the version `0.10.0` opens the records one by one and remembers
where they have already been. The filter by state, created by the neighbouring work, answers the
question "what is already released" and stays silent about which release it was.

A column is not enough without a filter: there are as many released records in a list as there were
releases over all the time, and by the eyes over the column a person reads the same as they would read
without it. A filter is not enough without an order: neighbouring releases stand mixed together, and
"what is new in the last one" is gathered by rows.

## Terminology

The vocabulary of the domain whole is in the spec of the domain. Here only what this work creates:

| Term                     | What it is                                                                                                                        |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| The filter by version    | A condition narrowing the list of a section to the records of one version of the release. It stands third in the toolbar          |
| The versions that met    | The values of the version standing at at least one record of the section. They are given by an operation of the intake of its own |
| Without a version        | An item of the filter narrowing the list to the records that have no version: what is fixed but not released                      |
| The order by the numbers | The order of the versions by the numbers of the parts, not by the letters of the string: `0.9.0` goes before `0.10.0`             |

### What it is called in the interface

| In the agreement          | On the screen                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| the filter by version     | the third choice in the left part of the strip above the list, to the right of the filter by state |
| without a version         | the item "без версии" — the second in the list of the choice, right after "все версии"             |
| the column of the version | the column "В какой версии", standing after the column of the state                                |

## Rules

**The column.**

- **The version of the release is visible as a column at the analyses and at the proposals.** The panel
  shows it for one record at a time, and the question "what went away with this release" is put to the
  list.
- **The column of the version stands after the column of the state and is in the set by default.** The
  state and the version are read together — "released, 0.10.0" — and set apart they answer half the
  question each.
- **At a record without a version the cell is empty.** A dash, "no" and "—" read as a value, while such
  a record had no version at all.
- **The column of the version stays in the setting of the columns on a par with the rest.** A person
  switches it off by the same movement as any other one: it has no rule of its own.

**The filter.**

- **The filter by version is put into the page by the section, the page does not know it itself.** By
  the same technique the filter by tree and the filter by state stand there.
- **The filter by version stands third in the strip, to the right of the filter by state.** The order of
  the filters goes from the general to the particular: the tree, the state, the version.
- **The filter by version is at the sections of the analyses and of the proposals and only at them.** A
  record of a month has no version at all.
- **The filter lists the versions that met, not all the possible ones.** The list of the versions the
  intake gathers by the records themselves: there is no set of the versions declared in advance — they
  are named by the tree at a release.
- **The first item of the filter is "все версии", the second "без версии".** The first lifts the filter,
  the second narrows the list to what is fixed but not released: this is a question the state answers
  only by half — "ready" is put also when the release is not built yet.
- **The filter by version lives in the address of the section on a par with the page, the size, the
  order and the other filters.** A lifted one does not stand in the address.
- **The filter by version adds up with the filter by tree and with the filter by state.** The three
  filters narrow the list by three conditions, they do not replace one another.
- **A chosen version resets the list to the first page.** A narrowed list may have no former page at
  all.
- **A version that is not in the list of the versions is sent to the intake as it is and gives back an
  empty list.** The set of the versions is open: a version that met yesterday and was cleaned away
  today is an ordinary thing, and a refusal on it would read as a breakage.
- **A list empty by the filter of the version explains that by the filter.** By the same technique it
  explains the emptiness by tree and by state.

**The order.**

- **The version of the release is a sortable field at the analyses and at the proposals.** The person
  changes the order by the heading of the column of the version.
- **The order by version goes by the numbers of the parts, not by the letters of the string.** `0.9.0`
  stands before `0.10.0`; the alphabet puts them the other way round, and the list reads as broken.
- **A version that was not taken apart by numbers stands at the end of the order, and among themselves
  such ones go by the alphabet.** The intake does not impose the form of the version — that is a rule
  of the spec of the edit of a state, and a refusal on `hotfix-3` would lose the record whole.
- **The records without a version in the order by version go last at an ascending order and first at a
  descending one.** Emptiness is not the smallest version but its absence; mixed with the numbers, it
  takes the top of the list at every opening.
- **The second key of the order stays the former one — the identifier of the record.**

## What is out of scope

- **A multiple choice of versions.** The word of the owner about the neighbouring work works here too:
  one value at a time.
- **A limit on the number of the versions in the filter.** The word of the owner: all the ones that met
  are given. A limit is created when the list becomes long, not in advance.
- **Taking the form of the version apart at the intake of the cargo.** The intake does not impose the
  form: the rule stands in the spec of the edit of a state, and this work does not cancel it. The
  numbers are read at the reading of the list.
- **Comparing the versions to one another by the rules of semantic versioning whole.** The prerelease
  marks and the build suffixes are not brought into the order: the parts are read as numbers from left
  to right, the rest goes into the tail.
- **Showing the version in a row of the list on top of the column.** Neither a label under another cell
  nor a sign.
- **The filter by version at the section of the digests.** A record of a month has no version.

## Contract

The work creates one operation and adds a parameter of the selection to two former ones.

| Operation               | What it does                                                                                  |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| GET /api/cargo/versions | gives back the versions of the release that met — by the kind of the cargo, for the filter    |
| GET /api/postmortems    | a page of the analyses; it accepts the version of the release or the sign "without a version" |
| GET /api/proposals      | a page of the proposals; it accepts the same                                                  |

The parameter of the version adds up with the parameter of the tree and with the parameter of the
state. The field of the version is added to the set of the sortable ones at both operations of the
reading of a list.

### Refusal codes

Not applicable: the intake answers with a code of the answer of HTTP, not with named codes of the
domain. Where the reading is obliged to refuse instead of staying silent:

| Code | When                                                                                                                                     |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 400  | the parameter of the version came not as a string or longer than the limit — with the name of the parameter                              |
| 400  | the kind of the cargo in the request of the versions is not named or is named by a word outside the set — with the name of the parameter |
| 401  | the request has no entry of a person — the former rule of the subdomain, not changed by the work                                         |

A version that is not in the records is not refused: the list answers with an empty page. The kind of
the cargo in the request of the versions, on the contrary, is mandatory and has no default: substituted
silently, it would show in the filter of one section the versions of another.

## Data

The work creates no tables and no columns of its own: the version already lies as a column at an
analysis and at a proposal.

An index under the column of the version is created by a migration — by it go the filter, the order and
the gathering of the versions that met. The former note of the spec of the edit of a state names it
directly as the work of this task: before it, it would have been put blindly.

## Screens and states

| Screen                    | States                                                                                                               |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| The incident analyses     | the list is not narrowed · narrowed by version · narrowed by "without a version" · narrowed by three filters at once |
| The proposals             | the same four                                                                                                        |
| The column of the version | a version · empty at a record that is not released · the column is switched off by the person                        |
| The toolbar of a section  | three filters next to each other on the left · all on one line · wrapped on a narrow screen                          |

## Cross-cutting requirements

### Locales

The labels of the filter and of the column are taken from the dictionary of the application by the same
keys as the label of the row of the panel "В какой версии": one place of declaration for all the
showings.

### SEO

The admin application stands behind the entry and is not given to the search engines at all.

### Mobile layout

The three filters on a narrow screen wrap, they are not cut. It is confirmed by a measurement, not by a
look: the third filter is exactly the place where the strip stops fitting.

### Several objects

The filter by version narrows what is shown, not the access, and it adds up with the filter by tree.
The versions are gathered over all the trees at once: one and the same version at two trees is one
value of the filter.

## Decisions

- **The column is visible at once, it is not switched off by default.** The word of the owner: the state
  and the version are read as a pair. Rejected: a switched-off column — then the order by version is
  switched on by two actions, because there is no heading while the column is switched off.
- **The order goes by the numbers of the version.** The word of the owner. Rejected: the order by the
  string — it is cheaper and works by the index directly, but it puts `0.10.0` before `0.9.0`, and a
  person reads such a list as broken.
- **There is "без версии" in the filter.** The word of the owner: by it what is fixed but not released is
  found. Rejected: looking for such records by the filter of the state "ready" — the state answers
  another question and stays silent about whether the release is built.
- **The operation gives back all the versions that met, without a limit.** The word of the owner: the
  package has dozens of versions. Rejected: the top twenty — an old version can no longer be found by
  the filter.
- **A version outside the number form goes to the end of the order, it is not refused.** Not a decision
  of this work: the rule "The intake does not take the form of the version apart" stands in the spec of
  the edit of a state, and a refusal on such a string would lose the record of the tree whole.

## Open questions

- **Q-32. What to do when there are more versions than fit into the choice.** The set is open and grows
  with every release; a choice of one value out of a hundred reads worse than out of ten. It is decided
  when the list grows — together with the measurement that shows it.

## History of changes

| Date       | What changed                                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| 2026-08-21 | The agreement was written before the code: the column, the filter and the order by the version of the release   |
| 2026-08-21 | The refusal codes named the refusal of a request of the versions without the kind of the cargo: it is mandatory |
