# The usefulness of the push set checks

**Status:** in force · **Revision:** 18 November 2026 · **Scenario prefix:** `SC-AK`
**Depends on:** `metrics`, `observations`, `hooks`, `push-gate-ahead`
**Laws:** `observability`, `verifiability`, `delivery`
**Procedures:** none

Which push set checks pay for their seconds: the run line every step of the set writes, and the
section of `agent-kit metrics` that counts false refusals, idle runs and the price of a defect.

## Why

The push set runs every check on every push and never says which of them finds anything. A check
may run for months without one refusal; another refuses falsely and is simply run again. On
13 November 2026 the set ran seven times and three runs were wasted, and the step of the package
hook scenarios took 13–19 minutes on branches that touched no check. The metrics report counts the
refusals of the conversation checks and has no line about the push set.

## Terminology

- **A run** — one start of one check of the push set: its command, the content sign of the tree it
  ran on, the base, the outcome, the seconds and the moment.
- **A real refusal** — a red run after which the same command on the same content sign never went
  green.
- **A false refusal** — a red run after which the same command on the same content sign went green.
- **A check** — a command of the push set without its base: `--base=<ветка>` and
  `RT_SUITES_BASE=<ветка>` name the base, not the check.
- **The subject of a check** — what it reads: the recorded reads of the push inputs table, or the
  paths the tree profile declares for a step the table does not record.
- **An idle run** — a run on a change that touched nothing of the subject of the check.
- **The price of a defect** — the seconds of all runs of a check over the period divided by its
  real refusals.

### What it is called in the interface

The report prints in the owner's language: «Проверки набора», «запусков», «секунд», «отказов»,
«ложных», «лишних», «секунд на дефект», «ни разу не отказали по делу», «ложных больше настоящих».

## Rules

### The record of a run

- **A run line carries the moment, the base and whether the change touched the subject of the
  check.** Without them a repeat on the same tree and an idle run cannot be told apart.
- **The run line stays in the marks of the tree, not in the observation.** The command and the
  base are the tree's own and do not leave the machine.
- **A line written before this work counts in the numbers it can answer.** It has no moment, no
  base and no subject mark: it counts in the runs, the seconds, the refusals and the false refusals,
  and the idle runs of its check read «предмет не записан».

- **A red step names the file of its full output and the locale it ran under.** The refusal keeps
  the last 25 lines, and the failed suite of a long step stands above them. A rerun in a shell of
  another locale comes out green, and the refusal then counts as false with no reason known.

### The numbers

- **A false refusal is a red run followed by a green run of the same command on the same content
  sign.** These are the words of the request: «повтор на том же дереве прошёл зелёным».
- **A real refusal is a red run with no later green run of the same command on the same sign.**
- **An idle run is a run whose change touched nothing of the subject of the check.** The subject of
  a step of the push inputs table is its recorded reads, judged by the rule `select` uses; the
  subject of another step is the paths the tree profile declares for it.
- **The subject of the package hook scenarios is the hooks, the checks and the scenarios, not the
  package root.** A branch that edits only the library code, a README or a spec of the package
  runs them idle: that is the owner's example of 13 November.
- **A step `select` did not start is recorded as not run, and the report counts it apart from the
  idle runs.** Such a step cannot run idle, and a zero in its column would read as «never wasted».
- **A check whose subject is not recorded is printed «предмет не записан», not zero.** A zero would
  read as «the check never ran idle».
- **The price of a defect is the seconds of all runs divided by the real refusals.** A check with
  no real refusal prints «ни одного дефекта».

### The report

- **`agent-kit metrics` prints a table of the push set checks with five numbers each.** Runs and
  seconds, refusals, false refusals, idle runs, the price of a defect.
- **One check on several bases is one line.** The run line holds the checksum of the command
  without its base, so the step the profile prints with a base and without one is one check. An
  old line, written with the base inside, is matched by the current set over the branches the tree
  knows.
- **The report takes the checksum from the hook that writes it.** An own copy of the computation
  drifts from the hook silently: one side writes under its checksum, the other looks under its own.
- **The check is named by its command from the current push set, found by its checksum.** A
  command no longer in the set is printed by its checksum, and the report counts such lines apart.
- **The report names apart the checks that never refused for real over the period.**
- **The report names apart the checks with more false refusals than real ones.**
- **Both lists are ordered by the seconds the check took.** A check of a tenth of a second and a
  check of a quarter of an hour are not equal candidates.
- **`--day` narrows the table to one day, like the rest of the report.**

## What is out of scope

- Sending the table to the receiver and showing it on a screen: the request names only the report.
- Removing or moving a check out of the set: the report names candidates, the owner decides.
- Recording the reads of the `nx affected` steps in the push inputs table: the profile declares
  their subject by paths.
- Making the package hook scenarios run only the suites the change reaches: the report shows what
  they cost idle, a task of its own moves the number.

## Contract

Not applicable: the work adds no procedure and no endpoint; the report is a command of the package.

### Refusal codes

Not applicable: nothing here refuses.

## Data

The marks of the day `runs-<day>` under the observations of the tree: one line per run — content
sign, command checksum, outcome, seconds, and after this work the moment, the base checksum and the
subject mark (`touched`, `idle`, `unknown`, or `not-run` for a step `select` did not start). The
command checksum is taken over the command with its base replaced by a mark. They live a month, like the other marks.

## Screens and states

Not applicable: the work has no screen; the report is text in the terminal.

## Cross-cutting requirements

### Locales

The report is printed in Russian, like the rest of `agent-kit metrics`.

### SEO

Not applicable: no page.

### Mobile layout

Not applicable: no page.

### Several objects

Not applicable: the marks belong to one tree; every copy writes into the main one.

## Decisions

- **The source is the run marks, not the observations.** The marks already hold the content sign and
  the command of every run for a month; an observation leaves the machine and cannot carry the
  command.
- **The subject is judged by the same rule `select` uses.** Two rules for one question would drift
  apart, and the report would call a run idle that the set had to start.

## Open questions

None.

## History of changes

- 17 November 2026 — written as the agreement of RT-3283.
- 18 November 2026 — merged into the package spec; the checksum drops the base entirely and is
  taken from the hook.
