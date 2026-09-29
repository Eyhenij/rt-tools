# Plan

**Task:** RT-2402 · **Branch:** RT-2402-checkbox-height-on-check
**Behaviour:** unchanged — владелец: «исправь дефект в rt-worktree-2 и открывай пр»; отметка перестаёт менять высоту флажка, остальное поведение прежнее

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                             |
| ----- | ------------------------------------------------- |
| Specs | нет: у флажка спека нет                           |
| Rules | `.claude/skills/ui-component-tests/`              |
| Code  | `projects/ui-kit-v2/src/lib/components/checkbox/` |

## What counts as done

- Отметка флажка не меняет высоту его хоста.
- Кадры витрины второго кита зелёные.

## Stages

### 1. Флажок стоит по верху строки

- **Steps:**
    1. Кнопке флажка задать `vertical-align: top` с комментарием о причине.
    2. Добавить тест компонента: у кнопки флажка вычисленное `vertical-align` равно `top`.
    3. Переснять кадры флажка и прочитать разницу глазами.
- **Readiness sign:** тесты флажка и кадры второго кита зелёные.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — в выводе нет упавших кадров.

## What this work does not do

- Выпуск версии пакета: отдельный ручной прогон публикации после слияния, по слову владельца.
