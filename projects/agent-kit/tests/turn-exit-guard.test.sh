#!/usr/bin/env bash
# Сценарии стража выходов хода: чем ход кончается законно и что выходом не является.
#
# Проверяется механика, а не карта дерева: запись хода и папка задачи собираются здесь же.
# Страж судит пару — объявленное состояние работы и то, что за ход по ней сделано.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "страж выходов хода"

TURNS="$(mktemp -d)"
REPO="$(fixture_repo RT-1-probe)"
export CLAUDE_PROJECT_DIR="$REPO"
cleanup() { rm -rf "$TURNS" "$REPO"; }
trap cleanup EXIT

TASK="$REPO/docs/tasks/RT-1-probe"
mkdir -p "$TASK"

state_is() {
    printf '# Ход работы\n\n## Где стоим\n\n- **Состояние:** `%s`\n- **Следующий шаг:** дописать страж\n' \
        "$1" > "$TASK/progress.md"
}

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
reply() { jq -c -n --arg t "$1" '{type:"assistant",message:{content:[{type:"tool_use",name:"Read",input:{file_path:"a.md"}}]}}'; }
ran() {
    jq -c -n --arg c "$1" \
        '{type:"assistant",message:{content:[{type:"tool_use",name:"Bash",input:{command:$c}}]}}'
}
edited() {
    jq -c -n '{type:"assistant",message:{content:[{type:"tool_use",name:"Edit",input:{file_path:"a.md"}}]}}'
}
asked() {
    jq -c -n '{type:"assistant",message:{content:[{type:"tool_use",name:"AskUserQuestion",input:{questions:[]}}]}}'
}
answered() { jq -c -n --arg t "$1" '{type:"user",message:{content:[{type:"tool_result",content:$t}]}}'; }

input_stop() {
    jq -n --arg p "$1" --arg d "$REPO" --argjson a "${2:-false}" \
        '{session_id:"tests",transcript_path:$p,cwd:$d,stop_hook_active:$a}'
}

expect_stop() {
    local label="$1" json="$2" want="$3" out got
    out="$(printf '%s' "$json" | "$HOOKS/turn-exit-guard.sh" 2>/dev/null)"
    if [ -z "$out" ]; then
        got="PASS"
    else
        got="$(printf '%s' "$out" | jq -r 'if .decision == "block" then "BLOCK" else "PASS" end' 2>/dev/null)"
    fi
    report "$label" "$got" "$want"
}

# --- ход, кончившийся отчётом ------------------------------------------------------------
# Он выглядит работой лучше всякой другой: полон, называет номера и состояния, и пустоты за
# ним не видно. Ровно его страж и ловит.
state_is 'этап-идёт'
expect_stop "SC-AK-296 — ход, в котором по работе не сделано ничего, не закрывается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply)" )")" BLOCK

# --- четыре законных выхода ---------------------------------------------------------------
expect_stop "SC-AK-297 — правка файла ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(edited)")")" PASS
expect_stop "SC-AK-298 — команда, меняющая дерево, ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(ran 'git commit -m x')")")" PASS
expect_stop "SC-AK-299 — вопрос владельцу ход отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(asked)")")" PASS
expect_stop "SC-AK-300 — отказ гарда кончает ход" \
    "$(input_stop "$(transcript "$(say 'правь')" "$(ran 'echo x > a.ts')" "$(answered 'BLOCKED by task-flow: нет замысла')")")" PASS
expect_stop "SC-AK-301 — написанная передача захода кончает ход" \
    "$(input_stop "$(transcript "$(say 'закрывай заход')" "$(ran 'cat > .claude/handoff/2026-08-19.md')")")" PASS

# --- слово владельца ------------------------------------------------------------------------
# Судится реплика самого владельца, а не пересказ исполнителя: иначе остановку объявлял бы тот,
# кому она в эту минуту удобна.
expect_stop "SC-AK-302 — сказанная владельцем остановка ход отпускает" \
    "$(input_stop "$(transcript "$(say 'останови работу, дальше сам')" "$(reply)")")" PASS
expect_stop "SC-AK-303 — остановка, объявленная исполнителем, ход не отпускает" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(jq -c -n '{type:"assistant",message:{content:[{type:"text",text:"останавливаюсь на этом"}]}}')")")" BLOCK

# --- состояние работы -------------------------------------------------------------------------
# Отданная и влитая работа чужого шага уже дождалась: дальше её двигает владелец.
state_is 'работа-отдана'
expect_stop "SC-AK-304 — в отданной работе ход закрывается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply)")")" PASS
state_is 'влито'
expect_stop "SC-AK-305 — во влитой работе ход закрывается" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply)")")" PASS

# --- отказ в пользу работы ---------------------------------------------------------------------
state_is 'этап-идёт'
expect_stop "SC-AK-306 — повторный заход по тому же ходу не судится" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply)")" true)" PASS

rm -f "$TASK/progress.md"
expect_stop "SC-AK-307 — работа без хода работы не судится" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply)")")" PASS

printf '# Ход работы\n\n## Где стоим\n\n- **Этап:** 1 из 2\n' > "$TASK/progress.md"
expect_stop "SC-AK-308 — ход работы без объявленного состояния не судится" \
    "$(input_stop "$(transcript "$(say 'продолжай')" "$(reply)")")" PASS

state_is 'этап-идёт'
exit_code_of() {
    printf '%s' "$2" | "$HOOKS/turn-exit-guard.sh" >/dev/null 2>&1
    report "$1" "код:$?" "код:0"
}
exit_code_of "пустой вход пропускается" ''
exit_code_of "неразбираемый вход пропускается" 'не json'
exit_code_of "запись хода, которой нет, пропускается" "$(input_stop "$TURNS/нет-такой.jsonl")"

suite_result "страж выходов хода"
