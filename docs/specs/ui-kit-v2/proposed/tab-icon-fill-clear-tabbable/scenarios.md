# Scenarios — a filled tab icon and the clearing cross by Tab from the kit settings

The prefix `SC-UKV` is shared across the domain together with the subdomains; the numbers keep
going after the merge.

### SC-UKV-1080 — a tab fills its icon when it asks for it

Given tabs where one tab has `iconFill` and an icon by `glyph`, and another has `iconFill` and an icon by `icon`
When the tab strip is drawn
Then both icons are drawn filled, and the tabs without `iconFill` keep the outlined icon

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-additions.spec.ts`.

### SC-UKV-1081 — the kit settings put the clearing cross into the Tab order

Given the kit settings with `formControl.clearTabbable` on
When a field of the shared base with a value is drawn without `clearTabbable` of its own
Then its clearing cross is in the Tab order; with `clearTabbable` off on the field it is not; without the setting it is not

Covered: `projects/ui-kit-v2/src/lib/components/form-control/rt-form-control.base.spec.ts`.

### SC-UKV-1082 — the autocomplete, the number field and the date fields obey `clearTabbable`

Given an autocomplete, a number field, a date picker and a date range, each with a value and `clearTabbable`
When they are drawn
Then the clearing cross of each is in the Tab order; without `clearTabbable` it is not

Covered: `projects/ui-kit-v2/src/lib/components/form-control/rt-clear-tabbable.spec.ts`.

### SC-UKV-1083 — a tab puts its badge over the icon when it asks for it

Given tabs with an icon and a badge, one with `badgePosition` `'overlay'` and one without it, and a tab with `'overlay'` and no icon
When the tab strip is drawn
Then the badge of the first stands over the icon corner and the tab is as wide as without a badge; the second keeps the badge after the title; the tab without an icon keeps it inline

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-additions.spec.ts`.
