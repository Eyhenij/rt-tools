# Scenarios — the metrics of the work result

The numbers continue the numbering of the package and do not change after the merge; a changed
promise keeps its number.

## The owner's words and the refusals

### SC-AK-1610 — a wrapper of the harness is not the owner's words, a queued message is

Given a turn with a typed message, an interrupt entry, a `<command-name>` entry, a
`<local-command-stdout>` entry and an `attachment` entry of type `queued_command` with origin kind
`human`
When the end-of-turn hook counts the turn
Then the owner's words of the turn are two: the typed message and the queued one

### SC-AK-1650 — a queued message repeated by a typed one counts once

Given a queued message of a person and, later in the same session, a typed message with the same
text
When the turn is counted
Then the owner's words of the turn are one

### SC-AK-1611 — the rebuilt cut of 13 November gives the recorded numbers

Given the cut of 13 November 2026 rebuilt from the full record
When the recount counts the window from 00:34:01 to 03:04:27 UTC
Then the calls are 187 and the refusals 35: 30 hook refusals, 1 permission refusal and 4 stop
refusals, and the owner's words of the day are 196, as on the full record

### SC-AK-1612 — only three classes of an error result are refusals

Given a call refused by a hook, a call refused by a permission, a stop refusal, a command that
exited with a non-zero code, a call the owner turned down and a call interrupted by the owner
When the turn is counted
Then the refusals are three, and the exit, the turned-down call and the interrupt are not among them

### SC-AK-1645 — a refusal text gives its check by the table

Given refusals that open with `PreToolUse:Edit hook error: Refused by the rules gate`, `Refused:
the epic is over`, `BLOCKED by grill-gate:`, `BLOCKED: creating a branch` and a denial by the auto
mode classifier
When the turn is counted
Then their checks are `skill-gate`, `epic-over`, `grill-gate`, `unnamed` and `permission`

### SC-AK-1646 — a stop refusal is counted once, from the feedback entry

Given a stop refusal written both as an entry `Stop hook feedback:` followed by `BLOCKED by
turn-exit-guard:` and as a summary entry of the stop hooks naming the same refusal, and a second
entry `Stop hook feedback:` with no further line
When the turn is counted
Then the stop refusals are two: one of `turn-exit-guard` and one `unnamed`

### SC-AK-1613 — refusals per hundred calls are counted by day and by check

Given two days, the first with 200 calls and 6 refusals of `grill-gate` and 2 of `task-flow`, the
second with 100 calls and 1 refusal that names no check
When the report counts the period
Then the first day reads 4.00 refusals per hundred calls, `grill-gate` 3.00 and `task-flow` 1.00
against its 200 calls, and the second 1.00 under `unnamed`

### SC-AK-1614 — two different checks refusing in a row make a pair

Given a refusal of `grill-gate` followed by a refusal of the rules gate with no successful call
between, and two refusals of `task-flow` in a row
When the turn is counted
Then one pair «grill-gate → skill-gate» is counted, and the repeat of `task-flow` is not a pair

### SC-AK-1647 — a pair of long names leaves as a key of two halves

Given a pair of two checks whose names are 40 characters each
When the day line is built
Then the pair stands under `refusalPairs:<first>:<second>`, each half passes the resource name form,
and the sender drops nothing

## The hook and the recount

### SC-AK-1641 — an unfinished last line waits for the next turn

Given a session record whose last line is cut in the middle at the end of a turn
When the end-of-turn hook counts the turn, and then the next turn
Then the first count leaves the mark before that line, and the second counts it whole

### SC-AK-1642 — a broken line in the middle is skipped and counted

Given a session record with a line that does not parse between two whole lines
When the end-of-turn hook counts the turn
Then both whole lines are counted, the hook exits as it would without counting, and the report of
the day names one skipped line

### SC-AK-1629 — the counting never fails the turn

Given a session record that cannot be read
When the end-of-turn hook counts the turn
Then the hook exits as it would without counting, and an observation of a broken read is written

### SC-AK-1643 — the stop refusal of the last turn is counted at the session end

Given a turn whose stop hook refused, and the session ending right after
When the session end runs its count
Then the stop refusal is counted once for that session

### SC-AK-1632 — a past day is recounted once and sent

Given saved session records of 12 November 2026 with no observation of the hook, and a sending whose
last success is 16 November
When `agent-kit recount --day 2026-11-12` runs twice and the sending runs
Then the day carries the counts of one recount, and the sending sends the day line of 12 November

### SC-AK-1644 — the report takes a day

Given observations of 12 and 13 November 2026
When `agent-kit metrics --day 2026-11-13` is printed
Then the report counts 13 November only

### SC-AK-1656 — a report for a named day does not judge the dead rules

Given observations of 12 November 2026
When `agent-kit metrics --day 2026-11-12` is printed as text and as JSON
Then the text reads «мёртвые правила: за один день не судятся, они считаются за 30 дн. записей», the
list of metrics with no signal does not name the dead rules, and the JSON carries null for them

## The numbers

### SC-AK-1616 — idle time runs from a refusal to the next tree change

Given a refusal at 10:00, a second refusal at 10:20 and a successful edit at 11:00 in one session,
and a refusal at 12:00 with a successful commit at 12:30 in another
When the day is counted
Then `idleMinutes` of the day is 90, the report prints 1.5 hours, and the second refusal adds nothing

### SC-AK-1617 — idle time open at the end of a turn closes in the next turn

Given a refusal at the end of a turn, a question to the owner in that turn, and a successful edit in
the next turn of the same session
When both turns are counted
Then the idle stretch runs from the refusal to that edit

### SC-AK-1648 — idle time across midnight belongs to the day it started

Given a refusal at 23:40 UTC on 12 November and the next tree change at 00:20 UTC on 13 November
When both days are counted
Then 12 November carries 40 idle minutes and 13 November none

### SC-AK-1618 — the re-asks of 13 November

Given the rebuilt cut of 13 November 2026 with the answered menu question of 01:44:12 and the menu
questions of 01:48:48, 01:48:56 and 01:49:11 flagged as matching the re-ask patterns, the first two
refused by a check
When the report for 13 November is printed
Then it prints «переспросили 3»

### SC-AK-1619 — a question repeated before any answer is not a re-ask

Given a menu question refused by a check and asked again twice before the owner answers it, in a
task with no earlier answered menu question
When the turn is counted
Then no re-ask is counted

### SC-AK-1620 — interrupts and corrections are counted, a queued correction included

Given a turn with two interrupts and a queued message of the owner that matches the set of patterns
When the turn is counted
Then the interrupts are two and the owner corrections are one

### SC-AK-1621 — a verdict «goal not met» counts against the task of its branch

Given built observations of one day: a verdict «цель не достигнута» on the branch of task 1, a
verdict «частично достигнута» on the branch of task 2 and a verdict «цель достигнута» on the branch
of task 3
When the report for that day is printed
Then «Цель не достигнута» names one for task 1 and one for task 2, and the day line carries
`goalNotMet` 2

### SC-AK-1640 — a verdict on the main branch with no epic counts under «без задачи»

Given built observations of a verdict «цель не достигнута» on the epic branch of epic 7, and one on
the main branch with no epic named for the copy
When the report is printed
Then one verdict stands against epic 7 and one under «без задачи»

### SC-AK-1622 — a merged task carries the minutes from its taking

Given a task whose branch a session first stood on at 09:00 and whose request merged at 15:30, and a
task merged with no taking seen on this machine
When the outcomes are read
Then both count in `tasksMerged`, the first carries 390 minutes in `takenMinutes`, and `tasksTimed`
is 1

### SC-AK-1636 — a task merged into a previous task branch counts as merged and opens no window

Given a stack where task 2 merges into the branch of task 1, and task 1 merges into the epic branch
later
When the outcomes and the windows are read
Then both tasks count as merged on the days of their merges, and only the merge of task 1 opens a
window

### SC-AK-1623 — an epic merged with no edition after it is not released

Given the epic RT-3227 merged into the main branch on 13 November 2026 at 05:48:08 UTC, changing the
package of the tree, and the latest edition of the package published on 11 November
When the report for 13 November is printed
Then it prints «RT-3227 не выпущен»

### SC-AK-1624 — a release is judged by the end of the day of the report

Given an epic merged on one day and an edition of its package published on the next
When the report for the first day is printed after the edition
Then it prints the epic as not released, and the report for the next day prints it as released

### SC-AK-1651 — an epic that changes no package is released by its merge

Given an epic whose request changes the files of the receiver only, merged into the main branch
When the report for the day of the merge is printed
Then it prints the epic as released

### SC-AK-1652 — a tree that publishes no package prints its epics as merged

Given a tree with no published package and an epic merged into its main branch
When the report is printed
Then it prints «<эпик> слит» and no release line

### SC-AK-1639 — the epics of the period carry their minutes from taking, an open one included

Given an epic taken at 08:00 on 10 November, merged into the main branch at 17:00 and released by an
edition at 18:00 on 11 November, and a second epic taken on 11 November with one window and no merge
into the main branch
When the report for 11 November is printed
Then both epics have a line, the first with 34 hours from taking, the second as open

## The epic window

### SC-AK-1615 — the epic window of 13 November

Given the rebuilt cut of 13 November 2026, the merge of PR 3266 into the RT-3227 epic branch at
00:34:01 UTC, the owner message at 03:04:27 that opens the turn of an incident analysis, and the
next merge into the epic branch at 04:49:28
When the report for 13 November is printed
Then it prints the window of RT-3227 from 00:34 to 03:04 with «отказов 35 из 187» and a second
window from 04:49 to 05:48, closed by the merge of the epic into the main branch

### SC-AK-1633 — a window is cut in the middle of a turn

Given a turn that runs from 02:50 to 03:20 with 10 calls before 03:04:27 and 6 after, and a window
that closes at 03:04:27
When the window is built
Then it counts the 10 calls before its end, and the 6 stay out of it

### SC-AK-1655 — a merge into the branch of a merged epic opens no window

Given the epic RT-7 merged into the main branch at 03:43 on 6 November, and a task merged into the
RT-7 branch at 10:15 on 8 November
When the windows of 8 November are built
Then RT-7 has no window opened on 8 November

### SC-AK-1634 — a window counts only the sessions of the epic and its tasks

Given a window of epic 7 and, in the same hours, a session on the branch of a task of epic 7, a
session on the epic branch and a session on the branch of a task of another epic
When the window is built
Then it counts the calls of the first two sessions and not of the third

### SC-AK-1635 — the flags of a window are recounted until the epic is released

Given a closed window of an epic sent as merged and not released, and an edition of its package
published two days later
When the sending runs after the edition, and once more after that
Then the first run sends the window again as released with a newer stamp, and the second sends it
no more

### SC-AK-1631 — the epic window leaves as its own record

Given a closed epic window read by this copy
When the sending runs
Then the window leaves as a record of its own under the copy sign of this copy, with the epic
number, its two moments, calls, refusals, re-asks, merged, released and the minutes of the epic from
taking, and no day line carries it

## The milestone and the report

### SC-AK-1625 — a series the executor could not leave is a dead end

Given three refusals of one check with an owner message between the second and the third, and in
another session three refusals of one check followed by a tree change with no owner message
When the day is counted
Then one dead end is counted, the first

### SC-AK-1654 — the dead end of 13 November is counted on the cut

Given the cut of 13 November, where the epic-end check refused the owner's consent until he answered
three times
When the day is counted
Then at least one dead end is counted, and the number the suite records equals the count on the
full record

### SC-AK-1626 — the milestone line of a day

Given a day with 4 refusals per hundred calls and no dead end, and another with 6 refusals per
hundred calls
When the report is printed
Then the first prints «веха G: отказов 4.00 на сто (порог 5), тупиков 0 — достигнута» and the second
«— не достигнута»

### SC-AK-1637 — exactly five refusals per hundred calls is not the milestone

Given a day with 10 refusals of 200 calls and no dead end
When the report is printed
Then it prints «веха G: отказов 5.00 на сто (порог 5), тупиков 0 — не достигнута»

### SC-AK-1638 — a day with no call is not judged

Given a day with merges and no call
When the report is printed
Then its milestone line reads «веха G: вызовов нет»

### SC-AK-1627 — the report has no «нет данных» line among the lines of the result

Given a period with session records and no task merged or accepted
When the report is printed as text and as JSON
Then every line of the result prints a number, «Принято с первого раза» prints «0 из 0», «Повторы
ошибок» prints «считается в приёмнике», and the JSON carries no null for them

### SC-AK-1628 — a day without a session record says so once and prints its merges

Given a day with no session record and one task merged on it
When the report is printed
Then that day has one sentence that its record is missing, prints «Задачи слиты: 1», and prints no
zero for the lines counted from the record

### SC-AK-1649 — a day older than the counting is named apart

Given a day older than the first observation of the hook, not recounted
When the report is printed and the day line is built
Then the day prints «запись дня до счётчика», and its day line carries none of the record keys

### SC-AK-1630 — the day line carries the new numbers under keys of the closed list

Given observations of a day with turn counts, merges, verdicts and dead ends, and a refusal of a check
the package does not ship
When the day line is built
Then every new number stands under a key of the closed list, `recordRefusals` and `guardRefusals`
are apart, the foreign check stands under `own`, and the sender drops no new number

### SC-AK-1653 — an «own» check rolls up with the other own checks

Given refusals of two checks the package does not ship on one day
When the day line is built
Then they stand under `recordRefusals:own` as one sum
