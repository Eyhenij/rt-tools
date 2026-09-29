# План

**Задача:** RT-1884 · **Ветка:** RT-1884-kit2-dynamic-selectors
**Draft:** `docs/specs/ui-kit-v2/proposed/dynamic-selectors/spec.md`
**Behaviour:** changes

После записи этот файл не правится. Пересмотр этапа уходит в ход работ решением по пути.

## След задачи

| Что            | Где                                                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Образец        | `projects/ui-kit/src/lib/ui-kit/dynamic-selectors/` — читается, не правится                                                                                                          |
| Части          | `projects/ui-kit-v2/src/lib/components/popover/`, `projects/ui-kit-v2/src/lib/components/checkbox/`, `projects/ui-kit-v2/src/lib/components/tag/`                                    |
| Договорённость | `docs/specs/ui-kit-v2/proposed/dynamic-selectors/`                                                                                                                                   |
| План эпика     | `docs/plans/one-kit-part-2.md`                                                                                                                                                       |
| Правила        | `.claude/skills/component-structure/`, `.claude/skills/ui-component-tests/`, `.claude/skills/styling-bem/`, `.claude/skills/rt-tools-styling/`, `.claude/skills/rt-tools-storybook/` |
| Код            | `projects/ui-kit-v2/src/lib/components/`, `projects/ui-kit-v2/src/lib/i18n/`                                                                                                         |

## Что считается сделанным

- Во втором ките есть селектор со списком выбранных строк и всплывающим выбором и поле списка
  строк: всё, что умеют селекторы первого кита, на частях второго кита.
- `rt-multiselect` не тронут.
- В перенесённом нет `@angular/material`.
- Договорённость покрывает обещания семейства, витрина показывает матрицу состояний в обеих темах
  и обоих наборах, снимки сняты и сличены с кадрами первого кита.

## Этапы

### 1. Сличение и договорённость

- **Steps:**
    1. Сличить селекторы первого кита с готовыми компонентами второго
    2. Записать договорённость и сценарии
- **Readiness sign:** договорённость лежит в `proposed/`, проверка описаний её принимает.
- **Verified by:** `npm run check:specs` — код выхода 0.

### 2. Логика

- **Steps:**
    1. Чистые функции выбора: поиск, закреплённые, «выбрать всё», сброс
    2. Тесты логики
- **Readiness sign:** тесты логики селекторов второго кита зелёные.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=dynamic-select` — «Tests:» без failed.

### 3. Компоненты

- **Steps:**
    1. Селектор, всплывающий выбор, список выбранного и поле списка строк на частях второго кита
    2. Стили в слое каскада и свои свойства блока
    3. Подписи в словаре кита
    4. Тесты компонентов
- **Readiness sign:** сборка пакета второго кита и его тесты зелёные.
- **Verified by:** `pnpm run build:ui-kit-v2` — код выхода 0.

### 4. Описание и витрина

- **Steps:**
    1. `CONTEXT.md` и `Overview.mdx`
    2. Истории `Playground`, `States`, `Themes` и оси селектора
    3. Снимки витрины и сличение с кадрами первого кита
- **Readiness sign:** кадры сняты и просмотрены рядом с кадрами первого кита.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2 --update '<папка историй>'` — «Tests:» без failed.

### 5. Передача

- **Steps:**
    1. Полный набор проверок перед отправкой
    2. Разбор папки задачи и PR в ветку эпика
- **Readiness sign:** PR открыт в ветку эпика, рецензент назначен.
- **Verified by:** `gh pr view <номер> --json baseRefName,reviewRequests`.
