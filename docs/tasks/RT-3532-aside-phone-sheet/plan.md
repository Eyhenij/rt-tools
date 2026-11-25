# Plan

**Task:** RT-3532 · **Branch:** RT-3532-aside-phone-sheet
**Draft:** `docs/specs/ui-kit-v2/proposed/aside-phone-sheet/`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** на телефоне `rt-aside` выезжает сбоку во всю ширину окна, со стрелкой «назад» и кнопками в
  подвале; остальные панели кита открываются снизу шторкой, и асайд рядом с ними чужой.
- **This task reaches:** до 480 точек любой асайд кита и приложения открывается снизу шторкой во
  всю высоту: ручка, «×» слева, заголовок по центру, главная кнопка справа; свайп вниз закрывает,
  при несохранённом сначала вопрос внизу экрана.
- **Sign:** истории асайда-шторки в витрине на ширине 375 — асайд сервиса, панель записи, фильтры,
  подробности, настройки таблицы и списка, вопрос; макет и витрина одобрены владельцем.
- **Milestone G of the epic:** все правки эпика влиты в главную ветку и готовы к выпуску кита.
- **Metric:** нет: асайд на телефоне не следует правилам шторок кита.

## Task footprint

| What  | Where                                        |
| ----- | -------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/aside/`                |
| Specs | `docs/specs/ui-kit-v2/sheet-header-cards/`   |
| Specs | `docs/specs/ui-kit-v2/toolbar-filters/`      |
| Specs | `docs/specs/ui-kit-v2/aside-options/`        |
| Specs | `docs/specs/ui-kit-v2/workspace-breakpoint/` |
| Specs | `docs/specs/ui-kit-v2/popover-sheet/`        |
| Laws  | `docs/constitution/mockups.md`               |
| Rules | `.claude/skills/kit-approval/`               |
| Code  | `projects/ui-kit-v2/`                        |

## What counts as done

- До 480 точек асайд, открытый сервисом, и пять мест кита — панель записи, фильтры панели
  инструментов, подробности рабочего места, настройки таблицы и списка — открываются шторкой во
  всю высоту; от 481 точки асайд прежний.
- Сценарии SC-UKV-1802…1862 закрыты тестами; непокрытый назван в прогрессе с причиной.
- Прежние обещания SC-UKV-1043, 1244, 1251…1253 и 1320 переписаны на ширину от 481 точки.
- Макет и витрина одобрены владельцем, совпадение чисел записано.
- PR в ветку эпика открыт, проверки перед отправкой зелёные.

## Stages

### 1. Макет

- **Steps:**
    1. Нарисовать кадры асайда-шторки во всех местах кита и вопроса, показать владельцу сужения вопроса, получить одобрение макета
       Check: `grep -c '^- \*\*Макет:\*\*' docs/tasks/RT-3532-aside-phone-sheet/approvals.md` → >= 1
- **Readiness sign:** владелец одобрил кадры асайда-шторки.
- **Verified by:** `grep -c '^- \*\*Макет:\*\*' docs/tasks/RT-3532-aside-phone-sheet/approvals.md` — 1 и больше.

### 2. Асайд-шторка в коде

- **Steps:**
    1. Открывать асайд шторкой до 480 точек в сервисе и пяти местах кита
       Check: `sh -c 'pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2 "--testPathPatterns=aside|bottom-sheet|toolbar|workspace|container|table|data-list" >/dev/null 2>&1 && grep -rhoE "SC-UKV-18(0[2-9]|10|34|46|5[3-8])" projects/ui-kit-v2/src --include="*.spec.ts" | sort -u | wc -l | tr -d " "'` → >= 17
    2. Дать асайду-шторке шапку и подвал шторки
       Check: `sh -c 'pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2 "--testPathPatterns=aside|bottom-sheet|toolbar|workspace|container|table|data-list" >/dev/null 2>&1 && grep -rhoE "SC-UKV-18(1[1-3]|3[5-9]|47|6[12])" projects/ui-kit-v2/src --include="*.spec.ts" | sort -u | wc -l | tr -d " "'` → >= 11
    3. Закрывать асайд-шторку свайпом, «×» и полосой, с вопросом внизу
       Check: `sh -c 'pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2 "--testPathPatterns=aside|bottom-sheet|toolbar|workspace|container|table|data-list" >/dev/null 2>&1 && grep -rhoE "SC-UKV-18(1[4-9]|2[0-5]|4[0-5]|4[89]|5[0-2]|60)" projects/ui-kit-v2/src --include="*.spec.ts" | sort -u | wc -l | tr -d " "'` → >= 24
    4. Вести Escape, фокус и шторку из шторки по правилам шторок
       Check: `sh -c 'pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2 "--testPathPatterns=aside|bottom-sheet|toolbar|workspace|container|table|data-list" >/dev/null 2>&1 && grep -rhoE "SC-UKV-18(2[6-9]|3[0-3]|59)" projects/ui-kit-v2/src --include="*.spec.ts" | sort -u | wc -l | tr -d " "'` → >= 9
    5. Переписать прежние обещания асайда на ширину от 481 точки
       Check: `sh -c 'for f in workspace/rt-workspace-breakpoint.spec.ts aside/rt-aside-buttons.styles.spec.ts aside/unsaved-dialog/rt-aside-unsaved-dialog.component.spec.ts; do grep -q 481 projects/ui-kit-v2/src/lib/components/$f || exit 1; done; echo ok'` → `ok`
    6. Проверить вживую асайд приложения на ширине 375
       Check: `grep -c 'Асайд приложения на 375' docs/tasks/RT-3532-aside-phone-sheet/progress.md` → >= 1
- **Readiness sign:** тесты асайда, шторки, панели инструментов, рабочего места и рамки зелёные,
  61 сценарий из 61 назван в тестах.
- **Verified by:** `sh -c 'pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2 "--testPathPatterns=aside|bottom-sheet|toolbar|workspace|container|table|data-list" >/dev/null 2>&1 && grep -rhoE "SC-UKV-18(0[2-9]|[1-5][0-9]|6[0-2])" projects/ui-kit-v2/src --include="*.spec.ts" | sort -u | wc -l | tr -d " "'` — 61.

### 3. Витрина

- **Steps:**
    1. Завести истории асайда-шторки на ширине 375 и 600
       Check: `test -f projects/ui-kit-v2/src/lib/components/aside/stories/aside-sheet.stories.ts` → exit 0
    2. Снять эталоны историй асайда-шторки
       Check: `sh -c 'ls projects/ui-kit-v2/.storybook/__snapshots__ | grep organisms-aside-asidesheet | grep -vcE -- "--w[0-9]+\.png$"'` → >= 8
    3. Сверить витрину с макетом по числам
       Check: `grep -c '^- \*\*Совпадение:\*\*' docs/tasks/RT-3532-aside-phone-sheet/approvals.md` → >= 1
    4. Показать витрину владельцу и получить одобрение
       Check: `grep -c '^- \*\*Витрина:\*\*' docs/tasks/RT-3532-aside-phone-sheet/approvals.md` → >= 1
- **Readiness sign:** витрина одобрена владельцем.
- **Verified by:** `grep -c '^- \*\*Витрина:\*\*' docs/tasks/RT-3532-aside-phone-sheet/approvals.md` — 1 и больше.

### 4. Тексты

- **Steps:**
    1. Влить договорённость в спеки кита
       Check: `sh -c 'grep -rl SC-UKV-1862 docs/specs/ui-kit-v2 --include=scenarios.md | grep -vc proposed'` → >= 1
    2. Записать шторку до 480 точек в мобильный вид спеки асайда
       Check: `sh -c 'grep -A2 "### Mobile layout" docs/specs/ui-kit-v2/aside/spec.md | grep -c 480'` → >= 1
    3. Переписать описание асайда под шторку на телефоне
       Check: `grep -c 480 projects/ui-kit-v2/src/lib/components/aside/CONTEXT.md` → >= 1
- **Readiness sign:** договорённость влита, спека и описание асайда говорят о шторке.
- **Verified by:** `sh -c 'grep -rl SC-UKV-1862 docs/specs/ui-kit-v2 --include=scenarios.md | grep -vc proposed'` — 1 и больше.

## What this work does not do

- Карточки таблицы по конфигу — RT-3605.
- Фильтры панели инструментов в режиме `filtersPanel="app"` и кнопка «Назад» у асайда, открытого
  сервисом, — по договорённости вне задачи.
- `rt-confirm`, `rt-tooltip`, `rt-dialog`, `rt-drawer` шторкой не становятся.
