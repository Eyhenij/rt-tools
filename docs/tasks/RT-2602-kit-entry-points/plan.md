# Plan

**Task:** RT-2602 · **Branch:** RT-2602-kit-entry-points
**Behaviour:** unchanged — владелец: «Сначала разбить кит»; набор символов корня тот же, меняется раскладка пакета

## Task footprint

| What  | Where                                      |
| ----- | ------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/`                    |
| Rules | `.claude/skills/reuse-first/`              |
| Code  | `projects/ui-kit-v2/`, `eslint.config.mjs` |

## What counts as done

- Приложение, которое берёт из пакета только кнопку, не получает в бандл ни таблицу CDK, ни формы.
- Компонент из другой точки входа внутри `@defer` уходит в отложенный кусок.

## Stages

### 1. Точки входа

- **Steps:**
    1. Вход ядра и входы каталогов компонентов
    2. Импорты между входами по имени пакета, корень переотдаёт входы
    3. Пути TypeScript, jest и линта
- **Readiness sign:** пакет собирается, тесты зелёные
- **Verified by:** `pnpm run check:all` — выход 0

### 2. Выпуск

- **Steps:**
    1. Замер бандла приложения на собранном пакете
    2. PR, слияние и выпуск версии
- **Readiness sign:** новая версия в реестре
- **Verified by:** `npm view @rt-tools/ui-kit-v2 version` — номер новой версии
