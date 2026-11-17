# Scenarios — the work result on the screen «Качество»

The numbers continue the numbering of the domain of the intake and do not change after the merge.

## The intake

### SC-MB-434 — a day line with the new keys and one without them are both taken in

Given a day line carrying the new keys of the closed list and a day line of an older edition
carrying none of them
When both reach the intake
Then both are stored, each with the map it carried

### SC-MB-445 — a pair key is taken in by its two halves

Given a day line with `refusalPairs:grill-gate:skill-gate` and a day line with `refusalPairs:grill-gate`
When both reach the intake
Then the first is stored, and the second is refused with `metrics-field-refused` naming the key

### SC-MB-435 — an epic window lands and a later one of the same opening replaces it

Given an open window of epic 3227 opened at 2026-11-13T00:34:01Z and later the same window closed at
2026-11-13T03:04:27Z with a newer stamp
When both reach the intake in that order
Then one row of that tree, copy, epic and opening is stored, closed, with the numbers of the second

### SC-MB-446 — a window resent as released replaces the one sent as not released

Given a stored closed window of epic 3227 with released 0
When the same window arrives with released 1 and a newer stamp
Then the stored row carries released 1, and the block reads «выпущен»

### SC-MB-436 — an epic window with an older stamp changes nothing

Given a stored window with a later stamp
When the same window arrives with an earlier stamp
Then the intake refuses it with `metrics-stale`, and the stored row stays

### SC-MB-437 — an epic window with a number outside its form is refused

Given an epic window whose epic is a text, or whose calls are not a whole number
When it reaches the intake
Then the intake refuses it with `epic-window-field-refused`, names the field and stores nothing

### SC-MB-447 — an epic window with a moment outside its form is refused

Given an epic window whose closing moment is before its opening
When it reaches the intake
Then the intake refuses it with `epic-window-field-refused` naming the closing moment, and stores
nothing

## The section

### SC-MB-438 — «Качество» stands right after «Разборы происшествий»

Given a person with the rights of both sections
When the admin application draws the row of the sections
Then «Качество» stands right after «Разборы происшествий», and the address `/quality` opens it

### SC-MB-439 — refusals per hundred calls are summed over the period

Given two day lines of a period, one with 10 refusals of 100 calls and one with 30 of 900
When a person opens «Качество» for that period
Then «Отказов на сто вызовов» reads 4.00, not the mean of the days

### SC-MB-448 — merged tasks show the hours from taking

Given two day lines with `tasksMerged` 2 and 1, `tasksTimed` 1 and 1, `takenMinutes` 390 and 210
When a person opens «Качество» for that period
Then «Задачи слиты» reads 3, and «от взятия» reads 5.0 hours

### SC-MB-449 — first-pass acceptance with no task reads «0 из 0»

Given a period whose day lines carry no accepted task
When a person opens «Качество» for that period
Then «Принято с первого раза» reads «0 из 0»

### SC-MB-440 — a value no line carries is not shown as a zero

Given a period whose day lines all come from an older edition
When a person opens «Качество» for that period
Then the tiles of the new numbers read «нет данных», and the three result metrics stay as before

### SC-MB-441 — the milestone G reads per day

Given a day with 4 refusals per hundred calls and no dead end, and a day with one dead end
When a person opens «Качество» for those days
Then the first reads «достигнута» and the second «не достигнута»

### SC-MB-450 — a day with no call reads «вызовов нет»

Given a day whose lines carry merges and no call
When a person opens «Качество» for that day
Then its milestone reads «вызовов нет»

### SC-MB-451 — the table of drivers shows the record refusals as a share

Given a period with 300 calls, `recordRefusals:grill-gate` 6 and `guardRefusals:grill-gate` 4
When a person opens «Качество» for that period
Then the row of `grill-gate` keeps 4 in its loss columns and reads 2.00 in «Отказов на сто вызовов»

### SC-MB-442 — the epic window of 13 November is shown in its block

Given the window of epic 3227 of 13 November 2026 with 35 refusals of 187 calls, 3 re-asks, merged
and not released
When a person opens «Качество» for 13 November
Then the block «Окна эпиков» shows the row «эпик 3227 не выпущен · отказов 35 из 187 · переспросили 3»

### SC-MB-443 — a period with no window draws no block

Given a period with day lines and no epic window
When a person opens «Качество» for that period
Then the block «Окна эпиков» is not drawn, and the tiles stay

### SC-MB-444 — a tree narrows the windows, a version does not

Given windows of two trees and day lines of two versions
When a person chooses one tree, then one version
Then the tree leaves only its windows, and the version narrows the numbers and leaves the windows
whole
