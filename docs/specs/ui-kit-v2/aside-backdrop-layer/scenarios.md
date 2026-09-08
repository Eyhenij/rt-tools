# Scenarios — the backing of a panel and the layers of the design

The prefix `SC-UKV` is shared across the domain together with the subdomains.

What a scenario is covered by is said under it. Where the run does not cover a scenario, that is said
openly.

### SC-UKV-84 — a closed backing is invisible and catches no presses at a consumer with layers

Given the styles of the kit are taken by layers, and the library of the overlays declared its rules of
the backing outside a layer
When the frame created the overlay of the panel and holds it closed
Then the backing is transparent and catches no presses: its rules of the visibility are declared
outside a layer and do not lose to the non-layered rule of the library

Covered: `projects/ui-kit-v2/src/lib/components/aside/rt-aside-overlay.styles.spec.ts`.

### SC-UKV-85 — a closed panel catches no presses

Given the panel is as wide as the whole screen, and its shift past the edge is not counted out yet
When the user presses on the page
Then the press reaches the page: the rule of the presses of a closed panel is declared outside a layer

Covered: `projects/ui-kit-v2/src/lib/components/aside/rt-aside-overlay.styles.spec.ts`.

### SC-UKV-86 — the design of the backing stays overridable

Given the application declared its own colour and blur of the backing
When the panel is open
Then the backing takes the values of the application: the colour, the blur and the transition are
declared in the layer of the kit

Covered: `projects/ui-kit-v2/src/lib/components/aside/rt-aside-overlay.styles.spec.ts`.
