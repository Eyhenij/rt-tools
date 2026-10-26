# What it is carried out by — the tab strip scrolled to the selected tab

The rule of the subdomain is on the left, the place where it is carried out is on the right. The
paths are given from the root of the tree.

- **After the first render the strip is scrolled to the selected tab.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.component.ts:#scrollToSelected`, called by `afterNextRender` in the constructor
- **An outside change of the selected tab scrolls the strip to the new one.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.component.ts:#scrollToSelected`, called by `afterRenderEffect` in the constructor
- **A click or a key scrolls the strip once.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.component.ts:#scrolledId`
- **The first scroll goes at once, a later one moves as a click does.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.component.ts:#scrollTabIntoView`
- **The selected tab is seen whole.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.scroll.ts:rtTabsIntoViewTarget`, the `inset` argument
- **The arrows are recomputed after every such scroll.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.component.ts:#scrollTabIntoView`
- **A tab already seen whole does not move the strip.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.scroll.ts:rtTabsIntoViewTarget`
- **When the tabs change size, the strip is scrolled to the selected tab again.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.follow.ts:RtTabsFollow`, the `watch` method, called by `afterRenderEffect` in the component constructor
- **A person who scrolled the strip stops the following.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.follow.ts:RtTabsFollow`, the `manual` and `follow` methods

The scenarios of the subdomain are bound to the tests by the number in the title of a test, not by a
table here: the bond is checked both ways by the checking of the specs.
