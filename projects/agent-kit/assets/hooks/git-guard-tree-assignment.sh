#!/usr/bin/env bash
# The assignment of an epic to this working copy. NOT a guard: it has no `rt-hook:` declaration and
# hooks into no agent event. The delivery guard sources it, the same way it sources the conditions
# about the epic of a task.
#
# Why at all. A machine holds several working copies of one tree, and the work queue answers only
# what is open: it holds no owner of a card, and by topic one epic cannot be told from another. A
# session that took the freshest epic of the list did work nobody had ordered — the whole day of it,
# up to a written agreement, and it was the owner who stopped that, not a check.
#
# WHAT IS HERE. One call, made from the delivery guard, where `fault` is already declared. The
# answer is computed by the tree's command: the table of assignments and the name of this copy are
# read in one place, by the audit and by the guard alike.

# The refusal about the assignment, or silence. Arguments: the number of the epic of the work being
# taken (empty where the work has no epic) and what exactly is being taken, for the refusal text.
#
# The tree that declares no assignments answers with silence: it has nothing to divide, and a
# requirement invented for it would refuse every branch of a tree with one working copy.
rt_assignment_fault() {
    _epic="$1"
    _what="$2"
    _said=''

    [ -f "tools/tree-assignment.mjs" ] || return 0
    command -v node >/dev/null 2>&1 || return 0

    _said="$(node tools/tree-assignment.mjs --fault "$_epic" 2>/dev/null)"
    [ -n "$_said" ] || return 0

    fault "${_what} is not taken: ${_said}."
}
