# What it is carried out by — the inline edit

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree, and the scenario it is checked by.

- **At rest the value is a button that opens the field; an empty value shows the placeholder.** — `projects/ui-kit-v2/src/lib/components/inline-edit/rt-inline-edit.component.ts:open`; scenario `SC-UKV-786`
- **The field opens with the value in it, takes the focus and selects the text.** — `projects/ui-kit-v2/src/lib/components/inline-edit/rt-inline-edit.component.ts:focusField`; scenario `SC-UKV-786`
- **Enter and the check button save; the draft is trimmed before it goes out.** — `projects/ui-kit-v2/src/lib/components/inline-edit/rt-inline-edit.logic.ts:inlineEditOutcome`; scenario `SC-UKV-787`
- **An empty draft is not saved unless the input allows it.** — `projects/ui-kit-v2/src/lib/components/inline-edit/rt-inline-edit.logic.ts:inlineEditOutcome`, `projects/ui-kit-v2/src/lib/components/inline-edit/rt-inline-edit.component.ts:allowEmpty`; scenario `SC-UKV-789`
- **Escape and the cross button close the field and send the cancel; the value stays as it was.** — `projects/ui-kit-v2/src/lib/components/inline-edit/rt-inline-edit.component.ts:cancel`; scenario `SC-UKV-788`
- **The new value goes out by an output, and the component does not keep it.** — `projects/ui-kit-v2/src/lib/components/inline-edit/rt-inline-edit.component.ts:closeOnSave`; scenario `SC-UKV-790`
- **While saving, the check button spins, and the field and the cross are unavailable.** — `projects/ui-kit-v2/src/lib/components/inline-edit/rt-inline-edit.component.ts:saving`; scenario `SC-UKV-790`
- **Leaving the field is kept, saved or cancelled by an input; moving to its own buttons is not leaving.** — `projects/ui-kit-v2/src/lib/components/inline-edit/rt-inline-edit.logic.ts:inlineEditLeaves`, `projects/ui-kit-v2/src/lib/components/inline-edit/rt-inline-edit.component.ts:blurAction`; scenario `SC-UKV-791`
- **An unavailable component does not open the field.** — `projects/ui-kit-v2/src/lib/components/inline-edit/rt-inline-edit.component.ts:disabled`; scenario `SC-UKV-792`
- **The field chip keeps the value in a field all the time, with the icon before the text and no buttons.** — `projects/ui-kit-v2/src/lib/components/inline-edit/rt-inline-edit.component.ts:isChipField`, `projects/ui-kit-v2/src/lib/components/inline-edit/rt-inline-edit.component.ts:fieldIcon`; scenario `SC-UKV-831`
- **In the field chip, Enter and leaving save the trimmed draft; a draft equal to the value sends nothing.** — `projects/ui-kit-v2/src/lib/components/inline-edit/rt-inline-edit.component.ts:onChipBlur`, `projects/ui-kit-v2/src/lib/components/inline-edit/rt-inline-edit.component.ts:#commitChip`; scenario `SC-UKV-832`
- **In the field chip, Escape puts the value back and sends the cancel.** — `projects/ui-kit-v2/src/lib/components/inline-edit/rt-inline-edit.component.ts:onChipKeydown`; scenario `SC-UKV-833`
- **In the field chip, an empty draft puts the value back silently unless the input allows it.** — `projects/ui-kit-v2/src/lib/components/inline-edit/rt-inline-edit.logic.ts:inlineEditOutcome`, `projects/ui-kit-v2/src/lib/components/inline-edit/rt-inline-edit.component.ts:#commitChip`; scenario `SC-UKV-834`
- **The truncate input cuts a long field chip text in the middle out of focus: the start ends with an ellipsis and the last ten characters stay seen.** — `projects/ui-kit-v2/src/lib/components/inline-edit/rt-inline-edit.logic.ts:inlineEditMiddle`, `projects/ui-kit-v2/src/lib/components/inline-edit/rt-inline-edit.component.ts:middleParts`; scenario `SC-UKV-848`
