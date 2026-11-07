# Plan

**Task:** RT-3157 · **Branch:** RT-3157-cycle-rule
**Draft:** `docs/specs/agent-kit/proposed/metrics/spec.md`
**Behaviour:** changes

## Points

- **A:** раздел «Качество» показывает числа, но правка пакета не обязана называть, какое число она двигает.
- **This task reaches:** правило цикла лежит в пакете, а выпуск пакета нельзя запустить без метрики.
- **Sign:** запуск выпуска без метрики отказан, и строка метрики стоит под заголовком версии в журнале.
- **Milestone G of the epic:** пакет готов улучшаться по числам: эпик влит, приёмник выкачен, пакет выпущен, отчёт собирает числа приложений.

## Task footprint

| What  | Where                                                                                                        |
| ----- | ------------------------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/agent-kit/proposed/metrics/`, `docs/specs/agent-kit/checks/`                                     |
| Laws  | `docs/constitution/work-conduct.md`, `docs/constitution/delivery.md`                                         |
| Rules | `projects/agent-kit/assets/rules/task-flow.md`, `.claude/skills/agent-kit-source/`                           |
| Code  | `projects/agent-kit/assets/patterns/`, `tools/release-metric.mjs`, `.github/workflows/publish-agent-kit.yml` |

## What counts as done

- Паттерн цикла лежит в пакете и разложен в дерево: отчёт называет худшую причину, задача называет метрику и направление, следующий отчёт показывает итог, правка без сдвига названа прямо.
- Запуск выпуска пакета требует поле метрики, а пустое или неразобранное значение останавливает выпуск до публикации.
- Строка метрики стоит под заголовком версии в журнале выпуска.
- Договорённость влита в описание пакета, каталога `proposed/metrics` нет.

## Stages

### 1. Правило цикла

- **Steps:**
    1. Написать паттерн цикла в пакете
    2. Назвать паттерн в правиле и разложить пакет
- **Readiness sign:** паттерн разложен, проверки описаний и границы зелёные.
- **Verified by:** `pnpm run agent-kit:check` и `node tools/check-boundary.mjs` — код 0.

### 2. Выпуск требует метрику

- **Steps:**
    1. Написать разбор поля и вставку строки в журнал
    2. Поставить обязательное поле в запуск выпуска
    3. Назвать шаг в правиле правки пакета
- **Readiness sign:** пустое поле отказано, верное стоит под заголовком версии.
- **Verified by:** `bash tools/tests/release-metric.test.sh` — код 0.

### 3. Договорённость

- **Steps:**
    1. Влить договорённость в описание пакета
    2. Поправить адреса и план эпика
- **Readiness sign:** каталога `proposed/metrics` нет, адреса целы.
- **Verified by:** `node tools/check-specs.mjs` и `node tools/check-doc-paths.mjs` — код 0.
