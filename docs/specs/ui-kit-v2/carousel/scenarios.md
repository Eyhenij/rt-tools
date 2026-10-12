# Scenarios — the card stack

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
as the next free ones in the domain and do not change after the merge into the spec.

### SC-UKV-825 — the stack draws its cards in order, and an empty one draws none

Given a stack with three cards and a stack with no cards
When they are drawn
Then the first shows three cards with their labels in the given order, each after the first
overlapping its left neighbour, and the second shows no card

### SC-UKV-826 — a card takes its colour, and a card without one keeps the kit ground

Given cards coloured `#1E88E5` and `#fc0`, one without a colour and one coloured `red`
When the stack is drawn
Then the first two are filled with `#1e88e5` and `#ffcc00`, and the last two keep the kit ground and
the kit text colour

### SC-UKV-827 — the label tone follows the brightness of the colour

Given cards coloured `#ffffff`, `#ffcc00`, `#1e88e5` and `#000000`
When the stack is drawn
Then the labels of the first two are dark and of the last two light

### SC-UKV-828 — the pointer and the focus open a card

Given a stack of three cards with long labels
When the second card is under the pointer, and then when it is focused by Tab
Then it rises, shows its whole label above its neighbours, and the third card moves aside; every
card is in the Tab order

Coverage: partial — the Tab order and the roles are checked by a call; the lift, the growth to the
label and the move of the neighbours are drawn by the styles and shown by the States story frame.

### SC-UKV-846 — an open card does not stretch the host

Given a stack of twelve cards in a cell sized by its content
When a card is under the pointer
Then the card grows over its neighbours, and the host keeps the width of the closed stack

Coverage: partial — the card count on the host is checked by a call; the width is computed by the
styles and was measured on :6007, 416 points with and without an open card.

### SC-UKV-829 — the properties draw the kit look and the material look

Given a stack in the kit look and a stack under the material preset
When they are drawn
Then the kit stack has rounded cards with a small shadow and a medium label, the material stack has
cards with small corners, a large shadow and a regular label in title case, and an application
property set on the block overrides both

Not covered: it cannot be closed by a test with an identifier — the look is computed by the styles,
which the spec environment does not apply; both looks are shown by the Presets and Themes story
frames.

### SC-UKV-849 — the labelCase input gives the application's title case

Given a stack with the labels "AI tools" and "USER management"
When it is drawn with the title case and without it
Then with it the labels read "Ai Tools" and "User Management", and without it they stay as given

Coverage: partial — the case is checked by a call; the material half of the Permissions story frame
shows the labels in the application's case.
