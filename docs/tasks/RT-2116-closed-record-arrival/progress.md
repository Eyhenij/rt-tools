# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — Слияние договорённости и разбор папки
- **Done:** этапы 1–3: договорённость, правило приезда с тестами, миграция (проба в откатываемой сделке)
- **Next step:** перенести правила и сценарии в спеку intake, разобрать папку
- **Uncommitted:** нет
- **Waiting for the owner:** no
- **PR:** not open yet

## Decisions along the way

## Sessions

### 2026-09-15

- Задача RT-2116, ветка от `origin/main` (5f7918731).
- Этап 1: `docs/specs/message-bus/proposed/closed-record-arrival/` — 2 правила, SC-MB-323 и 324; `check:specs` без расхождений.
- Этап 2: `postmortemArrivalUpdate` берёт лежащую запись с признаком; `storedForArrival` читает признак; тесты 4/2/41 зелёные, сборка приёмника зелёная.
- Этап 3: миграция `20260915120000_closed_record_state_repair`; проба на четырёх строках в откатываемой сделке — p1 fixed, p2 released, чужие не тронуты.
