# Scenarios — the judgement of a proposal against the spec

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain.

### SC-AK-948 — a proposal does not move into work while the spec is not named

Given a proposal is named in the arguments and the state is the one of work
When the mark goes
Then the exit code is not zero, nothing leaves for the network, and the refusal names what is
missing and how the spec is found

Covered: `projects/agent-kit/tests/cargo-mark.test.sh`.

### SC-AK-949 — the named spec is checked for existence before the network

Given the spec is named by a path that is not on disk
When the mark goes
Then the exit code is not zero, the refusal names the path, and nothing leaves for the network

Covered: `projects/agent-kit/tests/cargo-mark.test.sh`.

### SC-AK-950 — a proposal with a named spec moves as before

Given the spec is named by a path that lies on disk
When the mark goes
Then the call behaves as before the requirement: the records and the state are listed, the code is
zero

Covered: `projects/agent-kit/tests/cargo-mark.test.sh`.

### SC-AK-951 — an incident analysis is not asked for a spec

Given only analyses are named in the arguments and the state is the one of work
When the mark goes
Then the spec is not demanded, and the call behaves as before

Covered: `projects/agent-kit/tests/cargo-mark.test.sh`.

### SC-AK-952 — the requirement holds for the state of work alone

Given a proposal is named and the state is the one of a fix
When the mark goes
Then the spec is not demanded: the comparison stands before the work, not after it

Covered: `projects/agent-kit/tests/cargo-mark.test.sh`.
