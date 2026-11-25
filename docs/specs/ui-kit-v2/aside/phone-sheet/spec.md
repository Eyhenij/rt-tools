# The side panel as a full-height sheet on a phone

**Status:** in force · **Revision:** 25 November 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the side panel of the second kit and its service, the route panel of the frame
`rt-container`, the filters of the toolbar, the bottom sheet of the second kit, the header of a
sheet and its question before closing (subdomain `sheet-header-cards`), the sheet opened from a
sheet (subdomain `sheet-stack`)
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the side panel, subdomain `aside`, written by task RT-3532 of epic RT-3530. The
scenario numbers are those of the agreement it was written from.

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
- **An opening** — the moment a closed panel appears: by the service, by the frame for an address,
  or by the frame for an address restored on a reload. A move from one record to another inside an
  open panel is not an opening.
- **The road of the arrow** — what the back arrow of the panel header does: it reports its dismiss
  to the application, and on a panel opened by the service it closes the panel by its handle.
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
«Несохранённые правки» at the bottom of the screen: a card with the red «Закрыть без сохранения»
and «Сохранить и закрыть», and «Остаться» in a card of its own under it. The filters ask
«Применить изменения?» the same way, with «Не применять», «Применить» and «Отмена».

## Rules

- **On a phone every side panel opens as a bottom sheet of the full height.** It holds for a panel
  opened by the service, by an application or by one of the five places of the kit, and for the
  route panel of the frame in both of its modes, over the page and beside the content.
- **From 481 points a side panel stays as it is.** Up to 768 points it slides in from its edge
  across the whole width, wider it keeps its own width.
- **The form is chosen by the window at each opening and kept until the panel closes.** A window
  that crosses 480 points while the panel is open, a phone turned on its side among them, changes
  neither the sheet into a panel nor the panel into a sheet. The panel of a frame beside the
  content is judged at each of its openings; a move to another record inside the open panel keeps
  its form, and a panel restored on a reload is judged anew.
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
  centre, the main action on the right.** The back arrow is not drawn: «×» stands in its place and
  runs the road of the arrow. A header that switched the arrow off draws no «×» either. The title
  stands in the centre whatever stands on its sides, in one line cut by an ellipsis.
- **The main action moves from the footer to the right of the header as a filled button.** It is
  the button of the primary slot; with several there, the last one moves and the rest stay in the
  footer. A press on it does what the footer button did. A panel without a main action keeps the
  right side of the header empty.
- **The icon buttons of the panel header stand to the left of the main action.**
- **A close-only button is not drawn in the sheet, and the other buttons of the footer stay in its
  footer.** «×» runs the road of the arrow, not the handler of the hidden button. A button of the
  dismiss slot with a meaning of its own stays seen when its footer switches the short label off. A
  footer left with nothing takes no room. The buttons left in the footer take the size of the main
  action in the header: 32 px high, 13 px type, with 12 px above and below them. A button the panel
  marks dangerous stays red in the footer.
- **The panel sheet closes by «×», by a swipe down past the threshold of a sheet, by a tap on the
  strip above it and by Escape.** A shorter swipe returns the sheet to its place. The swipe obeys
  the switch of the tap on the dim, Escape obeys its own switch of the opening and of the setting
  of the kit. A gesture switched off, and a panel held from closing, leave the sheet open and report
  a close request; a refused swipe is reported as a refused tap on the dim.
- **A panel with an edits guard asks about its unsaved edits before it closes by any of the four
  roads and by a navigation.** The back button of the browser or of the phone reaches the panel
  through its guard, as on a wide screen. While a write goes, a close is ignored. A second request
  to close while the question is shown does not ask again.
- **On a phone a panel opened by the service with the unsaved sign set asks the same question
  before it closes by a gesture or by «×».** A close by code through the handle closes it at once,
  whatever the sign. «Сохранить и закрыть» reports a save request to the application, which saves
  and closes the panel by code; it need not clear the sign. «Закрыть без сохранения» closes the
  panel; «Остаться» keeps it. A panel held from closing refuses before it asks. Without the sign
  the panel closes or refuses as before, and from 481 points the sign changes nothing.
- **On a phone the question about the unsaved edits stands at the bottom of the screen in the look
  of the sheet's question.** It keeps the words and the three outcomes of the panel's question. The
  question is an action sheet of a phone: two cards 12 px from the sides and 24 px from the bottom.
  The first holds the title and the message, then the red «Закрыть без сохранения» and «Сохранить и
  закрыть», which takes the focus; the second holds «Остаться». The sheet under the question is out
  of reach.
  «Остаться» returns the focus to where the close was asked from; asked by a swipe or a tap, the
  focus goes to the sheet itself. From 481 points the question stays the window in the centre.
- **The filters of the toolbar in the sheet ask before they close with a change not applied.** A
  change is a value of a field that differs from its value at the opening: a value typed and
  returned is no change. The question is the one of the page filters sheet: «Применить» reports
  `filtersApply` and closes, «Не применять» reports the drop to the application apart from the
  closing and closes, «Отмена» keeps the sheet. With no change the sheet closes at once. From 481
  points the filters ask nothing, as before.
- **Escape closes the top layer only, wherever the focus stands.** With the focus on the page under
  the panel sheet, Escape closes the panel sheet when it is the top layer. A sheet, a list or a
  dialog opened over the panel sheet takes Escape first, and Escape pressed inside the panel sheet
  goes no further.
- **The opened panel sheet puts the focus on its «×», unless the panel marked a node of its own for
  the first focus; the closed one returns it to the node it was opened from.** It holds for the
  panel sheet only: the other sheets of the kit keep their focus. It holds for a sheet opened from a
  button, by code and by an address. A focus already moved elsewhere, or an opener no longer on the
  page, is left alone. A panel that keeps Tab inside keeps it inside the sheet.
- **A sheet opened from a sheet opens in the same sheet: its content and title take the place of
  the first ones, and «×» on the left becomes a back chevron.** The list of a select, the sheet of
  a date field, the menu of a button — opened from any kit sheet, the panel sheet included. The
  panel keeps its place and height; the first screen keeps what was typed in its form and the
  focus of the field that opened the second one. The chevron, a choice, a swipe down and Escape on
  the second screen bring back the first one; they do not close the sheet. The owner's word:
  «нужно открывать в том же меняя содержимое а вместо кнопки крестик (слева в шапке) кнопка назад
  шеврон». The rule holds for every sheet of the kit, subdomain `sheet-stack`.
- **The parts of a panel live in the sheet unchanged.** The request error, the empty content, the
  pending layer, the tabs layout and the row under the header stand where they stand in the panel;
  the overline, the subtitle, the badges and the content of the title column stand under the title.
- **The tabs of a panel sheet are one row that scrolls round, like the presets of the period
  sheet.** The tabs that do not fit scroll sideways in a circle, the edges of the row fade over
  32 points, and the selected tab stands in the centre. The owner's word at the mockup: «прикинь как
  на дейтпикере в ботомшите чипы листаются и затеняются когда не влазят и листаются каруселькой».
- **The panel sheet is announced as a modal dialog by the name of the panel, else by its title.** It
  blocks the page and locks its scroll.
- **No setting keeps the side panel at the side on a phone.** Neither the setting of the kit nor the
  opening of a panel gets one.

## What is out of scope

- The dialog, the confirm popover, the tooltip and the drawer: they do not become sheets. A dialog
  opened over the panel sheet stays a dialog.
- The panel from 481 points: neither its look nor its question changes.
- The words and the outcomes of the question about the unsaved edits, and when a route panel asks:
  subdomain `aside`. The details of the workspace ask nothing, as before.
- A navigation, the back button among them, under a panel opened by the service: the panel leaves
  by its switch of removal on a navigation, as today, and asks nothing.
- The toolbar whose filters panel is the application's own: the application's panel asks or not by
  the application. Only the kit's own filters panel asks.
- The content of a panel: the application's templates.
- The threshold of 480 points and the setting `RT_POPOVER_SHEET`.
- The release of the kit.

The neighbouring subdomains name the panel sheet where they meet it: `toolbar-filters` for the
filters in the sheet, `aside-options` for the window about the unsaved edits and the full-window
width from 481 points, `workspace-breakpoint` for the details panel with its arrow and «Close» from
481 points, `popover-sheet` for what opens in a sheet, `sheet-header-cards` for the header without
«×» and the question as an action sheet.

## Contract

Not applicable: no procedures. The surface of the kit grows by these things:

- the handle of a panel takes the unsaved sign and reports a save request;
- the toolbar reports the drop of the filters not applied;
- the bottom sheet takes the labels of its question — the title, the message and the three
  answers — instead of its own, so the panel asks by its own words;
- the bottom sheet takes a switch by which its apply answer reports the request and leaves the sheet
  open, so the panel closes only after the save.

The header, the footer and the frame get no new input for the sheet.

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

The whole subdomain is about the phone, up to 480 points, drawn at width 375. The sizes of the
header, of «×» and of the strip on top are those of the sheet, subdomain `sheet-header-cards`. The
owner approved the frames before the code and the showcase after it; they show the place of the
main action and of the header icon buttons in each of the five places of the kit.

### Several objects

Two panels open at once on a phone are two sheets in the order of opening: the later one replaces
the earlier, and its closing shows the earlier one again.

## Decisions

The owner gave the adaptation of the panel to the sheet into the work: «все как у шторки,
адаптировать асайд, прикинь что можно сделать». The decisions below are taken under that word and
are shown to him by the frames.

- **The panel is drawn by the sheet of the kit, which takes two inputs for it.** The sheet already
  holds the swipe, the question at the bottom, Escape of the top layer, the order of sheets and the
  place above the keyboard. The labels of the question and an apply answer that leaves the sheet
  open are all the panel lacks. Rejected: a second sheet inside the panel, which would diverge from
  the first at its first edit.
- **The question keeps the panel's words in the sheet's order.** The panel asks about edits of a
  record, not about a choice not applied: «Применить» would name the wrong outcome. The order and
  the place are the sheet's, by the owner's choice «Внизу, как у шторки»: one question on a phone
  reads the same wherever it comes from. The approved mockup draws it as an action sheet of a phone,
  the drop in red above the save and «Остаться» apart. Rejected: the panel's order with the save
  answer last.
- **The record panel is a sheet too, in both modes of the frame.** Leaving it at the side would
  split one rule into two.
- **The form is chosen at each opening and kept until the closing.** A form changing under the
  hands of a person who edits would move the fields and drop the focus. A move to another record is
  not an opening, since the panel stays on the screen. Rejected: following the window at once.
- **«×» runs the road of the arrow, and a close-only button is not drawn.** Two closings on one
  screen differ only in place. The kit tells such a button by the short label «Закрыть» it already
  gives it on a phone; a button with a meaning of its own switches that label off and stays.
  Rejected: «×» calling the handler of the hidden button, which the kit cannot see.
- **The header icon buttons stand to the left of the main action.** The right side of the header
  is the side of actions in the sheet. Rejected: a row of their own under the header, which takes
  height from the body.
- **With several buttons in the primary slot, the last one moves.** The footer row ends with the
  main action, so the last button is the one a person reads as the main. Rejected: leaving all of
  them in the footer, which leaves the header without the action the owner named.
- **The panel's own first-focus node wins over «×», and the focus on «×» is the panel sheet's
  only.** The application marked the node on purpose, and on a wide screen it takes the focus. The
  other sheets of the kit open from a field, and their focus rules are approved already. Rejected:
  «×» always, and «×» for every sheet.
- **A header without the arrow draws no «×».** The application switched the arrow off to keep the
  person in the panel until a button closes it; «×» would undo that. The swipe and Escape still
  follow the switches of the opening. Rejected: «×» on every sheet, which overrides the switch.
- **The swipe obeys the switch of the tap on the dim, and a refused swipe is reported as a tap.**
  Both are gestures outside the content, and the published kinds of a close request stay as they
  are. Rejected: a switch and a kind of its own, which widen a published surface.
- **The handle of a panel opened by the service takes an unsaved sign the application sets.** The
  kit cannot see the edits of such a panel, and without the sign its application asks by a window
  of its own, which gives the phone a second look of the question again. The sign gates the
  gestures and «×» only: a close by code is the application's own decision, and after a save it
  must close without clearing anything. Rejected: leaving the question to the application.
- **The filters of the toolbar ask in the sheet, by values.** A sheet closed with data entered
  asks, by the rule of the video the epic follows, and the page filters sheet already asks so. A
  value typed and returned leaves nothing to lose. Rejected: closing silently, and asking after any
  input.
- **The panel sheet always dims the page.** A full-height sheet covers the page anyway, and a page
  left reachable under it takes taps nobody sees. Rejected: obeying the frame's input without a dim.
- **No opt-out.** The owner named no exception, though the setting of the kit and the opening of a
  panel are places one could hang on.

## Open questions

None.

## History of changes

| Date       | What changed                                                                      |
| ---------- | --------------------------------------------------------------------------------- |
| 2026-11-24 | The agreement is written by task RT-3532, scenarios 1802…1833                     |
| 2026-11-24 | The eleven open questions are decided under the owner's word, scenarios 1834…1846 |
| 2026-11-24 | The remarks of the review: the road of «×», the inputs of the sheet, the back     |
|            | button, the order of the answers, the opening; scenarios 1847…1862                |
| 2026-11-25 | The approved mockup: the footer fields of 12, a dangerous button stays red, the   |
|            | question as an action sheet of two cards; scenario 1863                           |
| 2026-11-25 | The agreement is merged as the subdomain `aside/phone-sheet` with its numbers     |
