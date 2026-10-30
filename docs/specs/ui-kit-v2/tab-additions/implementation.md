# What it is carried out by — what the tabs give an application moving from Material

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree, and the scenarios it is checked by; what exactly every scenario is covered by is said in
`scenarios.md`.

- **The cross of a closable tab is a button of its own next to the tab.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.component.html:tabs-tab-close`, the name — `projects/ui-kit-v2/src/lib/components/tabs/rt-tab.directive.ts:closeLabel`, the close and the focus after it — `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.component.ts:#close`; scenarios `SC-UKV-922`, `SC-UKV-1019`
- **A tab fills its icon when it asks for it.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tab.directive.ts:iconFill`; scenario `SC-UKV-1099`
- **A tab puts its badge over the icon when it asks for it.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tab.directive.ts:badgePosition`; scenario `SC-UKV-1102`
