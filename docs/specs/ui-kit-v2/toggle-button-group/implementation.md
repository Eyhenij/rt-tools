# What it is carried out by — the segmented switch

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The single and the multiple choice are declared by different inputs.** — `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group.component.ts:values`; scenario `SC-UKV-87`
- **In the multiple choice a press adds a segment or takes it off.** — `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group.component.ts:onOptionClick`; scenario `SC-UKV-88`
- **The multiple choice gives back the whole set of what is chosen, not the difference.** — `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group.component.ts:valuesChange`; scenario `SC-UKV-88`
- **An unavailable segment stays visible and does not let a press through.** — `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group.component.ts:items`; scenario `SC-UKV-89`
- **A switched-off group makes all its segments unavailable.** — `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group.component.ts:items`; scenario `SC-UKV-90`
- **The unavailability of a segment is declared next to its label, not by a separate list.** — `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group.model.ts:Option`; scenario `SC-UKV-89`
