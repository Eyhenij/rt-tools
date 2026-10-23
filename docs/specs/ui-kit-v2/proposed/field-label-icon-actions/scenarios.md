# Scenarios — the field's label on the border, actionable icons and the clearing cross

Numbers continue the second kit's numbering and do not change after the merge. While a scenario is
not covered, it carries the mark «Не покрыто» with the reason.

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

### SC-UKV-908 — the checkbox takes its mark from an input without a form

Given a checkbox outside a form with the mark given by its input
When the person presses it
Then the mark shown is the input's, and the new mark is reported by the change output

Covered: `projects/ui-kit-v2/src/lib/components/checkbox/rt-checkbox.component.spec.ts`.

### SC-UKV-909 — a radio group names itself to assistive technology

Given radio buttons inside a radio group with a name
When the group is drawn
Then it is declared a radio group under that name

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-group.component.spec.ts`.

### SC-UKV-910 — arrows move the choice and the focus inside the group

Given a radio group with a disabled member
When the person presses an arrow on a radio button
Then the next enabled radio button, wrapping around, is chosen and focused

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-group.component.spec.ts`.

### SC-UKV-911 — a radio group has one Tab stop

Given a radio group
When it is drawn without a choice, and then with one
Then only the first enabled radio button, and then only the chosen one, is in the Tab order

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-group.component.spec.ts`.

### SC-UKV-912 — Escape in an open list closes one layer

Given a select, multiselect, autocomplete or menu is open inside a side panel or a dialog
When the person presses Escape
Then only the list closes, and the event does not reach the layer under it

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-field-extras.spec.ts`.

### SC-UKV-913 — the autocomplete shows that suggestions are loading

Given suggestions are loading
When the panel is open with no suggestions yet, or with a page already shown
Then a spinner row stands in place of the empty result, or under the list

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-paging.spec.ts`.

### SC-UKV-914 — the autocomplete reports the end of the list

Given the panel is scrolled to its end
When the person keeps scrolling at the end, and a new page is loading
Then the end is reported once per list length and never while loading

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-paging.spec.ts`.

### SC-UKV-915 — the autocomplete takes its own empty result

Given an own empty text or an own empty template
When nothing is found
Then the own text, or the template with the typed query, stands instead of the kit label

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-paging.spec.ts`.

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

### SC-UKV-919 — the toggle group takes its value from a form

Given a toggle group bound to a reactive form control or to a signal form field, single or multiple
When the form writes a value, the person presses a segment, or the form disables the control
Then the pressed segments follow the form, a press writes the value back and marks the control touched, and a disabled control takes no press

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-forms.spec.ts`.

### SC-UKV-920 — the toggle group draws the consumer's segment template

Given a toggle group with its own segment template
When the segments are drawn
Then the template stands in place of the icon and the label, and gets the option and whether it is pressed

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-forms.spec.ts`.

### SC-UKV-921 — the toggle group wraps its segments or stacks them

Given a toggle group with the wrap or the column layout
When the segments do not fit one row, or the column is asked
Then the segments go on to the next row, or stand one under another; the row layout stays as before

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-forms.spec.ts`.

### SC-UKV-922 — a closable tab asks the host to close it

Given tabs where some tabs are closable
When the person presses the cross of a tab, or presses Delete on a closable tab in focus
Then the host is asked to close that tab, the press does not choose it, and a disabled tab has no cross and is not closed

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-additions.spec.ts`.

### SC-UKV-923 — a tab shows its tooltip

Given a tab with a tooltip
When the pointer rests on it
Then the tooltip is shown; a tab with no visible label is named by its tooltip, and an invalid tab explains its error instead

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-additions.spec.ts`.

### SC-UKV-924 — a disabled tab explains why it is disabled

Given a disabled tab with a tooltip
When the pointer rests on it, or the person presses it
Then the tooltip is shown, and the press does not choose the tab

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-additions.spec.ts`.

### SC-UKV-925 — a tab draws a Material glyph

Given a tab with a Material glyph name
When the tab strip is drawn
Then the glyph stands in the tab title where the kit icon would

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-additions.spec.ts`.

### SC-UKV-926 — the tab strip works without the panel

Given tabs in the header-only mode
When the strip is drawn and the person chooses a tab
Then no tab panel is drawn and no tab points to one, and the choice is still reported

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-additions.spec.ts`.

### SC-UKV-927 — an action in the panel header does not toggle the panel

Given an expansion panel with buttons in its header actions
When the person presses an action, the header or the chevron
Then the action does its own work and the panel stays as it was; the header and the chevron toggle it

Covered: `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel-additions.spec.ts`.

### SC-UKV-928 — panels of a group open one at a time

Given several expansion panels laid out in a group
When the person opens one of them
Then the other panels collapse, unless the group allows several open panels

Covered: `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel-additions.spec.ts`.

### SC-UKV-929 — a collapsed panel keeps its content

Given an expansion panel that preserves its content
When the person types into its body, collapses it and opens it again
Then the typed text is still there, and the collapsed body takes no focus

Covered: `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel-additions.spec.ts`.

### SC-UKV-930 — a count bubble sits on the corner of an element

Given an element with a badge value, a corner and an overlap choice
When the element is drawn
Then the bubble shows the value at that corner, over the corner or beside it; an empty or hidden badge draws no bubble

Covered: `projects/ui-kit-v2/src/lib/components/badge/rt-badge.directive.spec.ts`.

### SC-UKV-931 — a divider separates groups

Given a divider, horizontal or vertical, with or without the inset
When it is drawn
Then a thin line stands across the parent, or along the row, and screen readers hear a separator of that orientation

Covered: `projects/ui-kit-v2/src/lib/components/divider/rt-divider.component.spec.ts`.

### SC-UKV-932 — a progress bar shows the share of a task

Given a progress bar with a share or with an unknown share
When the share changes, or goes past 0 or 100
Then the fill follows the share held between 0 and 100, and an unknown share runs a moving segment without announcing a number

Covered: `projects/ui-kit-v2/src/lib/components/progress-bar/rt-progress-bar.component.spec.ts`.

### SC-UKV-933 — a toast shows the application's own component with its data

Given the application opens a toast from its own component with data
When the toast is shown
Then the component stands in place of the message, reads the data and the toast handle, and the toast keeps its icon, cross and timer

Covered: `projects/ui-kit-v2/src/lib/components/toast/rt-toaster-additions.spec.ts`.

### SC-UKV-934 — the application closes and updates a shown toast

Given the application opened a toast and kept its handle
When it updates the text or closes the toast through the handle, or the person closes it
Then the toast changes in place or leaves, and the handle reports once why it left

Covered: `projects/ui-kit-v2/src/lib/components/toast/rt-toaster-additions.spec.ts`.

### SC-UKV-935 — a toast shows live progress and copyable details

Given a toast with a task share and with details
When the share changes and the person opens the details
Then the bar follows the share, and the details open under the message with a copy button

Covered: `projects/ui-kit-v2/src/lib/components/toast/rt-toaster-additions.spec.ts`.

### SC-UKV-936 — the right panel of the shell stands beside the content

Given a shell whose right panel is placed beside the content
When the panel is opened, then closed, and its place is switched to over the page while it is open
Then the content narrows by the panel width and widens back, and the switched panel stays open over the page

Covered: `projects/ui-kit-v2/src/lib/components/container/rt-container-right-panel.spec.ts`.

### SC-UKV-937 — the right panel over the page without a backdrop

Given a shell whose right panel lies over the page without a backdrop
When the panel is opened
Then no backdrop is drawn and the page keeps scrolling and taking presses

Covered: `projects/ui-kit-v2/src/lib/components/container/rt-container-right-panel.spec.ts`.

### SC-UKV-1014 — the right panel over the page fits a narrow window

Given a shell whose right panel lies over the page, in a window 375px wide
When the panel opens with a long paragraph inside, once without a width and once with a width of 320px
Then the panel is 375px wide and the paragraph wraps, in both cases; in a window 1100px wide the panel
with a width stands at the right edge 320px wide, and the panel beside the content keeps its width

Not covered: a test has no layout. Measured on the showcase in the stories **RightOver** and
**RightSide** with the paragraph added: before the fix the panel without a width was 9551px in a
375px window with the paragraph in one line, and the panel with a width stood 0–320 in a 375px
overlay; after it both stand 0–375 and the paragraph is 332px wide; at 1100px the panel with a width
stands 780–1100, and the panel beside the content is 280px as before.

### SC-UKV-938 — the panel width is changed by a handle

Given a panel with a width handle and width limits
When the person drags the handle, presses an arrow, Home or End on it
Then the new width is reported, held between the limits, and the handle announces the current width

Covered: `projects/ui-kit-v2/src/lib/components/container/rt-container-right-panel.spec.ts`, `projects/ui-kit-v2/src/lib/components/drawer/rt-drawer.component.spec.ts`, `projects/ui-kit-v2/src/lib/components/drawer/rt-resize-handle.component.spec.ts`.

### SC-UKV-939 — an embedded drawer opens beside or over the content

Given a drawer inside a page area, beside the content or over it
When it is opened, and the person presses the backdrop or Escape
Then beside the content it narrows the content, over the content it closes on either press, and a drawer that disables closing stays open

Covered: `projects/ui-kit-v2/src/lib/components/drawer/rt-drawer.component.spec.ts`.

### SC-UKV-940 — a closed drawer keeps its content and takes no focus

Given an opened drawer with typed text
When the drawer is closed and opened again
Then the text is still there, and while closed the drawer is out of the focus order

Covered: `projects/ui-kit-v2/src/lib/components/drawer/rt-drawer.component.spec.ts`.

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

### SC-UKV-943 — a vertical stepper lists every step

Given a stepper laid out vertically with a current step
When it is drawn
Then every step stands in a numbered list with a round numbered mark and its label, the marks are joined by a line, and the current step is announced as current

Covered: `projects/ui-kit-v2/src/lib/components/stepper/rt-stepper-vertical.spec.ts`.

### SC-UKV-944 — a step label is drawn by the consumer's template

Given a vertical stepper with a step label template
When it is drawn
Then each label is the template with its step and number in place of the plain label

Covered: `projects/ui-kit-v2/src/lib/components/stepper/rt-stepper-vertical.spec.ts`.

### SC-UKV-945 — a vertical stepper without a current step is a static instruction

Given a vertical stepper whose current index is below zero
When it is drawn
Then every mark is in the same neutral state, no step is announced as current, and no step takes focus

Covered: `projects/ui-kit-v2/src/lib/components/stepper/rt-stepper-vertical.spec.ts`.

### SC-UKV-947 — a button draws the focus ring only for focus not from the pointer

Given a kit button or icon button
When focus reaches it from code right after a mouse press or a touch
Then the button has focus and no focus ring, and focus from the keyboard or from code after the
keyboard draws the ring; the source stands on the button as the CDK classes `cdk-*-focused`

Covered: `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.spec.ts`,
`projects/ui-kit-v2/src/lib/components/icon-button/rt-icon-button.component.spec.ts`.

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

### SC-UKV-954 — an actionable icon is disabled while the field stays usable

Given an input with an actionable left icon that the host disables
When the field is drawn
Then the icon button is disabled and keeps its tooltip, and the field still takes input

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

### SC-UKV-968 — the chips appearance draws separate items without a track

Given a toggle button group with the chips appearance
When it is drawn
Then the host carries the chips mark, there is no track, the items stand 8 px apart, and every
item has its own outline; the segmented appearance stays the default

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-chips.spec.ts`.

### SC-UKV-969 — the checkmark stands before the label of a chosen item only

Given a group with the checkmark switched on and one item chosen
When it is drawn
Then the chosen item holds a check before its label and the others hold none; without the
checkmark no item holds one

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-chips.spec.ts`.

### SC-UKV-970 — under the preset a chip is Material's filter chip

Given a chips group of the small size under the material preset
When it is drawn
Then an item is 28 px high in every size, with 12 px side paddings, a 14 px / 500 font tracked
0.1 px, 8 px above the first row and below the last and 16 px between rows, the outline takes the theme's outline colour, a chosen item is filled with secondary-container without an outline, and
its check slot is 36 px

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-chips.spec.ts`.

### SC-UKV-971 — an unavailable item looks unavailable

Given an item of a group is unavailable
When it is drawn
Then a chip fades its text and outline in both presets, and a segment fades its text under the
material preset while the kit's own segmented look stays as it was

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-chips.spec.ts`.

### SC-UKV-972 — a column of chips stretches its items to the width of the place

Given a chips group laid out as a column, with or without the full width
When it is drawn
Then every item is as wide as the place the group stands in and keeps its own height, and in a
row flex parent the group takes the parent's free width itself

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-chips.spec.ts`.

### SC-UKV-979 — a filled field without a label keeps no room for one

Given a filled input, number, select or text area in a field without a label under the material
preset, with the hint row reserved
When it is drawn
Then the value stands in the middle of the field, an empty control shows its placeholder, the text
area has equal room above its first line and below its last, and the field keeps its hint row

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

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

### SC-UKV-982 — a value the form writes back during typing shows in the input

Given an input bound to a form control that shows a value
When the person empties it, and the host sets the control back to that same value in the same call
Then the field shows the value again, and the control holds it

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`.

### SC-UKV-983 — manual activation moves focus, Enter and Space open the tab

Given tabs with `activation="manual"`
When the person presses an arrow, Home or End on a tab
Then focus and the single tab stop move to the next enabled tab, the open tab and its panel stay,
and nothing is emitted; Enter or Space on the focused tab opens it. Without the input an arrow
opens the tab at once, as before

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-scroll-keys.spec.ts`.

### SC-UKV-984 — a press on a scroll arrow pages the tab list

Given a tab list wider than its place
When the person presses a scroll arrow and lets go before 300 ms
Then the list moves by 80 px by default, or by its visible width with `scrollStep="page"`, not past
its edge; held longer, it scrolls on until let
go and adds no page step on release; a pointer that leaves the arrow first moves nothing

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-scroll-keys.spec.ts`.

### SC-UKV-985 — scroll arrows can stand in their own places

Given tabs with `scrollArrows="inline"`
When the list overflows
Then both arrows stand at the edges beside the list, and the one with nothing to scroll to is
pale and takes no press; without overflow neither is drawn. Without the input the arrows lie over
the tabs, as before

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-scroll-keys.spec.ts`.

### SC-UKV-986 — the selected tab bar survives a zero border width

Given the tab border width property set to `0`
When a tab is selected
Then its bar stays at the bottom of the tab: the offset is a translate by the width, not a `calc`
that turns unitless and invalid at `0`

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-scroll-keys.spec.ts`.

### SC-UKV-987 — the panel of the previous tab leaves, the new one slides in

Given tabs with a panel duration above zero
When the selection moves to another tab, by a click or by `activeId`
Then the open panel itself, not a copy, leaves towards the side opposite to the move, and the new
panel slides in from the other side; the leaving one is hidden from reading and from focus, carries
its own anchor, and is removed when its own motion ends

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-motion.spec.ts`.

### SC-UKV-988 — motion is off at a zero duration and for reduced motion

Given the panel duration `0`, or a person who asked for reduced motion
When the selection moves
Then the panel changes in place, and the styles drop the bar transition and the panel animation

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-motion.spec.ts`.

### SC-UKV-989 — the duration input sets both motions

Given `animationDuration` as a number, a string of digits or a CSS time
When the tabs render
Then the bar and panel duration properties on the host carry it, digits read as milliseconds;
without the input the properties stay with the tokens, and the list scroll duration stays with its
token either way

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-motion.spec.ts`.

### SC-UKV-990 — the selected tab bar is one element of the list

Given tabs after their first render
When the selected tab is measured
Then one bar element of the list draws the selection, the tab's own bar goes transparent, and the
bar turns the error colour under an invalid selected tab

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-motion.spec.ts`.

### SC-UKV-991 — the body of a visited tab lives on with `preserveContent`

Given tabs with `preserveContent`
When the person types on a tab, leaves it and comes back
Then the same body shows what was typed; while inactive it is hidden, out of reading and out of the
tab order, a tab never opened is not created, and without the input the body is destroyed as before

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-preserve.spec.ts`.

### SC-UKV-992 — with preserved bodies the live panel leaves

Given tabs with `preserveContent` and a panel duration above zero
When the selection moves
Then the live body of the previous tab leaves, the new one slides in, and after the motion the
previous body stays hidden rather than removed

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-preserve.spec.ts`.

### SC-UKV-993 — an arrow scrolls the tab list smoothly by the chosen step

Given a tab list wider than its place and a scroll duration above zero
When the person presses a scroll arrow
Then the list's own scroll moves along the scroll curve for its duration and stops exactly at the
target, 80 px, a page or a third of the visible width by `scrollStep`; a second press counts from the
target of the running scroll, and a hold tick stops it and moves at once

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-scroll.spec.ts`.

### SC-UKV-994 — a half-hidden selected tab scrolls in, and motion can be off

Given a selected tab cut by the edge of the list
When it is chosen
Then the list scrolls it into view by the same motion; a fully visible tab does not move the list,
and a zero duration or reduced motion scrolls at once

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-scroll.spec.ts`.

### SC-UKV-995 — the close cross has its own tooltip, and the tab's own is silent over it

Given a closable tab with its own `tooltip` and a `closeTooltip`
When the pointer moves from the tab onto its close cross
Then the tab's tooltip closes and only the cross's tooltip shows, on the side `closeTooltipPlacement`
names; without `closeTooltip` no tooltip shows over the cross, and once the pointer leaves the cross,
or the cross is removed from under it, the tab shows its own tooltip again

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-close.spec.ts`.

### SC-UKV-996 — the look of the close cross comes from its properties

Given a closable tab
When the application sets the `--rt-tab-item-close-*` properties on `.rt-tab-item`
Then the cross takes its rest and hover background, its rest and hover icon colour, its icon size and
its inline margins from them; left unset, the cross looks as before

Не покрыто: jsdom не считает стили компонента; вид крестика измерен в витрине до и после правки.

### SC-UKV-997 — a folder matched by its name alone stands open during the search

Given the submenu holds the folder «Отчёты» with the item «Выручка»
When the person types «отч»
Then the folder «Отчёты» stands open, still with no items inside, and the folders on the way to a
matched item stand open as before

Covered: `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu.logic.spec.ts`.

### SC-UKV-998 — a collapsed favourites block keeps its count during the search

Given the favourites block of the section is collapsed and the count is shown for a collapsed block
When the person types a query that matches one of its rows
Then the block shows that row, and its title keeps the count of the rows that matched; once the
query is cleared, the block is collapsed again with the count of all its rows, and an open block
without a search shows no count

Covered: `projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-favorites.logic.spec.ts`.

### SC-UKV-999 — the open panel can leave the Tab order

Given tabs whose open panel holds a field
When the application sets `contentTabIndex` to `null` and the person presses Tab on the active tab
Then the focus goes straight to the field, and the panel carries no `tabindex`; without the input the
panel keeps `tabindex="0"` and takes the focus first, as before

Покрытие: частичное — тест проверяет атрибут панели; переход фокуса по Tab проверен в витрине.

### SC-UKV-1000 — a toaster shows only the toasts of its channel

Given a toaster without `channel` and a second toaster with `channel="status"`
When the application sends an ordinary toast and three toasts with `channel: 'status'` and
`duration: null`
Then the ordinary toast stands only in the first toaster, the three stand only in the second one,
stacked, and stay there until the application dismisses each of them; a toast without a channel and
a toaster without the input keep the former behaviour

Covered: `projects/ui-kit-v2/src/lib/components/toast/rt-toaster-additions.spec.ts`.

### SC-UKV-1001 — a bare toast draws only its component

Given a component that draws its own card and its own close button
When the application opens it with `bare: true`
Then the toast draws no background, border, padding, shadow, rounding, icon, close cross or timer
bar; the component keeps its place in the stack, the enter and leave motion, the handle and the
name for screen readers, and closes the toast through the handle; without `bare` the toast looks
as before

Покрытие: частичное — тест проверяет разметку и ручку; снятая оболочка проверена измерением в витрине.

### SC-UKV-1002 — a drawer lets its content spill out and takes the width of its content

Given an open drawer whose content holds a sub-panel placed beside it
When the application sets `overflow` to `visible` and `width` to `null`
Then the sub-panel shows outside the drawer edge, and the drawer is as wide as its content, with no
resize handle; a closing drawer clips its content at once; without the inputs the drawer clips its
content and keeps its width in pixels, as before

Покрытие: частичное — тест проверяет модификаторы и ширину; выход подпанели за край проверен измерением в витрине.

### SC-UKV-1003 — a drawer reports the start and the end of opening and closing

Given a drawer whose owner listens to `openedStart`, `closedStart`, `afterOpened` and `afterClosed`
When the drawer opens or closes
Then the start comes at the moment `opened` changes, and the end comes after the width or slide
transition, at once without motion; the initial state reports nothing, and an end overtaken by a
new change stays silent

Covered: `projects/ui-kit-v2/src/lib/components/drawer/rt-drawer.component.spec.ts`.

### SC-UKV-1004 — a drawer puts the focus where the application says and reports a backdrop press

Given a drawer with `autoFocus` and a backdrop
When the drawer opens, and then the person presses the backdrop
Then a selector puts the focus on its node in any mode, `false` leaves the focus where it was, and
without the input the drawer over the content focuses itself as before; the backdrop press comes as
`backdropClick` before the close, and also with `disableClose`

Covered: `projects/ui-kit-v2/src/lib/components/drawer/rt-drawer.component.spec.ts`.

### SC-UKV-1005 — an expansion panel takes its body line height, font size and box sizing from properties

Given an expansion panel inside a styling preset that sets `--rt-expansion-panel-body-line-height`,
`--rt-expansion-panel-body-font-size` and `--rt-expansion-panel-box-sizing`
When the panel body is drawn
Then the body takes the preset's line height and font size, and the panel takes its box sizing;
without the preset the body inherits both as before, and the panel stays `border-box`

Покрытие: частичное. Тест читает стили панели; сами значения проверены измерением в витрине.

### SC-UKV-1006 — an expansion panel body takes its box sizing apart from the panel

Given an expansion panel whose host keeps `border-box` and fills its container
When a styling preset sets `--rt-expansion-panel-body-box-sizing: content-box`
Then only the body and, under an inheriting reset, its content take `content-box`, and the panel
stays as wide as its container; without the property the body inherits the panel's box sizing

Покрытие: частичное. Тест читает стили панели; ширина панели и размер кружка проверены измерением в
витрине.

### SC-UKV-1007 — tooltip defaults come from the kit settings

Given an application that passes `provideRtKit({ components: { tooltip: { … } } })`
When a tooltip or an icon button with a tooltip has no input of its own for that value
Then it takes `hideOnClick`, `placement` and `showDelay` from the settings; an input on the element
still wins, and without the settings the kit keeps `true`, its own side and 300 ms

Covered: `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.spec.ts`,
`projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.logic.spec.ts`,
`projects/ui-kit-v2/src/lib/components/icon-button/rt-icon-button.component.spec.ts`.

### SC-UKV-1012 — field letter spacing and the per-page font size come from consumer handles

Given an application that sets `--rt-input-letter-spacing`, `--rt-field-label-letter-spacing` or
`--rt-pagination-field-font-size`
When a field, a select, a number field, a text area or the pagination's per-page value is drawn
Then the value and the label take that spacing and the per-page value that size; without the handles
the field label and the select's value inherit the spacing from the page as before, the input,
number field and text area keep the browser's `normal`, and the per-page value keeps the field's
size

Покрытие: частичное. Тест читает стили компонентов; значения проверены измерением в витрине.
