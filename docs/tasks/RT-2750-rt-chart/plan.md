# Plan

**Task:** RT-2750 · **Branch:** RT-2750-rt-chart
**Spec:** `docs/specs/ui-kit-v2/chart/spec.md`
**Behaviour:** changes

## Points

- **A:** во втором ките нет графика; приложение рисует графики вручную блоками разметки, а `rt-bar-list` запрещает третью такую реализацию.
- **This task reaches:** в витрине кита человек открывает историю графика и видит семь видов в обеих темах, заглушку на пустых данных и скачивает PNG; RT-3335 импортирует `@rt-tools/ui-kit-v2/chart` из рабочего дерева. Разработчик приложения получает вход с выпуском после RT-3337.
- **Sign:** вход собирается отдельно, echarts нет в основном входе, peer необязательные; истории витрины с эталонами снимков; два одобрения владельца.
- **Milestone G of the epic:** ответ «обзор месяца» одним массивом `blocks`; задача даёт компонент, которым RT-3335 рисует блок `chart`.
- **Metric:** нет: компонента не было.

## Task footprint

| What  | Where |
| ----- | ----- |
| Specs | `docs/specs/ui-kit-v2/chart/` (новая подобласть) |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/mockups.md`, `docs/constitution/verifiability.md` |
| Rules | `.claude/skills/component-structure/`, `.claude/skills/kit-approval/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/rt-tools-styling/`, `.claude/skills/dependencies/`, `.claude/skills/reuse-first/` |
| Code  | `projects/ui-kit-v2/chart/ng-package.json`, `projects/ui-kit-v2/src/lib/components/chart/`, `projects/ui-kit-v2/package.json`, `projects/ui-kit-v2/jest.config.ts`, корневой `package.json` и lock-файл, токены серий, подписи `rtKit` |

## Decisions in the plan

- **Раскладка как у `pdf-viewer`:** вход `projects/ui-kit-v2/chart/` указывает на `src/lib/components/chart/index.ts`; в `src/public-api.ts` графика нет.
- **Рендерер — SVG.** Тогда сверка чисел видит заливку и обводку серий и осей, а спеки идут в jsdom без canvas.
- **API записывается в спеке подобласти до кода:** что принимает `rt-chart`, что из него берёт RT-3335 — палитру, тему, PNG.
- **Тема берётся с хоста.** Палитра читается из вычисленных свойств элемента графика; пересборка — по смене темы кита, в том числе в тёмном поддереве.
- **Подписи** «нет данных» и выгрузки PNG — в `rtKit` на восьми языках; заглушка — `rt-empty-state`, если её вид подходит макету.

## What counts as done

- Вход `@rt-tools/ui-kit-v2/chart` собирается `pnpm run build:ui-kit-v2`; echarts встречается только в собранном файле входа `chart`.
- `echarts` 6.1.0 и `ngx-echarts` 22.0.0 — необязательные peer кита, точные версии в dev; `check:unused` без находок по ним.
- Реестр видов: line, bar, pie, heatmap, scatter, treemap, sunburst; grid, legend, tooltip, непрерывная цветовая шкала; рендерер SVG.
- Палитра серий — токены кита, светлая и тёмная, в том числе в тёмном поддереве.
- Обёртка: частичное обновление данных, заглушка «нет данных», выгрузка PNG, отрисовка после того, как контейнер нулевой ширины получил размер.
- Витрина: `Playground`, истории семи видов, столбики стопкой, область с полосой прогноза, две оси, пустые данные, `States`, `Themes` с тёмным поддеревом; у каждой истории эталон снимка.
- Макет и витрина одобрены владельцем, сверка чисел полная.

## Stages

### 1. Спек подобласти chart

- **Steps:**
    1. Спек, API, сценарии и привязки подобласти `chart`
- **Readiness sign:** проверка спеков молчит.
- **Verified by:** `npm run check:specs` — код выхода 0.

### 2. Макет

- **Steps:**
    1. Кадр Figma: палитра серий в обеих темах, виды и три случая; одобрение владельца
- **Readiness sign:** строка «Макет» в approvals.md.
- **Verified by:** `node tools/check-kit-approval.mjs` — без отказа по макету.

### 3. Вход и компонент

- **Steps:**
    1. Вход `chart`, peer-зависимости, реестр видов, настройка jest под ESM echarts
    2. Компонент `rt-chart`, токены палитры, подписи `rtKit`
    3. Спеки компонента: частичное обновление, «нет данных», PNG, контейнер нулевой ширины, смена темы, реестр из семи видов
- **Readiness sign:** спеки зелёные, вход собирается, echarts только во входе `chart`, peer необязательные.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/components/chart` — «passed» с шестью сценариями; `pnpm run build:ui-kit-v2` без ошибок; поиск `echarts` по собранным файлам входов — только файл `chart`; `peerDependenciesMeta` кита — `optional: true` у обоих; `pnpm run check:unused` — без находок.

### 4. Витрина

- **Steps:**
    1. Истории и Overview: семь видов, столбики стопкой, полоса прогноза, две оси, пустые данные, тёмное поддерево
    2. Эталоны снимков всех историй графика
    3. Сверка чисел с макетом; одобрение владельца
- **Readiness sign:** эталон у каждой истории графика, прогон снимков зелёный; запись одобрений с двумя цитатами и полной сверкой.
- **Verified by:** `pnpm run test:visual:v2` — без расхождений и без историй без эталона; `node tools/kit-match.mjs numbers <figma.json> <showcase.json>` — N из N.

### 5. Сдача

- **Steps:**
    1. «Готово, когда» у #2750 переписано под выпуск после RT-3337 — по слову владельца
    2. Папка задачи разобрана в архив, набор, PR каскадом: база — ветка предыдущей невлитой задачи эпика, иначе ветка эпика
- **Readiness sign:** PR открыт.
- **Verified by:** `bash .claude/hooks/git-guard-push-ahead.sh` — «the set is green».

## What this work does not do

- Блок `chart` в `rt-ai-chat` — RT-3335.
- Таблица `View data` — RT-3336.
- Выпуск кита — после RT-3337, по слову владельца.
