# Plan

**Task:** RT-2961 · **Branch:** RT-2961-markdown-autolink
**Spec:** `docs/specs/ui-kit-v2/ai-chat/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                |
| ----- | ---------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/ai-chat/`                      |
| Rules | `.claude/skills/testing/`                            |
| Code  | `projects/ui-kit-v2/src/lib/util/markdown-inline.ts` |

## What counts as done

- Подчёркивание внутри слова остаётся знаком.
- Голый адрес `http://` и `https://` становится ссылкой.
- Правила, сценарии и привязка записаны в спеке `ai-chat`.

## Stages

### 1. Подчёркивания и адреса в разборщике

- **Steps:**
    1. Разбор подчёркиваний и голых адресов
    2. Тесты разборщика на два сценария
    3. Правила, сценарии и привязка в спеке
- **Readiness sign:** тесты разборщика зелёные, сборка пакета зелёная.
- **Verified by:** `pnpm exec nx run-many -t lint test build -p @rt-tools/ui-kit-v2` — exit 0.

## What this work does not do

- Звёздочка внутри слова работает как раньше.
