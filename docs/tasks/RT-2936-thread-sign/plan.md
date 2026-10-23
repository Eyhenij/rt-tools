# Plan

**Task:** RT-2936 · **Branch:** RT-2936-thread-sign
**Draft:** `docs/specs/ui-kit-v2/proposed/channel-sign/`
**Behaviour:** changes

После записи файл не правится. Пересмотр этапа идёт в `progress.md` решением по ходу.

## Task footprint

| What  | Where                                                                                                                                                                                                           |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/service-logo/`, `docs/specs/ui-kit-v2/proposed/channel-sign/`                                                                                                                             |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/reuse-first.md`, `docs/constitution/verifiability.md`                                                                                           |
| Rules | `.claude/skills/component-structure/`, `.claude/skills/styling-bem/`, `.claude/skills/rt-tools-styling/`, `.claude/skills/testing/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/` |
| Code  | `projects/ui-kit-v2/src/lib/components/service-logo/`, `projects/ui-kit-v2/src/lib/components/thread-list/`, `projects/ui-kit-v2/src/rich-editor/lib/components/chat/`, `projects/ui-kit-v2/src/styles/`        |

## What counts as done

- `rt-service-logo` рисует размер `xs`: круг 32, знак 16, шаг 20, тень с размытием 16.
- Строка `rt-thread-list` с полем `sign` рисует знак слева от заголовка и подзаголовка; без поля строка прежняя.
- `rt-chat` со входом `sign` рисует знак слева от заголовка шапки; без входа шапка прежняя.
- Витрина показывает знак в строке и в шапке, снимки витрины обновлены.
- Новая версия `@rt-tools/ui-kit-v2` лежит в реестре.
- В Figma у «Thread Row» и «Chat» есть `Show sign`, у «Service Logo» — размер xs, библиотека опубликована.

## Stages

### 1. Договорённость

- **Steps:**
    1. Записать договорённость о знаке канала в `docs/specs/ui-kit-v2/proposed/channel-sign/`
    2. Записать сценарии договорённости
- **Readiness sign:** в папке договорённости лежат `spec.md` и `scenarios.md`, проверка описаний их принимает.
- **Verified by:** `npm run check:specs` — нет строк об отказе по `channel-sign`.

### 2. Размер xs у знака службы

- **Steps:**
    1. Добавить тень `--rt-shadow-service-logo-xs` в слой токенов
    2. Добавить размер `xs` в модель, шаблон и стили `rt-service-logo`
    3. Покрыть размер `xs` тестом и витриной
- **Readiness sign:** тест `rt-service-logo` зелёный, в нём есть случай размера `xs`.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-service-logo.component.spec.ts` — «Tests: N passed», ни одного failed.

### 3. Знак в строке списка разговоров

- **Steps:**
    1. Добавить поле `sign` в модель строки `rt-thread-list`
    2. Рисовать знак первым ребёнком кнопки строки
    3. Покрыть знак строки тестом, витриной и описанием компонента
- **Readiness sign:** тест `rt-thread-list` зелёный, в нём есть случаи строки со знаком и без.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-thread-list.component.spec.ts` — ни одного failed.

### 4. Знак в шапке чата

- **Steps:**
    1. Добавить вход `sign` у `rt-chat` и знак слева от заголовка
    2. Покрыть знак шапки тестом, витриной и описанием компонента
- **Readiness sign:** тест `rt-chat` зелёный, в нём есть случаи шапки со знаком и без.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-chat.component.spec.ts` — ни одного failed.

### 5. Проверка целиком и снимки

- **Steps:**
    1. Сверить витрину с кадрами Figma измерением
    2. Обновить снимки витрины
    3. Прогнать полный набор проверок
- **Readiness sign:** набор проверок зелёный, снимки витрины совпадают.
- **Verified by:** `pnpm run check:all` — завершается без ошибок.

### 6. Выпуск

- **Steps:**
    1. Влить договорённость в описание пакета и разобрать папку задачи
    2. Открыть PR
    3. Выпустить версию пакета
    4. Опубликовать библиотеку Figma
- **Readiness sign:** `npm view @rt-tools/ui-kit-v2 version` отдаёт новую версию, библиотека Figma опубликована.
- **Verified by:** `npm view @rt-tools/ui-kit-v2 version` — версия выше 0.31.0.

## What this work does not do

- Код приложения посуточной аренды: оно берёт новую версию кита отдельной задачей своего дерева.
- Знак в других местах кита (карточки, списки служб).
