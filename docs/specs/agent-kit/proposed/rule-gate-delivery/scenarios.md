# Scenarios — the rules gate delivers the rule

The numbers continue the numbering of the package; a changed promise keeps its number. The
scenarios merge into the scenarios of the subdomain `rule-gate`.

Two scenarios of that subdomain change their promise with this work and are edited in place at the
merge, by the commit that changes the hook and the test title: `SC-AK-1050` (the re-arming line
says the rules come back by themselves) and `SC-AK-1224` (the line no longer asks to load the named
rules in one turn). The refusal scenarios of the subdomain — `SC-AK-45`, `SC-AK-99`, `SC-AK-249`
and the rest that say "demands a rule" — keep their promise about which rule is needed; the plan
names which of their tests read the refusal text and have to read the delivered text instead.

## The delivery

### SC-AK-1669 — an edit of a new area passes with the rule in the hook answer

Given a session that has not loaded the rule an edited file falls under, and the rule fits the host
limit
When the session edits the file
Then the gate lets the edit through, and its answer carries the text of the rule file whole

Not covered: the code is not written yet; the probe goes into `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-1670 — a writing shell command, the browser and the mockups tool get the delivery too

Given a session that has not loaded the rule of the call, the rule fits the host limit, and the call
is a shell command that writes into the tree, a call of the browser or a call of the mockups tool
When the gate judges the call
Then it lets the call through with the text of the rule in its answer

Not covered: the code is not written yet; the probe goes into `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-1671 — the delivered text opens with the rule, its law and the pass

Given a delivery of a rule that names its law
When the session reads the delivered text
Then its first line names the rule, the path of its law and that the call passed

Not covered: the code is not written yet; the probe goes into `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-1672 — the companion arrives with the rule when both fit

Given a rule with a companion, and the two together fit the host limit
When the gate delivers the rule
Then the delivered text carries the companion whole after the rule

Not covered: the code is not written yet; the probe goes into `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-1673 — a companion that does not fit is named by its path

Given a rule that fits the host limit, and the rule with its companion does not
When the gate delivers the rule
Then the delivered text carries the rule whole and names the companion by its path, without its text

Not covered: the code is not written yet; the probe goes into `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-1674 — a delivered rule is recorded as loaded

Given a delivery of a rule in a session
When the session edits another file of the same area
Then the gate passes it silently, and the record of loaded rules of the session holds the name of
the rule

Not covered: the code is not written yet; the probe goes into `projects/agent-kit/tests/skill-gate.test.sh`.

## What is not delivered

### SC-AK-1675 — a rule longer than the host limit is refused, not cut

Given a session that has not loaded a rule longer than the host limit
When the session edits a file of its area
Then the gate refuses the edit, the refusal names the rule, how to load it and that it is too long
to deliver, and the answer carries no part of the rule text

Not covered: the code is not written yet; the probe goes into `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-1676 — a rule the gate could not read is refused

Given a rule the edit needs whose file the gate could not read
When the session edits a file of its area
Then the gate refuses the edit, and the refusal names the rule and that it was not read

Not covered: the code is not written yet; the probe goes into `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-1677 — an edit needing a domain rule and a layer passes only with both

Given an edit that needs a domain rule and a layer on top of it, neither loaded, both fitting the
host limit together
When the session makes the edit
Then the gate lets it through, and the delivered text carries both rules

Not covered: the code is not written yet; the probe goes into `projects/agent-kit/tests/skill-gate.test.sh`.

## The counts and the neighbours

### SC-AK-1678 — a delivery is not observed as a gate refusal

Given a delivery of a rule
When the observations of the session are read
Then they hold no gate refusal for that call

Not covered: the code is not written yet; the probe goes into `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-1679 — a remaining refusal is observed with its reason

Given a refusal for a rule longer than the host limit
When the observations of the session are read
Then the gate refusal of that call carries the reason "too long", and a refusal for an unread rule
carries "not read"

Not covered: the code is not written yet; the probe goes into `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-1680 — a guard names the move itself when the gate would deliver its rule

Given a guard whose refusal names a move the gate judges, and the rule of that move fits the host
limit and is not loaded
When the guard refuses
Then its text names the move, not "load the rule first"

Not covered: the code is not written yet; the guards that ask the gate for a pending rule are named by the plan.
