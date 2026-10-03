# What it is carried out by — the properties of the small parts

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **A host rule overrides the size properties of the tag, the toggle switch and the toggle button group, and the size steps work as before.** — `projects/ui-kit-v2/src/lib/components/toggle-switch/rt-toggle-switch.component.ts:host` — size modifiers on the host; scenario `SC-UKV-565`
- **The tag reads its colours, paddings and letter-spacing from handles, with its severity and size as the fallback.** — `projects/ui-kit-v2/src/lib/components/tag/rt-tag.component.scss:rt-tag-color-bg` — handles first; scenario `SC-UKV-572`
- **The toggle switch takes a label: a press on it toggles the switch, and it names the switch for a screen reader.** — `projects/ui-kit-v2/src/lib/components/toggle-switch/rt-toggle-switch.component.ts:label` — a bound `<label>`; scenarios `SC-UKV-566`, `SC-UKV-567`
- **The disabled opacity of the toggle switch is a property, `0.5` by default.** — `projects/ui-kit-v2/src/lib/components/toggle-switch/rt-toggle-switch.component.scss:rt-toggle-disabled-opacity` — read on the host; scenario `SC-UKV-574`
- **The toolbar reads its height, inline padding, bottom border, alignment of the centre, gap and overflow of the centre from properties.** — `projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.component.scss:rt-toolbar-height` — scenario `SC-UKV-573`
- **A loading button can hide its label and keep its width.** — `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.ts:loadingLabel` — the content stays at zero opacity under the loader; scenario `SC-UKV-569`
- **A tooltip stands on the left or on the right of its anchor.** — `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.logic.ts:tooltipPositions` — the side, the opposite one, then above and below; scenarios `SC-UKV-570`, `SC-UKV-571`
- **Without the new inputs and properties every component draws as before.** — `projects/ui-kit-v2/src/lib/components/toggle-switch/rt-toggle-switch.component.html:label` — the label only with the input; scenario `SC-UKV-568`
