#!/usr/bin/env bash
# Сценарии гарда экзамена: правка не идёт, пока за сессию не сдан экзамен по правилам.
#
# Проверяется механика: вердикт роли читается из записи хода, судится последний, и сдачей
# считается только полный балл.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард экзамена"

TURNS="$(mktemp -d)"
cleanup() { rm -rf "$TURNS"; }
trap cleanup EXIT

# Дерево с настройкой: гард ищет список выключенных ролей в `.claude/rt-kit.json` от корня
# дерева. Печатает путь к дереву.
tree_with_config() {
    local dir
    dir="$(mktemp -d "$TURNS/tree-XXXXXX")"
    mkdir -p "$dir/.claude"
    printf '%s\n' "$1" >"$dir/.claude/rt-kit.json"
    printf '%s' "$dir"
}

# Своё дерево на весь набор: иначе гард прочитал бы настройку того дерева, из которого набор
# запустили, и в дереве с выключенным экзаменатором каждый отказ ниже стал бы пропуском.
CLAUDE_PROJECT_DIR="$(tree_with_config '{}')"
export CLAUDE_PROJECT_DIR

transcript() {
    local path
    path="$TURNS/turn-$RANDOM.jsonl"
    : >"$path"
    for line in "$@"; do
        printf '%s\n' "$line" >>"$path"
    done
    printf '%s' "$path"
}

said() { jq -c -n --arg t "$1" '{type:"user",message:{content:[{type:"tool_result",content:$t}]}}'; }
say() { jq -c -n --arg t "$1" '{type:"user",message:{content:[{type:"text",text:$t}]}}'; }

edit_in() {
    jq -n --arg p "$1" --arg t "${2:-Edit}" \
        '{session_id:"tests",tool_name:$t,tool_input:{file_path:"a.md"},transcript_path:$p}'
}

e() { expect_decision "$1" exam-guard.sh "$(edit_in "$2")" "$3"; }

# --- экзамена не было ---------------------------------------------------------------------
e "SC-AK-312 — без экзамена правка отбивается" \
    "$(transcript "$(say 'правь файл')")" deny
expect_reason "и отказ называет роль экзаменатора" exam-guard.sh \
    "$(edit_in "$(transcript "$(say 'правь')")")" 'strict-teacher'

# --- вердикт роли -------------------------------------------------------------------------
e "SC-AK-313 — сданный экзамен правку пропускает" \
    "$(transcript "$(say 'экзамен')" "$(said 'ЭКЗАМЕН: сдано 5 из 5')")" PASS
e "SC-AK-314 — неполный балл считается провалом" \
    "$(transcript "$(say 'экзамен')" "$(said 'ЭКЗАМЕН: сдано 4 из 5
НЕ УСВОЕНО: правило ведения работы — порядок закрытия')")" deny
expect_reason "и отказ велит перечитать правило целиком" exam-guard.sh \
    "$(edit_in "$(transcript "$(say 'э')" "$(said 'ЭКЗАМЕН: сдано 4 из 5')")")" 'целиком'

# --- судится последний вердикт ---------------------------------------------------------------
# Пересдача снимает провал, а новый провал снимает прежнюю сдачу: иначе сданный однажды экзамен
# держал бы правку до конца сессии, что бы дальше ни случилось.
e "SC-AK-315 — пересдача снимает прежний провал" \
    "$(transcript "$(said 'ЭКЗАМЕН: сдано 3 из 5')" "$(said 'ЭКЗАМЕН: сдано 5 из 5')")" PASS
e "SC-AK-316 — провал после сдачи правку отбивает" \
    "$(transcript "$(said 'ЭКЗАМЕН: сдано 5 из 5')" "$(said 'ЭКЗАМЕН: сдано 2 из 5')")" deny

# --- второй экзамен на снятии черновика --------------------------------------------------------
# Между чтением правил поставки и снятием черновика лежит весь заход, поэтому спрашивают снова.
ran() {
    jq -c -n --arg c "$1" \
        '{type:"assistant",message:{content:[{type:"tool_use",name:"Bash",input:{command:$c}}]}}'
}
ready_in() {
    jq -n --arg p "$1" '{session_id:"tests",tool_name:"Bash",tool_input:{command:"gh pr ready 917"},transcript_path:$p}'
}
r() { expect_decision "$1" exam-guard.sh "$(ready_in "$2")" "$3"; }

r "SC-AK-317 — черновик не снимается без второго экзамена" \
    "$(transcript "$(said 'ЭКЗАМЕН: сдано 5 из 5')" "$(ran 'gh pr create --draft --title x')")" deny
r "SC-AK-318 — экзамен после открытия PR снятие пропускает" \
    "$(transcript "$(said 'ЭКЗАМЕН: сдано 5 из 5')" "$(ran 'gh pr create --draft --title x')" "$(said 'ЭКЗАМЕН: сдано 5 из 5')")" PASS
r "SC-AK-319 — без открытого PR второй экзамен не спрашивается" \
    "$(transcript "$(said 'ЭКЗАМЕН: сдано 5 из 5')")" PASS

# Команда, не снимающая черновик, гарду безразлична: он судит снятие, а не всякий вызов клиента.
expect_decision "SC-AK-320 — прочие команды клиента не судятся" exam-guard.sh \
    "$(jq -n --arg p "$(transcript "$(say 'x')")" '{session_id:"tests",tool_name:"Bash",tool_input:{command:"gh pr view 917"},transcript_path:$p}')" PASS

# --- роль выключена деревом ----------------------------------------------------------------
# Дерево называет выключенные роли списком в своей настройке. При выключенном экзаменаторе гард
# молчит: та же правка, которую он отбивал бы, проходит. Выключение соседней роли, пустая
# настройка и настройка, которую не разобрать, экзамена не отменяют.
NO_EXAM="$(transcript "$(say 'правь файл')")"

CLAUDE_PROJECT_DIR="$(tree_with_config '{"rolesOff":["strict-teacher"]}')" \
    e "SC-AK-327 — выключенный деревом экзаменатор правку пропускает" "$NO_EXAM" PASS
CLAUDE_PROJECT_DIR="$(tree_with_config '{"rolesOff":["conscience"]}')" \
    e "SC-AK-328 — выключенная соседняя роль экзамен не отменяет" "$NO_EXAM" deny
CLAUDE_PROJECT_DIR="$(tree_with_config '{"vars":{}}')" \
    e "и без списка выключенных ролей экзамен спрашивается как прежде" "$NO_EXAM" deny
CLAUDE_PROJECT_DIR="$(tree_with_config '{"rolesOff": ["strict-teacher"')" \
    e "SC-AK-329 — настройка, которую не разобрать, роль не выключает" "$NO_EXAM" deny

# --- отказ в пользу работы ---------------------------------------------------------------------
exit_code_of() {
    printf '%s' "$2" | "$HOOKS/exam-guard.sh" >/dev/null 2>&1
    report "$1" "код:$?" "код:0"
}
exit_code_of "пустой вход пропускается" ''
exit_code_of "неразбираемый вход пропускается" 'не json'
exit_code_of "чтение файла гарду безразлично" \
    "$(jq -n --arg p "$(transcript "$(say 'x')")" '{session_id:"tests",tool_name:"Read",tool_input:{file_path:"a.md"},transcript_path:$p}')"
expect_decision "записи хода нет — правка проходит" exam-guard.sh \
    "$(edit_in "$TURNS/нет-такой.jsonl")" PASS

suite_result "гард экзамена"
