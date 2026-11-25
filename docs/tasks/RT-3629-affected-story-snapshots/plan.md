# План

**Task:** RT-3629 · **Branch:** RT-3629-affected-story-snapshots
**Spec:** `docs/specs/ui-kit-v2/snapshots/spec.md`
**Behaviour:** unchanged — правка обвязки снимков и набора перед отправкой; кода приложений, кита и
пакетов для потребителя она не трогает.

После написания этот файл не правится. Пересмотр этапа идёт в `progress.md` решением по ходу.

## Точки

- **A:** правка одной истории снимает все 1260 кадров: 448–575 секунд на запуск, 279 из 624 минут всех проверок за 21–24.11.
- **Эта задача доводит до:** набор ветки снимает файлы историй, до которых правка доходит по импортам; полный набор идёт один раз, шагом CI на PR в `main`.
- **Признак:** правка одного файла историй снимает его кадры, а не 1260, и шаг печатает `снято N файлов историй из M, кадров K`; `node tools/affected-stories.mjs` по слиянию RT-3497 (`a46a0a868`) называет не больше 40 файлов историй, и среди них пять читателей поля диапазона и мультивыбора; по RT-3526 (`4ac4d88d0`) — ни одного, по правкам токенов (`93834fcb1`) и общих стилей (`745a402c8`) — всё, по добавленным подписям (`d16f9ee40`) — не больше 40. Причины 10 из 11 красных запусков будут названы в плане эпика, у одного причина в журнале не осталась.
- **Веха G эпика:** не больше 30 минут активной работы на мелкую задачу. На базе эпика выигрыш около нуля: кит из шести задач трогала одна, RT-3481, и до неё доходит 302 файла историй из 319. Выигрыш — у правок кита, которых в базе нет: на 178 прошлых слияниях с китом до 40 файлов снимал бы 31%, всё — 48% до послаблений правила 5; счёт после них — в ходе работы.
- **Цена П4:** расхождение, которого граф не увидел, всплывает на PR эпика в `main`, среди правок нескольких задач; чинит его исполнитель, ведущий этот PR.
- **Metric:** секунды шага снимков на правке одной истории при холодной сборке; вниз, цель — не больше 120; сейчас 448–575. Сборка витрины и съёмка меряются порознь до кода; если одна холодная сборка длиннее 120 секунд, цель пересматривается по этому замеру в ходе работы. Второе число — доля прошлых слияний кита, где команда отвечает не «всё»; вверх.

## Как решает команда

`node tools/affected-stories.mjs --base <база> [--head <вершина>]` печатает первой строкой `снять: всё`, `снять: <N> из <M>` или `снять: нечего`, ниже — файлы историй или причины по одной на строку. Разница берётся от точки расхождения. С `--head` файлы читаются из того коммита (`git show`), без него — из рабочей копии, и незакоммиченные правки входят в разницу.

- **Граф** (`tools/story-graph.mjs`): импорты `.ts` внутри дерева — относительный путь, в том числе `.js` на месте `.ts`, и `paths` из `tsconfig.base.json` вместе с ключами со звёздочкой; `templateUrl`, `styleUrl`, `styleUrls`; `@use`, `@import`, `@forward`; `import()`. Именованный импорт проходит сборщики экспорта до файла, где имя объявлено; сборщики на пути входят. Импорт целиком, `import()` и ненайденное имя входят со всем, что отдаёт сборщик. Импорт внутри дерева, который не разрешился, — всё. Единица — файл историй: выбор по имени истории ломает запуск (`tools/visual-snapshots-v2.mjs`).
- **Правила идут сверху вниз, решает первое совпавшее:**
    1. `rt-kit-labels.en.ts` и `showcase-labels.ru.ts`, где каждая изменённая строка — добавленная запись `ключ: 'строка',`, — ни одной. Иная правка подписей — по правилу 2 всё: `preview.ts` их читает.
    2. Файл, до которого доходят `.storybook/preview.ts`, `test-runner.ts`, `storybook.scss`, `vendor.scss`, `main.ts`, и всё под `.storybook/`, кроме эталонов, — всё. `preview.ts` и `test-runner.ts` идут по именованным импортам, как истории.
    3. Эталон `__snapshots__/*.png` — файлы историй с тем заголовком; заголовка нет или он не разобран — всё.
    4. Удалённый `*.stories.ts` — всё.
    5. `*.spec.ts`, `*.md`, граф кода, `docs/`, `.claude/`, `apps/`, `libs/`, `prisma/`, `deploy/`, `.github/`, `eslint/`, `.prettierignore`, `commitlint.config.cjs`, `eslint.config.mjs`, `angular-doctor.config.json`, `knip.json`, `docker-compose.yml`, `**/ng-package.json`, `tsconfig.spec.json`, `tsconfig.lib*.json`, `projects/*/package.json` с правкой одной строки `"version"`, всё содержимое пакета, ни до одного файла которого не доходят ни истории, ни настройка витрины, `tools/` кроме скриптов шага — ни одной. `*.mdx` — ни одной: страницу собирает CI, цена названа.
    6. Файл в графе — все истории, до которых он доходит.
    7. Исходник пакета (`.ts`, `.scss`, `.html`) вне `src/styles/`, до которого не доходят ни истории, ни настройка витрины, в том числе удалённый, — ни одной: потребителя удалённого файла правит та же ветка, а импорт в пустоту — всё.
    8. Прочее — `src/styles/`, значки, шрифты, `package.json`, файл замка, `tsconfig*`, корень дерева, скрипты шага снимков, неузнанный путь — всё. Скрипты шага: `visual-gate`, `visual-snapshots-v2`, `affected-stories`, `story-graph`, `shot-*`, `showcase-probe`, `serve-static`, `snapshot-*-probe`.
- **Не прочлась база или разница** — всё.

**Шаг снимков.** `visual-gate.mjs ui-kit-v2 --affected <база>`: «всё» — прежний полный ход; «нечего» — строка об этом и код 0 без сборки витрины; список — сборка, съёмка названных файлов, сверка каталога с оглавлением витрины и с реестром снятого: каждый названный файл открыт, каждый эталон его историй снят, вместе с `--wNNN`, иначе отказ. Последняя строка — `снято N файлов историй из M, кадров K`. Сверка оглавления — уже готовая `requireWholeIndex`. Пробы обвязки идут, как сейчас. `--affected` без базы — полный ход, незнакомый флаг — отказ.

**Набор.** `rt_push_checks <база>` печатает `node tools/visual-gate.mjs ui-kit-v2 --affected <база>` во всех ветвях; с пустой базой — прежнюю команду, её сверяет `check-push-gate`. Новые скрипты и пробы `snapshot-*-probe` входят в предмет `show2`. CI зовёт прежнюю команду.

## След задачи

| Что                  | Где                                                                                                                                                       |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs (правится)     | `docs/specs/ui-kit-v2/snapshots/spec.md`, `docs/specs/ui-kit-v2/snapshots/scenarios.md`, `docs/specs/ui-kit-v2/snapshots/implementation.md`                 |
| Laws                 | `docs/constitution/verifiability.md`, `docs/constitution/delivery.md`                                                                                     |
| Rules (правится)     | `.claude/skills/git-workflow-push/implementation.md`, `.claude/rt-kit/overrides/rules/git-workflow-push.github.md`, `.claude/skills/ui-component-tests-visual/SKILL.md`, `.claude/skills/task-delivery-loop-run/SKILL.md`, `.claude/skills/ui-component-tests/implementation.md` |
| Code (правится)      | `tools/story-graph.mjs`, `tools/affected-stories.mjs`, `tools/visual-gate.mjs`, `tools/visual-snapshots-v2.mjs`                                             |
| Tests (правится)     | `tools/tests/affected-stories.test.sh`, `tools/tests/visual-gate.test.sh`, `tools/tests/push-heavy-subjects.test.sh`                                        |
| Настройки (правится) | `.claude/rt-kit/project.sh`, `.github/workflows/ci.yml` (слова о той же команде), `docs/plans/delivery-speed.md`                                            |

## Что считается сделанным

- Сценарии: сборщик, импорт целиком, `import()`, шаблон, стиль, `@use` с подчёркиванием, путь со звёздочкой, `.js`, неразрешённый импорт; стиль кнопки, провайдер из `preview.ts` и `story-snapshot.ts` — всё; подписи с добавленной, изменённой и чужой строкой; эталон; удалённый файл историй; токены; корень; неузнанный путь; нечитаемая база; `--head`; общий стиль `src/styles/`, до которого история не доходит, — всё; `ng-package.json`, строка `version`, пакет вне витрины, удалённый шаблон — ни одной.
- Сценарии шага запускают сам `visual-gate.mjs` с подменными `pnpm` и браузером: на «нечего» `pnpm` не зван и код 0, незнакомый флаг отказан до сборки, реестр без названного файла — код не 0.
- На прошлых слияниях команда отвечает как в признаке.
- Правка одного файла историй снимает его кадры на настоящей витрине; выпавший файл и осиротевший `--wNNN` отказаны; правка без кита не собирает витрину.
- Набор с базой печатает выборочную команду во всех предметах и там, где предметы не прочлись, без базы — полную; `check-push-gate` зелёный. В `project.sh` не больше 500 строк.
- Таблица 11 красных запусков стоит в плане эпика, #3150 и #3280 названы рядом.
- Секунды шага на правке одной истории записаны рядом с 448–575, сборка и съёмка порознь.

## Этапы

### 1. Команда называет затронутые истории

- **Steps:**
    1. Сценарии графа и решения зелёные
       Check: `sh -c 'out=$(VERBOSE=1 bash tools/tests/affected-stories.test.sh 2>&1) && printf "%s\n" "$out" | grep -c "^  ok "'` → >= 33
    2. Прошлые слияния судятся как в признаке
       Check: `bash -c 'set -o pipefail; for p in a46a0a868 4ac4d88d0 93834fcb1 745a402c8 d16f9ee40; do node tools/affected-stories.mjs --base "$p^1" --head "$p^2" | head -1 | sed -E "s/^снять: ([1-9]|[1-3][0-9]|40) из .*/мало/; s/^снять: //"; done | tr "\n" " "'` → `мало нечего всё всё мало`
    3. RT-3497 задевает своих читателей
       Check: `bash -c 'set -o pipefail; node tools/affected-stories.mjs --base a46a0a868^1 --head a46a0a868^2 | grep -cE "/(date-range|multiselect|data-table|table|page-header-vertical)\.stories\.ts$"'` → = 5
- **Readiness sign:** команда отвечает по сценариям и по прошлым слияниям.
- **Verified by:** `bash tools/tests/affected-stories.test.sh` — «0 failures».

### 2. Шаг снимков и набор ветки

- **Steps:**
    1. Сценарии шага: всё, список, нечего, без базы, незнакомый флаг, выпавший файл, лишний эталон
       Check: `sh -c 'out=$(VERBOSE=1 bash tools/tests/visual-gate.test.sh 2>&1) && printf "%s\n" "$out" | grep -c "^  ok   the affected run "'` → >= 7
    2. Набор с базой зовёт выборочную команду во всех предметах, без базы — полную
       Check: `bash -c '. .claude/rt-kit/project.sh; n=0; for s in show2 kit2 everything; do eval "rt_push_touched() { printf $s; }"; case "$(rt_push_checks origin/main 2>/dev/null)" in *"visual-gate.mjs ui-kit-v2 --affected origin/main"*) n=$((n + 1)) ;; esac; done; echo "$n $(grep -cx "node tools/visual-gate.mjs ui-kit-v2" <<< "$(rt_push_checks "" 2>/dev/null)")"'` → `3 1`
    3. Сверка набора с CI зелёная
       Check: `sh -c 'grep -q -- --affected .claude/rt-kit/project.sh && node tools/check-push-gate.mjs >/dev/null 2>&1 && echo 1'` → = 1
- **Readiness sign:** ветка снимает затронутое, CI — всё.
- **Verified by:** живой запуск на правке одной истории: последняя строка шага и секунды в ходе работы.

### 3. Причины красных запусков и тексты

- **Steps:**
    1. Таблица 11 запусков стоит в плане эпика
       Check: `grep -cE "^\| 2[12]\.11 " docs/plans/delivery-speed.md` → = 11
    2. Спека и правила называют выборочную съёмку
       Check: `sh -c 'for f in docs/specs/ui-kit-v2/snapshots/spec.md docs/specs/ui-kit-v2/snapshots/implementation.md .claude/skills/git-workflow-push/implementation.md .claude/rt-kit/overrides/rules/git-workflow-push.github.md .claude/skills/ui-component-tests-visual/SKILL.md .claude/skills/task-delivery-loop-run/SKILL.md .claude/skills/ui-component-tests/implementation.md; do grep -q -- "--affected" "$f" || exit 1; done; echo 1'` → = 1
    3. Быстрые проверки дерева зелёные на правке
       Check: `sh -c 'test -f tools/affected-stories.mjs && node tools/check-dupes.mjs >/dev/null && node tools/check-file-size.mjs >/dev/null && node tools/check-specs.mjs >/dev/null && node tools/check-spec-coverage.mjs >/dev/null && node tools/check-doc-paths.mjs >/dev/null && pnpm run -s check:unused >/dev/null 2>&1 && echo 1'` → = 1
- **Readiness sign:** тексты согласны с кодом.
- **Verified by:** вывод шагов 3.1–3.3.

## Что эта работа не делает

- Пределы 15 и 30 секунд, повтор упавшей истории, слова «эталон без истории» про упавший файл — #3150, #3280, эпик RT-3412.
- Порядок набора и второго круга — RT-3630.
- Кадры сквозного набора админки: их состав решает `rt_admin_e2e_step`.
- Запуск CI на PR, чью базу сменили на `main` без нового коммита: сегодня его нет ни у одного шага, тело PR это называет.
