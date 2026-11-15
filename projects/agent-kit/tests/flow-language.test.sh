#!/usr/bin/env bash
# Сценарии языка описания task flow: парсер, модель, условия, данные описания.
#
# Набор судит механику языка на фикстурах, а не описание пакета: иначе любая правка `flow.js`
# краснела бы здесь, хотя язык не менялся. Каждая фикстура — свой файл во временном каталоге.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "язык описания task flow"

FL_DIR="$(mktemp -d)"

# Пишет фикстуру описания и печатает её путь.
fl_file() {
    local name="$1"
    cat > "$FL_DIR/$name.js"
    printf '%s' "$FL_DIR/$name.js"
}

# Разбор фикстуры: JSON модели или строка отказа.
fl_parse() {
    node "$CHECKS/flow-syntax.mjs" "$1" 2>&1
}

# Код выхода разбора.
fl_code() {
    node "$CHECKS/flow-syntax.mjs" "$1" >/dev/null 2>&1
    printf '%s' $?
}

# Отказ разбора называет то, что задано словом: печатает «да» или вывод парсера.
fl_refused_with() {
    local out
    out="$(fl_parse "$1")"
    case "$out" in
        "flow syntax: "*"$2"*) printf 'да' ;;
        *) printf '%s' "$out" ;;
    esac
}

# --- SC-AK-1471 — литералы, ссылки, массивы и объекты разбираются в модель --------------------
f="$(fl_file values <<'FLOW'
({
  words: { stop: ['стоп', "стой"], count: 3, ratio: -0.5, on: true, off: false, none: null },
  state: { taken: { exit: measure.plan.approved, list: [measure.a, 'b', 2] } },
});
FLOW
)"
report "syntax: SC-AK-1471 — литералы, ссылки, массивы и объекты" "$(fl_parse "$f")" \
    '{"words":{"stop":["стоп","стой"],"count":3,"ratio":-0.5,"on":true,"off":false,"none":null},"state":{"taken":{"exit":{"ref":"measure.plan.approved"},"list":[{"ref":"measure.a"},"b",2]}}}'

# --- SC-AK-1472 — функция в описании отказана --------------------------------------------------
f="$(fl_file function <<'FLOW'
({ measure: { x: function () { return 1; } } });
FLOW
)"
report "syntax: SC-AK-1472 — функция отказана" "$(fl_refused_with "$f" 'executes nothing')" 'да'
f="$(fl_file arrow <<'FLOW'
({ measure: { x: () => 1 } });
FLOW
)"
report "syntax: SC-AK-1472 — стрелочная функция отказана" "$(fl_refused_with "$f" 'arrow function')" 'да'

# --- SC-AK-1473 — произвольное выражение отказано ---------------------------------------------
f="$(fl_file expression <<'FLOW'
({ words: { count: 1 + 2 } });
FLOW
)"
report "syntax: SC-AK-1473 — выражение отказано" "$(fl_refused_with "$f" 'an expression is not allowed')" 'да'
f="$(fl_file logical <<'FLOW'
({ state: { a: { exit: measure.a || measure.b } } });
FLOW
)"
report "syntax: SC-AK-1473 — логическое выражение отказано" "$(fl_refused_with "$f" 'an expression is not allowed')" 'да'

# --- SC-AK-1474 — повтор ключа отказан ---------------------------------------------------------
f="$(fl_file repeat <<'FLOW'
({ words: { stop: ['стоп'], stop: ['хватит'] } });
FLOW
)"
report "syntax: SC-AK-1474 — повтор ключа отказан" "$(fl_refused_with "$f" 'the key «stop» repeats')" 'да'

# --- SC-AK-1475 — хвост после `);` отказан ----------------------------------------------------
f="$(fl_file tail <<'FLOW'
({ words: { stop: ['стоп'] } });
words.stop;
FLOW
)"
report "syntax: SC-AK-1475 — хвост после «);» отказан" "$(fl_refused_with "$f" 'nothing may follow')" 'да'

# --- SC-AK-1476 — комментарии и точки в строке — данные, не исполнение -------------------------
f="$(fl_file comments <<'FLOW'
/* block comment */
({
  // a line comment
  words: { a: 'x // y.z', b: "/* c */", c: 'measure.plan' },
}); // a comment after the end
FLOW
)"
report "syntax: SC-AK-1476 — комментарии и точки в строке" "$(fl_parse "$f")" \
    '{"words":{"a":"x // y.z","b":"/* c */","c":"measure.plan"}}'

# --- SC-AK-1477 — вызов ссылки с литералами и ссылками разбирается ----------------------------
f="$(fl_file call <<'FLOW'
({ state: { a: { exit: measure.count(1, 'b', source.git, [true]) } } });
FLOW
)"
report "syntax: SC-AK-1477 — вызов ссылки разбирается" "$(fl_parse "$f")" \
    '{"state":{"a":{"exit":{"call":"measure.count","args":[1,"b",{"ref":"source.git"},[true]]}}}}'

# --- SC-AK-1478 — ссылка на неизвестную секцию отказана ---------------------------------------
f="$(fl_file section <<'FLOW'
({ state: { a: { exit: process.env } } });
FLOW
)"
report "syntax: SC-AK-1478 — неизвестная секция отказана" "$(fl_refused_with "$f" '«process» is not a section')" 'да'
f="$(fl_file require <<'FLOW'
({ state: { a: { exit: require('fs') } } });
FLOW
)"
report "syntax: SC-AK-1478 — require отказан" "$(fl_refused_with "$f" '«require» is not allowed')" 'да'

# --- SC-AK-1529 — шапка раскладки строкой-комментарием пропускается ----------------------------
f="$(fl_file header <<'FLOW'
// rt-kit v0.38.0 · task-flow/flow.js · 0123456789ab · правится надстройкой, не здесь
({ words: { stop: ['стоп'] } });
FLOW
)"
report "syntax: SC-AK-1529 — шапка раскладки пропускается" "$(fl_parse "$f")" '{"words":{"stop":["стоп"]}}'

# --- модель: фикстура дерева описания ----------------------------------------------------------

# Свежее дерево описания: два источника, измеритель с соседом, два состояния. Печатает каталог.
fl_base() {
    local dir
    dir="$(mktemp -d "$FL_DIR/tree.XXXXXX")"
    mkdir -p "$dir/source" "$dir/measure"
    printf 'export function open() {\n    return {};\n}\n' > "$dir/source/git.mjs"
    printf 'export const open = () => ({});\n' > "$dir/source/marks.mjs"
    cat > "$dir/measure/plan.mjs" <<'JS'
import { helper } from './util.mjs';

export function approved({ git, marks }) {
    return () => helper(git, marks);
}
JS
    printf 'export function helper() {\n    return true;\n}\n' > "$dir/measure/util.mjs"
    cat > "$dir/flow.js" <<'FLOW'
({
  source: { git: { open: {} }, marks: { open: {} } },
  measure: { plan: { approved: { git: source.git, marks: source.marks } } },
  state: {
    taken: { title: 'задача-взята', exit: measure.plan.approved },
    planned: { title: 'замысел-записан', exit: measure.plan.approved },
  },
  release: {},
  words: {},
  expect: {},
});
FLOW
    printf '%s' "$dir"
}

fl_model() {
    node "$CHECKS/flow-model.mjs" "$1/flow.js" 2>&1
}

# Отказ модели называет то, что задано словом: печатает «да» или вывод модели.
fl_model_refused_with() {
    local out
    out="$(fl_model "$1")"
    case "$out" in
        "flow model: "*"$2"*) printf 'да' ;;
        *) printf '%s' "$out" ;;
    esac
}

# Поле модели по выражению над разобранным JSON.
fl_model_field() {
    fl_model "$1" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const m=JSON.parse(s);console.log($2)})" 2>&1
}

# --- SC-AK-1479 — секций ровно шесть, лишняя отказана ------------------------------------------
d="$(fl_base)"
report "model: SC-AK-1479 — шесть секций собираются" "$(fl_model_field "$d" "m.states.length")" '2'
d="$(fl_base)"
sed -i.bak 's/^  expect: {},$/  expect: {},\n  extra: {},/' "$d/flow.js"
report "model: SC-AK-1479 — лишняя секция отказана" "$(fl_model_refused_with "$d" '«extra» is not one of them')" 'да'
d="$(fl_base)"
sed -i.bak '/^  expect: {},$/d' "$d/flow.js"
report "model: SC-AK-1479 — недостающая секция отказана" "$(fl_model_refused_with "$d" '«expect» is missing')" 'да'

# --- SC-AK-1480 — имя вне [A-Za-z][A-Za-z0-9]* отказано ----------------------------------------
d="$(fl_base)"
sed -i.bak "s/^  words: {},$/  words: { 'stop-words': [] },/" "$d/flow.js"
report "model: SC-AK-1480 — имя с дефисом отказано" "$(fl_model_refused_with "$d" '«stop-words» is outside')" 'да'

# --- SC-AK-1481 — `measure.x` — файл `measure/x.mjs`, capability — экспорт ----------------------
d="$(fl_base)"
report "model: SC-AK-1481 — измеритель — файл, capability — экспорт" \
    "$(fl_model_field "$d" "m.measures[0].file + ' ' + Object.keys(m.measures[0].caps).join(',')")" 'measure/plan.mjs approved'

# --- SC-AK-1482 — порты не равны сигнатуре — отказ с именем компонента -------------------------
d="$(fl_base)"
sed -i.bak 's/approved: { git: source.git, marks: source.marks }/approved: { git: source.git }/' "$d/flow.js"
report "model: SC-AK-1482 — порты не равны сигнатуре" "$(fl_model_refused_with "$d" 'measure.plan.approved: the ports {git} are not the signature')" 'да'

# --- SC-AK-1483 — сигнатура со значением по умолчанию или переименованием отказана -------------
d="$(fl_base)"
sed -i.bak 's/approved({ git, marks })/approved({ git = 1, marks })/' "$d/measure/plan.mjs"
report "model: SC-AK-1483 — значение по умолчанию отказано" "$(fl_model_refused_with "$d" 'carries a default, a renaming or a pattern')" 'да'
d="$(fl_base)"
sed -i.bak 's/approved({ git, marks })/approved({ git: repo, marks })/' "$d/measure/plan.mjs"
report "model: SC-AK-1483 — переименование отказано" "$(fl_model_refused_with "$d" 'carries a default, a renaming or a pattern')" 'да'

# --- SC-AK-1484 — отсутствующая capability — явная ошибка, без подмены -------------------------
d="$(fl_base)"
sed -i.bak 's/plan: { approved:/plan: { rejected:/; s/measure.plan.approved/measure.plan.rejected/g' "$d/flow.js"
report "model: SC-AK-1484 — отсутствующая capability" "$(fl_model_refused_with "$d" 'exports no capability «rejected»')" 'да'

# --- SC-AK-1485 — цикл ссылок отказан ----------------------------------------------------------
d="$(fl_base)"
printf 'export function x({ b }) {\n    return b;\n}\n' > "$d/measure/a.mjs"
printf 'export function x({ a }) {\n    return a;\n}\n' > "$d/measure/b.mjs"
sed -i.bak 's/^  measure: { plan:/  measure: { a: { x: { b: measure.b } }, b: { x: { a: measure.a } }, plan:/' "$d/flow.js"
report "model: SC-AK-1485 — цикл ссылок отказан" "$(fl_model_refused_with "$d" 'the references form a cycle')" 'да'

# --- SC-AK-1486 — порядок состояний — порядок описания -----------------------------------------
d="$(fl_base)"
report "model: SC-AK-1486 — порядок состояний" "$(fl_model_field "$d" "m.states.map((s) => s.title).join(' ')")" 'задача-взята замысел-записан'

# --- SC-AK-1487 — повтор `title` состояния отказан ---------------------------------------------
d="$(fl_base)"
sed -i.bak "s/title: 'замысел-записан'/title: 'задача-взята'/" "$d/flow.js"
report "model: SC-AK-1487 — повтор title отказан" "$(fl_model_refused_with "$d" 'the title «задача-взята» repeats')" 'да'

# --- SC-AK-1488 — измеритель импортирует путь не с `./` — отказан -------------------------------
d="$(fl_base)"
sed -i.bak "s#from './util.mjs'#from 'node:fs'#" "$d/measure/plan.mjs"
report "model: SC-AK-1488 — импорт node:fs отказан" "$(fl_model_refused_with "$d" 'the import «node:fs» leaves the directory')" 'да'
d="$(fl_base)"
sed -i.bak "s#from './util.mjs'#from '../source/git.mjs'#" "$d/measure/plan.mjs"
report "model: SC-AK-1488 — импорт из соседнего каталога отказан" "$(fl_model_refused_with "$d" 'leaves the directory')" 'да'

# --- SC-AK-1507 — `import()` в измерителе отказан ----------------------------------------------
d="$(fl_base)"
printf 'export const later = () => import("./util.mjs");\n' >> "$d/measure/plan.mjs"
report "model: SC-AK-1507 — import() отказан" "$(fl_model_refused_with "$d" '«import()» is not allowed')" 'да'

# --- SC-AK-1508 — обращение к `process` в измерителе отказано -----------------------------------
d="$(fl_base)"
printf 'export const env = () => process.env.HOME;\n' >> "$d/measure/plan.mjs"
report "model: SC-AK-1508 — process отказан" "$(fl_model_refused_with "$d" '«process» is not allowed')" 'да'

# --- SC-AK-1509 — `createRequire` и `require` в измерителе отказаны -----------------------------
d="$(fl_base)"
printf 'export const load = (m) => createRequire(m);\n' >> "$d/measure/plan.mjs"
report "model: SC-AK-1509 — createRequire отказан" "$(fl_model_refused_with "$d" '«createRequire» is not allowed')" 'да'
d="$(fl_base)"
printf 'export const load = () => require("fs");\n' >> "$d/measure/plan.mjs"
report "model: SC-AK-1509 — require отказан" "$(fl_model_refused_with "$d" '«require» is not allowed')" 'да'

# --- SC-AK-1533 — сосед измерителя в `measure/`, который импортирует `node:fs`, отказан ----------
d="$(fl_base)"
printf "import { readFileSync } from 'node:fs';\n" | cat - "$d/measure/util.mjs" > "$d/measure/util.tmp" && mv "$d/measure/util.tmp" "$d/measure/util.mjs"
report "model: SC-AK-1533 — сосед с node:fs отказан" "$(fl_model_refused_with "$d" 'measure/util.mjs: the import «node:fs»')" 'да'

# --- SC-AK-1534 — `globalThis` в любом файле `measure/` отказан ---------------------------------
d="$(fl_base)"
printf 'export const p = () => globalThis["pro" + "cess"];\n' >> "$d/measure/util.mjs"
report "model: SC-AK-1534 — globalThis отказан" "$(fl_model_refused_with "$d" '«globalThis» is not allowed')" 'да'

rm -rf "$FL_DIR"
suite_result "язык описания task flow"
