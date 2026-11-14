# Scenarios — the guards of the end of a turn

The identifier goes at the start of the test title, followed by a dash. The prefix is shared across
the domain, and the numbers were not recounted at the move into the subdomain: the number ties the
scenario to the test title.

### SC-AK-433 — the thresholds of the guard and the thresholds of the squeeze are read from one setting

Given the size of the window, both shares of the guard and the pair of the squeeze are declared in
the setting of the agent
When the thresholds are read
Then all five numbers arrive together, not one at a time from two places

Covered: `projects/agent-kit/src/lib/thresholds.spec.ts`.

### SC-AK-434 — the pairs that drifted apart are each named by a line of their own

Given the guard has a window of a million and a stop at a half, and the squeeze has a window twice
as small and a share of 92 per cent
When the pairs are checked
Then there are two divergences — by the size of the window and by the share — and at each of them
the numbers of both sides are named

Covered: `projects/agent-kit/src/lib/thresholds.spec.ts`.

### SC-AK-475 — the guard reminds before the threshold of the squeeze

Given the filling of the window reached the share of the reminder and has not yet reached the
threshold of the squeeze
When any action goes
Then the guard reminds to choose a point of stopping and does not refuse the work

Covered: `projects/agent-kit/tests/window-fill-guard.test.sh`.

### SC-AK-476 — between the threshold of the squeeze and the threshold of the stop the guard does not refuse the work

Given the filling of the window passed the threshold of the squeeze but has not reached the
threshold of the stop
When any action goes
Then the guard lets it through: this is the margin in which the client squeezes the context

Covered: `projects/agent-kit/tests/window-fill-guard.test.sh`.

### SC-AK-477 — after the threshold of the stop the guard refuses as before

Given the filling of the window reached the threshold of the stop, and there was no squeeze after
all
When an action goes that does not belong to closing the session
Then the guard refuses it and names what passes after the threshold

Covered: `projects/agent-kit/tests/window-fill-guard.test.sh`.

### SC-AK-591 — a written plan does not let the turn go

Given the work is in the state of a written plan, and the task, the branch, the column and the
folder were created during the turn
When the guard judges the end of the turn
Then the turn is refused: the preparation for the work does not count as a step of the first stage

### SC-AK-592 — the refusal names the first stage of the plan

Given the work is in the state of a written plan, and the plan has its first stage named by a
heading
When the guard refuses the end of the turn
Then the heading of the first stage stands in the refusal, not general words about unfinished work

### SC-AK-880 — work that reached the handing in does not let the turn go

Given the work is in the state of stages that have ended or of a folder taken apart, and no request
was opened during the turn
When the guard judges the end of the turn
Then the turn is refused and the refusal names the mandatory action of the state: the edit lies in a
branch the owner does not see, and the former state they read as work not done

Given by the same turn a request was opened by `gh` or by `glab` and the next work was begun, or the
owner said to stop
When the guard judges the end of the turn
Then the turn is let go: the lawful exits are not locked by a state

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-911 — the guard reads the English keys of the progress of the work and of the plan

Given the progress of the work names the state by the line "- **State:** `замысел-записан`", and
the plan carries the stages by headings "## Stages" When the turn ends Then the guard does not let
it go and names the first stage of the English plan; a stage in progress declared by an English key
lets the turn go

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-593 — a begun stage is judged by the former sign

Given the work is in the state of a stage in progress and there is an edit of the tree during this
turn
When the guard judges the end of the turn
Then the turn is let go: the branch of the written plan does not extend to the other states

### SC-AK-1066 — a turn whose last action is a background run of the checks

Given a stage is going, and the last action of the turn is a run of the checks in the background
When the guard judges the end of the turn
Then the turn is refused: a run started in the background and left last is a declared wait

Given the same run in the middle of the turn, with a step of the executor's after it
When the guard judges the end of the turn
Then the turn is let go

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1067 — a turn whose last action is a read of a background task's log

Given a stage is going, and the last action of the turn is a read of the output file of a
background task
When the guard judges the end of the turn
Then the turn is refused: nothing of the tree is changed by such a read

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1069 — a turn whose last action is taking a task

Given a stage is going, and the last action of the turn is creating a task, a branch or a move of
the column
When the guard judges the end of the turn
Then the turn is refused: taking a task is preparation, and the work of the taken task did not begin

Given the same taking with a handed-over PR in the same turn
When the guard judges the end of the turn
Then the turn is let go: the taking answers for the handed-over work

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1121 — the tool that closes the conversation is refused

Given the executor calls the tool that ends the conversation, under any name that carries it.
When the guard of the end of the conversation judges the call.
Then the call is refused with a reason naming the owner; other tools pass, and without jq the refusal stays.

Covered: `projects/agent-kit/tests/end-conversation-guard.test.sh`.

### SC-AK-1199 — a stop said a turn earlier and a reason for unpushed commits release the turn

Given the owner said to stop a turn earlier, the task folder is gone, and no later message of theirs orders work
When the turn ends with a reply that quotes their word in « »
Then the guard releases it; without the quote, or after a later order to work, it refuses

Given the branch carries commits not pushed after work in the turn
When the reply names the reason by the line «Не отправлено: <reason>»
Then the guard releases it; the line without a reason does not

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1358 — the agent hook lets an answer, a stop of the owner and a named obstacle end the turn

Given the owner's last message is a question, a «стоп», a «не сейчас» or swearing without an order,
or the reply names an obstacle the agent cannot remove in the turn
When the agent hook of the Stop event judges the end of the turn
Then it answers `{"ok": true}`, and the turn ends

Not covered: the hook is a text a model follows, and a suite run cannot call the model. It is
checked by a replay on recorded turns of the task that brought it in, and by the count of its mark
in the transcripts.

### SC-AK-1359 — the agent hook refuses a promise of ordered work with its mark

Given the owner ordered work, and the reply ends with «сейчас запущу» or «следующим ходом» while
nothing blocks the work
When the agent hook of the Stop event judges the end of the turn
Then it answers `{"ok": false}` with a reason that starts with `BLOCKED by turn-judge:` and names the
next action

Not covered: by the same technique as the scenario above.

### SC-AK-1360 — the agent hook of the question tool holds a question the owner already answered

Given the owner answered the question earlier in the conversation
When the agent calls the question tool with the same question
Then the hook answers `{"ok": false}` with a reason that starts with `BLOCKED by ask-judge:` and
quotes the answer; a question after a refusal of another check leaves

Not covered: by the same technique as the scenario above.
