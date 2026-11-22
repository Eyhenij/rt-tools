#!/usr/bin/env bash
# Runs the rules gate of the tree on one edit per line of the list, with an empty memory of loaded
# rules, and prints «pass <size>» when the gate delivered the rules, or why it refused.
#   gate-probe.sh <root of the tree> <file: a path per line, optionally a tab and the edit text>
# The gate runs on a copy of the tree in a temporary directory: its observations land in the copy,
# and `.claude/rt-kit/observations` of the tree stays as it was. The copy carries `tools/` and
# `projects/agent-kit/`: without the decision table the gate lets every refusal through. The copy
# lies at its real path: under a link such as `/var` the decision table does not see itself run,
# answers nothing, and every refusal reads «no rule».
# A line that begins with «$ » is a command, and one that begins with «@ » is the name of a tool
# called with no input, not a path.
src="$1"
list="$2"
root="$(cd "$(mktemp -d)" && pwd -P)/tree"
mkdir -p "$root/projects"
rsync -a --exclude worktrees --exclude 'rt-kit/observations' --exclude handoff "$src/.claude" "$root/"
rsync -a "$src/tools" "$src/docs" "$root/"
rsync -a --exclude node_modules "$src/projects/agent-kit" "$root/projects/"
cp "$src/package.json" "$root/"
ln -s "$src/node_modules" "$root/node_modules"
(cd "$root" && git init -q && git add -A >/dev/null && git -c user.name=p -c user.email=p@p commit -qm probe)
tab="$(printf '\t')"
while IFS="$tab" read -r p text; do
    [ -n "$p" ] || continue
    tmp="$(mktemp -d)"
    rec="$tmp/turn.jsonl"
    : > "$rec"
    case "$p" in
        '$ '*)
            input="$(jq -cn --arg c "${p#\$ }" --arg d "$root" --arg r "$rec" '{session_id:"probe",hook_event_name:"PreToolUse",tool_name:"Bash",cwd:$d,transcript_path:$r,tool_input:{command:$c}}')" ;;
        '@ '*)
            input="$(jq -cn --arg t "${p#@ }" --arg d "$root" --arg r "$rec" '{session_id:"probe",hook_event_name:"PreToolUse",tool_name:$t,cwd:$d,transcript_path:$r,tool_input:{}}')" ;;
        *)
            input="$(jq -cn --arg f "$root/$p" --arg d "$root" --arg r "$rec" --arg t "${text:-b}" '{session_id:"probe",hook_event_name:"PreToolUse",tool_name:"Edit",cwd:$d,transcript_path:$r,tool_input:{file_path:$f,old_string:"a",new_string:$t}}')" ;;
    esac
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
    printf '%-66s %s\n' "$p${text:+ [$text]}" "$verdict"
    rm -rf "$tmp"
done < "$list"
[ -n "$KEEP" ] && echo "copy: $root" || rm -rf "$(dirname "$root")"
