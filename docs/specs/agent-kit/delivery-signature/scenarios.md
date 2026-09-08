# Scenarios — the signature of a machine commit

The prefix `SC-AK` is shared across the domain together with the subdomains. The numbers were issued
as the next free ones in the domain and do not change on the move into another subdomain: the titles
of the tests refer to them.

### SC-AK-178 — a foreign mail at a machine name refuses the push

Given the contribution of the branch holds a commit that named itself by the machine record, and the
mail in it is not the one the profile declares
When a push call goes
Then the guard refuses

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-179 — the refusal names the commit and both mails

Given the same commit with the divergence in the mail
When a push call goes
Then the text of the refusal holds the short hash of the commit, the found mail and the declared one

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-180 — a right signature holds up no push

Given the whole contribution of the branch is signed by the declared mail
When a push call goes
Then the guard lets it through

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-181 — a commit that named itself by a person is not judged

Given the contribution of the branch holds a commit with a foreign name and mail, and the login of
the machine record is not in them
When a push call goes
Then the guard lets it through: this commit did not name itself a machine one

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-182 — the contribution of the branch is judged, not the whole history

Given a commit with a foreign mail under a machine name lies in the main branch, and the
contribution of the branch is clean
When a push call goes
Then the guard lets it through: what is merged is not fixed by this branch

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-183 — a tree that named no mail gets no demand

Given the profile of the tree names no mail of a machine record
When a push call goes with the same divergence
Then the guard lets it through silently

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-184 — a dry push judges no signature

Given the contribution of the branch carries a divergence in the mail, and the push is called as a
dry one
When a push call goes
Then the guard lets it through: a dry push sends nothing

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-753 — the signature is judged at the commit too, not only at the send

Given the contribution of the branch carries a commit of the machine record with a foreign mail
When a commit call goes — an ordinary one or one rewriting the last
Then the guard refuses it by the same refusal as at the send: the miss is made at the commit and
lands in several commits in a row before the send. A right signature holds up no commit, and a
mention of the command inside a string is no call

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-934 — the repair named in the refusal passes

Given the contribution of the branch carries a commit of the machine record with a foreign mail
When a commit call goes that rewrites the last commit and carries the declared mail in both
signature variables — in double quotes, in single ones or without any
Then the guard lets it through: this is the very repair its own refusal names, and without the
exception it refused the repair together with the miss. A foreign mail in the variables, one
variable of two, the right variables without the rewrite, and a call carrying the rewrite together
with a send are all refused as before: the divergence is removed before the contribution leaves

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-882 — a commit under a record the tree did not declare

Given the tree named the mails of its people in the profile, and the contribution of the branch holds
a commit with a foreign mail
When the delivery guard judges the send
Then it refuses it and names the commit with its mail: before, only a commit naming itself by the
machine record was judged, and an undeclared record passed silently

Given the mails of the people are not named in the profile
When the delivery guard judges the same send
Then it stays silent: demanding a known signature of every commit would refuse work done by hand
