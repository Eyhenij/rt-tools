# The media of a card — scenarios

The prefix of the kit is `SC-UKV`; the numbers continue `docs/specs/ui-kit-v2/scenarios.md` and do
not change after the merge.

### SC-UKV-868 — the media stands above the title

Given a card with a header and content in the slot `[rtCardMedia]`
When the card is drawn
Then the media comes before the title inside the card

Not covered: the slot is not written yet

### SC-UKV-869 — an empty media slot takes no room

Given a card with a header and nothing in the slot `[rtCardMedia]`
When the card is drawn
Then the media box is not shown and the title is the first thing in the card

Not covered: the slot is not written yet
