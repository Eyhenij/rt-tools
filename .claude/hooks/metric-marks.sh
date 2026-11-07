#!/usr/bin/env bash
# rt-kit v0.34.0 · hooks/metric-marks.sh · 2ac4c00d553b · правится надстройкой, не здесь
# Signs of content and of calls for the package metrics. NOT a guard: it has no `rt-hook:`
# declaration and hooks into no agent event. The refusal record and the push gate source it.
#
# WHY A FILE OF ITS OWN. An observation names a resource and a number, and it leaves the tree. To
# tell an empty refusal from an honest one the tree has to compare what it refused, and that sign
# must not leave. So the tree decides here and writes only the answer into the observation.
#
# WHERE IT LIVES. In `.marks` inside the observations directory: git ignores that directory, and
# the digest reads day files only.
#
# FAIL-OPEN. No directory, no git, no `cksum`: the answer is empty and the caller records nothing.
# A metric is side work, and a guard that fell over on it would stop the work for statistics.

# The marks directory of this tree. An empty string — observations are off.
rt_marks_dir() {
    local dir
    dir="$(rt_observe_dir 2>/dev/null)"
    [ -n "$dir" ] || return 0
    mkdir -p "$dir/.marks" 2>/dev/null || return 0
    printf '%s' "$dir/.marks"
}

# The sign of the working tree: the commit, the uncommitted edits and the untracked files. Without
# the edits a red run fixed in the working copy would read as a repeat of the same content. The
# observations themselves stay out of it: a tree that does not ignore them would change its sign
# with every refusal, and no repeat would ever be seen.
rt_tree_sign() {
    local root="${CLAUDE_PROJECT_DIR:-.}"
    {
        git -C "$root" rev-parse HEAD 2>/dev/null
        git -C "$root" diff HEAD 2>/dev/null
        git -C "$root" ls-files -o --exclude-standard -- . ':(exclude).claude/rt-kit/observations' 2>/dev/null \
            | while IFS= read -r file; do
                printf '%s ' "$file"
                cksum < "$root/$file" 2>/dev/null
            done
    } | cksum 2>/dev/null | cut -d' ' -f1
}

# Is this refusal the same as the previous refusal of this guard in this session: `1` or `0`. The
# refused call and the content are both compared. Empty — there is nothing to compare by.
#
#   rt_refusal_empty <guard> <session> <call>
rt_refusal_empty() {
    local guard="$1" session="$2" call="$3" dir file sign previous=''
    [ -n "$guard" ] && [ -n "$session" ] || return 0
    dir="$(rt_marks_dir)"
    [ -n "$dir" ] || return 0

    sign="$(rt_tree_sign) $(printf '%s' "$call" | cksum 2>/dev/null | cut -d' ' -f1)"
    file="$dir/refusal-$(printf '%s' "$session $guard" | cksum 2>/dev/null | cut -d' ' -f1)"
    [ -f "$file" ] && previous="$(cat "$file" 2>/dev/null)"
    printf '%s' "$sign" > "$file" 2>/dev/null

    if [ "$sign" = "$previous" ]; then printf '1'; else printf '0'; fi
}
