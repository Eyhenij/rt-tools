#!/usr/bin/env bash
# rt-hook: Stop
# rt-hook-timeout: 90
# Requires: checks/task-flow-script.mjs, hooks/deny-tail.sh, hooks/turn-exit-role.sh
# Turn exit guard: a turn does not end before the scenario of the task flow does. Stop.
#
# The engine measures the branch by the description and answers with a verdict: the turn is released
# by a release case of the description — the end of the scenario, a stop word of the owner, a session
# that wrote nothing, a role, the silent hosting, a menu that did not reach the owner — or held with
# one move named, the next step of the scenario. This file hands the engine the input and turns its
# verdict into the answer of the hook.
#
# Two cases the description cannot express live here: a role session with no edit tool ends with its
# report (`turn-exit-role.sh`), and an engine that fails, runs past its limit of 75 seconds or cannot
# be called releases the turn with the outcome «движок упал» written to the journal; the next turn
# starts with that line.
#
# FAIL-OPEN: no node, no jq, no engine, an engine that fails or runs past its limit → the turn is
# released, and the failure is written to the journal. A broken guard must not jam the conversation.

RT_GUARD_NAME=turn-exit-guard
RT_GUARD_RULE=turn-conduct

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$rt_hooks_dir/utf8.sh" 2>/dev/null || true
. "$rt_hooks_dir/hook-input.sh" 2>/dev/null || true
command -v rt_hook_read >/dev/null 2>&1 || exit 0
rt_hook_read
input="$RT_HOOK_INPUT"
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# The engine measures the copy the session works in: the directory the hook input names. A worktree
# copy whose branch does not carry the engine is not judged by this scenario, and the turn ends.
dir="$(printf '%s' "$input" | jq -r '.cwd // empty' 2>/dev/null)"
[ -d "$dir" ] || dir="$root"
copy_top="$(git -C "$dir" rev-parse --show-toplevel 2>/dev/null)"
root_top="$(git -C "$root" rev-parse --show-toplevel 2>/dev/null)"
if [ -n "$copy_top" ] && [ "$copy_top" != "$root_top" ] && [ -z "${RT_FLOW_ENGINE:-}" ] && [ ! -f "$copy_top/tools/task-flow-script.mjs" ]; then
    exit 0
fi

# A role with no edit tool: its report is its work.
. "$rt_hooks_dir/turn-exit-role.sh" 2>/dev/null && rt_te_read_only_role && exit 0

# The journal of the engine failures and of the refusals in a row lies in the common directory of git.
journal_dir="$(git -C "$root" rev-parse --git-common-dir 2>/dev/null)"
case "$journal_dir" in
    '') journal_dir="" ;;
    /*) journal_dir="$journal_dir/rt-kit" ;;
    *) journal_dir="$root/$journal_dir/rt-kit" ;;
esac
journal() {
    [ -n "$journal_dir" ] || return 0
    mkdir -p "$journal_dir" 2>/dev/null || return 0
    printf '%s\t%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1" >> "$journal_dir/turn-exit.log" 2>/dev/null
}

engine="${RT_FLOW_ENGINE:-}"
[ -n "$engine" ] || for candidate in "$rt_hooks_dir/../checks/task-flow-script.mjs" "${copy_top:-$root}/tools/task-flow-script.mjs" "$root/tools/task-flow-script.mjs"; do
    [ -f "$candidate" ] && engine="$candidate" && break
done
if [ ! -f "$engine" ] || ! command -v node >/dev/null 2>&1 || ! command -v jq >/dev/null 2>&1; then
    journal "движок упал: the engine cannot be called"
    exit 0
fi

limit="${RT_FLOW_VERDICT_LIMIT:-75}"
verdict="$(cd "$dir" && printf '%s' "$input" | perl -e 'alarm shift; exec @ARGV' "$limit" node "$engine" verdict 2>/dev/null)"
code=$?
if [ "$code" -ne 0 ] || [ -z "$verdict" ]; then
    journal "движок упал: exit $code"
    exit 0
fi

release="$(printf '%s' "$verdict" | jq -r '.release // empty' 2>/dev/null)"
if [ -n "$release" ]; then
    rm -f "$journal_dir/refusals-in-row" 2>/dev/null
    exit 0
fi
reason="$(printf '%s' "$verdict" | jq -r '.block // empty' 2>/dev/null)"
if [ -z "$reason" ]; then
    journal "движок упал: no verdict"
    exit 0
fi

# Claude Code ends the turn itself after eight continuations in a row; the eighth refusal is written.
row=$(( $(cat "$journal_dir/refusals-in-row" 2>/dev/null || echo 0) + 1 ))
printf '%s\n' "$row" > "$journal_dir/refusals-in-row" 2>/dev/null
[ "$row" -ge 8 ] && journal "the eighth refusal in a row: $reason"

reason="BLOCKED by turn-exit-guard: ${reason}"
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/deny-tail.sh" ] && . "$rt_hooks_dir/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
tail_text="$(rt_deny_tail "")"
[ -n "$tail_text" ] && reason="${reason}

${tail_text}"

jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
    || printf '{"decision":"block","reason":"turn-exit-guard: the scenario is not over."}\n'
exit 0
