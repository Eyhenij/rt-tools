# What it is carried out by — the stepper bar

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree, and the scenario it is checked by.

- **The bar draws any number of steps and any current step.** — `projects/ui-kit-v2/src/lib/components/stepper/rt-stepper.component.ts:points`; scenario `SC-UKV-1229`
- **The bar is as wide as the place it stands in.** — `projects/ui-kit-v2/src/lib/components/stepper/rt-stepper.component.scss:__track-band`; checked by the showcase story of widths
- **The line runs from the centre of the first point to the centre of the last.** — `projects/ui-kit-v2/src/lib/components/stepper/rt-stepper.component.scss:__line`; checked by the showcase story of widths
- **The label of the first step starts at the left edge, the label of the last ends at the right.** — `projects/ui-kit-v2/src/lib/components/stepper/rt-stepper.logic.ts:labelSegment`; scenarios `SC-UKV-1230`, `SC-UKV-1231`
- **The label of a middle step is centred on the share of its step and never goes past the bar.** — `projects/ui-kit-v2/src/lib/components/stepper/rt-stepper.logic.ts:labelSegment`; scenario `SC-UKV-1232`
- **A middle step near an edge takes the whole bar, pressed to that edge.** — `projects/ui-kit-v2/src/lib/components/stepper/rt-stepper.logic.ts:HALF_BAR`; scenario `SC-UKV-1234`
- **A label wider than its segment wraps, and the bar grows down.** — `projects/ui-kit-v2/src/lib/components/stepper/rt-stepper.component.scss:__rail`; checked by the showcase story of long labels
- **The current point follows the same number as the label and the fill.** — `projects/ui-kit-v2/src/lib/components/stepper/rt-stepper.component.ts:points`; scenario `SC-UKV-1233`
- **The application insets the points from the edges.** — `projects/ui-kit-v2/src/lib/components/stepper/rt-stepper.component.scss:rt-stepper-inset`; checked by the showcase story of widths
- **The halo of the current point is never cut by the bar.** — `projects/ui-kit-v2/src/lib/components/stepper/rt-stepper.component.scss:rt-stepper-inset`; checked by the showcase story of widths
- **The label line is 18 px high, as on the mockup.** — `projects/ui-kit-v2/src/lib/components/stepper/rt-stepper.component.scss:leading-normal`; checked by the match with the mockup
- **Every colour of the stepper is a property of its host, and the application overrides it.** — `projects/ui-kit-v2/src/lib/components/stepper/rt-stepper.component.scss:rt-stepper-track-color`; checked by the showcase story of colours
