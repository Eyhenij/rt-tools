#!/usr/bin/env bash
# rt-kit v0.39.1 · hooks/script-files.sh · 21cc6386d1ee · правится надстройкой, не здесь
# The script files a shell command runs, for the guards that judge a command by its text.
#
# NOT a guard: it has no `rt-hook:` declaration and hooks into no agent event. The parse of write
# targets and the delivery guard source it. An edit script saved to a file and run by its path is the
# same write, and a request opened from such a file is the same opening: the guards read the text of
# the command, where only the path of the file stands.
#
# WHAT IS HERE. Two calls, both read the command on stdin.
#
#   rt_cmd_vars      the literals the command gives its variables, one `name<tab>value` per line; a
#                    loop over literals gives its variable each of them
#   rt_script_files  the script files the command runs that are not code of the tree, one per line
#
# What counts as a run: an interpreter or a shell with a file, `source` or `.` with one, and a path
# called by itself. A key with code — `-c`, `-e` — is no file. A file tracked by its repository is code
# of the tree and is not read: its checks write what they are asked to, and a run of a laid-out check
# would read as an edit. So are the installed packages and the builds — `node_modules`, `dist`. A file
# longer than 64 KB is not read: a script written by hand is shorter.
#
# FAIL-OPEN: no file, a path the shell still has to compute, a file of the tree — nothing is printed.

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

# The paths of the scripts as the command names them, each joined with the directory of the last `cd`
# before it. Printed before the file is looked at: which of them exist and are not of the tree is asked
# by `rt_script_files`.
rt_script_words() {
    RT_SF_VARS="$1" RT_SF_DIR="$2" awk -v sq="'" '
        function filled(w,   i, v, at) {
            gsub("[\"" sq "]", "", w)
            sub(/^~\//, ENVIRON["HOME"] "/", w)
            for (i = 1; i <= c; i++) {
                v = "${" name[i] "}"
                if ((at = index(w, v))) { w = substr(w, 1, at - 1) value[i] substr(w, at + length(v)) }
                v = "$" name[i]
                if ((at = index(w, v)) && substr(w, at + length(v), 1) !~ /[A-Za-z0-9_]/) { w = substr(w, 1, at - 1) value[i] substr(w, at + length(v)) }
            }
            return w
        }
        function joined(p) { return p ~ /^\// ? p : dir "/" p }
        BEGIN {
            dir = ENVIRON["RT_SF_DIR"]
            n = split(ENVIRON["RT_SF_VARS"], rows, "\n")
            for (i = 1; i <= n; i++) {
                p = index(rows[i], "\t")
                if (p) { c++; name[c] = substr(rows[i], 1, p - 1); value[c] = substr(rows[i], p + 1) }
            }
        }
        {
            line = $0
            gsub(/&&|[|][|]|[;|&()]/, "\n", line)
            parts = split(line, part, "\n")
            for (k = 1; k <= parts; k++) {
                words = split(part[k], raw, /[ \t]+/)
                at = 1
                # The words before a command that only run it, and the variables set for it.
                while (at <= words && (raw[at] == "" || raw[at] ~ /^([A-Za-z_][A-Za-z0-9_]*=|-|[0-9.]+[smhd]?$)/ || raw[at] ~ /^(then|do|else|if|elif|while|until|time|timeout|nohup|env|sudo|command|exec|nice|caffeinate|!|[{])$/)) { at++ }
                if (at > words) { continue }
                head = filled(raw[at]); base = head; sub(/.*\//, "", base)
                if (head == "cd" && at < words) { dir = joined(filled(raw[at + 1])); continue }
                if (head == "source" || head == ".") { if (at < words) { print joined(filled(raw[at + 1])) } ; continue }
                if (base ~ /^(bash|sh|zsh|python[0-9.]*|node|ruby|perl|php|deno|bun)$/) {
                    for (j = at + 1; j <= words; j++) {
                        w = filled(raw[j])
                        if (w == "" || w == "run") { continue }
                        # Code in an argument, a module and the standard input are no file.
                        if (w ~ /^-[A-Za-z]*[cem]$/ || w == "-" || w ~ /^[<>]/) { break }
                        if (w ~ /^-/) { continue }
                        print joined(w)
                        break
                    }
                    continue
                }
                if (head ~ /\//) { print joined(head) }
            }
        }
    '
}

rt_script_files() {
    _sf_text="$(cat)"
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
