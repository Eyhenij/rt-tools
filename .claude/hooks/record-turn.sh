#!/usr/bin/env bash
# rt-kit v0.41.1 · hooks/record-turn.sh · 5c0ec01f3b86 · правится надстройкой, не здесь
# rt-hook: Stop
# rt-hook: SessionEnd
# Requires: hooks/observe.sh, hooks/hook-input.sh, hooks/metric-marks.sh, hooks/owner-corrections.sh, checks/record-turn.mjs, checks/record-count.mjs
#
# Counts the turn from the session record for the metrics of the work result: the calls, the refusals
# with their class and check, the changes of the tree, the owner's words, the interrupts and the menu
# questions. The observations of the guards miss part of the refusals — a check that refuses without
# writing one — and know no calls at all; the record holds both.
#
# WHAT IS KEPT. Observation lines with the moment, the kind of event, the task key of the branch, the
# check and the session sign. No text of the conversation reaches a file: a word of the owner leaves
# only its kind and whether a correction pattern matched it. A mark per session keeps the offset read.
#
# The session end counts once more: the refusal of the last stop hook is written into the record after
# the stop hooks of that turn have run.
#
# FAIL-OPEN: no input, no parser, no record, no node, no counter — exit with zero and no output. This
# hook never refuses and never adds to the context.

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$here/hook-input.sh" 2>/dev/null || exit 0
. "$here/observe.sh" 2>/dev/null || exit 0
. "$here/metric-marks.sh" 2>/dev/null || exit 0

rt_hook_read
[ -n "${RT_HOOK_INPUT:-}" ] || exit 0
command -v jq >/dev/null 2>&1 || exit 0
command -v node >/dev/null 2>&1 || exit 0

record="$(printf '%s' "$RT_HOOK_INPUT" | jq -r '.transcript_path // empty' 2>/dev/null)"
session="$(printf '%s' "$RT_HOOK_INPUT" | jq -r '.session_id // empty' 2>/dev/null)"
[ -n "$session" ] || exit 0

dir="$(rt_observe_dir)"
[ -n "$dir" ] || exit 0
marks="$(rt_marks_dir)"
[ -n "$marks" ] || exit 0
sign="$(rt_observe_session "$session")"

counter=''
for candidate in "$here/../../tools/record-turn.mjs" "$here/../checks/record-turn.mjs"; do
    [ -f "$candidate" ] && counter="$candidate" && break
done
[ -n "$counter" ] || exit 0

# The set of correction patterns is read from the hook that declares it, not held here as a copy.
patterns="$(sed -n "s/^RT_CORRECTION_PATTERNS='\(.*\)'$/\1/p" "$here/owner-corrections.sh" 2>/dev/null)"

node "$counter" --record "$record" --observations "$dir" --mark "$marks/record-$sign.json" --sid "$sign" \
    --patterns "$patterns" --version "$(rt_observe_version)" >/dev/null 2>&1
exit 0
