#!/usr/bin/env bash
# Сценарии гарда проверок перед пушем: что считается вызовом пуша и что гонится до него.
#
# Стоит отдельным набором от гардов поставки: гард здесь другой, и репозитории он заводит свои —
# каждому нужен профиль дерева со своим набором проверок. Общий набор рос вместе с обоими и
# упёрся в предел длины; граница проведена по гарду, а не по числу строк.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард проверок перед пушем"

# --- гард проверок перед пушем -----------------------------------------------------------------
# SC-AK-258, SC-AK-259. Пуш здесь идёт с ключами между `git` и `push` — помощник учётных данных
# и заголовок запроса, — и подстрокой «git push» его не поймать. Пока признаком была подстрока,
# весь набор гейта на таком пуше не гонялся вовсе, а молчание гарда читалось как «зелено»:
# наведённое расхождение раскладки прошло в удалённое дерево, не задев ни одной проверки.
gate() {
    local label="$1" dir="$2" cmd="$3" want="$4" out
    out="$(CLAUDE_PROJECT_DIR="$dir" input_cmd "$cmd" Bash "$dir" \
        | CLAUDE_PROJECT_DIR="$dir" "$HOOKS/git-guard-push-tests.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.permissionDecision // "PASS"' 2>/dev/null)"
    report "$label" "${out:-PASS}" "$want"
}

RED_GATE="$(fixture_repo RT-72-gate)"
mkdir -p "$RED_GATE/.claude/rt-kit"
printf 'rt_push_checks() { printf "%%s\\n" false; }\n' > "$RED_GATE/.claude/rt-kit/project.sh"
gate "SC-AK-258 — красная проверка отбивает пуш" "$RED_GATE" 'git push origin RT-72-gate' deny
gate "SC-AK-259 — пуш с ключами между командой и подкомандой узнаётся" "$RED_GATE" \
    'git -c credential.helper= -c http.extraheader="AUTHORIZATION: basic x" push -u origin RT-72-gate' deny
gate "SC-AK-259 — пуш за разделителем узнаётся" "$RED_GATE" \
    'TOKEN=$(cat t) && git -c http.extraheader="AUTHORIZATION: basic x" push origin RT-72-gate' deny
gate "пробный пуш набора не гоняет" "$RED_GATE" 'git push --dry-run origin RT-72-gate' PASS
gate "чтение истории пушем не считается" "$RED_GATE" 'git log --oneline -5' PASS
gate "слово push без команды git пушем не считается" "$RED_GATE" 'npm run push' PASS

printf 'rt_push_checks() { printf "%%s\\n" true; }\n' > "$RED_GATE/.claude/rt-kit/project.sh"
gate "зелёный набор пуш не задерживает" "$RED_GATE" 'git push origin RT-72-gate' PASS
rm -rf "$RED_GATE"

# SC-AK-678, SC-AK-679. Проверка, которой нечего смотреть, выходит кодом пропуска. Прежде такой
# исход был нулём: в наборе он стоял рядом с пройденными и ничем от них не отличался, и сводка
# читалась как проверенная целиком. Пуш он не отбивает — поломкой пропуск не является, — но
# называется вслух, иначе всё вернулось бы к молчаливому нулю.
SKIP_GATE="$(fixture_repo RT-1202-skip)"
mkdir -p "$SKIP_GATE/.claude/rt-kit"
printf 'rt_push_checks() { printf "%%s\\n" "exit 7"; }\n' > "$SKIP_GATE/.claude/rt-kit/project.sh"
gate "SC-AK-679 — пропуск пуш не отбивает" "$SKIP_GATE" 'git push origin RT-1202-skip' PASS

skip_says="$(CLAUDE_PROJECT_DIR="$SKIP_GATE" input_cmd 'git push origin RT-1202-skip' Bash "$SKIP_GATE" \
    | CLAUDE_PROJECT_DIR="$SKIP_GATE" "$HOOKS/git-guard-push-tests.sh" 2>&1 >/dev/null)"
case "$skip_says" in
    *'exit 7'*) report "SC-AK-679 — пропущенная проверка названа вслух" да да ;;
    *) report "SC-AK-679 — пропущенная проверка названа вслух" нет да ;;
esac
rm -rf "$SKIP_GATE"

# SC-AK-405…407. Составная «переключиться и запушить» проходила гейт молча: набор гоняется в том
# дереве, какое лежит на момент разбора команды, то есть по прежней ветке. Зелёный набор при этом
# читается как проверка ушедшего. Набор здесь зелёный намеренно — судится не он, а сама форма
# команды: отказ обязан прийти раньше, чем гард дойдёт до прогона.
SWITCH_GATE="$(fixture_repo RT-73-switch)"
mkdir -p "$SWITCH_GATE/.claude/rt-kit"
printf 'rt_push_checks() { printf "%%s\\n" true; }\n' > "$SWITCH_GATE/.claude/rt-kit/project.sh"
gate "SC-AK-405 — переключение и пуш одной командой отбиваются" "$SWITCH_GATE" \
    'git checkout RT-73-switch && git push origin RT-73-switch' deny
gate "SC-AK-405 — то же через switch" "$SWITCH_GATE" \
    'git switch RT-73-switch && git push origin RT-73-switch' deny
gate "SC-AK-406 — заведение новой ветки в той же команде пуш не отбивает" "$SWITCH_GATE" \
    'git checkout -b RT-74-fresh && git push -u origin RT-74-fresh' PASS
gate "SC-AK-406 — то же через switch -c" "$SWITCH_GATE" \
    'git switch -c RT-74-fresh && git push -u origin RT-74-fresh' PASS
gate "SC-AK-407 — пробный пуш формы команды не судит" "$SWITCH_GATE" \
    'git checkout RT-73-switch && git push --dry-run origin RT-73-switch' PASS

# SC-AK-408. Отложенная правка наружу ничего не отправляет, а слово `push` в ней стоит отдельным:
# набор гейта гонялся на ней целиком и отбивал вызов первой же красной проверкой.
gate "SC-AK-408 — отложенная правка пушем не считается" "$SWITCH_GATE" \
    'git stash push -u -m проба' PASS

# Тайник рядом с настоящим пушем признака не гасит: вырезается он, а не вся команда. Набор здесь
# красный намеренно — иначе «прошло» значило бы только, что гонять было нечего.
STASH_GATE="$(fixture_repo RT-75-stash)"
mkdir -p "$STASH_GATE/.claude/rt-kit"
printf 'rt_push_checks() { printf "%%s\\n" false; }\n' > "$STASH_GATE/.claude/rt-kit/project.sh"
gate "SC-AK-408 — тайник признака настоящего пуша не гасит" "$STASH_GATE" \
    'git stash push -u && git push origin RT-75-stash' deny
gate "SC-AK-408 — один тайник набора не гоняет" "$STASH_GATE" \
    'git stash push -u -m проба' PASS
rm -rf "$STASH_GATE"

CLAUDE_PROJECT_DIR="$SWITCH_GATE" expect_reason "SC-AK-405 — отказ называет законный ход" \
    git-guard-push-tests.sh \
    "$(input_cmd 'git checkout RT-73-switch && git push origin RT-73-switch' Bash "$SWITCH_GATE")" \
    'Раздели вызовы'
rm -rf "$SWITCH_GATE"

# --- SC-AK-820 — чем набор гейта уже набора конвейера --------------------------------------
# Правило требует, чтобы гейт не был уже конвейера, а собрать это требование нечем: файл
# конвейера у каждого дерева свой. Молчание при этом читается как «проверено всё», и расхождение
# узнаётся из красного конвейера после заявки. Говорится оно один раз за сессию — на каждый пуш
# та же строка повторялась бы за заход десятки раз.
GAP_GATE="$(fixture_repo RT-76-gap)"
mkdir -p "$GAP_GATE/.claude/rt-kit"
printf 'rt_push_checks() { printf "%%s\\n" true; }\n' > "$GAP_GATE/.claude/rt-kit/project.sh"

gap_says() {
    CLAUDE_PROJECT_DIR="$GAP_GATE" jq -n --arg c 'git push origin RT-76-gap' --arg d "$GAP_GATE" --arg s "$1" \
        '{session_id:$s,cwd:$d,tool_name:"Bash",tool_input:{command:$c}}' \
        | CLAUDE_PROJECT_DIR="$GAP_GATE" "$HOOKS/git-guard-push-tests.sh" 2>&1 >/dev/null \
        | grep -c 'не набор конвейера'
}

GAP_SESSION="gap-$$-$RANDOM"
rm -f "${TMPDIR:-/tmp}/rt-kit-push-gate-gap-$GAP_SESSION"
report "SC-AK-820 — первый пуш сессии называет разницу с конвейером" "$(gap_says "$GAP_SESSION")" 1
report "SC-AK-820 — второй пуш той же сессии молчит" "$(gap_says "$GAP_SESSION")" 0
rm -f "${TMPDIR:-/tmp}/rt-kit-push-gate-gap-$GAP_SESSION"
rm -rf "$GAP_GATE"

suite_result "гард проверок перед пушем"
