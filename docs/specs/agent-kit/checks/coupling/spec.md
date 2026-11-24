# The coupling of modules

**Status:** in force · **Revision:** 2026-11-24 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `code-structure`, `verifiability`
**Procedures:** none

## Why

The executor answers for the coupling and the isolation of modules, and until this check nothing
counted either: cycles were judged in one kind of files of one folder, and links were counted by a
search over sources. The subdomain names what is counted over the import graph, what of it refuses a
branch, and what the count does not see.

## Terminology

- **A module** — a file of code under the roots of the tree.
- **An entry** — a file named as a barrel, a target of a path alias, or a file the tree declared.
- **A block** — a folder with an entry, or a folder the tree declared a block.
- **An import past an entry** — an import of an inner file of a folder from outside that folder.
- **Growth** — outgoing links of a module above what they were at the point the branch left its base.
- **An own edit of a branch** — a commit of the branch itself, merges apart, and what is not committed.
- **An overrun** — a count of links named after the plan was first written.

### What it is called in the interface

| In the agreement          | In the launch line                                       |
| ------------------------- | -------------------------------------------------------- |
| the check                 | `node <the root of the checks>/check-coupling.mjs`       |
| against the base          | `--base=<revision>`, a past revision — `--at=<revision>` |
| the numbers of one module | `--module=<path>`                                        |
| the list of the accepted  | `coupling-allowlist.json` next to the other lists        |

## Rules

- **The graph is read from texts, and a file is a module.** Scripts and code stand in one graph: a
  package of rules is scripts for the greater part.
- **Every form of an import with a literal name is a link.** A name that lies in a variable, a path
  assembled in pieces and a start from code are not seen, and the description says so.
- **A copy laid out from a package is not a module.** Judged twice, one edit would grow two modules.
- **A cycle is judged among modules and among blocks.** Two blocks may call each other while no two
  files do: such a folder can no longer be taken apart from its neighbour.
- **An import past an entry is lawful where there is no other way.** The entry reaches the importer,
  and through it the import would close a cycle; tests, showings and harness call the insides.
- **What stood in the base is not judged.** An import is old by itself, not by the bypass: an entry
  added to its folder later makes no new import. A renamed file keeps its past, and an import that moved
  over from a neighbour of the same folder is the old one: a file was split.
- **The settings of the base are in force together with those of the branch.** A branch that drops a
  block or a root, or adds a harness folder or an alias, would otherwise loosen its own check.
- **Growth is judged against the first plan of the branch.** The plan names a module, or a folder with
  one number for what its new modules import from outside; unnamed growth is refused.
- **An overrun carries its reason and is printed.** A refusal without a way out would be answered by a
  bypass, and a number added without a word would be a plan rewritten after the code.
- **Growth is judged by the own edits of the branch.** A merge brings the work of others, judged in
  its own branch. A tree that keeps no plans gets its growth printed.
- **The list of the accepted does not lift what the branch added.** Only the owner's words do, a date
  and a quote in the reason of the line, and the line is printed.
- **Incoming links and names taken by nobody are printed, not judged.** Incoming links grow by reuse,
  and refusing that teaches to write copies.
- **The push set and the pipeline call the check with the base.** Two modes would answer differently:
  an old import renamed by the branch is old against the base and unknown to the list. A merge build has
  no own commits, and growth is not judged in it: the push of the branch did that.
- **With a base an old violation missing from the list is printed.** The list stays whole without
  refusing a branch for what it did not add.
- **A missing revision is a refusal with its name.** Judged against nothing, the check would be green.

## What is out of scope

- Links through an Angular template, a name in a variable, a path assembled by `join`, a start of a
  script from code.
- Whether a module is tested without its neighbours.
- Growth a merge of the base brought into a module the branch edits too: both are counted from the
  point the branch left its base at.
- A new cycle inside an old one with the same members, and a bypass the entry made unavoidable by a
  new import of its own.

## Contract

The surface is the launch line, the numbers it prints and the keys of the list.

### Refusal codes

- `1` — a new cycle of modules or of blocks, a new import past an entry, growth past what was named.
- `1` — a line of the list without a reason or a task, or a line whose violation is gone.
- `1` — the named revision or the named module is not there.
- `0` — the tree has no code under its roots: the check says so and skips.

## Data

The subdomain keeps no data of its own: the graph is built anew on every call, the list of the
accepted lies next to the lists of the other checks.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The refusal is written in the language of the package. Numbers are named by the words of the plan in
either language: «исходящие» and «outgoing» are read alike.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

A branch holds more than one task folder only by a merge, and a merge is not an own edit: one plan
answers for one branch.

## Decisions

- **Outgoing links are judged, incoming are not.** Incoming links grow by reuse.
- **No free growth.** The owner's words are «growth above what the plan named»; a folder named by one
  number keeps the plan short.
- **One check instead of two.** The former cycle check judged the same over a part of the files.

## History of changes

- 2026-11-24 — the subdomain was created together with the check.

## Open questions

- None.
