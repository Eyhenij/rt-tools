# Plan

**Task:** RT-2562 · **Branch:** RT-2562-auth-agent-guide
**Behaviour:** unchanged — владелец просил текст инструкции: «напиши подробные инструкции для других агетов как подключать и использовать пакеты auth»

## Task footprint

| What | Where                      |
| ---- | -------------------------- |
| Docs | `docs/auth-integration.md` |
| Code | `projects/auth-angular/`   |

## What counts as done

- Инструкция проводит агента от пустого приложения до работающего входа и прав.
- README каждого пакета входа ссылается на неё.

## Stages

### 1. Инструкция

- **Steps:**
    1. Написать инструкцию
    2. Сослаться на неё из README пакетов
- **Readiness sign:** проверка адресов в документах зелёная.
- **Verified by:** `npm run check:docs` — нет ошибок.

## What this work does not do

- Публикацию пакетов: её запускает владелец.
