#!/usr/bin/env bash
# rt-kit v0.26.0 · hooks/roles.sh · d843db6f105c · правится надстройкой, не здесь
# The state of a rules-layer role. NOT a guard: it has no `rt-hook:` declaration and hooks into no
# agent event. The guards that stand at roles source it — the same way the gate sources the map and
# the guards source the tree profile.
#
# Why it exists. A role with a guard at it is not called at the executor's discretion: the guard
# holds the work until the role has had its say. There was nothing to switch it off with — dropping
# the role file in the settings removed the role and left the guard, and a tree that the role gets
# in the way of at this minute was left to cut the guard out of the settings by hand. Now the tree
# names the disabled roles in one list, and the guard at such a role leaves silently.
#
# What is disabled is the mandatory call, not the role itself: the role file stays laid out, and it
# can be called by hand at any minute.
#
# FAIL-OPEN the other way round: everything that was missing reads as "the role is on". No `jq`, no
# settings, settings that do not parse — the guard works as it did. A broken read that muted a role
# would switch the rules layer off silently, and there would be nothing to notice it with.

# Is the role disabled. Success — disabled.
#
#   rt_role_off strict-teacher && exit 0
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

rt_role_off() {
    local role="$1" config
    [ -n "$role" ] || return 1
    command -v jq >/dev/null 2>&1 || return 1
    config="${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit.json"
    [ -f "$config" ] || return 1
    [ "$(jq -r --arg role "$role" '
        if ((.rolesOff // []) | type) == "array" and (((.rolesOff // []) | index($role)) != null)
        then "off" else "on" end
    ' "$config" 2>/dev/null)" = "off" ]
}
