# План

**Task:** RT-2360 · **Branch:** RT-2360-kit2-head-divider-material
**Spec:** `docs/specs/ui-kit-v2/table-material-theme/spec.md`
**Behaviour:** changes

## След задачи

| Что     | Где                                                 |
| ------- | --------------------------------------------------- |
| Правила | `.claude/skills/rt-tools-styling/`                  |
| Код     | `projects/ui-kit-v2/src/styles/`, источник токенов  |
| Таблица | `projects/ui-kit-v2/src/lib/components/data-table/` |
| Витрина | `projects/ui-kit-v2/.storybook/`                    |

## Что считается сделанным

- Разделитель шапки берёт цвет из `--rt-list-table-head-divider-color`.
- Под набором это `--mat-sys-outline`, и под тёмной темой тоже.
- Без Material на странице кадры не расходятся с прежними.
- Кадры тем таблицы и списка просмотрены глазами.

## Этапы

### 1. Имя разделителя

- **Steps:**
    1. Завести имя разделителя в источнике и в наборе
    2. Перевести разделитель шапки на это имя
- **Readiness sign:** `check:tokens-build` и `check:preset-complete` зелёные.
- **Verified by:** `pnpm run check:tokens-build`, `pnpm run check:preset-complete`

### 2. Кадры и PR

- **Steps:**
    1. Прогнать кадры второго кита и просмотреть разошедшиеся
    2. Открыть PR поверх RT-2358
- **Readiness sign:** ворота отправки пропускают ветку.
- **Verified by:** `git push` без отказа
