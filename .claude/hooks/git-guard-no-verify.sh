#!/usr/bin/env bash
# rt-kit v0.39.1 · hooks/git-guard-no-verify.sh · abffbd1f9fb2 · правится надстройкой, не здесь
# rt-hook: PreToolUse Bash|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: checks/decide.mjs, hooks/decide.sh, hooks/facts.sh, hooks/facts-docs.sh, hooks/git-guard-delivery-signature.sh, hooks/deny-tail.sh, hooks/guard-note.sh
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
RT_GUARD_RULE=git-workflow

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

# The decision, the move and the text come from the decision table. The same command without the skip
# meets the other delivery guards, and the refusal names what they refuse it for first: a commit on
# the main branch, a commit while the contribution carries a foreign signature, the document pair and
# the exam the commit waits for, a push while the heavy steps have no green mark. The hook gathers the
# facts of that state; the decider composes the words.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
. "$rt_hooks_dir/facts.sh" 2>/dev/null
command -v rt_fact_branch >/dev/null 2>&1 || exit 0
sid="$(printf '%s' "$input" | jq -r '.session_id // "nosession"' 2>/dev/null)"
record="$(rt_fact_transcript "$input")"
main_branch=main
on_main=no
signed=yes
signature=''
doc_pair=yes
problems=''
workdir="$(rt_hook_cwd)"
[ -z "$workdir" ] && workdir="${CLAUDE_PROJECT_DIR:-.}"
if cd "$workdir" 2>/dev/null && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}"
    for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "$root/.claude/rt-kit/defaults/project.sh" "$root/.claude/rt-kit/project.sh"; do
        # shellcheck disable=SC1090
        [ -f "$profile" ] && . "$profile" >/dev/null 2>&1 </dev/null
    done
    commit_email="${RT_COMMIT_EMAIL:-}"
    main_branch="${RT_MAIN_BRANCH:-main}"
    if printf '%s\n' "$hits" | grep -q '^commit'; then
        plain="$(printf '%s' "$cmd" | sed -E 's/[[:space:]](--no-verify|--no-verif|--no-veri|-n)([[:space:]]|$)/ /g')"
        if [ "$(rt_fact_branch)" = "$main_branch" ]; then
            on_main=yes
        else
            # shellcheck disable=SC1091
            [ -f "$rt_hooks_dir/git-guard-delivery-signature.sh" ] && . "$rt_hooks_dir/git-guard-delivery-signature.sh" 2>/dev/null
            command -v rt_signature_commit_note >/dev/null 2>&1 && signature="$(rt_signature_commit_note)"
            [ -n "$signature" ] && signed=no
            # shellcheck disable=SC1091
            [ -f "$rt_hooks_dir/facts-docs.sh" ] && . "$rt_hooks_dir/facts-docs.sh" 2>/dev/null
            if command -v rt_fact_doc_problems >/dev/null 2>&1 && rt_fact_doc_problems "$plain"; then
                [ -n "$problems" ] && doc_pair=no
            fi
        fi
    fi
fi

action=push_skip_hooks
printf '%s\n' "$hits" | grep -q '^commit' && action=commit_skip_hooks
facts="$(jq -cn --arg r "$(rt_fact_rule_loaded git-workflow "$sid")" --arg m "$on_main" --arg s "$signed" --arg d "$doc_pair" \
    --arg e "$(rt_fact_exam_holds "$record")" --arg w "$(rt_fact_window_over_stop "$sid" "$record")" \
    '{rule_loaded:$r, branch_is_main:$m, commits_signed_declared:$s, doc_pair:$d, exam:$e, window_over_stop:$w}')"
params="$(jq -cn --arg w "$what" --arg m "$main_branch" --arg s "$signature" --arg p "$problems" \
    --arg a "bash ${rt_hooks_dir#"$PWD"/}/git-guard-push-ahead.sh" \
    '{what:$w, main_branch:$m, signature:$s, problems:$p, ahead_cmd:$a}')"
# shellcheck disable=SC1091
. "$rt_hooks_dir/decide.sh" 2>/dev/null
command -v rt_decide >/dev/null 2>&1 && rt_decide git-guard-no-verify.sh "$action" "$facts" "$params"
exit 0
