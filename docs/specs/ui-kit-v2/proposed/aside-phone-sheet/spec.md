# The side panel as a full-height sheet on a phone

**Status:** proposed · **Revision:** 24 November 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the side panel of the second kit and its service, the route panel of the frame
`rt-container`, the filters of the toolbar, the bottom sheet of the second kit, the header of a
sheet and its question before closing (subdomain `sheet-header-cards`), the sheet opened from a
sheet (subdomain `sheet-stack`)
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

The product agreement of task RT-3532, epic RT-3530, written before the code. It merges into the
second kit's spec as the subdomain `aside-phone-sheet` by one of the last commits of the branch,
with the scenario numbers it has now.

## Why

On a phone a side panel slides in from the edge of the screen across its whole width and closes
only by its back arrow, its footer button, the dim or a key a phone has not got. Every other layer
the kit opens there is already a bottom sheet: it rises from below, closes by a swipe down and
carries its close button and its action in one header. The owner asked for the panels to be the
same: «асайды на мобилке нужно открывать как ботомшит только на весь экран по высоте».

## Terminology

- **A side panel** — any panel the kit draws by `rt-aside`: opened by the service of the kit, by
  one of the five places of the kit that open one, or by the route of the frame.
- **The five places of the kit** — the filters of the toolbar, the details of the workspace on a
  narrow screen, the settings of the table columns, the settings of the data list and the route
  panel of the frame.
- **The panel sheet** — a side panel drawn on a phone as a bottom sheet of the full height.
- **The main action of a panel** — the button an application puts into the primary slot of the
  panel footer: «Сохранить», «Применить».
- **A close-only button** — the button of the dismiss slot of a footer that keeps the kit's short
  label «Закрыть» on a phone; a footer that switched that label off holds a button of its own
  meaning, such as «Сбросить».
- **A panel with an edits guard** — a route panel that declared it answers about its unsaved edits.
- **The unsaved sign of a handle** — a sign an application sets on the handle of a panel it opened
  by the service while the panel holds edits not saved.
- **The phone** — a window of 480 points or narrower, the one threshold of the kit's sheets.

### What it is called in the interface

The person sees a panel that slides up from the bottom of the screen and takes all of its height but
a thin strip on top. It has a handle, a close button «×» on the left of the header, the title in
its centre and the main button on the right, «Сохранить» or «Применить». The other buttons of the
panel stand at its bottom. Before closing a panel with unsaved edits the person sees the question
«Несохранённые правки» at the bottom of the screen with «Сохранить и закрыть», «Закрыть без
сохранения» and «Остаться». The filters ask «Применить изменения?» with «Применить», «Не
применять» and «Отмена».

## Rules

- **On a phone every side panel opens as a bottom sheet of the full height.** It holds for a panel
  opened by the service, by an application or by one of the five places of the kit, and for the
  route panel of the frame in both of its modes, over the page and beside the content.
- **From 481 points a side panel stays as it is.** Up to 768 points it slides in from its edge
  across the whole width, wider it keeps its own width.
- **A panel keeps the form it opened in until it closes.** A window that crosses 480 points while
  the panel is open, a phone turned on its side among them, changes neither the sheet into a panel
  nor the panel into a sheet; the next opening takes the form of the window it opens in.
- **The panel sheet takes the full height whatever its content.** It stands like a full-height
  sheet: the strip of 12 px on top is the dim, the body scrolls, the header and the footer stay in
  place. While the screen keyboard is shown the sheet stands in the visible part above it, as every
  sheet of the kit does.
- **The panel sheet is as wide as the window and always dims the page.** The side, the size, the
  width and the width handle of the panel do not apply to it, nor does the frame's input that
  switches the dim of its right panel off.
- **The panel sheet slides up from the bottom and leaves sliding down.** With reduced motion asked
  by the system it appears and leaves without sliding.
- **The panel sheet has the header of a sheet: the handle, «×» on the left, the title in the
  centre, the main action on the right.** The back arrow of the panel header is not drawn: «×»
  stands in its place and does what the arrow did. «×» stands there even when the panel header
  switched the arrow off. The title stands in the centre whatever stands on its sides.
- **The main action moves from the footer to the right of the header as a filled button.** It is
  the button of the primary slot; with several there, the last one moves and the rest stay in the
  footer. A press on it does what the footer button did. A panel without a main action keeps the
  right side of the header empty.
- **The icon buttons of the panel header stand to the left of the main action.**
- **A close-only button is not drawn in the sheet, and the other buttons of the footer stay in its
  footer.** «×» does what the close-only button did. A footer left with nothing takes no room.
- **The panel sheet closes by «×», by a swipe down past the threshold of a sheet, by a tap on the
  strip above it and by Escape.** A shorter swipe returns the sheet to its place. Every road obeys
  what the panel obeys on a wide screen: a gesture switched off by the opening or by the setting of
  the kit, and a panel held from closing, leave the sheet open and report a close request. A
  refused swipe is reported as a refused tap on the dim.
- **A panel with an edits guard asks about its unsaved edits before it closes by any of the four
  roads.** While a write goes, a close is ignored, as on a wide screen. A second request to close
  while the question is shown does not ask again.
- **On a phone a panel opened by the service with the unsaved sign set asks the same question
  before it closes.** «Сохранить и закрыть» reports a save request to the application, which saves
  and closes the panel itself; «Закрыть без сохранения» closes the panel; «Остаться» keeps it. A
  panel held from closing refuses before it asks. Without the sign the panel closes or refuses as
  before, and from 481 points the sign changes nothing.
- **On a phone the question about the unsaved edits stands at the bottom of the screen in the look
  of the sheet's question.** It keeps the words and the three outcomes of the panel's question:
  save and close, close without saving, stay. Its first answer takes the focus, and the sheet under
  it is out of reach. «Остаться» returns the focus to where the close was asked from; asked by a
  swipe or a tap, the focus goes to the sheet itself. From 481 points the question stays the window
  in the centre of the screen.
- **The filters of the toolbar in the sheet ask before they close with a change not applied.** A
  change is any input made in the fields of the sheet since it opened. The question is the one of
  the page filters sheet: «Применить» reports `filtersApply` and closes, «Не применять» reports the
  drop to the application apart from the closing and closes, «Отмена» keeps the sheet. With nothing
  changed the sheet closes at once. From 481 points the filters ask nothing, as before.
- **Escape closes the top layer only, wherever the focus stands.** With the focus on the page under
  the panel sheet, Escape closes the panel sheet when it is the top layer. A sheet, a list or a
  dialog opened over the panel sheet takes Escape first, and Escape pressed inside the panel sheet
  goes no further.
- **The opened panel sheet puts the focus on its «×», unless the panel marked a node of its own for
  the first focus; the closed one returns it to the node it was opened from.** It holds for a sheet
  opened from a button, by code and by an address. A focus already moved elsewhere, or an opener no
  longer on the page, is left alone. A panel that keeps Tab inside keeps it inside the sheet.
- **A sheet opened from the panel sheet replaces it, and its closing shows the panel sheet as it
  was.** The list of a select, the sheet of a date field, the menu of a button: the panel sheet
  under them is hidden, takes no taps and keeps what was typed in its form and the focus of the
  field that opened the top one. Closing the top sheet by a choice, a swipe, «×» or Escape shows the
  panel sheet again.
- **The parts of a panel live in the sheet unchanged.** The request error, the empty content, the
  pending layer, the tabs layout and the row under the header stand where they stand in the panel;
  the overline, the subtitle and the badges stand under the title.
- **The panel sheet is announced as a modal dialog by the name of the panel.** It blocks the page
  and locks its scroll.
- **No setting keeps the side panel at the side on a phone.** Neither the setting of the kit nor the
  opening of a panel gets one.

## What is out of scope

- The dialog, the confirm popover, the tooltip and the drawer: they do not become sheets. A dialog
  opened over the panel sheet stays a dialog.
- The panel from 481 points: neither its look nor its question changes.
- The words and the outcomes of the question about the unsaved edits, and when a route panel asks:
  subdomain `aside`. The details of the workspace ask nothing, as before.
- The content of a panel: the application's templates.
- The threshold of 480 points and the setting `RT_POPOVER_SHEET`.
- The release of the kit.

Statements of the neighbouring subdomains change at the merge. In `toolbar-filters` the line «A
bottom sheet instead of the panel» leaves the out-of-scope section, and the filters gain the
question in the sheet. In `aside-options` the window about the unsaved edits on a phone becomes the
question at the bottom, and scenario `SC-UKV-1043` changes its promise; the full-window width of
the panel there holds from 481 points. In `workspace-breakpoint` the panel over the window keeps
the header with the arrow and the button «Close» from 481 points, which scenarios `SC-UKV-1244`,
`SC-UKV-1251`…`SC-UKV-1253` and `SC-UKV-1320` describe. In `popover-sheet` the asides leave the
list of what does not open in the sheet. The mobile layout of subdomain `aside` stops being «Not
applicable».

## Contract

Not applicable: no procedures. The surface of the kit grows by three things: the handle of a panel
takes the unsaved sign and reports a save request, and the toolbar reports the drop of the filters
not applied. The header, the footer and the frame get no new input for the sheet.

### Refusal codes

Not applicable.

## Data

Not applicable: the panel sheet keeps nothing.

## Screens and states

| Screen                       | Loading                          | Empty                          | Refusal                            |
| ---------------------------- | -------------------------------- | ------------------------------ | ---------------------------------- |
| The panel sheet              | the pending layer over the panel | the empty content of the panel | the request error under the header |
| The question at the bottom   | none                             | none                           | none                               |
| A sheet over the panel sheet | no change                        | no change                      | no change                          |

## Cross-cutting requirements

### Locales

No new labels. «×» is named by the kit's «Закрыть» of a sheet, the question of a panel keeps the
panel's labels and the question of the filters keeps the sheet's, in eight languages; the main
action keeps the label the application gave it.

### SEO

Not applicable: the kit lives inside an application behind a sign-in.

### Mobile layout

The whole agreement is about the phone, width 375. The sizes of the header, of «×» and of the
strip on top are those of the sheet, subdomain `sheet-header-cards`. The frames are drawn and
approved by the owner before the code; they show the place of the main action and of the header
icon buttons in each of the five places of the kit.

### Several objects

Two panels open at once on a phone are two sheets in the order of opening: the later one replaces
the earlier, and its closing shows the earlier one again.

## Decisions

The owner gave the adaptation of the panel to the sheet into the work: «все как у шторки,
адаптировать асайд, прикинь что можно сделать». The decisions below are taken under that word and
are shown to him by the frames.

- **The panel takes the sheet's behaviour, not a copy of it.** The sheet already holds the swipe,
  the question at the bottom, Escape of the top layer, the order of sheets and the place above the
  keyboard; a second copy in the panel would diverge from it at the first edit.
- **The question keeps the panel's words.** The panel asks about edits of a record, not about a
  choice not applied: «Применить» would name the wrong outcome. Only its place and look are the
  sheet's, by the owner's choice «Внизу, как у шторки».
- **The record panel is a sheet too, in both modes of the frame.** Leaving it at the side would
  split one rule into two.
- **A panel keeps the form it opened in.** A form changing under the hands of a person who edits
  would move the fields and drop the focus. Rejected: following the window at once.
- **A close-only button is not drawn in the sheet.** «×» does the same, and two closings on one
  screen differ only in place. The kit tells such a button by the short label «Закрыть» it already
  gives it on a phone. Rejected: drawing it next to «×».
- **The header icon buttons stand to the left of the main action.** The right side of the header
  is the side of actions in the sheet. Rejected: a row of their own under the header, which takes
  height from the body.
- **With several buttons in the primary slot, the last one moves.** The footer row ends with the
  main action, so the last button is the one a person reads as the main. Rejected: leaving all of
  them in the footer, which leaves the header without the action the owner named.
- **The panel's own first-focus node wins over «×».** The application marked it on purpose, and on
  a wide screen it takes the focus. Rejected: «×» always.
- **«×» stands even when the panel header switched the arrow off.** Every sheet of the kit has it,
  and a swipe closes the sheet anyway. Rejected: a sheet without a close button.
- **A refused swipe is reported as a refused tap on the dim.** Both are gestures outside the
  content, and the published kinds of a close request stay as they are. Rejected: a kind of its own,
  which widens a published type.
- **The handle of a panel opened by the service takes an unsaved sign the application sets.** The
  kit cannot see the edits of such a panel, and without the sign its application asks by a window
  of its own, which gives the phone a second look of the question again. The sign is not demanded:
  a panel without it behaves as before. Rejected: leaving the question to the application.
- **The filters of the toolbar ask in the sheet.** A sheet closed with data entered asks, by the
  rule of the video the epic follows, and the page filters sheet already asks so. Rejected: closing
  silently.
- **The panel sheet always dims the page.** A full-height sheet covers the page anyway, and a page
  left reachable under it takes taps nobody sees. Rejected: obeying the frame's input without a dim.
- **No opt-out.** The owner named no exception, though the setting of the kit and the opening of a
  panel are places one could hang on.

## Open questions

None.

## History of changes

| Date       | What changed                                                                     |
| ---------- | -------------------------------------------------------------------------------- |
| 2026-11-24 | The agreement is written by task RT-3532, scenarios 1802…1833                    |
| 2026-11-24 | The eleven open questions are decided under the owner's word, scenarios 1834…1846 |
