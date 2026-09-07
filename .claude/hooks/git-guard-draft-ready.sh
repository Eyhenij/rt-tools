#!/usr/bin/env bash
# rt-hook: Stop
# The draft-lifting guard: a turn does not end while ready work stands as a draft. Stop.
#
# Why exactly so. Work ends not with the last commit but with the lifted draft: before that the
# merge button is locked for the owner by the host itself, and a green PR page allows them nothing.
# Between "everything is done" and "it can be merged" there is exactly one call, and it was held by
# the executor's memory — until the memory lost: the run went green, the executor read that,
# answered in one word and stopped. The analysis is `docs/postmortems/handled/`, the record
# `2026-08-16-green-run-draft-left.md`.
#
# It is caught at the end of a turn rather than at the reading of the run. The state of a run is
# asked in a dozen ways, and there is nothing to recognise that question by among the other
# commands; the end of a turn is the only point where it is visible that the executor is about to
# stop.
#
# THREE CONDITIONS, AND ALL THREE ARE MANDATORY:
#
#   the current branch's PR is open and a draft — otherwise there is nothing to refuse;
#   the run AT THE PR's HEAD ended in success  — not the branch's last run: the run of an
#                                                intermediate commit says nothing about readiness;
#   the branch does NOT carry its task folder  — a folder in place means the work is still going,
#                                                and a draft with it is lawful. A folder taken
#                                                apart is the sign that one call is left.
#
# The third condition is what separates ready work from work in progress. Without it the guard
# would kick in the middle of the work on every green run, and it would be switched off on the
# first day.
#
# THERE ARE TWO TIERS, AND THE SECOND IS ABOUT FOREIGN BRANCHES.
#
# The first tier judges the current branch's request and knows everything about it: the progress,
# the folder, whether the stages are closed. It was the whole guard — and for exactly that reason
# it did not catch the cheapest way to abandon the work: to move into a neighbouring branch. The
# request did not go anywhere, the run on it arrived, the draft stayed, and from that minute the
# guard was judging another branch and stayed silent. In one session four requests in a row drifted
# from the main branch that way, and the owner noticed it rather than the guard. The analysis is
# the record «2026-08-25-run-left-unwatched» in the intake.
#
# The second tier asks the host for all the open drafts of the machine account and judges each by
# two signs: the run at the head ended in success and the branch does not carry its task folder. It
# does not read a foreign branch's progress — a folder in place means the work there is still
# going, and such a draft is lawful. The machine account's name is taken from the tree's profile; a
# tree that did not name it gets no second tier at all.
#
# The host's answer is put into a cache for a minute: the guard fires at every end of a turn, and a
# network call on each of them is paid for with the owner's time.
#
# A REFUSAL IN FAVOUR OF THE WORK: not a repository, the main branch, no `jq`, no host helper, no
# network, no PR, a repeated approach — the turn is ALLOWED (exit 0). A broken guard has no right
# to jam the conversation.

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0

command -v jq >/dev/null 2>&1 || exit 0

# A repeated approach on the same turn is not judged: the guard said its word once and lets go.
active="$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)"
[ "$active" = "true" ] && exit 0

root="${CLAUDE_PROJECT_DIR:-.}"
cd "$root" 2>/dev/null || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

branch="$(git branch --show-current 2>/dev/null)"
[ -z "$branch" ] && exit 0

# The host helper. The name `gh` on the owner's machine is intercepted by a foreign alias, so first
# the real binary is looked for and only then what turned up in the path.
gh_bin="${RT_GH_BIN:-}"
if [ -z "$gh_bin" ]; then
    for candidate in /opt/homebrew/bin/gh /usr/local/bin/gh; do
        [ -x "$candidate" ] && gh_bin="$candidate" && break
    done
fi
[ -z "$gh_bin" ] && gh_bin="$(command -v gh 2>/dev/null)"
[ -z "$gh_bin" ] && exit 0

# The waiting limit: a hanging network call at the end of a turn reads as a stuck agent.
run_gh() {
    if command -v timeout >/dev/null 2>&1; then
        timeout 12 "$gh_bin" "$@" 2>/dev/null
    elif command -v gtimeout >/dev/null 2>&1; then
        gtimeout 12 "$gh_bin" "$@" 2>/dev/null
    else
        "$gh_bin" "$@" 2>/dev/null
    fi
}
# The cache of the host's answers. The key is the branch: its head changes together with the
# answer, and holding the head in the key would mean asking the host anew on every commit.
cache_dir="${TMPDIR:-/tmp}"
cache_ttl=60

# The freshness of the cache by file name: there are two tiers, and each has its own host answer.
cache_fresh() {
    [ -f "$1" ] || return 1
    now="$(date +%s 2>/dev/null)" || return 1
    then_="$(cat "$1.at" 2>/dev/null)" || return 1
    [ -n "$then_" ] || return 1
    [ "$((now - then_))" -lt "$cache_ttl" ]
}

cache_put() {
    printf '%s' "$2" > "$1" 2>/dev/null
    date +%s > "$1.at" 2>/dev/null
}

safe_name() { printf '%s' "$1" | tr -c 'A-Za-z0-9_.-' '_'; }

tasks_dir="${RT_TASKS_DIR-docs/tasks}"

# The run exactly at the request's head. The branch's last run may belong to an intermediate
# commit, and its green colour says nothing about readiness.
run_verdict() {
    run_gh run list --branch "$1" --limit 20 \
        --json headSha,status,conclusion 2>/dev/null \
        | jq -r --arg sha "$2" '
            [.[] | select(.headSha == $sha)] as $mine
            | if ($mine | length) == 0 then "none"
              elif ($mine | map(select(.status != "completed")) | length) > 0 then "running"
              elif ($mine | map(select(.conclusion != "success")) | length) > 0 then "failed"
              else "green" end
        ' 2>/dev/null
}

# Does the branch carry its task folder. The branch is read rather than the working tree: what is
# judged is what will arrive. A foreign branch is asked first by the remote ref — that is what the
# owner sees — and only then by the local copy. There is no ref at all — the branch is not judged.
carries_folder() {
    for ref in "origin/$1" "$1"; do
        git rev-parse --verify --quiet "$ref" >/dev/null 2>&1 || continue
        if [ -n "$(git ls-tree -d --name-only "$ref" "$tasks_dir/$1" 2>/dev/null)" ]; then
            printf 'yes'
        else
            printf 'no'
        fi
        return 0
    done
    printf 'unknown'
}

# ── Tier one: the current branch's request ───────────────────────────────────────────────────

reason=''

judge_current() {
    [ -z "$branch" ] && return 0
    [ "$branch" = "main" ] && return 0

    cache_file="$cache_dir/rt-draft-ready-$(safe_name "$branch")"
    if cache_fresh "$cache_file"; then
        pr_json="$(cat "$cache_file" 2>/dev/null)"
    else
        pr_json="$(run_gh pr view "$branch" --json number,isDraft,state,headRefOid,url)"
        cache_put "$cache_file" "$pr_json"
    fi

    [ -z "$pr_json" ] && return 0

    state="$(printf '%s' "$pr_json" | jq -r '.state // empty' 2>/dev/null)"
    draft="$(printf '%s' "$pr_json" | jq -r '.isDraft // false' 2>/dev/null)"
    number="$(printf '%s' "$pr_json" | jq -r '.number // empty' 2>/dev/null)"
    head_sha="$(printf '%s' "$pr_json" | jq -r '.headRefOid // empty' 2>/dev/null)"

    [ "$state" = "OPEN" ] || return 0
    [ "$draft" = "true" ] || return 0
    [ -n "$number" ] || return 0
    [ -n "$head_sha" ] || return 0

    [ "$(run_verdict "$branch" "$head_sha")" = "green" ] || return 0

    # Next it is decided at which step exactly the work stands, and there are two grounds for a
    # refusal.
    #
    # The former edition of the guard knew one: there is no folder in the branch, so one call is
    # left. Silence with the folder lying it counted lawful always, and the stop simply moved one
    # step back: the work was ready, the run green, the folder not taken apart — and the guard
    # stayed silent exactly as the rules layer used to. A guard closing the last step moves the
    # stop to the previous one; what has to be closed is the transition, not the point. The
    # analysis is the record «2026-08-16-draft-guard-half-closed» in the intake.
    folder="$(git ls-tree -d --name-only HEAD "$tasks_dir/$branch" 2>/dev/null)"

    if [ -z "$folder" ]; then
        step="ready"
    else
        # The folder is in place. Whether the work is ready or still going is visible to a machine
        # only from the progress: the section "Where we stand" is the only place where done work is
        # marked. It is read from the branch rather than from the working tree: an uncommitted edit
        # will arrive together with the branch, and what is judged is what will arrive.
        #
        # The closing of the stages is caught by samples rather than by understanding the meaning:
        # the appraisal "the work is ready" would be assigned by whoever it hinders. The set is
        # open, is added to by an edit and misses noticeably — a progress written in words outside
        # the set the guard lets through, and that is its boundary rather than a promise.
        #
        # The line key is read under two names, English and Russian: the progress of this tree
        # writes the keys in English, and the former sample knew only the Russian one.
        stage_re='закрыт|кончил|сделаны все|этапов не осталось|последний этап|closed|are over|no stages left|last stage'
        stage_line="$(git show "HEAD:$tasks_dir/$branch/progress.md" 2>/dev/null \
            | grep -m1 -iE '^[[:space:]]*[-*][[:space:]]*\*\*(Этап|Stage)' 2>/dev/null)"
        if printf '%s' "$stage_line" | grep -qiE "$stage_re" 2>/dev/null; then
            step="teardown"
        else
            # The stages are still open — a draft with them is lawful, and the guard stays silent.
            return 0
        fi
    fi

    if [ "$step" = "ready" ]; then
        reason="BLOCKED by git-guard-draft-ready: the work is ready, and PR #$number is still a draft.

The run at the head \`${head_sha:0:8}\` ended in success, and the branch no longer carries the task
folder — so everything is done but one call. A draft's merge button is locked by the host: while it
stands, a green PR page allows the owner nothing, and they read the silence as a breakage.

    $gh_bin pr ready $number

After that the owner is told in one reply that the work is ready to merge, and the number is named.
Lifting the draft and the request to merge are one turn, not two different days.

The draft stands on purpose — tell the owner aloud what exactly you are waiting for: the guard
judges one turn and does not refuse the next approach."
    else
        reason="BLOCKED by git-guard-draft-ready: the stages are closed, the run is green, and the work is not cleaned up after.

PR #$number is a draft, the run at the head \`${head_sha:0:8}\` ended in success, and the progress says
no stages are left. The branch at that still carries \`$tasks_dir/$branch/\` — so it stands not at the
work but at the clean-up after it.

Usually nobody comes here: the clean-up stands before the request is opened, and opening one with
the folder lying is refused by the delivery guard. A folder here means the request was opened by a
bypass — the line \`Task-folder-skip:\`.

The order is one and it is not split between sessions:

    1. the agreement merges into the domain spec, the texts are brought up to what was done;
    2. the task folder is taken apart by the last commit — the grill and the decisions along the
       way to the archive, the plan away;
    3. $gh_bin pr ready $number
    4. the owner is told in one reply that the work is ready to merge, and the number is named.

A folder left until the merge arrives in the main branch and reads there as current. The order is
the pattern \`task-flow-close\`.

The stages are in fact not closed — fix \"Where we stand\" in the progress: the guard reads exactly
that line, and it judges one turn."
    fi
}

# ── Tier two: drafts abandoned in neighbouring branches ──────────────────────────────────────

judge_abandoned() {
    # The machine account's name comes from the tree's profile. Asking `@me` is not allowed: the
    # host helper on the owner's machine is signed in as the owner, and the list would come back a
    # foreign one.
    bot=''
    if [ -n "${RT_BOT:-}" ]; then
        bot="$RT_BOT"
    elif [ -f .claude/rt-kit/checks.json ]; then
        bot="$(jq -r '.board.bot // empty' .claude/rt-kit/checks.json 2>/dev/null)"
    fi
    [ -z "$bot" ] && return 0

    cache_file="$cache_dir/rt-draft-abandoned-$(safe_name "$bot")"
    if cache_fresh "$cache_file"; then
        list_json="$(cat "$cache_file" 2>/dev/null)"
    else
        list_json="$(run_gh pr list --author "$bot" --state open --draft --limit 20 \
            --json number,headRefName,headRefOid)"
        cache_put "$cache_file" "$list_json"
    fi

    [ -z "$list_json" ] && return 0
    printf '%s' "$list_json" | jq -e 'type == "array"' >/dev/null 2>&1 || return 0

    left=''
    count=0
    while IFS='	' read -r number ref sha; do
        [ -n "$number" ] || continue
        [ -n "$ref" ] || continue
        [ -n "$sha" ] || continue
        [ "$ref" = "$branch" ] && continue

        [ "$(carries_folder "$ref")" = "no" ] || continue
        [ "$(run_verdict "$ref" "$sha")" = "green" ] || continue

        left="$left
    #$number  $ref  head ${sha:0:8}    $gh_bin pr ready $number"
        count=$((count + 1))
    done <<EOF
$(printf '%s' "$list_json" | jq -r '.[] | [.number, .headRefName, .headRefOid] | @tsv' 2>/dev/null)
EOF

    [ "$count" -eq 0 ] && return 0

    plural='request is abandoned as a draft'
    [ "$count" -gt 1 ] && plural="requests are abandoned as drafts"

    reason="BLOCKED by git-guard-draft-ready: $count $plural — the run on them arrived, and the draft is not lifted.
$left

Leaving for a neighbouring branch does not close a request: the run on it ended in success, it no
longer carries the task folder, and one call is left. While the draft stands, the merge button is
locked for the owner by the host, and the main branch goes ahead — the longer the request waits,
the more likely a conflict that will have to be sorted out by a second merge.

Lifting the draft and the request to merge are one turn: lift it and name the number to the owner.

The draft stands on purpose — tell the owner aloud which request it is and what exactly you are
waiting for: the guard judges one turn and does not refuse the next approach."
}

judge_current
[ -z "$reason" ] && judge_abandoned
[ -z "$reason" ] && exit 0

jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
    || printf '{"decision":"block","reason":"git-guard-draft-ready: the run is green, and the PR is still a draft — lift it."}\n'

exit 0
