# Grill

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
