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
            unmet() { printf "%s\n" "$3"; }
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
# Очередь спрашивается о самом номере эпика. Под nx стоит FORCE_COLOR, и число, напечатанное
# console.log, приходило с кодами цвета: двойник очереди отвечал «эпика нет», отказ пропадал.
asked_of() {
    (
        cd "$TREE" || exit 0
        FORCE_COLOR=true HELPER="$HOOKS/git-guard-tree-assignment.sh" bash -c '
            unmet() { printf "%s\n" "$3"; }
            rt_task_state() { [ "$1" = 1870 ] && printf "%s" "{\"exists\":true,\"open\":false}"; }
            . "$HELPER"
            rt_assignment_stale "ветка"
        '
    )
}
report "SC-AK-1115 — очередь спрошена о голом номере и при FORCE_COLOR" \
    "$(asked_of | grep -c 'assignment outlived it')" 1
# Очередь работ молчит — отказа нет: вызов идёт в сеть, и дерево без неё продолжает работать.
report "SC-AK-1115 — молчание очереди пропущено" "$(stale_of '')" ''
# Прочерк в строке судит не этот отказ: спрашивать очередь не о чем.
table '| rt-tools | — | — | 2026-09-17 |'
report "SC-AK-1115 — без назначения очередь не спрашивается" \
    "$(stale_of '{"exists":true,"open":false}')" ''

# --- SC-AK-1232 — отказ называет слово владельца переносом назначения ------------------------
# Отказ кончался словами «назначение переносит владелец», и исполнитель после прямого поручения
# остановился и спросил владельца второй раз: поручение и было тем переносом.
OWNER_WORD='names this work is that'
printf 'rt-worktree-9\n' > "$TREE/.claude/rt-kit/tree-name"
table '| rt-tools | 1870 | docs/plans/one-kit.md | 2026-09-17 |'
report "SC-AK-1232 — нет строки: слово владельца названо" "$(fault_of 1870 | grep -c "$OWNER_WORD")" 1
printf 'rt-tools\n' > "$TREE/.claude/rt-kit/tree-name"
table '| rt-tools | — | — | 2026-09-17 |'
report "SC-AK-1232 — прочерк: слово владельца названо" "$(fault_of 1870 | grep -c "$OWNER_WORD")" 1
table '| rt-tools | 1870 | docs/plans/one-kit.md | 2026-09-17 |'
report "SC-AK-1232 — чужой эпик: слово владельца названо" "$(fault_of 2208 | grep -c "$OWNER_WORD")" 1
report "SC-AK-1232 — закрытый эпик: слово владельца названо" \
    "$(stale_of '{"exists":true,"open":false}' | grep -c "$OWNER_WORD")" 1

# --- SC-AK-1992 — копия без строки заводит единственную задачу разбора ------------------------
# Номера до карточки нет, и строку под неё владельцу писать не о чем. Строку судит взятие ветки.
SINGLE_CALL='npm run task:new -- --single --title t --slug s'
table '| rt-worktree-9 | 1870 | docs/plans/one-kit.md | 2026-09-17 |'
report "SC-AK-1992 — single task: копия без строки заводит" "$(decision_of "$SINGLE_CALL")" PASS
report "SC-AK-1992 — без флага той же копии отказано" "$(decision_of 'npm run task:new -- --title t --slug s')" deny
report "SC-AK-1992 — single task: слова флага в кавычках не флаг" \
    "$(decision_of "npm run task:new -- --outside-epic слово --title 'о --single в тексте' --slug s")" deny
report "SC-AK-1992 — single task: слова флага в двойных кавычках не флаг" \
    "$(decision_of 'npm run task:new -- --outside-epic слово --title "о --single в тексте" --slug s')" deny
# Вызов читается так, как его читает оболочка.
while IFS= read -r FORM; do
    report "SC-AK-1992 — single task: законная форма проходит: ${FORM}" "$(decision_of "$(printf '%b' "$FORM")")" PASS
done <<'FORMS'
npm run task:new -- \\\n    --title "Заголовок" \\\n    --slug mail --single
out="$(npm run task:new -- --single --title t --slug s < b.md)"
(cd /x && npm run task:new -- --title t --slug s --single)
npm run task:new -- --title t --slug s --single; echo done
npm run task:new -- --title t --slug s --single<body.md
npm run task:new -- --title t 2>&1 --slug s --single
bash -c 'npm run task:new -- --single --title t --slug s'
npm run task:new -- --title "The owner's letters" --single --slug s <<< 'x'
npm run task:new -- --title A\\&B --single --slug s
npm run task:new -- --title "a\nb" --single --slug s
npm run task:new -- --single --title t --slug s <<'EOF'\nсмотри task:new и it's\nEOF
npm run task:new -- --title t --slug s \\\n--single
out="$(npm run task:new -- --single --title "имя" --slug s)"
bash -lc "npm run task:new -- --single --title t --slug s"
node tools/task-new.mjs --single --title t --slug s
npm run -s task:new -- --single --title "#12 падает, цена 5$" --slug s
npm run task:new -- --single --title "npm run task:new падает" --slug s
npm run task:new -- --title "о task:move" --slug s --single
printf '%s' 'Тело про npm run task:new' | npm run task:new -- --single --title t --slug s
npm run task:new -- --single --title t --slug s <<\\EOF\nnpm run task:new и it's\nEOF
npm run task:new -- --single --title t --slug s <<'END-1'\nnpm run task:new и it's\nEND-1
grep -n x tools/task-new.mjs; npm run task:new -- --single --title t --slug s
echo task:new; npm run task:new -- --single --title t --slug s
# owner's word\nnpm run task:new -- --single --title t --slug s
FORMS
while IFS= read -r FORM; do
    report "SC-AK-1992 — single task: не единственный вызов работы отбит: ${FORM}" "$(decision_of "$(printf '%b' "$FORM")")" deny
done <<'FORMS'
npm run task:new -- --single --title t --slug s; npm run task:move -- 55 in-progress
npm run task:move -- 55 in-progress # task:new --single x
npm run task:new -- --title t --slug s # --single
npm run task:new -- --title t --slug s <<'EOF'\ntask:new -- --single\nEOF
npm run task:new -- --title t --slug s; npm run task:new -- --single --title u --slug v
npm run task:new -- --title t --slug s; echo --single
bash -c 'npm run task:new -- --outside-epic w --title "о --single" --slug s'
out="$(npm run task:new -- --outside-epic 'слово' --title 'о --single тут' --slug s)"
# owner's word\nnpm run task:new -- --outside-epic 'слово' --title 'о --single' --slug s
out="$(npm run task:move -- 55 in-progress)"; npm run task:new -- --single --title t
bash -c 'npm run task:move -- 55 in-progress'; npm run task:new -- --single --title t
FORMS
rm -f "$TREE/.claude/rt-kit/tree-name"
report "SC-AK-1992 — single task: копия без имени заводит" "$(decision_of "$SINGLE_CALL")" PASS
printf 'rt-tools\n' > "$TREE/.claude/rt-kit/tree-name"
table '| rt-tools | — | — | 2026-09-17 |'
report "SC-AK-1992 — single task: прочерк держит и её" "$(decision_of "$SINGLE_CALL")" deny

suite_result "назначение эпика рабочей копии"
