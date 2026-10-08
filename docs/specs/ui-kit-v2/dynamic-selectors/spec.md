# The dynamic selectors

**Status:** in force · **Revision:** 29 September 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the parts of the second kit — the popover, the checkbox, the radio button, the
input, the empty state, the buttons and the infinite scroll directive
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written before the code by task RT-1884 and merged with the
scenario numbers it had as an agreement.

## Why

An application moving to the second kit keeps its lists of chosen records in the dynamic selectors
of the first kit: a form field with the chosen rows, a pop-up choice with search and "select all",
and a field where a person types the rows by hand. The second kit has nothing of the kind.
`rt-multiselect` chooses several values as chips, without the row list, the reset, the read-only
rows, the dragging and the pop-up with "select all". The owner forbade replacing it, and the family
stands next to it as components of its own, drawn on the parts of the second kit.

## Terminology

| Term              | What it is                                                                     |
| ----------------- | ------------------------------------------------------------------------------ |
| the selector      | `rt-dynamic-selector` — the form field holding the chosen list and its buttons |
| the chosen list   | the rows of the records the value holds, in the order of the value             |
| the entities      | the records the caller hands over; each has a key field and a label field      |
| the key           | the value of the key field of one entity; the form value is an array of keys   |
| the popup         | `rt-dynamic-selector-popup` — the pop-up choice opened by the add button       |
| a tick            | a row marked in the popup and not yet applied                                  |
| the initial value | the last value the form wrote into the selector                                |
| read-only keys    | keys the caller forbids removing from the chosen list                          |
| pinned keys       | keys of the popup rows the caller groups at the top of the list                |
| server search     | the mode where the popup hands the query to the caller instead of filtering    |
| the string list   | `rt-dynamic-input` — the field whose rows a person types by hand               |
| the invitation    | the empty state with an icon, a description and the add button                 |

### What it is called in the interface

| In the agreement  | On the screen                                       |
| ----------------- | --------------------------------------------------- |
| the add button    | the caller's title, «Add» by default                |
| reset             | a round-arrow button, hint «Reset to initial list»  |
| clear             | a bin button, hint «Clear list»                     |
| the row delete    | a bin button on the row, hint «Remove the item»     |
| the drag handle   | a four-arrow button on the row, hint «Hold to drag» |
| the popup search  | a field with the hint «Search...»                   |
| select all        | the checkbox «Select all»                           |
| the multi toggle  | the switch «Multi selection»                        |
| the popup apply   | the button «Apply»                                  |
| the popup cancel  | the button «Cancel»                                 |
| the empty result  | «No results» under a search icon                    |
| nothing to choose | «There are no available items to choose»            |
| the row edit      | a pencil button on a row of the string list         |

## Rules

- **The value of the selector is an array of keys, in the order of the chosen list.** Every change
  reaches the form as a new array; the same list of entities leaves by the chosen-entities binding
  and the selection change output.
- **The value the form writes becomes the chosen list and the initial value at once.**
- **Reset returns the initial value, and it is off while the list equals it in the same order.**
  After a reset the reset output fires.
- **Clear keeps only the read-only keys, in the order of the value.** It is off while the list holds only
  read-only keys, in any order.
- **A row of a read-only key cannot be removed from the chosen list.** Its delete button stands
  disabled.
- **A dragged row moves one key in the value.** A target place outside the list is taken as its
  nearest edge, and a row taken from outside the list changes nothing. Rows drag only when the caller turns dragging on; a row dropped back in its place
  changes nothing.
- **The popup offers only the entities that are not chosen yet and whose label is a string or a
  number.** They are sorted by the caller's comparator, and without one by label in alphabetical
  order.
- **The local search keeps a row whose label holds every word of the query.** Words are split by
  spaces and compared without regard to case.
- **The server search hands the query to the caller 500 ms after the last keystroke and filters
  nothing itself.** An erased query leaves as an empty string.
- **During a search the rows ticked earlier stay above the results, separated from them.** A tick
  does not vanish because the query stopped matching its row.
- **Select all works on the visible rows only.** Ticking it adds every visible key to the ticks;
  unticking removes the visible keys and keeps the ticks outside the query. Its state is off, mixed or
  on by how many of the visible keys are ticked. It appears in multi mode when the list holds more
  than one row.
- **In single mode the popup holds radio buttons, and apply replaces the chosen list with one
  key.** Select all and the multi toggle are not shown.
- **With the multi toggle off, a plain click leaves one tick, and Ctrl-click adds a tick.** On macOS
  the key is Cmd. The toggle is shown only when the caller asks for it.
- **Apply appends the ticked keys to the chosen list and closes the popup.** Apply is off while
  nothing is ticked and while the list loads.
- **Cancel, Escape and a click outside close the popup and drop the ticks.** The value stays as
  it was, and the next opening starts with no ticks and an empty query.
- **The popup reports its ticks by the temporary choice output.** It sends an empty list on opening
  and the ticked entities after every search: under server search the caller keeps them in the list.
- **The end of the popup list asks for the next page when lazy loading is on.** The request pauses
  while the caller reports fetching, and a spinner stands under the last row meanwhile.
- **A popup with no rows to show says «No results», and a loading popup shows a spinner.**
- **A divider follows the last visible pinned row of the popup.** Pins change no order of the rows:
  the order stays the caller's.
- **The add button stands while the popup has something to offer.** The caller can hide it; reset
  and clear stay.
- **A selector with nothing chosen, no query and nothing to choose shows «There are no available
  items to choose» and no buttons.**
- **While the caller turns the invitation on, it replaces the row of buttons.** Its button opens the
  popup the same as the add button.
- **A disabled selector keeps the add, reset and clear buttons off.** The row delete, the row edit
  and the dragging are off as well.
- **The icon buttons of the list are round unless the caller names another rounding step.** The step
  comes from the shared rounding scale; the add button keeps its own look.
- **The popup opens from the add button that was pressed.** The add button of the row of buttons and
  the button of the invitation each carry the popup, so it stands under the button rather than under
  the whole list.
- **A dragged row keeps its background and paddings in flight.** The row in flight leaves the list
  for the end of the page, where the drag library resets its background and paddings.
- **A key no entity holds stays in the value and draws no row.**
- **An empty array written by the form empties the chosen list.**
- **The popup footer shows a navigation link when the caller names its title and address.**
- **The caller can add controls to every row and replace the row title.** The row delete and the
  drag handle stay the kit's.
- **The value of the string list is an array of strings.** It takes the same reset, clear, row
  delete and dragging as the chosen list of the selector; clear keeps the read-only rows there too.
- **Enter or leaving the field of the string list adds the trimmed text to the end and hides the
  field.** A blank text adds nothing, and the field stays open.
- **A text already in the string list is not added a second time.** The trimmed text is compared
  exactly; the field is emptied and hidden, and the value stays as it was.
- **Editing a row of the string list is on only when the caller turns it on.** The pencil opens the
  row's field, and Enter or the apply button replaces the text in its place. A blank edit, an
  unchanged one or one into a text another row holds leaves the list as it was; so does the reset
  button.
- **The caller names the look of the invitation, the clear button, the popup search and the empty
  result.** The invitation button takes an icon and one of the kit button's looks; the clear button
  takes an icon, the close cross by default; the popup search field and the string list's own field
  take one of the field's looks; the empty result shows the caller's text, the kit label without it.
  The popup search takes a radius step too, and without one it keeps the field's own rounding.
- **The caller names the label of the apply button and its case.** Without a label the button keeps
  the kit label. The case leaves the label as it is by default, raises the first letter of every
  word, or raises the whole label; the button is named for a reader who hears the screen by the same
  text.
- **The kit settings set the look of the invitation, the clear button, the popup search, the empty
  result, the row title wrapping, the search highlight and the apply button label for every field at
  once, and an input at the place wins over them.** Both fields read the invitation button, the clear icon and the title wrapping from the
  settings; the search and the empty result belong to the selector alone. Without the settings the
  kit defaults stay.
- **A value the caller sets on the list block reaches it, and a popup property or the add button's
  colour reaches it from any ancestor.** The popup lives in an overlay, outside the field, so the
  caller sets its properties on the overlay pane or a container of its own; only the defaults stand
  on the popup itself, under the `-default` suffix. The add button is projected by both fields with
  different looks, so its colour is a handle with the button's own colour as the fallback.
- **The body of the popup takes the height its head and footer leave.** With a minimum height set, a
  short list, the loading and the empty result stretch, and the footer stands at the bottom edge.
  Without one the popup is as tall as its content, as before.
- **The invitation takes a Material name for its picture when the caller names no kit icon.** The
  name goes to the placeholder's own glyph input and is drawn as an icon's glyph is.
- **A string list put into the kit field takes the field's label, and the label leads to the field of
  a new row.** The kit field draws the label, the required mark and the error; the list adds no label
  of its own.
- **A non-empty list the caller passes as the chosen entities sets the value and the reset list; a
  list with the keys already shown changes nothing.** That list is the parent's echo of the
  selection change, and taking it as the reset list would keep the reset off for good.
- **The row title wraps unless the caller turns wrapping off; then it stands on one line, cut with
  an ellipsis, and a cut title shows the whole text in a tooltip.**
- **The same wrapping holds for the options of the popup.** Without wrapping an option's label
  stands on one line, cut with an ellipsis, and a cut label shows the whole text in a tooltip; the
  label of a single-choice option is drawn next to its button and names the button for a reader who
  hears the screen.
- **The popup marks the characters of an option label that match the search when the caller turns
  it on.** Each word of the search is found in the label regardless of case, and the found characters
  take the highlight colour and weight; the label still reads whole and keeps its ellipsis. Without
  the input no character is marked.
- **The field of a new row shows the caller's label, and without one it stands as before.** The label
  is drawn by the kit field around the field and leads to it; the field has no label input of its
  own.

## What is out of scope

- `rt-multiselect` of the second kit is neither edited nor replaced.
- The first kit is not edited: it opens as the sample.
- The field appearance setting of the first kit (`fill` or `outline` by the kit settings) is not
  ported: the second kit has one look of a field.

## Contract

Not applicable: the surface is the inputs and outputs of kit components, the subdomain serves no
procedures.

### Refusal codes

Not applicable.

## Data

Not applicable: the family keeps nothing. The value lives in the caller's form, the entities come
from the caller.

## Screens and states

| State                  | What is visible                                                      |
| ---------------------- | -------------------------------------------------------------------- |
| the chosen list        | the rows, each with its delete, below them add, reset and clear      |
| read-only rows         | the same rows with the delete disabled                               |
| dragging on            | a drag handle at the start of every row                              |
| the invitation         | an icon, a description and the add button instead of the buttons row |
| nothing to choose      | a warning icon and «There are no available items to choose»          |
| disabled               | add, reset and clear disabled                                        |
| popup, multi mode      | search, select all, checkbox rows, cancel and apply                  |
| popup, single mode     | search, radio rows, cancel and apply                                 |
| popup, search          | the rows ticked earlier, a divider, the matched rows                 |
| popup, pinned rows     | a divider under the last visible pinned row                          |
| popup, loading         | a spinner instead of the rows, apply disabled                        |
| popup, fetching a page | the rows and a spinner under the last one                            |
| popup, empty result    | a search icon and «No results»                                       |
| string list, typing    | the rows and a text field under them                                 |
| string list, row edit  | one row turned into a field with apply and reset                     |

## Cross-cutting requirements

### Locales

The labels of the family — hints, button titles, «Select all», «No results», the multi toggle and
its hint — go into the kit's dictionary in all its languages. The first kit wrote them in English
in the markup. The row labels and the add button title arrive from the caller in its language.

### SEO

Not applicable: the family is a form field inside an application behind a sign-in.

### Mobile layout

On a narrow screen the hints of the buttons are not shown, and the hint of the multi toggle stands
as text under it instead of an icon with a hint.

### Several objects

Several selectors on one page keep their values, their initial values and their popups apart. An
opened popup of one selector closes the popup of another by the click outside.

## Decisions

- **The family is named `rt-dynamic-selector`, `rt-dynamic-selector-popup` and `rt-dynamic-input`,
  the models `IRtDynamicSelector`.** The names of the first kit without its prefix; the pop-up is not
  named `multi-selector`, so as not to read as a part of `rt-multiselect`. Rejected: extending
  `rt-multiselect` — the owner forbade replacing it.
- **The family is drawn on the parts of the second kit and holds no `@angular/material`.** The
  owner's words; the look is compared with the snapshots of the first kit.
- **The invitation and the nothing-to-choose state are drawn by `rt-empty-state`, and the placeholder
  component of the first kit is not ported.** The kit already has the empty state.
- **The load of the next page is asked by `RtInfiniteScrollDirective` of the second kit.**
- **The apply button is titled «Apply».** The first kit titled it «SUBMIT».
- **The string list trims the typed text and ignores a blank one.** The first kit added a text of
  spaces as a row, since only an empty field counted as empty.
- **An edit of a string row into a blank text or a duplicate is refused.** The first kit wrote it
  as is, and the list got an empty row or a duplicate.
- **Unticking select all keeps the ticks outside the query.** The first kit dropped every tick, the
  hidden ones as well.

- **A key the form wrote that no entity holds stays in the value and draws no row.** The first kit
  dropped it at the next change, and the form lost data it never showed. Taken without the owner's
  answer by their word «делай дальше по списку я потом посмотрю»; the same holds for every item
  below.
- **An empty array written by the form empties the chosen list.** A form reset expects it; the first
  kit ignored the empty write and kept the former rows on the screen.
- **A disabled selector turns off the row delete, the row edit and the dragging too.** The first
  kit kept them working, and a disabled field changed its value.
- **The invitation shows only by the caller's input.** As in the first kit; the selector does not
  guess it from an empty value.
- **The selector takes pinned keys and passes them to the popup; the kit does not lift pinned rows.**
  The first kit's selector dropped them on the way. The order stays the caller's.
- **Clear in the string list keeps the read-only rows, as in the selector.** One rule for both
  fields of the family.
- **A duplicate in the string list is compared exactly, case included.**
- **The string list has no single mode.**
- **The popup footer shows a navigation link when the caller names its title and address.** As in
  the first kit.

## Open questions

None: the questions the agreement raised are closed by the decisions above and wait for the
owner's review.

## History of changes

- 29 September 2026 — the agreement was written by the grilling of the owner's request.
- 29 September 2026 — the agreement was merged into the spec of the second kit together with the
  code. The scenarios kept their numbers.
- 1 October 2026 — the owner's remarks (RT-2455): round icon buttons by default, the popup at the
  add button pressed, the background of the row in flight.
- 7 October 2026 — the application's requests (RT-2619): the inputs of the invitation, clear, search
  and empty-result look, the popup and list properties, the cross trash icon `trash-x`; the popup
  properties read from any ancestor.
- 7 October 2026 — the application's remarks (RT-2619): a Material name for the invitation picture,
  the label of the string list by the kit field, the label of the field of a new row, the chosen
  entities set by the input, the row title on one line.
- 8 October 2026 — the application's request (RT-2619): the look inputs of both fields take their
  defaults from the kit settings, the row title wrapping too; the popup body takes the height left by
  its head and footer; the title wrapping holds for the popup options too.
