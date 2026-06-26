#!/usr/bin/env bash
# Project-board helper. Resolves the board owner, number and field IDs at
# runtime (nothing account-specific is hardcoded) and drives item status.
#
# The board is matched by title (default below) under the repo's own owner,
# so the same script works for any clone without editing IDs.
#
# Usage:
#   board.sh info                       # owner, project number/id, status options
#   board.sh list                       # board items: status | type#num | title
#   board.sh add <num>                  # add issue/PR #num to the board
#   board.sh status <num> "<status>"    # set Status (substring match, e.g. "review")
#
# Some setups route bare git/gh through an account-selection shim that errors;
# this script always calls them via `command` to bypass it.

set -euo pipefail

BOARD_TITLE="${RT_BOARD_TITLE:-Rt-tools}"
export BOARD_TITLE
GH="command gh"
PY="command python3"

owner() { $GH repo view --json owner -q .owner.login; }

# Resolve board number + node id by exact title under the owner.
resolve_project() {
    local o; o="$(owner)"
    $GH project list --owner "$o" --format json | $PY -c "
import json,sys
d=json.load(sys.stdin)
m=[p for p in d['projects'] if p['title']==__import__('os').environ['BOARD_TITLE']]
if not m:
    sys.exit('board \"%s\" not found for owner' % __import__('os').environ['BOARD_TITLE'])
print(m[0]['number'], m[0]['id'])
"
}

status_field_json() {
    local num="$1" o; o="$(owner)"
    $GH project field-list "$num" --owner "$o" --format json
}

cmd_info() {
    local o num pid; o="$(owner)"
    read -r num pid < <(resolve_project)
    echo "owner:   $o"
    echo "board:   $BOARD_TITLE (#$num)"
    echo "id:      $pid"
    echo "status options:"
    status_field_json "$num" | $PY -c "
import json,sys
d=json.load(sys.stdin)
for f in d['fields']:
    if f['name']=='Status':
        for op in f['options']: print('  -', op['name'])
"
}

cmd_list() {
    local o num pid; o="$(owner)"
    read -r num pid < <(resolve_project)
    $GH project item-list "$num" --owner "$o" --format json | $PY -c "
import json,sys
d=json.load(sys.stdin)
for it in d['items']:
    c=it.get('content',{}) or {}
    print('%-14s %s#%-5s %s' % (it.get('status','-'), c.get('type','?'), c.get('number','?'), it.get('title','')[:60]))
"
}

cmd_add() {
    local target="$1" o url; o="$(owner)"
    url="$($GH issue view "$target" --json url -q .url 2>/dev/null || $GH pr view "$target" --json url -q .url)"
    local num _pid; read -r num _pid < <(resolve_project)
    $GH project item-add "$num" --owner "$o" --url "$url"
    echo "added $url to $BOARD_TITLE"
}

cmd_status() {
    local target="$1" want="$2" o num pid; o="$(owner)"
    read -r num pid < <(resolve_project)

    # Python is single-quoted at the shell level (double-quoted strings inside)
    # so no shell metacharacter can leak into / truncate the command substitution.
    local fieldId optId
    read -r fieldId optId < <(status_field_json "$num" | WANT="$want" $PY -c '
import json, sys, os
d = json.load(sys.stdin)
want = os.environ["WANT"].lower()
field = next((f for f in d["fields"] if f["name"] == "Status"), None)
if field is None:
    sys.exit("no Status field on board")
opts = [o for o in field["options"] if want in o["name"].lower()]
if not opts:
    sys.exit("no Status option matching %r" % want)
if len(opts) > 1:
    sys.exit("ambiguous status %r: %s" % (want, [o["name"] for o in opts]))
print(field["id"], opts[0]["id"])
')

    local itemId
    itemId="$($GH project item-list "$num" --owner "$o" --format json | TARGET="$target" $PY -c '
import json, sys, os
d = json.load(sys.stdin)
t = str(os.environ["TARGET"])
m = [it["id"] for it in d["items"] if str((it.get("content") or {}).get("number")) == t]
if not m:
    sys.exit("item #%s not on board (run: board.sh add %s)" % (t, t))
print(m[0])
')"

    $GH project item-edit --id "$itemId" --project-id "$pid" \
        --field-id "$fieldId" --single-select-option-id "$optId" >/dev/null
    echo "set #$target Status -> match \"$want\""
}

case "${1:-}" in
    info)   cmd_info ;;
    list)   cmd_list ;;
    add)    cmd_add "${2:?issue/PR number}" ;;
    status) cmd_status "${2:?issue/PR number}" "${3:?status name}" ;;
    *) echo "usage: board.sh {info|list|add <num>|status <num> <status>}" >&2; exit 2 ;;
esac
