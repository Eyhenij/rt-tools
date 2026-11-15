#!/usr/bin/env bash
# Сценарии генератора заготовок описания task flow. Набор идёт и сам, и подключённым набором
# языка описания `flow-language.test.sh`: тогда его случаи печатаются и считаются там.
if [ -z "${FL_DIR:-}" ]; then
    . "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
    . "$(dirname "${BASH_SOURCE[0]}")/flow-language-lib.sh"
    fl_alone="язык описания task flow: заготовки"
    echo "$fl_alone"
fi

# Генератор заготовок над фикстурой: каталог тестов — внутри неё.
fl_scaffold() {
    node "$CHECKS/flow-scaffold.mjs" --flow "$1/flow.js" --tests "$1/tests" 2>&1
}

# Строка вывода генератора, которая начинается с заданного: печатает её или «нет».
fl_scaffold_line() {
    local line
    line="$(fl_scaffold "$1" | grep -F -- "$2" | head -1)"
    printf '%s' "${line:-нет}"
}

# --- SC-AK-1494 — новый измеритель получает заглушку и случай теста ------------------------------
d="$(fl_base)"
sed -i.bak 's/^  measure: { plan: { approved: { git: source.git, marks: source.marks } } },$/  measure: { plan: { approved: { git: source.git, marks: source.marks } }, review: { done: { git: source.git }, late: {} } },/' "$d/flow.js"
sed -i.bak 's/exit: measure.plan.approved },$/exit: { all: [measure.plan.approved, measure.review.done, measure.review.late] } },/' "$d/flow.js"
report "scaffold: SC-AK-1494 — заготовка и случай теста созданы" \
    "$(fl_scaffold "$d" | tail -3 | tr '\n' ' ')" \
    'created measure/review.mjs created tests/flow-measure-review.test.sh flow scaffold: 2 created, 0 warnings '
report "scaffold: SC-AK-1494 — фабрика заготовки бросает Not implemented с портами" \
    "$(grep -c "throw new Error('Not implemented: measure.review.done (git)')" "$d/measure/review.mjs")" '1'
report "scaffold: SC-AK-1494 — заготовка без портов — пустая сигнатура" \
    "$(grep -c '^export function late() {$' "$d/measure/review.mjs")" '1'
report "scaffold: SC-AK-1494 — модель принимает заготовку" "$(fl_model_field "$d" "m.measures.map((x) => x.entry).join(',')")" 'plan,review'
report "scaffold: SC-AK-1494 — случай теста красный, пока фабрика не написана" \
    "$(bash "$d/tests/flow-measure-review.test.sh" 2>&1 | grep -c 'Not implemented: measure.review')" '2'
printf 'export function done({ git }) {\n    return () => Boolean(git);\n}\n\nexport const late = () => () => true;\n' > "$d/measure/review.mjs"
report "scaffold: SC-AK-1494 — написанная фабрика зеленит случай" \
    "$(bash "$d/tests/flow-measure-review.test.sh" >/dev/null 2>&1; printf '%s' $?)" '0'

# --- SC-AK-1495 — готовая реализация не трогается -------------------------------------------------
before="$(cksum < "$d/measure/review.mjs")$(cksum < "$d/measure/plan.mjs")$(cksum < "$d/tests/flow-measure-review.test.sh")"
report "scaffold: SC-AK-1495 — повторный прогон ничего не создаёт" "$(fl_scaffold "$d" | tail -1)" 'flow scaffold: 0 created, 0 warnings'
report "scaffold: SC-AK-1495 — готовые файлы и случай теста те же" \
    "$(printf '%s' "$(cksum < "$d/measure/review.mjs")$(cksum < "$d/measure/plan.mjs")$(cksum < "$d/tests/flow-measure-review.test.sh")" | [ "$(cat)" = "$before" ] && printf 'те же')" 'те же'

# --- SC-AK-1496 — `CONTRACT_CHANGED` при расхождении портов ---------------------------------------
d="$(fl_base)"
sed -i.bak 's/approved: { git: source.git, marks: source.marks }/approved: { git: source.git }/' "$d/flow.js"
before="$(cksum < "$d/measure/plan.mjs")"
report "scaffold: SC-AK-1496 — порты разошлись с сигнатурой" \
    "$(fl_scaffold_line "$d" 'CONTRACT_CHANGED')" \
    'warning CONTRACT_CHANGED measure.plan.approved: the ports {git} are not the signature ({ git, marks }) — the file is not rewritten'
report "scaffold: SC-AK-1496 — файл при расхождении не переписан" "$(cksum < "$d/measure/plan.mjs")" "$before"
sed -i.bak 's/approved: { git: source.git }/rejected: { git: source.git }/; s/measure.plan.approved/measure.plan.rejected/g' "$d/flow.js"
report "scaffold: SC-AK-1496 — возможности нет в файле" \
    "$(fl_scaffold_line "$d" 'CONTRACT_CHANGED')" 'warning CONTRACT_CHANGED measure.plan: the file exports no capability «rejected»'

# --- SC-AK-1497 — `UNREACHABLE_MEASURE` для измерителя без ссылок ---------------------------------
d="$(fl_base)"
printf 'export const said = () => () => true;\n' > "$d/measure/owner.mjs"
sed -i.bak 's/^  measure: { plan:/  measure: { owner: { said: {} }, plan:/' "$d/flow.js"
report "scaffold: SC-AK-1497 — измеритель, которого не называет ни состояние, ни случай" \
    "$(fl_scaffold_line "$d" 'UNREACHABLE_MEASURE')" \
    'warning UNREACHABLE_MEASURE measure.owner.said: no state exit, release case or port names it'
sed -i.bak 's/^  release: {},$/  release: { stop: { when: measure.owner.said, order: 1 } },/' "$d/flow.js"
report "scaffold: SC-AK-1497 — случай отпуска делает измеритель достижимым" "$(fl_scaffold_line "$d" 'UNREACHABLE_MEASURE')" 'нет'

# --- SC-AK-1498 — `MEASURE_REMOVED`, файл остаётся ------------------------------------------------
d="$(fl_base)"
printf 'export const gone = () => () => true;\n' > "$d/measure/old.mjs"
report "scaffold: SC-AK-1498 — файл без записи в описании назван" \
    "$(fl_scaffold_line "$d" 'MEASURE_REMOVED')" \
    'warning MEASURE_REMOVED measure/old.mjs: the description names no measure.old — the file stays'
report "scaffold: SC-AK-1498 — файл остаётся на месте" "$(test -f "$d/measure/old.mjs" && printf 'есть')" 'есть'
report "scaffold: SC-AK-1498 — сосед, которого импортирует измеритель, не назван" "$(fl_scaffold_line "$d" 'measure/util.mjs')" 'нет'

if [ -n "${fl_alone:-}" ]; then
    rm -rf "$FL_DIR"
    suite_result "$fl_alone"
fi
