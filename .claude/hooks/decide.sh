#!/usr/bin/env bash
# rt-kit v0.37.1 · hooks/decide.sh · 49f3de577c18 · правится надстройкой, не здесь
# The call of the decider from a guard. NOT a guard: it has no `rt-hook:` declaration and hooks into
# no agent event. A guard gathers the facts of the state, sources this file and asks `rt_decide`;
# the decision, the move a refusal names and its text come from the decision table.
#
# Why a file of its own. Every guard emitted its refusal by itself — a JSON of its own, exit 2 with a
# text on stderr, a `deny()` of its own — and the table only described what they did. One call keeps
# the decision in one place: a row edited in the table is what the guard does.
#
# WHAT IS HERE. One call, `rt_decide`, and the lookup of the decider.
#
#   rt_decide <hook> <action> <facts JSON> [params JSON] [event] [hook input JSON]
#
# An empty action with the hook input given lets the decider find the action from the call itself;
# «?<action>» does the same and names the hook's own action for a call no class fits.
# «<class>><action>» names the plain action that decides when no row of the class fits the facts.
#
# It prints the answer for the agent and returns 1 when the table refuses or asks; prints nothing and
# returns 0 when it allows. The event is `PreToolUse` unless named: a Stop hook gets the block form,
# and the event `git` — a hook of git itself — gets the bare text on the error stream. The event
# `stderr` is the same form for a guard of the agent that refuses by the code 2: the text goes to the
# error stream, and the guard exits with what `rt_decide` returned.
#
# FAIL-OPEN, IN FAVOUR OF WORK: no node, no decider, no table, a decider that fails — nothing is
# printed and 0 is returned: the guard lets the action through. A broken decider has no right to jam
# the work.

# Where the decider lies: next to the hooks in the package source, otherwise in the checks directory
# the tree named in its settings — the same way the neighbouring helpers find a program of the tree.
rt_decide_cmd() {
    # A path named by the caller wins: a suite that copies hooks apart from the package names it.
    if [ -n "${RT_DECIDE_CMD:-}" ] && [ -f "$RT_DECIDE_CMD" ]; then
        printf '%s' "$RT_DECIDE_CMD"
        return 0
    fi
    _here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    if [ -f "$_here/../checks/decide.mjs" ]; then
        printf '%s/../checks/decide.mjs' "$_here"
        return 0
    fi
    _root="${CLAUDE_PROJECT_DIR:-$PWD}"
    _checks="$(jq -r '.layout.checks // "tools"' "$_root/.claude/rt-kit.json" 2>/dev/null)"
    [ -n "$_checks" ] && [ "$_checks" != null ] || _checks=tools
    printf '%s/%s/decide.mjs' "$_root" "$_checks"
}

rt_decide() {
    _hook="$1"
    _action="$2"
    _facts="${3:-"{}"}"
    _params="${4:-"{}"}"
    _event="${5:-PreToolUse}"
    _input="${6:-null}"
    # The guard note names the hook that asked, when the hook named nobody itself.
    RT_GUARD_NAME="${RT_GUARD_NAME:-${_hook%.sh}}"

    command -v node >/dev/null 2>&1 || return 0
    _cmd="$(rt_decide_cmd)"
    [ -f "$_cmd" ] || return 0

    [ "$_input" != null ] || _input="${RT_HOOK_INPUT:-null}"
    printf '%s' "$_input" | jq -e . >/dev/null 2>&1 || _input=null

    # The slots every hook's text may hold, the neighbours' included: the branch and the tasks
    # directory. The caller's own params win.
    _dir="$(printf '%s' "$_input" | jq -r '.cwd // empty' 2>/dev/null)"
    [ -d "$_dir" ] || _dir="${CLAUDE_PROJECT_DIR:-.}"
    # shellcheck disable=SC1091
    command -v rt_fact_branch >/dev/null 2>&1 || . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/facts.sh" 2>/dev/null
    _shared="$(jq -cn --arg b "$(rt_fact_branch "$_dir" 2>/dev/null)" --arg t "${RT_TASKS_DIR:-docs/tasks}" '{branch:$b, tasks_dir:$t}')"
    _params="$(jq -cn --argjson s "$_shared" --argjson p "$_params" '$s + $p' 2>/dev/null || printf '%s' "$_params")"

    # A refusal past the window threshold names the numbers of the window, and it stands first in the
    # refusals of the neighbours too: the numbers are filled here for whichever hook asks.
    if [ "$(printf '%s' "$_facts" | jq -r '.window_over_stop // empty' 2>/dev/null)" = yes ]; then
        # shellcheck disable=SC1091
        command -v rt_fact_window_params >/dev/null 2>&1 || . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/facts.sh" 2>/dev/null
        _wp="$(rt_fact_window_params "$(printf '%s' "$_input" | jq -r '.transcript_path // empty' 2>/dev/null)")"
        [ -n "$_wp" ] && _params="$(jq -cn --argjson w "$_wp" --argjson p "$_params" '$w + $p' 2>/dev/null || printf '%s' "$_params")"
    fi

    # «?<action>» asks the decider to take the class of the call and names the hook's own action for
    # a call no class fits.
    _fallback=''
    case "$_action" in "?"*) _fallback="${_action#\?}"; _action='' ;; esac
    _base=''
    case "$_action" in *">"*) _base="${_action#*>}"; _action="${_action%%>*}" ;; esac
    _query="$(jq -cn --arg h "$_hook" --arg a "$_action" --arg fb "$_fallback" --arg bs "$_base" --argjson f "$_facts" --argjson p "$_params" --argjson i "$_input" \
        '{hook:$h, action:$a, facts:$f, params:$p} + (if $i == null then {} else {input:$i} end) + (if $fb == "" then {} else {fallback:$fb} end) + (if $bs == "" then {} else {base:$bs} end)' 2>/dev/null)" || return 0
    _answer="$(node "$_cmd" "$_query" 2>/dev/null)"
    [ -n "$_answer" ] || return 0

    _decision="$(printf '%s' "$_answer" | jq -r '.decision // empty' 2>/dev/null)"
    _text="$(printf '%s' "$_answer" | jq -r '.text // empty' 2>/dev/null)"
    [ -n "$_decision" ] || return 0

    # The closing words of a refusal and the record of it come from the shared tail, as before. A
    # row whose text carries its own closing words still gets the record.
    # shellcheck disable=SC1090
    command -v rt_deny_tail >/dev/null 2>&1 || . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
    # The param `bypass` names the lawful form of a bypass for the tail; `after` is a word the hook
    # adds below the whole refusal — a neighbour's note that travels inside it.
    _bypass="$(printf '%s' "$_params" | jq -r '.bypass // empty' 2>/dev/null)"
    _after="$(printf '%s' "$_params" | jq -r '.after // empty' 2>/dev/null)"
    if [ "$(printf '%s' "$_answer" | jq -r '.tail // false' 2>/dev/null)" = true ]; then
        command -v rt_deny_tail >/dev/null 2>&1 && _text="$_text

$(rt_deny_tail "$_bypass")"
    fi

    # The record of the decision: every refusal and every question of a guard passes through here,
    # and the event is named by the decision the table took — `guard-deny` or `guard-ask`.
    # shellcheck disable=SC1090
    command -v rt_guard_note >/dev/null 2>&1 || . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/guard-note.sh" 2>/dev/null
    command -v rt_guard_note >/dev/null 2>&1 && RT_HOOK_INPUT="${RT_HOOK_INPUT:-$_input}" rt_guard_note "guard-$_decision"
    [ -n "$_after" ] && _text="$_text

$_after"

    # A hook that keeps its own observation of a refusal names it in `RT_DECIDE_NOTE`: the event
    # prefix and its fields. The event is named by the decision the table took.
    if [ -n "${RT_DECIDE_NOTE:-}" ]; then
        # shellcheck disable=SC1090
        command -v rt_note >/dev/null 2>&1 || . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/observe.sh" 2>/dev/null
        # shellcheck disable=SC2086
        command -v rt_note >/dev/null 2>&1 && rt_note "${RT_DECIDE_NOTE%% *}-${_decision}" ${RT_DECIDE_NOTE#* }
    fi

    if [ "$_event" = git ] || [ "$_event" = stderr ]; then
        # A hook of git itself: the text goes to the error stream, and the non-zero code stops git.
        printf '%s\n' "$_text" >&2
    elif [ "$_event" = Stop ] || [ "$_event" = SubagentStop ]; then
        jq -cn --arg r "$_text" '{decision:"block", reason:$r}'
    else
        jq -cn --arg d "$_decision" --arg r "$_text" --arg e "$_event" \
            '{hookSpecificOutput:{hookEventName:$e, permissionDecision:$d, permissionDecisionReason:$r}}'
    fi
    # Git reads any code but zero as a refusal; 2 is the code the agent's hooks refuse with too.
    [ "$_event" = git ] || [ "$_event" = stderr ] && return 2
    return 1
}
