# Scenarios — the profile menu

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
as the next free ones in the domain and do not change after the merge into the spec.

### SC-UKV-857 — the person and the organization are drawn

Given a profile menu with the name «maria» and the organization «North»
When it is drawn
Then the mark carries «M», the name «maria» stands under it, and the organization line names «North»
with its caption

### SC-UKV-858 — an empty organization hides its line

Given a profile menu without an organization name
When it is drawn
Then there is no organization line

### SC-UKV-859 — the organization change follows its mode

Given profile menus with the organization change hidden, unavailable and available
When each is drawn and its item pressed
Then the first has no item, the second has a muted item with a tooltip that sends nothing, and the
third sends the change once

### SC-UKV-860 — the password change and the language show only when turned on

Given a profile menu with neither, and one with the password change and two languages
When each is drawn and the second gets a language chosen
Then the first has neither item, the second has both, and the choice goes out by its code

### SC-UKV-861 — the theme switch goes through the theme service

Given a profile menu on a light page
When the theme item is pressed
Then the page turns dark and the item shows the sun icon

### SC-UKV-862 — the sign-out goes out unless unavailable

Given a profile menu with the sign-out available, and one with it unavailable
When the sign-out of each is pressed
Then the first sends the sign-out once, the second sends nothing
