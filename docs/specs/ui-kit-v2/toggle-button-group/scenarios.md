# Scenarios — the segmented switch

### SC-UKV-87 — a press in the multiple choice adds a segment

Given the group is declared multiple, and one segment is chosen
When a person presses the neighbouring one
Then a set of both goes away outward, and both segments are highlighted

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group.component.spec.ts`.

### SC-UKV-88 — a repeated press in the multiple choice takes a segment off

Given the group is declared multiple, and two segments are chosen
When a person presses a chosen one
Then a set without it goes away outward

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group.component.spec.ts`.

### SC-UKV-89 — an unavailable segment is visible and lets no press through

Given the unavailability is declared at one segment
When a person presses it
Then the segment is in place, and nothing goes away outward

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group.component.spec.ts`.

### SC-UKV-90 — a switched-off group makes all the segments unavailable

Given the group is switched off, and no unavailability is declared at the segments
When a person presses any of them
Then all the segments are unavailable, and nothing goes away outward

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group.component.spec.ts`.
