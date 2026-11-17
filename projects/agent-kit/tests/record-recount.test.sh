#!/usr/bin/env bash
# Сценарии пересчёта прошлых дней `checks/record-recount.mjs` и команды `agent-kit recount`.
#
# Пересчёт читает сохранённые записи разговоров этого дерева тем же счётчиком, что у хука конца хода.
# Второй пересчёт дня заменяет первый, день, который уже сосчитал хук, не трогается, а запись чужого
# дерева не читается. Набор кладёт записи-заготовки в свой каталог записей и читает наблюдения.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "пересчёт прошлых дней"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
TREE="$WORK/tree"
PROJECTS="$WORK/projects"
OBS="$WORK/observations"
mkdir -p "$TREE" "$PROJECTS/own" "$PROJECTS/foreign"
git -C "$TREE" init -q

entry() {
    printf '{"type":"assistant","uuid":"%s","sessionId":"s1","cwd":"%s","gitBranch":"RT-1-x","timestamp":"%s","message":{"role":"assistant","content":[{"type":"tool_use","id":"%s","name":"Bash","input":{"command":"ls"}}]}}\n' "$1" "$2" "$3" "$1"
}
refusal() {
    printf '{"type":"user","uuid":"r%s","sessionId":"s1","cwd":"%s","gitBranch":"RT-1-x","timestamp":"%s","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"%s","is_error":true,"content":"PreToolUse:Bash hook error: BLOCKED by task-flow: x"}]}}\n' "$1" "$2" "$3" "$1"
}
{
    entry c1 "$TREE" 2026-11-12T10:00:00Z
    refusal c1 "$TREE" 2026-11-12T10:00:01Z
    entry c2 "$TREE" 2026-11-12T11:00:00Z
    entry c3 "$TREE" 2026-11-13T09:00:00Z
} > "$PROJECTS/own/s1.jsonl"
entry f1 /elsewhere 2026-11-12T10:00:00Z > "$PROJECTS/foreign/s2.jsonl"

recount() { node "$CHECKS/record-recount.mjs" --tree "$TREE" --observations "$OBS" --projects "$PROJECTS" "$@"; }
events() { jq -r "select(.ev == \"$1\") | .ev" "$OBS/$2.jsonl" 2>/dev/null | wc -l | tr -d ' '; }

# --- a past day is recounted once ----------------------------------------------------------------------
recount --day 2026-11-12 > /dev/null
recount --day 2026-11-12 > /dev/null
report "SC-AK-1632 — день пересчитан дважды, в нём счёт одного пересчёта" \
    "$(events record-call 2026-11-12):$(events record-refusal 2026-11-12)" "2:1"
report "SC-AK-1632 — запись чужого дерева не читается, чужой день не берётся" \
    "$(jq -r 'select(.ev == "record-call") | .t' "$OBS/2026-11-12.jsonl" | sort | tr '\n' ' ')" \
    "2026-11-12T10:00:00Z 2026-11-12T11:00:00Z "

# --- a session the hook counted is not recounted, another session of the day is ------------------------
# The hook counts a session whole on its first turn, days before its layout included: the day then
# holds that session only, and the recount adds the rest.
entry c9 "$TREE" 2026-11-13T12:00:00Z | sed 's/"s1"/"s2"/' > "$PROJECTS/own/s2.jsonl"
printf '{"t":"2026-11-13T09:00:00Z","ev":"record-call","sid":"%s"}\n' "$(printf '%s' s1 | cksum | awk '{print $1}')" > "$OBS/2026-11-13.jsonl"
report "SC-AK-1632 — сессия, сосчитанная хуком, не пересчитывается, другая сессия дня пересчитана" \
    "$(recount --day 2026-11-13) $(events record-call 2026-11-13)" "2026-11-13: recounted 2, hook 1 2"

suite_result "пересчёт прошлых дней"
