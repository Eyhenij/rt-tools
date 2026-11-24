#!/usr/bin/env bash
# The scenarios of the auth stand freshness: the end-to-end suite raises the auth stand a second time
# unless the stand is current. Keycloak reads its theme only at start, so a stand that started before
# the theme archive was written is raised again; so is a stand of another tree, one with an edited
# composition or realm file, and one with other counter numbers, another admin port or other Google
# keys of the realm.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the freshness of the auth stand for the end-to-end suite"

ROOT="$(cd "$TOOLS/.." && pwd)"

# Prints the decision for the current stand with one fact replaced: a path inside the facts object
# and the JSON value to put there.
reason_with() {
    node --input-type=module -e "
        import { staleReason } from '$ROOT/apps/auth-example-e2e/stand/auth-fresh.mjs';
        const facts = {
            root: '/tree',
            archiveWrittenAt: 1000,
            theme: { digest: 'aa', raised: 'aa' },
            standFilesWrittenAt: 900,
            env: { COUNTERS_BY_REALM: '', E2E_ADMIN_PORT: '4310', RT_GOOGLE_ENABLED: 'false', RT_GOOGLE_CLIENT_ID: 'not-set', RT_GOOGLE_CLIENT_SECRET: 'not-set' },
            running: { COUNTERS_BY_REALM: '', E2E_ADMIN_PORT: '4310', RT_GOOGLE_ENABLED: 'false', RT_GOOGLE_CLIENT_ID: 'not-set', RT_GOOGLE_CLIENT_SECRET: 'not-set' },
            keycloak: { health: 'healthy', startedAt: 20000, themeSource: '/tree/dist/auth-keycloak-theme/rt-auth-keycloak-theme.jar' },
            config: { exitCode: 0, finishedAt: 21000 },
        };
        const path = process.argv[1];
        if (path) {
            const keys = path.split('.');
            const last = keys.pop();
            keys.reduce((node, key) => node[key], facts)[last] = JSON.parse(process.argv[2]);
        }
        process.stdout.write(String(staleReason(facts)));
    " "$1" "$2"
}

report "a current stand is used as it stands" "$(reason_with)" "null"
report "no stand is raised" "$(reason_with keycloak null)" "the stand is not raised"
report "the realm import never ran" "$(reason_with config null)" "the stand is not raised"
report "Keycloak still starting is raised" "$(reason_with keycloak.health '"starting"')" "Keycloak is starting"
report "the theme of another tree is raised" "$(reason_with keycloak.themeSource '"/other/dist/auth-keycloak-theme/rt-auth-keycloak-theme.jar"')" "Keycloak mounts the theme of another tree"
report "an archive written after the start is raised" "$(reason_with archiveWrittenAt 25000)" "Keycloak was raised with another theme archive"
report "an archive written within the clock margin before the start is raised" "$(reason_with archiveWrittenAt 17000)" "Keycloak was raised with another theme archive"
report "a missing archive is raised" "$(reason_with archiveWrittenAt null)" "Keycloak was raised with another theme archive"
report "an archive of an older time and another content is raised" "$(reason_with theme.raised '"bb"')" "Keycloak was raised with another theme archive"
report "a stand raised with no digest written down is raised" "$(reason_with theme.raised null)" "Keycloak was raised with another theme archive"
report "a composition edited after the start is raised" "$(reason_with standFilesWrittenAt 20500)" "the stand composition was edited after Keycloak started"
report "a failed realm import is raised" "$(reason_with config.exitCode 1)" "the realm file was not applied after its last edit"
report "a realm file edited after the import is raised" "$(reason_with config.finishedAt 800)" "the realm file was not applied after its last edit"
report "other counter numbers are raised" "$(reason_with env.COUNTERS_BY_REALM '"rt=G-OTHER1:"')" "COUNTERS_BY_REALM differs from the running stand"
report "another admin port is raised" "$(reason_with env.E2E_ADMIN_PORT '"4377"')" "E2E_ADMIN_PORT differs from the running stand"
report "other Google keys of the realm are raised" "$(reason_with env.RT_GOOGLE_CLIENT_ID '"client-2"')" "RT_GOOGLE_CLIENT_ID differs from the running stand"

# --- drop-stale: the container of a former theme is removed before the stand is raised -------------
stale_with() {
    node --input-type=module -e "
        import { themeStale } from '$ROOT/apps/auth-example-e2e/stand/auth-fresh.mjs';
        process.stdout.write(String(themeStale({ keycloak: $1, archiveWrittenAt: $2, theme: { digest: 'aa', raised: '$3' } })));
    "
}
report "drop-stale: a container started before the archive is removed" "$(stale_with '{ startedAt: 20000 }' 25000 aa)" "true"
report "drop-stale: an archive from the build cache with an older time and another content is removed" "$(stale_with '{ startedAt: 20000 }' 1000 bb)" "true"
report "drop-stale: a container of the current theme stays" "$(stale_with '{ startedAt: 20000 }' 1000 aa)" "false"
report "drop-stale: no container — nothing is removed" "$(stale_with null 25000 bb)" "false"
report "drop-stale: serve:auth removes it between the build of the theme and the raising" \
    "$(node -p "const s=require('$ROOT/package.json').scripts['serve:auth']; const at=['build:auth-keycloak-theme','stand/drop-stale.mjs',' up -d'].map((p)=>s.indexOf(p)); at.every((v,i)=>v>=0&&(i===0||v>at[i-1]))")" "true"

# The container is removed by its name, and only when it is stale: docker is a double that writes its calls.
STALE_BIN="$(mktemp -d)"
trap 'rm -rf "$STALE_BIN"' EXIT
docker_double() {
    cat > "$STALE_BIN/docker" <<SH
#!/usr/bin/env bash
printf '%s\n' "\$*" >> "$STALE_BIN/calls"
[ "\$1" = inspect ] && printf '[{"StartedAt":"$1","Status":"running","Health":{"Status":"healthy"}},["A=b"],[]]'
exit 0
SH
    chmod +x "$STALE_BIN/docker"
    rm -f "$STALE_BIN/calls"
}
docker_double 2001-01-01T00:00:00Z
RT_AUTH_THEME_RECORD="$STALE_BIN/record" PATH="$STALE_BIN:$PATH" node "$ROOT/apps/auth-example-e2e/stand/drop-stale.mjs" >/dev/null 2>&1
report "drop-stale: the stale container is removed by its name" "$(grep -c '^rm -f rt-auth-keycloak-1$' "$STALE_BIN/calls")" "1"
report "drop-stale: the digest is written down for the next call" "$([ -f "$STALE_BIN/record" ] && echo yes || echo no)" "yes"

suite_result "auth-stand-fresh"
