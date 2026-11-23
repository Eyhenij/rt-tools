# План

**Task:** RT-3483 · **Branch:** RT-3483-ngdoctor-showcase-wrappers
**Behaviour:** unchanged — «не делай больших изменений в этом эпике»: кнопки, геттеры и файлы
обёрток витрины, комментарии кита; поведение и вид компонентов кита не меняются.

После написания этот файл не правится. Пересмотр этапа идёт в `progress.md` решением по ходу.

## Точки

- **A:** ветка стоит на RT-3518 (#3521). Angular Doctor находит `button-has-type` 74,
  `getter-in-template` 18, `one-concept-per-file` 4, `component-file-set-mismatch` 8 — всего 104;
  оценка 87.25.
- **Эта задача доводит до:** кнопки витрины с типом, шаблоны обёрток без геттеров, у каждой обёртки
  витрины свой файл и свой шаблон, комментарии кита не похожи на декоратор.
- **Признак:** Angular Doctor не находит четырёх правил, кроме двух `component-file-set-mismatch`
  гибридных деревьев; `check:ngdoctor` зелёный; снимки витрины прежние.
- **Веха G эпика:** ни одной находки, кроме оговорок владельца: `security-bypass` превью cms, семь
  `click-events-have-key-events` (эпик RT-3522), две `component-file-set-mismatch` гибридных
  деревьев (эпик RT-3524). Задача снимает 102 находки из 1400.
- **Metric:** находки четырёх правил — 104 → 2.

## След задачи

| Что   | Где                                                                                |
| ----- | ---------------------------------------------------------------------------------- |
| Specs | нет: поведение не меняется                                                         |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/code-structure.md` |
| Rules | `.claude/skills/component-structure/`, `.claude/skills/rt-tools-storybook/`        |
| Code  | обёртки витрины, три комментария кита, правило линтера — список ниже               |
| Kit   | три файла с комментарием — вид не меняется, ответ «Без вида» с планом              |

Код: обёртки `projects/ui-kit-v2/src/lib/components/*/stories/component/` и
`projects/ui-kit-v2/src/showcase/stories/component/`; комментарии
`projects/ui-kit-v2/src/lib/components/aside/rt-aside.tokens.ts`,
`projects/ui-kit-v2/src/lib/components/dialog/rt-dialog.tokens.ts`,
`projects/ui-kit-v2/src/lib/components/radius/rt-radius.directive.ts`; правило
`tools/eslint-rules/rules/require-host-bem-block.ts`.

## Как идёт работа

- **Кнопки витрины** получают `type="button"`; кнопка формы, которая отправляет, — `submit`.
- **Геттеры** в обёртках `breadcrumbs` и `page-header-vertical` становятся `computed()`.
- **Матрицы** `pdf-viewer`, `photo-viewer`, `welcome-dialog`: вспомогательные компоненты случаев
  сливаются в один компонент случая со входом «состояние» и своим шаблоном — по файлу на матрицу,
  а не на каждый случай: иначе каждый новый файл без своего шаблона даёт новую
  `component-file-set-mismatch`.
- **Обёртки меню** `test-side-menu-mobile` и `test-side-menu-narrow-cell` получают свои шаблоны;
  общая разметка с соседней обёрткой — внутренний компонент витрины.
- **Текст `@Component`** в комментариях трёх файлов кита и в текстах правила
  `require-host-bem-block.ts` пишется без скобки после слова, ни слитно, ни через пробел:
  инструмент ищет `@Component\s*\(`. Второй класс в файле правила — образец в строке; он уходит
  из строки-образца так, чтобы в файле не было двух `@Component(`. Отвергнуто: литерал
  `template:` ради молчания правила — это подгонка под поиск инструмента.
- **Порог** пишется `node tools/check-ngdoctor.mjs --write` в конце. Рост других правил допустим
  только у `missing-spec-file` и `filename-class-mismatch` на новых файлах витрины; их число
  записывается в прогресс.
- Деревья `rt-hybrid-tree` и `rt-hybrid-tree-selector` не трогаются — эпик RT-3524.

## Что считается сделанным

- Angular Doctor не находит `button-has-type`, `getter-in-template`, `one-concept-per-file`, а
  `component-file-set-mismatch` — только у двух гибридных деревьев.
- Ни одно правило порога, кроме `missing-spec-file` и `filename-class-mismatch`, не выросло;
  `check:ngdoctor` зелёный.
- Тесты кита и правил линтера дерева зелёные без правки ожиданий; снимки витрины прежние.

## Этапы

### 1. Обёртки витрины и порог

- **Steps:**
    1. Кнопки витрины с типом, шаблоны обёрток без геттеров
       Check: `sh -c 'node node_modules/@abiramcodes/angular-doctor/dist/cli.js . --json 2>/dev/null | node -e '"'"'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>console.log(JSON.parse(s).diagnostics.filter(d=>["template-eslint/button-has-type","angular-doctor/getter-in-template"].includes(d.ruleId)).length))'"'"''` → = 0
    2. У каждой обёртки витрины свой файл и шаблон, комментарии без декоратора; тесты кита и правил линтера зелёные
       Check: `sh -c 'pnpm exec nx test @rt-tools/ui-kit-v2 --skip-nx-cache >/dev/null 2>&1 && pnpm exec nx test eslint-rules --skip-nx-cache >/dev/null 2>&1 || { echo red; exit 0; }; node node_modules/@abiramcodes/angular-doctor/dist/cli.js . --json 2>/dev/null | node -e '"'"'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>console.log(JSON.parse(s).diagnostics.filter(d=>["angular-doctor/one-concept-per-file","angular-doctor/component-file-set-mismatch"].includes(d.ruleId)).length))'"'"''` → = 2
    3. Проверка Angular Doctor зелёная на новом пороге, другие правила не выросли, наборы проверок дерева зелёные
       Check: `sh -c 'pnpm run -s check:ngdoctor >/dev/null 2>&1 && bash tools/tests/run.sh >/dev/null 2>&1 || { echo red; exit 0; }; git show 2b02ff25b:tools/ngdoctor-threshold.json > "${TMPDIR:-/tmp}/rt3483-base.json" && node -e '"'"'const b=require(process.argv[1]).rules,n=require("./tools/ngdoctor-threshold.json").rules;const four=["template-eslint/button-has-type","angular-doctor/getter-in-template","angular-doctor/one-concept-per-file"];const free=["angular-doctor/missing-spec-file","angular-doctor/filename-class-mismatch"];const grew=Object.keys(n).filter(k=>!free.includes(k)&&(n[k]||0)>(b[k]||0)).length;console.log(grew+four.reduce((s,k)=>s+(n[k]||0),0)+Math.abs((n["angular-doctor/component-file-set-mismatch"]||0)-2))'"'"' "${TMPDIR:-/tmp}/rt3483-base.json"'` → = 0
- **Readiness sign:** порог без трёх правил и с двумя `component-file-set-mismatch`,
  `check:ngdoctor` зелёный.
- **Verified by:** тесты кита и правил линтера; `pnpm run check:ngdoctor`; живая проверка — витрина
  на порту 6007: матрицы кнопок, `breadcrumbs`, `page-header-vertical`, три матрицы
  просмотрщиков, меню на узкой ширине — замер вида до и после; снимки витрины в наборе перед
  отправкой.

## Что эта работа не делает

- Шаблоны гибридных деревьев — эпик RT-3524, слово владельца «выноси это в новый эпик».
- Находки `click-events-have-key-events` — эпик RT-3522.
- Тесты рядом для новых файлов витрины и имена файлов по классам — задачи эпика RT-3489 и
  RT-3488.
