#!/usr/bin/env bash
# rt-kit v0.28.0 · hooks/git-guard-discard.sh · 250b38a99c36 · правится надстройкой, не здесь
# rt-hook: PreToolUse Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: hooks/deny-tail.sh, hooks/guard-note.sh
# Guard of the working tree. PreToolUse on a git command that throws uncommitted edits away.
#
# `git reset --hard`, `git checkout -- <path>`, `git restore <path>` and `git clean -f` erase what
# lies in the working tree and is not committed, and git keeps no object of it: `git fsck
# --lost-found` finds nothing afterwards. In one working copy two sessions work at once, so the
# erased edits are as often a neighbour's as one's own — seven files of a neighbouring task went
# that way, and there was nothing to restore them from. The rule `git-workflow` says: a commit is
# dropped by `--soft`, and `--hard` is taken only to discard edits named before the call.
#
# The guard judges two things: the verb with its discarding form in the command, and a non-empty
# working tree in the directory the command runs in. A clean tree passes: there is nothing to lose.
# The lawful bypass is the comment `# discard: <reason>` in the same command — the edits are named
# by whoever throws them away.
#
# FAIL-OPEN: not a repository, no git, no parser, broken input — pass. A broken guard must not get
# in the way of work.

RT_GUARD_NAME=git-guard-discard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0

tool="$(rt_hook_tool)"
case "$tool" in
    Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool) ;;
    *) exit 0 ;;
esac

cmd="$(rt_hook_cmd)"

# The universal executor of the environment passes the real command as a nested string.
if [ "$tool" = "mcp__webstorm__execute_tool" ] && command -v perl >/dev/null 2>&1; then
    inner="$(printf '%s' "$cmd" | perl -0ne '
        if (/--command(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(.+))/s) {
            print defined $1 ? $1 : (defined $2 ? $2 : $3);
        }
    ' 2>/dev/null)"
    [ -n "$inner" ] && cmd="$inner"
fi

# The bypass: the reason stands in the command itself, after the discard mark. An empty reason is
# no bypass — a mark without words names nothing.
if printf '%s' "$cmd" | grep -qE '#[[:space:]]*discard:[[:space:]]*[^[:space:]]'; then
    exit 0
fi

command -v awk >/dev/null 2>&1 || exit 0

# The verb is looked for in the command position, the same way the main-branch guard does it: the
# options between `git` and the verb are skipped, and the verb's own arguments are read on to the
# end of the shell word list of that call. Printed is one line per discarding call: the verb and
# the sign that makes it discarding.
#
#   reset    — `--hard` among the arguments
#   checkout — `--` among the arguments, or a lone `.` (a path, not a branch)
#   restore  — any argument without a leading dash, unless `--staged` alone is asked
#   clean    — `-f`, `-fd`, `-df`, `--force` among the arguments
hits="$(printf '%s\n' "$cmd" | awk '
    function flush() {
        if (verb == "reset" && hard) print "reset --hard"
        if (verb == "checkout" && (dashdash || dot)) print "checkout --"
        if (verb == "restore" && path && !staged) print "restore"
        if (verb == "clean" && force) print "clean -f"
        verb = ""; hard = 0; dashdash = 0; dot = 0; path = 0; staged = 0; force = 0
    }
    {
        for (i = 1; i <= NF; i++) {
            word = $i
            if (word == "&&" || word == "||" || word == ";" || word == "|") { flush(); continue }
            sub(/^.*\//, "", word)
            if (word == "git") {
                flush()
                for (j = i + 1; j <= NF; j++) {
                    arg = $j
                    if (arg == "-c" || arg == "-C" || arg == "--git-dir" || arg == "--work-tree" \
                        || arg == "--namespace" || arg == "--exec-path") { j++; continue }
                    if (substr(arg, 1, 1) == "-") continue
                    verb = arg
                    break
                }
                i = j
                continue
            }
            if (verb == "") continue
            if (word == "--hard") hard = 1
            if (word == "--") dashdash = 1
            if (word == ".") dot = 1
            if (word == "--staged" || word == "-S") staged = 1
            if (word == "-f" || word == "-fd" || word == "-df" || word == "-fdx" || word == "-fx" \
                || word == "-xf" || word == "-dfx" || word == "--force") force = 1
            if (substr(word, 1, 1) != "-") path = 1
        }
    }
    END { flush() }
' 2>/dev/null)"
[ -z "$hits" ] && exit 0

# The tree is read in the directory the command runs in: a separate working copy has a tree of its
# own, and the project root would answer for the wrong one.
workdir="$(rt_hook_cwd)"
[ -z "$workdir" ] && workdir="${CLAUDE_PROJECT_DIR:-.}"
cd "$workdir" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

# `clean` erases what is untracked; the other three erase what is tracked and changed. Each is
# judged by the part of the tree it can lose.
if printf '%s\n' "$hits" | grep -q '^clean'; then
    changed="$(git status --porcelain --untracked-files=all 2>/dev/null)"
else
    changed="$(git status --porcelain --untracked-files=no 2>/dev/null)"
fi
[ -z "$changed" ] && exit 0

count="$(printf '%s\n' "$changed" | grep -c .)"
files="$(printf '%s\n' "$changed" | sed 's/^...//' | head -20 | sed 's/^/    /')"
[ "$count" -gt 20 ] && files="${files}
    … and $((count - 20)) more"
what="$(printf '%s\n' "$hits" | sort -u | paste -sd ',' - | sed 's/,/, /g')"

reason="BLOCKED by git-guard-discard: «git ${what}» throws away uncommitted edits, and the working tree holds ${count} of them:
${files}

Git keeps no object of an uncommitted edit: after this call there is nothing to restore it from. In one working copy two sessions work at once, so these files may be a neighbour's as well as your own. To drop a commit and keep the edits, take \`git reset --soft\`; to keep them aside, commit or stash them by name first. \`--hard\` is taken only when the goal is to throw the edits away, and then they are named before the call — the rule git-workflow."

# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail 'the comment `# discard: <reason>` in the same command, the erased files named in the reason')"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"A discarding git command on a dirty working tree is refused. Commit or name the edits first."}}\n'

exit 0
