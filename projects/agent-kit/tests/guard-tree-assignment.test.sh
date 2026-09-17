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

suite_result "назначение эпика рабочей копии"
