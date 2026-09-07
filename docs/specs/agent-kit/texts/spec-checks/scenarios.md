# Scenarios — the check of the specs and the addresses

The identifier goes at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared across the domain,
and the numbers were not recounted at the move into the subdomain: the number ties the scenario to
the test title.

### SC-AK-27 — a subdomain without a mandatory section is visible to the check

Given a domain has a subdomain, and there is no mandatory section in its spec
When the check of the specs goes
Then the check names the subdomain and the missing section

### SC-AK-28 — a proposed law demands no rule

Given a law with the status "proposed" lies in the tree, and there is no rule under it
When the check of the specs goes
Then the check stays silent about this law

### SC-AK-29 — a scenario prefix taken by a foreign spec is a divergence

Given two specs in force declared one scenario prefix
When the check of the specs goes
Then the check names both specs and the shared prefix

### SC-AK-30 — an agreement does not take the prefix of its domain

Given an agreement about the product declared the prefix of the spec it will merge into
When the check of the specs goes
Then the check stays silent: the prefix does not become taken by it

### SC-AK-31 — a merged agreement does not refuse an edit of code

Given the agreement is named in the plan, created in the branch and removed by the merge
When application code is edited
Then the guard of the plan lets it through

### SC-AK-32 — the agreement was neither on disk nor in the history

Given the plan names an agreement that was never in the branch
When application code is edited
Then the guard of the plan refuses

### SC-AK-755 — a merge that was the first commit of a path does not lock the branch

Given the plan names an agreement by a path of the shape `<domain>/proposed/<feature>` that is
neither on disk nor in the history of the branch, while a spec with the name of this feature lies in
the directory of the domain
When application code is edited
Then the guard of the plan lets it through: the draft was written without committing, and what went
into the history was already the domain spec. Without such a spec the refusal stays as it was

Covered: `projects/agent-kit/tests/task-flow-draft-guard.test.sh`.

### SC-AK-47 — the check of the paths sees a bare file name

Given the document names a bare file name that is not in the tree
When the check of the paths goes
Then it names this name a divergence

### SC-AK-48 — the check of the paths sees a directory

Given the document names a directory that is not in the tree
When the check of the paths goes
Then it names this directory a divergence

### SC-AK-49 — the tree is taken from the version control system

Given the document names a path inside a directory that begins with a dot
When the check of the paths goes
Then it stays silent: the file is in the tree

### SC-AK-50 — the task folders are taken out of the check of the paths

Given the progress of the work names a path that is not in the tree
When the check of the paths goes
Then it stays silent

### SC-AK-51 — a record of a directory without a row in the pointer

Given a record that is not in its pointer lies in the directory
When the check of the paths goes
Then it names the record by a separate list of the divergences of the pointer

### SC-AK-52 — a row of the pointer without a record in the directory

Given the pointer names a record that is not in the directory
When the check of the paths goes
Then it names the row by the same separate list

### SC-AK-53 — a tree without declared pointers gets no check of the pointer

Given not a single directory with a pointer is named in the setting of the checks
When the check of the paths goes
Then the list of the divergences of the pointer is empty

### SC-AK-54 — a laid-out text is taken out of the check by its own header

Given the document carries the layout header and names an address that is not in the tree
When the check of the paths goes
Then it stays silent, and the same address in a text without a header it names a divergence

### SC-AK-55 — the source of a portable text is taken out by the directory from the setting

Given the directory of the sources of the portable texts is named in the setting of the checks
When the check of the paths goes
Then the addresses of the texts lying in it are not judged, while before the declaration of the
directory they were

### SC-AK-56 — a row of a descriptive table does not count as a binding

Given the companion of a rule names a name of the tree by a row of the table "Where it lives"
When the check of the specs goes
Then it stays silent about it, and a row of the same shape in the table of the bindings it judges as
before

### SC-AK-912 — the section of the bindings is read under the English name on a par with the Russian

Given the companion of a rule headed the section of the bindings "Where the articles are carried out"
When the check of the specs goes
Then the bindings of it are read, and it declares no absence of the section

Covered: `projects/agent-kit/tests/checks-specs.test.sh`.

### SC-AK-57 — the companion of a rule without the section of the bindings is refused

Given there is no section "Where the articles are carried out" in the companion of the rule
When the check of the specs goes
Then it names this a divergence and says which section is missing

### SC-AK-58 — the companion of a domain spec demands no section

Given the companion of a domain spec holds one table without a section
When the check of the specs goes
Then its bindings are read as they were read

### SC-AK-65 — a scenario with a single-digit number is visible to the check

Given a scenario with a number of one digit stands in a domain spec
When the check of the specs goes
Then the scenario gets into the parse on a par with the two-digit ones: without a test it is named
uncovered, not skipped silently

### SC-AK-66 — a reference to a single-digit number counts as coverage

Given the title of a test begins with the identifier of a scenario with a number of one digit
When the check of the specs goes
Then the scenario counts as covered, and the identifier as known to the check

### SC-AK-69 — the life of a scenario number is described by the rule

Given a scenario is added, changed or deleted
When the executor looks for what to do with its number
Then the rule about the documentation of the project answers all three cases, not only the conflict
of a merge

Not covered: it is judged by reading — what is written in the text of the rule is invisible to a
machine.

### SC-AK-238 — an anchor on a Russian word is read as a binding

Given a rule has the binding `путь/к/ресурсу.md:Семья` in its companion
When the check of the specs goes
Then it reads this as a binding and prints no "empty binding" lines about such a rule

### SC-AK-239 — a narrow parse is caught by the suite of the package

Given the parse of the pair `file:symbol` is narrowed down to a Latin word
When the suite of the package is run
Then it turns red on a binding written with a Russian word

### SC-AK-240 — the path of the pair stays Latin

Given a file name written not in Latin stands in the pair
When the check of the specs goes
Then it does not count as a pair: the address in the tree is parsed as before

### SC-AK-241 — a pattern skipped by the tree does not turn the rule red

Given the rule names its patterns, and all of them stand in the list of skips of the setting of the
tree
When the check of the specs goes
Then there is no line "the rule has not a single pattern" about it: a skip is a choice of the tree

Covered: `projects/agent-kit/tests/checks-specs.test.sh`.

### SC-AK-242 — an article with a verdict instead of an address does not turn the check red

Given a row of the companion names, instead of an address, the verdict "Not carried out" with a
reason
When the check of the specs goes
Then it stays silent: there is nowhere for a place in the code to come from, and an address there
would be a lie

Covered: `projects/agent-kit/tests/checks-specs.test.sh`.

### SC-AK-243 — a verdict without a reason does not count as a binding

Given a row of the companion names a verdict and breaks off at it
When the check of the specs goes
Then it names an empty binding: a verdict without a reason would close any row

Covered: `projects/agent-kit/tests/checks-specs.test.sh`.

### SC-AK-612 — a private name in an anchor does not count as an empty binding

Given an article of a rule is bound to a private field of a class, and the name is written with a
hash
When the check of the specs goes
Then the binding is read, not named empty

Covered: `projects/agent-kit/tests/checks-specs.test.sh`.

### SC-AK-662 — a binding as a list row is read on a par with a table row

Given the companion of a rule binds both its articles by list rows
When the check of the specs goes
Then both bindings are found: not one article is named unbound and not one binding surplus

Covered: `projects/agent-kit/tests/checks-specs.test.sh`.

### SC-AK-663 — a mixed companion is read whole

Given in the companion one article is bound by a table row, the other by a list row
When the check of the specs goes
Then both bindings are found: the translation goes file by file, and both shapes live side by side

Covered: `projects/agent-kit/tests/checks-specs.test.sh`.

### SC-AK-664 — a list row without an anchor is named an empty binding

Given a list row names an article and holds, instead of an address, words without backticks
When the check of the specs goes
Then it is named an empty binding — like an empty cell of a table

Covered: `projects/agent-kit/tests/checks-specs.test.sh`.

### SC-AK-688 — a table of refusal codes does not count as a procedure

Given the spec declared procedures, and the section "Contract" holds a table of refusal codes
When the check of the specs goes
Then the rows of this table are not read as procedures, and there is no talk of procedures not found

Covered: `projects/agent-kit/tests/checks-specs.test.sh`.

### SC-AK-807 — an agreement waiting longer than a month is named by a line of its own

Given the directory of the agreement lies in the tree, and the last commit in it is older than a
month
When the check of the specs is run
Then it prints the section "Waiting longer than a month" and names the directory with the number of
days

Covered: `projects/agent-kit/tests/checks-specs.test.sh`.

### SC-AK-808 — a fresh agreement does not get into the section

Given an agreement edited today lies next to it
When the check of the specs is run
Then only the old one stands in the section: fresh work demands no report about itself

Covered: `projects/agent-kit/tests/checks-specs.test.sh`.

### SC-AK-866 — a person named in a promise by a pronoun

Given the scenario names a person in the "Given", and in the "Then" speaks of them by a pronoun at a
verb of perceiving, and it is covered only by a unit test
When the check of the specs goes
Then it names the promise uncovered by a screen: a person named by a pronoun is the same person

Given a pronoun at a verb of perceiving stands in the promise, and the scenario names a person
nowhere
When the check of the specs goes
Then it does not count as a promise of a screen: "it" happens about a request and about a counter too

Covered: `projects/agent-kit/tests/checks-specs.test.sh`.

### SC-AK-867 — a line number and a class name are read as a binding

Given an article of a rule is bound to a line of the markup by a number, and a neighbouring one to a
class name in the styles
When the check of the specs goes
Then both bindings are read: not one article is named unbound, and the liveness of the line number is
judged by the length of the file, not by a search for a word

Covered: `projects/agent-kit/tests/checks-specs.test.sh`.

### SC-AK-889 — a subheading inside a section does not end the list of rules

Given the section "Rules" of a spec groups the items by subheadings
When the check of the specs goes
Then the section is not named empty, and an item after a subheading is read on a par with the items
before it

Covered: `projects/agent-kit/tests/checks-specs.test.sh`.

### SC-AK-890 — the refusal about an empty section names what stands instead of the items

Given a table stands before the list in the section "Rules", or there are no items at all
When the check of the specs goes
Then the refusal names the line the list ended at, or the first line of the section

Covered: `projects/agent-kit/tests/checks-specs.test.sh`.

### SC-AK-913 — a mandatory section of a spec is read under the English name

Given the spec is written in English and carries the heading "## Rules" instead of "## Правила"
When the check of the specs goes
Then the section counts as in place, its items are read, and nothing is said about a missing section

Covered: `projects/agent-kit/tests/checks-specs.test.sh`.

### SC-AK-914 — the mark of the uncovered is read under the English name

Given the scenario carries the mark "Not covered:" with a reason
When the check of the specs goes
Then the scenario counts as deliberately uncovered on a par with the Russian mark

Covered: `projects/agent-kit/tests/checks-specs.test.sh`.
