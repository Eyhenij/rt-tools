#!/usr/bin/env bash
# rt-kit v0.29.2 · hooks/git-guard-no-verify.sh · 15a607490d1c · правится надстройкой, не здесь
# rt-hook: PreToolUse Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: hooks/deny-tail.sh, hooks/guard-note.sh
# Guard of the commit hooks. PreToolUse on a git commit or push that skips the tree's git hooks.
#
# The commit hooks check the message, the formatting and the document pair; the push gate does not
# read commit messages. A commit made past the hooks therefore reaches the host unchecked: an amend
# that fixed a one-letter typo in the subject went that way, and the message nobody checked was
# pushed. The rule `git-workflow` says: an amend goes through the same hooks as a commit, and a
# commit that skipped them is redone without the skip before the push.
#
# What counts as a skip, read in the command position of `git commit` and `git push`:
#
#   --no-verify   — on both verbs, the full name or its abbreviation down to `--no-veri`
#   -n            — on `git commit` only, alone or in a cluster of short keys before a key that
#                   takes a value (`-nm`, `-an`); on `git push` `-n` is a dry run and passes
#   -c core.hooksPath=<path> — between `git` and the verb: the hooks are looked for elsewhere
#   HUSKY=0       — an environment assignment in front of the call: the hook runner stays silent
#
# Text inside quotes and the value of a key that takes one (`-m`, `-F` and the rest) are not read:
# a commit message naming the flag is not a skip.
#
# There is no lawful bypass: the owner forbade skipping the checks for any edit.
#
# FAIL-OPEN: no awk, broken input, a tool that is not a command — pass. A broken guard must not get
# in the way of work.

RT_GUARD_NAME=git-guard-no-verify

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

command -v awk >/dev/null 2>&1 || exit 0

# One line per skipping call: the verb and the form of the skip. A line of the command ends a call
# the same way a separator does, so a verb never carries over into the next line.
hits="$(printf '%s\n' "$cmd" | awk -v sq="'" '
    function reset_call() { verb = ""; husky = 0; hookspath = 0; skip_value = 0; quote = "" }
    function report(form) { if (verb == "commit" || verb == "push") print verb " " form }
    function takes_value(w) {
        return w == "-m" || w == "-F" || w == "-c" || w == "-C" || w == "-t" || w == "-o" \
            || w == "--message" || w == "--file" || w == "--template" || w == "--author" \
            || w == "--date" || w == "--reuse-message" || w == "--reedit-message" \
            || w == "--fixup" || w == "--squash" || w == "--push-option" || w == "--repo"
    }
    BEGIN { reset_call() }
    {
        reset_call()
        for (i = 1; i <= NF; i++) {
            word = $i
            # Text inside quotes is a value, not a key: skipped up to the closing quote.
            if (quote != "") {
                if (substr(word, length(word), 1) == quote) quote = ""
                continue
            }
            first = substr(word, 1, 1)
            if ((first == sq || first == "\"") && !(length(word) > 1 && substr(word, length(word), 1) == first)) {
                quote = first
                skip_value = 0
                continue
            }
            if (word == "&&" || word == "||" || word == ";" || word == "|") { reset_call(); continue }
            if (skip_value) { skip_value = 0; continue }
            if (verb == "" && word ~ /^HUSKY=0$/) { husky = 1; continue }
            base = word
            sub(/^.*\//, "", base)
            if (verb == "" && base == "git") {
                for (j = i + 1; j <= NF; j++) {
                    arg = $j
                    if (arg == "-c") {
                        if (tolower($(j + 1)) ~ /^core\.hookspath=/) hookspath = 1
                        j++
                        continue
                    }
                    if (arg == "-C" || arg == "--git-dir" || arg == "--work-tree" \
                        || arg == "--namespace" || arg == "--exec-path") { j++; continue }
                    if (substr(arg, 1, 1) == "-") continue
                    verb = arg
                    break
                }
                i = j
                if (husky) report("HUSKY=0")
                if (hookspath) report("-c core.hooksPath")
                continue
            }
            if (verb == "") continue
            if (word ~ /^--no-veri(f|fy)?$/) { report("--no-verify"); continue }
            if (takes_value(word)) { skip_value = 1; continue }
            if (verb == "commit" && word ~ /^-[a-zA-Z]+$/) {
                # A cluster of short keys: the letters after a key that takes a value are that value.
                for (k = 2; k <= length(word); k++) {
                    ch = substr(word, k, 1)
                    if (ch == "n") { report("-n"); break }
                    if (index("mFcCtS", ch) > 0) break
                }
            }
        }
    }
' 2>/dev/null | sort -u)"
[ -z "$hits" ] && exit 0

what="$(printf '%s\n' "$hits" | sed 's/^/git /' | paste -sd ',' - | sed 's/,/, /g')"

reason="BLOCKED by git-guard-no-verify: «${what}» skips the git hooks of the tree.

The commit hooks check the message, the formatting and the document pair, and the push gate does not read commit messages: a commit made past the hooks reaches the host unchecked. An amend goes through the same hooks as a commit, a one-letter typo included. Run the same command without the skip; when a hook refuses, fix what it names. A commit already made past the hooks is redone without the skip before the push — the rule git-workflow."

# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail)"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"A git commit or push that skips the git hooks is refused. Run it without the skip."}}\n'

exit 0
