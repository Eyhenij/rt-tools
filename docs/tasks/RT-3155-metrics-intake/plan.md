# Plan

**Task:** RT-3155 · **Branch:** RT-3155-metrics-intake
**Draft:** `docs/specs/agent-kit/proposed/metrics/spec.md`
**Behaviour:** changes

## Points

- **A:** наблюдения уходят в приёмник только командой человека. Числа метрик приёмнику негде хранить.
- **This task reaches:** приёмник принимает строку дня с числами метрик от старой и от новой версии пакета, а повторная отправка дня не меняет итог.
- **Sign:** тесты операции и запрос к настоящей базе стенда: две отправки одного дня дают одну запись, старый штамп получает отказ.
- **Milestone G of the epic:** пакет готов улучшаться по числам: эпик влит, приёмник выкачен, пакет выпущен, отчёт собирает данные.

## Task footprint

| What  | Where                                                                                                              |
| ----- | ------------------------------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/agent-kit/proposed/metrics/`, `docs/specs/message-bus/intake/`                                         |
| Laws  | `docs/constitution/verifiability.md`, `docs/constitution/entity-models.md`                                         |
| Rules | `.claude/skills/testing/`, `.claude/skills/git-workflow-migration/`                                                |
| Code  | `projects/agent-kit/src/lib/cargo.ts`, `libs/message-bus-api/observations/`, `libs/message-bus-common/`, `prisma/` |

## What counts as done

- `POST /api/intake/metrics` принимает строку дня по договорённости и замещает запись дерева, копии и дня.
- Строка со старым штампом получает `metrics-stale`, ключ вне списка или дробное значение получает `metrics-field-refused`.
- Закрытый список ключей лежит в пакете, приёмник берёт его оттуда.
- Запись старше года снимается ночным снятием.
- Прежние роды груза принимаются как раньше.

`Postmortem.resource` и `RecordTransition` читает только раздел «Качество», поэтому они уходят в RT-3156.

## Stages

### 1. Закрытый список и разбор строки дня

- **Steps:**
    1. Объявить в пакете список ключей и форму строки дня
    2. Написать разбор строки дня с отказами
- **Readiness sign:** разбор принимает строку со всеми ключами и отказывает на чужом ключе и дробном значении.
- **Verified by:** `pnpm exec nx test message-bus-api-observations-util` — зелёные сценарии SC-AK-1280.

### 2. Таблица и запись

- **Steps:**
    1. Добавить таблицу `MetricsDay` и миграцию
    2. Написать замещение дня со сравнением штампа
    3. Добавить снятие по сроку в год
- **Readiness sign:** цепочка миграций совпадает со схемой, старый штамп не меняет запись.
- **Verified by:** `npm run check:schema` — код 0, и запрос к базе стенда.

### 3. Операция приёма

- **Steps:**
    1. Написать операцию `POST /api/intake/metrics`
    2. Добавить коды отказов и тексты
    3. Обновить спеку приёма и сценарии
- **Readiness sign:** операция отвечает как в договорённости, отказы названы кодами.
- **Verified by:** тесты контроллера и настоящий запрос к стенду.
