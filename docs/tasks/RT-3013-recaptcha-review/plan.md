# Plan

**Task:** RT-3013 · **Branch:** RT-3013-recaptcha-review
**Spec:** `docs/specs/auth/theme/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                                                    |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/auth/theme/` — `spec.md`, `scenarios.md`, `implementation.md`                                                                                                |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`                                                                                        |
| Rules | `.claude/skills/angular-patterns/`, `.claude/skills/typescript-conventions/`, `.claude/skills/styling-bem/`, `.claude/skills/testing/`                                   |
| Code  | `projects/auth-keycloak-theme/` — `src/login/kc-recaptcha.ts`, `src/login/pages/register/`, `src/login/shell/rt-kc-root.component.ts`, `src/styles.scss`, `package.json` |
| Past  | `docs/archive/RT-3003-register-recaptcha.md` — числа тестов и сценариев                                                                                                  |

## What counts as done

- Флажок рисуется по условию стандартной страницы keycloakify:
  `recaptchaRequired && (recaptchaVisible || recaptchaAction === undefined)`.
- Без ключа reCAPTCHA страница не ждёт скрипт Google. Ожидание снимается при уходе со страницы и
  при ошибке загрузки скрипта.
- Отмеченный флажок не перерисовывается при смене темы.
- В параметрах `render` нет `action`.
- Спека называет невидимую проверку и вариант enterprise неподдержанными.
- Схема флажка — enum. Место и уменьшение заданы элементом `captcha-slot` и своими свойствами
  размера.
- Сценарии SC-AUTH-92…95 покрыты тестами, тесты темы зелёные.
- В браузере на сборке темы флажок рисуется, место держится, отметка переживает смену темы.
- Версия темы 0.2.1, запись архива RT-3003 поправлена.

## Stages

### 1. Ожидание и отрисовка флажка

- **Steps:**
    1. `kc-recaptcha.ts`: enum схемы, без `action`, `getResponse` в API, ожидание возвращает отмену и слушает `error`
    2. Компонент регистрации: стандартное условие показа, ожидание только с ключом и с отменой на уходе, перерисовка только без ответа
    3. Шаблон и стили: элемент `captcha-slot`, свои свойства размера
    4. Корневой компонент: поле документа названо документом
    5. Тесты SC-AUTH-88…95 и уборка `grecaptcha` в `afterEach`
- **Readiness sign:** все тесты темы проходят, новые сценарии в них есть.
- **Verified by:** `pnpm exec nx test @rt-tools/auth-keycloak-theme` — `Tests:` без `failed`.

### 2. Спека, версия и архив

- **Steps:**
    1. Правила и сценарии SC-AUTH-92…95 в `docs/specs/auth/theme/`, привязки в `implementation.md`
    2. Версия темы 0.2.1
    3. Поправка записи архива RT-3003
- **Readiness sign:** проверка спек не называет расхождений по `auth/theme`.
- **Verified by:** `npm run check:specs` — нет строк с `SC-AUTH-9`.

### 3. Проверка в браузере

- **Steps:**
    1. Сборка темы и страница регистрации с подставным контекстом: место, отрисовка, смена темы после отметки
- **Readiness sign:** блок 78 пикселей до и после скрипта, после отметки и смены темы флажок тот же.
- **Verified by:** `pnpm exec nx run @rt-tools/auth-keycloak-theme:build-app` — сборка без ошибок; замер — числами в прогрессе.

## What this work does not do

- Невидимую reCAPTCHA и вариант enterprise не поддерживает — только называет в спеке.
- Не сводит два способа узнать скрипт на странице: они отвечают на разные вопросы (решение в разборе).
