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

### SC-AK-1121 — the tool that closes the conversation is refused

Given the executor calls the tool that ends the conversation, under any name that carries it.
When the guard of the end of the conversation judges the call.
Then the call is refused with a reason naming the owner; other tools pass, and without jq the refusal stays.

Covered: `projects/agent-kit/tests/end-conversation-guard.test.sh`.

### SC-AK-1358 — the agent hook lets a stop of the owner, a named obstacle and a turn outside ordered work end

Given the owner's latest word is «стоп» or «не сейчас», or the reply names an obstacle that holds
every part of the work left, or no ordered work is open and the owner asked a question
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

### SC-AK-1361 — the agent hook keeps a turn going after an answer in the middle of ordered work

Given the progress names a next step, and the owner asked a question or swore
When the reply answers, and the turn ends without the next step
Then the hook answers `{"ok": false}` with a reason that starts with `BLOCKED by turn-judge:` and
names the next step of the progress

Not covered: by the same technique as SC-AK-1358.

### SC-AK-1362 — a waiting line older than the owner's latest order does not end the turn

Given the line «Waiting for the owner» quotes an answer the owner gave before a later order to work
When the turn ends on that line
Then the agent hook refuses it and names the line to rewrite and the next step

Not covered: by the same technique as SC-AK-1358.

### SC-AK-1363 — a command that closes the session does not end ordered work

Given the progress names a next step, and the owner called the command that writes the handover
and closes the session
When the reply leaves the step to the next session
Then the agent hook refuses the turn with its mark and names the step

Not covered: by the same technique as SC-AK-1358.

### SC-AK-1364 — handed-in work under an open epic goes on to the next task

Given the request of the task is open, and the table of the epic holds tasks ahead of it
When the turn ends on the handed-in work
Then the agent hook refuses it and names the next task of the epic

Not covered: by the same technique as SC-AK-1358.
