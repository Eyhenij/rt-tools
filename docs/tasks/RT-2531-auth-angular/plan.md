# Plan

**Task:** RT-2531 · **Branch:** RT-2531-auth-angular
**Spec:** `docs/specs/auth/angular/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                            |
| ----- | ------------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/auth/angular/`                                                                       |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`                |
| Rules | `.claude/skills/angular-patterns/`, `.claude/skills/platform-access/`, `.claude/skills/testing/` |
| Code  | `projects/auth-angular/`                                                                         |

## What counts as done

- Пакет `@rt-tools/auth-angular` собирается ng-packagr.
- Вход по OIDC с PKCE через Keycloak, токены только в памяти, выход через Keycloak.
- Сессия после перезагрузки восстанавливается тихой проверкой входа.
- Перехватчики HttpClient и Connect добавляют токен; ответ 401 обновляет токен и повторяет запрос
  один раз.
- Проверки маршрутов по входу и по праву, директива показа по праву.
- Точка подключения «текущая организация» кладёт значение в заголовок запроса.

## Stages

### 1. Описание поддомена клиента

- **Steps:**
    1. Написать `spec.md`, `scenarios.md` и `implementation.md` в `docs/specs/auth/angular/`
    2. Назвать поддомен в описании доменов
- **Readiness sign:** проверка описаний не называет поддомен, кроме сценариев без тестов.
- **Verified by:** `pnpm run check:specs` — строки об `auth/angular` только «no test».

### 2. Пакет

- **Steps:**
    1. Завести проект `projects/auth-angular` со сборкой ng-packagr и Jest
    2. Подключить `keycloak-js` и контракт
- **Readiness sign:** пустой пакет собирается.
- **Verified by:** `pnpm exec nx build @rt-tools/auth-angular` — код выхода 0.

### 3. Сессия

- **Steps:**
    1. Написать подключение `provideRtAuth` и службу сессии с сигналами
    2. Положить в пакет страницу тихой проверки входа
- **Readiness sign:** служба отдаёт вызывающего по токену адаптера.
- **Verified by:** `pnpm exec nx test @rt-tools/auth-angular` — тесты зелёные.

### 4. Запросы

- **Steps:**
    1. Написать перехватчик HttpClient: токен, заголовок организации, один повтор после 401
    2. Написать перехватчик Connect с тем же поведением
- **Readiness sign:** тесты перехватчиков зелёные.
- **Verified by:** `pnpm exec nx test @rt-tools/auth-angular` — тесты зелёные.

### 5. Маршруты и разметка

- **Steps:**
    1. Написать проверки маршрутов по входу и по праву
    2. Написать директиву показа по праву
- **Readiness sign:** у каждого сценария поддомена есть тест.
- **Verified by:** `pnpm run check:specs` — нет строк об `auth/angular`.

### 6. Тексты

- **Steps:**
    1. Написать README пакета
    2. Дописать решения задачи в план эпика
- **Readiness sign:** проверка адресов в документах зелёная.
- **Verified by:** `pnpm run check:docs` — код выхода 0.

## What this work does not do

- Не проверяет живой вход в браузере — RT-2534 с примером админки.
- Не публикует пакет — RT-2534.
- Не переводит вход админки приёмника на модуль.
