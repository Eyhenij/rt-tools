# What it is carried out by — the switches, initial query and popup state of the dynamic selector

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **A list without the bin draws its rows without the remove button.** — `projects/ui-kit-v2/src/lib/components/dynamic-selector/list/rt-dynamic-selector-list.component.ts:removeShown` — scenario `SC-UKV-613`
- **A list without the reset and clear panel keeps its add button.** — `projects/ui-kit-v2/src/lib/components/dynamic-selector/list/rt-dynamic-selector-list.component.ts:resetClearShown` — scenario `SC-UKV-614`
- **Without the panel switch the panel follows the invitation, as before.** — `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.component.ts:isListActionsShown`, `projects/ui-kit-v2/src/lib/components/dynamic-selector/dynamic-input/rt-dynamic-input.component.ts:isListActionsShown` — scenario `SC-UKV-615`
- **Edits in a row keep reset and clear active, and both then report to the consumer.** — `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.component.ts:extraChanged`, `projects/ui-kit-v2/src/lib/components/dynamic-selector/dynamic-input/rt-dynamic-input.component.ts:listCleared` — scenario `SC-UKV-616`
- **The popup opens on the initial query and does not report it as a search.** — `projects/ui-kit-v2/src/lib/components/dynamic-selector/popup/rt-dynamic-selector-popup.component.ts:searchTerm` — scenario `SC-UKV-617`
- **The selector tells whether its popup is open and reports every change of that.** — `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.component.ts:popupOpen` — scenario `SC-UKV-618`
- **Without the new inputs the selector and the text input behave and draw as before.** — `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.component.ts:listActionsShown` — scenario `SC-UKV-619`
