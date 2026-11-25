#!/usr/bin/env bash
# The scenarios of the rework of a task: the lines of the first review round, the files outside the
# footprint of the plan and the totals over the last merged tasks or the tasks after a revision.
#
# Covers SC-AK-1968 and SC-AK-1969 of the spec `docs/specs/agent-kit/metrics`. A real one-off repository
# is judged: reading the history is a part of the command.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the rework of a task"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

g() { git -C "$T" "$@"; }
fresh() {
    T="$WORK/$1"
    mkdir -p "$T/tools/task-flow/measure" "$T/.claude/rt-kit"
    cp "$TOOLS/task-rework.mjs" "$TOOLS/rt-kit-checks.config.mjs" "$TOOLS/check-coupling.mjs" "$TOOLS"/coupling-*.mjs "$T/tools/"
    cp "$TOOLS/task-flow/measure/text.mjs" "$T/tools/task-flow/measure/"
    printf '{"sourceRoots":["src"],"barrelFiles":["index.mjs"],"board":{"taskKey":"RT"},"tasksDir":"docs/tasks"}\n' > "$T/.claude/rt-kit/checks.json"
    g init -q -b main
    g config user.email t@example.com
    g config user.name t
    g config commit.gpgsign false
    save 'base'
}
put() { mkdir -p "$T/$(dirname "$1")" && printf '%b' "$2" > "$T/$1"; }
save() { g add -A && g commit -q --allow-empty -m "$1"; }
plan() { put "docs/tasks/$1/plan.md" "# План\n\n## Решение\n\n| Часть | Что выбрано |\n| --- | --- |\n| Зацепление | \`src/none.mjs\` исходящие 0 → 0 |\n\n## Task footprint\n\n| What | Where |\n| --- | --- |\n| Code (правится) | $2 |\n"; }
run() { (cd "$T" && node tools/task-rework.mjs "$@" 2>&1); }
code() { (cd "$T" && node tools/task-rework.mjs "$@" > /dev/null 2>&1; echo $?); }
first() { run "$@" | head -1; }
rest() { run "$@" | sed 1d | tr -d ' ' | tr '\n' ' ' | sed 's/ $//'; }
names() { run "$@" | sed -nE 's/^(RT-[0-9]+):.*/\1/p' | tr '\n' ' '; }
total() { run "$@" | tail -1; }

# --- SC-AK-1968 — one task ---------------------------------------------------------------------------
fresh one
plan RT-7-name '`src/a.mjs`, `lib/*.mjs`, `deep/**`, `flow/`'
save 'docs: plan (RT-7)'
put src/a.mjs 'a\nb\nc\n'
put src/extra.mjs 'x\n'
put lib/in.mjs 'x\n'
put lib/sub/out.mjs 'x\n'
put deep/one/two.mjs 'x\n'
put far/flow/three.mjs 'x\n'
put .claude/copy.sh '#!/usr/bin/env bash\n# rt-kit v1.0.0 · hooks/copy.sh\n'
put docs/archive/RT-7.md 'x\n'
put docs/plans/epic.md 'x\n'
save 'feat: edit (RT-7)'
put src/a.mjs 'a\nB\nc\n'
put src/b.bin '\001\000\002'
save 'fix: edit after a later look (RT-7)'
put src/a.mjs 'A\nB\nC\nD\n'
put .claude/copy.sh '#!/usr/bin/env bash\n# rt-kit v1.0.1 · hooks/copy.sh\necho\n'
put docs/tasks/RT-7-name/progress.md 'x\ny\n'
put docs/archive/RT-7.md 'x\ny\n'
save 'fix: правка после первого круга ревью (RT-7)'
put src/a.mjs 'A\n'
save 'fix: правка после второго круга ревью (RT-7)'
put src/other.mjs 'x\n'
save 'feat: edit (RT-71)'
report "SC-AK-1968 — the first round is counted by its lines, copies and own places left out" \
    "$(first RT-7 | sed -E 's/ \([0-9a-f]+\)//')" "RT-7: first round 5 lines; 3 files outside the footprint"
report "SC-AK-1968 — the files outside are named, the covered by a mask and a folder are not" "$(rest RT-7)" "lib/sub/out.mjs src/extra.mjs src/b.bin"
report "SC-AK-1968 — a task whose number begins the same is another task" "$(first RT-71)" \
    "RT-71: first round no commit of the first round; no plan in the history"
report "SC-AK-1968 — a task without commits is said so" "$(first RT-9)" "task-rework: no commit of RT-9 in this history"
report "SC-AK-1968 — a task without commits ends with a code" "$(code RT-9)" 1
report "SC-AK-1968 — no argument is refused" "$(code)" 2
report "SC-AK-1968 — two arguments are refused" "$(code RT-7 RT-71)" 2
report "SC-AK-1968 — a word that is no task is refused" "$(code seven)" 2
report "SC-AK-1968 — a count that is no number is refused" "$(code --last=x)" 2
report "SC-AK-1968 — a count of zero is refused" "$(code --last=0)" 2
report "SC-AK-1968 — an unknown revision is refused" "$(code --since=no-such-revision)" 2

# A round that changed only copies and own places counts zero.
put .claude/copy.sh '#!/usr/bin/env bash\n# rt-kit v1.0.2 · hooks/copy.sh\n'
put docs/plans/epic.md 'x\nz\n'
save 'fix: правка после первого круга ревью (RT-71)'
report "SC-AK-1968 — a round with no own lines counts zero" "$(first RT-71 | sed -E 's/ \([0-9a-f]+\)//')" \
    "RT-71: first round 0 lines; no plan in the history"

# The plan is the one written before the code: a later row does not bring a file inside.
plan RT-7-name '`src/a.mjs`, `src/extra.mjs`, `src/b.bin`, `lib/`, `deep/`, `flow/`'
save 'docs: plan (RT-7)'
report "SC-AK-1968 — a row added later brings no file inside" "$(first RT-7 | sed -E 's/.*; //')" "3 files outside the footprint"
g rm -q -r docs/tasks
save 'docs: the folder is taken apart (RT-7)'
report "SC-AK-1968 — the plan is found after the folder is taken apart" "$(first RT-7 | sed -E 's/.*; //')" "3 files outside the footprint"
g rm -q src/extra.mjs
save 'fix: the file is removed (RT-7)'
report "SC-AK-1968 — a removed file was touched" "$(first RT-7 | sed -E 's/.*; //')" "3 files outside the footprint"

# The folder of another task is no plan of this one.
fresh foreign
plan RT-80-name '`src/a.mjs`'
put src/a.mjs 'a\n'
save 'feat: edit (RT-8)'
report "SC-AK-1968 — a plan of another task is not taken" "$(first RT-8)" \
    "RT-8: first round no commit of the first round; no plan in the history"

# --- SC-AK-1969 — the last merged tasks and the tasks after a revision -------------------------------
# A task: the branch, the plan, the code, the first round, the merge by its request.
task() {
    g checkout -q -b "RT-$1-name" main
    plan "RT-$1-name" '`src/`'
    save "docs: plan (RT-$1)"
    put "src/m$1.mjs" "$2"
    save "feat: edit (RT-$1)"
    if [ -n "$3" ]; then
        put "src/m$1.mjs" "$2$3"
        save "fix: правка после первого круга ревью (RT-$1)"
    fi
    g checkout -q main
    g merge -q --no-ff -m "[RT-$1] Название (#$((100 + $1)))" "RT-$1-name"
}
fresh last
report "SC-AK-1969 — no merges, no tasks" "$(total --last=5)" \
    "tasks 0: new cycles 0, new imports past an entry 0, overruns 0; first round in 0, median none lines; without a round: none"
task 1 'export const a = 1;\n' '// one\n'
MARK="$(g rev-parse HEAD)"
task 2 'export const b = 1;\n' '// one\n// two\n// three\n'
task 3 'export const c = 1;\n' ''
put src/epic.mjs 'x\n'
g checkout -q -b RT-50-epic main
save 'docs: epic (RT-50)'
g checkout -q main
g merge -q --no-ff -m '[RT-50] Эпик (#150)' RT-50-epic
g checkout -q -b aside main
put aside.txt 'x\n'
save 'chore: aside'
g checkout -q main
g merge -q --no-ff -m 'Merge branch aside' aside
report "SC-AK-1969 — the last tasks are named, an epic and a merge without a task are not" "$(names --last=5)" "RT-3 RT-2 RT-1 "
report "SC-AK-1969 — the count takes the newest" "$(names --last=2)" "RT-3 RT-2 "
report "SC-AK-1969 — the median is taken over the tasks with a first round" "$(total --last=5 | sed -E 's/.*overruns 0; //')" \
    "first round in 2, median 2 lines; without a round: RT-3"
report "SC-AK-1969 — one task is its own median" "$(total --last=2 | sed -E 's/.*(median [^;]*);.*/\1/')" "median 3 lines"
report "SC-AK-1969 — a task without a round is named apart" "$(total --last=1 | sed -E 's/.*; //')" "without a round: RT-3"
report "SC-AK-1969 — the window after a revision takes only the later merges" "$(names --since="$MARK")" "RT-3 RT-2 "
report "SC-AK-1969 — the window keeps its own totals" "$(total --since="$MARK" | sed -E 's/.*overruns 0; //')" \
    "first round in 1, median 3 lines; without a round: RT-3"
report "SC-AK-1969 — a window at the head holds no task" "$(names --since=HEAD)" ""

task 4 "import { e } from './m5.mjs';\nexport const d = e;\n" ''
task 5 "import { d } from './m4.mjs';\nexport const e = 1;\nexport const f = () => d;\n" ''
report "SC-AK-1969 — a new cycle of a merge is counted" "$(total --last=1 | sed -E 's/, new imports.*//')" "tasks 1: new cycles 1"
report "SC-AK-1969 — growth nobody named is counted as an overrun" "$(total --last=1 | grep -oE 'overruns [0-9]+')" "overruns 1"
report "SC-AK-1969 — the row of a task holds its numbers" "$(run --last=1 | head -1 | sed -E 's/.*; (cycles.*)/\1/')" "cycles +1, past an entry 0, overruns 1"

suite_result "the rework of a task"
