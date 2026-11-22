# План

**Task:** RT-3478 · **Branch:** RT-3478-ngdoctor-security
**Spec:** `docs/specs/chat/widget/spec.md`
**Behaviour:** changes

Договорённость пишется прямо в спеки доменов: сценарии SC-CH-118 — в `docs/specs/chat/widget/`,
SC-CMS-79 и SC-CMS-80 — в `docs/specs/cms/angular/`, SC-UKV-1709 и SC-UKV-1710 — в
`docs/specs/ui-kit-v2/icon-on-demand/` и `docs/specs/ui-kit-v2/table-full-port/`. Для человека
виджет чата, редактор cms, значки и таблица выглядят как прежде; меняется то, что в страницу больше
не попадает: скрипты, обработчики событий и неразобранные адреса.

После написания этот файл не правится. Пересмотр этапа идёт в `progress.md` решением по ходу.

## Точки

- **A:** Angular Doctor находит 4 записи `innerHTML` и 3 обхода `DomSanitizer` в шести файлах
  дерева. Слово об отказе виджета чата и сторона реплики идут в разметку без экранирования; правка
  блока cms и реестр значков кладут разметку без очистки.
- **Эта задача доводит до:** ни одной находки `inner-html`; одна находка `security-bypass` — превью
  встраивания cms, за разбором адреса, по слову владельца. Разметка, которую дерево кладёт в
  страницу, проходит очистку, а тексты виджета идут текстом.
- **Признак:** вывод `pnpm run -s ngdoctor --json` — 0 находок `inner-html` и 1 `security-bypass`;
  тесты SC-UKV-1709, SC-UKV-1710, SC-CMS-79, SC-CMS-80, SC-CH-118 зелёные.
- **Веха G эпика:** оценка 100 из 100, ни одной находки — с оговоркой владельца о превью
  встраивания cms.
- **Metric:** нет: исправление находок проверки.

## След задачи

| Что     | Где                                                                                          |
| ------- | -------------------------------------------------------------------------------------------- |
| Specs   | `docs/specs/chat/widget/` — по `node tools/specs-for.mjs` на файлы строки Code; сценарии ложатся и в `docs/specs/ui-kit-v2/icon-on-demand/`, `docs/specs/ui-kit-v2/table-full-port/`, `docs/specs/cms/angular/` |
| Laws    | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`            |
| Rules   | `.claude/skills/angular-patterns/`, `.claude/skills/testing/`                                |
| Code    | `projects/core/`, `projects/ui-kit-v2/`, `projects/cms-angular/`, `apps/chat-widget/`        |

## Что считается сделанным

- Angular Doctor не находит `inner-html`; находит одну `security-bypass` — в превью встраивания cms.
- Пайпа `sanitize` нет в `@rt-tools/core` и в его README; коммит и PR называют удаление.
- Тесты показывают: SVG значка теряет `script` и `on*`; правка блока cms теряет скрипт и
  обработчик, но сохраняет `style` выделения и атрибуты ссылки; превью пускает https и не пускает
  `javascript:`, `http:` и неразборный адрес; слово об отказе и сторона реплики виджета показаны
  текстом.
- Порог Angular Doctor записан на результате задачи, ни одно правило в нём не выросло против порога
  ветки эпика.

## Этапы

### 1. Ядро и кит

- **Steps:**
    1. Пайп sanitize удалён из core вместе с тестом и экспортом
       Check: `git ls-files projects/core/src | grep -c sanitize.pipe || true` → `0`
    2. Пример пайпа убран из README core
       Check: `grep -c 'sanitize' projects/core/README.md || true` → `0`
    3. Стиль значка ячейки таблицы привязан строкой без обхода
       Check: `pnpm run -s ngdoctor --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>console.log(JSON.parse(s).diagnostics.filter(d=>/inner-html|security-bypass/.test(d.ruleId)&&d.file.includes("rt-data-table-cell")).length))'` → `= 0`
    4. Реестр значков разбирает SVG, убирает script и атрибуты on* и переносит узлы
       Check: `pnpm run -s ngdoctor --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>console.log(JSON.parse(s).diagnostics.filter(d=>/inner-html|security-bypass/.test(d.ruleId)&&d.file.includes("rt-icon.registry")).length))'` → `= 0`
    5. Тесты SC-UKV-1709 и SC-UKV-1710 зелёные: символ спрайта несёт рисунок без script и on*, стиль значка ячейки доходит до значка
       Check: `pnpm exec nx test @rt-tools/ui-kit-v2 --skip-nx-cache --testNamePattern='SC-UKV-17(09|10)' --output-style=static 2>&1 | grep 'Tests:' | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' || echo 0` → `>= 2`
- **Readiness sign:** в core и ките нет находок двух правил, тесты кита зелёные.
- **Verified by:** `pnpm run -s ngdoctor --json` — ни одной находки двух правил в `projects/core` и `projects/ui-kit-v2`.

### 2. Редактор cms

- **Steps:**
    1. Правка блока очищает разметку DOMPurify с белым списком вставки и кладёт узлы
       Check: `pnpm run -s ngdoctor --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>console.log(JSON.parse(s).diagnostics.filter(d=>/inner-html|security-bypass/.test(d.ruleId)&&d.file.includes("cms-editable")).length))'` → `= 0`
    2. Превью встраивания пускает в доверие только разобранный https-адрес
       Check: `pnpm exec nx test @rt-tools/cms-angular --skip-nx-cache --testNamePattern='SC-CMS-79' --output-style=static 2>&1 | grep 'Tests:' | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' || echo 0` → `>= 2`
    3. Тест SC-CMS-80 зелёный: скрипт и обработчик уходят, style выделения и атрибуты ссылки остаются
       Check: `pnpm exec nx test @rt-tools/cms-angular --skip-nx-cache --testNamePattern='SC-CMS-80' --output-style=static 2>&1 | grep 'Tests:' | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' || echo 0` → `>= 2`
- **Readiness sign:** в правке блока нет находок, превью держит одну находку за разбором адреса, тесты cms зелёные.
- **Verified by:** `pnpm exec nx test @rt-tools/cms-angular` — зелёный.

### 3. Виджет чата

- **Steps:**
    1. Виджет строит разметку узлами DOM, тексты идут в textContent
       Check: `pnpm run -s ngdoctor --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>console.log(JSON.parse(s).diagnostics.filter(d=>/inner-html|security-bypass/.test(d.ruleId)&&d.file.includes("chat-widget")).length))'` → `= 0`
    2. Тест SC-CH-118 зелёный: слово об отказе с разметкой в пределе и сторона реплики показаны текстом
       Check: `cd apps/chat-widget && ../../node_modules/.bin/vitest run -t 'SC-CH-118' 2>&1 | grep -E 'Tests ' | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' || echo 0` → `>= 1`
- **Readiness sign:** в виджете нет находок, неэкранированные поля показаны текстом.
- **Verified by:** `pnpm exec nx test chat-widget` — зелёный; сквозной набор виджета зелёный в наборе перед push.

### 4. Порог проверки

- **Steps:**
    1. Находок двух правил в дереве ровно одна — превью встраивания cms
       Check: `pnpm run -s ngdoctor --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>console.log(JSON.parse(s).diagnostics.filter(d=>/inner-html|security-bypass/.test(d.ruleId)).length))'` → `= 1`
    2. Порог записан на результате задачи без правила inner-html
       Check: `grep -c 'inner-html' tools/ngdoctor-threshold.json || true` → `0`
    3. Ни одно правило порога не выросло против порога ветки эпика
       Check: `node -e 'const {execSync}=require("child_process");const a=JSON.parse(execSync("git show 513f11b21:tools/ngdoctor-threshold.json")).rules;const b=JSON.parse(require("fs").readFileSync("tools/ngdoctor-threshold.json")).rules;const grew=Object.keys(b).filter(k=>(b[k]??0)>(a[k]??0));const fell=Object.keys(a).filter(k=>(b[k]??0)<a[k]);console.log(grew.length===0&&fell.length>0?0:1)'` → `= 0`
- **Readiness sign:** порог без `inner-html`, с одной `security-bypass`, без роста других правил; шаг проверки зелёный.
- **Verified by:** `pnpm run check:ngdoctor` — «equal to the threshold».

## Чего эта работа не делает

- Выпуск core, кита и cms: выпуск — отдельное решение владельца. PR называет, что пайп `sanitize`
  ушёл из опубликованного API core.
- Остальные правила Angular Doctor: они у следующих задач эпика. Файлы тестов, которые задача
  кладёт рядом с директивой и компонентом cms, снимают и их находки `missing-spec-file`.
