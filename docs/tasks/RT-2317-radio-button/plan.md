# Plan

**Task:** RT-2317 · **Branch:** RT-2317-radio-button
**Draft:** `docs/specs/ui-kit-v2/proposed/radio-button/`
**Behaviour:** changes

После записи этот файл не правится. Пересмотр этапа идёт в `progress.md` решением по ходу.

## Task footprint

| What  | Where                                                                                                                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/proposed/radio-button/` — сливается в спеку домена                                                                         |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`                                                                |
| Rules | `.claude/skills/component-structure/`, `.claude/skills/styling-bem/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/` |
| Code  | `projects/ui-kit-v2/src/lib/components/` — новый каталог семейства, `index.ts`                                                                   |

## What counts as done

- Во втором ките есть `rt-radio-button`, и каждый сценарий SC-UKV-276…299 назван в спеке
  компонента.
- У семейства истории по договору покрытия: `Overview`, `Playground`, `Value`, `Label`, `Card`,
  `States`, `Themes`, `Presets` — и кадры их в образе.
- Договорённость слита в спеку домена, каталога `proposed/radio-button/` в ветке нет.
- Импорта `@angular/material` в семействе нет.

## Stages

### 1. Компонент и его спека

- **Steps:**
    1. Компонент, шаблон и стили семейства по образцу владельца на назначениях кита
    2. Спека компонента на сценарии SC-UKV-276…299
    3. Выгрузка семейства из `index.ts` кита
- **Readiness sign:** спека семейства зелёная, линтер кита без находок.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-radio-button.component.spec.ts` —
  в отчёте «Tests:» все прошли, число — не меньше 24.

### 2. Витрина

- **Steps:**
    1. Обёртка и истории по договору покрытия, страница `Overview`
    2. Обход историй и взгляд на кадры глазами
    3. Кадры в образе и второй прогон подряд
- **Readiness sign:** кадры семейства сняты и совпали вторым прогоном.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — «Snapshots:» все прошли, сирот нет.

### 3. Закрытие

- **Steps:**
    1. Договорённость слита в спеку домена
    2. Ворота перед отправкой и отправка ветки
    3. Истории показаны владельцу
- **Readiness sign:** `check-specs` зелёный без `proposed/radio-button`, ветка на хостинге.
- **Verified by:** `node tools/check-specs.mjs` — выход 0.

## What this work does not do

- Таблицу первого кита — это RT-2316, она берёт радиокнопку после слияния этой задачи.
- Группу радиокнопок и несколько радиокнопок на одном поле реактивной формы — открытый вопрос
  договорённости; таблице он не нужен.
