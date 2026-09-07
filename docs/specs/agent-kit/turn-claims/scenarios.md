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

### SC-AK-415 — "checked" without a run of the suite does not close the turn

Given the owner was told that everything is checked and the tests are green
When the suite was not run during this turn
Then the guard gives the turn back and names the command of the suite

Covered: `projects/agent-kit/tests/claim-guard.test.sh`.

### SC-AK-416 — "pushed" without a call of the push does not close the turn

Given the owner was told that the branch is pushed
When the push was not called during this turn
Then the guard gives the turn back and names the call of the push

Covered: `projects/agent-kit/tests/claim-guard.test.sh`.

### SC-AK-395 — "the branches are removed" without a call of the removal does not close the turn

Given the owner was told that the merged branches are removed
When the removal was not called during this turn
Then the guard gives the turn back and names the call of the removal

Covered: `projects/agent-kit/tests/claim-guard.test.sh`.

### SC-AK-396 — "the run is green" without a call about the run does not close the turn

Given the owner was told that the run is green
When the run was not asked of the hosting during this turn
Then the guard gives the turn back and names the call about the run

Covered: `projects/agent-kit/tests/claim-guard.test.sh`.

### SC-AK-397 — "there is nothing of the kind in the tree" without a search does not close the turn

Given the owner was told that there is nothing of the kind in the tree
When no search over the tree was made during this turn
Then the guard gives the turn back and names the command of the search

Covered: `projects/agent-kit/tests/claim-guard.test.sh`.

### SC-AK-398 — a run of the suite confirms "checked"

Given the suite of the tree was run during the turn
When the owner is told that everything is checked
Then the guard stays silent

Covered: `projects/agent-kit/tests/claim-guard.test.sh`.

### SC-AK-399 — a call of the push confirms "pushed"

Given a push of the branch was called during the turn
When the owner is told that the branch is pushed
Then the guard stays silent

Covered: `projects/agent-kit/tests/claim-guard.test.sh`.

### SC-AK-417 — a call of the removal confirms "the branches are removed"

Given a removal of a remote branch was called during the turn
When the owner is told that the merged branches are removed
Then the guard stays silent

Covered: `projects/agent-kit/tests/claim-guard.test.sh`.

### SC-AK-418 — a search over the tree confirms a negation

Given a search over the tree was made during the turn
When the owner is told that there is nothing of the kind in the tree
Then the guard stays silent

Covered: `projects/agent-kit/tests/claim-guard.test.sh`.

### SC-AK-419 — a promise to check does not hold the turn

Given the owner was told that the suite will be run
When the turn ends
Then the guard stays silent: there is nothing to lie about the future with

Covered: `projects/agent-kit/tests/claim-guard.test.sh`.

### SC-AK-420 — the same words in the output of a tool do not hold the turn

Given the words of a statement arrived as the answer of a command, they were not said to the owner
When the turn ends
Then the guard stays silent

Covered: `projects/agent-kit/tests/claim-guard.test.sh`.

### SC-AK-421 — a second pass over the same turn is not judged

Given the guard already refused this turn
When the turn ends again
Then the guard stays silent

Covered: `projects/agent-kit/tests/claim-guard.test.sh`.

### SC-AK-422 — the refusal names the statement it found

Given the owner was told that the branch is pushed, and there was no push during the turn
When the guard gives the turn back
Then the said word itself stands in the text of the refusal

Covered: `projects/agent-kit/tests/claim-guard.test.sh`.

### SC-AK-459 — the guard judges the same in any locale

Given the guard is launched where no locale is declared at all — as a service does it
When the owner is told "there is nothing of the kind in the tree", and there was no command of a
search during the turn
Then the turn is given back by the same refusal as under a UTF-8 locale

Covered: `projects/agent-kit/tests/claim-guard.test.sh`.

### SC-AK-579 — a turn without the text of the answer is given back

Given the record of the turn gave back not a single text of an answer to the owner
When the guard of the statements waited out the limit of the attempts
Then the turn is given back: an empty record means "there is nothing to read", not "there was
nothing to say"

Covered: `projects/agent-kit/tests/claim-guard.test.sh`.

### SC-AK-580 — a second pass over the same turn waits for no text

Given the turn was already given back by the guard of the statements
When the guard is called over it a second time
Then the turn passes: the guard said its word once and lets go

Covered: `projects/agent-kit/tests/claim-guard.test.sh`.

### SC-AK-581 — words about waiting for a run demand a command that shows it

Given the owner was told "waiting for the run", and there was no command about the run during the
turn
When the guard of the statements judges the end of the turn
Then the turn is given back; with the run read the same words pass

Covered: `projects/agent-kit/tests/claim-guard.test.sh`.

### SC-AK-582 — "the run has not started yet" is confirmed the same way

Given the owner was told that the run at the tip has not started, and it was not asked about
When the guard of the statements judges the end of the turn
Then the turn is given back; the check of the work queue confirms this statement

Covered: `projects/agent-kit/tests/claim-guard.test.sh`.

### SC-AK-764 — someone else's word does not count as a statement about the tree

Given the word of a statement stands in the answer as a quotation in quotation marks, as a quoting
line, as code or in a sentence with a condition
When the guard of the statements judges the end of the turn
Then the turn passes: a guard refusing a quotation teaches not to write quotation marks, not to
check the tree. The same word said on one's own behalf is refused as before, and the refusal names as
the first exit the removal of the statement — a launch of a command for the sake of lifting the
refusal is sometimes more dangerous than what the guard watches

Covered: `projects/agent-kit/tests/claim-guard.test.sh`.
