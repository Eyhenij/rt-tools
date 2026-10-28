# Scenarios — what the other parts of the kit give an application moving from Material

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers go through
and were not recounted at the merge: the titles of the tests refer to them.

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

### SC-UKV-1007 — tooltip defaults come from the kit settings

Given an application that passes `provideRtKit({ components: { tooltip: { … } } })`
When a tooltip or an icon button with a tooltip has no input of its own for that value
Then it takes `hideOnClick`, `placement` and `showDelay` from the settings; an input on the element
still wins, and without the settings the kit keeps `true`, its own side and 300 ms

Covered: `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.spec.ts`,
`projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.logic.spec.ts`,
`projects/ui-kit-v2/src/lib/components/icon-button/rt-icon-button.component.spec.ts`.

### SC-UKV-1017 — a tooltip's own delay wins over the kit settings

Given an application whose kit settings set the tooltip delay to 100 ms
When the pointer enters an element whose tooltip has a delay of 500 ms of its own
Then the tooltip is not shown at 499 ms and is shown at 500 ms

Covered: `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.spec.ts`.

### SC-UKV-1018 — without a delay of its own a tooltip waits the shared one

Given no kit settings, one tooltip without a delay of its own and one with 500 ms
When the pointer enters each in turn
Then the first is shown at 300 ms, and the second is still hidden at 300 ms and shown at 500 ms

Covered: `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.spec.ts`.

### SC-UKV-1020 — a radio group names itself to assistive technology

Given radio buttons inside a radio group with a name
When the group is drawn
Then it is declared a radio group under that name

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-group.component.spec.ts`.

### SC-UKV-1021 — arrows move the choice and the focus inside the group

Given a radio group with a disabled member
When the person presses an arrow on a radio button
Then the next enabled radio button, wrapping around, is chosen and focused

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-group.component.spec.ts`.

### SC-UKV-1022 — a radio group has one Tab stop

Given a radio group
When it is drawn without a choice, and then with one
Then only the first enabled radio button, and then only the chosen one, is in the Tab order

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-group.component.spec.ts`.

### SC-UKV-1032 — Escape closes an open tooltip and stops at the host

Given a host focused from the keyboard with its tooltip open
When the person presses Escape
Then the tooltip hides, the key does not reach the parent and the focus stays on the host

Covered: `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.spec.ts`.

### SC-UKV-1033 — Escape with no tooltip open reaches the parent

Given a host whose tooltip is not shown, or is still waiting for its delay
When the person presses Escape
Then the key reaches the parent, and no tooltip appears after the delay

Covered: `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.spec.ts`.

### SC-UKV-1034 — after Escape the tooltip shows again

Given a host whose tooltip was closed by Escape
When the host gets keyboard focus again, or the pointer comes in
Then the tooltip shows after the delay

Covered: `projects/ui-kit-v2/src/lib/components/tooltip/rt-tooltip.directive.spec.ts`.

### SC-UKV-1035 — an icon button given a route draws a link with the look of the button

Given an icon button with a route of the application
When it is drawn and pressed
Then the control is a link with the address of the route, the block, the look, the label and the
tooltip of the button, and the press reaches the application; without a route the control is a
button

Covered: `projects/ui-kit-v2/src/lib/components/icon-button/rt-icon-button.component.spec.ts`.

### SC-UKV-1036 — an unavailable icon-button link leads nowhere

Given an icon-button link that is disabled or loading
When the person presses it
Then the link has no address, is marked unavailable, leaves the Tab order, and the press goes no
further

Covered: `projects/ui-kit-v2/src/lib/components/icon-button/rt-icon-button.component.spec.ts`.

### SC-UKV-1037 — an icon button names the panel it opens

Given an icon button that opens a menu
When it is drawn
Then the button carries `aria-haspopup` with the kind of the panel; without the input it carries none

Covered: `projects/ui-kit-v2/src/lib/components/icon-button/rt-icon-button.component.spec.ts`.

### SC-UKV-1038 — the application focuses an icon button

Given an icon button, drawn as a button or as a link
When the application calls its focus method
Then the focus lands on the button or the link inside

Covered: `projects/ui-kit-v2/src/lib/components/icon-button/rt-icon-button.component.spec.ts`.

### SC-UKV-1039 — the application focuses a field

Given a text field
When the application calls its focus method
Then the focus lands on the input inside

Covered: `projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts`.
