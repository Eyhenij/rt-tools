# What it is carried out by — the empty content of a side panel

The rule of the subdomain is on the left, the place where it is carried out is on the right. The
paths are given from the root of the tree.

- **Under emptiness the panel body shows the placeholder instead of the projected content.** — `projects/ui-kit-v2/src/lib/components/aside/rt-aside.component.html:aside-empty`
- **The header, the request error box and the footer stay in their places under emptiness.** — `projects/ui-kit-v2/src/lib/components/aside/rt-aside.component.html:rt-aside-footer`
- **The default placeholder is the kit's `rt-empty-state` with the `inbox` icon and the `uiEmptyTitle` label.** — `projects/ui-kit-v2/src/lib/components/aside/rt-aside.component.ts:emptyTitleText`
- **The icon, the title and the description of the default placeholder are replaced by the panel's inputs.** — `projects/ui-kit-v2/src/lib/components/aside/rt-aside.component.ts:emptyIcon`
- **An own placeholder given by a template replaces the default placeholder whole.** — `projects/ui-kit-v2/src/lib/components/aside/rt-aside-empty.directive.ts:RtAsideEmptyDirective`
- **Under emptiness of a tab its body shows the same default placeholder, and the tab strip stays.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.component.html:tabs-empty`
- **The icon, the title and the description of a tab's placeholder are replaced by the tab's inputs.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tab.directive.ts:emptyTitleText`

The scenarios of the subdomain are bound to the tests by the number in the title of a test, not by a
table here: the bond is checked both ways by the checking of the specs.
