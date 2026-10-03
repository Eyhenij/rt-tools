# Scenarios — the properties of the scroll area and the action bar

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
as the next free ones in the domain and do not change after the merge into the spec: the titles of the
tests refer to them.

What a scenario is covered by is said under it. Where the run does not cover a scenario, that is said
openly.

### SC-UKV-575 — the scroll area takes its paddings and backgrounds from properties

Given a scroll area with padding and background properties set by the application
When it is drawn
Then its header, body and footer take the application's paddings and backgrounds

Not covered: a test has no layout, and this is a style rule. The snapshot of the scroll area story
**Properties** shows it.

### SC-UKV-576 — the action bar takes its colours, paddings and font from properties

Given an action bar with its properties set by the application
When it is drawn
Then its background, text, paddings, gaps, font size and weights are the application's, and the
close icon follows its text colour

Not covered: a test has no layout, and this is a style rule. The snapshot of the action bar story
**Properties** shows it.

### SC-UKV-577 — the open menu is rounded and has a shadow

Given an action bar with an action that holds a list
When the action is pressed and the menu opens
Then the menu is rounded and casts a shadow, though it lives in an overlay outside the bar

Not covered: a test has no layout, and the overlay styles are seen only in a frame. The snapshot of
the action bar story **Menu** shows it.

### SC-UKV-578 — without the new properties the look stays

Given a scroll area and an action bar without the new properties
When they are drawn
Then they look as before

Not covered: this is a promise about frames. The former snapshots of both families match without a
re-take.
