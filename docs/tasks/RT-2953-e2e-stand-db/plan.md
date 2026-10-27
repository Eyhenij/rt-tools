# Plan

**Task:** RT-2953 · **Branch:** RT-2953-e2e-stand-db
**Behaviour:** unchanged — правка стенда сквозного набора, продукт не меняется. Подтверждено владельцем: «чини е2е».

## Task footprint

| What  | Where                                                                             |
| ----- | --------------------------------------------------------------------------------- |
| Specs | нет                                                                               |
| Laws  | `docs/constitution/verifiability.md`                                              |
| Rules | `.claude/skills/testing/`, `.claude/skills/testing-e2e/`                          |
| Code  | `apps/message-bus-admin-e2e/stand/up.mjs`, `apps/message-bus-admin-e2e/README.md` |

## What counts as done

- Скрипт стенда поднимает контейнер базы сам и ждёт его готовности.
- README набора не требует поднимать базу руками.
- Сквозной набор админки проходит при остановленном контейнере базы.

## Stages

### 1. Стенд поднимает базу сам

- **Steps:**
    1. `docker compose up -d --wait db` в `up.mjs` перед подготовкой базы, README
    2. Запуск набора при остановленном контейнере базы
- **Readiness sign:** набор админки зелёный, контейнер базы до запуска остановлен.
- **Verified by:** `docker compose stop db && pnpm exec nx run message-bus-admin-e2e:e2e` — exit 0.

## What this work does not do

- Контейнер базы после запуска набора не гасится: стенд авторизации тоже остаётся поднятым, а база общая с локальной работой.
