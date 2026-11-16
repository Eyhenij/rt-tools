# Scenarios — the right group of the page header

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
as the next free ones in the domain.

### SC-UKV-1304 — the slot buttons and the profile stand in one group

Given a header with two buttons in the slot and a user
When it is drawn
Then both buttons and the profile button stand in one group in the order of the markup, the profile
last

Coverage: partial — the place at the right edge and the gap of 8 are seen by the showcase frames
of the right group at 1440, 1080, 768 and 375; a test has no layout.

### SC-UKV-1305 — the profile is named and has the icon for the narrow header

Given a header with a user
When it is drawn
Then the profile button carries the user's name as its caption and holds the `user` icon hidden
from the screen reader

Coverage: partial — which form shows on which side of 768 is seen by the showcase frames; a test
has no layout.

### SC-UKV-1306 — the bell draws the given icon

Given the bell with the `icon` input
When it is drawn with `sparkle` and with an empty value
Then the first draws the `sparkle` icon and the second keeps the bell

### SC-UKV-1307 — the reply field of a chat with fill stays in the column

Given a chat with `fill` in a workspace with cards under the strip «back / details», with forty
messages
When it is drawn at 375, 480, 768 and 769
Then the bottom of the reply field is not below the bottom of the column

Not covered: a test has no layout — the showcase frames of the chat with fill show it at every width.
