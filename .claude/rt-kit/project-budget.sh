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
        *'serve:auth'*) echo 12 ;;
        *'-t test-hooks'*) echo 1018 ;;
        *'-t lint typecheck test build'*) echo 182 ;;
        *'-t verify'*) echo 1 ;;
        *'lint:styles'*) echo 5 ;;
        'pnpm run agent-kit:check') echo 5 ;;
        'bash tools/tests/run.sh') echo 30 ;;
        'node tools/check-'*) echo 12 ;;
    esac
}

rt_push_over_budget_words() {
    printf '%s\n' 'Слово владельца: исполнитель — тупое чмо, набор снова гоняет лишнее.'
}
