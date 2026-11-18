# Plan

**Task:** RT-3384 · **Branch:** RT-3384-ai-chat-protocol-scenarios
**Behaviour:** unchanged — код пакета не меняется: дописываются сценарии в спеку и правится один номер в заголовке теста.

## Points

- **A:** проверка спеков красная на главной ветке, 17 расхождений.
- **This task reaches:** проверка спеков зелёная, у каждого теста контроллера и реестра есть сценарий.
- **Sign:** `node tools/check-specs.mjs` без расхождений.
- **Milestone G of the epic:** вне эпика.
- **Metric:** нет: исправление промаха.

## Task footprint

| What  | Where                                  |
| ----- | -------------------------------------- |
| Specs | `docs/specs/ai-chat-protocol/`         |
| Code  | `projects/ai-chat-protocol/src/lib/`   |

## What counts as done

- В `scenarios.md` описаны SC-ACP-11…24 и SC-ACP-30…33.
- Тест цикла браузера называет SC-ACP-24.

## Stages

### 1. Сценарии

- **Steps:**
    1. Описать сценарии контроллера и реестра в спеке
    2. Перенести тест цикла браузера на номер 24
- **Readiness sign:** проверка спеков без расхождений
- **Verified by:** `node tools/check-specs.mjs` — расхождений нет

## What this work does not do

- Выпуск версии: код не менялся.
