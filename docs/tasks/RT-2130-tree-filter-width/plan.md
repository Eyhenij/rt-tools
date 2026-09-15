# Plan

**Task:** RT-2130 · **Branch:** RT-2130-tree-filter-width
**Behaviour:** unchanged — владелец просит ширину фильтра; отбор, значения и адрес те же, меняется
только раскладка триггера и панели

## Task footprint

| What  | Where                                                                                                        |
| ----- | ------------------------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/message-bus/admin/` (статья о ширине фильтра, без привязки к тесту)                              |
| Rules | `.claude/skills/styling-bem/`, `.claude/skills/browser-verification/`                                        |
| Code  | `libs/message-bus-admin/common/core/ui/src/lib/tree-filter/`, `apps/message-bus-admin/src/styles/_page.scss` |

## What counts as done

- Триггер фильтра по дереву не уже самой широкой опции с её отступами и не уже выбранной подписи
  с шевроном; ни одна опция панели не переносится на вторую строку.
- Ширина берётся от подписей, а не числом: новое длинное имя дерева расширяет фильтр само.

## Stages

### 1. Размерник и раскладка

- **What is done:** в шаблоне фильтра скрытый размерник с подписями всех опций; в общем слое
  `_page.scss` — сетка хоста, строка размерника с отступами триггера и опции; тест на размерник.
- **Readiness sign:** тесты либы зелёные, стили чистые.
- **Verified by:** `pnpm exec nx test message-bus-admin-common-core-ui` — `Tests  36 passed (36)`;
  `pnpm exec stylelint 'apps/message-bus-admin/src/styles/*.scss'` — выход 0.

### 2. Измерение в браузере

- **What is done:** сборка админки поднята стендом, фильтр измерен на самом длинном имени.
- **Readiness sign:** ширина каждой опции ≥ ширины её текста + отступов; `scrollWidth` опции
  равен её `clientWidth`; высота каждой опции равна высоте одной строки.
- **Verified by:** `getBoundingClientRect` и `scrollWidth` опций через драйвер браузера — числа
  в progress.

### 3. Разбор папки

- **What is done:** статья о ширине фильтра в спеке `admin`, папка задачи в архив.
- **Readiness sign:** проверки спек и документов зелёные.
- **Verified by:** `npm run check:specs` — строка `check-specs: domains 6`; `npm run check:docs` —
  `no divergences`.

## What this work does not do

- Не трогает фильтры по состоянию и версии: их подписи короткие и известны заранее.
- Не меняет кит `rt-select`.
