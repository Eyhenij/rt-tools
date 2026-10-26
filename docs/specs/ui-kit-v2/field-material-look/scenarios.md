# Scenarios — the look of a field under the material preset

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers go through
and were not recounted at the merge: the titles of the tests refer to them.

### SC-UKV-916 — under the material preset the field label lies inside the control

Given an `rt-field` with a label around an input, a textarea, a number field or a select, under the material preset
When the control is empty and unfocused, then filled or focused
Then the label stands at the placeholder's place, then on the top border, and the field height does not change

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material.spec.ts`.

### SC-UKV-917 — under the material preset the asterisk takes the label colour

Given a required `rt-field` under the material preset
When the field is valid, then invalid
Then the asterisk has the label colour, then the error colour

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material.spec.ts`.

### SC-UKV-918 — under the material preset the select triangle turns while open

Given an `rt-select` under the material preset
When its list opens
Then the triangle turns 180° with the kit's caret duration, and turns back on close

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material.spec.ts`.

### SC-UKV-941 — under the material preset a field has the Material size and density

Given fields under the material preset, some under a density step on the field or on an ancestor
When the fields are drawn
Then a field is 56 px high with a 16 px value at density 0 and 4 px lower per step down to 36 px at −5, and the kit's own look ignores the step

Covered: `projects/ui-kit-v2/src/styles/density.styles.spec.ts`.

### SC-UKV-942 — under the material preset the field border darkens on hover

Given an outlined field under the material preset
When the pointer rests on it, and then the field is focused, invalid or disabled
Then the border takes the text colour on hover, and focus, error and disabled keep their own look

Не покрыто: jsdom не воспроизводит наведение; рамка при наведении измерена в витрине.

### SC-UKV-949 — a density step on an ancestor reaches a field with its own preset sign

Given a density step on the page root and the material preset sign on the field itself
When the field is drawn
Then the field takes the height of that step, and an own field height set on an ancestor beats it

Covered: `projects/ui-kit-v2/src/styles/density.styles.spec.ts`.

### SC-UKV-950 — the preset sign on the field itself puts the label inside

Given a field, an input or a select carrying the material preset sign itself, with no sign on an
ancestor
When it is drawn
Then the field's label lies inside the control, and the control's own label on the border breaks
the border, hides the placeholder and stands inside a filled control, as under a sign on an ancestor

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-951 — a filled field under the preset follows the Material filled field

Given a filled input, number field or select with a label under the material preset
When the field is empty, holds a value or is in focus
Then the value starts below the risen label, the label starts 16 px from the edge, only the bottom
line is drawn and focus thickens it, and the message under the field starts at the field's text

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-952 — field colours and the left icon under the preset follow the Material theme

Given a field under the material preset on a page with a Material theme
When the field is drawn
Then the placeholder, the resting label, the icons and the arrow take the theme's muted colour, the
caret takes the brand colour, and an icon on either side is 24 px, 12 px from the edge and 4 px from
the text, so the text and the resting label after a left icon start at 40 px

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-953 — the required mark stands right after the label under the preset

Given a required field
When it is drawn under the material preset and in the kit look
Then under the preset the mark stands right after the label, and the kit look keeps a gap

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-955 — a field's least width is set on an ancestor

Given an input or select in a row sized by its content
When the application sets a least width on an ancestor
Then the field is no narrower than it whatever the value, and without it the field is as before

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-956 — under the preset an icon button inside a field is never taller than the field

Given a small field or a field with an own low height under the material preset, holding a
clearing cross
When the field is drawn
Then the field keeps its height, and the cross shrinks to the field inside its border; the kit's own
look keeps the button's own size, as before the preset work

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-957 — under the preset the text starts 16 px from the outer edge

Given an outlined or filled input, number field, select or text area under the material preset
When it is drawn
Then its text and its resting label start 16 px from the outer edge, and the kit look keeps 17 px

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-958 — a disabled field under the preset is not faded as a whole

Given a disabled input, number field, select or text area under the material preset
When it is drawn
Then the box keeps full opacity, the border is on-surface at 12%, the text, placeholder, label and
the select's arrow are on-surface at 38%, and the kit look still fades the field; a select drawn by
its own trigger gets no border when disabled

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-959 — under the preset the clearing cross is the first kit's cross

Given a clearable input or select under the material preset
When it holds a value
Then the cross button is 19 px with a grey 12 px icon, the input's cross stands 8 px from the
field edge, and the kit look keeps a 32 px button

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-960 — under the preset the line under a field is Material's subscript

Given a field under the material preset that reserves its message line or shows a hint
When it is drawn
Then the line is 16 px high with 4 px above it, a 52 px field with a reserved line takes 72 px,
and the kit look keeps its line: its height is inherited from the page as before

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-961 — a textarea takes the filled look

Given a textarea with `appearance="fill"`
When it is drawn, and when it lies in a field under the material preset
Then it is filled with an underline like a filled input, and under the preset its label lies
inside it above the first line

Covered: `projects/ui-kit-v2/src/lib/components/textarea/rt-textarea.component.spec.ts`,
`projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-962 — under the preset the clearing cross lies on a round grey ground

Given a clearable input or select under the material preset
When it holds a value
Then the cross lies on the first kit's round grey ground, and the kit look keeps it transparent

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-963 — under the preset an icon button stands where a plain icon stands

Given an input under the material preset with an icon button on the left or on the right
When it is drawn
Then its icon stands 12 px from the field edge and the text starts at 40 px, as with a plain icon

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-964 — under the preset a clearable input keeps Material's right inset

Given a clearable input under the material preset without an icon on the right
When it is empty, and when it holds a value
Then the empty field's text runs to 4 px from the right edge, and with a value the cross stands
4 px after the text and 8 px from the edge

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-965 — under the preset a disabled filled field takes Material's disabled fill

Given a disabled filled input, select, number or textarea under the material preset
When it is drawn
Then its fill is on-surface 4 %, and the kit look keeps its fill

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-966 — under the preset a select whose value is drawn by an option template keeps Material's height

Given a filled select under the material preset whose chosen value is drawn by an option template
with an icon
When it is drawn
Then the select is 52 px high, as without the template

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-967 — under the preset a filled textarea keeps Material's height

Given a filled textarea of 4 rows in a field under the material preset
When it is drawn
Then it is 124 px high — 22 px above the text and 6 px below it with the underline — and no gap
stands under it

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-979 — a filled field without a label keeps no room for one

Given a filled input, number, select or text area in a field without a label under the material
preset, with the hint row reserved
When it is drawn
Then the value stands in the middle of the field, an empty control shows its placeholder, the text
area has equal room above its first line and below its last, and the field keeps its hint row

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-1012 — field letter spacing and the per-page font size come from consumer handles

Given an application that sets `--rt-input-letter-spacing`, `--rt-field-label-letter-spacing` or
`--rt-pagination-field-font-size`
When a field, a select, a number field, a text area or the pagination's per-page value is drawn
Then the value and the label take that spacing and the per-page value that size; without the handles
the field label and the select's value inherit the spacing from the page as before, the input,
number field and text area keep the browser's `normal`, and the per-page value keeps the field's
size

Покрытие: частичное. Тест читает стили компонентов; значения проверены измерением в витрине.
