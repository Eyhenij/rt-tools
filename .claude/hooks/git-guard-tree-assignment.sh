#!/usr/bin/env bash
# rt-kit v0.28.0 · hooks/git-guard-tree-assignment.sh · 16d0f9f64661 · правится надстройкой, не здесь
# The assignment of an epic to this working copy. NOT a guard: it has no `rt-hook:` declaration and
# hooks into no agent event. The delivery guard sources it, the same way it sources the conditions
# about the epic of a task.
#
# Why at all. A machine holds several working copies of one tree, and the work queue answers only
# what is open: it holds no owner of a card, and by topic one epic cannot be told from another. A
# session that took the freshest epic of the list did work nobody had ordered — the whole day of it,
# up to a written agreement, and it was the owner who stopped that, not a check.
#
# WHAT IS HERE. Two calls, made from the delivery guard, where `fault` is already declared. The
# answer is computed by the tree's command: the table of assignments and the name of this copy are
# read in one place, by the audit and by the guard alike.

# Where the reading command lies. The layout directory of a tree is its own, and the path is taken
# from the tree settings the same way the neighbouring guards take it.
rt_assignment_cmd() {
    _checks="$(jq -r '.layout.checks // "tools"' ".claude/rt-kit.json" 2>/dev/null)"
    [ -n "$_checks" ] && [ "$_checks" != null ] || _checks=tools
    printf '%s/tree-assignment.mjs' "$_checks"
}

# The refusal about the assignment, or silence. Arguments: the number of the epic of the work being
# taken (empty where the work has no epic) and what exactly is being taken, for the refusal text.
#
# The tree that declares no assignments answers with silence: it has nothing to divide, and a
# requirement invented for it would refuse every branch of a tree with one working copy.
rt_assignment_fault() {
    _epic="$1"
    _what="$2"
    _said=''
    _reader="$(rt_assignment_cmd)"

    [ -f "$_reader" ] || return 0
    command -v node >/dev/null 2>&1 || return 0

    _said="$(node "$_reader" --fault "$_epic" 2>/dev/null)"
    if [ -n "$_said" ]; then
        fault "${_what} is not taken: ${_said}."
        return 0
    fi

    rt_assignment_stale "$_what"
}

# The assignment that outlived its epic.
#
# An assignment goes stale by itself: the epic ends, and the row stays as it was. That is exactly
# how a session got no order at all — the table named an epic all seven tasks of which had been
# closed for days, and the session, finding nothing alive there, chose the work by itself.
#
# The staleness is not readable from the table: the table says what was given, and only the queue
# says whether it is still alive. No answer from the queue — no refusal: the call goes to the
# network, and a tree without one keeps working.
rt_assignment_stale() {
    _what="$1"
    _assigned=''
    _state=''
    _reader="$(rt_assignment_cmd)"

    command -v rt_task_state >/dev/null 2>&1 || return 0
    [ -f "$_reader" ] || return 0

    _assigned="$(node "$_reader" --assigned 2>/dev/null)"
    [ -n "$_assigned" ] || return 0

    _state="$(rt_task_state "$_assigned" 2>/dev/null)" || return 0
    [ -n "$_state" ] || return 0

    # The field is read by an explicit comparison: `.open // empty` gives the right side both for
    # a missing field and for `false`, that is, exactly for the state this refusal is written for.
    case "$(printf '%s' "$_state" | jq -r 'if .open == false then "false" else "" end' 2>/dev/null)" in
        false)
            fault "${_what} is not taken: the epic assigned to this copy is closed — the assignment outlived it. Ask the owner for a new one and write it into the table; an epic chosen instead of the closed one is not an order."
            ;;
    esac
}
