#!/usr/bin/env bash
# Сценарии остановки в конце эпика: что считается взятием работы и когда проверка спрашивает
# владельца окном.
#
# Состояние эпика спрашивается двойником команды: набор судит гард, а не очередь работ дерева, в
# котором его запустили.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гарды: остановка в конце эпика"

STOP_TREE="$(mktemp -d)"
mkdir -p "$STOP_TREE/tools" "$STOP_TREE/.claude"
git -C "$STOP_TREE" init -q 2>/dev/null
printf '%s\n' '{"layout":{"checks":"tools"}}' > "$STOP_TREE/.claude/rt-kit.json"

# Двойник команды: печатает то, что положил сценарий, и отвечает названным кодом.
cat > "$STOP_TREE/tools/epic-table.mjs" <<'STUB'
const left = process.env.STUB_LEFT ?? '';
const code = Number(process.env.STUB_CODE ?? '0');
if (left !== '') {
    process.stdout.write(`${left}\n`);
}
process.exit(code);
STUB

call() {
    printf '{"tool_name":"Bash","tool_input":{"command":%s}}' "$(printf '%s' "$1" | jq -Rs .)"
}

stop_decision() {
    local label="$1" cmd="$2" want="$3" out got
    out="$(cd "$STOP_TREE" && call "$cmd" | "$HOOKS/epic-stop-guard.sh" 2>/dev/null)"
    if [ -z "$out" ]; then
        got="PASS"
    else
        got="$(printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecision // "deny"' 2>/dev/null)"
    fi
    report "$label" "$got" "$want"
}

stop_reason() {
    local label="$1" cmd="$2" pattern="$3" got
    if (cd "$STOP_TREE" && call "$cmd" | "$HOOKS/epic-stop-guard.sh" 2>/dev/null) \
        | jq -r '.hookSpecificOutput.permissionDecisionReason // ""' 2>/dev/null \
        | grep -qE "$pattern"; then got="есть"; else got="нет"; fi
    report "$label" "$got" "есть"
}

export STUB_LEFT=''
export STUB_CODE=0

# --- SC-AK-979 — взятие работы при кончившемся эпике спрашивает владельца ----------------------
stop_decision "SC-AK-979 — ветка по номеру задачи спрашивает" 'git checkout -b RT-1999-probe main' ask

# --- SC-AK-980 — незаконченная задача эпика пропускает работу --------------------------------
export STUB_LEFT='1947'
stop_decision "SC-AK-980 — незаконченная задача пропускает" 'git checkout -b RT-1999-probe main' PASS
export STUB_LEFT=''

# --- SC-AK-981 — окно называет конец эпика и таблицу -----------------------------------------
stop_reason "SC-AK-981 — названа команда таблицы" 'git checkout -b RT-1999-probe main' 'epic:table'
stop_reason "SC-AK-981 — назван конец эпика" 'git checkout -b RT-1999-probe main' 'The epic is over'

# --- SC-AK-982 — задача судится наравне с веткой, столбец не судится -------------------------
stop_decision "SC-AK-982 — заведение задачи спрашивает" 'npm run task:new -- "Проба"' ask
stop_decision "SC-AK-982 — ветка через switch спрашивает" 'git switch -c RT-1999-probe main' ask
stop_decision "SC-AK-982 — движение столбца в рабочий не судится" 'npm run task:move -- 1999 in-progress' PASS
stop_decision "SC-AK-982 — движение в рецензию не судится" 'npm run task:move -- 1999 in-review' PASS

# --- SC-AK-984 — ветка без номера задачи не судится ------------------------------------------
stop_decision "SC-AK-984 — ветка без номера пропущена" 'git checkout -b probe-without-number main' PASS

# --- SC-AK-985 — недоступный хостинг пропускает работу ---------------------------------------
export STUB_CODE=1
stop_decision "SC-AK-985 — спросить нечем: работа идёт" 'git checkout -b RT-1999-probe main' PASS
export STUB_CODE=0

# --- SC-AK-986 — вызов не о взятии работы не судится -----------------------------------------
stop_decision "SC-AK-986 — коммит не судится" 'git commit -m "проба"' PASS
stop_decision "SC-AK-986 — отправка ветки не судится" 'git push origin RT-1999-probe' PASS
stop_decision "SC-AK-986 — чтение истории не судится" 'git log --oneline -5' PASS
stop_decision "SC-AK-986 — переход на готовую ветку не судится" 'git checkout RT-1999-probe' PASS

# --- SC-AK-987, SC-AK-988 — конец эпика отпускает ход, живой эпик держит --------------------------
# Ход на Stop держит движок task flow: конец эпика — случай отпуска «конец сценария», а при живом
# эпике ход с работой держится, что бы ни стояло в ответе — отданная работа или «жду вашего слова».
# Случаи зовут вердикт движка напрямую: состояние эпика задаёт ответ измерителя.
ES_OUT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && node --input-type=module 2>&1 <<'JS'
import { buildModel } from '../assets/checks/flow-model.mjs';
import { releaseCase } from '../assets/checks/flow-verdict.mjs';

const model = buildModel(new URL('../assets/task-flow/flow.js', import.meta.url).pathname);
const handed = { state: 'работа-отдана', index: 11, reason: null };
const verdict = (finished) => {
    const answers = { 'measure.session.wrote': true, 'measure.epic.finished': finished };
    return releaseCase(model, (name) => answers[name] ?? false, handed) ? 'PASS' : 'BLOCK';
};
console.log(`SC-AK-987 — живой эпик требует следующей задачи|${verdict(false)}|BLOCK`);
console.log(`SC-AK-987 — кончившийся эпик требования снимает|${verdict(true)}|PASS`);
console.log(`SC-AK-988 — при живом эпике объявленная остановка отбита|${verdict(false)}|BLOCK`);
console.log(`SC-AK-988 — при кончившемся эпике остановка законна|${verdict(true)}|PASS`);
JS
)"
while IFS='|' read -r label got want; do
    [ -n "$label" ] || continue
    report "$label" "$got" "$want"
done <<< "$ES_OUT"

# --- SC-AK-1558 — новый эпик берётся через то же окно ----------------------------------------
stop_decision "SC-AK-1558 — карточка нового эпика спрашивает" "npm run task:new -- --epic --title 'Возможность' --slug x" ask
stop_decision "SC-AK-1558 — строка в команде окно не снимает" 'git checkout -b RT-1999-probe main  # Epic-stop-skip: владелец сказал' ask

# --- SC-AK-1559 — проверка не читает запись разговора ----------------------------------------
# Раньше согласие искалось в записи по словам: настоящее «да» другими словами не находилось, а
# постороннее «да» засчитывалось. Теперь запись не читается вовсе — что бы в ней ни стояло.
TURNS="$(mktemp -d)"
turn() {
    local path
    path="$TURNS/turn-$RANDOM.jsonl"
    : > "$path"
    for line in "$@"; do
        printf '%s\n' "$line" >> "$path"
    done
    printf '%s' "$path"
}
said() { jq -c -n --arg t "$1" '{type:"user",message:{content:[{type:"text",text:$t}]}}'; }
answered() { jq -c -n --arg t "$1" '{type:"user",message:{content:[{type:"tool_result",content:$t}]}}'; }
call_in() {
    jq -n --arg c "$1" --arg p "$2" '{tool_name:"Bash",tool_input:{command:$c},transcript_path:$p}'
}
stop_word() {
    local label="$1" cmd="$2" path="$3" want="$4" out got
    out="$(cd "$STOP_TREE" && call_in "$cmd" "$path" | "$HOOKS/epic-stop-guard.sh" 2>/dev/null)"
    if [ -z "$out" ]; then got="PASS"; else got="$(printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecision // "deny"')"; fi
    report "$label" "$got" "$want"
}
stop_word "SC-AK-1559 — ответ меню с номером работы окно не снимает" 'git checkout -b RT-1999-probe main' \
    "$(turn "$(said 'что дальше')" "$(answered 'The user answered: "Что брать дальше?"="Брать эпик RT-1999 (Recommended)"')")" ask
stop_word "SC-AK-1559 — согласие на задачу окно не снимает" 'npm run task:new -- --title "Находки"' \
    "$(turn "$(answered 'The user answered: "Заводить задачу?"="Да, завести задачу"')")" ask
stop_word "SC-AK-1559 — отказ в записи окна не заменяет" 'npm run task:new -- --title "Находки"' \
    "$(turn "$(answered 'The user answered: "Заводить задачу?"="Нет, подожди"')")" ask
rm -rf "$TURNS"

# --- SC-AK-1560 — имя команды в тексте не судится --------------------------------------------
stop_decision "SC-AK-1560 — чтение файла команды не судится" 'sed -n 1,60p tools/task-new.mjs | cut -c1-200' PASS
stop_decision "SC-AK-1560 — тело heredoc не судится" "$(printf 'python3 - <<%s\nrun(\"npm run task:new -- --title x\")\nrun(\"git checkout -b RT-1999-probe main\")\nEOF\n' "'EOF'")" PASS
stop_decision "SC-AK-1560 — сообщение коммита не судится" 'git commit -m "npm run task:new и git checkout -b RT-1999-x"' PASS
stop_decision "SC-AK-1560 — команда после cd спрашивает" 'cd /tmp && npm run -s task:new -- --title x' ask
stop_decision "SC-AK-1560 — команда после присваивания спрашивает" 'GIT_AUTHOR_NAME=x git checkout -b RT-1999-probe main' ask
stop_decision "SC-AK-1560 — запуск скрипта команды спрашивает" 'node tools/task-new.mjs --title x' ask

# --- SC-AK-1561 — окно пишется в журнал отдельно от отказов -----------------------------------
rm -rf "$STOP_TREE/.claude/rt-kit/observations"
(cd "$STOP_TREE" && call 'git checkout -b RT-1999-probe main' | "$HOOKS/epic-stop-guard.sh" >/dev/null 2>&1)
if cat "$STOP_TREE"/.claude/rt-kit/observations/*.jsonl 2>/dev/null | grep -q '"ev":"guard-ask".*"guard":"epic-stop-guard"'; then got="есть"; else got="нет"; fi
report "SC-AK-1561 — окно записано меткой guard-ask" "$got" "есть"

rm -rf "$STOP_TREE"

suite_result "гарды: остановка в конце эпика"
