# What it is carried out by — the tooltip of a cut text

The rule of the subdomain is on the left, the place where it is carried out is on the right. The
paths are given from the root of the tree.

- **The mode is off by default, and without it the tooltip behaves as before.** — `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.ts:whenTruncated`
- **In the mode the tooltip shows only when the host's content is wider than its visible box.** — `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.logic.ts:isTooltipTextCut`, called by `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.ts:#attach`
- **The measurement is taken at the showing, not in advance.** — `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.ts:#attach`
- **An empty text still shows nothing, in the mode as without it.** — `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.ts:show`

The scenarios of the subdomain are bound to the tests by the number in the title of a test, not by a
table here: the bond is checked both ways by the checking of the specs.
