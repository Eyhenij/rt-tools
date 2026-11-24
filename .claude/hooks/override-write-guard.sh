#!/usr/bin/env bash
# rt-kit v0.39.1 · hooks/override-write-guard.sh · 986c717ef2b7 · правится надстройкой, не здесь
# rt-hook: PreToolUse Write|Bash|mcp__webstorm__create_new_file|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: hooks/deny-tail.sh, hooks/guard-note.sh, hooks/write-targets.sh
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
# The decision and the words come from the decision table. A refusal that names an edit of another
# file hands the decider the facts its neighbours judge that edit by — the exam, the window, the rules
# gate, the handover and the course of work — and the decider puts first what they want.
# shellcheck disable=SC1091
. "$rt_hooks_dir/decide.sh" 2>/dev/null
# shellcheck disable=SC1091
. "$rt_hooks_dir/facts.sh" 2>/dev/null
# shellcheck disable=SC1091
. "$rt_hooks_dir/facts-flow.sh" 2>/dev/null

# refuse <action> <own facts JSON> <params JSON> [file of the named edit]
refuse() {
    local move='{}' flow='{"facts":{},"params":{}}' named
    command -v rt_decide >/dev/null 2>&1 || exit 0
    if [ -n "${4:-}" ]; then
        named="$(jq -cn --arg f "$4" '{file_path:$f,old_string:"",new_string:""}')"
        move="$(rt_fact_move Edit "$named" "$input")"
        if command -v rt_fact_flow_of >/dev/null 2>&1; then
            flow="$(rt_fact_flow_of Edit "$named" "$input")"
            [ -n "$flow" ] || flow='{"facts":{},"params":{}}'
        fi
    fi
    rt_decide "$RT_GUARD_NAME.sh" "$1" \
        "$(jq -cn --argjson m "$move" --argjson f "$flow" --argjson o "$2" '$m + $f.facts + $o')" \
        "$(jq -cn --argjson f "$flow" --argjson p "$3" '$f.params + $p')" PreToolUse "$input"
    exit 0
}

# The targets of writing over are read by the parse shared with the other guards: what adds to the end
# and what edits in place it does not name.
# shellcheck disable=SC1091
. "$rt_hooks_dir/write-targets.sh" 2>/dev/null || true
command -v rt_overwrite_targets >/dev/null 2>&1 || rt_overwrite_targets() { cat >/dev/null; }

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
    # A copy of the tree inside it holds overrides of its own, and they are gained the same way.
    case "$relative" in "$overrides_dir"/* | .claude/worktrees/*/"$overrides_dir"/*) ;; *) continue ;; esac
    [ -f "$candidate" ] || continue

    lines="$(wc -l <"$candidate" 2>/dev/null | tr -d ' ')"
    [ -z "$lines" ] && continue
    [ "$lines" -eq 0 ] && continue

    sections="$(grep -c '^## ' "$candidate" 2>/dev/null || printf '0')"
    resource="${relative##*"$overrides_dir"/}"

    refuse write_override '{"override_nonempty":"yes"}' \
        "$(jq -cn --arg p "$relative" --arg l "$lines" --arg s "$sections" --arg r "$resource" '{path:$p, lines:$l, sections:$s, resource:$r}')" \
        "$candidate"
done <<EOF
$candidates
EOF

exit 0
