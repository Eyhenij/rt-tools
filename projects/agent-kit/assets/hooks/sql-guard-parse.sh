#!/usr/bin/env bash
# Parsing a command for the storage guard: bringing it to one shape, cutting it into segments and
# answering the question whether the segment delivers SQL to the server.
#
# There is deliberately no `# rt-hook:` line here: the event and the call pattern are declared by the
# guard itself, and a helper next to it is not registered as a hook and decides nothing alone.

# From here on we parse ignoring case and newlines: `delete\n  from bookings` is the same query as
# the one written on a single line.
#
# A newline turns into `;`, not into a space: on the command line it SEPARATES calls exactly like
# `;`, and gluing it into a space erased the boundary between them. A multi-line command became one
# segment, the proof of reading from the first line covered an unparsed call from the second, and a
# write to the production database went through silently — the same bypass that was fixed for `&&`,
# only typed from a new line.
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

normalize() {
    perl -0ne '
        # A long command continued by a backslash is one line, not two: without gluing, the address
        # from the first went into the neighbouring segment, where there is no client any more.
        s/\\\n/ /g;
        # A newline is replaced by `;` ONLY outside quotes. Inside `-c "…"` it is part of the
        # query: a multi-line SELECT was cut into segments, and regular reading of the production
        # database stopped being proven.
        my ($out, $quote, $esc) = ("", "", 0);
        for my $ch (split //, $_) {
            if ($esc) { $out .= $ch; $esc = 0; next; }
            if ($ch eq "\\") { $out .= $ch; $esc = 1; next; }
            if ($quote ne "") {
                $out .= ($ch eq "\n" ? " " : $ch);
                $quote = "" if $ch eq $quote;
            } elsif ($ch eq q{"} || $ch eq q{'"'"'}) {
                $quote = $ch; $out .= $ch;
            } elsif ($ch eq "\n" || $ch eq ";") {
                $out .= "\x01";              # the boundary of independent commands
            } elsif ($ch eq "|") {
                $out .= "\x02";              # the boundary of a pipeline link
            } elsif ($ch eq "&") {
                $out .= "\x01";
            } else {
                $out .= $ch;
            }
        }
        # Neighbouring markers collapse: `&&` and `||` give two of them in a row each.
        $out =~ s/\x01+/\x01/g;
        $out =~ s/\x02\x01/\x01/g;
        $out =~ s/\x01\x02/\x01/g;
        # An unclosed quote means the automaton has come apart: an apostrophe in a comment
        # (`# don'"'"'t forget`) left the state "inside a string" until the end of the input, and
        # all the newlines after it stopped separating calls — segmentation was switched off by one
        # character. In that case it is more honest to print nothing: the caller will split the
        # lines the rough way, and the extra splitting plays in favour of strictness.
        print $out if $quote eq "";
    ' 2>/dev/null
}

# Rough splitting is the fallback path: all newlines become separators. It is stricter than the
# exact one (it may cut a multi-line query in two), so it serves both as a fallback without perl and
# as the answer to an unparsed command.
sql_flatten() {
    flat_rough="$(printf '%s' "$sql" | perl -0pe 's/\\\n/ /g' 2>/dev/null | tr '\n;&' '\001\001\001' | tr '|' '\002' | tr '\t' ' ' | tr '[:upper:]' '[:lower:]')"
    [ -z "$flat_rough" ] && flat_rough="$(printf '%s' "$sql" | tr '\n;&' '\001\001\001' | tr '|' '\002' | tr '\t' ' ' | tr '[:upper:]' '[:lower:]')"

    if command -v perl >/dev/null 2>&1; then
        flat="$(printf '%s' "$sql" | normalize | tr '\t' ' ' | tr '[:upper:]' '[:lower:]')"
        [ -z "$flat" ] && flat="$flat_rough"
    else
        flat="$flat_rough"
    fi
}

# Parsing goes by segments, not by the whole line: `ls -l /opt && … psql -c "\copy …"` looked as a
# whole like reading, because the `-l` of `ls` counted as `psql -l`.
#
# The cutting lives in a SINGLE place. While there were two sets of separators — one in the early
# layer, another here — the divergence itself turned out to be a hole: a lone `|` counted as a
# boundary here and did not count there, and delivering a file into the client by a pipeline passed
# as reading. A command is what stands between `;`, `&&`, `||` and newlines. A pipeline is NOT a
# boundary: `cat fix.sql | psql …` is not two independent commands but one delivery of SQL, where
# the left link feeds the right one. While `|` cut commands, the verb from `echo "drop table …"` was
# lost together with the discarded link, and the write went through silently.
split_segments() {
    # The trailing newline is mandatory: without it `read` does not give the last line to the body
    # of the loop, and a command of one segment silently fell out of the parsing entirely.
    printf '%s\n' "$1" | tr '\001' '\n'
}

# Pipeline links inside one command.
split_pipeline() {
    printf '%s' "$1" | tr '\002' '\n'
}

# A command counts as a call of the client only if the client stands as the HEAD of at least one
# link. A name in an argument (`grep -rn "prisma db push" docs/`) is not a call.
calls_client() {
    _found=""
    _links="$(printf '%s' "$1" | tr '\002' '\n')"
    while IFS= read -r link; do
        [ -z "$link" ] && continue
        # The head of the link: we skip environment assignments and wrappers such as sudo/time/xargs.
        head="$(printf '%s' "$link" | sed -E 's/^[[:space:]]*//; s/^([A-Za-z_][A-Za-z0-9_]*=[^[:space:]]*[[:space:]]+)*//; s/^(sudo|time|env|nice|xargs)[[:space:]]+//')"
        case "$head" in
            psql*|pg_restore*|pg_dump*|pg_dumpall*|prisma*|*/psql*|*/pg_restore*|*/pg_dump*)
                _found="yes"; break ;;
        esac
        # Transport to the machine: the call itself stands inside the string it executes.
        case "$head" in
            ssh\ *|scp\ *|docker\ *|*/ssh\ *|*/docker\ *)
                printf '%s' "$link" | grep -qE '(^|[^[:alnum:]_.-])(psql|pg_restore|pg_dump|prisma)([^[:alnum:]_.-]|$)' \
                    && { _found="yes"; break; } ;;
        esac
        # A package runner before the client: `npx prisma migrate deploy`.
        case "$head" in
            npx\ *|pnpm\ *|yarn\ *|bun\ *|npm\ *)
                printf '%s' "$head" | grep -qE '^(npx|pnpm|yarn|bun|npm)([[:space:]]+(exec|run|dlx))?[[:space:]]+(psql|pg_restore|pg_dump|prisma)([[:space:]]|$)' \
                    && { _found="yes"; break; } ;;
        esac
    done <<CALLS_EOF
$_links
CALLS_EOF
    [ -n "$_found" ]
}

# The head of the segment is a reading tool: the client name stands in its argument, meaning this is
# a search or a look at a file, not a delivery of SQL. `grep -rn "prisma db push" docs/` reads the
# documentation. It is the HEAD that decides: the same technique is applied in dev-server-guard by
# the BOUND anchor.
is_reader() {
    printf '%s' "$1" | grep -qE '^[[:space:]]*([A-Za-z_][A-Za-z0-9_]*=[^[:space:]]*[[:space:]]+)*((sudo|time|env|nice|xargs)[[:space:]]+)*([^[:space:]]*/)?(grep|rg|ag|ack|find|awk|sed|cat|less|more|head|tail|wc|echo|printf|jq|diff|comm|sort|uniq|column)([[:space:]]|$)'
}

# Segments with a real call of the client: reading heads are filtered out right here, not by a
# separate layer with an exit of its own.
client_segments() {
    split_segments "$flat" | while IFS= read -r seg; do
        [ -z "$seg" ] && continue
        calls_client "$seg" || continue
        # The link marker is no longer needed: further on the command is parsed as one line.
        printf '%s\n' "$(printf '%s' "$seg" | tr '\002' ' ')"
    done
}

# The address is taken ONLY from segments that call the client and only from arguments, not from
# data. The site domain lives in the strings themselves — in the owner mail, in the canonical and
# og:url of a record — while next to it in the chain it is pulled over HTTP. While the sign was
# searched for over the whole command, `curl https://<application-domain>/... && psql -p 5432 -c
# "update …"` was refused as a write to the production database, and this branch has no opt-out by
# design: the command became unexecutable. The query text is cut out BEFORE the cutting into
# segments. Inside `-c "…"` there freely live `;` and `||` — the segments are cut by them, so a
# piece of the query with a domain in the data became a separate segment, and mail on the
# application domain was again read as the address of the production database.
sql_addr_flatten() {
    addr_flat="$flat"
    if command -v perl >/dev/null 2>&1; then
        addr_flat="$(printf '%s' "$flat" | perl -0pe '
            s/(^|[^[:alnum:]])--?(c|command|querytext)(=|\s+)("([^"\\]|\\.)*"|\x27[^\x27]*\x27)/$1/gs
        ' 2>/dev/null || printf '%s' "$flat")"
    fi
}

addr_segments() {
    split_segments "$addr_flat" | while IFS= read -r seg; do
        [ -z "$seg" ] && continue
        flat_seg="$(printf '%s' "$seg" | tr '\002' ' ')"
        # The address is taken from commands that call the client and from transport to the machine:
        # `ssh root@…` names the production host, and the call itself stands further down the chain.
        if calls_client "$seg"; then
            printf '%s\n' "$flat_seg"
        elif printf '%s' "$flat_seg" | grep -qE '(^|[^[:alnum:]_.-])(ssh|scp|docker)([^[:alnum:]_.-]|$)|(pghost|pgport|pgdatabase|pguser|database_url|postgres_url)='; then
            is_reader "$flat_seg" && continue
            printf '%s\n' "$flat_seg"
        fi
    done
}

# Segments that call the client, for further parsing. A query from the editor has no segments at all
# — there the whole text is the query.
sql_collect_segments() {
    segments="$(client_segments)"
    if [ -z "$segments" ]; then
        if [ -n "$conn" ] || [ "$context" != "a psql/prisma command" ]; then
            segments="$flat"
        else
            # A command where the client name met only in the arguments of reading tools delivers
            # nothing anywhere. The exit here is safe: it stands AFTER the parsing, not instead of
            # it, and fires only when there is no real call in the command.
            exit 0
        fi
    fi
}
