# Scenarios — a section closed by a right

The identifier goes at the start of the test title, followed by a dash. The numbers continue the
common numbering of the domain and do not change at a move between subdomains.

While a scenario is not covered, it carries the mark "Not covered" with a reason. The scenarios
whose "Then" names a person and what they see are closed by an end-to-end spec.

### SC-MB-298 — a section whose right is held is shown and opens

Given a signed-in person whose rights hold the read right of a section
When the admin panel draws the top row and the person presses the item
Then the item is in the row, and its address opens the screen of the section

Not covered: the check is written by the task RT-1898.

### SC-MB-299 — a section whose right is not held is not shown

Given a signed-in person whose rights do not hold the read right of a section
When the admin panel draws the top row
Then the item of that section is absent from the row entirely

Not covered: the check is written by the task RT-1898.

### SC-MB-300 — the address of a closed section does not open by a direct link

Given a signed-in person without the read right of a section
When they open the address of that section directly
Then the screen of the section does not open, and the person lands in a section open to them

Not covered: the check is written by the task RT-1898.

### SC-MB-301 — until the rights arrive nothing is hidden

Given the answer about the signed-in person has not arrived yet
When the admin panel draws the top row
Then every item is in the row: the rights are unknown rather than absent

Not covered: the check is written by the task RT-1898.

### SC-MB-302 — a person to whom no section is open sees the admin panel without sections

Given a signed-in person whose rights hold not one read right of a section
When the admin panel comes up
Then the top row holds their name and the way out and not a single item, and the body says access
has not been given and whom to ask

Not covered: the check is written by the task RT-1898.

### SC-MB-303 — the root leads into the first open section

Given a signed-in person without the right of the first section of the list
When they open the root address of the admin panel
Then the first section open to them opens, not the first of the list

Not covered: the check is written by the task RT-1898.

### SC-MB-304 — an operation of a section refuses a sign-in without the right of that section

Given a signed-in person without the read right of a section
When they call the operation the section lives by, bypassing the screens
Then the answer is a refusal by a right, and the records of the section are not given away

Not covered: the check is written by the task RT-1898.

### SC-MB-305 — a right taken away closes the section on the next move

Given a person who has the section open and their right taken away meanwhile
When they move to that section anew
Then the section does not open, and its item is gone from the row

Not covered: the check is written by the task RT-1898.

### SC-MB-306 — the right of an item is a name from the closed set

Given the declaration of the menu items
When a right is written into an item
Then it is a name of the closed set of rights, one for both sides, and a name outside the set does
not compile

Not covered: the check is written by the task RT-1898.

### SC-MB-307 — the stand gives its account every right

Given the stand of the end-to-end suite is seeded
When a person signs in on it
Then all four sections are open to them: the suite checks the sections rather than the rights

Not covered: the check is written by the task RT-1898.
