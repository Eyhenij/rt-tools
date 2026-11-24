#!/usr/bin/env bash
# rt-kit v0.39.1 · hooks/shell-words.sh · 6e884fb2b718 · правится надстройкой, не здесь
# The words of a shell command: which file a call writes, which code it hands to an interpreter.
#
# NOT a guard and not a hook: there is deliberately no `rt-hook:` line. `write-targets.sh` sources it.
#
# The text is read sign by sign, not by substitutions: a quote, a separator and a torn line are the
# borders of a word, and a pattern over the whole line sees them only by chance. `sed` with `;` inside
# its expression, a flag after the expression and a path with a space were lost that way.
#
# In: the text of a command. Out, a line each: `W <path>` — a file written whole; `A <path>` — one added
# to or edited in place; `T <path> TAB <source>` — the target of a copy: a file, or a folder the copy
# gets the name of its source in; `C <line>` with `E` at the end — code handed to an interpreter;
# `S <line>` with `E` — a command handed to a shell. Quoted text is data: a redirection inside quotes
# writes nothing. The body of a heredoc belongs to the call its `<<` stands in, to the pipe after it or
# to whoever runs the file it is written to: an interpreter or a shell reads it as code, for anybody
# else it is data.
#
# NOT SEEN: a redirection inside backquotes, a group `{ … }` in a pipe, a command of a container or of
# another machine, `case` inside `$(…)`.

rt_shell_words() {
    # Signs are read as bytes: the awk of one of the systems stops at a letter of two bytes.
    LC_ALL=C awk '
        # A runner stands before the name of a command; some of its flags carry a value in the next word.
        BEGIN {
            valued["sudo"] = "^(-[ugpChTrD]|--(user|group|prompt|chdir|host))$"
            valued["env"] = "^(-[uC]|--(unset|chdir))$"
            valued["timeout"] = valued["gtimeout"] = "^(-[sk]|--(signal|kill-after))$"
            valued["caffeinate"] = "^-[tw]$"; valued["npx"] = "^(-p|--package)$"
            valued["nice"] = "^(-n|--adjustment)$"; valued["xargs"] = "^(-[IJRnPLdsE]|--(max-args|max-procs|max-lines|max-chars|delimiter|arg-file|replace))$"
            valued["exec"] = "^-a$"; valued["time"] = "^-[fo]$"
            valued["stdbuf"] = "^(-[ioe]|--(input|output|error))$"
            valued["doas"] = "^-[uC]$"; valued["arch"] = "^-[de]$"
            valued["command"] = valued["builtin"] = valued["nohup"] = valued["coproc"] = "^$"
            WORD = "^(then|do|else|if|elif|while|until|!|\\{)$"
            RUNNER = "^(uv|op|poetry|pipenv|rye|hatch|mise|direnv)$"
            PACKAGE = "^(-C|--dir|-F|--filter|--filter-prod|-w|--workspace)$"
            SWITCH = "^-[pnlaswtTuUcfX0-9]*"
            LOADS = "^(-r|--require|--import|--loader|--env-file|--input-type|--conditions|-C)$"
            # The words of these commands run nothing here: a name of an interpreter among them is searched
            # for or printed, and a command of another machine writes there.
            PLAIN = "^([a-z]*grep|rg|ag|git|gh|echo|printf|man|which|type|brew|ls|cat|jq|awk|head|tail|cd|export|kill|pkill|pgrep|ps|lsof|ssh|scp|rsync|docker|podman|tee|cp|mv|install|g?sed)$"
            # The calls of a language that run a command.
            RUNS = "(execSync|exec|execFileSync|spawnSync|spawn|system|popen|Popen|check_output|check_call|getoutput|run|call|shell_exec|passthru)"
        }
        function put(s) { word = word s; some = 1 }
        function clean(s) { sub(/^(\.\/)+/, "", s); return s }
        function target(mark, s) {
            if (mark != "T") { s = clean(s); outs = outs "\n" s }
            if (s != "" && s != "$()" && s !~ /^\/dev\/(null|stderr|stdout|tty)$/) { print mark " " s }
        }
        function base_name(s) { sub(/\/+$/, "", s); sub(/^.*\//, "", s); return s }
        function end_word() {
            if (!some) { return }
            if (skip == 2 && (quoted || word ~ /^[A-Za-z_]/)) { tags[++asked] = word; here = here " " asked }
            if (skip == 3) { body["s" ++strings] = word; here = here " s" strings }
            if (skip) { skip = 0 }
            else if (redirect != "") {
                # `>&` with a number, a dash or a variable joins streams; with a name it writes a file.
                # Text in backquotes is quoted more often than run: its arrow is not a redirection.
                if (depth && kinds[depth] == "`") { }
                else if (!joins || word !~ /^([0-9]+|-|\$.*)$/) { target(redirect, word) }
                redirect = ""; joins = 0
            }
            else { words[++count] = word; bare[count] = !quoted }
            word = ""; some = 0; quoted = 0
        }
        function emit(mark, s,   n, i, part) { n = split(s, part, "\n"); for (i = 1; i <= n; i++) { print mark " " part[i] } print "E" }
        function hand(mark, s) { if (mark == "C") { code(s) } else { emit(mark, s) } }
        # Code names a command as a string of a call that runs it, or through a variable of that string. The
        # string is read as a command and leaves the code: its redirection is none of the language.
        function code(s,   rest, out, call, text, name, i, n, part, held, at, long) {
            text = "(\"[^\"]*\"|\047[^\047]*\047|`[^`]*`)"
            n = split(s, part, /[\n;]/)
            for (i = 1; i <= n; i++) {
                if (match(part[i], "[A-Za-z_][A-Za-z0-9_]*[ \t]*=[ \t]*[fr]?" text)) {
                    call = substr(part[i], RSTART, RLENGTH)
                    name = call; sub(/[ \t]*=.*$/, "", name); sub(/^[^=]*=[ \t]*[fr]?./, "", call); held[name] = substr(call, 1, length(call) - 1)
                }
            }
            rest = s
            while (match(rest, "(^|[^A-Za-z0-9_])" RUNS "[ \t]*[( ][ \t]*([fr]?" text "|[A-Za-z_][A-Za-z0-9_]*[ \t]*[,)])")) {
                at = RSTART; long = RLENGTH; call = substr(rest, at, long)
                if (match(call, text "$")) {
                    emit("S", substr(call, RSTART + 1, RLENGTH - 2))
                    out = out substr(rest, 1, at - 1) substr(call, 1, RSTART - 1)
                } else {
                    out = out substr(rest, 1, at + long - 1)
                    sub(/[ \t]*[,)]$/, "", call); sub(/^.*[^A-Za-z0-9_]/, "", call)
                    if (call in held) { emit("S", held[call]) }
                }
                rest = substr(rest, at + long)
            }
            emit("C", out rest)
        }
        function after_flags(n, values) {
            while (words[n] ~ /^-/) { n += words[n] ~ values ? 2 : 1 }
            return n
        }
        # The first word that names the command: assignments, words of the shell and runners stand before it.
        function command_at(   i, n, runner) {
            for (i = 1; i <= count; i++) {
                if (words[i] ~ /^[A-Za-z_][A-Za-z0-9_]*\+?=/ || words[i] ~ WORD) { continue }
                if (words[i] == "function") { i++; continue }
                runner = base_name(words[i])
                if (runner ~ /^(pnpm|npm|yarn)$/) {
                    n = after_flags(i + 1, PACKAGE)
                    if (words[n] != "exec") { return i }
                    i = after_flags(n + 1, PACKAGE) - 1
                    continue
                }
                if (runner ~ RUNNER && (words[i + 1] == "run" || words[i + 1] == "exec")) {
                    for (n = i + 2; n <= count && words[n] != "--"; n++) {}
                    if (n > count) { n = after_flags(i + 2, "^$") - 1 }
                    i = n
                    continue
                }
                if (runner == "find") {
                    n = i
                    while (n <= count && words[n] !~ /^-(exec|execdir|ok)$/) { n++ }
                    if (n > count) { return i }
                    i = n
                    for (n++; n <= count; n++) { if (words[n] ~ /^[;+]$/) { while (count >= n) { delete words[count--] } } }
                    continue
                }
                if (!(runner in valued)) { return i }
                while (i < count && words[i + 1] ~ /^-/) {
                    i++
                    if (runner == "env" && words[i] ~ /^(-S|--split-string)$/) { emit("S", words[++i]) }
                    else if (words[i] ~ valued[runner]) { i++ }
                }
                if (runner ~ /^g?timeout$/) { i++ }
            }
            return 0
        }
        function reads_as(name) {
            if (name ~ /^(bash|sh|zsh|eval)$/) { return "S" }
            return name ~ /^(python[0-9.]*|php|node|deno|bun|ruby|perl)$/ ? "C" : ""
        }
        # Behind a runner this module does not know stands an interpreter, named by a word of its own.
        function reader_at(i,   n, name) {
            if (!i || reads_as(base_name(words[i])) != "" || base_name(words[i]) ~ PLAIN) { return i }
            for (n = i + 1; n <= count; n++) {
                name = base_name(words[n])
                if (bare[n] && words[n] !~ /\./ && name != "eval" && reads_as(name) != "") { return n }
            }
            return i
        }
        # The operands after the flags; `takes` names the flags that carry the script in the next word.
        function operands(from, takes, carries,   i, done, script) {
            script = 0; done = 0; kept = 0
            for (i = from; i <= count; i++) {
                if (!done && words[i] == "--") { done = 1; continue }
                if (!done && words[i] ~ takes) { script = 1; i++; continue }
                if (!done && words[i] ~ carries) { script = 1; continue }
                if (words[i] == "" || (!done && words[i] ~ /^-./)) { continue }
                operand[++kept] = words[i]
            }
            return script
        }
        function splits(from,   n, mark) {
            mark = "W"
            for (n = from; n <= count; n++) { if (words[n] ~ /^(-[a-z]*a|--append)/) { mark = "A" } }
            for (n = from; n <= count; n++) { if (words[n] !~ /^-/) { target(mark, words[n]) } }
        }
        # A copy into a folder writes a file of the same name there.
        function copies(from, name,   n, dir, last) {
            dir = ""; kept = 0
            for (n = from; n <= count; n++) {
                if (words[n] ~ /^(-[a-zA-Z]*t|--target-directory)$/) { dir = words[++n] }
                else if (words[n] ~ /^--target-directory=/) { dir = words[n]; sub(/^[^=]*=/, "", dir) }
                else if (words[n] ~ /^(-S|--suffix)$/ || (name == "install" && words[n] ~ /^(-[a-zA-Z]*[mog]|--(mode|owner|group))$/)) { n++ }
                else if (words[n] !~ /^-./) { operand[++kept] = words[n] }
            }
            if (dir != "" && !kept) { target("W", dir) }
            if (dir == "" && kept < 2) { return }
            last = dir
            if (dir == "") { last = operand[kept--] }
            if (last ~ /^\/dev\//) { return }
            # A slash at the end says a folder; without it the disk knows, not the text.
            if ((dir != "" || kept > 1) && last !~ /\/$/) { last = last "/" }
            for (n = 1; n <= kept; n++) { target("T", last "\t" operand[n]) }
        }
        function edits(from,   n, inplace, script) {
            inplace = 0
            for (n = from; n <= count; n++) { if (words[n] ~ /^-[nErsuzl]*i/ || words[n] ~ /^--in-place/) { inplace = n } }
            if (!inplace) { return }
            # On one of the systems the suffix of the copy stands apart from the flag.
            if (words[inplace] ~ /^-[nErsuzl]*i$/ && words[inplace + 1] ~ /^(\.[A-Za-z0-9_]+)?$/) { words[inplace + 1] = "" }
            script = operands(from, "^(-[nErsuz]*[ef]|--expression|--file)$", "^(-[ef].|--expression=|--file=)")
            for (n = script ? 1 : 2; n <= kept; n++) { target("A", operand[n]) }
        }
        # The code of a one-liner that edits in place names no file: the files stand after it. A filter over
        # its input writes no file by its code either.
        function oneliner(from,   n, inplace, filter, body) {
            inplace = 0; filter = 0; body = ""
            for (n = from; n <= count && words[n] ~ /^-./; n++) {
                if (words[n] ~ /^-[Ir]$/) { n++; continue }
                if (words[n] ~ (SWITCH "i")) { inplace = 1 }
                if (words[n] ~ /^-[a-zA-Z]*[np][a-zA-Z0-9]*[eE]$/) { filter = 1 }
                if (words[n] ~ (SWITCH "i?[eE]$")) { body = words[++n] }
                else if (match(words[n], SWITCH "[eE]")) { body = substr(words[n], RLENGTH + 1) }
            }
            if (!inplace) { if (body != "" && !filter) { code(body) } return }
            for (; n <= count; n++) { target("A", words[n]) }
        }
        # The code stands among the flags; after the name of a script the words are its own.
        function given(from, flags, values, mark,   n) {
            for (n = from; n <= count && (words[n] ~ /^(-|eval$)/ || (words[n - 1] ~ /^--[a-z]/ && words[n] !~ /[.\/]/ && words[n + 1] ~ /^-/)); n++) {
                if (words[n] ~ flags) { if (words[n + 1] == "--") { n++ } hand(mark, words[n + 1]); return }
                if (words[n] ~ /^(-c.|--(eval|print)=)/) { sub(/^(-c|--[a-z]+=)/, "", words[n]); hand(mark, words[n]); return }
                if (words[n] ~ values) { n++ }
            }
        }
        # A move by the version control and a copy out of a container name their target the same way.
        function inner(from, name, sub_name, values,   n) {
            for (n = from; n <= count && words[n] ~ /^-/; n++) { if (words[n] ~ values) { n++ } }
            if (words[n] == sub_name) { copies(n + 1, name) }
        }
        # Whether the call takes its code from a heredoc: a script or a code flag makes the body data, and a
        # check of the syntax runs nothing.
        function listens(from, coded, values,   n) {
            for (n = from; n <= count && words[n] ~ /^-./; n++) {
                if (words[n] == "-s" && coded == "c") { return 1 }
                if (words[n] ~ /^-[a-z]*n[a-z]*$/ && coded == "c") { return 0 }
                if (words[n] ~ ("^-[a-zA-Z]*[" coded "]$") || words[n] ~ /^--(eval|print)/) { return 0 }
                if (words[n] ~ values) { n++ }
            }
            return n > count || words[n] == "-" || words[n] == "/dev/stdin"
        }
        function takes_body(i, name) {
            if (name ~ /^(bash|sh|zsh)$/) { return listens(i + 1, "c", "^-[a-z]*[oO]$") }
            if (name ~ /^(python[0-9.]*|php)$/) { return listens(i + 1, "cmr", "^-[WX]$") }
            return reads_as(name) == "C" && listens(i + 1, "ep", LOADS)
        }
        # The text a substitution printed is code where it stands after a code flag or as the script.
        function takes_text(i, name,   n, operand_seen) {
            for (n = i + 1; n <= count; n++) {
                if (words[n] ~ /\$\(\)/ && (words[n - 1] ~ /^(-[a-zA-Z]*[cepr]|--eval|--print|--)$/ || !operand_seen)) { return 1 }
                if (words[n] !~ /^-./) { operand_seen = 1 }
            }
            return 0
        }
        function claim(list, mark,   n, i, parts) {
            n = split(list, parts, " ")
            for (i = 1; i <= n; i++) { reader[parts[i]] = mark }
        }
        # A body written to a file is the code of whoever runs that file further on.
        function runs_file(i, name,   n, path, mark) {
            path = clean(words[i]); mark = reads_as(name)
            if (mark != "") {
                for (n = i + 1; n <= count && words[n] ~ /^-./; n++) {}
                path = clean(words[n])
            }
            if (path == "" || !(path in owner)) { return }
            if (mark == "") { mark = path ~ /\.(py|[cm]?js|ts|rb|pl|php)$/ ? "C" : "S" }
            claim(owner[path], mark)
        }
        function keeps_body(list,   n, i, path) {
            n = split(outs, path, "\n")
            for (i = 1; i <= n; i++) { if (path[i] != "") { owner[path[i]] = list } }
        }
        function end_call(sign,   i, name, text, given_here) {
            end_word(); redirect = ""; skip = 0; joins = 0
            i = reader_at(command_at())
            name = i ? base_name(words[i]) : ""
            # A pipe hands the body on; a torn line after the pipe ends nothing.
            if (here != "" && takes_body(i, name)) { claim(here, reads_as(name)); here = "" }
            if (texts_in != "" && reads_as(name) != "" && takes_text(i, name)) { claim(texts_in, reads_as(name)) }
            if (count) { texts_in = "" }
            if (i) { runs_file(i, name) }
            given_here = here
            if (count) { printed = name == "cat" ? here : "" }
            if (here != "" && sign != "|" && count) { here = "" }
            if (name == "tee") { splits(i + 1) }
            else if (name ~ /^(cp|mv|install)$/) { copies(i + 1, name) }
            else if (name == "git") { inner(i + 1, name, "mv", "^-[Cc]$") }
            else if (name ~ /^(docker|podman)$/) { inner(i + 1, name, "cp", "^$") }
            else if (name ~ /^g?sed$/) { edits(i + 1) }
            else if (name ~ /^(perl|ruby)$/) { oneliner(i + 1) }
            else if (name ~ /^(node|deno|bun)$/) { given(i + 1, "^(-[a-z]*[ep]|--eval|--print|eval)$", LOADS, "C") }
            else if (name ~ /^(python[0-9.]*|php)$/) { given(i + 1, "^(-[a-zA-Z]*c|-r)$", "^-[WX]$", "C") }
            else if (name ~ /^(bash|sh|zsh)$/) { given(i + 1, "^-[a-z]*c$", "^-[a-z]*[oO]$", "S") }
            else if (name == "eval") {
                text = ""
                for (i++; i <= count; i++) { text = text words[i] " " }
                emit("S", text)
            }
            if (given_here != "") { keeps_body(given_here) }
            if (sign != "|") { outs = "" }
            for (i = 1; i <= count; i++) { delete words[i] }
            count = 0
        }
        function in_test(   i) {
            for (i = 1; i <= count && words[i] ~ WORD; i++) {}
            if (words[i] != "[[" || !bare[i]) { return 0 }
            for (; i <= count; i++) { if (words[i] == "]]" && bare[i]) { return 0 } }
            return 1
        }
        # A substitution is a command of its own inside a word: the outer call waits for it.
        function enter(kind,   i) {
            depth++
            kinds[depth] = kind; quotes[depth] = quote; texts[depth] = word; somes[depth] = some; marked[depth] = quoted
            marks[depth] = redirect; skips[depth] = skip; joint[depth] = joins; counts[depth] = count
            heres[depth] = here; outer[depth] = texts_in; here = ""; texts_in = ""; printed = ""
            for (i = 1; i <= count; i++) { saved[depth, i] = words[i]; naked[depth, i] = bare[i]; delete words[i] }
            count = 0; word = ""; some = 0; quoted = 0; redirect = ""; skip = 0; joins = 0; quote = ""
        }
        function leave(   i) {
            end_call()
            if (!depth) { return }
            quote = quotes[depth]; word = texts[depth]; some = somes[depth]; quoted = marked[depth]
            redirect = marks[depth]; skip = skips[depth]; joins = joint[depth]; count = counts[depth]
            here = heres[depth]; texts_in = outer[depth]
            if (kinds[depth] != "(" && printed != "") { texts_in = texts_in printed; printed = "" }
            for (i = 1; i <= count; i++) { words[i] = saved[depth, i]; bare[i] = naked[depth, i] }
            if (kinds[depth] == "(") { end_call() } else { put("$()") }
            depth--
        }
        # Arithmetic closes on the same line and holds no command.
        function sums(s) { return s ~ /^[^;&|]*\)\)/ || s ~ /^[^;()]*\)\)/ }
        # The index of the brace that closes a parameter: a quote inside it opens no string of the command.
        function brace(from,   i, open) {
            open = 1
            for (i = from; i <= m; i++) {
                if (sign[i] == "{") { open++ }
                if (sign[i] == "}" && --open == 0) { return i }
            }
            return from - 1
        }
        # A body goes on until its mark stands on a line alone.
        bodies {
            text = $0; gsub(/^[ \t]+|[ \t]+$/, "", text)
            if (text != tags[given_up + 1]) { body[given_up + 1] = body[given_up + 1] $0 "\n" }
            else if (++given_up == asked) { bodies = 0 }
            next
        }
        {
            m = split($0 "\n", sign, "")
            for (p = 1; p <= m; p++) {
                c = sign[p]; d = sign[p + 1]
                if (quote == "\047") { if (c == quote) { quote = "" } else { put(c) } continue }
                if (quote == "$") {
                    if (c == "\\") { put(d); p++ } else if (c == "\047") { quote = "" } else { put(c) }
                    continue
                }
                if (c == "\\" && quote == "") { if (d != "\n") { put(d) } p++; continue }
                if (c == "\\" && (d == quote || d == "\\" || d == "$" || d == "`")) { put(d); p++; continue }
                if (c == "$" && d == "{") {
                    e = brace(p + 2); text = ""
                    while (p <= e) { text = text sign[p]; put(sign[p++]) }
                    p--
                    if (match(text, /\$\(.*\)/)) { emit("S", substr(text, RSTART + 2, RLENGTH - 3)) }
                    continue
                }
                if (c == "$" && d == "(" && sign[p + 2] == "(" && sums(substr($0, p + 3))) {
                    p += 2 + index(substr($0, p + 3), "))") + 1; put("$(())"); continue
                }
                if (c == "$" && d == "(") { some = 1; enter("$"); p++; continue }
                # A backquote opens a substitution, and the next one closes it.
                if (c == "`" && depth && kinds[depth] == c) { quote = ""; leave(); continue }
                if (c == "`") { some = 1; enter(c); continue }
                if (quote != "") { if (c == quote) { quote = "" } else { put(c) } continue }
                if (c == "$" && d == "\047") { quote = "$"; some = 1; quoted = 1; p++; continue }
                if (c == "\047" || c == "\"") { quote = c; some = 1; quoted = 1; continue }
                if (c == "#" && !some) { end_call(); bodies = asked > given_up; break }
                if (c == " " || c == "\t") { end_word(); continue }
                if (c == "&" && d == ">") { end_word(); continue }
                # A comparison is no redirection.
                if (c ~ /[<>&|()]/ && in_test()) { put(c); continue }
                if ((c == ">" || c == "<") && d == "(") { some = 1; enter("<"); p++; continue }
                if (c == ">" || c == "<") {
                    if (word ~ /^[0-9]+$/) { word = ""; some = 0 }
                    end_word()
                    mark = d == ">" ? "A" : "W"
                    skip = c == "<"
                    if (skip && d == "<") { skip = sign[p + 2] == "<" ? 3 : 2 }
                    while (sign[p + 1] ~ (c == ">" ? "[>|]" : "[<-]")) { p++ }
                    if (sign[p + 1] == "&") { p++; joins = c == ">" }
                    redirect = skip ? "" : mark
                    continue
                }
                if (c == "(" && d == "(" && sums(substr($0, p + 2))) { p += index(substr($0, p + 2), "))") + 2; continue }
                if (c == "(") { end_call(); enter("("); continue }
                if (c == ")") { leave(); continue }
                if (c == "\n") { end_call(); bodies = asked > given_up; continue }
                if (c == "|" && d == "&") { end_call(c); p++; continue }
                if (c ~ /[;&|]/) { end_call(c == "|" && d != "|" ? c : ""); continue }
                put(c)
            }
        }
        END {
            while (depth) { quote = ""; leave() }
            end_call()
            for (p = 1; p <= asked; p++) { if (reader[p] != "") { hand(reader[p], body[p]) } }
            for (p = 1; p <= strings; p++) { if (reader["s" p] != "") { hand(reader["s" p], body["s" p]) } }
        }
    '
}
