# Plan

**Task:** RT-3648 · **Branch:** RT-3648-kit-icon-catalog-split
**Spec:** `docs/specs/ui-kit-v2/icon-material-names/spec.md`
**Behaviour:** changes

## Points

- **A:** кит знает значок под двумя именами: своим и именем Material из таблицы на 62 пары; таблица с объяснениями грузится на старте (часть `icon` 24867 байт, набор 194999). Набор значок выбирает один раз по разметке и на ходу не меняет.
- **This task reaches:** у всех наборов одни имена; набор объявлен данными, его добавляет приложение, а меняет на ходу — у всего приложения или у части страницы вместе с окнами из неё; таблицы пар в ките нет.
- **Sign:** `use()` и `rtIconSet` перерисовывают нарисованные значки и кнопки без перезагрузки, свой набор приложения рисуется, диалог из части получает её набор, а в сборке нет таблицы пар; порог `check:kit-weight` не выше 186000.
- **Milestone G of the epic:** вес кита под контролем: приложение не платит за пояснения и переводы имён.
- **Metric:** нет: ни правило, ни хук, ни проверка не улучшаются

## Decision

| Part | What is chosen |
| --- | --- |
| Modules | `projects/ui-kit-v2/src/lib/components/icon/rt-icon-sets.ts:rtIconBuiltInSets` — наборы `kit` и `material`: имя, адрес, запасной набор, перечень своих имён, есть ли залитые рисунки. `projects/ui-kit-v2/src/lib/components/icon/rt-icon-set.service.ts:RtIconSetService` — выбор приложения сигналом и `use(name)`. `projects/ui-kit-v2/src/lib/components/icon/rt-icon-set.directive.ts:RtIconSetDirective` — набор части страницы, пишет его имя атрибутом на свой узел. Реестр отдаёт сигнал готовности символа и хранит скачанное по адресу |
| Dependencies | набор значка и кнопки: ближайшая директива по инжекторам; затем явный `use()`; затем признак material у предка (читается после первой отрисовки, как сейчас); затем `default` из `provideRtIcons`. Панели меню, popover, нижнего листа и правой панели container получают атрибут набора от директивы хозяина при каждом открытии, без директивы атрибут снимается. Службы диалога и aside берут набор у узла с фокусом в минуту открытия, как уже переносят признак material, и дают его инжектору окна и атрибуту своей панели. Пункт меню отдаёт подтверждению набор из своего инжектора и на фокус не полагается |
| Coupling | `projects/ui-kit-v2/src/lib/components/icon/rt-icon-set.service.ts` outgoing 0 → 1 |
| Patterns | no pattern: описание набора — данные, цепочку запасных обходит реестр |
| Terms | «набор значков» — папка рисунков с именами кита по своему адресу; «запасной набор» — откуда берётся недостающий рисунок. Определяются в описании поведения этой задачей |
| Input | неизвестное имя набора, пустой адрес, имя набора не из `[a-z0-9-]` и круг запасных дают предупреждение и набор `kit`. SC-UKV-1875, `projects/ui-kit-v2/src/lib/components/icon/rt-icon-sets.spec.ts`. Рисунка нет нигде — одно предупреждение с именем значка и набора, остаётся прежний рисунок. SC-UKV-1874, `projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.spec.ts` |
| Bounds | вид по умолчанию и под признаком material без явного выбора не меняется; имена кита и рисунки не переименовываются; `glyph` остаётся: имя кита рисуется рисунком, любое другое — шрифтом Material приложения; `glyphStrategy` остаётся, `map-first` значит «сначала имя кита»; шаблон, объявленный вне части страницы, берёт набор по месту объявления |
| Priority | одни имена и лёгкий старт важнее совместимости: старые имена перестают переводиться сразу, по слову владельца |
| Budget | `projects/ui-kit-v2/src/lib/components/icon/rt-icon-sets.ts` до 200 строк; `projects/ui-kit-v2/src/lib/components/icon/rt-icon-set.service.ts` до 80 строк; `projects/ui-kit-v2/src/lib/components/icon/rt-icon-set.directive.ts` до 60 строк; новых файлов кода: 10; новых зависимостей: 0 |

О весе: без таблицы, но с перечнем набора `material` копия сборки весит 181857. Новый код переключения не измерен; оценка роли 2–3,5 КБ, то есть итог около 184000–185500. Порог 186000 всё равно ниже нынешних 194999; не уложились — число показывается владельцу.

## Task footprint

| What             | Where                                                          |
| ---------------- | -------------------------------------------------------------- |
| Specs (правится) | `docs/specs/ui-kit-v2/`                                        |
| Docs (правится)  | `docs/plans/kit-presets-by-demand.md`                          |
| Code (правится)  | `projects/ui-kit-v2/src/lib/components/`                       |
| Code (правится)  | `projects/ui-kit-v2/src/lib/util/material-preset.ts`           |
| Code (правится)  | `projects/ui-kit-v2/src/assets/icons-material/NOTICE.md`       |
| Code (правится)  | `projects/ui-kit-v2/.storybook/main.ts`                        |
| Code (правится)  | `projects/ui-kit-v2/.storybook/preview.ts`                     |
| Code (правится)  | `apps/message-bus-admin/src/app/app.config.ts`                 |
| Code (правится)  | `apps/chat-talks-page/src/app/talks.config.ts`                 |
| Code (правится)  | `apps/auth-example-admin/src/app/example.config.ts`            |
| Code (правится)  | `projects/auth-keycloak-theme/src/login/kc-app.config.ts`      |
| Code (правится)  | `projects/ui-kit-v2/migrations/`                               |
| Code (правится)  | `projects/ui-kit-v2/ng-package.json`                           |
| Code (правится)  | `projects/ui-kit-v2/README.md`                                 |
| Code (правится)  | `tools/material-icon-sources.json`                             |
| Code (правится)  | `tools/check-icon-map.mjs`                                     |
| Code (правится)  | `tools/fetch-material-icons.mjs`                               |
| Code (правится)  | `tools/tests/rename-icon-names.test.sh`                        |
| Code (правится)  | `tools/tests/check-icon-map.test.sh`                           |
| Code (правится)  | `tools/tests/fetch-material-icons.test.sh`                     |
| Code (правится)  | `tools/kit-weight-threshold.json`                              |
| Code (правится)  | `.claude/rt-kit/push-inputs.json`                              |

## What counts as done

- В сборке кита нет таблицы пар и объяснений; `iconMaterialMap`, `IRtIconMaterialEntry` и `materialPairOf` убраны. Всё, что в ките звало значок старым именем, называет имя кита: операторы фильтра и ячейки таблицы, `speed-menu`, панель списка данных, пункт меню, боковое меню; `glyph` там сначала проверяется как имя кита.
- Переходный скрипт `migrations/rename-icon-names.mjs` едет в пакете и берёт 62 пары из файла данных рядом. Без `--write` он перечисляет места `файл:строка`. С `--write` заменяет только `glyph`, `icon`, `iconEnd`, `invitationGlyph`, `invitationIcon` на тегах `rt-*` и элементах с `rtButton`. Свойства объектов, выражения и `glyph="info"` (имя кита, меняющее вид) он перечисляет для ручной замены. Приложению с `glyphStrategy: 'font'` запускать `--write` не нужно, это сказано в справке скрипта.
- Загрузчик рисунков Material берёт имена из `tools/material-icon-sources.json`, на незнакомый ключ отказывает и ничего не скачивает.
- `check-icon-map` держит полноту до выпуска: у каждого имени списка есть рисунок в `kit` и лишних там нет; перечень `material` равен его папке; цепочка запасных каждого встроенного набора без круга доходит до `kit`; пары переходного файла ведут на имена кита. Набор приложения кит заранее не проверяет — это сказано в описании.
- Приложение объявляет наборы в `provideRtIcons({ sets, default, glyphStrategy })`; свой набор добавляется без пересборки кита.
- Переключение: грузятся только значки, отрисованные на странице; адрес скачивается один раз при любом числе наборов и переключений; рисунок из набора с перечнем берётся из запасного без лишнего запроса, а отказ запроса запоминается; пока новый рисунок не пришёл или не пришёл вовсе, при смене набора виден старый; при смене имени значка старый не держится; два быстрых `use` кончаются вторым; на сервере ссылка на символ стоит сразу; кнопка в загрузке не теряет индикатор.
- Набор части получают диалог, подтверждение меню и aside, открытые из неё. Сценарии SC-UKV-1884–1886 открывают подтверждение из настоящего открытого меню, диалог по кнопке внутри popover и диалог из диалога.
- Приложения репозитория, тема входа и витрина зовут `provideRtIcons` по-новому и собираются.
- Описание поведения называет систему наборов и все ломающие переносы: новый вызов `provideRtIcons`, убранные имена, имена из данных сервера, переходный скрипт. Коммит несёт `BREAKING CHANGE` с тем же.
- RT-3684 закрыта со ссылкой на эту задачу, в плане эпика это записано.
- Пробная сборка приложения измерена, числа записаны в план эпика и показаны владельцу; RT-3647 до его слова не начинается.
- Тесты кита и соседних пакетов, `check-icon-map`, `check-kit-coverage`, `check-specs`, knip и снимки витрины зелёные. Живая проверка в закреплённом Chrome: переключение на странице витрины, итог записан в ход задачи.

## Stages

Каждый этап начинается со сценариев в `docs/specs/ui-kit-v2/`. Номера прошедших сценариев проверяет `docs/tasks/RT-3648-kit-icon-catalog-split/scenarios-passed.mjs` по отчёту jest: каждый названный номер есть в названии прошедшего теста, и весь запуск зелёный. Скрипт отказывает на отчёт старше самого нового файла `*.ts` кита, поэтому отчёт прошлого запуска не проходит.

### 1. Имена значков одни, таблица пар уходит из кита

- **Steps:**
    1. Таблица пар живёт только в переходном файле, а в ките значок называют именем кита
       Check: `set -o pipefail; pnpm exec nx test @rt-tools/ui-kit-v2 --skip-nx-cache --json --outputFile="$PWD/dist/rt3648.json" >/dev/null 2>&1; node docs/tasks/RT-3648-kit-icon-catalog-split/scenarios-passed.mjs dist/rt3648.json SC-UKV-1879 SC-UKV-1880 && test -z "$(grep -rlE 'materialPairOf|iconMaterialMap' projects/ui-kit-v2/src)" && pnpm exec nx build @rt-tools/ui-kit-v2 --skip-nx-cache >/dev/null 2>&1 && ! grep -rq 'account_circle' dist/ui-kit-v2/fesm2022 && echo ok` → `ok`
    2. Переходный скрипт заменяет старые имена в коде приложения и едет в пакете
       Check: `set -o pipefail; bash tools/tests/rename-icon-names.test.sh >/dev/null && bash tools/tests/check-icon-map.test.sh >/dev/null && bash tools/tests/fetch-material-icons.test.sh >/dev/null && node tools/check-icon-map.mjs >/dev/null && pnpm exec nx build @rt-tools/ui-kit-v2 --skip-nx-cache >/dev/null 2>&1 && test -f dist/ui-kit-v2/migrations/rename-icon-names.mjs && echo ok` → `ok`
- **Readiness sign:** в ките нет перевода имён, а приложение переводит свои имена скриптом из пакета.
- **Verified by:** тесты мест, звавших старые имена; тест скрипта на временной копии и его запуск из собранного пакета; тест загрузчика с подменённой сетью.

### 2. Набор значков объявляется данными и меняется на ходу

- **Steps:**
    1. Наборы объявляются в provideRtIcons, а реестр берёт недостающий рисунок из запасного
       Check: `set -o pipefail; pnpm exec nx test @rt-tools/ui-kit-v2 --skip-nx-cache --json --outputFile="$PWD/dist/rt3648.json" >/dev/null 2>&1; node docs/tasks/RT-3648-kit-icon-catalog-split/scenarios-passed.mjs dist/rt3648.json SC-UKV-1873 SC-UKV-1874 SC-UKV-1875 SC-UKV-1881 SC-UKV-1882 && echo ok` → `ok`
    2. Служба и директива меняют набор у уже нарисованных значков и кнопок
       Check: `set -o pipefail; pnpm exec nx test @rt-tools/ui-kit-v2 --skip-nx-cache --json --outputFile="$PWD/dist/rt3648.json" >/dev/null 2>&1; node docs/tasks/RT-3648-kit-icon-catalog-split/scenarios-passed.mjs dist/rt3648.json SC-UKV-1876 SC-UKV-1877 SC-UKV-1878 SC-UKV-1883 && echo ok` → `ok`
    3. Диалог, подтверждение меню и aside получают набор той части, откуда их открыли
       Check: `set -o pipefail; pnpm exec nx test @rt-tools/ui-kit-v2 --skip-nx-cache --json --outputFile="$PWD/dist/rt3648.json" >/dev/null 2>&1; node docs/tasks/RT-3648-kit-icon-catalog-split/scenarios-passed.mjs dist/rt3648.json SC-UKV-1884 SC-UKV-1885 SC-UKV-1886 && echo ok` → `ok`
    4. Витрина показывает переключение набора у всего приложения и у части страницы
       Check: `set -o pipefail; grep -rq 'SC-UKV-1887' projects/ui-kit-v2/src/lib/components/icon/stories && grep -rq 'play:' projects/ui-kit-v2/src/lib/components/icon/stories && node tools/check-kit-coverage.mjs >/dev/null && echo ok` → `ok`
- **Readiness sign:** на странице витрины смена набора перерисовывает значки и кнопки без перезагрузки.
- **Verified by:** тесты значка, реестра, директивы, кнопки, диалога и aside; play-тест истории на смену ссылки значка и кнопки; живая проверка в закреплённом Chrome.

### 3. Описание, вес и план эпика

- **Steps:**
    1. Описание поведения, документация и README называют новую систему и все ломающие переносы
       Check: `set -o pipefail; for f in docs/specs/ui-kit-v2/icon-material-names/spec.md projects/ui-kit-v2/README.md; do for w in rtIconSet 'use(' provideRtIcons rename-icon-names iconMaterialMap glyphStrategy; do grep -qF "$w" $f || exit 1; done; done; grep -qF 'rtIconSet' projects/ui-kit-v2/src/lib/components/icon/CONTEXT.md && node tools/check-specs.mjs >/dev/null && echo ok` → `ok`
    2. Порог переписан, а тесты кита и соседних пакетов зелёные
       Check: `set -o pipefail; pnpm exec nx build @rt-tools/ui-kit-v2 --skip-nx-cache >/dev/null 2>&1 && pnpm run build:tokens-v2 >/dev/null 2>&1 && pnpm run check:kit-weight >/dev/null 2>&1 && node -e "process.exit(require('./tools/kit-weight-threshold.json').total <= 186000 ? 0 : 1)" && pnpm run check:unused >/dev/null 2>&1 && pnpm exec nx run-many -t build -p message-bus-admin chat-talks-page auth-example-admin @rt-tools/auth-keycloak-theme >/dev/null 2>&1 && pnpm exec nx run-many -t test -p @rt-tools/cms-angular @rt-tools/auth-keycloak-theme --skip-nx-cache >/dev/null 2>&1 && FORCE_COLOR=0 pnpm exec nx test @rt-tools/ui-kit-v2 --output-style=stream --skip-nx-cache 2>&1 | grep 'Tests:'` → /Tests:\s+(\d+ skipped, )?\d+ passed, \d+ total/
    3. Пробная сборка приложения измерена, а RT-3684 закрыта как влитая в эту задачу
       Check: `set -o pipefail; f=docs/plans/kit-presets-by-demand.md; s() { sed -n '/^## RT-3648, пробная сборка приложения/,$p' $f; }; s | grep -E '^\| *Состояние *\| *набор *\| *gzip *\| *набор с button *\| *gzip с button *\|' >/dev/null && for k in 'до RT-3648' 'после RT-3648' '0\.51\.0' '0\.52\.0'; do s | grep -E "^\| *$k *\|( *[0-9]{4,6} *\|){4}" >/dev/null || exit 1; done; grep 'Категории значков в сборке' $f >/dev/null && grep 'RT-3684 влита в RT-3648' $f >/dev/null && test "$(/opt/homebrew/bin/gh issue view 3684 --json state -q .state)" = CLOSED && echo ok` → `ok`
- **Readiness sign:** числа пробной сборки записаны и показаны владельцу; RT-3647 до его слова не начинается.
- **Verified by:** `check-specs`, `check-kit-weight`, тесты трёх пакетов, knip, снимки витрины, набор перед отправкой.

## What this work does not do

- Не рисует недостающие рисунки Material: набор `material` берёт их из `kit`.
- Не переименовывает имена кита и сами рисунки.
- Не следит за сменой признака material на ходу: он читается после первой отрисовки, как сейчас.
- Не меняет набор уже открытого окна, если набор части сменили после открытия.
- Не возвращает рост 0.52.0 у popover, menu и core: это RT-3647 и RT-3682.
- Не подключает сторонние библиотеки значков и не везёт шрифт Material.
- Не выпускает кит и не правит приложения-потребители.
