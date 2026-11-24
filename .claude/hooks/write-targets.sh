#!/usr/bin/env bash
# rt-kit v0.39.1 · hooks/write-targets.sh · 5c1687ca44e2 · правится надстройкой, не здесь
# Write targets named by the shell command outright: redirection, `tee`, an in-place edit, a copy
# over the top, and for an interpreter — the paths from its body. Prints one per line.
#
# NOT a guard: it has no `rt-hook:` declaration and hooks into no agent event. The guards that judge
# a shell command source it: the paths a command writes to are read one way by all of them.
#
# There is deliberately no `# rt-hook:` line here: this is a helper, not a hook. It decides nothing
# by itself and is called from where an edit of a file is judged — by the guard of the place of the
# edit and by the exam guard. It is shared because the sign of a write is one and the same for both:
# having diverged, two copies would let through different forms of a write, and there would be
# nothing to notice it by.
#
# The shared sign of a write is deliberately not taken here — it is wide, it holds the name of the
# interpreter too, and running a laid-out check would read as an edit of the check itself. Taking a
# copy is not included either: a copied file is put in place again by the layout, and that is how a
# copy overwritten by the formatter is fixed.
#
# An interpreter with code in an argument or in a body is a special case, and without it the guards
# had a hole exactly in the direction in which edits are made most often. The write path stands
# there inside the code — in the call that writes the file: from the outside the command looks like
# running an interpreter, not like a write. A laid-out copy was edited that way silently, and it was
# the layout that caught it — at the build, when the edit is written in full and has to be carried
# over by hand.

# The words of a command, and the code it hands to an interpreter. Without the first nothing is named,
# and the guards pass the action; without the second the code is not read.
# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/shell-words.sh" 2>/dev/null || true
command -v rt_shell_words >/dev/null 2>&1 || rt_shell_words() { cat >/dev/null; }
# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/code-writes.sh" 2>/dev/null || true
command -v rt_code_writes >/dev/null 2>&1 || rt_code_writes() { cat >/dev/null; }

# The literals of the variables and the script files of a command. No helper — neither is read.
# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/script-files.sh" 2>/dev/null || true
[ -n "${RT_SF_EXPAND:-}" ] || RT_SF_EXPAND='function rt_vars_read() {} function rt_expand(w, depth) { en = 1; ev[1] = w }'

# The targets as they stand from the directory of their call: a literal one joins them, the root of the
# tree by name leaves them as they are, and one the text computes otherwise is none of the tree's. A command
# further inside starts in the directory it is called from.
rt_wt_from_dir() {
    LC_ALL=C awk '
        function far(s) { return s ~ /^[\/~]/ || (s ~ /^[$]/ && s !~ /^[$][{]?PWD[}]?\//) }
        /^D/ { dir = substr($0, 3); next }
        /^[WAT] / {
            path = substr($0, 3)
            if (dir == "" || far(path)) { print; next }
            if (dir ~ /[$][(][)]/) { next }
            sub(/^[$][{]?PWD[}]?\//, "", path)
            print substr($0, 1, 2) dir "/" path
            next
        }
        /^S / && !on && dir != "" { print "S cd \047" dir "\047" }
        { on = /^S / ? 1 : /^E$/ ? 0 : on; print }'
}

# The words of one text and of the commands it hands to a shell, to the fourth shell inside it: the text
# comes as the second argument, how deep it stands as the first.
rt_wt_read() {
    local deep
    deep="$(printf '%s\n' "$2" | rt_shell_words)"
    case "
$deep" in *"
C "*) deep="$deep
D
$(printf '%s\n' "$deep" | rt_code_writes)" ;; esac
    case "$1${RT_WT_BODY:-}" in 1) deep="$(printf '%s\n' "$deep" | sed '/^D/d')" ;; *) deep="$(printf '%s\n' "$deep" | rt_wt_from_dir)" ;; esac
    printf '%s\n' "$deep"
    [ "$1" -lt 5 ] || return 0
    case "
$deep" in *"
S "*) ;; *) return 0 ;; esac
    printf '%s\n' "$deep" | LC_ALL=C awk '/^S / { on = 1; print substr($0, 3) } /^E$/ && on { on = 0; printf "\036" }' \
        | while IFS= read -r -d "$(printf '\036')" deep; do rt_wt_read "$(($1 + 1))" "$deep"; done
}

# What the words of a command say: the text comes as the argument. The paths of a command inside stand from
# the directory of their call; a `cd` on the line of the command itself is not followed. A path through a
# variable is the literal the command itself gave it, and it is compared with the root of the tree as one.
# A copy into a folder writes a file of the same name there, and what is a folder is asked from the disk.
rt_shell_calls() {
    rt_wt_calls="$(rt_wt_read 1 "$1")"
    RT_WT_VARS="$(command -v rt_cmd_vars >/dev/null 2>&1 && { printf '%s\n' "$1" | rt_no_heredocs; printf '%s\n' "$rt_wt_calls" | sed -n 's/^S //p'; } \
        | LC_ALL=C awk '/[\\]$/ { printf "%s ", substr($0, 1, length($0) - 1); next } { print }' | rt_cmd_vars)"
    printf '%s\n' "$rt_wt_calls" \
        | RT_SF_VARS="$RT_WT_VARS" LC_ALL=C awk -F '\t' "$RT_SF_EXPAND"'
            BEGIN { rt_vars_read() }
            /^[WA] / { rt_expand(substr($0, 3), 1); for (i = 1; i <= en; i++) { print substr($0, 1, 2) ev[i] } next }
            /^T / {
                rt_expand(substr($1, 3), 1); n = en; split("", to); for (i = 1; i <= n; i++) { to[i] = ev[i] }
                rt_expand($2, 1)
                for (i = 1; i <= n; i++) { for (j = 1; j <= en; j++) { base = ev[j]; sub(/\/+$/, "", base); sub(/.*\//, "", base); if (base ~ /^\.*$/) { sub(/\/+$/, "", to[i]); print "W " to[i] } else { print "T " to[i] "\t" base } } }
            }
        ' \
        | sed -E 's#^([WAT]) \$\{?(PWD|CLAUDE_PROJECT_DIR)\}?/#\1 #' \
        | while IFS= read -r rt_wt_line; do
            case "$rt_wt_line" in
                'T '*)
                    rt_wt_in="${rt_wt_line##*	}" rt_wt_to="${rt_wt_line#T }"
                    rt_wt_to="${rt_wt_to%	*}"
                    case "$rt_wt_to" in
                        */) rt_wt_to="$rt_wt_to$rt_wt_in" ;;
                        *) { [ -d "$rt_wt_to" ] || [ -d "${CLAUDE_PROJECT_DIR:-.}/$rt_wt_to" ]; } && rt_wt_to="$rt_wt_to/$rt_wt_in" ;;
                    esac
                    printf 'W %s\n' "$rt_wt_to"
                    ;;
                *) printf '%s\n' "$rt_wt_line" ;;
            esac
        done
}

# The files a command writes whole: adding to the end and an edit in place keep what stood there.
rt_overwrite_targets() {
    RT_WT_WHOLE=1 RT_WT_SCRIPT=1 rt_write_targets
}

rt_write_targets() {
    rt_wt_text="$(cat)"
    {
        rt_shell_calls "$rt_wt_text" | sed -n "s/^[W${RT_WT_WHOLE:-A}] //p"

        # A script file the command runs is read the same way: a shell script is a command, any other is
        # a body of its interpreter. One level: a script that runs another script is not followed.
        #
        # A shell script that enters a directory of its own — one from `mktemp` — writes its relative
        # paths there, and they are no paths of the tree. A literal `cd` joins them.
        if [ -z "${RT_WT_SCRIPT:-}" ] && command -v rt_script_files >/dev/null 2>&1; then
            printf '%s' "$rt_wt_text" | rt_script_files | while IFS= read -r rt_wt_file; do
                rt_wt_kind="$(rt_script_kind "$rt_wt_file")"
                if [ "$rt_wt_kind" = shell ]; then
                    sed -E '/^[[:space:]]*#/d' "$rt_wt_file" | RT_WT_SCRIPT=1 RT_WT_BODY=1 rt_write_targets
                else
                    [ "$rt_wt_kind" = python ] && rt_wt_head=python3 || rt_wt_head=node
                    printf '%s - <<RT_SCRIPT_BODY\n%s\nRT_SCRIPT_BODY\n' "$rt_wt_head" "$(rt_script_text "$rt_wt_file")" \
                        | RT_WT_SCRIPT=1 rt_write_targets
                fi
            done
        fi
    } | sed -E 's#^(\./)+##' | sort -u
}
