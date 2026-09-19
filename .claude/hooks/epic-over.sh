#!/usr/bin/env bash
# rt-kit v0.29.0 · hooks/epic-over.sh · 4a104cd18ab0 · правится надстройкой, не здесь
# The reading "the epic is over". NOT a guard: it has no `rt-hook:` declaration and hooks into no
# agent event. The guards that judge the end of an epic source it themselves.
#
# Why it lives apart. Three guards ask one and the same question, and each from its own side: one
# refuses taking new work after the end of an epic, and two others refuse the very stop that the end
# of an epic requires — a turn without the next task taken and a turn that says the session waits for
# a word. Written three times, the reading would diverge three ways, and the guards would refuse each
# other's lawful moves.
#
# The state is asked by the command that prints the table for the owner: a reader of its own would
# diverge from the printed table in silence. The call is not cheap — it goes to the hosting — so the
# Stop guards ask it right before a refusal, not on every turn.
#
# ZERO means the epic is over: not one of its tasks is left unfinished. Any other answer — a task in
# work, no epic behind the branch, no way to ask the hosting — is not zero, and the caller works as
# it did before this reading existed.

# The unfinished tasks of the epic as the table prints them. A non-zero code means the epic could
# not be read — no table, no epic behind the branch, no way to ask the hosting — and the caller
# tells that apart from an empty answer, which means the epic is over.
rt_epic_unfinished() {
    command -v jq >/dev/null 2>&1 || return 1
    command -v node >/dev/null 2>&1 || return 1

    local here root checks table left
    # The turn names the directory it goes from, and a Stop guard is called from wherever the host
    # stands: taken from the process, the tree would be a foreign one — or none at all.
    here="."
    if command -v rt_hook_cwd >/dev/null 2>&1; then
        here="$(rt_hook_cwd 2>/dev/null)"
        [ -z "$here" ] && here="."
    fi

    root="$(cd "$here" 2>/dev/null && git rev-parse --show-toplevel 2>/dev/null)"
    [ -z "$root" ] && return 1

    # Where the checks of the package lie is named by the tree: the directory differs from tree to
    # tree, and a name written here would be right in the first one and wrong in the second.
    checks="$(jq -r '.layout.checks // "tools"' "$root/.claude/rt-kit.json" 2>/dev/null)"
    if [ -z "$checks" ] || [ "$checks" = null ]; then
        checks=tools
    fi

    table="$root/$checks/epic-table.mjs"
    [ -f "$table" ] || return 1

    left="$(cd "$root" && node "$table" --unfinished 2>/dev/null)" || return 1
    printf '%s' "$left"
    return 0
}

rt_epic_over() {
    local left
    left="$(rt_epic_unfinished)" || return 1
    [ -n "$left" ] && return 1
    return 0
}

# How many tasks of the epic are left unfinished, or a refusal to answer.
#
# `rt_epic_over` answers one question and folds two different answers into its non-zero code: the
# epic goes on, and the reading did not happen at all — no jq, no node, no epic behind the branch,
# no way to ask the hosting. A tier that REFUSES a turn cannot live on such a code: it would refuse
# every turn in a tree where the reading is unavailable, and no work would ever be handed in there.
#
# So the count is printed to the standard output and the code says only whether the reading
# happened. Zero printed means the epic is over; a positive number means it goes on.
rt_epic_unfinished() {
    command -v jq >/dev/null 2>&1 || return 1
    command -v node >/dev/null 2>&1 || return 1

    local here root checks table left
    here="."
    if command -v rt_hook_cwd >/dev/null 2>&1; then
        here="$(rt_hook_cwd 2>/dev/null)"
        [ -z "$here" ] && here="."
    fi

    root="$(cd "$here" 2>/dev/null && git rev-parse --show-toplevel 2>/dev/null)"
    [ -z "$root" ] && return 1

    checks="$(jq -r '.layout.checks // "tools"' "$root/.claude/rt-kit.json" 2>/dev/null)"
    if [ -z "$checks" ] || [ "$checks" = null ]; then
        checks=tools
    fi

    table="$root/$checks/epic-table.mjs"
    [ -f "$table" ] || return 1

    left="$(cd "$root" && node "$table" --unfinished 2>/dev/null)" || return 1

    printf '%s' "$(printf '%s' "$left" | grep -c '[0-9]')"

    return 0
}
