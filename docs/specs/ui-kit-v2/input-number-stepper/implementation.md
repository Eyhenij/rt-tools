# What it is carried out by — step arrows in the number field

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree, and the scenario it is checked by.

- **The field shows two arrows at its right edge, after the clear button.** — `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.html:input-number-stepper`, `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.ts:stepBy`; scenarios `SC-UKV-1133`, `SC-UKV-1134`
- **The step is set by an input and is one by default.** — `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.ts:step`; scenarios `SC-UKV-1133`, `SC-UKV-1134`
- **The Up and Down keys in the field do what the arrows do.** — `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.ts:onKeydown`; scenario `SC-UKV-1135`
- **A step from an empty field starts from zero.** — `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.ts:stepValue`; scenario `SC-UKV-1136`
- **The result of a step is held inside `min` and `max`.** — `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.ts:stepValue`; scenario `SC-UKV-1137`
- **The arrow towards a reached range edge is disabled.** — `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.ts:canStepUp`, `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.ts:canStepDown`; scenario `SC-UKV-1138`
- **The result is rounded to the digits of the step and of the field.** — `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.ts:fractionDigitsOf`, `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.ts:stepBy`; scenario `SC-UKV-1139`
- **Each step gives the value out at once.** — `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.ts:stepBy`; scenario `SC-UKV-1133`
- **The arrows are switched off by the `stepper` input and are shown by default.** — `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.ts:stepper`; scenario `SC-UKV-1140`
- **A disabled field disables both arrows.** — `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.ts:canStepUp`, `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.ts:canStepDown`; scenario `SC-UKV-1141`
- **A read-only field shows no arrows.** — `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.html:input-number-readonly`; scenario `SC-UKV-1142`
- **The two arrows are one glyph, the lower one turned over.** — `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.html:input-number-step-down`, `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.scss:flipped`; scenario `SC-UKV-1144`
- **The small field has smaller arrows, and no field grows for them.** — `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.ts:stepIconSize`, `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.scss:size--sm`; scenario `SC-UKV-1145`
- **The arrows take no Tab stop.** — `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.html:tabindex`; scenario `SC-UKV-1143`
