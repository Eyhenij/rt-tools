# План

**Task:** RT-2374 · **Branch:** RT-2374-kit2-list-parity-3
**Spec:** `docs/specs/ui-kit-v2/table-full-port/spec.md`
**Behaviour:** changes

## След задачи

| Что     | Где                                                                                       |
| ------- | ----------------------------------------------------------------------------------------- |
| Спеки   | `docs/specs/ui-kit-v2/table-full-port/`, `docs/specs/ui-kit-v2/table-material-theme/`     |
| Правила | `.claude/skills/rt-tools-styling/`, `.claude/skills/styling-bem/`                         |
| Код     | `projects/ui-kit-v2/src/lib/components/` — data-table, data-list, empty-state, pagination |
| Токены  | `projects/ui-kit-v2/src/styles/`, источник токенов                                        |

## Что считается сделанным

- Колонка со значком без пары в таблице соответствий рисует глиф Material Symbols.
- У пустого состояния свои свойства размера значка, подложки, размера и веса заголовка; список
  под набором рисует его как первый кит.
- Отступы тулбара, зазор до таблицы и нижний отступ содержимого — свои имена; под набором 16px.
- `isPaginationShown="false"` прячет полосу страниц.
- Под набором пагинация при одной странице рисует стрелки и номера по семи местам.
- Проверки второго кита зелёные, разошедшиеся кадры просмотрены глазами.

## Этапы

### 1. Запасной значок колонки

- **Steps:**
    1. Рисовать глиф Material Symbols для имени без пары
- **Readiness sign:** тест ячейки со значком без пары зелёный.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2`

### 2. Пустое состояние

- **Steps:**
    1. Завести свойства пустого состояния и значения набора для списка
- **Readiness sign:** `check:tokens-graph` и `check:tokens-styles` зелёные.
- **Verified by:** `pnpm run check:tokens-graph`, `pnpm run check:tokens-styles`

### 3. Отступы тулбара и содержимого

- **Steps:**
    1. Завести имена отступов тулбара, зазора и нижнего отступа
- **Readiness sign:** `check:tokens-build` зелёный.
- **Verified by:** `pnpm run check:tokens-build`

### 4. Полоса страниц

- **Steps:**
    1. Передать `isPaginationShown` полосе страниц
    2. Рисовать под набором стрелки при одной странице и номера по семи местам
- **Readiness sign:** тесты пагинации и списка зелёные.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2`

### 5. Кадры и PR

- **Steps:**
    1. Прогнать кадры и просмотреть разошедшиеся
    2. Открыть PR в ветку эпика
- **Readiness sign:** ворота отправки пропускают ветку.
- **Verified by:** `git push` без отказа
