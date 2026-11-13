#!/usr/bin/env bash
# Which sets over the tree's checks a change reaches. Reads the changed paths, one per line, from
# the repository root. Prints `all`, the set files to run, or nothing when no set reads the change.
#
# Narrowed only where the change is texts and the agent's harness: a set reads such a file by
# naming it, so a set that names no changed file has nothing to judge. A change of a check, of its
# data or of anything a check reads from the tree runs every set: the sets run the checks over the
# live tree, and the file a check reads is not named in the set. The harness of the sets runs all.
cd "$(dirname "${BASH_SOURCE[0]}")" || exit 0

tools_select_sets() {
    local changed f base
    changed="$(cat)"
    [ -n "$changed" ] || return 0
    if printf '%s\n' "$changed" | grep -qvE '^(docs/|\.claude/|projects/agent-kit/)|\.md$'; then
        echo all
        return 0
    fi
    printf '%s\n' "$changed" | grep -qE '^tools/tests/' && {
        echo all
        return 0
    }
    for f in ./*.test.sh; do
        while IFS= read -r path; do
            [ -n "$path" ] || continue
            base="${path##*/}"
            if grep -qF -- "$path" "$f" || grep -qF -- "$base" "$f"; then
                printf '%s\n' "${f#./}"
                break
            fi
        done <<EOF
$changed
EOF
    done
}

tools_select_sets
