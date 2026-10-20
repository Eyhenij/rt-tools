# Scenarios — the logo of a service

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers do not
change after the merge. What a scenario is covered by is said under it.

### SC-UKV-864 — one mark of each size draws the plate and the mark of the atom

Given one image mark
When it is drawn at the size `sm`, `md` or `lg`
Then the plate is 40, 64 or 96 across and the mark box is 20, 32 or 48 high

Covered by the component spec of the part and the frame of the sizes.

### SC-UKV-865 — several marks overlap by the step, the later one on top

Given three image marks at the size `md`
When they are drawn
Then every plate after the first is shifted by the step 40, the later plate lies above the earlier
one, and the row is 64 + 40 × 2 wide

Covered by the component spec of the part and the frame of the counts.

### SC-UKV-866 — an icon mark draws the kit icon in the same plate

Given a mark given by a kit icon name
When it is drawn
Then the plate holds the kit icon at the height of the mark and no image

Covered by the component spec of the part and the frame of the icon.

### SC-UKV-867 — each mark carries its label for a screen reader

Given two marks with the labels «Card network» and «Bank transfer», one an image and one an icon
When they are drawn
Then each plate is announced as an image named by its label, in the given order

Covered by the component spec of the part.
