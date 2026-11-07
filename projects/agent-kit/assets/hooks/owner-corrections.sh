#!/usr/bin/env bash
# rt-hook: UserPromptSubmit
# Requires: hooks/hook-input.sh, hooks/metric-marks.sh
#
# Counts the owner's corrections for the package metrics. A number the executor reports about itself
# is worth nothing, so the hook counts and the executor takes no part.
#
# WHAT IS KEPT. A line of the branch counter and one observation. The message is matched and thrown
# away: its text reaches no file.
#
# THE SET OF PATTERNS is fixed and stands here in full, so a person can read what counts. Its accuracy
# is measured on a sample the owner reads, on the first cycle. A message that opens with a tag comes
# from the application, not from a person.
#
# FAIL-OPEN: no input, no parser, no mark file — exit with zero and no output. This hook never refuses
# and never adds to the context.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || exit 0

RT_CORRECTION_PATTERNS='не так|неправильно|неверно|переделай|переделать|исправь|поправь|откати|ты ошиб|это ошибка|зря |wrong|redo|not what i|that.s not|fix this|revert'

rt_hook_read
[ -n "$RT_HOOK_INPUT" ] || exit 0
command -v jq >/dev/null 2>&1 || exit 0

message="$(printf '%s' "$RT_HOOK_INPUT" | jq -r '.prompt // empty' 2>/dev/null)"
case "$message" in
    '' | '<'*) exit 0 ;;
esac
printf '%s' "$message" | grep -qiE "$RT_CORRECTION_PATTERNS" || exit 0

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/metric-marks.sh" 2>/dev/null || exit 0
rt_correction_mark "$(printf '%s' "$RT_HOOK_INPUT" | jq -r '.session_id // empty' 2>/dev/null)"
exit 0
