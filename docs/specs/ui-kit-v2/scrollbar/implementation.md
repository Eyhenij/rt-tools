# What it is carried out by — the bar of the scroll

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The place under the bar is taken always, and only the slider becomes visible.** — `projects/ui-kit-v2/src/styles/_scrollbar.scss:webkit-scrollbar`; scenario `SC-UKV-91`
- **The slider is shown at a hovering over the zone, not over the slider itself.** — `projects/ui-kit-v2/src/styles/_scrollbar.scss:hover`; scenario `SC-UKV-92`
- **A focus inside the zone shows the bar on a par with a hovering.** — `projects/ui-kit-v2/src/styles/_scrollbar.scss:focus-within`; scenario `SC-UKV-93`
- **Where there is no hovering, the bar is visible always.** — `projects/ui-kit-v2/src/styles/_scrollbar.scss:hover-none`; scenario `SC-UKV-94`
- **The standard properties of the bar are declared next to the pseudo-elements.** — `projects/ui-kit-v2/src/styles/_scrollbar.scss:scrollbar-color`; scenario `SC-UKV-92`
- **The colour of the slider is taken by the token of a border, not by a value of its own.** — `projects/ui-kit-v2/src/styles/_scrollbar.scss:rt-color-border-default`; scenario `SC-UKV-92`

The scenarios of this subdomain are taken by a measurement on the assembled showcase, not by a spec:
the bar of the scroll is a part of the browser, and in the environment of the specs nothing draws it.
The story of the showcase is `Foundation/Design Tokens/Scrollbar`, the wrapper is
`projects/ui-kit-v2/src/showcase/stories/component/test-scrollbar.component.ts`.
