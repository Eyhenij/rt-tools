#!/usr/bin/env bash
# Сценарии стража хода работы: сценарий движется измерением, а не объявлением.
#
# Страж зовёт движок `task-flow-script.mjs guard` и отказывает правкам, которые двигают сценарий
# мимо измерения. Каждый случай раздела «Обязательные случаи» плана задачи стоит здесь строкой
# `<группа>: SC-AK-NNNN — …`: группа — префикс строки, по нему случаи считает проверка шага.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "страж хода работы"

GUARD=flow-step-guard.sh
TMPS=()
cleanup() { rm -rf "${TMPS[@]}"; }
trap cleanup EXIT

# Дерево задачи на ветке: план с проверками, ход работы, коммит плана. Довод — имя ветки.
task_repo() {
    local repo="$(fixture_repo_branched main "$1")" folder="docs/tasks/$1"
    TMPS+=("$repo")
    fixture_commit "$repo" "$folder/plan.md" "$(plan_text "${2:-checks}")" "docs: план"
    mkdir -p "$repo/docs/plans"
    printf '%s' "$repo"
}

# План с двумя шагами одного этапа; `bare` — без строк проверки, `edits <путь>` — со строкой следа.
plan_text() {
    printf '# План\n\n## Task footprint\n\n| Layer | What |\n| --- | --- |\n'
    [ "$1" = edits ] && printf '| Code (правится) | `%s` |\n' "$2"
    printf '\n## Stages\n\n### 1. Этап\n\n- **Шаги:**\n    1. Первый шаг\n'
    [ "$1" = bare ] || printf '       Проверка: `true` → exit 0\n'
    printf '    2. Второй шаг\n'
    [ "$1" = bare ] || printf '       Проверка: `true` → exit 0\n'
}

progress_text() {
    printf '# Ход работы\n\n## Где мы\n\n- **State:** `%s`\n\n## Шаги\n\n- [%s] 1.1 Первый шаг\n- [%s] 1.2 Второй шаг\n' "$1" "$2" "$3"
}

# Вход правки: инструмент, путь, старая и новая строка (для Write — содержимое), каталог, запись.
edit_input() {
    jq -n --arg t "$1" --arg f "$2" --arg o "$3" --arg n "$4" --arg d "$5" --arg r "${6:-}" '
        {session_id:"tests",tool_name:$t,cwd:$d,transcript_path:$r,
         tool_input:(if $t == "Write" then {file_path:$f,content:$n} else {file_path:$f,old_string:$o,new_string:$n} end)}'
}
shell_input() {
    jq -n --arg c "$1" --arg d "$2" --arg r "${3:-}" '{session_id:"tests",tool_name:"Bash",cwd:$d,transcript_path:$r,tool_input:{command:$c}}'
}

# Запись разговора с последним словом владельца: набранное сообщение или выбранный вариант меню.
said() {
    local file="$(mktemp)"
    TMPS+=("$file")
    jq -cn --arg t "$1" '{type:"user",message:{role:"user",content:$t}}' > "$file"
    printf '%s' "$file"
}
chose() {
    local file="$(mktemp)"
    TMPS+=("$file")
    jq -cn --arg t "$1" '{type:"user",message:{role:"user",content:[{type:"tool_result",tool_use_id:"x",content:"answered"}]},toolUseResult:{answers:{"Что делаем?":$t}}}' > "$file"
    printf '%s' "$file"
}

# Зелёная метка шага: её пишет только движок, набор кладёт её как готовую.
green_mark() { mkdir -p "$1/.git/rt-kit/steps/$2" && printf '{"matched":true}\n' > "$1/.git/rt-kit/steps/$2/$3.json"; }
approve() { mkdir -p "$1/.git/rt-kit/approval" && printf '{"answer":"Одобряю план"}\n' > "$1/.git/rt-kit/approval/$2.json"; }

d() { expect_decision "$1" "$GUARD" "$2" "$3"; }

# --- guard: отметки хода работы --------------------------------------------------------------
B=RT-7-probe
R="$(task_repo "$B")"
P="$R/docs/tasks/$B/progress.md"
progress_text 'этап-идёт' '>' ' ' > "$P"

d "guard: SC-AK-1414 — [x] без метки отказан" "$(edit_input Edit "$P" '- [>] 1.1' '- [x] 1.1' "$R")" deny
expect_reason "guard: SC-AK-1414 — отказ называет команду шага" "$GUARD" "$(edit_input Edit "$P" '- [>] 1.1' '- [x] 1.1' "$R")" 'task-flow-script.mjs step 1.1'
green_mark "$R" "$B" 1.1
d "guard: SC-AK-1414 — [x] с зелёной меткой проходит" "$(edit_input Edit "$P" '- [>] 1.1 Первый шаг
- [ ] 1.2' '- [x] 1.1 Первый шаг
- [>] 1.2' "$R")" PASS

progress_text 'этап-идёт' ' ' ' ' > "$P"
d "guard: SC-AK-1415 — [x] после неготового шага отказан" "$(edit_input Edit "$P" '- [ ] 1.2' '- [x] 1.2' "$R")" deny
d "guard: SC-AK-1415 — [>] после неготового шага отказан" "$(edit_input Edit "$P" '- [ ] 1.2' '- [>] 1.2' "$R")" deny
d "guard: SC-AK-1415 — [>] на первом неготовом проходит" "$(edit_input Edit "$P" '- [ ] 1.1' '- [>] 1.1' "$R")" PASS

# Ветка без разбора меряется первым состоянием: объявить её работу этапом нельзя.
progress_text 'просьба-не-разобрана' '>' ' ' > "$P"
d "guard: SC-AK-1416 — State впереди измеренного отказан" "$(edit_input Edit "$P" '`просьба-не-разобрана`' '`этап-идёт`' "$R")" deny
d "guard: SC-AK-1416 — State на измеренном проходит" "$(edit_input Write "$P" '' "$(progress_text 'просьба-не-разобрана' ' ' ' ')" "$R")" PASS

d "guard: SC-AK-1417 — дозапись оболочкой в progress.md отказана" "$(shell_input "printf 'x' >> docs/tasks/$B/progress.md" "$R")" deny
d "guard: SC-AK-1417 — sed -i по plan.md отказан" "$(shell_input "sed -i '' 's/a/b/' docs/tasks/$B/plan.md" "$R")" deny
d "guard: SC-AK-1417 — чтение progress.md проходит" "$(shell_input "grep -n '\\[x\\]' docs/tasks/$B/progress.md" "$R")" PASS

d "guard: SC-AK-1418 — запись оболочкой в каталог меток отказана" "$(shell_input "echo '{}' > .git/rt-kit/steps/$B/1.2.json" "$R")" deny
d "guard: SC-AK-1418 — вызов движка пишет метку законно" "$(shell_input "node tools/task-flow-script.mjs step 1.2" "$R")" PASS

d "guard: SC-AK-1419 — Write в каталог меток отказан" "$(edit_input Write "$R/.git/rt-kit/steps/$B/1.2.json" '' '{"matched":true}' "$R")" deny
d "guard: SC-AK-1419 — Edit в каталоге меток отказан" "$(edit_input Edit "$R/.git/rt-kit/approval/$B.json" 'a' 'b' "$R")" deny

d "guard: SC-AK-1420 — запись оболочкой в план эпика отказана" "$(shell_input "printf 'x' >> docs/plans/epic.md" "$R")" deny

# --- legacy: планы, которые движок не мерил ----------------------------------------------------
B2=RT-8-bare
R2="$(task_repo "$B2" bare)"
P2="$R2/docs/tasks/$B2/progress.md"
progress_text 'этап-идёт' '>' ' ' > "$P2"
d "legacy: SC-AK-1421 — [x] у плана без строк проверки проходит" "$(edit_input Edit "$P2" '- [>] 1.1 Первый шаг
- [ ] 1.2' '- [x] 1.1 Первый шаг
- [>] 1.2' "$R2")" PASS

B3=RT-3329-task-flow-scenario
R3="$(task_repo "$B3")"
P3="$R3/docs/tasks/$B3/progress.md"
progress_text 'этап-идёт' '>' ' ' > "$P3"
d "legacy: SC-AK-1422 — [x] у плана, добавленного раньше движка, проходит" "$(edit_input Edit "$P3" '- [>] 1.1 Первый шаг
- [ ] 1.2' '- [x] 1.1 Первый шаг
- [>] 1.2' "$R3")" PASS

B4=RT-3330-from-old-base
R4="$(task_repo "$B4")"
P4="$R4/docs/tasks/$B4/progress.md"
progress_text 'этап-идёт' '>' ' ' > "$P4"
d "legacy: SC-AK-1536 — ветка вне legacyBranches судится как новая" "$(edit_input Edit "$P4" '- [>] 1.1' '- [x] 1.1' "$R4")" deny

# --- defer: «отложено» в плане эпика ----------------------------------------------------------
E="$R/docs/plans/epic.md"
printf '# Эпик\n\n| Задача | Состояние |\n| --- | --- |\n| RT-5 | в работе |\n| RT-6 | отложено |\n' > "$E"
d "defer: SC-AK-1423 — «отложено» без слова владельца отказано" "$(edit_input Edit "$E" '| RT-5 | в работе |' '| RT-5 | отложено |' "$R" "$(said 'ок')")" deny
d "defer: SC-AK-1424 — последнее слово владельца с номером задачи разрешает" "$(edit_input Edit "$E" '| RT-5 | в работе |' '| RT-5 | отложено |' "$R" "$(said 'отложи RT-5')")" PASS
d "defer: SC-AK-1425 — слово владельца без номера не разрешает" "$(edit_input Edit "$E" '| RT-5 | в работе |' '| RT-5 | отложено |' "$R" "$(said 'отложи эту задачу')")" deny
d "defer: SC-AK-1426 — снятие «отложено» по слову владельца" "$(edit_input Edit "$E" '| RT-6 | отложено |' '| RT-6 | в работе |' "$R" "$(said 'верни RT-6 в работу')")" PASS
d "defer: SC-AK-1426 — снятие без слова владельца отказано" "$(edit_input Edit "$E" '| RT-6 | отложено |' '| RT-6 | в работе |' "$R" "$(said 'дальше')")" deny

# --- protect: описание task flow и его надстройка ---------------------------------------------
# Надстройка фикстуры не собирается: `nudge` в описании — образец строкой, а здесь список. Движок
# с ней не строит модель, и страж судит по описанию пакета — так случаи ниже заодно показывают,
# что сломанная надстройка не снимает стража, который её охраняет.
O="$R/.claude/rt-kit/overrides/task-flow/flow.js"
mkdir -p "$(dirname "$O")"
printf "({\n  words: {\n    nudge: ['ну что'],\n  },\n})\n" > "$O"
d "protect: SC-AK-1521 — правка надстройки без слова владельца с её ключом отказана" "$(edit_input Edit "$O" "    nudge: ['ну что']," "    nudge: ['ну что', 'как там']," "$R" "$(said 'добавь подталкивание')")" deny
d "protect: SC-AK-1522 — последнее слово владельца называет ключ — правка проходит" "$(edit_input Edit "$O" "    nudge: ['ну что']," "    nudge: ['ну что', 'как там']," "$R" "$(said 'добавь в nudge «как там»')")" PASS
d "protect: SC-AK-1523 — null с причиной, которой нет в словах владельца, отказан" "$(edit_input Edit "$O" "    nudge: ['ну что']," "    nudge: null,
    reason: 'не нужно'," "$R" "$(said 'убери nudge')")" deny
d "protect: SC-AK-1531 — подпись варианта меню, который называет ключ, засчитывается словом владельца" "$(edit_input Edit "$O" "    nudge: ['ну что']," "    nudge: ['ну что', 'как там']," "$R" "$(chose 'Добавить «как там» в nudge (Recommended)')")" PASS

F="$R/projects/agent-kit/assets/task-flow/flow.js"
mkdir -p "$(dirname "$F")" "$R/tools/task-flow"
printf '({})\n' > "$F"
d "protect: SC-AK-1524 — правка flow.js вне задачи с этим следом отказана" "$(edit_input Edit "$F" '({})' '({ })' "$R")" deny
d "protect: SC-AK-1532 — правка разложенного tools/task-flow/ отказана тем же стражем" "$(edit_input Write "$R/tools/task-flow/flow.js" '' '({})' "$R")" deny
d "protect: SC-AK-1526 — запись оболочкой в описание отказана" "$(shell_input "printf '({})' > projects/agent-kit/assets/task-flow/flow.js" "$R")" deny

B5=RT-9-edits-flow
R5="$(fixture_repo_branched main "$B5")"
TMPS+=("$R5")
fixture_commit "$R5" "docs/tasks/$B5/plan.md" "$(plan_text edits projects/agent-kit/assets/task-flow/)" "docs: план"
F5="$R5/projects/agent-kit/assets/task-flow/flow.js"
mkdir -p "$(dirname "$F5")"
printf '({})\n' > "$F5"
d "protect: SC-AK-1525 — неодобренный план со строкой «(правится)» правку не пропускает" "$(edit_input Edit "$F5" '({})' '({ })' "$R5")" deny
approve "$R5" "$B5"
d "protect: SC-AK-1525 — в задаче, чей одобренный план называет путь в строке «(правится)», правка проходит" "$(edit_input Edit "$F5" '({})' '({ })' "$R5")" PASS
d "protect: SC-AK-1526 — запись оболочкой судится теми же условиями" "$(shell_input "printf '({})' > projects/agent-kit/assets/task-flow/flow.js" "$R5")" PASS

# Строка следа перечисляет файлы одного каталога голыми именами: имя засчитывается по последней части пути.
B7=RT-10-bare-name
R7="$(fixture_repo_branched main "$B7")"
TMPS+=("$R7")
fixture_commit "$R7" "docs/tasks/$B7/plan.md" "$(plan_text edits flow.js)" "docs: план"
approve "$R7" "$B7"
F7="$R7/projects/agent-kit/assets/task-flow/flow.js"
mkdir -p "$(dirname "$F7")"
printf '({})\n' > "$F7"
d "protect: SC-AK-1525 — голое имя файла в строке «(правится)» называет путь" "$(edit_input Edit "$F7" '({})' '({ })' "$R7")" PASS
d "protect: SC-AK-1525 — голое имя не называет другой файл" "$(edit_input Write "$R7/projects/agent-kit/assets/task-flow/measure/x.mjs" '' 'x' "$R7")" deny

R6="$(fixture_repo_branched main "$B3")"
TMPS+=("$R6")
fixture_commit "$R6" "docs/tasks/$B3/plan.md" "$(plan_text edits projects/agent-kit/assets/task-flow/)" "docs: план"
F6="$R6/projects/agent-kit/assets/task-flow/flow.js"
mkdir -p "$(dirname "$F6")"
printf '({})\n' > "$F6"
d "protect: SC-AK-1530 — план, добавленный раньше движка, со строкой «(правится)» на этот путь — правка проходит" "$(edit_input Edit "$F6" '({})' '({ })' "$R6")" PASS

# --- ход, названный отказом, спрошен у соседних проверок ----------------------------------------
# Отказ записи оболочкой называет правку хода работы, а её держит гейт, пока правило задач не
# загружено: слово о правиле стоит перед вердиктом движка.
mkdir -p "$R/.claude/skills/task-flow"
printf -- '---\nname: task-flow\nkind: rule\n---\n' > "$R/.claude/skills/task-flow/SKILL.md"
gate_session_reset
CLAUDE_PROJECT_DIR="$R" expect_reason "правку хода работы держит гейт — отказ называет правило" "$GUARD" \
    "$(shell_input "printf 'x' >> docs/tasks/$B/progress.md" "$R")" 'load the rule «task-flow» by the tool Skill first. Then: the progress'
gate_session_load task-flow
CLAUDE_PROJECT_DIR="$R" expect_no_reason "правило загружено — назван один вердикт" "$GUARD" \
    "$(shell_input "printf 'x' >> docs/tasks/$B/progress.md" "$R")" 'held by the rules gate'
gate_session_cleanup
unset TMPDIR
rm -rf "$R/.claude/skills/task-flow"

# --- чужие правки страж не судит ---------------------------------------------------------------
d "обычный файл правится без стража" "$(edit_input Edit "$R/README.md" 'a' 'b' "$R")" PASS
d "обычная команда проходит" "$(shell_input "git status --short" "$R")" PASS

suite_result "страж хода работы"
