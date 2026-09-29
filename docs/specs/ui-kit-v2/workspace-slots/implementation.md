# What it is carried out by — the slots of the workspace and the panels that are not declared

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **A slot whose template is not declared draws no panel.** — `projects/ui-kit-v2/src/lib/components/workspace/rt-workspace.component.ts:listSlot` and `projects/ui-kit-v2/src/lib/components/workspace/rt-workspace.component.ts:asideSlot` — the template puts the list section and the details section each under a condition by its own signal; scenario `SC-UKV-145`
- **The handle of an undeclared panel is not drawn either.** — `projects/ui-kit-v2/src/lib/components/workspace/rt-workspace.component.ts:listSlot` — each handle stands inside the same condition as the panel it resizes; scenario `SC-UKV-146`
- **A declared but closed details panel stays drawn.** — `projects/ui-kit-v2/src/lib/components/workspace/rt-workspace.component.ts:asideOpen` — the closing is a modifier on the section, and the condition above it asks about the slot rather than about the state; scenario `SC-UKV-147`
- **The centre is not asked about its slot.** — `projects/ui-kit-v2/src/lib/components/workspace/rt-workspace.component.ts:centerSlot` — the signal fills the centre and gates nothing: the centre section stands outside any condition; scenario `SC-UKV-145`
