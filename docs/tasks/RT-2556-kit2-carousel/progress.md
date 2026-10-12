# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — Snapshots and delivery
- **Done:** the subdomain spec with scenarios SC-UKV-825–829, the tone logic, the component with both
  looks, 22 specs green, types, linter, token and cascade checks clean; the overview, five matrix
  stories and the playground, looked at in their frames and taken as references. Main went into the
  epic branch and the epic into this one; the four icon frames were retaken for the added `folder`,
  and the whole set is green: 832 tests, 843 snapshots of 843. On 12 October the host took the
  width of the closed stack (SC-UKV-846): 23 specs, types and linters green, 843 frames of 844
  matched, and the Permissions frame was retaken. Later the same day the `labelCase` input gave the
  application's title case (SC-UKV-849): 25 specs, types and linters green, Permissions retaken.
- **Next step:** take the folder apart and open the PR into the epic branch at the owner's word.
  On 12 October the owner looked at the stack on :6007 and answered «дальше» to the question of
  the stack against the scrolling carousel of the card.
- **Uncommitted:** no
- **Waiting for the owner:** «пры не открывай откроеш после моего апрува» — the push and the PR wait
  for the owner's approval.
- **PR:** not open

## Decisions along the way

- The application's component, read before the spec: an overlapping stack of coloured label cards
  in a table cell, not the scrolling carousel of the task card. The port carries the stack, and the
  divergence is named to the owner. The whole reading is in `grill.md`.
- The material preset takes the regular weight: the application's label is 300, and the kit has no
  such step. Affected stage: 2.
- The open look of a card is drawn by the styles alone, so SC-UKV-828 is covered partly by a call
  and partly by the States frame, and SC-UKV-829 by the Presets and Themes frames. Affected stage: 2.
- The layout was looked at in the snapshot frames rather than through the browser plugin: the
  session's tab group was gone, and the tree has no pinned browser profile, so the browser was not
  driven. Affected stage: 3.
- Row 133 of the application came in the middle of the work and went into PR #2748; the carousel
  work was set aside by a named stash and restored after the merge. Affected stage: 2.

- On 10 October the stories were compared with the application's code at the owner's word «сравни
  сторис перенесенных компонентов с их использованием». The material preset took the application's
  dense grey card shadow, black in the dark theme, through a new assignment `--rt-card-stack-shadow`
  on two scale steps, and the dark label took the Material text colour. A new story Permissions
  shows a stack of the application's size: twelve cards, labels up to forty characters,
  abbreviations and cards without colour. The application lowers all but the first letter of a
  word ("AI" becomes "Ai"); the kit keeps the case of the rest, and the divergence is named to the
  owner. The application's absolute host in a table cell is not carried over: the kit stack sizes
  itself by its cards. Affected stage: 4.
- On 10 October a live comparison measured the application on screen: its cards draw
  `--rt-shadow-lg`, and the grey shadow read from its code is overridden there. The material
  preset went back to `--rt-shadow-lg`; the assignment `--rt-card-stack-shadow` and its two scale
  steps were removed. The dark label colour stays. Affected stage: 4.
- **2026-10-12. An open card does not stretch the host.** The owner asked «если использовать к
  примеру внути ячейки таблицы, должно отображаться без растягивания ячекий?». The hovered card
  grew in the flow, and the host grew with it: 160 to 215.7 points in Presets, 416 to 441.9 in
  Permissions. The host now takes `--rt-carousel-count` from the component and keeps the closed
  width; the cards do not shrink and go past it on top. Measured on :6007: 416 points with and
  without an open card. Affected stage: 4.
- **2026-10-12. The application's title case comes behind the `labelCase` input.** The owner said
  «расширь чего не хватает по функционалу и возможность задать вью через вход или токены стилей».
  Lowering the rest of a word is not a style, so `labelCase="title"` writes «AI» as «Ai»
  (SC-UKV-849); the default `as-is` keeps the present labels. The Permissions story takes the
  application's case. The light weight 300 stays with `--rt-carousel-label-weight`: the kit scale
  has no such step, and a new step for one component is not started. Affected stage: 4.

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Read the application's component and write what it does into the progress
- [x] 1.2 Write the subdomain spec, scenarios and bindings for the carousel
- [x] 2.1 Write the tone choice as a pure function with its specs
- [x] 2.2 Write the component, its model and styles in the components layer
- [x] 2.3 Write the specs on the cards, the colour, the tone, the focus and an empty list
- [x] 3.1 Write the overview page, the matrix stories and the playground
- [x] 3.2 Measure the layout on :6007
- [x] 4.1 Take the references of the new stories after looking at them
- [>] 4.2 Run the whole set and open the PR into the epic branch after the owner's word

## Session entries

- 9 October 2026: the whole set ran on the merged branch; four icon frames diverged by the `folder`
  icon from main alone and were retaken, the second run green.
