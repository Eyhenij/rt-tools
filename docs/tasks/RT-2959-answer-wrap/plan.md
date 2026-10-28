# Plan

**Task:** RT-2959 · **Branch:** RT-2959-answer-wrap
**Spec:** `docs/specs/ui-kit-v2/ai-chat/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                      |
| ----- | -------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/ai-chat/`                                            |
| Rules | `.claude/skills/styling-bem/`, `.claude/skills/testing/`                   |
| Code  | `projects/ui-kit-v2/src/lib/components/markdown-text/`, ответ `rt-ai-chat` |

## What counts as done

- Длинное слово и адрес в ответе переносятся, лента не шире панели.
- Правило, сценарий и привязка записаны в спеке `ai-chat`.

## Stages

### 1. Перенос в ответе

- **Steps:**
    1. Перенос в тексте разметки и сужение ответа
    2. Тест стилей на сценарий
    3. Правило, сценарий и привязка в спеке
- **Readiness sign:** тест стилей зелёный, stylelint без замечаний.
- **Verified by:** `pnpm exec nx run-many -t lint test build -p @rt-tools/ui-kit-v2` — exit 0.

## What this work does not do

- Блок кода и таблица прокручиваются вбок, как раньше.
