# План

**Task:** RT-2427 · **Branch:** RT-2427-kit2-aside-showcase-narrow
**Draft:** none — the edit adds a style property with the former value as its default
**Behaviour:** unchanged — владелец: «Завести задачу» на находку о витрине; в приложении панель на узком экране по-прежнему во всё окно

## Task footprint

| What  | Where                                                                             |
| ----- | --------------------------------------------------------------------------------- |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md` |
| Rules | `.claude/skills/rt-tools-storybook/`, `.claude/skills/rt-tools-styling/`          |
| Code  | `projects/ui-kit-v2/src/lib/components/aside/`                                    |

## What counts as done

- На ширине 768 панель в кадрах витрины стоит в своей половине темы и не режется краем кадра.
- В приложении панель на узком экране по-прежнему занимает всё окно.
- Свойство описано в обзоре и `CONTEXT.md` панели.

## Stages

### 1. Свойство и витрина

- **Steps:**
    1. Свойство `--rt-aside-narrow-width` в правиле узкого экрана и его значение в ящике показа
    2. Кадры панели пересняты и сличены
- **Readiness sign:** кадры панели на 768 показывают панель в своей половине и совпадают при повторной съёмке
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2 'src/lib/components/aside'` — строка `Snapshots:` без `failed`

### 2. Описание и передача

- **Steps:**
    1. Обзор и `CONTEXT.md` панели
    2. Разбор папки задачи и PR в ветку эпика
- **Readiness sign:** PR открыт в ветку эпика с ревьюером
- **Verified by:** `gh pr view --json baseRefName` — `RT-2353-one-kit-part-2`

## What this work does not do

- Кадр `RequestError` живёт в ветке RT-2424: он переснимется там после слияния этой правки.
