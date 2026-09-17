# Scenarios — the tag of the second kit

The identifier goes at the start of the test title, followed by a dash. The prefix is shared across
the domain of the second kit.

## The label and the markup

### SC-UKV-181 — the tag draws the label it was given

Given a tag with a label
When it is drawn
Then the label stands inside the pill

Covered: `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.spec.ts`.

### SC-UKV-182 — the class of the block hangs both on the element and on the pill

Given a tag
When it is drawn
Then the class of the block stands on the element itself and on the root of its template

Covered: `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.spec.ts`.

## The palette

### SC-UKV-183 — a tag without a named palette is the neutral one

Given a tag without an input of the palette
When it is drawn
Then it carries the neutral palette, and the attribute of the markup says the same

Covered: `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.spec.ts`.

### SC-UKV-184 — a change of the palette takes the former modifier off

Given a tag with a named palette
When the palette is changed to another one
Then only the modifier of the new palette stays, and the attribute of the markup follows it

Covered: `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.spec.ts`.

## The shape, the appearance and the rounding

### SC-UKV-185 — a tag without inputs is a fully rounded filled pill

Given a tag without inputs of the shape and of the appearance
When it is drawn
Then it is fully rounded and filled

Covered: `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.spec.ts`.

### SC-UKV-186 — without an input there is no modifier of the rounding: it comes from the shape

Given a tag without an input of the rounding
When it is drawn
Then no modifier of the rounding is put out at all, and the rounding comes from the shape

Covered: `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.spec.ts`.

## The icons

### SC-UKV-187 — a tag without inputs of the icons has none

Given a tag without inputs of the icons
When it is drawn
Then there is no icon in it

Covered: `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.spec.ts`.

### SC-UKV-188 — an icon stands on either side of the label, and both sides live together

Given a tag with an icon before the label, with one after it, and with both at once
When it is drawn
Then every icon stands on its own side, and two of them do not push one another out

Covered: `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.spec.ts`.

## The cross

### SC-UKV-189 — a tag without the input of the cross has none

Given a tag without the input of the cross
When it is drawn
Then there is no cross in it

Covered: `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.spec.ts`.

### SC-UKV-190 — the cross appears by the input and marks the pill

Given a tag with the input of the cross
When it is drawn
Then the cross stands at the right edge, and the pill carries the modifier of it

Covered: `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.spec.ts`.

### SC-UKV-191 — a press of the cross goes outward with the press itself

Given a tag with the cross
When the cross is pressed
Then the event goes outward once and carries the press itself

Covered: `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.spec.ts`.

### SC-UKV-192 — a press of the cross does not travel up

Given a tag with the cross inside a node listening for a press
When the cross is pressed
Then the node outside does not get that press: a whole pill is often clickable itself

Covered: `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.spec.ts`.

### SC-UKV-193 — the cross is labelled by a word, not by a key

Given a tag with the cross and the dictionary of the kit
When the cross is drawn
Then its label for the reader is the translated word rather than the key of the dictionary

Covered: `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.spec.ts`.

## The size

### SC-UKV-194 — a tag without the input of the size takes the middle step

Given a tag without the input of the size
When it is drawn
Then it stands at the middle step: the look it had before the steps appeared does not move

Covered: `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.spec.ts`.

### SC-UKV-195 — every step puts out its own modifier and takes the former one off

Given a tag
When the step is changed to each of the three in turn
Then only the modifier of the current step stands on the pill

Covered: `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.spec.ts`.

### SC-UKV-196 — the icon goes by the step of the pill and has no input of its own

Given a tag with an icon
When the step is changed to each of the three in turn
Then the icon takes the step of the kit of icons that answers to the step of the pill

Covered: `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.spec.ts`.
