# Scenarios — the field's label on the border, actionable icons and the clearing cross

Numbers continue the second kit's numbering and do not change after the merge. While a scenario is
not covered, it carries the mark «Не покрыто» with the reason.

### SC-UKV-907 — the option template replaces the row label

Given the select holds an option template
When the list is opened
Then each row draws the template with its option, and the check mark stays on the chosen row

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-field-extras.spec.ts`.

### SC-UKV-932 — without an option template the row draws the label

Given the select holds no option template
When the list is opened
Then each row draws the option label as before

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-field-extras.spec.ts`.

### SC-UKV-905 — the option template draws the chosen value in the field too

Given the select holds an option template and a chosen value
When the field is drawn
Then the field draws the template with the chosen option in place of the bare label, and an empty
field draws the placeholder

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-field-extras.spec.ts`.

### SC-UKV-933 — the label on the border lies at the placeholder's place on an empty field

Given the input names a label on the border and holds no value
When the field is drawn at rest
Then the label is not risen and the native field has no placeholder

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`.

### SC-UKV-934 — the label rises on a value and on focus

Given the input names a label on the border
When the field gets a value, or the field is focused while empty
Then the label is risen

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`.

### SC-UKV-935 — the select's label rises on a value and on an open list

Given the select names a label on the border
When an option is chosen, or the list is opened while nothing is chosen
Then the label is risen

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-field-extras.spec.ts`.

### SC-UKV-936 — the label names the control without an aria label

Given the field names a label on the border and no aria label
When the field is drawn
Then the control is named by the label's text

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`, `projects/ui-kit-v2/src/lib/components/select/rt-select-field-extras.spec.ts`.

### SC-UKV-937 — an actionable icon is a button reported by its output

Given the input marks its left icon as actionable
When the icon is pressed by the mouse, by Enter or by Space
Then the left output reports each press, and the focus does not move into the native field

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`.

### SC-UKV-863 — an actionable icon carries a tooltip and a name

Given the input marks its right icon as actionable and gives it a tooltip
When the field is drawn
Then the icon button is named by the tooltip text and shows it on hover and focus

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`.

### SC-UKV-864 — an icon not marked as actionable stays a picture

Given the input names icons and marks neither as actionable
When the field is drawn
Then no icon is a button

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`.

### SC-UKV-865 — the cross enters the Tab order on demand

Given the input or the select asks for a tabbable cross and holds a value
When the field is drawn
Then the cross is reached by the Tab key; without the demand it stays out of the order

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`, `projects/ui-kit-v2/src/lib/components/select/rt-select-field-extras.spec.ts`.

### SC-UKV-866 — clearing reports to the host

Given a field holds a value
When the cross is pressed
Then the form gets the empty value first, and the clearing output fires once after it

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`, `projects/ui-kit-v2/src/lib/components/select/rt-select-field-extras.spec.ts`.

### SC-UKV-867 — the checkbox takes its mark from an input without a form

Given a checkbox outside a form with the mark given by its input
When the person presses it
Then the mark shown is the input's, and the new mark is reported by the change output

Covered: `projects/ui-kit-v2/src/lib/components/checkbox/rt-checkbox.component.spec.ts`.

### SC-UKV-868 — a radio group names itself to assistive technology

Given radio buttons inside a radio group with a name
When the group is drawn
Then it is declared a radio group under that name

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-group.component.spec.ts`.

### SC-UKV-869 — arrows move the choice and the focus inside the group

Given a radio group with a disabled member
When the person presses an arrow on a radio button
Then the next enabled radio button, wrapping around, is chosen and focused

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-group.component.spec.ts`.

### SC-UKV-870 — a radio group has one Tab stop

Given a radio group
When it is drawn without a choice, and then with one
Then only the first enabled radio button, and then only the chosen one, is in the Tab order

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-group.component.spec.ts`.

### SC-UKV-871 — Escape in an open list closes one layer

Given a select, multiselect, autocomplete or menu is open inside a side panel or a dialog
When the person presses Escape
Then only the list closes, and the event does not reach the layer under it

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-field-extras.spec.ts`.

### SC-UKV-872 — the autocomplete shows that suggestions are loading

Given suggestions are loading
When the panel is open with no suggestions yet, or with a page already shown
Then a spinner row stands in place of the empty result, or under the list

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-paging.spec.ts`.

### SC-UKV-873 — the autocomplete reports the end of the list

Given the panel is scrolled to its end
When the person keeps scrolling at the end, and a new page is loading
Then the end is reported once per list length and never while loading

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-paging.spec.ts`.

### SC-UKV-874 — the autocomplete takes its own empty result

Given an own empty text or an own empty template
When nothing is found
Then the own text, or the template with the typed query, stands instead of the kit label

Covered: `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete-paging.spec.ts`.

### SC-UKV-875 — under the material preset the field label lies inside the control

Given an `rt-field` with a label around an input, a textarea, a number field or a select, under the material preset
When the control is empty and unfocused, then filled or focused
Then the label stands at the placeholder's place, then on the top border, and the field height does not change

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material.spec.ts`.

### SC-UKV-876 — under the material preset the asterisk takes the label colour

Given a required `rt-field` under the material preset
When the field is valid, then invalid
Then the asterisk has the label colour, then the error colour

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material.spec.ts`.

### SC-UKV-877 — under the material preset the select triangle turns while open

Given an `rt-select` under the material preset
When its list opens
Then the triangle turns 180° with the kit's caret duration, and turns back on close

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material.spec.ts`.

### SC-UKV-878 — the toggle group takes its value from a form

Given a toggle group bound to a reactive form control or to a signal form field, single or multiple
When the form writes a value, the person presses a segment, or the form disables the control
Then the pressed segments follow the form, a press writes the value back and marks the control touched, and a disabled control takes no press

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-forms.spec.ts`.

### SC-UKV-879 — the toggle group draws the consumer's segment template

Given a toggle group with its own segment template
When the segments are drawn
Then the template stands in place of the icon and the label, and gets the option and whether it is pressed

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-forms.spec.ts`.

### SC-UKV-880 — the toggle group wraps its segments or stacks them

Given a toggle group with the wrap or the column layout
When the segments do not fit one row, or the column is asked
Then the segments go on to the next row, or stand one under another; the row layout stays as before

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-forms.spec.ts`.

### SC-UKV-881 — a closable tab asks the host to close it

Given tabs where some tabs are closable
When the person presses the cross of a tab, or presses Delete on a closable tab in focus
Then the host is asked to close that tab, the press does not choose it, and a disabled tab has no cross and is not closed

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-additions.spec.ts`.

### SC-UKV-882 — a tab shows its tooltip

Given a tab with a tooltip
When the pointer rests on it
Then the tooltip is shown; a tab with no visible label is named by its tooltip, and an invalid tab explains its error instead

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-additions.spec.ts`.

### SC-UKV-883 — a disabled tab explains why it is disabled

Given a disabled tab with a tooltip
When the pointer rests on it, or the person presses it
Then the tooltip is shown, and the press does not choose the tab

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-additions.spec.ts`.

### SC-UKV-884 — a tab draws a Material glyph

Given a tab with a Material glyph name
When the tab strip is drawn
Then the glyph stands in the tab title where the kit icon would

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-additions.spec.ts`.

### SC-UKV-885 — the tab strip works without the panel

Given tabs in the header-only mode
When the strip is drawn and the person chooses a tab
Then no tab panel is drawn and no tab points to one, and the choice is still reported

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-additions.spec.ts`.

### SC-UKV-886 — an action in the panel header does not toggle the panel

Given an expansion panel with buttons in its header actions
When the person presses an action, the header or the chevron
Then the action does its own work and the panel stays as it was; the header and the chevron toggle it

Covered: `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel-additions.spec.ts`.

### SC-UKV-887 — panels of a group open one at a time

Given several expansion panels laid out in a group
When the person opens one of them
Then the other panels collapse, unless the group allows several open panels

Covered: `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel-additions.spec.ts`.

### SC-UKV-888 — a collapsed panel keeps its content

Given an expansion panel that preserves its content
When the person types into its body, collapses it and opens it again
Then the typed text is still there, and the collapsed body takes no focus

Covered: `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel-additions.spec.ts`.

### SC-UKV-889 — a count bubble sits on the corner of an element

Given an element with a badge value, a corner and an overlap choice
When the element is drawn
Then the bubble shows the value at that corner, over the corner or beside it; an empty or hidden badge draws no bubble

Covered: `projects/ui-kit-v2/src/lib/components/badge/rt-badge.directive.spec.ts`.

### SC-UKV-890 — a divider separates groups

Given a divider, horizontal or vertical, with or without the inset
When it is drawn
Then a thin line stands across the parent, or along the row, and screen readers hear a separator of that orientation

Covered: `projects/ui-kit-v2/src/lib/components/divider/rt-divider.component.spec.ts`.

### SC-UKV-891 — a progress bar shows the share of a task

Given a progress bar with a share or with an unknown share
When the share changes, or goes past 0 or 100
Then the fill follows the share held between 0 and 100, and an unknown share runs a moving segment without announcing a number

Covered: `projects/ui-kit-v2/src/lib/components/progress-bar/rt-progress-bar.component.spec.ts`.

### SC-UKV-892 — a toast shows the application's own component with its data

Given the application opens a toast from its own component with data
When the toast is shown
Then the component stands in place of the message, reads the data and the toast handle, and the toast keeps its icon, cross and timer

Covered: `projects/ui-kit-v2/src/lib/components/toast/rt-toaster-additions.spec.ts`.

### SC-UKV-893 — the application closes and updates a shown toast

Given the application opened a toast and kept its handle
When it updates the text or closes the toast through the handle, or the person closes it
Then the toast changes in place or leaves, and the handle reports once why it left

Covered: `projects/ui-kit-v2/src/lib/components/toast/rt-toaster-additions.spec.ts`.

### SC-UKV-894 — a toast shows live progress and copyable details

Given a toast with a task share and with details
When the share changes and the person opens the details
Then the bar follows the share, and the details open under the message with a copy button

Covered: `projects/ui-kit-v2/src/lib/components/toast/rt-toaster-additions.spec.ts`.

### SC-UKV-895 — the right panel of the shell stands beside the content

Given a shell whose right panel is placed beside the content
When the panel is opened, then closed, and its place is switched to over the page while it is open
Then the content narrows by the panel width and widens back, and the switched panel stays open over the page

Covered: `projects/ui-kit-v2/src/lib/components/container/rt-container-right-panel.spec.ts`.

### SC-UKV-896 — the right panel over the page without a backdrop

Given a shell whose right panel lies over the page without a backdrop
When the panel is opened
Then no backdrop is drawn and the page keeps scrolling and taking presses

Covered: `projects/ui-kit-v2/src/lib/components/container/rt-container-right-panel.spec.ts`.

### SC-UKV-897 — the panel width is changed by a handle

Given a panel with a width handle and width limits
When the person drags the handle, presses an arrow, Home or End on it
Then the new width is reported, held between the limits, and the handle announces the current width

Covered: `projects/ui-kit-v2/src/lib/components/container/rt-container-right-panel.spec.ts`, `projects/ui-kit-v2/src/lib/components/drawer/rt-drawer.component.spec.ts`, `projects/ui-kit-v2/src/lib/components/drawer/rt-resize-handle.component.spec.ts`.

### SC-UKV-898 — an embedded drawer opens beside or over the content

Given a drawer inside a page area, beside the content or over it
When it is opened, and the person presses the backdrop or Escape
Then beside the content it narrows the content, over the content it closes on either press, and a drawer that disables closing stays open

Covered: `projects/ui-kit-v2/src/lib/components/drawer/rt-drawer.component.spec.ts`.

### SC-UKV-899 — a closed drawer keeps its content and takes no focus

Given an opened drawer with typed text
When the drawer is closed and opened again
Then the text is still there, and while closed the drawer is out of the focus order

Covered: `projects/ui-kit-v2/src/lib/components/drawer/rt-drawer.component.spec.ts`.

### SC-UKV-900 — under the material preset a field has the Material size and density

Given fields under the material preset, some under a density step on the field or on an ancestor
When the fields are drawn
Then a field is 56 px high with a 16 px value at density 0 and 4 px lower per step down to 36 px at −5, and the kit's own look ignores the step

Covered: `projects/ui-kit-v2/src/styles/density.styles.spec.ts`.

### SC-UKV-901 — under the material preset the field border darkens on hover

Given an outlined field under the material preset
When the pointer rests on it, and then the field is focused, invalid or disabled
Then the border takes the text colour on hover, and focus, error and disabled keep their own look

Не покрыто: jsdom не воспроизводит наведение; рамка при наведении измерена в витрине.

### SC-UKV-902 — a vertical stepper lists every step

Given a stepper laid out vertically with a current step
When it is drawn
Then every step stands in a numbered list with a round numbered mark and its label, the marks are joined by a line, and the current step is announced as current

Covered: `projects/ui-kit-v2/src/lib/components/stepper/rt-stepper-vertical.spec.ts`.

### SC-UKV-903 — a step label is drawn by the consumer's template

Given a vertical stepper with a step label template
When it is drawn
Then each label is the template with its step and number in place of the plain label

Covered: `projects/ui-kit-v2/src/lib/components/stepper/rt-stepper-vertical.spec.ts`.

### SC-UKV-904 — a vertical stepper without a current step is a static instruction

Given a vertical stepper whose current index is below zero
When it is drawn
Then every mark is in the same neutral state, no step is announced as current, and no step takes focus

Covered: `projects/ui-kit-v2/src/lib/components/stepper/rt-stepper-vertical.spec.ts`.

### SC-UKV-906 — a button draws the focus ring only for focus not from the pointer

Given a kit button or icon button
When focus reaches it from code right after a mouse press or a touch
Then the button has focus and no focus ring, and focus from the keyboard or from code after the
keyboard draws the ring; the source stands on the button as the CDK classes `cdk-*-focused`

Covered: `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.spec.ts`,
`projects/ui-kit-v2/src/lib/components/icon-button/rt-icon-button.component.spec.ts`.

### SC-UKV-908 — a density step on an ancestor reaches a field with its own preset sign

Given a density step on the page root and the material preset sign on the field itself
When the field is drawn
Then the field takes the height of that step, and an own field height set on an ancestor beats it

Covered: `projects/ui-kit-v2/src/styles/density.styles.spec.ts`.

### SC-UKV-909 — the preset sign on the field itself puts the label inside

Given a field, an input or a select carrying the material preset sign itself, with no sign on an
ancestor
When it is drawn
Then the field's label lies inside the control, and the control's own label on the border breaks
the border, hides the placeholder and stands inside a filled control, as under a sign on an ancestor

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-910 — a filled field under the preset follows the Material filled field

Given a filled input, number field or select with a label under the material preset
When the field is empty, holds a value or is in focus
Then the value starts below the risen label, the label starts 16 px from the edge, only the bottom
line is drawn and focus thickens it, and the message under the field starts at the field's text

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-911 — field colours and the left icon under the preset follow the Material theme

Given a field under the material preset on a page with a Material theme
When the field is drawn
Then the placeholder, the resting label, the icons and the arrow take the theme's muted colour, the
caret takes the brand colour, and an icon on either side is 24 px, 12 px from the edge and 4 px from
the text, so the text and the resting label after a left icon start at 40 px

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-912 — the required mark stands right after the label under the preset

Given a required field
When it is drawn under the material preset and in the kit look
Then under the preset the mark stands right after the label, and the kit look keeps a gap

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-913 — an actionable icon is disabled while the field stays usable

Given an input with an actionable left icon that the host disables
When the field is drawn
Then the icon button is disabled and keeps its tooltip, and the field still takes input

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-914 — a field's least width is set on an ancestor

Given an input or select in a row sized by its content
When the application sets a least width on an ancestor
Then the field is no narrower than it whatever the value, and without it the field is as before

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-915 — under the preset an icon button inside a field is never taller than the field

Given a small field or a field with an own low height under the material preset, holding a
clearing cross
When the field is drawn
Then the field keeps its height, and the cross shrinks to the field inside its border; the kit's own
look keeps the button's own size, as before the preset work

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-916 — under the preset the text starts 16 px from the outer edge

Given an outlined or filled input, number field, select or text area under the material preset
When it is drawn
Then its text and its resting label start 16 px from the outer edge, and the kit look keeps 17 px

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-917 — a disabled field under the preset is not faded as a whole

Given a disabled input, number field, select or text area under the material preset
When it is drawn
Then the box keeps full opacity, the border is on-surface at 12%, the text, placeholder, label and
the select's arrow are on-surface at 38%, and the kit look still fades the field

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-918 — under the preset the clearing cross is the first kit's cross

Given a clearable input or select under the material preset
When it holds a value
Then the cross button is 19 px with a grey 12 px icon, the input's cross stands 8 px from the
field edge, and the kit look keeps a 32 px button

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-919 — under the preset the line under a field is Material's subscript

Given a field under the material preset that reserves its message line or shows a hint
When it is drawn
Then the line is 16 px high with 4 px above it, a 52 px field with a reserved line takes 72 px,
and the kit look keeps its line

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-920 — a textarea takes the filled look

Given a textarea with `appearance="fill"`
When it is drawn, and when it lies in a field under the material preset
Then it is filled with an underline like a filled input, and under the preset its label lies
inside it above the first line

Covered: `projects/ui-kit-v2/src/lib/components/textarea/rt-textarea.component.spec.ts`,
`projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-921 — under the preset the clearing cross lies on a round grey ground

Given a clearable input or select under the material preset
When it holds a value
Then the cross lies on the first kit's round grey ground, and the kit look keeps it transparent

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-922 — under the preset an icon button stands where a plain icon stands

Given an input under the material preset with an icon button on the left or on the right
When it is drawn
Then its icon stands 12 px from the field edge and the text starts at 40 px, as with a plain icon

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-923 — under the preset a clearable input keeps Material's right inset

Given a clearable input under the material preset without an icon on the right
When it is empty, and when it holds a value
Then the empty field's text runs to 4 px from the right edge, and with a value the cross stands
4 px after the text and 8 px from the edge

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-924 — under the preset a disabled filled field takes Material's disabled fill

Given a disabled filled input, select, number or textarea under the material preset
When it is drawn
Then its fill is on-surface 4 %, and the kit look keeps its fill

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-925 — under the preset a select whose value is drawn by an option template keeps Material's height

Given a filled select under the material preset whose chosen value is drawn by an option template
with an icon
When it is drawn
Then the select is 52 px high, as without the template

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-926 — under the preset a filled textarea keeps Material's height

Given a filled textarea of 4 rows in a field under the material preset
When it is drawn
Then it is 124 px high — 22 px above the text and 6 px below it with the underline — and no gap
stands under it

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-927 — the chips appearance draws separate items without a track

Given a toggle button group with the chips appearance
When it is drawn
Then the host carries the chips mark, there is no track, the items stand 8 px apart, and every
item has its own outline; the segmented appearance stays the default

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-chips.spec.ts`.

### SC-UKV-928 — the checkmark stands before the label of a chosen item only

Given a group with the checkmark switched on and one item chosen
When it is drawn
Then the chosen item holds a check before its label and the others hold none; without the
checkmark no item holds one

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-chips.spec.ts`.

### SC-UKV-929 — under the preset a chip is Material's filter chip

Given a chips group of the small size under the material preset
When it is drawn
Then an item is 28 px high in every size, with 12 px side paddings, a 14 px / 500 font tracked
0.1 px, 8 px above the first row and below the last and 16 px between rows, the outline takes the theme's outline colour, a chosen item is filled with secondary-container without an outline, and
its check slot is 36 px

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-chips.spec.ts`.

### SC-UKV-930 — an unavailable item looks unavailable

Given an item of a group is unavailable
When it is drawn
Then a chip fades its text and outline in both presets, and a segment fades its text under the
material preset while the kit's own segmented look stays as it was

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-chips.spec.ts`.

### SC-UKV-931 — a column of chips stretches its items to the width of the place

Given a chips group laid out as a column, with or without the full width
When it is drawn
Then every item is as wide as the place the group stands in and keeps its own height, and in a
row flex parent the group takes the parent's free width itself

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-chips.spec.ts`.

### SC-UKV-938 — a filled field without a label keeps no room for one

Given a filled input, number, select or text area in a field without a label under the material
preset, with the hint row reserved
When it is drawn
Then the value stands in the middle of the field, an empty control shows its placeholder, the text
area has equal room above its first line and below its last, and the field keeps its hint row

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-939 — the row fields of a dynamic selector stay out of the host form

Given an editable dynamic input bound by a form control name inside the host's form group
When the pencil of a row is pressed, or the field for a new row is opened
Then the console gets no NG01354 warning, the host form keeps only its own controls, and typing
with Enter applies the edit as before

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/dynamic-input/rt-dynamic-input-host-form.spec.ts`.

### SC-UKV-940 — the inner fields of other kit components stay out of the host form

Given one of seven kit components inside the host's form group: a select with a filter, a tree
selector, a profile menu with locales, a filter control on a narrow screen, a theme toggle as a
switch, workspace details with an agent and toggles, or a selectable dynamic list
When its inner field is shown, and the select panel and the agent edit are opened by a press
Then the console gets no NG01354 warning, and the host form keeps only its own controls

Covered: `projects/ui-kit-v2/src/lib/components/rt-host-form-ngmodel.spec.ts`.

### SC-UKV-941 — a value the form writes back during typing shows in the input

Given an input bound to a form control that shows a value
When the person empties it, and the host sets the control back to that same value in the same call
Then the field shows the value again, and the control holds it

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`.

### SC-UKV-942 — manual activation moves focus, Enter and Space open the tab

Given tabs with `activation="manual"`
When the person presses an arrow, Home or End on a tab
Then focus and the single tab stop move to the next enabled tab, the open tab and its panel stay,
and nothing is emitted; Enter or Space on the focused tab opens it. Without the input an arrow
opens the tab at once, as before

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-scroll-keys.spec.ts`.

### SC-UKV-943 — a press on a scroll arrow pages the tab list

Given a tab list wider than its place
When the person presses a scroll arrow and lets go before 300 ms
Then the list moves by its visible width, not past its edge; held longer, it scrolls on until let
go and adds no page step on release; a pointer that leaves the arrow first moves nothing

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-scroll-keys.spec.ts`.

### SC-UKV-944 — scroll arrows can stand in their own places

Given tabs with `scrollArrows="inline"`
When the list overflows
Then both arrows stand at the edges beside the list, and the one with nothing to scroll to is
pale and takes no press; without overflow neither is drawn. Without the input the arrows lie over
the tabs, as before

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-scroll-keys.spec.ts`.

### SC-UKV-945 — the selected tab bar survives a zero border width

Given the tab border width property set to `0`
When a tab is selected
Then its bar stays at the bottom of the tab: the offset is a translate by the width, not a `calc`
that turns unitless and invalid at `0`

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-scroll-keys.spec.ts`.

### SC-UKV-946 — the panel of the previous tab leaves, the new one slides in

Given tabs with a panel duration above zero
When the selection moves to another tab, by a click or by `activeId`
Then the open panel itself, not a copy, leaves towards the side opposite to the move, and the new
panel slides in from the other side; the leaving one is hidden from reading and from focus, carries
its own anchor, and is removed when its own motion ends

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-motion.spec.ts`.

### SC-UKV-947 — motion is off at a zero duration and for reduced motion

Given the panel duration `0`, or a person who asked for reduced motion
When the selection moves
Then the panel changes in place, and the styles drop the bar transition and the panel animation

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-motion.spec.ts`.

### SC-UKV-948 — the duration input sets both motions

Given `animationDuration` as a number, a string of digits or a CSS time
When the tabs render
Then the bar and panel duration properties on the host carry it, digits read as milliseconds;
without the input the properties stay with the tokens

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-motion.spec.ts`.

### SC-UKV-949 — the selected tab bar is one element of the list

Given tabs after their first render
When the selected tab is measured
Then one bar element of the list draws the selection, the tab's own bar goes transparent, and the
bar turns the error colour under an invalid selected tab

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-motion.spec.ts`.

### SC-UKV-950 — the body of a visited tab lives on with `preserveContent`

Given tabs with `preserveContent`
When the person types on a tab, leaves it and comes back
Then the same body shows what was typed; while inactive it is hidden, out of reading and out of the
tab order, a tab never opened is not created, and without the input the body is destroyed as before

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-preserve.spec.ts`.

### SC-UKV-951 — with preserved bodies the live panel leaves

Given tabs with `preserveContent` and a panel duration above zero
When the selection moves
Then the live body of the previous tab leaves, the new one slides in, and after the motion the
previous body stays hidden rather than removed

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-preserve.spec.ts`.

### SC-UKV-952 — an arrow scrolls the tab list smoothly by the chosen step

Given a tab list wider than its place and a scroll duration above zero
When the person presses a scroll arrow
Then the list's own scroll moves along the scroll curve for its duration and stops exactly at the
target, a page or a third of the visible width by `scrollStep`; a second press counts from the
target of the running scroll, and a hold tick stops it and moves at once

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-scroll.spec.ts`.

### SC-UKV-953 — a half-hidden selected tab scrolls in, and motion can be off

Given a selected tab cut by the edge of the list
When it is chosen
Then the list scrolls it into view by the same motion; a fully visible tab does not move the list,
and a zero duration or reduced motion scrolls at once

Covered: `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs-scroll.spec.ts`.
