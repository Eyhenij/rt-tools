# Scenarios — the scroll area and the sign of what is left below

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-148 — only the declared parts are drawn

Given a scroll area inside which the template of the body alone is declared
When it is drawn
Then neither the header nor the footer is in the markup, and the body is

Covered by the component spec of the area.

### SC-UKV-149 — the three parts stand from top to bottom

Given a scroll area with the templates of the header, the body and the footer declared
When it is drawn
Then all three are in the markup in that order, and the content of each reaches its own part

Covered by the component spec of the area.

### SC-UKV-150 — the sign stands without a single movement of a hand

Given a scroll area asked for the sign, whose content does not fit the body at the first paint
When it is drawn and nobody has scrolled
Then the strip with the icon is in the markup

Covered by the component spec of the area.

### SC-UKV-151 — without the input the sign does not appear

Given a scroll area not asked for the sign, whose content does not fit the body
When it is drawn
Then the strip is not in the markup

Covered by the component spec of the area.

### SC-UKV-152 — the sign goes away at the bottom and stands in the middle

Given a scroll area asked for the sign, whose content does not fit the body
When the body is scrolled to the very bottom
Then the strip is not in the markup; and when it is scrolled back to the middle, the strip is

Covered by the component spec of the area.

### SC-UKV-153 — the strip is lifted by the height of the footer

Given a scroll area with a footer whose height is known and whose top padding is known
When the strip is drawn
Then it is lifted above the lower edge of the area by the height of the footer without that padding;
and in an area without a footer the lift is zero

Covered by the component spec of the area.

### SC-UKV-154 — a press on the icon carries the body to the bottom and goes no further

Given a scroll area asked for the sign, whose content does not fit the body
When the icon is pressed
Then the body is scrolled to its full height, and the press does not reach the content under the
icon

Covered by the component spec of the area.

### SC-UKV-155 — the strip lets the pointer through and the icon does not

Given a scroll area with the strip drawn
When the computed styles of the strip and of the icon are read
Then the strip does not catch the pointer and the icon does

Covered by the component spec of the area.

### SC-UKV-156 — the label of the icon comes from the label set

Given a scroll area with the strip drawn
When the label of the icon is read
Then it is the label of the kit's set, not a string written into the class

Covered by the component spec of the area.
