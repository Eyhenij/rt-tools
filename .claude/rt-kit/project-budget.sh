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
        # 1018 one after another; 264 side by side, measured the same day (RT-3273).
        *'-t test-hooks'*) echo 264 ;;
        *'-t lint typecheck test build'*) echo 182 ;;
        # 1 was measured on changes that reached no verify target, an idle nx answer. A change of
        # the second kit runs its docs verify: 1.3–1.9 s on 14.11.2026, six runs (RT-3292); nx alone
        # takes 1.3 s even on a cache hit.
        *'-t verify'*) echo 2 ;;
        *'lint:styles'*) echo 5 ;;
        'pnpm run agent-kit:check') echo 5 ;;
        *'bash tools/tests/run.sh') echo 30 ;;
        'node tools/check-'*) echo 12 ;;
    esac
}

# The whole set of one push: the green set of task RT-3273 on 13.11.2026, the only whole set measured
# after the steps the change did not need were taken out. A push over it is investigated before the
# next one. The owner's order of 13.11.2026: «запиши лимит на отправку ветки, если отправка занимает
# дольше — ты обязан разбираться почему это там».
#
# 440 held only for a set without the second kit's showcase. A change of the second kit runs its
# visual gate, 466–584 s alone, and three whole sets of such changes took 496, 509 and 598 s on
# 14.11.2026 (task RT-3294). The limit is the longest of them with a margin of 22 s. The owner's
# answer of 14.11.2026: «Поднять лимит по замеру».
rt_push_set_budget() {
    echo 620
}

rt_push_over_budget_words() {
    printf '%s\n' 'Слово владельца: исполнитель — тупое чмо, набор снова гоняет лишнее.'
}
