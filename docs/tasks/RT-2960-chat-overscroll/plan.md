# Plan

**Task:** RT-2960 · **Branch:** RT-2960-chat-overscroll
**Spec:** `docs/specs/ui-kit-v2/ai-chat/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                    |
| ----- | -------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/ai-chat/`                          |
| Rules | `.claude/skills/styling-bem/`, `.claude/skills/testing/` |
| Code  | стили `rt-ai-chat` и `rt-thread-list`                    |

## What counts as done

- Свайп с края ленты и списка бесед остаётся в чате.
- Правило, сценарий и привязка записаны в спеке `ai-chat`.

## Stages

### 1. Прокрутка с краёв

- **Steps:**
    1. Остановка прокрутки у ленты и списка бесед
    2. Тест стилей на сценарий
    3. Правило, сценарий и привязка в спеке
- **Readiness sign:** тест стилей зелёный, stylelint без замечаний.
- **Verified by:** `pnpm exec nx run-many -t lint test build -p @rt-tools/ui-kit-v2` — exit 0.

## What this work does not do

- Страницу под чатом кит не блокирует.
