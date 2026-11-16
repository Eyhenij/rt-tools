#!/usr/bin/env bash
# The shared deny tail. NOT a guard: it has no `rt-hook:` declaration and hooks into no agent event.
# The guards source it themselves — the same way they source the observation record and the word
# about a missing profile function.
#
# Why it exists. A guard's refusal names the miss and the way to lift it, and nobody names what to
# do when lifting it does not work out. The empty place is taken by a third move that is in no rule:
# bypass silently — by a shell command, by a neighbouring tool, by editing the guard itself. That is
# what happened: within one hour a refusal was bypassed twice, and both times the edit landed past
# the guard. There are two lawful moves, and both are named right in the refusal text instead of
# being left to the reader's guess.
#
# WHAT IS SAID. Fix what was named and repeat the call — or bring the owner the price of the bypass
# and wait for their word. Where the bypass has a lawful form — a line in the commit body, a line
# in the plan, a command flag — the same tail names it: a bypass known to be lawful is looked for by
# the guard's own words, not past the guard.
#
# WHAT THE TAIL DOES NOT DO. It does not judge whether the bypass fits this case: the owner decides
# that. And it does not replace the refusal reason — that stands before it and names the miss by
# name.
#
# THE REFUSAL RECORD GOES FROM HERE TOO. The tail is the one place every refusal passes through: the
# tree's rule demands that the two lawful moves be named at every refusal, and a guard that refuses
# past the tail breaks that rule before it loses count. Written inside the guard itself, the record
# stood in five guards out of thirty, and the digest answered by that fifth. A guard declares itself
# by the line `RT_GUARD_NAME=<name>` at its top; one that has not declared writes nothing — that is
# how the rules gate counts its own refusals by itself.

# The deny tail as a string. The first parameter is the lawful form of bypass, if the refusal has
# one; empty means there is no lawful form at all, and this is said outright.
#
#   reason="BLOCKED: <reason>. $(rt_deny_tail 'the line `Docs-skip: <reason>` in the commit body')"
#   reason="BLOCKED: <reason>. $(rt_deny_tail)"
# The rule the rules gate still waits for in this session, or nothing. A refusal names a move, and
# the gate refuses that very move while its rule is not loaded: the executor then walks from one
# refusal to the next. A guard that names a move the gate judges asks here first and names the
# loading of the rule instead. The gate's own reading is repeated, not called: the gate is a hook
# with input of its own, and the record and the rule directory are the whole of its answer.
# Parameters: the rule name, the session id.
rt_gate_pending() {
    local rule="$1" sid="${2:-nosession}"
    local loaded="${TMPDIR:-/tmp}/claude-skill-gate/${sid}.loaded"
    [ -f "${CLAUDE_PROJECT_DIR:-.}/${RT_RULES_DIR:-.claude/skills}/${rule}/SKILL.md" ] || return 1
    [ -f "$loaded" ] && grep -qE "^([^:]*:)?${rule}$" "$loaded" 2>/dev/null && return 1
    printf '%s' "$rule"
}

# What comes before the move a refusal names, or nothing when that move is free right now.
#
# A refusal names a move, and a neighbouring guard may refuse that very move in the same tree: the
# exam holds every edit, the rules gate holds the files of its rule, the task-flow guard holds the
# code. The executor then walks from one refusal to the next, and the first refusal named a move
# that was never open. So the refusing guard asks its neighbours about the move before naming it,
# and names what they want first.
#
# The neighbours are asked in a fixed order — the exam, the rules gate, the handover entry, the two
# task-flow guards, the step guard, the documents guard — and the first refusal wins. The gate is
# read through `rt_gate_pending`, not called: the gate writes an observation for every refusal, and
# a question about a move is not a refusal. The others are called with the move as their input, and
# the text of their refusal comes back without the shared tail. A neighbour that refuses names its
# own move the same way, so the chain is asked to the depth of three and no further.
#
# Parameters: the tool of the move, its `tool_input` as JSON.
rt_move_first() {
    [ "${RT_MOVE_DEPTH:-0}" -lt 3 ] || return 0
    command -v jq >/dev/null 2>&1 || return 0
    local mf_dir mf_input mf_sid mf_hook mf_out mf_reason mf_rule mf_target mf_kind mf_path mf_rules
    mf_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    mf_input="$(printf '%s' "${RT_HOOK_INPUT:-null}" | jq -c --arg t "$1" --argjson i "$2" '(if type == "object" then . else {} end) | .tool_name = $t | .tool_input = $i' 2>/dev/null)"
    [ -n "$mf_input" ] || return 0
    mf_sid="$(printf '%s' "$mf_input" | jq -r '.session_id // "nosession"' 2>/dev/null)"
    for mf_hook in exam-guard.sh @gate handoff-entry-guard.sh task-flow-guard.sh task-flow-draft-guard.sh flow-step-guard.sh docs-guard.sh; do
        if [ "$mf_hook" = @gate ]; then
            mf_rules="$(rt_move_rules "$1" "$mf_input")"
            for mf_rule in $mf_rules; do
                mf_rule="$(rt_gate_pending "$mf_rule" "$mf_sid")" || continue
                printf 'The named move is held by the rules gate: load the rule «%s» by the tool Skill first.' "$mf_rule"
                return 0
            done
            continue
        fi
        [ -x "$mf_dir/$mf_hook" ] || continue
        mf_out="$(printf '%s' "$mf_input" | env -u RT_HOOK_INPUT -u RT_HOOK_PARSED -u RT_HOOK_TOOL -u RT_HOOK_CMD -u RT_HOOK_FILE -u RT_HOOK_CWD \
            RT_MOVE_DEPTH=$((${RT_MOVE_DEPTH:-0} + 1)) "$mf_dir/$mf_hook" 2>/dev/null)"
        mf_reason="$(printf '%s' "$mf_out" | jq -r 'select(.hookSpecificOutput.permissionDecision == "deny") | .hookSpecificOutput.permissionDecisionReason' 2>/dev/null \
            | awk '/Two moves from here/ { sub(/Two moves from here.*/, ""); print; exit } { print }')"
        mf_reason="$(printf '%s' "$mf_reason" | tr '\n' ' ' | sed -E 's/[[:space:]]+$//')"
        if [ -n "$mf_reason" ]; then
            printf 'The named move is refused right now, and this comes first — %s' "$mf_reason"
            return 0
        fi
    done
}

# The rules the gate wants for a move: the map read the way the gate reads it, a shell command
# with the files it writes. Parameters: the tool of the move, the whole input of the move.
rt_move_rules() {
    local mr_dir mr_root mr_map mr_profile mr_target mr_path
    mr_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    mr_root="${CLAUDE_PROJECT_DIR:-.}"
    (
        for mr_map in "$mr_dir/../rt-kit/defaults/gate-map.sh" "$mr_dir/../defaults/gate-map.sh" "$mr_root/.claude/rt-kit/defaults/gate-map.sh" "$mr_root/.claude/rt-kit/gate-map.sh"; do
            # shellcheck disable=SC1090
            [ -f "$mr_map" ] && . "$mr_map" 2>/dev/null
        done
        command -v skill_for >/dev/null 2>&1 || exit 0
        case "$1" in
            Edit | Write | MultiEdit)
                mr_target="$(printf '%s' "$2" | jq -r '.tool_input.file_path // empty' 2>/dev/null)"
                case "$mr_target" in /*) ;; ?*) mr_target="$mr_root/$mr_target" ;; *) exit 0 ;; esac
                skill_for edit "$mr_target" "" 2>/dev/null
                ;;
            Bash)
                mr_target="$(printf '%s' "$2" | jq -r '.tool_input.command // empty' 2>/dev/null)"
                [ -n "$mr_target" ] || exit 0
                skill_for bash "$mr_target" "" 2>/dev/null
                for mr_profile in "$mr_dir/../rt-kit/defaults/project.sh" "$mr_dir/../defaults/project.sh" "$mr_root/.claude/rt-kit/defaults/project.sh" "$mr_root/.claude/rt-kit/project.sh"; do
                    # shellcheck disable=SC1090
                    [ -f "$mr_profile" ] && . "$mr_profile" 2>/dev/null
                done
                command -v rt_shell_writes >/dev/null 2>&1 && command -v rt_shell_paths >/dev/null 2>&1 || exit 0
                rt_shell_writes "$mr_target" || exit 0
                rt_shell_paths "$mr_target" | while IFS= read -r mr_path; do
                    [ -n "$mr_path" ] || continue
                    case "$mr_path" in /*) ;; *) mr_path="$mr_root/$mr_path" ;; esac
                    skill_for edit "$mr_path" "" 2>/dev/null
                done
                ;;
        esac
    ) | tr '\n' ' '
}

rt_deny_tail() {
    # A guard asked by `rt_move_first` below judges a move nobody made yet: its refusal is not a
    # refusal of the session, and the record would count it as one.
    if [ "${RT_MOVE_DEPTH:-0}" = 0 ]; then
        # shellcheck disable=SC1090
        [ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/guard-note.sh" ] \
            && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/guard-note.sh" 2>/dev/null
        command -v rt_guard_note >/dev/null 2>&1 && rt_guard_note
    fi

    if [ -n "$1" ]; then
        printf 'Two moves from here: fix what is named and repeat the call, or bring the owner the price of a bypass and wait for their word. The lawful form of bypass: %s. An edit is not laid past the guard in silence: it refuses one call, and a bypassed one lifts the requirement from the whole tree and says nothing about it.' "$1"
        return 0
    fi

    printf 'Two moves from here: fix what is named and repeat the call, or bring the owner the price of a bypass and wait for their word. There is no lawful form of bypass for this refusal. An edit is not laid past the guard in silence: it refuses one call, and a bypassed one lifts the requirement from the whole tree and says nothing about it.'
}
