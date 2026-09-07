# Scenarios — the uniformity signs

The numbers run through the domain: they tie a scenario to a test title and are not recounted on the
move into a subdomain.

### SC-AK-142 — a tree gets the signs of the declared bundles only

Given the tree declared one bundle out of several lying at the package
When the sweeping uniformity audit runs
Then the signs of the other bundles are not applied at all

Covered: `projects/agent-kit/tests/reuse-guard.test.sh`.

### SC-AK-143 — the guard and the sweeping audit read the same signs

Given the tree declared a bundle, and it holds a sign with a cancelling sample
When one and the same line falls under the guard on an edit and under the sweeping audit
Then both name the same key of the sign and the same ready-made

Covered: `projects/agent-kit/tests/reuse-guard.test.sh`.

### SC-AK-144 — an own sign of the tree arrives on top of the declared bundles

Given the tree declared its own sign file, and it holds a key that is not in the package bundles
When the check runs
Then the sign is applied on a par with the package ones

Covered: `projects/agent-kit/tests/reuse-guard.test.sh`.

### SC-AK-145 — an own sign with a taken key replaces the package one

Given the tree declared a sign with a key that already stands in a declared bundle
When the check runs
Then the sign of the tree is applied, and the package one is not

Covered: `projects/agent-kit/tests/reuse-guard.test.sh`.

### SC-AK-146 — there is no name of a consumer tree in the bundles of the package

Given the sign bundles of the package are read from the disk
When names of classes and components not belonging to the rt-tools packages are looked for in them
Then not one is found

Not covered: the sign "the name belongs to the package" is not given to a machine — it is read by a
person, like the sign of the intake in the law. This is `Q-20`.

### SC-AK-147 — a sign with the scope "the whole file" judges the resulting content

Given a sign is declared with the scope "the whole file", and the edit brings a line without a class
declaration
When the guard judges the edit
Then the sign is counted over the file together with the edit, not over the edit alone

Covered: `projects/agent-kit/tests/reuse-guard.test.sh`.

### SC-AK-148 — an empty cancelling of a sign does not slide into the neighbouring field

Given a sign is declared with an empty cancelling and a non-empty advice
When the guard takes it apart
Then the advice stays the advice, and the cancelling sample stays empty

Covered: `projects/agent-kit/tests/reuse-guard.test.sh`.

### SC-AK-149 — a tree without declared bundles hears about it

Given not a single bundle is declared in the check setting of the tree and there are no own signs
When a file is edited under the guard
Then the guard says that there are no signs and by which key they are declared, and lets the edit
through

Covered: `projects/agent-kit/tests/reuse-guard.test.sh`.

### SC-AK-150 — a named bundle that is not at the package refuses the audit

Given the tree declared a bundle with a name nothing at the package answers to
When the sweeping audit runs
Then it gives back a non-zero code, names the name and lists the bundles that are there

Covered: `projects/agent-kit/tests/reuse-guard.test.sh`.

### SC-AK-151 — the deviation marker removes its own line and the next one

Given the file holds the deviation marker as a comment one line above a native tag
When the sweeping uniformity audit runs
Then the sign in the line following the marker is not counted, and the one a line further is

Covered: `projects/agent-kit/tests/reuse-guard.test.sh`.

### SC-AK-196 — the skip of the backend roots acts at the guard too

Given a sign is declared with the skip of the backend roots, and the edit goes under such a root
When the guard judges the edit
Then it lets it through — the same way the sweeping check lets it through

Covered: `projects/agent-kit/tests/reuse-guard.test.sh`.

### SC-AK-197 — the name sample is checked against the path from the root of the tree

Given a sign is declared by a name sample telling one root of the tree from another
When the guard judges two files of the same name from different roots
Then only the one whose path matched the sample gets the sign

Covered: `projects/agent-kit/tests/reuse-guard.test.sh`.

### SC-AK-813 — a tree without a single sign gets a refusal, not a green zero

Given the tree named not a single sign bundle and created no sign file of its own
When the sweeping uniformity check runs
Then it refuses with a non-zero code and names the bundles that are at the package; with a declared
bundle the same run passes

Covered: `projects/agent-kit/tests/checks-reuse.test.sh`.

### SC-AK-814 — the global sign judges the position of the name

Given in the judged file the name of the global stands inside a quoted string, after a field access
mark or is declared as a variable of its own
When the sweeping uniformity check runs
Then the sign does not fire on them, and it still names a real access to the global

Covered: `projects/agent-kit/tests/checks-reuse.test.sh`.

### SC-AK-815 — code without markup is not judged by an environment sign

Given the file lies under a server root of the tree
When the sweeping uniformity check runs
Then the browser window signs do not judge it: there is no window there at all

Covered: `projects/agent-kit/tests/checks-reuse.test.sh`.

### SC-AK-817 — the directives of the own design system are cut out of the signs of native tags

Given the tree declared the directives of its own design system as a list in the check setting
When the sweeping uniformity check runs
Then a native tag carrying such a directive does not count as a divergence, and a tag without one
does

Covered: `projects/agent-kit/tests/checks-reuse.test.sh`.

### SC-AK-874 — the source folder of the ready-made is taken out from under a sign

Given a sign carries a reverse path sample, and the tree itself writes the ready-made the sign
speaks of
When the sweeping uniformity check runs and an edit of the same file passes the guard
Then inside the bundle the sign judges as before, and the source folder of the ready-made does not
count as a divergence — both read the sample the same way

Covered: `projects/agent-kit/tests/checks-reuse.test.sh`, `projects/agent-kit/tests/reuse-guard.test.sh`.
