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

# Вход события вопроса с текстом: второй признак судит слова темы, и пустой набор ему нечем судить.
input_ask_text() {
    jq -n --arg p "$1" --arg q "$2" \
        '{session_id:"tests",transcript_path:$p,tool_name:"AskUserQuestion",tool_input:{questions:[{question:$q}]}}'
}

READ_RULES='{"pattern":"панель","path":".claude/skills"}'
READ_ELSE='{"pattern":"панель","path":"projects/ui-kit/src"}'
READ_PLANS='{"pattern":"панель","path":"docs/plans/эпик.md"}'
READ_ARCHIVE='{"pattern":"панель","path":"docs/archive"}'

# --- вопрос без чтения правил ----------------------------------------------------------
# SC-AK-22 — вопрос владельцу без чтения правил ход не заканчивает
# SC-AK-98 — вопрос прозой ловится на завершении хода: инструментом он не является.
expect_stop "SC-AK-98 — вопрос прозой без чтения" \
    "$(input_stop "$(transcript "$(say 'почини панель')" "$(reply 'Панель починить или переписать?')")")" BLOCK
# Меню на завершении хода уже не судится: оно отбито раньше, на своём инструменте.
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

# SC-AK-703 — замысел эпика читается наравне с законами
# Решение, связывающее задачи эпика, лежит в замысле, а не в правилах: прочитавший его получал
# отказ наравне с не читавшим ничего.
expect_stop "SC-AK-703 — чтение замысла эпика вопрос разрешает" \
    "$(input_stop "$(transcript "$(say 'почини панель')" "$(uses Read "$READ_PLANS")" "$(reply 'Панель починить или переписать?')")")" PASS
# SC-AK-704 — описание прошлого читается наравне с законами
expect_stop "SC-AK-704 — чтение описания прошлого вопрос разрешает" \
    "$(input_stop "$(transcript "$(say 'почини панель')" "$(uses Grep "$READ_ARCHIVE")" "$(reply 'Панель починить или переписать?')")")" PASS

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

# SC-AK-735 — половина гарда на инструменте вопроса судит тем же телом
# Объявлена она своим ресурсом: у дерева на инструменте вопроса может стоять свой гард, и
# половины отменяются порознь. Судить при этом обе половины обязаны одинаково — расходиться двум
# редакциям одного требования нельзя.
ask_via_thin() {
    local label="$1" json="$2" want="$3" out got
    out="$(printf '%s' "$json" | "$HOOKS/grill-gate-ask.sh" 2>/dev/null)"
    if [ -z "$out" ]; then
        got="PASS"
    else
        got="$(printf '%s' "$out" | jq -r 'if .hookSpecificOutput.permissionDecision == "deny" then "DENY" else "PASS" end' 2>/dev/null)"
    fi
    report "$label" "$got" "$want"
}
ask_via_thin "SC-AK-735 — вопрос без чтения отбит и через свой ресурс" \
    "$(input_ask "$(transcript "$(say 'почини панель')")")" DENY
ask_via_thin "SC-AK-735 — прочитанное правило вопрос пропускает" \
    "$(input_ask "$(transcript "$(say 'почини панель')" "$(uses Skill '{"skill":"task-flow"}')")")" PASS

# Тело потеряно — половина пропускает: гард, лишившийся тела, разговор не клинит.
THIN="$(mktemp -d)"
cp "$HOOKS/grill-gate-ask.sh" "$HOOKS/utf8.sh" "$HOOKS/hook-input.sh" "$THIN/"
out="$(printf '%s' "$(input_ask "$(transcript "$(say 'почини панель')")")" | "$THIN/grill-gate-ask.sh" 2>/dev/null)"
report "SC-AK-735 — половина без тела пропускает" "$out" ''
rm -rf "$THIN"

# --- текст отказа -------------------------------------------------------------------------
out="$(input_stop "$(transcript "$(say 'почини панель')" "$(reply 'Панель починить или переписать?')")" | "$HOOKS/grill-gate.sh" 2>/dev/null)"
if printf '%s' "$out" | jq -r '.reason // ""' | grep -q 'docs/constitution'; then got="есть"; else got="нет"; fi
report "отказ называет, где искать" "$got" "есть"
# SC-AK-705 — подсказка отказа называет замысел эпика и описание прошлого
if printf '%s' "$out" | jq -r '.reason // ""' | grep -q 'docs/plans'; then got="есть"; else got="нет"; fi
report "SC-AK-705 — подсказка называет каталог замыслов" "$got" "есть"
if printf '%s' "$out" | jq -r '.reason // ""' | grep -q 'docs/archive'; then got="есть"; else got="нет"; fi
report "SC-AK-705 — подсказка называет описание прошлого" "$got" "есть"

# SC-AK-756 — при известной области работы чтением считается правило этой области
# Прочитанный разбор чужого промаха и поиск по каталогу правил на заданный вопрос не отвечают:
# ответ лежал в том правиле, которого работа и требует. Область берётся оттуда же, откуда её
# берёт гейт правил, — по путям правок хода.
edited_spec='{"file_path":"libs/x/src/lib/x.spec.ts"}'
expect_stop "SC-AK-756 — чужое правило области не закрывает" \
    "$(input_stop "$(transcript \
        "$(say 'почини проверку')" \
        "$(uses Edit "$edited_spec")" \
        "$(tool_result)" \
        "$(uses Read '{"file_path":".claude/skills/styling-bem/SKILL.md"}')" \
        "$(tool_result)" \
        "$(reply 'Как быть с этим?')")")" BLOCK
expect_stop "SC-AK-756 — правило области отказ снимает" \
    "$(input_stop "$(transcript \
        "$(say 'почини проверку')" \
        "$(uses Edit "$edited_spec")" \
        "$(tool_result)" \
        "$(uses Read '{"file_path":".claude/skills/testing/SKILL.md"}')" \
        "$(tool_result)" \
        "$(reply 'Как быть с этим?')")")" PASS
expect_stop "SC-AK-756 — загрузка правила области считается чтением" \
    "$(input_stop "$(transcript \
        "$(say 'почини проверку')" \
        "$(uses Edit "$edited_spec")" \
        "$(tool_result)" \
        "$(uses Skill '{"skill":"testing"}')" \
        "$(tool_result)" \
        "$(reply 'Как быть с этим?')")")" PASS
# Правок в ходу нет — область не определилась, и засчитывается любое чтение, как прежде.
expect_stop "SC-AK-756 — без правок в ходу прежний признак чтения" \
    "$(input_stop "$(transcript \
        "$(say 'посоветуй')" \
        "$(uses Read '{"file_path":".claude/skills/styling-bem/SKILL.md"}')" \
        "$(tool_result)" \
        "$(reply 'Как быть с этим?')")")" PASS

suite_result "гард разговора"

# --- SC-AK-818 — на этот вопрос владелец уже отвечал --------------------------------------
# Указание владельца действует до его отмены, и новый факт против него — строка в ответе о цене,
# а не новый вопрос. Признак судит общие слова темы вопроса и последней реплики владельца, и
# только там, где вызов меню в записи хода уже был: иначе отбивался бы первый же вопрос захода.
SAID_RULE='сплошная проверка единообразия гоняется каждый раз, исключений не делаем'
LOADED='{"skill":"task-flow"}'

expect_ask "SC-AK-818 — повторный вопрос о том же предмете отбит" \
    "$(input_ask_text "$(transcript \
        "$(say "$SAID_RULE")" \
        "$(uses AskUserQuestion '{"questions":[]}')" \
        "$(say "$SAID_RULE")" \
        "$(uses Skill "$LOADED")")" \
        'Сплошная проверка единообразия дорога — исключений не делаем?')" DENY

expect_ask "SC-AK-818 — вопрос о другом предмете проходит" \
    "$(input_ask_text "$(transcript \
        "$(say "$SAID_RULE")" \
        "$(uses AskUserQuestion '{"questions":[]}')" \
        "$(say "$SAID_RULE")" \
        "$(uses Skill "$LOADED")")" \
        'Заголовок панели переносим строкой или обрезаем многоточием?')" PASS

# Разбор просьбы идёт несколькими вопросами подряд по разным предметам: отбивать второй вызов
# только за то, что он второй, значило бы отбивать сам разбор.
expect_ask "SC-AK-818 — первый вопрос захода не судится вторым признаком" \
    "$(input_ask_text "$(transcript \
        "$(say "$SAID_RULE")" \
        "$(uses Skill "$LOADED")")" \
        'Сплошная проверка единообразия гоняется каждый раз?')" PASS

# Отказ называет, что делать, а не как переспросить: промах здесь — остановка разрешённой работы.
out="$(input_ask_text "$(transcript \
    "$(say "$SAID_RULE")" \
    "$(uses AskUserQuestion '{"questions":[]}')" \
    "$(say "$SAID_RULE")" \
    "$(uses Skill "$LOADED")")" \
    'Сплошная проверка единообразия дорога — исключений не делаем?')"
out="$(printf '%s' "$out" | "$HOOKS/grill-gate.sh" 2>/dev/null | jq -r '.hookSpecificOutput.permissionDecisionReason // ""')"
if printf '%s' "$out" | grep -q 'go on with the work'; then got="есть"; else got="нет"; fi
report "SC-AK-818 — отказ велит продолжать работу" "$got" "есть"
