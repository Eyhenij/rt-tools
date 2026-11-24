#!/usr/bin/env bash
# rt-kit v0.39.1 · hooks/write-targets.sh · ea41c5f1040a · правится надстройкой, не здесь
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

# The targets of a script as they stand from the directory the script enters first; $1 — its body. A
# directory of the tree by name — `rev-parse --show-toplevel`, `CLAUDE_PROJECT_DIR` — leaves them as
# they are, a literal joins them, and one the script computes otherwise is none of the tree's. A line
# comes as a path or with the mark of `shell-words.sh` before it.
rt_wt_from_dir() {
    _wd_tree='rev-parse|CLAUDE_PROJECT_DIR|[$][(]pwd'
    _wd_dir="$(printf '%s\n' "$1" | grep -oE '(^|[;&|({[:space:]])(cd|pushd)[[:space:]]+("[^"]*"|'"'[^']*'"'|[$][(][^)]*[)]|[^;&|)[:space:]]+)' | head -1 \
        | sed -E "s/^[;&|({[:space:]]*(cd|pushd)[[:space:]]+//; s/[\"']//g")"
    if printf '%s' "$_wd_dir" | grep -qE "$_wd_tree"; then
        _wd_dir=''
    elif printf '%s' "$_wd_dir" | grep -q '[$]'; then
        _wd_var="$(printf '%s' "$_wd_dir" | sed -nE 's/^[$][{]?([A-Za-z_][A-Za-z0-9_]*)[}]?.*/\1/p')"
        _wd_rest="$(printf '%s' "$_wd_dir" | sed -E 's/^[$][{]?[A-Za-z0-9_]*[}]?//')"
        if [ -n "$_wd_var" ] && printf '%s\n' "$1" | grep -E "(^|[;&|[:space:]])${_wd_var}=" | grep -qE "$_wd_tree"; then
            _wd_dir="${_wd_rest#/}"
        else
            _wd_dir="$(printf '%s\n' "$1" | rt_cmd_vars | sed -n "s/^${_wd_var:-0}	//p" | head -1)"
            [ -n "$_wd_dir" ] && _wd_dir="$_wd_dir$_wd_rest" || _wd_dir=-
        fi
    fi
    case "$_wd_dir" in . | ./) _wd_dir='' ;; '~/'*) _wd_dir="$HOME/${_wd_dir#??}" ;; esac
    while IFS= read -r _wd_path; do
        _wd_mark=''
        case "$_wd_path" in
            [CS]\ * | E) printf '%s\n' "$_wd_path"; continue ;;
            [WAT]\ *) _wd_mark="${_wd_path%% *} " _wd_path="${_wd_path#? }" ;;
        esac
        case "$_wd_path" in
            /* | '~'* | '$'*) printf '%s\n' "$_wd_mark$_wd_path" ;;
            *) case "$_wd_dir" in '') printf '%s\n' "$_wd_mark$_wd_path" ;; -) ;; *) printf '%s\n' "$_wd_mark${_wd_dir%/}/$_wd_path" ;; esac ;;
        esac
    done
}

# What the words of a command say: the text comes as the argument. A command handed to a shell — by the
# line or by the code — is read again, to the fourth shell inside it, and its paths stand from the
# directory it enters first. A path through a variable is the literal the command itself gave it, and it
# is compared with the root of the tree as one. A copy into a folder writes a file of the same name
# there, and what is a folder is asked from the disk.
rt_shell_calls() {
    rt_wt_end="$(printf '\001')" rt_wt_calls=''
    rt_wt_code="$1$rt_wt_end"
    for rt_wt_round in 1 2 3 4 5; do
        rt_wt_next=''
        while [ -n "$rt_wt_code" ]; do
            rt_wt_one="${rt_wt_code%%"$rt_wt_end"*}"
            rt_wt_code="${rt_wt_code#*"$rt_wt_end"}"
            rt_wt_deep="$(printf '%s\n' "$rt_wt_one" | rt_shell_words)"
            case "
$rt_wt_deep" in *"
C "*) rt_wt_deep="$rt_wt_deep
$(printf '%s\n' "$rt_wt_deep" | rt_code_writes)" ;; esac
            case "$rt_wt_round$rt_wt_one" in 1*) ;; *'cd '* | *'pushd '*) rt_wt_deep="$(printf '%s\n' "$rt_wt_deep" | rt_wt_from_dir "$rt_wt_one")" ;; esac
            rt_wt_calls="$rt_wt_calls
$rt_wt_deep"
            case "
$rt_wt_deep" in *"
S "*) rt_wt_next="$rt_wt_next$(printf '%s\n' "$rt_wt_deep" | LC_ALL=C awk '/^S / { on = 1; print substr($0, 3) } /^E$/ && on { on = 0; printf "\001" }')" ;; esac
        done
        rt_wt_code="$rt_wt_next"
        [ -n "$rt_wt_code" ] || break
    done
    RT_WT_VARS="$(command -v rt_cmd_vars >/dev/null 2>&1 && { printf '%s\n' "$1" | rt_no_heredocs; printf '%s\n' "$rt_wt_calls" | sed -n 's/^S //p'; } | rt_cmd_vars)"
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
        # paths there, and they are no paths of the tree. An absolute `cd` joins them.
        if [ -z "${RT_WT_SCRIPT:-}" ] && command -v rt_script_files >/dev/null 2>&1; then
            printf '%s' "$rt_wt_text" | rt_script_files | while IFS= read -r rt_wt_file; do
                rt_wt_kind="$(rt_script_kind "$rt_wt_file")"
                if [ "$rt_wt_kind" = shell ]; then
                    rt_wt_body="$(sed -E '/^[[:space:]]*#/d' "$rt_wt_file")"
                    printf '%s\n' "$rt_wt_body" | RT_WT_SCRIPT=1 rt_write_targets | rt_wt_from_dir "$rt_wt_body"
                else
                    [ "$rt_wt_kind" = python ] && rt_wt_head=python3 || rt_wt_head=node
                    printf '%s - <<RT_SCRIPT_BODY\n%s\nRT_SCRIPT_BODY\n' "$rt_wt_head" "$(rt_script_text "$rt_wt_file")" \
                        | RT_WT_SCRIPT=1 rt_write_targets
                fi
            done
        fi
    } | sed -E 's#^(\./)+##' | sort -u
}
