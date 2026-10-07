#!/usr/bin/env bash
# The scenarios of the production realm `rt`: it is built from the stand realm file, keeps no stand
# client, no local address and no secret, and refuses an origin it cannot use.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the production realm"

BUILD="$TOOLS/auth-realm-prod.mjs"
REALM="$(node "$BUILD" --bus-origin https://bus.example 2>&1)"

field() {
    printf '%s' "$REALM" | node -e "
let text = ''; process.stdin.on('data', (part) => (text += part)).on('end', () => {
    const realm = JSON.parse(text);
    console.log(String($1));
});"
}

# The bus admin is found first: the absence checks below mean something only when it is there.
report "the bus admin is in the realm" \
    "$(field "realm.clients.some((c) => c.clientId === 'rt-message-bus-admin')")" true
report "the example admin stays on the stand" \
    "$(field "realm.clients.some((c) => c.clientId === 'rt-example-admin')")" false
report "the bus admin answers on the production origin only" \
    "$(field "JSON.stringify(realm.clients.find((c) => c.clientId === 'rt-message-bus-admin').redirectUris)")" '["https://bus.example/*"]'
report "the roles of the bus admin are kept" \
    "$(field "(realm.roles.client['rt-message-bus-admin'] ?? []).length > 0")" true
report "no role of the example admin is left" \
    "$(field "'rt-example-admin' in realm.roles.client")" false
report "no local address is left in the realm" \
    "$(field "JSON.stringify(realm).includes('localhost')")" false
report "every service client takes its secret from the node" \
    "$(field "realm.clients.filter((c) => c.publicClient === false).every((c) => /^\\\$\\(env:RT_[A-Z_]+_SECRET\\)\$/.test(c.secret))")" true
report "the mail of the realm comes from the node" \
    "$(field "realm.smtpServer.host + ' ' + realm.verifyEmail")" '$(env:RT_SMTP_HOST) $(env:RT_VERIFY_EMAIL)'
report "the service accounts and their roles are kept" \
    "$(field "realm.users.map((u) => u.serviceAccountClientId).sort().join(',')")" 'rt-cargo-tools,rt-catalog-sync,rt-user-import'

report "an origin without https is refused" \
    "$(node "$BUILD" --bus-origin http://bus.example >/dev/null 2>&1; echo $?)" 1
report "a missing origin is refused" \
    "$(node "$BUILD" >/dev/null 2>&1; echo $?)" 1

suite_result "the production realm"
