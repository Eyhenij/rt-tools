#!/usr/bin/env bash
# Runs the rules gate of the tree on one edit per path of the list, with an empty memory of loaded
# rules, and prints «pass <size>» when the gate delivered the rules, or why it refused.
#   gate-probe.sh <root> <file with one path per line>
root="$1"
while IFS= read -r p; do
    [ -n "$p" ] || continue
    tmp="$(mktemp -d)"
    rec="$tmp/turn.jsonl"
    : > "$rec"
    input="$(jq -cn --arg f "$root/$p" --arg d "$root" --arg r "$rec" '{session_id:"probe",hook_event_name:"PreToolUse",tool_name:"Edit",cwd:$d,transcript_path:$r,tool_input:{file_path:$f,old_string:"a",new_string:"b"}}')"
    out="$(cd "$root" && printf '%s' "$input" | TMPDIR="$tmp/" CLAUDE_PROJECT_DIR="$root" bash .claude/hooks/skill-gate.sh 2>/dev/null)"
    if [ -z "$out" ]; then
        verdict="no rule"
    elif printf '%s' "$out" | grep -q 'Passed by the rules gate'; then
        verdict="pass $(printf '%s' "$out" | jq -r '.hookSpecificOutput.additionalContext' | wc -m | tr -d ' ')"
    else
        why="$(printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecisionReason // .reason' | tr '\n' ' ')"
        rules="$(printf '%s' "$why" | grep -oE '«[a-z-]+»' | sort -u | tr '\n' ' ')"
        case "$why" in
            *"do not fit"*) verdict="REFUSED together: $rules" ;;
            *) verdict="REFUSED long: $rules" ;;
        esac
    fi
    printf '%-66s %s\n' "$p" "$verdict"
    rm -rf "$tmp"
done < "$2"
