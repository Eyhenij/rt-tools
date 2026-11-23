# Progress

## Where we stand

- **State:** `эпик-заведён`
- **Stage:** 3 of 3 — Поставка
- **Done:** порог, режим `filtersPanel="app"`, `rt-toolbar-filters-panel`, история, тексты
- **Next step:** второй круг ревью по диффу ветки
- **Uncommitted:** нет
- **PR:** not open yet

## Steps

- [x] 1.1 Признак `belowNarrow` в службе ширины и полоса на нём
- [x] 2.1 Вход `filtersPanel`, выход `filtersOpen` и часть кита `rt-toolbar-filters-panel`
- [x] 2.2 История витрины и описание полосы
- [>] 3.1 Два круга ревью, набор перед отправкой, PR и слияние
- [ ] 3.2 Выпуск кита minor

## Decisions along the way

- **Панель кита рисует ту же часть `rt-toolbar-filters-panel`.** Шапка, поля и подвал не
  повторяются в двух шаблонах; хост новой части — `display: contents`, рамка панели стоит там же.
  Затронутый этап: 2.
- **Кнопка фильтров стоит последней в ряду кнопок, после настроек таблицы, и ряд прижат к правому
  краю на любой ширине.** Слово владельца 23.11: «кнопку фильтров ставь справа после настроек
  таблицы». Прежний порядок ставил её первой и уводил ряд к левому краю ниже 768. Затронутый этап: 2.
- **В наборе Toolbar в Figma зазор между зонами 8, как в коде.** Распределение «Space between»
  стирало зазор, и поле поиска стояло вплотную к кнопке. Затронутый этап: 2.
- **Вид меняется, макет нужен.** Решение разбора «Вид не меняется» отменено словом владельца
  «Нужен макет»: меняются порядок кнопки, прижатие ряда и ширина отборов в строке. Макет и витрина
  одобрены, запись в approvals.md. Затронутый этап: 2.
- **Второй круг ревью: панель в маршруте не закрывается до замера места и ждёт переход приложения
  одну макрозадачу.** На перезагрузке широкое окно при узком месте закрывало панель; переход,
  начатый приложением из микрозадачи, отменялся закрытием. Фокус после закрытия маршрута остаётся
  за каркасом приложения; пустая панель на странице без отборов описана в CONTEXT. Затронутый этап: 3.

## Sessions

### 2026-11-23

- Заявка RT-3528, ветка от `origin/main` b498977b3, назначение копии записано.
- Тесты полосы и службы ширины: 4 набора, 43 теста зелёные.
- Живая проверка в витрине (6007, закреплённый Chrome): рамка 1080 — 2 отбора в строке, кнопки
  нет; рамка 1079 — кнопка, отборов в строке 0. На 375 панель кита и панель приложения совпали:
  рамка 0,0,375×812, поля 24,104,327×140, «Сбросить» 24,748,118×40, «Применить» 219,748,132×40,
  фокус на блоке полей. В панели приложения «Применить» закрыл маршрут, кнопка открыла его снова,
  стрелка закрыла; панель кита не открывалась ни разу.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/formfield-undefined-inputs-7ce857
**Branch:** RT-3528-toolbar-filters-route

### Where we stand at the minute of the compaction

- **State:** `эпик-заведён`
- **Stage:** 3 of 3 — Поставка
- **Next step:** первый круг ревью по диффу ветки
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3528-toolbar-filters-route/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/specs/ui-kit-v2/toolbar-filters/implementation.md
 M docs/specs/ui-kit-v2/toolbar-filters/scenarios.md
 M docs/specs/ui-kit-v2/toolbar-filters/spec.md
 M projects/ui-kit-v2/src/lib/components/toolbar/CONTEXT.md
 M projects/ui-kit-v2/src/lib/components/toolbar/Overview.mdx
 M projects/ui-kit-v2/src/lib/components/toolbar/filters-panel/rt-toolbar-filters-panel.component.ts
 M projects/ui-kit-v2/src/lib/components/toolbar/index.ts
 M projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar-filters-app.spec.ts
 M projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.component.scss
 M projects/ui-kit-v2/src/lib/components/toolbar/stories/component/test-toolbar-filters.component.html
 M projects/ui-kit-v2/src/lib/components/toolbar/stories/component/test-toolbar-filters.component.ts
 M projects/ui-kit-v2/src/lib/components/toolbar/stories/toolbar-filters.stories.ts
 M tools/kit-coverage-allowlist.json
?? projects/ui-kit-v2/.storybook/__snapshots__/organisms-table-toolbarfilters--button-at-1079.png
?? projects/ui-kit-v2/.storybook/__snapshots__/organisms-table-toolbarfilters--in-row-at-1080.png
?? projects/ui-kit-v2/.storybook/__snapshots__/organisms-table-toolbarfiltersroute--app-panel-open.png
?? projects/ui-kit-v2/src/lib/components/toolbar/filters-route-aside/
?? projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.styles.spec.ts
?? projects/ui-kit-v2/src/lib/components/toolbar/stories/component/test-toolbar-filters-route.component.ts
?? projects/ui-kit-v2/src/lib/components/toolbar/stories/toolbar-filters-route.stories.ts
```

### Commits over the main branch

```
07e5cef40 feat(rt:ui-kit-v2): панель отборов полосы открывается маршрутом приложения, кнопка фильтров с 1079 (RT-3528)
f5563d823 docs(rt:ui-kit-v2): папка задачи RT-3528 — панель отборов полосы маршрутом приложения
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
