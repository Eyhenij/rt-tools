# What it is carried out by — the text colour on a background

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree, and the scenario it is checked by.

- **The text colour on a dark background is white.** — `projects/utils/src/lib/functions/color-on-background/color-on-background.ts:getColorBasedOnBackground` — scenario `SC-UT-1`
- **The text colour on a light background is that background darkened by half.** — `projects/utils/src/lib/functions/color-on-background/color-on-background.ts:LIGHT_LUMINANCE` — scenario `SC-UT-2`
- **A short colour and a colour without `#` are read as their full form.** — `projects/utils/src/lib/functions/color-on-background/color-on-background.ts:parseHexColor` — scenario `SC-UT-3`
- **A value that is not a hex colour gives white text and comes back undarkened.** — `projects/utils/src/lib/functions/color-on-background/color-on-background.ts:darkenHexColor` — scenario `SC-UT-4`
- **On a six-digit colour with `#` both functions answer as the first kit's.** — `projects/utils/src/lib/functions/color-on-background/color-on-background.ts:channelToLinear` — scenario `SC-UT-5`
