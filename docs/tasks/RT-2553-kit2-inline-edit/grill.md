# Grill

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
