#!/usr/bin/env bash
# Наблюдения: что записывается о слое правил, что в запись не попадает ни при каких доводах и
# где она молчит.
#
# Сценарии договорённости: SC-AK-70 … SC-AK-73.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "НАБЛЮДЕНИЯ"

# Дерево с настройкой пакета. Довод — тело настройки; без него настройки нет вовсе, и запись
# идёт умолчанием.
fixture_observed_tree() {
    local dir config
    dir="$(fixture_tree)"
    config="$1"
    [ -n "$config" ] && printf '%s\n' "$config" > "$dir/.claude/rt-kit.json"
    printf '%s' "$dir"
}

# Все наблюдения дерева одной строкой: файлов по дню бывает несколько, а сценарию нужен факт.
notes_of() {
    cat "$1/.claude/rt-kit/observations/"*.jsonl 2>/dev/null
}

# Наблюдение записано и несёт образец.
expect_note() {
    local label="$1" tree="$2" pattern="$3" got
    if notes_of "$tree" | grep -qE "$pattern"; then got="есть"; else got="нет"; fi
    report "$label" "$got" "есть"
}

# Наблюдения нет вовсе — ни строки.
expect_no_notes() {
    local label="$1" tree="$2" got
    if [ -z "$(notes_of "$tree")" ]; then got="пусто"; else got="есть"; fi
    report "$label" "$got" "пусто"
}

# Вызов записи из одноразового дерева: так её зовут гарды.
note_in() {
    local tree="$1"
    shift
    CLAUDE_PROJECT_DIR="$tree" bash -c '. "$1/observe.sh" 2>/dev/null; shift; rt_note "$@"' _ "$HOOKS" "$@"
}

# --- SC-AK-70. Наблюдение ложится в дерево, а не во временный каталог -------------------

tree="$(fixture_observed_tree '')"
note_in "$tree" gate-deny res=styling-bem kind=scss sid=session-one
expect_note "SC-AK-70 — запись легла в дерево" "$tree" '"ev":"gate-deny"'
expect_note "SC-AK-70 — ресурс назван" "$tree" '"res":"styling-bem"'
expect_note "SC-AK-70 — род правки назван" "$tree" '"kind":"scss"'
expect_note "SC-AK-70 — версия пакета проставлена" "$tree" '"v":"[^"]+"'
report "SC-AK-70 — файл назван днём" \
    "$(basename "$(ls "$tree/.claude/rt-kit/observations/" | head -1)" .jsonl | grep -cE '^[0-9]{4}-[0-9]{2}-[0-9]{2}$')" "1"
rm -rf "$tree"

# Заход виден по признаку сессии, а сама сессия из него не восстанавливается.
tree="$(fixture_observed_tree '')"
note_in "$tree" skill-load res=task-flow sid=session-one
note_in "$tree" skill-load res=doc-style sid=session-one
expect_note "SC-AK-70 — признак сессии проставлен" "$tree" '"sid":"[0-9]+"'
report "SC-AK-70 — имени сессии в записи нет" "$(notes_of "$tree" | grep -c 'session-one')" "0"
report "SC-AK-70 — признак у одной сессии один" "$(notes_of "$tree" | grep -oE '"sid":"[0-9]+"' | sort -u | wc -l | tr -d ' ')" "1"
rm -rf "$tree"

# --- SC-AK-71. Наблюдение не называет дерева -------------------------------------------

tree="$(fixture_observed_tree '')"
note_in "$tree" gate-deny res=projects/ui-kit/src/lib/card/card.scss kind=scss sid=one
expect_note "SC-AK-71 — событие записано" "$tree" '"ev":"gate-deny"'
report "SC-AK-71 — путь в запись не попал" "$(notes_of "$tree" | grep -c 'ui-kit')" "0"
report "SC-AK-71 — поля с путём нет вовсе" "$(notes_of "$tree" | grep -c '"res"')" "0"
rm -rf "$tree"

tree="$(fixture_observed_tree '')"
note_in "$tree" gate-deny res='styling bem; rm -rf /' kind='scss"' sid=one
report "SC-AK-71 — пробелы и кавычки вычищены" "$(notes_of "$tree" | grep -cE '"res":"stylingbem;rm-rf"')" "0"
report "SC-AK-71 — строка осталась разбираемой" "$(notes_of "$tree" | jq -r '.ev' 2>/dev/null)" "gate-deny"
rm -rf "$tree"

# --- SC-AK-72. Выключатель дерева гасит запись целиком ----------------------------------

tree="$(fixture_observed_tree '{"observe": false}')"
note_in "$tree" gate-deny res=styling-bem kind=scss sid=one
note_in "$tree" skill-load res=task-flow sid=one
expect_no_notes "SC-AK-72 — выключенная запись молчит" "$tree"
rm -rf "$tree"

tree="$(fixture_observed_tree '{"observe": true}')"
note_in "$tree" skill-load res=task-flow sid=one
expect_note "SC-AK-72 — включённая запись пишет" "$tree" '"ev":"skill-load"'
rm -rf "$tree"

# Настройка без ключа записи выключателем не считается: умолчание — писать.
tree="$(fixture_observed_tree '{"vars": {}}')"
note_in "$tree" skill-load res=task-flow sid=one
expect_note "SC-AK-72 — настройка без ключа пишет" "$tree" '"ev":"skill-load"'
rm -rf "$tree"

# Сломанная настройка выключателем не считается тоже: иначе битый JSON тихо гасил бы запись.
tree="$(fixture_observed_tree '{сломано')"
note_in "$tree" skill-load res=task-flow sid=one
expect_note "SC-AK-72 — сломанная настройка не гасит запись" "$tree" '"ev":"skill-load"'
rm -rf "$tree"

# --- SC-AK-73. Непишущееся наблюдение не останавливает работу ---------------------------

tree="$(fixture_observed_tree '')"
# Каталог наблюдений занят файлом: завести его под записи не выйдет.
mkdir -p "$tree/.claude/rt-kit"
printf 'занято\n' > "$tree/.claude/rt-kit/observations"
if note_in "$tree" gate-deny res=styling-bem kind=scss sid=one; then got="PASS"; else got="DENY"; fi
report "SC-AK-73 — недоступный каталог не отбивает" "$got" "PASS"
rm -rf "$tree"

# --- Гарды зовут запись сами -----------------------------------------------------------

gate_session_reset
tree="$(fixture_observed_tree '')"
mkdir -p "$tree/.claude/skills/styling-bem"
printf 'law: frontend-application\n' > "$tree/.claude/skills/styling-bem/SKILL.md"
CLAUDE_PROJECT_DIR="$tree" "$HOOKS/skill-gate.sh" >/dev/null 2>&1 <<< "$(input_edit "$tree/apps/site/src/card.scss" '.card { color: red; }')"
expect_note "гейт записал отбитие" "$tree" '"ev":"gate-deny".*"res":"styling-bem"'
expect_note "гейт назвал род правки" "$tree" '"kind":"scss"'
report "гейт не назвал пути" "$(notes_of "$tree" | grep -c 'apps/site')" "0"
rm -rf "$tree"

tree="$(fixture_observed_tree '')"
CLAUDE_PROJECT_DIR="$tree" "$HOOKS/skill-loaded.sh" >/dev/null 2>&1 \
    <<< '{"session_id":"tests","tool_name":"Skill","tool_input":{"skill":"task-flow"}}'
expect_note "загрузка правила записана" "$tree" '"ev":"skill-load".*"res":"task-flow"'
rm -rf "$tree"

# Гард главной ветки: отказ — тоже наблюдение.
tree="$(fixture_observed_tree '')"
repo="$(fixture_repo_branched main main)"
CLAUDE_PROJECT_DIR="$tree" "$HOOKS/git-guard-main.sh" >/dev/null 2>&1 \
    <<< "$(input_cmd 'git commit -m "chore: проба"' Bash "$repo")"
expect_note "гард главной ветки записал отказ" "$tree" '"ev":"guard-deny".*"res":"git-guard-main"'
# Состав полей закрыт: ветка, путь и текст отказа в наблюдение не попадают не потому, что их
# вычистили, а потому, что полей под них нет.
report "лишних полей в записи нет" \
    "$(notes_of "$tree" | jq -r 'keys | join(",")' 2>/dev/null | sort -u)" "ev,res,sid,t,v"
rm -rf "$tree" "$repo"

# --- SC-AK-811. Отбой пишет общий хвост отказа, а не сам гард ---------------------------

# Вызов хвоста из одноразового дерева: так его зовут гарды на отказе. Имя гарда приходит
# переменной — той самой, которой гард заявляет о себе.
tail_in() {
    local tree="$1" name="$2"
    CLAUDE_PROJECT_DIR="$tree" RT_GUARD_NAME="$name" RT_HOOK_INPUT='{"session_id":"tests"}' \
        bash -c '. "$1/deny-tail.sh" 2>/dev/null; rt_deny_tail "" >/dev/null' _ "$HOOKS"
}

tree="$(fixture_observed_tree '')"
tail_in "$tree" proba-guard
expect_note "SC-AK-811 — хвост отказа записал отбой" "$tree" '"ev":"guard-deny".*"res":"proba-guard"'
expect_note "SC-AK-811 — признак сессии проставлен" "$tree" '"sid":"[0-9]+"'
rm -rf "$tree"

# Не заявивший имени не пишет ничего: своё отбитие он считает сам, и второе событие о том же в
# счёт не идёт.
tree="$(fixture_observed_tree '')"
CLAUDE_PROJECT_DIR="$tree" RT_HOOK_INPUT='{"session_id":"tests"}' \
    bash -c '. "$1/deny-tail.sh" 2>/dev/null; rt_deny_tail "" >/dev/null' _ "$HOOKS"
expect_no_notes "SC-AK-811 — гард без заявки имени молчит" "$tree"
rm -rf "$tree"

# Хвост отказа остаётся хвостом: текст двух законных ходов он печатает наравне с записью.
tree="$(fixture_observed_tree '')"
said="$(CLAUDE_PROJECT_DIR="$tree" RT_GUARD_NAME=proba-guard \
    bash -c '. "$1/deny-tail.sh" 2>/dev/null; rt_deny_tail ""' _ "$HOOKS")"
report "SC-AK-811 — текст хвоста на месте" "$(printf '%s' "$said" | grep -c 'Ходов отсюда два')" "1"
rm -rf "$tree"

gate_session_cleanup
suite_result "наблюдения"
