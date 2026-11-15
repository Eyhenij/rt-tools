# Scenarios: the recorded turns

A subdomain of the task flow as an executable scenario. Here are the turns that ended for nothing and
the lawful ends of a turn, run through the hook on Stop on a tree in the state each turn stood in.

### SC-AK-1446 — a report instead of the next step holds the turn

Given a stage going on with step 1.2 current, and a turn that edited, committed and ended with a report
When the hook on Stop reads the turn
Then the turn is held, and the refusal names `этап-идёт` and step 1.2 with its command

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1447 — an announced intention instead of the action holds the turn

Given a stage going on, and a turn that wrote a file and ended announcing the next run
When the hook on Stop reads the turn
Then the turn is held, and the refusal names step 1.2

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1448 — a wait for someone else's step holds the turn

Given a turn that ended waiting for the CI of handed-in work, for a neighbouring session or for a background task
When the hook on Stop reads the turn
Then the turn is held: after handed-in work the refusal names the next task of the epic, in a stage it names the current step

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1449 — a stop on the milestone «the branch is created» holds the turn

Given the task taken with its grill and no plan, and a turn that created the task and ended on it
When the hook on Stop reads the turn
Then the turn is held, and the refusal names `задача-взята` and the writing of the plan

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1450 — an answer to the owner in the middle of the work holds the turn

Given a stage going on, a turn that edited a file, and a question of the owner answered at its end
When the hook on Stop reads the turn
Then the turn is held, and the refusal names the current step

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1451 — a question the rules already answer holds the turn

Given a stage going on, and a turn that committed a step and asked the owner whether to go on
When the hook on Stop reads the turn
Then the turn is held naming the current step, and the model hook on Stop holds a question already answered and leaves open work to the exit check

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1452 — a stop at the window holds the turn

Given a stage going on, and a turn that wrote a handover after a compaction and ended
When the hook on Stop reads the turn
Then the turn is held, and the refusal names the current step

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1453 — a stop against a standing order holds the turn

Given handed-in work with a PR and a reviewer, and a turn that asked the owner to merge and ended
When the hook on Stop reads the turn
Then the turn is held, and the refusal names `работа-отдана` and the next task of the epic

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1454 — a new session offered for the agent's own step holds the turn

Given a stage going on, and a turn that committed and offered the next step to a new session
When the hook on Stop reads the turn
Then the turn is held, and the refusal names the current step

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1455 — the deadlock of RT-3304 ends in a menu to the owner

Given the folder taken apart and the push refused by another check, then the menus of a refusal held by the menu hook
When the hook on Stop reads the turn with the refused push, and the turn whose menu was held twice in a row
Then the first refusal names the menu «отложить RT-101», «сделаю сам», «стоп», the second turn is released as a menu that did not reach the owner, and the menu hook lets that menu leave

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1456 — RT-3276: a question in a session that wrote nothing is released

Given a session that only read, and the owner's last word a question
When the hook on Stop reads the turn
Then the turn is released by the case of a session with no write

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1457 — RT-3276: «не сейчас» is released

Given a session that edited a file, and the owner's last word «не сейчас»
When the hook on Stop reads the turn
Then the turn is released by the stop word of the owner

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1458 — RT-3276: «стоп» is released

Given a session that edited a file, and the owner's last word «стоп»
When the hook on Stop reads the turn
Then the turn is released by the stop word of the owner

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1459 — RT-3276: swearing with no order is released

Given a session that wrote nothing, and the owner's last word swearing that names no task
When the hook on Stop reads the turn
Then the turn is released by the case of a session with no write

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1460 — RT-3276: the menu after a refusal answered «стоп» is released

Given the push refused by another check, the menu of the refusal, and the owner's choice «стоп»
When the hook on Stop reads the turn
Then the turn is released by the stop word of the owner

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1461 — RT-3276: a promise with no run holds the turn

Given a stage going on, and a turn that edited a file and promised to run the suite
When the hook on Stop reads the turn
Then the turn is held, and the refusal names the current step

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1462 — the end of the epic by the history of the last closed epic is released

Given both tasks of the epic lying in the epic branch on the server and the PR of the epic into the main branch open
When the hook on Stop reads the turn that opened that PR
Then the turn is released by the end of the scenario

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1470 — the menu hook holds an option that lifts a check

Given a menu of the exit check with a fourth option that lifts the refusing check, held once
When the hook on Stop reads the turn, and the text of the menu hook is read
Then the turn is held, and the menu hook holds such an option in any menu, the menu of the exit check included

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1547 — the recorded stop words of the owner release the turn

Given the five stop messages of the measurement of 15 November — «Стой», «жди конца набора», «жди соседа», «Остановись на логической точке» and «Не сейчас» as a free answer to a menu
When the hook on Stop reads each turn
Then every turn is released by the stop word of the owner

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.
