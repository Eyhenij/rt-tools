# Grill

Former address: docs/tasks/RT-2556-kit2-carousel/grill.md

## The owner request

> 1-9 берем

The words answer the list of the epic RT-2542; item 9 of it is the carousel. The task card #2556
retells it: «Карусель в приложении листает ряд карточек... Нужна `rt-carousel` на нативной
прокрутке: стрелки, клавиатура и свайп на узком экране.»

A later word of the owner sets the shape of every port: «все переносимые компоненты из апки должны
иметь базовую вьюху кита + материальную но без использования пакетов материал, стили должны быть
заданы через токены чтобы поддавались модификации из апки + необходимые входы».

The delivery waits: «пры не открывай откроеш после моего апрува, проверь сам живьем все».

## What the application's component does

- It takes one required input — a list of cards, each a label and a colour in hex.
- The cards stand in a row and overlap: each card after the first moves under its left neighbour
  by half of its width. A card is 64 points wide, with inner room of 8 on the sides, rounding of 4
  and a large shadow.
- The label is 12 points, weight 300, line height 24, centred, cut by an ellipsis, and passed
  through title case.
- Under the pointer a card rises by 4 points, grows to the width of its label and comes on top;
  the cards after it move 16 points to the right. Every move takes 0.3 seconds, easing out.
- A card is filled with its colour, and the text takes dark or white by the brightness of that
  colour. A card without a colour keeps the strong base ground.
- The host is laid absolutely in its cell and centred by height.
- No keys, no focus, no names for a screen reader: a keyboard user never sees the whole label.
- Three table columns use it: the permissions of a role, the permissions and the roles of a user.

## The divergence from the task card

The card describes a scrolling carousel with arrows and swipe; the application's component is the
stack of coloured label cards above. The epic is a port of the application's components, so the
port carries the stack. The divergence is named to the owner in the report and in the PR body.

## What the tree already has

- The kit has `rt-tag` — a status pill with a fixed palette of six severities; it takes no free
  colour and does not overlap.
- The kit scales give radius, shadow, space, text and duration steps; the theme gives the strong
  base ground and the text colours.
- No kit file computes a contrast text colour by a hex value.

## What the rules already say

- A port takes the application's component into the kit; no Material and no third-party package.
- Every port has the kit look and the material look, its styles stand on its own `--rt-carousel-*`
  properties, and the defaults of a ready component do not move.
- Truncation goes in a pair with the whole value shown on hover; every interactive element carries
  `qa-dataid`.

## Questions and answers

None: the shape follows the application's component and the owner's word on ports.

## Decisions

- **One component `rt-carousel` with one input `cards`.** A card is a label and an optional colour;
  the colour is `#rgb` or `#rrggbb`, anything else is read as no colour.
- **The text tone is chosen by a pure function.** The brightness rule of the application picks a
  dark or a light tone, and the tone is a modifier that takes a kit text colour — no hex in styles.
- **Focus expands a card the same way the pointer does.** Every card is in the Tab order, so a
  keyboard user reads the whole label; a tap on a touch screen focuses and expands it too.
- **The label case is a property.** Title case in the application is a pipe; the kit sets
  `--rt-carousel-label-transform`, none by default and capitalised in the material look.
- **The host is laid out inline, not absolutely.** Placing it in a cell is the application's layout.
- **Every size, overlap, shift, radius, shadow, type step and duration is a `--rt-carousel-*`
  property.** The kit look is the default; the material preset reassigns them to the application's
  values.

## What is left unclear

- Whether the owner wants the scrolling carousel of the card as well — named in the report.

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
