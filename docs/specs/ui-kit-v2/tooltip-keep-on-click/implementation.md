# What it is carried out by — the tooltip that stays on a click

The rule of the subdomain is on the left, the place where it is carried out is on the right. The
paths are given from the root of the tree.

- **By default a click hides the tooltip, as before.** — `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.ts:hideOnClick`
- **With `rtTooltipHideOnClick` false a click leaves an open tooltip open.** — `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.ts:onClick`
- **A click clears a pending showing whatever the input.** — `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.ts:onClick`
- **A new text reaches an open tooltip in place.** — `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.ts:#syncText`, called by an effect in the constructor
- **A text that becomes empty while the tooltip is open hides it.** — `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.ts:#syncText`
- **`rt-icon-button` passes the input through as `tooltipHideOnClick`.** — `projects/ui-kit-v2/src/lib/components/icon-button/rt-icon-button.component.ts:tooltipHideOnClick`
- **With `rtTooltipShowOnTap` a tap opens the tooltip at once.** — `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.ts:#toggleNow`
- **A second tap on the host or a tap outside it closes a tooltip opened by a tap.** — `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.ts:#toggleNow`, `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.ts:#isOnHost`
- **`rt-usage-ring` sets `rtTooltipShowOnTap` on its ring.** — `projects/ui-kit-v2/src/lib/components/usage-ring/rt-usage-ring.component.html:rtTooltipShowOnTap`

The scenarios of the subdomain are bound to the tests by the number in the title of a test, not by a
table here: the bond is checked both ways by the checking of the specs.
