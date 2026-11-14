#!/usr/bin/env bash
# The scenarios of the auth stand step limit: a branch that rebuilds the theme JAR and recreates
# Keycloak gets 30 s, every other branch keeps 12 s. The limit is chosen by the paths the branch
# changed, so the mapping is asked with the paths given here instead of a diff.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the time limit of the auth stand step"

ROOT="$(cd "$TOOLS/.." && pwd)"

limit_for() {
    (
        cd "$ROOT" || exit 1
        # shellcheck disable=SC1091
        . .claude/rt-kit/project-budget.sh
        changed="$1"
        rt_auth_stand_changed() { printf '%s\n' "$changed"; }
        rt_push_check_budget 'pnpm run serve:auth && pnpm run check:auth-stand'
    )
}

report "the theme code gets 30 s" "$(limit_for 'projects/auth-keycloak-theme/src/main.ts')" 30
report "the second kit gets 30 s" "$(limit_for 'projects/ui-kit-v2/src/lib/components/field/rt-field.component.ts')" 30
report "the stand composition gets 30 s" "$(limit_for 'deploy/auth/compose.yml')" 30
report "the realm file keeps 12 s" "$(limit_for 'deploy/auth/realm/rt.json')" 12
report "the stand check script keeps 12 s" "$(limit_for 'tools/auth-stand-check.mjs')" 12
report "a branch of texts keeps 12 s" "$(limit_for 'docs/specs/auth/spec.md')" 12
report "a mixed branch with the theme gets 30 s" "$(limit_for "$(printf 'docs/a.md\nprojects/auth-keycloak-theme/package.json')")" 30
report "another step keeps its own limit" "$(cd "$ROOT" && . .claude/rt-kit/project-budget.sh && rt_push_check_budget 'pnpm exec nx run auth-example-e2e:e2e')" 34

suite_result
