# The product metrics of the rules package

**Status:** in force · **Revision:** 8 November 2026 · **Scenario prefix:** `SC-AK`
**Depends on:** `observations`, `observations/cargo`, `context-cost`, `exam`, `message-bus/usage`, `message-bus/intake`, `message-bus/access-rights`, `message-bus/cargo-state`
**Laws:** `observability`, `verifiability`, `work-conduct`, `entity-models`, `lists`, `frontend-application`
**Procedures:** none

## Why

The mission of the package says a person gets a working result that matches their words, without
watching over the agent, and a corrected mistake does not come back. Counts of loads and refusals
measure none of that, so an edit of a rule stayed justified by opinion, and whether it helped stayed
unknown.

This subdomain names the metrics, the numbers each tree sends by itself, and the loop that turns
them into edits. One copy of this tree shows the size of the question: in 33 days with records one guard refused
669 times, and 395 of those refusals came right after its own refusal in the same session.

## Terminology

- **A handover** — the moment a request is ready and has a reviewer. A hook after the call keeps the
  sign of the tree of its head, in a file that does not leave the tree. A call that was refused or
  failed hands nothing over.
- **An accepted task** — a merged request of a task. A request whose head is an epic branch is not
  counted.
- **First-pass acceptance** — an accepted task with no change after the handover and no owner
  correction after the handover up to three days past the merge. A correction counts against the last
  branch handed over, whichever branch the session stands on: the executor takes the next task right
  after a handover.
- **A change after the handover** — a difference of the tree of the head against the kept sign that
  is not a merge of the base. A rewrite of history counts as a change.
- **An owner correction** — a message of a person that matches the fixed visible set of patterns. Any
  swearing from a person is a sure sign that the agent does bad work, whichever words it takes. The
  owner's word: «если от человека поступают ругательста - это верный признак что агент делает плохую
  работу, любые ругательства».
- **An empty refusal** — a refusal by a guard equal to its previous refusal in the session: the same
  content of the tree and the same refused call. A guard at the end of a turn has no call, so the
  content alone decides. A refusal of the rules gate is not an empty refusal: it is read by the
  numbers of the texts.
- **A wasted run** — a red run of a check whose content sign appears again in a later run of the same
  check on the same day.
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
- **A request without a handover sign counts apart.** It stays out of the main metric, and the report
  names how many there are: a share read without that number hides the requests it never saw.
- **A merge is not yet an acceptance by a person.** The executor approves and merges by the owner's
  standing word, so an outcome is decided three days after the merge, and a correction in those days
  takes first-pass away. The owner's word is «Правка в течение 3 дней (Recommended)».
- **A revert takes first-pass away.** A revert, or a new request naming the same task within 14 days,
  moves that task out of first-pass.
- **Three result metrics follow the mission.** First-pass acceptance, owner corrections per accepted
  task, and repeated mistakes.
- **A repeated mistake is counted against the version that carries its fix.** It is a new record on the
  same resource from a tree on a version at or after the fix, within 30 days of that tree installing
  it. The share counts fixes with such a record among fixes older than 30 days.
- **Texts are judged by four numbers, read together.** The share of edits that met a rule not yet
  loaded, the share of laid-out rules not loaded in 30 days, the cost of the entry and the share of
  exams passed the first time. The first three are never read without the cost of the entry.
- **A guard declares the rule it enforces.** A refusal by such a guard after that rule was loaded in
  the session counts against the rule: its text taught nothing. A gate refusal for a rule already
  loaded in that session is not counted: the gate's record of loads dies with a context squeeze, and
  the observations survive it.
- **Guards are judged by empty refusals and by minutes.** The share of empty refusals per guard, and
  the minutes of wasted runs per kind of step.
- **Roles and commands are judged by calls and verdicts.** The count of calls per role and command,
  and for a role that gives a verdict the share of work it refused. A verdict is read when the role
  ends, because a role usually runs in the background. Only package names and numbers are recorded.
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
- **Every run of a check writes one line.** The gate, the git hook and the run ahead each write an
  outcome from a closed list, the seconds, and the kind of step, whether a session is open or not. A
  run from a second copy writes into the main one: the heavy steps run there.
- **A content sign covers uncommitted edits.** Otherwise a red run fixed in the working copy would read
  as wasted.
- **An outcome is read by the sending, not at the merge.** A merge often happens in a browser with no
  session open. The sending asks the profile function `rt_pull_outcomes` for requests merged or closed
  since its last read. A tree without that function sends no outcomes and says so by the key `outcomesUnread`, and the
  report counts it apart.
  A read that broke off, even on one request, is named as a broken read, not as a tree with nobody to
  ask, and the day of the last read stays.
- **A request is counted once.** The tree keeps the numbers it counted in a file that does not leave.
  The file and the signs of a request lie in the store shared by the copies of the tree, under a lock.
  An older request read later does not change an outcome already counted.

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
- **The numbers of a tree are kept with the day they were counted on.** The intake replaces a day
  whole, so the morning send of yesterday carries them from the mark. A failure code stays in every
  line of its day.
- **A day leaves under the version of its records.** A repeated day must not move into the count after
  an update.
- **The first-pass count of a line is gross.** A rollback lands on a later day, so the difference is
  taken by whoever adds the days.
- **A refused line closes its own day only.** The other days go on, today's too, and the failure stays
  named.
- **The automatic sending has no path to proposals, analyses or the digest.** They hold text and leave
  by a command of a person.
- **A tree without an intake address and a token file sends nothing.** Both are required. The hook
  marks the start before the process, so such a tree starts one process in 15 minutes.
- **A copy without a build of the package asks the main copy.** A tree with an address and nothing to
  send with, or with a build that cannot send, is named at the session start. So is a token file this
  machine does not have: the token lies outside the tree, and a second machine would stay silent.
- **Enrolled trees send by default, and the change is named.** The release note and `agent-kit sync`
  name it. `send: false` stops the sending and keeps the writing. `observe: false` stops both, whatever
  `send` says. A change of `send` is an observation. With `observe: false` nothing is recorded, and
  the silence of the tree says so.
- **A failed send leaves a trace.** It writes its last result into the mark: the code, the time and
  the reason. `agent-kit doctor` and the session start name a failure that started more than a day ago. The next line
  that gets through carries that code as a number, and a tree whose token is refused sends nothing,
  so the section reads it as a silent tree.
- **A refused token stops the tries.** They resume when the token file changes.
- **A run marked as a test sends nothing.**
- **The observations directory is refused to direct edits.** A guard refuses a write there and to the
  two keys, so the executor cannot edit the data that judges it.

### The loop

- **The report of a cycle is the section over all enrolled trees.** `agent-kit metrics` is the partial
  view of one tree, without completeness and repeated mistakes.
- **The partial view names what it read.** The days it found, between which dates, and the files it
  removed by the keeping time stand in the report and in its JSON, because a reading removes them. A
  tree with no observations gets a sentence instead of zeros. A list cut short says how many lines it
  left out. The dead rules are counted only when the requested period is 30 days or more and the
  records reach its first week. Otherwise the text says there is no data, and the JSON carries null.
- **A cycle begins with the report.** The worst driver of the main metric is named with its numbers.
- **One task changes one thing and names the metric it should move.** The task and the release note
  carry the metric and the direction.
- **A release of the package does not start without its metric.** The journal is assembled from
  commits, so the required field of the release run is the template. A metric is a name the reports
  show, with a resource name after it at most, because a word of one's own cannot be judged by the
  next report. A release with no such
  edit names the reason instead: silence cannot be told from a forgotten field.
- **A cycle compares the same trees.** Only trees on a version holding the edit are compared, against
  themselves before it. A movement below the noise named with the baseline reads «не сдвинулось».
- **The role `goal-critic` gives the verdict from the numbers of the report.** The executor who made
  the edit does not.

## What is out of scope

- The kits and the other packages: the next epic takes the same approach.
- The text of any message, and any judgement of a text in the intake.
- Session time, token cost and any comparison between people.
- The minutes of CI runs: a tree does not see them, and the report says so.
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

Not applicable: the intake answers with an HTTP code and a word of the shared list, not with
`Code.X` of a procedure. The words of a refused day line:

| When                                                               | HTTP  | The word                |
| ------------------------------------------------------------------ | ----- | ----------------------- |
| a key is outside the closed list, or a value is not a whole number | `400` | `metrics-field-refused` |
| the stamp is older than the stored one                             | `409` | `metrics-stale`         |

The refusals of the tree token and of the body size are those of the observation cargo.

## Data

The table `MetricsDay` holds a tree, a copy sign, a day, a version, a stamp and a JSON map of whole
numbers, unique by tree, copy and day. The keeping term is a year, as for observations.

`Postmortem` carries a nullable `resource`. An analysis without it is counted apart. The table
`RecordTransition` holds a record, its status and the moment of the move. Nothing here keeps text.

## Screens and states

The section «Качество» stands in the admin application after «Использование», under the right
`quality:read`. The read operation is `GET /api/usage/quality`.

At the top stand the three result metrics over a period with the completeness line. Below stands a
table of drivers by resource, sorted by the loss. A tree and a version narrow the result metrics and
the table, and the completeness line stays over all enrolled trees.

| State                         | What the screen shows                                           |
| ----------------------------- | --------------------------------------------------------------- |
| reading                       | the skeleton of the section                                     |
| no enrolled tree sent a line  | the command that enrols a tree                                  |
| no line in the chosen period  | the completeness line and a request for another period          |
| no task or fix to count       | «no data» on that tile instead of zeros                         |
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

- **The accuracy of the patterns of an owner correction.** The set was widened on a sample the owner
  read, 36 of 255 messages against 15 before. It holds no swearing words, so the hook sees 8 of 63
  swearing messages, though each of them is a correction by the definition above. Questions such as
  «почему он в драфте?» count too. The first cycle measures it again.
- **The three numbers of delivery have no count.** The section was promised the days from a received
  record to its fix, the share of trees on the latest two versions seen and the share of package
  sections a tree replaces by an override. A tree sends `sectionsTotal` and `sectionsOverridden`, and
  no report reads them. The other two numbers are counted nowhere. The owner either drops the promise
  or opens a task.
- **A found leak does not stop the tries.** A line whose keys carry the tree address does not leave
  until they change, and the failure is named. The copy still tries every 15 minutes, while a refused
  token stops that. Whether a leak needs the same stop is not decided.
- **What closes the epic has no check.** The report was meant to collect data from the enrolled
  trees before the epic counts as closed, and the receiver goes out from the main branch, so the
  epic merges first. It is read by the completeness line, and the owner names the number.
- **Nothing starts the first cycle.** It was promised as a task of its own after two weeks of data:
  one edit chosen by the report, with its result in the next report. Only the epic plan holds it, as
  task RT-3158.

## History of changes

- 8 November 2026 — merged into the package spec as a subdomain, with the old scenario numbers. The
  articles it changed were edited in their own specs. Three rules without a place in code left for
  the open questions: delivery, the close of the epic and the first cycle. A found leak left the rule
  about a refused token for the same reason. Only a change of `send` is an observation, because
  nothing is recorded under `observe: false`.
- 7 November 2026 — proposed, then rewritten after the review by the role `spec-critic`.
