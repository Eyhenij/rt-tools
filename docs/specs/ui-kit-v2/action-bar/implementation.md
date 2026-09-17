# What it is carried out by — the bar of mass actions

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The bar is opened by the count of what is picked, not by a flag of its own.** — `projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar-holder.component.ts:opened` — scenarios `SC-UKV-199`, `SC-UKV-200`
- **The count is shown as it stands, and zero is a number.** — `projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar.component.ts:countText` — scenario `SC-UKV-201`
- **An action without a nested list does what it carries and closes the bar.** — `projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar.component.ts:onAction` — scenario `SC-UKV-202`
- **An action carrying a nested list opens it and does nothing else.** — `projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar.component.html:rtPopover` — scenario `SC-UKV-203`
- **A press on an action of the nested list closes the bar the same as a press on a plain one.** — `projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar.component.html:selected` — scenario `SC-UKV-204`
- **The cross reports a press outward and closes nothing by itself.** — `projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar.component.ts:onClose` — scenario `SC-UKV-205`
- **The bar stays in the markup for exactly as long as its leaving lasts.** — `projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar.model.ts:RT_ACTION_BAR_LEAVE_MS` — scenario `SC-UKV-206`
- **The bar is pinned above the page by the holder, and the layer number comes from the scale.** — `projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar-holder.component.scss:z-index` — seen by the frame of the story of the holder
- **An action with an icon lets its label be taken away where the pointer is coarse, and the markup carries both.** — `projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar.component.scss:media` — scenarios `SC-UKV-207`, `SC-UKV-208`
- **Every label of the bar comes from the dictionary of the kit.** — `projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar.component.ts:countText` — scenario `SC-UKV-209`
- **The bar has a limit of its width, and the row of actions that did not fit it wraps.** — `projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar.component.scss:flex-wrap` — scenario `SC-UKV-210`
- **A single action wider than the place has its label wrapped, and the bar draws that label itself.** — `projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar.component.scss:overflow-wrap` — scenario `SC-UKV-213`
- **The limit of the width stands on the element itself as well, not on the bar alone.** — `projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar.component.scss:max-width` — seen by the frame of the story of the width
- **The styles of the bar live in the cascade layer of the kit's components.** — `projects/ui-kit-v2/src/lib/components/action-bar/rt-action-bar.component.scss:layer` — scenario `SC-UKV-212`
