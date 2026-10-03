# Scenarios — the modes of a spinner

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
as the next free ones in the domain and do not change after the merge into the spec: the titles of the
tests refer to them.

What a scenario is covered by is said under it. Where the run does not cover a scenario, that is said
openly.

### SC-UKV-560 — without the new inputs the host draws the ring

Given a spinner without the overlay, the plate and the arc
When it is drawn
Then it has no markup of its own, and the ring is drawn by its host as before

Covered: `projects/ui-kit-v2/src/lib/components/spinner/rt-spinner.component.spec.ts`.

### SC-UKV-561 — the overlay fills the parent and draws the ring inside

Given a spinner with the overlay
When it is drawn
Then its host carries the overlay modifier, and the ring is an inner element

Covered: `projects/ui-kit-v2/src/lib/components/spinner/rt-spinner.component.spec.ts`. That the host
really fills a positioned parent is a style rule; the snapshot of the overlay story shows it.

### SC-UKV-562 — the backdrop draws only together with the overlay

Given a spinner with the backdrop
When it has no overlay
Then no backdrop is drawn; with the overlay the backdrop modifier stands on the host

Covered: `projects/ui-kit-v2/src/lib/components/spinner/rt-spinner.component.spec.ts`.

### SC-UKV-563 — the plate puts the ring on a round surface

Given a spinner with the plate
When it is drawn
Then the ring stands inside the plate element

Covered: `projects/ui-kit-v2/src/lib/components/spinner/rt-spinner.component.spec.ts`.

### SC-UKV-564 — the arc draws an arc without a track

Given a spinner with the arc look
When it is drawn
Then an arc stands in place of the ring, and no ring element is drawn

Covered: `projects/ui-kit-v2/src/lib/components/spinner/rt-spinner.component.spec.ts`.
