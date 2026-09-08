#!/usr/bin/env bash
# rt-kit v0.26.0 · hooks/override-write-guard.sh · 5df68f8880cf · правится надстройкой, не здесь
# rt-hook: PreToolUse Write|Bash|mcp__webstorm__create_new_file|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: hooks/deny-tail.sh, hooks/guard-note.sh
# Guard against wiping out an override: writing over is not the same as editing.
#
# The tree's override merges with the package resource by `## ` section: a section the tree has
# rewritten replaces the package one, and the rest come from the package. That is why the override
# file accumulates — sections are appended to it by different branches and different sessions — and
# it looks like ordinary text that can be put down whole.
#
# Put down whole, it carries away every section this edit did not touch. There is nothing to see the
# loss by: the layout converges, the checks are green, and the package section has quietly returned
# to the place of what the tree said about itself. It is noticed by whoever wonders a month later
# why the rule again demands foreign names.
#
# WHAT IS JUDGED. Writing a file whole over an existing non-empty override: the writing tool, a `>`
# redirection, `tee` without appending, a copy over the top. Appending to the end — `>>`, `tee -a` —
# and an in-place edit pass: they carry nothing away.
#
# FAIL-OPEN: no `jq`, broken input, a foreign tool, no file, an empty file — the edit is ALLOWED. A
# broken guard has no right to jam work.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=override-write-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/deny-tail.sh" ] && . "$rt_hooks_dir/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { printf ''; }

deny() {

    reason="$1 $(rt_deny_tail "$2")"
    jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
        || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"The override overwrite guard."}}\n'
    exit 0
}

# The targets of writing over, named by the command outright. Appending is not included here: `>>`
# is hidden before the parsing and is not unfolded back, and `tee` is taken only without the
# appending argument.
rt_overwrite_targets() {
    tr "\"'\`" '   ' \
        | sed -E 's/>>/\
APPEND/g' \
        | sed -E 's/>/\
>/g' \
        | sed -nE '
            s/^>[[:space:]]*([^[:space:]|&;]+).*/\1/p
            s/(^|.*[[:space:]])tee[[:space:]]+([^-[:space:]][^[:space:]|&;]*).*/\2/p
            s/(^|.*[[:space:]])(cp|mv|install)[[:space:]]+([^[:space:]]+[[:space:]]+)+([^[:space:]|&;]+).*/\4/p
        ' \
        | sort -u
}

tool="$(rt_hook_tool)"
candidates=""
case "$tool" in
    Write | mcp__webstorm__create_new_file)
        candidates="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.pathInProject // empty' 2>/dev/null)"
        ;;
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool)
        cmd="$(rt_hook_cmd)"
        [ -z "$cmd" ] && exit 0
        candidates="$(printf '%s' "$cmd" | rt_overwrite_targets)"
        ;;
    *) exit 0 ;;
esac
[ -z "$candidates" ] && exit 0

root="${CLAUDE_PROJECT_DIR:-.}"
overrides_dir="${RT_OVERRIDES_DIR:-.claude/rt-kit/overrides}"

while IFS= read -r candidate; do
    [ -z "$candidate" ] && continue
    case "$candidate" in
        /*) relative="${candidate#"$root"/}" ;;
        *)
            relative="$candidate"
            candidate="$root/$candidate"
            ;;
    esac
    case "$relative" in "$overrides_dir"/*) ;; *) continue ;; esac
    [ -f "$candidate" ] || continue

    lines="$(wc -l <"$candidate" 2>/dev/null | tr -d ' ')"
    [ -z "$lines" ] && continue
    [ "$lines" -eq 0 ] && continue

    sections="$(grep -c '^## ' "$candidate" 2>/dev/null || printf '0')"
    resource="${relative#"$overrides_dir"/}"

    deny "BLOCKED by override-write-guard: «${relative}» is an override of this tree, and it already holds ${lines} lines, sections «## » — ${sections}. A whole-file write carries away every section this edit did not touch, and the package text of the resource «${resource}» silently returns in their place: the layout matches after that, the checks are green, and what the tree said about itself is gone. Edit in place — by an edit of a section, not by a write of the file." \
        "a new section is appended at the end: the override merges with the package resource by the heading «## », and the package text is replaced only by the sections the tree named"
done <<EOF
$candidates
EOF

exit 0
