# Grill

## The owner request

> бери в работу эпик 2370, перетяни тикет на борде в колонку in progress, создавай ветку и выполняй
> задачи друг за другом, ветки делай каскадом чтобы при слиянии веток по очереди не было
> мерж-конфликтов

The task itself, as written in the queue:

> В ките нет поля для выбора диапазона дат: выбрать «с какого по какое число» можно только двумя
> отдельными полями.
>
> Есть `rt-calendar`, но он показывает цены и занятость для бронирования и не является полем формы.
>
> В макете диапазон выбирается в одном поле:
>
> - значение «дд.мм.гггг — дд.мм.гггг»;
> - в панели два месяца рядом и слева быстрые варианты: сегодня, вчера, последние 7 и 30 дней, этот
>   и прошлый месяц;
> - первый клик — начало, наведение показывает будущий диапазон, второй клик — конец;
> - внизу итог (даты и число дней), «Сбросить» и «Применить»; пока конец не выбран, «Применить»
>   недоступна.
>
> Где макет: Figma, файл второго кита — страница Date Range Picker: состояния selected и selecting,
> поле в покое.
>
> Что сделать: договориться в описании кита о значении (пара дат), клавиатуре, границах и узком
> экране (один месяц, быстрые варианты сверху); сделать компонент поля диапазона; обновить истории
> витрины и снимки.
>
> Узкий экран в макете: нижняя шторка (`rt-bottom-sheet`), быстрые варианты строкой с прокруткой
> вбок, один месяц с днями 44 px. Кадр «Телефон · Период» лежит на странице Date Range Picker.

## What the tree already has

- `rt-date-picker` with its own panel from the previous task: the month grid is `rt-calendar`, the
  date arithmetic lives in `rt-date-panel.logic.ts`, the text of the field in `rt-date-text.logic.ts`,
  the locale comes from `RT_KIT_LOCALE`, the narrow sign from `BreakpointsService.narrow`.
- `rt-calendar` already draws several months and knows the states `start`, `end` and `in-range`; it
  has no hover output.
- The form control base `RtFormControlBase<T>` gives clearing, the invalid mark and the read-only
  view.
- The mockup: the field in four states (empty, filled, error, disabled), the panel in the states
  «selected» and «selecting», and the phone frame «Телефон · Период».

## What the rules already say

- `reuse-first`: the month grid, the overlay, the sheet and the text logic come from the kit; the
  calendar is extended, not cloned.
- `rt-tools-storybook`: every input axis in the stories, the panel in its own stories.
- `ui-component-tests`: a spec for behaviour, a story snapshot for the look.

## Questions and answers

The owner answered the recommended option in every menu of this epic and ordered the tasks to be
done one after another. The questions are closed by assumption, each by the option a menu would
have recommended:

- **What the value is** — closed by assumption: an object `{ start, end }` of two `YYYY-MM-DD`
  strings, `null` when empty. A half-chosen range never reaches the form.
- **Can the person type into the field** — closed by assumption: yes, two dates in the order of the
  interface language separated by a dash; unreadable text or a range outside the bounds marks the
  field invalid and leaves the value.
- **What a preset does** — closed by assumption: it fills the draft and marks itself chosen;
  «Применить» writes the value, as for a hand-picked range.
- **«Этот месяц»** — closed by assumption: from the first day of the month to today; «Прошлый
  месяц» is the whole previous month; «Последние 7 дней» end today and include it.
- **What «Сбросить» does** — closed by assumption: it empties the draft; the value is cleared by the
  field's clear button.
- **A second click before the start** — closed by assumption: the two days are put in order; a
  second click on the start gives a range of one day.
- **Bounds** — closed by assumption: days outside `min` and `max` are switched off, paging stops at
  the bound months, a preset not fitting the bounds whole is switched off.
- **Keys** — closed by assumption: the grid keys of the date panel; Enter chooses the start, then
  the end; Escape closes.
- **Does it need an edit of a law or a rule** — closed by assumption: no.

## Decisions

- **The range field is a component of its own, `rt-date-range`** — its value is a pair, not the
  string of `rt-date-picker`; a mode of the date field would give one component two value types.
  Rejected: a `range` input on `rt-date-picker`.
- **The month grid, the text and the locale are the date field's** — `rt-calendar`,
  `rt-date-text.logic.ts`, `RT_KIT_LOCALE`. Rejected: a grid of its own.
- **Days of the neighbouring months are not drawn** — the date panel shows empty cells, and both
  panels stay alike. Rejected: drawing them as the mockup does, which changes the date panel too.

## What is left unclear

- none that blocks the work
