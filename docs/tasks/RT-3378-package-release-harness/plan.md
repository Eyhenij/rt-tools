# Plan

**Task:** RT-3378 · **Branch:** RT-3378-package-release-harness
**Behaviour:** unchanged — меняются проверки и правила дерева, поведение приложений то же

## Points

- **A:** пакет без Angular можно выпустить, ни разу не загрузив собранное так, как это делает потребитель.
- **This task reaches:** выпуск такого пакета отказывается, пока сборка не загружается в Node, а привязка выпуска неполна.
- **Sign:** `node tools/check-package-release.mjs` печатает «wiring in place» для всех пакетов без Angular; на пакете без цели `verify` печатает ошибку.
- **Milestone G of the epic:** вне эпика, по слову владельца.
- **Metric:** нет: пропущена проверка, которая нужна выпуску.

## Task footprint

| What  | Where                                                                                                    |
| ----- | -------------------------------------------------------------------------------------------------------- |
| Code  | `tools/verify-package.cjs`, `tools/check-package-release.mjs`, `.claude/hooks/package-release-guard.sh`  |
| Rules | `.claude/skills/package-release/`                                                                        |
| Code  | `projects/utils/project.json`, `projects/ai-chat-protocol/project.json`, `package.json`                  |

## What counts as done

- Общая проверка загружает собранные `esm` и `cjs` и проверяет, что относительные импорты `esm` ведут на существующие файлы.
- У каждого пакета без Angular есть цель `verify`, корневая сборка её запускает, процесс публикации собирает через корневую сборку.
- Заголовки коммитов процесса публикации проходят список проверки коммитов.
- Запуск процесса публикации отказан, пока проверка не прошла.

## Stages

### 1. Проверки собранного пакета

- **Steps:**
    1. Общая проверка загрузки собранного пакета
    2. Цель verify у пакета протокола чата
    3. Проверка привязки выпуска пакета
- **Readiness sign:** обе проверки зелёные на двух пакетах без Angular.
- **Verified by:** `node tools/check-package-release.mjs` — «wiring in place»

### 2. Хук и правило

- **Steps:**
    1. Хук запуска публикации
    2. Правило выпуска пакета
- **Readiness sign:** хук отказывает на пакете без привязки.
- **Verified by:** `bash -n .claude/hooks/package-release-guard.sh` — без вывода

## What this work does not do

- Сужение тяжёлых шагов набора перед пушем: отдельная задача, предложение в пакет уже отправлено.
