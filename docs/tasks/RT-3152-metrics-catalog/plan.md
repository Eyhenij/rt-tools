# План

**Task:** RT-3152 · **Branch:** RT-3152-metrics-catalog
**Draft:** `docs/specs/agent-kit/proposed/metrics/`
**Behaviour:** changes

## Точки

- **A:** качество пакета правил не измеряется, а метрики не названы.
- **This task reaches:** список метрик записан и одобрен владельцем, `agent-kit metrics` показывает числа по своему дереву.
- **Sign:** числа `agent-kit metrics` совпадают со счётом по файлам наблюдений.
- **Milestone G of the epic:** пакет улучшается по числам, одна правка выбрана по отчёту, и следующий отчёт показывает её итог.

## Task footprint

| What  | Where                                                        |
| ----- | ------------------------------------------------------------ |
| Specs | `docs/specs/agent-kit/proposed/metrics/`                     |
| Laws  | `docs/constitution/observability.md`                         |
| Rules | `.claude/skills/observability/`                              |
| Code  | `projects/agent-kit/src/lib/`, `projects/agent-kit/src/bin/` |

## What counts as done

- Договорённость переписана по разбору роли `spec-critic`, и сценарии записаны.
- Владелец одобрил список метрик.
- `agent-kit metrics` печатает отчёт по наблюдениям дерева и отдаёт его в виде JSON.
- Числа отчёта совпадают со счётом по файлам наблюдений.

## Stages

### 1. Договорённость

- **Steps:**
    1. Переписать договорённость по разбору роли
    2. Записать сценарии и привязку
    3. Закоммитить папку задачи и договорённость
- **Readiness sign:** проверка спек зелёная.
- **Verified by:** `node tools/check-specs.mjs` — код выхода 0.

### 2. Одобрение метрик

- **Steps:**
    1. Показать владельцу список метрик
    2. Записать ответ владельца в разбор
- **Readiness sign:** ответ владельца лежит в `grill.md`.
- **Verified by:** `grep -c 'Список метрик' docs/tasks/RT-3152-metrics-catalog/grill.md` — число больше нуля.

### 3. Отчёт по своему дереву

- **Steps:**
    1. Написать подсчёт отчёта со спекой
    2. Добавить команду `agent-kit metrics`
    3. Сверить числа со счётом по файлам
- **Readiness sign:** спеки зелёные, числа совпали.
- **Verified by:** `pnpm exec nx test @rt-tools/agent-kit` — все спеки зелёные.

## What this work does not do

- Новые события, отправка, приёмник и экран: задачи RT-3153–3156.
- Правило цикла: RT-3157.
- Первая правка по отчёту: RT-3158.
