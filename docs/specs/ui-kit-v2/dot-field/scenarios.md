# Scenarios — the dot field

The numbers continue the numbering of the second kit and do not change after the merge.

### SC-UKV-637 — the field draws a canvas hidden from the assistive means

Given a page puts the field behind its content
When it is drawn
Then the field holds one canvas marked `aria-hidden`

Covered: `projects/ui-kit-v2/src/lib/components/dot-field/rt-dot-field.component.spec.ts`.

### SC-UKV-638 — the clearing holds fewer lit cells than the edge

Given the same noise at one moment
When the density is computed for a cell in the centre and a cell at the edge
Then the centre density is lower

Covered: `projects/ui-kit-v2/src/lib/components/dot-field/rt-dot-field.logic.spec.ts`.

### SC-UKV-639 — the Bayer matrix breaks the threshold per cell

Given one density just above the bare threshold
When it is judged in the 16 cells of one 4x4 block
Then some cells are lit and some are not

Covered: `projects/ui-kit-v2/src/lib/components/dot-field/rt-dot-field.logic.spec.ts`.

### SC-UKV-640 — reduced motion draws one frame and plans no other

Given the person asked for reduced motion
When the field starts
Then one frame is drawn and no animation frame is requested

Covered: `projects/ui-kit-v2/src/lib/components/dot-field/rt-dot-field.painter.spec.ts`.

### SC-UKV-641 — leaving the page stops the animation

Given the field is moving
When it is stopped
Then the requested animation frame is cancelled

Covered: `projects/ui-kit-v2/src/lib/components/dot-field/rt-dot-field.painter.spec.ts`.

### SC-UKV-642 — a canvas without a 2D context draws nothing

Given the canvas gives no 2D context
When the field starts
Then nothing is drawn and no animation frame is requested

Covered: `projects/ui-kit-v2/src/lib/components/dot-field/rt-dot-field.painter.spec.ts`.

### SC-UKV-643 — the dots take the computed colour of the field

Given the field has the CSS colour of the theme
When a frame is drawn
Then the dots are filled with that computed colour

Covered: `projects/ui-kit-v2/src/lib/components/dot-field/rt-dot-field.painter.spec.ts`.
