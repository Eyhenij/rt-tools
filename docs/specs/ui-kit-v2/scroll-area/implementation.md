# What it is carried out by — the scroll area and the sign of what is left below

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **A part whose template is not declared is not drawn.** — `projects/ui-kit-v2/src/lib/components/scroll-area/rt-scroll-area.component.ts:headerTpl` — each part stands in the template under a condition by its own content signal; scenarios `SC-UKV-148`, `SC-UKV-149`
- **The body scrolls, the header and the footer stay.** — `projects/ui-kit-v2/src/lib/components/scroll-area/rt-scroll-area.component.scss:__body` — the overflow stands on the body alone, and the host is a column the header and the footer keep their place in; scenario `SC-UKV-149`
- **The sign appears before the first movement of a hand.** — `projects/ui-kit-v2/src/lib/components/scroll-area/rt-scroll-area.component.ts:#sizeWatch` — a size observer watches the body and the footer, and the count runs at the first paint too; scenario `SC-UKV-150`
- **The sign is switched off by default and is asked for by an input.** — `projects/ui-kit-v2/src/lib/components/scroll-area/rt-scroll-area.component.ts:isScrollHintShown` — the input stands at `false`; scenario `SC-UKV-151`
- **The sign goes away when the body is scrolled to the bottom, with a whole point of slack.** — `projects/ui-kit-v2/src/lib/components/scroll-area/rt-scroll-area.component.ts:hasMoreBelow` — the three numbers of the node are compared with a slack of one point; scenario `SC-UKV-152`
- **The strip reaches the content of the footer, not the edge of the body.** — `projects/ui-kit-v2/src/lib/components/scroll-area/rt-scroll-area.component.ts:hintBottom` — the lift is measured as the footer's height without its top padding, and without a footer it is zero; scenario `SC-UKV-153`
- **A press on the icon carries the body to the very bottom and does not reach the content under it.** — `projects/ui-kit-v2/src/lib/components/scroll-area/rt-scroll-area.component.ts:onScrollHintClick` — the body is scrolled to its full height, and the event is stopped there; scenario `SC-UKV-154`
- **The strip does not catch the pointer and the icon does.** — `projects/ui-kit-v2/src/lib/components/scroll-area/rt-scroll-area.component.scss:__scroll-hint` — the strip is taken out of pointer events and the icon is put back into them; scenario `SC-UKV-155`
- **The label of the icon comes from the label set of the kit.** — `projects/ui-kit-v2/src/lib/components/scroll-area/rt-scroll-area.component.ts:t` — the label is read from the kit's set by the same signal as in the neighbouring families; scenario `SC-UKV-156`
