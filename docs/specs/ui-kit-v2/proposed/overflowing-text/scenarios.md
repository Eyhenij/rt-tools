# Scenarios — text that does not fit its place

The numbers continue the numbering of the domain and do not change when the agreement moves into
it.

## SC-UKV-137 — the name of a file keeps one line and ends with an ellipsis

**Given** a card of a file whose name is longer than the place the card is given
**When** the card is drawn
**Then** the name occupies one line, and its tail is replaced by an ellipsis

Covered by: `projects/ui-kit-v2/src/lib/components/file-card/rt-file-card.component.spec.ts`

## SC-UKV-138 — the card does not grow past the place it is given

**Given** a place narrower than the card's content
**When** the card is drawn in it
**Then** the width of the card is not greater than the width of the place

Covered by: `projects/ui-kit-v2/src/lib/components/file-card/rt-file-card.component.spec.ts`

## SC-UKV-139 — the hint over the area of dropping stays inside the area

**Given** an area of dropping lower than the hint laid out at its full size
**When** a file is dragged over the area
**Then** the hint lies inside the area's own box and is not cut midword

Covered by: `projects/ui-kit-v2/src/lib/components/file-drop/rt-file-drop.component.spec.ts`

## SC-UKV-140 — the hint is drawn in a compact form on a low area

**Given** an area of dropping whose height leaves no room for the hint at its full size
**When** a file is dragged over the area
**Then** the hint is drawn in the compact form rather than at the full one

Covered by: `projects/ui-kit-v2/src/lib/components/file-drop/rt-file-drop.component.spec.ts`

## SC-UKV-141 — a showing named by the hint shows the hint

**Given** the showing of the area of dropping named by the hint
**When** the frame of that showing is taken
**Then** both halves of the pair hold the hint over the content

Covered by: `projects/ui-kit-v2/src/lib/components/file-drop/stories/file-drop-matrix.stories.ts`
