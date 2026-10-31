# План

**Задача:** RT-3025 · **Ветка:** RT-3025-recaptcha-load-without-grecaptcha
**Spec:** `docs/specs/auth/theme/`
**Behaviour:** changes

После записи файл не правится. Пересмотр этапа идёт в `progress.md` решением по ходу.

## След задачи

| Что   | Где                                                           |
| ----- | ------------------------------------------------------------- |
| Спека | `docs/specs/auth/theme/`                                      |
| Код   | `projects/auth-keycloak-theme/src/login/kc-recaptcha.ts`      |
| Тест  | `projects/auth-keycloak-theme/src/login/kc-recaptcha.spec.ts` |

## Что считается сделанным

- После `load` скрипта без `grecaptcha` ожидание кончается: слушатель на тот же скрипт не
  вешается, обратный вызов не приходит.
- Сценарий SC-AUTH-96 стоит в спеке темы, тест с этим номером зелёный.
- Проверки зелёные, код-ревью в две оси пройдено, находки исправлены.

## Этапы

### 1. Сценарий и тест

- **Шаги:**
    1. Сценарий SC-AUTH-96 в спеке темы
    2. Тест SC-AUTH-96 в kc-recaptcha.spec.ts
- **Признак готовности:** новый тест красный на нынешнем коде
- **Проверяется:** `pnpm exec nx test @rt-tools/auth-keycloak-theme --testFile=kc-recaptcha.spec.ts --skip-nx-cache` — один провал, SC-AUTH-96

### 2. Правка ожидания

- **Шаги:**
    1. Ожидание кончается после load без grecaptcha
    2. Описание функции и привязка в спеке
- **Признак готовности:** все тесты файла зелёные
- **Проверяется:** `pnpm exec nx test @rt-tools/auth-keycloak-theme --testFile=kc-recaptcha.spec.ts --skip-nx-cache` — «6 passed»

### 3. Проверки и ревью

- **Шаги:**
    1. Тесты, линт и сборка темы
    2. Код-ревью в две оси
    3. Исправление находок ревью
- **Признак готовности:** проверки зелёные, находки ревью закрыты или записаны с причиной
- **Проверяется:** `pnpm exec nx run-many -t lint test build -p @rt-tools/auth-keycloak-theme` — все задачи успешны; `npm run -s check:specs` — код 0

## Чего эта работа не делает

- Не трогает отрисовку флажка и смену темы — они в SC-AUTH-90 и SC-AUTH-95.
- Не выкатывает тему: выкатку жмёт владелец.
