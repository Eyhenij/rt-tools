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

rm -rf "$FL_DIR"
suite_result "язык описания task flow"
