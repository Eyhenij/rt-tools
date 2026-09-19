#!/usr/bin/env bash
# The write part of the storage guard: what counts as a write, what in it is destructive for
# certain, where migrations go and by what a query addresses rows.
#
# NOT a guard: it has no `rt-hook:` declaration and hooks into no agent event. The storage guard
# sources it — one tier of its verdict, moved out when the guard reached its length limit.
#
# There is deliberately no `# rt-hook:` line here: the event and the call pattern are declared by
# the guard itself, while a helper next to it registers no hook and decides nothing on its own.

# The verbs are looked for in the segments of the CALL, not over the whole line: otherwise a word
# from a search pattern in a neighbouring link of the chain declared a reading command a write.
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

sql_detect_write() {
    is_write=""
    write_scope="$segments"
    # `copy … from` and `select … into` are a write that names not one of the usual verbs.
    printf '%s' "$write_scope" | grep -qE '(^|[^[:alnum:]_])(delete|update|insert|truncate|drop|alter|create|grant|revoke|copy)([^[:alnum:]_]|$)|\\copy|into[[:space:]]+[a-z_"]' \
        && is_write="yes"
    # A pipeline from a source into the client is the same file delivery, only without a flag: the
    # content of `cat fix.sql | psql …` is not visible to the guard, so this is a write by
    # definition.
    while IFS= read -r seg; do
        [ -z "$seg" ] && continue
        printf '%s' "$seg" | grep -qE '(^|[^[:alnum:]_.-])(cat|head|tail|gzcat|zcat|gunzip|echo|printf|curl|wget)([[:space:]]|$)' \
            && is_write="yes" && break
    done <<PIPE_EOF
$(client_segments)
PIPE_EOF

    # prisma commands change the database without naming a single SQL verb: `migrate reset`
    # recreates it whole, `db push` fits the schema to the model, `db execute` pours in an
    # arbitrary file.
    printf '%s' "$write_scope" | grep -qE 'prisma[[:space:]]+(migrate[[:space:]]+(reset|deploy|dev)|db[[:space:]]+(push|execute))' \
        && is_write="yes"

    # A verb on the command line is not the only way to get SQL to the server. A file (`-f`,
    # `--file`, `< dump.sql`) and `pg_restore` name none, so they used to pass by all three levels:
    # delivering a file into the client on the production database ended with zero without a single
    # question, and `pg_restore` could not fire in principle, although `--clean` wipes the content.
    # The content of the file is unavailable to the guard — so this is a write by definition.
    printf '%s' "$flat" | grep -qE '(^|[^[:alnum:]_.-])pg_restore([^[:alnum:]_.-]|$)' \
        && is_write="yes"
    # For `pg_dump` the same `-f` means the OUTPUT file: this is a read, and it must not be counted
    # as a write — otherwise a routine dump of the production database was rejected, although the
    # text of the refusal advises it itself.
    #
    # The exception acts PER SEGMENT. While it was checked over the whole command, one mention of
    # `pg_dump` anywhere in the chain was enough for `-f` to stop counting as a write in all the
    # other calls: `pg_dump … > /dev/null && psql -d app -f /tmp/x.sql` passed silently.
    sql_delivers_file && is_write="yes"
}

# A file poured into the client names not a single SQL verb, and its content the guard does not see
# — so this is a write by definition. It stands in a function of its own because the answer is
# needed by two places: the common detection of a write above, and the early exit on a local
# migration below. While the loop stood in the first alone, the chain `prisma migrate deploy &&
# psql -d app -f fix.sql` passed silently: the exit counted a second write only by SQL verbs and by
# the commands that feed the pipe.
sql_delivers_file() {
    while IFS= read -r seg; do
        [ -z "$seg" ] && continue
        # The word boundary is mandatory: `-f /tmp/pg_dump-restore.sql` is loading a dump, not
        # taking one, and a substring match removed both protections from it at once.
        if printf '%s' "$seg" | grep -qE '(^|[^[:alnum:]_.-])pg_dump(all)?([^[:alnum:]_.-]|$)'; then
            continue
        fi
        # The tail of the segment after the client name: the `-f` of `docker compose` (the
        # production compose file is named non-standardly and does not come up without the flag)
        # stands BEFORE `psql` and has nothing to do with the query.
        seg_tail="$(printf '%s' "$seg" | perl -0pe 's{^.*?(?<![[:alnum:]_./-])(psql|pg_restore|prisma)(?=\s|$)}{$1}s' 2>/dev/null)"
        [ -z "$seg_tail" ] && seg_tail="$seg"
        if printf '%s' "$seg_tail" | grep -qE '(^|[[:space:]])(-f|--file)([[:space:]]|=)|<[[:space:]]*[^[:space:]|<]+\.(sql|dump)'; then
            return 0
        fi
    done <<EOF
$segments
EOF

    return 1
}

# --- destructive for certain ------------------------------------------------------------
verdict() {
    if [ -n "$soft" ]; then
        ask "The request is marked by the destructive-ok marker but stays destructive: $1 Confirm the execution if this is deliberate."
    fi
    deny "BLOCKED: $1 Address the rows by the primary key — \`WHERE id IN ('…','…')\`: that way exactly as many rows are touched as are listed, and a miss is visible before the execution. A deletion by a mask (email LIKE '%test%') once carried away, together with the test records, the demonstration bookings of the owner. If addressing by id really does not fit — first run a SELECT with the same condition and show the user what falls under the deletion." \
        "the destructive-ok marker at the request, with an explanation"
}

sql_check_destructive() {
    soft=""
    case "$flat" in
        *destructive-ok*) soft="yes" ;;
    esac

    if printf '%s' "$flat" | grep -qE '(^|[^[:alnum:]_])(truncate|drop[[:space:]]+(table|database|schema|column|index)|alter[[:space:]]+table)([^[:alnum:]_]|$)'; then
        verdict "the request changes the schema itself or empties a table whole (${context})."
    fi

    if printf '%s' "$flat" | grep -qE 'prisma[[:space:]]+(migrate[[:space:]]+reset|db[[:space:]]+push)'; then
        verdict "\`prisma migrate reset\` / \`db push\` recreates the database and loses its content (${context})."
    fi

    # `pg_restore --clean` deletes the existing objects before loading — the same emptying of
    # tables, only by someone else's hands. Without `--clean` it is an ordinary top-up, and it goes
    # the common path.
    if printf '%s' "$flat" | grep -q 'pg_restore' && printf '%s' "$flat" | grep -qE '(^|[[:space:]])(--clean|-c|--create)([[:space:]]|=|$)'; then
        verdict "\`pg_restore --clean\` deletes the objects of the database before loading the dump (${context})."
    fi
}

# A routine application of migrations does not count as destructive. There used to stand an
# unconditional `ask` here with the words "make sure DATABASE_URL points at the local database" —
# the guard shifted onto a person exactly the work it can do itself. On a local database migrations
# are run all the time, and a question on each adds no safety: a guard that asks for the tenth time
# stops being read together with that one question that mattered.
#
# So the address is RESOLVED, not guessed: first the inline prefix of the command itself, then the
# environment variable, then the `.env` of the working directory.
unquote() {
    sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"
}

resolve_database_url() {
    # Searching by `$flat` is not allowed: it is brought to lower case, and `DATABASE_URL=` never
    # occurs in it — the rule would silently take the address from `.env`, ignoring the one named
    # explicitly in the command. The original line is parsed, and `$flat` stays the fallback with a
    # case-insensitive search.
    inline="$(printf '%s' "${cmd:-}" | grep -oE '[Dd][Aa][Tt][Aa][Bb][Aa][Ss][Ee]_[Uu][Rr][Ll]=[^[:space:]]+' | tail -n1)"
    [ -z "$inline" ] && inline="$(printf '%s' "$flat" | grep -oiE 'database_url=[^[:space:]]+' | tail -n1)"
    if [ -n "$inline" ]; then
        printf '%s' "${inline#*=}" | unquote
        return
    fi
    if [ -n "${DATABASE_URL:-}" ]; then
        printf '%s' "$DATABASE_URL" | unquote
        return
    fi
    # Climbing up the tree, not only the working directory: the agent works in a git worktree under
    # `.claude/worktrees/<branch>/`, where there is no `.env` of its own, while the main checkout
    # has one, and it lies exactly higher up the path. Without the climb the guard would not have
    # resolved the address once, exactly where the migrations are run.
    dir="$hook_cwd"
    depth=0
    while [ -n "$dir" ] && [ "$dir" != '/' ] && [ "$depth" -lt 8 ]; do
        for env_file in "$dir/.env" "$dir/.env.local"; do
            [ -f "$env_file" ] || continue
            value="$(grep -m1 -E '^[[:space:]]*DATABASE_URL=' "$env_file" 2>/dev/null | sed -e 's/^[[:space:]]*DATABASE_URL=//' | unquote)"
            if [ -n "$value" ]; then
                printf '%s' "$value"
                return
            fi
        done
        dir="$(dirname "$dir")"
        depth=$((depth + 1))
    done
}

sql_check_migrations() {
    if printf '%s' "$flat" | grep -qE 'prisma[[:space:]]+migrate[[:space:]]+(deploy|dev)'; then
        migrate_target="$(resolve_database_url)"
        # The production address is checked BEFORE the parse by kinds: a tunnel to production also
        # hangs on a loopback address, only on a port of its own, and the common rule "loopback
        # means local" would have let a migration through to production.
        if [ -n "$PROD_DSN" ] && printf '%s' "$migrate_target" | grep -qE "$PROD_DSN"; then
            deny "BLOCKED: applying migrations to the PRODUCTION database (${context}). The address of the database leads to production. The schema in production is changed by the rollout: it calls the applying of migrations itself, by a one-off container, before the application starts. Doing this by hand is not allowed — the guard must not be bypassed."
        fi
        case "$migrate_target" in
            *@localhost:*|*@127.0.0.1:*|*@postgres:*|*@host.docker.internal:*)
                # A local database is routine work. The parse ends here, otherwise the common rule
                # about writing to the database fires below and the question is asked anyway:
                # `migrate deploy` is marked a write higher up the text.
                #
                # But it can be exited only if there is ONE write in the command — the migration
                # itself. In the chain `prisma migrate deploy && psql -c "delete …"` an early exit
                # would remove the check from the second link, and that is exactly the bypass the
                # guard is written for.
                other_write=""
                printf '%s' "$write_scope" \
                    | grep -qE '(^|[^[:alnum:]_])(delete|update|insert|truncate|drop|alter|create|grant|revoke|copy)([^[:alnum:]_]|$)|\\copy|into[[:space:]]+[a-z_"]' \
                    && other_write="yes"
                while IFS= read -r seg; do
                    [ -z "$seg" ] && continue
                    printf '%s' "$seg" | grep -qE '(^|[^[:alnum:]_.-])(cat|head|tail|gzcat|zcat|gunzip|echo|printf|curl|wget)([[:space:]]|$)' \
                        && other_write="yes" && break
                done <<MIGRATE_PIPE_EOF
$(client_segments)
MIGRATE_PIPE_EOF
                # A file poured into the client is judged by the same sign as everywhere else. Its
                # own set of signs here was narrower than the common one by exactly this, and the
                # second link of `prisma migrate deploy && psql -d app -f fix.sql` fell out of the
                # check whole: the guard sees neither the file nor its content.
                sql_delivers_file && other_write="yes"
                [ -z "$other_write" ] && exit 0
                ;;
            '')
                ask "Applying migrations to a database (${context}), but the address could not be resolved: DATABASE_URL is neither in the command, nor in the environment, nor in the \`.env\` of the working directory. Check where the migration will go, and confirm."
                ;;
            *)
                ask "Applying migrations to an address UNKNOWN TO THE GUARD (${context}). The guard knows local addresses and production ones; this is neither. Make sure this is not production, and confirm."
                ;;
        esac
    fi
}

# --- delete/update: looking at the addressing -------------------------------------------
sql_check_addressing() {
    if printf '%s' "$flat" | grep -qE '(^|[^[:alnum:]_])(delete[[:space:]]+from|update)([^[:alnum:]_]|$)'; then
        if ! printf '%s' "$flat" | grep -q 'where'; then
            verdict "DELETE/UPDATE without WHERE touches the whole table (${context})."
        fi

        # The addressing is looked for ONLY in the tail after the last `where`. While the whole
        # query was looked at, an assignment in SET counted as addressing: `UPDATE bookings SET
        # "propertyId" = 'p1' WHERE source = 'site'` looked addressed, although it touched every
        # direct request for the property — exactly what the guard protects from.
        # The case is kept here, unlike in `flat`: Prisma columns are written in camelCase, and
        # `bookingid` brought to lower case is no longer distinguishable from the word `paid`.
        where_tail="$(printf '%s' "$sql" | tr '\n\t' '  ' | sed -E 's/.*[Ww][Hh][Ee][Rr][Ee]/where/')"

        # The column name is required whole: `id`, `booking_id`, `"bookingId"`. The former pattern
        # `[a-z_]*id` took `paid` and `valid` for an identifier.
        if ! printf '%s' "$where_tail" | grep -qE '(^|[^[:alnum:]_"])"?(id|[A-Za-z_]+_id|[a-zA-Z]+Id)"?[[:space:]]*(=|[Ii][Nn][[:space:]]*\()'; then
            verdict "DELETE/UPDATE addresses the rows not by an identifier (${context}) — the condition may match wider than intended."
        fi

        # The guard sees the column name but not the schema: `propertyId` and `session_id` are
        # foreign keys, and a query by them is addressed only in appearance. `DELETE … WHERE
        # "propertyId" = 'p1'` wipes every booking of the property. Telling this from a primary key
        # without the schema is impossible, so the decision stays with the user — but the warning
        # must be direct, not general.
        if ! printf '%s' "$where_tail" | grep -qE '(^|[^[:alnum:]_"])"?id"?[[:space:]]*(=|[Ii][Nn][[:space:]]*\()'; then
            ask "The condition addresses the rows by a FOREIGN key, not by the primary one (${context}): $(printf '%s' "$where_tail" | head -c 200). ALL the rows tied to that record fall under it — for example \`WHERE \"propertyId\" = …\` touches every booking of the property, the demonstration ones included. If specific rows are needed, first select them by a SELECT and list them in \`WHERE id IN (…)\`."
        fi
    fi
}
