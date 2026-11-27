#!/usr/bin/env bash
# День 24.11 одной цепочкой: работа ждёт владельца — ночь, одобрение плана, который правит проверку, слова
# владельца, Esc и `Monitor` по своему фоновому. Сценарий SC-AK-2018.
#
# Точки лежат строками `fixtures/owner-waits/2411-day.json`: запись сессии с 01:15 до 11:13 по местному
# времени. На конце каждого хода набор зовёт хук на Stop, на каждом вызове после Esc — хуки `PreToolUse`;
# запись до точки собирает `turn-replay-lib.mjs` и сдвигает её время к минуте прогона. Каждая точка судится на
# истории, которую дала запись: после отказа агент сделал бы иначе, и этого набор не строит. Синтетическая
# точка лежит в `branches` и судится на копии записи до её места — в цепочку она не входит.
#
# Строка точки несёт значение: «без меню» или «меню», «пускает» или «держит», «отказан» или «пропущен»,
# число. Точка, которую держит предел другой задачи, печатается строкой `limit <задача>` вне счёта.
#
# RT_REPLAY_EDITION=<папка пакета> гоняет цепочку на хуках другого издания (`turn-replay-tree.sh`).
REPLAY_EDITION="${RT_REPLAY_EDITION:-}" REPLAY_LAID="${RT_REPLAY_LAID:-}"
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "день 24.11"

TESTS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$TESTS/../../.." && pwd)"
WORK="$(mktemp -d)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT
. "$TESTS/turn-replay-tree.sh"

CHAIN="$TESTS/fixtures/owner-waits/2411-day.json"
LIB="$TESTS/turn-replay-lib.mjs"
ENGINE="$ASSETS/checks/task-flow-script.mjs"
NIGHT_END='2026-11-24T00:38:44'
ESC='2026-11-24T03:54:34'
L='SC-AK-2018 —'

for name in taken archived; do build_tree "$name" >/dev/null; done
cp -R "$WORK/taken" "$WORK/night-record"
cp -R "$WORK/taken" "$WORK/night-boundary"
put "$WORK/night-record" ".claude/handoff/2026-11-23-ночь.md" '# Список к утру · ночь с 23.11.2026

Граница: до слова владельца — «работай далее без остановок в режиме ночной автономной работы».'
put "$WORK/night-boundary" ".claude/handoff/2026-11-23-ночь.md" "# Список к утру · ночь с 23.11.2026

Автономно до: $(node -e 'const d=new Date(Date.now()+12*3600e3),t=(n)=>String(n).padStart(2,"0");console.log(`${d.getFullYear()}-${t(d.getMonth()+1)}-${t(d.getDate())}T${t(d.getHours())}:${t(d.getMinutes())}`)')"

# Точки цепочки: номер, вид, время.
points() { jq -r --arg kind "$1" '.points | to_entries[] | select(.value.kind == $kind and ($kind != "say" or .value.end)) | "\(.key) \(.value.at)"' "$CHAIN"; }

# Хук на Stop на записи до точки: печатает BLOCK и причину или PASS.
stop_at() {
    local tree="$WORK/$1" at="$2" branch="${3:-}" rec="$WORK/$1.jsonl" input out
    node "$LIB" "$CHAIN" "$rec" "$at" '' "$branch"
    input="$(jq -n --arg p "$rec" --arg d "$tree" '{session_id:"replay",transcript_path:$p,cwd:$d,stop_hook_active:false}')"
    out="$(cd "$tree" && CLAUDE_PROJECT_DIR="$tree" "$HOOKS/turn-exit-guard.sh" <<< "$input" 2>/dev/null)"
    printf '%s' "$out" | jq -r 'if .decision == "block" then "BLOCK \(.reason // "")" else "PASS" end' 2>/dev/null || echo PASS
}

# Хук `PreToolUse` на вызове точки: печатает deny или PASS; хука нет в издании — «нет».
call_at() {
    local tree="$WORK/$1" at="$2" hook="$3" branch="${4:-}" rec="$WORK/$1.call.jsonl" input out
    [ -f "$HOOKS/$hook" ] || { echo нет; return; }
    input="$(node "$LIB" "$CHAIN" "$rec" "$at" call "$branch" | jq -c --arg d "$tree" '. + {cwd:$d}')"
    out="$(cd "$tree" && CLAUDE_PROJECT_DIR="$tree" "$HOOKS/$hook" <<< "$input" 2>/dev/null)"
    [ -z "$out" ] && echo PASS || printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecision // "deny"' 2>/dev/null
}

for hook in turn-exit-guard.sh owner-stop-call-guard.sh monitor-stream-guard.sh; do
    [ -f "$HOOKS/$hook" ] || echo "  нет в издании: $hook"
done

# --- ночь: граница из записи и граница впереди --------------------------------------------------------
# Меню владельцу в отказах конца хода ночью. «Без меню» при нуле отказов ничего не значит: тогда точка красная.
menus() {
    local count=0 held=0 at got
    while read -r index at; do
        [[ "$at" < "$NIGHT_END" ]] || continue
        got="$(stop_at "$1" "$index")"
        case "$got" in BLOCK*) held=$((held + 1)) ;; esac
        case "$got" in *«отложить*) count=$((count + 1)) ;; esac
    done < <(points say)
    [ -n "$VERBOSE" ] && echo "  ночь $1: отказов $held, с меню $count" >&2
    if [ "$held" -eq 0 ]; then echo 'нет отказов'; elif [ "$count" -eq 0 ]; then echo 'без меню'; else echo меню; fi
}
printf '  limit RT-3584 — ночь из записи: %s\n' "$(menus night-record)"
report "$L ночь при границе впереди" "$(menus night-boundary)" 'без меню'

# --- утро: одобрение плана, который правит проверку, после ролей --------------------------------------
approval() {
    local tree="$WORK/approval-$1" rec
    cp -R "$WORK/taken" "$tree"
    # План с решением и проверками, красными до работы: иначе plan-red не пишет отметки ни на каком ответе.
    put "$tree" "docs/tasks/$TASK/plan.md" "$(printf '%s\n' "$PLAN" | sed 's/`true` → exit 0/`test -f done.txt` → exit 0/; s/`echo ok` → `ok`/`cat done.txt` → `ok`/; s/^## Этапы$/## Решение\
\
Решения нет: правка правил хода, без новых символов.\
\
## Этапы/')"
    put "$tree" "docs/tasks/$TASK/progress.md" "$(progress '>' ' ')"
    commit "$tree" 'docs: план'
    rec="$RT_FLOW_RECORDS_HOME/$(cd "$tree" && pwd -P | sed 's#[/.]#-#g')/session.jsonl"
    mkdir -p "$(dirname "$rec")"
    node "$LIB" "$CHAIN" "$rec" last '' "approval-$1"
    (cd "$tree" && CLAUDE_PROJECT_DIR="$tree" RT_FLOW_TRANSCRIPT="$rec" node "$ENGINE" plan-red 2>&1) | grep -q 'the approval mark is written' && echo пускает || echo держит
}
report "$L одобрение после ролей, кнопка" "$(approval button)" пускает
report "$L одобрение после ролей, сообщение" "$(approval message)" пускает

# --- день: Esc 10:54 при своём фоновом и `Monitor` -----------------------------------------------------
blocks=0
while read -r index at; do
    [[ "$at" > "$ESC" ]] || continue
    case "$(stop_at archived "$index")" in BLOCK*) blocks=$((blocks + 1)) ;; esac
done < <(points say)
report "$L отказов конца хода после Esc" "$blocks" 1

verdict() { case "$1" in deny) echo отказан ;; нет) echo 'нет в издании' ;; *) echo пропущен ;; esac; }
deny_at="$(jq -r '.branches["deny-call"] | .after + (.points | length)' "$CHAIN")"
report "$L вызов без слова владельца после Esc" "$(verdict "$(call_at archived "$deny_at" owner-stop-call-guard.sh deny-call)")" отказан

false_refusals=0 calls=0
while read -r index at; do
    [[ "$at" > "$ESC" ]] || continue
    calls=$((calls + 1))
    [ "$(call_at archived "$index" owner-stop-call-guard.sh)" = deny ] && false_refusals=$((false_refusals + 1))
done < <(points call)
[ -n "$VERBOSE" ] && echo "  вызовов после Esc по слову владельца: $calls"
report "$L ложных отказов по слову владельца" "$false_refusals" 0

monitor="$(jq -r '.points | to_entries[] | select(.value.call == "Monitor" and (.value.at | startswith("2026-11-24T03:53:52"))) | .key' "$CHAIN")"
report "$L Monitor 10:53:52" "$(verdict "$(call_at archived "$monitor" monitor-stream-guard.sh)")" отказан

last="$(points say | tail -1 | cut -d' ' -f1)"
node "$LIB" "$CHAIN" "$WORK/last.jsonl" "$last"
released="$(cd "$WORK/archived" && CLAUDE_PROJECT_DIR="$WORK/archived" node "$ENGINE" verdict \
    <<< "$(jq -n --arg p "$WORK/last.jsonl" --arg d "$WORK/archived" '{session_id:"replay",transcript_path:$p,cwd:$d,stop_hook_active:false}')" 2>/dev/null \
    | jq -r '.release // .block // ""')"
case "$released" in *background*) released='отпущен по фоновому' ;; esac
report "$L 11:13:20" "$released" 'отпущен по фоновому'

suite_result "день 24.11"
