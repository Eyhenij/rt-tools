#!/usr/bin/env bash
# События метрик: что дерево решает у себя и какой ответ уходит в наблюдение. Подпись содержимого
# остаётся в дереве, в строку наблюдения попадает только ответ.
#
# Сценарии договорённости: SC-AK-1277, SC-AK-1278.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "СОБЫТИЯ МЕТРИК"

# Рабочее дерево: репозиторий с коммитом и рабочая ветка.
fixture_metric_tree() {
    local dir
    dir="$(fixture_repo_branched main work)"
    printf '%s' "$dir"
}

# Отказ проверки так, как его пишет общий хвост отказа. Довод — имя сессии и текст вызова.
refuse_in() {
    local tree="$1" session="$2" call="$3"
    CLAUDE_PROJECT_DIR="$tree" RT_GUARD_NAME=probe-guard \
        RT_HOOK_INPUT="{\"session_id\":\"$session\",\"tool_input\":{\"command\":\"$call\"}}" \
        bash -c '. "$1/guard-note.sh"; rt_guard_note' _ "$HOOKS"
}

# Признак пустого отказа в записи с этим номером, считая от первой.
empty_of() {
    cat "$1/.claude/rt-kit/observations/"*.jsonl 2>/dev/null | sed -n "$2p" | jq -r '.empty // "нет"'
}

# --- SC-AK-1277. Повтор того же отказа считается пустым ---------------------------------

tree="$(fixture_metric_tree)"
refuse_in "$tree" session-one 'git push'
refuse_in "$tree" session-one 'git push'
report "SC-AK-1277 — первый отказ не пустой" "$(empty_of "$tree" 1)" "0"
report "SC-AK-1277 — второй отказ пустой" "$(empty_of "$tree" 2)" "1"
report "SC-AK-1277 — подпись не ушла в запись" \
    "$(cat "$tree/.claude/rt-kit/observations/"*.jsonl | jq -r 'keys[]' | sort -u | tr '\n' ' ')" \
    "empty ev res sid t v "
rm -rf "$tree"

# Другой вызов и другая сессия — другой отказ, хотя содержимое то же.
tree="$(fixture_metric_tree)"
refuse_in "$tree" session-one 'git push'
refuse_in "$tree" session-one 'git commit'
refuse_in "$tree" session-two 'git commit'
report "SC-AK-1277 — другой вызов не пустой" "$(empty_of "$tree" 2)" "0"
report "SC-AK-1277 — другая сессия не пустая" "$(empty_of "$tree" 3)" "0"
rm -rf "$tree"

# Запись наблюдений не меняет содержимого: каталог не игнорируется, а подпись та же.
tree="$(fixture_metric_tree)"
report "SC-AK-1277 — каталог наблюдений не под игнором" \
    "$(git -C "$tree" check-ignore -q .claude/rt-kit/observations/x.jsonl && echo под || echo нет)" "нет"
refuse_in "$tree" session-one 'git push'
refuse_in "$tree" session-one 'git push'
report "SC-AK-1277 — своя запись не считается правкой" "$(empty_of "$tree" 2)" "1"
rm -rf "$tree"

# --- SC-AK-1278. Правка между отказами оставляет второй честным --------------------------

tree="$(fixture_metric_tree)"
refuse_in "$tree" session-one 'git push'
printf 'edit\n' >> "$tree/package.json"
refuse_in "$tree" session-one 'git push'
report "SC-AK-1278 — незакоммиченная правка" "$(empty_of "$tree" 2)" "0"
rm -rf "$tree"

tree="$(fixture_metric_tree)"
refuse_in "$tree" session-one 'git push'
printf 'new\n' > "$tree/new-file.txt"
refuse_in "$tree" session-one 'git push'
printf 'changed\n' > "$tree/new-file.txt"
refuse_in "$tree" session-one 'git push'
report "SC-AK-1278 — новый файл" "$(empty_of "$tree" 2)" "0"
report "SC-AK-1278 — правка нового файла" "$(empty_of "$tree" 3)" "0"
rm -rf "$tree"

tree="$(fixture_metric_tree)"
refuse_in "$tree" session-one 'git push'
fixture_commit "$tree" extra.txt 'body' 'chore: правка'
refuse_in "$tree" session-one 'git push'
report "SC-AK-1278 — новый коммит" "$(empty_of "$tree" 2)" "0"
rm -rf "$tree"

# --- Отказ в пользу работы ----------------------------------------------------------------

# Вне репозитория сравнивать есть что, и запись не падает. Без записи наблюдений нет и меток.
tree="$(fixture_tree)"
refuse_in "$tree" session-one 'git push'
report "запись идёт и вне репозитория" "$(empty_of "$tree" 1)" "0"
rm -rf "$tree"

tree="$(fixture_metric_tree)"
mkdir -p "$tree/.claude"
printf '{"observe":false}\n' > "$tree/.claude/rt-kit.json"
refuse_in "$tree" session-one 'git push'
report "выключенные наблюдения не оставляют меток" "$(find "$tree/.claude" -name 'refusal-*' | wc -l | tr -d ' ')" "0"
rm -rf "$tree"

suite_result
