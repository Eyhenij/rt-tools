# Scenarios — the expansion panel

The numbers continue the numbering of the second kit.

### SC-UKV-519 — a collapsed panel draws its header and no body

Given a panel with a title, a body node and a body template
When it is drawn collapsed
Then the header shows the title and the chevron. Neither body is drawn

Covered: `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel.component.spec.ts`.

### SC-UKV-520 — a press expands and collapses the panel, and the owner hears both

Given a collapsed panel bound two ways to the owner
When the header is pressed twice
Then the first press draws the lazy body and the owner holds true. The second removes it and the owner holds false

Covered: `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel.component.spec.ts`.

### SC-UKV-521 — the owner expands and collapses the panel by its own value

Given a collapsed panel bound to the owner
When the owner sets true, then false
Then the body node is drawn, then removed

Covered: `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel.component.spec.ts`.

### SC-UKV-522 — a disabled panel does not expand on a press

Given a disabled collapsed panel
When the header is pressed
Then the header is a disabled button and the owner still holds false

Covered: `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel.component.spec.ts`.

### SC-UKV-523 — without the chevron the header is pressed as before

Given a panel with the chevron hidden
When it is drawn and its header is pressed
Then there is no chevron, and the owner holds true

Covered: `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel.component.spec.ts`.

### SC-UKV-524 — the header names its state and its body

Given a collapsed panel
When it is drawn, then expanded
Then collapsed, the header says so and controls nothing. Expanded, it controls the body, a region labelled by it

Covered: `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel.component.spec.ts`.

### SC-UKV-525 — the header id comes from the owner or is unique

Given two panels on one page
When they are drawn, then the first gets the id folder-7
Then the headers carry different ids of their own. Then the first carries folder-7

Covered: `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel.component.spec.ts`.
