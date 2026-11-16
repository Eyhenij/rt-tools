#!/usr/bin/env bash
# rt-kit v0.37.0 · hooks/git-guard-delivery-task.sh · 9adcc7538bf6 · правится надстройкой, не здесь
# The task of a branch, for the delivery guard: the task exists, is open, stands in the work queue,
# has an assignee and a numbered title, and is not left in the first column.
#
# NOT a guard: it has no `rt-hook:` declaration and hooks into no agent event. The delivery guard
# sources it — one tier of its verdict, moved out when the guard reached its length limit. It reads
# the guard's variables (`task_new`, `board_check`, `task_bot`, `task_move`, `backlog_column`) and
# adds what is unmet by the guard's `fault`; it refuses nothing by itself.
#
# Parameters: the task number, the words that name where the number came from, and `yes` when the
# column is judged.

check_task() {
    number="$1"
    where="$2"
    # The column is asked about where it should already have been moved. At branch creation it has
    # not been moved yet — the work pattern moves the column with the next command — and the
    # requirement here would refuse the very first command of the work together with the one that
    # lifts it.
    judge_column="${3:-no}"
    rt_needs rt_task_state git-guard-delivery || return 0
    state="$(rt_delivery_task_state "$number" 2>/dev/null)" || return 0
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
