# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 из 3 — Показ владельцу
- **Done:** панель выдана, метод `draftFiles` добавлен, вход `isTodayButtonShown` добавлен, истории и спеки написаны, кадр `7586:2554` дополнен телефоном без «Сегодня», числа 110 из 110
- **Next step:** показать витрину и записать ответ
- **Uncommitted:** правки кода, историй, спеков и эталонов
- **Waiting for the owner:** ответ о кадре `7586:2554` и о витрине, и выбор, нужна ли история со списком сроков. Пуш, PR и выпуск только после слова «одобряю»
- **PR:** not open yet

## Steps

- [x] 1.1 Выдать панель из бареля и описать входы и выходы
- [x] 1.2 Добавить метод draftFiles в чат
- [x] 1.3 Написать сценарии и тесты
- [x] 2.1 Добавить историю панели в поповере и в шторке
- [x] 2.2 Обновить обзоры и спеки
- [x] 3.1 Снять числа панели и сверить с кадром
- [>] 3.2 Показать витрину и записать ответ

## Decisions along the way

- **История названа `Molecules/Forms/DatePanelOpening`, а не `DatePanel/Opened`.** Цель у неё своя обёртка, а заголовок `DatePanel` занят матрицей. Затронут признак этапа 2 в плане.
- **Шторка показана в ящике ширины телефона.** Она прибита к окну и на широком экране растягивалась на 2560 точек. Затронут этап 2.
- **Шторка показана дважды: дата и дата со временем.** Кадр `7539:440` рисует дату, а экрану нужна дата со временем. Затронут этап 3.
- **Новых типов в `IRtDatePicker` нет.** Входы и выходы описаны комментариями у самих полей: типы пакета берут их оттуда. Отдельный интерфейс был бы второй копией тех же имён. Затронут этап 1.
- **Два числа вынуты из счёта сверки.** Высота панели 444 и 443,5 и ширина подписи месяца 88 и 87,73: Figma округляет блоки текста до целых, браузер нет. Так же записано в RT-3123. Вид панели не менялся. Затронут этап 3.
- **Поверхности у панели нет, и это записано в документах.** Фон и рамку в поле даёт обёртка поповера, потребитель делает то же сам. Своя поверхность панели дала бы двойную рамку внутри поля.
- **Добавлен вход `isTodayButtonShown`, по слову владельца.** Бриф говорил, что входы те же и вид не меняется, владелец расширил это сам. Умолчание `true`, поэтому поле даты не меняется. Без кнопки у типа `date` подвала нет: иначе осталась бы пустая полоса с чертой. Затронут этап 3.
- **Сверка идёт по кадру `7586:2554`, а не `7539:440`.** Владелец потребовал новый кадр. Числа и наложение снимаются заново. Затронут этап 3.

## Sessions

### 2026-11-07

- Задача заведена, копия `.claude/worktrees/rt-date-panel`, база `origin/main` на версии 0.41.0.
- Числа кадра `7539:440`: 41 из 43. Расходятся высота панели 444 и 443,5 и ширина подписи месяца 88 и 87,73: Figma округляет блоки текста до целых.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/rt-date-panel
**Branch:** RT-3159-date-panel-export

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 3 из 3 — Показ владельцу
- **Next step:** показать витрину и записать ответ
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3159-date-panel-export/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/specs/ui-kit-v2/date-panel/implementation.md
 M docs/specs/ui-kit-v2/date-panel/scenarios.md
 M docs/specs/ui-kit-v2/date-panel/spec.md
 M docs/tasks/RT-3159-date-panel-export/progress.md
 M projects/ui-kit-v2/src/lib/components/date-picker/Overview.mdx
 M projects/ui-kit-v2/src/lib/components/date-picker/panel/CONTEXT.md
 M projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.html
 M projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.spec.ts
 M projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.ts
 M projects/ui-kit-v2/src/lib/components/date-picker/stories/component/test-date-panel-opening.component.ts
 M projects/ui-kit-v2/src/lib/components/date-picker/stories/date-panel-opening.stories.ts
```

### Commits over the main branch

```
7567260c0 feat(rt:ui-kit-v2): панель даты выдана из пакета, чат отдаёт файлы черновика методом draftFiles
5b4978f07 docs(rt:ui-kit-v2): план выдачи панели даты и чтения файлов черновика
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
