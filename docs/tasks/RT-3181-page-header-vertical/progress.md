# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 7 of 7 — Закрытие
- **Done:** вкладки «Ещё», рейка, панель, кнопки в ряду с вкладками, компактная шапка и шапка телефона; макеты и витрина сверены, числа сняты заново: 250 из 250. Владелец одобрил витрину после сверки: «Одобряю».
- **Next step:** собрать витрину, обойти все истории, закоммитить, влить договорённость в спеку.
- **Uncommitted:** крестик только у выбранной вкладки (`closeOn`), маленькие кнопки, поиск и отборы в строке; новое меню телефона `rt-page-phone-menu` без логотипа; поле `active` у кнопки подвала, чат на весь экран телефона, ширины колонок таблицы как в кадрах, пять отборов во второй строке, рейка с прокруткой, история меню вкладки.
- **Waiting for the owner:** nothing. Содержимое чата расходится с кадрами: текст ответа 12 против 14, нет «+» в поле ввода; это готовый компонент чата, в задачу не входит.
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Получить ответы владельца на открытые вопросы
- [x] 1.2 Записать одобрение макетов словами владельца
- [x] 2.1 Написать договорённость в каталоге черновика
- [x] 2.2 Сверить каждое её визуальное правило с кадрами
- [x] 3.1 Вынести подбор ряда в чистую функцию с тестами
- [x] 3.2 Добавить вход режима и меню в `rt-tabs`
- [x] 3.3 Показать все состояния в витрине
- [x] 4.1 Добавить рейку и панель поверх страницы в `rt-page-header`
- [x] 4.2 Добавить кнопки в ряд с вкладками
- [x] 4.3 Добавить компактную шапку страницы в одну и две строки
- [x] 4.4 Показать все состояния в витрине
- [x] 5.1 Собрать шапку телефона в одну строку
- [x] 5.2 Подключить отборы к `rt-bottom-sheet`, действия к меню
- [x] 5.3 Показать состояния в витрине на ширине 375
- [x] 6.1 Снять числа витрины и сравнить с кадрами
- [x] 6.2 Показать витрину владельцу и записать ответ
- [x] 7.1 Влить договорённость в спеку и обновить `CONTEXT.md` компонентов
- [>] 7.2 Разобрать папку задачи и открыть запрос

## Decisions along the way

- **Режим 3 с развёрнутой колонкой удалён** — слова владельца «такой режим не нужен». Кнопка «Свернуть» ушла с ним. Affected stage of the plan: 4.
- **Кадр 1024 с чатом не рисуется** — это не телефон и редкий случай; шапка переходит на кнопки по ширине страницы. Affected stage of the plan: 4.
- **Вкладки и меню идут одной задачей и одним запросом** — слова владельца «все в один тикет и расширение режима по табам и расширение меню». Affected stages of the plan: 3, 4, 7.
- **Открытые вопросы закрыты тем, что нарисовано на одобренных кадрах** — владелец ответил «Одобряю» на вопрос о макетах, отдельных ответов не дал. Выбранная вкладка из «Ещё» встаёт в ряд, панель раздела лежит поверх вкладок, компактный футер стоит только в этих кадрах. Affected stages of the plan: 3, 4.
- **Где копия на листе расходится с витриной, код идёт по витрине** — строка меню 34, ручка шторки 2, шапка шторки 35. Правило `mockups`: копия дрейфует. Affected stage of the plan: 6.
- **Кнопки подвала рейки приходят данными `railActions`, а не слотом** — проекция внутрь рейки под условием `@if` с двумя корнями теряла содержимое. Affected stage of the plan: 4.
- **Шапка страницы переходит на кнопки по своей ширине до 768, поиск не уже 400** — числа взяты из кадров, отдельного слова владельца нет. Affected stage of the plan: 4.
- **Копии в макетах заменены компонентами** — слова владельца «в макетах не должно быть копипаст нужно переиспользовать общие части макета». Вид кадров не менялся: отпечатки всех кадров совпали до и после. Affected stage of the plan: 6.
- **Расхождения кадра с китом вынесены владельцу, код идёт по киту** — ручка шторки 4 против 2, ширина меню профиля по содержимому против 300, шапка с логотипом и «Назад» в меню телефона. Affected stage of the plan: 6.
- **Числа, зависящие от длины подписи, сравнены расстоянием до соседа** — подпись имени в кадре шириной 39, в витрине 34.8. Affected stage of the plan: 6.

## Sessions

### 2026-11-09

- На листе Page Header вертикальный режим: 28 подписанных кадров. На листе Tabs секция режима «Ещё» из 8 частей.
- Сверено с витриной: строка меню 34 (копия 37), шторка: ручка 2 и шапка 35 (копия 4 и 40), столбец меню телефона 240.
- Сессия началась на чужой влитой ветке `RT-3122-e2e-markup-section-wait`, задачи под работу не было; сторож указывал на это много раз, задача заведена только по слову владельца.
- Владелец одобрил макеты: «Одобряю».
- Кнопка профиля горизонтальной шапки вынесена в свою часть `user/`: шаблон шапки с веткой рейки вышел за 500 строк. Классы и стили кнопки остались у шапки, тесты шапки зелёные.
- Подсказка у раздела с панелью убрана: она ложилась поверх заголовка группы панели, а панель сама называет содержимое. Подпись для чтения с экрана осталась.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-3181-page-header-vertical

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 6 of 7 — Сверка с макетом и показ витрины
- **Next step:** показать витрину владельцу и записать ответ.
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3181-page-header-vertical/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/specs/ui-kit-v2/proposed/page-header-vertical/scenarios.md
 M docs/specs/ui-kit-v2/proposed/page-header-vertical/spec.md
 M docs/tasks/RT-3181-page-header-vertical/approvals.md
 M docs/tasks/RT-3181-page-header-vertical/progress.md
 M projects/ui-kit-v2/.storybook/preview.ts
 M projects/ui-kit-v2/src/lib/components/page-header/CONTEXT.md
 M projects/ui-kit-v2/src/lib/components/page-header/Overview.mdx
 M projects/ui-kit-v2/src/lib/components/page-header/bar/rt-page-bar.component.html
 M projects/ui-kit-v2/src/lib/components/page-header/bar/rt-page-bar.component.scss
 M projects/ui-kit-v2/src/lib/components/page-header/bar/rt-page-bar.logic.spec.ts
 M projects/ui-kit-v2/src/lib/components/page-header/bar/rt-page-bar.logic.ts
 M projects/ui-kit-v2/src/lib/components/page-header/rail/rt-page-actions.component.html
 M projects/ui-kit-v2/src/lib/components/page-header/rail/rt-page-actions.component.scss
 M projects/ui-kit-v2/src/lib/components/page-header/rail/rt-page-rail.component.html
 M projects/ui-kit-v2/src/lib/components/page-header/rail/rt-page-rail.component.spec.ts
 M projects/ui-kit-v2/src/lib/components/page-header/rail/rt-page-rail.component.ts
 D projects/ui-kit-v2/src/lib/components/page-header/rail/rt-page-rail.logic.spec.ts
 D projects/ui-kit-v2/src/lib/components/page-header/rail/rt-page-rail.logic.ts
 M projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.model.ts
 M projects/ui-kit-v2/src/lib/components/page-header/stories/component/test-page-header-vertical.component.html
```

### Commits over the main branch

```
118d48d36 feat(rt:ui-kit-v2): вертикальное меню и компактная шапка страницы
de5327e00 feat(rt:ui-kit-v2): режим вкладок «Ещё» и меню вкладки по правой кнопке
d138da36b docs(rt:ui-kit-v2): договорённость о вертикальном меню и режиме вкладок «Ещё»
3f0407e66 docs(rt:ui-kit-v2): макеты вертикального меню и вкладок одобрены
0c7a898ea docs(rt:ui-kit-v2): папка задачи вертикального меню
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
