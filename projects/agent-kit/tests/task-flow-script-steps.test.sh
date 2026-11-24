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
    printf 'один\n' | tee docs/tasks/RT-1-x/probe.txt docs/tasks/RT-1-x/grill.md > docs/tasks/RT-1-x/approvals.md
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

# SC-AK-1407 — разбор отличается от коммита плана; прочие записи папки растут
printf 'два\n' > "$TF_STEP/docs/tasks/RT-1-x/grill.md"
got="$(tf_step 1.1)"
report "step: SC-AK-1407 — разбор правлен после плана — отказ" \
    "$(printf '%s' "$got" | grep -c 'differs from the commit of the plan: docs/tasks/RT-1-x/grill.md code=1')" 1
printf 'один\n' > "$TF_STEP/docs/tasks/RT-1-x/grill.md"
printf 'одобряю\n' >> "$TF_STEP/docs/tasks/RT-1-x/approvals.md"
report "step: SC-AK-1407 — an approval line added after the plan passes" "$(tf_step 1.1 | grep -c '· совпало code=0')" 1
printf '# Ход работы\n\n## Шаги\n\n- [x] 1.1 Совпасть\n- [x] 1.2 Не совпасть\n- [x] 1.3 Ждать дольше предела\n' > "$TF_STEP/docs/tasks/RT-1-x/progress.md"
report "step: SC-AK-1407 — ход работы правится и после плана" "$(tf_step 1.1 | grep -c '· совпало code=0')" 1

# SC-AK-1408 — step --done перемеряет все [x]
rm -f "$TF_MARK/1.1.json"
printf '# Ход работы\n\n## Шаги\n\n- [x] 1.1 Совпасть\n- [x] 1.2 Не совпасть\n- [>] 1.3 Ждать дольше предела\n' > "$TF_STEP/docs/tasks/RT-1-x/progress.md"
got="$(tf_step --done)"
report "step: SC-AK-1408 — step --done меряет оба [x] и выходит с кодом 1" \
    "$(printf '%s' "$got" | tr '\n' '#')" '1.1 ожидалось `один` · получено один · совпало#1.2 ожидалось `три` · получено два · не совпало#steps re-measured 2, matched 1 code=1'
report "step: SC-AK-1408 — метка шага 1.1 записана заново" "$(test -e "$TF_MARK/1.1.json" && echo есть || echo нет)" 'есть'

# SC-AK-1702, SC-AK-1736 — шаг отмечает сам движок; несовпавший шаг ход работы не трогает
TF_PROGRESS="$TF_STEP/docs/tasks/RT-1-x/progress.md"
printf '# Ход работы\n\n## Шаги\n\n- [>] 1.1 Совпасть\n- [ ] 1.2 Не совпасть\n' > "$TF_PROGRESS"
tf_step 1.1 >/dev/null
report "step: SC-AK-1702 — совпавший шаг отмечен [x], следующий стал текущим" \
    "$(grep -E '^- \[.\] 1\.[12]' "$TF_PROGRESS" | tr '\n' '#')" '- [x] 1.1 Совпасть#- [>] 1.2 Не совпасть#'
report "step: SC-AK-1702 — метка шага записана" "$(test -e "$TF_MARK/1.1.json" && echo есть || echo нет)" 'есть'
before="$(cat "$TF_PROGRESS")"
tf_step 1.2 >/dev/null
report "step: SC-AK-1736 — несовпавший шаг оставляет ход работы как был" "$([ "$before" = "$(cat "$TF_PROGRESS")" ] && echo тот же || echo другой)" 'тот же'
report "step: SC-AK-1736 — метки несовпавшего шага нет" "$(test -e "$TF_MARK/1.2.json" && echo есть || echo нет)" 'нет'

# SC-AK-1726 — разбор правлен после коммита плана: step отказывает, шаг не отмечен
printf 'два\n' > "$TF_STEP/docs/tasks/RT-1-x/grill.md"
printf '# Ход работы\n\n## Шаги\n\n- [>] 1.1 Совпасть\n' > "$TF_PROGRESS"
report "step: SC-AK-1726 — разбор изменён после плана — отказ" "$(tf_step 1.1 | grep -c 'differs from the commit of the plan.* code=1')" 1
report "step: SC-AK-1726 — шаг остался неотмеченным" "$(grep -c '^- \[x\] 1.1' "$TF_PROGRESS")" 0
printf 'один\n' > "$TF_STEP/docs/tasks/RT-1-x/grill.md"

TF_HOME="$TF_DIR/records-home"
TF_REC="$TF_HOME/$(printf '%s' "$(cd "$TF_STEP" && pwd -P)" | sed 's#[/.]#-#g')"
mkdir -p "$TF_REC"
printf '# Ход работы\n\n## Шаги\n\n- [x] 1.1 Совпасть\n- [>] 1.2 Не совпасть\n\n## Decisions along the way\n\n- **Check of step 1.2 replaced:** `echo три` → `три`\n' > "$TF_PROGRESS"
(cd "$TF_STEP" && RT_FLOW_RECORDS_HOME="$TF_HOME" RT_FLOW_TRANSCRIPT=/nonexistent node "$TESTS/../assets/checks/task-flow-script.mjs" step 1.2 >/dev/null 2>&1)

# SC-AK-1729 — метки по ветке общие для копий: несовпавший перемер снимает метку для всех
printf '{"matched":true}\n' > "$TF_MARK/1.2.json"
printf '# Ход работы\n\n## Шаги\n\n- [x] 1.1 Совпасть\n- [>] 1.2 Не совпасть\n' > "$TF_PROGRESS"
tf_step 1.2 >/dev/null
report "step: SC-AK-1729 — несовпавший перемер снял метку ветки" "$(test -e "$TF_MARK/1.2.json" && echo есть || echo нет)" 'нет'

# SC-AK-1794 — из двух замен одного шага при отметке побеждает поздняя
printf '# Ход работы\n\n## Шаги\n\n- [x] 1.1 Совпасть\n- [>] 1.2 Не совпасть\n\n## Decisions along the way\n\n- **Check of step 1.2 replaced:** `echo три` → `три`\n- **Check of step 1.2 replaced:** `echo два` → `три`\n' > "$TF_PROGRESS"
tf_step 1.2 >/dev/null
report "step: SC-AK-1794 — две замены шага — отметку решает поздняя" "$(grep -c '^- \[x\] 1.2' "$TF_PROGRESS")" 0
printf '# Ход работы\n\n## Шаги\n\n- [x] 1.1 Совпасть\n- [>] 1.2 Не совпасть\n' > "$TF_PROGRESS"

# SC-AK-1506 — форма ожидаемого, добавленная в описание, принимается step без правки движка
mkdir -p "$TF_DIR/kit"
cp -R "$TESTS/../assets/task-flow" "$TF_DIR/kit/task-flow"
cp "$TESTS/../assets/checks/work-steps-lib.mjs" "$TESTS/../assets/checks/record-count.mjs" "$TF_DIR/kit/"
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
# Запись разговора лежит в каталоге записей копии: другая запись одобрения не даёт.
TF_RED_HOME="$TF_DIR/red-records"
TF_REC="$TF_RED_HOME/$(printf '%s' "$(cd "$TF_RED" && pwd -P)" | sed 's#[/.]#-#g')/record.jsonl"
mkdir -p "$(dirname "$TF_REC")"
# Запись разговора: две роли, затем ответ меню с uuid a1; $1 — ответ.
tf_record() {
    {
        printf '%s\n' '{"type":"assistant","message":{"content":[{"type":"tool_use","name":"Agent","input":{"subagent_type":"product-strategist"}}]}}'
        printf '%s\n' '{"type":"assistant","message":{"content":[{"type":"tool_use","name":"Agent","input":{"subagent_type":"goal-critic"}}]}}'
        printf '{"type":"user","uuid":"a1","message":{"content":[{"type":"tool_result","content":"answered"}]},"toolUseResult":{"answers":{"Одобряешь план?":"%s"}}}\n' "$1"
    } > "$TF_REC"
}
tf_red() {
    local out code
    out="$(cd "$TF_RED" && RT_FLOW_RECORDS_HOME="$TF_RED_HOME" RT_FLOW_TRANSCRIPT="${1:-$TF_REC}" node "$TESTS/../assets/checks/task-flow-script.mjs" plan-red 2>&1)"
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
# SC-AK-1751 — на коммите плана с чистым деревом проверки идут на месте
report "plan: SC-AK-1751 — HEAD на коммите плана, отслеживаемое не тронуто — проверки на месте" \
    "$(printf '%s' "$got" | grep -c '^plan-red: the checks run in place, at the plan commit$')" 1
report "plan: SC-AK-1411 — метка несёт ответ, место ответа и красный вывод каждого шага" \
    "$(node -e "const m=require('$TF_APPROVAL');console.log([m.answer, Object.keys(m.red).join(','), m.fingerprint.length, m.place.uuid, m.place.record === '$TF_REC'].join(' '))" 2>&1)" 'Одобряю план RT-2 (Recommended) 1.1,1.2 16 a1 true'

# SC-AK-1738 — план в работе одобряется заново по красному выводу своей метки
printf 'готово\n' > "$TF_RED/out.txt"
node -e "const f='$TF_APPROVAL',fs=require('fs'),m=JSON.parse(fs.readFileSync(f));delete m.place;fs.writeFileSync(f,JSON.stringify(m))"
tf_record 'Одобряю plan.md RT-2 (Recommended)'
got="$(tf_red)"
report "plan: SC-AK-1738 — проверки не гоняются, метка с местом записана" \
    "$(printf '%s' "$got" | grep -cE 'no check runs|approval mark is written.* code=0$|green before the work')" 2
report "plan: SC-AK-1738 — красный вывод прежней метки сохранён, место новое" \
    "$(node -e "const m=require('$TF_APPROVAL');console.log([m.red['1.1'].startsWith('exit '), m.place.uuid].join(' '))" 2>&1)" 'true a1'
node -e "const f='$TF_APPROVAL',fs=require('fs'),m=JSON.parse(fs.readFileSync(f));m.plan='other';fs.writeFileSync(f,JSON.stringify(m))"
# Работа ушла в коммит после плана: на текущем дереве обе проверки зелёные.
(cd "$TF_RED" && git add out.txt && "${TF_G[@]}" commit -q -m work)
TF_TMP="$TF_DIR/plan-tmp"
mkdir -p "$TF_TMP"
got="$(TMPDIR="$TF_TMP" tf_red)"
report "plan: SC-AK-1738 — метка другого коммита — проверки гоняются на дереве коммита плана, метка записана" \
    "$(printf '%s' "$got" | grep -cE 'approval mark is written.* code=0$')" 1
# SC-AK-1749 — пересобранный план меряется на дереве своего коммита и получает метку
report "plan: SC-AK-1749 — за коммитом плана проверки идут во временной копии и красные" \
    "$(printf '%s' "$got" | grep -cE '^plan-red: the checks run on the tree of the plan commit [0-9a-f]{9}, in a temporary worktree$|^1\.[12] red')" 3
report "plan: SC-AK-1749 — после прогона копии нет ни в git, ни на диске" \
    "$(cd "$TF_RED" && git worktree list | wc -l | tr -d ' ')/$(find "$TF_TMP" -mindepth 1 | wc -l | tr -d ' ')" '1/0'
# SC-AK-1750 — копию не сделать — отказ с причиной, проверки не идут
rm -f "$TF_APPROVAL"
got="$(TMPDIR="$TF_DIR/no-such-dir" tf_red)"
report "plan: SC-AK-1750 — каталог для копии не создаётся — отказ с причиной, без метки" \
    "$(printf '%s' "$got" | grep -cE 'the tree of the plan commit could not be made: .+; no check runs, no mark code=1$')/$(printf '%s' "$got" | grep -c '^1\.')/$(test -e "$TF_APPROVAL" && echo есть || echo нет)" '1/0/нет'
(cd "$TF_RED" && git reset -q HEAD~1)
rm -f "$TF_RED/out.txt"
printf '%s\n' '{"type":"user","uuid":"a1","toolUseResult":{"answers":{"Одобряешь?":"Одобряю план RT-2"}}}' > "$TF_DIR/outside.jsonl"
report "plan: SC-AK-1411 — запись вне каталогов записей метки не даёт" "$(tf_red "$TF_DIR/outside.jsonl" | grep -c 'not a session record of this repository.* code=1')" 1
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
report "plan: SC-AK-1413 — замена старой формы с цитатой меряется" "$got" 'ожидалось `готово` · получено готово · совпало code=0'
# SC-AK-1743 — замена без цитаты меряется: строку пропустило окно владельца на правке
printf '# Ход работы\n\n## Шаги\n\n- [>] 1.1 Написать файл\n- [ ] 1.2 Посчитать строки\n\n## Решения по ходу\n\n- **Проверка шага 1.1 заменена:** `echo готово` → `готово`\n' > "$TF_RED/docs/tasks/RT-2-red/progress.md"
printf '%s\n' '{"type":"user","message":{"content":"продолжай"}}' > "$TF_REC"
got="$(cd "$TF_RED" && RT_FLOW_TRANSCRIPT="$TF_REC" node "$TESTS/../assets/checks/task-flow-script.mjs" step 1.1 2>&1 | tr '\n' ' '; printf 'code=%s' "${PIPESTATUS[0]}")"
report "plan: SC-AK-1743 — замена без цитаты меряется, записей владельца не читает" "$got" 'ожидалось `готово` · получено готово · совпало code=0'

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

# --- Перемер перед PR: step --done --pr ---------------------------------------------------------
(
    cd "$TF_DIR" || exit 1
    git -c init.defaultBranch=main init -q pr-repo
    cd pr-repo || exit 1
    printf 'tracked\n' > tracked.txt
    git add tracked.txt && "${TF_G[@]}" commit -q -m start
    git update-ref refs/remotes/origin/main HEAD
    git checkout -q -b RT-2-pr
    mkdir -p docs/tasks/RT-2-pr
    cat > docs/tasks/RT-2-pr/plan.md <<'PLAN'
# Plan

## Stages

### 1. Первый

- **Steps:**
    1. Совпасть
       Check: `cat docs/tasks/RT-2-pr/probe.txt` → `один`
    2. Совпасть тоже
       Check: `echo два` → `два`
    3. Испортить файл
       Check: `echo x >> tracked.txt; echo ок` → `ок`
    4. Сходить в сеть
       Check: `echo 'curl: (6) Could not resolve host: example.invalid' >&2; exit 6` → exit 0
    5. Ждать дольше предела
       Check: `sleep 5` → exit 0
    6. Не запуститься
       Check: `no-such-command-anywhere` → exit 0
- **Readiness sign:** шаги измерены
PLAN
    printf 'один\n' > docs/tasks/RT-2-pr/probe.txt
    printf '# Ход работы\n\n## Шаги\n\n- [x] 1.1 Совпасть\n- [x] 1.2 Совпасть тоже\n- [ ] 1.3 Испортить файл\n' > docs/tasks/RT-2-pr/progress.md
    git add -A && "${TF_G[@]}" commit -q -m plan
)
TF_PR="$TF_DIR/pr-repo"
TF_PRP="$TF_PR/docs/tasks/RT-2-pr/progress.md"
tf_pr() {
    local out code
    out="$(cd "$TF_PR" && RT_FLOW_STEP_LIMIT_MS=1500 node "$TESTS/../assets/checks/task-flow-script.mjs" step --done --pr 2>&1)"
    code=$?
    printf '%s code=%s' "$out" "$code"
}
tf_pr_progress() { printf '# Ход работы\n\n## Шаги\n\n%s\n' "$1" > "$TF_PRP"; (cd "$TF_PR" && git add -A && "${TF_G[@]}" commit -q -m "progress"); }

report "pr: SC-AK-1732 — все сделанные шаги совпали — PR открывается" "$(tf_pr | grep -c 'matched 2 code=0')" 1

# Метка и [x], записанные мимо движка: перемер не верит метке.
mkdir -p "$TF_PR/.git/rt-kit/steps/RT-2-pr" && printf '{"matched":true}\n' > "$TF_PR/.git/rt-kit/steps/RT-2-pr/1.4.json"
tf_pr_progress '- [x] 1.1 Совпасть
- [x] 1.4 Сходить в сеть'
got="$(tf_pr)"
report "pr: SC-AK-1731 — [x] и метка мимо движка — PR отказан" "$(printf '%s' "$got" | grep -c 'matched 1 code=1')" 1
report "pr: SC-AK-1725 — сеть названа причиной" "$(printf '%s' "$got" | grep -c '^1.4 .*the cause is the network')" 1

tf_pr_progress '- [x] 1.5 Ждать дольше предела
- [x] 1.6 Не запуститься'
got="$(tf_pr)"
report "pr: SC-AK-1704 — шаг дольше предела — PR отказан" "$(printf '%s' "$got" | grep -c '^1.5 .*ran out · не совпало')" 1
report "pr: SC-AK-1705 — команда проверки не запускается — PR отказан" "$(printf '%s' "$got" | grep -c '^1.6 .*exit 127.*не совпало')" 1
report "pr: SC-AK-1706 — отказ называет каждый несовпавший шаг" "$(printf '%s' "$got" | grep -cE '^1\.[56] ожидалось .* · получено .* · не совпало')" 2

tf_pr_progress '- [x] 1.3 Испортить файл'
got="$(tf_pr)"
report "pr: SC-AK-1724 — проверка изменила файл истории — не совпало" "$(printf '%s' "$got" | grep -c 'changed tracked files.*tracked.txt')" 1
(cd "$TF_PR" && git checkout -q -- tracked.txt)

tf_pr_progress '- [x] 1.2 Совпасть тоже

## Decisions along the way

- **Check of step 1.2 replaced:** `echo три` → `три` · the owner'"'"'s word: «замени проверку 1.2 на три»'
printf '%s\n' '{"type":"user","uuid":"u9","message":{"role":"user","content":"замени проверку 1.2 на три"}}' > "$TF_DIR/pr-record.jsonl"
report "pr: SC-AK-1707 — перемер берёт заменённую проверку" \
    "$(cd "$TF_PR" && RT_FLOW_TRANSCRIPT="$TF_DIR/pr-record.jsonl" node "$TESTS/../assets/checks/task-flow-script.mjs" step --done --pr 2>&1 | grep -c '^1.2 ожидалось `три` · получено три · совпало')" 1

tf_pr_progress '- [x] 1.1 Совпасть'
(cd "$TF_PR" && git rm -q -r docs/tasks/RT-2-pr && "${TF_G[@]}" commit -q -m "folder taken apart")
got="$(tf_pr)"
report "pr: SC-AK-1733 — разобранная папка поднята из истории, шаг совпал" "$(printf '%s' "$got" | grep -c 'matched 1 code=0')" 1
report "pr: SC-AK-1733 — после перемера папки снова нет" "$(test -d "$TF_PR/docs/tasks/RT-2-pr" && echo есть || echo нет)" 'нет'

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
got="$(tf_wr_run wr-early-gone "$(printf '%s%s' "$WR_OPEN" "$(printf "$WR_ONE")")" "$(printf "$WR_HEAD")")"
report "pr: SC-AK-1794 — замена ранней версии, снятая к отметке, не возвращается" "$(printf '%s' "$got" | tr '\n' ' ' | grep -c 'matched 0 code=1')" 1
got="$(tf_wr_run wr-early-later "$(printf '%s- **Check of step 1.1 replaced:** `echo 7` → = 1\n' "$WR_OPEN")" "$(printf "$WR_HEAD$WR_ONE")")"
report "pr: SC-AK-1794 — замена ранней версии заменена поздней другого коммита" "$(printf '%s' "$got" | tr '\n' ' ' | grep -c 'matched 1 code=0')" 1

# SC-AK-1740 — перемер идёт на node, закреплённом в .nvmrc дерева
TF_NVM="$TF_DIR/nvm"
mkdir -p "$TF_NVM/versions/node/v99.1.0/bin" "$TF_DIR/pinned-tree"
printf '#!/usr/bin/env bash\necho "pinned node"\nexit 1\n' > "$TF_NVM/versions/node/v99.1.0/bin/node"
chmod +x "$TF_NVM/versions/node/v99.1.0/bin/node"
printf 'v99.1.0\n' > "$TF_DIR/pinned-tree/.nvmrc"
got="$(
    unmet() { printf '%s %s\n' "$1" "$3"; }
    rt_hooks_dir="$TESTS/../assets/hooks" root="$TF_DIR/pinned-tree" NVM_DIR="$TF_NVM"
    . "$TESTS/../assets/hooks/git-guard-delivery-rerun.sh"
    rt_delivery_rerun
)"
report "pr: SC-AK-1740 — перемер зовёт node из .nvmrc дерева" "$(printf '%s' "$got" | grep -c 'pinned node')" 1
printf 'v99.0.5\n' > "$TF_DIR/pinned-tree/.nvmrc"
got="$(
    unmet() { printf '%s %s\n' "$1" "$3"; }
    rt_hooks_dir="$TESTS/../assets/hooks" root="$TF_DIR/pinned-tree" NVM_DIR="$TF_NVM"
    . "$TESTS/../assets/hooks/git-guard-delivery-rerun.sh"
    rt_delivery_rerun
)"
report "pr: SC-AK-1740 — без точной версии перемер берёт более новую той же главной" "$(printf '%s' "$got" | grep -c 'pinned node')" 1
rm "$TF_DIR/pinned-tree/.nvmrc"
got="$(
    unmet() { printf '%s %s\n' "$1" "$3"; }
    rt_hooks_dir="$TESTS/../assets/hooks" root="$TF_DIR/pinned-tree" NVM_DIR="$TF_NVM"
    . "$TESTS/../assets/hooks/git-guard-delivery-rerun.sh"
    rt_delivery_rerun
)"
report "pr: SC-AK-1740 — без .nvmrc остаётся node сессии" "$(printf '%s' "$got" | grep -c 'pinned node')" 0

if [ -n "${TF_ALONE:-}" ]; then
    rm -rf "$TF_DIR"
    suite_result "сценарий task flow: шаг плана и одобрение"
fi
