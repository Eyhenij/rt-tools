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

### SC-UKV-781 — a rail without titles names its items by a tooltip

Given a menu with the rail titles switched off, and one with the submenu tooltips switched off too
When the rail is drawn
Then no caption stands under the icons, every item carries its name as the accessible name, and the
tooltip on the right shows the name only while the submenu tooltips are on

Coverage: partial — the test reads the text and the side the items hand to the tooltip, not a hover.

### SC-UKV-782 — rail icons are filled by the input

Given a menu without the fill input and one with it
When the rail is drawn
Then the first draws outlined icons and the second filled ones

### SC-UKV-783 — the submenu search takes the menu inputs

Given a menu with the search size and look set, on a wide and on a narrow screen
When the submenu opens
Then its search field takes that size and look, and without the inputs it stays small and outlined

### SC-UKV-784 — every submenu row carries its item number

Given a submenu with a row of the section page and a folder
When the submenu opens
Then the row and the folder carry their item numbers, and a rule by the number finds the row

### SC-UKV-785 — without the look properties the menu draws as before

Given a menu without the new inputs and properties
When it is drawn
Then it looks as before

Not covered: this is a promise about frames. The former snapshots of the side menu stories match
without a re-take.

### SC-UKV-793 — the folder icon has a Material pair

Given the material preset and a submenu folder with the `folder` icon
When the folder is drawn
Then it draws the Material folder, outlined and filled

Not covered by a test: `node tools/check-icon-map.mjs` holds every pair to an existing file of both
sets.

### SC-UKV-794 — row and folder icons are filled by the input

Given a menu without the row icon fill input and one with it
When the submenu opens
Then the first draws outlined row and folder icons and the second filled ones

### SC-UKV-795 — a submenu row hands its press to the consumer first

Given a submenu row with an address, in the list and in the favourites block
When it is pressed, and the consumer prevents the press, and it is pressed with a modifier
Then the consumer gets the press first; an unprevented press navigates by the router, a prevented one
does not, a press with a modifier stays the browser's; the row keeps its address

### SC-UKV-796 — the hover submenu closes after the delay

Given a menu with a close delay and a submenu opened by hover
When the pointer leaves the panel, comes back before the delay, and hovers a rail item without a
submenu
Then the panel stays open until the delay ends, the return keeps it open, an item with a submenu
switches it at once, and without the delay the panel closes at once

### SC-UKV-797 — the panel shows the scroll hint by the input

Given a menu without the panel hint input and one with it
When the submenu opens
Then only the second panel carries the scroll hint
