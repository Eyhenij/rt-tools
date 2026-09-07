# Taking the state of the layout apart

**Status:** in force · **Revision:** 2026-08-27 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `verifiability`
**Procedures:** none

## Why

The layout puts files, and the state report tells about it: what the tree took, what it is missing and
where it will not see the package text. Not one of these lines writes anything — they answer the
question "what is here now", and they are read after a version is raised and when the tree is set up.

The layout itself is a neighbouring subdomain: the subject there is different, and they grow apart.

## Terminology

- **The state report** — a command that writes nothing and prints the state of the layout.
- **A replaced section** — a section of a resource whose heading matched the heading of an override of
  the tree: the package text of such a section does not reach the tree.
- **A local value** — a file outside the history a hook taken by the tree expects.
- **An unmatched override** — a file in the overrides directory whose name matched no resource: it is
  applied to nothing.
- **The debt of bindings** — the articles of a laid-out rule that have no line in the companion of the
  tree.

### What it is called in the interface

The report has no interface: it is read by the executor — as lines in their own turn.

## Rules

- **The report names the sections replaced by overrides by name — the resource and the heading.** A
  matched heading replaces the section whole, and everything the package appended into it by a new
  version vanishes silently: the layout audit comes together at that.
- **A tree without overrides stays silent about what is replaced.** A line without a subject teaches
  skipping the digest whole.
- **The digest names the local values the taken hooks expect.** A hook that did not find its value
  lets through silently, and from outside that is indistinguishable from a working one.
- **The key of the header of a local value is read in both languages.** The texts of the package are
  English, and the hooks of the tree created before the translation carry the owner's-language key: one
  name would leave them out of the count, and the digest would stay silent about a hook without a
  value.
- **An override matched to no resource is named together with the reason.** The layout audit is blind
  to it: it compares what is laid out with what it assembles itself.
- **A file outside the kinds of resources does not count as an override.** Next to the overrides a
  README of the directory lawfully lies, and calling it unapplied would mean making noise at every
  layout.
- **The debt of bindings is counted by the laid-out body of a rule, not by the package edition.** The
  sections the tree replaces by an override stand in the laid-out rule with their own text: the
  articles of the package are not there, and there is nothing to bind.
- **An unset compaction threshold the report names together with ready numbers.** Leaving the threshold
  to the tool is a lawful choice, and it is said once.
- **An override created for the sake of a sent proposal is marked in the override itself.** A markup
  comment in its section names the package resource, the article and the day of the send: nobody opens
  the records of the proposals on the day of an update — the executor holds the laid-out resource and
  the override, and nothing points to the record.
- **The layout lists the marked sections whose article already stands in the new edition.** A mark
  without a reader changes nothing: whoever installs a new version sees the number of laid-out files
  and does not see that part of the overrides became surplus.
- **A section is removed by a person, not by a command.** A mark holds one article, and other things
  may have been appended into the section; a blind removal would delete what the mark did not touch.
- **A section without a mark counts as permanent.** A new edition does not offer removing it: the tree
  created it not for a sent proposal.
- **A mark on a resource that is not in the new edition stays silent.** The package may have renamed
  it, and calling the override surplus on that ground would mean advising to remove what no replacement
  came for.
- **An unfilled hole does not count as a divergence and is named as a state of its own.** A divergence
  says that what is laid out diverged from the edition; a hole without a value says that the tree has
  not yet described its own: the ports of the stand, the prefix of the components, the name of the main
  branch. One exit code for both states puts the tree before a choice between a red push gate and
  invented numbers in the setting, after which the substitutions lose their meaning.
- **A hole is named at any outcome of the audit, together with the move.** The line says by which key
  of the setting the value is given and that until then the resource is not laid out. An audit that
  stayed silent about a hole on a tree that came together would leave the rule unwritten and would not
  report it.

## What is out of scope

- The layout and its refusals — a neighbouring subdomain.
- The digest of what was used and the cost of the rules layer — a neighbouring subdomain: the subject
  there is observation, not the state of the files.

## Contract

The surface is the command of the state report. It writes nothing and always answers zero: its answer
is a list of lines.

### Refusal codes

Not applicable: the state report has no refusals.

## Data

There is no data of its own: the resources of the package, the laid-out copies, the overrides and the
setting of the tree are read.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The lines of the output are in the language of the tree.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable: the report speaks of one tree.

## Decisions

- **The report writes nothing.** The state of the tree has to be read before anything is changed —
  including where the layout refuses.

## Open questions

None.

## History of changes

- 2026-08-27 — the subdomain was split off from the layout spec: the scenario file outgrew the length
  limit, and the subject in it was double — what puts the files and what tells about them.
