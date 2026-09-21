#!/usr/bin/env bash
# rt-hook: PreToolUse Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: hooks/git-guard-delivery-folder.sh, hooks/git-guard-delivery-epic.sh, hooks/git-guard-tree-assignment.sh, hooks/git-guard-delivery-conflict.sh, hooks/profile-check.sh, hooks/deny-tail.sh, hooks/guard-note.sh
# Delivery guard. PreToolUse on creating a branch, on the push and on opening a PR.
#
# The delivery law demands three things nothing usually checks: an edit starts from a task visible
# in the work queue; the task, the branch and the PR carry one number; the task has an assignee.
# They are held by memory — and they do not hold: tasks stand outside the queue, the assignee is
# not set, and most merged PRs come from branches that had no task behind them at all.
#
# The guard stands at three points, and at each of them it demands what is fixable at that moment:
#
#   creating a branch — a name with a number is parsed on the spot; a name without a number is let
#       through: a local branch for a trial is lawful, it will not travel into the main branch,
#       because no PR opens from it;
#   the push — the signature of a machine commit is still rewritten on the spot; after the push
#       only a force push fixes it;
#   opening a PR — the branch must carry a number, the title must start with the same number, and
#       the task must be open, stand in the work queue and have an assignee.
#
# Two tiers. The format — the number in the branch name, the number in the title, their match — is
# read from the command text and always works. The state of the task needs the network: no network,
# no client or no token — the tier is skipped, because there is nothing to check with.
#
# What is called what here is known by the tree profile:
#   rt_task_branch_ok    — the form of a branch name for a task;
#   rt_task_branch_number — the task number out of that name: the prefix can be the kind of edit too;
#   RT_TASK_TITLE_RE     — the form of the number in the PR title;
#   rt_task_state        — the state of the task as one object (existsize, open, onBoard, assigned,
#                          numbered); silence means "there is nobody to ask";
#   RT_TASK_NEW_CMD      — what a task is created with;
#   RT_BOARD_CHECK_CMD   — what the work queue is audited with;
#   RT_TASK_BOT          — the account put as the assignee; the PR is opened by it as well;
#   RT_PULL_TOKEN_VAR    — the variable through which its token is substituted into the call;
#   RT_PULL_TOKEN_HINT   — the ready-made substitution of that token, whole;
#   RT_COMMIT_EMAIL      — the address a machine commit is signed with; by its left part the commit
#                          is recognised as well.
# The refusal names both what is wrong and what fixes it: a refusal without an action is bypassed,
# not carried out.
#
# FAIL-OPEN: not a repository, no parser, broken input, no profile — let through.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=git-guard-delivery

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

tool="$(rt_hook_tool)"
sid="$(printf '%s' "$input" | jq -r '.session_id // "nosession"' 2>/dev/null)"
case "$tool" in
    # The environment terminal and the universal executor put the command in the same field.
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool) ;;
    *) exit 0 ;;
esac

cmd="$(rt_hook_cmd)"
[ -z "$cmd" ] && exit 0

# The universal executor passes the real command as a nested string. It is that string that has to
# be parsed, not the wrapper.
if [ "$tool" = "mcp__webstorm__execute_tool" ] && command -v perl >/dev/null 2>&1; then
    inner="$(printf '%s' "$cmd" | perl -0ne '
        if (/--command(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(.+))/s) {
            print defined $1 ? $1 : (defined $2 ? $2 : $3);
        }
    ' 2>/dev/null)"
    [ -n "$inner" ] && cmd="$inner"
fi

workdir="$(rt_hook_cwd)"
[ -z "$workdir" ] && workdir="${CLAUDE_PROJECT_DIR:-.}"
cd "$workdir" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}"

# The tree profile: first the package default, and the project override on top of it, if there is
# one. A function declared in the override replaces the default whole and may call it back through
# the `_default` suffix. Neither one nor the other — the hook lets through: an empty guard is
# better than a guard that refuses at random.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "$root/.claude/rt-kit/defaults/project.sh" "$root/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

# A word about a missing profile function: a hook that left silently is indistinguishable from a
# working one. The file may be not laid out — then the previous behaviour stays, the silent one.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/profile-check.sh" ] && . "$rt_hooks_dir/profile-check.sh"
command -v rt_needs >/dev/null 2>&1 || rt_needs() { command -v "$1" >/dev/null 2>&1; }
rt_needs rt_task_branch_ok git-guard-delivery || exit 0
rt_needs rt_task_branch_number git-guard-delivery || exit 0

title_re="${RT_TASK_TITLE_RE:-^\[[A-Za-z]+-[0-9]+\][[:space:]]+[^[:space:]]}"
task_new="${RT_TASK_NEW_CMD:-npm run task:new}"
board_check="${RT_BOARD_CHECK_CMD:-npm run check:board}"
task_move="${RT_TASK_MOVE_CMD:-npm run task:move}"
# The first column of the work queue is the one a task leaves when it is taken. It has no default:
# a tree names its columns in its own words, and an invented name would match nothing and would
# silently switch the check off.
backlog_column="${RT_BOARD_BACKLOG:-}"
epic_label="${RT_BOARD_EPIC_LABEL:-}"
task_bot="${RT_TASK_BOT:-}"
# The identity of the call arrives through the environment, not as a word in the line: from the
# command text only one thing is visible — whether the token is substituted explicitly. A tree that
# named no variable does not judge the PR author at all — it may have no separate machine account.
pull_token_var="${RT_PULL_TOKEN_VAR:-}"
pull_token_hint="${RT_PULL_TOKEN_HINT:-}"
# The section the PR body must carry from the minute it opens. The merge button is pressed by a
# person on the hosting, where the guard does not reach: everything the requirement holds by there
# is what the owner saw on the page. The section heading is written in the language of the PR, so
# the pattern is named by the tree, not by the package: the package does not know someone else's
# words, and an invented default would match nothing.
pull_body_section="${RT_PULL_BODY_SECTION:-}"
commit_email="${RT_COMMIT_EMAIL:-}"
tasks_dir="${RT_TASKS_DIR:-}"
archive_dir="${RT_ARCHIVE_DIR:-}"
main_branch="${RT_MAIN_BRANCH:-main}"

# The bypass of the requirement: a line with a reason. The reason is seen by whoever merges, so the
# bypass is allowed; without a reason it is a silent skip. The threshold of three characters is the
# same as in the document guard.
#
# The bypass line stands at the start of a line — its own in the PR body, or of a comment at the end
# of the command — and takes no substitutions. Otherwise the text explaining what the bypass is
# called is indistinguishable from the bypass itself: a PR body with a sample line lifted the
# requirement by itself.
folder_skip_re='(^|#)[[:space:]]*Task-folder-skip:[[:space:]]*[^[:space:]<"'"'"'][^[:space:]"'"'"']{2,}'

deny() {
    # A guard refusal is an observation: the guard that refuses more often than the rest says which
    # place of the delivery is done wrong time after time. The refusal text does not go there: it
    # holds the task numbers and the branch names of the tree.

    # The refusal tail: the two lawful moves and the form of the bypass as the second parameter.
    # shellcheck disable=SC1090
    [ -f "$rt_hooks_dir/deny-tail.sh" ] && . "$rt_hooks_dir/deny-tail.sh" 2>/dev/null
    reason="$1"
    command -v rt_deny_tail >/dev/null 2>&1 && reason="$1 $(rt_deny_tail "$2")"
    # A neighbour's conflict travels inside the refusal: the guard says one thing per call, and a
    # second JSON document next to the first is read as plain text — that is, as no refusal at all.
    [ -n "${rt_delivery_neighbour_note:-}" ] && reason="${reason}

${rt_delivery_neighbour_note}"
    rt_delivery_said=1

    jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
        || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"The delivery guard."}}\n'
    exit 0
}

# Conditions that did not come together pile up and are named all at once: a refusal on the first
# miss makes them fixed one at a time — the base, a repeat, the title, another repeat, the task —
# although everything that did not come together is known already on the first round. Readiness for
# delivery is one state, and it is named whole.
faults=''

fault() {
    faults="${faults}${faults:+
}— $1"
}

# The conditions about the task folder are moved out into a neighbouring file: the folder has a
# subject of its own, a bypass of its own and a record of its own in the archive, and together with
# the command parsing and the work queue they outgrew the length limit. It is sourced after `deny`
# and `fault` — both are called from inside it.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/git-guard-delivery-folder.sh" ] && . "$rt_hooks_dir/git-guard-delivery-folder.sh" 2>/dev/null

# The epic of a task: the same technique as with the folder. It is sourced before the branch block —
# there the base of a new branch is judged, and with an epic it is judged against the branch of the
# epic. No helper — the epic is not judged, and the base is asked against the main branch as before.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/git-guard-delivery-epic.sh" ] && . "$rt_hooks_dir/git-guard-delivery-epic.sh" 2>/dev/null

# A conflicting PR of one's own: the same technique as with the folder and the signature. The helper
# is called before all the tiers below and judges not the readiness of this work but the right to
# take the next one: while what was handed over conflicts, it is fixed by the first action of the
# turn. No helper — the tier is not judged, and the work goes on.
# shellcheck disable=SC1090
# The tree the command runs in: the form of a branch name is judged by its profile, not by the
# profile of the tree the session was started from. No helper — the form is judged as before.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/git-guard-delivery-tree.sh" ] && . "$rt_hooks_dir/git-guard-delivery-tree.sh" 2>/dev/null
command -v rt_delivery_branch_form_ok >/dev/null 2>&1 \
    || rt_delivery_branch_form_ok() { rt_task_branch_ok "$1"; }

[ -f "$rt_hooks_dir/git-guard-delivery-conflict.sh" ] && . "$rt_hooks_dir/git-guard-delivery-conflict.sh" 2>/dev/null
command -v rt_delivery_note_out >/dev/null 2>&1 && trap rt_delivery_note_out EXIT
command -v rt_delivery_conflict >/dev/null 2>&1 && rt_delivery_conflict

# The refusal on what has piled up. Empty — the calling side goes on.
deny_faults() {
    [ -z "$faults" ] && return 0
    deny "BLOCKED: the work is not ready for delivery. Everything unmet is named whole — so that it
is fixed in one session, not one miss per round:

${faults}"
}

check_task() {
    number="$1"
    where="$2"
    # The column is asked about where it should already have been moved. At branch creation it has
    # not been moved yet — the work pattern moves the column with the next command — and the
    # requirement here would refuse the very first command of the work together with the one that
    # lifts it.
    judge_column="${3:-no}"
    rt_needs rt_task_state git-guard-delivery || return 0
    state="$(cd "$root" && rt_task_state "$number" 2>/dev/null)" || return 0
    [ -z "$state" ] && return 0

    printf '%s' "$state" | jq -e '.exists' >/dev/null 2>&1 \
        || fault "${where} refers to the task #${number}, which does not exist. Check the number or create the task — ${task_new}."
    printf '%s' "$state" | jq -e '.open' >/dev/null 2>&1 \
        || fault "the task #${number} is closed, and a task has one branch. Work behind a closed task is created as a new task — ${task_new}."
    printf '%s' "$state" | jq -e '.onBoard' >/dev/null 2>&1 \
        || fault "the task #${number} is not in the work queue — the edit behind it is invisible. The queue is not bound to the repository and does not take a task by itself; add it and check — ${board_check}."
    printf '%s' "$state" | jq -e '.assigned' >/dev/null 2>&1 \
        || fault "the task #${number} has no assignee — by the work queue there is no seeing who took it. Set the assignee${task_bot:+: }${task_bot}."
    printf '%s' "$state" | jq -e '.numbered' >/dev/null 2>&1 \
        || fault "the title of the task #${number} does not start with its number — one work would have to be recognised by the text of the title. Fix the title and check the queue — ${board_check}."

    # The task column. The work queue answer has been giving it for a long time, and nobody read it:
    # the column was judged only by the queue audit, that is, already after the PR is opened. A task
    # left in the first column reads through the queue as not taken — while the work is done and put
    # out.
    if [ -n "$backlog_column" ] && [ "$judge_column" = "yes" ]; then
        column="$(printf '%s' "$state" | jq -r '.status // empty' 2>/dev/null)"
        [ "$column" = "$backlog_column" ] \
            && fault "the task #${number} stands in the column «${column}» — by the work queue it is not taken, though the work on it is going. Move it: ${task_move}."
    fi

    return 0
}

# --- creating a branch -------------------------------------------------------------------
branch_arg=''
if printf '%s' "$cmd" | grep -qE '(^|[;&|[:space:]])git[[:space:]]+(checkout([[:space:]]+-[A-Za-z-]+)*[[:space:]]+-b|switch([[:space:]]+-[A-Za-z-]+)*[[:space:]]+-c)[[:space:]]'; then
    branch_arg="$(printf '%s' "$cmd" | sed -nE 's/.*git[[:space:]]+(checkout([[:space:]]+-[A-Za-z-]+)*[[:space:]]+-b|switch([[:space:]]+-[A-Za-z-]+)*[[:space:]]+-c)[[:space:]]+([^[:space:];&|]+).*/\4/p' | head -1)"
    branch_arg="${branch_arg%\'}"; branch_arg="${branch_arg#\'}"
    branch_arg="${branch_arg%\"}"; branch_arg="${branch_arg#\"}"
fi

if [ -n "$branch_arg" ]; then
    # A name pretending to be a branch for a task but not matching the form is a miss in the name,
    # not a deliberate task-less branch. Caught before the first commit.
    # The number is extracted by the profile: with its own regex the branch `feat/88-slug` gave no
    # number at all.
    number_arg="$(rt_task_branch_number "$branch_arg")"
    if [ -n "$number_arg" ]; then
        rt_delivery_branch_form_ok "$branch_arg" \
            || deny "BLOCKED: the branch name «${branch_arg}» is not of the form accepted here. The branch number is the same as the number of the task and of the title of the merge request."
        state=''
        check_task "$number_arg" "the branch «${branch_arg}»"
        # The epic of the task: with one, the base is judged against the branch of the epic, and the
        # freshness of the main branch moves there too — see `git-guard-delivery-epic.sh`.
        epic_arg="$(printf '%s' "$state" | jq -r '.epic // empty' 2>/dev/null)"

        # The delivery conditions already known here are checked here. After the work is done, the
        # base is fixed by a merge with conflict resolution, and the commit signature by rewriting
        # the branch; at the start of the work both cost one command.
        #
        # The base: the tip of the main branch must lie in what the new branch grows from. The named
        # base is checked, not the tip of the working copy: otherwise the command that takes the
        # base fresh — `git checkout -b <branch> origin/<main>` — would be forbidden.
        base_arg="$(printf '%s' "$cmd" | sed -nE 's/.*git[[:space:]]+(checkout([[:space:]]+-[A-Za-z-]+)*[[:space:]]+-b|switch([[:space:]]+-[A-Za-z-]+)*[[:space:]]+-c)[[:space:]]+[^[:space:];&|]+[[:space:]]+([^[:space:];&|-][^[:space:];&|]*).*/\4/p' | head -1)"
        base_ref="${base_arg:-HEAD}"
        command -v rt_assignment_fault >/dev/null 2>&1 && rt_assignment_fault "$epic_arg" "the branch «${branch_arg}»"
        if [ -n "$epic_arg" ] && command -v rt_epic_base >/dev/null 2>&1; then
            rt_epic_base "$epic_arg" "$base_ref" "$branch_arg"
        elif git rev-parse --verify --quiet "refs/remotes/origin/${main_branch}" >/dev/null 2>&1 \
            && git rev-parse --verify --quiet "$base_ref" >/dev/null 2>&1 \
            && ! git merge-base --is-ancestor "origin/${main_branch}" "$base_ref" 2>/dev/null; then
            behind="$(git rev-list --count "${base_ref}..origin/${main_branch}" 2>/dev/null)"
            fault "the branch will grow from a base that does not carry the tip of «${main_branch}» — it has moved ahead by ${behind:-several} commits. Take a fresh base: git fetch origin && git checkout -b ${branch_arg} origin/${main_branch}."
        fi

        # The second tier: the local reference to the main branch could itself have gone stale, and
        # then the silence of the first tier means "the base is not older than my reference", not
        # "the base is fresh". No answer — the tier stays silent, as everywhere the guard goes to
        # the network.
        remote_head="$(GIT_HTTP_LOW_SPEED_LIMIT=1000 GIT_HTTP_LOW_SPEED_TIME=5 GIT_TERMINAL_PROMPT=0 \
            git ls-remote origin "refs/heads/${main_branch}" 2>/dev/null | cut -f1)"
        local_head="$(git rev-parse --verify --quiet "refs/remotes/origin/${main_branch}" 2>/dev/null)"
        if [ -n "$remote_head" ] && [ -n "$local_head" ] && [ "$remote_head" != "$local_head" ]; then
            fault "your ref origin/${main_branch} lags behind the remote one — ${local_head:0:8} against ${remote_head:0:8}. The branch will grow from yesterday tree, and the owner sees that at the opening of the request. Pull and repeat: git fetch origin."
        fi

        # The signature: the address of the machine account is declared by the tree, and the working
        # copy does not know it — which means the very first commit will travel under someone else's
        # signature, and after the push that is fixed only by a force push.
        if [ -n "$commit_email" ]; then
            tree_email="$(git config user.email 2>/dev/null)"
            [ -n "$tree_email" ] && [ "$tree_email" != "$commit_email" ] \
                && fault "the working copy signs commits as «${tree_email}», while the tree declared the email of the machine account «${commit_email}». The very first commit leaves under a foreign signature: git config user.email \"${commit_email}\"."
        fi

        deny_faults
    fi
    # A branch without a number is lawful and lives locally: no PR opens from it.
    exit 0
fi

# --- the machine commit signature ----------------------------------------------------------
# The subject lives in a helper next door — `git-guard-delivery-signature.sh`: the guard grew up to
# the length limit, and the signature is the most separate of its subjects. No helper — the
# signature is not judged, and the work goes on: the same fail-open as with the other conditions.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/git-guard-delivery-signature.sh" ] \
    && . "$rt_hooks_dir/git-guard-delivery-signature.sh" 2>/dev/null
command -v rt_delivery_signature >/dev/null 2>&1 && rt_delivery_signature

# --- leaving draft ---------------------------------------------------------------------------
# The subject lives in a helper next door — `git-guard-delivery-draft.sh`, by the same technique as
# the signature. No helper — leaving draft is not judged, and the work goes on.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/git-guard-delivery-draft.sh" ] \
    && . "$rt_hooks_dir/git-guard-delivery-draft.sh" 2>/dev/null
command -v rt_delivery_draft_ready >/dev/null 2>&1 && rt_delivery_draft_ready

# --- merging a PR --------------------------------------------------------------------------
#
# The second line of the same condition that stands at the opening of a PR: it catches a merge going
# by command. We look for the command from the start of the line or after a separator, not anywhere
# in the text. Otherwise the guard refuses a message where `gh pr merge` is merely mentioned in
# quotes — that is how it fired on an edit of this very text. A quoted substring cannot be cut off
# entirely this way, but an accidental mention inside a word or a path no longer gets through.
if printf '%s' "$cmd" | grep -qE "${RT_CMD_BOUND}(gh[[:space:]]+pr[[:space:]]+merge|glab[[:space:]]+mr[[:space:]]+merge|az[[:space:]]+repos[[:space:]]+pr[[:space:]]+update)([[:space:]]|\$)"; then
    rt_delivery_merge_folder
fi

# --- opening a PR --------------------------------------------------------------------------
# We look for the command from the start of the line or after a separator — for the same reason as
# with the merge: a mention in quotes is not a command.
printf '%s' "$cmd" \
    | grep -qE "${RT_CMD_BOUND}(gh[[:space:]]+pr[[:space:]]+create|glab[[:space:]]+mr[[:space:]]+create|az[[:space:]]+repos[[:space:]]+pr[[:space:]]+create)([[:space:]]|\$)" \
    || exit 0

branch="$(git branch --show-current 2>/dev/null)"
[ -z "$branch" ] && exit 0   # a detached HEAD is not about this case

# A local branch without a number is lawful, and a PR from it is not: an edit that travels to the
# main branch starts from a task. This is the only place where a task-less branch runs into a wall.
rt_task_branch_ok "$branch" \
    || deny "BLOCKED: a request from the branch «${branch}», with no task standing behind it. An edit begins with a task visible in the work queue: create it — ${task_new} — and move the work into a branch with its number."

number="$(rt_task_branch_number "$branch")"

# The work queue is asked here and not at the end of the block: the epic of the task decides what
# the base of the request is judged against, and that judging stands above. The call is one — the
# state stays in `state` and the tail of the block reads the same answer.
state=''
check_task "$number" "the request from the branch «${branch}»" yes
epic_pull="$(printf '%s' "$state" | jq -r '.epic // empty' 2>/dev/null)"
# The branch of an epic itself: its request goes into the main branch, and it opens only when the
# folders of all its tasks are taken apart.
command -v rt_epic_own_pull >/dev/null 2>&1 && rt_epic_own_pull "$state"

title=''
if command -v perl >/dev/null 2>&1; then
    # The long key is searched first, the short one only where no long key stands in the command.
    # The short key is taken by neighbours: `nx affected -t lint` in the same call became the title,
    # and the refusal said the title does not start with the number of the task while it did.
    title="$(printf '%s' "$cmd" | perl -0ne '
        my $v = qr/(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(\S+))/;
        if (/--title(?:=|\s+)$v/s || /(?<![-\w])-t(?:=|\s+)$v/s) {
            print defined $1 ? $1 : (defined $2 ? $2 : $3);
        }
    ' 2>/dev/null)"
fi

if [ -n "$title" ]; then
    printf '%s' "$title" | grep -qE "$title_re" \
        || fault "the title of the request does not start with the number of the task. In the list of requests the body is invisible, and the line of the link lives exactly there — without the number in the title the PR cannot be matched to the task."
    # The number is extracted from the part of the title the form itself recognised, not by a second
    # regex next to it. The own regex knows only the package form: a tree that paved the form over
    # with its own got an empty number — and the check of the title number against the branch number
    # silently did not run at all, while looking as if it had come together.
    title_matched="$(printf '%s' "$title" | grep -oE "$title_re" | head -1)"
    title_number="$(printf '%s' "$title_matched" | grep -oE '[A-Za-z]+-[0-9]+' | head -1 | sed -E 's/^[A-Za-z]+-//')"
    if [ -n "$number" ] && [ -n "$title_number" ]; then
        [ "$title_number" = "$number" ] \
            || fault "the title of the request carries the number ${title_number}, the branch — ${number}. The task, the branch and the PR carry one and the same number."
    fi
fi

# The main branch is merged in before the PR opens: otherwise the reviewer sees someone else's edit
# mixed in with his own, and the checks run from an outdated base.
#
# There are two tiers. The first reads the local tip and works without the network. The second asks
# the remote reference: without it, silence means only "the local reference is not older than the
# branch", while it reads as "the main branch is merged in". No answer from the network — a silent
# skip; the waiting limit is set by git variables, an external `timeout` is not on every machine.
if [ -n "$epic_pull" ] && command -v rt_epic_pull_base >/dev/null 2>&1; then
    rt_epic_pull_base "$epic_pull" "$cmd"
elif git rev-parse --verify --quiet "refs/remotes/origin/${main_branch}" >/dev/null 2>&1 \
    && ! git merge-base --is-ancestor "origin/${main_branch}" HEAD 2>/dev/null; then
    behind="$(git rev-list --count "HEAD..origin/${main_branch}" 2>/dev/null)"
    fault "«${main_branch}» has moved ahead by ${behind:-several} commits and is not merged into the branch. A PR from a diverged branch shows the reviewer the edit mixed with someone else, and the checks on it run from a stale base. Merge it in and repeat: git fetch origin && git merge origin/${main_branch} — the order and the resolving of the conflict are in the pattern git-workflow-merge."
fi

# The second tier: the local reference could itself have gone stale. No answer — the tier stays
# silent.
remote_main="$(GIT_HTTP_LOW_SPEED_LIMIT=1000 GIT_HTTP_LOW_SPEED_TIME=5 GIT_TERMINAL_PROMPT=0 \
    git ls-remote origin "refs/heads/${main_branch}" 2>/dev/null | cut -f1)"
local_main="$(git rev-parse --verify --quiet "refs/remotes/origin/${main_branch}" 2>/dev/null)"
if [ -n "$remote_main" ] && [ -n "$local_main" ] && [ "$remote_main" != "$local_main" ]; then
    # The age of the reference is what the executor does not see at all, and it is exactly what
    # tells "the branch is behind" from "I do not know whether it is behind". The `stat` format
    # differs on BSD and on GNU, so both are asked instead of guessing the system.
    fetch_head="$(git rev-parse --git-dir 2>/dev/null)/FETCH_HEAD"
    fetched_at="$(stat -f %m "$fetch_head" 2>/dev/null || stat -c %Y "$fetch_head" 2>/dev/null)"
    age=''
    if [ -n "$fetched_at" ]; then
        age=" The last git fetch was $(( ( $(date +%s) - fetched_at ) / 60 )) min ago."
    fi
    fault "your ref origin/${main_branch} lags behind the remote one — ${local_main:0:8} against ${remote_main:0:8}.${age} The guard compares the branch with what lies in the tree, so silence of the first tier means «the ref is not older than the branch», not «the main branch is merged in». Merge it in and repeat: git fetch origin && git merge origin/${main_branch}."
fi

# The identity of the call. The hosting client holds two accounts — the logged-in one and the one
# whose token stands in the call environment; which of them opens the PR is visible from the command
# only through an explicit substitution.
#
# What is judged is not the name of the account but the clash with the reviewer: the author of a PR
# is never its reviewer, the hosting silently drops such a review request, and the author cannot be
# changed afterwards. A PR opened by any other account is lawful while its reviewer is somebody
# else — judging the name instead leaves a machine that holds no token with no way to deliver at all.
# The value is taken as one word up to the next space: a login has no spaces in it, and an alphabet
# listed by ranges would silently not recognise a neighbouring one — the value then reads as absent,
# and the clash with the reviewer goes unnoticed.
pull_reviewer="$(printf '%s' "$cmd" | sed -n "s/.*--reviewer[= ]\{1,\}['\"]\{0,1\}\([^[:space:]'\"]\{1,\}\).*/\1/p" | head -1)"

# Who will open the PR is asked of the hosting by the tree: the hosting, the client and the path to
# the token are each their own. The answer covers both accounts at once — the substitution reads a
# file that may not be on the machine, and then the client answers from the logged-in one.
token_login=''
command -v rt_pull_token_login >/dev/null 2>&1 && token_login="$(rt_pull_token_login 2>/dev/null)"

if [ -n "$token_login" ]; then
    if [ -n "$pull_reviewer" ] && [ "$token_login" = "$pull_reviewer" ]; then
        fault "the request would be opened by the account «${token_login}», and the same one is named as its reviewer. The hosting accepts such a review request and silently does not create it, and the author of a request cannot be changed — it is fixed only by reopening. Open it by another account${pull_token_hint:+, substituting the token: ${pull_token_hint} …}, or name another reviewer."
    elif [ -n "$task_bot" ] && [ "$token_login" != "$task_bot" ]; then
        # Not a refusal: the reviewer is somebody else, and the review will be created. But silence
        # about a foreign account is indistinguishable from a check that did not fire at all.
        printf 'the delivery guard: the request will come out from the account «%s», not the machine one «%s». The reviewer is another one, so the review will be created.\n' "$token_login" "$task_bot" >&2
    fi
elif [ -n "$pull_token_var" ] \
    && ! printf '%s' "$cmd" | grep -qE "(^|[;&|(]|&&|\|\||[[:space:]])${pull_token_var}="; then
    # There is nothing to learn the author by — no helper, or an empty answer from it. Then the only
    # lawful call is the one that names the account in its own text.
    fault "who will open the request cannot be learned: the hosting was not asked, and the command carries no substitution of «${pull_token_var}». Opened by the logged-in account, the request may come out from the very person named as its reviewer, and that is fixed only by reopening.${pull_token_hint:+ Substitute the token: ${pull_token_hint} …}"
fi

# The PR body carries the section about the remaining step from the minute it opens: without it the
# owner merges the PR by the button while the run is still going. The body arrives either as an
# argument or as a file, both are read here; by the time of the parse the file is already written.
# Neither one nor the other — there is no requirement: a PR without a body is checked by the line
# above. The flag is recognised only as a separate word: the tail `-b` of a branch name in the base
# argument read as the body flag, and the next word of the command became the body.
if [ -n "$pull_body_section" ]; then
    body=''
    if command -v perl >/dev/null 2>&1; then
        body="$(printf '%s' "$cmd" | perl -0ne '
            if (/(?:^|\s)(?:--body|-b)(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(\S+))/s) {
                print defined $1 ? $1 : (defined $2 ? $2 : $3);
            }
        ' 2>/dev/null)"
        body_file="$(printf '%s' "$cmd" | perl -0ne '
            if (/(?:^|\s)(?:--body-file|-F)(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(\S+))/s) {
                print defined $1 ? $1 : (defined $2 ? $2 : $3);
            }
        ' 2>/dev/null)"
        [ -z "$body" ] && [ -n "$body_file" ] && [ -f "$body_file" ] && body="$(cat "$body_file" 2>/dev/null)"
    fi

    if [ -n "$body" ] && ! printf '%s' "$body" | grep -qE "$pull_body_section"; then
        fault "the body of the request carries no section about the remaining step. The merge button is pressed by a person on the hosting, where there are no guards, and they merge as soon as they see green: all that holds the requirement there is what the owner read on the page. The section stands last and says exactly one thing — whether anything is left before the merge; it is rewritten by the same call that edits the body."
    fi
fi


# The task folder is taken apart before the PR opens, not after the approval: the owner merges as
# soon as he sees green, and no room is left for a closing commit — three times in a row the folder
# travelled into the main branch without being taken apart. After the cleanup the progress guard
# takes the plan from the branch history.
rt_delivery_open_folder

# Everything that did not come together is named here, all at once: up to this line the conditions
# were being collected, each of which used to refuse the call on its own.
deny_faults

exit 0
