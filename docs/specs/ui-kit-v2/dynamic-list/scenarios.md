# Scenarios — a list of records with its own toolbar

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-165 — the toolbar shows only the actions that were asked for

Given a list of records in which the refresh and the column settings are switched off
When it is drawn
Then neither button is in the markup, and the button that clears the filters stands in its place

Covered by the component spec of the dynamic list family.

### SC-UKV-166 — the clearing of filters is switched off while nothing is set

Given a list of records with filters shown and none of them set
When it is drawn
Then the button that clears the filters is in the markup and is switched off

Covered by the component spec of the dynamic list family.

### SC-UKV-167 — the search says it changed after the value settles

Given a list of records with the search field
When three characters are typed one after another without a pause
Then the family says the search changed once, with the whole value

Covered by the component spec of the dynamic list family.

### SC-UKV-168 — an empty section and an empty result under a filter say different things

Given a list of records with no records at all
When it is drawn
Then the empty place of the section is in the markup, without an offer to clear the filter

Covered by the component spec of the dynamic list family.

### SC-UKV-169 — an empty result under a filter offers the way back

Given a list of records with a filter set and nothing found under it
When it is drawn
Then the empty place carries the clearing of the filter

Covered by the component spec of the dynamic list family.

### SC-UKV-170 — one page draws no pages

Given a list of records that fits in one page
When it is drawn
Then the pagination is not in the markup

Covered by the component spec of the dynamic list family.

### SC-UKV-171 — the consumer's markup takes both sides of the toolbar

Given a list of records with the selectors template and the actions template declared
When it is drawn
Then the selectors are on the left of the strip, the actions on the right, and the search field
keeps its place

Covered by the component spec of the dynamic list family.

### SC-UKV-172 — the table is projected as it was given

Given a list of records with a table projected into it
When it is drawn
Then the projected table is inside the family, with its own columns and its own row actions

Covered by the component spec of the dynamic list family.

### SC-UKV-173 — the labels come from the kit's dictionary

Given a list of records with the kit's labels overridden by the consumer
When it is drawn
Then the search placeholder and the action tooltips carry the overridden words

Covered by the component spec of the dynamic list family.

### SC-UKV-174 — the narrow screen puts the selectors above the actions

Given a list of records on a screen narrower than the kit's threshold
When it is drawn
Then the selectors stand above the actions, and the search field takes the whole width

Not covered: узкий вид объявлен запросом в стилях, и описание его не видит вовсе — закрывается
кадром показа на узком окне, пятым этапом задачи RT-2153.
