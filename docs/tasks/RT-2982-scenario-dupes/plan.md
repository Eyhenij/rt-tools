# Plan

**Task:** RT-2982 · **Branch:** RT-2982-scenario-dupes
**Behaviour:** unchanged — «Сначала починить RT-2982»: меняются только номера сценариев и заголовки тестов

## Task footprint

| What  | Where                             |
| ----- | --------------------------------- |
| Specs | `docs/specs/ui-kit-v2/ai-chat/`   |
| Code  | `projects/ui-kit-v2/src/` (тесты) |

## What counts as done

- Ни один номер сценария второго кита не занят дважды; `check:specs` без расхождений.

## Stages

### 1. Новые номера сценариев ai-chat

- **Steps:**
    1. Сценарии ai-chat SC-UKV-1040…1046 получают номера 1073…1079
    2. Заголовки тестов переписаны теми же номерами
- **Readiness sign:** сверка спеков без расхождений
- **Verified by:** `node tools/check-specs.mjs` — нет строки «divergences»

## What this work does not do

- Сверка спеков в конвейере — остаётся в задаче RT-2982 вопросом к владельцу.
