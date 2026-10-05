# Scenarios — the entry screens of the module

The identifier goes at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason.

### SC-AUTH-18 — the theme draws its own pages and leaves the rest to the standard layout

Given the context of each page the theme draws and of a page it does not draw
When the page component is asked for each
Then the theme pages get the theme component, and the other page gets the standard one

### SC-AUTH-19 — the login form is sent with the standard field names

Given the login page with an address and a password typed
When the form is sent
Then the form posts to the action address the fields `username`, `password` and `credentialId`

### SC-AUTH-20 — an empty required field stops the form

Given a page form with an empty required field
When the person sends it
Then nothing is posted and the field shows its error

### SC-AUTH-21 — the forms of the reset and the new password keep their field names

Given the reset page and the new password page with the fields typed
When each form is sent
Then the reset posts `username`, and the new password posts `password-new` and `password-confirm`

### SC-AUTH-22 — a Keycloak message stands above the form in the colour of its kind

Given a page whose context holds an error message
When the page is drawn
Then the message stands above the form with the danger kind

### SC-AUTH-23 — every provider gets a button with its icon

Given a realm with Google, Apple and one more provider
When the login page is drawn
Then three buttons lead to the provider addresses, and only Google and Apple carry icons

### SC-AUTH-24 — the kit labels follow the page locale

Given a page in Russian
When the kit draws its own labels
Then they are Russian

### SC-AUTH-25 — the stand realm draws the login page with the theme

Given the stand is raised
When the login page of the realm is read
Then it is drawn by the theme `rt`

Not covered: the command `check:auth-stand` asks a raised stand; it joins the push gate with the end-to-end task RT-2534
