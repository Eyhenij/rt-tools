#!/usr/bin/env bash
# Сценарии гарда предложения: что считается просьбой владельца и чем требование снимается.
#
# Проверяется механика, а не карта дерева: запись хода собирается здесь же. Полноту набора
# образцов гард не обещает и здесь — проверяется, что просьба словами из набора ловится, а работа
# над уже приехавшими предложениями требования не получает.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард предложения"

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
    out="$(printf '%s' "$json" | "$HOOKS/proposal-guard.sh" 2>/dev/null)"
    if [ -z "$out" ]; then
        got="PASS"
    else
        got="$(printf '%s' "$out" | jq -r 'if .decision == "block" then "BLOCK" else "PASS" end' 2>/dev/null)"
    fi
    report "$label" "$got" "$want"
}

# --- SC-AK-199 — ход с просьбой о предложении не закрывается без отправки ---------------------
expect_stop "SC-AK-199 — просили отправить, отправки нет" \
    "$(input_stop "$(transcript "$(say 'отправь пропозал по этому месту')" "$(reply 'Написал файл предложения.')")")" BLOCK
expect_stop "SC-AK-199 — «заведи предложение пакету» тоже просьба" \
    "$(input_stop "$(transcript "$(say 'заведи предложение пакету про этот гард')" "$(reply 'Готово, лежит файлом.')")")" BLOCK

# --- SC-AK-200 — отправка в том же ходе снимает требование ------------------------------------
expect_stop "SC-AK-200 — команда позвана тем же ходом" \
    "$(input_stop "$(transcript "$(say 'отправь пропозал')" "$(ran 'npx agent-kit propose')")")" PASS
expect_stop "SC-AK-200 — сухой прогон отправкой не считается" \
    "$(input_stop "$(transcript "$(say 'отправь пропозал')" "$(ran 'npx agent-kit propose --dry-run')")")" BLOCK

# --- SC-AK-201 — работа над уже приехавшими предложениями требования не получает ---------------
# Слово о предложении без глагола отправки — это разбор, а не просьба отправить.
expect_stop "SC-AK-201 — «разбирай пропозалы» отправкой не кончается" \
    "$(input_stop "$(transcript "$(say 'разбирай пропозалы начиная с самого свежего')" "$(reply 'Разобрал первое.')")")" PASS
# Слово «предложение» без соседа о слое правил ходит в каждом втором ходе о другом.
expect_stop "SC-AK-201 — предложение не о слое правил не судится" \
    "$(input_stop "$(transcript "$(say 'напиши предложение в описание PR')" "$(reply 'Дописал.')")")" PASS

# --- отказ в пользу работы ------------------------------------------------------------------
# Повторный заход по тому же ходу не судится: иначе ход не кончится никогда.
expect_stop "повторный заход отпускается" \
    "$(input_stop "$(transcript "$(say 'отправь пропозал')" "$(reply 'Написал.')")" true)" PASS
expect_stop "нет записи хода — нечего судить" "$(input_stop "$TURNS/нетакого.jsonl")" PASS

# Дерево, объявившее каталог предложений пустым, от требования отказалось.
RT_PROPOSALS_DIR='' expect_stop "пустой каталог предложений снимает требование" \
    "$(input_stop "$(transcript "$(say 'отправь пропозал')" "$(reply 'Написал.')")")" PASS

suite_result "гард предложения"
