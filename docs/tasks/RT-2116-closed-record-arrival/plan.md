# Plan

**Task:** RT-2116 · **Branch:** RT-2116-closed-record-arrival
**Draft:** `docs/specs/message-bus/proposed/closed-record-arrival/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                           |
| ----- | --------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/message-bus/intake/` (правило приезда), `docs/specs/message-bus/publisher-cargo-close/`             |
| Laws  | `docs/constitution/verifiability.md`, `docs/constitution/project-documentation.md`                              |
| Rules | `.claude/skills/spec-driven/`, `.claude/skills/cargo-triage/`                                                   |
| Code  | `libs/message-bus-api/postmortems/util/`, `libs/message-bus-api/postmortems/data-access/`, `prisma/migrations/` |

## What counts as done

- Приезд разбора с другим текстом не возвращает в «новое» запись с флагом «закрыто издателем»;
  текст при этом обновляется.
- Записи, у которых флаг стоит, а состояние «новое», восстановлены миграцией: с версией выпуска —
  «выпущено», без неё — «починено».
- Правила и сценарии стоят в спеке приёмника с привязками; `check:specs` без расхождений.

## Stages

### 1. Договорённость

- **What is done:** спека `proposed/closed-record-arrival` — правило приезда закрытой записи,
  правило восстановления, два сценария SC-MB-323 и SC-MB-324.
- **Readiness sign:** проверка спек видит новую договорённость и не падает.
- **Verified by:** `npm run check:specs` — итоговая строка начинается с `check-specs: domains 6`,
  строк `divergen` нет.

### 2. Правило приезда

- **What is done:** `postmortemArrivalUpdate` получает флаг лежащей записи и при поднятом флаге
  не называет состояние; `storedTexts` читает флаг вместе с текстом; тесты SC-MB-323.
- **Readiness sign:** тесты обеих либ зелёные.
- **Verified by:** `pnpm exec nx test message-bus-api-postmortems-util` — `Tests  4 passed (4)`;
  `pnpm exec nx test message-bus-api-postmortems-data-access` — `Tests  2 passed (2)`.

### 3. Миграция

- **What is done:** `prisma/migrations/20260915120000_closed_record_state_repair/migration.sql`
  восстанавливает состояние записям с флагом и состоянием «новое» в обеих таблицах.
- **Readiness sign:** миграция стоит в списке и привязана к правилу спеки.
- **Verified by:** `ls prisma/migrations | tail -2` — первой строкой
  `20260915120000_closed_record_state_repair`, второй `migration_lock.toml`.

### 4. Слияние договорённости и разбор папки

- **What is done:** правила и сценарии переезжают в `docs/specs/message-bus/intake/`, папка
  задачи разбирается в архив.
- **Readiness sign:** `proposed/closed-record-arrival` нет; проверка спек и документов зелёные.
- **Verified by:** `npm run check:specs` — итоговая строка `check-specs: domains 6`; `npm run
check:docs` — `no divergences`.

## What this work does not do

- Не меняет правило для записей, закрытых своим деревом: спека говорит «разбирается заново», и
  владелец об этом не спрашивал.
- Не снимает флаг «закрыто издателем»: он остаётся односторонним.
