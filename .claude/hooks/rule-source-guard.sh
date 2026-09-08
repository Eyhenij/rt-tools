#!/usr/bin/env bash
# rt-kit v0.26.0 · hooks/rule-source-guard.sh · 7b141c052a0e · правится надстройкой, не здесь
# rt-hook: PreToolUse Edit|Write|MultiEdit|Bash|mcp__webstorm__create_new_file|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: hooks/profile-check.sh, hooks/deny-tail.sh, hooks/write-targets.sh, hooks/guard-note.sh
# Guard of the place of the edit: the rules layer is fixed where it is broken, not where it is seen.
#
# The rules layer is edited by the same executor the rules layer governs, and nothing in the tree
# shows the difference between "I follow a rule" and "I edit a rule": the laid-out copy lies next to
# ordinary files and is edited the same way. The edit reaches the disk and does not reach the place
# where the miss is fixed: in the tree it is visible, in the package it is absent, and a month later
# the layout refuses over the edited file as a whole — and the price is paid by whoever edits a
# neighbouring resource that day.
#
# Only `sync --check` knew about this, and it spoke at the next layout, that is, in someone else's
# branch and on someone else's turn. The guard speaks at the minute of the edit and names the
# address: the package source, if the tree holds it, otherwise the override.
#
# WHAT IS JUDGED. The file being edited carries the layout header: `rt-kit v<version> · <resource> ·
# <digest>`. The resource from it is the address: `<sources>/<resource>` in the package tree,
# `.claude/rt-kit/overrides/<resource>` at a consumer.
#
# FAIL-OPEN: no `jq`, broken input, a foreign tool, no file, no header in it, not a git repository —
# the edit is ALLOWED. A broken guard has no right to jam work.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=rule-source-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/profile-check.sh" ] && . "$rt_hooks_dir/profile-check.sh"
command -v rt_needs >/dev/null 2>&1 || rt_needs() { command -v "$1" >/dev/null 2>&1; }

# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/deny-tail.sh" ] && . "$rt_hooks_dir/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { printf ''; }

deny() {

    reason="$1 $(rt_deny_tail "$2")"
    jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
        || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"The guard of the place of the edit."}}\n'
    exit 0
}

# The write targets are parsed by a shared helper: the exam guard needs the same sign, and once they
# diverged, two copies would let through different forms of writing. No file — a silent default
# remains, so that the guard does not break on an incomplete layout.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/write-targets.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/write-targets.sh" 2>/dev/null
command -v rt_write_targets >/dev/null 2>&1 || rt_write_targets() { cat >/dev/null; }

tool="$(rt_hook_tool)"
candidates=""
case "$tool" in
    Edit | Write | MultiEdit | mcp__webstorm__create_new_file)
        candidates="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.pathInProject // empty' 2>/dev/null)"
        ;;
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool)
        cmd="$(rt_hook_cmd)"
        [ -z "$cmd" ] && exit 0
        # What is taken here is not the general sign of writing, but the target named in the
        # command outright: a redirection, `tee`, an in-place edit, a copy over the top. The
        # general sign is broad on purpose — it holds the interpreter name too — and a run of a
        # laid-out check would read as an edit of the check itself. A refusal on reading costs
        # more than a miss: a guard that gets in the way of reading is switched off on the very
        # first day.
        #
        # Removing a copy is deliberately not included here: the layout puts a removed file back,
        # and that is how a copy the formatter rewrote gets fixed.
        candidates="$(printf '%s' "$cmd" | rt_write_targets)"
        ;;
    *) exit 0 ;;
esac
[ -z "$candidates" ] && exit 0

root="${CLAUDE_PROJECT_DIR:-.}"

# The directory of package sources in this tree. Only the tree that carries the package has one; a
# consumer has no source at all, and has a single address for an edit — the override.
sources=""
if rt_needs rt_kit_sources_dir rule-source-guard; then
    sources="$(rt_kit_sources_dir 2>/dev/null)"
fi

while IFS= read -r candidate; do
    [ -z "$candidate" ] && continue
    case "$candidate" in
        /*) ;;
        *) candidate="$root/$candidate" ;;
    esac
    [ -f "$candidate" ] || continue

    # The header stands at the beginning of the file, but not on the first line: in a script `#!`
    # pushes it down, in a rule the title with the name and the kind of the resource does. Ten
    # lines are enough for both, and the whole file must not be read: the guard stands on every
    # edit.
    resource="$(head -12 "$candidate" 2>/dev/null | sed -nE 's/.*rt-kit v[^ ]+ · ([^ ]+) · [0-9a-f]+.*/\1/p' | head -1)"
    [ -z "$resource" ] && continue

    # A file in conflict is skipped on a par with a removed one. Resolving a conflict does not
    # change the content of the copy — the layout puts it back — while an executor refused here is
    # left with a half-merged branch and no lawful move: there is nothing to edit in the source,
    # and an override does not lift the conflict. There are two signs, and either is enough: an
    # index record about an unmerged file, and merge markers in the file itself — the second is
    # needed where the merge is led not by git but by an outside tool that leaves markers without
    # an index record.
    if [ -n "$(git -C "$root" ls-files -u -- "$candidate" 2>/dev/null)" ] \
        || grep -qE '^(<<<<<<< |>>>>>>> )' "$candidate" 2>/dev/null; then
        continue
    fi

    if [ -n "$sources" ] && [ -f "$root/$sources/$resource" ]; then
        deny "BLOCKED by rule-source-guard: «${candidate#"$root"/}» is laid out by the package, and an edit in its place is lost on the next layout — and until then the layout refuses this file whole, and the price is paid by whoever edits a neighbouring resource that day. The resource is «${resource}». Edit the source: ${sources}/${resource} — then build the package and lay it out." \
            "an edit true only to this tree goes to the override .claude/rt-kit/overrides/${resource} — it merges by the section «## » and outlives the layout"
    fi

    deny "BLOCKED by rule-source-guard: «${candidate#"$root"/}» is laid out by the package @rt-tools/agent-kit, and an edit in its place is lost on the next layout. The resource is «${resource}». Edit the override: .claude/rt-kit/overrides/${resource} — it merges by the section «## » and outlives the layout." \
        "what is true of any tree is edited in the package itself and arrives here by a new edition"
done <<EOF
$candidates
EOF

exit 0
