# Plan

**Task:** RT-3528 · **Branch:** RT-3528-toolbar-filters-delivery
**Spec:** `docs/specs/ui-kit-v2/toolbar-filters/spec.md`
**Behaviour:** changes

## Points

- **A:** правка кита готова, но коммит `8ceb2b4f4` после слияния главной (тело панели на шаблоне
  `rtAsideContent`, связка `rt-toolbar-filters-hub.ts` с `@Service`, обёртка витрины, сценарии
  SC-UKV-1772…1779) не проверен ни живьём, ни ревью; на npm 0.51.0, PR нет.
- **This task reaches:** потребители кита получают режим `filtersPanel="app"`, часть кита
  `rt-toolbar-filters-route-aside` и порог 1079/1080 в новой minor-версии `@rt-tools/ui-kit-v2`.
- **Sign:** в пакете `@rt-tools/ui-kit-v2@latest` на npm есть `rt-toolbar-filters-route-aside`.
- **Milestone G of the epic:** новая minor-версия кита на npm с режимом `filtersPanel="app"`.
- **Metric:** нет: поставка готовой правки.

## Task footprint

| What  | Where                                              |
| ----- | -------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/toolbar-filters/`            |
| Plans | `docs/plans/toolbar-filters-app-route.md`          |
| Code  | `projects/ui-kit-v2/src/lib/components/toolbar/`   |

## What counts as done

- Правка после слияния главной проверена живьём в витрине на 1079, 1080 и 375 и прошла круг ревью
  тремя ролями; подтверждённые находки исправлены.
- PR задачи в ветку эпика с `Closes #3528` влит по слову владельца.
- PR эпика в `main` влит по слову владельца; тесты кита в его прогоне зелёные.
- `CONTEXT.md` полосы в главной ветке описывает режим `filtersPanel="app"` и порог.
- Выпуск прогоном «Publish @rt-tools/ui-kit-v2 to npm» с веткой `main`, версия `minor`; в
  опубликованном пакете есть `rt-toolbar-filters-route-aside`.

## Stages

### 1. Проверка правки после слияния главной

- **Steps:**
    1. Живая проверка витрины на 1079, 1080 и 375
       Check: `grep -c '^- Живая проверка после слияния главной:' docs/tasks/RT-3528-toolbar-filters-delivery/progress.md` → >= 1
    2. Круг ревью тремя ролями по диффу после слияния
       Check: `grep -c '^- Круг ревью после слияния главной:' docs/tasks/RT-3528-toolbar-filters-delivery/progress.md` → >= 1
- **Readiness sign:** витрина совпадает с одобренной, находки круга исправлены или списаны с
  причиной.
- **Verified by:** `pnpm exec jest -c projects/ui-kit-v2/jest.config.ts projects/ui-kit-v2/src/lib/components/toolbar` — все тесты зелёные.

### 2. Задача в ветке эпика

- **Steps:**
    1. PR задачи в ветку эпика открыт, в теле `Closes #3528`
       Check: `/opt/homebrew/bin/gh pr list --repo Eyhenij/rt-tools --base RT-3566-toolbar-filters-app-route --head RT-3528-toolbar-filters-delivery --state all --json body --jq '[.[] | select(.body | contains("Closes #3528"))] | length'` → `1`
    2. PR задачи влит в ветку эпика
       Check: `/opt/homebrew/bin/gh pr list --repo Eyhenij/rt-tools --base RT-3566-toolbar-filters-app-route --head RT-3528-toolbar-filters-delivery --state merged --json number --jq length` → `1`
- **Readiness sign:** ветка эпика несёт правку задачи.
- **Verified by:** `/opt/homebrew/bin/gh issue view 3528 --repo Eyhenij/rt-tools --json state --jq .state` — `CLOSED`.

### 3. Эпик в главной и выпуск

- **Steps:**
    1. PR эпика в `main` влит
       Check: `/opt/homebrew/bin/gh pr list --repo Eyhenij/rt-tools --base main --head RT-3566-toolbar-filters-app-route --state merged --json number --jq length` → `1`
    2. `CONTEXT.md` полосы в главной описывает режим
       Check: `git show origin/main:projects/ui-kit-v2/src/lib/components/toolbar/CONTEXT.md | grep -c 'filtersPanel="app"'` → >= 1
    3. Выпуск кита minor из главной
       Check: `curl -s "$(npm view @rt-tools/ui-kit-v2@latest dist.tarball)" | tar -xzO | grep -c rt-toolbar-filters-route-aside` → >= 1
- **Readiness sign:** новая minor-версия на npm несёт режим `filtersPanel="app"`.
- **Verified by:** `/opt/homebrew/bin/gh run list --repo Eyhenij/rt-tools --workflow publish-ui-kit-v2.yml --branch main --limit 1 --json conclusion --jq '.[0].conclusion'` — `success`; `npm view @rt-tools/ui-kit-v2 versions --json` — в списке новая версия.

## What this work does not do

- Новых входов, выходов и порога: они сделаны в ветке `RT-3528-toolbar-filters-route`; здесь только
  проверка и исправления правки после слияния главной.
- Маршрут панели в самом приложении-потребителе.
