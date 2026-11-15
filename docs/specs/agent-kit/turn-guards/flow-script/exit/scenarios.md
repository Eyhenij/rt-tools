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

### SC-AK-1441 — the owner's step makes the refusal name the menu

Given the row of the task in the plan of the epic names the owner's step, and a measurement with no cause
When the turn is held
Then the first refusal names the owner's menu, and the second does not

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1442 — a step another check forbids makes the refusal name the menu about that check

Given two refusals of calls by one guard for one reason, a write between two refusals, and two reasons
When the forbidden step is measured and the turn is held
Then only the first is forbidden, and the refusal names the guard and the menu

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1443 — a blocked task leaves the work to the next unblocked one

Given the owner's menu
When the refusal is read
Then it says that a deferral and «сделаю сам» take the next unblocked task

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1445 — the menu of a refusal carries the three options

Given a held turn on the branch of task 7 with the owner's step, and the options without a task
When the menu is named
Then it carries «отложить RT-7», «сделаю сам» and «стоп»; without a task the first stays «отложить RT-N»

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

### SC-AK-1469 — the option «сделаю сам» blocks the task by the owner's step

Given the owner chose «сделаю сам»
When the row of the task is marked «шаг владельца «сделаю сам»» and the plan is read
Then the edit passes, and the row names the owner's step with that quote

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1551 — a stop with no call after a refusal names the owner's menu

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
