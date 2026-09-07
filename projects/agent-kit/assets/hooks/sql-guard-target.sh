#!/usr/bin/env bash
# The request's target for the storage guard: the production database, a throwaway check
# database or something else — and what is allowed on production.
#
# There is no `# rt-hook:` line here on purpose: the event and the call sample are declared by the
# guard itself, and the helper next to it is not registered as a hook and decides nothing alone.

# --- production: a write is forbidden in any form ------------------------------------------
# The sign is taken from the profile: the tunnel port, the host, the domain — each tree has its
# own.
#
# We look for it in the ADDRESS, not in the data: the application's domain also lives in the rows
# themselves — in the owner's email, in the canonical link of an object. While the sign was taken
# over the whole command, inserting a row with such an address into the local database was
# refused as a write to production, and this branch has no opt-out by design — the command became
# impossible to run.
# So the request text (what stands after `-c`/`--command`) is cut out of the check.
#
# A request from the IDE does not name the target in its text: the database is chosen by a
# connection identifier, and by the SQL alone production cannot be told from the local copy. So
# connections are recognised by sight. The list is checked against list_database_connections;
# added a new one — add it here, otherwise it lands in the "unknown" below.
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

sql_resolve_target() {
    is_prod=""
    PROD_CONNECTIONS="${RT_PROD_CONNECTIONS:-}"
    LOCAL_CONNECTIONS="${RT_LOCAL_CONNECTIONS:-}"

    conn_known=""
    if [ -n "$conn" ]; then
        case " $PROD_CONNECTIONS " in *" $conn "*) is_prod="yes"; conn_known="prod" ;; esac
        # A recognised local connection outweighs a textual guess: the application's domain lives
        # in the data itself — in the owner's email, in the canonical link of an object. While
        # the verdict was not overridden, updating such a row on the local database was refused as
        # a write to production, and there was nothing to bypass it with.
        case " $LOCAL_CONNECTIONS " in *" $conn "*) conn_known="local"; is_prod="" ;; esac
    fi

    # For a request from the IDE the address is not named in the text at all: there the
    # recognised connection decides, and if it is unknown, the branch below asks the user.
    is_scratch=""
    addr_other=""
    if [ -z "$conn" ] && [ "$context" != "a request through the connection of the editor (the wrapper of the executor)" ]; then
        while IFS= read -r seg; do
            [ -z "$seg" ] && continue
            if [ -n "$PROD_DSN" ] && printf '%s' "$seg" | grep -qE "$PROD_DSN"; then
                is_prod="yes"
                addr_other="yes"
                continue
            fi
            # A throwaway check database: a loopback address and a port from the range set aside
            # for them. The range is taken by containers raised for the time of one check —
            # restoring a copy, rehearsing a migration on a non-empty database — and torn down
            # right after. There is no data worth guarding there by construction, and a question
            # on every line of such a check teaches answering "yes" without reading and devalues
            # the question that mattered.
            #
            # The range is narrow and loopback on purpose: neither the tree's working database,
            # nor the tunnel to production, nor the databases of neighbouring trees on this
            # machine must fall under it. What it is here is known by the profile; not named —
            # there is no exception at all, and the question is always asked.
            if [ -n "${RT_SCRATCH_PORT_RE:-}" ] \
                && printf '%s' "$seg" | grep -qE "$RT_SCRATCH_PORT_RE" \
                && printf '%s' "$seg" | grep -qE '127\.0\.0\.1|localhost|host\.docker\.internal'; then
                is_scratch="yes"
            else
                # Any other addressed call lifts the exception entirely: in the chain
                # `psql -p 19434 -f x.sql && psql -c "delete …"` an early exit would remove the
                # check from the second link, and that is exactly the bypass the guard is written
                # against.
                addr_other="yes"
            fi
        done <<EOF
$(addr_segments)
EOF
    fi
}

# The exception stands AFTER the address parsing and BEFORE the write rules, but strictly after
# the production sign has already been set: production overrides the exception on any match, not
# the other way round. The condition is threefold — a throwaway address is found, there is no
# production one, and there are no other addressed calls in the command at all.
sql_pass_scratch() {
    if [ -n "$is_scratch" ] && [ -z "$is_prod" ] && [ -z "$addr_other" ]; then
        exit 0
    fi
}

# On the production database only what the guard recognised as a read is allowed — by an ALLOW
# list, not by enumerating prohibitions. A deny list fundamentally does not work here: SQL reaches
# the server as a file, a redirect, `\copy`, `SELECT … INTO`, and every form sealed leaves the
# neighbouring one open. So the question is turned around: not "is there a write here" but "is a
# read proven".
#
# Three forms count as a read, and each is checked in the SEGMENT of its own call:
#   pg_dump without --clean/--create   — taking a dump
#   psql -c "<one SELECT>"             — a query without a second statement
#   psql -l / --version / --help       — a connection check without a query
sql_check_prod() {
    if [ -n "$is_prod" ] && [ -n "$is_write" ]; then
        deny "BLOCKED: a write into the PRODUCTION storage (${context}). The address leads to production — data is restored from there by nothing but a copy. The schema in production is changed by a migration through the rollout, the data — through the panel of the owner. If an edit of production data really is needed, the owner makes it by hand, having taken a copy first; the guard cannot be bypassed."
    fi

    if [ -n "$is_prod" ]; then
        unproven=""
        while IFS= read -r seg; do
            [ -z "$seg" ] && continue
            seg_read=""
            # The client's arguments are everything AFTER its name. Before the name in the same
            # segment other flags live freely: `docker compose -f docker-compose.prod.yml … psql`,
            # and compose's `-f` once cancelled the proof of a read.
            seg_tail="$(printf '%s' "$seg" | perl -0pe 's{^.*?(?<![[:alnum:]_./-])(psql|pg_restore|prisma)(?=\s|$)}{$1}s' 2>/dev/null)"
            [ -z "$seg_tail" ] && seg_tail="$seg"

            if printf '%s' "$seg" | grep -qE '(^|[^[:alnum:]_.-])pg_dump(all)?([^[:alnum:]_.-]|$)'; then
                case "$seg" in
                    *--clean*|*--create*) ;;
                    *) seg_read="yes" ;;
                esac
            fi

            # One SELECT and nothing else: a second statement after `;` is no longer a read.
            if printf '%s' "$seg" | grep -qE '(^|[^[:alnum:]_])select([^[:alnum:]_]|$)' \
                && ! printf '%s' "$seg" | grep -qE '(^|[^[:alnum:]_])(delete|update|insert|truncate|drop|alter|grant|revoke|copy)([^[:alnum:]_]|$)|\\copy|into[[:space:]]+[a-z_"]' \
                && ! printf '%s' "$seg_tail" | grep -qE '(^|[[:space:]])(-f|--file)([[:space:]]|=)'; then
                seg_read="yes"
            fi

            printf '%s' "$seg_tail" | grep -qE '(^|[[:space:]])(-l|--list|--version|--help)([[:space:]]|$)' \
                && seg_read="yes"

            [ -z "$seg_read" ] && unproven="yes"
        done <<EOF
$segments
EOF

        if [ -n "$unproven" ]; then
            deny "BLOCKED: a call of the database client against the PRODUCTION database (${context}). In production only a proven read is allowed — \`pg_dump\` without \`--clean\`, a single SELECT through \`-c\`, or \`-l\`/\`--version\`. Everything else is refused, even when the guard simply did not parse the command: the content of files (\`-f\`, \`< dump.sql\`), \`\\copy\` and restoring a dump are invisible to it. If an analysis of production data is needed — take a dump and work with a local copy."
        fi
    fi
}
