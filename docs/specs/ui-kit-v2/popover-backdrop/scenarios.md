# Scenarios — the backdrop of the popover

The numbers continue the numbering of the second kit and do not change after the merge.

### SC-UKV-1070 — without a backdrop class the page next to the panel stays open

Given a popover without a backdrop class
When the panel opens
Then no backdrop stands under the panel

### SC-UKV-1071 — a backdrop class puts a backdrop under the panel, and a press on it closes the panel

Given a popover with a backdrop class
When the panel opens and the backdrop is pressed
Then the panel closes

### SC-UKV-1072 — the open mobile menu stands on a backdrop, and a press on it closes the menu

Given the page header on a narrow screen
When the burger opens the mobile menu and the backdrop is pressed
Then the menu closes

### SC-UKV-1080 — on a narrow screen the profile menu stands on the mobile menu backdrop, and a press on it closes the menu

Given the page header on a narrow screen with a user and a profile menu
When the user button opens the profile menu and the backdrop is pressed
Then the menu stood on the backdrop of the mobile menu and closes

### SC-UKV-1081 — on a wide screen the profile menu opens without a backdrop

Given the page header on a wide screen with a user and a profile menu
When the user button opens the profile menu
Then no backdrop stands under the menu
