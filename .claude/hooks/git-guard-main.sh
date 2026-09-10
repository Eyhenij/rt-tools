#!/usr/bin/env bash
# rt-kit v0.27.0 · hooks/git-guard-main.sh · 0a7a758d1ff4 · правится надстройкой, не здесь
# rt-hook: PreToolUse Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: hooks/deny-tail.sh, hooks/guard-note.sh
# Guard of the main branch. PreToolUse on a commit call.
#
# A commit into the main branch bypasses the branch, the PR and the review, while delivery is built
# on them entirely — rule `git-workflow`. A direct commit there is almost always a miss: "stayed on
# main after merging the previous PR".
#
# The name of the main branch is not hard-wired as a string: first the pointer of the remote
# repository is asked, then the existing `origin/main` and `origin/master` are tried, and only at
# the end `main` is taken.
#
# FAIL-OPEN: not a repository, no git, a detached HEAD, broken input — pass. A broken guard must not
# get in the way of work.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=git-guard-main

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0

tool="$(rt_hook_tool)"
# The terminal of the development environment runs the same command line and puts it into the same
# field. While the guard judged the shell alone, its whole point was bypassed by switching tools.
case "$tool" in
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool) ;;
    *) exit 0 ;;
esac

cmd="$(rt_hook_cmd)"

# The universal executor of the environment passes the real command as a nested string. It is the
# one to parse, not the wrapper: otherwise the command name stands right after a quote and no rule
# reaches it.
if [ "$tool" = "mcp__webstorm__execute_tool" ] && command -v perl >/dev/null 2>&1; then
    inner="$(printf '%s' "$cmd" | perl -0ne '
        if (/--command(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(.+))/s) {
            print defined $1 ? $1 : (defined $2 ? $2 : $3);
        }
    ' 2>/dev/null)"
    [ -n "$inner" ] && cmd="$inner"
fi
# The verb is looked for in the command position, not as a substring in the line.
#
# A bare search for "git commit" misses in both directions. A call with an option between `git` and
# the verb slips past it — `git -c user.name=… commit`, `git -C <tree> commit` — and that is exactly
# how one commits under the machine account. And it catches a line where these two words stand next
# to each other for another reason: `git log --grep 'git commit'`, parsing someone else's output,
# the text of a message. A refusal on reading the history costs more than a miss: a guard that gets
# in the way of reading is switched off on the first day.
#
# The parsing is simple: for every word `git` in the line the options are skipped — on their own and
# together with a value, if the option takes one — and the first word without a dash is the verb.
# There can be several `git` words in a line (`git add . && git commit`), so the verbs of all of
# them are printed and the list is judged as a whole.
if command -v awk >/dev/null 2>&1; then
    verbs="$(printf '%s\n' "$cmd" | awk '
        {
            for (i = 1; i <= NF; i++) {
                word = $i
                sub(/^.*\//, "", word)
                if (word != "git") continue
                for (j = i + 1; j <= NF; j++) {
                    arg = $j
                    if (arg == "-c" || arg == "-C" || arg == "--git-dir" || arg == "--work-tree" \
                        || arg == "--namespace" || arg == "--exec-path") { j++; continue }
                    if (substr(arg, 1, 1) == "-") continue
                    print arg
                    break
                }
            }
        }
    ' 2>/dev/null)"
    printf '%s\n' "$verbs" | grep -qx 'commit' || exit 0
else
    # No parser — the former sign remains: it lies in both directions, but without it the guard
    # judges nothing at all.
    case "$cmd" in
        *git\ commit*) ;;
        *) exit 0 ;;
    esac
fi

# The commit will run in the working directory of the call, so the branch is looked at there too;
# the project root is the fallback, and it matters for a separate working tree with a branch of its
# own.
workdir="$(rt_hook_cwd)"
[ -z "$workdir" ] && workdir="${CLAUDE_PROJECT_DIR:-.}"
cd "$workdir" 2>/dev/null || exit 0

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

branch="$(git branch --show-current 2>/dev/null)"
[ -z "$branch" ] && exit 0   # a detached HEAD is not about this case

default="$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null | sed 's#^origin/##')"
if [ -z "$default" ]; then
    for candidate in main master; do
        if git show-ref --verify --quiet "refs/remotes/origin/$candidate" 2>/dev/null; then
            default="$candidate"
            break
        fi
    done
fi
[ -z "$default" ] && default="main"

[ "$branch" = "$default" ] || exit 0

reason="Refused: a commit straight into «${default}». Work travels through a branch and a PR — the rule git-workflow. Create a branch by a separate call and commit into it: the staged changes stay in place. If a commit into ${default} really is needed — ask the owner, do not bypass it yourself."

# The shared deny tail: the two lawful moves and the lawful form of bypass, if the refusal has one.
# The file may not be laid out — then there is no tail, and the refusal reason stays as it is.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"A commit into the main branch is refused. Create a branch."}}\n'

exit 0
