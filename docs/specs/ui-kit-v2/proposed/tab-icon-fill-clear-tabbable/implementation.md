# What it is carried out by — a filled tab icon and the clearing cross by Tab from the kit settings

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree, and the scenarios it is checked by; what exactly every scenario is covered by is said in
`scenarios.md`.

- **A tab fills its icon when it asks for it.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tab.directive.ts:iconFill`; scenario `SC-UKV-1080`
- **The kit settings name whether the clearing cross goes by Tab.** — `projects/ui-kit-v2/src/lib/components/form-control/rt-form-control.base.ts:clearTabbable`, the node — `projects/ui-kit-v2/src/lib/config/rt-kit-config.model.ts:FormControl`; scenario `SC-UKV-1081`
- **Every control of the shared base with a clearing cross obeys `clearTabbable`.** — `projects/ui-kit-v2/src/lib/components/form-control/rt-form-control.base.ts:clearTabIndex`; scenario `SC-UKV-1082`
- **A tab puts its badge over the icon when it asks for it.** — `projects/ui-kit-v2/src/lib/components/tabs/rt-tab.directive.ts:badgePosition`; scenario `SC-UKV-1083`
