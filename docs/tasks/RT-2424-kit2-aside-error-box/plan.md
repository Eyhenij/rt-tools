# План

**Task:** RT-2424 · **Branch:** RT-2424-kit2-aside-error-box
**Draft:** `docs/specs/ui-kit-v2/proposed/aside-error-box/spec.md`
**Behaviour:** changes

## Task footprint

| What   | Where                                                                                         |
| ------ | --------------------------------------------------------------------------------------------- |
| Specs  | `docs/specs/ui-kit-v2/` — новый поддомен блока ошибки боковой панели                          |
| Laws   | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`             |
| Rules  | `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/`                    |
| Code   | `projects/ui-kit-v2/src/lib/components/aside/`                                                |
| Sample | `projects/ui-kit/src/lib/ui-kit/aside/components/error-notification/` — читается, не правится |

## What counts as done

- У боковой панели второго кита есть блок ошибки запроса: надпись и кнопка, которая копирует
  время и ошибку в буфер обмена и на секунду подтверждает копирование.
- Блок показывается под шапкой панели, когда приложение передало ошибку, и пропадает без неё.
- В блоке нет Material; подписи берутся из словаря кита.
- Блок описан в обзоре панели и показан историей витрины с кадром, сличённым с первым китом.

## Stages

### 1. Сличение и договорённость

- **Steps:**
    1. Сличить блок ошибки первого кита с боковой панелью второго
    2. Записать договорённость и сценарии
- **Readiness sign:** договорённость лежит, её сценарии названы в проверке описаний
- **Verified by:** `npm run check:specs` — код выхода 0

### 2. Логика

- **Steps:**
    1. Чистая функция текста, который уходит в буфер обмена
    2. Тесты логики
- **Readiness sign:** тесты функции зелёные
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-aside-error` — строка `Tests:` без `failed`

### 3. Блок и место в панели

- **Steps:**
    1. Компонент блока ошибки и вход ошибки у шапки панели
    2. Тесты блока и шапки, закрывающие сценарии
- **Readiness sign:** сценарии договорённости закрыты тестами, сборка пакета проходит
- **Verified by:** `pnpm run build:ui-kit-v2` — строка `Successfully ran target build`

### 4. Описание и витрина

- **Steps:**
    1. Обзор и `CONTEXT.md` панели
    2. История блока и её кадр, сличённый с первым китом
- **Readiness sign:** кадр истории снят и совпадает при повторной съёмке
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2 'src/lib/components/aside'` — строка `Snapshots:` без `failed`

### 5. Передача

- **Steps:**
    1. Полный набор проверок перед отправкой
    2. Разбор папки задачи и PR в ветку эпика
- **Readiness sign:** PR открыт в ветку эпика с ревьюером
- **Verified by:** `gh pr view --json baseRefName` — `RT-2353-one-kit-part-2`

## What this work does not do

- Первый кит не правится.
- Разбор ошибки на понятный человеку текст — карточка обещает его, первый кит его не умеет.
