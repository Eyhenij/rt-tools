# Scenarios — the patterns and the cold parts the package ships

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain.

### SC-AK-1026 — every pattern declares a rule in its header

Given the patterns of the package
When their headers are read
Then each names the rule it stands next to

Not covered: the suite of the kind is written by the second stage of this work.

### SC-AK-1027 — the rule named by a pattern exists

Given the patterns of the package
When the rule each of them names is looked for among the rules
Then every name is found

Not covered: the suite of the kind is written by the second stage of this work.

### SC-AK-1028 — a pattern declares its kind

Given the patterns of the package
When their headers are read
Then each declares itself a pattern, and none declares itself a rule

Not covered: the suite of the kind is written by the second stage of this work.

### SC-AK-1029 — a rule names its patterns in a section of its own

Given a rule with patterns next to it
When its section of patterns is read
Then every pattern declaring this rule is named there

Not covered: the suite of the kind is written by the second stage of this work.

### SC-AK-1030 — a pattern of a platform ships in the declared editions

Given the patterns of one subject differing by platform
When the editions are looked for among the declared ones
Then each is declared

Not covered: the suite of the kind is written by the second stage of this work.

### SC-AK-1031 — a pattern name is not taken twice

Given the patterns of the package
When their names are counted apart from the platform edition
Then none repeats

Not covered: the suite of the kind is written by the second stage of this work.

### SC-AK-1032 — a cold part answers to a rule by its name

Given the cold parts of the package
When a rule of the same name is looked for
Then it is found for each of them

Not covered: the suite of the kind is written by the second stage of this work.

### SC-AK-1033 — a cold part names the rule its articles stand in

Given the cold parts of the package
When their text is read
Then each names the rule the articles stand in

Not covered: the suite of the kind is written by the second stage of this work.

### SC-AK-1034 — a rule with a cold part names it in its header

Given a rule with a cold part next to it
When its header is read
Then the cold part is named there

Not covered: the suite of the kind is written by the second stage of this work.

### SC-AK-1035 — the entry into the specs answers zero for both kinds

Given every pattern and every cold part the package ships
When the entry into the specs is asked by its name
Then the exit code is zero and this spec is named

Not covered: the suite of the kind is written by the second stage of this work.
