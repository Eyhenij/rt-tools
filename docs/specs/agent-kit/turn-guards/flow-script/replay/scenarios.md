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
Then the first refusal names the menu «отложить RT-101», «подскажу путь», the second turn is released as a menu that did not reach the owner, and the menu hook lets that menu leave

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1456 — RT-3276: a question in a session that wrote nothing is released

Given a session that only read, and the owner's last word a question
When the hook on Stop reads the turn
Then the turn is released by the case of a session with no write

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1457 — RT-3276: «не сейчас» releases the turn

Given a stage going on, a session that edited a file, and the owner's last word «не сейчас»
When the hook on Stop reads the turn
Then the turn is released by the case of a stop word of the owner

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1458 — RT-3276: «стоп» releases the turn

Given a stage going on, a session that edited a file, and the owner's last word «стоп»
When the hook on Stop reads the turn
Then the turn is released by the case of a stop word of the owner

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1459 — RT-3276: swearing with no order is released

Given a session that wrote nothing, and the owner's last word swearing that names no task
When the hook on Stop reads the turn
Then the turn is released by the case of a session with no write

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1460 — RT-3276: the menu after a refusal answered «стоп» releases the turn

Given the folder taken apart, the push refused by another check, the menu of the refusal, and the owner's answer «стоп»
When the hook on Stop reads the turn
Then the turn is released by the case of a stop word of the owner

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

### SC-AK-1932 — an incident record written and not sent holds the turn

Given five turns that admit a miss and write its record: not sent, sent, refused by the send, written past its role, and left in the morning list of a night that named no send
When the hook on Stop reads the turns, and the text of the model hook is read
Then all five are held by the running stage, and the model hook lets only the sent one and the night end

Covered: `projects/agent-kit/tests/turn-replay.test.sh`; the verdicts of the model — `projects/agent-kit/tests/judge-replay.mjs`.

### SC-AK-1933 — a reply not in the owner's language is held by the model hook

Given a turn that answers the owner in another language, and one that answers in theirs and quotes a command with its English output
When the text of the model hook on Stop is read
Then it holds the first and lets the second end

Covered: `projects/agent-kit/tests/turn-replay.test.sh`; the verdicts of the model — `projects/agent-kit/tests/judge-replay.mjs`.

### SC-AK-1934 — a question not in the owner's language is held, a product choice leaves

Given a menu written in another language, and a menu in the owner's that asks what the product keeps after sanitizing
When the text of the model hook before a question is read
Then it holds the first and lets the second leave

Covered: `projects/agent-kit/tests/turn-replay.test.sh`; the verdicts of the model — `projects/agent-kit/tests/judge-replay.mjs`.

### SC-AK-1939 — a menu whose every option hands the work to the owner is held

Given a refusal of a guard that names a ready move, and a menu right after it with the options «Солью сам» and «Стоп, отложить»
When the text of the menu hook is read, and the model judge reads the recorded question
Then the menu is held; the menu of the exit check, «отложить RT-N» and «подскажу путь», leaves

Covered: `projects/agent-kit/tests/turn-replay.test.sh`; the verdicts of the model — `projects/agent-kit/tests/judge-replay.mjs`.

### SC-AK-1911 — the menu hook lets the owner's decision leave, the approval of a plan that changes a check included

Given two questions with the option «Одобряю план RT-N»: one for a plan that changes the exit check, asked after the plan and both roles; one right after a refusal, with no plan and no roles
When the text of the menu hook is read, and the model judge reads both recorded questions
Then the first approval leaves, and the approval of nothing is held

Covered: `projects/agent-kit/tests/turn-replay.test.sh`, `projects/agent-kit/tests/judge-replay.mjs`.

### SC-AK-1951 — the menu hook lets the approval of a light plan leave without the roles

Given a plan whose header calls it light, a tree that names `planRolesCommand`, and an answer `plan-red` refused for the missing role calls
When the text of the menu hook is read
Then the light plan needs the file and no role call, a plan of any other header still needs both, and the question asked again after the roles is not held

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1914 — an approval option that appends an action of its own is held, the plan of an epic is not

Given a plan approval asked after the plan and both roles, whose option appends turning the check of marks off, and an approval of the plan of an epic
When the text of the menu hook is read, and the model judge reads the recorded question
Then the option with the appended lift is held, and the plan of an epic is not held for a missing task folder

Covered: `projects/agent-kit/tests/turn-replay.test.sh`, `projects/agent-kit/tests/judge-replay.mjs`.

### SC-AK-1913 — every recorded message of a stop releases the turn

Given the seven recorded messages of a stop: the five of the measurement of 15 November and the two of the live turns of RT-3276
When the hook on Stop reads each turn
Then the hook is silent on each of the seven, and the engine names the case of a stop word of the owner

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-1548 — the recorded stop words of the owner release the turn

Given the five stop messages of the measurement of 15 November — «Стой», «жди конца набора», «жди соседа», «Остановись на логической точке» and «Не сейчас» as a free answer to a menu
When the hook on Stop reads each turn
Then every turn is released by the case of a stop word of the owner: in the running stage, in handed-in work and in a taken task

Covered: `projects/agent-kit/tests/turn-replay.test.sh`.

### SC-AK-2012 — a recorded turn for every transition of the owner's stop

Given a stage going on and a session that edited a file. The owner's words after it are one of ten: «я же сказал стоп», Esc, Esc and a question a second later, a refused call with the mark of Esc, «хватит тупить, чини». The other five follow «стоп»: a question, swearing, «пиши инцидент в приёмник», «вливай», the menu answer «без предпочтения»
When the hook on Stop reads each turn
Then «я же сказал стоп», Esc, the refused call and every word after «стоп» but «вливай» release the turn
And Esc with a question a second later, «хватит тупить, чини» and «стоп» then «вливай» hold it, naming the current step
And the model hook on Stop lets the question and the swearing after «стоп» end, and holds «пиши инцидент» until the record is written and «вливай» until the work

Covered: `projects/agent-kit/tests/turn-replay.test.sh`; the verdicts of the model — `projects/agent-kit/tests/judge-replay.mjs`.
