# What it is carried out by — a hybrid choice by a tree

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in
the tree, or the tree holds what the spec is silent about.

- **The hybrid tree is `rt-tree` with single groups, and it draws no rows of its own.** — `projects/ui-kit-v2/src/lib/components/hybrid-tree/rt-hybrid-tree.component.ts:RtHybridTreeComponent` — extends `RtTreeComponent` and takes its template and styles
- **A single group keeps one leaf.** — `projects/ui-kit-v2/src/lib/components/hybrid-tree/rt-hybrid-tree.logic.ts:rtHybridTreeChoose` — the single leaf goes through `chooseSingleLeaf`. Scenarios `SC-UKV-691`, `SC-UKV-692`
- **The radio of a single group clears the group or chooses its first leaf.** — `projects/ui-kit-v2/src/lib/components/hybrid-tree/rt-hybrid-tree.logic.ts:rtHybridTreeChoose` — the group goes through `chooseSingleGroup`. Scenario `SC-UKV-693`
- **Select-all and the cascade of a branch skip single leaves when they add.** — `projects/ui-kit-v2/src/lib/components/hybrid-tree/rt-hybrid-tree.logic.ts:rtHybridTreeSelectAll` — and `rtHybridTreeMark` for the branch mark. Scenarios `SC-UKV-694`, `SC-UKV-695`
- **The exclusive click on a single leaf keeps the choice outside its group.** — `projects/ui-kit-v2/src/lib/components/hybrid-tree/rt-hybrid-tree.logic.ts:rtHybridTreeChoose` — read by `nextChoice` of the component. Scenario `SC-UKV-696`
- **A group without a mark shows the count of its chosen leaves.** — `projects/ui-kit-v2/src/lib/components/hybrid-tree/rt-hybrid-tree.logic.ts:rtHybridTreeChosenCount` — read by `rowState`. Scenario `SC-UKV-697`
- **The hybrid selector is the tree selector with the hybrid tree inside.** — `projects/ui-kit-v2/src/lib/components/hybrid-tree-selector/rt-hybrid-tree-selector.component.ts:RtHybridTreeSelectorComponent` — extends `RtTreeSelectorComponent` and sets `hybrid`. Scenario `SC-UKV-698`
