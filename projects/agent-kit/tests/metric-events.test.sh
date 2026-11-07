#!/usr/bin/env bash
# События метрик: что дерево решает у себя и какой ответ уходит в наблюдение. Подпись содержимого
# остаётся в дереве, в строку наблюдения попадает только ответ.
#
# Сценарии договорённости: SC-AK-1277, SC-AK-1278, SC-AK-1279.
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

# Сессия стоит во второй копии: корень проекта не менялся, а содержимое отказа поменялось.
tree="$(fixture_metric_tree)"
copy="$(fixture_metric_tree)"
refuse_from() {
    CLAUDE_PROJECT_DIR="$tree" RT_GUARD_NAME=probe-guard \
        RT_HOOK_INPUT="{\"session_id\":\"session-one\",\"cwd\":\"$copy\",\"tool_input\":{\"command\":\"git push\"}}" \
        bash -c '. "$1/guard-note.sh"; rt_guard_note' _ "$HOOKS"
}
refuse_from
printf 'edit\n' >> "$copy/package.json"
refuse_from
refuse_from
report "SC-AK-1278 — правка во второй копии снимает повтор" "$(empty_of "$tree" 2)" "0"
report "SC-AK-1277 — повтор во второй копии виден" "$(empty_of "$tree" 3)" "1"
rm -rf "$tree" "$copy"

# --- SC-AK-1279. Красный запуск на том же содержимом потерян ------------------------------

# Дерево с набором из профиля: первая проверка зелёная, вторая как велит файл `red`.
fixture_set_tree() {
    local dir
    dir="$(fixture_metric_tree)"
    mkdir -p "$dir/.claude/rt-kit"
    cat > "$dir/.claude/rt-kit/project.sh" <<'EOF'
rt_push_checks() {
    printf '%s\n' 'true # lint' 'test ! -f red # e2e'
}
EOF
    printf '.claude/\nred\n' > "$dir/.gitignore"
    fixture_commit "$dir" keep.txt 'body' 'chore: старт набора'
    git -C "$dir" add .gitignore 2>/dev/null
    git -C "$dir" -c user.name=probe -c user.email=probe@example.com -c commit.gpgsign=false commit -q -m 'chore: игнор' 2>/dev/null
    printf '%s' "$dir"
}

# Набор так, как его зовёт git-хук: профиль, база, запуск.
set_in() {
    (cd "$1" && bash -c '. "$1/push-set.sh"; rt_push_set_profile "$1" "$PWD"; rt_push_set_run ""' _ "$HOOKS")
}

# Значение поля в строках запуска, по одной на строку.
runs_of() {
    cat "$1/.claude/rt-kit/observations/"*.jsonl 2>/dev/null | jq -r "select(.ev == \"run\") | .$2 // \"нет\""
}

tree="$(fixture_set_tree)"
: > "$tree/red"
set_in "$tree"
report "SC-AK-1279 — строка на каждую проверку" "$(runs_of "$tree" res | tr '\n' ' ')" "green red "
report "SC-AK-1279 — род шага назван" "$(runs_of "$tree" kind | tr '\n' ' ')" "tests e2e "
report "SC-AK-1279 — секунды записаны" "$(runs_of "$tree" secs | grep -cE '^[0-9]+$')" "2"
report "SC-AK-1279 — первый запуск не потерян" "$(runs_of "$tree" wasted | sort -u)" "нет"
set_in "$tree"
report "SC-AK-1279 — зелёную проверку отметка второй раз не запускает" "$(runs_of "$tree" res | tr '\n' ' ')" "green red red "
report "SC-AK-1279 — красный повтор несёт секунды прошлого" "$(runs_of "$tree" wasted | sed -n 3p)" "0"
rm "$tree/red"
set_in "$tree"
report "SC-AK-1279 — зелёный после красного на том же содержимом считает красный" "$(runs_of "$tree" wasted | sed -n 4p)" "0"
rm -rf "$tree"

# Правка между запусками: красный был нужен.
tree="$(fixture_set_tree)"
: > "$tree/red"
set_in "$tree"
printf 'edit\n' >> "$tree/keep.txt"
set_in "$tree"
report "SC-AK-1279 — незакоммиченная правка оставляет запуск нужным" "$(runs_of "$tree" wasted | sort -u)" "нет"
report "SC-AK-1279 — подпись не ушла в запись" \
    "$(cat "$tree/.claude/rt-kit/observations/"*.jsonl | jq -r 'keys[]' | sort -u | tr '\n' ' ')" \
    "ev kind res secs t v "
rm -rf "$tree"

# Запуск заранее пишет те же строки, сессия для этого не нужна.
tree="$(fixture_set_tree)"
: > "$tree/red"
(cd "$tree" && bash "$HOOKS/git-guard-push-ahead.sh" >/dev/null 2>&1)
report "SC-AK-1279 — запуск заранее пишет строки" "$(runs_of "$tree" res | tr '\n' ' ')" "green red "
rm -rf "$tree"

# Секунды потерянного запуска — его собственные, а не следующего.
tree="$(fixture_metric_tree)"
note_run() {
    CLAUDE_PROJECT_DIR="$tree" bash -c '. "$1/metric-marks.sh"; rt_run_note sign-one "$2" "$3" "pnpm test"' \
        _ "$HOOKS" "$(($(date +%s) - $1))" "$2"
}
note_run 120 red
note_run 5 green
report "SC-AK-1279 — потеряны минуты красного запуска" "$(runs_of "$tree" wasted | sed -n 2p | awk '$1 >= 120 && $1 < 125 { print "да" }')" "да"
note_run 5 green
report "SC-AK-1279 — зелёный повтор потерь не несёт" "$(runs_of "$tree" wasted | sed -n 3p)" "нет"
rm -rf "$tree"

# Род шага берётся из закрытого списка, сама команда из дерева не уходит.
for pair in 'pnpm exec nx run admin-e2e:e2e=e2e' 'node tools/visual-gate.mjs ui-kit=shots' \
    'docker build -f x .=image' 'pnpm run serve:auth=stand' 'pnpm exec nx affected -t lint test=tests' \
    'node tools/check-specs.mjs=check'; do
    report "SC-AK-1279 — род шага: ${pair#*=}" \
        "$(bash -c '. "$1/metric-marks.sh"; rt_run_kind "$2"' _ "$HOOKS" "${pair%=*}")" "${pair#*=}"
done

# Старая метка снимается, а счёт, который обязан жить дольше, остаётся.
tree="$(fixture_metric_tree)"
marks="$tree/.claude/rt-kit/observations/.marks"
mkdir -p "$marks"
: > "$marks/runs-2026-01-01"
: > "$marks/counted-pulls"
touch -t 202601010000 "$marks/runs-2026-01-01" "$marks/counted-pulls"
note_run 1 green
report "старая метка снята" "$(ls "$marks" | grep -c 'runs-2026-01-01')" "0"
report "чужой файл меток остался" "$(ls "$marks" | grep -c 'counted-pulls')" "1"
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
