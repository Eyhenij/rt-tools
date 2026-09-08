# Scenarios — the look of a field of input in the setting of the kit

### SC-UK-53 — without a setting the field stays the former one

Given the setting of the kit is not declared
When the selector is drawn
Then the field is shown with a filling — the former default of the kit

Covered: `projects/ui-kit/src/lib/ui-kit/dynamic-selectors/components/dynamic-selector/rtui-dynamic-selector.component.spec.ts`.

### SC-UK-54 — the section of the component sets the look of the field

Given the look of a field for the selectors is declared in the setting of the kit
When the selector is drawn without an input of the look
Then the field is shown by the look from the setting

Covered: `projects/ui-kit/src/lib/ui-kit/dynamic-selectors/components/dynamic-selector/rtui-dynamic-selector.component.spec.ts`.

### SC-UK-55 — an input at the place overrides the setting

Given one look is declared in the setting of the kit, and another is passed by an input
When the selector is drawn
Then the field is shown by the look from the input

Covered: `projects/ui-kit/src/lib/ui-kit/dynamic-selectors/components/dynamic-selector/rtui-dynamic-selector.component.spec.ts`.
