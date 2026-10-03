# What it is carried out by — the modes of a spinner

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The overlay fills the positioned parent and stands the ring in its centre.** — `projects/ui-kit-v2/src/lib/components/spinner/rt-spinner.component.ts:overlay` — the overlay modifier on the host, the layer from the property `--rt-spinner-overlay-z`; scenario `SC-UKV-561`
- **The plate draws a round surface under the ring.** — `projects/ui-kit-v2/src/lib/components/spinner/rt-spinner.component.ts:plate` — the plate element around the ring; scenario `SC-UKV-563`
- **The backdrop draws a translucent ground, and only together with the overlay.** — `projects/ui-kit-v2/src/lib/components/spinner/rt-spinner.component.ts:modifiers` — the backdrop modifier is set only beside the overlay; scenario `SC-UKV-562`
- **The arc draws the ring as an arc without a track, in the same colour and diameter.** — `projects/ui-kit-v2/src/lib/components/spinner/rt-spinner.component.ts:appearance` — the arc element in place of the ring; scenario `SC-UKV-564`
- **Without the new inputs the spinner keeps its markup and draws as before.** — `projects/ui-kit-v2/src/lib/components/spinner/rt-spinner.component.ts:framed` — the inner markup is drawn only in a new mode; scenario `SC-UKV-560`
