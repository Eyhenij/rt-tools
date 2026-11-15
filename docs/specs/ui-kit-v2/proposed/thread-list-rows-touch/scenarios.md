# Scenarios — the conversation list rows on a narrow touch screen

The numbers continue the numbering of the kit and do not change after the merge. Until a scenario is
covered, it carries the mark «Not covered» with the reason.

### SC-UKV-1308 — without hover a row has no hover tint

Given the conversation list is drawn on a screen without hover
When a row is touched
Then its background stays the resting one

Not covered: no code yet.

### SC-UKV-1309 — with a mouse a hovered row gets the hover tint

Given the conversation list is drawn on a screen with hover
When the pointer stands over a row
Then the row background is the subtle one

Not covered: no code yet.

### SC-UKV-1310 — the selected row keeps its background under the pointer

Given a row is selected
When the pointer stands over it or it is touched
Then its background stays the selected one

Not covered: no code yet.

### SC-UKV-1311 — on a narrow place the row shadow of the messenger look blurs by 10

Given the conversation list in the messenger look on a place of 768 or narrower
When a row with a sign is drawn
Then the sign shadow blurs by 10 and fits the row inset; wider the shadow is the sign's own

Not covered: no code yet.
