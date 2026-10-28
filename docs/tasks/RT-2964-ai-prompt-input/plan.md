# Plan

**Task:** RT-2964 · **Branch:** RT-2964-ai-prompt-input
**Spec:** `docs/specs/ui-kit-v2/ai-chat/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                           |
| ----- | ----------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/ai-chat/`                                                                 |
| Rules | `.claude/skills/component-structure/`, `.claude/skills/styling-bem/`, `.claude/skills/testing/` |
| Code  | `rt-ai-prompt-input`, `rt-usage-ring`, `rt-ai-chat`                                             |

## What counts as done

- Поле ввода по макету с рядом действий и кольцом расхода.
- `rt-ai-chat` использует новое поле.
- Тесты компонентов проверяют входы и события, витрина показывает состояния.

## Stages

### 1. Поле ввода ИИ-чата

- **Steps:**
    1. Кольцо расхода `rt-usage-ring`
    2. Поле ввода `rt-ai-prompt-input`
    3. Поле в `rt-ai-chat`
    4. Тесты, витрина и описания
    5. Правила, сценарии и привязка в спеке
- **Readiness sign:** тесты компонентов зелёные, проверка описаний без расхождений.
- **Verified by:** `pnpm exec nx run-many -t lint test build -p @rt-tools/ui-kit-v2` — exit 0.

## What this work does not do

- Голосового ввода нет.
- Поле переписки с людьми `rt-message-composer` не меняется.
