#!/usr/bin/env bash
# rt-kit v0.28.0 · hooks/turn-exit-epic.sh · bae4e4c91ec1 · правится надстройкой, не здесь
# The tiers of the open epic for the turn-exit guard. NOT a guard: it has no `rt-hook:` declaration
# and hooks into no agent event. The guard sources it right after the root of the tree is known.
#
# Why they live apart. Under an open epic a turn does not end by itself: the owner said it outright
# — until the epic is closed the executor does not stop on its own. Two ends the guard used to
# release are stops all the same: a turn that ended with work, and a second pass over the same turn.
# The work stands where it stood, and the owner sees the executor standing still with the epic open.
# The reading of the epic and the refusals about it lie here because the guard reached the file
# length limit.
#
# The state of the epic is asked by the same command that prints the table for the owner, and only
# on the way to a refusal: the call goes to the hosting and costs seconds. It is asked once per turn.
#
# FAIL-OPEN: no epic behind the branch, no table, no way to ask the hosting — the epic reads as not
# open, and the guard works as it did before these tiers existed.

# The unfinished tasks of the epic in one line; empty when the epic is over or cannot be read.
rt_te_epic_left() {
    if [ -z "${rt_te_epic_asked:-}" ]; then
        rt_te_epic_asked=1
        rt_te_epic_left_cache=""
        rt_te_epic_read=""
        # shellcheck disable=SC1090
        if . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/epic-over.sh" 2>/dev/null \
            && command -v rt_epic_unfinished >/dev/null 2>&1; then
            rt_te_epic_raw="$(rt_epic_unfinished 2>/dev/null)" && rt_te_epic_read=1
            rt_te_epic_left_cache="$(printf '%s' "$rt_te_epic_raw" | tr -s '[:space:]' ' ' | sed 's/^ //; s/ $//')"
        fi
    fi
    printf '%s' "$rt_te_epic_left_cache"
}

# The standing word of the owner about a stop, quoted in « » in the line «Waiting for the owner» of
# the progress. The guard reads their word, not a retelling: a line without a quote releases
# nothing, and the quote holds until the owner rewrites the line. Expects `$progress` to be set.
rt_te_owner_word_quoted() {
    [ -n "${progress:-}" ] || return 1
    local waiting
    # The first waiting line of the progress is read, in either language of the heading.
    waiting="$(sed -nE 's/^[[:space:]]*[-*][[:space:]]*\*\*(Waiting for the owner|Ждём владельца|Ждём от владельца):\*\*[[:space:]]*(.*)/\2/p' "$progress" 2>/dev/null | head -1)"
    # Three characters and more inside « » count as a word.
    printf '%s' "$waiting" | grep -q '«[^»]\{3,\}»' 2>/dev/null
}

# The epic is open: at least one of its tasks is left unfinished.
rt_te_epic_open() {
    [ -n "$(rt_te_epic_left)" ]
}

# The epic is over: the table was read and printed not a single task. At that point the stop is
# lawful — waiting for the word of the owner is the work itself — and the refusal releases the turn
# whatever tier reached it. An epic that cannot be read — no table, the main branch, no way to ask
# the hosting — is not over, and the turn is judged as before. Reads the same cache: one call per turn.
rt_te_epic_over() {
    rt_te_epic_left >/dev/null
    [ -n "${rt_te_epic_read:-}" ] && [ -z "${rt_te_epic_left_cache:-}" ]
}

# The epic branch: named by the header line of an epic plan in the plans directory of the tree. It
# has the shape of a task branch and by the rule carries no task folder, so the tier of the taken
# task would read every turn on it as work taken and not begun. The plan is written by the command
# that creates the epic and outlives the merge; the directory is named by the settings, `docs/plans`
# by default. Expects `$root` and `$branch` to be set. FAIL-OPEN: no directory, no plan — not an
# epic branch.
rt_te_epic_branch() {
    [ -n "${root:-}" ] && [ -n "${branch:-}" ] || return 1
    local plans
    plans="$(jq -r ".plansDir // empty" "$root/.claude/rt-kit/checks.json" 2>/dev/null)"
    [ -n "$plans" ] || plans="docs/plans"
    [ -d "$root/$plans" ] || return 1
    grep -lE "^\\*\\*[^|]*\`$branch\`" "$root/$plans"/*.md 2>/dev/null | grep -q .
}

# The refusal of a stop under an open epic. The kind names what the turn ended with.
rt_te_epic_deny() {
    local kind="$1" ended short
    case "$kind" in
        handed-by-hand)
            ended="the turn ended with a handover written by the hand of the executor, and no window guard refused in it"
            short="a handover by hand under an open epic."
            ;;
        *)
            ended="the turn ended with work, and the work stands where it stood"
            short="the turn ended with work under an open epic."
            ;;
    esac
    rt_te_deny "BLOCKED by turn-exit-guard: the epic is open — its unfinished tasks: $(rt_te_epic_left) — and ${ended}.

Until the epic is closed the executor does not stop on its own: the owner said so outright. A turn ends in four ways and no others: a question to the owner through the question tool, when the work does not go without the answer; a refusal of a guard as the last action of the turn; the session handover written by the hook on window fill, or the refusal of the window guard; the word of the owner about stopping, said in this turn. The end of the epic is the fifth: not one task of it is left.

The next step is written in the progress: ${next_step}

Do it in this same turn. The work of this task is done — take the next task of the epic. The owner said to stop — then write so: the guard reads their word, not a retelling.

While the epic is open the guard judges every pass over the turn, not the first one alone." "$short"
}

# A question to the owner at the head of an empty turn in a running stage.
rt_te_question_without_work_deny() {
    rt_te_deny "BLOCKED by turn-exit-guard: the work stands in the state 'этап-идёт', and the turn asked the owner without doing a single piece of the stage — neither an edit nor a command changing the tree.

Waiting for one part of a stage is never a stop of the stage: the parts that do not depend on the answer are done in the same turn, and the question goes after them. A question at the head of an empty turn is a stop with a question attached.

The next step is written in the progress: ${next_step}

Do what does not depend on the answer in this same turn, then ask by the tool.

The guard judges one turn: the next session is not refused." "a question without work in a running stage."
}
