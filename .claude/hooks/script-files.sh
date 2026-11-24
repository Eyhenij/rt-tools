#!/usr/bin/env bash
# rt-kit v0.39.1 · hooks/script-files.sh · 56e71c82ac52 · правится надстройкой, не здесь
# The script files a shell command runs, for the guards that judge a command by its text.
#
# NOT a guard: it has no `rt-hook:` declaration and hooks into no agent event. The parse of write
# targets and the delivery guard source it. An edit script saved to a file and run by its path is the
# same write, and a request opened from such a file is the same opening: the guards read the text of
# the command, where only the path of the file stands.
#
# WHAT IS HERE. The first two read the command on stdin, the last two take a file.
#
#   rt_cmd_vars      the literals the command gives its variables, one `name<tab>value` per line; a
#                    loop over literals gives its variable each of them
#   rt_script_files  the script files the command runs that are not code of the tree, one per line
#   rt_script_kind   `python`, `node` or `shell` — by the first line of the file, then by its name
#   rt_script_text   the text of the file without its comment lines and, in a shell script, without the
#                    bodies of its heredocs: both are data, not calls
#   rt_script_calls  of the text on stdin, the calls whose line answers the given expression, each with
#                    the lines its open quote or its backslash carries on to
#
# What counts as a run: an interpreter or a shell with a file, also behind `env` or by `<`, the code of
# `bash -c`, `source` or `.` with a file, and a path called by itself. A key with code of another
# interpreter — `-c`, `-e` — is no file, and `bash -n` runs nothing. Text in quotes and in the body of a
# heredoc is data. A file tracked by its repository is code of the tree and is not read: its checks
# write what they are asked to, and a run of a laid-out check would read as an edit. So are the
# installed packages and the builds — `node_modules`, `dist`. A file longer than 64 KB is not read: a
# script written by hand is shorter.
#
# NOT SEEN: a file fed through a pipe, a runner this list does not name (`npx tsx`, `uv run`), a path
# from the arguments of the script and a script another script runs.
#
# FAIL-OPEN: no file, a path the shell still has to compute, a file of the tree — nothing is printed.

# The path with every variable the command gave a literal put in, one line per value. The variables
# come in `RT_SF_VARS`; a name with several values gives a line for each.
RT_SF_EXPAND='
    function rt_vars_read(   i, p, n, rows) {
        n = split(ENVIRON["RT_SF_VARS"], rows, "\n")
        for (i = 1; i <= n; i++) {
            p = index(rows[i], "\t")
            if (p) { c++; name[c] = substr(rows[i], 1, p - 1); value[c] = substr(rows[i], p + 1) }
        }
    }
    function rt_expand(w, depth,   i, f, v, at, hit) {
        if (depth == 1) { en = 0 }
        for (i = 1; i <= c && depth < 5 && en < 32; i++) {
            for (f = 1; f <= 2; f++) {
                v = f == 1 ? "${" name[i] "}" : "$" name[i]
                at = index(w, v)
                if (!at || (f == 2 && substr(w, at + length(v), 1) ~ /[A-Za-z0-9_]/)) { continue }
                hit = 1
                rt_expand(substr(w, 1, at - 1) value[i] substr(w, at + length(v)), depth + 1)
            }
        }
        if (!hit && en < 32) { ev[++en] = w }
    }
'

# Every quoted literal loses its quotes; a value the shell still has to compute is no literal.
rt_cmd_vars() {
    awk -v sq="'" '
        {
            s = $0
            while (match(s, "(^|[;&|( \t])[A-Za-z_][A-Za-z0-9_]*=(\"[^\"$`]*\"|" sq "[^" sq "]*" sq "|[^ \t;&|()\"$`" sq "]+)")) {
                t = substr(s, RSTART, RLENGTH)
                s = substr(s, RSTART + RLENGTH)
                sub(/^[;&|( \t]/, "", t)
                name = t; sub(/=.*/, "", name)
                value = substr(t, length(name) + 2); gsub("[\"" sq "]", "", value)
                if (value != "") { print name "\t" value }
            }
            s = $0
            while (match(s, /(^|[;&|( \t])for[ \t]+[A-Za-z_][A-Za-z0-9_]*[ \t]+in[ \t]+[^;]*/)) {
                t = substr(s, RSTART, RLENGTH)
                s = substr(s, RSTART + RLENGTH)
                n = split(t, w, /[ \t]+/)
                for (i = 1; i <= n && w[i] !~ /for$/; i++) {}
                for (j = i + 3; j <= n; j++) { gsub("[\"" sq "]", "", w[j]); if (w[j] != "" && w[j] !~ /[$`*?]/) { print w[i + 1] "\t" w[j] } }
            }
        }
    '
}

# The text without the bodies of its heredocs. A mark with no closing line below it opens nothing.
rt_no_heredocs() {
    awk -v sq="'" '
        { line[NR] = $0 }
        END {
            for (i = 1; i <= NR; i++) {
                print line[i]
                s = line[i]; gsub(/<<</, " ", s)
                while (match(s, "<<-?[ \t]*(\"[^\"]+\"|" sq "[^" sq "]+" sq "|[A-Za-z_][A-Za-z0-9_]*)")) {
                    tag = substr(s, RSTART, RLENGTH); s = substr(s, RSTART + RLENGTH)
                    sub(/^<<-?[ \t]*/, "", tag); gsub("[\"" sq "]", "", tag)
                    for (j = i + 1; j <= NR; j++) {
                        t = line[j]; gsub(/^[ \t]+|[ \t]+$/, "", t)
                        if (t == tag) { i = j; break }
                    }
                }
            }
        }
    '
}

# The paths of the scripts as the command names them, each joined with the directory of the last `cd`
# before it. Printed before the file is looked at: which of them exist and are not of the tree is asked
# by `rt_script_files`.
#
# The command is cut into parts by the separators outside the quotes; a substitution is a part of its
# own. A separator or a space inside quotes is carried under another sign and put back in a path.
rt_script_words() {
    RT_SF_VARS="$1" RT_SF_DIR="$2" awk -v sq="'" "$RT_SF_EXPAND"'
        function hidden(ch,   at) { at = index(shown, ch); return at ? substr(codes, at, 1) : ch }
        function opened(w,   i, out, ch, at) {
            for (i = 1; i <= length(w); i++) { ch = substr(w, i, 1); at = index(codes, ch); out = out (at ? substr(shown, at, 1) : ch) }
            return out
        }
        # Where the bracket of a substitution closes; quotes are skipped.
        function closes(s, from,   i, ch, depth, quote) {
            depth = 1
            for (i = from; i <= length(s); i++) {
                ch = substr(s, i, 1)
                if (ch == "\\" && quote != sq) { i++; continue }
                if (quote != "") { if (ch == quote) { quote = "" } ; continue }
                if (ch == "\"" || ch == sq) { quote = ch; continue }
                if (ch == "(") { depth++ }
                if (ch == ")" && --depth == 0) { return i }
            }
            return length(s) + 1
        }
        function scan(s,   i, ch, next_ch, quote, cur, at) {
            for (i = 1; i <= length(s); i++) {
                ch = substr(s, i, 1); next_ch = substr(s, i + 1, 1)
                if (quote == sq) { if (ch == sq) { quote = "" } else { cur = cur hidden(ch) } ; continue }
                if (ch == "\\") { if (next_ch != "\n") { cur = cur hidden(next_ch) } else { cur = cur " " } ; i++; continue }
                if (ch == "$" && next_ch == "(") { at = closes(s, i + 2); scan(substr(s, i + 2, at - i - 2)); cur = cur gap; i = at; continue }
                if (ch == "`") {
                    at = index(substr(s, i + 1), "`")
                    if (at) { scan(substr(s, i + 1, at - 1)); cur = cur gap; i += at }
                    continue
                }
                if (quote == "\"") { if (ch == "\"") { quote = "" } else { cur = cur hidden(ch) } ; continue }
                if (ch == sq || ch == "\"") { quote = ch; continue }
                if (ch == "#" && (cur == "" || substr(s, i - 1, 1) ~ /[ \t\n]/)) {
                    while (i < length(s) && substr(s, i + 1, 1) != "\n") { i++ }
                    continue
                }
                if (ch == "&" && (next_ch == ">" || (i > 1 && index("<>", substr(s, i - 1, 1))))) { cur = cur ch; continue }
                if (index(";|&()\n", ch)) { part[++parts] = cur; cur = ""; continue }
                cur = cur ch
            }
            part[++parts] = cur
        }
        function joined(p) { return p ~ /^\// ? p : dir "/" p }
        # The path as the command names it: a variable with several literals gives several.
        function path_of(w) {
            w = opened(w)
            sub(/^~\//, ENVIRON["HOME"] "/", w)
            rt_expand(w, 1)
            return ev[1]
        }
        function print_paths(w,   i) { path_of(w); for (i = 1; i <= en; i++) { print joined(ev[i]) } }
        BEGIN { shown = " \t\n;|&()"; codes = "\001\002\003\004\005\006\007\010"; gap = "\016"; dir = ENVIRON["RT_SF_DIR"]; rt_vars_read() }
        { text = text $0 "\n" }
        END {
            scan(text)
            for (k = 1; k <= parts; k++) {
                words = split(part[k], raw, /[ \t]+/)
                at = 1
                # The words before a command that only run it, and the variables set for it.
                while (at <= words && (raw[at] == "" || raw[at] ~ /^([A-Za-z_][A-Za-z0-9_]*=|-|[0-9][0-9.]*[smhd]?$)/ || raw[at] ~ /^(then|do|else|if|elif|while|until|time|timeout|nohup|([^ ]*\/)?env|sudo|command|exec|nice|caffeinate|!|[{])$/)) { at++ }
                if (at > words) { continue }
                head = path_of(raw[at]); base = head; sub(/.*\//, "", base)
                if (head == "cd" && at < words) { dir = joined(path_of(raw[at + 1])); continue }
                if (head == "source" || head == ".") { if (at < words) { print_paths(raw[at + 1]) } ; continue }
                if (base ~ /^(bash|sh|zsh|python[0-9.]*|node|ruby|perl|php|deno|bun)$/) {
                    shell = base ~ /sh$/
                    for (j = at + 1; j <= words; j++) {
                        w = raw[j]
                        if (w == "" || w == "run") { continue }
                        if (w == "<") { if (j < words) { print_paths(raw[j + 1]) } ; break }
                        if (w ~ /^<[^<(&]/) { print_paths(substr(w, 2)); break }
                        # The standard input is no file; another redirect of the call is skipped.
                        if (w == "-" || w ~ /^[<>]/) { break }
                        if (shell) {
                            if (w ~ /^-[A-Za-z]*n[A-Za-z]*$/) { break }
                            if (w ~ /^-[A-Za-z]*c[A-Za-z]*$/) { if (j < words) { scan(opened(raw[j + 1])) } ; break }
                            if (w ~ /^[-+][A-Za-z]*[oO]$/) { j++; continue }
                        } else {
                            # Code in an argument and a module are no file.
                            if (w ~ /^(-[A-Za-z]*[cemp]|--eval|--print)$/) { break }
                            if (w ~ /^(-r|--require|--import|--loader|-W|-X)$/) { j++; continue }
                        }
                        if (w ~ /^[-+]/) { continue }
                        print_paths(w)
                        break
                    }
                    continue
                }
                if (head ~ /\//) { print_paths(raw[at]) }
            }
        }
    '
}

rt_script_files() {
    _sf_text="$(rt_no_heredocs)"
    _sf_dir="$(command -v rt_hook_cwd >/dev/null 2>&1 && rt_hook_cwd 2>/dev/null)"
    [ -d "$_sf_dir" ] || _sf_dir="$PWD"
    printf '%s\n' "$_sf_text" \
        | rt_script_words "$(printf '%s\n' "$_sf_text" | rt_cmd_vars)" "$_sf_dir" \
        | sort -u \
        | while IFS= read -r _sf_file; do
            case "$_sf_file" in
                */node_modules/* | */dist/* | /bin/* | /usr/* | /opt/* | /sbin/*) continue ;;
            esac
            [ -f "$_sf_file" ] || continue
            [ "$(wc -c < "$_sf_file" 2>/dev/null | tr -d ' ')" -le 65536 ] 2>/dev/null || continue
            git -C "$(dirname "$_sf_file")" ls-files --error-unmatch -- "$_sf_file" >/dev/null 2>&1 && continue
            # A compiled program is no script.
            LC_ALL=C grep -qI . "$_sf_file" 2>/dev/null || continue
            printf '%s\n' "$_sf_file"
        done
}

rt_script_kind() {
    case "$(head -c 128 "$1" 2>/dev/null | head -1)" in
        '#!'*python*) printf 'python'; return 0 ;;
        '#!'*node* | '#!'*ruby* | '#!'*perl* | '#!'*php*) printf 'node'; return 0 ;;
        '#!'*) printf 'shell'; return 0 ;;
    esac
    case "${1##*/}" in
        *.py) printf 'python' ;;
        *.mjs | *.cjs | *.js | *.ts | *.rb | *.pl | *.php) printf 'node' ;;
        *) printf 'shell' ;;
    esac
}

rt_script_calls() {
    RT_SC_WANT="$1" awk -v sq="'" '
        {
            if (!open && $0 !~ ENVIRON["RT_SC_WANT"]) { next }
            print
            open = 0
            for (i = 1; i <= length($0); i++) {
                ch = substr($0, i, 1)
                if (ch == "\\" && quote != sq) { open = i == length($0); i++; continue }
                if (quote != "") { if (ch == quote) { quote = "" } } else if (ch == "\"" || ch == sq) { quote = ch }
            }
            if (quote != "") { open = 1 }
        }
    '
}

rt_script_text() {
    case "$(rt_script_kind "$1")" in
        shell) sed -E '/^[[:space:]]*#/d' "$1" 2>/dev/null | rt_no_heredocs ;;
        python) sed -E '/^[[:space:]]*#/d' "$1" 2>/dev/null ;;
        *) sed -E '/^[[:space:]]*(\/\/|#)/d' "$1" 2>/dev/null ;;
    esac
}
