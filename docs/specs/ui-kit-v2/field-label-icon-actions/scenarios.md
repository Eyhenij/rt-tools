# Scenarios — the field's label on the border, actionable icons and the clearing cross

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers go through
and were not recounted at the merge: the titles of the tests refer to them.

### SC-UKV-948 — the option template replaces the row label

Given the select holds an option template
When the list is opened
Then each row draws the template with its option, and the check mark stays on the chosen row

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-field-extras.spec.ts`.

### SC-UKV-973 — without an option template the row draws the label

Given the select holds no option template
When the list is opened
Then each row draws the option label as before

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-field-extras.spec.ts`.

### SC-UKV-946 — the option template draws the chosen value in the field too

Given the select holds an option template and a chosen value
When the field is drawn
Then the field draws the template with the chosen option in place of the bare label, and an empty
field draws the placeholder

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-field-extras.spec.ts`.

### SC-UKV-974 — the label on the border lies at the placeholder's place on an empty field

Given the input names a label on the border and holds no value
When the field is drawn at rest
Then the label is not risen and the native field has no placeholder

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`.

### SC-UKV-975 — the label rises on a value and on focus

Given the input names a label on the border
When the field gets a value, or the field is focused while empty
Then the label is risen

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`.

### SC-UKV-976 — the select's label rises on a value and on an open list

Given the select names a label on the border
When an option is chosen, or the list is opened while nothing is chosen
Then the label is risen

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-field-extras.spec.ts`.

### SC-UKV-977 — the label names the control without an aria label

Given the field names a label on the border and no aria label
When the field is drawn
Then the control is named by the label's text

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`, `projects/ui-kit-v2/src/lib/components/select/rt-select-field-extras.spec.ts`.

### SC-UKV-978 — an actionable icon is a button reported by its output

Given the input marks its left icon as actionable
When the icon is pressed by the mouse, by Enter or by Space
Then the left output reports each press, and the focus does not move into the native field

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`.

### SC-UKV-1008 — an actionable icon carries a tooltip and a name

Given the input marks its right icon as actionable and gives it a tooltip
When the field is drawn
Then the icon button is named by the tooltip text and shows it on hover and focus

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`.

### SC-UKV-1009 — an icon not marked as actionable stays a picture

Given the input names icons and marks neither as actionable
When the field is drawn
Then no icon is a button

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`.

### SC-UKV-1010 — the cross enters the Tab order on demand

Given the input or the select asks for a tabbable cross and holds a value
When the field is drawn
Then the cross is reached by the Tab key; without the demand it stays out of the order

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`, `projects/ui-kit-v2/src/lib/components/select/rt-select-field-extras.spec.ts`.

### SC-UKV-1011 — clearing reports to the host

Given a field holds a value
When the cross is pressed
Then the form gets the empty value first, and the clearing output fires once after it

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`, `projects/ui-kit-v2/src/lib/components/select/rt-select-field-extras.spec.ts`.

### SC-UKV-954 — an actionable icon is disabled while the field stays usable

Given an input with an actionable left icon that the host disables
When the field is drawn
Then the icon button is disabled and keeps its tooltip, and the field still takes input

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-1015 — the input's length limit goes onto the native field

Given an input with a length limit, given as a number or as a markup attribute
When the field is drawn, alone or bound to a form control
Then the native field carries that limit; without a limit, with `null` or with a non-number it
carries none, and the form's own length check still answers for a value set by code

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`.

### SC-UKV-1016 — the textarea's length limit goes onto the native field

Given a textarea with a length limit
When the field is drawn
Then the native field carries that limit; without one it carries none

Covered: `projects/ui-kit-v2/src/lib/components/textarea/rt-textarea.component.spec.ts`.

### SC-UKV-982 — a value the form writes back during typing shows in the input

Given an input bound to a form control that shows a value
When the person empties it, and the host sets the control back to that same value in the same call
Then the field shows the value again, and the control holds it

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`.

### SC-UKV-908 — the checkbox takes its mark from an input without a form

Given a checkbox outside a form with the mark given by its input
When the person presses it
Then the mark shown is the input's, and the new mark is reported by the change output

Covered: `projects/ui-kit-v2/src/lib/components/checkbox/rt-checkbox.component.spec.ts`.

### SC-UKV-1023 — Escape in an open list closes one layer

Given a select, multiselect, autocomplete or menu is open inside a side panel or a dialog
When the person presses Escape
Then only the list closes, and the event does not reach the layer under it

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-field-extras.spec.ts`.

### SC-UKV-1024 — the autocomplete shows that suggestions are loading

Given suggestions are loading
When the panel is open with no suggestions yet, or with a page already shown
Then a spinner row stands in place of the empty result, or under the list

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-paging.spec.ts`.

### SC-UKV-1025 — the autocomplete reports the end of the list

Given the panel is scrolled to its end
When the person keeps scrolling at the end, and a new page is loading
Then the end is reported once per list length and never while loading

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-paging.spec.ts`.

### SC-UKV-1026 — the autocomplete takes its own empty result

Given an own empty text or an own empty template
When nothing is found
Then the own text, or the template with the typed query, stands instead of the kit label

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-paging.spec.ts`.

### SC-UKV-980 — the row fields of a dynamic selector stay out of the host form

Given an editable dynamic input bound by a form control name inside the host's form group
When the pencil of a row is pressed, or the field for a new row is opened
Then the console gets no NG01354 warning, the host form keeps only its own controls, and typing
with Enter applies the edit as before

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/dynamic-input/rt-dynamic-input-host-form.spec.ts`.

### SC-UKV-981 — the inner fields of other kit components stay out of the host form

Given one of seven kit components inside the host's form group: a select with a filter, a tree
selector, a profile menu with locales, a filter control on a narrow screen, a theme toggle as a
switch, workspace details with an agent and toggles, or a selectable dynamic list
When its inner field is shown, and the select panel and the agent edit are opened by a press
Then the console gets no NG01354 warning, and the host form keeps only its own controls

Covered: `projects/ui-kit-v2/src/lib/components/rt-host-form-ngmodel.spec.ts`.
