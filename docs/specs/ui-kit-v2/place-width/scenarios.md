# Scenarios — the width of the page place

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
as the next free ones in the domain.

### SC-UKV-876 — a narrow place gives the narrow look in a wide window

Given a page place 900 wide in a window 1440 wide
When a kit component asks whether the look is narrow
Then the answer is yes, and it changes when the place changes its width

### SC-UKV-877 — the page container declares the place and releases it

Given a page container
When it is drawn and then removed
Then it declares its node the page place, and releases it on removal

### SC-UKV-878 — without a place the look follows the window

Given no page place, or a browser without a size observer
When a kit component asks whether the look is narrow
Then the answer follows the window

### SC-UKV-879 — a released place gives the answer back to the window

Given a narrow page place in a wide window
When the place is released
Then the look is wide again

### SC-UKV-880 — an overlay follows the window over a narrow place

Given a narrow page place in a wide window
When an overlay asks whether the window is narrow
Then the answer is no, and it follows the window when the window narrows

### SC-UKV-881 — kit styles inside a narrow place take the narrow look

Given a page container 896 wide with a filter in its toolbar, in a window 1440 wide
When it is drawn
Then the filter stands as a list, as on a narrow screen

Not covered: a test has no layout — the look is seen by the showcase frame of the container place.
