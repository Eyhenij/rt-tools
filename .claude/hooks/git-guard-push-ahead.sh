#!/usr/bin/env bash
# rt-kit v0.39.1 · hooks/git-guard-push-ahead.sh · f0ce9d5ebf7a · правится надстройкой, не здесь
# The push set run ahead of the push: every check of `rt_push_checks <base>`, a green mark for each
# that passed. The push guard then reads the marks instead of running the steps again.
#
# NOT a guard: it has no `rt-hook:` declaration and is called by hand or by the agent —
# `bash .claude/hooks/git-guard-push-ahead.sh`, in the background. The guard cannot run a step
# longer than its hook limit, and a guard cut by the limit lets the call through with no verdict;
# here no limit cuts the run.
#
# The base, the profile and the marks are the guard's own — the helper `git-guard-push-marks.sh`
# and the same profile files — so a mark written here answers exactly the line the guard asks
# about. A check already green on this tree and base is not run again.
#
# Before the first step it asks whether a PR of this branch would open, by `git-guard-push-ready.sh`,
# and starts nothing while a condition is unmet. A branch not meant for a PR yet goes with
# `--no-pr '<reason>'`: the reason is printed and the run leaves a line in the observations.
#
# Exit codes: 0 — the set is green; 1…100 — the number of red checks; 3 is also «the run did not
# start» (no profile, no repository, edits outside the index, a PR that would not open), and the last
# `push ahead:` line tells the two apart; 101 — the copy changed while the set ran, and the run vouches for nothing; 129,
# 130, 143 — the run was stopped by HUP, INT or TERM. Not 2: to a hook that code means "refuse", and this
# command refuses nothing.
#
# The run is stopped by `kill -TERM <pid>`, the pid is in its first line: the step in flight and the
# processes it holds end with it. A process that left both its parent and its group is not found, and
# KILL sent to the run leaves them all: the run cannot see it.
#
# Requires: hooks/git-guard-push-marks.sh, hooks/facts.sh, hooks/git-guard-push-ready.sh
not_started=3
not_judged=101

no_pr=''
if [ "$#" -gt 0 ]; then
    [ "$#" -eq 2 ] && [ "$1" = --no-pr ] && no_pr="$(printf '%s' "$2" | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//')"
    # One line of three characters with no angle bracket: the sample of the usage is no reason.
    case "$no_pr" in *'<'* | *$'\n'*) no_pr='' ;; ???*) ;; *) no_pr='' ;; esac
    [ -n "$no_pr" ] || {
        printf "push ahead: usage: git-guard-push-ahead.sh [--no-pr '<reason>'] — the reason of at least three characters\n" >&2
        exit "$not_started"
    }
fi

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

root="$(git rev-parse --show-toplevel 2>/dev/null)" || {
    printf 'push ahead: not a repository\n' >&2
    exit "$not_started"
}
cd "$root" || exit "$not_started"

for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "$root/.claude/rt-kit/defaults/project.sh" "$root/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done
# shellcheck disable=SC1090
. "$rt_hooks_dir/git-guard-push-marks.sh" 2>/dev/null || {
    printf 'push ahead: the helper git-guard-push-marks.sh is not laid out\n' >&2
    exit "$not_started"
}
command -v rt_push_checks >/dev/null 2>&1 || {
    printf 'push ahead: the tree profile declares no rt_push_checks\n' >&2
    exit "$not_started"
}
command -v rt_push_check_heavy >/dev/null 2>&1 || rt_push_check_heavy() { return 1; }
command -v rt_push_over_budget >/dev/null 2>&1 || rt_push_over_budget() { return 0; }
command -v rt_push_set_over_budget >/dev/null 2>&1 || rt_push_set_over_budget() { return 0; }
command -v rt_push_mark_drop >/dev/null 2>&1 || rt_push_mark_drop() { return 0; }
command -v rt_push_select >/dev/null 2>&1 || rt_push_select() { cat; }
command -v rt_push_subjects >/dev/null 2>&1 || rt_push_subjects() { cat >/dev/null; }
command -v rt_push_subject_of >/dev/null 2>&1 || rt_push_subject_of() { printf unknown; }
command -v rt_push_note_not_run >/dev/null 2>&1 || rt_push_note_not_run() { return 0; }
# The line of a run for the metrics. No file — the checks run and record nothing.
# shellcheck disable=SC1091
[ -f "$rt_hooks_dir/metric-marks.sh" ] && . "$rt_hooks_dir/metric-marks.sh" 2>/dev/null
command -v rt_run_note >/dev/null 2>&1 || rt_run_note() { return 0; }
command -v rt_tree_sign >/dev/null 2>&1 || rt_tree_sign() { return 0; }

# The steps and their choice run on the node the tree pins, as at the push: the shell that starts
# the run may carry another one. A pinned node that is not installed, with another node in PATH,
# starts no step.
# shellcheck disable=SC1091
command -v rt_node_pinned_dir >/dev/null 2>&1 || { [ -f "$rt_hooks_dir/facts.sh" ] && . "$rt_hooks_dir/facts.sh" 2>/dev/null; }
if command -v rt_node_pinned_dir >/dev/null 2>&1; then
    node_line="$(rt_node_pin_mismatch "$root")"
    if [ -n "$node_line" ]; then
        printf 'push ahead: %s\n' "$node_line" >&2
        exit "$not_started"
    fi
    node_dir="$(rt_node_pinned_dir "$root")"
    [ -n "$node_dir" ] && PATH="$node_dir:$PATH"
fi

# A mark vouches for the tree of the head, and the checks run over the working copy: with edits
# outside the index the run would write marks for content that does not leave.
rt_push_mark_clean || {
    printf 'push ahead: the working copy holds edits outside the index — commit first, the marks are written only for a clean copy\n' >&2
    exit "$not_started"
}

base="$(rt_push_base "${RT_MAIN_BRANCH:-main}")"
base_name="$base"
skip_code="${RT_SKIP_CODE:-7}"
# The steps run against a ref pinned at the commit of the base, and the push takes that ref while the
# record fits its head: a branch merged, removed, moved or put next to this one during the set
# changes nothing for the push.
command -v rt_push_base_pin >/dev/null 2>&1 && base="$(rt_push_base_pin "$base")"
command -v rt_push_base_label >/dev/null 2>&1 || rt_push_base_label() { printf '%s' "${1:-none}"; }

if command -v rt_push_adds_nothing >/dev/null 2>&1 && rt_push_adds_nothing "$base"; then
    printf 'push ahead: the head adds no commit to %s — there is nothing to run, the push passes\n' "$(rt_push_base_label "$base")"
    exit 0
fi

head_tree="$(git rev-parse --verify --quiet 'HEAD^{tree}')"
sign="$(rt_tree_sign .)"
# Whether the change touched the subject of each step, for the run lines; a step the selection
# drops leaves a line of its own.
subjects="$(rt_push_checks "$base" | rt_push_subjects "$base")"

red=""
marked=""
asked=""
changed_at=""
changed=""
step_out="$(mktemp)" || {
    printf 'push ahead: no temporary file for the output of a step\n' >&2
    exit "$not_started"
}
step_pid=""
starting=""
# The seconds a stopped step gets after INT, and twice as many after TERM.
stop_wait="${RT_PUSH_STOP_WAIT:-10}"
trap 'rm -f "$step_out"' EXIT

# The processes of `$*` and all that hang on them: by the parent and by the group. A step puts its
# servers and its scenarios into groups of their own, and a child whose parent is gone is told by the
# group alone. The group of the run itself is never one of them. No table of processes — no list and a
# code of its own: an empty list says that nobody is left.
rt_ahead_tree() {
    local table
    table="$(ps -A -o pid=,ppid=,pgid=,stat= 2>/dev/null)" && [ -n "$table" ] || return 2
    printf '%s\n' "$table" | awk -v roots="$*" -v self="$$" '
        $4 !~ /^Z/ { n++; pid[n] = $1; ppid[n] = $2; pgid[n] = $3 }
        $1 == self { own = $3 }
        END {
            m = split(roots, root, " ")
            for (i = 1; i <= m; i++) held[root[i]] = 1
            do {
                grew = 0
                for (i = 1; i <= n; i++) {
                    if (pid[i] == self) continue
                    if (!listed[i] && (held[pid[i]] || held[ppid[i]] || group[pgid[i]])) {
                        listed[i] = held[pid[i]] = grew = 1
                        if (pgid[i] != own) group[pgid[i]] = 1
                    }
                }
            } while (grew)
            for (i = 1; i <= n; i++) if (listed[i]) print pid[i]
        }'
}

# Whether the step or something it holds still runs. A list that could not be taken, once or ever,
# leaves the former one: it and the group of the step answer.
rt_ahead_holds() {
    local now
    # shellcheck disable=SC2086
    if now="$(rt_ahead_tree ${left:-$step_pid})"; then
        left="$now"
        [ -n "$left" ]
        return
    fi
    # shellcheck disable=SC2086
    { [ -n "$left" ] && kill -0 $left 2>/dev/null; } || kill -0 -- "-$step_pid" 2>/dev/null
}

# Waits up to `$1` seconds for the step and all it holds to end.
rt_ahead_wait_left() {
    local until=$(($(date +%s) + $1))
    while rt_ahead_holds; do
        [ "$(date +%s)" -ge "$until" ] && return 1
        sleep 0.2
    done
    return 0
}

# Ends the step and everything it holds. INT first: a runner of end-to-end suites puts its stand
# down by INT alone, and by TERM leaves it on the port. Then TERM to the step: a builder takes its
# scenarios with it within seconds. Then TERM to what is left: a process whose parent is gone hears
# nothing sent to the group of the step. KILL only after that: it lets nobody clean up after itself.
rt_ahead_stop() {
    local left
    trap '' HUP INT TERM
    # A signal between the start of a step and the record of its number.
    [ -n "$starting" ] && [ "${!:-}" != "$starting" ] && step_pid="$!"
    if [ -n "$step_pid" ]; then
        left="$(rt_ahead_tree "$step_pid")"
        kill -INT -- "-$step_pid" 2>/dev/null
        if ! rt_ahead_wait_left "$stop_wait"; then
            kill -TERM -- "-$step_pid" 2>/dev/null && rt_ahead_wait_left "$stop_wait" && left=""
            # shellcheck disable=SC2086
            [ -n "$left" ] && kill -TERM $left 2>/dev/null
            if ! rt_ahead_wait_left "$stop_wait"; then
                # shellcheck disable=SC2086
                [ -n "$left" ] && kill -KILL $left 2>/dev/null
                kill -KILL -- "-$step_pid" 2>/dev/null
            fi
        fi
        wait "$step_pid" 2>/dev/null
        printf '\n~ stopped, no mark: %s\n' "$check"
    fi
    printf '\npush ahead: stopped by %s — the steps before it keep their marks\n' "$1"
    exit "$2"
}
trap 'rt_ahead_stop HUP 129' HUP
trap 'rt_ahead_stop INT 130' INT
trap 'rt_ahead_stop TERM 143' TERM

printf 'push ahead: base %s, tree %s, pid %s\n' "$(rt_push_base_label "$base")" "$(git rev-parse --short 'HEAD^{tree}')" "$$"

# What the opening of a PR would refuse is asked before the first step: the fix of it changes the
# tree, and the set would run again. No helper — nothing is asked, as before. The question is asked in
# a group of its own, as a step: a silent host is waited for, and a stop ends it.
# shellcheck disable=SC1090
. "$rt_hooks_dir/git-guard-push-ready.sh" 2>/dev/null || true
# shellcheck disable=SC1091
[ -f "$rt_hooks_dir/observe.sh" ] && . "$rt_hooks_dir/observe.sh" 2>/dev/null
command -v rt_note >/dev/null 2>&1 || rt_note() { return 0; }
if [ -n "$no_pr" ]; then
    rt_note push-ready res=skipped
    printf 'push ahead: the PR is not asked about — %s\n' "$no_pr"
elif command -v rt_push_ready_unmet >/dev/null 2>&1; then
    check='whether a PR of this branch would open'
    starting="${!:-none}"
    set -m
    rt_push_ready_unmet "$base_name" </dev/null >"$step_out" &
    step_pid="$!"
    set +m
    starting=""
    wait "$step_pid"
    step_pid=""
    if [ -s "$step_out" ]; then
        rt_note push-ready res=refused
        sed 's/^/— /' "$step_out"
        printf "push ahead: not ready for a PR — no step started; fix the lines above and run the set again, or pass --no-pr '<reason>' for a branch that is not going into a PR yet\n"
        exit "$not_started"
    fi
fi
rt_push_note_not_run "$sign" "$base" "$subjects"

set_started="$(date +%s)"
while IFS= read -r check; do
    [ -z "$check" ] && continue
    if rt_push_mark_has "$check" "$base"; then
        printf '= green already: %s\n' "$check"
        asked="${asked}${check}
"
        continue
    fi
    # After a red check a heavy one is not started: the push is refused anyway.
    if [ -n "$red" ] && rt_push_check_heavy "$check"; then
        printf '· held after red: %s\n' "$check"
        continue
    fi
    key_before="$(rt_push_mark_key "$check" "$base")"
    started="$(date +%s)"
    # A group of its own, so that a stop reaches the step whole; the shell waits by `wait`, and a
    # signal runs its trap at once, not after the step. The output goes through a pipe, so that a
    # process the step left in the background is waited for; its reader outlives the signals of a
    # stop, or a step cleaning up would end by a broken pipe.
    starting="${!:-none}"
    set -m
    (
        set -o pipefail
        (
            set +o pipefail
            # A step of several commands does not go on to the next one after a stop.
            trap 'exit 130' HUP INT TERM
            eval "$check"
        ) </dev/null 2>&1 | (
            trap '' HUP INT TERM
            cat >"$step_out"
        )
    ) &
    step_pid=$!
    starting=""
    set +m
    wait "$step_pid" 2>/dev/null
    status=$?
    step_pid=""
    out="$(cat "$step_out")"
    took=$(($(date +%s) - started))
    over="$(rt_push_over_budget "$check" "$took")"
    if [ "$status" -eq 0 ] && [ -n "$over" ]; then
        status=1
        out="$over"
    fi
    if [ "$status" -eq 0 ]; then
        rt_run_note "$sign" "$started" green "$check" "$base" "$(rt_push_subject_of "$subjects" "$check")"
        rt_push_mark_put "$check" "$base" "$key_before"
        marked="${marked}${marked:+
}${check}"
        asked="${asked}${check}
"
        printf '+ green in %ss: %s\n' "$took" "$check"
    elif [ "$status" -eq "$skip_code" ]; then
        rt_run_note "$sign" "$started" skipped "$check" "$base" "$(rt_push_subject_of "$subjects" "$check")"
        printf '~ nothing to look at: %s\n' "$check"
    else
        rt_run_note "$sign" "$started" red "$check" "$base" "$(rt_push_subject_of "$subjects" "$check")"
        red="${red}${red:+
}${check}"
        # The line keeps a tail: the failed suite of a long step stands above it, and a rerun to
        # find it ran in the session's shell, under another locale, and came out green. The file of
        # the full output stays for a day.
        find "${TMPDIR:-/tmp}/" -maxdepth 1 -name 'push-ahead-red.*' -mtime +0 -delete 2>/dev/null
        full="$(mktemp "${TMPDIR:-/tmp}/push-ahead-red.XXXXXX" 2>/dev/null)" && printf '%s\n' "$out" >"$full"
        printf '✗ red in %ss under LC_ALL=%s: %s\n%s\n' "$took" "${LC_ALL:-not set}" "$check" "$(printf '%s' "$out" | tail -n 25)"
        [ -n "$full" ] && printf '  the full output: %s\n' "$full"
    fi
    # The rest would run over content no commit holds and leave no mark: an edit left in the copy ends
    # the run. One put back before the step ends is not seen here.
    if ! rt_push_mark_clean; then
        changed_at="$check"
        changed="$(rt_push_mark_dirt | head -n 10)"
        break
    fi
done <<EOF
$(rt_push_checks "$base" | rt_push_select "$base")
EOF

# Every green step of the run holds its mark on the head as it stands now, or the run did not judge
# what the push sends: a commit made while a step ran changes its key and the keys of the steps before.
unmarked=""
if [ -z "$changed_at" ]; then
    while IFS= read -r check; do
        [ -z "$check" ] && continue
        rt_push_mark_has "$check" "$base" || unmarked="${unmarked}${check}
"
    done <<EOF
$asked
EOF
fi

set_took=$(($(date +%s) - set_started))
set_over="$(rt_push_set_over_budget "$set_took")"
if [ -n "$set_over" ]; then
    printf '✗ the whole set in %ss: %s\n' "$set_took" "$set_over"
    printf '%s\n' "$marked" | while IFS= read -r check; do
        [ -n "$check" ] && rt_push_mark_drop "$check" "$base"
    done
    red="${red}${red:+
}the whole set: ${set_took}s"
fi

if [ -n "$changed_at" ]; then
    printf '\n✗ the copy changed while the set ran, seen after: %s\n%s\n' "$changed_at" "$(printf '%s\n' "$changed" | sed 's/^/  /')"
elif [ -n "$unmarked" ]; then
    printf '\n✗ no mark on the head of the copy for:\n%s\n' "$(printf '%s' "$unmarked" | sed 's/^/  /')"
fi

if [ -n "$red" ]; then
    # A red run refuses nothing: it reports. The code is the number of red checks, at most 100, and
    # the push guard refuses the push by the marks this run did not write.
    printf '\npush ahead: red —\n%s\n' "$red"
    red_count="$(printf '%s\n' "$red" | grep -c .)"
    [ "$red_count" -gt 100 ] && red_count=100
    exit "$red_count"
fi
if [ -n "$changed_at$unmarked" ]; then
    why='marks of green steps are missing: another run took them, the base moved, or they cannot be written'
    [ "$head_tree" = "$(git rev-parse --verify --quiet 'HEAD^{tree}')" ] || why='the head moved under it'
    [ -n "$changed_at" ] && why='the copy changed under it'
    printf '\npush ahead: not judged — %s; run the set again\n' "$why"
    exit "$not_judged"
fi
printf '\npush ahead: the set is green, the push passes from the marks\n'
exit 0
