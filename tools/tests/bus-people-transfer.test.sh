#!/usr/bin/env bash
# The scenarios of the transfer of the bus people to Keycloak: what a person carries, who stays
# behind and how the operator column is rewritten. The pure part is called by node with fixtures;
# neither production nor Keycloak is asked.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the transfer of the bus people"

LIB="$TOOLS/bus-people-transfer.lib.mjs"

# Runs a snippet against the library and prints what it prints. A thrown error prints «refused: …».
run() {
    node --input-type=module -e "
import * as lib from '$LIB';
const set = new Set(['postmortems:read', 'postmortems:manage', 'proposals:read', 'invites:read']);
try { $1 } catch (error) { console.log('refused: ' + error.message); }
" 2>&1
}

says() {
    local label="$1" got="$2" want="$3"
    if [[ "$got" == *"$want"* ]]; then report "$label" "found" "found"; else report "$label" "$got" "$want"; fi
}

lacks() {
    local label="$1" got="$2" unwanted="$3"
    if [[ "$got" == *"$unwanted"* ]]; then report "$label" "$got" "without $unwanted"; else report "$label" "absent" "absent"; fi
}

PERSON='{ id: "a-1", name: "Eyhenij", disabled: false, roleRights: ["postmortems:read", "postmortems:manage"], edits: [{ right: "postmortems:manage", granted: false }, { right: "invites:read", granted: true }] }'

got="$(run "console.log(JSON.stringify(lib.transferOf([$PERSON], { eyhenij: 'Owner@Example.com' }, set).people));")"
says "SC-MB-418 — the person carries the address brought to one form" "$got" '"email":"owner@example.com"'
says "SC-MB-418 — the rights are the role with the edits over it" "$got" '"rt-message-bus-admin":["invites:read","postmortems:read"]'
lacks "SC-MB-418 — the record carries no password" "$got" 'password'

got="$(run "console.log(JSON.stringify(lib.rightsOf(['postmortems:read', 'accounts:manage'], [{ right: 'roles:manage', granted: true }], set)));")"
says "SC-MB-419 — a right of the set stays" "$got" '"postmortems:read"'
lacks "SC-MB-419 — a right that left the set does not move" "$got" 'accounts:manage'
lacks "SC-MB-419 — an edit giving a right that left the set does not move" "$got" 'roles:manage'

got="$(run "const out = lib.transferOf([$PERSON, { id: 'a-2', name: 'Cargo-Triage', disabled: false, roleRights: [], edits: [] }, { id: 'a-3', name: 'gone', disabled: true, roleRights: [], edits: [] }], { eyhenij: 'owner@example.com', 'cargo-triage': 'x@example.com', gone: 'y@example.com' }, set); console.log(out.people.length, JSON.stringify(out.left));")"
says "SC-MB-420 — only the live person moves" "$got" '1 ['
says "SC-MB-420 — the report names the service account" "$got" '"name":"Cargo-Triage"'
says "SC-MB-420 — the report names the disabled account" "$got" '"name":"gone","reason":"disabled"'

got="$(run "lib.transferOf([$PERSON, { id: 'a-4', name: 'Stranger', disabled: false, roleRights: [], edits: [] }], { eyhenij: 'owner@example.com' }, set); console.log('written');")"
says "SC-MB-421 — an account without an address refuses the export" "$got" 'refused: the address book names no address for: Stranger'
lacks "SC-MB-421 — nothing is written" "$got" 'written'

got="$(run "console.log(lib.rekeySql([{ id: 'a-1', email: 'owner@example.com' }], new Map([['owner@example.com', 'kc-1']])));")"
says "SC-MB-422 — the old key is replaced by the Keycloak key of the same address" "$got" "SET \"personId\" = 'kc-1' WHERE \"personId\" = 'a-1';"
says "SC-MB-422 — the rewrite opens a transaction" "$got" 'BEGIN;'
says "SC-MB-422 — the rewrite closes the transaction" "$got" 'COMMIT;'

got="$(run "console.log(lib.rekeySql([{ id: 'a-1', email: 'owner@example.com' }, { id: 'a-2', email: 'lost@example.com' }], new Map([['owner@example.com', 'kc-1']])));")"
says "SC-MB-423 — an address the realm does not know refuses the rewrite" "$got" 'refused: the realm knows no person with the address: lost@example.com'
lacks "SC-MB-423 — no statement is given" "$got" 'UPDATE'

got="$(run "console.log(lib.rekeyReport('BEGIN\nUPDATE 1\nUPDATE 1\nCOMMIT', 2));")"
says "SC-MB-424 — the report counts the rows the database changed" "$got" '2 operators of 2 people now name their Keycloak keys'

got="$(run "console.log(lib.rekeyReport('BEGIN\nUPDATE 0\nUPDATE 0\nCOMMIT', 2));")"
says "SC-MB-424 — a run that changed no row says nothing is rewritten" "$got" 'nothing is rewritten'
lacks "SC-MB-424 — an empty run is not reported as success" "$got" 'now name their Keycloak keys'

got="$(run "console.log([...lib.busRights()].includes('postmortems:read'), [...lib.busRights()].includes('accounts:manage'));")"
says "the set of rights is read from its declaration" "$got" 'true false'

suite_result "the transfer of the bus people"
