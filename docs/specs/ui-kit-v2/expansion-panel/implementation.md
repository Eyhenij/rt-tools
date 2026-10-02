# What it is carried out by — the expansion panel

The rule of the subdomain is on the left, the place where it is carried out is on the right. The
paths are given from the root of the tree.

- **Everything the owner puts into the panel outside a body mark is the header.** — `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel.component.html:ng-content`
- **The body is given either by a template created on expanding or by a marked node created at once.** — `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel.component.ts:lazyContent`
- **A press on the header expands a collapsed panel and collapses an expanded one, and the owner hears it.** — `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel.component.ts:toggle`
- **A disabled panel does not change on a press.** — `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel.component.ts:disabled`
- **Without the chevron the header is pressed as before.** — `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel.component.ts:hideToggle`
- **The chevron of an expanded panel is turned half a revolution.** — `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel.component.scss:rotate`
- **The body opens and closes with motion of its height.** — `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel.component.scss:interpolate-size`
- **The header names its state and the body it controls to the assistive means.** — `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel.component.html:aria-controls`
- **The id of the header is taken from the owner when given, otherwise it is unique on the page.** — `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel.component.ts:headerDomId`
- **The header and the body carry `qa-dataid`.** — `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel.component.html:qa-dataid`
- **The card look stands on the surface with a shadow; the plain look has no ground, shadow or spaces.** — `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel.component.scss:plain`
- **The sizes of the header and the body are properties of the block that an owner overrides.** — `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel.component.scss:rt-expansion-panel-header-padding-start`
- **The styles of the panel live in the cascade layer of the kit's components.** — `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel.component.scss:layer`

The scenarios of the subdomain are bound to the tests by the number in the title of a test, not by a
table here: the bond is checked both ways by the checking of the specs.
