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
    fl_model "$1" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const m=JSON.parse(s);console.log(String($2))})" 2>&1
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

# --- Условия: `all`, `any`, `not` над измерителями ------------------------------------------------

# Дерево с тремя возможностями измерителя `owner`; выход `taken` и случай отпуска `stop` — из
# аргументов: $1 — выход, $2 — when.
fl_cond() {
    local dir
    dir="$(fl_base)"
    printf 'export const a = () => () => true;\nexport const b = () => () => true;\nexport const c = () => () => true;\n' > "$dir/measure/owner.mjs"
    cat > "$dir/flow.js" <<FLOW
({
  source: { git: { open: {} }, marks: { open: {} } },
  measure: { plan: { approved: { git: source.git, marks: source.marks } }, owner: { a: {}, b: {}, c: {} } },
  state: { taken: { title: 'задача-взята', exit: $1 } },
  release: { stop: { when: ${2:-measure.owner.a}, order: 1 } },
  words: {},
  expect: {},
});
FLOW
    printf '%s' "$dir"
}

# Значение выхода `taken` при результатах измерителей: $1 — дерево, $2 — JSON результатов.
fl_exit() {
    printf '%s' "$2" > "$1/results.json"
    node "$CHECKS/flow-model.mjs" "$1/flow.js" --exit taken "$1/results.json" 2>&1
}

# --- SC-AK-1510 — `all` выполнено, когда выполнены все части ------------------------------------
d="$(fl_cond '{ all: [measure.owner.a, measure.owner.b] }')"
report "cond: SC-AK-1510 — all при всех частях" "$(fl_exit "$d" '{"measure.owner.a":true,"measure.owner.b":true}')" 'true'
report "cond: SC-AK-1510 — all при одной ложной части" "$(fl_exit "$d" '{"measure.owner.a":true,"measure.owner.b":false}')" 'false'

# --- SC-AK-1511 — `any` выполнено, когда выполнена одна часть -----------------------------------
d="$(fl_cond '{ any: [measure.owner.a, measure.owner.b] }')"
report "cond: SC-AK-1511 — any при одной части" "$(fl_exit "$d" '{"measure.owner.a":false,"measure.owner.b":true}')" 'true'
report "cond: SC-AK-1511 — any без частей" "$(fl_exit "$d" '{"measure.owner.a":false,"measure.owner.b":false}')" 'false'

# --- SC-AK-1512 — `not` обращает измеритель -----------------------------------------------------
d="$(fl_cond '{ not: measure.owner.a }')"
report "cond: SC-AK-1512 — not над ложным" "$(fl_exit "$d" '{"measure.owner.a":false}')" 'true'
report "cond: SC-AK-1512 — not над истинным" "$(fl_exit "$d" '{"measure.owner.a":true}')" 'false'

# --- SC-AK-1513 — вложенные условия разбираются и меряются --------------------------------------
d="$(fl_cond '{ all: [measure.owner.a, { any: [measure.owner.b, { not: measure.owner.c }] }] }')"
report "cond: SC-AK-1513 — вложенное через not" "$(fl_exit "$d" '{"measure.owner.a":true,"measure.owner.b":false,"measure.owner.c":false}')" 'true'
report "cond: SC-AK-1513 — вложенное ложно" "$(fl_exit "$d" '{"measure.owner.a":true,"measure.owner.b":false,"measure.owner.c":true}')" 'false'
report "cond: SC-AK-1513 — в модели вложенность сохранена" \
    "$(fl_model_field "$d" 'JSON.stringify(m.states[0].exit)')" \
    '{"all":[{"ref":"measure.owner.a"},{"any":[{"ref":"measure.owner.b"},{"not":{"ref":"measure.owner.c"}}]}]}'

# --- SC-AK-1514 — условие над неизвестным измерителем отказано ----------------------------------
d="$(fl_cond '{ all: [measure.owner.a, measure.owner.nothing] }')"
report "cond: SC-AK-1514 — неизвестная возможность в выходе" \
    "$(fl_model_refused_with "$d" 'state.taken.exit.all[1]: «measure.owner.nothing» names no measurer')" 'да'
d="$(fl_cond 'measure.owner.a' '{ not: measure.judge.said }')"
report "cond: SC-AK-1514 — неизвестный измеритель в случае отпуска" \
    "$(fl_model_refused_with "$d" 'release.stop.when.not: «measure.judge.said» names no measurer')" 'да'
d="$(fl_cond '{ all: [measure.owner.a], any: [measure.owner.b] }')"
report "cond: SC-AK-1514 — два ключа в одном условии" \
    "$(fl_model_refused_with "$d" 'exactly one key of all, any, not')" 'да'
d="$(fl_cond '{ all: [source.git] }')"
report "cond: SC-AK-1514 — источник вместо измерителя" \
    "$(fl_model_refused_with "$d" '«source.git» is not a measurer capability')" 'да'

# --- SC-AK-1515 — выход состояния, собранный из условия без JS, меряется движком -----------------
d="$(fl_cond '{ any: [measure.plan.approved, { not: measure.owner.a }] }')"
report "cond: SC-AK-1515 — выход из условия меряется по результатам" \
    "$(fl_exit "$d" '{"measure.plan.approved":false,"measure.owner.a":false}')" 'true'
report "cond: SC-AK-1515 — отсутствующий результат не считается выполненным" \
    "$(fl_exit "$d" '{"measure.owner.a":true}')" 'false'

# --- Данные описания: слова, формы ожидаемого, порядок случаев отпуска ---------------------------

# Дерево с секциями words, expect и release из аргументов: $1 — words, $2 — expect, $3 — release.
fl_data() {
    local dir words expect release
    dir="$(fl_base)"
    words="${1:-"{}"}"
    expect="${2:-"{}"}"
    release="${3:-"{}"}"
    cat > "$dir/flow.js" <<FLOW
({
  source: { git: { open: {} }, marks: { open: {} } },
  measure: { plan: { approved: { git: source.git, marks: source.marks } } },
  state: { taken: { title: 'задача-взята', exit: measure.plan.approved } },
  release: $release,
  words: $words,
  expect: $expect,
});
FLOW
    printf '%s' "$dir"
}

# Вызов читателя данных над моделью дерева: $1 — дерево, $2 — выражение над `m` и модулем `d`.
fl_data_call() {
    node --input-type=module -e "
import { buildModel } from '$CHECKS/flow-model.mjs';
import * as d from '$CHECKS/flow-data.mjs';
const m = buildModel('$1/flow.js');
console.log(JSON.stringify($2));
" 2>&1
}

# Формы ожидаемого шага плана — текст описания, обратные косые удвоены для строки описания.
FORMS="$(cat <<'JS'
{ exit: { pattern: '^exit (\\d+)$', compare: 'exit' }, line: { pattern: '^`(.*)`$', compare: 'line' }, regex: { pattern: '^/(.*)/$', compare: 'regex' }, number: { pattern: '^(=|>=|<=) ?(-?\\d+)$', compare: 'number' } }
JS
)"
WRITE_WORDS="{ write: ['git commit', 'git push'] }"

# --- SC-AK-1516 — исключения слов остановки берутся из `words` ----------------------------------
d="$(fl_data "{ stop: ['стоп', 'хватит'], stopExcept: ['не стоп'] }")"
report "data: SC-AK-1516 — слово остановки из words" "$(fl_data_call "$d" "d.saysStop('Стоп, дальше не надо', m.words)")" 'true'
report "data: SC-AK-1516 — исключение из words снимает остановку" "$(fl_data_call "$d" "d.saysStop('не стоп, работай', m.words)")" 'false'
report "data: SC-AK-1516 — слово внутри другого слова не считается" "$(fl_data_call "$d" "d.saysStop('стопка бумаги', m.words)")" 'false'
d="$(fl_data "{ stop: ['стоп'], stopExcept: ['не стоп'] }")"
report "data: SC-AK-1516 — другое описание — другие слова" "$(fl_data_call "$d" "d.saysStop('хватит', m.words)")" 'false'
d="$(fl_data "{ stopExcept: 'не стоп' }")"
report "data: SC-AK-1516 — исключения не списком отказаны" "$(fl_model_refused_with "$d" 'words.stopExcept: a list of non-empty strings')" 'да'
d="$(fl_data "{ stopWords: ['стоп'] }")"
report "data: SC-AK-1516 — чужой ключ words отказан" "$(fl_model_refused_with "$d" 'words.stopWords: not a word list')" 'да'

# --- SC-AK-1517 — команды записи случая 3 берутся из `words` ------------------------------------
d="$(fl_data "$WRITE_WORDS")"
report "data: SC-AK-1517 — команда записи из words" "$(fl_data_call "$d" "d.isWriteCommand('git add -A && git commit -q -F msg', m.words)")" 'true'
report "data: SC-AK-1517 — чтение не команда записи" "$(fl_data_call "$d" "d.isWriteCommand('git log --oneline | head', m.words)")" 'false'
report "data: SC-AK-1517 — префикс другого слова не считается" "$(fl_data_call "$d" "d.isWriteCommand('git pushd', m.words)")" 'false'
d="$(fl_data "{ write: ['git status', ''] }")"
report "data: SC-AK-1517 — пустая команда отказана" "$(fl_model_refused_with "$d" 'words.write: a list of non-empty strings')" 'да'

# --- SC-AK-1518 — варианты меню отказа берутся из `words` ---------------------------------------
d="$(fl_data "{ menu: ['отложить RT-N', 'сделаю сам', 'стоп'], nudge: '(продолжай|что дальше)' }")"
report "data: SC-AK-1518 — меню из words" "$(fl_model_field "$d" 'JSON.stringify(m.words.menu)')" '["отложить RT-N","сделаю сам","стоп"]'
report "data: SC-AK-1518 — образец подталкивания из words" "$(fl_data_call "$d" "new RegExp(m.words.nudge, 'iu').test('Что дальше?')")" 'true'
d="$(fl_data "{ menu: ['стоп', 3] }")"
report "data: SC-AK-1518 — вариант меню не строка отказан" "$(fl_model_refused_with "$d" 'words.menu: a list of non-empty strings')" 'да'
d="$(fl_data "{ nudge: '(продолжай' }")"
report "data: SC-AK-1518 — образец, который не собирается, отказан" "$(fl_model_refused_with "$d" 'words.nudge: the pattern does not compile')" 'да'

# --- SC-AK-1519 — способ сравнения формы ожидаемого — поле `compare` ----------------------------
d="$(fl_data '' "$FORMS")"
report "data: SC-AK-1519 — exit по коду" "$(fl_data_call "$d" "d.compareExpected(m.expect, 'exit 1', 1, 'что угодно')")" '{"form":"exit","matched":true}'
report "data: SC-AK-1519 — текст по последней строке" "$(fl_data_call "$d" "d.compareExpected(m.expect, '\`cond: missing 0 of 6\`', 0, 'a\ncond: missing 0 of 6\n\n')")" '{"form":"line","matched":true}'
report "data: SC-AK-1519 — выражение по последней строке" "$(fl_data_call "$d" "d.compareExpected(m.expect, '/^[0-9]+ ok\$/', 0, '47 ok')")" '{"form":"regex","matched":true}'
report "data: SC-AK-1519 — число со сравнением" "$(fl_data_call "$d" "d.compareExpected(m.expect, '>= 13', 0, '12')")" '{"form":"number","matched":false}'
report "data: SC-AK-1519 — ненулевой код проваливает текст" "$(fl_data_call "$d" "d.compareExpected(m.expect, '\`ok\`', 2, 'ok')")" '{"form":"line","matched":false}'
report "data: SC-AK-1519 — нераспознанная форма" "$(fl_data_call "$d" "d.compareExpected(m.expect, 'примерно 13', 0, '13')")" 'null'
d="$(fl_data '' "{ exit: { pattern: '^exit', compare: 'code' } }")"
report "data: SC-AK-1519 — неизвестный способ сравнения отказан" "$(fl_model_refused_with "$d" 'expect.exit: the compare «code» is not one of exit, line, regex, number')" 'да'

# --- SC-AK-1520 — порядок случаев отпуска — поле `order`, повтор отказан ------------------------
d="$(fl_data '' '' "{ late: { when: measure.plan.approved, order: 3 }, early: { when: measure.plan.approved, order: 1 } }")"
report "data: SC-AK-1520 — случаи идут по order" "$(fl_model_field "$d" "m.release.map((r) => r.key).join(',')")" 'early,late'
d="$(fl_data '' '' "{ a: { when: measure.plan.approved, order: 2 }, b: { when: measure.plan.approved, order: 2 } }")"
report "data: SC-AK-1520 — повтор order отказан" "$(fl_model_refused_with "$d" 'release.b: the order 2 repeats — release.a has it')" 'да'
d="$(fl_data '' '' "{ a: { when: measure.plan.approved, order: 1.5 } }")"
report "data: SC-AK-1520 — дробный order отказан" "$(fl_model_refused_with "$d" 'release.a: the order is an integer from 1')" 'да'

rm -rf "$FL_DIR"
suite_result "язык описания task flow"
