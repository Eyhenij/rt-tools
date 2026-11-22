#!/usr/bin/env bash
# rt-kit v0.38.0 · hooks/git-guard-delivery-rerun.sh · ccdf78a23c57 · правится надстройкой, не здесь
# The rerun of the done steps before a PR opens, for the delivery guard. NOT a guard: it has no
# `rt-hook:` declaration and hooks into no agent event. The delivery guard sources it and calls
# `rt_delivery_rerun` on a PR opening, before it names what is unmet.
#
# Only the engine marks a step done, and the work-conduct guard refuses a hand mark. A script that
# writes the done mark and a step mark past both is caught here: every step the progress marks done
# is measured once more, whatever mark lies on disk, and a step that does not match keeps the PR
# closed. The engine puts a taken-apart task folder back from the history for the run.
#
# FAIL-OPEN: no node, no engine, a branch with no plan or a plan with no checks — nothing is judged.

rt_delivery_rerun() {
    command -v node >/dev/null 2>&1 || return 0
    local engine="" candidate out code
    for candidate in "$rt_hooks_dir/../checks/task-flow-script.mjs" "${CLAUDE_PROJECT_DIR:-.}/tools/task-flow-script.mjs"; do
        [ -f "$candidate" ] && engine="$candidate" && break
    done
    [ -n "$engine" ] || return 0
    local dir="${root:-${CLAUDE_PROJECT_DIR:-.}}" pinned run_path="$PATH"
    # The checks run on the node the tree pins in .nvmrc, as they ran when measured: the session may
    # carry another default, and a tree with an engines field refuses it.
    pinned="$(tr -d ' \n' < "$dir/.nvmrc" 2>/dev/null)"
    pinned="${NVM_DIR:-$HOME/.nvm}/versions/node/v${pinned#v}/bin"
    [ -x "$pinned/node" ] && run_path="$pinned:$PATH"
    out="$(cd "$dir" && PATH="$run_path" node "$engine" step --done --pr 2>&1)"
    code=$?
    [ "$code" -eq 0 ] && return 0
    # The move names the steps by their numbers: a line of a step begins with it and does not end matched.
    local steps move
    steps="$(printf '%s\n' "$out" | awk '/^[0-9]+\.[0-9]+ / && !/· совпало$/ { printf "%s`node tools/task-flow-script.mjs step %s`", (n++ ? ", " : ""), $1 }')"
    move="Fix what each step measures and run ${steps:-the step command of each} again: it marks the step done when the check matches."
    printf '%s' "$out" | grep -q 'git revert --no-edit' &&
        move="$move The task folder is taken apart: the command puts it back for the run, and a fix that lies in the folder takes the move the engine named above."
    unmet steps_remeasured no "the done steps of the plan were measured once more before the PR, and not every one matched:
$(printf '%s\n' "$out" | sed 's/^/    /')
$move"
}
