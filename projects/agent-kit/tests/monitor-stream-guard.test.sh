#!/usr/bin/env bash
# Сценарии SC-AK-2017: Monitor, который печатает строку на каждый шаг живой своей фоновой задачи, отказан —
# конец задачи и так придёт уведомлением. Ожидание одной строки, опрос PR и таймер проходят.
#
# Каждый случай собирает запись сессии с фоновыми задачами, как их пишет хост, и зовёт хук на вызове
# Monitor. Вторая половина — команды Monitor из записей проекта дословно, файл fixtures/monitor-records.tsv.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "Monitor по своему фоновому"

H="$ASSETS/hooks/monitor-stream-guard.sh"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
export TMPDIR="$TMP/"
unset RT_FLOW_ENGINE RT_MONITOR_CALL_LIMIT

n=0
fresh() { n=$((n + 1)); P="$TMP/r$n.jsonl"; : >"$P"; }
put() { printf '%s\n' "$1" >>"$P"; }
# A Bash task in the background: the call, then the host's answer with the task number and its output file.
bg() {
    put "$(jq -cn --arg id "$1" --arg c "$2" '{type:"assistant",timestamp:"2026-11-26T10:00:00Z",message:{content:[{type:"tool_use",id:("t"+$id),name:"Bash",input:{command:$c,run_in_background:true}}]}}')"
    put "$(jq -cn --arg id "$1" --arg o "${3:-$TMP/tasks/$1.output}" '{type:"user",timestamp:"2026-11-26T10:00:01Z",toolUseResult:{backgroundTaskId:$id},message:{content:[{type:"tool_result",tool_use_id:("t"+$id),content:("Command running in background with ID: "+$id+". Output is being written to: "+$o)}]}}')"
}
# A Bash call in the background whose answer has not come yet: the same reply as the Monitor.
pending() { put "$(jq -cn --arg id "$1" --arg c "$2" '{type:"assistant",timestamp:"2026-11-26T10:00:00Z",message:{content:[{type:"tool_use",id:$id,name:"Bash",input:{command:$c,run_in_background:true}}]}}')"; }
agent() {
    put "$(jq -cn --arg id "$1" '{type:"assistant",timestamp:"2026-11-26T10:00:00Z",message:{content:[{type:"tool_use",id:("t"+$id),name:"Agent",input:{prompt:"x",run_in_background:true}}]}}')"
    put "$(jq -cn --arg id "$1" --arg o "$2" '{type:"user",timestamp:"2026-11-26T10:00:01Z",toolUseResult:{isAsync:true,agentId:$id},message:{content:[{type:"tool_result",tool_use_id:("t"+$id),content:("Async agent launched. output_file: "+$o)}]}}')"
}
over() { put "$(jq -cn --arg id "$1" '{type:"user",timestamp:"2026-11-26T10:05:00Z",message:{content:("<task-notification><task-id>"+$id+"</task-id><status>completed</status></task-notification>")}}')"; }
stopped() { put "$(jq -cn --arg id "$1" '{type:"assistant",timestamp:"2026-11-26T10:04:00Z",message:{content:[{type:"tool_use",id:"k",name:"TaskStop",input:{task_id:$id}}]}}')"; }
# The call of Monitor: «deny» or «PASS»; the reason of the last call lands in the file $TMP/reason.
mon() {
    local out
    out="$(jq -cn --arg p "${2-$P}" --arg c "$1" --arg w "${3:-$TMP}" '{session_id:"s",hook_event_name:"PreToolUse",tool_name:"Monitor",tool_input:{command:$c},transcript_path:$p,cwd:$w}' | bash "$H" 2>/dev/null)"
    printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecisionReason // empty' >"$TMP/reason" 2>/dev/null
    [ -z "$out" ] && echo PASS || printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecision // "deny"'
}
case_of() { report "SC-AK-2017 — $1" "$2" "$3"; }
L="$TMP/set.log"

# --- строка на каждый шаг по своему фоновому — отказ --------------------------------------------
fresh; bg b1 "bash set.sh > $L 2>&1"
case_of 'tail -f по файлу, который пишет задача' "$(mon "tail -f $L | grep --line-buffered red")" deny
case_of 'отказ называет задачу и файл' "$(grep -c "task b1, over $L" "$TMP/reason")" 1
case_of 'tail -F' "$(mon "tail -F $L")" deny
case_of 'tail --follow' "$(mon "tail --follow=name $L")" deny
case_of 'tail -fn 20' "$(mon "tail -fn 20 $L")" deny
case_of 'tail -n 0 -f по выводу задачи' "$(mon "tail -n 0 -f $TMP/tasks/b1.output | grep --line-buffered step")" deny
case_of 'цикл печатает на каждом круге' "$(mon "while true; do tail -1 $L; sleep 5; done")" deny
case_of 'цикл: печать, затем присваивание' "$(mon "last=; while true; do cur=\$(tail -1 $L); [ \"\$cur\" != \"\$last\" ] && echo \"\$cur\" && last=\"\$cur\"; sleep 5; done")" deny
fresh; bg b2 "bash set.sh | tee -a $L"
case_of 'файл через tee -a' "$(mon "tail -f $L")" deny
fresh; bg b3 "bash set.sh >> $L"
case_of 'файл через >>' "$(mon "tail -f $L")" deny
fresh; bg b4 'bash set.sh > "${TMPDIR:-/tmp}/push-ahead.log" 2>&1'
case_of 'путь через ${TMPDIR:-/tmp} в обеих командах' "$(mon 'tail -f "${TMPDIR:-/tmp}/push-ahead.log"')" deny
fresh; bg b5 'bash set.sh > "${TMPDIR:-/tmp}/push-ahead-$(basename "$PWD").log" 2>&1'
case_of 'путь через $(basename "$PWD") по cwd хука' "$(mon "tail -f ${TMP}/push-ahead-$(basename "$TMP").log")" deny
fresh; bg b6 "S=$TMP/pad; bash set.sh > \$S/prepush.log 2>&1"
case_of 'присваивание S= в команде задачи' "$(mon "L=$TMP/pad/prepush.log; tail -n 0 -F \"\$L\" | grep --line-buffered red")" deny
fresh; pending p1 "bash set.sh > $L 2>&1"
case_of 'фоновое того же ответа, ответа ещё нет' "$(mon "tail -f $L")" deny
fresh; bg b7 "bash set.sh > $L 2>&1"
case_of 'tail -f в фоне команды, затем ожидание' "$(mon "tail -n0 -f $L | grep --line-buffered red & until grep -q exit $L; do sleep 2; done")" deny

# --- одна строка, чужой файл, кончившаяся задача — проход ---------------------------------------
fresh; bg b1 "bash set.sh > $L 2>&1"
case_of 'until grep -q, затем tail -3' "$(mon "until grep -q '^exit' $L; do sleep 5; done; tail -3 $L")" PASS
case_of 'цикл: печать и break в одной ветке' "$(mon "while true; do if grep -q exit $L; then tail -3 $L; break; fi; sleep 5; done")" PASS
case_of 'конвейер, затем break' "$(mon "while true; do if grep -q exit $L; then grep red $L | tail -3 | cut -c1-80; break; fi; sleep 5; done")" PASS
case_of 'tail -f | grep -m 1' "$(mon "tail -f $L | grep -m 1 exit")" PASS
case_of 'echo внутри $(…) в цикле' "$(mon "while true; do n=\$(grep -c x $L || echo 0); [ \"\$n\" -gt 3 ] && break; sleep 5; done")" PASS
case_of 'таймер' "$(mon 'sleep 600; echo tick')" PASS
case_of 'файл, который не пишет ни одна задача' "$(mon "tail -f $TMP/other.log")" PASS
case_of 'другой инструмент' "$(jq -cn --arg p "$P" '{hook_event_name:"PreToolUse",tool_name:"Bash",tool_input:{command:"tail -f /x"},transcript_path:$p}' | bash "$H" 2>/dev/null | wc -c | tr -d ' ')" 0
fresh; bg b1 "bash set.sh > $L 2>&1"; over b1
case_of 'задача кончилась' "$(mon "tail -f $L")" PASS
fresh; bg b1 "bash set.sh > $L 2>&1"; stopped b1
case_of 'задача снята TaskStop' "$(mon "tail -f $L")" PASS
fresh; agent a1 "$TMP/tasks/a1.output"
case_of 'вывод агента — агент не фоновая команда' "$(mon "tail -f $TMP/tasks/a1.output")" PASS
fresh
case_of 'фоновых нет' "$(mon "tail -f $L")" PASS

# --- запись и движок: проход без отказа ----------------------------------------------------------
case_of 'запись без пути' "$(mon "tail -f $L" '')" PASS
fresh; put 'не JSON {'
case_of 'неразборная запись' "$(mon "tail -f $L")" PASS
fresh; bg b1 "bash set.sh > $L 2>&1"
printf '%s\n' "import { writeFileSync } from 'node:fs'; writeFileSync('$TMP/asked', 'x'); setTimeout(() => {}, 5000);" >"$TMP/slow.mjs"
case_of 'движок дольше предела' "$(RT_FLOW_ENGINE="$TMP/slow.mjs" RT_MONITOR_CALL_LIMIT=1 mon "tail -f $L")" PASS
printf '%s\n' 'throw new Error("broken");' >"$TMP/broken.mjs"
case_of 'упавший движок' "$(RT_FLOW_ENGINE="$TMP/broken.mjs" mon "tail -f $L")" PASS
rm -f "$TMP/asked"
RT_FLOW_ENGINE="$TMP/slow.mjs" mon 'sleep 600; echo tick' >/dev/null
RT_FLOW_ENGINE="$TMP/slow.mjs" mon "gh pr checks 1 --watch" >/dev/null
case_of 'без follow и без цикла с печатью движок не зовётся' "$([ -f "$TMP/asked" ] && echo asked || echo none)" none

# --- команды Monitor из записей проекта ----------------------------------------------------------
# Каждая строка файла: ожидание, время, каталог, команда, свои фоновые на ту минуту.
DATA="$ASSETS/../tests/fixtures/monitor-records.tsv"
while IFS=$'\t' read -r expect at cwd command tasks; do
    case "$expect" in deny | pass) ;; *) continue ;; esac
    fresh
    while IFS= read -r task; do
        case "$(printf '%s' "$task" | jq -r 'if .pending then "pending" elif .agent then "agent" else "bash" end')" in
            pending) pending "$(printf '%s' "$task" | jq -r .pending)" "$(printf '%s' "$task" | jq -r .command)" ;;
            agent) agent "$(printf '%s' "$task" | jq -r .task)" "$(printf '%s' "$task" | jq -r '.output // ""')" ;;
            *) bg "$(printf '%s' "$task" | jq -r .task)" "$(printf '%s' "$task" | jq -r .command)" "$(printf '%s' "$task" | jq -r '.output // ""')" ;;
        esac
    done < <(printf '%s' "$tasks" | jq -c '.[]')
    want=PASS; [ "$expect" = deny ] && want=deny
    case_of "запись $at" "$(TMPDIR=/var/folders/T/ mon "$command" "$P" "$cwd")" "$want"
done <"$DATA"

# --- настоящая запись: хук отвечает как движок ---------------------------------------------------
REAL="$ASSETS/../tests/fixtures/real-record/2026-11-13.jsonl"
COMMAND='tail -n 0 -f /tmp/x.log | grep --line-buffered red'
want="$(jq -cn --arg p "$REAL" --arg c "$COMMAND" '{hook_event_name:"PreToolUse",tool_name:"Monitor",tool_input:{command:$c},transcript_path:$p,cwd:"/tmp"}' | node "$ASSETS/checks/task-flow-script.mjs" monitor-call | jq -r 'if .refuse then "deny" else "PASS" end')"
case_of 'настоящая запись 13.11 — хук отвечает как движок' "$(mon "$COMMAND" "$REAL" /tmp)" "$want"

suite_result "Monitor по своему фоновому"
