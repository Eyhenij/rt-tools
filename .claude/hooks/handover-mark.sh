#!/usr/bin/env bash
# rt-kit v0.36.0 · hooks/handover-mark.sh · 1690905ad8d5 · правится надстройкой, не здесь
# rt-hook: PostToolUse Bash
# Requires: hooks/hook-input.sh, hooks/metric-marks.sh, hooks/git-guard-delivery.sh
#
# Keeps the sign of a handover after the call really ran. The delivery guard stands before the call,
# and a guard after it in the row may still refuse the request, so the guard only announces the
# branch. This hook turns the announcement into the sign. A call that failed leaves no sign.
#
# FAIL-OPEN: no input, no parser, no announcement — exit with zero and no output. This hook never
# refuses.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || exit 0

rt_hook_read
[ -n "$RT_HOOK_INPUT" ] || exit 0
command -v jq >/dev/null 2>&1 || exit 0

cmd="$(rt_hook_cmd)"
case "$cmd" in
    *pr*create* | *pr*ready* | *mr*create* | *mr*update*) ;;
    *) exit 0 ;;
esac

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/metric-marks.sh" 2>/dev/null || exit 0

session="$(printf '%s' "$RT_HOOK_INPUT" | jq -r '.session_id // empty' 2>/dev/null)"
pending="$(rt_handover_pending_file "$session" "$cmd")"
[ -n "$pending" ] && [ -f "$pending" ] || exit 0

failed="$(printf '%s' "$RT_HOOK_INPUT" | jq -r '
    (.tool_response | type) == "object"
    and ((.tool_response.is_error // false) or (.tool_response.interrupted // false)
         or ((.tool_response.exit_code // 0) != 0))' 2>/dev/null)"
[ "$failed" = true ] || rt_handover_mark "$(cat "$pending" 2>/dev/null)"
rm -f "$pending" 2>/dev/null
exit 0
