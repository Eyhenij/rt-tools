#!/usr/bin/env bash
# The scenarios of the auth stand freshness: the end-to-end suite raises the auth stand a second time
# unless the stand is current. Keycloak reads its theme only at start, so a stand that started before
# the theme archive was written is raised again; so is a stand of another tree, one with an edited
# composition or realm file, and one with other counter numbers or another admin port.
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
            standFilesWrittenAt: 900,
            env: { GA_MEASUREMENT_ID: '', METRIKA_COUNTER_ID: '', E2E_ADMIN_PORT: '4310' },
            running: { GA_MEASUREMENT_ID: '', METRIKA_COUNTER_ID: '', E2E_ADMIN_PORT: '4310' },
            keycloak: { health: 'healthy', startedAt: 2000, themeSource: '/tree/dist/auth-keycloak-theme/rt-auth-keycloak-theme.jar' },
            config: { exitCode: 0, finishedAt: 2100 },
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
report "an archive written after the start is raised" "$(reason_with archiveWrittenAt 2500)" "the theme archive was written after Keycloak started"
report "a missing archive is raised" "$(reason_with archiveWrittenAt null)" "the theme archive was written after Keycloak started"
report "a composition edited after the start is raised" "$(reason_with standFilesWrittenAt 2050)" "the stand composition was edited after Keycloak started"
report "a failed realm import is raised" "$(reason_with config.exitCode 1)" "the realm file was not applied after its last edit"
report "a realm file edited after the import is raised" "$(reason_with config.finishedAt 800)" "the realm file was not applied after its last edit"
report "other counter numbers are raised" "$(reason_with env.GA_MEASUREMENT_ID '"G-OTHER1"')" "GA_MEASUREMENT_ID differs from the running stand"
report "another admin port is raised" "$(reason_with env.E2E_ADMIN_PORT '"4377"')" "E2E_ADMIN_PORT differs from the running stand"

suite_result "auth-stand-fresh"
