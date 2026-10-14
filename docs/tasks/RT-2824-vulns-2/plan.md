# Plan

**Task:** RT-2824 · **Branch:** RT-2824-vulns-2
**Behaviour:** unchanged — поведение приёмника не меняется, меняются только версии двух транзитивных зависимостей Prisma

После записи этот файл не правится. Пересмотр этапа идёт в `progress.md` как решение по ходу.

## Task footprint

| What | Where                                   |
| ---- | --------------------------------------- |
| Code | `pnpm-workspace.yaml`, `pnpm-lock.yaml` |

## What counts as done

- Записей `pnpm audit` по `mysql2` и `deepmerge-ts` нет.
- Клиент Prisma генерируется, приёмник собирается, его тесты и проверки перед отправкой зелёные.

## Stages

### 1. Поднять пины

- **Steps:**
    1. Поднять пины mysql2 и deepmerge-ts в блоке `overrides`
    2. Поставить зависимости и сгенерировать клиент Prisma
- **Readiness sign:** `pnpm install` проходит, клиент генерируется, в аудите нет записей по двум пакетам
- **Verified by:** `pnpm audit --json` — среди найденных нет записей по `mysql2` и `deepmerge-ts`

### 2. Проверить приёмник

- **Steps:**
    1. Собрать приёмник и прогнать его тесты
    2. Прогнать проверки перед отправкой при отправке ветки
- **Readiness sign:** сборка, тесты и проверки зелёные
- **Verified by:** `pnpm run check:all` — все цели прошли

## What this work does not do

- Prisma 8: у неё только предвыпуск, эпик её не поднимает.
- `webpack-dev-middleware`: отдельная задача эпика.
