# Scenarios — the identity of the call that opens a request

The prefix is `SC-AK`. The subdomain `delivery-identity` of the domain `agent-kit`.

### SC-AK-480 — a request without the substitution of the token is refused

Given the tree named the variable the machine record token is substituted by
When a request is opened, and there is no substitution in the command
Then the opening is refused: the signed-in record will open the request from the owner, and they
cannot be assigned as its reviewer

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-481 — a request with the substitution of the token passes

Given the machine record token is substituted before the command
When a request is opened
Then the guard lets the call through

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-482 — a token set by a separate line counts

Given the token is set by a separate command of the same call
When a request is opened right after
Then the guard lets the call through: the text of the command is judged whole, not one prefix of it

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-483 — the refusal names the token variable

Given a request is opened without the substitution
When the guard refuses the call
Then the refusal holds the name of the variable and a ready substitution line

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-831 — a command named by a path is recognised on a par with a bare name

Given the hosting client is called with a directory before the name — by a full path or a relative
one
When the guard looks for its own name in the command
Then the call is recognised and judged as one named by a bare name: a path before the name of the
same command changes it in nothing, and a call the guard does not know leaves with zero and stays
silent — while silence is indistinguishable from permission

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-484 — a tree without a machine record judges no author

Given the tree named no token variable
When a request is opened
Then the guard lets the call through: for such a tree the identity of a call means nothing

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-485 — the draft is not lifted from a request opened by other than the machine record

Given the author of the request is not the record the tree named as the machine one
When the draft is lifted
Then the lifting is refused: this is the last move where the miss is still fixable by reopening

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-486 — the refusal names both records and the reopening

Given the draft is lifted from a request of a foreign author
When the guard refuses the call
Then the refusal holds both records and the path of the fix: close the request and open it anew

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-487 — a request of the machine record lifts its draft

Given the author of the request is the machine record of the tree
When the draft is lifted
Then the guard lets the call through

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-842 — the login the call will go under is checked against the machine record

Given the tree can ask the hosting who will come by the token
When a request is opened
Then the login of the machine record lets the call through, a foreign one forbids it, and the
refusal names both records: the substitution in the command speaks of an intent, not of a result

Covered: `projects/agent-kit/tests/git-guards-identity.test.sh`.

### SC-AK-843 — asking did not work: the call passes, and this is said

Given the tree named neither a machine record nor a way to ask — or the answer is empty
When a request is opened
Then the check is not performed and the call passes, and the guard reports the empty answer: a
silent pass is indistinguishable from a check that came together

Covered: `projects/agent-kit/tests/git-guards-identity.test.sh`.

### SC-AK-892 — the delivery rule says that the active record of the client is picked per machine

Given the edition of the delivery rule for a hosting with a client whose active record is one per
machine
When the article about the identity of a call is read
Then an article stands next to it: the active record is picked per machine, not per tree, and the
machine record is substituted onto a call and is not made active

Covered: `projects/agent-kit/tests/git-guards-identity.test.sh`.
