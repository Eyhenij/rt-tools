# Scenarios — the media of a card

The prefix `SC-UKV` is shared across the domain together with the subdomains.
The numbers do not change after the merge. What covers a scenario is said under it.

### SC-UKV-868 — the media stands above the title

Given a card with a header and content in the slot `[rtCardMedia]`
When the card is drawn
Then the media comes before the title inside the card

Covered by the component spec of the card and the frame of the slots.

### SC-UKV-869 — an empty media slot takes no room

Given a card with a header and nothing in the slot `[rtCardMedia]`
When the card is drawn
Then the media box is not shown and the title is the first thing in the card

Covered by the component spec of the card.
