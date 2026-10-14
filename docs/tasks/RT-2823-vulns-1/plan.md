# Plan

**Task:** RT-2823 · **Branch:** RT-2823-vulns-1
**Behaviour:** unchanged — обновляются только пины транзитивных зависимостей инструментов разработки, поведение приложений и пакетов не меняется

После записи этот файл не правится. Пересмотр этапа идёт в `progress.md` как решение по ходу.

## Task footprint

| What  | Where                                                                          |
| ----- | ------------------------------------------------------------------------------ |
| Rules | `.claude/skills/dependencies/`                                                 |
| Code  | `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `package.json` (если пин нужен и там) |

## What counts as done

- Записей `pnpm audit` по пакетам axios, brace-expansion, compression, fast-uri, handlebars, http-cache-semantics, joi, probe-image-size, shell-quote и undici нет.
- Проверки перед отправкой зелёные.

## Stages

### 1. Поднять пины

- **Steps:**
    1. Снять число записей аудита до правки
    2. Поднять пины в блоке `overrides`
    3. Поставить зависимости и убедиться, что версии разрешились
- **Readiness sign:** в `pnpm-lock.yaml` все десять пакетов стоят на исправленных версиях
- **Verified by:** `pnpm audit --json` — среди найденных нет записей по десяти пакетам задачи

### 2. Проверить дерево

- **Steps:**
    1. Прогнать линтеры, типы, тесты и сборку
    2. Прогнать проверки перед отправкой при отправке ветки
- **Readiness sign:** проверки зелёные
- **Verified by:** `pnpm run check:all` — все цели прошли

## What this work does not do

- `braces` и `sprintf-js`: исправленной версии нет, они остаются в плане эпика как не закрытые.
- `mysql2`, `deepmerge-ts` и `webpack-dev-middleware`: отдельные задачи эпика.
- `quill`: исправления нет.
