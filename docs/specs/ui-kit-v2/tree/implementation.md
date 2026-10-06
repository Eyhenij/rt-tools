# What it is carried out by — a tree of choice

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in
the tree, or the tree holds what the spec is silent about.

- **A node takes the shape of a select option, and a tree is counted by the same module.** — `projects/ui-kit-v2/src/lib/components/tree/rt-tree.model.ts:IRtTree` — the node extends `IRtSelect.Option`; rows come from `rtTreeRows`. Scenario `SC-UKV-646`
- **The choice lives in `value`, and the nodes are never changed.** — `projects/ui-kit-v2/src/lib/components/tree/rt-tree.logic.ts:rtTreeChoose` — returns a new array. Scenario `SC-UKV-639`
- **In the cascade the choice holds leaves only, and a branch's mark is derived from them.** — `projects/ui-kit-v2/src/lib/components/tree/rt-tree.logic.ts:rtTreeMark` — over `rtTreeBranchState`. Scenarios `SC-UKV-640`, `SC-UKV-641`
- **Without the cascade a click changes only the clicked node.** — `projects/ui-kit-v2/src/lib/components/tree/rt-tree.logic.ts:rtTreeChoose`. Scenario `SC-UKV-642`
- **In the single mode a node is chosen alone, and a click on a chosen one keeps it.** — `projects/ui-kit-v2/src/lib/components/tree/rt-tree.logic.ts:rtTreeChoose`. Scenario `SC-UKV-643`
- **In the mode without marks a click only picks.** — `projects/ui-kit-v2/src/lib/components/tree/rt-tree.component.ts:RtTreeComponent`. Scenario `SC-UKV-644`
- **A disabled node keeps its state through every change, select-all included.** — `projects/ui-kit-v2/src/lib/components/tree/rt-tree.logic.ts:rtTreeSelectAll`. Scenario `SC-UKV-645`
- **The branches holding a chosen value are open when the tree appears; the rest are folded.** — `projects/ui-kit-v2/src/lib/components/tree/rt-tree.component.ts:RtTreeComponent` — over `rtTreeOpenFor`. Scenario `SC-UKV-646`
- **Choosing never opens or folds a branch.** — `projects/ui-kit-v2/src/lib/components/tree/rt-tree.component.ts:#choose` — fixes the open branches before the choice changes. Scenario `SC-UKV-652`
- **A mark is drawn by the kit's own checkbox and radio.** — `projects/ui-kit-v2/src/lib/components/tree/rt-tree.component.ts:RtTreeComponent` — imports `RtCheckboxComponent` and `RtRadioButtonComponent`. Scenarios `SC-UKV-641`, `SC-UKV-643`
- **A cut label or description shows its whole text in the kit's tooltip.** — `projects/ui-kit-v2/src/lib/components/tree/rt-tree.component.ts:RtTreeComponent` — imports `RtTooltipDirective`, set with `rtTooltipWhenTruncated` on both texts. Scenario `SC-UKV-653`
- **The search term filters the tree and marks the match in the label.** — `projects/ui-kit-v2/src/lib/components/tree/rt-tree.logic.ts:rtTreeLabelParts` — over `splitSideMenuTitle`; the filter is `rtTreeRows`. Scenario `SC-UKV-647`
- **Every word of the search term is marked, in the label, the description and the badges.** — `projects/ui-kit-v2/src/lib/components/tree/rt-tree.logic.ts:rtTreeLabelParts` — over `splitTitleByWords`. Scenario `SC-UKV-666`
- **A plain click chooses the clicked node alone when the tree is exclusive.** — `projects/ui-kit-v2/src/lib/components/tree/rt-tree.logic.ts:rtTreeChooseAlone`. Scenarios `SC-UKV-665`, `SC-UKV-668`
- **The keys walk the visible rows, and the side arrows work the tree.** — `projects/ui-kit-v2/src/lib/components/tree/rt-tree.component.ts:RtTreeComponent` — over `rtTreeSideKey`. Scenario `SC-UKV-648`
- **A key the tree does not use is not consumed.** — `projects/ui-kit-v2/src/lib/components/tree/rt-tree.component.ts:RtTreeComponent`. Scenario `SC-UKV-649`
- **Select-all chooses every enabled leaf of the visible rows, or clears them.** — `projects/ui-kit-v2/src/lib/components/tree/rt-tree.logic.ts:rtTreeSelectAll`. Scenario `SC-UKV-645`
- **Groups may go without a mark, and then a click on a group opens it.** — `projects/ui-kit-v2/src/lib/components/tree/rt-tree.component.ts:branchMarks`. Scenario `SC-UKV-669`
- **The search may only mark, leaving the rows to the application.** — `projects/ui-kit-v2/src/lib/components/tree/rt-tree.component.ts:filter`. Scenario `SC-UKV-670`
- **A node's badges stand under its label as kit tags.** — `projects/ui-kit-v2/src/lib/components/tree/rt-tree.component.html:rt-tag`. Scenario `SC-UKV-671`
- **A row takes the application's content under its label too.** — `projects/ui-kit-v2/src/lib/components/tree/rt-tree.directives.ts:RtTreeNodeMetaDirective`. Scenario `SC-UKV-671`
- **A row takes the application's content at its end.** — `projects/ui-kit-v2/src/lib/components/tree/rt-tree.directives.ts:RtTreeNodeEndDirective`. Scenario `SC-UKV-650`
- **An empty tree says so.** — `projects/ui-kit-v2/src/lib/components/tree/rt-tree.component.ts:emptyText`. Scenario `SC-UKV-651`
