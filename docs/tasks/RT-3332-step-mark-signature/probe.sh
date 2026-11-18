#!/usr/bin/env bash
# The live probe of step 5.4 of the plan. Three questions to the laid-out engine of this branch:
#   1. a step mark written past the engine plus a done mark made by an edit — refused?
#   2. a Write into the memory next to the session records — let through?
#   3. the measurement of the state, the work of every turn end — under 75 seconds?
# The forged mark is put back as it was found. Prints one line; the plan compares the last one.
set -u
root="$(git rev-parse --show-toplevel)"
cd "$root" || exit 1
branch="$(git branch --show-current)"
progress="docs/tasks/$branch/progress.md"
engine="tools/task-flow-script.mjs"

# The step the edit marks done: the current one, else the first not begun.
line="$(grep -m1 -E '^- \[>\] [0-9]+\.[0-9]+ ' "$progress" || grep -m1 -E '^- \[ \] [0-9]+\.[0-9]+ ' "$progress")"
[ -n "$line" ] || { echo 'probe: no step left to mark'; exit 1; }
step="$(printf '%s' "$line" | sed -E 's/^- \[.\] ([0-9]+\.[0-9]+) .*/\1/')"
done_line="$(printf '%s' "$line" | sed -E 's/^- \[.\]/- [x]/')"

marks="$(cd "$root" && cd "$(git rev-parse --git-common-dir)" && pwd)/rt-kit/steps/$branch"
mark="$marks/$step.json"
saved=''
[ -f "$mark" ] && saved="$(cat "$mark")"
restore() { if [ -n "$saved" ]; then printf '%s' "$saved" >"$mark"; else rm -f "$mark"; fi; }
trap restore EXIT
mkdir -p "$marks"
node -e 'const [f,b,s,h]=process.argv.slice(1);require("fs").writeFileSync(f,JSON.stringify({branch:b,step:s,head:h,matched:true}))' \
    "$mark" "$branch" "$step" "$(git rev-parse HEAD)"

edit_input="$(jq -n --arg cwd "$root" --arg file "$root/$progress" --arg old "$line" --arg new "$done_line" \
    '{cwd:$cwd, session_id:"probe", tool_name:"Edit", tool_input:{file_path:$file, old_string:$old, new_string:$new}}')"
forged="$(printf '%s' "$edit_input" | node "$engine" guard 2>/dev/null)"
[ -n "$forged" ] || { echo "probe: forged mark let step $step through"; exit 1; }

encoded="$(printf '%s' "$root" | sed 's#[/.]#-#g')"
memory_input="$(jq -n --arg cwd "$root" --arg file "$HOME/.claude/projects/$encoded/memory/probe.md" \
    '{cwd:$cwd, session_id:"probe", tool_name:"Write", tool_input:{file_path:$file, content:"probe"}}')"
memory="$(printf '%s' "$memory_input" | node "$engine" guard 2>/dev/null)"
[ -z "$memory" ] || { echo "probe: a write into the memory was refused"; exit 1; }

start="$(date +%s)"
node "$engine" measure >/dev/null 2>&1
spent=$(($(date +%s) - start))
[ "$spent" -lt 75 ] || { echo "probe: the state took $spent s"; exit 1; }

echo 'probe: forged refused, verdict under 75 s'
