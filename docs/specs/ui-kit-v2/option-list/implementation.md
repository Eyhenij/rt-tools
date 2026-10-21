# What it is carried out by — the keys of an option list

The first column is the rule of the spec next to it verbatim.
The second is where it is carried out in the tree, with the scenario that checks it.
What covers every scenario is said in `scenarios.md`.

- **A closed select or multiselect opens by an arrow, Enter or Space.** — `projects/ui-kit-v2/src/lib/options/rt-option-list.ts:opensBy` — the select and the multiselect ask it in `onTriggerKeydown`; the autocomplete opens in `onInput`. Scenario `SC-UKV-880`
- **The arrows move the highlight and wrap around at the ends, passing over disabled options.** — `projects/ui-kit-v2/src/lib/options/rt-option-list.ts:move` — the field names its disabled options by `isDisabled`. Scenario `SC-UKV-881`
- **Enter chooses the highlighted option, and in the select and the multiselect Space does too.** — `projects/ui-kit-v2/src/lib/options/rt-option-list.ts:actionOf` — the keys that choose are the field's `chooseKeys`. Scenario `SC-UKV-882`
- **Escape closes the list.** — `projects/ui-kit-v2/src/lib/options/rt-option-list.ts:actionOf` — the field closes its popover on the answer `close`. Scenario `SC-UKV-883`
- **The highlighted option is named by `aria-activedescendant` and is kept in view inside the panel.** — `projects/ui-kit-v2/src/lib/options/rt-option-list.ts:activeOptionId` — the id is `<panel id>-opt-<index>` while the list is open, and the constructor calls `rtScrollActiveOptionIntoView` with it. Scenario `SC-UKV-884`
- **A closed list drops the highlight.** — `projects/ui-kit-v2/src/lib/components/select/rt-select.component.ts:onClosed` — the select, the multiselect and the autocomplete reset the active index when the popover closes.
