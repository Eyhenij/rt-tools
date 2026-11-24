#!/usr/bin/env bash
# rt-kit v0.39.1 · hooks/code-writes.sh · 4399f8cd7fac · правится надстройкой, не здесь
# The code an interpreter reads: which files it writes and which commands it runs.
#
# NOT a guard and not a hook: there is deliberately no `rt-hook:` line. `write-targets.sh` sources it.
#
# In: the lines `shell-words.sh` prints — `C <line>` with `E` at the end of a body; the rest is passed
# over. Out: `W <path>` — a file the code writes; `S <line>` with `E` — a command the code runs.
# `RT_WT_WHOLE` leaves only the files written whole: code that adds to a file, and code that reads the
# file it writes, keep what stood there.
#
# There is nothing to parse someone else's language with, and it is not parsed here: the calls that write
# and the calls that run are known by their names. Paths are taken from the statements that write, not
# from the whole body: an address named as a search pattern or a comparison string read as a target, and
# an edit of one file was refused by the name of another, which the script did not even open. Such a
# refusal was bypassed by changing the form of the command, not the action. A write of a file whose
# address is not seen gives out the paths of its whole line.
#
# NOT SEEN: an address put together from parts, a name given to a call of a write anew, a variable or a
# list that comes from another file. A string that only looks like a redirection counts as one.

rt_code_writes() {
    # A redirection to the empty device and to the error stream is cut first: a muted output inside a body
    # is no sign of a write.
    sed -E '/^[CE]/!d; s#(&|[0-9]*)>>?[[:space:]]*/dev/(null|stderr)##g; s#[0-9]*>&[0-9-]##g' | LC_ALL=C awk -v whole="${RT_WT_WHOLE:-}" '
        BEGIN {
            # The calls of a language that run a command; of the second other objects have a method too.
            RUNS = "(^|\\.)(execSync|execFileSync|execFile|spawnSync|system|popen|Popen|check_output|check_call|getoutput|shell_exec|passthru)$"
            STRICT = "(^|\\.)(exec|run|call|spawn)$"
            TEXT = "(\"[^\"]*\"|\047[^\047]*\047|`[^`]*`)"
        }
        function is_path(s) { return s ~ /\// && s ~ /\.[A-Za-z0-9]+$/ }
        # A path read by the code and written by it is an edit in place.
        function say(path,   n, i, part) {
            said++
            n = split(path, part, "\n")
            for (i = 1; i <= n; i++) { if (part[i] != "" && !(whole != "" && part[i] in kept)) { print "W " part[i] } }
        }
        function emit(s,   n, i, parts) {
            n = split(s, parts, /[^A-Za-z0-9_.@\/-]+/)
            for (i = 1; i <= n; i++) { if (is_path(parts[i])) { say(parts[i]) } }
        }
        function command(s,   n, i, part) { n = split(s, part, "\n"); for (i = 1; i <= n; i++) { print "S " part[i] } print "E" }
        # The index of the quote that closes a string of the code; a quote that closes nothing opens none.
        function string_end(i,   q, e) {
            q = ch[i]
            if (q != "`" && ch[i + 1] == q && ch[i + 2] == q) {
                for (e = i + 3; e <= size; e++) { if (ch[e] == q && ch[e + 1] == q && ch[e + 2] == q) { return e + 2 } }
                return i
            }
            for (e = i + 1; e <= size && (q == "`" || ch[e] != "\n"); e++) {
                if (ch[e] == "\\") { e++ } else if (ch[e] == q) { return e }
            }
            return i
        }
        function string_of(i, e,   q, out) {
            q = ch[i]
            for (i++; i < e; i++) { if (ch[i] == "\\" && ch[i + 1] == q) { i++ } out = out ch[i] }
            return out
        }
        function past_space(i) { while (i <= size && ch[i] ~ /[ \t\n]/) { i++ } return i }
        # A list of words as the words of a command; `at` is left on the bracket that closes it.
        function words_of(i,   e, out) {
            for (i++; i <= size && ch[i] != "]"; i++) {
                if (ch[i] ~ /[\047"`]/ && (e = string_end(i)) > i) { for (; i < e; i++) { out = out ch[i] } out = out ch[e] }
                else { out = out (ch[i] == "," ? " " : ch[i]) }
            }
            at = i
            return out
        }
        # The call is of a program and not a method of something else: `/x/.exec(text)` runs nothing.
        function runs(name, last) {
            if (name ~ STRICT) { return name !~ /\./ || name ~ /(^|\.)(os|subprocess|child_process|childProcess|cp|sp|shell)\.[a-z]+$/ || (name ~ /^\./ && last ~ /child_process$/) }
            return name ~ RUNS
        }
        # Code names a command as a string or a list of words of a call that runs it, or through a variable
        # of that string. It is read as a command and leaves the code: its words are no files of the code.
        # A call inside a string or a comment runs nothing.
        function commands(s,   i, c, e, k, n, part, name, gap, held, last, text) {
            n = split(s, part, /[\n;]/)
            for (i = 1; i <= n; i++) {
                if (match(part[i], "[A-Za-z_][A-Za-z0-9_]*[ \t]*=[ \t]*[fr]?" TEXT)) {
                    text = substr(part[i], RSTART, RLENGTH)
                    name = text; sub(/[ \t]*=.*$/, "", name); sub(/^[^=]*=[ \t]*[fr]?./, "", text); held[name] = substr(text, 1, length(text) - 1)
                }
            }
            size = split(s, ch, ""); pieces = 0; text = ""; name = ""; gap = 0
            for (i = 1; i <= size; i++) {
                c = ch[i]
                if (c == "\n") { piece[++pieces] = text; text = ""; name = ""; gap = 0; continue }
                if ((c == "#" || (c == "/" && ch[i + 1] == "/")) && (i == 1 || ch[i - 1] ~ /[ \t\n;{}]/)) {
                    while (i < size && ch[i + 1] != "\n") { i++ }
                    continue
                }
                if (c ~ /[\047"`]/ && (e = string_end(i)) > i) {
                    last = string_of(i, e)
                    # Two of the languages call a command without a bracket.
                    if (gap && name ~ /^(system|exec)$/ && text ~ /^[ \t]*(system|exec)[ \t]+$/) { command(last); i = e; name = ""; continue }
                    for (; i <= e; i++) { if (ch[i] == "\n") { piece[++pieces] = text; text = "" } else { text = text ch[i] } }
                    i = e; name = ""; gap = 0
                    continue
                }
                text = text c
                if (c ~ /[A-Za-z0-9_.]/) { name = (gap ? "" : name) c; gap = 0; continue }
                if (c ~ /[ \t]/) { gap = 1; continue }
                if (c == "(" && runs(name, last)) {
                    k = past_space(i + 1)
                    if (ch[k] ~ /[frbu]/ && ch[k + 1] ~ /[\047"]/) { k++ }
                    if (ch[k] ~ /[\047"`]/ && (e = string_end(k)) > k) {
                        last = string_of(k, e)
                        n = past_space(e + 1)
                        if (ch[n] == "," && ch[n = past_space(n + 1)] == "[") { command("\047" last "\047 " words_of(n)); e = at }
                        else { command(last) }
                        i = e
                    } else if (ch[k] == "[") { command(words_of(k)); i = at }
                    else {
                        last = ""
                        for (; k <= size && ch[k] ~ /[A-Za-z0-9_]/; k++) { last = last ch[k] }
                        if (ch[past_space(k)] ~ /[,)]/ && last in held) { command(held[last]) }
                    }
                }
                name = ""; gap = 0
            }
            piece[++pieces] = text
        }
        # The paths a variable is given, a word or a list of words, in an assignment or in the head of a
        # loop. It stands on a line separate from the write call, and without this pair a write through a
        # variable cannot be caught at all. A word that is no path is known too: it is empty.
        function note_var(s,   name, value, path) {
            while (match(s, /[A-Za-z_][A-Za-z0-9_]*([ \t]*=[ \t]*([A-Za-z_.]*Path\([ \t]*)?|[ \t]+(in|of)[ \t]+)([\047"`][^\047"`]*[\047"`]|[\[(][^\])]*[\])])/)) {
                value = substr(s, RSTART, RLENGTH)
                s = substr(s, RSTART + RLENGTH)
                name = value
                sub(/[ \t=].*$/, "", name)
                varpath[name] = ""
                while (match(value, /[\047"`][^\047"`]*[\047"`]/)) {
                    path = substr(value, RSTART + 1, RLENGTH - 2)
                    value = substr(value, RSTART + RLENGTH)
                    if (is_path(path)) { varpath[name] = varpath[name] (varpath[name] == "" ? "" : "\n") path }
                }
            }
            if (match(s, /[A-Za-z_][A-Za-z0-9_]*[ \t]+(in|of)[ \t]+[A-Za-z_][A-Za-z0-9_]*/)) {
                value = substr(s, RSTART, RLENGTH)
                name = value
                sub(/[ \t].*$/, "", name)
                sub(/^.*[ \t]/, "", value)
                if (value in varpath) { varpath[name] = varpath[value] }
            }
        }
        # The word of an argument: a literal as it stands, a variable by what it was given.
        function known(arg) {
            gsub(/^[ \t]+|[ \t]+$/, "", arg)
            if (arg ~ /^[\047"`].*[\047"`]$/) { arg = substr(arg, 2, length(arg) - 2); return is_path(arg) ? arg : "" }
            return arg ~ /^[A-Za-z0-9_]+$/ && arg in varpath ? varpath[arg] : "?"
        }
        # The files the code reads, for the question about the whole.
        function note_reads(s,   rest, name, from, args) {
            rest = s
            while (match(rest, /(^|[^A-Za-z0-9_])(open|openSync|readFileSync|readFile)[ \t]*\(/)) {
                name = substr(rest, RSTART, RLENGTH); from = RSTART + RLENGTH
                args = substr(rest, from, args_end(rest, from) - from)
                if (name !~ /open/ || !opens("open(" args ")")) { kept[known(first_arg(args))] = 1 }
                rest = substr(rest, from)
            }
            rest = s
            while (match(rest, /([A-Za-z_][A-Za-z0-9_]*|[\047"`][^\047"`]*[\047"`][ \t]*\))\.read_(text|bytes)[ \t]*\(/)) {
                args = substr(rest, RSTART, RLENGTH); rest = substr(rest, RSTART + RLENGTH)
                sub(/[ \t]*\)?\.read_.*$/, "", args)
                kept[known(args)] = 1
            }
        }
        # The write target is the first argument of the write call. It is the address the script opens;
        # everything else on the same line is search patterns, substitutions and data.
        function emit_calls(s,   rest, arg, name, from, args, first) {
            # The file object writes itself: its variable holds the path.
            rest = s
            while (match(rest, /[A-Za-z_][A-Za-z0-9_]*\.(write_text|write_bytes|unlink|rename)[ \t]*\(/)) {
                arg = substr(rest, RSTART, RLENGTH)
                rest = substr(rest, RSTART + RLENGTH)
                sub(/\..*$/, "", arg)
                if (arg in varpath) { say(varpath[arg]) }
            }
            rest = strip_reads(s)
            while (match(rest, /(open|openSync|writeFileSync|writeFile|appendFileSync|appendFile|rename|symlink|mkdir|makedirs)[ \t]*\(/)) {
                rest = substr(rest, RSTART + RLENGTH)
                arg = rest
                sub(/[,)].*$/, "", arg)
                arg = known(arg)
                if (arg != "?") { say(arg) }
            }
            # A copy writes its second argument, a move both.
            rest = s
            while (match(rest, /(copyFileSync|copyFile|copyfile|copytree|copy2|cpSync|shutil\.copy|shutil\.move|renameSync|renames|rename|os\.replace)[ \t]*\(/)) {
                name = substr(rest, RSTART, RLENGTH); from = RSTART + RLENGTH
                args = substr(rest, from, args_end(rest, from) - from)
                rest = substr(rest, from)
                arg = first_arg(args)
                if (name ~ /move|rename|replace/ && (first = known(arg)) != "?") { say(first) }
                arg = known(first_arg(substr(args, length(arg) + 2)))
                if (arg != "?") { say(arg) }
            }
        }
        # A redirect inside a body names a file. With an extension of one it is a redirect anywhere but
        # after `=` or `-`, and so is a variable of the shell; a path with a slash and no extension only
        # after a space, a quote or at the line start, and not before a bracket. `a>b`, `a > b.length`,
        # `w > h/2` and `(w > h/c)` of the language compare.
        function redirects(s) {
            return s ~ /(^|[ \t\047"&])[0-9]?>>?[ \t]*[A-Za-z0-9_.~$@-]*\/[A-Za-z_.~$@][A-Za-z0-9_.~$@\/-]*([^A-Za-z0-9_.~$@\/)-]|$)/ \
                || s ~ /(^|[^=-])>[ \t]*[\047"]?[$][{]?[A-Z]/ \
                || s ~ /(^|[^=-])>[ \t]*[A-Za-z0-9_.~$@\/-]*\.(md|json|mjs|cjs|js|ts|tsx|sh|scss|css|html|yml|yaml|txt|xml|svg|toml|prisma|py|lock|conf|ini|env|cfg)([^A-Za-z0-9]|$)/
        }
        # A file is opened for a write by its mode, or by an arrow before the name in the words of perl.
        function opens(s) { return s ~ /open(Sync)?[ \t]*\(([^()]|\([^()]*\))*([\047"](w|a|x|r[bt]*\+)[bt+]*[\047"]|[\047"][ \t]*\+?>)/ }
        function puts(s) { return opens(s) || s ~ /(writeFileSync|writeFile|appendFileSync|appendFile|write_text|write_bytes)[ \t]*\(/ }
        # Whether the statement writes at all. A body with not a single write call does not give away its
        # paths: a command that sourced a laid-out helper and printed its answer was forbidden as an edit
        # of that helper — three times in a row in one session. A call counts with its bracket: the word
        # `mkdir` in a string is text.
        function writes(s) {
            return puts(s) || s ~ /(savefig|to_csv|\.write|\.save|\.dump)[ \t]*\(/ \
                || s ~ /(makedirs|mkdir|mkdirSync|rename|renames|renameSync|unlink|unlinkSync|rmtree|copyfile|copyFile|copyFileSync|copy2|cpSync|shutil\.[a-z0-9_]+|(os|Path\([^)]*\))\.replace)[ \t]*\(/ \
                || s ~ /[A-Za-z0-9_)]\.replace[ \t]*\([ \t]*[^,()= \t][^,()=]*\)|(^|[^.A-Za-z0-9_])replace[ \t]*\(/ \
                || redirects(s)
        }
        # The index of the bracket that closes the call whose arguments start at `from`: the quotes are
        # skipped, and a bracket inside a string closes nothing.
        function args_end(s, from,   i, c, depth, q) {
            depth = 1
            for (i = from; i <= length(s); i++) {
                c = substr(s, i, 1)
                if (q != "") { if (c == q && substr(s, i - 1, 1) != "\\") { q = "" } }
                else if (c == "\047" || c == "\"") { q = c }
                else if (c == "(") { depth++ }
                else if (c == ")" && --depth == 0) { return i }
            }
            return length(s) + 1
        }
        # The first argument of a call: everything up to a comma outside quotes and brackets.
        function first_arg(a,   i, c, depth, q) {
            for (i = 1; i <= length(a); i++) {
                c = substr(a, i, 1)
                if (q != "") { if (c == q && substr(a, i - 1, 1) != "\\") { q = "" } }
                else if (c == "\047" || c == "\"") { q = c }
                else if (c == "(") { depth++ }
                else if (c == ")") { depth-- }
                else if (c == "," && depth == 0) { return substr(a, 1, i - 1) }
            }
            return a
        }
        # A read on the line of a write names no target: the reading call loses its arguments, an import
        # its address. A file opened with no mode, or with one of reading, is read.
        function strip_reads(s,   out, name, from, endp, args) {
            gsub(/from[ \t]+[\047"][^\047"]*[\047"]/, "from", s)
            gsub(/(import|require)[ \t]*\([ \t]*[\047"][^\047"]*[\047"][ \t]*\)/, "import()", s)
            out = ""
            while (match(s, /(^|[^A-Za-z0-9_])(open|openSync|readFileSync|readFile)[ \t]*\(/)) {
                name = substr(s, RSTART, RLENGTH)
                from = RSTART + RLENGTH
                out = out substr(s, 1, from - 1)
                endp = args_end(s, from)
                args = substr(s, from, endp - from)
                if (name ~ /open/ && opens("open(" args ")")) { s = substr(s, from); continue }
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
        # What the script writes or substitutes is the content of the write, not its target: a path inside
        # the written string belongs to the content of that file. A script that edited a work file and
        # named a laid-out copy in the text of a new line was refused by the name of a copy it never
        # opened. The call stays and its first argument stays where that argument is the address
        # (`writeFileSync(path, data)`); the data and the argument of `.write(`, `.write_text(`,
        # `.write_bytes(` and of a string `.replace(` are cut.
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
        function add(s) {
            if (whole != "" && s ~ /appendFile(Sync)?[ \t]*\(|open(Sync)?[ \t]*\(([^()]|\([^()]*\))*([\047"](a|r[bt]*\+)[bt+]*[\047"]|[\047"][ \t]*>>)/) { return }
            line[++lines] = s; around[lines] = whole_line
            if (writes(s)) { wrote = 1 }
        }
        # One line of code holds several statements; a write of one names nothing of the next. What a call
        # prints into its own stream is no file.
        function statements(s,   i, c, q, cur) {
            gsub(/(process|sys)\.(stdout|stderr)\.write[ \t]*\(/, "print(", s)
            whole_line = s
            for (i = 1; i <= length(s); i++) {
                c = substr(s, i, 1)
                if (c == "\\") { cur = cur c substr(s, ++i, 1); continue }
                if (q != "") { if (c == q) { q = "" } }
                else if (c == "\047" || c == "\"" || c == "`") { q = c }
                else if (c == ";") { add(cur); cur = ""; continue }
                cur = cur c
            }
            add(cur)
        }
        # A variable given another path names the last one above the write.
        function body(s,   i, before) {
            lines = 0; wrote = 0; split("", varpath); split("", kept)
            commands(s)
            for (i = 1; i <= pieces; i++) { statements(piece[i]) }
            if (!wrote) { return }
            for (i = 1; i <= lines; i++) { note_var(line[i]); note_reads(line[i]) }
            for (i = 1; i <= lines; i++) {
                note_var(line[i])
                if (!writes(line[i])) { continue }
                before = said
                emit(strip_content(line[i])); emit_calls(line[i])
                if (said == before && puts(line[i])) { emit(strip_content(around[i])) }
            }
        }
        /^C / { text = text substr($0, 3) "\n"; next }
        { if (text != "") { body(text) } text = "" }
        END { if (text != "") { body(text) } }'
}
