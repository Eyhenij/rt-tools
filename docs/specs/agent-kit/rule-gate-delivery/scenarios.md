# Scenarios — the rules gate delivers the rule

The numbers continue the numbering of the package; a changed promise keeps its number. The
scenarios merge into the scenarios of the subdomain `rule-gate`.

Two scenarios of that subdomain change their promise with this work and are edited in place at the
merge, by the commit that changes the hook and the test title: `SC-AK-1050` (the re-arming line
says the rules come back by themselves) and `SC-AK-1224` (the line names only the rules longer than
the host limit). The refusal scenarios of the subdomain — `SC-AK-45`, `SC-AK-99`, `SC-AK-249` and
the rest that say "demands a rule" — keep their promise about which rule is needed; the plan names
which of their tests read the refusal text and have to read the delivered text instead.

A probe reads the answer of the hook from its output: `.hookSpecificOutput.permissionDecision` and
`.hookSpecificOutput.additionalContext`. That the host puts the field into the session is not a
scenario: the plan measures it once on the record of its own session.

## The delivery

### SC-AK-1669 — an edit of a new area passes with the rule in the hook answer

Given a session that has not loaded the rule an edited file falls under, and the rule fits the host
limit
When the session edits the file
Then the answer of the gate has no `permissionDecision`, and its `additionalContext` holds the
file `SKILL.md` of the rule byte for byte, its header included

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-1670 — a writing shell command, the browser and the mockups tool get the delivery too

Given a session that has not loaded the rule of the call, the rule fits the host limit, and the call
is a shell command that writes into the tree, a call of the browser or a call of the mockups tool
When the gate judges the call
Then it allows the call with the text of the rule in its answer

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-1671 — the delivered text opens with the rule, its law and the pass

Given a delivery of a rule that names its law
When the probe reads the delivered text
Then its first line names the rule, the path of its law and that the call passed, and holds no
words «Refused by the rules gate»

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-1672 — the companion arrives with the rule when it fits

Given a rule with a companion, and the delivered text with both fits the host limit
When the gate delivers the rule
Then the delivered text carries the companion whole after the rule

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-1673 — a companion that does not fit is named by its path

Given a rule that fits the host limit, and the delivered text with its companion does not
When the gate delivers the rule
Then the delivered text carries the rule whole and names the companion by its path, without its text

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

## The limit

### SC-AK-1682 — a companion falls back to its path before the next rule is dropped

Given an edit that needs a domain rule with a companion and a layer rule, where both rules fit the
host limit together only without the companion
When the gate judges the edit
Then it allows it, the delivered text holds the domain rule, the path of its companion and the layer
rule, and its whole length is within the limit

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-1683 — the host limit is taken from the setting

Given `RT_GATE_CONTEXT_LIMIT` set below the length of the delivered text of a rule
When the session edits a file of its area
Then the gate refuses the edit as too long; with the setting unset, the same rule of 9 000
characters is delivered

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

## What is not delivered

### SC-AK-1675 — a rule longer than the host limit is refused, not cut

Given a session that has not loaded a rule longer than the host limit
When the session edits a file of its area
Then the gate refuses the edit, the refusal names the rule and that it is too long to deliver, and
the answer carries no part of the rule text

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-1684 — a read of an over-limit rule by the tool `Read` loads it

Given the gate refused an edit for a rule longer than the host limit, and the rule is not known to
the registry of the tool `Skill`
When the session reads the file `SKILL.md` of the rule by the tool `Read`, and repeats the edit
Then the refusal had named that read, the record holds the name of the rule, and the edit passes

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-1676 — a rule the gate could not read is refused

Given a rule the edit needs whose file the gate could not read
When the session edits a file of its area
Then the gate refuses the edit, and the refusal names the rule and that it was not read

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-1677 — an edit needing a domain rule and a layer passes with both

Given an edit that needs a domain rule and a layer on top of it, neither loaded, both fitting the
host limit together
When the session makes the edit
Then the gate allows it, and the delivered text carries both rules, the domain one first

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-1681 — rules that do not fit together are refused together

Given an edit that needs two unloaded rules, each fitting the host limit alone and not together
When the gate judges the edit
Then it refuses it, the refusal names both rules and that they do not fit together, the answer
carries no rule text, and the record holds neither name

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

## The record

### SC-AK-1674 — a delivered rule is recorded as loaded

Given a delivery of a rule in a session
When the session edits another file of the same area
Then the gate passes it silently, and the record of loaded rules of the session holds the name of
the rule

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-1685 — the first delivery creates the directory of the record

Given no directory of the record exists yet
When the gate delivers a rule
Then the directory and the record are created, and the record holds the name of the rule

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-1686 — a delivery whose name cannot be written still passes

Given the record of the session cannot be written
When the gate delivers a rule
Then the call is allowed with the rule text, and the observations hold `gate-deliver unrecorded` for
that rule

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-1687 — a call without a session id is refused, not delivered

Given an input that carries no session id
When the session edits a file whose rule is not loaded
Then the gate refuses the edit and the answer carries no rule text

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-1688 — a delivery inside a subagent is recorded for the subagent

Given an input that carries a session id and an `agent_id`
When the gate delivers a rule
Then the name is recorded under the `agent_id`, and the record of the session id stays without it

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

## The counts and the neighbours

### SC-AK-1678 — a delivery is observed as a delivery

Given a delivery of a rule
When the observations of the session are read
Then they hold `gate-deliver res=<rule> kind=<kind> sid=<sid>` for that call, and neither a gate
refusal nor a `skill-load`

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-1679 — a remaining refusal is observed with its reason

Given a refusal for a rule longer than the host limit
When the observations of the session are read
Then the gate refusal of that call carries the reason "too long", a refusal for rules that do not
fit together carries "do not fit together", and a refusal for an unread rule carries "not read"

Covered: `projects/agent-kit/tests/skill-gate.test.sh`.

### SC-AK-1680 — the fact of a loaded rule counts a deliverable rule as loaded

Given a rule that is not in the record and is a deliverable rule of the call
When a neighbouring hook asks the fact `rule_loaded` of that rule, or the decider meets the gate
among the neighbours of the call
Then the fact answers `yes`, and no answer of the decider has the move `load_rule` for that rule

Covered: `projects/agent-kit/tests/decide.test.sh`.

### SC-AK-1689 — the task guard and the gate on one edit name no load

Given an edit judged by the task guard and the gate in the same call, with the rule of the edit not
loaded and deliverable
When both hooks answer
Then the gate delivers the rule, and the answer of the task guard neither refuses for that rule nor
names loading it

Covered: `projects/agent-kit/tests/task-flow-guard.test.sh`.

### SC-AK-1690 — the re-arming line names only the over-limit rules

Given a record that holds one rule longer than the host limit and one that fits it
When the hook removes the record and tells the session about it
Then the line names only the first rule and asks to load it, and says every other rule comes back by
itself at its next edit; with no over-limit rule in the record the line asks to load nothing

Covered: `projects/agent-kit/tests/skill-gate-rearm.test.sh`.

### SC-AK-1698 — a neighbour's refusal that names loading a rule counts as a gate refusal

Given two refusals of a neighbouring guard, one naming the move of loading a rule and one not
When the record count sorts the refusals by the check
Then the first is counted as the rules gate and the second under the guard's own name

Covered: `projects/agent-kit/tests/record-count.test.sh`.
