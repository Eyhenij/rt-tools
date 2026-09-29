# What it is carried out by — the accordion

The rule of the subdomain is on the left, the place where it is carried out is on the right. The
paths are given from the root of the tree.

- **The items arrive by a required input, each a heading and a text already in the caller's language.** — `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.ts:items`. The shape of an item stands at `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.model.ts:Item`
- **A press on the toggle opens a closed item and closes an open one, and the other items stay as they were.** — `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.logic.ts:toggleAccordionItem`
- **On the entry one item is open, the first by default.** — `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.logic.ts:initialAccordionOpen`. The default stands at `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.ts:openIndex`
- **New items start the opening anew from the entry position.** — `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.ts:linkedSignal`
- **The toggle is a button across the whole width: the heading on the left, the arrow on the right.** — `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.scss:space-between`
- **The arrow of an open item is turned half a revolution.** — `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.scss:rotate`
- **The toggle names the state of its item and the panel it controls to the assistive means.** — `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.html:aria-controls`
- **The toggle stands inside a heading of the third level.** — `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.html:h3`
- **The panel of a closed item is hidden from everyone, not only from the eye.** — `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.html:hidden`
- **The ids linking a toggle to its panel are unique on the page.** — `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.ts:nextAccordionId`
- **Every toggle and every panel carries `qa-dataid`.** — `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.html:qa-dataid`
- **Items are divided by a thin line of the subtle border colour, the text of the panel is muted.** — `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.scss:border-bottom`
- **The styles of the accordion live in the cascade layer of the kit's components.** — `projects/ui-kit-v2/src/lib/components/accordion/rt-accordion.component.scss:layer`

The scenarios of the subdomain are bound to the tests by the number in the title of a test, not by a
table here: the bond is checked both ways by the checking of the specs.
