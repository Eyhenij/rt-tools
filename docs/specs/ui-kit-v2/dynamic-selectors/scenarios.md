# Scenarios — the dynamic selectors

The numbers continue the numbering of the second kit and do not change after the merge.

### SC-UKV-436 — apply appends the ticked keys to the value

Given the form holds the keys 1 and 2, and the popup offers the entity with the key 3
When the person ticks it and presses «Apply»
Then the form gets the array 1, 2, 3, and the popup closes

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.component.spec.ts`.

### SC-UKV-437 — reset returns the initial value

Given the form wrote the keys 1 and 2, and the person removed the row of 2
When the person presses reset
Then the value is 1, 2 again, and the reset button is off

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.component.spec.ts`.

### SC-UKV-438 — clear keeps the read-only keys

Given the value holds the keys 1, 2 and 3, and 3 and 1 are read-only
When the person presses clear
Then the value is 1, 3, and the clear button is off

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.logic.spec.ts`.

### SC-UKV-439 — a read-only row cannot be removed

Given the value holds the keys 1 and 2, and 1 is read-only
When the chosen list is drawn
Then the delete button of the row 1 is disabled, and that of the row 2 is not

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.component.spec.ts`.

### SC-UKV-440 — a dragged row moves one key

Given the value holds the keys 1, 2 and 3
When the row 3 is moved to the place 0, and then the row 1 to the place 10
Then the value is 3, 1, 2 after the first move and 3, 2, 1 after the second

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.logic.spec.ts`.

### SC-UKV-441 — the popup offers only what is not chosen

Given the entities «Anna», «Boris» and «Vera», and «Boris» is chosen
When the popup opens without a comparator
Then it offers «Anna» and «Vera», in this order

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.logic.spec.ts`.

### SC-UKV-442 — the local search needs every word of the query

Given the popup offers «Anna Smith», «Anna Brown» and «Mark Smith»
When the person types «smi an»
Then only «Anna Smith» stays

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.logic.spec.ts`.

### SC-UKV-443 — the server search waits for the pause

Given the popup is in server search mode
When the person types «ann» and stops
Then the query «ann» leaves by the search output 500 ms after the last keystroke, and the rows stay
as the caller handed them

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/popup/rt-dynamic-selector-popup.component.spec.ts`.

### SC-UKV-444 — select all works on the visible rows

Given the popup offers «Anna», «Boris», «Maria» and «Vera», and «Boris» is ticked
When the person types «a», ticks select all, and then unticks it
Then after ticking all four are ticked, and after unticking «Boris» alone stays ticked

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.logic.spec.ts`.

### SC-UKV-445 — select all stands mixed while part of the rows is ticked

Given the popup shows three rows in multi mode
When the person ticks one of them
Then select all stands mixed, and after ticking the other two it stands on

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.logic.spec.ts`.

### SC-UKV-446 — single mode replaces the chosen list

Given the selector is in single mode, and the value holds the key 1
When the person picks the radio button of the key 2 and presses «Apply»
Then the value is 2 alone, and the popup shows no select all

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.component.spec.ts`.

### SC-UKV-447 — cancel drops the ticks

Given the value holds the key 1, and the person ticked the key 2 in the popup
When the person presses «Cancel» and opens the popup again
Then the value is 1, and the popup has no ticks and an empty query

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.component.spec.ts`.

### SC-UKV-448 — apply is off with nothing ticked

Given the popup is open, and nothing is ticked
When the person looks at the footer
Then «Apply» is disabled, and it turns on after the first tick

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/popup/rt-dynamic-selector-popup.component.spec.ts`.

### SC-UKV-449 — the end of the list asks for the next page

Given lazy loading is on
When the end of the popup list comes into view, first while the caller reports fetching and then
after it stops
Then the load output fires once, after the fetching stops

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/popup/rt-dynamic-selector-popup.component.spec.ts`.

### SC-UKV-450 — a search with no match says so

Given the popup offers «Anna» and «Boris», and nothing is ticked
When the person types «zzz»
Then the popup shows «No results» instead of the rows

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/popup/rt-dynamic-selector-popup.component.spec.ts`.

### SC-UKV-451 — a divider follows the last visible pinned row

Given the popup offers «Anna», «Boris» and «Vera», and «Anna» and «Boris» are pinned
When the person types «a»
Then «Anna» and «Vera» stay, and the divider stands under «Anna»

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/popup/rt-dynamic-selector-popup.component.spec.ts`.

### SC-UKV-452 — nothing to choose

Given the selector holds no chosen keys and no entities to offer
When it is drawn
Then it shows «There are no available items to choose» and no buttons

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.component.spec.ts`.

### SC-UKV-453 — the string list adds the trimmed text

Given the string list holds «a@x.com»
When the person types « b@x.com » and presses Enter
Then the value is «a@x.com», «b@x.com», and the field is hidden

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.logic.spec.ts`.

### SC-UKV-454 — the string list ignores a duplicate and a blank text

Given the string list holds «a@x.com»
When the person adds «a@x.com», and then a text of three spaces
Then the value stays «a@x.com» alone both times

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.logic.spec.ts`.

### SC-UKV-455 — leaving the field adds the text

Given the field of the string list is open
When the person types «c@x.com» and moves the focus away
Then «c@x.com» is added to the end of the value

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/dynamic-input/rt-dynamic-input.component.spec.ts`.

### SC-UKV-456 — an edit replaces the row in its place

Given the string list holds «a@x.com» and «b@x.com», and editing is on
When the person edits «a@x.com» into «c@x.com», and then «c@x.com» into «b@x.com»
Then the value is «c@x.com», «b@x.com» after the first edit and stays so after the second

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.logic.spec.ts`.

### SC-UKV-457 — with the multi toggle off a plain click leaves one tick

Given the multi toggle is shown and off, and «Anna» is ticked
When the person clicks «Boris», and then Ctrl-clicks «Vera»
Then «Boris» alone is ticked after the click, and «Boris» and «Vera» after the Ctrl-click

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/popup/rt-dynamic-selector-popup.component.spec.ts`.

### SC-UKV-534 — a dragged row keeps its background in flight

Given a draggable selector with two chosen rows
When the person drags a row by its handle
Then the row in flight is drawn on the tint of a row over the surface, with the paddings of a row

Не покрыто: the row in flight exists only while the pointer drags it, and the drag library draws it
at the end of the page; neither a spec nor a still showcase frame holds that moment. Checked by eye
in the showcase.

### SC-UKV-535 — the icon buttons of the list are round by default

Given a selector with chosen rows and no rounding named
When it is drawn, and then the caller names the step «sm»
Then every icon button of the list takes the full step, and after that the step «sm»

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.component.spec.ts`.

### SC-UKV-536 — the popup opens from the add button pressed

Given a selector with something to offer
When the person presses the add button
Then the popup opens, and it is the popup of that very button

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.component.spec.ts`.

### SC-UKV-702 — the invitation button takes its icon and look from the inputs

Given a selector or a string list with the invitation shown
When the caller names an icon and the look «text» or «filled» for the invitation button
Then the button draws that icon in that look, and without them it is outlined and has no icon

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector-look.spec.ts`.

### SC-UKV-703 — the clear button takes its icon from the input

Given a selector or a string list with chosen rows
When the caller names the icon `trash-x` for the clear button
Then the clear button draws it, and without it draws the close cross

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector-look.spec.ts`.

### SC-UKV-704 — the popup search takes the field look from the input

Given a selector whose caller names the look «fill» for the search
When the person opens the popup
Then the search field of the popup is drawn in that look

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector-look.spec.ts`.

### SC-UKV-705 — the empty result shows the caller's text

Given a selector whose popup opens with a query nothing matches
When the caller names the text of the empty result, and then takes it away
Then the popup shows that text, and after that the kit label

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector-look.spec.ts`.

### SC-UKV-706 — the field of a new row takes its look from the input

Given a string list whose caller names the look «fill» for its field
When the person presses the add button
Then the field of the new row is drawn in that look

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector-look.spec.ts`.

### SC-UKV-714 — the invitation draws a Material name

Given a selector or a string list whose caller names a Material name for the invitation and no kit
icon
When the invitation is shown
Then its placeholder takes that name as its glyph

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector-look.spec.ts`.

### SC-UKV-715 — the label of the kit field leads to the field of a new row

Given a string list inside the kit field with a label
When the person presses the add button
Then the label is drawn above the list and points at the field of the new row

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector-look.spec.ts`.

### SC-UKV-720 — the field of a new row shows the caller's label

Given a string list whose caller names a label for the field of a new row, or names none
When the person presses the add button
Then the label stands above the field and leads to it, and without it the field stands bare

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector-look.spec.ts`.

### SC-UKV-721 — the chosen entities passed by the caller set the value and the reset list

Given a selector without a form whose caller passes a list of chosen entities
When the list arrives, the person removes a row and the parent passes back the echo of the change
Then the rows show the passed list, the echo leaves the reset on, and the reset returns the passed list

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector-chosen.spec.ts`.

### SC-UKV-722 — the row title on one line is cut and shows the whole text in a tooltip

Given a list whose caller turns title wrapping off, or leaves it on
When a row with a long title is drawn
Then the title is marked to stand on one line with a tooltip of its whole text, and with wrapping on it
has neither

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector-chosen.spec.ts`.

### SC-UKV-724 — the kit settings give both fields their look

Given an application that sets the look of the dynamic selectors in the kit settings, or sets nothing
When a selector and a string list whose markup names no look are drawn
Then the invitation button, the clear icon, the search look, the empty-result text and the title
wrapping come from the settings, and without the settings they are the kit defaults

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector-defaults.spec.ts`.

### SC-UKV-725 — an input at the place wins over the kit settings

Given the kit settings naming a look for the dynamic selectors
When a selector and a string list name their look in the markup
Then they take the look from the markup

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector-defaults.spec.ts`.

### SC-UKV-729 — with a minimum height the footer of the popup stands at the bottom edge

Given a popup whose caller sets a minimum height taller than its content
When it shows a short list, the loading or the empty result
Then the body stretches and the footer stands at the bottom edge, and without the minimum height the
popup is as tall as its content

Not covered: a test has no layout. Measured on the showcase in the story **Popup**: with
`--rt-dynamic-selector-popup-min-height: 30rem` every popup is 480px tall with no gap under the
footer, and without it the heights stay as before.

### SC-UKV-734 — without wrapping the popup option stands on one line with a tooltip

Given a selector whose caller turns title wrapping off, in the multi or the single choice
When the popup shows an option with a long label
Then the label stands on one line, cut with an ellipsis, and carries a tooltip of its whole text;
the single-choice label stands next to its button, names it and chooses the row; with wrapping on
the options look as before

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/popup/rt-dynamic-selector-popup-wrap.spec.ts`.

### SC-UKV-728 — the popup search takes the caller's radius step

Given a selector whose caller names a radius step for the search, or the kit settings name it
When the popup opens
Then the search field is rounded by that step, and without one it keeps its own rounding

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/popup/rt-dynamic-selector-popup-look.spec.ts`.

### SC-UKV-730 — the popup marks the characters that match the search

Given a selector whose caller turns the search highlight on, or the kit settings turn it on
When the popup shows options for a search
Then the characters of each label that match a search word are marked, the label reads whole and a
single-line label keeps its ellipsis, and without the highlight no character is marked

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/popup/rt-dynamic-selector-popup-highlight.spec.ts`, `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.logic.spec.ts`.

### SC-UKV-731 — the apply button takes the caller's label and case

Given a selector whose caller names a label or a case for the apply button, or the kit settings name
them
When the popup opens
Then the button shows that label in that case and is named by it, and without them it shows the kit
label as it is

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/popup/rt-dynamic-selector-popup-look.spec.ts`, `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.logic.spec.ts`.

### SC-UKV-732 — the search field takes focus on opening when asked

Given a selector whose caller asks for the search focus, or the kit settings ask for it
When the popup opens
Then the search field holds the focus, and without the request the focus stays where it was

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/popup/rt-dynamic-selector-popup-look.spec.ts`.

### SC-UKV-733 — the caller sets the option line, the empty result gap and the footer padding

Given a popup whose caller sets the option line height, the least option height, the empty result
gap or the footer padding
When the popup shows its options or the empty result
Then the popup takes those values, and without them it is drawn as before

Not covered: a test has no layout. Measured on the showcase in the story **Popup**: without the
properties the rows are 36px, the gap 12px and the footer padding `8px 16px 0`; with a 20px line, a
44px least height, a 4px gap and `16px 24px 0 8px` the labels are 20px per line, the rows 44px with
the content in the middle, the gap 4px and the footer padding `16px 24px 0 8px`.
