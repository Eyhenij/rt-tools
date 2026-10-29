# What it is carried out by — the backdrop of the popover

The rule of the subdomain is on the left, the place where it is carried out is on the right. The
paths are given from the root of the tree.

- **A popover without a backdrop class leaves the page next to the panel open.** — `projects/ui-kit-v2/src/lib/components/popover/rt-popover.directive.ts:backdropClass`
- **A backdrop class puts a backdrop under the panel, and a press on it closes the panel.** — `projects/ui-kit-v2/src/lib/components/popover/rt-popover.directive.ts:backdropClick`
- **The mobile menu of the page header stands on a dimmed backdrop.** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.html:rt-page-header-mobile-backdrop`, the colour — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header-mobile.scss:rt-page-header-mobile-backdrop`

The scenarios of the subdomain are bound to the tests by the number in the title of a test, not by a
table here: the bond is checked both ways by the checking of the specs.
