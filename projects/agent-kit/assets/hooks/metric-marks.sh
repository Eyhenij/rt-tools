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

# The marks directory of this tree. An empty string — observations are off. The directory ignores
# itself: a fresh tree has no line about it, and `git add -A` would carry the signs into its history.
rt_marks_dir() {
    local dir
    dir="$(rt_observe_dir 2>/dev/null)"
    [ -n "$dir" ] || return 0
    mkdir -p "$dir/.marks" 2>/dev/null || return 0
    [ -f "$dir/.gitignore" ] || printf '*\n' > "$dir/.gitignore" 2>/dev/null
    printf '%s' "$dir/.marks"
}

# The marks one tree shares across its copies. A request is handed over from one copy and read by
# another, and a sign left in the first one would put the request outside the main metric for good.
rt_shared_marks_dir() {
    local CLAUDE_PROJECT_DIR="${CLAUDE_PROJECT_DIR:-}" main
    main="$(git -C "$(rt_sign_root)" rev-parse --path-format=absolute --git-common-dir 2>/dev/null)"
    [ -n "$main" ] && CLAUDE_PROJECT_DIR="$(dirname "$main")"
    rt_marks_dir
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

# The mark of a branch, by name of kind. The name of a branch is the tree's own, so it stays out of
# the file name too.
rt_branch_mark() {
    local dir
    dir="$(rt_shared_marks_dir)"
    [ -n "$dir" ] && [ -n "$2" ] && printf '%s/%s-%s' "$dir" "$1" "$(printf '%s' "$2" | cksum 2>/dev/null | cut -d' ' -f1)"
}

# The sign of a handover: the commit and the tree of the head at the moment a request is ready and
# has a reviewer. The first one stays: the work is judged against what was handed over first, and a
# later hand-over of the same branch would wash the change out of the count. The copy on the
# hosting goes first, because that is what the reviewer reads.
#
#   rt_handover_mark <branch>
rt_handover_mark() {
    local branch="$1" file root ref commit tree
    file="$(rt_branch_mark handover "$branch")"
    [ -n "$file" ] && [ ! -f "$file" ] || return 0
    root="$(rt_sign_root)"
    for ref in "refs/remotes/origin/$branch" "refs/heads/$branch"; do
        commit="$(git -C "$root" rev-parse --verify --quiet "$ref^{commit}" 2>/dev/null)"
        tree="$(git -C "$root" rev-parse --verify --quiet "$ref^{tree}" 2>/dev/null)"
        if [ -n "$commit" ] && [ -n "$tree" ]; then
            printf '%s %s\n' "$commit" "$tree" > "$file" 2>/dev/null
            printf '%s\n' "$branch" > "$(dirname "$file")/handover-last" 2>/dev/null
            return 0
        fi
    done
    return 0
}

# Was this branch handed over. The default of `rt_pull_outcomes` asks the hosting only about those: a
# request without a sign counts apart, and asking about each of a hundred took two minutes.
rt_handover_known() {
    local file
    file="$(rt_branch_mark handover "$1")"
    [ -n "$file" ] && [ -f "$file" ]
}

# The file of a handover about to happen. A guard passes the call before it runs, and another guard
# may still refuse it, so the guard only announces the branch, and the hook after the call keeps it.
rt_handover_pending_file() {
    local dir
    dir="$(rt_marks_dir)"
    [ -n "$dir" ] && printf '%s/pending-%s' "$dir" "$(printf '%s %s' "$1" "$2" | cksum 2>/dev/null | cut -d' ' -f1)"
}

# One owner correction on the current branch: a line of the counter, `before` or `after` the
# handover, with its day. The message itself never gets here. First-pass acceptance reads the days
# of the `after` lines, because a correction counts for three days after the merge. The
# executor takes the next task right after a handover, so the last branch handed over gets the line
# too: by the current branch alone a correction of the handed work would count against nothing.
#
#   rt_correction_mark <session>
rt_correction_mark() {
    local session="$1" branch file handover last='' day
    day="$(date -u +%Y-%m-%d 2>/dev/null)"
    branch="$(git -C "$(rt_sign_root)" symbolic-ref --quiet --short HEAD 2>/dev/null)"
    file="$(rt_branch_mark corrections "$branch")"
    handover="$(rt_branch_mark handover "$branch")"
    if [ -n "$file" ]; then
        if [ -f "$handover" ]; then printf 'after %s\n' "$day"; else printf 'before %s\n' "$day"; fi >> "$file" 2>/dev/null
    fi
    handover="$(rt_shared_marks_dir)/handover-last"
    [ -f "$handover" ] && last="$(cat "$handover" 2>/dev/null)"
    if [ -n "$last" ] && [ "$last" != "$branch" ]; then
        printf 'after %s\n' "$day" >> "$(rt_branch_mark corrections "$last")" 2>/dev/null
    fi
    command -v rt_note >/dev/null 2>&1 || return 0
    rt_note owner-correction "sid=$session"
    return 0
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

# Old marks go by age. Only these kinds: a file that counts something once must outlive them.
rt_marks_prune() {
    find "$1" -type f \( -name 'refusal-*' -o -name 'runs-*' -o -name 'exam-*' -o -name 'pending-*' \) \
        -mtime "+$RT_MARKS_KEEP_DAYS" -delete 2>/dev/null
    return 0
}

# The verdict of an exam, once per session and verdict: the guard reads the whole session on every
# call it judges, and each of those calls would otherwise read as a new exam.
#
#   rt_exam_note <passed|failed> <session>
rt_exam_note() {
    local verdict="$1" session="$2" dir mark
    case "$verdict" in passed | failed) ;; *) return 0 ;; esac
    [ -n "$session" ] || return 0
    dir="$(rt_marks_dir)"
    [ -n "$dir" ] || return 0
    mark="$dir/exam-$(printf '%s' "$session $verdict" | cksum 2>/dev/null | cut -d' ' -f1)"
    [ ! -f "$mark" ] || return 0
    : > "$mark" 2>/dev/null
    command -v rt_note >/dev/null 2>&1 || return 0
    rt_note exam-verdict "res=$verdict" "sid=$session"
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
    # Every copy writes into the main one: the heavy steps run from a second copy, and their minutes
    # are the ones the report exists for. One tree has one report, whichever copy ran the check.
    local CLAUDE_PROJECT_DIR="${CLAUDE_PROJECT_DIR:-}" main
    main="$(git -C "$(rt_sign_root)" rev-parse --path-format=absolute --git-common-dir 2>/dev/null)"
    [ -n "$main" ] && CLAUDE_PROJECT_DIR="$(dirname "$main")"
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
