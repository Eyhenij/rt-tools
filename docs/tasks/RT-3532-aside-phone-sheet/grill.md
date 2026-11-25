# Grill

**Draft:** `docs/specs/ui-kit-v2/proposed/aside-phone-sheet/`

## The owner request

> нужно проанализировать все компоненты которые открываются в ботомшит + асайды на мобилке нужно
> открывать как ботомшит только на весь экран по высоте

The request of 23.11.2026 that opened the epic RT-3530; this task is its second part. Answers given
then, at the start of RT-3531:

- How to split the request: «эпик и 2 задачи, первая по текущим ботомшитам (…) и вторая задача
  открытие асайд в ботом шит на всю высоту».
- From which width the aside becomes a sheet: «До 480, как все шторки».
- How the aside sheet closes: «Свайп есть, с вопросом».
- The header of a full-height sheet: «крестик (отменить) слева, применить (готово) справа, это
  базовый вид но возможны варианты с подвалом и доп кнопками».

After PR #3620 was merged: «вмержил работай дальше».

## What the tree already has

- `RtAsideService.open()` (`aside/rt-aside.service.ts`) does not look at the width: the panel slides
  in from the side, full width up to 768 points (`aside/_rt-aside-overlay.scss`).
- The kit opens an aside itself in five places: the filters of `rt-toolbar`, the details of
  `rt-workspace` on a narrow screen, the table settings, the data list settings, and the route
  panel of `rt-container`, which builds its own overlay with the same `rt-aside-overlay` classes.
- `rt-bottom-sheet` is a template component: × on the left, title in the middle, action on the
  right, a handle with an 80-point swipe threshold, a stack service, `fullHeight`, `unsaved`. Its
  unsaved question stands at the bottom of the screen with «Применить / Не применять / Отмена».
- `rtOpenPopoverSheet` (`popover/rt-popover-sheet.helper.ts`) already opens a sheet by code in a CDK
  overlay with Escape and the exit animation: the sample for an aside opened by the service.
- The page filters of `rt-page-bar` already sit in a sheet with the unsaved question: a sample of
  «filters in a sheet with the question».
- The aside's unsaved question (`aside/unsaved-dialog/`) is a centred `rt-dialog` with Discard /
  Stay / Save, used only by the route panel; the filters and the details ask nothing.
- The phone threshold is one: `RT_PHONE_WIDTH = 480` and `BreakpointsService.phone`.
- `docs/specs/ui-kit-v2/aside/spec.md` says «Mobile layout: Not applicable» — it changes here.
- Paths above are under `projects/ui-kit-v2/src/lib/components/`.

## What the rules already say

- `kit-approval`: a visible kit edit starts with a Figma frame approved by the owner, then the
  showcase matched by numbers and approved by a second answer.
- The epic plan names four questions RT-3532 settles before its mockup: who listens to Escape when
  focus stands outside the sheet; where focus goes when the sheet opens not from a field; one look
  of the unsaved question (the sheet asks at the bottom, the aside in a centred dialog); a sheet
  opened from a full-height sheet under a form.

## Questions and answers

**Какой вид у вопроса о несохранённом у асайда-шторки?** Options: «Внизу, как у шторки
(Рекомендую)», «Окно по центру».
«Внизу, как у шторки (Рекомендую)»

**Какая шапка у асайда-шторки?** Options: «Шапка шторки, подвал асайда (Рекомендую)», «Шапка
асайда как есть».
«все как у шторки, адаптировать асайд, прикинь что можно сделать»

## Decisions

- **Every aside up to 480 points is a sheet, the record panel of `rt-container` included** — the
  owner's words «асайды на мобилке нужно открывать как ботомшит» name no exception. Rejected: leaving
  the record panel at the side — it splits one rule into two.
- **The aside sheet takes the sheet header: handle, × on the left, title in the middle, the main
  action on the right; other footer buttons stay in a footer** — the owner's «все как у шторки,
  адаптировать асайд» and his earlier header answer «крестик (отменить) слева, применить (готово)
  справа (…) возможны варианты с подвалом и доп кнопками». Rejected: the aside header as it is.
- **The unsaved question of the aside sheet stands at the bottom, as the sheet's** — the owner's
  choice. From 481 points the aside keeps its centred dialog.
- **Escape and focus follow the sheet** — Escape closes the top sheet through the question, focus
  goes to the × of the opened sheet and returns to the opener on close. The four epic questions
  are settled by the sheet's existing behaviour; the agreement names each.

## What is left unclear

- The exact place of the main action in each of the five kit asides — the mockup shows it, the
  owner approves it there.
