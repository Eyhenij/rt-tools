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

Not covered: the command `check:auth-stand` asks a raised stand. It runs in the gate before sending and in the pipeline, and the audit of specs reads only `.spec.ts` files

### SC-AUTH-54 — a Keycloak message shows a quotation mark, not its HTML code

Given a message that carries `&laquo;`
When a page draws it
Then the screen shows «

### SC-AUTH-55 — an error under a field does not move the form

Given the entry form with an empty password
When the person sends it
Then the error appears under the field, and the button stays where it was

### SC-AUTH-56 — the fields and the button of the entry form are large

Given the entry page
When it is drawn
Then the fields and the submit button have the large size of the kit

### SC-AUTH-57 — the language is chosen from a drop-down list

Given a realm with two languages
When a page is drawn
Then the language is chosen from one drop-down list, not from a row of buttons

### SC-AUTH-58 — the entry card has an outline and a shadow

Given the entry page of the stand
When it is drawn
Then the card has a border and a shadow

### SC-AUTH-59 — an empty login field shows an example address, not its label

Given the entry form of a realm where the login takes an address
When it is drawn with empty fields
Then the login field shows `name@example.com` inside it and the password field shows nothing

### SC-AUTH-60 — a login field that takes only a name has no placeholder

Given the entry form of a realm where the login takes only a name
When it is drawn with empty fields
Then neither the login field nor the password field shows anything inside it

### SC-AUTH-61 — the dot field stands behind the card

Given any theme page
When it is drawn
Then the viewport holds the kit's dot field next to the card

### SC-AUTH-62 — the entry card is glass over a moving field

Given the entry screen on the stand
When it is open
Then the card background is semi-transparent with a blur behind it, the viewport carries a radial
gradient, and the dot field canvas is drawn and lies under the card
