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

# --- SC-AK-852. Второй выход у отказа: обход, объявленный телом коммита ------------------------
# Выход через список выключенных ролей требует снять защиту, а среда исполнения такую правку
# может запрещать вовсе: дверь оказывается запертой при зелёном наборе и сказанном слове
# владельца. Объявленный обход её не требует и молчаливым не бывает — строка уезжает в историю.
SKIP_REPO="$(fixture_repo RT-1702-skip)"
skip_commit() {
    printf 'x\n' >> "$SKIP_REPO/a.txt"
    git -C "$SKIP_REPO" add a.txt >/dev/null 2>&1
    git -C "$SKIP_REPO" -c user.email=t@t -c user.name=t commit -qm "$1" >/dev/null 2>&1
}
skip_decision() {
    CLAUDE_PROJECT_DIR="$SKIP_REPO" expect_decision "$1" exam-guard.sh "$(edit_in "$2")" "$3"
}
NO_EXAM="$(transcript "$(say 'работа без экзамена')")"

skip_commit "chore: без обхода"
skip_decision "SC-AK-852 — без объявленного обхода правка отбита" "$NO_EXAM" deny

skip_commit "chore: с обходом

Exam-skip: среда запрещает правку списка выключенных ролей"
skip_decision "SC-AK-852 — объявленный обход правку пропускает" "$NO_EXAM" PASS

skip_commit "chore: подстановка вместо причины

Exam-skip: <причина>"
skip_decision "SC-AK-852 — подстановка вместо причины обходом не считается" "$NO_EXAM" deny
rm -rf "$SKIP_REPO"

# --- SC-AK-853. Снятием черновика считается вызов клиента, а не слова о нём --------------------
# Команда, которая всего лишь пишет о снятии, судилась наравне с самим снятием: отказ приходил на
# попытку описать этот же дефект.
about_ready="$(jq -n --arg p "$(transcript "$(said 'ЭКЗАМЕН: сдано 5 из 5')" "$(ran 'gh pr create --draft --title x')")" \
    '{session_id:"tests",tool_name:"Bash",tool_input:{command:"grep -rn \"gh pr ready\" docs/"},transcript_path:$p}')"
expect_decision "SC-AK-853 — поиск слов о снятии черновика не судится" exam-guard.sh "$about_ready" PASS

# --- роль выключена деревом ----------------------------------------------------------------
# Дерево называет выключенные роли списком в своей настройке. При выключенном экзаменаторе гард
# молчит: та же правка, которую он отбивал бы, проходит. Выключение соседней роли, пустая
# настройка и настройка, которую не разобрать, экзамена не отменяют.
NO_EXAM="$(transcript "$(say 'правь файл')")"

CLAUDE_PROJECT_DIR="$(tree_with_config '{"rolesOff":["strict-teacher"]}')" \
    e "SC-AK-360 — выключенный деревом экзаменатор правку пропускает" "$NO_EXAM" PASS
CLAUDE_PROJECT_DIR="$(tree_with_config '{"rolesOff":["conscience"]}')" \
    e "SC-AK-361 — выключенная соседняя роль экзамен не отменяет" "$NO_EXAM" deny
CLAUDE_PROJECT_DIR="$(tree_with_config '{"vars":{}}')" \
    e "и без списка выключенных ролей экзамен спрашивается как прежде" "$NO_EXAM" deny
CLAUDE_PROJECT_DIR="$(tree_with_config '{"rolesOff": ["strict-teacher"')" \
    e "SC-AK-362 — настройка, которую не разобрать, роль не выключает" "$NO_EXAM" deny

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

# --- SC-AK-757 — вердикт виден при любой форме доставки, а подделка не считается ------------
# Форму доставки выбирает хост: роль, работающая фоном, отдаёт вердикт уведомлением, а не
# ответом инструмента, — и гард, привязанный к одной форме, запер дерево целиком.
said_string() { jq -c -n --arg t "$1" '{type:"user",message:{content:$t}}'; }
said_field() { jq -c -n --arg t "$1" '{type:"user",message:{content:[{type:"tool_result",tool_use_id:"agent-1",content:"готово"}]},toolUseResult:$t}'; }
said_host() { jq -c -n --arg t "$1" '{type:"queue-operation",text:$t}'; }
said_by_bash() {
    jq -c -n --arg t "$1" '{type:"user",message:{content:[{type:"tool_result",tool_use_id:"bash-1",content:$t}]}}'
}
bash_call() {
    jq -c -n '{type:"assistant",message:{content:[{type:"tool_use",id:"bash-1",name:"Bash",input:{command:"echo x"}}]}}'
}
assistant_says() { jq -c -n --arg t "$1" '{type:"assistant",message:{content:[{type:"text",text:$t}]}}'; }

e "SC-AK-757 — вердикт строковым содержимым записи считается" \
    "$(transcript "$(say 'экзамен')" "$(said_string 'ЭКЗАМЕН: сдано 5 из 5')")" PASS
e "SC-AK-757 — вердикт полем результата вызова считается" \
    "$(transcript "$(say 'экзамен')" "$(said_field 'ЭКЗАМЕН: сдано 5 из 5')")" PASS
e "SC-AK-757 — вердикт записью хоста считается" \
    "$(transcript "$(say 'экзамен')" "$(said_host 'ЭКЗАМЕН: сдано 5 из 5')")" PASS
# Подделка: печать той же строки вызовом оболочки и слово самого помощника.
e "SC-AK-757 — вердикт из ответа оболочки не считается" \
    "$(transcript "$(say 'экзамен')" "$(bash_call)" "$(said_by_bash 'ЭКЗАМЕН: сдано 5 из 5')")" deny
e "SC-AK-757 — вердикт в тексте помощника не считается" \
    "$(transcript "$(say 'экзамен')" "$(assistant_says 'ЭКЗАМЕН: сдано 5 из 5')")" deny

# --- SC-AK-758 — настройка, которой гард выключается, этим гардом не запирается ---------------
free_edit() {
    jq -n --arg p "$1" --arg f "$2" \
        '{session_id:"tests",tool_name:"Edit",tool_input:{file_path:$f},transcript_path:$p}'
}
expect_decision "SC-AK-758 — правка настройки дерева проходит" exam-guard.sh \
    "$(free_edit "$(transcript "$(say 'x')")" '.claude/rt-kit.json')" PASS
expect_decision "SC-AK-758 — правка надстройки профиля проходит" exam-guard.sh \
    "$(free_edit "$(transcript "$(say 'x')")" '.claude/rt-kit/gate-map.sh')" PASS
expect_decision "SC-AK-758 — передача захода пишется без экзамена" exam-guard.sh \
    "$(free_edit "$(transcript "$(say 'x')")" '.claude/handoff/RT-1-probe.md')" PASS
expect_decision "SC-AK-758 — обычный файл судится как прежде" exam-guard.sh \
    "$(free_edit "$(transcript "$(say 'x')")" 'libs/x/src/lib/x.ts')" deny

# --- SC-AK-759 — запись файла вызовом оболочки судится наравне с правкой ----------------------
# Честный путь был закрыт, обходной открыт: агент, который правилам следует, вставал; тот, кто
# их обходит, работал.
shell_in() {
    jq -n --arg p "$1" --arg c "$2" \
        '{session_id:"tests",tool_name:"Bash",tool_input:{command:$c},transcript_path:$p}'
}
expect_decision "SC-AK-759 — запись перенаправлением отбивается" exam-guard.sh \
    "$(shell_in "$(transcript "$(say 'x')")" "printf 'x' > libs/x/src/lib/x.ts")" deny
expect_decision "SC-AK-759 — правка на месте отбивается" exam-guard.sh \
    "$(shell_in "$(transcript "$(say 'x')")" "sed -i '' s/a/b/ libs/x/src/lib/x.ts")" deny
expect_decision "SC-AK-759 — запись в настройку дерева проходит" exam-guard.sh \
    "$(shell_in "$(transcript "$(say 'x')")" "printf '{}' > .claude/rt-kit.json")" PASS
expect_decision "SC-AK-759 — команда без записи файла не судится" exam-guard.sh \
    "$(shell_in "$(transcript "$(say 'x')")" 'git status --short')" PASS

suite_result "гард экзамена"
