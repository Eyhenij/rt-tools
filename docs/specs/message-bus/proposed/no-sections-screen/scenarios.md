# Scenarios — the screen of the person to whom no section is open

The identifier goes at the start of the test title, followed by a dash. The numbers continue the
common numbering of the domain and do not change at a move between subdomains.

What the screen shows is already promised by `SC-MB-302` of the subdomain of the rights, and it is
not promised a second time here: these scenarios are about the address the screen lives at.

While a scenario is not covered, it carries the mark "Not covered" with a reason. The scenarios
whose "Then" names a person and what they see are closed by an end-to-end spec.

### SC-MB-395 — after signing in without a single right the person lands on the address of the screen

Given an account whose rights hold not one read right of a section
When the person signs in and the admin panel comes up
Then the address in the browser line is the address of the screen, not an empty one

### SC-MB-396 — the screen survives a reload of its own address

Given a person to whom no section is open, standing on the screen
When the page is reloaded at that address
Then the same screen comes up: the reason, whom to ask, the name and the way out

### SC-MB-397 — a direct link to a closed section leads to the screen when no section is open

Given a person to whom no section is open
When they open the address of any section directly, on the first load of the page
Then the screen comes up instead of a blank page, and the address becomes the address of the screen

### SC-MB-398 — the address of the screen leads away whoever has a section open

Given a signed-in person with at least one open section
When they open the address of the screen by hand
Then the first section open to them opens instead

### SC-MB-399 — a right that arrives without a reload takes the person off the screen

Given a person standing on the screen, whose rights arrive anew with a section among them
When the admin panel receives the answer about the signed-in person
Then the item of the section is in the top row, and the screen is no longer shown

### SC-MB-400 — the way out from the screen leads to the sign-in

Given a person to whom no section is open, standing on the screen
When they press the way out
Then the sign-in screen comes up, and the sign-in is over

### SC-MB-401 — the screen is not shown while the answer about the signed-in person has not arrived

Given the answer about the signed-in person has not arrived yet
When the admin panel draws the page
Then the screen is not shown: the rights are unknown rather than absent
