# Plan

**Task:** RT-3361 · **Branch:** RT-3361-ai-chat-notice-alert
**Spec:** `docs/specs/ui-kit-v2/ai-chat/spec.md`
**Behaviour:** changes

## Points

- **A:** экранный диктор зачитывает каждую плашку `notice` в ленте ответа как срочную: у `rt-message` стоит `role="alert"`.
- **This task reaches:** в ленте ответа плашка объявляется спокойно, роль `status`. `rt-message` вне чата остаётся срочной.
- **Sign:** спеки `rt-message` и блоков ответа: `role="status"` в ленте, `role="alert"` по умолчанию.
- **Milestone G of the epic:** ответ «обзор месяца» одним массивом `blocks`; задача делает плашки этого ответа пригодными для диктора.
- **Metric:** нет: плашка в ленте объявлялась как тревога.

## Task footprint

| What  | Where |
| ----- | ----- |
| Specs | `docs/specs/ui-kit-v2/ai-chat/` |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/mockups.md` |
| Rules | `.claude/skills/component-structure/`, `.claude/skills/kit-approval/`, `.claude/skills/rt-tools-storybook/` |
| Code  | `projects/ui-kit-v2/src/lib/components/message/`, `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat/blocks/` |

## What counts as done

- У `rt-message` есть вход `live`: `'alert'` по умолчанию, `'status'` по выбору; роль хоста берётся из него.
- Плашка `notice` в ленте ответа стоит с `role="status"`.
- Сценарии SC-UKV-1329 и SC-UKV-1330 закрыты спеками.
- Макет и витрина одобрены владельцем, сверка чисел полная.

## Stages

### 1. Вход live и плашка в ленте

- **Steps:**
    1. Вход `live` у `rt-message` и роль из него в шаблоне
    2. `live="status"` у плашки `notice` в блоках ответа
    3. Спеки SC-UKV-1329 (`rt-message`) и SC-UKV-1330 (плашка в ленте)
- **Readiness sign:** спеки зелёные.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/components/message --output-style=static` — «passed».

### 2. Тексты

- **Steps:**
    1. Правило и сценарии в спеке ai-chat, привязки в `implementation.md`
    2. Вход `live` в Overview и CONTEXT `rt-message`
- **Readiness sign:** проверка спеков молчит.
- **Verified by:** `npm run check:specs` — код выхода 0.

### 3. Одобрения

- **Steps:**
    1. Кадр Figma: вид не меняется, роль подписана; одобрение владельца
    2. Витрина и сверка чисел; одобрение владельца
- **Readiness sign:** запись одобрений с двумя цитатами и полной сверкой.
- **Verified by:** `node tools/check-kit-approval.mjs` — «no visible kit edit without approvals».

### 4. Сдача

- **Steps:**
    1. Папка задачи разобрана в архив, набор, PR в ветку эпика
- **Readiness sign:** PR открыт.
- **Verified by:** `bash .claude/hooks/git-guard-push-ahead.sh` — «the set is green».

## What this work does not do

- Не меняет вид плашки и её значок.
- Не трогает другие места, где `rt-message` стоит как настоящая тревога.
