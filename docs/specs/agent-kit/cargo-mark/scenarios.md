# Scenarios — the state mark of a cargo record

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain, and
the numbers were not recounted on the move into the subdomain: the number ties a scenario to a test
title.

### SC-AK-427 — the command moves the named records into a state

Given the tree is created, and two incident analyses are named in the arguments
When the executor calls the mark with the state "in work"
Then the intake gets one request with both records, and the output names two that were moved

Covered: `projects/agent-kit/tests/cargo-mark.test.sh`.

### SC-AK-428 — a dry run goes to no network

Given records and a state are named in the arguments
When the mark is called as a dry run
Then what would leave is printed, and not one request goes to the intake

Covered: `projects/agent-kit/tests/cargo-mark.test.sh`.

### SC-AK-429 — without the token of the tree the mark refuses before the network

Given there is no token of the tree in the package setting
When the executor calls the mark
Then the command ends with a non-zero code, names the creation of the tree and goes to no network

Covered: `projects/agent-kit/tests/cargo-mark.test.sh`.

### SC-AK-430 — an unknown state is refused before the network

Given the state argument holds a word that is not in the set
When the executor calls the mark
Then the command names which states there are and makes no request

Covered: `projects/agent-kit/tests/cargo-mark.test.sh`.

### SC-AK-431 — a call without records is refused

Given the state is named, and there is not a single record in the arguments
When the executor calls the mark
Then the command says there is nothing to mark and names the arguments a record is named by

Covered: `projects/agent-kit/tests/cargo-mark.test.sh`.

### SC-AK-432 — a record refused by the intake is printed and gives a non-zero code

Given the intake refused one of the two records
When the mark reads its answer
Then the moved one is named by the count, the refused one by its key and reason, and the exit code
is non-zero

Covered: `projects/agent-kit/tests/cargo-mark.test.sh`.

### SC-AK-558 — the sign of the tree is counted by one technique on the send and on the mark

Given the tree has a remote repository
When the mark prints where and on whose behalf the cargo will leave
Then the named sign matches the one the send counts: two copies of the count diverge silently, and
the intake answers a divergence with a refusal about a foreign tree

Covered: `projects/agent-kit/tests/cargo-mark.test.sh`.

### SC-AK-1130 — an empty sign of the tree is refused before the network

Given the module of the package that counts the sign of the tree is missing
When the mark is called, in a dry run as well
Then the call is refused before the network with a non-zero code, and the refusal names where the
sign is counted from; the sign of SC-AK-558 is checked to be non-empty before it is compared

Covered: `projects/agent-kit/tests/cargo-mark.test.sh`.
