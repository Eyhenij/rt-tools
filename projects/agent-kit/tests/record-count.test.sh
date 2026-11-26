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

cat > "$WORK/load-move.jsonl" <<'EOF'
{"type":"user","uuid":"m1","sessionId":"s1","timestamp":"2026-11-13T01:00:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t1","is_error":true,"content":"PreToolUse:Edit hook error: BLOCKED by task-flow-guard: the plan is missing. The named move is held by the rules gate: load the rule «task-flow» by the tool Skill first"}]}}
{"type":"user","uuid":"m2","sessionId":"s1","timestamp":"2026-11-13T01:01:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t2","is_error":true,"content":"PreToolUse:Edit hook error: BLOCKED by task-flow-guard: the plan is missing"}]}}
EOF
report "SC-AK-1698 — отказ соседа с ходом загрузки правила считается отказом ворот правил" \
    "$(count "$WORK/load-move.jsonl" refusals 'r.map((x) => x.check).join(" ")')" "skill-gate task-flow-guard"

cat > "$WORK/stop.jsonl" <<'EOF'
{"type":"user","uuid":"s1","sessionId":"s1","timestamp":"2026-11-13T01:00:00Z","message":{"role":"user","content":"Stop hook feedback:\nBLOCKED by turn-exit-guard: the scenario is not over"}}
{"type":"system","uuid":"s2","subtype":"stop_hook_summary","sessionId":"s1","timestamp":"2026-11-13T01:00:01Z","hookErrors":["BLOCKED by turn-exit-guard: the scenario is not over"],"preventedContinuation":false}
{"type":"user","uuid":"s3","sessionId":"s1","timestamp":"2026-11-13T01:05:00Z","message":{"role":"user","content":"Stop hook feedback:"}}
EOF
report "SC-AK-1646 — отказ конца хода считается один раз, по записи обратной связи" \
    "$(count "$WORK/stop.jsonl" refusals 'r.map((x) => x.kind + ":" + x.check).join(" ")')" "stop:turn-exit-guard stop:unnamed"

# Тексты отказов без имени проверки — начала настоящих отказов из записей 14–20.11 (браузерные
# отказы профиля, списка и вопроса — из таблицы решений: в записях их нет). Каждая строка таблицы
# счётчика называет свою проверку по тексту.
cat > "$WORK/named.jsonl" <<'EOF'
{"type":"user","uuid":"n1","sessionId":"s1","timestamp":"2026-11-20T01:00:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t1","is_error":true,"content":"PreToolUse:Read hook error: [command hook 3]: /Users/x/tree/.claude/hooks/dispatch.sh: line 2: syntax error near unexpected token `<<<'\n/Users/x/tree/.claude/hooks/dispatch.sh: line 2: `<<<<<<< HEAD'"}]}}
{"type":"user","uuid":"n2","sessionId":"s1","timestamp":"2026-11-20T01:01:00Z","message":{"role":"user","content":"Stop hook feedback:\nAgent hook condition was not met: The file .claude/hooks/turn-judge.md does not exist under the cwd, so I could not follow it."}}
{"type":"user","uuid":"n3","sessionId":"s1","timestamp":"2026-11-20T01:02:00Z","message":{"role":"user","content":"Stop hook feedback:\nAgent hook condition was not met: The plan is not finished. The last message quotes BLOCKED by turn-exit-guard: the scenario is not over"}}
{"type":"user","uuid":"n4","sessionId":"s1","timestamp":"2026-11-20T01:03:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t4","is_error":true,"content":"PreToolUse:AskUserQuestion hook error: Agent hook condition was not met: I couldn't read .claude/hooks/ask-judge.md, so I could not judge the question."}]}}
{"type":"user","uuid":"n5","sessionId":"s1","timestamp":"2026-11-20T01:04:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t5","is_error":true,"content":"PreToolUse:AskUserQuestion hook error: Agent hook condition was not met: BLOCKED by ask-judge: the third question repeats a decision the owner already gave"}]}}
{"type":"user","uuid":"n6","sessionId":"s1","timestamp":"2026-11-20T01:05:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t6","is_error":true,"content":"PreToolUse:Bash hook error: BLOCKED: the work is not ready for delivery. Everything unmet is named whole — so that it\nis fixed in one session, not one miss per round:"}]}}
{"type":"user","uuid":"n7","sessionId":"s1","timestamp":"2026-11-20T01:06:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t7","is_error":true,"content":"PreToolUse:Bash hook error: BLOCKED: creating a branch for a task while a conflicting request of your own stands. What was handed over conflicts with the main branch"}]}}
{"type":"user","uuid":"n8","sessionId":"s1","timestamp":"2026-11-20T01:07:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t8","is_error":true,"content":"PreToolUse:Bash hook error: BLOCKED: the PR #3311 of the branch «RT-3309-auth-metrika-frame-src» is merged, and the branch has no open PR."}]}}
{"type":"user","uuid":"n9","sessionId":"s1","timestamp":"2026-11-20T01:08:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t9","is_error":true,"content":"PreToolUse:Bash hook error: BLOCKED: the heavy steps of this tree run ahead, not inside the guard — inside it they hit the hook limit"}]}}
{"type":"user","uuid":"n10","sessionId":"s1","timestamp":"2026-11-20T01:09:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t10","is_error":true,"content":"PreToolUse:Bash hook error: BLOCKED: the call goes from a second working copy — «/Users/x/other», while the session stands in «/Users/x/tree»."}]}}
{"type":"user","uuid":"n11","sessionId":"s1","timestamp":"2026-11-20T01:10:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t11","is_error":true,"content":"PreToolUse:Bash hook error: Refused: a commit straight into «main». Work travels through a branch and a PR — the rule git-workflow."}]}}
{"type":"user","uuid":"n12","sessionId":"s1","timestamp":"2026-11-20T01:11:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t12","is_error":true,"content":"PreToolUse:Bash hook error: Refused: this call takes work, and the copy «rt-tools» leads the epic RT-3232, and this work belongs to RT-3313."}]}}
{"type":"user","uuid":"n13","sessionId":"s1","timestamp":"2026-11-20T01:12:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t13","is_error":true,"content":"PreToolUse:Bash hook error: BLOCKED: the commit edits code but not the document that describes it.\n\n  • `a.component.ts` is edited without its document"}]}}
{"type":"user","uuid":"n14","sessionId":"s1","timestamp":"2026-11-20T01:13:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t14","is_error":true,"content":"PreToolUse:Edit hook error: BLOCKED: this is already written. File: auth-start-check.spec.ts\n\nThe order of moves: 1) open the ready-made"}]}}
{"type":"user","uuid":"n15","sessionId":"s1","timestamp":"2026-11-20T01:14:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t15","is_error":true,"content":"PreToolUse:mcp__claude-in-chrome__tabs_context_mcp hook error: No browser is selected in this session. Call the browser selection with the profile p1 before any other call."}]}}
{"type":"user","uuid":"n16","sessionId":"s1","timestamp":"2026-11-20T01:15:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t16","is_error":true,"content":"PreToolUse:mcp__claude-in-chrome__tabs_context_mcp hook error: The last browser selection was 48073 s ago (the limit is 300 s) — over such a break the active browser drifts away"}]}}
{"type":"user","uuid":"n17","sessionId":"s1","timestamp":"2026-11-20T01:16:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t17","is_error":true,"content":"PreToolUse:mcp__claude-in-chrome__select_browser hook error: The profile «p2» is not the one pinned to the project. Take p1"}]}}
{"type":"user","uuid":"n18","sessionId":"s1","timestamp":"2026-11-20T01:17:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t18","is_error":true,"content":"PreToolUse:mcp__claude-in-chrome__list_connected_browsers hook error: Do not list and do not switch browsers. Call the browser selection with the profile p1"}]}}
{"type":"user","uuid":"n19","sessionId":"s1","timestamp":"2026-11-20T01:18:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t19","is_error":true,"content":"PreToolUse:AskUserQuestion hook error: Do not ask which browser to use — the profile is pinned. Call select_browser with deviceId p1"}]}}
{"type":"user","uuid":"n20","sessionId":"s1","timestamp":"2026-11-20T01:19:00Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t20","is_error":true,"content":"PreToolUse:Bash hook error: [$CLAUDE_PROJECT_DIR/.claude/hooks/dispatch.sh PreToolUse]: A browser raised by a library from inside the tree. Drive the browser by the pinned extension: select the profile p1 and work by its tools."}]}}
EOF
named() { count "$WORK/named.jsonl" refusals "r.slice($1, $2).map((x) => x.check).join(\" \")"; }
report "SC-AK-1817 — сбой диспетчера хуков — dispatch-broken" "$(named 0 1)" "dispatch-broken"
report "SC-AK-1817 — модельная проверка конца хода без файла и с чужой цитатой — turn-judge" \
    "$(named 1 3)" "turn-judge turn-judge"
report "SC-AK-1817 — модельная проверка вопроса без файла и с именем — ask-judge" \
    "$(named 3 5)" "ask-judge ask-judge"
report "SC-AK-1817 — проверка доставки без имени — git-guard-delivery" \
    "$(named 5 8)" "git-guard-delivery git-guard-delivery git-guard-delivery"
report "SC-AK-1817 — проверка отправки без имени — git-guard-push-tests" \
    "$(named 8 10)" "git-guard-push-tests git-guard-push-tests"
report "SC-AK-1817 — коммит прямо в главную ветку — git-guard-main" "$(named 10 11)" "git-guard-main"
report "SC-AK-1817 — назначение дерева — tree-assignment-guard" "$(named 11 12)" "tree-assignment-guard"
report "SC-AK-1817 — коммит кода без документа — docs-guard" "$(named 12 13)" "docs-guard"
report "SC-AK-1817 — уже написанное — reuse-first-guard" "$(named 13 14)" "reuse-first-guard"
report "SC-AK-1817 — браузер не выбран или выбран давно — browser-guard-require-select" \
    "$(named 14 16)" "browser-guard-require-select browser-guard-require-select"
report "SC-AK-1817 — браузерные проверки профиля, списка, вопроса и чужого драйвера" \
    "$(named 16 20)" "browser-guard-device-id browser-guard-no-listing browser-guard-no-asking browser-guard-no-other-drivers"
check_of() { node --input-type=module -e "import { checkOf } from '$ASSETS/checks/record-count.mjs'; process.stdout.write(checkOf(process.argv[1]));" "$1"; }
report "SC-AK-1817 — a guard that names itself keeps its name over a line of the dispatcher" \
    "$(check_of 'PreToolUse:Bash hook error: [/u/.claude/hooks/dispatch.sh PreToolUse]: BLOCKED by git-guard-push-tests: /u/.claude/hooks/dispatch.sh: line 12: jq: command not found')" \
    "git-guard-push-tests"
report "SC-AK-1817 — a model check frame keeps its name over a quoted shell error of the dispatcher" \
    "$(check_of 'Stop hook feedback:
Agent hook condition was not met: /u/.claude/hooks/dispatch.sh: line 4: syntax error')" "turn-judge"
report "SC-AK-1817 — a model check frame after a leading newline is still named" \
    "$(check_of '
PreToolUse:AskUserQuestion hook error: Agent hook condition was not met: BLOCKED by grill-gate: x')" "ask-judge"

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

# --- the rules gate by its own notes ------------------------------------------------------------------
cat > "$WORK/gate.jsonl" <<'EOF'
{"t":"2026-11-18T07:00:00Z","ev":"gate-deny","res":"testing","why":"too-long","v":"0.37.0"}
{"t":"2026-11-18T07:01:00Z","ev":"gate-deny","res":"testing","why":"too-long","v":"0.37.0"}
{"t":"2026-11-18T07:02:00Z","ev":"gate-deny","res":"spec-driven","why":"together","v":"0.37.0"}
{"t":"2026-11-18T07:03:00Z","ev":"gate-deny","res":"x","why":"not-read","v":"0.37.0"}
{"t":"2026-11-18T07:03:30Z","ev":"gate-deny","res":"code-design","why":"before","v":"0.37.0"}
{"t":"2026-11-18T07:04:00Z","ev":"gate-deny","res":"task-flow","v":"0.37.0"}
{"t":"2026-11-18T07:05:00Z","ev":"gate-deny","res":"testing","why":"too-long","v":"dev"}
{"t":"2026-11-17T07:05:00Z","ev":"gate-deny","res":"testing","why":"too-long","v":"0.37.0"}
{"t":"2026-11-18T07:06:00Z","ev":"gate-deliver","res":"doc-style","v":"0.37.0"}
{"t":"2026-11-18T07:07:00Z","ev":"gate-deliver","res":"typescript-conventions","v":"0.37.0"}
EOF
report "SC-AK-1747 — отказы проверки правил разложены по причине; запись сценариев хуков и другой день не считаются" \
    "$(count "$WORK/gate.jsonl" gateOf 'Object.entries(r.refused).map(([w, n]) => w + ":" + n).join(" ")' 2026-11-18)" "too-long:2 together:1 not-read:1 before:1 none:1"
report "SC-AK-1748 — правила, доставленные без отказа, считаются по заметке доставки" \
    "$(count "$WORK/gate.jsonl" gateOf 'r.delivered' 2026-11-18)" "2"

# --- a queued message the record repeats ---------------------------------------------------------------
# Записи 23.11: одно сообщение посреди хода лежит в записи несколько раз через миллисекунду, под разными
# идентификаторами. В одном ходе оно одно; то же сообщение в следующем ходе — уже второе.
cat > "$WORK/queued-repeat.jsonl" <<'EOF'
{"type":"user","uuid":"q0","sessionId":"s1","timestamp":"2026-11-23T10:04:00Z","message":{"role":"user","content":"делай задачу"}}
{"type":"attachment","uuid":"q1","sessionId":"s1","timestamp":"2026-11-23T10:04:54.500Z","attachment":{"type":"queued_command","commandMode":"prompt","origin":{"kind":"human"},"prompt":"продолжай","delivery_id":"e1"}}
{"type":"attachment","uuid":"q2","sessionId":"s1","timestamp":"2026-11-23T10:04:54.501Z","attachment":{"type":"queued_command","commandMode":"prompt","origin":{"kind":"human"},"prompt":"продолжай","delivery_id":"e2"}}
{"type":"attachment","uuid":"q3","sessionId":"s1","timestamp":"2026-11-23T10:04:54.502Z","attachment":{"type":"queued_command","commandMode":"prompt","origin":{"kind":"human"},"prompt":"продолжай","delivery_id":"e3"}}
{"type":"user","uuid":"q4","sessionId":"s1","timestamp":"2026-11-23T10:10:00Z","message":{"role":"user","content":"следующая"}}
{"type":"attachment","uuid":"q5","sessionId":"s1","timestamp":"2026-11-23T10:11:00Z","attachment":{"type":"queued_command","commandMode":"prompt","origin":{"kind":"human"},"prompt":"продолжай","delivery_id":"e4"}}
EOF
report "SC-AK-2004 — сообщение посреди хода, повторённое записью в одном ходе, — одно; в следующем ходе — второе" \
    "$(count "$WORK/queued-repeat.jsonl" ownerWords 'r.map((w) => w.kind).join(" ")')" "typed queued typed queued"

# Копии в одну миллисекунду дают одно событие слова, а не по одному на копию. То же сообщение, набранное
# в следующем ходе, — второе слово. Два настоящих одинаковых сообщения через 20 минут одного хода — два.
cat > "$WORK/queued-same-ms.jsonl" <<'EOF'
{"type":"user","uuid":"m0","sessionId":"s1","timestamp":"2026-11-23T10:00:00Z","message":{"role":"user","content":"делай"}}
{"type":"attachment","uuid":"m1","sessionId":"s1","timestamp":"2026-11-23T10:00:05.100Z","attachment":{"type":"queued_command","commandMode":"prompt","origin":{"kind":"human"},"prompt":"стоп","delivery_id":"f1"}}
{"type":"attachment","uuid":"m2","sessionId":"s1","timestamp":"2026-11-23T10:00:05.100Z","attachment":{"type":"queued_command","commandMode":"prompt","origin":{"kind":"human"},"prompt":"стоп","delivery_id":"f2"}}
{"type":"attachment","uuid":"m3","sessionId":"s1","timestamp":"2026-11-23T10:20:00Z","attachment":{"type":"queued_command","commandMode":"prompt","origin":{"kind":"human"},"prompt":"стоп","delivery_id":"f3"}}
{"type":"user","uuid":"m4","sessionId":"s1","timestamp":"2026-11-23T10:30:00Z","message":{"role":"user","content":"следующая"}}
{"type":"user","uuid":"m5","sessionId":"s1","timestamp":"2026-11-23T11:00:00Z","message":{"role":"user","content":"стоп"}}
EOF
report "SC-AK-2004 — копии одной миллисекунды — одно событие слова; повтор через 20 минут и в другом ходе — новые слова" \
    "$(count "$WORK/queued-same-ms.jsonl" eventsOf 'r.filter((e) => e.ev === "word").map((e) => e.kind).join(" ")')" \
    "typed queued queued typed typed"

# Два разных сообщения в одну миллисекунду — два слова, каждое со своим видом и своей пометкой поправки.
# Цепочка копий через 4 секунды каждая — одно сообщение: окно меряется от последней копии.
cat > "$WORK/queued-two-texts.jsonl" <<'EOF'
{"type":"attachment","uuid":"n1","sessionId":"s1","timestamp":"2026-11-23T10:00:05.100Z","attachment":{"type":"queued_command","commandMode":"prompt","origin":{"kind":"human"},"prompt":"переделай таблицу","delivery_id":"g1"}}
{"type":"attachment","uuid":"n2","sessionId":"s1","timestamp":"2026-11-23T10:00:05.100Z","attachment":{"type":"queued_command","commandMode":"prompt","origin":{"kind":"human"},"prompt":"где стоим?","delivery_id":"g2"}}
{"type":"attachment","uuid":"n3","sessionId":"s1","timestamp":"2026-11-23T10:01:00Z","attachment":{"type":"queued_command","commandMode":"prompt","origin":{"kind":"human"},"prompt":"дальше","delivery_id":"g3"}}
{"type":"attachment","uuid":"n4","sessionId":"s1","timestamp":"2026-11-23T10:01:04Z","attachment":{"type":"queued_command","commandMode":"prompt","origin":{"kind":"human"},"prompt":"дальше","delivery_id":"g4"}}
{"type":"attachment","uuid":"n5","sessionId":"s1","timestamp":"2026-11-23T10:01:08Z","attachment":{"type":"queued_command","commandMode":"prompt","origin":{"kind":"human"},"prompt":"дальше","delivery_id":"g5"}}
{"type":"attachment","uuid":"n6","sessionId":"s1","timestamp":"2026-11-23T10:01:12Z","attachment":{"type":"queued_command","commandMode":"prompt","origin":{"kind":"human"},"prompt":"дальше","delivery_id":"g6"}}
EOF
report "SC-AK-2004 — два разных сообщения одной миллисекунды — два слова со своим видом; цепочка копий — одно" \
    "$(count "$WORK/queued-two-texts.jsonl" eventsOf 'r.filter((e) => e.ev === "word").map((e) => e.about + (e.corr ? "!" : "")).sort().join(" ")' 'переделай')" \
    "correction! order status"

# --- the kind of a typed message -----------------------------------------------------------------------
# Вид берётся из слов сообщения: поправка по тому же набору образцов, что у хука поправок, вопрос «где
# стоим», приказ начать или продолжить работу, остальное — прочее. Поправка в форме приказа — поправка.
kinds() {
    node --input-type=module -e '
const { aboutOf } = await import(process.argv[1]);
const said = ["почему опять красный набор", "где стоим?", "Заведи новый эпик и задачу в нем", "продолжай", "переделай таблицу", "спасибо, хорошо", "ок, дальше", "do you see the red badge", "what is the status of RT-1", "добавь колонку статус в список", "дальше не надо"];
process.stdout.write(said.map((t) => aboutOf(t, process.argv[2])).join(" ") + "\n");' "$COUNTER" "$1"
}
report "SC-AK-2005 — набранное сообщение получает вид: поправка, «где стоим», новый приказ, прочее" \
    "$(kinds 'почему|опять|переделай')" "correction status order order correction other order other status order other"

suite_result "счётчик записи разговора"
