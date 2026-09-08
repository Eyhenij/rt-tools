# Observations

**Status:** in force · **Revision:** 2026-09-05 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `observability`, `work-conduct`, `delivery`, `frontend-application`, `verifiability`
**Procedures:** none

## Why

The package stands in several trees, and what is used in it is known only to each tree about
itself. The subdomain names what a tree learns this about itself by: an observation is written by a
guard, the digest answers for a stretch of days, the snapshot of overrides says what the tree
replaced and what it refused, and the tree sign tells trees apart without naming them.

What of the learned goes outward and how — proposals, a word mid-work, sending the cargo, creating
a tree in the intake and marking the records — is the neighbouring subdomain "Cargo outward" next
to it. Nothing goes outward that a person did not send by a command: not one guard goes into the
network.

## Terminology

- **An observation** — one line about an event of the rules layer: a rule loaded, the gate refused
  an edit, a guard refused, the layout check found a divergence. Written by a guard, lives in the
  tree.
- **A tree sign** — a short value telling trees apart in an observation; the tree address is not
  recovered from it.
- **The version of the record schema** — the number of the format of an observation line; it changes
  when the composition of its fields changes.
- **A digest** — what the observations say for a stretch of days: what was used, what was not used
  once, what was stumbled over.
- **A snapshot of the overrides** — the state of the tree at the moment of the request: which
  sections of which package resources it replaces, appends to and removes.
- **The kind of an override edit** — one of three: replacing a package section, appending a section
  of one's own, removing a section.
- **A section of one's own** — a section of an override that the package resource does not have; its
  heading was invented by the tree.

### What it is called in the interface

| In the agreement | In the launch line                    |
| ---------------- | ------------------------------------- |
| the digest       | `agent-kit stats [--days N] [--json]` |

## Rules

- **An observation is written into the tree, not into a temporary directory.** A record living until
  the machine reboots and zeroed by a context squeeze is never statistics over two or three days.
- **An observation names nothing of the tree except the kind of the file.** The line holds the name
  of the package resource, the kind of the event, the kind of the file, the package version and a
  short sign of the session. Paths, domain names and the name of the tree itself do not get into an
  observation at any event.
- **The writing of observations is switched off by a setting of the tree.** The setting key switches
  it off whole, not in parts: the package stands with those we know nothing about too, and writing
  without the tree's knowledge is not allowed.
- **A guard that could not write an observation lets the action through.** An observation is a side
  duty of the guard, and its breakage has no right to stop the work: the rule of refusing in favour
  of the work acts here the same as in the guard itself.
- **The digest names what was not used once, too.** A rule laid out into the tree and not loaded
  once over the stretch stands in the digest as a line of its own. Otherwise a dead resource is
  indistinguishable from a working one, and shortening the text of the rules is as valuable as
  adding to it.
- **A guard that did not refuse once over the stretch stands in the digest as a line of its own.**
  The counters say who refused and stay silent about who stood and was not needed: nobody will strike
  such a guard out of the list of defences, and a silent guard and a needless one look the same right
  up to the review. This is counted by the same difference as an unloaded rule, and for the same
  reason — in the observations themselves a silent guard is absent by definition.
- **The digest counts as a guard whoever declared their name for the observations.** A hook without a
  declaration will not appear in the observations at any stretch, and it would be called silent
  wrongly: it is silent not because it was not needed. The declaration is voluntary and exact — a
  hook that counts its own refusal itself does not make it, and a second event about the same does
  not count.
- **A guard's refusal is recorded by the shared refusal tail, not by the guard itself.** Written in
  the guard, the record stood in five guards out of thirty, and the digest answered for that fifth
  part. The tail is the only place every refusal passes through: the rule demands naming two lawful
  moves at a refusal, and a guard refusing past the tail breaks it before it loses the count.
- **The list of guards the digest asks of the tree, not of the package.** The tree's own guards lie
  in the same directory and write observations on a par with the package ones; a list from the
  package would name not one of them.
- **The silence of a guard is not made a refusal.** A guard not needed for three days is lawful, and
  a red digest would refuse the work for the sake of statistics.
- **The digest answers for a stretch of days, not for all time.** The stretch is named by an argument
  of the launch; without the argument three days are taken.
- **Observations older than the keeping time are removed by the digest.** A directory that only grows
  stops being opened in a year.
- **An override is counted as a state, not as an event.** The snapshot is taken by the layout at the
  moment of the request, it is not put together from records of when the override was created. An
  event at the layout would create a second source of the same truth, and the history "when it was
  created" changes not one decision: an override lives for months.
- **The snapshot of the overrides names the resource, the section and the kind of the edit, not the
  content of the edit.** The text of what is appended the tree writes itself, and in it stand its
  domains, paths and names — the very thing an observation does not carry outward at any event.
- **The heading of a section of one's own does not go outward.** The heading of a package section is
  the same everywhere the rules layer stands, and it can be named; a heading invented by the tree is
  its words. Sections of one's own go as a number and a kind of edit, without names.
- **The snapshot names the unchosen on a par with the overridden.** A tree's refusal of a resource is
  the same answer about the package text as an edit of its section, and without it a dead resource is
  indistinguishable from one the tree knew nothing about.
- **An observation carries a tree sign, and the tree address is not recovered from it.** Without the
  sign what repeated at two trees is indistinguishable from a one-off; with the name of the tree,
  what belongs to one tree would go outward.
- **The tree sign is the same for everyone working with one repository.** Trees are counted, not
  machines and not people: two working copies of one repository are one tree, and a rule laid out
  into it once is not counted twice.
- **A tree without a remote repository names its sign by a setting.** Otherwise all such trees would
  merge into one, and the number of trees in the digest would become untrue silently.
- **An observation line carries the version of the record schema.** The package version answers a
  different question: the fields change more rarely than an edition comes out, and by the number of
  the edition it is not visible what to parse the line with.
- **Lines of an unknown schema version are counted apart and named by a number.** A refusal of the
  digest would be worse: the observations over the stretch are already gathered, and throwing them
  out silently means losing the whole stretch.
- **The outcomes of the push gate the digest counts apart from the refusals of the guards.** The
  refusals answer one question of three — how many pushes the gate stopped. A gate whose suite was
  not found once and a gate where everything is green look the same in the refusals: both stay
  silent.

## What is out of scope

- Network telemetry and background sending: only what was sent by a command goes outward.
- Gathering observations from several machines into one place: observations live in the tree of the
  machine they worked on; the sending collects them, not a shared storage.
- **Measuring the session time and the token cost.** Named by the owner outright.
- **New kinds of events and guards created for the sake of observation.** Observations are given off
  by the guards that already catch their own business.
- **A personal, per-machine step of the switch on top of the tree setting.** The command is one, and
  the tree setting is enough.
- **The content of an override.** What goes outward is that a section was replaced, not what with.
- **Everything that goes outward.** Proposals, sending, creating a tree and marking are the
  neighbouring subdomain "Cargo outward".

## Contract

The digest brings together the observations over a stretch of days and gives them back
machine-readably in the same shape — that is what a proposal is accompanied by. It exits with zero
when the work is done or there was nothing to do.

### Refusal codes

Not applicable: the answer is an exit code and text, not named codes.

| What happened                              | Code | What it says                                       |
| ------------------------------------------ | ---- | -------------------------------------------------- |
| there is no package setting in the tree    | `1`  | to start with creating the setting                 |
| there are no observations over the stretch | `0`  | that no record was kept, and how it is switched on |
| the writing is switched off by the setting | `0`  | that it is off, and by which key                   |

## Data

**An observation** — one line per event, in a file per day:

| Field            | What is in it                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| time             | the moment of the event                                                                        |
| kind             | what happened: a rule loaded, a refusal by the gate, a refusal of a guard, a layout divergence |
| resource         | the name of the rule or the guard — the name of the package resource, and only it              |
| the kind of file | the extension or a known kind of the rules layer; there is no path                             |
| version          | the version of the package that laid the resource out                                          |
| session          | a short sign the sessions are counted by; the session name is not recovered from it            |

## Screens and states

The package has no screens: the digest a person reads as lines of output.

## Cross-cutting requirements

### Locales

Not applicable: the output of the launch line is single-language.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The observations of one tree do not get into another: they live where they worked, and this is told
apart by a setting — whether the writing is on, what the keeping time is. The tree sign is the same
for everyone working with one repository, and the tree address is not recovered from it.

## Decisions

- **The observations are written by the existing guards, not by a new observer next to them.** A
  separate guard would repeat the parse of the input and would diverge from the gate silently — and
  the event "the gate refused" is known only to the gate itself. Rejected: an observer guard on top
  of the rest.
- **The word "observation" instead of "log".** The tree glossary forbids the second outright.
- **The overrides are counted as a state — an assumption of the executor.** The menu was not answered
  by the owner. The argument: the snapshot is taken by the layout, an override lives for months, and
  the history "when it was created" changes not one decision. Cancelled by one edit of the agreement.
- **The tree sign is counted from the address of the remote repository — an assumption of the
  executor.** It is the same for everyone working with this repository, that is, it counts trees, not
  machines. From whoever knows the list of the team's addresses it hides no tree, and in a closed
  intake this is accepted on purpose: the tree is hidden from outsiders, not from one's own.
- **An observation about an incident — an assumption of the executor.** The owner forbade creating
  new kinds of events and editing guards for their sake, and asked to gather admissions of a miss.
  The incident guard already catches them; it lacks one line of the record by the same technique
  that stands in the neighbouring guards.
- **The version of the record schema apart from the version of the package.** They are not obliged to
  coincide: the fields change more rarely than an edition comes out, and by the number of the edition
  it is not visible what to parse the line with. Rejected: counting the schema by the package
  version.
- **Lines of an unknown schema version are counted, they do not refuse the digest.** A refusal of the
  observation tool has no right to stop the work it was created for. Rejected: a refusal of the
  digest at an unfamiliar version.
- **Observations from several machines are not brought together into one place.** They still live in
  the tree of the machine they worked on, and the intake gathers the cargo, not the observations.

## Open questions

The open questions of the domain are shared, and they live in the spec next to it.

## History of changes

- 2026-09-05 — the subdomain of the cargo outward was split out of this spec, which had outgrown the
  length limit. The rules, scenarios and bindings of proposals, sending, creating a tree and marking
  moved into it as they were: the scenario numbers were not recounted.
- 2026-08-17 — the subdomain was split out of the domain spec, which had outgrown the length limit.
  The rules, scenarios and bindings of the observations and the cargo moved here as they were: the
  scenario numbers were not recounted.
