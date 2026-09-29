# Scenarios — the tooltip of a cut text

The numbers continue the numbering of the second kit and do not change after the merge.

### SC-UKV-458 — in the mode a cut text gets its tooltip

Given a host in the mode whose content is wider than its box
When the pointer comes in and the delay passes
Then the tooltip with the whole text appears

Covered: `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.truncated.spec.ts`.

### SC-UKV-459 — in the mode a whole text gets no tooltip

Given a host in the mode whose content fits its box
When the pointer comes in and the delay passes
Then no tooltip appears

Covered: `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.truncated.spec.ts`.

### SC-UKV-460 — a text that grew after the render is judged at the showing

Given a host in the mode whose text fitted when it was drawn
When its box narrows below the text and the pointer comes in
Then the tooltip appears

Covered: `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.truncated.spec.ts`.

### SC-UKV-461 — without the mode a whole text keeps its tooltip

Given a host without the mode whose content fits its box
When the pointer comes in and the delay passes
Then the tooltip appears as before

Covered: `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.truncated.spec.ts`.
