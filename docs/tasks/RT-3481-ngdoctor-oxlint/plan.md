# План

**Task:** RT-3481 · **Branch:** RT-3481-ngdoctor-oxlint
**Behaviour:** unchanged — слово владельца 23.11.2026 «Подтверждаю, вид не меняется»: сравнения,
обход ключей и условия схемы меняют форму записи, а значения и разметка остаются; смену JSON схемы
графиков чата владелец подтвердил отдельно: «Подтверждаю смену JSON (Recommended)».

После написания этот файл не правится. Пересмотр этапа идёт в `progress.md` решением по ходу.

## Точки

- **A:** скан на вершине RT-3480 (`c1b5286af`, 23.11.2026) — 21 находка четырёх правил oxlint,
  которого Angular Doctor запускает внутри себя: `eqeqeq` 11, `no-thenable` 7,
  `no-extra-boolean-cast` 2, `no-useless-spread` 1.
- **Эта задача доводит до:** Angular Doctor не называет ни одного из четырёх правил; порог
  `check:ngdoctor` не держит их.
- **Признак:** `pnpm run check:ngdoctor` — «equal to the threshold», и в пороге нет четырёх правил.
- **Веха G эпика:** ни одной находки, кроме одной `security-bypass` превью cms.
- **Metric:** число находок четырёх правил — 21 → 0.

## След задачи

| Что   | Где                                                                                                       |
| ----- | --------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/utils/`, `docs/specs/core/`, `docs/specs/ui-kit-v2/`                                          |
| Laws  | `docs/constitution/code-structure.md`, `docs/constitution/reuse-first.md`                                 |
| Rules | `.claude/skills/typescript-conventions/`, `.claude/skills/reuse-first/`                                   |
| Code  | `projects/utils/src/lib/`, `projects/core/src/lib/`, `projects/ui-kit-v2/src/`, `libs/message-bus-admin/` |
| Kit   | пять файлов кита из `approvals.md` — без смены вида; смена JSON схемы — отдельным словом владельца        |

## Как идёт работа

Ветка стоит на ветке RT-3480 (#3513), пока та ждёт слияния: эпик ведёт задачи стопкой. Вершина
RT-3480 для сверки названа коммитом `c1b5286af`, а не именем ветки: ветка сдвинется при слиянии.

- Одиннадцать сравнений `== null` и `!= null` проверяют «нет значения» и переходят на `isNil` из
  utils; внутри utils — тот же `isNil` относительным импортом.
- `Boolean(value) ?` и `!!x ?` теряют лишнее приведение: условие тернарного оператора приводит
  само.
- Цикл просмотрщика PDF идёт по `keys()` самого словаря: он удаляет только текущий ключ, а удаление
  во время обхода `Map` безопасно.
- Условия схемы графиков чата переписываются с `if`/`then` на `anyOf` и `not`: правило выполняется
  по сути, валидатор принимает и отклоняет те же графики — это держат спеки Ajv схемы. PR называет
  смену JSON схемы как смену публичного входа кита.
- После задачи источник oxlint не даёт находок, и порог пишется командой
  `node tools/check-ngdoctor.mjs --write --source-gone oxlint`. Проверку живости источника делает
  RT-3514 — слово владельца «Отдельной задачей эпика».
- Проверки шагов 1–3 зелёные только на полном прогоне: без пропущенных проверок инструмента и с
  находками других правил, иначе ноль целевого правила не отличить от молчания источника.

## Что считается сделанным

- Angular Doctor не называет `eqeqeq`, `no-thenable`, `no-extra-boolean-cast` и `no-useless-spread`.
- Порог `check:ngdoctor` записан на результате, не держит этих правил, и ни одно другое правило в
  нём не выросло против порога `c1b5286af`; настройка инструмента не тронута, строк выключения
  правил в дереве не прибавилось; проверка спек зелёная.
- Схема графиков чата принимает и отклоняет те же графики, что до задачи; тесты, типы и lint
  затронутых проектов зелёные; эталоны витрины не переснимаются, а кадры витрины сверяет набор
  перед отправкой.

## Этапы

### 1. Сравнения, приведения, схема

- **Steps:**
    1. Проверки «нет значения» в utils, core, ките и админке идут через isNil
       Check: `sh -c 'pnpm run -s ngdoctor --json 2>/dev/null | node -e "let s=\"\";process.stdin.on(\"data\",d=>s+=d).on(\"end\",()=>{const j=JSON.parse(s),r=[\"oxlint/eqeqeq\"],full=!(j.skippedChecks||[]).length&&j.diagnostics.length>1000;console.log(full?j.diagnostics.filter(d=>r.includes(d.ruleId)).length:-1)})"'` → = 0
    2. Условия тернарных операторов без лишнего приведения, просмотрщик PDF обходит ключи словаря без копии
       Check: `sh -c 'pnpm run -s ngdoctor --json 2>/dev/null | node -e "let s=\"\";process.stdin.on(\"data\",d=>s+=d).on(\"end\",()=>{const j=JSON.parse(s),r=[\"oxlint/no-extra-boolean-cast\",\"oxlint/no-useless-spread\"],full=!(j.skippedChecks||[]).length&&j.diagnostics.length>1000;console.log(full?j.diagnostics.filter(d=>r.includes(d.ruleId)).length:-1)})"'` → = 0
    3. Условия схемы графиков чата записаны через anyOf и not
       Check: `sh -c 'pnpm run -s ngdoctor --json 2>/dev/null | node -e "let s=\"\";process.stdin.on(\"data\",d=>s+=d).on(\"end\",()=>{const j=JSON.parse(s),r=[\"oxlint/no-thenable\"],full=!(j.skippedChecks||[]).length&&j.diagnostics.length>1000;console.log(full?j.diagnostics.filter(d=>r.includes(d.ruleId)).length:-1)})"'` → = 0
    4. Порог Angular Doctor равен результату, не держит четырёх правил задачи и не вырос ни в одном другом правиле; настройка инструмента та же, строк выключения правил не прибавилось; проверка спек зелёная; эталоны витрины не переснимались; тесты, типы и lint utils, core, кита и админки зелёные
       Check: `sh -c 'pnpm run -s check:ngdoctor >/dev/null 2>&1 && node -e "const a=JSON.parse(require(\"child_process\").execSync(\"git show c1b5286af:tools/ngdoctor-threshold.json\")).rules,t=require(\"./tools/ngdoctor-threshold.json\").rules,gone=[\"eqeqeq\",\"no-thenable\",\"no-extra-boolean-cast\",\"no-useless-spread\"].map(r=>\"oxlint/\"+r);process.exit(gone.some(r=>t[r])||Object.keys(t).some(r=>(t[r]||0)>(a[r]||0))?1:0)" && git diff --quiet c1b5286af HEAD -- angular-doctor.config.json && ! git diff c1b5286af HEAD | grep -qE "^\+.*(oxlint|eslint)-disable" && node tools/check-specs.mjs >/dev/null 2>&1 && git diff --quiet c1b5286af HEAD -- projects/ui-kit-v2/.storybook/__snapshots__ && pnpm exec nx run-many -t test typecheck lint -p @rt-tools/utils @rt-tools/core @rt-tools/ui-kit-v2 message-bus-admin-common-core-util --skip-nx-cache >/dev/null 2>&1; echo $?'` → = 0
- **Readiness sign:** Angular Doctor не называет четырёх правил задачи, порог их не держит.
- **Verified by:** `pnpm run check:ngdoctor` — «equal to the threshold»; спеки Ajv схемы графиков
  чата; тесты, типы и lint utils, core, кита и админки; набор перед отправкой с гейтом кадров
  витрины.

## Что эта работа не делает

- Находки других правил Angular Doctor — задачи эпика RT-3482…3490 по их правилам.
- Проверку живости источников инструмента — RT-3514.
- Выпуск utils, core и кита: правки входят в выпуск по решению владельца.
