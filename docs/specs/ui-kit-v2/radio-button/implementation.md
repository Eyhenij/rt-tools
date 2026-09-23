# What it is carried out by — the radio button

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about. The choosing itself lives in a private method,
and a private field is never a binding: a rule carried out by it is bound to the public entry that
calls it.

- **The radio button is chosen when its value is the model itself, not an equal one.** — `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.ts:isChecked`; scenarios `SC-UKV-276`, `SC-UKV-277`
- **A press on a radio button that is not chosen makes its value the model and gives it to the form.** — `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.ts:onClick`; scenario `SC-UKV-278`
- **A press on the chosen radio button does not take the choice off.** — `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.ts:onClick`; scenario `SC-UKV-279`
- **A value written by the form does not come back to the form as an edit.** — `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.ts:writeValue`; scenario `SC-UKV-280`
- **Any press marks the radio button touched, including one that changes nothing.** — `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.ts:registerOnTouched`; scenario `SC-UKV-281`
- **The radio button is unavailable when the input says so or the form says so.** — `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.ts:setDisabledState`; scenarios `SC-UKV-282`, `SC-UKV-283`
- **An unavailable radio button changes the choice neither by a press nor by a key.** — `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.ts:isDisabled`; scenario `SC-UKV-284`
- **Every press is reported outward, whether or not it changed the choice.** — `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.ts:clickAction`; scenario `SC-UKV-285`
- **A press on the radio button does not reach the element around it.** — `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.ts:stopPropagation`; scenario `SC-UKV-286`
- **Space and Enter choose the radio button from the keyboard.** — `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.ts:onKeydown`; scenarios `SC-UKV-287`, `SC-UKV-288`
- **The radio button names its role, its choice and its unavailability to the assistive means.** — `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.html:aria-checked`; scenario `SC-UKV-289`
- **The radio button is one stop of the keyboard focus, the unavailable one included.** — `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.html:tabindex`; scenario `SC-UKV-290`
- **The focus reached from the keyboard is visible by the ring of the kit; the focus from a press is not.** — `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.scss:focus-visible`; scenario `SC-UKV-291`
- **The label and the explanation are texts given by the caller, and each is drawn only when given.** — `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.html:description`; scenarios `SC-UKV-292`, `SC-UKV-293`
- **The explanation is smaller than the label and drawn in the muted colour.** — `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.scss:text-muted`; scenario `SC-UKV-293`
- **The card look draws a framed box with the content on the left and the circle on the right.** — `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.scss:row-reverse`; scenario `SC-UKV-294`
- **In the card look the frame of a chosen radio button takes the colour of the choice.** — `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.scss:card`; scenario `SC-UKV-295`
- **The unavailable radio button is dimmed as a whole and takes no pointer.** — `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.scss:opacity-disabled`; scenario `SC-UKV-296`
- **Every colour of the radio button comes from an appointment of the kit.** — `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.scss:action-primary`; scenario `SC-UKV-297`; held besides by `tools/check-preset-complete.mjs` and the literal gate of the design
- **The choice is also given by an input without a form, and a change of it is reported by an output of its own.** — `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.ts:checkedChange`; scenario `SC-UKV-298`
- **A radio button without a label takes its name for the assistive means from an input.** — `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.ts:ariaLabel`; scenario `SC-UKV-299`

## What is covered by what

Every scenario is covered by the unit spec next to the component, named by its number. The look
scenarios `SC-UKV-291`…`SC-UKV-297` are confirmed besides by the showcase snapshots of the radio
button family in both presets and both themes.

## What is not decided yet

Several radio buttons on one control of a reactive form — the open question `Q-RB-1` of the spec
next to it; the table does not meet it, it gives the choice by the input.
