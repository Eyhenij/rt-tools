#!/usr/bin/env bash
# Сценарии прихода правила проектирования кода: на чём проверка правил называет `code-design` и
# таблицу приёмов, на чём молчит и что меняет запись кода командой оболочки.
#
# Проверяется механика, а не текст правила: вместо правил лежат заготовки из трёх строк.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "приход правила проектирования"

TREE="$(fixture_tree)"
export CLAUDE_PROJECT_DIR="$TREE"
for rule in code-design code-design-choose typescript-conventions testing task-flow task-flow-plan \
    task-flow-owner doc-style reuse-first; do
    mkdir -p "$TREE/.claude/skills/$rule"
    printf -- '---\nname: %s\nkind: rule\n---\n' "$rule" > "$TREE/.claude/skills/$rule/SKILL.md"
done
gate_session_reset
cleanup() {
    gate_session_cleanup
    rm -rf "$TREE"
}
trap cleanup EXIT

# Все правила одного вызова по порядку: доставка и отказ называют их в «» одной строкой.
named() {
    local rec="${TMPDIR:-/tmp}/claude-skill-gate/tests.loaded"
    rm -f "$rec"
    printf '%s' "$1" | "$HOOKS/skill-gate.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.permissionDecisionReason // (.hookSpecificOutput.additionalContext | split("\n")[0])' 2>/dev/null \
        | grep -oE '«[a-z-]+»' | tr -d '«»' | tr '\n' ' '
    rm -f "$rec"
}
# d <подпись> <вход> <имя правила> <да|нет> — названо ли правило этим вызовом.
d() {
    local got=нет
    case " $(named "$2")" in *" $3 "*) got=да ;; esac
    report "$1" "$got" "$4"
}
edit() { d "$1" "$(input_edit "$TREE/$2")" "$3" "$4"; }
cmd() { d "$1" "$(input_cmd "printf x > $TREE/$2")" "$3" "$4"; }

# --- SC-AK-1915 — правило и таблица приходят до кода: на разборе, плане задачи и плане эпика --
for doc in docs/tasks/RT-1-x/grill.md docs/tasks/RT-1-x/plan.md docs/tasks/_draft-x/grill.md docs/plans/x.md; do
    edit "SC-AK-1915 — правило на $doc" "$doc" code-design да
    edit "SC-AK-1915 — таблица на $doc" "$doc" code-design-choose да
done
first="$(named "$(input_edit "$TREE/docs/tasks/RT-1-x/plan.md")")"
report "SC-AK-1915 — предметное правило папки остаётся первым" "${first%% *}" "task-flow"

# --- SC-AK-1916 — правило приходит на код с поведением, скрипт и входной файл -----------------
for code in libs/x/src/lib/a.ts tools/a.mjs tools/a.cjs tools/a.js hooks/a.sh libs/x/src/index.ts \
    libs/x/src/public-api.ts; do
    edit "SC-AK-1916 — правило на $code" "$code" code-design да
done
edit "SC-AK-1916 — на коде таблица не приходит" libs/x/src/lib/a.ts code-design-choose нет
first="$(named "$(input_edit "$TREE/libs/x/src/lib/a.ts")")"
report "SC-AK-1916 — предметное правило кода остаётся первым" "${first%% *}" "typescript-conventions"

# --- SC-AK-1917 — молчит там, где модулей нет -------------------------------------------------
for quiet in libs/x/src/lib/a.spec.ts libs/x/src/lib/a.stories.ts tools/a.test.mjs tests/a.sh \
    libs/x/src/lib/a.d.ts jest.config.ts eslint.config.mjs dist/x/a.ts node_modules/x/a.js \
    .claude/hooks/a.sh .claude/workflows/a.js apps/x-e2e/src/a.ts docs/tasks/RT-1-x/progress.md \
    docs/specs/x/spec.md libs/x/src/lib/a.html libs/x/src/lib/a.scss; do
    edit "SC-AK-1917 — молчит на $quiet" "$quiet" code-design нет
done

# --- SC-AK-1919 — запись командой оболочки получает слои по пути ------------------------------
cmd "SC-AK-1919 — правило на модуле, записанном командой" libs/x/src/lib/b.ts code-design да
cmd "SC-AK-1919 — правило на скрипте, записанном командой" hooks/b.sh code-design да
cmd "SC-AK-1919 — остальные слои по пути приходят тоже" libs/x/src/lib/b.ts reuse-first да
cmd "SC-AK-1919 — на тесте, записанном командой, молчит" libs/x/src/lib/b.spec.ts code-design нет
d "SC-AK-1919 — команда без записи слоя не получает" "$(input_cmd "cat $TREE/libs/x/src/lib/b.ts")" code-design нет
d "SC-AK-1919 — вторая запись команды не теряет слоя" \
    "$(input_cmd "printf x > $TREE/libs/x/src/lib/b.spec.ts && printf x > $TREE/hooks/b.sh")" code-design да
d "SC-AK-1919 — собранный файл не гасит слоя соседней записи" \
    "$(input_cmd "printf x > $TREE/dist/x/b.ts && printf x > $TREE/hooks/b.sh")" code-design да

# --- SC-AK-1918 — дерево снимает слой прежней функцией ----------------------------------------
printf 'skill_layer_skip() { [ "$1" = "code-design" ] && case "$2" in */hooks/c.sh|*/docs/plans/*) return 0 ;; esac; return 1; }\n' \
    >> "$TREE/.claude/rt-kit/defaults/gate-map.sh"
edit "SC-AK-1918 — снятый деревом слой не требуется" hooks/c.sh code-design нет
edit "SC-AK-1918 — снятый слой не оставляет и таблицу" docs/plans/x.md code-design-choose нет
edit "SC-AK-1918 — соседний файл слой получает" hooks/d.sh code-design да

suite_result "приход правила проектирования"
