#!/usr/bin/env bash
# Сценарии гарда предложения: что считается просьбой владельца и чем требование снимается.
#
# Проверяется механика, а не карта дерева: запись хода собирается здесь же. Полноту набора
# образцов гард не обещает и здесь — проверяется, что просьба словами из набора ловится, а работа
# над уже приехавшими предложениями требования не получает.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард предложения"

TURNS="$(mktemp -d)"

# Дерево фикстуры: гард судит только там, где каталог предложений есть на диске, — а рабочий
# каталог прогона у наборов свой, и в нём этого каталога не бывает. Без своего дерева набор
# зеленел бы на пропуске: сценарии, ждущие отказа, проходили бы мимо гарда целиком.
TREE="$(mktemp -d)"
mkdir -p "$TREE/.claude/rt-kit/proposals"
export CLAUDE_PROJECT_DIR="$TREE"

cleanup() { rm -rf "$TURNS" "$TREE"; }
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

# --- SC-AK-674 — отказ называет команду, исполнимую в этом дереве -----------------------------
# Названная наугад команда стоит исполнителю хода: отказ читается как указание, и вызов бинаря,
# которого в дереве нет, отвечает отказом установки. Проверяется текст отказа, а не вердикт.
expect_command() {
    local label="$1" tree="$2" want="$3" out got
    out="$(printf '%s' "$(input_stop "$(transcript "$(say 'отправь пропозал')" "$(reply 'Написал файл.')")")" \
        | CLAUDE_PROJECT_DIR="$tree" "$HOOKS/proposal-guard.sh" 2>/dev/null)"
    got="$(printf '%s' "$out" | jq -r '.reason // ""' 2>/dev/null | grep -c -- "$want")"
    report "$label" "$([ "$got" -gt 0 ] && echo FOUND || echo MISSING)" FOUND
}

with_bin="$(mktemp -d)"
mkdir -p "$with_bin/node_modules/.bin" "$with_bin/.claude/rt-kit/proposals"
printf '#!/bin/sh\n' >"$with_bin/node_modules/.bin/agent-kit"
chmod +x "$with_bin/node_modules/.bin/agent-kit"
expect_command "SC-AK-674 — пакет зависимостью: зовётся бинарь" "$with_bin" "npx agent-kit propose"

with_built="$(mktemp -d)"
mkdir -p "$with_built/dist/agent-kit/bin" "$with_built/.claude/rt-kit/proposals"
printf '' >"$with_built/dist/agent-kit/bin/agent-kit.js"
expect_command "SC-AK-674 — пакет исходниками: зовётся собранный вход" "$with_built" "node dist/agent-kit/bin/agent-kit.js propose"

# --- SC-AK-773 — просьба ловится и латиницей, а дерево без каталога не судится ----------------
# Заход, который владелец ведёт по-английски, отличается от русского словами, а требование в нём
# то же.
expect_stop "SC-AK-773 — «send a proposal» — та же просьба" \
    "$(input_stop "$(transcript "$(say 'send a proposal to the rule layer about this guard')" "$(reply 'Wrote the file.')")")" BLOCK
expect_stop "SC-AK-773 — отправка тем же ходом снимает и её" \
    "$(input_stop "$(transcript "$(say 'file a proposal upstream')" "$(ran 'npx agent-kit propose')")")" PASS
# Слово без соседа о слое правил не считается и на латинице.
expect_stop "SC-AK-773 — proposal не о слое правил не судится" \
    "$(input_stop "$(transcript "$(say 'write a proposal section in the PR body')" "$(reply 'Added.')")")" PASS

# Каталога предложений нет на диске — дерево механизмом не пользуется, и стража ему не навязывают.
no_dir="$(mktemp -d)"
out="$(printf '%s' "$(input_stop "$(transcript "$(say 'отправь пропозал')" "$(reply 'Написал файл.')")")" \
    | CLAUDE_PROJECT_DIR="$no_dir" "$HOOKS/proposal-guard.sh" 2>/dev/null)"
report "SC-AK-773 — дерево без каталога предложений не судится" "${out:-PASS}" PASS
rm -rf "$no_dir"

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
