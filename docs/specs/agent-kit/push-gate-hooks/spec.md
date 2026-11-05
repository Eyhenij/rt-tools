# The guard scenarios in the push set

**Status:** in force · **Revision:** 2026-11-04 · **Scenario prefix:** `SC-AK`
**Depends on:** `docs/specs/agent-kit/delivery-gate/`
**Laws:** `delivery`, `verifiability`
**Procedures:** none

## Why

The push set runs the guard scenarios from a file the tree names, and a tree without that file got
no such line at all. A push that edited the guards ran not one scenario and said nothing about it: a
tree that installs the package has no run file by default, and every guard edit there left
unchecked while the set looked green.

## Terminology

- **The run file** — the executable the tree names for its guard scenarios; the package names a
  default path for it.
- **A guard edit** — a file under the directory of the tree's hooks, touched by the branch against
  its base.

### What it is called in the interface

The subdomain does not come outward. The line is read in the output of the push set by the executor
and by the owner who runs the set by hand.

## Rules

- **A push that edits the guards in a tree without a run file names the missing file.** The set
  gets a line that passes and says which file is missing and that the guard scenarios do not run.
  It does not refuse: a tree that installs the package gets its guards by the layout, and every
  upgrade edits them. A push without a guard edit, without a base, or in a tree with the run file
  gets the set as before.

## What is out of scope

- Creating a run file for a tree that lacks one.
- How a tree runs its own guard suites past the run file.
- The rest of what the push set holds — the subdomain of the delivery guards and the push gate.

## Contract

The set is printed by the profile function of the push checks; the line is one more command of it.

### Refusal codes

Not applicable: the line passes and refuses nothing.

## Data

The subdomain holds no data of its own. It reads the files the branch touched against its base.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The line is written in the language of the tree.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable: the set judges one branch against one base.

## Decisions

- **A line that passes instead of a refusal.** A refusal would stop every upgrade push in a tree
  that never had a run file, and the tree would turn the check off rather than create the file.

## Open questions

None.

## History of changes

- 2026-11-04 — the subdomain was created: a push editing the guards in a tree without a run file
  ran no scenario in silence, and the scenario file of the delivery gate is at its length limit.
  Task RT-3098.
