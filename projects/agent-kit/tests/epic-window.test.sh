#!/usr/bin/env bash
# Сценарии окон эпика `checks/epic-window.mjs`.
#
# Окно открывает слияние задачи в ветку эпика и закрывает первое из трёх событий: следующее такое
# слияние, слияние эпика в главную ветку или сообщение владельца, с которого начался ход с разбором
# после ухода сессии с ветки эпика. Ход, идущий через конец окна, режется по моментам. Окно считает
# только сессии, стоявшие в нём на ветке эпика или его задачи.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "окна эпика"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

windows() {
    node -e '
import(process.argv[3]).then(({ epicWindows, readObservations }) => {
    for (const w of epicWindows(readObservations(process.argv[1]), process.argv[2]))
        console.log(`${w.epic} ${w.from.slice(11, 19)}-${w.to ? w.to.slice(11, 19) : "open"} ${w.closedBy} ${w.calls}/${w.refusals}`);
});' "$1" "$2" "$CHECKS/epic-window.mjs"
}
calls() { local sid="$1" task="$2" from="$3" n="$4" step="$5" i; for ((i = 0; i < n; i++)); do
    printf '{"t":"%s","ev":"record-call","task":"%s","sid":"%s"}\n' "$(date -u -j -v+"$((i * step))"S -f '%Y-%m-%dT%H:%M:%S' "$from" '+%Y-%m-%dT%H:%M:%SZ')" "$task" "$sid"
done; }

# --- a window is cut in the middle of a turn ----------------------------------------------------------------
OBS="$WORK/cut"
mkdir -p "$OBS"
{
    printf '{"t":"2026-11-13T00:34:01Z","ev":"task-merged","task":"RT-1","opens":"1","epic":"RT-7"}\n'
    printf '{"t":"2026-11-13T03:04:27Z","ev":"epic-merged","task":"RT-7","pkg":""}\n'
    calls a RT-7 2026-11-13T02:50:00 10 60
    calls a RT-7 2026-11-13T03:05:00 6 60
} > "$OBS/2026-11-13.jsonl"
report "SC-AK-1633 — ход 02:50–03:20 режется концом окна 03:04:27: в окне 10 вызовов, 6 вне его" \
    "$(windows "$OBS" 2026-11-13)" "RT-7 00:34:01-03:04:27 epic-merged 10/0"

# --- a window counts only the sessions of the epic and its tasks --------------------------------------------
OBS="$WORK/sessions"
mkdir -p "$OBS"
{
    printf '{"t":"2026-11-13T09:00:00Z","ev":"task-merged","task":"RT-71","opens":"1","epic":"RT-7"}\n'
    printf '{"t":"2026-11-13T08:00:00Z","ev":"task-merged","task":"RT-72","opens":"1","epic":"RT-7"}\n'
    calls task RT-72 2026-11-13T09:10:00 3 60
    calls epic RT-7 2026-11-13T09:20:00 2 60
    calls other RT-81 2026-11-13T09:30:00 4 60
} > "$OBS/2026-11-13.jsonl"
report "SC-AK-1634 — окно считает сессию задачи эпика и сессию ветки эпика, но не сессию чужого эпика" \
    "$(windows "$OBS" 2026-11-13 | tail -1)" "RT-7 09:00:00-open open 5/0"

# --- an analysis on the epic branch does not close the window, one after leaving it does --------------------
OBS="$WORK/analysis"
mkdir -p "$OBS"
{
    printf '{"t":"2026-11-13T00:34:01Z","ev":"task-merged","task":"RT-1","opens":"1","epic":"RT-7"}\n'
    printf '{"t":"2026-11-13T01:54:55Z","ev":"record-word","kind":"typed","task":"RT-7","sid":"a"}\n'
    printf '{"t":"2026-11-13T01:56:27Z","ev":"record-change","analysis":"1","task":"RT-7","sid":"a"}\n'
    printf '{"t":"2026-11-13T03:04:27Z","ev":"record-word","kind":"typed","task":"RT-1","sid":"a"}\n'
    printf '{"t":"2026-11-13T03:05:40Z","ev":"record-change","analysis":"1","task":"RT-1","sid":"a"}\n'
} > "$OBS/2026-11-13.jsonl"
report "SC-AK-1633 — разбор на ветке эпика окна не закрывает, разбор после ухода с неё закрывает сообщением владельца" \
    "$(windows "$OBS" 2026-11-13)" "RT-7 00:34:01-03:04:27 analysis 0/0"

# --- a merge into the branch of a merged epic opens no window -----------------------------------------------
OBS="$WORK/after"
mkdir -p "$OBS"
{
    printf '{"t":"2026-11-05T16:27:09Z","ev":"task-merged","task":"RT-1","opens":"1","epic":"RT-7"}\n'
    printf '{"t":"2026-11-06T03:43:52Z","ev":"epic-merged","task":"RT-7","pkg":""}\n'
    printf '{"t":"2026-11-08T10:15:37Z","ev":"task-merged","task":"RT-2","opens":"1","epic":"RT-7"}\n'
} > "$OBS/2026-11-08.jsonl"
report "SC-AK-1655 — слияние в ветку уже слитого эпика окна не открывает" \
    "$(windows "$OBS" 2026-11-08)" "RT-7 16:27:09-03:43:52 epic-merged 0/0"

suite_result "окна эпика"
