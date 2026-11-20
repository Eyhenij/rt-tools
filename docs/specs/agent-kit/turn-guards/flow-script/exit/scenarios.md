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
And with the task over or past the bound the stop is idle as before

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

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.
