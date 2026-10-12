# Grill

Former address: docs/tasks/RT-2553-kit2-inline-edit/grill.md

## The owner request

> 1-9 берем

The words answer the list of the epic RT-2542; item 6 of it is the inline edit. The task card #2553
retells it: «В приложении плашка и текст превращаются в поле с «Сохранить» и «Отмена». Во втором
ките такого нет. Нужна правка на месте на полях кита: Enter сохраняет, Escape отменяет.»

A later word of the owner holds the delivery: «снимай драфт пр и возвращайся к эпику делай все я
утром гляну пры не открывай откроеш после моего апрува, проверь сам живьем все».

## What the tree already has

- The second kit has a text field `rt-input`, buttons and icon buttons; it has no inline edit.
- The epic plan `docs/plans/kit2-app-parts.md` says every component is shown on :6007 first, and the
  PR opens after the owner's word.
- The application's component is being read from the sample repositories; what it does lands in the
  decisions along the way of the progress.

## What the rules already say

- A port takes the application's component into the kit, it is not reduced to a mode of a ready one.
- No Material in the second kit; labels come from the kit dictionary in eight languages.
- Every interactive element carries `qa-dataid`; the size of a control follows the pointer sign.

## Questions and answers

None: the shape follows the task card and the application's component.

## Decisions

- **One component draws the value at rest and the kit field with «Save» and «Cancel» while editing.**
  The value at rest is the application's markup or plain text; Enter saves, Escape cancels.
- **The component hands the new value out and does not store it.** The application saves it and may
  refuse; the field stays open until the application answers.

## What is left unclear

- How the edit looks inside a chip and inside a line of text — shown on the showcase, the owner
  judges it there.

## Decisions along the way

- The applications' samples, read before the spec. The first application's badge is a field all the
  time: focus selects the text, Enter and leaving save, Escape restores, an empty value goes back
  silently. The same wiring is copied by hand into a page title. The second application opens a
  field with «Save» and «Cancel» under a settings row, the save unavailable for an empty value,
  without keys. Neither is a component of the kit, and the kit holds the pattern only inside the
  editable list rows.
- The draft lives in a form control, not in a two-way binding: the binding wrote the value into the
  field a tick after the first render, and the select-all on opening found an empty field.
- Leaving the field keeps it open by default; the first application's way — save on leaving — is the
  input `blurAction="save"`.
- The measurement on :6007 found two defects, both fixed. The badge took the action colour on a light
  plate, a contrast of 4.0 and 3.4 for small text; it now takes the neutral `rt-tag` colours, and an
  empty badge is muted. A field disabled while saving dropped the focus onto the page, and it now
  comes back to the field on a refusal and to the value on closing.
- Colours, gaps and the badge became `--rt-inline-edit-*` properties with the former steps as
  defaults. The material preset reassigns five of them after the application's badge, and the badge
  text stays the primary colour for contrast. The owner's words: «все переносимые компоненты из апки
  должны иметь базовую вьюху кита + материальную но без использования пакетов материал, стили должны
  быть заданы через токены чтобы поддавались модификации из апки + необходимые входы».
- On 10 October a live comparison showed that the application cannot move onto the kit without its
  badge: the badge is the field, grows with the text up to 384px, saves on Enter and on leaving,
  reverts on Escape and reverts an empty value silently. A new look `chip-field` carries it, so the
  default `text` and the `chip` look keep the field with buttons. A new input `fieldIcon` names the
  icon on the left. Four rules with scenarios SC-UKV-831–834 and seven specs were added. The width
  comes from a hidden copy of the text in one grid cell with the field. The material colours are
  `--rt-mat-neutral-5`, `--mat-sys-primary-fixed-dim` and `--mat-sys-primary`, with kit fallbacks.
  The story ChipField shows the look in both presets. The middle truncation of the application is
  not carried over: the kit scrolls the text and shows it whole in a tooltip. Affected stage: 4.
- **2026-10-12. The middle truncation comes behind the `truncate` input.** The owner said «расширь
  чего не хватает по функционалу и возможность задать вью через вход или токены стилей». With
  `truncate="middle"` the field chip draws, out of focus, a layer over the field: the start with an
  ellipsis and the last ten characters (SC-UKV-848). The hidden copy still gives the width and
  wakes the tooltip; focus hides the layer and shows the field. The default `end` keeps the present
  look. The application's code was searched for its middle truncation and gave nothing, so the
  ten-character tail is the kit's own choice. The showcase states addon rewrites `:not(:focus-within)`
  into a class union that always matches, so the rule is written by focus, not by its negation.
  Measured on :6007: the tail fits whole in both looks, the field text is transparent at rest and
  takes its colour in focus. Affected stage: 4.

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Read the application's component and write what it does into the progress
- [x] 1.2 Write the subdomain spec, scenarios and bindings for the inline edit
- [x] 2.1 Write the component, its model and styles in the components layer
- [x] 2.2 Write the specs on the rest, the edit, the keys, the save and the cancel
- [x] 3.1 Write the overview page, the matrix stories and the playground
- [x] 3.2 Measure the layout on :6007
- [x] 4.1 Take the references of the new stories after looking at them
- [>] 4.2 Run the whole set and open the PR into the epic branch after the owner's word
