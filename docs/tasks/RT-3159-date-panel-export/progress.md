# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 из 3 — Показ владельцу
- **Done:** панель выдана, метод `draftFiles` добавлен, вход `isTodayButtonShown` добавлен. Вид одобренных кадров перенесён в кит: соседние дни, зачёркнутые дни за границей, «Пн» с заглавной, подписи «Часы» и «Минуты», «Сейчас» и «Сбросить» в поповере, значение в подвале шторки, история с кнопкой-иконкой, заголовок шторки через `[sheetHeader]`. Сценарии SC-UKV-1173…1177. Числа: поповер `7586:2559` 59 из 59, шторка даты со временем `7586:2677` 19 из 19, всего 78 из 78. В кадре колонки опущены на 0,5, подписи «Сейчас» и «Сбросить» сдвинуты к значениям кода, верх шторки опущен на 6,5 к отступам `rt-bottom-sheet`. Эталоны дат пересняты: 13 обновлены, 1 новый, каждый просмотрен
- **Next step:** пересъёмка эталонов, коммит, показ витрины владельцу и сессии-заказчику
- **Uncommitted:** правки кода, историй, спеков и эталонов
- **Waiting for the owner:** витрина нового вида. Макет одобрен 08.11 («Одобряю макет»), «Пн» с заглавной в обеих панелях («В обеих панелях»). Пуш, PR и выпуск только после слова «одобряю»
- **Review of the requesting session (2026-11-08):** дефект 7 (сетка дней пропадала на узком окне) исправлен в `rt-calendar.component.scss`, эталоны календаря пересняты. Владелец через сессию-заказчика велел перенести в кит вид одобренных кадров: заголовки «Часы» и «Минуты», серые дни соседних месяцев, зачёркнутые дни до `min`, «Пн» с заглавной (задевает панель даты и панель периода), «Сейчас» и «Сбросить» в подвале даты со временем, значение слева в подвале шторки, история с кнопкой-иконкой, заголовок шторки через слот `[sheetHeader]`. Порядок: кадр в Figma кита, одобрение владельца, код
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
 M projects/ui-kit-v2/src/lib/components/calendar/rt-calendar.component.html
 M projects/ui-kit-v2/src/lib/components/calendar/rt-calendar.component.scss
 M projects/ui-kit-v2/src/lib/components/calendar/rt-calendar.model.ts
 M projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.html
 M projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.scss
 M projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.ts
 M projects/ui-kit-v2/src/lib/components/date-picker/rt-date-panel.logic.ts
```

### Commits over the main branch

```
4fafc63d2 fix(rt:ui-kit-v2): календарь на узком экране не прячет единственный месяц
f32fb94d8 docs(rt:ui-kit-v2): вход isTodayButtonShown в таблице панели и в поповере истории
f3e815581 feat(rt:ui-kit-v2): панель даты получила вход isTodayButtonShown
7567260c0 feat(rt:ui-kit-v2): панель даты выдана из пакета, чат отдаёт файлы черновика методом draftFiles
5b4978f07 docs(rt:ui-kit-v2): план выдачи панели даты и чтения файлов черновика
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
