# Grill

## The owner request

> бери в работу эпик 2370, перетяни тикет на борде в колонку in progress, создавай ветку и выполняй
> задачи друг за другом, ветки делай каскадом чтобы при слиянии веток по очереди не было
> мерж-конфликтов

The task itself, as written in the queue:

> Сейчас `rt-date-picker` — обёртка над браузерным полем (`type` date, time, datetime-local):
> календарь и выбор времени рисует браузер, своего нет.
>
> В макете у полей свой вид, как у остальных полей и списков кита:
>
> - дата — панель с месяцем, листанием, выбором месяца и года; сегодня отмечено рамкой; выбор дня
>   сразу закрывает панель; внизу «Сегодня»;
> - время — две колонки: часы и минуты с шагом; внизу «Сейчас» и «Готово»;
> - дата и время — месяц и колонки времени рядом; значение применяется кнопкой «Применить».
>
> Что сделать: договориться в описании кита о поведении — клавиатура, ввод с клавиатуры в поле,
> границы min и max, шаг минут, узкий экран; сделать свою панель у `rt-date-picker` для трёх типов;
> обновить истории витрины и снимки.
>
> Узкий экран в макете: панель открывается нижней шторкой (`rt-bottom-sheet`), дни крупнее — 44 px
> под палец. У даты со временем месяц и колонки времени разделены переключателем «Дата | Время».

## What the tree already has

- `rt-date-picker` wraps the browser field; the value format is the browser field's string.
- The kit has a popover directive for panels, a bottom sheet and a breakpoints service.
- The kit has a calendar component; whether its month grid fits the panel is checked in stage 2.
- The exploration of the component, the calendar and the labels is recorded in the progress as
  decisions along the way.

## What the rules already say

- `reuse-first`: the ready-made is extended, not cloned — the month grid and the overlay come from
  the kit.
- `rt-tools-styling`: sizes by the pointer sign, the narrow threshold from the breakpoints service.
- `rt-tools-storybook`: every input axis at every value, the panel in its own stories.

## Questions and answers

The owner answered the recommended option in every menu of this epic and ordered the tasks to be
done one after another. The questions are closed by assumption, each by the option a menu would
have recommended:

- **What the value is** — closed by assumption: the same string as today (`YYYY-MM-DD`, `HH:mm`,
  `YYYY-MM-DDTHH:mm`), so no consumer moves.
- **Can the person type into the field** — closed by assumption: yes, in the same format; a typed
  value outside the bounds or unreadable leaves the field invalid, not silently corrected.
- **What min and max do** — closed by assumption: days and times outside are shown disabled and
  cannot be chosen; month paging stops at the bounds.
- **The minute step** — closed by assumption: an input `minuteStep`, default 5, as in the mockup.
- **Keys in the panel** — closed by assumption: the grid pattern — arrows move the day, PageUp and
  PageDown the month, Home and End the week edges, Enter chooses, Escape closes.
- **The narrow screen** — closed by assumption: the panel opens in the kit's bottom sheet, days
  44px, and date with time switches «Дата | Время».
- **Does it need an edit of a law or a rule** — closed by assumption: no.

## Decisions

- **The value keeps its present shape** — a change of shape moves every consumer.
- **The panel's pieces are pure logic plus thin components** — the month grid, the time columns
  and the bounds are counted by functions and checked by a call.

## What is left unclear

- none that blocks the work
