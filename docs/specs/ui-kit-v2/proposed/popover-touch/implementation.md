# What it is carried out by — a hover popover under a touch

The rule of the subdomain is on the left, the place where it is carried out is on the right. The
paths are given from the root of the tree.

- **A hover popover follows the hover of a mouse only.** — `projects/ui-kit-v2/src/lib/components/popover/rt-popover.directive.ts:onHostPointerEnter`
- **A press on the host of a hover popover opens the panel.** — `projects/ui-kit-v2/src/lib/components/popover/rt-popover.directive.ts:onHostClick`
- **A tap on the backdrop of a hover popover closes the panel and leaves no backdrop.** — `projects/ui-kit-v2/src/lib/components/popover/rt-popover.directive.ts:backdropClick`

The scenarios of the subdomain are bound to the tests by the number in the title of a test, not by a
table here: the bond is checked both ways by the checking of the specs.
