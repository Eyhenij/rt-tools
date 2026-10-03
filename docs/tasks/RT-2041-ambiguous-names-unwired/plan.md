# Plan

**Task:** RT-2041 · **Branch:** RT-2041-ambiguous-names-unwired
**Spec:** `docs/specs/agent-kit/layout/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                        |
| ----- | -------------------------------------------- |
| Specs | `docs/specs/agent-kit/layout/`               |
| Laws  | `docs/constitution/project-documentation.md` |
| Rules | `.claude/skills/agent-kit-source/`           |
| Code  | `projects/agent-kit/src/lib/`                |

## What counts as done

- `agent-kit sync` и `agent-kit sync --check` отказывают на наборе с двумя ресурсами одного рода
  и одного короткого имени и называют оба.
- Привязка правила в описании layout ведёт в вызывающий код, пометки «Не исполняется» нет.

## Stages

### 1. Отказ и тест

- **Steps:**
    1. Поле ambiguous в плане установки
    2. Отказ в sync и sync --check
    3. Тест на отказ
    4. Привязка и сценарий в описании layout
- **Readiness sign:** тесты пакета зелёные, новый сценарий в них есть.
- **Verified by:** `pnpm exec nx test @rt-tools/agent-kit` — все наборы зелёные.

### 2. Установка файлов из пакета

- **Steps:**
    1. Проверить совпадение дерева с пакетом
    2. Прогнать проверки перед push
- **Readiness sign:** файлы дерева совпадают с пакетом.
- **Verified by:** `pnpm run agent-kit:check` — код выхода 0.

## What this work does not do

- Не трогает `doctor` — по слову владельца.
