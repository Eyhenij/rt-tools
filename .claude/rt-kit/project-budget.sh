#!/usr/bin/env bash
# The time limit of every check of the push set, in seconds: the longest run of that step measured
# on 13.11.2026 (task RT-3280, three set runs). A step over its limit refuses the push even when it
# passed — the set grew, and the executor sees it at the push that grew it.
#
# A step that was never measured has no limit here: a number not taken from a run would be a guess.
# The owner's order of 13.11.2026: «если проверки выполняются дольше чем это записано у тебя в разборе
# — проверки должны падать и называть тебя тупым чмом».

rt_push_check_budget() {
    case "$1" in
        *'visual-gate.mjs ui-kit-v2'*) echo 471 ;;
        *'message-bus-admin-e2e:e2e'*) echo 252 ;;
        *'auth-example-e2e:e2e'*) echo 34 ;;
        *'serve:auth'*) rt_auth_stand_budget_for "$(rt_auth_stand_changed)" ;;
        # 1018 one after another; 264 side by side, measured the same day (RT-3273).
        *'-t test-hooks'*) echo 264 ;;
        *'-t lint typecheck test build'*) echo 182 ;;
        *'-t verify'*) echo 1 ;;
        *'lint:styles'*) echo 5 ;;
        'pnpm run agent-kit:check') echo 5 ;;
        *'bash tools/tests/run.sh') echo 30 ;;
        'node tools/check-'*) echo 12 ;;
    esac
}

# The limit of the auth stand step by what the branch changed. 12 s is the stand built from the
# JAR in the cache and a Keycloak left running (RT-3280). A branch that edits the theme, the second
# kit it is drawn with or the stand composition rebuilds the JAR and recreates Keycloak: the build
# takes 11 s, the recreation 12 s, the realm 2 s and the poll 5 s, measured on 14.11.2026 in task
# RT-3301. The owner's choice of that day: «Два предела, 12 и 30 с (Рекомендую)». The packages the
# theme and the kit are built from and the lockfile rebuild the JAR the same way, so they count too.
rt_auth_stand_budget_for() {
    if printf '%s\n' "$1" | grep -qE '^(projects/(auth-keycloak-theme|ui-kit-v2|core|utils)/|deploy/auth/compose\.yml$|package\.json$|pnpm-lock\.yaml$)'; then
        echo 30
    else
        echo 12
    fi
}

# The paths the branch changed against the base of the push set; the main branch when the base is
# unknown.
rt_auth_stand_changed() {
    local base=''
    command -v rt_push_base >/dev/null 2>&1 && base="$(rt_push_base "${RT_MAIN_BRANCH:-main}" 2>/dev/null)"
    git diff --no-renames --name-only "${base:-origin/main}"...HEAD 2>/dev/null
}

# The whole set of one push: the green set of task RT-3273 on 13.11.2026, the only whole set measured
# after the steps the change did not need were taken out. A push over it is investigated before the
# next one. The owner's order of 13.11.2026: «запиши лимит на отправку ветки, если отправка занимает
# дольше — ты обязан разбираться почему это там».
rt_push_set_budget() {
    echo 440
}

rt_push_over_budget_words() {
    printf '%s\n' 'Слово владельца: исполнитель — тупое чмо, набор снова гоняет лишнее.'
}
