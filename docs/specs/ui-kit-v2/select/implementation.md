# What it is carried out by — the consumer's own trigger of a choice from a list

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in
the tree, or the tree holds what the spec is silent about.

- **The behaviour of the trigger stays with the kit, and the consumer gives only what is drawn inside.** — `projects/ui-kit-v2/src/lib/components/select/rt-select.component.html:rtPopover` — every binding stays on the button. Scenario `SC-UKV-159`
- **A consumer who declares no trigger sees what they saw before.** — `projects/ui-kit-v2/src/lib/components/select/rt-select.component.ts:triggerTpl` — empty content child, and the kit's own branch is drawn. Scenario `SC-UKV-157`
- **The consumer's markup receives three values and no more: whether the list is open, what is chosen, whether the choice is switched off.** — `projects/ui-kit-v2/src/lib/components/select/rt-select.component.ts:triggerState` — the fields of `TriggerState` and nothing else. Scenarios `SC-UKV-160`, `SC-UKV-161`, `SC-UKV-162`
- **One input serves both families.** — `projects/ui-kit-v2/src/lib/components/select/rt-select-trigger.directive.ts:RtSelectTriggerDirective` — one marker, read by both. Scenario `SC-UKV-163`
- **The consumer's markup goes inside the button, not instead of it.** — `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect.component.html:ngTemplateOutlet` — the outlet stands inside the button. Scenario `SC-UKV-158`
- **The kit's own look of the trigger goes away together with its markup.** — `projects/ui-kit-v2/src/lib/components/select/rt-select.component.scss:__trigger--own` — the ground, the border, the height and the paddings are taken off. Scenario `SC-UKV-164`
- **The width of the field goes away with the look, and a list of removed properties does not cover it.** — `projects/ui-kit-v2/src/lib/components/select/rt-select.component.scss:__trigger--own` — `width: auto` there. The same line stands at the multiselect. Scenario `SC-UKV-175`
- **The states of the field go away too — the ring of focus and the border of the open list.** — `projects/ui-kit-v2/src/lib/components/select/rt-select.component.scss:__trigger--own` — `:focus` takes the border and the shadow off. The rules `--open` and `--invalid` take the border off by a stronger target. Scenario `SC-UKV-176`
- **The move by keys stays visible, and its outline follows the content of the button.** — `projects/ui-kit-v2/src/lib/components/select/rt-select.component.scss:focus-visible` — the outline stands there. At the multiselect the rule is the same. Scenario `SC-UKV-177`
- **The panel is measured by its content and never gets narrower than the trigger.** — `projects/ui-kit-v2/src/lib/components/popover/rt-popover.directive.ts:sizeByWidth` — the `trigger-min` mode gives the box a lower bound and no fixed width; both families ask for it by the `panelWidth` input. Scenario `SC-UKV-178`
- **The panel opens whole, without a scroll of its own.** — `projects/ui-kit-v2/src/lib/components/select/rt-select.component.ts:panelMaxHeight` — the input puts the limit on the panel itself, and the styles declare the default as no limit at all. The same pair stands at the multiselect. Scenario `SC-UKV-179`
