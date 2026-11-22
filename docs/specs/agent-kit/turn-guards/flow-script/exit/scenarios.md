# Scenarios: the guard of the exits of a turn

A subdomain of the task flow as an executable scenario. Here are the scenarios of the verdict at
the end of a turn and of its release cases.

### SC-AK-1427 — the end of the scenario releases the turn

Given the measurer of the end of the epic met
When the release cases are read
Then the turn is released as the end of the scenario

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1428 — outside an epic, exit 10 releases the turn

Given a copy outside an epic whose branch handed its work over by a request, and the same copy without a request
When the release cases are read
Then the first is released as the end of the scenario and the second is held

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1429 — a stop word of the owner releases the turn

Given the owner's last word «Стоп, на сегодня хватит», and the same through the hook after a write
When the turn ends
Then it is released by the stop word

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1430 — «хватит останавливаться, продолжай» holds the turn

Given the owner's last word «хватит останавливаться, продолжай»
When the stop word is measured
Then it is not a stop

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1431 — «Стой, не туда — делай RT-N» holds the turn

Given the owner's last word «Стой, не туда — делай RT-12»
When the stop word is measured
Then it is not a stop

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1463 — «Стоп, не делай этого» releases the turn

Given the owner's last word «Стоп, не делай этого»
When the stop word is measured
Then it is a stop: «делай» after «не» does not hold the turn

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1505 — a stop word added to the description releases the turn without an edit of the engine

Given a copy of the description with the stop word «шабаш» added
When «Шабаш, на сегодня всё» is measured by the copy and by the package description
Then the copy reads a stop and the package description does not

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1432 — a session without a write releases the turn

Given a session that only read and searched, one that edited a file and one that committed
When the write is measured and the release cases are read for the first
Then only the first wrote nothing, and its turn is released

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1433 — a session without a write after «ну что там?» holds the turn

Given a session without a write and the owner's last word «ну что там?»
When the release cases are read
Then the push is measured and the turn is held

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1440 — a branch outside the scenario releases the turn

Given a branch outside the scenario on which the session wrote
When the release cases are read
Then the turn is released

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1465 — a branch outside the scenario releases the turn after a push of the owner

Given a branch outside the scenario and the owner's last word pushing the work on
When the release cases are read
Then the turn is released: the engine has no next step to name

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1434 — a role session releases the turn

Given a role whose header names no edit tool, and a role with Edit
When the role is measured, and the hook is called for the first after a write
Then the first is a role session and its turn is released; the second is not

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1435 — the silent hosting releases the turn with its reason

Given a measurement that stopped on the silent hosting, and one that stopped on an unmet local exit after a silent read
When the release cases are read
Then the first is released as the silent hosting and the second is held

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1444 — a menu of a refusal lost a second time in a row releases the turn

Given two refusals naming the menu, each followed by a menu that was not answered; one such refusal; and a second menu answered
When the lost menu is measured
Then only the first is lost, and its turn is released

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1436 — a failed engine releases the turn and writes the journal

Given an engine that exits with an error
When the hook is called after a write
Then the turn is released and the journal holds «движок упал»

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1437 — an engine past its limit gives the same outcome

Given an engine that runs longer than the limit
When the hook is called
Then the turn is released and a second line «движок упал» is in the journal

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1438 — an engine that cannot be called gives the same outcome

Given a path to an engine that does not exist, and a Stop branch the dispatcher stops at its limit
When the hook and the dispatcher are called
Then both release the turn and write «движок упал»

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`, `projects/agent-kit/tests/dispatch.test.sh`.

### SC-AK-1464 — after a failure of the engine the next turn starts with a line about it

Given a journal holding «движок упал» written by a Stop branch the dispatcher stopped at its limit
When the owner's next prompt is dispatched, and the one after it
Then the first carries a line about the failure, and the second does not

Covered: `projects/agent-kit/tests/dispatch.test.sh`, `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1439 — the eighth refusal in a row is written to the journal

Given a branch whose scenario is not over
When the hook holds the turn eight times in a row
Then the journal holds one line about the eighth refusal

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1442 — a step another check forbids makes the refusal name the menu about that check

Given two refusals of calls by one guard for one reason, a write between two refusals, and two reasons
When the forbidden step is measured and the turn is held
Then only the first is forbidden, and the refusal names the guard and the menu

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1443 — a blocked task leaves the work to the next unblocked one

Given the owner's menu
When the refusal is read
Then it says that a deferral takes the next unblocked task, and «стоп» ends the turn

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1445 — the menu of a refusal carries the two options

Given a held turn on the branch of task 7 refused twice by another check, and the options without a task
When the menu is named
Then it carries «отложить RT-7» and «стоп»; without a task the first stays «отложить RT-N»

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1467 — the option «стоп» releases the turn

Given the owner chose «стоп» in the menu
When the owner's word and the stop word are read
Then the word is «стоп», and it is a stop

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1468 — the option «отложить RT-N» lets the deferral mark be set

Given the owner chose «отложить RT-7», and a last word «ок»
When the plan of the epic is edited to mark RT-7 «отложено»
Then the first edit passes and the second is refused

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1701 — a stop with no call after a refusal names the owner's menu

Given a refusal of a stop that named a move, and a second stop with no call after it
When the hook on Stop measures the session
Then the session is idle, and the refusal names the owner's menu; a call after the refusal or a first stop is no idle

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1554 — the engine measures the copy of the session

Given the main checkout on a task branch with open work, and a session that wrote in a worktree
When the hook on Stop gets the directory of that worktree in the field `cwd`
Then a worktree on a branch outside the scenario releases the turn, though the main checkout holds
And a worktree whose branch does not carry the engine is not judged and writes nothing to the journal
And a role is read from the agents of the worktree

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1555 — a write is recognised past the variables and the options of git

Given commands `NAME=x git commit`, `git -c key=value -C dir commit` and `sed -i`
When the measurer of a write reads the session
Then each is a write, and `sed -n` is not

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1556 — a stop word followed by an order of work holds the turn

Given «хватит спрашивать, иди дальше», «не сейчас про это, сначала тесты» and «stop asking me»
When the owner's last word is judged
Then none of them releases the turn, and «стоп» alone still does

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1759 — the session source names the start and the end of a background task

Given a record with a command sent to the background, an asynchronous agent, a notice of a task with a final status and a call that stops a task
When the session source reads the events of the record
Then each start is an event with the call, the task and the time, and each end names the call or the task
And a plain call, a refused start, a monitor and a notice with no final status are neither
And a stop summary with no refusal is the event of an ended turn
And a turn the agent closed is ended once a word of the owner or a new call follows it
And it is not ended when the feedback of a stop hook follows, when only service entries of the harness do, or when nothing does
And an agent a message resumed is a start again, and its notice «is waiting on its own background work» is no end
And an entry of a subagent gives no event, and a meta entry of a hook ends no turn
And a notice that names several tasks ends each of them

Covered: `projects/agent-kit/tests/task-flow-script-session.test.sh`.

### SC-AK-1760 — the session record is read by pieces

Given a record whose line is longer than a piece
When the lines are read by pieces of seven bytes and by one piece larger than the file
Then both give the same lines, and a line break at the end adds no line
And the source of the records reads its entries by the same reader

Covered: `projects/agent-kit/tests/task-flow-script-session.test.sh`.

### SC-AK-1761 — a stop with a background task of the session running is released

Given a session that wrote to the tree and started a background task three minutes ago
When the hook on Stop measures the session
Then the session waits, and the turn is released by the case of a background task
And a task that ended, by its call or by its task, is no wait; one task of two still running is
And a stop word of the owner is asked before the case
And the hook writes the release to the journal
And an end written before its start leaves no task running, and a late copy of the notice of a former run does not end a resumed agent

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1762 — a background task past the bound releases nothing

Given a background task started twenty-one minutes ago, or one with no time of its start
When the hook on Stop measures the session
Then the session does not wait, and the turn that wrote is held; at nineteen minutes it waits
And a turn that ended on the task spends it: a second stop with no call is held, and a call makes the task fresh
And a refused stop does not spend the task
And two running tasks release two stops, and the end of one gives its stop back
And a task whose start is stamped ahead of the clock is no wait

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1763 — a waiting stop after a refusal names no owner's menu

Given a refusal of a stop and a second stop with no call, while a background task of the session runs
When the hook on Stop measures the session
Then the session is not idle, and the refusal names no owner's menu, spent task or fresh

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1764 — a stop in the state that sends work to the background is held

Given a session that waits for a background task, on a branch whose exit 10 is met
When the release cases are asked
Then the case of a background task is not met, and the turn is held
And a hosting that does not answer about the PR does not hold the wait

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1765 — the forecast lets a waiting stop go and names the longest run

Given recorded sessions that wrote and stopped: with a background task running, twice on one task, with the task over, and with a task started an hour before the stop
When the forecast replays them
Then the first stop is released, and the second on the same task, the stop after the end and the stop past the bound are held
And the line names the longest run of held stops in a row, which a word of the owner and a released stop break

Covered: `projects/agent-kit/tests/task-flow-script-forecast.test.sh`.

### SC-AK-1797 — an unread background task is the first move, not the owner's menu

Given a background task of the session whose notice ended it after the last call, and a refusal of a stop
When the hook on Stop measures the session
Then the stop is not idle, and the refusal names the task and its output file and offers no owner's menu
And for an agent the refusal names its report in the notice, not the file of its transcript
And the refusal still names the next step of the state
And the menu of a step another check forbids is not offered over it either
And the first call or menu after the notice reads it, and a late copy of the notice does not make it unread again
And the forecast takes a named unread task for a move, not for the menu
And a task the session stopped itself, one the harness killed, or one with no start in the record holds nothing
And a late copy of the notice of a former run does not end the run a message resumed
And a task running past the bound is not named, and a stop with no call names the menu
And a refusal with no unread task still names the menu

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`, `projects/agent-kit/tests/task-flow-script-session.test.sh`, `projects/agent-kit/tests/task-flow-script-forecast.test.sh`.

### SC-AK-1799 — the host adapter gives the runs of the pipeline file and the bases it wakes for

Given the runs of a head of three workflow files and the `on` blocks of pipeline files
When the adapter reads them
Then only the runs of the pipeline file come back, with number, attempt, conclusion and end
And a running run has no end, and a tree that names no pipeline file judges no run
And the bases are the list of `pull_request.branches`, null for every base, and none for a pipeline that does not listen to PRs
And a list at the indent of its key and a comment after a name are read as YAML reads them
And an `on` written as a one-line mapping that names `pull_request` gives every base

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1800 — a call carries its time and branch, a background task its command

Given a record with a call sent to the background and the result that names its task
When the session source reads the record
Then the call carries the time and the branch of its entry, and the background event the command of the call
And an entry without a branch gives the branch null
And a notice of the end of a task attached to the record as a queued command ends the task with its time

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1801 — a running run with no watch holds the stop with its number

Given an open PR into main whose head has a running CI run, and no background task of the session
When the turn ends
Then the stop is held, and the refusal names the run and `gh run watch <id> --exit-status`

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1802 — a background watch lifts the hold, and the scenario decides the stop

Given a running run and a background task of the session that names the run or the PR and has not ended
When the turn ends, also forty minutes after the watch started
Then the CI holds nothing
And a session in «работа-отдана» is not released by the watch: the scenario holds it
And a background task with no call of the hosting client, a log file named after the PR, is no watch
And a call of the client with no watch, a comment on the PR, is no watch
And a watch that finds the run by the branch of the PR is a watch
And a watch of a CI run releases no stop as a wait

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1803 — an unread red run holds the stop with its number

Given an open PR into main whose head has a failed run, and no call after its end
When the turn ends
Then the stop is held, and the refusal names the run and `gh run view <id> --log-failed | tail -n 200`

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1804 — a red run read after its end lifts the hold

Given a failed run and an unrefused call after its end that names it, or a read of the output of its watch
When the turn ends
Then the CI holds nothing
And a call with the number that a hook refused or that failed reads nothing
And an edit of a text that names the run reads nothing
And a command that prints the output of the watch reads it

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1805 — a watch call before the end of the run is no read

Given a failed run whose watch was started before its end, and no call after the end
When the turn ends
Then the stop is held by the red run
And a number inside another number does not name the run
And a command with the number and no call of the hosting client reads nothing

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1806 — a green run, a skipped run and a pipeline without PRs hold nothing

Given a head with a green run, a head with a skipped run, and a pipeline that does not listen to PRs
When the turn ends
Then the CI holds nothing

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1807 — a silent hosting holds nothing

Given a hosting that does not answer about the open PRs
When the turn ends at the end of the scenario
Then the measurer throws the silence, the verdict reads no hold, and the end of the scenario releases the turn

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1808 — the end of the epic does not release a running run of its PR

Given a finished epic, or a task outside an epic with its PR handed, and a CI run that holds
When the turn ends
Then the stop is held with the number of the run, not released by the end of the scenario

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1809 — a head moved by a push or an epic merge holds the stop after a branch switch

Given a session on another branch that pushed the branch of an open PR, and a task whose epic branch has an open PR into main
When the turn ends while the run of that PR goes with no watch
Then the stop is held by that run
And a PR of a branch the session neither works on nor pushed holds nothing
And a push with its output redirected, a push of `HEAD`, a push of two branches and `gh pr create -H` name their branches
And `git checkout -b` before a push of `HEAD` in one command names the new branch
And a quoted branch, a line continued by a backslash, an address built by a substitution with a pipe, a quoted credential helper before `push`, and `--head owner:branch` name their branches

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1810 — a head with no run holds the stop for two minutes, for a pipeline base only

Given a head pushed a minute ago with no run on it
When the turn ends
Then the stop is held as a fresh head
And the minutes count from the result of the push, not from its start
And for a push sent to the background they count from the notice of its end
And a base that matches a mask of the pipeline holds as a listed one
And three minutes after the push, or for a base the pipeline does not wake for, it holds nothing

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1811 — three stops on one red run give one refusal when a read follows it

Given a failed run, a first stop, then a call that reads it, then two more stops
When each stop is judged
Then only the first is held by the run

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1812 — a second stop with no call names the run, not the menu

Given an unread red run and a stop that follows a refusal with no call
When the turn ends
Then the refusal names the run and offers no owner's menu

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1813 — the stop word passes a fresh head only

Given the owner's «стоп»
When the turn ends over a running run, a fresh head, and red runs that ended before and after the word
Then the fresh head holds nothing, and the running run holds until one background watch starts
And a red run holds the stop until it is read, whichever side of the word it ended on

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1833 — a step that fails twice on a taken-apart folder: the revert move and its number

Given a taken-apart task folder and a done step that does not match on either run before the PR
When the final rerun runs
Then it names the step and the move `git revert --no-edit <the commit that took the folder apart>`
When the turn is held in the running stage
Then the refusal names that step by its number with the command that measures it and the same move, and no `step N.M`
When the folder is brought back by that move and the turn is held again
Then the refusal names the same step by its number
And the refusal of the PR opening names the command of each unmatched step by its number
And a step the plan names and the progress lacks is the one the stage waits for

Covered: `projects/agent-kit/tests/task-flow-script-archive.test.sh`.

### SC-AK-1830 — a refusal of a stop names the hook that refused

Given refusals of a stop: «BLOCKED by <name>» at the start of the line or after the opening of the model check, that opening with no name, and a line with neither
When the record is read
Then the first two name their hook, the third names the model check, and the last names none
And a name below the first line is not taken
And a refusal of the model check that quotes another hook further in its text is the model check's

Covered: `projects/agent-kit/tests/turn-exit-guard-foreign.test.sh`.

### SC-AK-1831 — a stop after a refusal of the draft check names it, not the menu

Given a write, then a refusal of a stop by the draft check, and no background task
When the executor stops again with no call
Then the stop is no idle one
And the refusal names the draft check and the next step, with no owner's menu
And refusals of the draft check and of the model check in one stop are both named

Covered: `projects/agent-kit/tests/turn-exit-guard-foreign.test.sh`.

### SC-AK-1832 — a stop after a refusal of the engine itself is still idle

Given a write, then a refusal of a stop by the engine, or a refusal that names no hook
When the executor stops again with no call
Then the stop is idle, as before

Covered: `projects/agent-kit/tests/turn-exit-guard-foreign.test.sh`.

### SC-AK-1836 — refusals of the engine and of the model check in one stop give the menu

Given a write, then refusals of one stop by the engine and by the model check
When the executor stops again with no call
Then the stop is idle, and the refusal names the owner's menu
And a refusal of the engine before the last call is not counted
And a stop with no call after the hold that named a foreign refusal is idle: the engine refused it

Covered: `projects/agent-kit/tests/turn-exit-guard-foreign.test.sh`.

### SC-AK-1837 — a refusal of the model check with no name is no idle one

Given a write, then a refusal of a stop with the opening of the model check and no name
When the executor stops again with no call
Then the stop is no idle one, and the refusal names the model check
And a refusal with neither a name nor that opening is idle, as before

Covered: `projects/agent-kit/tests/turn-exit-guard-foreign.test.sh`.
