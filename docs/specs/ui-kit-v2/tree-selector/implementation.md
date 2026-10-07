# What it is carried out by — a choice by a tree with search

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in
the tree, or the tree holds what the spec is silent about.

- **The tree inside is `rt-tree`, and the selector draws no rows of its own.** — `projects/ui-kit-v2/src/lib/components/tree-selector/rt-tree-selector.component.ts:RtTreeSelectorComponent` — imports `RtTreeComponent` and passes its inputs on
- **The search field keeps the focus and hands every key to the tree.** — `projects/ui-kit-v2/src/lib/components/tree-selector/rt-tree-selector.component.ts:onSearchKeydown` — calls `handleKeydown` of the tree; the focus is set after the first render. Scenario `SC-UKV-679`
- **The search keeps the nodes in which every typed word is found, and marks the words.** — `projects/ui-kit-v2/src/lib/components/tree-selector/rt-tree-selector.logic.ts:rtTreeSelectorFilter` — the tree gets the kept nodes with `filter` off and the term for the marks. Scenarios `SC-UKV-677`, `SC-UKV-678`
- **Expand-all and collapse-all open and fold every branch of the tree.** — `projects/ui-kit-v2/src/lib/components/tree-selector/rt-tree-selector.component.ts:expandAll` — and `collapseAll` next to it, both over the tree's own methods. Drawn by `isExpandShown`, scenario `SC-UKV-689`
- **Clear empties the choice except the disabled chosen nodes.** — `projects/ui-kit-v2/src/lib/components/tree-selector/rt-tree-selector.logic.ts:rtTreeSelectorClear`. Scenario `SC-UKV-683`
- **Revert returns the draft to the choice without closing the selector.** — `projects/ui-kit-v2/src/lib/components/tree-selector/rt-tree-selector.component.ts:onRevert`. Drawn by `isRevertShown`, off by `isDraftChanged`. Scenario `SC-UKV-690`
- **The multi toggle switches the exclusive click off and on.** — `projects/ui-kit-v2/src/lib/components/tree-selector/rt-tree-selector.component.ts:isExclusive` — passed to `exclusive` of the tree. Scenario `SC-UKV-684`
- **The application's own controls stand in the row of the selector.** — `projects/ui-kit-v2/src/lib/components/tree-selector/rt-tree-selector.directives.ts:RtTreeSelectorControlsDirective`. Scenario `SC-UKV-686`
- **In the direct form every change is written to the choice at once.** — `projects/ui-kit-v2/src/lib/components/tree-selector/rt-tree-selector.component.ts:#write`. Scenario `SC-UKV-680`
- **In the confirming form the changes go to the draft, and «Apply» writes it to the choice.** — `projects/ui-kit-v2/src/lib/components/tree-selector/rt-tree-selector.component.ts:apply` — and `cancel` next to it; the draft is a `linkedSignal` of `value`. Scenario `SC-UKV-681`
- **«Apply» is off while the draft equals the choice, and while it is empty where an empty choice is not allowed.** — `projects/ui-kit-v2/src/lib/components/tree-selector/rt-tree-selector.logic.ts:rtTreeSelectorCanApply` — read by `canApply`. Scenario `SC-UKV-682`
- **The footer belongs to the selector only when asked for.** — `projects/ui-kit-v2/src/lib/components/tree-selector/rt-tree-selector.component.ts:isFooterShown`
- **In the single mode of the confirming form Enter on a node applies.** — `projects/ui-kit-v2/src/lib/components/tree-selector/rt-tree-selector.component.ts:onPicked`. Scenario `SC-UKV-685`
- **On appearance the branches over the choice are open, or all of them, or none.** — `projects/ui-kit-v2/src/lib/components/tree-selector/rt-tree-selector.component.ts:#expandOnStart`
