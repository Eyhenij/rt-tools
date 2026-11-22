# План

**Task:** RT-3508 · **Branch:** RT-3476-angular-doctor
**Behaviour:** unchanged — слово владельца 22.11.2026 «Задача на слияние (Recommended)»: главная
вливается в ветку эпика, а шторка меню из главной переводится на шаблон пунктов, который эпик уже
ввёл в RT-3479; поведение кита остаётся тем, что записано в спеках обеих задач.

После написания этот файл не правится. Пересмотр этапа идёт в `progress.md` решением по ходу.

## Точки

- **A:** ветка эпика отстаёт от главной на 114 коммитов; главная несёт нижнюю шторку меню, чей
  шаблон панели держит `<ng-content />` в `<ng-template>`, а спеки и история шторки пишут пункты
  без `rtMenuContent`. Следующую задачу эпика взять нельзя.
- **Эта задача доводит до:** ветка эпика несёт главную и RT-3479; меню и у кнопки, и в шторке рисует
  пункты из шаблона `rtMenuContent`; Angular Doctor равен порогу эпика.
- **Признак:** `pnpm run check:ngdoctor` — «equal to the threshold»; набор перед отправкой зелёный.
- **Веха G эпика:** ни одной находки, кроме одной `security-bypass` превью cms.
- **Metric:** нет: слияние главной в ветку эпика.

## След задачи

| Что   | Где                                                                                           |
| ----- | --------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/template-slots/`, `docs/specs/ui-kit-v2/popover-sheet/`                 |
| Laws  | `docs/constitution/delivery.md`, `docs/constitution/frontend-application.md`                  |
| Rules | `.claude/skills/git-workflow/`, `.claude/skills/component-structure/`                         |
| Code  | `projects/ui-kit-v2/src/lib/components/menu/`                                                 |
| Kit   | `rt-menu.component.ts`, `rt-menu.component.html` — без смены вида, слово «Без вида» владельца |

Слияние собирается от вершины ветки эпика на сервере: главная вливается в неё, и проверка
одобрений кита относит правки главной к главной, а правки RT-3479 — к его записи в архиве.

## Что считается сделанным

- Ветка эпика несёт вершины главной и ветки эпика на сервере.
- Пункты меню и в панели у кнопки, и в шторке приходят шаблоном `rtMenuContent`; ни одного
  `<ng-content>` в шаблоне или под условием.
- Пункт с окном подтверждения ведёт себя в шторке так же, как у кнопки: «Подтвердить» даёт выбор
  пункта один раз и закрывает шторку, «Отмена» выбора не даёт; пока окно открыто, панель у кнопки
  не появляется (сценарий SC-UKV-1747).
- Angular Doctor равен порогу, а порог не держит ни одной находки трёх правил, которые закрыл
  RT-3479; проверка спек зелёная; тесты меню, его шторки, поля, шапки, вкладок и полосы действий
  зелёные.
- Шторка меню выглядит как в макете «Телефон · Menu»
  (https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8293-2474): кадры её историй
  совпадают с эталонами главной, снятыми с витрины, которую владелец одобрил в RT-3399, и сами
  эталоны в этой задаче не переснимаются.

## Этапы

### 1. Слияние

- **Steps:**
    1. Ветка эпика несёт главную и слитый RT-3479
       Check: `sh -c 'git merge-base --is-ancestor origin/main HEAD && git merge-base --is-ancestor origin/RT-3476-angular-doctor HEAD && echo carried'` → `carried`
    2. Шторка меню и её примеры берут пункты шаблоном rtMenuContent, и в шаблоне меню нет ни одного ng-content
       Check: `sh -c 'a=$(grep -L rtMenuContent projects/ui-kit-v2/src/lib/components/menu/rt-menu-sheet.spec.ts projects/ui-kit-v2/src/lib/components/menu/rt-menu-sheet-focus.spec.ts projects/ui-kit-v2/src/lib/components/menu/stories/component/test-menu-sheet.component.html projects/ui-kit-v2/src/lib/components/menu/stories/component/test-menu-sheet.component.ts | wc -l); b=$(grep -c "<ng-content" projects/ui-kit-v2/src/lib/components/menu/rt-menu.component.html); echo $((a + b))'` → = 0
    3. Пункт с окном подтверждения в шторке: «Подтвердить» даёт выбор один раз и закрывает шторку, «Отмена» выбора не даёт, панели у кнопки нет, пока окно открыто
       Check: `sh -c 'grep -c "SC-UKV-1747" projects/ui-kit-v2/src/lib/components/menu/rt-menu-sheet.spec.ts docs/specs/ui-kit-v2/popover-sheet/scenarios.md | grep -c ":0$"'` → = 0
    4. Тесты меню, его шторки, поля, шапки, вкладок и полосы действий зелёные
       Check: `sh -c 'pnpm exec nx test @rt-tools/ui-kit-v2 --skip-nx-cache --testPathPatterns="(menu|field|page-bar|page-header|tabs|action-bar)" --output-style=static >/dev/null 2>&1; echo $?'` → = 0
    5. Angular Doctor равен порогу эпика, порог не держит находок правил RT-3479, проверка спек зелёная
       Check: `sh -c 'pnpm run -s check:ngdoctor >/dev/null 2>&1 && node -e "const t=require(\"./tools/ngdoctor-threshold.json\").rules;process.exit([\"angular-doctor/ng-content-in-control-flow\",\"angular-doctor/effect-writes-state\",\"angular-doctor/prefer-control-flow\"].some(r=>t[r])?1:0)" && node tools/check-specs.mjs >/dev/null 2>&1; echo $?'` → = 0
    6. Шторка меню выглядит и ведёт себя как в макете «Телефон · Menu» и одобренной витрине RT-3399: кадры витрины, шторок меню в их числе, совпадают с эталонами главной, и эталоны не переснимались
       Check: `sh -c 'git diff --quiet origin/main HEAD -- projects/ui-kit-v2/.storybook/__snapshots__ && node tools/visual-gate.mjs ui-kit-v2 >/dev/null 2>&1; echo $?'` → = 0
- **Readiness sign:** ветка эпика несёт главную, меню рисует пункты шаблоном и в шторке; вид и
  поведение шторки — как в макете
  https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8293-2474 и витрине RT-3399.
- **Verified by:** `pnpm run check:ngdoctor` — «equal to the threshold»; сверка витрины кита —
  кадры `molecules-navigation-menusheet--sheet`, `--sheet-off`, шторок меню шапки, вкладок и
  кнопки быстрых действий совпали с эталонами главной; живая проверка шторки в витрине на ширине
  375×812 — пункты, заголовок, подложка, клавиши и пункт с подтверждением, числа в прогрессе.

## Что эта работа не делает

- Находки Angular Doctor, которые главная принесла сверх порога в других правилах, — задачи эпика
  RT-3480…3490 по их правилам; здесь только то, без чего порог не держится.
