# Scenarios — the dynamic selectors

The numbers continue the numbering of the second kit and do not change after the merge.

### SC-UKV-436 — apply appends the ticked keys to the value

Given the form holds the keys 1 and 2, and the popup offers the entity with the key 3
When the person ticks it and presses «Apply»
Then the form gets the array 1, 2, 3, and the popup closes

Coverage: partial — the adding of a key once is checked in `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.logic.spec.ts`; the popup closing after apply waits for the component test.

### SC-UKV-437 — reset returns the initial value

Given the form wrote the keys 1 and 2, and the person removed the row of 2
When the person presses reset
Then the value is 1, 2 again, and the reset button is off

Coverage: partial — the reset button state is checked in `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.logic.spec.ts`; the return of the value waits for the component test.

### SC-UKV-438 — clear keeps the read-only keys

Given the value holds the keys 1, 2 and 3, and 3 and 1 are read-only
When the person presses clear
Then the value is 1, 3, and the clear button is off

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.logic.spec.ts`.

### SC-UKV-439 — a read-only row cannot be removed

Given the value holds the keys 1 and 2, and 1 is read-only
When the chosen list is drawn
Then the delete button of the row 1 is disabled, and that of the row 2 is not

Not covered: the test is foreseen in rt-dynamic-selector.component.spec.ts of the family directory.

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

Not covered: the test is foreseen in rt-dynamic-selector-popup.component.spec.ts of the family directory.

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

Not covered: the test is foreseen in rt-dynamic-selector.component.spec.ts of the family directory.

### SC-UKV-447 — cancel drops the ticks

Given the value holds the key 1, and the person ticked the key 2 in the popup
When the person presses «Cancel» and opens the popup again
Then the value is 1, and the popup has no ticks and an empty query

Not covered: the test is foreseen in rt-dynamic-selector.component.spec.ts of the family directory.

### SC-UKV-448 — apply is off with nothing ticked

Given the popup is open, and nothing is ticked
When the person looks at the footer
Then «Apply» is disabled, and it turns on after the first tick

Not covered: the test is foreseen in rt-dynamic-selector-popup.component.spec.ts of the family directory.

### SC-UKV-449 — the end of the list asks for the next page

Given lazy loading is on
When the end of the popup list comes into view, first while the caller reports fetching and then
after it stops
Then the load output fires once, after the fetching stops

Not covered: the test is foreseen in rt-dynamic-selector-popup.component.spec.ts of the family directory.

### SC-UKV-450 — a search with no match says so

Given the popup offers «Anna» and «Boris», and nothing is ticked
When the person types «zzz»
Then the popup shows «No results» instead of the rows

Not covered: the test is foreseen in rt-dynamic-selector-popup.component.spec.ts of the family directory.

### SC-UKV-451 — a divider follows the last visible pinned row

Given the popup offers «Anna», «Boris» and «Vera», and «Anna» and «Boris» are pinned
When the person types «a»
Then «Anna» and «Vera» stay, and the divider stands under «Anna»

Coverage: partial — the choice of the row under which the divider stands is checked in `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.logic.spec.ts`; drawing the divider waits for the popup component test.

### SC-UKV-452 — nothing to choose

Given the selector holds no chosen keys and no entities to offer
When it is drawn
Then it shows «There are no available items to choose» and no buttons

Not covered: the test is foreseen in rt-dynamic-selector.component.spec.ts of the family directory.

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

Not covered: the test is foreseen in rt-dynamic-input.component.spec.ts of the family directory.

### SC-UKV-456 — an edit replaces the row in its place

Given the string list holds «a@x.com» and «b@x.com», and editing is on
When the person edits «a@x.com» into «c@x.com», and then «c@x.com» into «b@x.com»
Then the value is «c@x.com», «b@x.com» after the first edit and stays so after the second

Covered: `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.logic.spec.ts`.

### SC-UKV-457 — with the multi toggle off a plain click leaves one tick

Given the multi toggle is shown and off, and «Anna» is ticked
When the person clicks «Boris», and then Ctrl-clicks «Vera»
Then «Boris» alone is ticked after the click, and «Boris» and «Vera» after the Ctrl-click

Not covered: the test is foreseen in rt-dynamic-selector-popup.component.spec.ts of the family directory.
