#!/usr/bin/env bash
# rt-kit v0.39.0 · hooks/turn-exit-guard.sh · 8239f7caef02 · правится надстройкой, не здесь
# rt-hook: Stop
# rt-hook-timeout: 90
# Requires: checks/task-flow-script.mjs, checks/decide.mjs, hooks/decide.sh, hooks/facts.sh, hooks/deny-tail.sh, hooks/turn-exit-role.sh
# Turn exit guard: a turn does not end before the scenario of the task flow does. Stop.
#
# The engine measures the branch by the description and answers with a verdict: the turn is released
# by a release case of the description — the end of the scenario, the owner's stop word or Esc, a
# session that wrote nothing, a role, the silent hosting, a menu that did not reach the owner — or held with
# one move named, the next step of the scenario. This file hands the engine the input and turns its
# verdict into the answer of the hook.
#
# Three cases the description cannot express live here: a role session with no edit tool ends with
# its report (`turn-exit-role.sh`), a window past the stop threshold of `window-fill-guard.sh` ends
# with the handover, and an engine that fails, runs past its limit of 75 seconds or cannot
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

# A window past its stop threshold: the window guard refuses every next step of work and lets only
# the closing through — the progress, the handover, a rule, a question. Naming the next step here
# would name a move that guard denies, so the turn is released, and the reason goes to the journal.
sid="$(printf '%s' "$input" | jq -r '.session_id // "unknown"' 2>/dev/null)"
# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/facts.sh" 2>/dev/null
if [ -f "$(rt_fact_window_stop_file "$sid")" ]; then
    journal "окно за порогом: ход отпущен к передаче"
    exit 0
fi

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
    # A turn released on a wait is woken only by the notice of its task. The journal keeps the
    # release with the session: the records of that session then show what woke it.
    case "$release" in
        'a background task of the session runs') journal "ход отпущен на ожидании: $release · сессия $sid" ;;
    esac
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

# The decision and its text come from the decision table. The engine gives the reason; whether the
# reason names the owner's menu is read from the engine's own fixed sentence for it.
menu_due=no
case "$reason" in *"The one move is the owner's menu:"*) menu_due=yes ;; esac
facts="$(jq -cn --arg m "$menu_due" \
    '{flow_scenario_over:"no", menu_due:$m, read_only_role:"no", window_over_stop:"no"}')"
params="$(jq -cn --arg r "$reason" '{reason:$r}')"
# shellcheck disable=SC1091
. "$rt_hooks_dir/decide.sh" 2>/dev/null
command -v rt_decide >/dev/null 2>&1 && rt_decide turn-exit-guard.sh end_turn "$facts" "$params" Stop
exit 0
