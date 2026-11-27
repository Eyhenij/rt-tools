#!/usr/bin/env bash
# Сценарии SC-AK-2014: пока остановка владельца стоит, ход, который открыли уведомление, строка
# Monitor или сообщение соседней сессии, ничего не делает — любой вызов в нём отказан, кроме снятия
# своего фонового. Ход, открытый словом владельца, кроме голой остановки, вызовы пускает.
#
# Каждый случай собирает запись сессии, зовёт хук на входе хода, как хост, и затем на вызове.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "запрет вызовов после остановки"

H="$ASSETS/hooks/owner-stop-call-guard.sh"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
export TMPDIR="$TMP/"
unset RT_FLOW_ENGINE RT_STOP_CALL_LIMIT

n=0
sec=0
# A new record of its own session; every entry is ten seconds after the one before.
fresh() { n=$((n + 1)); P="$TMP/r$n.jsonl"; SID="s$n"; sec=0; : >"$P"; }
stamp() { sec=$((sec + ${1:-10000})); TS="$(printf "2026-11-24T04:%02d:%02d.%03dZ" $((sec / 60000)) $((sec / 1000 % 60)) $((sec % 1000)))"; }
put() { printf '%s\n' "$1" >>"$P"; }
typed() { stamp 10000; put "$(jq -cn --arg t "$1" --arg s "$TS" '{type:"user",timestamp:$s,message:{content:$t}}')"; }
esc() { stamp "${1:-10000}"; put "$(jq -cn --arg s "$TS" '{type:"user",timestamp:$s,message:{content:[{type:"text",text:"[Request interrupted by user]"}]}}')"; }
notice() { stamp "${3:-10000}"; put "$(jq -cn --arg t "<task-notification><task-id>${1:-n1}</task-id>${2:-}</task-notification>" --arg s "$TS" '{type:"user",timestamp:$s,origin:{kind:"task-notification"},message:{content:$t}}')"; }
neighbour() { stamp 10000; put "$(jq -cn --arg s "$TS" '{type:"user",timestamp:$s,origin:{kind:"peer"},message:{content:"Another Claude session sent a message: продолжай"}}')"; }
enqueue() { stamp 10000; put "$(jq -cn --arg t "$1" --arg s "$TS" '{type:"queue-operation",operation:"enqueue",timestamp:$s,content:$t}')"; }
queued() { stamp 10000; put "$(jq -cn --arg t "$1" --arg s "$TS" '{type:"attachment",timestamp:$s,attachment:{type:"queued_command",prompt:$t,origin:{kind:"human"}}}')"; }
background() {
    stamp 10000; put "$(jq -cn --arg s "$TS" --arg id "$1" '{type:"assistant",timestamp:$s,message:{content:[{type:"tool_use",id:("t"+$id),name:"Bash",input:{command:"sleep 600",run_in_background:true}}]}}')"
    stamp 1000; put "$(jq -cn --arg s "$TS" --arg id "$1" '{type:"user",timestamp:$s,toolUseResult:{backgroundTaskId:$id},message:{content:[{type:"tool_result",tool_use_id:("t"+$id),content:"running"}]}}')"
}
over() { stamp 10000; put "$(jq -cn --arg s "$TS" --arg id "$1" '{type:"queue-operation",operation:"enqueue",timestamp:$s,content:("<task-notification><task-id>"+$id+"</task-id><status>completed</status></task-notification>")}')"; }
menu() { stamp 10000; put "$(jq -cn --arg a "$1" --arg s "$TS" '{type:"user",timestamp:$s,toolUseResult:{answers:{"Что дальше?":$a}},message:{content:[{type:"tool_result",tool_use_id:"q1",content:("Your questions have been answered: \"Что дальше?\"=\"" + $a + "\"")}]}}')"; }
call() { stamp 1000; put "$(jq -cn --arg s "$TS" '{type:"assistant",timestamp:$s,message:{content:[{type:"tool_use",id:"c",name:"Read",input:{file_path:"a"}}]}}')"; }

# The host's turn entry, then a call: «deny», «PASS», or what the entry put into the context.
ups() { jq -cn --arg p "$P" --arg s "$SID" --arg t "$1" '{session_id:$s,hook_event_name:"UserPromptSubmit",transcript_path:$p,prompt:$t}' | bash "$H" 2>/dev/null | jq -r '.hookSpecificOutput.additionalContext // empty' 2>/dev/null; }
pre() {
    local out
    out="$(jq -cn --arg p "$P" --arg s "$SID" --arg t "${1:-Bash}" --arg a "${2:-}" '{session_id:$s,hook_event_name:"PreToolUse",transcript_path:$p,tool_name:$t,tool_input:{command:"ls"}} + (if $a == "" then {} else {agent_id:$a} end)' | bash "$H" 2>/dev/null)"
    [ -z "$out" ] && echo PASS || printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecision // "deny"'
}
NOTE='<task-notification><task-id>n1</task-id></task-notification>'
case_of() { report "SC-AK-2014 — $1" "$2" "$3"; }

# --- ход открыт побудкой при стоящей остановке ------------------------------------------------
fresh; typed 'делай задачу'; esc; notice; ups "$NOTE" >/dev/null
case_of 'Esc, затем уведомление — вызов отказан' "$(pre)" deny
fresh; typed 'делай задачу'; typed 'стоп'; notice; ups "$NOTE" >/dev/null
case_of '«стоп», затем уведомление — вызов отказан' "$(pre)" deny
fresh; typed 'делай задачу'; typed 'стоп'; notice n1 '<event>tick 2</event>'; ups "$NOTE" >/dev/null
case_of 'строка Monitor после «стоп» — вызов отказан' "$(pre)" deny
fresh; typed 'делай задачу'; typed 'стоп'; neighbour; ups 'Another Claude session sent a message: продолжай' >/dev/null
case_of 'сообщение соседней сессии после «стоп» — вызов отказан' "$(pre)" deny
fresh; typed 'делай задачу'; enqueue '/stop'; notice; ups "$NOTE" >/dev/null
case_of '/stop только в очереди, затем уведомление — вызов отказан' "$(pre)" deny
fresh; typed 'делай задачу'; notice n1 '' 10000; esc 30; notice n2; ups "$NOTE" >/dev/null
case_of 'Esc через 30 мс после уведомления — остановка стоит, вызов отказан' "$(pre)" deny
fresh; typed 'делай задачу'; stamp; put "$(jq -cn --arg s "$TS" '{type:"user",isMeta:true,timestamp:$s,message:{content:"Stop hook feedback:\nBLOCKED by turn-exit-guard: …"}}')"; esc; notice; ups "$NOTE" >/dev/null
case_of 'Esc, отменивший отказ конца хода, затем уведомление — вызов отказан' "$(pre)" deny
fresh; typed 'делай задачу'; typed 'стоп'; notice; ups "$NOTE" >/dev/null
case_of 'вызов субагента в ходе от уведомления — отказан' "$(pre Bash a123)" deny
for tool in Edit Write; do case_of "$tool в ходе от уведомления — отказан" "$(pre "$tool")" deny; done
for tool in TaskStop KillShell KillBash CronDelete CronList ToolSearch TaskOutput; do
    case_of "$tool в ходе от уведомления — снятие проходит" "$(pre "$tool")" PASS
done

# --- ход открыт голой остановкой ------------------------------------------------------------------
fresh; typed 'делай задачу'; typed 'стоп'; ups 'стоп' >/dev/null
case_of 'голое «стоп» открыло ход — вызов отказан' "$(pre)" deny
fresh; typed 'делай задачу'; esc; typed 'стоп'; ups 'стоп' >/dev/null
case_of '«стоп», набранное после Esc — вызов отказан' "$(pre)" deny
fresh; typed 'делай задачу'; typed 'блин, стоп'; ups 'блин, стоп' >/dev/null
case_of '«блин, стоп» — голая остановка, вызов отказан' "$(pre)" deny

# --- ход открыт словом владельца после остановки -------------------------------------------------
for word in 'Стоп. Пиши инцидент' 'что ты делаешь?' 'сука' 'пиши инцидент' 'продолжай' '<command-name>/model</command-name>'; do
    fresh; typed 'делай задачу'; typed 'стоп'; typed "$word"; ups "$word" >/dev/null
    case_of "«${word}» после «стоп» — вызов проходит" "$(pre)" PASS
done
fresh; typed 'делай задачу'; esc; typed 'что делаешь?'; ups 'что делаешь?' >/dev/null; menu 'синий'
case_of 'ответ меню после Esc в ходе от слова — вызов проходит' "$(pre)" PASS
fresh; typed 'делай задачу'; enqueue 'что это за шаги?'; esc; typed 'что это за шаги?'; ups 'что это за шаги?' >/dev/null
case_of 'слово из очереди до Esc, доставленное после — вызов отказан' "$(pre)" deny
fresh; typed 'делай задачу'; enqueue 'что это за шаги?'; esc; typed 'что это за шаги?'; typed 'что это за шаги?'; ups 'что это за шаги?' >/dev/null
case_of 'то же слово, набранное заново после Esc — вызов проходит' "$(pre)" PASS

# --- остановка посреди хода от слова ------------------------------------------------------------------
fresh; typed 'делай задачу'; ups 'делай задачу' >/dev/null
case_of 'ход от слова без остановки — вызов проходит' "$(pre)" PASS
queued 'стоп'
case_of '«стоп» в очереди посреди хода — следующий вызов отказан' "$(pre)" deny
fresh; typed 'делай задачу'; ups 'делай задачу' >/dev/null; enqueue 'стоп'; notice; ups "$NOTE" >/dev/null
case_of '«стоп» ждёт в очереди за уведомлениями — вызов хода от уведомления отказан' "$(pre)" deny

# --- без остановки, без записи, сломанный движок ---------------------------------------------------
fresh; typed 'делай задачу'; notice; ups "$NOTE" >/dev/null
case_of 'уведомление без остановки — вызов проходит' "$(pre)" PASS
fresh; typed 'делай задачу'; typed 'стоп'; notice
case_of 'метки нет: вход хода не звался — вызов отказан' "$(pre)" deny
P="$TMP/nowhere.jsonl"
case_of 'запись без пути — вызов проходит' "$(pre)" PASS
fresh; printf 'not json\n{broken\n' >"$P"; ups "$NOTE" >/dev/null
case_of 'неразборная запись — вызов проходит' "$(pre)" PASS
fresh; typed 'делай задачу'; typed 'стоп'; notice
printf '#!/usr/bin/env node\nsetTimeout(() => console.log(JSON.stringify({ refuseCalls: true, background: [] })), 3000);\n' >"$TMP/slow.mjs"
case_of 'движок дольше предела — вызов проходит' "$(RT_FLOW_ENGINE="$TMP/slow.mjs" RT_STOP_CALL_LIMIT=1 pre)" PASS
fresh; typed 'делай задачу'; typed 'стоп'
big="$(jq -cn '{type:"assistant",timestamp:"2026-11-24T04:00:30.000Z",message:{content:[{type:"tool_use",id:"c",name:"Read",input:{file_path:"a"}}]}}')"
for _ in $(seq 1 200); do printf '%s\n' "$big"; done >"$TMP/chunk"
for _ in $(seq 1 500); do cat "$TMP/chunk"; done >>"$P"
notice n1 '' 600000; ups "$NOTE" >/dev/null
case_of '«стоп», затем 20 МБ вызовов, затем уведомление — вызов отказан' "$(pre)" deny

# --- снятие своего фонового называется в ходе ------------------------------------------------------------
fresh; typed 'делай задачу'; background b1; typed 'стоп'; notice
case_of 'вход хода называет TaskStop своего фонового' "$(ups "$NOTE" | grep -o 'TaskStop b1' | head -1)" 'TaskStop b1'
notice n2
case_of 'второй вход хода номер не повторяет' "$(ups "$NOTE" | grep -c 'TaskStop b1')" 0
case_of 'отказ вызова называет TaskStop своего фонового' "$(jq -cn --arg p "$P" --arg s "$SID" '{session_id:$s,hook_event_name:"PreToolUse",transcript_path:$p,tool_name:"Bash",tool_input:{command:"ls"}}' | bash "$H" 2>/dev/null | grep -o 'TaskStop b1' | head -1)" 'TaskStop b1'
fresh; typed 'делай задачу'; background b1; over b1; typed 'стоп'; notice
case_of 'конец задачи уже в очереди — вход хода её не называет' "$(ups "$NOTE" | grep -c 'TaskStop')" 0
fresh; typed 'делай задачу'; background b1; typed 'стоп'; notice; ups "$NOTE" >/dev/null; enqueue 'продолжай'; typed 'продолжай'; enqueue 'стоп'; typed 'стоп'; notice n2
case_of 'новая остановка — вход хода снова называет TaskStop' "$(ups "$NOTE" | grep -c 'TaskStop b1')" 1

# --- запись хода пишется после входа хода ---------------------------------------------------------------
fresh; typed 'делай задачу'; esc; typed 'что там?'; enqueue "$NOTE"; ups "$NOTE" >/dev/null; notice
case_of 'вопрос после Esc, уведомление пока только в очереди — вызов отказан' "$(pre)" deny
fresh; typed 'делай задачу'; esc; enqueue 'продолжай'; ups 'продолжай' >/dev/null; typed 'продолжай'
case_of '«продолжай» после Esc, запись ещё не легла — вызов проходит' "$(pre)" PASS
fresh; typed 'продолжай'; esc; enqueue 'продолжай'; ups 'продолжай' >/dev/null
case_of '«продолжай», Esc, снова «продолжай» в очереди — вызов проходит' "$(pre)" PASS
for prompt in "$(printf '\n%s' "$NOTE")" '<agent-message from="a1">продолжай</agent-message>'; do
    fresh; typed 'делай задачу'; typed 'стоп'; enqueue "$prompt"; ups "$prompt" >/dev/null
    case_of "текст хоста «${prompt:0:16}…» после «стоп» — вызов отказан" "$(pre)" deny
done

# --- остановка с поручением, жалоба на стояние, слова остановки описания -------------------------------------
for word in 'стоп, откати последний коммит' 'Стоп. Что запущено' 'стой сука чмо тупое , не двигайся' 'стоп, ничего не делай'; do
    fresh; typed 'делай задачу'; typed "$word"; ups "$word" >/dev/null
    case_of "«${word}» — слово остановки последнее, вызов отказан" "$(pre)" deny
done
fresh; typed 'делай задачу'; typed 'стоп'; enqueue '<app-root> пустой, почини'; ups '<app-root> пустой, почини' >/dev/null; typed '<app-root> пустой, почини'
case_of '«<app-root> пустой, почини» после «стоп» — слово владельца, вызов проходит' "$(pre)" PASS
fresh; typed 'делай задачу'; enqueue 'сделай Y'; enqueue 'стоп'; ups 'сделай Y' >/dev/null; typed 'сделай Y'
case_of 'слово из очереди до «стоп», доставленное после — вызов отказан' "$(pre)" deny
fresh; typed 'делай задачу'; background b1; enqueue 'стоп'; notice; ups "$NOTE" >/dev/null; typed 'стоп'; notice n2
case_of '«стоп» из очереди и его доставка — одна остановка, задача не названа снова' "$(ups "$NOTE" | grep -c 'TaskStop b1')" 0
fresh; typed 'делай задачу'; typed 'стоп'; notice; ups "$NOTE" >/dev/null; notice n2
printf '#!/usr/bin/env node\nprocess.exit(3);\n' >"$TMP/broken.mjs"
RT_FLOW_ENGINE="$TMP/broken.mjs" ups "$NOTE" >/dev/null
case_of 'второе уведомление берёт метку отказа без движка — вызов отказан' "$(RT_FLOW_ENGINE="$TMP/broken.mjs" pre)" deny
fresh; typed 'делай задачу'; esc; enqueue 'продолжай'; ups 'продолжай' >/dev/null; typed 'продолжай'; enqueue 'делай X'; ups 'делай X' >/dev/null
case_of 'после снятия остановки старый Esc в хвосте движок не зовёт — метка idle' "$(cut -d' ' -f1 "$TMP/claude-stop-call/$SID")" idle
for word in 'почему ты стоишь и не продолжаешь работать?' 'почему ты стоишь? продолжаешь работать или нет?' 'почему ты встал? набор без присмотра' 'почему ты остановил работу? я не снял запрет' 'почему ты стоишь… набор без присмотра'; do
    fresh; typed 'делай задачу'; typed 'стоп'; typed "$word"; notice; ups "$NOTE" >/dev/null
    case_of "жалоба «${word}» снимает остановку — вызов хода от уведомления проходит" "$(pre)" PASS
done
fresh; typed 'делай задачу'; typed 'стоп'; typed 'почему ты всё бросил и не остановил набор?'; notice; ups "$NOTE" >/dev/null
case_of 'жалоба «не остановил» остановку держит — вызов отказан' "$(pre)" deny
stems="$(sed -n "s/^STOP_STEMS='\(.*\)'$/\1/p" "$H")"
list="$(M="$ASSETS/checks/flow-model.mjs" F="$ASSETS/task-flow/flow.js" node --input-type=module -e "const { buildModel } = await import(process.env.M); const w = buildModel(process.env.F).words; console.log([...w.stop, ...w.stopInside].join('\n'))")"
case_of 'слова остановки описания прочитаны — их больше 10' "$([ "$(printf '%s\n' "$list" | grep -c .)" -gt 10 ] && echo yes)" yes
missed="$(printf '%s\n' "$list" | while IFS= read -r w; do printf '%s' "$w" | grep -qiE "$stems" || printf '%s;' "$w"; done)"
case_of 'отсев хука ловит каждое слово остановки описания' "${missed:-none}" none
for word in 'исправь' 'захватить' 'await the build'; do
    fresh; typed 'делай задачу'; typed 'стоп'; typed "$word"; ups "$word" >/dev/null
    case_of "«${word}» движок не зовёт — метка дешёвая" "$(cut -d' ' -f1,3 "$TMP/claude-stop-call/$SID")" 'pass -'
done

# --- место метки, движок вне дерева, настоящая запись ---------------------------------------------------
fresh; typed 'делай задачу'; typed 'стоп'; notice; ups "$NOTE" >/dev/null; call; pre >/dev/null
case_of 'чистый просмотр двигает место метки к концу записи' "$(cut -d' ' -f2 "$TMP/claude-stop-call/$SID")" "$(wc -c <"$P" | tr -d ' ')"
LAID="$(cd "$ASSETS/../../.." && pwd)/.claude/hooks/owner-stop-call-guard.sh"
fresh; typed 'делай задачу'; typed 'стоп'; notice; jq -cn --arg p "$P" --arg s "$SID" --arg t "$NOTE" '{session_id:$s,hook_event_name:"UserPromptSubmit",transcript_path:$p,prompt:$t}' | (cd "$TMP" && CLAUDE_PROJECT_DIR= bash "$LAID") >/dev/null 2>&1
case_of 'разложенный хук вне дерева находит движок — метка отказа' "$(cut -d' ' -f1 "$TMP/claude-stop-call/$SID" 2>/dev/null)" refuse
REAL="$ASSETS/../tests/fixtures/real-record/2026-11-13.jsonl"
want="$(jq -cn --arg p "$REAL" '{hook_event_name:"PreToolUse",transcript_path:$p}' | node "$ASSETS/checks/task-flow-script.mjs" stop-call | jq -r 'if .refuseCalls then "deny" else "PASS" end')"
P="$REAL"; SID="real"; rm -f "$TMP/claude-stop-call/real"
case_of 'настоящая запись 13.11 — хук отвечает как движок' "$(pre)" "$want"

suite_result "запрет вызовов после остановки"
