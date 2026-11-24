#!/usr/bin/env bash
# rt-kit v0.39.1 · hooks/write-targets.sh · a6b58f3f1c6d · правится надстройкой, не здесь
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

# The literals of the variables and the script files of a command. No helper — neither is read.
# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/script-files.sh" 2>/dev/null || true
[ -n "${RT_SF_EXPAND:-}" ] || RT_SF_EXPAND='function rt_vars_read() {} function rt_expand(w, depth) { en = 1; ev[1] = w }'

# The targets of a script as they stand from the directory the script enters; $1 — its body.
rt_wt_from_dir() {
    _wd_dir="$(printf '%s\n' "$1" | sed -nE 's#^([^\#]*[;&|[:space:]])?cd[[:space:]]+["'\'']?(/[^"'\''[:space:];&|$`]+).*#\2#p' | head -1)"
    _wd_own="$(printf '%s\n' "$1" | sed -nE 's/^(.*[;&|[:space:]])?([A-Za-z_][A-Za-z0-9_]*)="?\$\(mktemp.*/\2/p' | tr '\n' ' ')"
    if printf '%s\n' "$1" | grep -qE '(^|[;&|[:space:]])cd[[:space:]]+"?\$\(mktemp'; then _wd_dir=-; fi
    for _wd_var in $_wd_own; do
        printf '%s\n' "$1" | grep -qE "(^|[;&|[:space:]])cd[[:space:]]+\"?[$][{]?${_wd_var}([^A-Za-z0-9_]|\$)" && _wd_dir=-
    done
    while IFS= read -r _wd_path; do
        case "$_wd_path" in
            /* | '~'* | '$'*) printf '%s\n' "$_wd_path" ;;
            *) case "$_wd_dir" in '') printf '%s\n' "$_wd_path" ;; -) ;; *) printf '%s\n' "$_wd_dir/$_wd_path" ;; esac ;;
        esac
    done
}

rt_write_targets() {
    rt_wt_text="$(cat)"

    # Redirection to the empty device and to the error stream is removed before parsing — by the
    # same technique the shell write sign removes it. Without this a muted output inside the body of
    # an interpreter reads as a sign of a write, and a body that writes nothing again gives away all
    # its paths: a command with an edit of one file and a run of a check next to it was forbidden by
    # the path of that check. A real write next to a muted stream stays visible: the redirection is
    # removed, not the whole command.
    rt_wt_text="$(printf '%s' "$rt_wt_text" \
        | sed -E 's#(&|[0-9]*)>>?[[:space:]]*/dev/(null|stderr)##g; s#[0-9]*>&[0-9-]##g')"

    # The bodies of the heredocs are cut out of the shell parse: they are data of the command, not
    # the command. A markdown quote line inside a body — a caret and a path — read as a redirection,
    # and an edit that wrote nothing into the tree was refused by the path standing in that quote.
    # The bodies are parsed separately, by the interpreter branch below.
    rt_wt_shell="$(printf '%s' "$rt_wt_text" | awk -v q="'" '
        function trim(s) { sub(/^[ \t]+/, "", s); sub(/[ \t]+$/, "", s); return s }
        tag != "" { if (trim($0) == tag) { tag = "" } ; next }
        {
            print
            s = $0
            re = "<<-?[ \t]*(\"[^\"]+\"|" q "[^" q "]+" q "|[A-Za-z_][A-Za-z0-9_]*)"
            while (match(s, re)) {
                t = substr(s, RSTART, RLENGTH)
                s = substr(s, RSTART + RLENGTH)
                sub(/^<<-?[ \t]*/, "", t)
                gsub(/\"/, "", t)
                gsub(q, "", t)
                tag = t
            }
        }
    ')"

    # An arrow inside quotes is text of the command, not a redirection: `echo "a->b"` and the code
    # of `node -e "[1].map(x => x)"` read as writes into `b` and `x)` and were refused as edits.
    # The separators of commands inside quotes are dropped with it: a `sed` script of several parts is
    # one word. The quotes are read across the lines: a message of several lines is one word too; a
    # backslash outside single quotes escapes the next sign, and a comment ends its line.
    rt_wt_shell="$(printf '%s\n' "$rt_wt_shell" | awk -v sq="'" '
        function drop_quoted_arrows(s,   out, i, c, n) {
            out = ""; n = length(s)
            for (i = 1; i <= n; i++) {
                c = substr(s, i, 1)
                if (c == "\\" && q != sq && i < n) { out = out c substr(s, i + 1, 1); i++; continue }
                if (q != "") {
                    if (c == q) { q = "" } else if (index(">;|&", c)) { continue }
                } else if (c == "\"" || c == sq || c == "`") {
                    q = c
                } else if (c == "#" && (i == 1 || substr(s, i - 1, 1) ~ /[ \t]/)) {
                    break
                }
                out = out c
            }
            return out
        }
        { print drop_quoted_arrows($0) }
    ')"

    # The literals the command itself gave its variables. A target through such a variable is a literal
    # path, and it is compared with the root of the tree as one.
    RT_WT_VARS="$(command -v rt_cmd_vars >/dev/null 2>&1 && printf '%s\n' "$rt_wt_shell" | rt_cmd_vars)"

    {
        # Each command of the line is read apart: an in-place edit names its last word, and the last
        # word of the line belonged to the command after it.
        printf '%s' "$rt_wt_shell" \
            | tr "\"'\`" '   ' \
            | sed -E 's/>\|/>/g; s/>>?/\n>/g; s/(&&|[|][|]|[;|&])/\n/g' \
            | sed -nE '
                s/^>[[:space:]]*([^[:space:]|&;]+).*/\1/p
                s/(^|.*[[:space:]])tee[[:space:]]+(-a[[:space:]]+)?([^[:space:]|&;]+).*/\3/p
                s/(^|.*[[:space:]])g?sed[[:space:]]+([^[:space:]]+[[:space:]]+)*(-[A-Za-z]*i[^[:space:]]*|--in-place[^[:space:]]*)[[:space:]]+([^[:space:]]+[[:space:]]+)*([^[:space:]|&;]+)[[:space:]]*$/\5/p
                s/(^|.*[[:space:]])(cp|mv|install)[[:space:]]+([^[:space:]]+[[:space:]]+)+([^[:space:]|&;]+).*/\4/p
            ' \
            | RT_SF_VARS="$RT_WT_VARS" awk "$RT_SF_EXPAND"'
                BEGIN { rt_vars_read() }
                { rt_expand($0, 1); for (i = 1; i <= en; i++) { print ev[i] } }
            '

        # The body of the interpreter: the code comes as a `-c` argument, an `-e` argument or a
        # heredoc body, and the write path stands inside it. It is exactly the body that is taken,
        # not the whole command: a compound line in which a heredoc writes one file while a check is
        # run next to it would give away the path of that check as a write target — and running a
        # laid-out check would again read as an edit of the check itself.
        printf '%s\n' "$rt_wt_text" | awk '
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
                while (match(rest, /(open|writeFileSync|writeFile|appendFileSync|appendFile|copyfile|copy2|rename|symlink|mkdir|makedirs)[ \t]*\(/)) {
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
                    || s ~ /writeFileSync|writeFile|appendFile|write_text|write_bytes|\.write\(|\.save\(|savefig|to_csv|json\.dump|\.dump\(/ \
                    || s ~ /makedirs|mkdir|rename|replace[ \t]*\(|unlink|rmtree|copyfile|copy2|shutil\./ \
                    || redirects(s) \
                    || s ~ /(^|[|;&(]|[ \t])(tee|cp|mv|rm|touch|install|truncate)([ \t]|$)/
            }
            function trim(s) { sub(/^[ \t]+/, "", s); sub(/[ \t]+$/, "", s); return s }
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
            function strip_content(s,   out, pre, name, from, endp, args) {
                s = strip_reads(s)
                out = ""
                while (match(s, /(\.write|\.write_text|\.write_bytes|\.replace|writeFileSync|appendFileSync|writeFile|appendFile)[ \t]*\(/)) {
                    pre = substr(s, 1, RSTART - 1)
                    name = substr(s, RSTART, RLENGTH)
                    from = RSTART + RLENGTH
                    if (name ~ /^\.replace/ && pre ~ /(^|[^A-Za-z0-9_])os$/) {
                        out = out pre name
                        s = substr(s, from)
                        continue
                    }
                    endp = args_end(s, from)
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
            # is parsed separately.
            function flush_body(   i) {
                if (wrote) {
                    for (i = 1; i <= lines; i++) { note_var(line[i]) }
                    for (i = 1; i <= lines; i++) {
                        if (writes(line[i])) { emit(strip_content(line[i])); emit_calls(line[i]) }
                    }
                }
                for (i = 1; i <= lines; i++) { delete line[i] }
                delete varpath
                lines = 0
                wrote = 0
            }
            tag != "" {
                if (trim($0) == tag) { flush_body(); tag = ""; next }
                if (keep) {
                    line[++lines] = $0
                    if (writes($0)) { wrote = 1 }
                }
                next
            }
            {
                # Code as an argument: what stands after `-c` or `-e` of the interpreter itself, up to the
                # quote that closes it. A key of another command of the line — `grep -c` next to a run of
                # a script — is no code, and a command after the code is read by the shell parse above.
                rest = $0
                while (match(rest, /(^|[|;&(]|[ \t])(python3?|node|ruby|perl|php|deno|bun)[ \t](([^|;&\047\"]|\047[^\047]*\047|\"[^\"]*\")*[ \t])?-[ce][ \t]+/)) {
                    rest = substr(rest, RSTART + RLENGTH)
                    code = rest
                    quote = ""
                    # One word of the shell: a quote that closes next to another one goes on with it.
                    if (code ~ /^[\047\"]/) {
                        for (k = 1; k <= length(code); k++) {
                            ch = substr(code, k, 1)
                            if (ch == "\\" && quote != "\047") { k++; continue }
                            if (quote != "") { if (ch == quote) { quote = "" } ; continue }
                            if (ch == "\047" || ch == "\"") { quote = ch; continue }
                            if (ch ~ /[ \t]/ || index(";|&)", ch)) { break }
                        }
                        code = substr(code, 1, k - 1)
                    }
                    if (writes(code)) { note_var(code); emit(strip_content(code)); emit_calls(code) }
                }
                # The heredoc body: the write path of the interpreter stands exactly there.
                if (match($0, /<<-?[ \t]*[\047\"]?[A-Za-z_][A-Za-z0-9_]*/)) {
                    t = substr($0, RSTART, RLENGTH)
                    sub(/^<<-?[ \t]*[\047\"]?/, "", t)
                    tag = t
                    keep = ($0 ~ /(^|[|;&(]|[ \t])(python3?|node|ruby|perl|php|deno|bun)([ \t]|$)/)
                    flush_body()
                }
            }
            END { if (tag != "") { flush_body() } }'

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
    } | sort -u
}
