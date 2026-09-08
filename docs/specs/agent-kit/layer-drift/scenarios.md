# Scenarios — divergences inside the rules layer

The numbers did not change on the move from the subdomain "The checks": the identifier is the only
thing a scenario is tied to a test title by.

### SC-AK-765 — what is replaced and the companion is silent about is named by the audit

Given a profile variable is replaced, and its name is in not a single rule companion When the audit of
the profile overrides runs Then it refuses and names the variable by name: the reader of the companion
otherwise gets the package default instead of the acting order

Covered: `projects/agent-kit/tests/checks-profile-drift.test.sh`.

### SC-AK-766 — a replacement named by a companion does not count as a divergence

Given the name of the replaced variable stands in a rule companion When the audit of the profile
overrides runs Then it passes; the name is looked for across all the companions of the tree — an
override has a rule of its own

Covered: `projects/agent-kit/tests/checks-profile-drift.test.sh`.

### SC-AK-767 — a profile line repeating the package default is never a replacement

Given a profile variable is set to the value of the package default When the audit of the profile
overrides runs Then it passes and does not count that variable among the replaced ones; the same
variable with another value replaces

Covered: `projects/agent-kit/tests/checks-profile-drift.test.sh`.

### SC-AK-768 — there is nothing to check with — the check stays silent

Given the tree has no profile, or no package defaults, or no rule companions When the audit of the
profile overrides runs Then it says what is missing and leaves with zero

Covered: `projects/agent-kit/tests/checks-profile-drift.test.sh`.

### SC-AK-769 — a branch of the body that is not in the declaration is named a divergence

Given the body of a guard branches on a tool name the sample of its declaration does not cover When the
guard scope audit runs Then it refuses and names the guard with that name: under it the guard is not
called, and the branch is never carried out. A declaration completed to the body passes

Covered: `projects/agent-kit/tests/checks-hook-scope.test.sh`.

### SC-AK-770 — the sample of a declaration is read as an expression, not as a list of names

Given the declaration is named by a sample with an asterisk, and the body branches on a name it covers
When the guard scope audit runs Then it passes; a sample that cannot be parsed does not count as
coverage — not one name will match under it, while the declaration looks written

Covered: `projects/agent-kit/tests/checks-hook-scope.test.sh`.

### SC-AK-771 — a branching is judged, not a mention

Given the tool name stands in the text of a refusal, in a comment or as a `case` branch over another
subject When the guard scope audit runs Then it stays silent: the branch "everything else" is never a
tool name either

Covered: `projects/agent-kit/tests/checks-hook-scope.test.sh`.

### SC-AK-772 — a file without a declaration does not count as a guard

Given the hooks directory holds a helper without a declaration line, or there is no hooks directory at
all When the guard scope audit runs Then it stays silent: the helpers carry no declaration on purpose

Covered: `projects/agent-kit/tests/checks-hook-scope.test.sh`.

### SC-AK-782 — a check cut out of the gate set by an override is named by name

Given the package default calls three checks as the push gate set, and the override of the tree
declared the set anew and sifted one of them out When the audit of the profile divergence runs Then it
refuses and names the one that vanished by the name of the file: a check cut out is indistinguishable
from one that is not in the tree

Covered: `projects/agent-kit/tests/checks-profile-drift.test.sh`.

### SC-AK-783 — a set the tree did not touch is never a divergence

Given the override of the tree declares no gate set When the audit of the profile divergence runs Then
it stays silent about the set and judges the rest in its own order

Covered: `projects/agent-kit/tests/checks-profile-drift.test.sh`.

### SC-AK-784 — the same check called differently does not count as vanished

Given the override calls the same check by another runner and with another argument When the audit of
the profile divergence runs Then it passes: the name of the file is checked, not the line of the
command whole — the right of the tree to call a check in its own way is no divergence

Covered: `projects/agent-kit/tests/checks-profile-drift.test.sh`.

### SC-AK-785 — a default without a set function holds no audit

Given the package default declares no function of the gate set at all When the audit of the profile
divergence runs Then it stays silent about the set and judges the rest as before: there is nothing to
assemble the set with, and the refusal goes in favour of the work

Covered: `projects/agent-kit/tests/checks-profile-drift.test.sh`.
