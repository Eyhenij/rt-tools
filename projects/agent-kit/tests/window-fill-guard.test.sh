#!/usr/bin/env bash
# Сценарии стража заполнения окна: где он молчит, где напоминает и что пропускает после порога.
#
# Проверяется механика: доля считается по последней записи расхода, напоминание идёт ступенями,
# а закрытие захода проходит и после порога остановки. Размер окна и пороги задаются здесь же —
# иначе набор проверял бы настройку дерева, в котором его запустили.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "страж окна"

TREE="$(fixture_tree)"
export CLAUDE_PROJECT_DIR="$TREE"
export RT_WINDOW_TOKENS=200000
export RT_WINDOW_WARN_PCT=40
export RT_WINDOW_STOP_PCT=50
MARKS="$(mktemp -d)"
export TMPDIR="$MARKS/"
TURNS="$(mktemp -d)"
cleanup() { rm -rf "$TREE" "$TURNS" "$MARKS"; }
trap cleanup EXIT

# Запись захода: одна строка ответа с расходом. Довод — сколько токенов занято.
transcript() {
    local path
    path="$TURNS/fill-$1-$RANDOM.jsonl"
    jq -c -n --argjson f "$1" \
        '{type:"assistant",message:{usage:{input_tokens:$f,cache_creation_input_tokens:0,cache_read_input_tokens:0,output_tokens:0}}}' \
        > "$path"
    printf '%s' "$path"
}

# Вход события: путь к записи, имя события, сессия и, если надо, инструмент с целью.
input_window() {
    jq -n --arg p "$1" --arg e "$2" --arg s "$3" --arg t "${4:-}" --arg f "${5:-}" --arg c "${6:-}" \
        '{session_id:$s,hook_event_name:$e,transcript_path:$p}
         + (if $t == "" then {} else {tool_name:$t} end)
         + (if $f == "" and $c == "" then {} else {tool_input:((if $f == "" then {} else {file_path:$f} end) + (if $c == "" then {} else {command:$c} end))} end)'
}

# Что гард сказал на завершении вызова: ЕСТЬ | НЕТ.
expect_hint_window() {
    local label="$1" json="$2" want="$3" got
    if printf '%s' "$json" | "$HOOKS/window-fill-guard.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.additionalContext // ""' 2>/dev/null | grep -q 'WINDOW FILL'; then
        got="ЕСТЬ"
    else
        got="НЕТ"
    fi
    report "$label" "$got" "$want"
}

# Решение на входе в вызов: DENY | PASS.
expect_window() {
    local label="$1" json="$2" want="$3" out got
    out="$(printf '%s' "$json" | "$HOOKS/window-fill-guard.sh" 2>/dev/null)"
    if [ -z "$out" ]; then
        got="PASS"
    else
        got="$(printf '%s' "$out" | jq -r 'if .hookSpecificOutput.permissionDecision == "deny" then "DENY" else "PASS" end' 2>/dev/null)"
    fi
    report "$label" "$got" "$want"
}

LOW="$(transcript 40000)"   # 20%
WARN="$(transcript 88000)"  # 44%
STOP="$(transcript 120000)" # 60%
CODE="$TREE/projects/kit/src/lib/a.ts"

# --- порог напоминания -------------------------------------------------------------------
# SC-AK-35 — гард окна молчит до порога напоминания
expect_hint_window "ниже порога напоминания" "$(input_window "$LOW" PostToolUse s1)" НЕТ
# SC-AK-36 — на пороге напоминания заход получает подсказку
expect_hint_window "на пороге напоминания" "$(input_window "$WARN" PostToolUse s2)" ЕСТЬ
# SC-AK-37 — напоминание повторяется по ступеням
expect_hint_window "та же ступень второй раз" "$(input_window "$WARN" PostToolUse s2)" НЕТ
expect_hint_window "следующая ступень" "$(input_window "$STOP" PostToolUse s2)" ЕСТЬ

# --- порог остановки ----------------------------------------------------------------------
# SC-AK-38 — после порога остановки работа отбивается
expect_window "правка кода после порога" "$(input_window "$STOP" PreToolUse s3 Edit "$CODE")" DENY
expect_window "команда не из закрытия захода" "$(input_window "$STOP" PreToolUse s3 Bash '' 'pnpm exec nx build')" DENY
expect_window "до порога остановки работа идёт" "$(input_window "$WARN" PreToolUse s3 Edit "$CODE")" PASS

# SC-AK-39 — закрытие захода после порога остановки проходит
expect_window "ход работы" "$(input_window "$STOP" PreToolUse s3 Edit "$TREE/docs/tasks/RT-1-x/progress.md")" PASS
expect_window "передача" "$(input_window "$STOP" PreToolUse s3 Write "$TREE/.claude/handoff/RT-1-x.md")" PASS
expect_window "коммит" "$(input_window "$STOP" PreToolUse s3 Bash '' 'git commit -m x')" PASS
expect_window "клиент хостинга" "$(input_window "$STOP" PreToolUse s3 Bash '' 'gh pr create --base main')" PASS
expect_window "сверка" "$(input_window "$STOP" PreToolUse s3 Bash '' 'npm run check:board')" PASS
expect_window "колонка задачи" "$(input_window "$STOP" PreToolUse s3 Bash '' 'npm run task:move -- 1 in-review')" PASS
expect_window "чтение файла" "$(input_window "$STOP" PreToolUse s3 Read "$CODE")" PASS
expect_window "вопрос владельцу" "$(input_window "$STOP" PreToolUse s3 AskUserQuestion)" PASS

# --- сжатие объявлено: напоминание зовёт работать дальше, а не закрывать заход --------------

# Текст напоминания на первом пороге: закрывать заход или идти дальше.
expect_hint_text() {
    local label="$1" json="$2" want="$3" got
    got="$(printf '%s' "$json" | "$HOOKS/window-fill-guard.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.additionalContext // ""' 2>/dev/null)"
    if printf '%s' "$got" | grep -q "$want"; then
        report "$label" "$want" "$want"
    else
        report "$label" "$got" "$want"
    fi
}

# SC-AK-475 — страж напоминает до порога сжатия
CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=45 \
    expect_hint_text "сжатие объявлено — напоминание зовёт работать" "$(input_window "$WARN" PostToolUse c1)" 'Work on'
CLAUDE_AUTOCOMPACT_PCT_OVERRIDE='' \
    expect_hint_text "сжатия нет — напоминание зовёт закрывать заход" "$(input_window "$WARN" PostToolUse c2)" 'to choose the stopping point'

# SC-AK-476 — между порогом сжатия и порогом остановки страж работу не отбивает
CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=45 \
    expect_window "запас между порогами" "$(input_window "$WARN" PreToolUse c3 Edit "$CODE")" PASS

# SC-AK-477 — после порога остановки страж отбивает, как прежде
CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=45 \
    expect_window "сжатие не пришло — страховка сработала" "$(input_window "$STOP" PreToolUse c4 Edit "$CODE")" DENY
CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=45 \
    expect_hint_text "отказ называет несработавшее сжатие" "$(input_window "$STOP" PostToolUse c5)" 'did not come'

# Порог сжатия, объявленный не ниже порога остановки, стражем не читается: разводит их сверка,
# а страж на такой паре ведёт себя как без сжатия вовсе.
CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50 \
    expect_hint_text "сжатие вровень с остановкой — прежний текст" "$(input_window "$WARN" PostToolUse c6)" 'to choose the stopping point'

# SC-AK-728 — отказ называет форму вызова, а не только требование
# Список разрешённых команд стоит в профиле дерева, а вызов судится по началу строки: требование
# без формы разбирается перебором, и перебор стоит хода за попытку.
expect_reason "отказ называет команды, которые проходят" window-fill-guard.sh \
    "$(input_window "$STOP" PreToolUse s5 Edit "$CODE")" 'git'
expect_reason "отказ говорит, что судит по началу строки" window-fill-guard.sh \
    "$(input_window "$STOP" PreToolUse s5 Edit "$CODE")" 'entering a directory'

# --- отказ в пользу работы -----------------------------------------------------------------
# SC-AK-40 — дерево без размера окна стража не получает
RT_WINDOW_TOKENS='' expect_window "размер окна не задан" "$(input_window "$STOP" PreToolUse s4 Edit "$CODE")" PASS
# SC-AK-41 — сломанный гард окна работу не останавливает
expect_window "записи захода нет" "$(input_window "$TURNS/нет-такой.jsonl" PreToolUse s4 Edit "$CODE")" PASS
expect_window "вход пустой" '' PASS
expect_window "запись без расхода" "$(input_window "$(printf '%s' '{"type":"user"}' > "$TURNS/empty.jsonl"; printf '%s' "$TURNS/empty.jsonl")" PreToolUse s4 Edit "$CODE")" PASS

suite_result "страж окна"
