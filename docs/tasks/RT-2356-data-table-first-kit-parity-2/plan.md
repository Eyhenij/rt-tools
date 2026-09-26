# План

**Task:** RT-2356 · **Branch:** RT-2356-data-table-first-kit-parity-2
**Spec:** `docs/specs/ui-kit-v2/table-material-theme/spec.md`
**Behaviour:** changes

## След задачи

| Что     | Где                                                                                              |
| ------- | ------------------------------------------------------------------------------------------------ |
| Спеки   | `docs/specs/ui-kit-v2/table-material-theme/`                                                     |
| Правила | `.claude/skills/rt-tools-styling/`, `.claude/skills/styling-bem/`                                |
| Код     | `projects/ui-kit-v2/src/styles/`, `tools/build-tokens-v2.mjs`, `projects/ui-kit-v2/package.json` |
| Таблица | `projects/ui-kit-v2/src/lib/components/data-table/`                                              |
| Тексты  | `projects/ui-kit-v2/README.md`, `projects/ui-kit-v2/docs/Theming.mdx`                            |

## Что считается сделанным

- Путь `@rt-tools/ui-kit-v2/styles/tokens.coexist.css` находится из собранного пакета.
- Правило полосы прокрутки кита не действует на узлы без класса кита.
- Под набором и тёмной темой имена, которые набор берёт цепочкой `--mat-*`, читают эту цепочку.
- Без Material кадры набора в тёмной теме не расходятся с прежними.
- Фон полосы действий таблицы задаётся ручкой `--rt-table-actions-bg`.
- README называет оба признака тёмной темы и градиент на `body`.
- Проверки второго кита зелёные, каждый разошедшийся кадр просмотрен глазами.

## Этапы

### 1. Файл совместимости

- **Steps:**
    1. Отдать файл совместимости из пакета и защитить набор на корне
- **Readiness sign:** путь находится из собранного пакета.
- **Verified by:** `require.resolve` из временной папки с собранным пакетом

### 2. Полоса прокрутки

- **Steps:**
    1. Сузить правило полосы прокрутки до узлов кита
- **Readiness sign:** в собранном `tokens.css` нет правила полосы на `*`.
- **Verified by:** `grep` по собранному `tokens.css`

### 3. Тёмная тема под набором

- **Steps:**
    1. Собрать генератором тёмные имена набора из цепочек Material
    2. Подключить их после тёмной темы на корне и на узлах набора
- **Readiness sign:** `check:tokens-build` зелёный, кадры набора в тёмной теме не разошлись.
- **Verified by:** `pnpm run check:tokens-build`, `node tools/visual-gate.mjs ui-kit-v2`

### 4. Фон полосы действий и README

- **Steps:**
    1. Дать полосе действий ручку фона
    2. Описать в README признаки тёмной темы и градиент
- **Readiness sign:** `check:tokens-graph` и `check:docs` зелёные.
- **Verified by:** `pnpm run check:tokens-graph`, `pnpm run check:docs`

### 5. Проверки и PR

- **Steps:**
    1. Прогнать проверки и просмотреть кадры
    2. Открыть PR в ветку эпика
- **Readiness sign:** ворота отправки пропускают ветку.
- **Verified by:** `git push` без отказа
