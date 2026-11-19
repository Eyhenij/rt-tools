# Grill

**Описание фичи:** не нужно — правка проверок пакета правил, их отчёта и описаний; код приложений не меняется.

## The owner request

> я ухожу спать, переключайся в ночной автономный режим, доведи все задачи эпика до завершения и сам эпик до пр в main

The owner's word of 19.11.2026 for the night; the task is row 22 of the plan of the epic RT-3302.
The card (issue #3423) comes from the second review round of RT-3276 by the role
`product-strategist`. The milestone of the epic — fewer than five refusals per hundred commands a
day and no dead end — is reached on no day of 14–19.11 by the report `tools/work-result.mjs`: from
5,88 to 14,94 refusals per hundred. A part of the refusals is taken by no task of the epic: the
refusals with no check named, up to 7,19 per hundred a day, and those of `flow-step-guard`, from
0,37 to 0,93. The card asks to find by the session records where both come from and to lift the
false ones. Its sign: the report shows the milestone reached on at least one day.

## What the tree already has

- **How the counter names a check.** `projects/agent-kit/assets/checks/record-count.mjs` takes the
  name from the text of a refusal: `BLOCKED by <name>:`, or the words of the rules gate, or the
  words of an epic that is over. Every other refusal is `unnamed`.
- **The refusals with no check named, 14–19.11: 420.** Counted a line per refusal from the session
  records and the observations of the tree.

  | What stood behind it | Count | Verdict |
  | --- | --- | --- |
  | the model check of a turn end did not find its file in the working copy | 178 | a failure of the check, not a verdict; 175 on 16.11 in one copy |
  | a turn end refused in a session whose record is deleted | 106 | not measured |
  | the delivery guard, text «BLOCKED:» with no name | 51 | a true refusal of a package check |
  | the push guard, the same | 37 | a true refusal |
  | the browser guards | 26 | a true refusal |
  | other guards of git, of the tree assignment, of documents | 16 | a true refusal |
  | a call refused in a deleted session, no neighbour line | 3 | not measured |
  | the model check of a menu did not find its file | 2 | a failure of the check |
  | a verdict of the turn judge with no name | 1 | a true refusal |

  No refusal of the host and no miscount stands among the 263 that were read: the refusals of
  rights go under a name of their own.
- **Why the model check fails so.** The record of the settings orders the model to read its file
  under the root of the working copy. A copy that stands on an older branch has no such file. The
  model says it cannot check, the host takes that for «the condition is not met», and the turn is
  held — again at the next stop: 120 refusals in a row on 16.11, 26 seconds apart.
- **The refusals of `flow-step-guard`, 15–19.11: 106; 79 read.** 40 true, 39 false, and every false
  one is on a shell command. The guard judges a command by a file name in its text, not by whether
  the command writes to the file.

  | The reason given | Read | False | What the false ones were |
  | --- | --- | --- | --- |
  | the progress and the plan are edited by the edit tool | 20 | 11 | reads of the plan and the progress, an edit of another file whose text names `plan.md`, a trial repository |
  | the file belongs to the description of the flow and its engine (a command) | 21 | 20 | a run of the engine, an import for reading, a commit in one command with a run |
  | the marks are written only by the engine | 3 | 3 | reads of the marks |
  | the epic plan is edited by the edit tool | 3 | 2 | a staging command, a search over the archive |
  | the session records are written only by the harness | 3 | 3 | a record path given for reading |
  | the other reasons, on the edit tool | 29 | 0 | — |

- **What is left of the milestone.** With the failures of the model checks and the refusals of
  rights taken out, the days of 14–19.11 give 6,44 to 9,75 per hundred; with the exit check taken
  out as well, 5,03 to 6,57. One day goes under five — 19.11, 4,26 — and only if every unread
  refusal of a deleted session is counted a failure too.
- **The command of the card.** `node tools/work-result.mjs --observations … --days 7 --no-package`
  with no `--until` ends with code 1 and prints nothing.
- **The lists.** The scripts and a line per refusal lie in the drafts of the session; the plan
  names the numbers, and the scenarios carry the commands themselves.

## What the rules already say

- The mission of the turn guards: a check that cannot judge does not hold the turn; the engine
  that failed releases the stop and writes so in its journal.
- The rule `turn-conduct` of this tree: a guard judges the whole text of a command — the known
  cause of the false refusals, named in the memory of the tree more than once.

## Questions and answers

None. The card names the two sources and the sign.

## Decisions

- **A model check that cannot find its file lets the call through.** The words of its call say so:
  no file — the answer is «pass». A check that is not installed in a copy has nothing to judge by.
  Спросить было некого: заход автономный. Цена ошибки: одна фраза в словах вызова двух проверок.
- **Every refusal of a package check carries the name of its check.** The dispatcher knows which
  branch refused; a refusal whose text names no check gets the name from it. The count of refusals
  does not fall by this — 133 of them move from «no name» to their owners, and a task can then take
  them. Rejected: a rewrite of the texts of every guard — five guards and their suites for the same
  line of the report. Цена ошибки: одна ветка диспетчера.
- **The step guard refuses a shell command only when the command writes to the guarded file.** A
  read, a run of the engine and a file name inside the text of another edit pass. The 39 commands
  refused falsely and the 10 refused truly are the cases of the scenario, word for word. Цена
  ошибки: правило «пишет ли команда в файл» уже есть в проверке одной функцией; правится она.
- **The sign of the card is not promised.** The count shows the milestone is not reached by this
  task alone on any measured day; the plan says by how much each edit lowers the days and leaves
  the milestone to the forecast after the epic is merged. Цена ошибки: нет — это отказ от
  обещания, которое счёт не держит.
- **The report with no `--until` takes today.** The command of the card then prints the report.

## What is left unclear

- What stood behind the 106 turn ends refused in deleted sessions. 75 of them lie in three working
  copies with no named refusal of the turn judge and 37 in a row with no call between — the look of
  the failure above; the texts are gone, and nothing can read them.
