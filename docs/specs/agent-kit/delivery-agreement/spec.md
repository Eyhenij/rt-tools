# An unmerged agreement at opening a PR

**Status:** in force · **Revision:** 2026-11-04 · **Scenario prefix:** `SC-AK`
**Depends on:** `docs/specs/agent-kit/work/`
**Laws:** `work-conduct`
**Procedures:** none

## Why

The delivery guard refuses opening a PR while the branch carries its task folder, and nobody stopped
a feature agreement left unmerged in its `proposed/` directory. In a tree that installs the package
thirteen tasks merged that way: about four thousand lines of agreements never reached the domain
specs, and the specs describe less than the code does.

## Terminology

- **The draft** — the directory the plan of the branch names by the line `**Draft:** \`path\``: the
  feature agreement written before the code, to be merged into the domain spec before the PR opens.
- **The plan of the branch** — the plan in the task folder of the branch, read from the history of
  the branch: by the time the PR opens the folder is taken apart.

### What it is called in the interface

The subdomain does not come outward. The refusal is read by the executor.

## Rules

- **A PR into the main branch does not open while a draft named by a plan of the branch lies in the
  branch.** The refusal names the directory. A plan that named no draft, a draft already merged and
  removed, and the folder-skip bypass let the opening through as before.
- **A PR into an epic or into a lower branch of a stack does not wait for the draft.** Such a PR
  does not reach the main branch, and the draft of an epic lives until its last task. The PR of the
  epic is judged by the plans of all its tasks.

## What is out of scope

- The merge and lifting-draft conditions — the subdomain of the work.
- An agreement directory no plan names.

## Contract

The condition stands in the delivery guard on the call that opens a PR, next to the condition of the
task folder; its refusal joins the other unmet conditions and is printed with them at once.

### Refusal codes

Not applicable: the refusal comes as text naming the directory of the draft.

## Data

The subdomain holds no data of its own. It reads the base the command names, every plan the branch
touched from its history, and the tree of the head.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The refusal is written in the language of the tree.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable: the guard judges one branch.

## Decisions

- **The plan is read from the history, not from disk.** The task folder is taken apart before the PR
  opens, so a plan on disk is never there at that minute.
- **The folder-skip bypass covers the draft too.** Work merged in parts may merge its agreement by
  the last part.

## Open questions

None.

## History of changes

- 2026-11-04 — the subdomain was created: thirteen tasks of a consuming tree merged with their
  agreements unmerged, and the work spec has no room for another scenario. Task RT-3087.
- 2026-11-07 — the condition moved to a PR into the main branch: the agreement of a whole epic refused
  the PR of its first task. The PR of the epic now reads the plans of all its tasks. Task RT-3152.
