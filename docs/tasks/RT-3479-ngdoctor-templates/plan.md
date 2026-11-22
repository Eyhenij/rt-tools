# План

**Task:** RT-3479 · **Branch:** RT-3479-ngdoctor-templates
**Draft:** `docs/specs/ui-kit-v2/proposed/template-slots/spec.md`
**Behaviour:** changes

Договорённость — черновик `docs/specs/ui-kit-v2/proposed/template-slots/` со сценариями
SC-UKV-1711…1746; при закрытии он сливается в спеки кита, часть списка cms — в
`docs/specs/cms/angular/` со сценарием SC-CMS, часть списка админки — в
`docs/specs/message-bus/admin-list-page/` со сценарием SC-MB. Для человека экраны кита, cms и
админки выглядят как прежде; меняется разметка потребителя: 28 слотов под условием или в шаблоне
передаются через `<ng-template>`, а содержимое закрытой ветки не создаётся. Тело панели раскрытия
создаётся сразу и скрыто, пока панель свёрнута.

После написания этот файл не правится. Пересмотр этапа идёт в `progress.md` решением по ходу.

## Точки

- **A:** Angular Doctor находит 18 `ng-content-in-control-flow`, 8 `effect-writes-state` и 3
  `prefer-control-flow`. Ещё 11 слотов стоят в ветках `@else` и глубже, проверка их не видит.
  Содержимое закрытых веток создаётся всегда; `effect` пишет сигналы; примеры в комментариях учат
  `*ngIf` и `*ngFor`.
- **Эта задача доводит до:** ни одной находки трёх правил; ни одного `<ng-content>` под условием или
  в шаблоне в ките, cms и админке; все потребители в дереве переписаны.
- **Признак:** `pnpm run -s ngdoctor --json` — 0 находок трёх правил; тесты SC-UKV-1711…1746
  зелёные; сверка снимков витрины кита зелёная.
- **Веха G эпика:** ни одной находки, кроме одной `security-bypass` превью cms.
- **Metric:** нет: исправление находок проверки.

## След задачи

| Что     | Где                                                                                          |
| ------- | -------------------------------------------------------------------------------------------- |
| Specs   | `docs/specs/ui-kit-v2/proposed/template-slots/` — сливается в спеки кита; части в `docs/specs/cms/angular/` и `docs/specs/message-bus/admin-list-page/` |
| Laws    | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`, `docs/constitution/mockups.md` |
| Rules   | `.claude/skills/angular-patterns/`, `.claude/skills/component-structure/`, `.claude/skills/kit-approval/`, `.claude/skills/testing/` |
| Code    | `projects/core/`, `projects/ui-kit-v2/`, `projects/cms-angular/`, `libs/message-bus-admin/`, `apps/auth-example-admin/` |

## Что считается сделанным

- Angular Doctor не находит `ng-content-in-control-flow`, `effect-writes-state` и
  `prefer-control-flow`.
- Каждый из 28 слотов договорённости передаётся шаблоном и создаётся только в открытой ветке; тело
  панели раскрытия в DOM с начала, свёрнутое скрыто и `inert`.
- Старая форма именованного слота и пункт меню вне `rtMenuContent` пишут предупреждение в режиме
  разработки.
- Подтверждённое действие пункта меню доходит до потребителя после закрытия меню.
- Ни одного места старой формы слота в разметке дерева; снимки витрины кита не изменились.
- Порог Angular Doctor записан на результате, ни одно правило в нём не выросло.

## Этапы

### 1. Примеры и эффекты

- **Steps:**
    1. Примеры в комментариях пайпов equal, not-equal и директивы действий строки переписаны на @if и @for
       Check: `pnpm run -s ngdoctor --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>console.log(JSON.parse(s).diagnostics.filter(d=>d.ruleId.endsWith("prefer-control-flow")).length))'` → = 0
    2. Сброс и копия входа в workspace-details, настройках таблицы и панели чата админки идут через linkedSignal или computed
       Check: `pnpm run -s ngdoctor --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>console.log(JSON.parse(s).diagnostics.filter(d=>d.ruleId.endsWith("effect-writes-state")&&/workspace-details|settings-aside|admin-chat-panel/.test(d.file)).length))'` → = 0
    3. Замеры ширины выреза, плитки показателя и области прокрутки пишут сигнал из наблюдателя размера, а не из effect
       Check: `pnpm run -s ngdoctor --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>console.log(JSON.parse(s).diagnostics.filter(d=>d.ruleId.endsWith("effect-writes-state")).length))'` → = 0
    4. Тесты кита и панели чата админки зелёные на коде без записи сигналов из effect
       Check: `node -e 'const {execSync}=require("child_process");let failed=0;try{execSync("pnpm exec nx run-many -t test -p @rt-tools/ui-kit-v2 message-bus-admin-chat-feature-panel --skip-nx-cache --output-style=static",{stdio:"pipe"})}catch{failed=1}const d=JSON.parse(execSync("pnpm run -s ngdoctor --json 2>/dev/null",{maxBuffer:1e9}).toString()).diagnostics.filter(x=>x.ruleId.endsWith("effect-writes-state")).length;console.log(failed+d)'` → = 0
- **Verified by:** Angular Doctor не называет двух правил; тесты кита зелёные.

### 2. Именованные слоты кита

- **Steps:**
    1. Подсказка поля, действия панели раскрытия, слоты шапки страницы, чата и подпункта бокового меню передаются шаблонами и собираются списками
       Check: `pnpm run -s ngdoctor --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>console.log(JSON.parse(s).diagnostics.filter(d=>d.ruleId.endsWith("ng-content-in-control-flow")&&/rt-field|expansion-panel|page-header|rt-chat|side-menu-sub-item/.test(d.file)).length))'` → = 0
    2. Тело панели раскрытия стоит в DOM с начала, свёрнутое скрыто и inert
       Check: `pnpm exec nx test @rt-tools/ui-kit-v2 --skip-nx-cache --testNamePattern='SC-UKV-1738' --output-style=static 2>&1 | grep 'Tests:' | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' || echo 0` → >= 1
    3. Старая форма именованного слота пишет предупреждение в режиме разработки
       Check: `pnpm exec nx test @rt-tools/ui-kit-v2 --skip-nx-cache --testNamePattern='SC-UKV-1745' --output-style=static 2>&1 | grep 'Tests:' | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' || echo 0` → >= 1
    4. Тесты именованных слотов зелёные: SC-UKV-1711…1723, 1734…1737
       Check: `pnpm exec nx test @rt-tools/ui-kit-v2 --skip-nx-cache --testNamePattern='SC-UKV-17(1[1-9]|2[0-3]|3[4-7])' --output-style=static 2>&1 | grep 'Tests:' | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' || echo 0` → >= 17
- **Verified by:** тесты SC-UKV-1711…1723 и 1734…1738, 1745 зелёные.

### 3. Слоты по умолчанию кита

- **Steps:**
    1. Меню, кнопка-значок, хлебные крошки, заголовок сортировки (rtTableSortHeaderContent), боковая панель, обёртка скелетона, динамический список, строка суммы и пункт сведений берут содержимое шаблоном
       Check: `pnpm run -s ngdoctor --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>console.log(JSON.parse(s).diagnostics.filter(d=>d.ruleId.endsWith("ng-content-in-control-flow")&&d.file.includes("ui-kit-v2/src/lib")).length))'` → = 0
    2. Список динамического выбора берёт кнопку добавления входом, поле и деталь-строка держат своё содержимое в DOM под скелетоном
       Check: `pnpm exec nx test @rt-tools/ui-kit-v2 --skip-nx-cache --testNamePattern='SC-UKV-17(30|41)' --output-style=static 2>&1 | grep 'Tests:' | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' || echo 0` → >= 2
    3. Подтверждённое действие пункта меню доходит до потребителя после закрытия меню; пункт вне rtMenuContent предупреждает
       Check: `pnpm exec nx test @rt-tools/ui-kit-v2 --skip-nx-cache --testNamePattern='SC-UKV-17(33|46)' --output-style=static 2>&1 | grep 'Tests:' | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' || echo 0` → >= 2
    4. Тесты слотов по умолчанию зелёные: SC-UKV-1724…1733, 1739…1744, 1746
       Check: `pnpm exec nx test @rt-tools/ui-kit-v2 --skip-nx-cache --testNamePattern='SC-UKV-17(2[4-9]|3[0-3]|39|4[0-4]|46)' --output-style=static 2>&1 | grep 'Tests:' | grep -oE '[0-9]+ passed' | grep -oE '[0-9]+' || echo 0` → >= 17
- **Verified by:** тесты SC-UKV-1724…1733, 1739…1744, 1746 зелёные.

### 4. Потребители: cms, админка, витрина, пример входа

- **Steps:**
    1. Список cms и список админки передают слоты шаблонами
       Check: `pnpm run -s ngdoctor --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>console.log(JSON.parse(s).diagnostics.filter(d=>d.ruleId.endsWith("ng-content-in-control-flow")).length))'` → = 0
    2. Разметка дерева не держит ни одного места старой формы именованного слота
       Check: `git grep -nP "<(?!ng-template|ng-content)[a-z][\w-]*[^>]*\b(rtFieldHint|rtExpansionPanelActions|rtRailLogo|rtRailPage|rtCompactLeft|rtCompactCenter|rtCompactRight|rtChatHeaderActions|rtChatComposerBar|rtChatComposerTools|rtChatFooter|rtSideMenuSubItemAction|rtCmsListToolbarLeft|rtCmsListToolbarRight|appListToolbarLeft|appListToolbarRight)\b" -- '*.html' '*.ts' '*.mdx' ':!docs' ':!*.spec.ts' ':!projects/agent-kit' | grep -v "ngProjectAs\|select=" | wc -l | tr -d ' '` → = 0
    3. Каждое место дерева со слотом по умолчанию и колокольчик шапки страницы передают содержимое шаблоном
       Check: `node -e 'const {execSync}=require("child_process");const fs=require("fs");const m={"rt-menu":"rtMenuContent","rt-icon-button":"rtIconButtonContent","rt-breadcrumbs":"rtBreadcrumbsContent","rt-table-sort-header":"rtTableSortHeaderContent","rt-aside":"rtAsideContent","rt-skeleton-wrapper":"rtSkeletonWrapperContent","rt-dynamic-list":"rtDynamicListContent","rt-money-row":"rtMoneyRowContent","rt-info-item":"rtInfoItemContent","admin-list-page":"adminListPageContent"};const files=execSync("git ls-files \"*.html\" \"*.ts\" \"*.mdx\"").toString().trim().split("\n").filter(f=>!/\.spec\.ts$|^docs|agent-kit/.test(f));let bad=0;for(const f of files){const s=fs.readFileSync(f,"utf8");for(const [t,n] of Object.entries(m)){const re=new RegExp("<"+t+"\\b[^>]*>([\\s\\S]*?)</"+t+">","g");let x;while((x=re.exec(s)))if(x[1].trim()&&!x[1].includes(n))bad++}const ph=/<rt-page-header\b[^>]*>([\s\S]*?)<\/rt-page-header>/g;let y;while((y=ph.exec(s)))if(/<(?!ng-template)[a-z][\w-]*[^>]*\brtHeaderBell\b/.test(y[1]))bad++}console.log(bad)'` → = 0
    4. Ни одного ng-content под условием или в шаблоне в шаблонах кита, cms, админки и витрины, ветки @else тоже
       Check: `node --input-type=module -e 'import {parseTemplate} from "@angular/compiler";import {execSync} from "node:child_process";import {readFileSync} from "node:fs";let n=0;const w=(ns,i)=>{for(const x of ns??[]){const k=x.constructor.name;if(k==="Content"&&i)n++;const d=i||/IfBlockBranch|ForLoopBlock|SwitchBlockCase|Template|DeferredBlock/.test(k);w(x.children,d);if(x.branches)w(x.branches,d);if(x.cases)w(x.cases,d);if(x.empty)w([x.empty],d)}};for(const f of execSync("git ls-files \"projects/*.html\" \"libs/*.html\" \"apps/*.html\"").toString().trim().split("\n"))w(parseTemplate(readFileSync(f,"utf8"),f).nodes,false);console.log(n)'` → = 0
    5. Части списка cms и списка админки слиты в их спеки: SC-CMS-81 и сценарий списка админки о шаблоне содержимого
       Check: `node -e 'const fs=require("fs");const c=/^### SC-CMS-81 /m.test(fs.readFileSync("docs/specs/cms/angular/scenarios.md","utf8"));const a=fs.readFileSync("docs/specs/message-bus/admin-list-page/scenarios.md","utf8").includes("adminListPageContent");console.log(c&&a?0:1)'` → = 0
    6. Коммит правки API несёт сноску о ломающем изменении: каждый слот в старой и новой форме
       Check: `git log origin/RT-3476-angular-doctor..HEAD --format=%B | grep -c '^BREAKING CHANGE' || true` → >= 1
- **Verified by:** Angular Doctor не называет `ng-content-in-control-flow`; сканер шаблонов — 0; разметка дерева без старой формы; сверка снимков витрины и сквозные наборы админки и примера входа зелёные в наборе перед push.

### 5. Порог

- **Steps:**
    1. Находок трёх правил в дереве нет
       Check: `pnpm run -s ngdoctor --json 2>/dev/null | node -e 'let s="";process.stdin.on("data",c=>s+=c).on("end",()=>console.log(JSON.parse(s).diagnostics.filter(d=>/ng-content-in-control-flow|effect-writes-state|prefer-control-flow/.test(d.ruleId)).length))'` → = 0
    2. Порог записан на результате задачи, ни одно правило в нём не выросло против порога ветки эпика
       Check: `node -e 'const {execSync}=require("child_process");const a=JSON.parse(execSync("git show fd3b87c4e:tools/ngdoctor-threshold.json")).rules;const b=JSON.parse(require("fs").readFileSync("tools/ngdoctor-threshold.json")).rules;const grew=Object.keys(b).filter(k=>(b[k]??0)>(a[k]??0));const three=["ng-content-in-control-flow","effect-writes-state","prefer-control-flow"].filter(r=>b["angular-doctor/"+r]);console.log(grew.length+three.length)'` → = 0
    3. Черновик договорённости слит в спеки кита, живые тексты SC-UKV-519, 521, 821, 172, 1165 приведены к нему
       Check: `test -d docs/specs/ui-kit-v2/proposed/template-slots && echo 1 || echo 0` → = 0
- **Verified by:** `pnpm run check:ngdoctor` равен порогу.

## Чего работа не делает

- Выпуск кита и cms: следующий выпуск — ломающий minor, решение о нём владельца.
- Правку сборки графов кода, которая оставляет graph.html: риск назван в плане эпика.
