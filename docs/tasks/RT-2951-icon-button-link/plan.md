# Plan

**Task:** RT-2951 · **Branch:** RT-2951-icon-button-link
**Spec:** `docs/specs/ui-kit-v2/component-additions/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                     |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/component-additions/`                                                                                               |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`                                                         |
| Rules | `.claude/skills/angular-patterns/`, `.claude/skills/testing/`, `.claude/skills/ui-component-tests/`, `.claude/skills/rt-tools-storybook/` |
| Code  | `projects/ui-kit-v2/src/lib/components/icon-button/`, `projects/ui-kit-v2/src/lib/components/input/`                                      |

## What counts as done

- `rt-icon-button` с входом `link` рисует `<a href>` с тем же блоком, видом, ripple, подсказкой и кольцом фокуса; без входа разметка прежняя.
- У недоступной или загружающейся кнопки-ссылки нет адреса, клик не переходит.
- Вход `ariaHaspopup` пишет `aria-haspopup`; без входа атрибута нет.
- `rt-icon-button.focus()` и `rt-input.focus()` фокусируют внутренний элемент.
- Правила и сценарии записаны в описании `component-additions`, `CONTEXT.md` обоих компонентов обновлены, история ссылки есть в витрине.
- Полный запуск снимков второго кита без обновления эталонов зелёный; ссылка проверена живьём в витрине.

## Stages

### 1. Ссылка, aria-haspopup и фокус у rt-icon-button

- **Steps:**
    1. Вход `link`, ветка `<a>` в шаблоне, стили ссылки
    2. Вход `ariaHaspopup` и метод `focus()`
    3. Тесты компонента
- **Readiness sign:** тесты `rt-icon-button` зелёные.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-icon-button --maxWorkers=2` — exit 0.

### 2. Фокус у rt-input

- **Steps:**
    1. Метод `focus()`, `focusAfterClear()` через него
    2. Тест компонента
- **Readiness sign:** тесты `rt-input` зелёные.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-input.component --maxWorkers=2` — exit 0.

### 3. Тексты, витрина и проверка на регрессии

- **Steps:**
    1. Правила, сценарии и привязки в описании, `CONTEXT.md` обоих компонентов
    2. История ссылки в витрине и живая проверка
    3. Полный запуск снимков второго кита и набор перед push
- **Readiness sign:** снимки без обновления эталонов зелёные, lint, test, build пакета зелёные.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` и `pnpm exec nx run-many -t lint test build -p @rt-tools/ui-kit-v2 --parallel=2 --maxWorkers=2` — exit 0.

## What this work does not do

- Вход `href` для внешних адресов и общий проброс `aria-*` не делаются.
- Выпуск версии кита не входит.
