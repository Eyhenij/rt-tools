# The check of the work queue

**Status:** in force · **Revision:** 2026-08-26 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `delivery`, `work-conduct`
**Procedures:** none

## Why

The work queue and the repository diverge silently: the column falls behind the branch, a run does
not stand at the tip, a draft stands at a green run, a conflict arrives by someone else's merge. Not
one of these is refused by a guard — it judges one turn, while a request stands in the queue for
days. The subdomain names what the check is obliged to see and by which words it says it.

The rest of leading the work by commands is the domain next to it: there stand the creating of a
task, the folder, the taking apart and the bypasses.

## Terminology

- **A divergence** — a line of the check: the work queue and the repository say different things
  about the work.
- **The tip of a request** — the last commit of its branch; the run is asked about at it.
- **A pushed-out run** — one that waited in the group of the queue and was cancelled by the next one
  standing up; it has zero jobs.
- **The first column** — the one a task is taken into work from.

### What it is called in the interface

The subdomain has no launch line of its own: the check speaks by the lines of the divergences and by
the total.

| In the agreement | What the executor gets                                                      |
| ---------------- | --------------------------------------------------------------------------- |
| a divergence     | a line with the number of the request, the reason and the command to fix it |
| a skipped check  | a line about why the runs were not asked                                    |

## Rules

- **An open PR whose tip carries no run is a divergence of the check.** A page of a PR without a run
  looks the same as a page with a green one: it has no colour in either case. The event does not
  always reach the hosting, and a tip behind which a run did not stand is recognised only by
  somebody opening the list of the runs by hand.
- **The run is asked about at the tip of the PR, not at its branch.** A run of an intermediate
  commit says nothing about the state of the tip, and the list of the runs of the branch gives them
  back mixed together.
- **What counts is the very fact of a run, not its colour.** A run in progress and a fallen one are
  both visible on the page of the PR; only the absence is invisible, and the check speaks exactly
  about it.
- **A fresh tip without a run is not judged.** Between the push and the run some time passes, and a
  line over that interval would mean "wait", not "fix".
- **A tree without a file of the pipeline is not asked about runs.** There is nowhere for a run to
  come from there, and the line would stand at every open PR about nothing.
- **A tree whose runs were not asked about hears of it by a line of its own.** Silence about the
  unchecked reads as "the runs are in place".
- **A draft at a green run at the tip is a divergence of the check.** At a draft the merge button is
  locked by the hosting itself: a green page of a PR allows the owner nothing, and a list where
  everything is grey reads as "the work is not done". The guard of the lifting of the draft does not
  reach here — it judges one turn and stays silent while the branch carries the folder of its task.
- **The colour of the run is asked about apart from its presence.** The presence answers the
  question "the event arrived", the colour the question "the work can be handed in"; a run in
  progress and a fallen one do not condemn a draft.
- **A conflicting open PR is a divergence of the check.** A conflict arrives into a handed-in PR by
  someone else's merge, and it has no turn of its own: the guard judges one turn, while the PR
  stands in the queue for days. The line names what the conflict is with and stands third next to a
  tip without a run and a draft at a green run.
- **Mergeability that was not counted does not count as a conflict.** The hosting counts it anew
  after every edit of the main branch, and a line about the uncounted would turn red at every fresh
  tip.
- **The check of the work queue sees a task folder in a nested directory too.** A bare number in the
  name also counts as a number — the check of the name of the branch accepts the same form. A folder
  the check does not see nobody will find: one such was found by a grep, not by a check.
- **At a conflicting request the reason named is the conflict, not the loss of the event.** The
  pipeline checks the merge of the branch with the base, and at a conflict there is no merge — the
  run will not stand, however many events are brought back. Advice to bring the event back is
  carried out literally: over one session the request was reclosed twice in a row, and the run stood
  only after the main branch was merged in. The line names the reason that gets fixed, and there are
  no commands of reclosing in it.
- **A card carrying a title with a number is a task, whatever marks it wears.** The mark of the
  cargo takes a record out of the task half whole, and a tree puts that same mark on the tasks
  that grew out of cargo: that is how the reader sees where the work came from. Read by the mark
  alone, such a task was asked about neither by executor, nor by the board, nor by the link with
  an epic, nor by a matching title, and a request about it got the line "the task is not among the
  open ones". A record of the cargo has no title with a number at all, so the two signs never
  argue: the title decides, the mark sifts out what is left.

## What is out of scope

- The guards of the delivery: they judge one turn, while the check judges the state of the queue
  whole.
- The colour of the run as a sign of the readiness of the work: the check counts the presence, and
  the readiness is judged by the guard of the lifting of the draft.
- The creating of a task, a branch and a folder — the domain next to it.

## Contract

The surface is the command of the check. The answer: the lines of the divergences and an exit code,
non-zero at even one of them.

### Refusal codes

Not applicable: the check answers with the exit code of the command, not with a code of the domain —
`1` at found divergences, `0` in their absence.

## Data

The check holds no data of its own. It reads the work queue, the requests, the runs and the tree of
the tasks on the disk.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The lines are written in the language of the tree.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable: the check judges one work queue.

## Decisions

- **The line names the command it is fixed by.** A divergence without a command reads as a
  complaint: the executor looks for a way themselves and finds the wrong one.
- **The reason named is the one that gets fixed.** A consequence named as the reason leads the fix
  aside — and led it aside twice in a row over one session.

## Open questions

- `Q-QC-1` — the moment a task is taken into work is invisible to the check: the branch is not on
  the queue. A column moved in a batch at the creating of the tasks reads as taken into work, and
  the check stays silent.

## History of changes

- 2026-08-26 — the subdomain was split off from the domain "Leading the work by commands": two dozen
  scenarios out of six dozen were about one check, and the list went past the length limit.
