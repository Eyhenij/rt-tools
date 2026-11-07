#!/usr/bin/env bash
# rt-hook: SessionStart startup|resume|compact|clear
# rt-hook: Stop
# rt-hook: SessionEnd
# Requires: hooks/observe.sh, hooks/hook-input.sh
# The start and the end of a session send the day lines: a guard starts the sending only when it
# records something, and a quiet session or a dead one would leave its numbers on the disk.
#
# The start also names a send that failed more than a day ago. The sending itself stays silent: it
# runs behind the work, and the only place its failure can reach a person is the opening of a session.
#
# FAIL-OPEN: no `jq`, no mark, no address, no package command — the session goes on. A side job has no
# right to stop it, so this hook prints no refusal at all and always exits with zero.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/observe.sh" 2>/dev/null || true

command -v rt_send_start >/dev/null 2>&1 || exit 0
rt_hook_read
event="$(printf '%s' "${RT_HOOK_INPUT:-}" | jq -r '.hook_event_name // empty' 2>/dev/null)"

case "$event" in
    SessionEnd)
        rt_send_start --session-end
        ;;
    SessionStart)
        rt_send_start
        rt_send_fault_line
        ;;
    *)
        rt_send_start
        ;;
esac
exit 0
