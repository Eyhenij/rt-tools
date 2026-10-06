# What it is carried out by — a tree ordered by dragging

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in
the tree, or the tree holds what the spec is silent about.

- **A node is the node of `rt-tree`, and the rows are counted by the same module.** — `projects/ui-kit-v2/src/lib/components/draggable-tree/rt-draggable-tree.component.ts:RtDraggableTreeComponent` — rows from `rtTreeRows`. Scenario `SC-UKV-662`
- **A move gives a new array, and the nodes passed in are never changed.** — `projects/ui-kit-v2/src/lib/components/draggable-tree/rt-draggable-tree.logic.ts:rtDragMove`. Scenario `SC-UKV-655`
- **The drop place is read from the row under the pointer by thirds of its height.** — `projects/ui-kit-v2/src/lib/components/draggable-tree/rt-draggable-tree.logic.ts:rtDragPlace`. Scenario `SC-UKV-654`
- **Only a container takes a node inside.** — `projects/ui-kit-v2/src/lib/components/draggable-tree/rt-draggable-tree.logic.ts:rtDragPlace`. Scenarios `SC-UKV-654`, `SC-UKV-656`
- **A node never goes into its own subtree.** — `projects/ui-kit-v2/src/lib/components/draggable-tree/rt-draggable-tree.logic.ts:rtDragAllowed`. Scenario `SC-UKV-657`
- **A disabled node is not moved.** — `projects/ui-kit-v2/src/lib/components/draggable-tree/rt-draggable-tree.component.ts:RtDraggableTreeComponent`. Scenario `SC-UKV-661`
- **The application may ban a place by `canDrop`.** — `projects/ui-kit-v2/src/lib/components/draggable-tree/rt-draggable-tree.logic.ts:rtDragAllowed`. Scenario `SC-UKV-658`
- **Alt with ArrowUp or ArrowDown moves a node among its siblings.** — `projects/ui-kit-v2/src/lib/components/draggable-tree/rt-draggable-tree.logic.ts:rtDragKeyPlace`. Scenario `SC-UKV-659`
- **Alt with ArrowLeft takes a node out of its branch to stand right after it; Alt with ArrowRight puts it last into the container right above it.** — `projects/ui-kit-v2/src/lib/components/draggable-tree/rt-draggable-tree.logic.ts:rtDragKeyPlace`. Scenario `SC-UKV-660`
- **The keys without Alt walk the rows as in `rt-tree`.** — `projects/ui-kit-v2/src/lib/components/draggable-tree/rt-draggable-tree.component.ts:RtDraggableTreeComponent` — over `rtTreeSideKey`. Scenario `SC-UKV-659`
- **A row takes the application's markup by a template.** — `projects/ui-kit-v2/src/lib/components/draggable-tree/rt-draggable-tree.directives.ts:RtDraggableTreeNodeDirective`. Scenario `SC-UKV-662`
- **An empty tree shows the kit label for no options.** — `projects/ui-kit-v2/src/lib/components/draggable-tree/rt-draggable-tree.component.ts:RtDraggableTreeComponent`. Scenario `SC-UKV-663`
