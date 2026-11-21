#!/usr/bin/env bash
# The scenarios of the gate map branches of the task loop: which edits and which commands demand
# the rule `task-delivery-loop`, and which stay as they were.
#
# The map of this tree, `.claude/rt-kit/gate-map.sh`, is sourced over the package default the way
# the gate sources it. The paths are given as the gate gives them: from a copy's root, with the
# prefix of a working copy already stripped.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the gate map: the task loop"

ROOT="$(cd "$TOOLS/.." && pwd)"
# shellcheck disable=SC1091
. "$ROOT/.claude/rt-kit/defaults/gate-map.sh"
# shellcheck disable=SC1091
. "$ROOT/.claude/rt-kit/gate-map.sh"

# The rules the map prints, joined by a space.
rules() {
    skill_for "$1" "$2" "" 2>/dev/null | tr '\n' ' ' | sed 's/ $//'
}

# Whether the loop is among them: «loop» or «none».
loop() {
    case " $(rules "$1" "$2") " in
        *' task-delivery-loop '*) echo loop ;;
        *) echo none ;;
    esac
}

P=/x/rt-tools
G=git
H=gh

report "a task folder edit demands the loop first, then task-flow and task-flow-plan" "$(rules edit "$P/docs/tasks/RT-1-x/plan.md")" "task-delivery-loop task-flow task-flow-plan"
report "an epic plan edit demands the loop" "$(loop edit "$P/docs/plans/x.md")" loop
report "a spec edit stays with its rule" "$(rules edit "$P/docs/specs/core/spec.md")" "spec-driven"
report "a component edit stays with its rule" "$(rules edit "$P/projects/ui-kit-v2/src/x.component.ts")" "component-structure"
report "a file with no rule stays silent" "$(rules edit "$P/README.txt")" ""

report "task:new demands the loop" "$(loop bash "npm run task:new -- --outside-epic x --title y")" loop
report "task:new with a flag of npm demands the loop" "$(loop bash "npm run -s task:new -- --epic-of 5 --title y")" loop
report "checkout -b demands the loop" "$(loop bash "$G checkout -b RT-1-x origin/main")" loop
report "checkout -q -b demands the loop" "$(loop bash "$G checkout -q -b RT-1-x origin/main")" loop
report "switch -c demands the loop" "$(loop bash "$G switch -c RT-1-x")" loop
report "git -C <dir> checkout -b demands the loop" "$(loop bash "$G -C /x checkout -b RT-1-x")" loop
report "worktree add -b demands the loop" "$(loop bash "$G worktree add -b RT-1-x ../x origin/main")" loop
report "push demands the loop" "$(loop bash "$G push -u origin RT-1-x")" loop
report "git -C <dir> push demands the loop" "$(loop bash "$G -C /x push")" loop
report "pr create by the full path demands the loop" "$(loop bash "/opt/homebrew/bin/$H pr create --base main")" loop
report "pr create after a token prefix demands the loop" "$(loop bash "GH_TOKEN=\"\$(cat f)\" $H pr create --base main")" loop
report "pr create after command demands the loop" "$(loop bash "command $H pr create --base main")" loop
report "pr create through a variable demands the loop" "$(loop bash "GH=/opt/homebrew/bin/gh; \$GH pr create --base main")" loop

report "pr create through a quoted variable demands the loop" "$(loop bash "\"\$GH\" pr create --base main")" loop
report "pr create through a variable with a default demands the loop" "$(loop bash "\${GH:-gh} pr create --base main")" loop
report "pr new, the alias of create, demands the loop" "$(loop bash "$H pr new --base main")" loop
report "the task command by its script demands the loop" "$(loop bash "node tools/task-new.mjs --outside-epic x --title y")" loop
report "task:new in quotes demands the loop" "$(loop bash "npm run \"task:new\" -- --title y")" loop
report "push after -c keys demands the loop" "$(loop bash "$G -c user.email=x push -u origin RT-1-x")" loop
report "push after --no-pager demands the loop" "$(loop bash "$G --no-pager push")" loop
report "switch -C demands the loop" "$(loop bash "$G switch -C RT-1-x")" loop
report "switch --create demands the loop" "$(loop bash "$G switch --create RT-1-x")" loop
report "checkout -b glued to the name demands the loop" "$(loop bash "$G checkout -bRT-1-x origin/main")" loop
report "worktree add with -b after the path demands the loop" "$(loop bash "$G worktree add ../x -b RT-1-x origin/main")" loop
report "branch <name> demands the loop" "$(loop bash "$G branch RT-1-x origin/main")" loop

report "status stays silent" "$(rules bash "$G status")" ""
report "branch --list does not demand the loop" "$(loop bash "$G branch --list 'RT-1-*'")" none
report "stash push does not demand the loop" "$(loop bash "$G stash push -m x")" none
report "checkout of a file does not demand the loop" "$(loop bash "$G checkout -- README.md")" none
report "a plain checkout of a branch does not demand the loop" "$(loop bash "$G checkout main")" none
report "pr view does not demand the loop" "$(loop bash "$H pr view 5")" none

suite_result "gate-map-loop"
