# Plan

**Task:** RT-2534 · **Branch:** RT-2534-auth-example-admin
**Spec:** `docs/specs/auth/proposed/example-admin/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                                |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/auth/proposed/example-admin/`, `docs/specs/auth/`                                                                                        |
| Laws  | `docs/constitution/verifiability.md`, `docs/constitution/frontend-application.md`, `docs/constitution/delivery.md`                                   |
| Rules | `.claude/skills/testing/`, `.claude/skills/angular-patterns/`, `.claude/skills/git-workflow/`                                                        |
| Code  | `apps/auth-example-admin/`, `apps/auth-example-api/`, `apps/auth-example-e2e/`, `deploy/auth/`, `.github/workflows/`, `projects/auth-*/package.json` |

## What counts as done

- Пример админки и пример сервера подключают пакеты модуля.
- Сквозной набор проходит: вход, отказ по паролю, обновление токена, выход, скрытие раздела без
  права, отказ сервера без права.
- Вход через Google заводится на стенде, когда ключи владельца лежат в среде; без ключей стенд
  работает как раньше.
- Проверка стенда и сквозной набор модуля стоят в наборе перед отправкой и в CI.
- Пакеты модуля готовы к публикации 0.1.0: `private` снят, workflow публикации заведены.

## Stages

### 1. Договорённость

- **Steps:**
    1. Написать договорённость `docs/specs/auth/proposed/example-admin/` со сценариями сквозного набора
- **Readiness sign:** проверка описаний называет новые сценарии только как непокрытые.
- **Verified by:** `pnpm run check:specs` — код выхода 0.

### 2. Пример сервера

- **Steps:**
    1. Завести `apps/auth-example-api` на NestJS с `@rt-tools/auth-server`: записи по праву чтения, создание по праву записи
- **Readiness sign:** сервер собирается, его тесты зелёные.
- **Verified by:** `pnpm exec nx run-many -t build,test -p auth-example-api` — код выхода 0.

### 3. Пример админки

- **Steps:**
    1. Завести `apps/auth-example-admin` на Angular с `@rt-tools/auth-angular` и вторым китом: список записей, кнопка создания по праву, выход
- **Readiness sign:** админка собирается production-сборкой.
- **Verified by:** `pnpm exec nx build auth-example-admin` — код выхода 0.

### 4. Сквозной набор

- **Steps:**
    1. Завести `apps/auth-example-e2e`: стенд из Keycloak и production-сборок примера, засев людей с правами
    2. Написать спеки шести сценариев карточки
- **Readiness sign:** набор зелёный, проверка описаний не называет сценарии договорённости.
- **Verified by:** `pnpm exec nx run auth-example-e2e:e2e` — все тесты зелёные.

### 5. Google на стенде

- **Steps:**
    1. Завести провайдера Google в области из переменных среды; без них провайдер выключен
- **Readiness sign:** проверка стенда зелёная без ключей Google.
- **Verified by:** `pnpm run check:auth-stand` — все строки `ok`.

### 6. Набор и CI

- **Steps:**
    1. Поставить проверку стенда и сквозной набор модуля в набор перед отправкой
    2. Добавить их шагом в CI
- **Readiness sign:** проверка набора перед отправкой зелёная.
- **Verified by:** `node tools/check-push-gate.mjs` — код выхода 0.

### 7. Публикация

- **Steps:**
    1. Снять `private` с пакетов модуля и завести workflow публикации каждого
    2. Завести выпуск JAR темы
- **Readiness sign:** проверка lockfile публикации зелёная.
- **Verified by:** `node tools/check-publish-lockfile.mjs` — код выхода 0.

### 8. Тексты

- **Steps:**
    1. Влить договорённость в описание домена
    2. Дописать решения задачи в план эпика и README пакетов
- **Readiness sign:** проверка адресов в документах зелёная.
- **Verified by:** `pnpm run check:docs` — код выхода 0.

## What this work does not do

- Не подключает Apple: отдельная задача после этой, по слову владельца.
- Не запускает публикацию: её запускает владелец.
- Не переводит существующие приложения на модуль.
