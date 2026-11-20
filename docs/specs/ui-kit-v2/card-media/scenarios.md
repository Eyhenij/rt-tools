# Scenarios — the media of a card

The prefix `SC-UKV` is shared across the domain together with the subdomains.
The numbers do not change after the merge. What covers a scenario is said under it.

### SC-UKV-868 — the media stands above the title

Given a card with a header and content in the slot `[rtCardMedia]`
When the card is drawn
Then the media comes before the title inside the card

Covered by the component spec of the card.

### SC-UKV-869 — an empty media slot takes no room

Given a card with a header and nothing in the slot `[rtCardMedia]`
When the card is drawn
Then the media box is not shown and the title is the first thing in the card

Covered by the component spec of the card.

### SC-UKV-1382 — the header end stands at the right edge of the media row

Given a card with media in `[rtCardMedia]` and a tag in `[rtCardHeaderEnd]`
When the card is drawn
Then the tag stands in the same row as the media, after it, at the right edge

Covered by the component spec of the card, which checks the order in the row. The right edge and the centring are measured in the showcase story `Catalog`.

### SC-UKV-1383 — a card without media and header end keeps no media row

Given a card with neither `[rtCardMedia]` nor `[rtCardHeaderEnd]`
When the card is drawn
Then the media box is empty and takes no room

Covered by the component spec of the card.

### SC-UKV-1384 — the outline is switched on by the input

Given a card with the input `bordered` off and another with it on
When both are drawn
Then only the second carries the outline modifier and a one pixel border of the default colour

Covered by the component spec of the card, which checks the modifier. The line itself is measured in the showcase story `Catalog`.
