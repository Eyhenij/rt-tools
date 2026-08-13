#!/usr/bin/env bash
# Сценарии гарда разговора: что считается вопросом, что — чтением правил и где кончается ход.
#
# Проверяется механика, а не карта дерева: запись хода собирается здесь же, а каталоги законов
# и правил берутся из умолчания пакета — набор не зависит от дерева, в котором его запустили.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард разговора"

TREE="$(fixture_tree)"
export CLAUDE_PROJECT_DIR="$TREE"
TURNS="$(mktemp -d)"
cleanup() { rm -rf "$TREE" "$TURNS"; }
trap cleanup EXIT

# Запись хода: строки JSON по одной. Довод — готовые строки, каждая своим доводом.
transcript() {
    local path
    path="$TURNS/turn-$RANDOM.jsonl"
    : > "$path"
    for line in "$@"; do
        printf '%s\n' "$line" >> "$path"
    done
    printf '%s' "$path"
}

# Ввод владельца: строка роли `user` без ответа инструмента.
say() { jq -c -n --arg t "$1" '{type:"user",message:{content:[{type:"text",text:$t}]}}'; }

# Ответ инструмента: та же роль `user`, но вводом владельца он не является.
tool_result() { jq -c -n '{type:"user",message:{content:[{type:"tool_result",content:"готово"}]}}'; }

# Реплика исполнителя.
reply() { jq -c -n --arg t "$1" '{type:"assistant",message:{content:[{type:"text",text:$t}]}}'; }

# Вызов инструмента исполнителем: имя и вход.
uses() {
    local input="$2"
    [ -z "$input" ] && input='{}'
    jq -c -n --arg n "$1" --arg i "$input" \
        '{type:"assistant",message:{content:[{type:"tool_use",name:$n,input:($i|fromjson)}]}}'
}

# Вход события завершения хода: путь к записи и признак повторного захода.
input_stop() {
    jq -n --arg p "$1" --argjson a "${2:-false}" '{session_id:"tests",transcript_path:$p,stop_hook_active:$a}'
}

# Решение гарда: BLOCK | PASS.
expect_stop() {
    local label="$1" json="$2" want="$3" out got
    out="$(printf '%s' "$json" | "$HOOKS/grill-gate.sh" 2>/dev/null)"
    if [ -z "$out" ]; then
        got="PASS"
    else
        got="$(printf '%s' "$out" | jq -r 'if .decision == "block" then "BLOCK" else "PASS" end' 2>/dev/null)"
    fi
    report "$label" "$got" "$want"
}

# Вход события вызова инструмента вопроса: имя инструмента отличает его от завершения хода.
input_ask() {
    jq -n --arg p "$1" '{session_id:"tests",transcript_path:$p,tool_name:"AskUserQuestion",tool_input:{questions:[]}}'
}

# Решение гарда на вызове инструмента: DENY | PASS. Форма ответа здесь другая — решение о
# доступе, а не о ходе, и одна форма на оба события молча не срабатывает.
expect_ask() {
    local label="$1" json="$2" want="$3" out got
    out="$(printf '%s' "$json" | "$HOOKS/grill-gate.sh" 2>/dev/null)"
    if [ -z "$out" ]; then
        got="PASS"
    else
        got="$(printf '%s' "$out" | jq -r 'if .hookSpecificOutput.permissionDecision == "deny" then "DENY" else "PASS" end' 2>/dev/null)"
    fi
    report "$label" "$got" "$want"
}

READ_RULES='{"pattern":"панель","path":".claude/skills"}'
READ_ELSE='{"pattern":"панель","path":"projects/ui-kit/src"}'

# --- вопрос без чтения правил ----------------------------------------------------------
# SC-AK-22 — вопрос владельцу без чтения правил ход не заканчивает
expect_stop "вопрос прозой без чтения" \
    "$(input_stop "$(transcript "$(say 'почини панель')" "$(reply 'Панель починить или переписать?')")")" BLOCK
# SC-AK-98 — меню на завершении хода уже не судится: оно отбито раньше, на своём инструменте.
expect_stop "меню на завершении хода не судится дважды" \
    "$(input_stop "$(transcript "$(say 'почини панель')" "$(uses AskUserQuestion '{"questions":[]}')")")" PASS

# --- SC-AK-97 — вопрос меню отбивается до отправки ---------------------------------------
# Проверка на завершении хода отбивает задним числом: к моменту отказа вопрос уже у владельца.
# Единственный момент, когда требование исполнимо, — вызов инструмента вопроса.
expect_ask "SC-AK-97 — вопрос меню без чтения отбит до отправки" \
    "$(input_ask "$(transcript "$(say 'почини панель')")")" DENY
expect_ask "прочитанное правило вопрос пропускает" \
    "$(input_ask "$(transcript "$(say 'почини панель')" "$(uses Skill '{"skill":"task-flow"}')")")" PASS

# --- чтение правил вопрос разрешает -----------------------------------------------------
# SC-AK-23 — прочитанное правило вопрос разрешает
expect_stop "загруженное правило" \
    "$(input_stop "$(transcript "$(say 'почини панель')" "$(uses Skill '{"skill":"task-flow"}')" "$(reply 'Панель починить или переписать?')")")" PASS
# SC-AK-24 — поиск по правилам считается чтением наравне с загрузкой
expect_stop "поиск по каталогу правил" \
    "$(input_stop "$(transcript "$(say 'почини панель')" "$(uses Grep "$READ_RULES")" "$(reply 'Панель починить или переписать?')")")" PASS
expect_stop "поиск мимо правил чтением не считается" \
    "$(input_stop "$(transcript "$(say 'почини панель')" "$(uses Grep "$READ_ELSE")" "$(reply 'Панель починить или переписать?')")")" BLOCK

# --- границы хода -----------------------------------------------------------------------
expect_stop "чтение прошлого хода этот ход не покрывает" \
    "$(input_stop "$(transcript "$(say 'первая просьба')" "$(uses Skill '{"skill":"task-flow"}')" "$(say 'вторая просьба')" "$(reply 'А как назвать это?')")")" BLOCK
expect_stop "ответ инструмента ход не начинает" \
    "$(input_stop "$(transcript "$(say 'почини панель')" "$(uses Skill '{"skill":"task-flow"}')" "$(tool_result)" "$(reply 'Панель починить или переписать?')")")" PASS

# --- ход без вопроса --------------------------------------------------------------------
expect_stop "ход без вопроса не судится" \
    "$(input_stop "$(transcript "$(say 'почини панель')" "$(reply 'Готово, панель починена.')")")" PASS
expect_stop "вопросительный знак в середине строки вопросом не считается" \
    "$(input_stop "$(transcript "$(say 'почини панель')" "$(reply 'Строка «что?» лежала в разметке — убрал её.')")")" PASS

# --- отказ в пользу работы ---------------------------------------------------------------
# SC-AK-25 — повторный заход по тому же ходу не судится
expect_stop "повторный заход" \
    "$(input_stop "$(transcript "$(say 'почини панель')" "$(reply 'Панель починить или переписать?')")" true)" PASS
# SC-AK-26 — сломанный гард разговора работу не останавливает
expect_stop "записи хода нет" "$(input_stop "$TURNS/нет-такой-записи.jsonl")" PASS
expect_stop "путь к записи не назван" '{"session_id":"tests"}' PASS
expect_stop "вход пустой" '' PASS

# --- дерево без законов и правил ---------------------------------------------------------
# Отказ объявляется надстройкой профиля: пустое окружение отказом не считается — иначе гард
# замолкал бы у всякого, кто просто не задал переменную.
mkdir -p "$TREE/.claude/rt-kit"
printf '%s\n' 'RT_LAWS_DIR=""' 'RT_RULES_DIR=""' 'RT_SPECS_DIR=""' > "$TREE/.claude/rt-kit/project.sh"
expect_stop "дерево без текстов требования не получает" \
    "$(input_stop "$(transcript "$(say 'почини панель')" "$(reply 'Панель починить или переписать?')")")" PASS
rm -f "$TREE/.claude/rt-kit/project.sh"

# --- текст отказа -------------------------------------------------------------------------
out="$(input_stop "$(transcript "$(say 'почини панель')" "$(reply 'Панель починить или переписать?')")" | "$HOOKS/grill-gate.sh" 2>/dev/null)"
if printf '%s' "$out" | jq -r '.reason // ""' | grep -q 'docs/constitution'; then got="есть"; else got="нет"; fi
report "отказ называет, где искать" "$got" "есть"

suite_result "гард разговора"
