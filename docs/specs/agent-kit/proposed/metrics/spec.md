# The product metrics of the rules package

**Status:** proposed · **Revision:** 7 November 2026 · **Scenario prefix:** `SC-AK`
**Depends on:** `observations`, `observations/cargo`, `context-cost`, `exam`, `message-bus/usage`, `message-bus/intake`, `message-bus/access-rights`, `message-bus/cargo-state`
**Laws:** `observability`, `verifiability`, `work-conduct`, `entity-models`, `lists`, `frontend-application`
**Procedures:** none

A product agreement written before the code. It merges into the package spec as a subdomain by the
last commit of the epic, with the same scenario numbers.

## Why

The mission of the package says a person gets a working result that matches their words, without
watching over the agent, and a corrected mistake does not come back. Nothing measures that today.
The package counts loads and refusals, so an edit of a rule is justified by opinion, and whether it
helped stays unknown.

This agreement names the metrics, the numbers each tree sends by itself, and the loop that turns
them into edits. One copy of this tree shows the size of the question: in 33 days one guard refused
668 times, and 420 of those refusals came in a row in one session.

## Terminology

- **A handover** — the moment a request is ready and has a reviewer. A guard keeps the sign of the
  tree of its head at that moment, in a file that does not leave the tree.
- **An accepted task** — a merged request of a task. A request whose head is an epic branch is not
  counted.
- **First-pass acceptance** — an accepted task with no change after the handover and no owner
  correction after the handover.
- **A change after the handover** — a difference of the tree of the head against the kept sign that
  is not a merge of the base. A rewrite of history counts as a change.
- **An owner correction** — a message of a person that matches the fixed visible set of patterns.
- **An empty refusal** — a refusal by a guard equal to its previous refusal in the session: the same
  content of the tree and the same refused call.
- **A wasted run** — a red run whose content sign appears again in a later run of the same day.
- **A day line** — the numeric record of one working copy for one day, the only thing the automatic
  sending carries.
- **A baseline** — the value of a metric over two weeks or the first ten accepted tasks, whichever
  comes later, per tree.
- **A cycle** — one pass from a report to a measured edit.

### What it is called in the interface

| In the agreement      | On the screen            |
| --------------------- | ------------------------ |
| the report            | «Качество», a section    |
| first-pass acceptance | «Принято с первого раза» |
| an owner correction   | «Правки владельца»       |
| an empty refusal      | «Пустые отказы»          |
| a wasted run          | «Пустые запуски»         |

## Rules

### The metrics

- **First-pass acceptance is the main metric of the package.** Its value is the share of first-pass
  tasks among accepted tasks and requests closed unmerged. Every other metric explains its movement.
- **A revert takes first-pass away.** A revert, or a new request naming the same task within 14 days,
  moves that task out of first-pass.
- **Three result metrics follow the mission.** First-pass acceptance, owner corrections per accepted
  task, and repeated mistakes.
- **A repeated mistake is counted against the version that carries its fix.** It is a new record, or a
  second arrival of a known one, on the same resource from a tree on a version at or after the fix,
  within 30 days of that tree installing it. Only fixes older than 30 days enter the share.
- **Texts are judged by four numbers, read together.** The share of edits that met a rule not yet
  loaded, the share of laid-out rules not loaded in 30 days, the cost of the entry and the share of
  exams passed the first time. The first three are never read without the cost of the entry.
- **A guard declares the rule it enforces.** A refusal by such a guard after that rule was loaded in
  the session counts against the rule: its text taught nothing. Gate refusals after a context squeeze
  are not counted, because the record of loads dies with it.
- **Guards are judged by empty refusals and by minutes.** The share of empty refusals per guard, and
  the minutes of wasted runs per kind of step.
- **Delivery is judged by three numbers.** Days from a received record to its fix, the share of trees
  on the latest two versions seen, and the share of package sections a tree replaces by an override.
- **A report names its own completeness.** It states how many enrolled trees sent a day line in the
  last seven days, how many send outcomes, and which last send failed.
- **A metric has no target until it has a baseline.** The owner names targets after the baseline. A
  target is a value and a date, written next to the metric.

### What a tree records

- **Only numbers and package names leave a tree.** The owner's word is «Только числа». No text, path,
  task title, content sign, request number or name of a person is sent.
- **The tree counts by itself.** Signs of content and of calls stay in a file git ignores. The tree
  decides what is empty and what is wasted, and the day line carries the counts.
- **A number is judged by its shape.** The sender drops a field that is not a whole number, and the
  intake refuses it. A key of a day line comes from a closed list in the package.
- **A person's message is counted by a hook, and the executor takes no part.** The hook adds to a
  counter of the current branch and does not keep the message.
- **Every run writes one line.** The gate, the git hook and the run ahead each write an outcome from a
  closed list, the seconds, and the kind of step, whether a session is open or not.
- **A content sign covers uncommitted edits.** Otherwise a red run fixed in the working copy would read
  as wasted.
- **An outcome is read by the sending, not at the merge.** A merge often happens in a browser with no
  session open. The sending asks the profile function `rt_pull_outcomes` for requests merged or closed
  since its last read. A tree without that function sends no outcomes, and the report counts it apart.
- **A request is counted once.** The tree keeps the numbers it counted in a file that does not leave.

### What sends it

- **Guards start the sending, and the agent sends at the end of every session.** The owner decided so
  on 7 November 2026. A guard starts it from the record of an observation. `SessionEnd` and `Stop` start
  it too, and `SessionStart` sends what a dead session left.
- **A guard never waits for the network.** It starts a separate process and continues.
- **A copy tries at most once in 15 minutes.** The mark lives in the ignored observations directory,
  one per copy, and holds the last try and the last success. `SessionEnd` ignores the time and keeps
  the lock.
- **The window runs from the last success, at most the keeping term.**
- **A send holds a lock of its copy, and a second one exits.**
- **The automatic sending has no path to proposals, analyses or the digest.** They hold text and leave
  by a command of a person.
- **A tree without an intake address and a token file sends nothing.** Both are required.
- **Enrolled trees send by default, and the change is named.** The release note and `agent-kit sync`
  name it. `send: false` stops the sending and keeps the writing. `observe: false` stops both, whatever
  `send` says. A change of either key is an observation.
- **A failed send leaves a trace.** It writes its last result beside the mark: the code, the time and
  the reason. `agent-kit doctor` and the session start name a failure older than a day.
- **A refused token or a found leak stops the tries.** They resume when the token file or the cargo
  changes.
- **A run marked as a test sends nothing.**
- **The observations directory is refused to direct edits.** A guard refuses a write there and to the
  two keys, so the executor cannot edit the data that judges it.

### The loop

- **The report of a cycle is the section over all enrolled trees.** `agent-kit metrics` is the partial
  view of one tree, without completeness, repeats and delivery.
- **A cycle begins with the report.** The worst driver of the main metric is named with its numbers.
- **One task changes one thing and names the metric it should move.** The task and the release note
  carry the metric and the direction.
- **A cycle compares the same trees.** Only trees on a version holding the edit are compared, against
  themselves before it. A movement below the noise named with the baseline reads «не сдвинулось».
- **The role `goal-critic` gives the verdict from the numbers of the report.** The executor who made
  the edit does not.
- **The epic closes when one edit chosen by the report has its result in the next report.**

## Articles this agreement changes

| Spec                         | Article                                                                               | Change                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `observations/spec.md`       | «Network telemetry and background sending» in the out-of-scope list                   | Removed                                                                     |
| `observations/spec.md`       | «New kinds of events» in the out-of-scope list                                        | The closed list gains the run line and the exam verdict                     |
| `observations/spec.md`       | The writing «is switched off whole»                                                   | Stays for `observe`. `send` is a second key                                 |
| `observations/spec.md`       | «Measuring the session time and the token cost» in the out-of-scope list              | Stays. A run's seconds measure a check, not a session                       |
| `observations/cargo/spec.md` | «Nothing goes outward that a person did not send by a command»                        | Holds for proposals, analyses and the digest. Day lines leave by themselves |
| `observations/cargo/spec.md` | «The cargo goes by the same request as the rest … only by a command»                  | The same exception                                                          |
| `observations/cargo/spec.md` | «A resource name the package does not ship leaves as a constant word»                 | Day lines carry no such name                                                |
| `message-bus/usage/spec.md`  | A digest over several trees and the screen of guard refusals in the out-of-scope list | Moved in by this agreement, at the owner's request                          |
| `context-cost/spec.md`       | The command «goes to no network»                                                      | Stays. The sending reads the number itself                                  |
| `exam/spec.md`               | «No storage of its own»                                                               | The exam guard writes a verdict line                                        |

## What is out of scope

- The kits and the other packages: the next epic takes the same approach.
- The text of any message, and any judgement of a text in the intake.
- Session time, token cost and any comparison between people.
- The minutes of CI runs: a tree does not see them, and the report says so.
- Metrics of roles and commands: no signal exists yet.
- Targets before the baseline.

## Contract

`agent-kit metrics [--days N] [--json]` prints the partial view of one tree. `agent-kit send` builds the
day lines of the window and sends them. `--quiet` prints nothing and writes its result to the mark.

`POST /api/intake/metrics` takes a day line: the tree, the copy sign, the day, the package version, the
stamp of its building and a closed map of whole numbers. A day line replaces the stored one of that
tree, copy and day. The intake serialises that key and refuses a body whose stamp is older than the
stored one.

The copy sign is a random value made at the first send and kept in the ignored directory.

### Refusal codes

| Code                    | When                                                               |
| ----------------------- | ------------------------------------------------------------------ |
| `metrics-field-refused` | a key is outside the closed list, or a value is not a whole number |
| `metrics-stale`         | the stamp is older than the stored one                             |

The refusals of the tree token and of the body size are those of the observation cargo.

## Data

A new table `MetricsDay` holds a tree, a copy sign, a day, a version, a stamp and a JSON map of whole
numbers, unique by tree, copy and day. The keeping term is a year, as for observations.

`Postmortem` gets a nullable `resource`. An analysis without it is counted apart. A new table
`RecordTransition` holds a record, its status and the moment of the move. Nothing here keeps text.

## Screens and states

The section «Качество» stands in the admin application after «Использование», under the right
`usage:read`. The read operation is `GET /api/usage/quality`.

At the top stand the three result metrics over a period with the completeness line. Below stands a
table of drivers by resource, sorted by the loss. A tree and a version narrow it.

| State                         | What the screen shows                                           |
| ----------------------------- | --------------------------------------------------------------- |
| reading                       | the skeleton of the section                                     |
| no enrolled tree sent a line  | the command that enrols a tree                                  |
| fewer than ten accepted tasks | the count instead of a share, because a share of three misleads |
| a tree's last send failed     | its name and the reason beside the completeness line            |
| a read failed                 | the refusal text and a repeat action                            |

## Cross-cutting requirements

### Locales

The screen speaks Russian, as the rest of the admin application does.

### SEO

Not applicable: the section is behind sign-in.

### Mobile layout

The table folds into cards on a narrow screen, as the section «Использование» does.

### Several objects

Trees are told apart by the name the owner gave them. A copy has a random sign, so two machines with
one path do not erase each other's day.

## Decisions

Decisions of the owner:

- **The main metric is first-pass acceptance.** Rejected: lost minutes, because fast work is not yet
  right work.
- **Numbers only.** Rejected: cleaned text, because cleaning gives no guarantee.
- **Guards and the session end send by themselves.** Rejected: sending by a command.
- **The package goes first.** The kits are the next epic.

Assumptions of the executor, each named so it can be overruled:

- **The tree counts, the intake stores counts.** Sending content signs would break «Только числа»:
  an unsalted sign of a commit identifies a tree in an open repository.
- **A try once in 15 minutes.** One tree already sent 5826 lines in three days, so a stream of refusals
  must not start a stream of processes.
- **Ten tasks before a share, 14 days for a revert, 30 days for a repeat.** A starting point, reviewed
  on the first cycle.
- **Enrolled trees send by default.** The owner's words name no exception, and the change is announced.

## Open questions

- **The accuracy of the patterns of an owner correction.** It is measured on a sample the owner reads,
  on the first cycle.

## History of changes

- 7 November 2026 — proposed, then rewritten after the review by the role `spec-critic`.
