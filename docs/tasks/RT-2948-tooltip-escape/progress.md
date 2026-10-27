# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 1 of 1 — Escape в директиве
- **Done:** `onKeydown` в директиве, тесты SC-UKV-1032…1034 (29/29 в файле, 3285/3285 в пакете), спек `component-additions`, `CONTEXT.md`
- **Next step:** коммит и PR по слову владельца
- **Uncommitted:** вся работа ветки
- **Waiting for the owner:** разрешение на коммит и push
- **PR:** not open yet

## Steps

- [x] 1.1 Обработчик `keydown` на хосте в `RtTooltipDirective`
- [x] 1.2 Тесты директивы на три сценария
- [x] 1.3 Правило, сценарии и привязка в спеке, `CONTEXT.md`

## Decisions along the way

## Sessions

### 27.10.2026

- Задача RT-2948 создана, ветка от `origin/main` (c811506a7), worktree `../rt-tooltip-escape`.
- Без правки директивы падают SC-UKV-1032 и SC-UKV-1033 (отложенный показ); с правкой 29/29.
- lint, typecheck, build `@rt-tools/ui-kit-v2`: exit 0; `check:specs`, `check:docs`, prettier: зелёные.
