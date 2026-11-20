# What it is carried out by — the field of input

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The field of input has the type of address, and it goes away onto the native field.** — `projects/ui-kit-v2/src/lib/components/input/rt-input.model.ts:Type`; scenario `SC-UKV-55`
- **The former four types work as before.** — `projects/ui-kit-v2/src/lib/components/input/rt-input.model.ts:Type`; scenario `SC-UKV-56`
- **The check of what was entered stays with the application.** — `projects/ui-kit-v2/src/lib/components/input/rt-input.component.ts:type` — the type goes away onto the markup, and that is all
- **A value or a hint longer than the field ends with an ellipsis.** — `projects/ui-kit-v2/src/lib/components/input/rt-input.component.scss:text-overflow` — `text-overflow: ellipsis` on the native field, which already clips what does not fit. Scenario `SC-UKV-1116`
- **The field carries fixed text before the value and after it, and the text does not enter the value.** — `projects/ui-kit-v2/src/lib/components/input/rt-input.component.ts:prefix`, `projects/ui-kit-v2/src/lib/components/input/rt-input.component.ts:suffix`, `projects/ui-kit-v2/src/lib/components/input/rt-input.component.html:sizer` — the hidden copy of the text sizes the field, and the suffix follows it; scenarios `SC-UKV-1541`, `SC-UKV-1542`, `SC-UKV-1543`, `SC-UKV-1544`, `SC-UKV-1545`
