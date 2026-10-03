# Scenarios — the size and background of the icon button from its tag

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
as the next free ones in the domain and do not change after the merge into the spec: the titles of the
tests refer to them.

What a scenario is covered by is said under it. Where the run does not cover a scenario, that is said
openly.

### SC-UKV-589 — a size set on the tag reaches the button

Given an icon button of any size with a size property set on its tag
When it is drawn
Then the button takes that size instead of its size step

Not covered: a test has no layout, and this is a style rule. The snapshot of the icon button story
**HostRule** shows it.

### SC-UKV-590 — a background set on the tag reaches the button

Given an icon button of any kind with a background property set on its tag
When it is drawn
Then the button takes that background instead of its kind's

Not covered: a test has no layout, and this is a style rule. The snapshot of the icon button story
**HostRule** shows it.

### SC-UKV-591 — the hover background comes from its own property

Given an icon button with a hover background property set by the application
When the pointer is over it
Then the button takes that background, and without the property its kind's hover background

Not covered: the hover state lives under the pointer and outside a test's reach. The story
**HostRule** declares the property, and the showcase shows it under the pointer.

### SC-UKV-592 — the smallest sizes draw a 16 pixel icon

Given an icon button of size xs or 2xs
When it is drawn
Then the button is 22 or 20 pixels and its icon is 16 pixels

### SC-UKV-593 — without the new properties the button and the header stay as before

Given icon buttons without the new properties and sizes, and the header
When they are drawn
Then they look as before, and the header sets no size of its own on its buttons

Coverage: partial — the test checks that the header sets no size on its buttons, not the look. The
look is checked by the run of the snapshots: the former frames of the icon button and the header
match without a re-take.
