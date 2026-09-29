# What it is carried out by — a tree of options in a choice from a list

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in
the tree, or the tree holds what the spec is silent about.

- **An option takes children of the same type, and a tree is recognised by the options themselves.** — `projects/ui-kit-v2/src/lib/components/select/rt-select-tree.ts:rtTreeIsTree` — a list is a tree when any option has children; the field is `children` of `IRtSelect.Option`. Scenario `SC-UKV-408`
- **A row is indented by its level, one step of 24px per level.** — `projects/ui-kit-v2/src/lib/components/select/rt-select.component.scss:--rt-select-tree-indent` — the step is multiplied by the row's level. The multiselect declares `--rt-multiselect-tree-indent` the same way. Scenario `SC-UKV-409`
- **A branch shows an arrow, folded to the right or open downwards, and a click on the arrow opens or folds it.** — `projects/ui-kit-v2/src/lib/components/select/rt-select.component.ts:toggleBranch` — the click stops before the row's own click. The multiselect has the same method. Scenario `SC-UKV-410`
- **In the select a click on the label chooses that option, a branch as well as a leaf.** — `projects/ui-kit-v2/src/lib/components/select/rt-select.component.ts:select` — the row's click chooses its option whatever its children. Scenario `SC-UKV-411`
- **In the multiselect a click on a branch chooses every enabled leaf below it, or clears them when all are already chosen.** — `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect.component.ts:toggleOption` — a branch toggles its `rtTreeLeaves`. Whether to add or to clear is read from `rtTreeBranchState`. Scenarios `SC-UKV-412`, `SC-UKV-413`
- **The branches holding a chosen value are open when the list opens; the rest are folded.** — `projects/ui-kit-v2/src/lib/components/select/rt-select-tree.ts:rtTreeOpenFor` — both families call it when the panel opens. Scenario `SC-UKV-414`
- **The filter keeps a row whose label or a descendant's label matches, and shows the path to a match open.** — `projects/ui-kit-v2/src/lib/components/select/rt-select-tree.ts:rtTreeRows` — with a term the open set is ignored. A branch stays when it or a descendant matches. Scenario `SC-UKV-415`
- **The keys move the highlight over visible rows, and the side arrows work the tree.** — `projects/ui-kit-v2/src/lib/components/select/rt-select-tree.ts:rtTreeSideKey` — both families pass ArrowRight and ArrowLeft to it and apply its answer. Scenario `SC-UKV-416`
- **A chip of the multiselect takes its label from the tree.** — `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-label.pipe.ts:rtTreeFind` — the pipe looks the value up at any depth. Scenario `SC-UKV-417`
