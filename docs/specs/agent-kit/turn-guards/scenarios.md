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
Then the call is refused with a reason naming the owner; other tools pass. Without jq the name is
still read, and the call passes like the call of every guard that asks the decider.

Covered: `projects/agent-kit/tests/end-conversation-guard.test.sh`.

### SC-AK-1358 — the agent hook lets a wait for an own task and a turn outside ordered work end

Given a background task the session started still runs, and the reply names it and the step that
goes on by its notice; or the owner's latest word orders no work and asks a question the reply
answers
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

Given the owner ordered work, and their latest word swears at an agent that stands or asks about it
When the reply answers, and the ordered work is not in the calls of the turn
Then the hook answers `{"ok": false}` with a reason that starts with `BLOCKED by turn-judge:` and
names the ordered work

Not covered: by the same technique as SC-AK-1358.

### SC-AK-2014 — while the owner's stop stands, a turn no word of the owner opened does no work

Given the owner's stop by Esc, «стоп», `/stop` left only in the queue, or Esc 30 ms after a notice
When a notice of a task, a line of `Monitor` or a message of another session opens a turn, and a call is made in it
Then the call is refused — a call of a subagent, `Edit` and `Write` too — and the refusal names `TaskStop <id>` of own background
And `TaskStop`, `KillShell`, `KillBash`, `CronDelete`, `CronList`, `ToolSearch` and `TaskOutput` pass
And a turn opened by a bare «стоп», by «стоп» after Esc or by «блин, стоп» refuses its calls
And a turn opened by «Стоп. Пиши инцидент», a question, swearing, «продолжай», a typed command or a menu answer lets them through
And a word queued before Esc and delivered after it opens no turn for calls; the same word typed again after Esc does
And «стоп» queued in the middle of a turn opened by an order refuses the next call of that turn
And with no stop, with no record, with a broken record or with an engine past its limit the call passes
And after «стоп» and 20 MB of calls a notice still opens a turn with its calls refused
And the entry of the turn names `TaskStop` of own background once per task, and not a task whose end is in the queue

Covered: `projects/agent-kit/tests/owner-stop-call-guard.test.sh`.

### SC-AK-1363 — a command that closes the session does not end ordered work

Given the owner's latest word ordered work, and the owner called the command that writes the
handover and closes the session
When the reply leaves the work to the next session
Then the agent hook refuses the turn with its mark and names the work

Not covered: by the same technique as SC-AK-1358.
