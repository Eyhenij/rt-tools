# Plan

**Task:** RT-3385 · **Branch:** RT-3385-push-set-narrow-subjects
**Behaviour:** unchanged — владелец: «Да, делай»; правится только выбор шагов перед пушем, продукт и приложения не меняются.

## Points

- **A:** правка пакета без потребителей или файла процесса CI запускает все шесть тяжёлых шагов.
- **This task reaches:** такая ветка запускает только проверки затронутых проектов.
- **Sign:** сценарии `tools/tests/push-heavy-subjects.test.sh` о новых путях зелёные.
- **Milestone G of the epic:** вне эпика.
- **Metric:** число тяжёлых шагов на ветке из одного пакета протокола чата: было 6, стало 0.

## Task footprint

| What  | Where                                      |
| ----- | ------------------------------------------ |
| Rules | `.claude/rt-kit/project.sh`                |
| Code  | `tools/tests/push-heavy-subjects.test.sh`  |

## What counts as done

- `rt_push_touched` не называет предметов для путей `projects/ai-chat-protocol/`, `projects/cms-*` и `.github/`.
- Корневые настройки по-прежнему дают общий случай.

## Stages

### 1. Выбор предметов

- **Steps:**
    1. Добавить сценарии о новых путях
    2. Добавить пути в выбор предметов
- **Readiness sign:** сценарии зелёные
- **Verified by:** `bash tools/tests/push-heavy-subjects.test.sh` — все сценарии прошли

## What this work does not do

- Строка «не запускалось» для тяжёлых шагов: отдельная задача.
