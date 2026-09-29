# Scenarios — the accordion

The numbers continue the numbering of the second kit and do not change after the merge.

### SC-UKV-394 — the accordion draws a heading and a text for every item

Given the accordion is given three items
When it is drawn
Then three toggles stand in the order of the items, each with its heading, and three panels hold
their texts

Covered: `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.spec.ts`.

### SC-UKV-395 — on the entry the first item is open

Given the accordion is given items and no entry position
When it is drawn
Then the first item is open and the rest are closed

Covered: `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.spec.ts`.

### SC-UKV-396 — the entry position opens the item it names

Given the accordion is given the entry position 2
When it is drawn
Then only the third item is open

Covered: `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.spec.ts`.

### SC-UKV-397 — an entry position outside the list opens nothing

Given the accordion is given the entry position `null`, a negative one or one past the list
When it is drawn
Then every item is closed

Covered: `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.logic.spec.ts`.

### SC-UKV-398 — a press opens a closed item and leaves the others as they were

Given the first item is open and the third is closed
When the toggle of the third is pressed
Then both the first and the third are open

Covered: `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.spec.ts`.

### SC-UKV-399 — a press closes an open item

Given the first item is open
When its toggle is pressed
Then the first item is closed

Covered: `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.spec.ts`.

### SC-UKV-400 — new items start the opening anew

Given the first item was closed and the third opened by presses
When the accordion is given a new list
Then the item of the entry position is open again, and no other

Covered: `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.spec.ts`.

### SC-UKV-401 — the toggle names the state and the panel it controls

Given an accordion with an open and a closed item
When it is drawn
Then each toggle carries `aria-expanded` by the state of its item and `aria-controls` with the id
of its panel. Each panel is a region labelled by its toggle

Covered: `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.spec.ts`.

### SC-UKV-402 — the panel of a closed item is hidden

Given an accordion with a closed item and an open one
When it is drawn
Then the panel of the closed item is hidden, and the panel of the open item is not

Covered: `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.spec.ts`.

### SC-UKV-403 — two accordions on one page link toggles to their own panels

Given two accordions on one page
When they are drawn
Then no id of a toggle or a panel repeats. Every `aria-controls` names a panel of its own
accordion

Covered: `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.spec.ts`.

### SC-UKV-404 — the class of the block hangs on the element

Given an accordion
When it is drawn
Then the element carries the class `rt-accordion`, and an open item carries the modifier `open`

Covered: `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.spec.ts`.

### SC-UKV-405 — an empty list draws nothing

Given the accordion is given an empty list
When it is drawn
Then there is neither a toggle nor a panel

Covered: `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.spec.ts`.
