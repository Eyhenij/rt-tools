#!/usr/bin/env bash
# Сценарии гарда ожидания: что считается открытием PR и чем требование снимается.
#
# Проверяется механика, а не карта дерева: запись хода собирается здесь же. Полноту набора
# образцов гард не обещает и здесь — проверяется, что открытие PR ловится всеми тремя формами, а
# первое действие по следующей задаче требование снимает.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард ожидания"

TURNS="$(mktemp -d)"
cleanup() { rm -rf "$TURNS"; }
trap cleanup EXIT

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
reply() { jq -c -n --arg t "$1" '{type:"assistant",message:{content:[{type:"text",text:$t}]}}'; }
ran() {
    jq -c -n --arg c "$1" \
        '{type:"assistant",message:{content:[{type:"tool_use",name:"Bash",input:{command:$c}}]}}'
}

input_stop() {
    jq -n --arg p "$1" --argjson a "${2:-false}" '{session_id:"tests",transcript_path:$p,stop_hook_active:$a}'
}

expect_stop() {
    local label="$1" json="$2" want="$3" out got
    out="$(printf '%s' "$json" | "$HOOKS/waiting-turn-guard.sh" 2>/dev/null)"
    if [ -z "$out" ]; then
        got="PASS"
    else
        got="$(printf '%s' "$out" | jq -r 'if .decision == "block" then "BLOCK" else "PASS" end' 2>/dev/null)"
    fi
    report "$label" "$got" "$want"
}

# --- SC-AK-246 — ход, открывший PR и не взявший следующую задачу, не закрывается --------------
expect_stop "SC-AK-246 — PR открыт, дальше ничего" \
    "$(input_stop "$(transcript "$(say 'открывай PR')" "$(ran 'gh pr create --draft --title x --body-file тело.md')" "$(reply 'PR #10 открыт. Пока жду, беру следующую задачу.')")")" BLOCK
# Слова о следующей задаче действием не являются: гард судит команды, а не обещания.
expect_stop "SC-AK-246 — обещание следующей задачи требования не снимает" \
    "$(input_stop "$(transcript "$(say 'открывай PR')" "$(ran 'gh pr create --draft --title x')" "$(reply 'Беру задачу #11.')")")" BLOCK
# Открытие вызовом хостинга напрямую ловится наравне с командой клиента.
expect_stop "SC-AK-246 — открытие через вызов хостинга" \
    "$(input_stop "$(transcript "$(say 'открывай')" "$(ran 'gh api -X POST repos/o/r/pulls -f title=x')" "$(reply 'Открыт.')")")" BLOCK
# Гард переносится между хостингами целиком: набор называет все три формы.
expect_stop "SC-AK-246 — форма второго хостинга" \
    "$(input_stop "$(transcript "$(say 'открывай')" "$(ran 'glab mr create --draft --title x')" "$(reply 'Открыт.')")")" BLOCK
expect_stop "SC-AK-246 — форма третьего хостинга" \
    "$(input_stop "$(transcript "$(say 'открывай')" "$(ran 'az repos pr create --draft true --title x')" "$(reply 'Открыт.')")")" BLOCK

# --- SC-AK-247 — первое действие по следующей задаче снимает требование ------------------------
expect_stop "SC-AK-247 — задача заведена тем же ходом" \
    "$(input_stop "$(transcript "$(say 'открывай PR')" "$(ran 'gh pr create --draft --title x')" "$(ran 'npm run task:new -- --title y --slug z')")")" PASS
expect_stop "SC-AK-247 — ветка заведена тем же ходом" \
    "$(input_stop "$(transcript "$(say 'открывай PR')" "$(ran 'gh pr create --draft --title x')" "$(ran 'git checkout -b RT-11-next')")")" PASS
expect_stop "SC-AK-247 — папка задачи заведена тем же ходом" \
    "$(input_stop "$(transcript "$(say 'открывай PR')" "$(ran 'gh pr create --draft --title x')" "$(ran 'cp -r docs/tasks/_template docs/tasks/RT-11-next')")")" PASS
expect_stop "SC-AK-247 — колонка очереди работ двинута тем же ходом" \
    "$(input_stop "$(transcript "$(say 'открывай PR')" "$(ran 'gh pr create --draft --title x')" "$(ran 'npm run task:move -- 11 in-progress')")")" PASS

# --- SC-AK-248 — ход без открытия PR гард ожидания не судит ------------------------------------
expect_stop "SC-AK-248 — PR не открывали" \
    "$(input_stop "$(transcript "$(say 'почини стили')" "$(ran 'pnpm run lint')" "$(reply 'Зелено.')")")" PASS
# Правка тела уже открытого PR открытием не является.
expect_stop "SC-AK-248 — правка тела PR открытием не считается" \
    "$(input_stop "$(transcript "$(say 'перепиши тело')" "$(ran 'gh api -X PATCH repos/o/r/pulls/10 -f body=x')" "$(reply 'Переписал.')")")" PASS

# --- отказ в пользу работы ------------------------------------------------------------------
# Повторный заход по тому же ходу не судится: иначе ход не кончится никогда.
expect_stop "повторный заход отпускается" \
    "$(input_stop "$(transcript "$(say 'открывай PR')" "$(ran 'gh pr create --draft --title x')" "$(reply 'Открыт.')")" true)" PASS
expect_stop "нет записи хода — нечего судить" "$(input_stop "$TURNS/нетакого.jsonl")" PASS

suite_result "гард ожидания"
