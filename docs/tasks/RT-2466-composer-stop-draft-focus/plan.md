# Plan

**Task:** RT-2466 · **Branch:** RT-2466-composer-stop-draft-focus
**Spec:** `docs/specs/ui-kit-v2/message-composer/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                       |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/message-composer/`, `docs/specs/ui-kit-v2/scenarios.md`                                                               |
| Laws  | `docs/constitution/frontend-application.md`, `verifiability.md`                                                                             |
| Rules | `.claude/skills/ui-component-tests/`, `.claude/skills/rt-tools-storybook/`                                                                  |
| Code  | `projects/ui-kit-v2/src/rich-editor/lib/components/message-composer/`, `projects/ui-kit-v2/src/lib/i18n/`, `projects/ui-kit-v2/.storybook/` |

## What counts as done

- При `stoppable` + `sending` вместо стрелки стоит активная кнопка «Стоп», клик эмитит `stopped`, поле
  принимает ввод, `Enter` не отправляет и не стирает текст.
- `text` двусторонний: задан снаружи — стоит в поле; набран — уходит наружу; после отправки пуст.
- `focus()` ставит фокус в поле.
- Сценарии `SC-UKV-491`…`SC-UKV-493` покрыты спеком компонента; кадры витрины обновлены.

## Stages

### 1. Спека

- **Steps:**
    1. Правила и состояние «ответ идёт» в `spec.md`
    2. Сценарии `SC-UKV-491`…`SC-UKV-493` и строка индекса
    3. Строки `implementation.md`
- **Readiness sign:** у каждого нового правила есть сценарий и строка реализации.
- **Verified by:** `git grep -c "SC-UKV-49[123]" -- docs/specs/ui-kit-v2` — номера стоят в спеке, сценариях и реализации.

### 2. Компонент

- **Steps:**
    1. Входы `stoppable`, `text`, выход `stopped`, метод `focus()`
    2. Кнопка «Стоп» в шаблоне и подписи `chatStopAria` / `chatStopLabel`
    3. Спек компонента на `SC-UKV-491`…`SC-UKV-493`
- **Readiness sign:** спек зелёный, линт без ошибок.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-message-composer.component.spec.ts` — все тесты прошли.

### 3. Витрина и тексты

- **Steps:**
    1. Новые состояния в matrix-истории композера
    2. Кадры витрины обновлены
    3. `CONTEXT.md` и `Overview.mdx` композера
- **Readiness sign:** кадры новых состояний сняты, проверка снимков зелёная.
- **Verified by:** `pnpm run test:visual:v2` — расхождений нет.

## What this work does not do

- Выпуск версии пакета — отдельный ручной запуск после слияния.
