# Scenarios — the common page of a list

The numbers continue the shared numbering of the domain: the subdomain was split out of the reading of
what was taken in, and the scenarios moved here as they were.

### SC-MB-110 — the filter on a list page is the one the section put there

Given the section of the incident analyses is open
When the owner looks at the strip above the list
Then on the left stands the filter by tree the section itself put there, and the page draws none of
its own

### SC-MB-111 — a filter from a slot changes the list the same way the sewn-in one changed it

Given a tree is chosen in the section
When the owner chooses another one
Then the list narrows by it, the page resets to the first one, and the choice stands in the address of
the section

### SC-MB-112 — the refreshing and the setting of the columns stay in their place at the edge of the toolbar

Given the section put a button of its own into the right part of the toolbar
When the owner looks at the strip above the list
Then the button of the section stands to the left of the refreshing and of the setting of the columns,
and those stand at the edge

### SC-MB-113 — an unoccupied place above the table takes no height

Given the section put nothing above the table
When the list is read
Then the first row stands right under the toolbar, and there is no empty strip between them

### SC-MB-114 — the heading of the section shows the hint when the section named it

Given the section named a hint of the heading
When the owner opens the section
Then an explanation is next to the name, and at a section without a hint the heading stands in the same
place

### SC-MB-115 — the anchors of the common page name the section it is open at

Given two different sections are open
When a check looks for the refreshing of the list by the anchor of one of them
Then it finds it only at its own section, and at the neighbouring one there is no such anchor

### SC-MB-116 — the page is paged and sets the columns through the host

Given the list is filtered by tree and open at the second page
When the owner opens the setting of the columns and closes it
Then the same list comes back — the same page, the same filter and the same order

### SC-MB-132 — the anchors on the page of a section are put together from its prefix

Given a prefix is named at the section
When an end-to-end spec looks for the table, the row and the cell of that section
Then it finds them by the anchors put together from that prefix, and at the neighbouring section it
does not find the same anchors

### SC-MB-133 — a section with a filter of its own puts it into the slot of the toolbar

Given the section has a filter of its own
When the owner opens the section
Then the filter stands in the left part of the toolbar above the table, and it is not passed by an
entry of the page

### SC-MB-134 — a section without a filter of its own occupies no slot

Given the section has no filter of its own
When the owner opens the section
Then the left part of the toolbar is not occupied at all, and no empty place is there in the place of
the filter

### SC-MB-163 — there are more records than fit into the window, and all of them are reachable

Given there are more records in the section than fit into the window
When a person opened the section and scrolled the page down
Then the last row of the list is there

### SC-MB-164 — the switch of the pages is reachable at a long list

Given there are more records in the section than fit into the window
When a person scrolled the page down to the end
Then the switch of the pages is there whole

### SC-MB-165 — a section without a hint leaves no place under it

Given the section has no hint
When a person opened the section
Then the toolbar stands right under the name, and there is no empty strip between them

### SC-MB-166 — the hint stands under the name, not next to it

Given the section has a hint
When a person opened the section
Then the hint takes a line of its own under the name
