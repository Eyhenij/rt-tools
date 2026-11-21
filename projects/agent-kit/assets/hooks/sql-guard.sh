#!/usr/bin/env bash
# rt-hook: PreToolUse Bash|mcp__webstorm__execute_sql_query|mcp__webstorm__execute_terminal_command|mcp__webstorm__execute_tool
# Requires: hooks/deny-tail.sh
# Guard of writing queries to the storage. PreToolUse.
#
# An edit of data is the only action that cannot be undone by an edit of code. A delete by mask
# one day takes the real records away along with the trial ones: the mask matches wider than the
# query author expected, and this is learned only from the restore out of a copy.
#
# Hence the rule: rows are addressed by primary key. A list of identifiers touches exactly as
# many rows as are listed, and a miss is visible before execution; a selection by substring is
# never visible.
#
# Three levels:
#   refusal  — drop, truncate, schema edit, delete and update without a condition or with a
#              condition not by identifier;
#   question — the rest of writing: an addressed edit and an insert, the decision is the owner's;
#   pass     — reading.
#
# Each subject of the parsing lives in a helper of its own next door: the query out of the input
# — `sql-guard-request.sh`, bringing the command to one form and cutting it into segments —
# `sql-guard-parse.sh`, the target together with the rules of the production database —
# `sql-guard-target.sh`, the sign of writing, the destructive, migrations and row addressing —
# `sql-guard-write.sh`. What stays here is the order: it calls them and decides.
#
# The production storage is separate: its addresses and connections are listed by the tree
# profile —
#   RT_PROD_DSN          — the pattern of the production database address: tunnel port, host,
#                          domain;
#   RT_PROD_CONNECTIONS  — identifiers of the IDE's production connections;
#   RT_LOCAL_CONNECTIONS — the same for local ones: a recognised local connection outweighs any
#                          textual guess;
#   RT_SCRATCH_PORT_RE   — ports of throwaway databases, for which no question is asked.
# At a production address any write is refused without an opt-out: production is edited by a
# migration through the rollout, not by a query from the editor.
#
# The opt-out for the remaining cases: the `destructive-ok` marker in the query text together
# with an explanation of why addressing by identifier does not fit lowers the refusal to a
# question. The last word stays with the owner — the guard only does not let it through silently.
#
# FAIL-OPEN: no parser, broken input, foreign tool — pass. Without `perl` there is nothing to cut
# commit message text out with, so in that case commands that work with history are passed
# entirely — otherwise the words "drop" and "update" in a commit description would read as a
# query. A query is never delivered inside such a command, so the concession costs nothing.

# Own name in the observations: the refusal is written by the shared refusal tail, not by the
# guard itself.
RT_GUARD_NAME=sql-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

tool="$(rt_hook_tool)"

# The working directory is needed by one rule — resolving the migration address: `DATABASE_URL`
# is usually not named in the command and lies in `.env` next to the project.
hook_cwd="$(printf '%s' "$input" | jq -r '.cwd // empty' 2>/dev/null)"
[ -z "$hook_cwd" ] && hook_cwd="${CLAUDE_PROJECT_DIR:-.}"

# The tree profile: first the package default, on top of it the project override, if there is
# one. The default is also looked for next to the hook itself: they travel together.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

# The helpers lie next to the guard and travel into the tree with it. If even one is missing,
# there is nothing to parse the command with, and the guard passes the move: the fail-open here
# is the same as when `jq` is absent.
for helper in sql-guard-request.sh sql-guard-parse.sh sql-guard-target.sh sql-guard-write.sh; do
    [ -f "$rt_hooks_dir/$helper" ] || exit 0
    # shellcheck disable=SC1090
    . "$rt_hooks_dir/$helper"
done

PROD_DSN="${RT_PROD_DSN:-}"

# The shared refusal tail: two lawful moves and the lawful form of bypass, when the refusal has
# one. The file may not be laid out — then there is no tail, and the reason for the refusal stays
# as it was.
# shellcheck disable=SC1090
# The decision and the words come from the decision table. The hook names the class of the request,
# where it goes and what it found; the table says whether that is refused, asked or let through.
# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/decide.sh" 2>/dev/null

# The class of the request by the same signs the checks below use. A marker on a destructive request
# makes it a class of its own: the table asks instead of refusing. `sql_class write` leaves the
# migration out: a migration next to a second write is judged by that write.
sql_class() {
    local destructive=""
    printf '%s' "$flat" | grep -qE '(^|[^[:alnum:]_])(truncate|drop[[:space:]]+(table|database|schema|column|index)|alter[[:space:]]+table)([^[:alnum:]_]|$)' \
        && destructive=schema
    printf '%s' "$flat" | grep -q 'pg_restore' && printf '%s' "$flat" | grep -qE '(^|[[:space:]])(--clean|-c|--create)([[:space:]]|=|$)' \
        && destructive=schema
    printf '%s' "$flat" | grep -qE 'prisma[[:space:]]+(migrate[[:space:]]+reset|db[[:space:]]+push)' && destructive=reset
    if [ -n "$destructive" ]; then
        case "$flat" in
            *destructive-ok*) printf '%s' destructive_marked; return ;;
        esac
        [ "$destructive" = reset ] && printf '%s' db_reset || printf '%s' destructive
        return
    fi
    if [ "${1:-}" != write ] && printf '%s' "$flat" | grep -qE 'prisma[[:space:]]+migrate[[:space:]]+(deploy|dev)'; then
        printf '%s' migrate
        return
    fi
    if printf '%s' "$flat" | grep -qE '(^|[^[:alnum:]_])(delete[[:space:]]+from|update)([^[:alnum:]_]|$)'; then
        local tail
        tail="$(printf '%s' "$sql" | tr '\n\t' '  ' | tr -d '\\' | sed -E 's/.*[Ww][Hh][Ee][Rr][Ee]/where/')"
        if ! printf '%s' "$flat" | grep -q 'where' \
            || ! printf '%s' "$tail" | grep -qE '(^|[^[:alnum:]_"])"?(id|[A-Za-z_]+_id|[a-zA-Z]+Id)"?[[:space:]]*(=|[Ii][Nn][[:space:]]*\()'; then
            printf '%s' write_unaddressed
            return
        fi
        printf '%s' "$tail" | grep -qE '(^|[^[:alnum:]_"])"?id"?[[:space:]]*(=|[Ii][Nn][[:space:]]*\()' || { printf '%s' write_fk; return; }
    fi
    sql_delivers_file && { printf '%s' file_into_client; return; }
    printf '%s' write_by_pk
}

# Where the request goes: production, a connection the guard does not know, or a local one.
sql_target_of() {
    if [ -n "$is_prod" ]; then
        printf '%s' prod
    elif [ -n "$conn" ] && [ -z "$conn_known" ]; then
        printf '%s' unknown
    else
        printf '%s' local
    fi
}

# sql_refuse <what the guard found> [class] [target]: the class and the target default to the ones
# the request itself gives.
sql_refuse() {
    local action="${2:-$(sql_class)}" target="${3:-$(sql_target_of)}"
    command -v rt_decide >/dev/null 2>&1 || exit 0
    rt_decide sql-guard.sh "$action" "$(jq -cn --arg t "$target" '{target:$t}')" \
        "$(jq -cn --arg s "$1" '{said:$s}')" PreToolUse "$input"
    exit 0
}

sql_read_request
[ -z "$sql" ] && exit 0

sql_flatten
sql_collect_segments
sql_addr_flatten
sql_resolve_target
sql_detect_write

sql_pass_scratch
sql_check_prod

[ -z "$is_write" ] && exit 0

sql_check_destructive
sql_check_migrations
sql_check_addressing

# --- the rest of writing: the user decides -------------------------------------------------
# An unknown connection is no reason to pass silently: the target of the query is not recognised,
# and it may turn out to be the production database under another identifier.
if [ "$conn_known" = "" ] && [ -n "$conn" ]; then
    sql_refuse "A write into the database through a CONNECTION UNKNOWN TO THE GUARD (id ${conn}). The guard knows the local connection and the production one; this is neither, so make sure the request does not go to production. If the connection is permanent, write its id into PROD_CONNECTIONS or LOCAL_CONNECTIONS in .claude/hooks/sql-guard.sh." "$(sql_class write)"
fi

sql_refuse "A write into the database (${context}). Check that only the expected rows are touched, and confirm." "$(sql_class write)"
