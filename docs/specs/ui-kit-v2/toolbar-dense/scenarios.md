# Scenarios — the long title of a dense toolbar

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers go through:
the titles of the tests refer to them.

### SC-UKV-727 — the long title of a dense toolbar wraps inside the column

Given a dense toolbar in a column 240 points wide, with a title on the left and a button on the right
When the title is longer than the place left to it
Then the title wraps by words, nothing of it stands past the right edge, and the button keeps its width

Not covered: a test has no layout at all. The wrapping is seen by the showcase snapshots
`projects/ui-kit-v2/.storybook/__snapshots__/organisms-table-toolbar--dense-title.png` and
`projects/ui-kit-v2/.storybook/__snapshots__/organisms-table-toolbar--dense-title--w768.png`.
