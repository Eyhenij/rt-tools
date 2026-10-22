# Scenarios — the block of a service

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers do not
change after the merge. What a scenario is covered by is said under it.

### SC-UKV-904 — the block draws the mark of the size md, the name and the description

Given one image mark, the name «Card payments» and the description «Accepts cards»
When the block is drawn
Then the mark of the size `md` stands first, the name and the description follow it in that order

Covered by the component spec of the part and the frame of the content.

### SC-UKV-905 — several marks reach the mark in the given order

Given three marks, the last one a kit icon
When the block is drawn
Then the mark draws three plates in the given order, the icon plate on top

Covered by the component spec of the part and the frame of the content.

### SC-UKV-906 — an empty description draws no line of description

Given a name and an empty description
When the block is drawn
Then the block holds the mark and the name and no line of description

Covered by the component spec of the part and the frame of the content.

### SC-UKV-907 — on a narrow place the description wraps

Given a description longer than the place left to it
When the block is drawn in a narrow place
Then the description goes onto further lines, and the mark keeps its size

Не покрыто: the spec environment applies no component styles, and wrapping is a matter of layout.
The promise is held by the frame of the widths.
