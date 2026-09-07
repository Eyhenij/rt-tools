#!/usr/bin/env bash
# rt-kit v0.25.0 · hooks/task-flow-context.sh · a92867fc942f · правится надстройкой, не здесь
# Shared parsing for the work-conduct guards. NOT a guard: it has no `rt-hook:` declaration and
# is not attached to any agent event. The guards themselves source it — the same way they source
# the shared refusal tail.
#
# Why it exists. The work-conduct requirements are kept by two guards — the task folder with the
# plan and the state by one, the product agreement by the other — and both parse the same things:
# which path the call writes, whether it is application code, in which branch the edit goes and
# where the task folder lies. Laid out twice, this parsing drifts silently: an edit to one guard
# fixes half of the cases, and that shows only where the other guard kept silent.
#
# WHAT IT DOES. Reads the input, loads the tree profile, takes the paths out of the call, picks
# the first application-code path among them, moves into the working directory of the edit and
# names the branch, the root, the task folders directory, the folder itself and the plan in it.
#
# WHAT IT DOES NOT DO. It judges nothing and refuses nothing: the branch name, the presence of
# the folder, the work state and the agreement are the business of the guards themselves, and the
# refusal is printed by the one whose requirement it is.
#
# FAIL-OPEN: no jq, not a git repository, broken input, a foreign tool, no profile function →
# the answer is "nothing to judge". Broken parsing must not get in the way of work.

# Parsing the call. Returns 0 and sets the variables if the edit touches application code in a
# branch with history; otherwise a non-zero code, and the guard exits silently.
#
#   RT_TF_PATH        — the application-code path because of which the guard judges at all
#   RT_TF_BRANCH      — the current branch of the edit's working directory
#   RT_TF_ROOT        — the root of the working tree
#   RT_TF_TASKS_DIR   — the task folders directory, as the tree names it
#   RT_TF_MAIN_BRANCH — the main branch of the tree
#   RT_TF_DIR         — the folder of this task
#   RT_TF_PLAN        — the plan in it
# The laid-out rules layer is judged on a par with application code. No code path covers it — it
# lies in the laws directory, in the agent directory and among the checks — and a hundred and
# fifty of its files landed without a single response from the guard; it refused two turns later,
# on a write into the task folder. The sign is the same one by which the layer finds the rules
# gate: the layout header at the top of the file. The package resource the layout comes from
# carries no header and is still judged by its path.
rt_tf_laid_out() {
    [ -f "$1" ] || return 1
    head -n 3 "$1" 2>/dev/null | grep -q 'rt-kit v[^[:space:]]* ·'
}

rt_task_flow_context() {
    rt_tf_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

    # shellcheck disable=SC1090
    . "$rt_tf_hooks_dir/utf8.sh" 2>/dev/null || true
    # shellcheck disable=SC1090
    . "$rt_tf_hooks_dir/hook-input.sh" 2>/dev/null || true

    command -v rt_hook_read >/dev/null 2>&1 || return 1
    rt_hook_read
    [ -z "$RT_HOOK_INPUT" ] && return 1
    command -v jq >/dev/null 2>&1 || return 1

    # The tree profile: the package default first, the project override on top of it if there is
    # one. Read before the path parsing: it is the profile that takes paths out of a shell command.
    for rt_tf_profile in \
        "$rt_tf_hooks_dir/../rt-kit/defaults/project.sh" \
        "$rt_tf_hooks_dir/../defaults/project.sh" \
        "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" \
        "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
        # shellcheck disable=SC1090
        [ -f "$rt_tf_profile" ] && . "$rt_tf_profile" 2>/dev/null
    done

    # A word about a missing profile function: a hook that exited silently cannot be told from a
    # working one. The file may not be laid out — then the old behaviour, the silent one, stays.
    # shellcheck disable=SC1090
    [ -f "$rt_tf_hooks_dir/profile-check.sh" ] && . "$rt_tf_hooks_dir/profile-check.sh"
    command -v rt_needs >/dev/null 2>&1 || rt_needs() { command -v "$1" >/dev/null 2>&1; }

    rt_tf_tool="$(rt_hook_tool)"
    rt_tf_candidates=""
    case "$rt_tf_tool" in
        # The editor tool creates a file with the same two pieces of data, only under different
        # names — without this branch an edit would pass the guard by switching the tool.
        Edit | Write | MultiEdit | mcp__webstorm__create_new_file)
            rt_tf_candidates="$(printf '%s' "$RT_HOOK_INPUT" | jq -r '.tool_input.file_path // .tool_input.pathInProject // empty' 2>/dev/null)"
            ;;
        # The second tier: the same edit, made by a shell command. Without it the guard's refusal
        # is bypassed by switching not the tool but the way of writing — a redirect, `sed -i`, an
        # interpreter with a heredoc.
        #
        # The IDE terminal runs the same command line and puts it into the same field: without
        # these two names the guard would stand declared on them and let them through silently —
        # a state worse than undeclared, because from outside it looks closed.
        Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool)
            rt_tf_cmd="$(rt_hook_cmd)"
            [ -z "$rt_tf_cmd" ] && return 1
            # The universal runner hides the real command in a nested string: without parsing it
            # the path stands behind a quote, and no pattern reaches it.
            if [ "$rt_tf_tool" = "mcp__webstorm__execute_tool" ] && command -v perl >/dev/null 2>&1; then
                rt_tf_inner="$(printf '%s' "$rt_tf_cmd" | perl -0ne '
                    if (/--command(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(.+))/s) {
                        print defined $1 ? $1 : (defined $2 ? $2 : $3);
                    }
                ' 2>/dev/null)"
                [ -n "$rt_tf_inner" ] && rt_tf_cmd="$rt_tf_inner"
            fi
            # The task creation command is not judged at all. It writes the task folder and the
            # card in the work queue, and its text carries the whole task body: a quote with the
            # "greater than" sign matches the write sign, a code path in the body's prose matches
            # the path sign. Refused, it is refused by the very guard that prints it in the text
            # of its refusal, and there is nothing left to create a task with — neither from the
            # branch of a closed task nor from the main one. The command name comes from the tree
            # profile: a copy of its own would drift from it silently.
            case "$rt_tf_cmd" in
                *"${RT_TASK_NEW_CMD:-npm run task:new}"*) return 1 ;;
            esac
            # Pruning stale records of finished work is not judged either. Records age by the
            # calendar, and the age check turns red by itself, without an edit in the branch; in
            # the branch where work arrives by merges there is no task folder and must not be,
            # and without a plan the edit is not written — the PR stays red, and the executor has
            # no way out of this pair. The tree profile names the command: not named — no
            # exemption, and everything is as before. The whole command is compared, not a
            # substring: in a chain through `&&` anything at all stands next to the pruning, and a
            # substring exemption would become a hole as wide as the shell.
            if [ -n "${RT_ARCHIVE_PRUNE_CMD:-}" ]; then
                rt_tf_bare="$(printf '%s' "$rt_tf_cmd" | tr -s '[:space:]' ' ' | sed 's/^ //; s/ $//')"
                [ "$rt_tf_bare" = "$RT_ARCHIVE_PRUNE_CMD" ] && return 1
            fi
            rt_needs rt_shell_writes task-flow-guard || return 1
            rt_needs rt_shell_paths task-flow-guard || return 1
            rt_shell_writes "$rt_tf_cmd" || return 1
            rt_tf_candidates="$(rt_shell_paths "$rt_tf_cmd")"
            ;;
        *) return 1 ;;
    esac
    [ -z "$rt_tf_candidates" ] && return 1

    # The sign "the edit changes behaviour" is a path, not a judgement by eye: a judgement is
    # made by whoever it hinders, and the threshold drifts. Where application code lives, the
    # profile knows: rules, texts, tooling and dependencies do not fall under the requirement —
    # otherwise the grill of a task could not be conducted before the branch is created.
    rt_needs rt_is_app_code task-flow-guard || return 1

    # Removal differs from a write in one thing: what is removed may not be in history at all. A
    # temporary directory of one's own under the applications root is never a product edit —
    # removing it, and restoring the plan on disk for that, means carrying out a requirement
    # written about a different action. A tracked path is judged as before: a removed code file
    # changes behaviour just as a rewritten one does.
    rt_tf_removes=0
    case "${rt_tf_cmd:-}" in
        *"rm "*) rt_tf_removes=1 ;;
    esac
    # The directory of the edit: the branch and the history are looked at below, but history has
    # to be asked already here.
    rt_tf_askdir="$(rt_hook_cwd)"
    [ -z "$rt_tf_askdir" ] && rt_tf_askdir="${CLAUDE_PROJECT_DIR:-.}"

    # Every named path is judged: a command writes as many files as stand in it, and one under
    # the requirement is enough to refuse it whole.
    RT_TF_PATH=""
    while IFS= read -r rt_tf_candidate; do
        [ -z "$rt_tf_candidate" ] && continue
        # Removing what is not in history is not a product edit but cleaning up after oneself.
        # The path is asked as it is named in the command: a glued-on root takes the question
        # into a foreign tree.
        if [ "$rt_tf_removes" = 1 ] && git -C "$rt_tf_askdir" rev-parse --is-inside-work-tree >/dev/null 2>&1 &&
            ! git -C "$rt_tf_askdir" ls-files --error-unmatch -- "$rt_tf_candidate" >/dev/null 2>&1; then
            continue
        fi
        case "$rt_tf_candidate" in
            /*) ;;
            *) rt_tf_candidate="${CLAUDE_PROJECT_DIR:-.}/$rt_tf_candidate" ;;
        esac
        if rt_is_app_code "$rt_tf_candidate" || rt_tf_laid_out "$rt_tf_candidate"; then
            RT_TF_PATH="$rt_tf_candidate"
            break
        fi
    done <<EOF
$rt_tf_candidates
EOF
    [ -z "$RT_TF_PATH" ] && return 1

    # The branch is looked at where the edit will go: a worktree has one of its own.
    rt_tf_workdir="$(rt_hook_cwd)"
    [ -z "$rt_tf_workdir" ] && rt_tf_workdir="${CLAUDE_PROJECT_DIR:-.}"
    cd "$rt_tf_workdir" 2>/dev/null || return 1
    git rev-parse --is-inside-work-tree >/dev/null 2>&1 || return 1

    RT_TF_BRANCH="$(git branch --show-current 2>/dev/null)"
    [ -z "$RT_TF_BRANCH" ] && return 1   # detached HEAD — не про наш случай

    RT_TF_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
    [ -z "$RT_TF_ROOT" ] && return 1

    # The task folders directory: each tree has its own, but the name is usually shared.
    RT_TF_TASKS_DIR="${RT_TASKS_DIR:-docs/tasks}"
    RT_TF_MAIN_BRANCH="${RT_MAIN_BRANCH:-main}"
    RT_TF_DIR="$RT_TF_ROOT/$RT_TF_TASKS_DIR/$RT_TF_BRANCH"
    RT_TF_PLAN="$RT_TF_DIR/plan.md"

    return 0
}

# The refusal of a work-conduct guard: the reason as the first parameter, the lawful form of
# bypass as the second. The tail is appended here, not in every text: missed in one place, it
# reads as "this refusal has no moves". The tail may not be laid out — then there is none, and
# the reason stays as it was.
rt_task_flow_deny() {
    rt_tf_reason="$1"
    if command -v rt_deny_tail >/dev/null 2>&1; then
        rt_tf_tail="$(rt_deny_tail "$2")"
        [ -n "$rt_tf_tail" ] && rt_tf_reason="$1 ${rt_tf_tail}"
    fi
    jq -n --arg r "$rt_tf_reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
        || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"%s"}}\n' "$rt_tf_reason"
    exit 0
}
