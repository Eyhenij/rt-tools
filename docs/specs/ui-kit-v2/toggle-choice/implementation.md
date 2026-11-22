# What it is carried out by — the toggle choice

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree, and the scenarios it is checked by; what exactly every scenario is covered by is said in
`scenarios.md`.

- **The folded field is as wide as the buttons with the unfold margin, and no wider than its place.** — `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group.component.ts:foldedWidth`, `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group.component.scss:--rt-toggle-button-group-folded-width`; scenario `SC-UKV-1639`
- **The folded field is never lower than a medium field.** — `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-fold.logic.ts:rtToggleGroupFoldedSize`; scenario `SC-UKV-1640`
- **A toggle button group whose buttons do not fit the width folds into a field of choice.** — `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-fold.logic.ts:rtToggleGroupFolds`
- **A field of several values can show its choice as toggles.** — `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-toggles.logic.ts:rtMultiselectSummary`
