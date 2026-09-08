# The guards of the progress of the work

**Status:** in force · **Revision:** 2026-08-27 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `work-conduct`, `verifiability`
**Procedures:** none

## Why

The work goes over many sessions, and between them the executor remembers nothing: the plan on the
disk is the only thing that outlives a break. The subdomain names what the guards of the progress of
the work demand of an edit of code and where their knowledge about the work ends.

There are two requirements, and two guards hold them: the task folder with a plan and a declared
state is one, the agreement about the product named in the plan is the other. They are separated so
that the tree can refuse one requirement and keep the second.

The guards judging the end of a turn and the rules gate are neighbouring subdomains: the subject
there is different.

## Terminology

- **A task folder** — a directory under the name of the branch, where the analysis of the request,
  the plan and the progress of the work lie.
- **A state of the work** — the unit the work is led by; it is declared by a line in the progress of
  the work.
- **Handed-in work** — a branch whose commit took the task folder apart: there is no plan on the disk
  any more.
- **An agreement about the product** — a draft in the "proposed" directory or a domain spec, named by
  a line of the plan.

### What it is called in the interface

The guards have no interface: only the executor sees them — as the text of a refusal in their own
turn.

## Rules

- **Application code is not edited while there is no task folder, no plan in it and no declared
  state.** An artefact on the disk does not say whether the work reached the editing of code: an
  empty plan lies the same as a written one and lifts the requirement by itself.
- **What is judged is the declared transition, not the presence of files.** Code is edited in the
  states of a stage in progress, of stages that have ended, of handed-in work and of an ended review;
  a name outside the list does not count as a state.
- **The refusal names the mandatory action of the state that is declared.** An executor who is told
  only "the wrong state" will rewrite the line of the state instead of making the step.
- **A folder taken apart by a commit of the branch lifts the requirement of the plan.** The tidying
  stands before the opening of the request, and an edit by the remarks of the review goes without a
  plan on the disk. The sign is taken from the history of the branch: a folder removed but not
  committed does not mean handed-in work.
- **The task folder goes into the branch by a commit, it does not live in one working tree.**
  Uncommitted, it passes all the requirements of the disk without a refusal, and the sign of
  handed-in work is taken from the history.
- **The agreement is demanded by the paths of the edit, not by an appraisal of the task.** The rules,
  the texts, the tooling and the dependencies do not fall under the requirement: otherwise the
  analysis of a task could not be led before the branch is created.
- **The agreement is named by one of two kinds — a draft in the "proposed" directory or a domain
  spec.** Demanding one kind means imposing the way of writing together with the check.
- **A named agreement must exist on the disk or in the history of the branch.** A merged one leaves
  the disk, and the plan refers to it to the end of the work.
- **The bypass of the requirement of the agreement is the line about unchanged behaviour with the
  reason of the owner.** An empty reason is no bypass, and the bypass does not lift the requirement of
  the task folder.
- **An edit put by a shell command is judged on a par with an edit by a tool.** Otherwise the refusal
  is gone around by changing not the tool but the way of writing.
- **Removing a path that is not in the history does not count as an edit of the product.** A
  temporary directory of one's own under the root of the applications is tidying after oneself, not a
  change of behaviour.
- **A laid-out rules layer is judged on a par with application code.** It is covered by the paths of
  the code nowhere, and its sign is its own — the layout header at the start of the file.

- **The keys of the task folder are read under two names, English and Russian.** The samples of a
  task folder in the package carry the English keys — `## Where we stand`, `**State:**`, `**Draft:**`,
  `**Behaviour:** unchanged` — and the folders of the tree created before the translation of the layer
  the Russian ones. Either of the two names is enough: otherwise the translation of the samples would
  make the state of the work already in progress invisible.

## What is out of scope

- The guards of the end of a turn — a neighbouring subdomain: there the turn is judged, not the place
  of an edit.
- The rules gate — a neighbouring subdomain: it demands a loaded rule, not a plan.
- The checks run by a command: their subject is the tree, not an edit.

## Contract

The surface is the files of the hooks the tree calls at the event of an edit. The refusal comes as
the decision `deny` with the text of the reason; silence means the edit is allowed.

### Refusal codes

Not applicable: the guard answers with a decision and the text of a reason, not with a code.

## Data

The guards have no data of their own: they read the task folder, the plan, the progress of the work
and the history of the branch.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The texts of the refusals are in the language of the tree.

### SEO

Not applicable: the guards give nothing outward.

### Mobile layout

Not applicable.

### Several objects

Not applicable: a guard judges one edit of one branch.

## Decisions

- **Refusing in favour of the work.** There is no parser of the input, it is not a git repository, a
  foreign tool — the guard lets it through: a broken guard has no right to jam the work.
- **Two requirements — two guards.** By one file a refusal of the requirement of the agreement lifted
  the requirement of the task folder along with it, and the tree never asked to hold them together.

## Open questions

None.

## History of changes

- 2026-08-27 — the subdomain was split out of the spec of the guards: the scenario file had outgrown
  the length limit, and the subject in it was double — the guard judging the place of an edit and the
  guard judging the progress of the work.
