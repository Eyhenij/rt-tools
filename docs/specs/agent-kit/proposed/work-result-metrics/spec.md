# The metrics of the work result

**Status:** proposed · **Revision:** 17 November 2026 · **Scenario prefix:** `SC-AK`
**Depends on:** `metrics`, `observations`, `epic-stop`, `epic-table`, `hooks`, `message-bus/usage`
**Laws:** `observability`, `verifiability`, `work-conduct`, `delivery`
**Procedures:** none

An agreement about the product written before the code, task RT-3270 of the epic RT-3302. The
metrics subdomain has 306 lines, and with the terms and rules below it would cross the length limit
of the tree: the agreement merges as the new subdomain «work-result» of the package domain, with the prefix
of the domain, by the last commit of the work. The receiver half — storage, the epic window record
and the screen — is the agreement `docs/specs/message-bus/proposed/work-result-metrics/`.

## Why

On 13 November 2026 the epic RT-3227 did not reach a release, and the work stood for hours. The
report showed that as «отказов 47», and printed «нет данных» on the lines of the result. The owner
learned of the failure himself, not from the numbers.

The metrics subdomain counts refusals of checks, not the result of the work. This agreement adds
the numbers that answer "did the work reach the owner, and what did it cost him": a merge and a
release, the hours the work stood, refusals per hundred calls, re-asks, interrupts, corrections and
role verdicts. The milestone G of the epic plan — fewer than five refusals per hundred commands
and no dead end over a working day — is read from the same numbers.

## Terminology

- **The session record** — the conversation record Claude Code keeps per session on the machine.
  The source of calls, refusals and the owner's words: the observations miss part of the refusals,
  21 against 35 in the window of 13 November.
- **The cut** — the saved part of the session record of 13 November 2026 the suite runs on.
- **A call** — a tool use of the agent in the main thread of a session. The epic plan says
  "commands": a command of the agent is a call. A call of a role inside its own thread is not a call
  of the session.
- **A refusal** — an entry of one of three classes, told by the first line of its text:
  - a hook refusal — a tool result with `is_error` whose first line opens with `PreToolUse:` and
    names a hook error;
  - a permission refusal — a tool result with `is_error` whose first line names a denial by the
    permission system, such as «denied by the Claude Code auto mode classifier»;
  - a stop refusal — an entry of a person that opens with `Stop hook feedback:`. The summary entry
    of the stop hooks names the same refusal a second time and is not counted.

  Every other error result is not a refusal: a non-zero exit of a command, the owner turning a call
  down («The user doesn't want to proceed»), an interrupt, an error of the tool itself.
- **The check of a refusal** — the package name of the check the refusal text names, by this table.
  The prefix `PreToolUse:<tool> hook error:` is dropped before the table is read.

  | The refusal text opens with                       | The check                |
  | ------------------------------------------------- | ------------------------ |
  | `BLOCKED by <name>:`                              | `<name>`                 |
  | `Refused by the rules gate`                       | `skill-gate`             |
  | `Refused: the epic is over`                       | `epic-over`              |
  | a denial by the permission system                 | `permission`             |
  | any other text, `BLOCKED: <text>` included        | `unnamed`                |

  A stop refusal reads its check from the first line after `Stop hook feedback:`; a feedback entry
  with no further line counts under `unnamed`.
- **A pair of refusals** — two refusals of different checks one right after another in one session,
  in that order, with no successful call between them.
- **The owner's words** — a message of a person: an entry of a person whose origin kind is `human`,
  or an `attachment` entry of type `queued_command` whose origin kind is `human`, which is a message
  typed in the middle of a turn. Pasted text is the owner's words. A wrapper of the harness is not:
  an entry that opens with `[Request interrupted`, `<command-name>`, `<local-command-stdout>`,
  `<task-notification>`, `Stop hook feedback:`, `PreToolUse:`, `PostToolUse:`, `Caveat:`, `This
  session is being continued`, any other opening tag of the harness, a meta entry or a summary of a
  squeeze.
- **An interrupt** — an entry of the session that opens with `[Request interrupted`.
- **A tree change** — a successful edit or write of a file, or a successful commit.
- **Idle time** — the time from a refusal to the next tree change in any session of the tree on
  this machine.
- **A menu question** — a call of the question tool, asked whether a check let it through or not.
- **A re-ask** — a menu question, in the task of an earlier menu question the owner answered, whose
  beginning matches the fixed visible set of patterns that name the owner's earlier answer.
- **The task of a moment** — the task whose key the branch of the session carries at that moment.
- **The tasks of an epic** — the tasks the epic plan names, as the epic table reads them.
- **Taking a task** — the first moment a session of the tree on this machine stands on the branch of
  the task.
- **A merged task** — a task whose request is merged into its base: the epic branch, the main branch
  or the branch of a previous task of a stack.
- **The package of an epic** — a published package of the tree whose files the epic request changes.
- **A released epic** — an epic whose request is merged into the main branch, and every package of
  the epic has an edition published after that merge. An epic with no package of its own is
  released by its merge.
- **An epic window** — a stretch of work on an epic between two of its events, defined in the rules.
- **A dead end** — a series of three or more refusals of one check, of any class, in one session and
  one task, each within fifteen minutes of the one before, that the executor could not leave by
  itself: a word of the owner, typed or chosen in a menu, fell between its first and its last
  refusal, or no tree change came after its last refusal in that session. On 13 November the epic-end
  check kept refusing from 01:43 to 01:51 while the owner answered — a dead end.
- **A day** — a calendar day in UTC. The day lines, the milestone and the windows go by it.

### What it is called in the interface

| In the agreement                 | In the report and on the screen      |
| -------------------------------- | ------------------------------------ |
| merged tasks                     | «Задачи слиты»                       |
| a released epic                  | «<эпик> выпущен»                     |
| an epic merged, not released     | «<эпик> не выпущен»                  |
| an epic of a tree with no package | «<эпик> слит»                       |
| time from taking                 | «от взятия»                          |
| refusals per hundred calls       | «Отказов на сто вызовов»             |
| refusals of a window             | «отказов N из M»                     |
| pairs of refusals                | «Подряд»                             |
| idle time                        | «Простой»                            |
| re-asks                          | «Переспросили»                       |
| interrupts                       | «Прерывания хода»                    |
| the owner's words                | «слов владельца»                     |
| owner corrections                | «Правки владельца»                   |
| verdicts «goal not met»          | «Цель не достигнута»                 |
| a verdict with no task           | «без задачи»                         |
| the milestone line               | «веха G: отказов X на сто (порог 5), тупиков N — достигнута» or «— не достигнута» |
| a day not judged                 | «веха G: вызовов нет»                |
| dead ends                        | «тупиков»                            |
| a day before the counting        | «запись дня до счётчика»             |
| a metric counted by the receiver | «считается в приёмнике»              |

## Rules

### The source

- **Calls, refusals, the owner's words, interrupts and re-asks are counted from the session record,
  not from the observations.** The observations miss refusals of checks that do not write them.
- **The hook at the end of a turn counts, and it writes observations.** The day line, the report and
  the window read those lines, as every other metric. The sender reads no session record.
- **The hook keeps a mark per session.** It reads the record from the entry after its mark and
  moves the mark to the last entry it counted.
- **An unfinished last line of the record waits for the next turn.** The mark stays before it, and
  the next count reads it whole.
- **A broken line in the middle of the record is skipped and counted.** The count of skipped lines is
  an observation, and the report names the day it fell on.
- **The stop refusal of a turn is counted by the next count.** It reaches the record after the hook
  of its own turn; the next turn reads it, and the session end runs one more count for the last one.
- **The counting never fails the turn.** A record that does not read writes an observation of a
  broken read, and the hook exits as it would without counting.
- **An observation keeps the moment of each call and each refusal, with its class, check and
  branch.** A window is cut in the middle of a turn, so a count per turn does not serve it.
- **A past day is counted by a one-off recount of the saved session records, by the same counter.**
  The hook counts only new turns. The recount replaces what an earlier recount of the day wrote, so
  a second run does not add to the first; a day the hook already counted is not recounted.
- **A saved session record belongs to the tree when its working directory is the tree or a copy of
  it.** A copy already removed from disk is recognised by its branches: they stand in the history of
  the tree. The record of 13 November lies under a copy removed since.
- **The sending sends the recounted days, older than its last success too, within the keeping term.**
  Otherwise a recount of last week stays in the tree.
- **Merges and releases are read by the outcome read of the sending, from the hosting and the
  package registry, with their moments.** The read writes an observation per merged task, merged
  epic and published edition. A read that broke off writes nothing of the request it broke on. The
  suite runs this read on recorded hosting and registry answers that carry the moments.
- **The cut is rebuilt from the full record, and it keeps what the counter reads.** The class and
  the check of a refusal, the branch of an entry, the `attachment` entries with their type and origin
  kind, and per menu question a flag that its beginning matches the re-ask patterns instead of its
  text. The expected numbers of the scenarios are read on the full record when the cut is built and
  written into the scenarios.
- **The rebuilt cut changes the expectations of SC-AK-1607 and SC-AK-1609.** In SC-AK-1607 a queued
  message of a person counts as typed by the owner; SC-AK-1609 names the numbers it expects instead
  of "what it counts on the full record". Both are edited in the hooks spec by the commit that
  rebuilds the cut, together with their test titles.

### The numbers

- **The owner's words are counted per message, and a wrapper of the harness is never counted.** A
  queued message repeated by a typed message with the same text counts once. This changes the line
  "A person's message is counted by a hook" of the metrics spec: the hook reads the record of the
  turn, because a message typed in the middle of a turn never reaches the prompt hook.
- **Owner corrections are matched among the owner's words.** The set of patterns stays that of the
  metrics spec; a queued message is matched as a typed one.
- **Refusals per hundred calls are counted by day and by check, against the calls of the day.** The
  share of a check is its refusals against all calls of the same day, two decimals.
- **Pairs of refusals are counted by the ordered pair of checks.** The report lists the pairs most
  frequent first. A repeat of the same check is not a pair: it stays the empty refusal of the
  metrics spec.
- **Idle time is counted in whole minutes per stretch, and a stretch belongs to the day it started.**
  Refusals inside an open stretch do not add to it. A stretch open at the end of a turn stays open in
  the mark and closes at the next tree change of any session of the tree on this machine; one no
  change closes ends at the last entry of the day. A question to the owner does not stop it. The report prints hours with one decimal.
- **A re-ask is told by the beginning of the question.** The patterns: «ваш прошлый ответ», «вы уже
  ответили», «не зачла ваш ответ». A question refused by a check counts as asked.
- **An interrupt is counted per entry.** The report prints interrupts beside the owner's words, so a
  share is read against them.
- **A role verdict «goal not met» counts against the task of its moment, and «частично достигнута»
  is «goal not met».** On the epic branch it counts against that epic; on the main branch against the
  epic the tree assignment names for the copy, and with none it counts under «без задачи». The task
  key stays in the tree: the report splits by task, the day line carries the count.
- **A merged task is counted on the day of its merge, with the minutes from its taking.** A task with
  no taking seen on this machine counts as merged, and its minutes are not counted.
- **«Задачи слиты» is not «Принято с первого раза».** The accepted tasks land on the day their
  outcome settles, three days after the merge, and leave out requests whose head is an epic branch;
  merged tasks land on the day of the merge and count a task merged into the branch of a previous
  task as well.
- **An epic is judged by the end of the day of the report, not by today.** A report for 13 November
  built a week later says what was true at the end of 13 November.
- **An epic carries the minutes from its taking to its release, and to its merge while not
  released.** Its taking is the earliest taking of the epic branch or of a task of the epic.
- **A tree that publishes no package prints its epics as merged, never as released.**

### The epic window

- **An epic window opens at the merge of a task request into the epic branch.** The moment is the
  merge moment the hosting gives. A task merged into the branch of a previous task opens no window,
  and neither does a task merged into the branch of an epic already merged into the main branch.
- **An epic window closes at the first of three events.** The next merge of a task request into the
  same epic branch; the merge of the epic request into the main branch; the owner message that opens
  a turn in which an incident analysis is written. A window none of them closed by the end of the day
  of the report is printed as open, up to that end.
- **A window counts only the sessions that stood on the epic branch or the branch of a task of the
  epic within the window.** Such a session counts whole inside the window, a side branch it took on
  the way included: on 13 November a fix of the epic-end check went on a branch of its own in the
  same session. A session that never stood on such a branch in the window is not the work on that
  epic.
- **A window counts the sessions of every copy of the tree on the machine of the copy that sends
  it.** A session of another machine is not in it; that machine sends its own window of the epic.
- **The window is sent by the copy that read the merge that opened it, under its copy sign.** The
  merge is read once per machine, so one copy owns the window.
- **The flags «merged» and «released» are recounted at every sending until the epic is released.**
  A changed window is sent again with a new stamp; after the send that carries «released» it is not
  sent again.
- **The epics of the period are every epic with a window or a merge in the period, open ones
  included.** The report prints a line per epic of the period: its window lines, the moments,
  «отказов N из M», re-asks, the release line and the time from taking.

### The milestone and the dead ends

- **A dead end is a series the executor could not leave.** A series after which a tree change came
  with no owner message in between is not a dead end. The count of 13 November is recorded by the
  suite on the cut.
- **Milestone G is reached on a day with fewer than five refusals per hundred calls and no dead
  end.** Exactly five is not reached. A day with no call is not judged and prints «вызовов нет». The
  report prints one milestone line per day of the period.

### The report and the day line

- **The lines of the result are listed, and none of them prints «нет данных».** The lines:
  «Принято с первого раза», «Задачи слиты», the line of every epic of the period, «Простой»,
  «Отказов на сто вызовов», «Подряд», «Переспросили», «Прерывания хода», «Правки владельца», «Цель не
  достигнута», the milestone line and «Повторы ошибок». This changes the line of the metrics spec
  "Otherwise the text says there is no data" for the lines of the result.
- **«Принято с первого раза» with no task prints «0 из 0», in the report and on the screen alike.**
- **«Экзамены с первого раза» is no line of the result.** It judges how the executor learned the
  rules, not what the work gave the owner, and stays as the metrics spec has it.
- **A day with no session record says so once, as a sentence, and prints the merges of that day.**
  Merges come from the hosting, not from the record, and stay true.
- **A day older than the counting and not recounted is named apart.** It prints «запись дня до
  счётчика», and its day line carries none of the new keys of the record.
- **«Повторы ошибок» says «считается в приёмнике».** A repeated mistake is matched against the fix
  of a record over all trees, and one tree has no fixes.
- **«Пустые запуски» is counted as the metrics spec counts it, from the run events.** On 13 November
  those events exist, so the line prints a number; its usefulness metric is task RT-3283.
- **The report takes a day of its own.** `--day YYYY-MM-DD` prints that day; the report for 13
  November is read by it.
- **A report for a named day does not judge the dead rules, and says so.** A dead rule is judged over
  30 days of records, and one day is no such period. The line names it in words, not as «нет
  данных», and the JSON carries null as the metrics spec has it.
- **Every new number of the day line has a key of the closed list, entered in the same change.** The
  receiver refuses a whole line with a key it does not know, so the list and the receiver move
  together. The keys, their units and how a day sums them:

  | Key                          | Unit            | The day                                            |
  | ---------------------------- | --------------- | -------------------------------------------------- |
  | `calls`                      | calls           | the sum over the sessions of the copy              |
  | `refusalsHook`               | refusals        | the sum                                            |
  | `refusalsPermission`         | refusals        | the sum                                            |
  | `refusalsStop`               | refusals        | the sum                                            |
  | `recordRefusals:<check>`     | refusals        | the sum per check                                  |
  | `refusalPairs:<first>:<second>` | pairs        | the sum per ordered pair                           |
  | `idleMinutes`                | whole minutes   | the stretches that started on the day              |
  | `reasks`                     | questions       | the sum                                            |
  | `interrupts`                 | entries         | the sum                                            |
  | `ownerWords`                 | messages        | the sum                                            |
  | `goalNotMet`                 | verdicts        | the sum                                            |
  | `deadEnds`                   | series          | the series that ended on the day                   |
  | `tasksMerged`                | tasks           | the merges of the day                              |
  | `tasksTimed`                 | tasks           | the merged tasks of the day with a taking          |
  | `takenMinutes`               | whole minutes   | the sum over `tasksTimed`                          |
  | `recordLinesSkipped`         | lines           | the sum                                            |

- **`recordRefusals` is not `guardRefusals`.** `guardRefusals` stays what the observations of a
  guard count; `recordRefusals` counts the session record. Which of the two the table of drivers
  shows is the receiver agreement.
- **A pair key carries two names, each judged by the resource name form.** A separator inside one
  name would leave the alphabet of the name, and two long names would not fit one name of 48
  characters. A check the package does not ship leaves under the word `own`, as for the guards now.
- **The epic window leaves as its own record, not inside a day line.** A window crosses days, and a
  day line replaced by its day would split it. The record carries the epic number, the two moments,
  calls, refusals, re-asks, merged and released as zero or one, the moments of the merge and of the
  release, the minutes of the epic from taking, and the stamp of its building. The moments let the
  screen judge «выпущен» by the end of the shown day, as the report does.

## What is out of scope

- The table head in the role record, the audit failure on 422 and the release of the package — the
  grill excludes them.
- «Пустые запуски» — task RT-3283.
- A repeated mistake counted by one tree.
- The task key and the epic title outside the tree: only the epic number leaves.
- Session time and token cost, as in the metrics spec. Idle time is not session time: it measures
  stretches after a refusal only.

## Contract

`agent-kit metrics [--days N | --day YYYY-MM-DD] [--json]` gains the lines of the result, the lines
of the epics and the milestone lines; the JSON carries each as a number, never as null.

`agent-kit recount (--day YYYY-MM-DD | --days N)` recounts the saved session records of the named
days on this machine and marks the days for the sending.

The sending adds `POST /api/intake/epic-windows`, described in the receiver agreement. The day line
keeps its operation and gains the keys of the closed list.

### Refusal codes

Not applicable: the package throws no code of a procedure. The words of the receiver refusals stand
in the receiver agreement.

## Data

Observation lines of each call and refusal with its moment, class, check and branch; of the owner's
words, interrupts, re-asks and skipped lines; of merges, merged epics and published editions; of role
verdicts with a task key; and of the epic windows with the copy that owns them. A mark per session of
the end-of-turn reader with its last entry and its open idle stretch. All of them stay in the
ignored observations directory.

## Screens and states

The report of one tree is text and JSON. The screen «Качество» is described in the receiver
agreement.

| State                                    | What the report prints                                |
| ---------------------------------------- | ----------------------------------------------------- |
| a day with a session record              | every line of the result, zeros included              |
| a day without a session record           | one sentence that the record is missing, and merges   |
| a day before the counting, not recounted | «запись дня до счётчика»                              |
| a day with skipped lines                 | the lines it counted and how many lines it skipped    |
| no task accepted in the period           | «Принято с первого раза: 0 из 0»                      |
| an epic merged with no edition after it  | «<эпик> не выпущен»                                   |
| an epic of a tree with no package        | «<эпик> слит»                                         |
| an epic window not closed by the day end | the window with the word «открыто»                    |
| a day with no call                       | «веха G: вызовов нет»                                 |

## Cross-cutting requirements

### Locales

The report speaks Russian, as it does now.

### SEO

Not applicable: no public page.

### Mobile layout

Not applicable to the report; the screen is in the receiver agreement.

### Several objects

Each copy counts its own sessions into its day line. A window counts all copies of one machine and
is owned by one copy; two machines send two windows of one epic. Two epics open at once each have
their windows.

## Decisions

- **The epic window ends at the owner message that opened the analysis: «Ваше сообщение, 35 из 187
  (Recommended)».** The owner's answer in the grill. On 13 November the epic stood from the merge of
  PR 3266 at 00:34:01 to the owner message at 03:04:27; the next merge into the epic branch came only
  at 04:49:28. «35 из 189» of the request matched no event.
- **The epic number leaves the tree as a number.** A grill decision of the executor: it is a number,
  and the rule "Only numbers and package names leave a tree" lets it through. The screen shows «эпик
  3227».
- **Observations, not reading at the sending.** The sender of the day line runs with no session open
  and must not fail on a record; the end-of-turn hook already runs at the right moment.
- **The receiver half reaches production only by the rollout the owner starts.** The agent prepares
  the rollout and leaves the form open. The receiver goes out before any edition of the package that
  sends the new keys.
- **A window whose copy is removed before the release is resent by another copy of the same
  machine.** The copy that reads the release takes the window over. A grill decision.
- **An epic that changes several packages is released when each of them has an edition after the
  merge.** A grill decision.

## Open questions

None: the owner's words of 13 November are 196 on the full record, and SC-AK-1611 names them.

## History of changes

- 17 November 2026 — proposed for task RT-3270; revised by the grill decisions after the roles:
  questions Q-1 to Q-10 closed into rules.
