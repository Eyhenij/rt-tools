#!/usr/bin/env bash
# Signs of content and of calls for the package metrics. NOT a guard: it has no `rt-hook:`
# declaration and hooks into no agent event. The refusal record and the push set source it.
#
# WHY A FILE OF ITS OWN. An observation names a resource and a number, and it leaves the tree. To
# tell an empty refusal from an honest one, and a wasted run from a needed one, the tree has to
# compare what it judged, and that sign must not leave. So the tree decides here and writes only the
# answer into the observation.
#
# WHERE IT LIVES. In `.marks` inside the observations directory: git ignores that directory, and
# the digest reads day files only.
#
# FAIL-OPEN. No directory, no git, no `cksum`: the answer is empty and the caller records nothing.
# A metric is side work, and a guard that fell over on it would stop the work for statistics.

# The record itself: the push set runs in a git hook too, where nothing else has sourced it.
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/observe.sh" 2>/dev/null || true

# How long a mark about a refusal or a run lives. It compares neighbours, and a month covers them.
RT_MARKS_KEEP_DAYS=30

# The marks directory of this tree. An empty string — observations are off.
rt_marks_dir() {
    local dir
    dir="$(rt_observe_dir 2>/dev/null)"
    [ -n "$dir" ] || return 0
    mkdir -p "$dir/.marks" 2>/dev/null || return 0
    printf '%s' "$dir/.marks"
}

# The copy a guard judges: the session may stand in a working copy other than the project root, and
# a sign of the root would call a real edit in that copy no change at all.
rt_sign_root() {
    local cwd
    cwd="$(printf '%s' "${RT_HOOK_INPUT:-}" | jq -r '.cwd // empty' 2>/dev/null)"
    if [ -n "$cwd" ] && [ -d "$cwd" ]; then
        printf '%s' "$cwd"
    else
        printf '%s' "${CLAUDE_PROJECT_DIR:-.}"
    fi
}

# The sign of a working copy: the commit, the uncommitted edits and the untracked files. Without
# the edits a red run fixed in the working copy would read as a repeat of the same content. The
# observations themselves stay out of it: a tree that does not ignore them would change its sign
# with every refusal, and no repeat would ever be seen.
#
#   rt_tree_sign <any directory of the copy>
rt_tree_sign() {
    local top
    top="$(git -C "$1" rev-parse --show-toplevel 2>/dev/null)" || return 0
    {
        git -C "$top" rev-parse HEAD 2>/dev/null
        git -C "$top" diff HEAD 2>/dev/null
        git -C "$top" ls-files -o --exclude-standard -- . ':(exclude).claude/rt-kit/observations' 2>/dev/null \
            | while IFS= read -r file; do
                printf '%s ' "$file"
                cksum < "$top/$file" 2>/dev/null
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

    sign="$(rt_tree_sign "$(rt_sign_root)") $(printf '%s' "$call" | cksum 2>/dev/null | cut -d' ' -f1)"
    file="$dir/refusal-$(printf '%s' "$session $guard" | cksum 2>/dev/null | cut -d' ' -f1)"
    [ -f "$file" ] && previous="$(cat "$file" 2>/dev/null)"
    printf '%s' "$sign" > "$file" 2>/dev/null

    if [ "$sign" = "$previous" ]; then printf '1'; else printf '0'; fi
}

# The kind of a step by the command of the check. The list is closed: a kind leaves the tree, and
# the command itself must not.
rt_run_kind() {
    case "$1" in
        *e2e*) printf 'e2e' ;;
        *visual* | *snapshot*) printf 'shots' ;;
        *'docker build'*) printf 'image' ;;
        *serve:*) printf 'stand' ;;
        *test* | *lint* | *build*) printf 'tests' ;;
        *) printf 'check' ;;
    esac
}

# Old marks go by age. Only these two kinds: a file that counts something once must outlive them.
rt_marks_prune() {
    find "$1" -type f \( -name 'refusal-*' -o -name 'runs-*' \) -mtime "+$RT_MARKS_KEEP_DAYS" -delete 2>/dev/null
    return 0
}

# One run of one check: an observation with the outcome, the seconds and the kind of step. The line
# of the check that was red on this same content last time carries the seconds of that red run: a
# chain of reds counts every link once. The marks of the day hold the content sign, and the
# observation holds only the answer.
#
#   rt_run_note <content sign> <started, epoch seconds> <green|red|skipped> <check command>
rt_run_note() {
    local sign="$1" started="$2" outcome="$3" check="$4" now seconds dir file id last wasted=''
    now="$(date +%s 2>/dev/null)"
    seconds=$((${now:-0} - ${started:-0}))
    [ "$seconds" -ge 0 ] || seconds=0

    dir="$(rt_marks_dir)"
    if [ -n "$dir" ] && [ -n "$sign" ]; then
        rt_marks_prune "$dir"
        file="$dir/runs-$(date -u +%Y-%m-%d 2>/dev/null)"
        id="$(printf '%s' "$check" | cksum 2>/dev/null | cut -d' ' -f1)"
        last="$(grep "^$sign $id " "$file" 2>/dev/null | tail -n 1)"
        case "$last" in *' red '*) wasted="${last##* }" ;; esac
        printf '%s %s %s %s\n' "$sign" "$id" "$outcome" "$seconds" >> "$file" 2>/dev/null
    fi

    command -v rt_note >/dev/null 2>&1 || return 0
    rt_note run "res=$outcome" "kind=$(rt_run_kind "$check")" "secs=$seconds" "wasted=$wasted"
    return 0
}
