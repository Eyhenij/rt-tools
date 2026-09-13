# Plan

**Task:** RT-2079 · **Branch:** RT-2079-deps-in-major
**Behaviour:** unchanged — поднимаются версии инструментов и рамок в пределах мажора; владелец: «обнови npm пакеты»

## Task footprint

| What          | Where                                                  |
| ------------- | ------------------------------------------------------ |
| Объявления    | `package.json` — корневой манифест                     |
| Снимок дерева | `pnpm-lock.yaml`                                       |
| Подмены       | `pnpm-workspace.yaml` — `overrides`                    |
| Rules         | `.claude/skills/dependencies/`, `dependencies-upgrade` |

## What counts as done

- Каждый из 81 пакетов с отставанием в пределах мажора стоит на последней версии своего мажора
  точным числом; `pnpm outdated` показывает только мажоры, `@oxc-project/runtime` и
  `conventional-changelog-cli`.
- `pnpm install --frozen-lockfile` принимает снимок без правки.
- Список подмен пересмотрен: каждая строка либо всё ещё нужна, либо снята.
- `pnpm run check:all` зелёный.

## Stages

### 1. Версии подняты и снимок пересобран

- **What is done:** 81 строка `package.json` переписана на последнюю версию в пределах мажора,
  `pnpm install` пересобрал `pnpm-lock.yaml`.
- **Readiness sign:** `pnpm outdated` перечисляет только мажоры и два исключённых пакета; в
  манифесте ни одного диапазона.
- **Verified by:** `pnpm install --frozen-lockfile && grep -cE '"[\^~]' package.json` — код выхода
  установки 0, счётчик печатает `0` (сейчас `0`).

### 2. Список подмен пересмотрен

- **What is done:** для каждой из 18 строк `overrides` проверено, не поднял ли родитель версию
  сам; ненужные сняты, снимок пересобран.
- **Readiness sign:** число уязвимостей не выше исходного (37: 5 low, 16 moderate, 16 high).
- **Verified by:** `pnpm audit | tail -2` — строка `N vulnerabilities found`, N ≤ 37.

### 3. Сборка, линтеры, тесты

- **What is done:** сборка раньше линтеров; новые находки линтеров разобраны по имени правила.
- **Readiness sign:** весь набор зелёный.
- **Verified by:** `pnpm run check:all` — код выхода 0.

## What this work does not do

- Не поднимает мажоры: eslint 10, typescript 7, vitest 5, NestJS 12, stylelint 17, jsdom 30,
  @types/node 26, commitlint 21, webpack-dev-server 6, eslint-plugin-simple-import-sort 14,
  jsonc-eslint-parser 3 — заводятся отдельной карточкой после этой задачи.
- Не трогает `@oxc-project/runtime` (0.x, никем не используется — кандидат на удаление) и
  `prisma` 8 (предвыпуск).
- Не перезаписывает визуальные снимки: их сверяет конвейер на PR; сдвиг — отдельное решение.
