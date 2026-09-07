#!/usr/bin/env bash
# The request from the input of the storage guard: what exactly will go to the server and through
# what.
#
# There is deliberately no `# rt-hook:` line here: the event and the call pattern are declared by the
# guard itself, and a helper next to it is not registered as a hook and decides nothing alone.
#
# Four values come out of here: `sql` — the query text or the whole command, `conn` — the identifier
# of the editor connection, `context` — what this is delivered through, and `cmd` — the original
# command line, needed by the parsing of the migration address in its original case.

# Three kinds of input: a query through the editor connection, a shell command and the same command
# wrapped into the universal execution tool. A tool not named here is no concern of the guard.
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

sql_read_request() {
    sql=""
    context=""
    conn=""
    case "$tool" in
        mcp__webstorm__execute_sql_query)
            sql="$(printf '%s' "$input" | jq -r '.tool_input.queryText // empty' 2>/dev/null)"
            conn="$(printf '%s' "$input" | jq -r '.tool_input.connectionId // empty' 2>/dev/null)"
            context="запрос через подключение редактора"
            ;;
        # The IDE terminal executes the same command line and puts it into the same field as Bash:
        # without this branch the whole guard was bypassed by changing the tool.
        Bash | mcp__webstorm__execute_terminal_command | mcp__webstorm__execute_tool)
            cmd="$(rt_hook_cmd)"
            [ -z "$cmd" ] && exit 0

            # The universal execution tool calls ANY tool of the editor by name, among them
            # `execute_sql_query` — and then the line holds not a single client name by which the
            # guard switches itself on. The tool itself is closed in permissions.deny, but relying
            # on the setting alone is impossible: it will be lifted, and the guard will stay.
            if [ "$tool" = "mcp__webstorm__execute_tool" ] && command -v perl >/dev/null 2>&1; then
                case "$cmd" in
                    *execute_sql_query*)
                        inner_sql="$(printf '%s' "$cmd" | perl -0ne '
                            if (/--queryText(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(.+))/s) {
                                print defined $1 ? $1 : (defined $2 ? $2 : $3);
                            }
                        ' 2>/dev/null)"
                        inner_conn="$(printf '%s' "$cmd" | perl -0ne '
                            if (/--connectionId(?:=|\s+)(?:"([^"]*)"|\x27([^\x27]*)\x27|(\S+))/) {
                                print defined $1 ? $1 : (defined $2 ? $2 : $3);
                            }
                        ' 2>/dev/null)"
                        ;;
                esac
                # A terminal wrapped into the same tool: we parse the real command.
                if [ -z "$inner_sql" ]; then
                    inner_cmd="$(printf '%s' "$cmd" | perl -0ne '
                        if (/--command(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(.+))/s) {
                            print defined $1 ? $1 : (defined $2 ? $2 : $3);
                        }
                    ' 2>/dev/null)"
                    [ -n "$inner_cmd" ] && cmd="$inner_cmd"
                fi
            fi

            # A wrapped query is parsed as a query from the editor, not as a shell command: there
            # is no client name in it, but there is a connection and the SQL text.
            if [ -n "$inner_sql" ]; then
                sql="$inner_sql"
                conn="$inner_conn"
                context="запрос через подключение редактора (обёртка исполнителя)"
            else

            # A command that delivers nothing anywhere is not subject to parsing — even if the
            # client name stands in its arguments. `grep -rn "prisma db push" docs/` reads files,
            # not the database; before, it got a deny, and the only way around that was to spoil the
            # search pattern itself. The same technique is already applied in dev-server-guard: the
            # HEAD of the command decides, not a mention of the name somewhere inside.
            # What matters are commands that carry SQL to the server. The client is looked for AS A
            # WORD anywhere in the command, not only at the start: a deletion on production looks
            # like `ssh root@host "docker compose exec postgres psql -c '…'"` — when only the start
            # of the line was checked, it went past the guard entirely.
            #
            # The order here matters. Before, above stood the cut-off "the command starts with
            # git/gh", which removed false alarms on the commit text — and it opened a bypass: in
            # `git log && psql … -c "DELETE …"` the first link carried away all the rest of the SQL
            # with it. Now the client is looked for first, and only its absence ends the check.
            printf '%s\n' "$cmd" | grep -qE \
                '(^|[^[:alnum:]_.-])(psql|pg_restore|pg_dump|prisma)([^[:alnum:]_.-]|$)' \
                || exit 0

            # False alarms on descriptions are removed differently — by cutting out the text of
            # messages (`-m '…'`, `-am "…"`, `--message="…"`, `-F file`), not by giving up the check
            # of the whole command. SQL is not executed in the message itself, but the words
            # "delete" and "drop" are ordinary in it: `git commit -am "chore(api): update prisma
            # schema"` was parsed as an UPDATE without a WHERE, because the pattern demanded `-m`
            # right next to the hyphen.
            if command -v perl >/dev/null 2>&1; then
                # `file` must not be in the alternation: `--file=cleanup.sql` of psql fell under it,
                # and the sign "the SQL arrived as a file" died before it was checked. Only the
                # flags that carry the TEXT of the message belong here.
                cmd="$(printf '%s' "$cmd" | perl -0pe '
                    s/(^|[^[:alnum:]])--?[a-zA-Z]*(m|message|body|title|body-file|F)(=|\s+)("([^"\\]|\\.)*"|\x27[^\x27]*\x27|[^\s;&|]+)/$1/gs
                ' 2>/dev/null || printf '%s' "$cmd")"
                # After the message is cut out the client may no longer be there — then this was a
                # git command that only mentioned psql in the text.
                printf '%s\n' "$cmd" | grep -qE \
                    '(^|[^[:alnum:]_.-])(psql|pg_restore|pg_dump|prisma)([^[:alnum:]_.-]|$)' \
                    || exit 0
            else
                # Without perl there is nothing to cut the message text out with, and it must not
                # be parsed as SQL: a regular commit would run into a refusal. There is no delivery
                # of SQL in a git command, so here it is cheaper to pass than to break the work.
                case "$cmd" in
                    git\ *|*/git\ *|gh\ *|*/gh\ *) exit 0 ;;
                esac
            fi

            sql="$cmd"
            context="команда psql/prisma"
            fi
            ;;
        *) exit 0 ;;
    esac
}
