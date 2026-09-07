#!/usr/bin/env bash
# rt-kit v0.25.0 · hooks/task-flow-guard.sh · 8aea0b77bfa4 · правится надстройкой, не здесь
# rt-hook: PreToolUse Edit|Write|MultiEdit|Bash|mcp__webstorm__create_new_file|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: hooks/task-flow-context.sh, hooks/profile-check.sh, hooks/deny-tail.sh
# PreToolUse guard for Edit|Write|MultiEdit: code is not written before the plan.
#
# Work runs over many sessions, and between them the executor remembers nothing. The plan lying on
# disk is the only thing that survives the break: by that moment the changes may be uncommitted, the
# PR not open, and the work queue shows the task as started and says nothing about what is done
# inside it.
#
# The guard demands three things and exactly those: a task folder named after the branch, a plan in
# it and a work state declared in the progress — one of those in which code is edited. It does not
# judge how complete the writing is — that is for the owner (the decisions are in the law
# `docs/constitution/work-conduct.md`).
#
# The product agreement has a guard of its own — `task-flow-draft-guard`, declared on the same
# events. They are kept apart so that a tree can drop one requirement and keep the second: while
# both travelled in one file, dropping the agreement requirement removed the task folder requirement
# along with it, and no tree ever asked to hold them together.
#
# The whole rule — rule `task-flow`.
#
# FAIL-OPEN: no jq, not a git repository, broken input, someone else's tool → pass. A broken guard
# must not get in the way of work.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=task-flow-guard

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parsing the call — shared by both guards of the course of work. The file may not be laid out:
# then there is nothing to judge by, and the guard stays silent.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/task-flow-context.sh" ] && . "$rt_hooks_dir/task-flow-context.sh"
command -v rt_task_flow_context >/dev/null 2>&1 || exit 0

# The shared refusal tail: two lawful moves and the lawful form of a bypass, if the refusal has one.
# The file may not be laid out — then there is no tail, and the reason for the refusal stays as it
# was.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/deny-tail.sh" ] && . "$rt_hooks_dir/deny-tail.sh"

rt_task_flow_context || exit 0

branch="$RT_TF_BRANCH"
root="$RT_TF_ROOT"
tasks_dir="$RT_TF_TASKS_DIR"
main_branch="$RT_TF_MAIN_BRANCH"
dir="$RT_TF_DIR"
plan="$RT_TF_PLAN"

deny() { rt_task_flow_deny "$@"; }

if rt_needs rt_task_branch_ok task-flow-guard && ! rt_task_branch_ok "$branch"; then
    deny "BLOCKED by task-flow: правка кода идёт в ветке под задачу, а текущая ветка — '${branch}'. Заведи задачу (npm run task:new -- --title '…' --slug <slug>) и ветку под её номером, затем повтори. Правило — скил task-flow."
fi

# A folder taken apart by a commit of this branch is the sign that the work is handed over. The plan
# is deliberately off the disk by that minute: the tidy-up stands before the PR opens, because the
# merge button is pressed by a person on the hosting and no room is left for a closing commit after
# the approval. An edit after the tidy-up is an edit by the remarks of the review, and demanding a
# plan for it would lock the branch with an order of its own. The sign is taken from the branch
# history, not from the disk: a folder deleted but not committed does not mean handed-over work.
folder_archived() {
    [ -n "$(git -C "$root" ls-tree -d --name-only HEAD -- "$tasks_dir/$branch" 2>/dev/null | head -1)" ] && return 1
    base="$(git -C "$root" merge-base "$main_branch" HEAD 2>/dev/null)"
    [ -z "$base" ] && return 1
    had="$(git -C "$root" ls-tree -d --name-only "$base" -- "$tasks_dir/$branch" 2>/dev/null | head -1)"
    [ -z "$had" ] && had="$(git -C "$root" log "$base..HEAD" --diff-filter=A --name-only --pretty=format: -- "$tasks_dir/$branch" 2>/dev/null | head -1)"
    [ -n "$had" ]
}

folder_archived && exit 0

if [ ! -f "$plan" ]; then
    deny "BLOCKED by task-flow: нет замысла — '${tasks_dir}/${branch}/plan.md'. Собери папку задачи с образца (cp -r ${tasks_dir}/_template ${tasks_dir}/${branch}) и заполни шапку, след задачи и этапы, затем повтори. Правило — скил task-flow."
fi

# The work state. An artefact on disk does not say whether the work has reached editing code: an
# empty `plan.md`, put there to lift the refusal, lies exactly like a written plan, and lifts the
# requirement by itself. The unit of work is a state, not a file: the executor declares it by a line
# in the progress, and the guard judges the declared transition, not the presence of files.
#
# The state stands in the "Where we stand" section and is rewritten together with it. The name is
# taken from the list — a name of one's own is not a state: the list names the entry, the exit and
# the mandatory action of each, and a word outside the list says nothing about any of the three.
progress="$dir/progress.md"

if [ ! -f "$progress" ]; then
    deny "BLOCKED by task-flow: нет хода работы — '${tasks_dir}/${branch}/progress.md'. В нём объявляется состояние работы, и без него не видно, дошла ли она до правки кода. Собери папку задачи с образца (cp -r ${tasks_dir}/_template ${tasks_dir}/${branch}), затем повтори. Правило — скил task-flow."
fi

state="$(sed -n 's/^[[:space:]]*[-*][[:space:]]*\*\*Состояние:\*\*[[:space:]]*`\([^`]*\)`.*/\1/p' "$progress" 2>/dev/null | head -1)"

# The mandatory action of the state. The refusal names it in full: an executor told only "wrong
# state" rewrites the state line instead of taking the step.
state_action() {
    case "$1" in
        просьба-не-разобрана) printf '%s' 'разведка по дереву, затем вопросы владельцу' ;;
        разбор-закрыт) printf '%s' 'договорённость о продукте либо названная причина её отсутствия' ;;
        договорённость-записана) printf '%s' 'завести задачу, ветку и папку задачи' ;;
        задача-взята) printf '%s' 'написать замысел' ;;
        замысел-записан) printf '%s' 'делать первый этап' ;;
        папка-разобрана) printf '%s' 'снять черновик и попросить владельца влить' ;;
        влито) printf '%s' 'разбор работы правилами и сверка очереди работ' ;;
        *) printf '%s' '' ;;
    esac
}

if [ -z "$state" ]; then
    deny "BLOCKED by task-flow: в '${tasks_dir}/${branch}/progress.md' не объявлено состояние работы. Впиши в раздел «Где стоим» строку '- **Состояние:** \`<имя>\`' — имя из перечня состояний правила, — затем повтори. Код правится в состояниях 'этап-идёт', 'этапы-кончились', 'работа-отдана' и 'разбор-кончился'. Правило — скил task-flow."
fi

case "$state" in
    # States in which the application code is edited. The last three are not about the first session:
    # a run happens to be red and a review comes with remarks, and the fix goes into the same branch.
    этап-идёт | этапы-кончились | работа-отдана | разбор-кончился) ;;
    просьба-не-разобрана | разбор-закрыт | договорённость-записана | задача-взята | замысел-записан | папка-разобрана | влито)
        deny "BLOCKED by task-flow: в ходе работы объявлено состояние '${state}', а код в нём не правится. Обязательное действие этого состояния — $(state_action "$state"). Дошла работа до правки кода — перепиши строку состояния в '${tasks_dir}/${branch}/progress.md' на '- **Состояние:** \`этап-идёт\`'. Правило — скил task-flow."
        ;;
    *)
        deny "BLOCKED by task-flow: в '${tasks_dir}/${branch}/progress.md' объявлено состояние '${state}', а такого в перечне нет. Имя берётся из перечня состояний правила — своё слово не говорит ни о входе, ни о выходе, ни об обязательном действии. Правило — скил task-flow."
        ;;
esac

# The task folder travels into the branch by a commit, it does not live in one working copy. The
# three requirements above look at the disk, and a folder never committed passes them all without a
# single refusal — while the sign of handed-over work is taken from the history, and there it is
# absent. The refusal comes at the last point, at opening the PR, when the folder has already been
# taken apart by one's own hands: there is nothing to fix, the plan is off the disk, and it has to be
# assembled again from memory. For one task that cost eight calls and two refusals in a row.
#
# The second consequence is quieter: progress living in a working copy is visible to nobody. The
# owner sees a branch without a single trace of what is being done in it, and the next session sees
# emptiness instead of "Where we stand", if the working copy changed between sessions.
#
# The same history is asked as for the sign of handed-over work: the folder stands in `HEAD`, or a
# commit of the branch added it. No git — no requirement: there is nothing to ask the history with.
if [ -n "$(git -C "$root" rev-parse --verify HEAD 2>/dev/null)" ]; then
    in_tree="$(git -C "$root" ls-tree -d --name-only HEAD -- "$tasks_dir/$branch" 2>/dev/null | head -1)"
    if [ -z "$in_tree" ]; then
        deny "BLOCKED by task-flow: папка задачи '${tasks_dir}/${branch}' лежит в рабочем дереве, а в историю ветки не заведена. Заведи её коммитом (git add ${tasks_dir}/${branch} && git commit), затем повтори: признак отданной работы гард берёт из истории, и с некоммиченной папкой отказ придёт на открытии заявки — когда папка уже разобрана и чинить нечего. Правило — скил task-flow."
    fi
fi
