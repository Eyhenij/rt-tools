# Scenarios — the pin and tooltip switches and the row button fallback of the side menu

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
as the next free ones in the domain and do not change after the merge into the spec: the titles of the
tests refer to them.

What a scenario is covered by is said under it. Where the run does not cover a scenario, that is said
openly.

### SC-UKV-620 — a menu without the pin button keeps the submenu floating

Given a menu with the pin button switched off, a stored pinned mode, and then a bound pinned mode
When the submenu opens, and the menu is drawn
Then the submenu head has no pin button, the stored mode is not read, and the bound mode still pins

### SC-UKV-621 — a menu without submenu tooltips shows none on its rows

Given a menu with the submenu tooltips switched off
When the submenu opens
Then no row title or row button carries a tooltip, and the row button keeps its accessible name

Coverage: partial — the test reads the tooltip text the rows hand to the tooltip, not a hover: the
tooltip itself shows nothing for an empty text.

### SC-UKV-622 — a row button without a kit icon takes the own template

Given a menu with its own icon template and rows whose buttons have a name without a kit icon and a
kit icon
When the submenu is drawn
Then the first button shows the template with the button's name and place, and the second the kit icon

### SC-UKV-623 — an icon button without an icon name shows its content

Given an icon button without an icon name and one with a name, both with content inside
When they are drawn
Then the first shows its content, and the second shows the icon and not the content

### SC-UKV-624 — without the new inputs and template the menu stays as before

Given a menu without the new inputs and without a template
When it is drawn
Then it looks as before

Not covered: this is a promise about frames. The former snapshots of the side menu and icon button
stories match without a re-take.
