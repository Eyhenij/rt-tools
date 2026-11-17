#!/usr/bin/env bash
# Сценарии чтения слияний и редакций `checks/merge-read.mjs`: что отправка берёт у хостинга и реестра
# и что из этого считает строка дня.
#
# Задача, влитая в ветку эпика, открывает его окно; задача, влитая в ветку прошлой задачи, слита, но
# окна не открывает. Минуты от взятия считаются только у задачи, взятие которой видно на этой
# машине. Оборванный ответ хостинга не пишет ничего. Настоящие ответы 13.11 — `fixtures/real-outcomes/`.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "слияния и редакции"

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REAL="$HERE/fixtures/real-outcomes"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

pull() { jq -cn --argjson n "$1" --arg h "$2" --arg b "$3" --arg m "$4" '{number:$n,state:(if $m == "" then "OPEN" else "MERGED" end),headRefName:$h,baseRefName:$b,mergedAt:(if $m == "" then null else $m end),title:"t"}'; }
read_merges() { node "$CHECKS/merge-read.mjs" --pulls "$1" --observations "$2" --mark "$2/.marks/merges.json" "${@:3}"; }
day_merges() {
    node -e '
const fs = require("fs");
import(process.argv[3]).then(({ dayMerges }) => {
    const lines = fs.readdirSync(process.argv[1]).filter((f) => f.endsWith(".jsonl"))
        .flatMap((f) => fs.readFileSync(`${process.argv[1]}/${f}`, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)));
    const m = dayMerges(lines, process.argv[2]);
    console.log(`${m.tasksMerged} ${m.tasksTimed} ${m.takenMinutes}`);
});' "$1" "$2" "$CHECKS/merge-read.mjs"
}
events() { cat "$1"/*.jsonl 2>/dev/null | jq -r "select(.ev == \"$2\") | $3" | tr '\n' ' '; }

# --- a merged task carries the minutes from its taking ----------------------------------------------------
OBS="$WORK/one"
mkdir -p "$OBS"
printf '{"t":"2026-11-10T09:00:00Z","ev":"task-taken","task":"RT-1","sid":"1"}\n' > "$OBS/2026-11-10.jsonl"
{
    pull 1 RT-1-a RT-9-epic 2026-11-10T15:30:00Z
    pull 2 RT-2-b RT-9-epic 2026-11-10T16:00:00Z
} > "$WORK/one.jsonl"
read_merges "$WORK/one.jsonl" "$OBS"
report "SC-AK-1622 — две задачи слиты, минуты от взятия у одной: 390" "$(day_merges "$OBS" 2026-11-10)" "2 1 390"

# --- a task merged into a previous task branch opens no window ---------------------------------------------
OBS="$WORK/stack"
mkdir -p "$OBS"
{
    pull 11 RT-12-second RT-11-first 2026-11-10T10:00:00Z
    pull 10 RT-11-first RT-9-epic 2026-11-11T09:00:00Z
} > "$WORK/stack.jsonl"
read_merges "$WORK/stack.jsonl" "$OBS"
report "SC-AK-1636 — обе задачи слиты в свои дни" \
    "$(day_merges "$OBS" 2026-11-10 | cut -d' ' -f1) $(day_merges "$OBS" 2026-11-11 | cut -d' ' -f1)" "1 1"
report "SC-AK-1636 — окно открывает только слияние первой задачи в ветку эпика" \
    "$(events "$OBS" task-merged '.task + ":" + (.opens // "-")')" "RT-12:- RT-11:1 "

# --- a request is written once, a broken answer writes nothing ---------------------------------------------
read_merges "$WORK/stack.jsonl" "$OBS"
report "SC-AK-1622 — повторное чтение заявку второй раз не пишет" "$(events "$OBS" task-merged '.task')" "RT-12 RT-11 "
OBS="$WORK/broken"
mkdir -p "$OBS"
{ pull 1 RT-1-a RT-9-epic 2026-11-10T15:30:00Z; printf '{"number":2,"headRef'; } > "$WORK/broken.jsonl"
read_merges "$WORK/broken.jsonl" "$OBS"
report "SC-AK-1622 — оборванный ответ хостинга не пишет ничего и не трогает метку" \
    "$(ls "$OBS" | wc -l | tr -d ' ') $([ -f "$OBS/.marks/merges.json" ] && echo mark || echo no-mark)" "0 no-mark"

# --- the answers of 13 November ------------------------------------------------------------------------------
OBS="$WORK/real"
mkdir -p "$OBS"
jq -c . "$REAL/pull-3266.json" "$REAL/pull-3279.json" > "$WORK/real.jsonl"
read_merges "$WORK/real.jsonl" "$OBS" --packages projects/agent-kit,projects/ui-kit-v2 --editions "agent-kit=$REAL/registry-agent-kit.json"
report "SC-AK-1622 — 13.11: PR 3266 в ветку эпика открывает окно RT-3227 в 00:34:01" \
    "$(events "$OBS" task-merged '.t + " " + .epic + " " + (.opens // "-")')" "2026-11-13T00:34:01Z RT-3227 1 "
# The epic changed the code graph under the second kit as well: a file under a package directory is
# a file of the package.
report "SC-AK-1622 — 13.11: эпик RT-3227 влит в главную ветку в 05:48:08 и меняет оба пакета" \
    "$(events "$OBS" epic-merged '.t + " " + .task + " " + .pkg')" "2026-11-13T05:48:08Z RT-3227 agent-kit,ui-kit-v2 "
report "SC-AK-1622 — последняя редакция пакета правил до слияния эпика — 0.37.0 от 11.11" \
    "$(cat "$OBS"/*.jsonl | jq -r 'select(.ev == "edition" and .t < "2026-11-13T05:48:08Z") | .t + " " + .ver' | sort | tail -1)" \
    "2026-11-11T08:37:28.990Z 0.37.0"

suite_result "слияния и редакции"
