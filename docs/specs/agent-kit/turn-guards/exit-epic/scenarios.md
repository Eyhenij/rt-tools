# Scenarios: the guard of the exits of a turn under an open epic

A subdomain of the domain "The guards of the end of a turn". Here are the scenarios of the exit
guard that read the epic: a turn under an open epic, the epic branch and the end of an epic. The
rest of the exit guard is in the neighbouring subdomain of the same guard.

### SC-AK-1117 — under an open epic a turn with work and a second pass are judged

Given the table of the epic names unfinished tasks, and the turn ended with an edit, or the guard
judges the same turn for the second time
When the guard of the exits judges the end of the turn
Then the turn is given back, and the refusal names the unfinished tasks; a question after work, a
refusal as the last action and the word of the owner release the turn as before

Covered: `projects/agent-kit/tests/turn-exit-epic.test.sh`.

### SC-AK-1118 — a handover written by hand under an open epic

Given the table of the epic names unfinished tasks, and the turn ran the handover command by hand
When the guard of the exits judges the end of the turn
Then the turn is given back; the refusal of the window guard as the last action releases it

Covered: `projects/agent-kit/tests/turn-exit-epic.test.sh`.

### SC-AK-1119 — an unreadable epic keeps the former behaviour

Given the table of the epic answers with a non-zero code or is absent
When the guard of the exits judges the end of the turn
Then a turn with work and a second pass are released as before, and an empty turn is given back

Covered: `projects/agent-kit/tests/turn-exit-epic.test.sh`.

### SC-AK-1120 — the owner's standing word quoted in the waiting line

Given the waiting line of the progress quotes the owner's word in « », and the epic is open.
When the guard of the exits judges the end of the turn.
Then the turn passes with work and without it. Without a quote the line releases nothing.

Covered: `projects/agent-kit/tests/turn-exit-epic.test.sh`.

### SC-AK-1128 — a branch named by an epic plan is not judged by the tier of the taken task

Given the branch has the shape of a task branch, there is no task folder at it, and a plan in the
plans directory names the branch in its header line
When the guard of the exits judges the end of the turn
Then the tier of the taken task is skipped. A turn with work passes, an empty turn is given back by
the second sign. A plan naming another branch releases nothing.

Covered: `projects/agent-kit/tests/turn-exit-epic.test.sh`.

### SC-AK-1129 — a closed epic releases the whole turn

Given the table of the epic is read and prints not a single unfinished task
When the guard of the exits judges the end of the turn
Then the turn is released whatever tier it reached: an empty turn, a second pass, a handover by
hand and words about waiting for the word of the owner all pass

Covered: `projects/agent-kit/tests/turn-exit-epic.test.sh`.

### SC-AK-1272 — a role without an edit tool ends its turn with its report

Given a session runs as a role without an edit tool, the table of the epic names unfinished tasks,
and the turn holds only reading and a report
When the guard of the exits judges the end of the turn, on the first pass or on the second
Then the turn is released; a role with an edit tool, a role with `tools: *` or no `tools:` line in
the header, a role with no file in the tree and a session with no role are refused as before

Covered: `projects/agent-kit/tests/turn-exit-epic.test.sh`.
