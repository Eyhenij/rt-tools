# Scenarios — the field's label on the border, actionable icons and the clearing cross

Numbers continue the second kit's numbering and do not change after the merge. While a scenario is
not covered, it carries the mark «Не покрыто» with the reason.

### SC-UKV-907 — the option template replaces the row label

Given the select holds an option template
When the list is opened
Then each row draws the template with its option, and the check mark stays on the chosen row

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-field-extras.spec.ts`.

### SC-UKV-857 — without an option template the row draws the label

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

### SC-UKV-858 — the label on the border lies at the placeholder's place on an empty field

Given the input names a label on the border and holds no value
When the field is drawn at rest
Then the label is not risen and the native field has no placeholder

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`.

### SC-UKV-859 — the label rises on a value and on focus

Given the input names a label on the border
When the field gets a value, or the field is focused while empty
Then the label is risen

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`.

### SC-UKV-860 — the select's label rises on a value and on an open list

Given the select names a label on the border
When an option is chosen, or the list is opened while nothing is chosen
Then the label is risen

Covered: `projects/ui-kit-v2/src/lib/components/select/rt-select-field-extras.spec.ts`.

### SC-UKV-861 — the label names the control without an aria label

Given the field names a label on the border and no aria label
When the field is drawn
Then the control is named by the label's text

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`, `projects/ui-kit-v2/src/lib/components/select/rt-select-field-extras.spec.ts`.

### SC-UKV-862 — an actionable icon is a button reported by its output

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

Given a field carrying the material preset sign itself, with no sign on an ancestor
When the field is drawn
Then its label lies inside the control, as under a sign on an ancestor

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-910 — a filled field under the preset follows the Material filled field

Given a filled input or select with a label under the material preset
When the field is empty, holds a value or is in focus
Then the value starts below the risen label, the label starts 16 px from the edge, only the bottom
line is drawn and focus thickens it, and the message under the field starts at the field's text

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.

### SC-UKV-911 — field colours and the left icon under the preset follow the Material theme

Given a field under the material preset on a page with a Material theme
When the field is drawn
Then the placeholder, the resting label, the icons and the arrow take the theme's muted colour, the
caret takes the brand colour, and the left icon is 24 px, 12 px from the edge and 16 px from the text

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

### SC-UKV-915 — an icon button inside a field is never taller than the field

Given a small field or a field with an own low height, holding a clearing cross
When the field is drawn
Then the field keeps its height, and the cross shrinks to the field inside its border

Covered: `projects/ui-kit-v2/src/lib/components/field/rt-field-material-metrics.spec.ts`.
