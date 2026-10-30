# Scenarios — a hover popover under a touch

The numbers continue the numbering of the second kit and do not change after the merge.

### SC-UKV-1082 — the hover derived from a touch neither opens nor closes a hover popover

Given a hover popover
When a touch comes over the host and the browser derives a hover and a leave from it
Then the panel neither opens on the hover nor closes on the leave, and a touch over the host or the
panel cancels the close a mouse leave planned before it

### SC-UKV-1083 — a press on the host of a hover popover opens the panel

Given a hover popover with no press handler in the template
When the host is pressed twice
Then the panel opens on the first press and stays open after the second

### SC-UKV-1084 — a tap on the user name opens the profile menu once, and a tap on the backdrop leaves no backdrop

Given the page header on a narrow screen with a user and a profile menu
When the user name is tapped and then the backdrop is tapped
Then after the first tap one backdrop stands under the open menu, and after the second the menu and every backdrop are gone

### SC-UKV-1085 — the profile menu fits the room under the user name

Given the page header with a user and a profile menu
When the user name opens the profile menu
Then the menu panel is fitted to the viewport, so on a low screen it ends at the bottom edge and its items scroll,
and the language list opened inside the menu follows its field while the menu scrolls
