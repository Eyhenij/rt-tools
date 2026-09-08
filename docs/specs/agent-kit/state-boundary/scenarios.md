# Scenarios — the boundary of a state in the texts of the work

The identifier goes at the start of the test title, followed by a dash. The prefix is shared across
the domain, and the numbers were not recounted at the move into the subdomain: the number ties the
scenario to the test title.

### SC-AK-447 — every section of a state has a line of the next move

Given the rule of the conduct of work and all the patterns that lead the states are laid out in the
tree
When the check of the lines of the next move is run
Then it passes and names how many sections of a state were read

Covered: `projects/agent-kit/tests/checks-state-next.test.sh`.

### SC-AK-448 — a section without a line is refused with the name of the state and the pattern

Given there is no line of the next move in one section of a state
When the check is run
Then it refuses and names the state, the leading pattern and the heading of this section

Covered: `projects/agent-kit/tests/checks-state-next.test.sh`.

### SC-AK-449 — the line is found by the opening, not by a word-for-word match

Given two sections name their move in different words after a shared opening
When the check is run
Then both sections count as described, and there are no divergences

Covered: `projects/agent-kit/tests/checks-state-next.test.sh`.

### SC-AK-450 — a line copied from a neighbour is refused

Given the lines of the next move in two sections of a state coincide word for word
When the check is run
Then it refuses and names both sections

Covered: `projects/agent-kit/tests/checks-state-next.test.sh`.

### SC-AK-451 — an opening without a move after it is refused

Given the opening of the line stands in the section, and after it nothing is named
When the check is run
Then it refuses: the line is there, and there is no move in it

Covered: `projects/agent-kit/tests/checks-state-next.test.sh`.

### SC-AK-452 — the rule of the conduct of work names the transition between states

Given the rule lists what a turn does not end with
When the executor looks in it for the boundary of a state
Then the transition between states stands in the list on a par with a commit and a green check

Covered: `projects/agent-kit/tests/checks-state-next.test.sh`.

### SC-AK-453 — a rule without this article is refused by the same check

Given there is no article about the transition between states in the rule of the conduct of work
When the check is run
Then it refuses and names the rule, not the sections of the patterns

Covered: `projects/agent-kit/tests/checks-state-next.test.sh`.

### SC-AK-454 — the map of the turn says about the transition the same as the rule

Given the map of the turn arrived in the context at the launch of the session
When the session looks in it for what a turn ends with
Then among what a turn does not end with the transition between states is named

Covered: `projects/agent-kit/tests/checks-state-next.test.sh`.

### SC-AK-455 — the law of the conduct of work names the boundary of a state by an article

Given the law of the conduct of work is read whole
When an article about the boundary between states is looked for in it
Then it stands there and names neither paths nor file names

Covered: `projects/agent-kit/tests/checks-state-next.test.sh`.

### SC-AK-456 — a tree without the rule of the conduct of work passes the check

Given there is no rule of the conduct of work in the tree
When the check is run
Then it passes silently: there is nothing to compare

Covered: `projects/agent-kit/tests/checks-state-next.test.sh`.

### SC-AK-457 — a broken list of states counts as a refusal

Given the rule of the conduct of work lies there, and there is no table of states in it
When the check is run
Then it refuses: the list is broken, not empty

Covered: `projects/agent-kit/tests/checks-state-next.test.sh`.

### SC-AK-458 — the check stands as a line of its own in the suite of the push gate

Given the suite of the push gate is run whole
When one of the lines of the suite is the check of the lines of the next move
Then its refusal drops the gate instead of being lost in the output of a neighbouring check

Covered: `projects/agent-kit/tests/checks-state-next.test.sh`.

### SC-AK-907 — a section of a state is accepted under either of the two names

Given a pattern where the sections are headed "State `name`", and the line of the move begins with
"Next move:"
When the check is run
Then both sections are found, and at each of them the next move is named

Covered: `projects/agent-kit/tests/checks-state-next.test.sh`.
