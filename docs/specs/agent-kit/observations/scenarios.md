# Scenarios — observations

The identifier goes at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared across the domain,
and the numbers were not recounted at the move into the subdomain: the number ties the scenario to
the test title.

### SC-AK-70 — an observation outlives the session

Given a rule was loaded during the session, and the context was squeezed after that
When the observations are read by the next session
Then the loading is in them, because the record landed in the tree, not in a temporary directory

Covered: `projects/agent-kit/tests/observe.test.sh`.

### SC-AK-71 — an observation names no tree

Given the gate refused an edit of a file in a domain of the tree
When the written observation is read whole
Then it holds the name of the rule, the kind of the file and the version — and neither the path,
nor the domain name, nor the name of the tree

Covered: `projects/agent-kit/tests/observe.test.sh`.

### SC-AK-72 — the writing is switched off by a setting of the tree

Given the setting of the tree switched the writing of observations off
When a guard handles an event it usually writes about
Then no observation is written at all, and the action itself passes as before

Covered: `projects/agent-kit/tests/observe.test.sh`.

### SC-AK-73 — an observation that cannot be written does not stop the work

Given the observations directory is not available for writing
When a guard handles an event
Then the action is let through, and the guard ends with a zero code

Covered: `projects/agent-kit/tests/observe.test.sh`.

### SC-AK-74 — the digest names a rule that was not used

Given a rule is laid out in the tree and was not loaded once over the stretch
When the digest is gathered
Then the rule stands in it as a line of its own, as unused

Covered: `projects/agent-kit/src/lib/observations.spec.ts`.

### SC-AK-75 — a digest without observations says the reason

Given there is not a single observation over the stretch
When the digest is gathered
Then it says that no record was kept, and what it is switched on by, instead of printing zeroes

Covered: `projects/agent-kit/src/lib/commands.spec.ts`.

### SC-AK-76 — observations older than the keeping time are removed

Given observations older than the keeping time lie in the directory
When the digest is gathered
Then the stale files are removed, and the digest counts only those inside the stretch

Covered: `projects/agent-kit/src/lib/observations.spec.ts`.

### SC-AK-159 — an observation line carries the version of the record schema

Given a guard writes an observation
When the line gets into the file of the day
Then the version of the record schema stands in it apart from the version of the package

Not covered: the schema version is not in the line yet.

### SC-AK-160 — lines of an unknown schema version are counted apart

Given among the observations over the stretch there are lines of a schema version the digest does
not know
When the digest is gathered
Then it names their number and the versions met, and parses the rest of the lines as usual

Not covered: the schema version is not in the line yet.

### SC-AK-161 — an admission of a miss gets into the digest as a number of incidents

Given over the stretch the incident guard caught an admission of a miss
When the digest is gathered
Then the incident is counted in it, and is not visible only by the record in the records directory

Not covered: the incident guard gives off no observations.

### SC-AK-231 — a replaced package section is named in the snapshot by name

Given the tree replaces by an override a section of a laid-out rule
When the snapshot of the overrides is taken
Then it holds the name of the resource, the heading of that section and the edit kind "replacement"

### SC-AK-232 — a section of one's own goes as a number, not as a name

Given the override appends a section the package resource does not have
When the snapshot of the overrides is taken
Then the edit kind is "appending", and the heading of the section does not get into the snapshot:
it was invented by the tree

### SC-AK-233 — an unchosen resource is visible in the snapshot apart from the overridden

Given the tree removed a resource by the refusal list
When the snapshot of the overrides is taken
Then the resource is named unchosen, and is not absent from the snapshot silently

### SC-AK-234 — the content of an override does not get into the snapshot

Given the section appended by the tree names the paths and domains of this tree
When the snapshot of the overrides is taken
Then there is not a single line of the override text in the snapshot — only the resource, the
section and the kind of the edit

### SC-AK-235 — an observation carries a tree sign the address is not recovered from

Given the tree has an address of a remote repository
When a guard writes an observation
Then the tree sign stands in the line, and the address is not in it, whole or in parts

Not covered: the tree sign is not in the line yet.

### SC-AK-236 — two working copies of one repository give one sign

Given two trees were created from one remote repository
When each of them writes an observation
Then the tree sign in both lines is one: trees are counted, not machines

Not covered: the tree sign is not in the line yet.

### SC-AK-237 — a tree without a remote repository takes its sign from the setting

Given the tree has no address of a remote repository, and its sign is named in the setting
When a guard writes an observation
Then the sign from the setting stands in the line, not a shared value for all such trees

Not covered: the tree sign is not in the line yet.

### SC-AK-809 — a guard that did not refuse once over the stretch is named by a line of its own

Given over the stretch one guard of the tree refused, and the rest stayed silent
When the digest of the observations is gathered
Then the silent ones are named by a section of their own, the one that refused does not get into
it, and the counter of its refusals stays in place

Covered: `projects/agent-kit/src/lib/observations.spec.ts`,
`projects/agent-kit/src/lib/commands.spec.ts`.

### SC-AK-810 — the list of guards was not named: the digest stays silent about them instead of calling them all silent

Given the digest is gathered without the list of the tree's guards — that is how the cargo sending
calls it
When refusals of guards lie in the observations
Then the section of the silent is empty, and the counters of refusals are counted the former way:
an empty list means "there is nobody to ask", not "nobody refused"

Covered: `projects/agent-kit/src/lib/observations.spec.ts`.

### SC-AK-811 — a refusal is written by the shared refusal tail, not by the guard itself

Given a guard declared its name for the observations and refuses
When the refusal tail is assembled
Then the refusal is recorded under that name and with the session sign, and the text of the two
lawful moves is printed on a par with the record. A guard without a declaration writes nothing

Covered: `projects/agent-kit/tests/observe.test.sh`.

### SC-AK-836 — the outcomes of the push gate are counted apart from the refusals of the guards

Given the outcomes of the push gate and the refusals of the guards lie in the observations
When the digest is gathered
Then the outcomes are counted by a section of their own under the names `green`, `red` and
`no-checks`, the refusals of the guards stay on the former count, and a gate that did not work once
starts no count at all

Covered: `projects/agent-kit/src/lib/observations.spec.ts`.
