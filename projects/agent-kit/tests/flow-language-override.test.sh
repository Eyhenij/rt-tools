#!/usr/bin/env bash
# Сценарии надстройки дерева над описанием task flow. Набор идёт и сам, и подключённым набором
# языка описания `flow-language.test.sh`: тогда его случаи печатаются и считаются там.
if [ -z "${FL_DIR:-}" ]; then
    . "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
    . "$(dirname "${BASH_SOURCE[0]}")/flow-language-lib.sh"
    fl_alone="язык описания task flow: надстройка"
    echo "$fl_alone"
fi

# Пишет надстройку дерева рядом с фикстурой: $1 — дерево, текст надстройки — со входа.
fl_override() {
    mkdir -p "$1/ov/measure" "$1/ov/source"
    cat > "$1/ov/flow.js"
}

# Модель фикстуры, слитая с её надстройкой.
fl_model_ov() {
    node "$CHECKS/flow-model.mjs" "$1/flow.js" --override "$1/ov/flow.js" 2>&1
}

# Поле слитой модели по выражению над разобранным JSON.
fl_model_ov_field() {
    fl_model_ov "$1" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{const m=JSON.parse(s);console.log(String($2))}catch{console.log(s.trim())}})" 2>&1
}

# Отказ слитой модели называет то, что задано словом: печатает «да» или вывод модели.
fl_model_ov_refused_with() {
    local out
    out="$(fl_model_ov "$1")"
    case "$out" in
        "flow model: "*"$2"*) printf 'да' ;;
        *) printf '%s' "$out" ;;
    esac
}

# --- SC-AK-1489 — надстройка добавляет состояние по ключу --------------------------------------
d="$(fl_base)"
mkdir -p "$d/ov/measure" && printf 'export const done = () => () => true;\n' > "$d/ov/measure/review.mjs"
sed -i.bak 's/^  release: {},$/  release: { stop: { when: measure.plan.approved, order: 1 } },/' "$d/flow.js"
fl_override "$d" <<'FLOW'
({
  measure: { review: { done: {} } },
  state: { review: { title: 'ревью-пройдено', exit: measure.review.done } },
  release: { late: { when: measure.review.done, order: 3 } },
});
FLOW
report "override: SC-AK-1489 — новое состояние без after встаёт в конец" \
    "$(fl_model_ov_field "$d" "m.states.map((s) => s.key).join(' ')")" 'taken planned review'
report "override: SC-AK-1489 — новый случай отпуска встаёт по order" \
    "$(fl_model_ov_field "$d" "m.release.map((r) => r.key).join(' ')")" 'stop late'
report "override: SC-AK-1489 — модель называет добавленное" \
    "$(fl_model_ov_field "$d" "m.changes.map((c) => c.kind + ' ' + c.key).join(', ')")" 'added measure.review, added state.review, added release.late'
sed -i.bak 's/order: 3/order: 1/' "$d/ov/flow.js"
report "override: SC-AK-1489 — повтор order отказан" \
    "$(fl_model_ov_refused_with "$d" 'release.late: the order 1 repeats — release.stop has it')" 'да'
sed -i.bak 's/^  state: {/  extra: {},\n  state: {/' "$d/ov/flow.js"
report "override: SC-AK-1489 — секция вне шести отказана" \
    "$(fl_model_ov_refused_with "$d" 'override: «extra» is not one of the six sections')" 'да'

# --- SC-AK-1527 — `after` ставит состояние надстройки после названного -------------------------
d="$(fl_base)"
mkdir -p "$d/ov/measure" && printf 'export const done = () => () => true;\n' > "$d/ov/measure/review.mjs"
fl_override "$d" <<'FLOW'
({
  measure: { review: { done: {} } },
  state: {
    review: { title: 'ревью-пройдено', exit: measure.review.done, after: state.taken },
    check: { title: 'проверка-пройдена', exit: measure.review.done, after: 'taken' },
  },
});
FLOW
report "override: SC-AK-1527 — after ставит состояния после названного в порядке надстройки" \
    "$(fl_model_ov_field "$d" "m.states.map((s) => s.key).join(' ')")" 'taken review check planned'
report "override: SC-AK-1527 — поле after в модель не уходит" \
    "$(fl_model_ov_field "$d" "'after' in m.states[1]")" 'false'
sed -i.bak "s/after: 'taken'/after: state.nowhere/" "$d/ov/flow.js"
report "override: SC-AK-1527 — after на неизвестное состояние отказан" \
    "$(fl_model_ov_refused_with "$d" 'override state.check.after: «nowhere» names no state')" 'да'

# --- SC-AK-1490 — надстройка заменяет измеритель со сверкой контракта ---------------------------
d="$(fl_base)"
fl_override "$d" <<'FLOW'
({ measure: { plan: { approved: { git: source.git } } } });
FLOW
printf 'export function approved({ git }) {\n    return () => Boolean(git);\n}\n' > "$d/ov/measure/plan.mjs"
report "override: SC-AK-1490 — измеритель надстройки — файл рядом с надстройкой" \
    "$(fl_model_ov_field "$d" "m.measures[0].file")" 'ov/measure/plan.mjs'
report "override: SC-AK-1490 — порты измерителя надстройки сверены с его сигнатурой" \
    "$(fl_model_ov_field "$d" "Object.keys(m.measures[0].caps.approved).join(',') + ' ' + m.changes[0].kind")" 'git replaced'

# --- SC-AK-1491 — `null` с причиной убирает ключ, `measure` печатает убранное ---------------------
d="$(fl_base)"
fl_override "$d" <<'FLOW'
({ state: { planned: null, reason: 'this tree writes no plan' } });
FLOW
report "override: SC-AK-1491 — null с причиной убирает состояние" \
    "$(fl_model_ov_field "$d" "m.states.map((s) => s.key).join(' ')")" 'taken'
report "override: SC-AK-1491 — measure печатает убранное с причиной" \
    "$(node "$CHECKS/task-flow-script.mjs" measure --flow "$d/flow.js" --override "$d/ov/flow.js" 2>&1 | grep '^removed by the tree:')" \
    'removed by the tree: state.planned — this tree writes no plan'

# --- SC-AK-1492 — `null` без причины отказан ------------------------------------------------------
d="$(fl_base)"
fl_override "$d" <<'FLOW'
({ state: { planned: null } });
FLOW
report "override: SC-AK-1492 — null без причины отказан" \
    "$(fl_model_ov_refused_with "$d" "override state.planned: null removes a key of the package only with a reason next to it")" 'да'
fl_override "$d" <<'FLOW'
({ state: { planned: null, reason: '' } });
FLOW
report "override: SC-AK-1492 — пустая причина отказана" "$(fl_model_ov_refused_with "$d" 'override state.reason: the reason is a non-empty string')" 'да'
fl_override "$d" <<'FLOW'
({ words: { stop: ['стоп'], reason: 'no removal here' } });
FLOW
report "override: SC-AK-1492 — причина без null отказана" "$(fl_model_ov_refused_with "$d" 'override words.reason: a reason stands only next to a null')" 'да'
fl_override "$d" <<'FLOW'
({ state: { absent: null, reason: 'gone' } });
FLOW
report "override: SC-AK-1492 — null над ключом, которого нет в пакете, отказан" "$(fl_model_ov_refused_with "$d" 'null removes nothing — the package has no «absent»')" 'да'

# --- SC-AK-1493 — надстройка, которая ломает контракт, отказана -----------------------------------
d="$(fl_base)"
fl_override "$d" <<'FLOW'
({ measure: { plan: { approved: { git: source.git } } } });
FLOW
printf 'export function approved({ git, marks }) {\n    return () => [git, marks];\n}\n' > "$d/ov/measure/plan.mjs"
report "override: SC-AK-1493 — порты надстройки не равны сигнатуре" \
    "$(fl_model_ov_refused_with "$d" "the override's measure.plan.approved: the ports {git} are not the signature")" 'да'
printf "import { readFileSync } from 'node:fs';\nexport function approved({ git }) {\n    return () => [git, readFileSync];\n}\n" > "$d/ov/measure/plan.mjs"
report "override: SC-AK-1493 — измеритель надстройки с node:fs отказан" \
    "$(fl_model_ov_refused_with "$d" 'measure/plan.mjs: the import «node:fs» leaves the directory')" 'да'
rm -f "$d/ov/measure/plan.mjs"
fl_override "$d" <<'FLOW'
({ measure: { plan: null, reason: 'the tree measures no plan' } });
FLOW
report "override: SC-AK-1493 — убранный измеритель, на который ссылается состояние, отказан" \
    "$(fl_model_ov_refused_with "$d" 'state.taken.exit: «measure.plan.approved» names no measurer')" 'да'

if [ -n "${fl_alone:-}" ]; then
    rm -rf "$FL_DIR"
    suite_result "$fl_alone"
fi
