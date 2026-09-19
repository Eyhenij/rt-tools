#!/usr/bin/env bash
# rt-kit v0.29.0 · hooks/write-targets.sh · e4ced8c3c759 · правится надстройкой, не здесь
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

    {
        printf '%s' "$rt_wt_text" \
            | tr "\"'\`" '   ' \
            | sed -E 's/>>?/\n>/g' \
            | sed -nE '
                s/^>[[:space:]]*([^[:space:]|&;]+).*/\1/p
                s/(^|.*[[:space:]])tee[[:space:]]+(-a[[:space:]]+)?([^[:space:]|&;]+).*/\3/p
                s/(^|.*[[:space:]])sed[[:space:]]+-i[[:space:]]+([^[:space:]]+[[:space:]]+)*([^[:space:]|&;]+)$/\3/p
                s/(^|.*[[:space:]])(cp|mv|install)[[:space:]]+([^[:space:]]+[[:space:]]+)+([^[:space:]|&;]+).*/\4/p
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
                if (match(s, /[A-Za-z_][A-Za-z0-9_]*[ \t]*=[ \t]*[\047\"][^\047\"]*\/[^\047\"]*[\047\"]/)) {
                    path = substr(s, RSTART, RLENGTH)
                    name = path
                    sub(/[ \t]*=.*$/, "", name)
                    sub(/^[^=]*=[ \t]*[\047\"]/, "", path)
                    sub(/[\047\"].*$/, "", path)
                    if (path ~ /\.[A-Za-z0-9]+$/) { varpath[name] = path }
                }
            }
            # The write target is the first argument of the write call. It is the address the
            # script opens; everything else on the same line is search patterns, substitutions and
            # data.
            function emit_calls(s,   rest, arg, name) {
                rest = s
                while (match(rest, /(open|writeFileSync|writeFile|appendFileSync|appendFile|write_text|write_bytes|copyfile|copy2|rename|symlink|mkdir|makedirs)[ \t]*\(/)) {
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
            function writes(s) {
                return s ~ /open[ \t]*\([^)]*[\047\"](w|a|r\+|w\+|a\+)[\047\"]/ \
                    || s ~ /writeFileSync|writeFile|appendFile|write_text|write_bytes|\.write\(|\.save\(|savefig|to_csv|json\.dump|\.dump\(/ \
                    || s ~ /makedirs|mkdir|rename|replace[ \t]*\(|unlink|rmtree|copyfile|copy2|shutil\./ \
                    || s ~ />[ \t]*[A-Za-z0-9_.~$\/-]/ \
                    || s ~ /(^|[|;&(]|[ \t])(tee|cp|mv|rm|touch|install|truncate)([ \t]|$)/
            }
            function trim(s) { sub(/^[ \t]+/, "", s); sub(/[ \t]+$/, "", s); return s }
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
                        if (writes(line[i])) { emit(line[i]); emit_calls(line[i]) }
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
                # Code as an argument: everything that stands after `-c` or `-e` of an interpreter.
                if ($0 ~ /(^|[|;&(]|[ \t])(python3?|node|ruby|perl|php|deno|bun)([ \t]|$)/ \
                    && match($0, /[ \t]-[ce][ \t]/)) {
                    rest = substr($0, RSTART + RLENGTH)
                    if (writes(rest)) { note_var(rest); emit(rest); emit_calls(rest) }
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
    } | sort -u
}
