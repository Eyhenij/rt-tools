#!/usr/bin/env bash
# Сценарии назначения эпика рабочей копии: три состояния отказа и три состояния молчания.
#
# Сеть здесь не нужна вовсе: и таблица назначений, и имя копии лежат на диске, а номер эпика
# приходит вызовом. Фикстура повторяет дерево — `tools/` с проверками и `.claude/rt-kit/` с
# надстройкой, таблицей и именем копии.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: назначение эпика рабочей копии"

TREE="$(mktemp -d)"
mkdir -p "$TREE/tools" "$TREE/.claude/rt-kit"
cp "$CHECKS/rt-kit-checks.config.mjs" "$TREE/tools/"
cp "$CHECKS/tree-assignment.mjs" "$TREE/tools/"
cleanup() { rm -rf "$TREE"; }
trap cleanup EXIT

printf '{"board":{"taskKey":"RT"},"assignmentsFile":".claude/rt-kit/assignments.md"}\n' \
    > "$TREE/.claude/rt-kit/checks.json"

# Отказ по номеру эпика: пусто значит «взять можно».
fault_of() { (cd "$TREE" && node tools/tree-assignment.mjs --fault "$1" 2>/dev/null); }

table() {
    printf '%s\n' '| Рабочая копия | Эпик | План работ | Назначено |' \
        '| --- | --- | --- | --- |' "$@" > "$TREE/.claude/rt-kit/assignments.md"
}

# --- SC-AK-1113 — назначение эпика рабочей копии --------------------------------------------
# Копия, не назвавшая себя, строку в таблице найти не может: отказ говорит именно про это, а не
# про отсутствие строки — иначе владельца зовут дописывать таблицу, в которой всё на месте.
table '| rt-tools | 1870 | docs/plans/one-kit.md | 2026-09-17 |'
report "SC-AK-1113 — копия без имени названа" \
    "$(fault_of 1870 | grep -c 'names itself in no way')" 1

# Имя есть, строки нет — это молчание таблицы, и лечится оно словом владельца.
printf 'rt-worktree-9\n' > "$TREE/.claude/rt-kit/tree-name"
report "SC-AK-1113 — строки для копии нет" "$(fault_of 1870 | grep -c 'holds no row')" 1

# Строка есть, эпик прочерком — это ответ владельца «работы нет», и он отличается от молчания.
printf 'rt-tools\n' > "$TREE/.claude/rt-kit/tree-name"
table '| rt-tools | — | — | 2026-09-17 |'
report "SC-AK-1113 — эпик копии не назначен" "$(fault_of 1870 | grep -c 'no epic is assigned')" 1

# Чужой эпик: отказ называет оба номера — что взято и что дано.
table '| rt-tools | 1870 | docs/plans/one-kit.md | 2026-09-17 |'
report "SC-AK-1113 — чужой эпик назван" "$(fault_of 2208 | grep -c 'RT-1870')" 1
report "SC-AK-1113 — назван и взятый эпик" "$(fault_of 2208 | grep -c 'RT-2208')" 1

# Свой эпик — молчание. Номер приходит и с ключом задач, и голым числом: проверка берёт его из
# ответа очереди работ, а человек пишет в таблицу как придётся.
report "SC-AK-1113 — свой эпик пропущен" "$(fault_of 1870)" ''
table '| rt-tools | RT-1870 | docs/plans/one-kit.md | 2026-09-17 |'
report "SC-AK-1113 — номер с ключом задач читается" "$(fault_of 1870)" ''

# Работа без эпика вовсе: назначение судит принадлежность, а не право работать.
report "SC-AK-1113 — работа без эпика пропущена" "$(fault_of '')" ''

# Дерево, не назвавшее таблицы, не судится: делить ему нечего.
printf '{"board":{"taskKey":"RT"}}\n' > "$TREE/.claude/rt-kit/checks.json"
report "SC-AK-1113 — дерево без таблицы молчит" "$(fault_of 2208)" ''

# --- SC-AK-1114 — вызовы, которыми берут работу мимо ветки ----------------------------------
# Ветку судит проверка поставки, а задачу под эпиком и перенос карточки в работу — никто: оба
# вызова идут мимо неё, и оба означают взятую работу.
git -C "$TREE" init -q 2>/dev/null
printf '%s\n' '{"layout":{"checks":"tools"}}' > "$TREE/.claude/rt-kit.json"
printf '{"board":{"taskKey":"RT"},"assignmentsFile":".claude/rt-kit/assignments.md"}\n' \
    > "$TREE/.claude/rt-kit/checks.json"
printf 'rt-tools\n' > "$TREE/.claude/rt-kit/tree-name"
table '| rt-tools | 1870 | docs/plans/one-kit.md | 2026-09-17 |'

call() {
    printf '{"tool_name":"Bash","tool_input":{"command":%s}}' "$(printf '%s' "$1" | jq -Rs .)"
}

decision_of() {
    _out="$(cd "$TREE" && call "$1" | "$HOOKS/tree-assignment-guard.sh" 2>/dev/null)"
    if [ -z "$_out" ]; then
        printf 'PASS'
    else
        printf '%s' "$(printf '%s' "$_out" | jq -r '.hookSpecificOutput.permissionDecision // "deny"' 2>/dev/null)"
    fi
}

report "SC-AK-1114 — задача под чужим эпиком отбита" \
    "$(decision_of 'npm run task:new -- --epic-of 2208 --title t --slug s')" 'deny'
report "SC-AK-1114 — задача под своим эпиком проходит" \
    "$(decision_of 'npm run task:new -- --epic-of 1870 --title t --slug s')" 'PASS'
# Заведение эпика — не взятие работы: это записанный приказ владельца, назначение под него он
# даёт после.
report "SC-AK-1114 — заведение эпика проходит" \
    "$(decision_of 'npm run task:new -- --epic --title t --slug s')" 'PASS'
# Перенос карточки в работу эпика не называет: судится сама возможность брать работу.
table '| rt-tools | — | — | 2026-09-17 |'
report "SC-AK-1114 — перенос карточки без назначения отбит" \
    "$(decision_of 'npm run task:move -- 700 in-progress')" 'deny'
table '| rt-tools | 1870 | docs/plans/one-kit.md | 2026-09-17 |'
report "SC-AK-1114 — перенос карточки при назначении проходит" \
    "$(decision_of 'npm run task:move -- 700 in-progress')" 'PASS'
# Перенос в колонку обзора работой не считается: работа уже взята, и отказ тут запрещал бы её
# закончить.
table '| rt-tools | — | — | 2026-09-17 |'
report "SC-AK-1114 — перенос в обзор не судится" \
    "$(decision_of 'npm run task:move -- 700 in-review')" 'PASS'


# --- SC-AK-1115 — назначение, пережившее свой эпик -------------------------------------------
# Назначение стареет само: эпик кончается, а строка остаётся. Так и вышло в разборе — таблица
# называла эпик, все задачи которого закрыты неделю назад. Состояние задачи приходит из очереди
# работ, и здесь её заменяет двойник.
stale_of() {
    (
        cd "$TREE" || exit 0
        RT_STATE="$1" HELPER="$HOOKS/git-guard-tree-assignment.sh" bash -c '
            fault() { printf "%s\n" "$1"; }
            rt_task_state() { printf "%s" "$RT_STATE"; }
            . "$HELPER"
            rt_assignment_stale "ветка"
        '
    )
}

table '| rt-tools | 1870 | docs/plans/one-kit.md | 2026-09-17 |'
report "SC-AK-1115 — закрытый эпик назначения отбит" \
    "$(stale_of '{"exists":true,"open":false}' | grep -c 'assignment outlived it')" 1
report "SC-AK-1115 — живой эпик назначения пропущен" "$(stale_of '{"exists":true,"open":true}')" ''
# Очередь работ молчит — отказа нет: вызов идёт в сеть, и дерево без неё продолжает работать.
report "SC-AK-1115 — молчание очереди пропущено" "$(stale_of '')" ''
# Прочерк в строке судит не этот отказ: спрашивать очередь не о чем.
table '| rt-tools | — | — | 2026-09-17 |'
report "SC-AK-1115 — без назначения очередь не спрашивается" \
    "$(stale_of '{"exists":true,"open":false}')" ''

suite_result "назначение эпика рабочей копии"
