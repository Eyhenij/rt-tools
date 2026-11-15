#!/usr/bin/env bash
# Случаи шага плана и одобрения плана движка task flow: команда `step`, проверка формы плана,
# `plan-red` и замена проверки. Набор запускается сам, и его же подключает набор движка
# `task-flow-script.test.sh`: тот считает эти случаи в своём выводе и целиком не помещается в предел
# длины. Подключённый, набор берёт у него `TF_DIR`, `TESTS` и `report`.
if [ "${BASH_SOURCE[0]}" = "$0" ]; then
    . "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
    echo "сценарий task flow: шаг плана и одобрение"
    TESTS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    TF_DIR="$(mktemp -d)"
    TF_ALONE=1
fi

# --- Шаг плана: команда из коммита плана, метка, предел, команда работы, папка -------------------
TF_G=(git -c user.name=t -c user.email=t@example.test -c commit.gpgsign=false)
(
    cd "$TF_DIR" || exit 1
    git -c init.defaultBranch=main init -q step-repo
    cd step-repo || exit 1
    "${TF_G[@]}" commit -q --allow-empty -m start
    git update-ref refs/remotes/origin/main HEAD
    git checkout -q -b RT-1-x
    mkdir -p docs/tasks/RT-1-x
    cat > docs/tasks/RT-1-x/plan.md <<'PLAN'
# Plan

## Stages

### 1. Первый

- **Steps:**
    1. Совпасть
       Check: `cat docs/tasks/RT-1-x/probe.txt` → `один`
    2. Не совпасть
       Check: `echo два` → `три`
    3. Ждать дольше предела
       Check: `sleep 5` → exit 0
    4. Сделать работу проверкой
       Check: `git push` → exit 0
    5. Ждать формы, которой нет
       Check: `true` → примерно ноль
    6. Принять форму из описания
       Check: `echo привет мир` → ~мир
- **Readiness sign:** шаги измерены
PLAN
    printf 'один\n' > docs/tasks/RT-1-x/probe.txt
    printf '# Ход работы\n\n## Шаги\n\n- [x] 1.1 Совпасть\n- [x] 1.2 Не совпасть\n- [>] 1.3 Ждать дольше предела\n- [ ] 1.4 Сделать работу проверкой\n- [ ] 1.5 Ждать формы, которой нет\n- [ ] 1.6 Принять форму из описания\n' > docs/tasks/RT-1-x/progress.md
    git add -A
    "${TF_G[@]}" commit -q -m plan
)
TF_STEP="$TF_DIR/step-repo"
TF_MARK="$TF_STEP/.git/rt-kit/steps/RT-1-x"
tf_step() {
    local out code
    out="$(cd "$TF_STEP" && node "$TESTS/../assets/checks/task-flow-script.mjs" step "$@" 2>&1)"
    code=$?
    printf '%s code=%s' "$out" "$code"
}

# SC-AK-1403, SC-AK-1409 — совпало: метка записана, код 0, строка кончается вердиктом
got="$(tf_step 1.1)"
report "step: SC-AK-1403 — совпало, код 0" "$got" 'ожидалось `один` · получено один · совпало code=0'
report "step: SC-AK-1403 — метка шага записана" \
    "$(node -e "const m=require('$TF_MARK/1.1.json');console.log([m.matched, m.step, m.branch, m.line, m.plan.length].join(' '))" 2>&1)" 'true 1.1 RT-1-x один 16'
report "step: SC-AK-1409 — строка кончается «· совпало»" "$(printf '%s' "$got" | grep -cE '· совпало code=0$')" 1

# SC-AK-1404, SC-AK-1409 — не совпало: метки нет, код 1
got="$(tf_step 1.2)"
report "step: SC-AK-1404 — не совпало, код 1" "$got" 'ожидалось `три` · получено два · не совпало code=1'
report "step: SC-AK-1404 — метки нет" "$(test -e "$TF_MARK/1.2.json" && echo есть || echo нет)" 'нет'
report "step: SC-AK-1409 — строка кончается «· не совпало»" "$(printf '%s' "$got" | grep -cE '· не совпало code=1$')" 1

# SC-AK-1405 — предел вышел: не совпало
got="$(cd "$TF_STEP" && node --input-type=module -e "
import { buildModel } from '$TESTS/../assets/checks/flow-model.mjs';
import { flowPath, openSources } from '$TESTS/../assets/checks/task-flow-script.mjs';
import { measureStep, stepLine } from '$TESTS/../assets/checks/flow-step.mjs';
import { dirname } from 'node:path';
const path = flowPath();
const model = buildModel(path);
const source = await openSources(model, dirname(path));
console.log(stepLine(measureStep({ git: source('git'), steps: source('steps'), marks: source('marks') }, model, '1.3', 300)));
" 2>&1)"
report "step: SC-AK-1405 — предел вышел — не совпало" "$got" 'ожидалось exit 0 · получено the limit of 0.3 s ran out · не совпало'

# SC-AK-1406 — команда работы проверкой быть не может
got="$(tf_step 1.4)"
report "step: SC-AK-1406 — команда работы как проверка отказана" "$(printf '%s' "$got" | grep -c 'is a command of the work: git push.* code=1')" 1
got="$(tf_step 1.5)"
report "step: SC-AK-1406 — форма ожидаемого не распознана — отказ до запуска" "$(printf '%s' "$got" | grep -c 'is in no form: примерно ноль.* code=1')" 1

# SC-AK-1407 — файл папки отличается от коммита плана
printf 'два\n' > "$TF_STEP/docs/tasks/RT-1-x/probe.txt"
got="$(tf_step 1.1)"
report "step: SC-AK-1407 — файл папки правлен после плана — отказ" \
    "$(printf '%s' "$got" | grep -c 'differs from the commit of the plan: docs/tasks/RT-1-x/probe.txt code=1')" 1
printf 'один\n' > "$TF_STEP/docs/tasks/RT-1-x/probe.txt"
printf '# Ход работы\n\n## Шаги\n\n- [x] 1.1 Совпасть\n- [x] 1.2 Не совпасть\n- [x] 1.3 Ждать дольше предела\n' > "$TF_STEP/docs/tasks/RT-1-x/progress.md"
report "step: SC-AK-1407 — ход работы правится и после плана" "$(tf_step 1.1 | grep -c '· совпало code=0')" 1

# SC-AK-1408 — step --done перемеряет все [x]
rm -f "$TF_MARK/1.1.json"
printf '# Ход работы\n\n## Шаги\n\n- [x] 1.1 Совпасть\n- [x] 1.2 Не совпасть\n- [>] 1.3 Ждать дольше предела\n' > "$TF_STEP/docs/tasks/RT-1-x/progress.md"
got="$(tf_step --done)"
report "step: SC-AK-1408 — step --done меряет оба [x] и выходит с кодом 1" \
    "$(printf '%s' "$got" | tr '\n' '#')" '1.1 ожидалось `один` · получено один · совпало#1.2 ожидалось `три` · получено два · не совпало#steps re-measured 2, matched 1 code=1'
report "step: SC-AK-1408 — метка шага 1.1 записана заново" "$(test -e "$TF_MARK/1.1.json" && echo есть || echo нет)" 'есть'

# SC-AK-1506 — форма ожидаемого, добавленная в описание, принимается step без правки движка
mkdir -p "$TF_DIR/kit"
cp -R "$TESTS/../assets/task-flow" "$TF_DIR/kit/task-flow"
cp "$TESTS/../assets/checks/work-steps-lib.mjs" "$TF_DIR/kit/"
node -e "
const fs = require('fs');
const f = process.argv[1];
fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace('expect: {', () => 'expect: {\\n    near: { pattern: \\'^~(.*)\$\\', compare: \\'regex\\' },'));
" "$TF_DIR/kit/task-flow/flow.js"
got="$(tf_step 1.6)"
report "plan: SC-AK-1506 — описание пакета формы «~» не знает" "$(printf '%s' "$got" | grep -c 'is in no form: ~мир code=1')" 1
got="$(tf_step 1.6 --flow "$TF_DIR/kit/task-flow/flow.js")"
report "plan: SC-AK-1506 — форма, вписанная в описание, принята" "$got" 'ожидалось ~мир · получено привет мир · совпало code=0'

# --- Одобрение плана: форма проверок, красный вывод, слово владельца, замена проверки -------------
(
    cd "$TF_DIR" || exit 1
    git -c init.defaultBranch=main init -q red-repo
    cd red-repo || exit 1
    "${TF_G[@]}" commit -q --allow-empty -m start
    git update-ref refs/remotes/origin/main HEAD
    git checkout -q -b RT-2-red
    mkdir -p docs/tasks/RT-2-red
    cat > docs/tasks/RT-2-red/plan.md <<'PLAN'
# Plan

## Stages

### 1. Первый

- **Steps:**
    1. Написать файл
       Check: `cat out.txt 2>/dev/null` → `готово`
    2. Посчитать строки
       Check: `wc -l < out.txt 2>/dev/null || echo 0` → >= 2
- **Readiness sign:** файл написан
PLAN
    printf '# Ход работы\n\n## Шаги\n\n- [>] 1.1 Написать файл\n- [ ] 1.2 Посчитать строки\n' > docs/tasks/RT-2-red/progress.md
    git add -A
    "${TF_G[@]}" commit -q -m plan
)
TF_RED="$TF_DIR/red-repo"
TF_REC="$TF_DIR/record.jsonl"
# Запись разговора: две роли, затем ответ меню; $1 — ответ.
tf_record() {
    {
        printf '%s\n' '{"type":"assistant","message":{"content":[{"type":"tool_use","name":"Agent","input":{"subagent_type":"product-strategist"}}]}}'
        printf '%s\n' '{"type":"assistant","message":{"content":[{"type":"tool_use","name":"Agent","input":{"subagent_type":"goal-critic"}}]}}'
        printf '{"type":"user","message":{"content":[{"type":"tool_result","content":"answered"}]},"toolUseResult":{"answers":{"Одобряешь план?":"%s"}}}\n' "$1"
    } > "$TF_REC"
}
tf_red() {
    local out code
    out="$(cd "$TF_RED" && RT_FLOW_TRANSCRIPT="$TF_REC" node "$TESTS/../assets/checks/task-flow-script.mjs" plan-red 2>&1)"
    code=$?
    printf '%s code=%s' "$out" "$code"
}
TF_APPROVAL="$TF_RED/.git/rt-kit/approval/RT-2-red.json"

# SC-AK-1410 — форма ожидаемого не распознана — запись плана отказана
printf '# Plan\n\n## Stages\n\n### 1. Первый\n\n- **Steps:**\n    1. Сделать\n       Check: `true` → примерно ноль\n' > "$TF_DIR/bad-plan.md"
got="$(cd "$TF_RED" && node "$TESTS/../assets/checks/task-flow-script.mjs" plan-check "$TF_DIR/bad-plan.md" 2>&1 | tr '\n' ' '; printf 'code=%s' "${PIPESTATUS[0]}")"
report "plan: SC-AK-1410 — неизвестная форма — план не записывается" "$(printf '%s' "$got" | grep -c 'step 1.1 is in no form: примерно ноль.* code=1')" 1
got="$(cd "$TF_RED" && node "$TESTS/../assets/checks/task-flow-script.mjs" plan-check "$TF_RED/docs/tasks/RT-2-red/plan.md" 2>&1 | tr '\n' ' '; printf 'code=%s' "${PIPESTATUS[0]}")"
report "plan: SC-AK-1410 — план известных форм проходит" "$got" 'code=0'

# SC-AK-1411 — plan-red пишет красный вывод и метку одобрения
tf_record 'Одобряю план RT-2 (Recommended)'
got="$(tf_red)"
report "plan: SC-AK-1411 — обе проверки красные, метка записана" "$(printf '%s' "$got" | grep -cE '^1\.[12] red|approval mark is written.* code=0$')" 3
report "plan: SC-AK-1411 — метка несёт ответ и красный вывод каждого шага" \
    "$(node -e "const m=require('$TF_APPROVAL');console.log([m.answer, Object.keys(m.red).join(','), m.fingerprint.length].join(' '))" 2>&1)" 'Одобряю план RT-2 (Recommended) 1.1,1.2 16'
rm -f "$TF_APPROVAL"
tf_record 'Переделай этап 1'
report "plan: SC-AK-1411 — другой ответ меню метки не даёт" "$(tf_red | grep -c 'no menu answer.* code=1')" 1
report "plan: SC-AK-1411 — после отказа метки нет" "$(test -e "$TF_APPROVAL" && echo есть || echo нет)" 'нет'
printf '%s\n' '{"type":"user","toolUseResult":{"answers":{"Одобряешь?":"Одобряю план RT-2"}}}' > "$TF_REC"
report "plan: SC-AK-1411 — без вызовов ролей метки нет" "$(tf_red | grep -c 'no menu answer.* code=1')" 1

# SC-AK-1412 — проверка зелёная в минуту записи — отказ
printf 'готово\n' > "$TF_RED/out.txt"
tf_record 'Одобряю план RT-2'
got="$(tf_red)"
report "plan: SC-AK-1412 — зелёная до работы проверка — отказ без метки" \
    "$(printf '%s' "$got" | grep -cE '^1\.1 green before the work|measures nothing; no mark code=1')" 2
rm -f "$TF_RED/out.txt"

# SC-AK-1413 — замена проверки только с цитатой владельца
printf '# Ход работы\n\n## Шаги\n\n- [>] 1.1 Написать файл\n- [ ] 1.2 Посчитать строки\n\n## Решения по ходу\n\n- **Проверка шага 1.1 заменена:** `echo готово` → `готово` · слово владельца: «меняй проверку 1.1»\n' > "$TF_RED/docs/tasks/RT-2-red/progress.md"
printf '%s\n' '{"type":"user","message":{"content":"меняй проверку 1.1 на echo"}}' > "$TF_REC"
got="$(cd "$TF_RED" && RT_FLOW_TRANSCRIPT="$TF_REC" node "$TESTS/../assets/checks/task-flow-script.mjs" step 1.1 2>&1 | tr '\n' ' '; printf 'code=%s' "${PIPESTATUS[0]}")"
report "plan: SC-AK-1413 — замена с цитатой владельца меряется" "$got" 'ожидалось `готово` · получено готово · совпало code=0'
printf '%s\n' '{"type":"user","message":{"content":"продолжай"}}' > "$TF_REC"
got="$(cd "$TF_RED" && RT_FLOW_TRANSCRIPT="$TF_REC" node "$TESTS/../assets/checks/task-flow-script.mjs" step 1.1 2>&1 | tr '\n' ' '; printf 'code=%s' "${PIPESTATUS[0]}")"
report "plan: SC-AK-1413 — замена без слова владельца отказана" "$(printf '%s' "$got" | grep -c 'the owner never typed it code=1')" 1

# SC-AK-1539 — ветка, спланированная до движка, читает план из последней правки
tf_legacy() {
    local branch="$1" dir
    dir="$TF_DIR/legacy-$branch"
    (
        git -c init.defaultBranch=main init -q "$dir"
        cd "$dir" || exit 1
        "${TF_G[@]}" commit -q --allow-empty -m start
        git update-ref refs/remotes/origin/main HEAD
        git checkout -q -b "$branch"
        mkdir -p "docs/tasks/$branch"
        printf '# Plan\n\n## Stages\n\n### 1. Первый\n\n- **Steps:**\n    1. Сказать\n       Check: `echo раз` → `раз`\n' > "docs/tasks/$branch/plan.md"
        git add -A
        "${TF_G[@]}" commit -q -m plan
        printf '# Plan\n\n## Stages\n\n### 1. Первый\n\n- **Steps:**\n    1. Сказать\n       Check: `echo два` → `два`\n' > "docs/tasks/$branch/plan.md"
        git add -A
        "${TF_G[@]}" commit -q -m edit
    )
    local out code
    out="$(cd "$dir" && node "$TESTS/../assets/checks/task-flow-script.mjs" step 1.1 2>&1)"
    code=$?
    printf '%s code=%s' "$out" "$code"
}
report "plan: SC-AK-1539 — ветка до движка меряет проверку последней правки плана" \
    "$(tf_legacy RT-3329-task-flow-scenario)" 'ожидалось `два` · получено два · совпало code=0'
report "plan: SC-AK-1539 — новая ветка с правленым планом отказана" \
    "$(tf_legacy RT-5-new | grep -c 'differs from the commit of the plan: docs/tasks/RT-5-new/plan.md code=1')" 1

if [ -n "${TF_ALONE:-}" ]; then
    rm -rf "$TF_DIR"
    suite_result "сценарий task flow: шаг плана и одобрение"
fi
