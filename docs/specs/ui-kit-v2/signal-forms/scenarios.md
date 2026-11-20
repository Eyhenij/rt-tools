# Scenarios — a field of the set and a signal form

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers do not change
at the merge: the titles of the tests refer to them.

What a scenario is covered by is said under it.

### SC-UKV-77 — a field on the signal binding is drawn

Given a field of the set is bound by a signal form
When the field is raised
Then the markup of the field is drawn and there is no refusal in the start-up

Covered: `projects/ui-kit-v2/src/lib/components/form-control/rt-form-control.signal-forms.spec.ts`.

### SC-UKV-78 — the unfitness of the signal binding reaches the field

Given a field on the signal binding, and the form counts the value unfit
When the field is touched
Then the field declares itself unfit

Covered: `projects/ui-kit-v2/src/lib/components/form-control/rt-form-control.signal-forms.spec.ts`.

### SC-UKV-79 — before a touch the unfitness is not shown

Given a field on the signal binding, and the form counts the value unfit
When the field is not touched and not edited yet
Then the field does not declare itself unfit

Covered: `projects/ui-kit-v2/src/lib/components/form-control/rt-form-control.signal-forms.spec.ts`.

### SC-UKV-80 — the errors of the signal binding are visible to the wrapper

Given a field on the signal binding, and the form named an error
When the field is touched
Then the wrapper shows the text of that error

Covered: `projects/ui-kit-v2/src/lib/components/form-control/rt-form-control.signal-forms.spec.ts`.

### SC-UKV-81 — the obligatoriness of the signal binding gives an asterisk

Given a field on the signal binding, and the form declared the value obligatory
When the field is drawn in the wrapper
Then an asterisk stands at the label

Covered: `projects/ui-kit-v2/src/lib/components/form-control/rt-form-control.signal-forms.spec.ts`.

### SC-UKV-82 — a switching off by the signal binding switches the field off

Given a field on the signal binding, and the form switched the value off
When the field is drawn
Then the field of input accepts no input

Covered: `projects/ui-kit-v2/src/lib/components/form-control/rt-form-control.signal-forms.spec.ts`.

### SC-UKV-1582 — a date field without bounds takes the signal binding

Given a date field bound by a signal form that set no `min` and no `max`
When a day is entered in the field
Then the template builds, and the day reaches the model of the form

Covered: `projects/ui-kit-v2/src/lib/components/date-picker/rt-date-picker.signal-forms.spec.ts`.

### SC-UKV-1583 — a range field without bounds takes the signal binding

Given a range field bound by a signal form that set no `min` and no `max`
When a range is entered in the field
Then the template builds, the range reaches the model of the form, and a range in place of a bound
sets no bound

Covered: `projects/ui-kit-v2/src/lib/components/date-range/rt-date-range.signal-forms.spec.ts`.

### SC-UKV-1584 — a number field without bounds takes the signal binding

Given a number field bound by a signal form that set no `min` and no `max`
When a number is entered in the field
Then the template builds, the number reaches the model of the form, and the absent bound clamps
nothing

Covered: `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.signal-forms.spec.ts`.

### SC-UKV-1585 — a field with hints without a minimal length takes the signal binding

Given a field with hints bound by a signal form that set no `minLength`
When a hint is chosen in the field
Then the template builds, the hint reaches the model of the form, and the hints open from the first
letter as before

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete.signal-forms.spec.ts`.

### SC-UKV-1597 — a counter whose bound the form took off returns to its default bound

Given a counter whose `min` and `max` were set
When the signal binding takes the bounds off and writes nothing in their place
Then the bounds are the default ones — zero and no ceiling — and not a number that blocks both
buttons

Covered: `projects/ui-kit-v2/src/lib/components/counter/rt-counter.component.spec.ts`.

### SC-UKV-83 — the former binding works as before

Given a field on the former binding with an obligatory control
When the control is touched and unfit
Then the field declares itself unfit, and the wrapper shows the error and the asterisk

Covered: `projects/ui-kit-v2/src/lib/components/form-control/rt-form-control.signal-forms.spec.ts`.
