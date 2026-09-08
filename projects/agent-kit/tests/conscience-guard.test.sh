#!/usr/bin/env bash
# Сценарии гарда совести: найденный повтор разобранного промаха не даёт закрыть ход.
#
# Проверяется механика: находка читается из записи хода, судится последняя, и снимает её
# действие по находке, а не слова о ней.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард совести"

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
# запустили, и в дереве с выключенной совестью каждая блокировка ниже стала бы пропуском.
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

say() { jq -c -n --arg t "$1" '{type:"user",message:{content:[{type:"text",text:$t}]}}'; }
said() { jq -c -n --arg t "$1" '{type:"user",message:{content:[{type:"tool_result",content:$t}]}}'; }
reply() { jq -c -n --arg t "$1" '{type:"assistant",message:{content:[{type:"text",text:$t}]}}'; }
ran() {
    jq -c -n --arg c "$1" \
        '{type:"assistant",message:{content:[{type:"tool_use",name:"Bash",input:{command:$c}}]}}'
}

# Вызов инструмента и ответ на него связаны опознавателем: по нему гард и отличает ответ роли от
# ответа читающего инструмента. Первый довод — опознаватель, второй у ответа — его текст.
read_ran() {
    jq -c -n --arg id "$1" \
        '{type:"assistant",message:{content:[{type:"tool_use",id:$id,name:"Read",input:{file_path:"docs/archive/x.md"}}]}}'
}
role_ran() {
    jq -c -n --arg id "$1" \
        '{type:"assistant",message:{content:[{type:"tool_use",id:$id,name:"Task",input:{prompt:"совесть"}}]}}'
}
answered() {
    jq -c -n --arg id "$1" --arg t "$2" \
        '{type:"user",message:{content:[{type:"tool_result",tool_use_id:$id,content:$t}]}}'
}

input_stop() {
    jq -n --arg p "$1" --argjson a "${2:-false}" '{session_id:"tests",transcript_path:$p,stop_hook_active:$a}'
}

expect_stop() {
    local label="$1" json="$2" want="$3" out got
    out="$(printf '%s' "$json" | "$HOOKS/conscience-guard.sh" 2>/dev/null)"
    if [ -z "$out" ]; then
        got="PASS"
    else
        got="$(printf '%s' "$out" | jq -r 'if .decision == "block" then "BLOCK" else "PASS" end' 2>/dev/null)"
    fi
    report "$label" "$got" "$want"
}

FOUND='СОВЕСТЬ: повтор
РАЗБОР: 2026-08-18-ready-work-left-in-drafts.md
ЧТО СЕЙЧАС: работа отдана и брошена черновиком
ЧЕМ КОНЧИЛОСЬ ТОГДА: готовая работа простояла невлитой почти три часа'

# --- находка висит ------------------------------------------------------------------------
expect_stop "SC-AK-321 — найденный повтор ход не закрывает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(said "$FOUND")" "$(reply 'Понял.')")")" BLOCK

# --- находка разобрана --------------------------------------------------------------------
expect_stop "SC-AK-322 — заведённый разбор происшествия ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(said "$FOUND")" "$(ran 'cat > docs/postmortems/2026-08-19-x.md')")")" PASS
expect_stop "SC-AK-323 — названный владельцу повтор ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(said "$FOUND")" "$(reply 'СОВЕСТЬ: разобрано — повтор назван владельцу')")")" PASS

# --- чисто --------------------------------------------------------------------------------
expect_stop "SC-AK-324 — при чистом ответе роли ход закрывается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(said 'СОВЕСТЬ: чисто')")")" PASS
expect_stop "SC-AK-325 — молчание роли ход закрывает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply 'сделал')")")" PASS

# --- маркер не из ответа роли ---------------------------------------------------------------
# Записи архива называют маркер роли в перечне намеренно оставленной кириллицы, и всякий, кто их
# прочитает, получал отказ по находке, которой не было.
expect_stop "SC-AK-915 — прочитанный файл с маркером ход не держит" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(read_ran t1)" "$(answered t1 "$FOUND")")")" PASS
expect_stop "SC-AK-916 — маркер в своём тексте вердиктом не считается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply "в записи стоит строка $FOUND")")")" PASS
expect_stop "SC-AK-917 — ответ роли держит ход и после прочитанного файла с маркером" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(read_ran t1)" "$(answered t1 "$FOUND")" \
        "$(role_ran t2)" "$(answered t2 "$FOUND")" "$(reply 'Понял.')")")" BLOCK

# --- роль выключена деревом -------------------------------------------------------------------
# Дерево называет выключенные роли списком в своей настройке. При выключенной совести гард
# молчит: тот же ход, который он держал бы, закрывается. Выключение соседней роли, пустая
# настройка и настройка, которую не разобрать, находку не отменяют.
HANGING="$(input_stop "$(transcript "$(say 'продолжай')" "$(said "$FOUND")" "$(reply 'Понял.')")")"

CLAUDE_PROJECT_DIR="$(tree_with_config '{"rolesOff":["conscience"]}')" \
    expect_stop "SC-AK-363 — выключенная деревом совесть ход отпускает" "$HANGING" PASS
CLAUDE_PROJECT_DIR="$(tree_with_config '{"rolesOff":["strict-teacher"]}')" \
    expect_stop "SC-AK-364 — выключенная соседняя роль находку не отменяет" "$HANGING" BLOCK
CLAUDE_PROJECT_DIR="$(tree_with_config '{"vars":{}}')" \
    expect_stop "и без списка выключенных ролей находка держит ход как прежде" "$HANGING" BLOCK
CLAUDE_PROJECT_DIR="$(tree_with_config '{"rolesOff": ["conscience"')" \
    expect_stop "SC-AK-365 — настройка, которую не разобрать, роль не выключает" "$HANGING" BLOCK

# --- отказ в пользу работы ------------------------------------------------------------------
expect_stop "SC-AK-326 — повторный заход по тому же ходу не судится" \
    "$(input_stop "$(transcript "$(say 'x')" "$(said "$FOUND")")" true)" PASS

exit_code_of() {
    printf '%s' "$2" | "$HOOKS/conscience-guard.sh" >/dev/null 2>&1
    report "$1" "код:$?" "код:0"
}
exit_code_of "пустой вход пропускается" ''
exit_code_of "неразбираемый вход пропускается" 'не json'
exit_code_of "записи хода нет — ход закрывается" "$(input_stop "$TURNS/нет-такой.jsonl")"

suite_result "гард совести"
