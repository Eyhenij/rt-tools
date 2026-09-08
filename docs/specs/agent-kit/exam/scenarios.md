# Scenarios — the exam on the loaded rules

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain, and the
numbers were not recounted on the move into the subdomain: the number ties a scenario to a test
title.

### SC-AK-312 — without the exam an edit is refused

Given the examiner role was not called during the session
When a file is edited
Then the guard refuses the edit and names the role that has to be called

Covered: `projects/agent-kit/tests/exam-guard.test.sh`.

### SC-AK-313 — a passed exam lets an edit through

Given the last verdict of the role is a full score
When a file is edited
Then the guard stays silent

Covered: `projects/agent-kit/tests/exam-guard.test.sh`.

### SC-AK-314 — a partial score counts as a failure

Given the last verdict of the role is a partial score
When a file is edited
Then the guard refuses the edit and orders re-reading the rule whole, not the piece that was asked
about

Covered: `projects/agent-kit/tests/exam-guard.test.sh`.

### SC-AK-315 — a retake lifts the former failure

Given after the failure the role gave a verdict with a full score
When a file is edited
Then the guard stays silent: the last verdict is judged

Covered: `projects/agent-kit/tests/exam-guard.test.sh`.

### SC-AK-316 — a failure after a pass refuses an edit

Given after the pass the role gave a verdict with a partial score
When a file is edited
Then the guard refuses the edit: an exam passed once does not hold the edit until the end of the
session

Covered: `projects/agent-kit/tests/exam-guard.test.sh`.

### SC-AK-317 — the draft is not lifted without the second exam

Given the exam was passed during the session, but the PR is already open, and after it was opened
there was no exam
When the draft is lifted
Then the guard refuses the lifting: between reading the delivery rules and this minute the whole
session went by

Covered: `projects/agent-kit/tests/exam-guard.test.sh`.

### SC-AK-318 — an exam after the PR is opened lets the lifting through

Given after the PR was opened the role gave a verdict with a full score
When the draft is lifted
Then the guard stays silent

Covered: `projects/agent-kit/tests/exam-guard.test.sh`.

### SC-AK-319 — without an open PR the second exam is not asked

Given no PR was opened during the session
When the draft is lifted
Then the guard stays silent: there is nothing to ask about

Covered: `projects/agent-kit/tests/exam-guard.test.sh`.

### SC-AK-320 — the other commands of the client are not judged

Given a command of the hosting client does not lift a draft
When it is run
Then the guard stays silent: it judges the lifting, not every call

Covered: `projects/agent-kit/tests/exam-guard.test.sh`.

### SC-AK-360 — an examiner switched off by the tree lets an edit through

Given the examiner role is named in the list of the tree's switched-off roles
When a file is edited, and there was no exam during the session
Then the guard stays silent

Covered: `projects/agent-kit/tests/exam-guard.test.sh`.

### SC-AK-361 — a switched-off neighbouring role does not cancel the exam

Given the list of switched-off roles holds a role this guard does not stand at
When a file is edited, and there was no exam during the session
Then the guard refuses the edit

Covered: `projects/agent-kit/tests/exam-guard.test.sh`.

### SC-AK-362 — a setting that cannot be parsed does not switch the role off

Given the setting of the tree does not parse
When a file is edited, and there was no exam during the session
Then the guard refuses the edit: a broken read does not count as switching off

Covered: `projects/agent-kit/tests/exam-guard.test.sh`.

### SC-AK-757 — the verdict is visible in any shape of delivery and is not faked by printing a line

Given the role answered with a verdict — as a record line, as a field of the call result or as a
record of the host
When the guard judges an edit of a file
Then it lets it through in any of the three shapes; the same text printed by the shell or arriving in
the text of the helper itself does not count as a verdict

Covered: `projects/agent-kit/tests/exam-guard.test.sh`.

### SC-AK-758 — the setting the guard is switched off by is not locked by this guard

Given there was no exam during the session
When the layout setting, the profile override or the session handover is edited
Then the guard stays silent: otherwise there is nothing to switch it off with, and a consumer tree is
locked whole. An ordinary file is judged as before

Covered: `projects/agent-kit/tests/exam-guard.test.sh`.

### SC-AK-759 — writing a file by a shell call is judged on a par with an edit

Given there was no exam during the session
When a file is written by a redirection or edited in place by a shell call
Then the guard refuses the same way as an edit by a tool: a door judged only by the name of the tool
is bypassed by a neighbouring command. A command without a file write is not judged

Covered: `projects/agent-kit/tests/exam-guard.test.sh`.

### SC-AK-852 — the refusal has an exit that does not demand lifting the protection

Given there was no exam during the session, and the runtime environment forbids editing the list of
switched-off roles
When a bypass with a reason is declared in the body of the last commit of the branch
Then the call passes, and the bypass is reported; without the declaration and with a substitution
instead of a reason the edit is still forbidden

Covered: `projects/agent-kit/tests/exam-guard.test.sh`.

### SC-AK-853 — a call of the client counts as lifting the draft, not words about it

Given a command merely writes about lifting a draft — by a search over the tree or by a line in a
file
When the guard checks the command
Then it lets it through: before, the refusal arrived at an attempt to describe this defect too

Covered: `projects/agent-kit/tests/exam-guard.test.sh`.

### SC-AK-918 — a muted call is the named one, not all the answers at once

Given a shell call went during the session, and after it the role answered with a full score
When a file is edited
Then the guard stays silent: one muted call does not carry away the answer of the role. A score
printed by the shell after the answer of the role is not counted as before

Covered: `projects/agent-kit/tests/exam-guard.test.sh`.
