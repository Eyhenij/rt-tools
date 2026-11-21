#!/usr/bin/env bash
# Фикстура дерева описания task flow и помощники модели. Файл не набор: бегун берёт только
# `*.test.sh`, а этот подключают набор языка описания и наборы его частей — надстройки, заготовок и
# генерации текстов. Каталог фикстур один на процесс: часть, подключённая набором языка, пишет в
# каталог набора.
[ -n "${FL_DIR:-}" ] || FL_DIR="$(mktemp -d)"

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
