# Plan

**Task:** RT-2129 · **Branch:** RT-2129-usage-date-browser-lang
**Behaviour:** unchanged — правится настройка сквозного набора и два его эталонных кадра; обещание
раздела «Использование» и разметка экранов остаются как есть, договорённость `docs/specs/message-bus/usage/`
не меняется ни одной строкой

## Task footprint

| What  | Where                                                               |
| ----- | ------------------------------------------------------------------- |
| Specs | `docs/specs/message-bus/usage/` — читается, не правится             |
| Laws  | `docs/constitution/verifiability.md`                                |
| Rules | `.claude/skills/ui-component-tests/`, `.claude/skills/testing-e2e/` |
| Code  | `apps/message-bus-admin-e2e/`                                       |

## What counts as done

- В настройке сквозного набора язык браузера назван так же явно, как язык страницы и пояс.
- Поле периода на кадре показывает дату русским порядком и не зависит от состояния машины.
- Весь сквозной набор админки зелёный.

## Stages

### 1. Язык браузера назван в настройке набора

- **What is done:** к доводам браузера в `apps/message-bus-admin-e2e/playwright.config.ts`
  добавляется `--lang=ru-RU`, рядом — почему одного `locale` не хватает.
- **Readiness sign:** красными остаются те же два кадра раздела «Использование», и расхождение в
  них теперь на русском порядке даты, а не на американском; остальные 97 проверок зелёные.
- **Verified by:** `pnpm exec nx run message-bus-admin-e2e:e2e` — «2 failed», обе строки про
  `usage-section.spec.ts`, «97 passed». До правки этот же вывод давал ту же пару.

### 2. Два эталона пересняты

- **What is done:** `list-usage.png` и `usage-sessions-panel.png` снимаются заново.
- **Readiness sign:** ни одной красной проверки.
- **Verified by:** `pnpm exec nx run message-bus-admin-e2e:e2e` — «99 passed» и ни одного «failed».

## What this work does not do

- Не трогает `rt-date-picker` второго кита и вид поля в приложении: порядок дня и месяца в поле
  даты берётся у языка смотрящего, и это верно.
- Не меняет порог сравнения кадров и не заводит маску на полях периода: и то и другое прячет
  расхождение, а не убирает его причину.
- Не выясняет, откуда у браузера взялся английский британский в день съёмки прежних эталонов.
