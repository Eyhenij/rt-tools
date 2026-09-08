# Scenarios — a right, a role and the check that reads them

The identifier goes at the start of the test title, followed by a dash. The numbers continue the
common numbering of the domain and do not change at a move between subdomains.

While a scenario is not covered, it carries the mark "Not covered" with a reason. The scenarios
whose "Then" names a person and what they see are closed by an end-to-end spec.

### SC-MB-287 — an operation declared by a right lets in whoever holds it

Given an account with a role whose set holds the right of the operation
When the operation is called with the sign-in of that account
Then the operation does its work

### SC-MB-288 — a sign-in without the right is refused, and not as an absent sign-in

Given an account with a role whose set does not hold the right of the operation
When the operation is called with the sign-in of that account
Then the answer is a refusal by a right, and it differs from the refusal to whoever did not sign in

### SC-MB-289 — the refusal by a right does not name the right that was missing

Given a sign-in without the right of the operation
When the operation is called
Then the answer holds neither the name of the right nor the list of the rights of the account

### SC-MB-290 — a right the role is silent about counts as not given

Given a role whose set holds neither a permission nor a ban of the right
When an operation declared by that right is called
Then the answer is a refusal by a right

### SC-MB-291 — a pointed edit gives a right the role does not hold

Given an account whose role lacks the right, and a pointed edit giving it
When an operation declared by that right is called
Then the operation does its work

### SC-MB-292 — a pointed edit takes away a right the role holds

Given an account whose role holds the right, and a pointed edit taking it away
When an operation declared by that right is called
Then the answer is a refusal by a right

### SC-MB-293 — an account without a role opens no operation declared by a right

Given an account to which no role is assigned
When an operation declared by any right is called
Then the answer is a refusal by a right

### SC-MB-294 — a right taken away acts on the next call, not on the next sign-in

Given a sign-in made while the right was held
When the right is taken away by a pointed edit and the operation is called by that same sign-in
Then the answer is a refusal by a right

### SC-MB-295 — a token of a tree opens no operation declared by a right

Given a fit token of a tree
When an operation declared by a right is called by it
Then the answer is a refusal, and the token gives no rights

### SC-MB-296 — the answer about the signed-in person carries their rights

Given an account with a role and pointed edits over it
When the admin panel asks who signed in
Then the answer holds the rights of that person as the role and the edits over it add up to

Not covered: the check is written by the task RT-1897.

### SC-MB-297 — a right that no operation declares is not accepted into a role

Given a name that is not in the closed set of rights
When it is written into a role or into a pointed edit
Then the writing is refused, and the role is left as it was
