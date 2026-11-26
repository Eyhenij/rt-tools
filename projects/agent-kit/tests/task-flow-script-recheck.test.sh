#!/usr/bin/env bash
# Перемер перед PR по истории разобранной папки: ход работы на минуту замера и замена проверки,
# записанная вместе с отметкой. Вынесен из `task-flow-script-steps.test.sh`: тот не помещается в предел
# длины. Набор запускается сам, и его же подключает набор движка `task-flow-script.test.sh`.
if [ "${BASH_SOURCE[0]}" = "$0" ]; then
    . "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
    echo "сценарий task flow: перемер по истории папки"
    TESTS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    TF_DIR="$(mktemp -d)"
    TF_ALONE=1
fi
TF_G=(git -c user.name=t -c user.email=t@example.test -c commit.gpgsign=false)

# SC-AK-1739 — проверка читает ход работы: перемер разобранной папки даёт его таким, каким он был при замере
(
    cd "$TF_DIR" || exit 1
    git -c init.defaultBranch=main init -q live-repo
    cd live-repo || exit 1
    printf 'start\n' > start.txt
    git add start.txt && "${TF_G[@]}" commit -q -m start
    git update-ref refs/remotes/origin/main HEAD
    git checkout -q -b RT-4-live
    mkdir -p docs/tasks/RT-4-live
    cat > docs/tasks/RT-4-live/plan.md <<'PLAN'
# Plan

## Stages

### 1. Первый

- **Steps:**
    1. Найти шаг впереди
       Check: `grep -c '^- \[ \]' docs/tasks/RT-4-live/progress.md` → = 1
    2. Второй
       Check: `true` → exit 0
- **Readiness sign:** шаги измерены
PLAN
    printf '# Ход работы\n\n## Шаги\n\n- [>] 1.1 Найти шаг впереди\n- [ ] 1.2 Второй\n' > docs/tasks/RT-4-live/progress.md
    git add -A && "${TF_G[@]}" commit -q -m plan
    node "$TESTS/../assets/checks/task-flow-script.mjs" step 1.1 >/dev/null 2>&1
    node "$TESTS/../assets/checks/task-flow-script.mjs" step 1.2 >/dev/null 2>&1
    git add -A && "${TF_G[@]}" commit -q -m progress
    git rm -q -r docs/tasks/RT-4-live && "${TF_G[@]}" commit -q -m "folder taken apart"
)
got="$(cd "$TF_DIR/live-repo" && RT_FLOW_STEP_LIMIT_MS=5000 node "$TESTS/../assets/checks/task-flow-script.mjs" step --done --pr 2>&1; printf 'code=%s' "$?")"
report "pr: SC-AK-1739 — шаг, читающий ход работы, совпал на ходе работы своего замера" "$(printf '%s' "$got" | grep -cE '^1\.1 .*· совпало|matched 2')" 2

# SC-AK-1794 — замена проверки, записанная вместе с отметкой, читается перемером; снятая замена не возвращается
tf_wr_run() { # $1 — каталог; $2 и $3 — ход работы двух коммитов после плана; 1.1 по плану не совпадает
    local dir="$TF_DIR/$1" step="node $TESTS/../assets/checks/task-flow-script.mjs"
    (
        git -c init.defaultBranch=main init -q "$dir" && cd "$dir" || exit 1
        printf 'start\n' > start.txt
        git add start.txt && "${TF_G[@]}" commit -q -m start
        git update-ref refs/remotes/origin/main HEAD
        git checkout -q -b RT-5-wr
        mkdir -p docs/tasks/RT-5-wr
        printf '# Plan\n\n## Stages\n\n### 1. Первый\n\n- **Steps:**\n    1. Шаг\n       Check: `echo 5` → = 1\n- **Readiness sign:** шаг измерен\n' > docs/tasks/RT-5-wr/plan.md
        printf '# Ход работы\n\n## Шаги\n\n- [>] 1.1 Шаг\n' > docs/tasks/RT-5-wr/progress.md
        git add -A && "${TF_G[@]}" commit -q -m plan
        printf '%s' "$2" > docs/tasks/RT-5-wr/progress.md
        git add -A && "${TF_G[@]}" commit -q -m progress
        if [ -n "$3" ]; then printf '%s' "$3" > docs/tasks/RT-5-wr/progress.md && git add -A && "${TF_G[@]}" commit -q -m "replacement taken away"; fi
        git rm -q -r docs/tasks/RT-5-wr && "${TF_G[@]}" commit -q -m "folder taken apart"
    )
    (cd "$dir" && RT_FLOW_STEP_LIMIT_MS=5000 $step step --done --pr 2>&1; printf 'code=%s' "$?")
}
WR_HEAD='# Ход работы\n\n## Шаги\n\n- [x] 1.1 Шаг\n\n## Decisions along the way\n\n'
WR_ONE='- **Check of step 1.1 replaced:** `echo 1` → = 1\n'
got="$(tf_wr_run wr-one "$(printf "$WR_HEAD$WR_ONE")")"
report "pr: SC-AK-1794 — замена и отметка в одном коммите — шаг совпал" "$(printf '%s' "$got" | tr '\n' ' ' | grep -c 'matched 1 code=0')" 1
got="$(tf_wr_run wr-gone "$(printf "$WR_HEAD$WR_ONE")" "$(printf "$WR_HEAD")")"
report "pr: SC-AK-1794 — снятая замена не возвращается — шаг не совпал" "$(printf '%s' "$got" | tr '\n' ' ' | grep -c 'matched 0 code=1')" 1
got="$(tf_wr_run wr-two "$(printf "$WR_HEAD- **Check of step 1.1 replaced:** \`echo 7\` → = 1\n$WR_ONE")")"
report "pr: SC-AK-1794 — две замены одного шага — берётся поздняя" "$(printf '%s' "$got" | tr '\n' ' ' | grep -c 'matched 1 code=0')" 1
WR_OPEN="$(printf '# Ход работы\n\n## Шаги\n\n- [>] 1.1 Шаг\n\n## Decisions along the way\n\n')"
got="$(tf_wr_run wr-early-gone "$(printf '%s%s' "$WR_OPEN" "$(printf -- "$WR_ONE")")" "$(printf "$WR_HEAD")")"
report "pr: SC-AK-1794 — замена ранней версии, снятая к отметке, не возвращается" "$(printf '%s' "$got" | tr '\n' ' ' | grep -c 'matched 0 code=1')" 1
got="$(tf_wr_run wr-early-later "$(printf '%s- **Check of step 1.1 replaced:** `echo 7` → = 1\n' "$WR_OPEN")" "$(printf "$WR_HEAD$WR_ONE")")"
report "pr: SC-AK-1794 — замена ранней версии заменена поздней другого коммита" "$(printf '%s' "$got" | tr '\n' ' ' | grep -c 'matched 1 code=0')" 1

if [ -n "${TF_ALONE:-}" ]; then
    rm -rf "$TF_DIR"
    suite_result "сценарий task flow: перемер по истории папки"
fi
