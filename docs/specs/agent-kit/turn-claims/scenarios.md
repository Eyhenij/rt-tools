# Scenarios — statements to the owner

The identifier goes at the start of the test title, followed by a dash. The prefix is shared across
the domain, and the numbers were not recounted at the move into the subdomain: the number ties the
scenario to the test title.

### SC-AK-321 — a repeat that was found does not close the turn

Given the role of the conscience found a repeat of a miss already taken apart in the turn
When the turn ends, and nothing is done about the finding
Then the guard gives the turn back together with the finding

Covered: `projects/agent-kit/tests/conscience-guard.test.sh`.

### SC-AK-322 — an incident analysis that was created lets the turn go

Given after the finding an incident analysis was created
When the turn ends
Then the guard stays silent

Covered: `projects/agent-kit/tests/conscience-guard.test.sh`.

### SC-AK-323 — a repeat named to the owner lets the turn go

Given after the finding the repeat was named to the owner
When the turn ends
Then the guard stays silent: the decision is the executor's, and their business is to decide knowing

Covered: `projects/agent-kit/tests/conscience-guard.test.sh`.

### SC-AK-324 — at a clean answer of the role the turn closes

Given the role answered that there is no repeat
When the turn ends
Then the guard stays silent

Covered: `projects/agent-kit/tests/conscience-guard.test.sh`.

### SC-AK-325 — the silence of the role closes the turn

Given the role was not called during the turn
When the turn ends
Then the guard stays silent: a broken conscience has no right to jam the conversation

Covered: `projects/agent-kit/tests/conscience-guard.test.sh`.

### SC-AK-326 — a second pass over the same turn is not judged

Given the guard already refused this turn
When the turn ends again
Then the guard stays silent

Covered: `projects/agent-kit/tests/conscience-guard.test.sh`.

### SC-AK-363 — a conscience switched off by the tree lets the turn go

Given the tree named the conscience switched off in its setting
When the turn ends with a finding not taken apart
Then the guard stays silent

Covered: `projects/agent-kit/tests/conscience-guard.test.sh`.

### SC-AK-364 — a neighbouring role switched off does not cancel the finding

Given the tree switched off another role and left the conscience
When the turn ends with a finding not taken apart
Then the guard gives the turn back together with the finding

Covered: `projects/agent-kit/tests/conscience-guard.test.sh`.

### SC-AK-365 — a setting that cannot be parsed does not switch the role off

Given the setting of the tree lies there but is not parsed
When the turn ends with a finding not taken apart
Then the guard gives the turn back together with the finding

Covered: `projects/agent-kit/tests/conscience-guard.test.sh`.

### SC-AK-915 — a file read with the mark in it does not hold the turn

Given a record of the past naming the mark of the role was read during the turn
When the turn ends
Then the guard stays silent: a mark printed in the answer of a reading tool is not a finding

Covered: `projects/agent-kit/tests/conscience-guard.test.sh`.

### SC-AK-916 — the mark in one's own text is not read as a finding

Given the executor quoted the mark of the role in their own reply
When the turn ends
Then the guard stays silent: writing the needed line in a reply costs one move

Covered: `projects/agent-kit/tests/conscience-guard.test.sh`.

### SC-AK-917 — the answer of the role holds the turn after a file with the mark was read

Given a file with the mark was read during the turn, and then the role answered with a repeat
When the turn ends, and nothing is done about the finding
Then the guard gives the turn back: one muted call does not mute the answer of the role

Covered: `projects/agent-kit/tests/conscience-guard.test.sh`.
