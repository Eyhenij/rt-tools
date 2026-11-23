#!/usr/bin/env bash
# Сценарии генератора текстов описания task flow. Набор идёт и сам, и подключённым набором языка
# описания `flow-language.test.sh`: тогда его случаи печатаются и считаются там.
if [ -z "${FL_DIR:-}" ]; then
    . "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
    . "$(dirname "${BASH_SOURCE[0]}")/flow-language-lib.sh"
    fl_alone="язык описания task flow: генерация текстов"
    echo "$fl_alone"
fi

# Текст с пометками представления: $1 — имя представления.
fl_marked() {
    printf '# A text\n\nBefore the view.\n\n<!-- flow:%s -->\nold\n<!-- /flow:%s -->\n\nAfter the view.\n' "$1" "$1"
}

# Фикстура пакета: описание в `assets/task-flow/`, рядом — исходники четырёх текстов с пометками.
fl_pkg() {
    local dir
    dir="$(mktemp -d "$FL_DIR/pkg.XXXXXX")"
    mkdir -p "$dir/assets/rules" "$dir/assets/defaults" "$dir/assets/samples/tasks/_template"
    mv "$(fl_base)" "$dir/assets/task-flow"
    cat > "$dir/assets/task-flow/flow.js" <<'FLOW'
({
  source: { git: { open: {} }, marks: { open: {} } },
  measure: { plan: { approved: { git: source.git, marks: source.marks } } },
  state: {
    taken: { title: 'задача-взята', action: 'write the plan', pattern: 'task-flow-start', exit: measure.plan.approved },
    planned: { title: 'замысел-записан', action: 'do the first stage', pattern: 'task-flow-resume', exit: { not: measure.plan.approved } },
  },
  release: { esc: { when: measure.plan.approved, order: 1, log: 'the owner interrupted the turn' } },
  words: { write: ['git commit'] },
  expect: { number: { pattern: '^(=|>=|<=) ?(-?\\d+)$', compare: 'number' } },
});
FLOW
    fl_marked states > "$dir/assets/rules/task-flow.md"
    fl_marked turn-end > "$dir/assets/rules/turn-conduct.md"
    fl_marked map > "$dir/assets/defaults/turn-map.md"
    fl_marked expect > "$dir/assets/samples/tasks/_template/plan.md"
    printf '%s' "$dir"
}

# Генератор текстов над фикстурой пакета: $1 — фикстура, дальше — флаги.
fl_sync_pkg() {
    local dir="$1"
    shift
    node "$CHECKS/flow-sync.mjs" --flow "$dir/assets/task-flow/flow.js" --root "$dir" "$@" 2>&1
}

# Дерево, куда пакет фикстуры разложен: копии текстов по местам раскладки и надстройка дерева.
fl_laid() {
    local pkg="$1" dir
    dir="$(mktemp -d "$FL_DIR/laid.XXXXXX")"
    mkdir -p "$dir/tools" "$dir/.claude/skills/task-flow" "$dir/.claude/skills/turn-conduct" "$dir/.claude/rt-kit/defaults" "$dir/docs/tasks/_template"
    cp -R "$pkg/assets/task-flow" "$dir/tools/task-flow"
    cp "$pkg/assets/rules/task-flow.md" "$dir/.claude/skills/task-flow/SKILL.md"
    cp "$pkg/assets/rules/turn-conduct.md" "$dir/.claude/skills/turn-conduct/SKILL.md"
    cp "$pkg/assets/defaults/turn-map.md" "$dir/.claude/rt-kit/defaults/turn-map.md"
    cp "$pkg/assets/samples/tasks/_template/plan.md" "$dir/docs/tasks/_template/plan.md"
    printf '# Binding\n\nA line of the tree.\n' > "$dir/.claude/skills/task-flow/implementation.md"
    mkdir -p "$dir/.claude/rt-kit/overrides/task-flow/measure"
    printf 'export const done = () => () => true;\n' > "$dir/.claude/rt-kit/overrides/task-flow/measure/review.mjs"
    cat > "$dir/.claude/rt-kit/overrides/task-flow/flow.js" <<'FLOW'
({
  measure: { review: { done: {} } },
  state: { review: { title: 'ревью-пройдено', action: 'review', pattern: 'task-flow-resume', exit: measure.review.done, after: state.taken } },
});
FLOW
    printf '%s' "$dir"
}

# Генератор текстов над разложенным деревом: $1 — дерево, дальше — флаги.
fl_sync_laid() {
    local dir="$1"
    shift
    node "$CHECKS/flow-sync.mjs" --flow "$dir/tools/task-flow/flow.js" --root "$dir" "$@" 2>&1
}

p="$(fl_pkg)"
fl_sync_pkg "$p" >/dev/null

# --- SC-AK-1499 — `flow.md` сравнивается с генерацией как текст, расхождение отказано ------------
report "sync: SC-AK-1499 — пять представлений пакета совпадают после записи" "$(fl_sync_pkg "$p" --check)" 'flow sync: 5 views match'
report "sync: SC-AK-1499 — flow.md несёт состояния описания" \
    "$(grep -c '^| `замысел-записан` | `not(measure.plan.approved)` | do the first stage | `task-flow-resume` |$' "$p/assets/task-flow/flow.md")" '1'
cp "$p/assets/task-flow/flow.md" "$p/flow.md.orig"
printf '\nA line by hand.\n' >> "$p/assets/task-flow/flow.md"
report "sync: SC-AK-1499 — ручная строка в flow.md отказана" \
    "$(fl_sync_pkg "$p" --check | head -1)" \
    'flow sync: description in task-flow/flow.md: it differs from its generation — a hand edit between the markers, or a description edited without a run; run flow-sync.mjs'
report "sync: SC-AK-1499 — отказ проверки — код 1" "$(fl_sync_pkg "$p" --check >/dev/null; printf '%s' $?)" '1'
cp "$p/flow.md.orig" "$p/assets/task-flow/flow.md"

# --- SC-AK-1500 — таблица «Work states» правила генерируется ---------------------------------------
report "sync: SC-AK-1500 — строка состояния: имя, выход, действие, паттерн" \
    "$(grep -c '^| `задача-взята` | `measure.plan.approved` | write the plan | `task-flow-start` |$' "$p/assets/rules/task-flow.md")" '1'
report "sync: SC-AK-1500 — текст вне пометок не тронут" \
    "$(sed -n '1,4p;$p' "$p/assets/rules/task-flow.md" | tr '\n' '/')" '# A text//Before the view.//After the view./'

# --- SC-AK-1501 — карта хода генерируется -----------------------------------------------------------
report "sync: SC-AK-1501 — строка карты: состояние, действие, паттерн" \
    "$(grep -c '^- `замысел-записан` — do the first stage; leads `task-flow-resume`$' "$p/assets/defaults/turn-map.md")" '1'

# --- SC-AK-1502 — раздел о конце хода правила `turn-conduct` генерируется --------------------------
report "sync: SC-AK-1502 — случай отпуска с порядком и условием" \
    "$(grep -c '^- \*\*1\*\* · the owner interrupted the turn — `measure.plan.approved`$' "$p/assets/rules/turn-conduct.md")" '1'

# --- SC-AK-1503 — таблица форм ожидаемого шаблона плана генерируется -------------------------------
report "sync: SC-AK-1503 — форма с образцом и способом сравнения" \
    "$(grep -c '^| `number` | `^(=\\|>=\\|<=) ?(-?\\d+)$` | the code is 0, the last non-empty line is an integer' "$p/assets/samples/tasks/_template/plan.md")" '1'

# --- SC-AK-1504 — ручная правка между пометками отказана `--check` ---------------------------------
sed -i.bak 's/| write the plan |/| write a plan |/' "$p/assets/rules/task-flow.md"
report "sync: SC-AK-1504 — правка таблицы состояний рукой отказана" \
    "$(fl_sync_pkg "$p" --check | head -1)" \
    'flow sync: states in rules/task-flow.md: it differs from its generation — a hand edit between the markers, or a description edited without a run; run flow-sync.mjs'
report "sync: SC-AK-1504 — запись возвращает текст описания" "$(fl_sync_pkg "$p" | tail -1)" 'flow sync: 1 of 5 views written'
printf '# A text without markers\n' > "$p/assets/defaults/turn-map.md"
report "sync: SC-AK-1504 — текст без пометок отказан и не переписан" \
    "$(fl_sync_pkg "$p" | head -1)" \
    'flow sync: map in defaults/turn-map.md: it has no markers <!-- flow:map --> … <!-- /flow:map -->; run flow-sync.mjs'
fl_marked map > "$p/assets/defaults/turn-map.md"
fl_sync_pkg "$p" >/dev/null

# --- SC-AK-1528 — представление надстройки пишется в спутник дерева, разложенное правило не меняется
d="$(fl_laid "$p")"
before="$(cksum < "$d/.claude/skills/task-flow/SKILL.md")"
report "sync: SC-AK-1528 — в дереве пишется только представление надстройки" "$(fl_sync_laid "$d" | tr '\n' ' ')" \
    'wrote tree in .claude/skills/task-flow/implementation.md flow sync: 1 of 6 views written '
report "sync: SC-AK-1528 — спутник называет добавленное состояние" \
    "$(grep -c '^- adds `state.review` after `state.taken`$' "$d/.claude/skills/task-flow/implementation.md")" '1'
report "sync: SC-AK-1528 — спутник несёт состояния слитого сценария" \
    "$(grep -c '^| `ревью-пройдено` | `measure.review.done` | review | `task-flow-resume` |$' "$d/.claude/skills/task-flow/implementation.md")" '1'
report "sync: SC-AK-1528 — строка дерева в спутнике осталась" "$(grep -c '^A line of the tree.$' "$d/.claude/skills/task-flow/implementation.md")" '1'
report "sync: SC-AK-1528 — разложенное правило не изменилось" "$(cksum < "$d/.claude/skills/task-flow/SKILL.md")" "$before"
report "sync: SC-AK-1528 — разложенное правило надстройку не видит" "$(grep -c 'ревью-пройдено' "$d/.claude/skills/task-flow/SKILL.md")" '0'
sed -i.bak 's/| write the plan |/| write a plan |/' "$d/.claude/skills/task-flow/SKILL.md"
before="$(cksum < "$d/.claude/skills/task-flow/SKILL.md")"
report "sync: SC-AK-1528 — правка разложенного правила не переписывается здесь" \
    "$(fl_sync_laid "$d" | head -1)" \
    'flow sync: states in .claude/skills/task-flow/SKILL.md: it differs from its generation — a hand edit between the markers, or a description edited without a run; the package writes it, and the layout brings it'
report "sync: SC-AK-1528 — разложенное правило осталось как было" "$(cksum < "$d/.claude/skills/task-flow/SKILL.md")" "$before"
mv "$d/.claude/skills/task-flow/SKILL.md.bak" "$d/.claude/skills/task-flow/SKILL.md"

# --- SC-AK-1535 — в дереве с надстройкой `--check` сверяет и её представление ---------------------
report "sync: SC-AK-1535 — шесть представлений совпадают" "$(fl_sync_laid "$d" --check)" 'flow sync: 6 views match'
sed -i.bak "s/title: 'ревью-пройдено'/title: 'ревью-закрыто'/" "$d/.claude/rt-kit/overrides/task-flow/flow.js"
report "sync: SC-AK-1535 — правка надстройки без записи отказана" \
    "$(fl_sync_laid "$d" --check | head -1)" \
    'flow sync: tree in .claude/skills/task-flow/implementation.md: it differs from its generation — a hand edit between the markers, or a description edited without a run; run flow-sync.mjs'
rm -rf "$d/.claude/rt-kit/overrides"
report "sync: SC-AK-1535 — без надстройки представлений пять" "$(fl_sync_laid "$d" --check)" 'flow sync: 5 views match'

if [ -n "${fl_alone:-}" ]; then
    rm -rf "$FL_DIR"
    suite_result "$fl_alone"
fi
