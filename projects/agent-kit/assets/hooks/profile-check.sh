#!/usr/bin/env bash
# A missing profile function, said out loud. NOT a guard: it has no `rt-hook:` declaration and hooks
# into no agent event. The guards source it themselves — the same way the gate sources the map and
# the guards source the observation record.
#
# Why it exists. Nine hooks of the package call functions of the tree profile, and in five of them
# the check stands before any behaviour: no function — exit with zero, having done nothing. Such a
# guard is worse than a missing one: it lies in the tree, stands in the settings, shows in the hook
# list and reads as working. Its silence then means three different things at once — "nothing to
# check", "nothing to check with" and "all is well" — and there is no way to tell them apart.
#
# WHAT IS SAID. The function name and the file where it is defined. Once per session: on every call
# the same line would repeat dozens of times per session and stop being read.
#
# THE ACTION PASSES ANYWAY. The hook reports its own incompleteness and does not judge the edit:
# there is nothing to judge it with, and it has no right to refuse work because of an unconfigured
# tree.

# Where the "already said" mark is put. The temporary files directory, not the tree: the mark lives
# one session and does not go into history.
rt_needs_mark_dir() {
    printf '%s' "${TMPDIR:-/tmp}"
}

# Is the profile function there. Success — it is, and the hook works on. Failure — it is not, and
# this has been said.
#
#   rt_needs rt_is_app_code task-flow-guard "$sid"
#
# The third parameter is the session id, if the hook knows it. If not, the mark is put for the day:
# without the id, "once per session" would turn into "once in the machine's lifetime".
rt_needs() {
    command -v "$1" >/dev/null 2>&1 && return 0

    rt_needs_key="${3:-$(date +%Y%m%d 2>/dev/null || printf 'nosession')}"
    rt_needs_mark="$(rt_needs_mark_dir)/rt-kit-needs-$1-$rt_needs_key"
    if [ ! -f "$rt_needs_mark" ]; then
        printf '%s: no function %s — it is defined in .claude/rt-kit/project.sh, and the default is carried by the package in .claude/rt-kit/defaults/project.sh\n' \
            "${2:-hook}" "$1" >&2
        printf 'the check does not work, the action is let through\n' >&2
        : >"$rt_needs_mark" 2>/dev/null || true
    fi

    return 1
}
