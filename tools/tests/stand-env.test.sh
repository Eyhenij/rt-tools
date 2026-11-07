#!/usr/bin/env bash
# The scenarios of the stand names a working copy gets before a push.
#
# Why they exist. The sign lives in `.claude/rt-kit/project.sh`, and a copy that got the names of its
# neighbour shows nothing on its own: both sets stay green until they run at the same minute, and
# then one re-creates the Keycloak under the tests of the other. The incident that started this cost
# an hour of waiting and three collisions in a row (task RT-3051).
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the stand names of a working copy"

ROOT="$(cd "$TOOLS/.." && pwd)"
ONE="$(mktemp -d)"
TWO="$(mktemp -d)"

# One variable of the stand, as the profile leaves it for the steps of the set in the given folder.
name_in() {
    (
        cd "$1" || exit 1
        unset COMPOSE_PROJECT_NAME E2E_API_PORT E2E_ADMIN_PORT E2E_FOREIGN_PORT E2E_DB_PORT \
            E2E_KEYCLOAK_PORT E2E_KEYCLOAK_DB_PORT E2E_MAIL_PORT E2E_SMTP_PORT \
            E2E_EXAMPLE_API_PORT E2E_EXAMPLE_ADMIN_PORT
        # shellcheck disable=SC1091
        . "$ROOT/.claude/rt-kit/project.sh"
        printenv "$2"
    )
}

report 'one folder gives the same port twice' \
    "$(name_in "$ONE" E2E_KEYCLOAK_PORT)" "$(name_in "$ONE" E2E_KEYCLOAK_PORT)"
report 'one folder gives the same compose name twice' \
    "$(name_in "$ONE" COMPOSE_PROJECT_NAME)" "$(name_in "$ONE" COMPOSE_PROJECT_NAME)"

if [ "$(name_in "$ONE" E2E_KEYCLOAK_PORT)" != "$(name_in "$TWO" E2E_KEYCLOAK_PORT)" ]; then same='no'; else same='yes'; fi
report 'two folders give two ports' "$same" 'no'
if [ "$(name_in "$ONE" COMPOSE_PROJECT_NAME)" != "$(name_in "$TWO" COMPOSE_PROJECT_NAME)" ]; then same='no'; else same='yes'; fi
report 'two folders give two compose names' "$same" 'no'

# Every port of the stand is its own: two names on one port refuse only at the raising.
ports="$(for variable in E2E_API_PORT E2E_ADMIN_PORT E2E_FOREIGN_PORT E2E_DB_PORT E2E_KEYCLOAK_PORT \
    E2E_KEYCLOAK_DB_PORT E2E_MAIL_PORT E2E_SMTP_PORT E2E_EXAMPLE_API_PORT E2E_EXAMPLE_ADMIN_PORT; do
    name_in "$ONE" "$variable"
    echo
done)"
report 'all ten names are set' "$(printf '%s\n' "$ports" | grep -c '^[0-9]')" '10'
report 'no two names share a port' "$(printf '%s\n' "$ports" | grep '^[0-9]' | sort -u | wc -l | tr -d ' ')" '10'

# A name pinned by the settings of a session loses: the same value stands in every copy.
pinned="$(cd "$ONE" && E2E_DB_PORT=55462 bash -c ". '$ROOT/.claude/rt-kit/project.sh'; printenv E2E_DB_PORT")"
if [ "$pinned" != '55462' ]; then lost='yes'; else lost='no'; fi
report 'a port pinned by the session settings loses' "$lost" 'yes'

# The shared name of the browser of the frames goes away, and the name from the path comes back.
shot="$(cd "$ONE" && E2E_SHOT_CONTAINER=shared bash -c ". '$ROOT/.claude/rt-kit/project.sh'; printenv E2E_SHOT_CONTAINER || echo gone")"
report 'a pinned name of the frames browser is dropped' "$shot" 'gone'

# The sign keeps the environment: a person who knows the port is taken names another for one run.
kept="$(cd "$ONE" && RT_STAND_KEEP=1 E2E_KEYCLOAK_PORT=61234 bash -c ". '$ROOT/.claude/rt-kit/project.sh'; printenv E2E_KEYCLOAK_PORT")"
report 'the keep sign leaves the environment as it is' "$kept" '61234'

rm -rf "$ONE" "$TWO"

suite_result 'stand names'
