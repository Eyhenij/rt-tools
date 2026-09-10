# Scenarios — the steps of the work are written out, marked and counted

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain.

### SC-AK-1008 — the lists of the plan and of the progress match

Given the plan names three steps and the progress carries the same three with a mark each
When the check is run
Then it answers zero and names how many task folders it read

Covered: `projects/agent-kit/tests/work-steps.test.sh`.

### SC-AK-1009 — a divergence by count is refused

Given the plan names three steps and the progress carries two
When the check is run
Then it refuses and names both numbers

Covered: `projects/agent-kit/tests/work-steps.test.sh`.

### SC-AK-1010 — a divergence by name is refused

Given a step of the progress is named otherwise than in the plan
When the check is run
Then it refuses and names the number of that step

Covered: `projects/agent-kit/tests/work-steps.test.sh`.

### SC-AK-1011 — the current step is exactly one

Given two steps carry the mark of going on right now, or none does while steps are left
When the check is run
Then it refuses and names how many are marked and how many are left

Covered: `projects/agent-kit/tests/work-steps.test.sh`.

### SC-AK-1012 — a step that is not done refuses a stop of the turn

Given the progress carries two steps that are not done
When a turn that did work ends with a report to the owner
Then the guard refuses and names the remainder, the current step and the command that counted them

Covered: `projects/agent-kit/tests/work-steps-guard.test.sh`.

### SC-AK-1013 — every step done lets the turn out

Given every step of the progress is marked as done
When the same turn ends
Then the guard lets it through

Covered: `projects/agent-kit/tests/work-steps-guard.test.sh`.

### SC-AK-1014 — the word of the owner about a stop lifts the refusal

Given steps are not done and the owner said to stop
When the turn ends
Then the guard lets it through

Covered: `projects/agent-kit/tests/work-steps-guard.test.sh`.

### SC-AK-1015 — a progress without the list is not judged by the tier

Given the progress carries no list of steps
When a turn that did work ends with a report
Then the tier stays silent

Covered: `projects/agent-kit/tests/work-steps-guard.test.sh`.
