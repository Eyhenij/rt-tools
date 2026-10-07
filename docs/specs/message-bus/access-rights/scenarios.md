# Scenarios — a right, a role and the check that reads them

The identifier goes at the start of the test title, followed by a dash. The numbers continue the
common numbering of the domain and do not change at a move between subdomains.

While a scenario is not covered, it carries the mark "Not covered" with a reason. The scenarios
whose "Then" names a person and what they see are closed by an end-to-end spec.

### SC-MB-287 — an operation declared by a right lets in whoever holds it

Given an access token whose client roles hold the right of the operation
When the operation is called with that token
Then the operation does its work

### SC-MB-288 — a token without the right is refused, and not as an absent sign-in

Given an access token whose client roles do not hold the right of the operation
When the operation is called with that token
Then the answer is a refusal by a right, and it differs from the refusal to whoever did not sign in

### SC-MB-289 — the refusal by a right does not name the right that was missing

Given an access token without the right of the operation
When the operation is called
Then the answer holds neither the name of the right nor the list of the rights of the person

### SC-MB-290 — a right the token is silent about counts as not given

Given an access token whose client roles name other rights of the set, not this one
When an operation declared by that right is called
Then the answer is a refusal by a right

### SC-MB-293 — a person without client roles opens no operation declared by a right

Given an access token with no client role of the bus
When an operation declared by any right is called
Then the answer is a refusal by a right

### SC-MB-294 — a right taken away acts with the next token

Given a token issued while the right was held
When the right is taken away in Keycloak and the operation is called with a token issued after that
Then the answer is a refusal by a right

### SC-MB-295 — a token of a tree opens no operation declared by a right

Given a fit token of a tree
When an operation declared by a right is called by it
Then the answer is a refusal, and the token gives no rights

### SC-MB-296 — the admin panel takes the rights of the person from their token

Given a person whose token carries client roles of the bus client
When the admin panel reads who signed in
Then their rights are exactly those roles, and their name is the name from the token

### SC-MB-298 — a section whose right is held is shown and opens

Given a signed-in person whose rights hold the read right of a section
When the admin panel draws the top row and the person presses the item
Then the item is in the row, and its address opens the screen of the section

### SC-MB-299 — a section whose right is not held is not shown

Given a signed-in person whose rights do not hold the read right of a section
When the admin panel draws the top row
Then the item of that section is absent from the row entirely

### SC-MB-300 — the address of a closed section does not open by a direct link

Given a signed-in person without the read right of a section
When they open the address of that section directly
Then the screen of the section does not open, and the person lands in a section open to them

### SC-MB-301 — until the rights arrive nothing is hidden

Given the answer about the signed-in person has not arrived yet
When the admin panel draws the top row
Then every item is in the row: the rights are unknown rather than absent

### SC-MB-302 — a person to whom no section is open sees the admin panel without sections

Given a signed-in person whose rights hold not one read right of a section
When the admin panel comes up
Then the top row holds their name and the way out and not a single item, and the body says access
has not been given and whom to ask

### SC-MB-303 — the root leads into the first open section

Given a signed-in person without the right of the first section of the list
When they open the root address of the admin panel
Then the first section open to them opens, not the first of the list

### SC-MB-304 — an operation of a section refuses a sign-in without the right of that section

Given a signed-in person without the read right of a section
When they call the operation the section lives by, bypassing the screens
Then the answer is a refusal by a right, and the records of the section are not given away

### SC-MB-305 — a right taken away closes the section on the next move

Given a person who has the section open and their right taken away meanwhile
When they move to that section anew
Then the section does not open, and its item is gone from the row

### SC-MB-306 — the right of an item is a name from the closed set

Given the declaration of the menu items
When a right is written into an item
Then it is a name of the closed set of rights, one for both sides, and a name outside the set does
not compile

### SC-MB-307 — the stand gives its person every right

Given the stand of the end-to-end suite is seeded
When a person signs in on it
Then every section is open to them: the realm of the stand gives them every client role
