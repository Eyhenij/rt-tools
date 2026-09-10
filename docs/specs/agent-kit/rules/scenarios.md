# Scenarios — the rules the package ships

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain.

### SC-AK-1016 — every rule declares a law that exists

Given the rules of the package
When the law each of them declares is looked for among the laws
Then every name is found, and none declares two

Covered: `projects/agent-kit/tests/rules-kind.test.sh`.

### SC-AK-1017 — a rule holds a section about how the law applies here

Given the rules of the package
When their headings are read
Then each carries the section about how the law applies here

Covered: `projects/agent-kit/tests/rules-kind.test.sh`.

### SC-AK-1018 — a rule names the place where the tree's own names live

Given the rules of the package
When their headings are read
Then each carries the section naming the companion next to it

Covered: `projects/agent-kit/tests/rules-kind.test.sh`.

### SC-AK-1019 — a rule description is no longer than the limit

Given the rules of the package
When the description of each is measured
Then none is longer than the limit, apart from those named in the accepted list

Covered: `projects/agent-kit/tests/rules-kind.test.sh`.

### SC-AK-1020 — every rule has at least one pattern

Given the rules of the package
When the patterns declaring each rule are counted
Then none of the rules is left without one

Covered: `projects/agent-kit/tests/rules-kind.test.sh`.

### SC-AK-1021 — a rule says what of its law is not kept here

Given the rules of the package
When their headings are read
Then each carries the section about what of the law is not here

Covered: `projects/agent-kit/tests/rules-kind.test.sh`.

### SC-AK-1022 — a rule marked by a trait names a trait the package declares

Given a rule whose name carries a trait prefix
When the trait is looked for among the declared ones
Then it is found

Covered: `projects/agent-kit/tests/rules-kind.test.sh`.

### SC-AK-1023 — a rule of a platform ships in editions and the tree takes one

Given the rules of one subject differing by platform
When the editions are looked for among the declared ones
Then each is declared, and the tree lays out exactly one

Covered: `projects/agent-kit/tests/rules-kind.test.sh`.

### SC-AK-1024 — a rule with a cold part names it in its header

Given a rule with a file of pitfalls next to it
When its header is read
Then the cold part is named there

Covered: `projects/agent-kit/tests/rules-kind.test.sh`.

### SC-AK-1025 — the entry into the specs answers zero for every rule

Given every rule the package ships
When the entry into the specs is asked by its name
Then the exit code is zero and this spec is named

Covered: `projects/agent-kit/tests/rules-kind.test.sh`.
