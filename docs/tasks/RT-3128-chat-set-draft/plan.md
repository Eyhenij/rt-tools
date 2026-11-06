# Plan

**Task:** RT-3128 · **Branch:** RT-3128-chat-set-draft
**Spec:** `docs/specs/ui-kit-v2/chat-draft/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                          |
| ----- | -------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/chat-draft/`                                                                             |
| Laws  | `docs/constitution/frontend-application.md`                                                                    |
| Rules | `.claude/skills/component-structure/`, `.claude/skills/testing/`                                               |
| Code  | `projects/ui-kit-v2/src/rich-editor/lib/components/`, `projects/ui-kit-v2/src/lib/components/ai-prompt-input/` |

## What counts as done

- `RtChatComponent.setDraft` заменяет текст и ставит курсор в конец во всех трёх полях.
- При закрытом поле метод ничего не делает, выбранные файлы не меняются.
- Есть юнит-тесты и история витрины с кнопкой снаружи.

## Stages

### 1. Метод

- **Steps:**
    1. Написать описание поддомена chat-draft
    2. Добавить setDraft в поля и чат
    3. Написать юнит-тесты
- **Readiness sign:** тесты чата зелёные.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-chat.component.spec.ts` — все тесты прошли.

### 2. Витрина

- **Steps:**
    1. Добавить историю с кнопкой снаружи
    2. Показать владельцу
- **Readiness sign:** владелец сказал «одобряю».
- **Verified by:** `pnpm exec nx build @rt-tools/ui-kit-v2` — сборка прошла, метод есть в публичном типе.

## What this work does not do

- Вид чата не меняется, новых кадров нет.
