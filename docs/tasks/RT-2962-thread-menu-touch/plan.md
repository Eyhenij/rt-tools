# Plan

**Task:** RT-2962 · **Branch:** RT-2962-thread-menu-touch
**Spec:** `docs/specs/ui-kit-v2/ai-chat/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                    |
| ----- | -------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/ai-chat/`                          |
| Rules | `.claude/skills/styling-bem/`, `.claude/skills/testing/` |
| Code  | стили `rt-thread-list`                                   |

## What counts as done

- На сенсорном экране кнопка меню беседы видна без наведения.
- С мышью она появляется по наведению, как раньше.
- Правило, сценарий и привязка записаны в спеке `ai-chat`.

## Stages

### 1. Меню беседы на сенсорном экране

- **Steps:**
    1. Действия строки прячутся только при наведении
    2. Тест стилей на сценарий
    3. Правило, сценарий и привязка в спеке
- **Readiness sign:** тест стилей зелёный, stylelint без замечаний.
- **Verified by:** `pnpm exec nx run-many -t lint test build -p @rt-tools/ui-kit-v2` — exit 0.

## What this work does not do

- Кнопка копирования в строке не меняется.
