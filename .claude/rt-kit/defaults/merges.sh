#!/usr/bin/env bash
# rt-kit v0.42.0 · defaults/merges.sh · c758aa2b24ff · правится надстройкой, не здесь
# Reading the merges and the packages of the tree: what the epic windows and the release are judged by.
#
# The package default, part of the tree profile — loaded from `project.sh`, next to which it lies. A
# separate file because together they outgrow the length limit, and these three functions have one
# reader: `hooks/pull-merges.sh`.

# The requests for the epic windows and the release, one JSON object per line: the requests merged
# since a day and the open ones — an open request tells a task branch from an epic branch before the
# epic merges. A request into the main branch carries its files: the packages of an epic are told by
# them. The files come from the local history of the merge commit: the hosting refuses the file list
# of a large request. The shape is named in `hooks/pull-merges.sh`; a failing exit code is a broken
# read.
rt_merge_facts_default() {
    command -v gh >/dev/null 2>&1 || return 3
    command -v jq >/dev/null 2>&1 || return 3
    fields='number,state,headRefName,baseRefName,title,mergedAt,mergeCommit'
    merged="$(gh pr list --state merged --limit 1000 --search "merged:>=$1" --json "$fields" 2>/dev/null)" || return 4
    open="$(gh pr list --state open --limit 200 --json "$fields" 2>/dev/null)" || return 4
    git fetch -q origin main 2>/dev/null
    printf '%s\n%s' "$merged" "$open" | jq -c '.[]' | while IFS= read -r pull; do
        commit="$(printf '%s' "$pull" | jq -r 'if .baseRefName == "main" then .mergeCommit.oid // empty else empty end')"
        if [ -n "$commit" ]; then
            files="$(git diff --name-only "$commit^1" "$commit" 2>/dev/null | jq -Rcs 'split("\n") | map(select(. != ""))')" || return 4
            printf '%s' "$pull" | jq -c --argjson files "$files" 'del(.mergeCommit) + {files: $files}'
        else
            printf '%s' "$pull" | jq -c 'del(.mergeCommit)'
        fi
    done
}

# The directories of the packages the tree may publish: a package manifest not marked private.
# Whether it is published is asked of the registry, not here.
rt_package_dirs_default() {
    for manifest in projects/*/package.json packages/*/package.json; do
        [ -f "$manifest" ] || continue
        [ "$(jq -r '.private // false' "$manifest" 2>/dev/null)" = true ] && continue
        dirname "$manifest"
    done
}

# The files under a package directory that are no part of the package: a code graph lies in every
# package directory, and an epic that only rebuilt the graphs changed no package.
rt_package_ignored_default() { printf '%s' '(^|/)graphify-out/'; }

rt_merge_facts() { rt_merge_facts_default "$@"; }
rt_package_dirs() { rt_package_dirs_default "$@"; }
rt_package_ignored() { rt_package_ignored_default "$@"; }
