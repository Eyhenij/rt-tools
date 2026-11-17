#!/usr/bin/env bash
# Сценарии счётчика записи разговора `checks/record-count.mjs` на заготовках.
#
# Счётчик читает запись сессии Claude Code и отвечает, что сказал владелец и в чём агенту отказали.
# Его ответы — основа метрик результата работы: слова владельца, отказы на сто вызовов, пары
# отказов, простой, переспросы. Заготовки собраны здесь из записей того вида, какой пишет Claude
# Code; настоящая запись 13.11 спрашивается набором `real-record.test.sh`.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "счётчик записи разговора"

COUNTER="$CHECKS/record-count.mjs"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# Ответ счётчика на заготовку: имя функции и выражение над её результатом. Ответ печатается строкой,
# не через `console.log`: под раннером, который включает цвета, число выходит с кодами цвета.
count() {
    node --input-type=module -e '
import { readFileSync } from "node:fs";
const counter = await import(process.argv[1]);
const entries = readFileSync(process.argv[2], "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const result = counter[process.argv[3]](entries, process.argv[5]);
process.stdout.write(`${new Function("r", `return (${process.argv[4]});`)(result)}\n`);' "$COUNTER" "$1" "$2" "$3" "${4:-}"
}

# --- the owner's words ------------------------------------------------------------------------------
cat > "$WORK/words.jsonl" <<'EOF'
{"type":"user","uuid":"u1","sessionId":"s1","timestamp":"2026-11-13T00:01:00Z","message":{"role":"user","content":"делай эпик дальше"}}
{"type":"user","uuid":"u2","sessionId":"s1","timestamp":"2026-11-13T00:02:00Z","message":{"role":"user","content":[{"type":"text","text":"[Request interrupted by user]"}]}}
{"type":"user","uuid":"u3","sessionId":"s1","timestamp":"2026-11-13T00:03:00Z","message":{"role":"user","content":"<command-name>/compact</command-name>"}}
{"type":"user","uuid":"u4","sessionId":"s1","timestamp":"2026-11-13T00:04:00Z","message":{"role":"user","content":"<local-command-stdout>Compacted</local-command-stdout>"}}
{"type":"attachment","uuid":"a1","sessionId":"s1","timestamp":"2026-11-13T00:05:00Z","attachment":{"type":"queued_command","commandMode":"prompt","origin":{"kind":"human"},"prompt":"остановись после текущего действия","delivery_id":"d1"}}
{"type":"attachment","uuid":"a2","sessionId":"s1","timestamp":"2026-11-13T00:06:00Z","attachment":{"type":"queued_command","commandMode":"task-notification","origin":{"kind":"task-notification"},"prompt":"<task-notification>done</task-notification>","delivery_id":"d2"}}
{"type":"attachment","uuid":"a3","sessionId":"s1","timestamp":"2026-11-13T00:07:00Z","attachment":{"type":"queued_command","commandMode":"prompt","origin":{"kind":"peer"},"prompt":"сообщение соседней сессии","delivery_id":"d3"}}
{"type":"user","uuid":"u5","sessionId":"s1","timestamp":"2026-11-13T00:08:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t1","content":"ok"}]}}
{"type":"user","uuid":"u6","sessionId":"s1","isMeta":true,"timestamp":"2026-11-13T00:09:00Z","message":{"role":"user","content":"meta"}}
{"type":"user","uuid":"u7","sessionId":"s1","timestamp":"2026-11-13T00:10:00Z","message":{"role":"user","content":"Stop hook feedback:\nBLOCKED by turn-exit-guard: x"}}
{"type":"user","uuid":"u8","sessionId":"s1","timestamp":"2026-11-13T00:11:00Z","message":{"role":"user","content":"<pasted_content id=\"p1\">текст владельца</pasted_content>"}}
EOF
report "SC-AK-1610 — обёртки среды не слова владельца, сообщение посреди хода — слово" \
    "$(count "$WORK/words.jsonl" ownerWords 'r.map((w) => w.kind).join(" ")')" "typed queued typed"
report "SC-AK-1610 — сообщение посреди хода читается своим текстом" \
    "$(count "$WORK/words.jsonl" ownerWords 'r[1].text')" "остановись после текущего действия"

cat > "$WORK/repeat.jsonl" <<'EOF'
{"type":"attachment","uuid":"a1","sessionId":"s1","timestamp":"2026-11-13T00:05:00Z","attachment":{"type":"queued_command","commandMode":"prompt","origin":{"kind":"human"},"prompt":"Разрешаю замену проверок","delivery_id":"d1"}}
{"type":"user","uuid":"u1","sessionId":"s1","timestamp":"2026-11-13T00:09:00Z","message":{"role":"user","content":"Разрешаю замену проверок"}}
{"type":"user","uuid":"u1","sessionId":"s1","timestamp":"2026-11-13T00:09:00Z","message":{"role":"user","content":"Разрешаю замену проверок"}}
{"type":"user","uuid":"u2","sessionId":"s2","timestamp":"2026-11-13T00:10:00Z","message":{"role":"user","content":"Разрешаю замену проверок"}}
EOF
report "SC-AK-1650 — сообщение посреди хода, повторённое набранным, считается один раз" \
    "$(count "$WORK/repeat.jsonl" ownerWords 'r.filter((w) => w.session === "s1").length')" "1"
report "SC-AK-1650 — тот же текст в другой сессии — своё слово" \
    "$(count "$WORK/repeat.jsonl" ownerWords 'r.length')" "2"

# --- the refusals -----------------------------------------------------------------------------------
cat > "$WORK/refusals.jsonl" <<'EOF'
{"type":"user","uuid":"r1","sessionId":"s1","timestamp":"2026-11-13T01:00:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t1","is_error":true,"content":"PreToolUse:Bash hook error: BLOCKED by task-flow: there is no plan"}]}}
{"type":"user","uuid":"r2","sessionId":"s1","timestamp":"2026-11-13T01:01:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t2","is_error":true,"content":"Permission for this action was denied by the Claude Code auto mode classifier. Reason: x"}]}}
{"type":"user","uuid":"r3","sessionId":"s1","timestamp":"2026-11-13T01:02:00Z","message":{"role":"user","content":"Stop hook feedback:\nBLOCKED by turn-exit-guard: the scenario is not over"}}
{"type":"user","uuid":"r4","sessionId":"s1","timestamp":"2026-11-13T01:03:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t4","is_error":true,"content":"Exit code 1\nnpm ERR!"}]}}
{"type":"user","uuid":"r5","sessionId":"s1","timestamp":"2026-11-13T01:04:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t5","is_error":true,"content":"The user doesn't want to proceed with this tool use."}]}}
{"type":"user","uuid":"r6","sessionId":"s1","timestamp":"2026-11-13T01:05:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t6","is_error":true,"content":"[Request interrupted by user for tool use]"}]}}
EOF
report "SC-AK-1612 — отказы только трёх классов: хук, разрешение, конец хода" \
    "$(count "$WORK/refusals.jsonl" refusals 'r.map((x) => x.kind).join(" ")')" "hook permission stop"

cat > "$WORK/checks.jsonl" <<'EOF'
{"type":"user","uuid":"c1","sessionId":"s1","timestamp":"2026-11-13T01:00:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t1","is_error":true,"content":"PreToolUse:Edit hook error: Refused by the rules gate. This edit falls under the articles"}]}}
{"type":"user","uuid":"c2","sessionId":"s1","timestamp":"2026-11-13T01:01:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t2","is_error":true,"content":"PreToolUse:Bash hook error: Refused: the epic is over — every task of it is merged"}]}}
{"type":"user","uuid":"c3","sessionId":"s1","timestamp":"2026-11-13T01:02:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t3","is_error":true,"content":"PreToolUse:AskUserQuestion hook error: BLOCKED by grill-gate: a guard refused in this turn"}]}}
{"type":"user","uuid":"c4","sessionId":"s1","timestamp":"2026-11-13T01:03:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t4","is_error":true,"content":"PreToolUse:Bash hook error: BLOCKED: creating a branch for a task while a conflicting request"}]}}
{"type":"user","uuid":"c5","sessionId":"s1","timestamp":"2026-11-13T01:04:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t5","is_error":true,"content":"Permission for this action was denied by the Claude Code auto mode classifier."}]}}
EOF
report "SC-AK-1645 — текст отказа даёт проверку по таблице" \
    "$(count "$WORK/checks.jsonl" refusals 'r.map((x) => x.check).join(" ")')" "skill-gate epic-over grill-gate unnamed permission"

cat > "$WORK/stop.jsonl" <<'EOF'
{"type":"user","uuid":"s1","sessionId":"s1","timestamp":"2026-11-13T01:00:00Z","message":{"role":"user","content":"Stop hook feedback:\nBLOCKED by turn-exit-guard: the scenario is not over"}}
{"type":"system","uuid":"s2","subtype":"stop_hook_summary","sessionId":"s1","timestamp":"2026-11-13T01:00:01Z","hookErrors":["BLOCKED by turn-exit-guard: the scenario is not over"],"preventedContinuation":false}
{"type":"user","uuid":"s3","sessionId":"s1","timestamp":"2026-11-13T01:05:00Z","message":{"role":"user","content":"Stop hook feedback:"}}
EOF
report "SC-AK-1646 — отказ конца хода считается один раз, по записи обратной связи" \
    "$(count "$WORK/stop.jsonl" refusals 'r.map((x) => x.kind + ":" + x.check).join(" ")')" "stop:turn-exit-guard stop:unnamed"

# --- pairs, interrupts, corrections -------------------------------------------------------------------
cat > "$WORK/pairs.jsonl" <<'EOF'
{"type":"user","uuid":"p1","sessionId":"s1","timestamp":"2026-11-13T01:00:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t1","is_error":true,"content":"PreToolUse:AskUserQuestion hook error: BLOCKED by grill-gate: x"}]}}
{"type":"user","uuid":"p2","sessionId":"s1","timestamp":"2026-11-13T01:01:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t2","is_error":true,"content":"PreToolUse:Edit hook error: Refused by the rules gate. x"}]}}
{"type":"user","uuid":"p3","sessionId":"s1","timestamp":"2026-11-13T01:02:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t3","content":"ok"}]}}
{"type":"user","uuid":"p4","sessionId":"s1","timestamp":"2026-11-13T01:03:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t4","is_error":true,"content":"PreToolUse:Edit hook error: BLOCKED by task-flow: x"}]}}
{"type":"user","uuid":"p5","sessionId":"s1","timestamp":"2026-11-13T01:04:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t5","is_error":true,"content":"PreToolUse:Edit hook error: BLOCKED by task-flow: x"}]}}
EOF
report "SC-AK-1614 — две разные проверки подряд — пара, повтор той же — не пара" \
    "$(count "$WORK/pairs.jsonl" pairs 'r.map((p) => p.first + ">" + p.second).join(" ")')" "grill-gate>skill-gate"

cat > "$WORK/interrupts.jsonl" <<'EOF'
{"type":"user","uuid":"i1","sessionId":"s1","timestamp":"2026-11-13T01:00:00Z","message":{"role":"user","content":[{"type":"text","text":"[Request interrupted by user]"}]}}
{"type":"user","uuid":"i2","sessionId":"s1","timestamp":"2026-11-13T01:01:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t2","is_error":true,"content":"[Request interrupted by user for tool use]"}]}}
{"type":"attachment","uuid":"i3","sessionId":"s1","timestamp":"2026-11-13T01:02:00Z","attachment":{"type":"queued_command","commandMode":"prompt","origin":{"kind":"human"},"prompt":"почему опять не так?","delivery_id":"d1"}}
{"type":"user","uuid":"i4","sessionId":"s1","timestamp":"2026-11-13T01:03:00Z","message":{"role":"user","content":"делай дальше"}}
EOF
PATTERNS="$(sed -n "s/^RT_CORRECTION_PATTERNS='\(.*\)'$/\1/p" "$HOOKS/owner-corrections.sh")"
report "SC-AK-1620 — прерывания хода считаются по записи" \
    "$(count "$WORK/interrupts.jsonl" interrupts 'r.length')" "2"
report "SC-AK-1620 — правка владельца посреди хода считается" \
    "$(count "$WORK/interrupts.jsonl" corrections 'r.length' "$PATTERNS")" "1"

# --- idle time ----------------------------------------------------------------------------------------
refusal() { printf '{"type":"user","uuid":"%s","sessionId":"%s","timestamp":"%s","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"x%s","is_error":true,"content":"PreToolUse:Bash hook error: BLOCKED by %s: x"}]}}\n' "$1" "$2" "$3" "$1" "${4:-task-flow}"; }
edit() { printf '{"type":"assistant","uuid":"%s","sessionId":"%s","timestamp":"%s","message":{"role":"assistant","content":[{"type":"tool_use","id":"e%s","name":"%s","input":{"command":"%s"}}]}}\n' "$1" "$2" "$3" "$1" "${4:-Edit}" "${5:-}"; }
word() { printf '{"type":"user","uuid":"%s","sessionId":"%s","timestamp":"%s","message":{"role":"user","content":"%s"}}\n' "$1" "$2" "$3" "$4"; }
{
    refusal a1 s1 2026-11-13T10:00:00Z
    refusal a2 s1 2026-11-13T10:20:00Z
    edit a3 s1 2026-11-13T11:00:00Z
    refusal a4 s2 2026-11-13T12:00:00Z
    edit a5 s2 2026-11-13T12:30:00Z Bash "git commit -q -F msg.txt"
} > "$WORK/idle.jsonl"
report "SC-AK-1616 — простой от отказа до изменения дерева, второй отказ ничего не добавляет" \
    "$(count "$WORK/idle.jsonl" idle 'r.reduce((a, s) => a + s.minutes, 0)')" "90"
{
    refusal b1 s1 2026-11-13T10:00:00Z turn-exit-guard
    printf '{"type":"assistant","uuid":"b2","sessionId":"s1","timestamp":"2026-11-13T10:01:00Z","message":{"role":"assistant","content":[{"type":"tool_use","id":"q1","name":"AskUserQuestion","input":{"questions":[{"question":"Что дальше?"}]}}]}}\n'
    word b3 s1 2026-11-13T10:40:00Z "делай"
    edit b4 s1 2026-11-13T10:45:00Z
} > "$WORK/idle-turns.jsonl"
report "SC-AK-1617 — простой, открытый в конце хода, закрывается правкой следующего хода" \
    "$(count "$WORK/idle-turns.jsonl" idle 'r.map((s) => s.from.slice(11, 16) + "-" + s.to.slice(11, 16)).join(" ")')" "10:00-10:45"
{
    refusal c1 s1 2026-11-12T23:40:00Z
    edit c2 s1 2026-11-13T00:20:00Z
} > "$WORK/idle-midnight.jsonl"
report "SC-AK-1648 — простой через полночь принадлежит дню начала" \
    "$(count "$WORK/idle-midnight.jsonl" idle 'r.map((s) => s.day + ":" + s.minutes).join(" ")')" "2026-11-12:40"

# --- re-asks and dead ends ------------------------------------------------------------------------------
ask() { printf '{"type":"assistant","uuid":"%s","sessionId":"s1","gitBranch":"RT-1-x","timestamp":"%s","message":{"role":"assistant","content":[{"type":"tool_use","id":"%s","name":"AskUserQuestion","input":{"questions":[{"question":"%s"}]}}]}}\n' "$1" "$2" "$1" "$3"; }
{
    ask q1 2026-11-13T01:00:00Z "Проверка конца эпика не зачла ваш прошлый ответ"
    printf '{"type":"user","uuid":"q1r","sessionId":"s1","gitBranch":"RT-1-x","timestamp":"2026-11-13T01:00:01Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"q1","is_error":true,"content":"PreToolUse:AskUserQuestion hook error: BLOCKED by grill-gate: x"}]}}\n'
    ask q2 2026-11-13T01:01:00Z "Проверка конца эпика не зачла ваш прошлый ответ"
    ask q3 2026-11-13T01:02:00Z "Проверка конца эпика не зачла ваш прошлый ответ"
} > "$WORK/reask-none.jsonl"
report "SC-AK-1619 — вопрос, повторённый до любого ответа, — не переспрос" \
    "$(count "$WORK/reask-none.jsonl" reasks 'r.length')" "0"
{
    ask q1 2026-11-13T01:00:00Z "Завести задачу?"
    printf '{"type":"user","uuid":"q1a","sessionId":"s1","gitBranch":"RT-1-x","timestamp":"2026-11-13T01:00:30Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"q1","content":"Your questions have been answered: \\"Завести задачу?\\"=\\"Да\\""}]},"toolUseResult":{"answers":{"Завести задачу?":"Да"}}}\n'
    ask q2 2026-11-13T01:01:00Z "Проверка конца эпика не зачла ваш прошлый ответ"
} > "$WORK/reask.jsonl"
report "SC-AK-1619 — вопрос с отсылкой к прошлому ответу после ответа в той же задаче — переспрос" \
    "$(count "$WORK/reask.jsonl" reasks 'r.length')" "1"
{
    refusal d1 s1 2026-11-13T01:00:00Z epic-over
    refusal d2 s1 2026-11-13T01:01:00Z epic-over
    word d3 s1 2026-11-13T01:02:00Z "да, завести задачу"
    refusal d4 s1 2026-11-13T01:03:00Z epic-over
    refusal d5 s2 2026-11-13T02:00:00Z turn-exit-guard
    refusal d6 s2 2026-11-13T02:01:00Z turn-exit-guard
    refusal d7 s2 2026-11-13T02:02:00Z turn-exit-guard
    edit d8 s2 2026-11-13T02:03:00Z
} > "$WORK/dead.jsonl"
report "SC-AK-1625 — серия, из которой вывел только владелец, — тупик; серия, после которой пошла правка, — нет" \
    "$(count "$WORK/dead.jsonl" deadEnds 'r.map((d) => d.check + ":" + d.count).join(" ")')" "epic-over:3"

suite_result "счётчик записи разговора"
