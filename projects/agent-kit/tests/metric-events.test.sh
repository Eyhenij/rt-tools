#!/usr/bin/env bash
# События метрик: что дерево решает у себя и какой ответ уходит в наблюдение. Подпись содержимого
# остаётся в дереве, в строку наблюдения попадает только ответ.
#
# Сценарии договорённости: SC-AK-1277, SC-AK-1278, SC-AK-1279, SC-AK-1290, SC-AK-1291.
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

# Сколько наблюдений этого рода записано.
notes_count() {
    cat "$1/.claude/rt-kit/observations/"*.jsonl 2>/dev/null | grep -c "\"ev\":\"$2\""
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

# Запуск из второй копии пишет в основную: тяжёлые шаги идут оттуда, и их минуты нельзя терять.
tree="$(fixture_set_tree)"
copy="$(mktemp -d)/copy"
git -C "$tree" worktree add -q -b second "$copy" 2>/dev/null
mkdir -p "$copy/.claude/rt-kit"
cp "$tree/.claude/rt-kit/project.sh" "$copy/.claude/rt-kit/project.sh"
: > "$copy/red"
set_in "$copy"
report "SC-AK-1279 — запуски из второй копии лежат в основной" "$(runs_of "$tree" res | tr '\n' ' ')" "green red "
report "SC-AK-1279 — во второй копии записей нет" "$(ls "$copy/.claude/rt-kit/observations" 2>/dev/null | wc -l | tr -d ' ')" "0"
rm -rf "$tree" "$(dirname "$copy")"

# Каталог наблюдений не попадает в историю и в дереве, которое про него ничего не знает.
tree="$(fixture_metric_tree)"
report "каталог наблюдений: до первой записи игнора нет" \
    "$(git -C "$tree" check-ignore -q .claude/rt-kit/observations/x.jsonl && echo под || echo нет)" "нет"
CLAUDE_PROJECT_DIR="$tree" RT_GUARD_NAME=probe-guard RT_HOOK_INPUT='{"session_id":"s"}' \
    bash -c '. "$1/guard-note.sh"; rt_guard_note' _ "$HOOKS"
report "каталог наблюдений: git его не берёт" "$(git -C "$tree" add -n -A 2>/dev/null | grep -c 'observations')" "0"
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

# --- Передача на ревью ----------------------------------------------------------------------

# Метка передачи ветки: коммит и дерево головы. Имя файла считается той же записью, что в проверке.
handover_of() {
    CLAUDE_PROJECT_DIR="$1" bash -c '. "$1/metric-marks.sh"; cat "$(rt_branch_mark handover "$2")" 2>/dev/null' _ "$HOOKS" "$2"
}

guard_in() {
    input_cmd "$2" Bash "$1" | CLAUDE_PROJECT_DIR="$1" "$HOOKS/git-guard-delivery.sh" >/dev/null 2>&1
}

# Конец вызова: подпись кладёт хук после него, а не проверка до него.
after_in() {
    local answer="${3:-}"
    [ -n "$answer" ] || answer='{}'
    jq -n --arg c "$2" --arg d "$1" --argjson r "$answer" \
        '{session_id:"tests",tool_name:"Bash",tool_input:{command:$c},cwd:$d,tool_response:$r}' \
        | CLAUDE_PROJECT_DIR="$1" "$HOOKS/handover-mark.sh" >/dev/null 2>&1
}

open_in() {
    guard_in "$1" "$2"
    after_in "$1" "$2"
}

READY='gh pr create --title "[RT-7] Сделано" --base main --reviewer owner --body x'
tree="$(fixture_repo_branched main RT-7-probe)"
open_in "$tree" 'gh pr create --title "[RT-7] Сделано" --base main --draft --reviewer owner --body x'
report "SC-AK-1297 — передача:черновик ещё не передан" "$(handover_of "$tree" RT-7-probe)" ""
open_in "$tree" 'gh pr create --title "[RT-7] Сделано" --base main --body x'
report "SC-AK-1297 — передача:заявка без проверяющего не передана" "$(handover_of "$tree" RT-7-probe)" ""
guard_in "$tree" "$READY"
report "SC-AK-1297 — передача:до конца вызова подписи нет" "$(handover_of "$tree" RT-7-probe)" ""
after_in "$tree" "$READY" '{"exit_code":1}'
report "SC-AK-1297 — передача:упавший вызов подписи не оставляет" "$(handover_of "$tree" RT-7-probe)" ""
open_in "$tree" "$READY"
want="$(git -C "$tree" rev-parse HEAD) $(git -C "$tree" rev-parse 'HEAD^{tree}')"
report "SC-AK-1297 — передача:открытие готовой заявки оставляет подпись" "$(handover_of "$tree" RT-7-probe)" "$want"
fixture_commit "$tree" extra.txt 'body' 'chore: правка после передачи'
open_in "$tree" "$READY"
report "SC-AK-1297 — передача:первая подпись остаётся" "$(handover_of "$tree" RT-7-probe)" "$want"
rm -rf "$tree"

# Проверка пропустила, а следующая в ряду отказала: хук после вызова не приходит, подписи нет.
tree="$(fixture_repo_branched main RT-7-probe)"
guard_in "$tree" "$READY"
report "SC-AK-1297 — передача:отказанный другой проверкой вызов подписи не оставляет" "$(handover_of "$tree" RT-7-probe)" ""
rm -rf "$tree"

# Снятие черновика: голова приходит с хостинга.
tree="$(fixture_repo_branched main RT-8-probe)"
mkdir -p "$tree/.claude/rt-kit"
printf 'rt_pull_state() { printf "%%s" %s; }\n' \
    "'{\"exists\":true,\"number\":9,\"draft\":true,\"reviewed\":true,\"conflicting\":false,\"branch\":\"RT-8-probe\"}'" \
    > "$tree/.claude/rt-kit/project.sh"
open_in "$tree" 'gh pr ready 9'
report "SC-AK-1297 — передача:снятие черновика оставляет подпись" \
    "$(handover_of "$tree" RT-8-probe)" "$(git -C "$tree" rev-parse HEAD) $(git -C "$tree" rev-parse 'HEAD^{tree}')"
rm -rf "$tree"

# Отказ передачей не считается: заявка не ушла.
tree="$(fixture_repo_branched main RT-9-probe)"
fixture_commit "$tree" docs/tasks/RT-9-probe/plan.md 'план' 'docs: папка задачи'
open_in "$tree" 'gh pr create --title "[RT-9] Сделано" --base main --body x'
report "SC-AK-1297 — передача:отказанная заявка подписи не оставляет" "$(handover_of "$tree" RT-9-probe)" ""
rm -rf "$tree"

# --- SC-AK-1290. Сообщение считается и не хранится ----------------------------------------

prompt_in() {
    jq -n --arg p "$2" --arg d "$1" '{session_id:"session-one",prompt:$p,cwd:$d}' \
        | CLAUDE_PROJECT_DIR="$1" "$HOOKS/owner-corrections.sh"
}

corrections_of() {
    CLAUDE_PROJECT_DIR="$1" bash -c '. "$1/metric-marks.sh"; cat "$(rt_branch_mark corrections work)" 2>/dev/null' _ "$HOOKS" \
        | tr '\n' ' '
}

tree="$(fixture_metric_tree)"
report "SC-AK-1290 — хук молчит" "$(prompt_in "$tree" 'Это неправильно, особое слово девять')" ""
report "SC-AK-1290 — счётчик ветки вырос" "$(corrections_of "$tree")" "before "
report "SC-AK-1290 — наблюдение записано" "$(notes_count "$tree" owner-correction)" "1"
report "SC-AK-1290 — текста нет ни в одном файле" \
    "$(grep -rl 'особое слово девять' "$tree/.claude" 2>/dev/null | wc -l | tr -d ' ')" "0"
prompt_in "$tree" 'Спасибо, отлично'
report "SC-AK-1290 — сообщение мимо образцов не считается" "$(corrections_of "$tree")" "before "
prompt_in "$tree" '<task-notification>это неправильно</task-notification>'
report "SC-AK-1290 — сообщение приложения не считается" "$(corrections_of "$tree")" "before "
CLAUDE_PROJECT_DIR="$tree" RT_HOOK_INPUT="{\"cwd\":\"$tree\"}" \
    bash -c '. "$1/metric-marks.sh"; rt_handover_mark work' _ "$HOOKS"
prompt_in "$tree" 'Переделай заголовок'
report "SC-AK-1290 — правка после передачи названа" "$(corrections_of "$tree")" "before after "
rm -rf "$tree"

# Вне репозитория ветки нет: счётчика нет, а наблюдение и ход не страдают.
tree="$(fixture_tree)"
report "SC-AK-1290 — вне репозитория хук молчит" "$(prompt_in "$tree" 'это неправильно')" ""
rm -rf "$tree"

# --- Итоги заявок: значение по умолчанию и соединение с метками ---------------------------

# Поддельный клиент хостинга: список заявок и коммиты одной из них. Настоящий клиент здесь не зовётся.
fixture_host() {
    local dir
    dir="$(mktemp -d)"
    cat > "$dir/gh" <<'EOF'
#!/usr/bin/env bash
case "$1 $2" in
    'pr list')
        printf '%s' '[{"number":31,"state":"MERGED","headRefName":"RT-5-probe","title":"[RT-5] Сделано","closedAt":"2026-08-10T10:00:00Z"},
{"number":32,"state":"CLOSED","headRefName":"RT-6-probe","title":"[RT-6] Брошено","closedAt":"2026-08-11T10:00:00Z"},
{"number":33,"state":"OPEN","headRefName":"RT-7-probe","title":"[RT-7] Идёт","closedAt":null},
{"number":34,"state":"MERGED","headRefName":"revert-31-RT-5-probe","title":"Revert \"[RT-5] Сделано\"","closedAt":"2026-08-12T10:00:00Z"}]'
        ;;
    'api repos/{owner}/{repo}/issues/6') printf '%s' '["epic"]' ;;
    'api repos/{owner}/{repo}/issues/'*) printf '%s' '["bug"]' ;;
    api*) printf '%s' '[{"sha":"c1","tree":"t1","parents":1}]' ;;
esac
EOF
    chmod +x "$dir/gh"
    printf '%s' "$dir"
}

# Значение по умолчанию читается как его зовёт разложенное дерево.
outcomes_in() {
    (cd "$1" && PATH="$2:$PATH" CLAUDE_PROJECT_DIR="$1" RT_BOARD_EPIC_LABEL=epic \
        bash "$HOOKS/pull-outcomes.sh" 2026-07-01 2>/dev/null)
}

tree="$(fixture_metric_tree)"
host="$(fixture_host)"
CLAUDE_PROJECT_DIR="$tree" RT_HOOK_INPUT="{\"cwd\":\"$tree\"}" bash -c '
    . "$1/metric-marks.sh"
    printf "c1 t1\n" > "$(rt_branch_mark handover RT-5-probe)"
    printf "before\nafter\nafter\n" > "$(rt_branch_mark corrections RT-5-probe)"' _ "$HOOKS"
out="$(outcomes_in "$tree" "$host")"
report "итоги: открытая заявка не читается" "$(printf '%s\n' "$out" | grep -c .)" "3"
report "итоги: без подписи коммиты не спрашиваются" "$(printf '%s\n' "$out" | sed -n 2p | jq -c '.commits')" '[]'
report "итоги: слитая заявка названа" "$(printf '%s\n' "$out" | sed -n 1p | jq -c '[.number,.merged,.task,.revert,.epic,.closed]')" \
    '[31,true,5,false,false,"2026-08-10"]'
report "итоги: коммиты заявки дошли" "$(printf '%s\n' "$out" | sed -n 1p | jq -c '.commits')" '[{"sha":"c1","tree":"t1","parents":1}]'
report "итоги: подпись передачи присоединена" "$(printf '%s\n' "$out" | sed -n 1p | jq -c '.handover')" '{"commit":"c1","tree":"t1"}'
report "итоги: считаются правки после передачи" "$(printf '%s\n' "$out" | sed -n 1p | jq -r '.corrections')" "2"
report "итоги: имя ветки наружу не выходит" "$(printf '%s' "$out" | grep -c 'probe')" "0"
report "итоги: заявка без метки без подписи" "$(printf '%s\n' "$out" | sed -n 2p | jq -c '[.handover,.merged]')" '[null,false]'
report "итоги: откат называет задачу из заголовка" "$(printf '%s\n' "$out" | sed -n 3p | jq -c '[.task,.revert]')" '[5,true]'
rm -rf "$tree" "$host"

# Эпик узнаётся по метке карточки, как его узнаёт проверка поставки.
tree="$(fixture_metric_tree)"
host="$(fixture_host)"
CLAUDE_PROJECT_DIR="$tree" RT_HOOK_INPUT="{\"cwd\":\"$tree\"}" bash -c \
    '. "$1/metric-marks.sh"; printf "c1 t1\n" > "$(rt_branch_mark handover RT-6-probe)"' _ "$HOOKS"
report "итоги: эпик по метке карточки" "$(outcomes_in "$tree" "$host" | sed -n 2p | jq -c '.epic')" 'true'
rm -rf "$tree" "$host"

# Сотня заявок без подписи: один вызов хостинга, а не две сотни.
tree="$(fixture_metric_tree)"
host="$(mktemp -d)"
cat > "$host/gh" <<'EOF'
#!/usr/bin/env bash
printf '%s\n' "$*" >> "$GH_LOG"
jq -cn '[range(100) | {number:., state:"MERGED", headRefName:"RT-\(.)-probe", title:"[RT-\(.)] X", closedAt:"2026-08-10T10:00:00Z"}]'
EOF
chmod +x "$host/gh"
export GH_LOG="$host/log"
report "итоги: все заявки прочитаны" "$(outcomes_in "$tree" "$host" | grep -c .)" "100"
report "итоги: заявки без подписи стоят один вызов" "$(wc -l < "$GH_LOG" | tr -d ' ')" "1"
unset GH_LOG
rm -rf "$tree" "$host"

# Спросить некого: без клиента хостинга код говорит об этом, а не печатает пустоту.
tree="$(fixture_metric_tree)"
(cd "$tree" && PATH="/usr/bin:/bin" CLAUDE_PROJECT_DIR="$tree" bash "$HOOKS/pull-outcomes.sh" 2026-07-01 >/dev/null 2>&1)
report "итоги: без клиента хостинга код 3" "$?" "$(command -v gh | grep -q '^/usr/bin\|^/bin' && echo 0 || echo 3)"
rm -rf "$tree"

# --- SC-AK-1291. Вызов роли и команды ------------------------------------------------------

# Дерево с ролью пакета, своей ролью и командой пакета.
fixture_roles() {
    local dir
    dir="$(fixture_metric_tree)"
    mkdir -p "$dir/.claude/agents" "$dir/.claude/commands"
    # Шапка раскладки — как у настоящего файла: за блоком описания, а не первой строкой.
    printf -- '---\nname: goal-critic\ndescription: x\ntools: Read\nmodel: opus\n---\n\n<!-- rt-kit v0.34.0 · agents/goal-critic.md · abc -->\n' \
        > "$dir/.claude/agents/goal-critic.md"
    printf -- '---\nname: secret-name\n---\n\nсвоя роль\n' > "$dir/.claude/agents/secret-name.md"
    printf -- '---\ndescription: x\n---\n\n<!-- rt-kit v0.34.0 · commands/feedback.md · abc -->\n' > "$dir/.claude/commands/feedback.md"
    printf '%s' "$dir"
}

role_in() {
    jq -n --arg r "$2" '{session_id:"s",tool_name:"Agent",tool_input:{subagent_type:$r},tool_response:{status:"async_launched"}}' \
        | CLAUDE_PROJECT_DIR="$1" "$HOOKS/role-calls.sh"
}

# Конец роли: приговор читается отсюда.
role_end() {
    jq -n --arg r "$2" --arg a "$3" '{session_id:"s",hook_event_name:"SubagentStop",agent_type:$r,last_assistant_message:$a}' \
        | CLAUDE_PROJECT_DIR="$1" "$HOOKS/role-calls.sh"
}

# Вызов роли изнутри другой роли: вход несёт тип той, что работает.
role_inside() {
    jq -n --arg r "$2" '{session_id:"s",hook_event_name:"PostToolUse",agent_type:"goal-critic",tool_name:"Agent",tool_input:{subagent_type:$r},tool_response:{status:"async_launched"}}' \
        | CLAUDE_PROJECT_DIR="$1" "$HOOKS/role-calls.sh"
}

# Значение поля в записях этого рода, через пробел.
field_of() {
    cat "$1/.claude/rt-kit/observations/"*.jsonl 2>/dev/null | jq -r "select(.ev == \"$2\") | .$3 // \"нет\"" | tr '\n' ' '
}

tree="$(fixture_roles)"
report "SC-AK-1291 — хук роли молчит" "$(role_in "$tree" goal-critic)" ""
role_in "$tree" goal-critic
role_in "$tree" secret-name
role_in "$tree" general-purpose
report "SC-AK-1291 — роль пакета по имени, своя постоянным словом, встроенной нет" "$(field_of "$tree" role-call res)" \
    "goal-critic goal-critic tree-own "
report "SC-AK-1291 — вызов приговора не несёт: роль ещё работает" "$(notes_count "$tree" role-verdict)" "0"
role_inside "$tree" goal-critic
report "SC-AK-1291 — вызов изнутри роли считается вызовом" "$(notes_count "$tree" role-call)" "4"
role_end "$tree" goal-critic 'Цель не достигнута.

Таблица: цель достигнута в трёх строках.'
role_end "$tree" goal-critic 'Цель достигнута.'
role_end "$tree" goal-critic 'Не могу ответить.'
role_end "$tree" secret-name 'Цель не достигнута.'
role_end "$tree" general-purpose 'Цель не достигнута.'
report "SC-AK-1291 — приговор по первой строке при конце роли" "$(field_of "$tree" role-verdict verdict)" "refused passed "
report "SC-AK-1291 — имя своей роли из дерева не уходит" "$(cat "$tree/.claude/rt-kit/observations/"*.jsonl | grep -c 'secret-name')" "0"
jq -n '{session_id:"s",prompt:"/feedback что-то мешает"}' | CLAUDE_PROJECT_DIR="$tree" "$HOOKS/role-calls.sh"
jq -n '{session_id:"s",prompt:"/secret-cmd"}' | CLAUDE_PROJECT_DIR="$tree" "$HOOKS/role-calls.sh"
jq -n '{session_id:"s",prompt:"обычное сообщение"}' | CLAUDE_PROJECT_DIR="$tree" "$HOOKS/role-calls.sh"
report "SC-AK-1291 — команда пакета по имени, чужой нет" "$(field_of "$tree" command-call res)" "feedback "
rm -rf "$tree"

# --- Экзамен, правило проверки, знаменатель правок ------------------------------------------

tree="$(fixture_metric_tree)"
exam_note() { CLAUDE_PROJECT_DIR="$tree" bash -c '. "$1/metric-marks.sh"; rt_exam_note "$2" "$3"' _ "$HOOKS" "$1" "$2"; }
exam_note failed s1
exam_note failed s1
exam_note passed s1
exam_note none s1
report "экзамен: приговор пишется раз на сессию" "$(field_of "$tree" exam-verdict res)" "failed passed "
rm -rf "$tree"

tree="$(fixture_metric_tree)"
CLAUDE_PROJECT_DIR="$tree" RT_GUARD_NAME=probe-guard RT_GUARD_RULE=doc-style RT_HOOK_INPUT='{"session_id":"s"}' \
    bash -c '. "$1/guard-note.sh"; rt_guard_note' _ "$HOOKS"
report "правило: отказ несёт объявленное правило" "$(field_of "$tree" guard-deny rule)" "doc-style "
rm -rf "$tree"

# Объявленное правило существует в пакете: имя, которому ничто не отвечает, считалось бы вечно нулём.
unknown=0
for hook in "$HOOKS"/*.sh; do
    rule="$(sed -n 's/^RT_GUARD_RULE=//p' "$hook")"
    [ -z "$rule" ] || ls "$ASSETS/rules/$rule".* >/dev/null 2>&1 || unknown=$((unknown + 1))
done
report "правило: объявлено только существующее" "$unknown" "0"
report "правило: объявление есть у проверок" "$(grep -l '^RT_GUARD_RULE=' "$HOOKS"/*.sh | wc -l | tr -d ' ')" "27"

tree="$(fixture_tree)"
gate_in() {
    jq -n --arg f "$tree/$1" '{session_id:"s",tool_name:"Edit",tool_input:{file_path:$f,new_string:"x"}}' \
        | CLAUDE_PROJECT_DIR="$tree" "$HOOKS/skill-gate.sh" >/dev/null 2>&1
}
gate_in docs/note.txt
gate_in tools/run.mjs
report "доля правок: шлюз считает каждую правку" "$(notes_count "$tree" edit-seen)" "2"
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
