# Plan

**Task:** RT-2530 · **Branch:** RT-2530-auth-keycloak-theme
**Spec:** `docs/specs/auth/theme/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                              |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/auth/theme/`, `docs/specs/auth/` (стенд: тема области)                                                                                 |
| Laws  | `docs/constitution/reuse-first.md`, `docs/constitution/verifiability.md`                                                                           |
| Rules | `.claude/skills/component-structure/`, `.claude/skills/styling-bem/`, `.claude/skills/ui-component-tests/`, `.claude/skills/browser-verification/` |
| Code  | `projects/auth-keycloak-theme/`, `deploy/auth/`, `tools/auth-stand-check.mjs`                                                                      |

## What counts as done

- Команда сборки темы кладёт JAR темы `rt` в каталог сборки пакета.
- Вход, сброс пароля, смена пароля, подтверждение почты, сообщение, ошибка, выход и истёкшая
  страница собраны из компонентов второго кита.
- Форма каждой из этих страниц уходит в Keycloak обычной отправкой с теми же именами полей, что у
  стандартной темы.
- Кнопки внешних провайдеров рисуются по списку области, у Google и Apple свои значки.
- Светлая и тёмная тема, языки en и ru.
- Стенд поднимается с темой `rt`, и проверка стенда это подтверждает.

## Stages

### 1. Описание поддомена темы

- **Steps:**
    1. Написать `spec.md`, `scenarios.md` и `implementation.md` в `docs/specs/auth/theme/`
    2. Добавить строку поддомена в описание домена `auth`
- **Readiness sign:** проверка описаний молчит о поддомене `auth/theme`.
- **Verified by:** `pnpm run check:specs` — в выводе нет строк с `auth/theme`.

### 2. Пакет и сборка JAR

- **Steps:**
    1. Завести проект `projects/auth-keycloak-theme` с зависимостями Keycloakify
    2. Собрать приложение Angular и JAR одной командой `build:auth-keycloak-theme`
- **Readiness sign:** JAR лежит в `dist_keycloak` пакета.
- **Verified by:** `pnpm run build:auth-keycloak-theme` — код выхода 0 и строка с `.jar` в выводе.

### 3. Страницы из компонентов кита

- **Steps:**
    1. Написать общий каркас страницы: карточка, переключатели темы и языка
    2. Написать страницы входа, сброса и смены пароля, подтверждения почты
    3. Написать страницы сообщения, ошибки, выхода и истёкшей страницы
    4. Подключить переводчик кита на языке области и тёмную тему
- **Readiness sign:** все восемь страниц открываются на макете контекста без ошибок в консоли.
- **Verified by:** `pnpm exec nx test @rt-tools/auth-keycloak-theme` — все тесты зелёные.

### 4. Тесты страниц

- **Steps:**
    1. Тесты отправки форм: имена полей, адрес действия, отказ пустой формы
    2. Тесты провайдеров, сообщений об ошибке и языка
- **Readiness sign:** у каждого сценария поддомена есть тест с его номером в заголовке.
- **Verified by:** `pnpm exec nx test @rt-tools/auth-keycloak-theme` — все тесты зелёные.

### 5. Тема на стенде

- **Steps:**
    1. Смонтировать JAR в Keycloak стенда и назвать тему `rt` в файле области
    2. Добавить сценарий темы в проверку стенда
    3. Снять кадры входа в светлой и тёмной теме и измерить карточку
- **Readiness sign:** проверка стенда печатает `ok` по всем сценариям.
- **Verified by:** `node tools/auth-stand-check.mjs` — нет строк `FAIL`.

### 6. Тексты

- **Steps:**
    1. Написать README пакета
    2. Дописать решения задачи в план эпика
- **Readiness sign:** проверка адресов в документах зелёная.
- **Verified by:** `pnpm run check:docs` — код выхода 0.

## What this work does not do

- Не публикует пакет с JAR — RT-2534.
- Не заводит провайдеры Google и Apple в области стенда — RT-2534.
- Не меняет компоненты второго кита.
