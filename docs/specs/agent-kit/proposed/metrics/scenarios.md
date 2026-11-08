# Scenarios — the product metrics of the rules package

The numbers continue the numbering of the package and do not change after the merge. Until a test
appears, a scenario carries the line «Not covered» with the reason.

### SC-AK-1273 — a task without a change after the handover counts as first-pass

Given a request handed over and merged with its head tree unchanged and no owner correction
When the sending reads the outcomes
Then the day line counts one accepted task and one first-pass task

### SC-AK-1297 — only a call that ran hands a request over

Given a ready request with a reviewer, and the same request as a draft, without a reviewer, refused by
another guard or failed
When the hook after the call runs, if it runs at all
Then only the first leaves a handover sign

### SC-AK-1298 — a request without a handover sign counts apart

Given a merged request with no handover sign
When the outcomes are read
Then it stays out of the main metric, and the report names their count

### SC-AK-1299 — an older request read later keeps the counted outcome

Given a task counted as first-pass by one read and an older request of that task found by the next
When the outcomes are read again
Then the counted outcome stays

### SC-AK-1300 — a correction after the next branch is taken counts against the handed-over one

Given a handed-over branch and a session already standing on the next branch
When the owner's message matches the set of patterns
Then the counter of the handed-over branch gets an `after` line

### SC-AK-1301 — a broken read loses no request

Given a hosting that answers the list of requests and fails on the commits of one of them
When the outcomes are read
Then the reader exits with the code of a broken read, prints no request and the day of the last read
stays

### SC-AK-1302 — a correction within three days of the merge takes first-pass away

Given a merged request with a correction on the third day after the merge, and another with a
correction on the fourth
When the outcomes are read three days after the merge or later
Then the first is accepted and not first-pass, the second stays first-pass, and a request merged less
than three days ago waits for the next read

### SC-AK-1274 — a merge of the base after the handover keeps first-pass

Given a handed-over request whose branch took only a merge of its base
When the sending reads the outcomes
Then the task stays first-pass

### SC-AK-1275 — a rewrite of history after the handover takes first-pass away

Given a handed-over request whose head was rewritten with another tree
When the sending reads the outcomes
Then the task is accepted and not first-pass

### SC-AK-1276 — a request closed unmerged lowers the main metric

Given one merged first-pass task and one request closed unmerged
When the report counts the period
Then first-pass acceptance reads one of two

### SC-AK-1277 — a repeat of the same refusal counts as empty

Given a guard that refused a call
When it refuses the same call on the same content in the same session
Then the second refusal is counted as empty

### SC-AK-1278 — an edit between two refusals keeps the second one honest

Given a guard that refused a call
When an uncommitted edit changes the content and the guard refuses again
Then the second refusal is not counted as empty

### SC-AK-1279 — a red run repeated on the same content counts as wasted

Given a red run on some content
When a later run of that day goes on the same content
Then the minutes of the red run are counted as wasted for its kind of step

### SC-AK-1280 — a day line carries whole numbers from the closed list only

Given a day line with a key outside the list or a value that is not a whole number
When the sender builds the body
Then that field is dropped, and the intake refuses it if it arrives

Coverage: partial — the intake side has a test, the sender arrives with RT-3154.

### SC-AK-1281 — a guard does not wait for the network

Given a tree with an intake address that does not answer
When a guard records an observation
Then the guard returns without waiting and the line stays on disk

Not covered: no code yet.

### SC-AK-1282 — a tree without an address or a token sends nothing

Given a tree that lacks an intake address or a token file
When a guard or the session end starts the sending
Then no request leaves the machine

Not covered: no code yet.

### SC-AK-1283 — the sending tries at most once in 15 minutes

Given a copy that tried 5 minutes ago
When a guard starts the sending
Then no second process runs, and the session end still sends

Not covered: no code yet.

### SC-AK-1284 — two sends of one copy do not double a day

Given two sends of one copy started together
When both reach their end
Then one holds the lock, the other exits, and the day is stored once

Coverage: partial — the intake stores a day once, the lock arrives with RT-3154.

### SC-AK-1303 — an older day line is refused and changes nothing

Given a stored day line with a later stamp
When a line of the same tree, copy and day arrives with an earlier stamp
Then the intake refuses it with `metrics-stale`, and the stored line stays

### SC-AK-1304 — the head of a day line carries no words of the tree

Given a day line with a path as its copy sign, a text as its version, a day outside the calendar or
past tomorrow, or a stamp past tomorrow
When it reaches the intake
Then the intake refuses it with `metrics-field-refused`, names the field and stores nothing

### SC-AK-1285 — the automatic sending carries no proposal, analysis or digest

Given a tree with unsent proposals and analyses
When the automatic sending runs
Then its request carries day lines only

Not covered: no code yet.

### SC-AK-1286 — a refused token stops the tries and names the failure

Given a tree whose token the intake refuses
When the sending fails
Then it does not try again until the token file changes, and `agent-kit doctor` names the failure

Not covered: no code yet.

### SC-AK-1287 — a dead session is sent by the next start

Given a session that ended without its last send
When a session of that copy starts
Then the lines of the window leave

Not covered: no code yet.

### SC-AK-1288 — `send: false` stops the sending and keeps the writing

Given a tree with `send: false`
When a guard records an observation
Then the line is written and no request leaves

Not covered: no code yet.

### SC-AK-1289 — a direct edit of the observations directory is refused

Given a session in a tree with the guard laid out
When the executor writes to the observations directory
Then the write is refused

Not covered: no code yet.

### SC-AK-1291 — a call of a role or a command is counted by its package name

Given a session that calls a role of the package and a role of the tree's own
When the calls are recorded
Then the package role is counted by its name, and the tree's own role by a constant word

### SC-AK-1292 — the report of one tree counts repeated refusals and dead rules

Given observations of a period
When `agent-kit metrics` counts them
Then a refusal right after the same guard's refusal in that session counts as a repeat, and the
report names the refusals, the gate refusals, the dead rules and the cost of the entry. A list cut
short says how many lines it left out

### SC-AK-1293 — the report names what it does not know

Given a metric with no signal in the observations yet
When the report is printed
Then it stands in a line saying there is no data, not as a zero. The dead rules without the records
of a full period do the same, and the JSON carries null for them. A metric only the report over all
trees counts stands in a line of its own

### SC-AK-1294 — the report names the days it read and the files it removed

Given observations of a period, some older than the keeping time
When `agent-kit metrics` is printed as text or as JSON
Then the days found, the first and the last of them and the files removed stand in the report, and a
requested period longer than the days found does not stand for them

### SC-AK-1295 — a tree without observations gets a sentence, not zeros

Given a tree with no observation directory, a period with no observations or the writing switched off
When the report is printed
Then it names the reason in words and prints no zero, and its JSON carries the sign that nothing was
recorded

### SC-AK-1290 — a person's message is counted without being kept

Given a message matching the set of patterns
When the hook counts it
Then the counter of the branch grows, and the text stands in no file of the rules layer
