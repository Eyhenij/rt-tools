# План

**Task:** RT-3480 · **Branch:** RT-3480-ngdoctor-host-bindings
**Behaviour:** unchanged — слово владельца 23.11.2026 «Подтверждаю, вид не меняется»: привязки к
хосту, запросы и внедрение меняют форму записи, а классы, атрибуты, события, входы и выходы
остаются.

После написания этот файл не правится. Пересмотр этапа идёт в `progress.md` решением по ходу.

## Точки

- **A:** скан на вершине RT-3508 (23.11.2026) — 39 находок семи правил задачи: `prefer-host-bindings`
  23, `host-via-element-ref` 1, `prefer-signal-query` 3, `lifecycle-interface` 3, `prefer-inject`
  3, `input-dom-name` 2, `prefer-class-binding` 4.
- **Эта задача доводит до:** Angular Doctor не называет ни одного из семи правил; порог
  `check:ngdoctor` не держит их.
- **Признак:** `pnpm run check:ngdoctor` — «equal to the threshold», и в пороге нет семи правил.
- **Веха G эпика:** ни одной находки, кроме одной `security-bypass` превью cms.
- **Metric:** число находок семи правил — 39 → 0.

## След задачи

| Что   | Где                                                                                             |
| ----- | ----------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/`, `docs/specs/core/`                                                     |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/code-structure.md`              |
| Rules | `.claude/skills/angular-patterns/`, `.claude/skills/component-structure/`                       |
| Code  | `projects/core/src/lib/`, `projects/ui-kit-v2/src/lib/components/`, `tools/eslint-rules/rules/` |
| Kit   | десять файлов кита из `approvals.md` — без смены вида, слово «Без вида» владельца               |

## Как идёт работа

Ветка стоит на ветке RT-3508 (#3511), пока та ждёт слияния: эпик ведёт задачи стопкой.

- Привязки к хосту переходят в `host` декоратора с теми же именами классов, атрибутов и событий.
  Открытые геттеры `hostModifierClasses`, `hostStackStyles` тостов и `fontVariationSettings` значка
  остаются открытыми геттерами того же типа. Атрибут `rt-data-table-stop-row-click` ставится, как и
  сейчас, только в браузере: выражение в `host` спрашивает платформу.
- Запросы таблицы — на `viewChild()`: проба до плана показала, что сигнальный запрос заполнен уже в
  `ngOnInit` (`grill.md`). Пометки `native-ok` у запросов и абзац `CONTEXT.md` таблицы о статическом
  запросе переписываются.
- Внедрение — на `inject()` с теми же открытыми полями директив БЭМ; `rtElem` берётся с
  `optional: true`. Смена сигнатуры конструкторов `BlockDirective` и `ElemDirective` названа в PR —
  слово владельца «Менять, строка в PR (Recommended)».
- Восемь мест, где инструмент ошибается, переписываются по решению эпика «Подогнать код»: константа
  значения `keyExp` по умолчанию, текст правила линтера без буквального `[ngClass]` при том же
  смысле, фабрика двойника, комментарий `story-states.ts` по смыслу.

## Что считается сделанным

- Angular Doctor не называет `prefer-host-bindings`, `host-via-element-ref`, `prefer-signal-query`,
  `lifecycle-interface`, `prefer-inject`, `input-dom-name` и `prefer-class-binding`.
- Порог `check:ngdoctor` записан на результате, не держит этих правил, и ни одно другое правило в
  нём не выросло против порога RT-3508; проверка спек зелёная.
- Классы, атрибуты, события хоста, входы и выходы кита и core прежние: тесты затронутых проектов
  зелёные, кадры витрины совпадают с эталонами, эталоны не переснимаются.

## Этапы

### 1. Привязки, запросы, внедрение

- **Steps:**
    1. Привязки к хосту core и кита стоят в host декоратора, атрибут части строки таблицы данных — тоже, только в браузере
       Check: `sh -c 'pnpm run -s ngdoctor --json 2>/dev/null | node -e "let s=\"\";process.stdin.on(\"data\",d=>s+=d).on(\"end\",()=>{const r=[\"prefer-host-bindings\",\"host-via-element-ref\"];console.log(JSON.parse(s).diagnostics.filter(d=>r.includes(d.ruleId.replace(\"angular-doctor/\",\"\"))).length)})"'` → = 0
    2. Таблица берёт узлы сигнальными запросами, хуки таблицы и страницы брони объявлены интерфейсами
       Check: `sh -c 'pnpm run -s ngdoctor --json 2>/dev/null | node -e "let s=\"\";process.stdin.on(\"data\",d=>s+=d).on(\"end\",()=>{const r=[\"prefer-signal-query\",\"lifecycle-interface\"];console.log(JSON.parse(s).diagnostics.filter(d=>r.includes(d.ruleId.replace(\"angular-doctor/\",\"\"))).length)})"'` → = 0
    3. Директивы БЭМ core внедряют зависимости через inject, двойник Keycloak собирается без параметра конструктора
       Check: `sh -c 'pnpm run -s ngdoctor --json 2>/dev/null | node -e "let s=\"\";process.stdin.on(\"data\",d=>s+=d).on(\"end\",()=>{const r=[\"prefer-inject\"];console.log(JSON.parse(s).diagnostics.filter(d=>r.includes(d.ruleId.replace(\"angular-doctor/\",\"\"))).length)})"'` → = 0
    4. Значение keyExp по умолчанию и текст правила линтера не читаются инструментом как имя входа и привязка класса
       Check: `sh -c 'pnpm run -s ngdoctor --json 2>/dev/null | node -e "let s=\"\";process.stdin.on(\"data\",d=>s+=d).on(\"end\",()=>{const r=[\"input-dom-name\",\"prefer-class-binding\"];console.log(JSON.parse(s).diagnostics.filter(d=>r.includes(d.ruleId.replace(\"angular-doctor/\",\"\"))).length)})"'` → = 0
    5. Порог Angular Doctor равен результату, не держит семи правил задачи и не вырос ни в одном другом правиле; проверка спек зелёная; эталоны витрины те же; тесты core, кита, auth-import и правил линтера зелёные
       Check: `sh -c 'pnpm run -s check:ngdoctor >/dev/null 2>&1 && node -e "const a=JSON.parse(require(\"child_process\").execSync(\"git show origin/RT-3508-epic-main-merge:tools/ngdoctor-threshold.json\")).rules,t=require(\"./tools/ngdoctor-threshold.json\").rules,gone=[\"prefer-host-bindings\",\"host-via-element-ref\",\"prefer-signal-query\",\"lifecycle-interface\",\"prefer-inject\",\"input-dom-name\",\"prefer-class-binding\"].map(r=>\"angular-doctor/\"+r);process.exit(gone.some(r=>t[r])||Object.keys(t).some(r=>(t[r]||0)>(a[r]||0))?1:0)" && node tools/check-specs.mjs >/dev/null 2>&1 && git diff --quiet origin/RT-3508-epic-main-merge HEAD -- projects/ui-kit-v2/.storybook/__snapshots__ && pnpm exec nx run-many -t test -p @rt-tools/core @rt-tools/ui-kit-v2 @rt-tools/auth-import eslint-rules --skip-nx-cache >/dev/null 2>&1; echo $?'` → = 0
- **Readiness sign:** Angular Doctor не называет семи правил задачи, порог их не держит.
- **Verified by:** `pnpm run check:ngdoctor` — «equal to the threshold»; тесты core, кита,
  auth-import и правил линтера; сверка витрины кита — кадры совпали с эталонами, эталоны не
  переснимались; набор перед отправкой.

## Что эта работа не делает

- Находки других правил Angular Doctor — задачи эпика RT-3481…3490 по их правилам.
- Выпуск кита и core: правки входят в выпуск по решению владельца.
