# Plan

**Task:** RT-2535 · **Branch:** RT-2535-auth-user-import
**Spec:** `docs/specs/auth/import/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                              |
| ----- | ---------------------------------------------------------------------------------- |
| Specs | `docs/specs/auth/import/`                                                          |
| Laws  | `docs/constitution/verifiability.md`, `docs/constitution/code-structure.md`        |
| Rules | `.claude/skills/testing/`, `.claude/skills/typescript-conventions/`                |
| Code  | `projects/auth-import/`, `deploy/auth/realm/rt.json`, `tools/auth-stand-check.mjs` |

## What counts as done

- Команда переносит пользователей из файла в Keycloak: хэши argon2 и pbkdf2 — как есть, вход по
  старому паролю работает.
- Пользователь с другим хэшем переносится без пароля, с действием «задать пароль»; по флагу ему
  уходит письмо.
- Повторный запуск пропускает уже перенесённых.
- В README пакета и в описании названо, какие алгоритмы Keycloak принимает без расширений и что
  делать с остальными.

## Stages

### 1. Описание поддомена переноса

- **Steps:**
    1. Написать `spec.md`, `scenarios.md` и `implementation.md` в `docs/specs/auth/import/`
    2. Назвать поддомен в описании доменов
- **Readiness sign:** проверка описаний называет поддомен только привязками и сценариями без
  тестов.
- **Verified by:** `pnpm run check:specs` — строки об `auth/import` только о ненаписанном коде.

### 2. Пакет

- **Steps:**
    1. Завести проект `projects/auth-import`: сборка, Jest, команда
    2. Написать разбор хэша и сборку пользователя Keycloak
    3. Написать клиент Keycloak и перенос пачками
- **Readiness sign:** тесты пакета зелёные, у каждого сценария поддомена есть тест.
- **Verified by:** `pnpm exec nx test @rt-tools/auth-import` — тесты зелёные.

### 3. Стенд

- **Steps:**
    1. Добавить в область клиент переноса с ролью `manage-users`
    2. Добавить в проверку стенда перенос argon2, pbkdf2 и scrypt с входом по паролю
- **Readiness sign:** проверка стенда зелёная.
- **Verified by:** `pnpm run check:auth-stand` — все строки `ok`.

### 4. Тексты

- **Steps:**
    1. Написать README пакета: алгоритмы, формат файла, запуск
    2. Дописать решения задачи в план эпика
- **Readiness sign:** проверка адресов в документах зелёная.
- **Verified by:** `pnpm run check:docs` — код выхода 0.

## What this work does not do

- Не выгружает пользователей из баз приложений: файл готовит приложение в своём репозитории.
- Не публикует пакет — RT-2534.
- Не переносит организации.
