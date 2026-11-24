#!/usr/bin/env bash
# rt-kit v0.39.1 · hooks/write-targets.sh · 746745ea6679 · правится надстройкой, не здесь
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
# there inside the code — in the call that writes the file — and is caught by none of the patterns
# above: from the outside the command looks like running an interpreter, not like a write. A
# laid-out copy was edited that way silently, and it was the layout that caught it — at the build,
# when the edit is written in full and has to be carried over by hand.
#
# There is nothing to parse someone else's language with, and it is not parsed here: everything
# path-like is taken from the body, and the caller decides by it — the guard of the place of the
# edit refuses only what carries the layout header. The price is named outright: reading a file by
# an interpreter is judged on a par with writing into it. In the shell one reads by other means —
# `cat`, `grep`, `sed -n` — while an interpreter given the path of a laid-out copy almost always
# edits it.

# The words of a command. Without this neighbour the shell part names nothing, and the guards pass the
# action.
# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/shell-words.sh" 2>/dev/null || true
command -v rt_shell_words >/dev/null 2>&1 || rt_shell_words() { cat >/dev/null; }

# The literals of the variables and the script files of a command. No helper — neither is read.
# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/script-files.sh" 2>/dev/null || true
[ -n "${RT_SF_EXPAND:-}" ] || RT_SF_EXPAND='function rt_vars_read() {} function rt_expand(w, depth) { en = 1; ev[1] = w }'

# The targets of a script as they stand from the directory the script enters first; $1 — its body. A
# directory of the tree by name — `rev-parse --show-toplevel`, `CLAUDE_PROJECT_DIR` — leaves them as
# they are, a literal joins them, and one the script computes otherwise is none of the tree's.
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
        case "$_wd_path" in
            /* | '~'* | '$'*) printf '%s\n' "$_wd_path" ;;
            *) case "$_wd_dir" in '') printf '%s\n' "$_wd_path" ;; -) ;; *) printf '%s\n' "${_wd_dir%/}/$_wd_path" ;; esac ;;
        esac
    done
}

# What the words of a command say: the text comes as the argument. A command handed to a shell is read
# again, to the fourth shell inside it. A path through a variable is the literal the command itself
# gave it, and it is compared with the root of the tree as one. A copy into a folder writes a file of
# the same name there, and what is a folder is asked from the disk.
rt_shell_calls() {
    rt_wt_calls="$(printf '%s\n' "$1" | rt_shell_words)"
    rt_wt_deep="$rt_wt_calls"
    for rt_wt_round in 1 2 3 4; do
        case "
$rt_wt_deep" in *"
S "*) ;; *) break ;; esac
        rt_wt_deep="$(printf '%s\n' "$rt_wt_deep" | LC_ALL=C awk '/^S / { on = 1; print substr($0, 3) } /^E$/ && on { on = 0; print ";" }' | rt_shell_words)"
        rt_wt_calls="$rt_wt_calls
$rt_wt_deep"
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
                next
            }
            { print }
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
    rt_wt_words="$(rt_shell_calls "$rt_wt_text")"

    {
        printf '%s\n' "$rt_wt_words" | sed -n "s/^[W${RT_WT_WHOLE:-A}] //p"

        # The body of the interpreter: the code comes as a `-c` argument, an `-e` argument or a
        # heredoc body, and the write path stands inside it. It is exactly the body that is taken,
        # not the whole command: a compound line in which a heredoc writes one file while a check is
        # run next to it would give away the path of that check as a write target — and running a
        # laid-out check would again read as an edit of the check itself.
        #
        # A redirection to the empty device and to the error stream is cut from it first: a muted
        # output inside a body is no sign of a write.
        printf '%s\n' "$rt_wt_words" | sed -E '/^[CE]/!d; s#(&|[0-9]*)>>?[[:space:]]*/dev/(null|stderr)##g; s#[0-9]*>&[0-9-]##g' | LC_ALL=C awk -v whole="${RT_WT_WHOLE:-}" '
            function emit(s,   n, i, parts) {
                n = split(s, parts, /[^A-Za-z0-9_.@\/-]+/)
                for (i = 1; i <= n; i++) {
                    if (parts[i] ~ /\// && parts[i] ~ /\.[A-Za-z0-9]+$/) { print parts[i] }
                }
            }
            # A path assigned to a variable. It stands on a line separate from the write call, and
            # without this pair a write through a variable cannot be caught at all.
            function note_var(s,   name, path) {
                if (match(s, /[A-Za-z_][A-Za-z0-9_]*[ \t]*=[ \t]*([A-Za-z_.]*Path\([ \t]*)?[\047\"][^\047\"]*\/[^\047\"]*[\047\"]/)) {
                    path = substr(s, RSTART, RLENGTH)
                    name = path
                    sub(/[ \t]*=.*$/, "", name)
                    sub(/^[^=]*=[^\047\"]*[\047\"]/, "", path)
                    sub(/[\047\"].*$/, "", path)
                    if (path ~ /\.[A-Za-z0-9]+$/) { varpath[name] = path }
                }
            }
            # The write target is the first argument of the write call. It is the address the
            # script opens; everything else on the same line is search patterns, substitutions and
            # data.
            function emit_calls(s,   rest, arg, name) {
                # The file object writes itself: its variable holds the path.
                rest = s
                while (match(rest, /[A-Za-z_][A-Za-z0-9_]*\.(write_text|write_bytes|unlink|rename)[ \t]*\(/)) {
                    name = substr(rest, RSTART, RLENGTH)
                    rest = substr(rest, RSTART + RLENGTH)
                    sub(/\..*$/, "", name)
                    if (name in varpath) { print varpath[name] }
                }
                rest = strip_reads(s)
                while (match(rest, /(open|writeFileSync|writeFile|appendFileSync|appendFile|rename|symlink|mkdir|makedirs)[ \t]*\(/)) {
                    rest = substr(rest, RSTART + RLENGTH)
                    arg = rest
                    sub(/[,)].*$/, "", arg)
                    gsub(/^[ \t]+|[ \t]+$/, "", arg)
                    if (arg ~ /^[\047\"]/) {
                        gsub(/^[\047\"]|[\047\"]$/, "", arg)
                        if (arg ~ /\// && arg ~ /\.[A-Za-z0-9]+$/) { print arg }
                    } else {
                        name = arg
                        gsub(/[^A-Za-z0-9_].*$/, "", name)
                        if (name in varpath) { print varpath[name] }
                    }
                }
            }
            # Whether the body writes anything at all. A body with not a single write call does
            # not give away its paths: a command that sourced a laid-out helper and printed its
            # answer was forbidden as an edit of that helper — three times in a row in one session.
            # Inside a body that does write, all paths are still taken: the path and the write call
            # stand there on different lines, and there is nothing to tie them together with.
            #
            # A redirect inside a body names a file. With an extension of one it is a redirect
            # anywhere but after `=` or `-`, and so is a variable of the shell; a path with a slash
            # and no extension only after a space, a quote or at the line start, and not before a
            # bracket. `a>b`, `a > b.length`, `w > h/2` and `(w > h/c)` of the language compare.
            function redirects(s) {
                return s ~ /(^|[ \t\047\"&])[0-9]?>>?[ \t]*[A-Za-z0-9_.~$@-]*\/[A-Za-z_.~$@][A-Za-z0-9_.~$@\/-]*([^A-Za-z0-9_.~$@\/)-]|$)/ \
                    || s ~ /(^|[^=-])>[ \t]*[\047\"]?[$][{]?[A-Z]/ \
                    || s ~ /(^|[^=-])>[ \t]*[A-Za-z0-9_.~$@\/-]*\.(md|json|mjs|cjs|js|ts|tsx|sh|scss|css|html|yml|yaml|txt|xml|svg|toml|prisma|py|lock|conf|ini|env|cfg)([^A-Za-z0-9]|$)/
            }
            function writes(s) {
                return s ~ /open[ \t]*\([^)]*[\047\"](w|a|r\+|w\+|a\+)[\047\"]/ \
                    || s ~ /(writeFileSync|writeFile|appendFileSync|appendFile|write_text|write_bytes|savefig|to_csv|\.write|\.save|\.dump)[ \t]*\(/ \
                    || s ~ /(makedirs|mkdir|mkdirSync|rename|renames|renameSync|unlink|unlinkSync|rmtree|copyfile|copyFile|copyFileSync|copy2|cpSync|shutil\.[a-z0-9_]+|(os|Path\([^)]*\))\.replace)[ \t]*\(/ \
                    || s ~ /\.replace[ \t]*\([ \t]*[^,() \t][^,()]*\)|(^|[^.A-Za-z0-9_])replace[ \t]*\(/ \
                    || redirects(s)
            }
            # The index of the bracket that closes the call whose arguments start at `from`: the
            # quotes are skipped, and a bracket inside a string closes nothing.
            function args_end(s, from,   i, c, depth, q) {
                depth = 1
                for (i = from; i <= length(s); i++) {
                    c = substr(s, i, 1)
                    if (q != "") {
                        if (c == q && substr(s, i - 1, 1) != "\\") { q = "" }
                    } else if (c == "\047" || c == "\"") {
                        q = c
                    } else if (c == "(") {
                        depth++
                    } else if (c == ")") {
                        depth--
                        if (depth == 0) { return i }
                    }
                }
                return length(s) + 1
            }
            # The first argument of a call: everything up to a comma outside quotes and brackets.
            function first_arg(a,   i, c, depth, q) {
                for (i = 1; i <= length(a); i++) {
                    c = substr(a, i, 1)
                    if (q != "") {
                        if (c == q && substr(a, i - 1, 1) != "\\") { q = "" }
                    } else if (c == "\047" || c == "\"") {
                        q = c
                    } else if (c == "(") {
                        depth++
                    } else if (c == ")") {
                        depth--
                    } else if (c == "," && depth == 0) {
                        return substr(a, 1, i - 1)
                    }
                }
                return a
            }
            # What the script writes or substitutes is the content of the write, not its target: a
            # path inside the written string belongs to the content of that file. A script that
            # edited a work file and named a laid-out copy in the text of a new line was refused by
            # the name of a copy it never opened. The call stays and its first argument stays where
            # that argument is the address (`writeFileSync(path, data)`); the data and the argument
            # of `.write(`, `.write_text(`, `.write_bytes(` and of a string `.replace(` are cut.
            # `os.replace(source, target)` is a transfer, and its arguments stay.
            # A read on the line of a write names no target: the reading call loses its arguments, an
            # import its address. A file opened with no mode, or with one of reading, is read.
            function strip_reads(s,   out, name, from, endp, args) {
                gsub(/from[ \t]+[\047\"][^\047\"]*[\047\"]/, "from", s)
                gsub(/(import|require)[ \t]*\([ \t]*[\047\"][^\047\"]*[\047\"][ \t]*\)/, "import()", s)
                out = ""
                while (match(s, /(^|[^A-Za-z0-9_])(open|readFileSync|readFile)[ \t]*\(/)) {
                    name = substr(s, RSTART, RLENGTH)
                    from = RSTART + RLENGTH
                    out = out substr(s, 1, from - 1)
                    endp = args_end(s, from)
                    args = substr(s, from, endp - from)
                    if (name ~ /open/ && args ~ /,/ && args !~ /,[ \t]*(mode[ \t]*=[ \t]*)?[\047\"]r[bt]?[\047\"]/) { s = substr(s, from); continue }
                    s = substr(s, endp)
                }
                return out s
            }
            # The source of a copy is read: only where the copy goes is a target.
            function strip_sources(s,   out, from, endp, args, first) {
                out = ""
                while (match(s, /(copyFileSync|copyFile|copyfile|copytree|copy2|cpSync|shutil\.copy|shutil\.move)[ \t]*\(/)) {
                    from = RSTART + RLENGTH
                    out = out substr(s, 1, from - 1)
                    endp = args_end(s, from)
                    args = substr(s, from, endp - from); first = first_arg(args)
                    out = out (first == args || index(substr(s, RSTART, RLENGTH), "move") ? args : substr(args, length(first) + 2)) ")"
                    s = substr(s, endp + 1)
                }
                return out s
            }
            # One line of code holds several statements; a write of one names nothing of the next.
            function statements(s,   i, c, q, cur) {
                for (i = 1; i <= length(s); i++) {
                    c = substr(s, i, 1)
                    if (c == "\\") { cur = cur c substr(s, ++i, 1); continue }
                    if (q != "") { if (c == q) { q = "" } }
                    else if (c == "\047" || c == "\"" || c == "`") { q = c }
                    else if (c == ";") { add_line(cur); cur = ""; continue }
                    cur = cur c
                }
                add_line(cur)
            }
            function add_line(s) {
                if (whole != "" && s ~ /append|[\047\"]a[b+]*[\047\"]/) { return }
                line[++lines] = s
                if (writes(s)) { wrote = 1 }
            }
            function strip_content(s,   out, pre, name, from, endp, args) {
                s = strip_sources(strip_reads(s))
                out = ""
                while (match(s, /(\.write|\.write_text|\.write_bytes|\.replace|writeFileSync|appendFileSync|writeFile|appendFile)[ \t]*\(/)) {
                    pre = substr(s, 1, RSTART - 1)
                    name = substr(s, RSTART, RLENGTH)
                    from = RSTART + RLENGTH
                    endp = args_end(s, from)
                    # A transfer names both ends; a string `replace` has two arguments and no file.
                    if (name ~ /^\.replace/ && (pre ~ /(^|[^A-Za-z0-9_])os$/ || substr(s, from, endp - from) !~ /,/)) {
                        out = out pre name
                        s = substr(s, from)
                        continue
                    }
                    if (name ~ /^\./) {
                        out = out pre name ")"
                    } else {
                        args = substr(s, from, endp - from)
                        out = out pre name first_arg(args) ")"
                    }
                    s = substr(s, endp + 1)
                }
                return out s
            }
            # Paths are taken from the write lines, not from the whole body.
            #
            # Before, a body that writes anything at all gave away all its path-like words at once:
            # an address named in the body as a search pattern or a comparison string read as a
            # write target, and an edit of one file was forbidden by the name of another, which the
            # script did not even open. Such a refusal was bypassed by changing the form of the
            # command, not the action — that is, it lifted the requirement instead of holding it.
            #
            # A path assigned to a variable is not lost by this: the pair "assignment — write line"
            # is parsed separately. A variable given another path names the last one above the write.
            function flush_body(   i) {
                if (wrote) {
                    for (i = 1; i <= lines; i++) { note_var(line[i]) }
                    for (i = 1; i <= lines; i++) {
                        note_var(line[i])
                        if (writes(line[i])) { emit(strip_content(line[i])); emit_calls(strip_sources(line[i])) }
                    }
                }
                for (i = 1; i <= lines; i++) { delete line[i] }
                delete varpath
                lines = 0
                wrote = 0
            }
            /^C / { statements(substr($0, 3)); next }
            { flush_body() }
            END { flush_body() }'

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
