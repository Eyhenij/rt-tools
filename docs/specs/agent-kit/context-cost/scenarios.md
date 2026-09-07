# Scenarios — the cost of context is counted by a command

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain: the
number ties a scenario to a test title and is never issued twice.

The numbers `SC-AK-617`, `SC-AK-621` and `SC-AK-622` were issued to the edition where the count went
at the model, and after the move to counting characters they were freed. They are not issued again: a
number is given out once.

### SC-AK-613 — the command prints three weights

Given a tree with the rules layer laid out
When the counting command is called without arguments
Then it prints the cost of the entry, the weight of a rule and the weight of the layer

Covered: `projects/agent-kit/src/lib/cost.spec.ts`.

### SC-AK-614 — what it is counted by stands next to the numbers

Given a tree with the rules layer laid out
When the counting command is called
Then the output holds what these numbers are taken by

Covered: `projects/agent-kit/src/lib/cost.spec.ts`.

### SC-AK-615 — a rule description is counted as a field, not as a file

Given a rule whose description is far shorter than its file
When the counting command takes the cost of the entry
Then the number includes the weight of the description field, not the weight of the rule file

Covered: `projects/agent-kit/src/lib/cost.spec.ts`.

### SC-AK-616 — the glossary and the flow map are counted by the output of the hooks

Given the session-start hooks print the glossary and the flow map
When the counting command takes the cost of the entry
Then the number includes what the hooks printed, not what lies in their files

Covered: `projects/agent-kit/src/lib/cost.spec.ts`.

### SC-AK-618 — the named rule is not in the tree

Given the argument names a name that is not in the tree
When the counting command is called
Then it names that name, counts nothing and gives a non-zero code

Covered: `projects/agent-kit/src/lib/cost.spec.ts`.

### SC-AK-619 — the machine-readable output gives the same numbers

Given a tree with the rules layer laid out
When the counting command is called with the demand for machine-readable output
Then it prints the same numbers as a structure, not as a table

Covered: `projects/agent-kit/src/lib/cost.spec.ts`.

### SC-AK-620 — the command writes nothing and goes to no network

Given a tree with the rules layer laid out
When the counting command has done its work
Then not one file of the tree changed and not one call outward was made

Covered: `projects/agent-kit/src/lib/cost.spec.ts`.

### SC-AK-623 — characters and bytes are both printed

Given a text outside Latin that has more bytes than characters
When the counting command weighs it
Then it prints both numbers, and they are not equal

Covered: `projects/agent-kit/src/lib/cost.spec.ts`.

### SC-AK-624 — the layer is not laid out in the tree

Given there is no directory of laid-out rules in the tree
When the counting command is called
Then it says the layer is not laid out and gives a non-zero code

Covered: `projects/agent-kit/src/lib/cost.spec.ts`.
