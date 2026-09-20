#!/usr/bin/env bash
# rt-kit v0.29.0 · defaults/shell.sh · 9c2c7af43495 · правится надстройкой, не здесь
# Parsing a shell command: whether it writes and which paths it names.
#
# The package default, part of the tree profile — loaded from `project.sh`, next to which it lies. A
# separate file because together they outgrow the length limit, and they are read apart: one reader
# needs the write sign, the other the target.

# Whether a shell command writes a file. Success — yes, and then the paths from it are judged by the
# same sign as the path from an edit tool call.
#
# The guards are subscribed to the file edit tools, and that is not enough: the same edit is laid
# down by a command — a redirect, `tee`, `sed -i`, an interpreter with a heredoc. An edit refused
# twice in one session landed exactly so, and nobody saw it: in the tree it is indistinguishable
# from one laid down by the tool. The analysis — `2026-08-15-guard-denied-shell-wrote-anyway.md`.
#
# The list is wide on purpose, and the price of that is named: a read command that carries the name
# of an interpreter will be refused on a par with an edit command. A narrow list would cost more — a
# missed form of writing brings back the whole bypass, and it can be found only by a miss.
#
# Deletion and moving stand in the list on purpose, not by oversight. Removing a file is an edit
# more destructive than any write. What was written is visible in the tree and rolls back, while
# what was removed without a plan leaves no trace at all and has to be restored from history. The
# price of this choice is known and is paid not where it is expected. A temporary file of one's own,
# put under the code root, is removed by a command, and the guard judges it as an application edit.
# It demands a plan on disk for an action that has nothing to do with the application. The sign
# cannot tell one from the other: the path of both lies under the same root. This is cured by the
# place, not by the sign — and the pitfall of the work-conduct rule says so.
#
# A redirect to the null device and to the error stream is removed before parsing: it writes no
# file, yet looks like a redirect to a file. That is how the output of a read command is silenced,
# and without this `grep -rn x libs/ 2>/dev/null` is judged on a par with a write. A rule is
# demanded for reading, and refusals that fell on no file edit become the majority. A real write
# next to a silenced stream stays visible: the redirect is removed, not the whole command.
#
# The arrow is removed there too, and for the same reason. `->` and `=>` mean nothing in the shell,
# yet the sign in them is the same: a command that printed a "path -> rule" table declared itself
# writing and gave all its paths up for judgement. The closing bracket of a markup comment goes
# there too.
#
# The redirect target is narrowed to the characters paths are made of. A markup quote line — the
# sign and a word separated by a space — is indistinguishable from a write into a file by one sign,
# and only the target tells them apart. Behind a real sign stands a path, not a word in words. The
# price is named directly: a path typed not in Latin letters no longer counts as a write — there is
# not one such in the tree, and should they appear, the sign will have to be widened.
rt_shell_writes_default() {
    cleaned="$(printf '%s' "$1" \
        | sed -E 's#(&|[0-9]*)>>?[[:space:]]*/dev/(null|stderr)##g; s#[0-9]*>&[0-9-]##g; s#[-=]+>##g')"

    # An interpreter writes by its body, not by the name of the file it runs. The path that stands
    # as its first argument is what it reads: running a tree check by its path does not count as a
    # write. Before, the name itself was checked, and a session that ran a check for diagnosis got a
    # demand for the shared-code rule without editing anything in it. Over two tasks such refusals
    # came to about fifteen, and part of them fell on commands that wrote nothing.
    #
    # An interpreter's body comes in two kinds, and both remain a write: a document on input and
    # code as an argument.
    interp='(^|[|;&(]|[[:space:]])(python3?|node|ruby|deno|bun|php|perl)'
    if printf '%s' "$cleaned" | grep -Eq \
        "${interp}([[:space:]][^|]*)?<<|${interp}([[:space:]]+-[^[:space:]]*)*[[:space:]]+(-e|--eval|-c|-p|--print)([[:space:]]|\$)"; then
        return 0
    fi

    printf '%s' "$cleaned" \
        | grep -Eq \
            '>>?[[:space:]]*[A-Za-z0-9_./~$"'"'"'-]|\btee\b|\bsed\b[^|]*-i|\bperl\b[^|]*-i|\bdd\b[^|]*of=|\bcp\b|\bmv\b|\brm\b|\btouch\b|\btruncate\b|\binstall\b|\bpatch\b|\bgit[[:space:]]+(checkout|restore|apply|stash)\b'
}

# The paths named by a shell command. Prints one per line; the caller judges them.
#
# There is nothing to parse the shell with for real — and nothing parses it here: everything that
# looks like a path is pulled out of the text, and each one is handed to the sign. The sign will
# sift out the excess itself, while a missed one would bring back the bypass. Quotes are removed by
# replacing them with a space: the path inside them is the same.
#
# The body of a document gives no paths: the text the command puts into the file lies there, and
# someone else's path named in it in words would demand a rule for a write that does not exist.
# Writing the plan was refused three times in a row this way, until the paths under the code
# directory were named otherwise. What is judged is the command header — that is where the path the
# command writes to stands.
#
# The exception is an interpreter: its code comes as the body, and the write path stands exactly
# there. The sign is read from the line that opened the body, not from the whole command: the body
# belongs to the command of its own header. Before, it was read from the whole text at once, and a
# word from the document switched off the cutting entirely. The line "**Чем проверяется:** `bash
# projects/…`" in the plan made the write of `plan.md` an edit of application code. The guard
# thereby refused the write of the very file whose absence it refuses for.
rt_shell_paths_default() {
    text="$(printf '%s' "$1" | tr "\"'\`" '   ')"
    text="$(printf '%s' "$text" | awk '
        function trim(s) { sub(/^[ \t]+/, "", s); sub(/[ \t]+$/, "", s); return s }
        tag != "" {
            if (keep) { print }
            if (trim($0) == tag) { tag = ""; keep = 0 }
            next
        }
        {
            print
            if (match($0, /<<-?[ \t]*[A-Za-z_][A-Za-z0-9_]*/)) {
                t = substr($0, RSTART, RLENGTH)
                sub(/^<<-?[ \t]*/, "", t)
                tag = t
                keep = ($0 ~ /(^|[|;&(]|[ \t])(python3?|node|ruby|perl|php|deno|bun|bash|sh|zsh)([ \t]|$)/)
            }
        }')"

    # Paths are taken only from those pieces of the command that write. Before, they were taken from
    # the whole line, and a read command chained with a write gave its paths up as write targets.
    # `python3 <<PY … PY` next to `grep -n … projects/…` was refused for an edit of code that it did
    # not contain. Refusals that fell on no file edit became the majority, and the price was paid by
    # whoever merely read a neighbouring file on the same line.
    #
    # A piece is a top-level line, and inside it `;`, `&&` and `||`. A heredoc body is not torn from
    # its command: it travels with it as one piece, because the interpreter's write path stands
    # exactly there.
    printf '%s' "$text" | awk '
        function trim(s) { sub(/^[ \t]+/, "", s); sub(/[ \t]+$/, "", s); return s }
        function flush(  n, i, part) {
            if (chunk == "") { return }
            if (tag != "") { part = chunk; gsub(/\n/, " ", part); print part; chunk = ""; return }
            n = split(chunk, parts, /;|&&|\|\|/)
            for (i = 1; i <= n; i++) { print parts[i] }
            chunk = ""
        }
        tag != "" {
            chunk = chunk "\n" $0
            if (trim($0) == tag) { flush(); tag = "" }
            next
        }
        {
            chunk = $0
            if (match($0, /<<-?[ \t]*[A-Za-z_][A-Za-z0-9_]*/)) {
                t = substr($0, RSTART, RLENGTH)
                sub(/^<<-?[ \t]*/, "", t)
                tag = t
                next
            }
            flush()
        }
        END { if (chunk != "") { part = chunk; gsub(/\n/, " ", part); print part } }
    ' \
        | while IFS= read -r piece; do
            [ -z "$piece" ] && continue
            rt_shell_writes "$piece" || continue
            # A piece that writes by a redirect alone gives up the write target, not every path-like
            # word from its text. A file name named in an argument or in the content is not an edit
            # of that file. A read command chained with a write into its own file demanded a rule by
            # someone else's name and ended the turn. The price of such a refusal equals the price
            # of a real one, because there is nothing to bypass it with.
            #
            # The other kinds of writing are parsed as before: for an in-place edit, a copy, a move
            # and an interpreter the path stands in the command itself and not in one place.
            if ! printf '%s' "$piece" | grep -Eq '\bsed\b[^|]*-i|\bperl\b[^|]*-i|\bpython3?\b|\bnode\b|\bruby\b|\bdd\b[^|]*of=|\bcp\b|\bmv\b|\brm\b|\btouch\b|\btruncate\b|\binstall\b|\bpatch\b|\bgit[[:space:]]+(checkout|restore|apply|stash)\b'; then
                printf '%s' "$piece" \
                    | grep -oE '(>>?[[:space:]]*|\btee\b([[:space:]]+-a)?[[:space:]]+)[A-Za-z0-9_@.~/-]+' \
                    | sed -E 's/^(>>?|tee([[:space:]]+-a)?)[[:space:]]*//' \
                    | grep -E '^[A-Za-z0-9_@.-]*/[A-Za-z0-9_@./-]+$' \
                    | sed 's|^\./||'
                continue
            fi
            printf '%s' "$piece" \
                | tr "(),;=" '     ' \
                | tr '[:space:]' '\n' \
                | grep -E '^[A-Za-z0-9_@.-]*/[A-Za-z0-9_@./-]+$' \
                | sed 's|^\./||'
        done \
        | sort -u
}
