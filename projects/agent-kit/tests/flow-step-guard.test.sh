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
# Каталоги записей разговоров лежат в своём доме: движок ищет одобрение только в них.
export RT_FLOW_RECORDS_HOME="$(mktemp -d)/.claude/projects"
mkdir -p "$RT_FLOW_RECORDS_HOME"
TMPS+=("${RT_FLOW_RECORDS_HOME%/.claude/projects}")
records_dir() { printf '%s/%s' "$RT_FLOW_RECORDS_HOME" "$(cd "$1" && pwd -P | sed 's#[/.]#-#g')"; }
# Метка одобрения с местом ответа: запись в каталоге записей копии и uuid её записи. Доводы: дерево,
# ветка, ответ на месте (по умолчанию — одобряющий), uuid в метке, путь записи.
approve() {
    local repo="$1" branch="$2" task="${2%%-[a-z]*}" dir rec sha
    local said="${3:-Одобряю план $task}"
    dir="$(records_dir "$repo")"
    mkdir -p "$dir"
    rec="${5:-$dir/session.jsonl}"
    jq -cn --arg t "$said" '{type:"user",uuid:"a1",toolUseResult:{answers:{"Одобряешь?":$t}}}' > "$rec"
    sha="$(git -C "$repo" log --diff-filter=A --format=%H -- "docs/tasks/$branch/plan.md" | tail -1)"
    mkdir -p "$repo/.git/rt-kit/approval"
    jq -cn --arg a "Одобряю план $task" --arg p "$sha" --arg r "$rec" --arg u "${4:-a1}" \
        '{answer:$a,plan:$p,place:{record:$r,uuid:$u}}' > "$repo/.git/rt-kit/approval/$branch.json"
}

d() { expect_decision "$1" "$GUARD" "$2" "$3"; }

# --- guard: отметки хода работы --------------------------------------------------------------
B=RT-7-probe
R="$(task_repo "$B")"
P="$R/docs/tasks/$B/progress.md"
progress_text 'этап-идёт' '>' ' ' > "$P"

d "guard: SC-AK-1414 — [x] рукой отказан" "$(edit_input Edit "$P" '- [>] 1.1' '- [x] 1.1' "$R")" deny
expect_reason "guard: SC-AK-1414 — отказ называет команду шага" "$GUARD" "$(edit_input Edit "$P" '- [>] 1.1' '- [x] 1.1' "$R")" 'task-flow-script.mjs step 1.1'
green_mark "$R" "$B" 1.1
d "guard: SC-AK-1703 — [x] рукой отказан и при зелёной метке на диске" "$(edit_input Edit "$P" '- [>] 1.1 Первый шаг
- [ ] 1.2' '- [x] 1.1 Первый шаг
- [>] 1.2' "$R")" deny
# План без проверок в рабочей копии отказа не снимает: проверки читаются из коммита плана.
cp "$R/docs/tasks/$B/plan.md" "$R/plan.keep"
plan_text bare > "$R/docs/tasks/$B/plan.md"
d "guard: SC-AK-1716 — план без проверок в рабочей копии не снимает отказ" "$(edit_input Edit "$P" '- [>] 1.1' '- [x] 1.1' "$R")" deny
mv "$R/plan.keep" "$R/docs/tasks/$B/plan.md"

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

# --- shell: отказ только на запись в охраняемый файл --------------------------------------------
# Команды взяты из записей 15–21.11 слово в слово, где их отказали; путь записи разговора и путь
# черновика сессии заменены нейтральными. Чтение, запуск движка и имя файла в тексте проходят.
sc() { cat; }
C1="$(sc <<'CMD'
grep -c 'Check of step' docs/tasks/RT-3277-checks-real-record/progress.md; node -e "
const re=/^-\s+\*\*(?:Проверка шага|Check of step)\s+(\d+\.\d+)\s+(?:заменена|replaced):\*\*\s+\`(.+)\`\s+→\s+(.+?)\s+·\s+(?:слово владельца|the owner's word):\s+«(.+)»\s*$/u;
for(const l of require('fs').readFileSync('docs/tasks/RT-3277-checks-real-record/progress.md','utf8').split('\n')){const m=l.match(re);if(m)console.log(m[1],'|',m[3]);}"
CMD
)"
d "shell: SC-AK-1819 — чтение хода работы с разбором в node -e проходит" "$(shell_input "$C1" "$R")" PASS
d "shell: SC-AK-1819 — grep -ln по планам эпиков проходит" "$(shell_input "grep -ln 'RT-3420' docs/plans/*.md; grep -n 'RT-3420' docs/plans/*.md | head -3 | cut -c1-200" "$R")" PASS
d "shell: SC-AK-1819 — запуск движка проходит" "$(shell_input "perl -e 'select(undef,undef,undef,8)'; node tools/task-flow-script.mjs measure 2>&1 | head -2; grep -n 'status' tools/task-flow/source/host.mjs | head -8" "$R")" PASS
C2="$(sc <<'CMD'
node --input-type=module -e "
import { compareExpected } from './tools/flow-data.mjs';
import { readFileSync } from 'node:fs';
const src = readFileSync('projects/agent-kit/assets/task-flow/flow.js','utf8');
const m = src.match(/expect[\s\S]{0,800}/); console.log(m[0].slice(0,700));
"
CMD
)"
d "shell: SC-AK-1819 — импорт файла движка для чтения проходит" "$(shell_input "$C2" "$R")" PASS
d "shell: SC-AK-1819 — git restore --staged плана проходит" "$(shell_input "git reset -q --soft HEAD~1 && git restore --staged docs/tasks/RT-3421-kit-lays-out-model-checks/plan.md && git status --short | head -3; git log --oneline -1" "$R")" PASS
d "shell: SC-AK-1819 — копия шаблона хода работы в черновик проходит" "$(shell_input "cp docs/tasks/_template/progress.md /private/tmp/claude-501/scratchpad/progress-template.md && cat docs/tasks/_template/progress.md" "$R")" PASS
C3="$(sc <<'CMD'
python3 - <<'EOF'
p='docs/specs/agent-kit/decision-table/spec.md'
s=open(p).read()
a='one place per fact. Hook files: 83 before, 87 after —'
assert s.count(a)==1
s=s.replace(a,'one place per fact. The count of hook files: 83 before, 87 after —')
open(p,'w').write(s)
EOF
node tools/task-flow-script.mjs step 6.1 2>&1 | tail -2
CMD
)"
d "shell: SC-AK-1819 — правка другого файла сценарием и запуск движка проходят" "$(shell_input "$C3" "$R")" PASS
C4="$(sc <<'CMD'
export PATH="$HOME/.nvm/versions/node/v22.22.3/bin:$PATH" && git add docs/plans/checks-rework-3.md && git diff --cached --stat && PATH="$HOME/.nvm/versions/node/v22.22.3/bin:$PATH" git commit -q -F - <<'EOF'
docs(rt:agent-kit): план эпика RT-3302 — эпик закрыт, шесть задач отложены в четвёртую часть RT-3471

Слово владельца: «Закрыть эпик сейчас», «Отложить RT-3419, RT-3423, RT-3425, RT-3426, RT-3427,
RT-3434». Задачи 17, 19–21 и RT-3463 влиты.
EOF
git log --oneline -1; export RT_FLOW_TRANSCRIPT=$HOME/.claude/projects/-tree/session.jsonl; timeout 110 node tools/task-flow-script.mjs measure 2>&1 | head -2
CMD
)"
d "shell: SC-AK-1819 — коммит с именами файлов в тексте и путь записи для чтения проходят" "$(shell_input "$C4" "$R")" PASS
C5="$(sc <<'CMD'
node -e "
import('./projects/agent-kit/tests/judge-replay.mjs').then(j=>{const r=j.liveRuns(process.cwd(), require('os').homedir()+'/.claude/projects/-tree'); console.log(JSON.stringify(r,null,0).slice(0,800))})"; ls -la ~/.claude/projects/-tree/session.jsonl | awk '{print $5}'
CMD
)"
d "shell: SC-AK-1819 — чтение записи разговора сценарием проходит" "$(shell_input "$C5" "$R")" PASS
d "shell: SC-AK-1819 — сценарий без вызова записи, назвавший план, проходит" "$(shell_input "python3 -c \"print(open('docs/tasks/$B/plan.md').read()[:200])\"" "$R")" PASS

# Запись буквальным путём отказана, как и прежде: команды из записей, где отказ был верным.
d "shell: SC-AK-1417 — sed -i по ходу работы из записи отказан" "$(shell_input "sed -i '' 's/^- \\*\\*State:\\*\\* \`<name from the state list of rule task-flow>\`/- **State:** \`задача-взята\`/' docs/tasks/RT-3350-workspace-details-single/progress.md; grep -n \"State:\" docs/tasks/RT-3350-workspace-details-single/progress.md" "$R")" deny
d "shell: SC-AK-1417 — git checkout -- плана из записи отказан" "$(shell_input "git checkout -- docs/tasks/RT-3420-menu-without-self-option/plan.md && git status --short | head -3; echo clean" "$R")" deny
d "shell: SC-AK-1417 — rm плана и хода работы из записи отказан" "$(shell_input "rm docs/tasks/RT-3418-flow-engine-stop-refusals/grill.md docs/tasks/RT-3418-flow-engine-stop-refusals/plan.md docs/tasks/RT-3418-flow-engine-stop-refusals/progress.md && ls docs/tasks/RT-3418-flow-engine-stop-refusals/ | wc -l" "$R")" deny
d "shell: SC-AK-1417 — git restore плана в рабочей копии отказан" "$(shell_input "git restore docs/tasks/$B/plan.md" "$R")" deny

# Запись, чья цель — не путь буквой, отказана, когда команда называет охраняемый файл.
C8="$(sc <<'CMD'
node -e "import('./tools/board-task-dirs.mjs').then(async m=>{const fs=await import('node:fs');fs.cpSync('docs/tasks/_template','docs/tasks/RT-3467-ci-watch-after-push',{recursive:true});console.log(m.unstampFolder('docs/tasks/RT-3467-ci-watch-after-push'))})" && ls docs/tasks/RT-3467-ci-watch-after-push && head -3 docs/tasks/RT-3467-ci-watch-after-push/plan.md
CMD
)"
d "shell: SC-AK-1820 — копия шаблона в папку задачи сценарием из записи отказана" "$(shell_input "$C8" "$R")" deny
d "shell: SC-AK-1820 — путь, собранный подстановкой, отказан" "$(shell_input "P=\$(ls docs/tasks/*/progress.md | head -1); sed -i '' 's/a/b/' \"\$P\"" "$R")" deny
d "shell: SC-AK-1820 — путь, собранный в сценарии, отказан" "$(shell_input "python3 -c \"import os; open(os.path.join(os.environ['TASK'], 'progress.md'), 'a').write('x')\"" "$R")" deny
d "shell: SC-AK-1820 — копия в каталог хода работы отказана" "$(shell_input "cp /private/tmp/claude-501/scratchpad/progress.md docs/tasks/$B/" "$R")" deny
d "shell: SC-AK-1820 — копия файла без имени в каталог задачи, назвавшая ход работы, отказана" "$(shell_input "F=\$(ls -t ~/Downloads/*.md | head -1); cp \"\$F\" docs/tasks/$B/ && head -3 docs/tasks/$B/progress.md" "$R")" deny
C6="$(sc <<CMD
python3 - <<'EOF'
p='docs/tasks/$B/progress.md'
s=open(p).read()
open(p,'w').write(s.replace('- [>] 1.1','- [x] 1.1'))
EOF
CMD
)"
d "shell: SC-AK-1820 — сценарий с вызовом записи, назвавший ход работы, отказан" "$(shell_input "$C6" "$R")" deny
C7="$(sc <<'CMD'
cat > /private/tmp/claude-501/scratchpad/w.py <<'EOF'
import sys
open(sys.argv[1], 'w').write('x')
EOF
python3 /private/tmp/claude-501/scratchpad/w.py docs/tasks/RT-7-probe/progress.md
CMD
)"
d "shell: SC-AK-1820 — сценарий, записанный и запущенный одной командой, отказан" "$(shell_input "$C7" "$R")" deny

# Ложные отказы, найденные ревью: запись во временный каталог рядом с именем охраняемого файла.
S0=/private/tmp/claude-501/scratchpad
d "shell: SC-AK-1819 — запись в черновик через переменную и git add хода работы проходят" "$(shell_input "S=$S0; printf 'm' > \$S/c.txt; git add docs/tasks/$B/progress.md" "$R")" PASS
d "shell: SC-AK-1819 — вывод grep по ходу работы в \$TMPDIR проходит" "$(shell_input "grep -n State docs/tasks/$B/progress.md > \"\$TMPDIR/out.txt\"" "$R")" PASS
d "shell: SC-AK-1819 — копия плана в черновик через переменную проходит" "$(shell_input "S=$S0; cp docs/tasks/$B/plan.md \$S/plan.md" "$R")" PASS
C9="$(sc <<CMD
Q=$S0; cat > \$Q/x.mjs <<'EOF'
const p = 'docs/tasks/$B/progress.md';
EOF
CMD
)"
d "shell: SC-AK-1819 — текст here-document, называющий ход работы, проходит" "$(shell_input "$C9" "$R")" PASS
d "shell: SC-AK-1819 — prettier --check по ходу работы и движку проходит" "$(shell_input "pnpm exec prettier --check docs/tasks/$B/progress.md tools/flow-guard.mjs" "$R")" PASS

# Дыры, найденные ревью, по одной на семейство: каждая пишет ход работы и отказана.
d "shell: SC-AK-1820 — os.system в сценарии отказан" "$(shell_input "python3 -c \"import os; os.system('echo x > docs/tasks/$B/progress.md')\"" "$R")" deny
d "shell: SC-AK-1820 — текст, переданный в bash по конвейеру, отказан" "$(shell_input "printf 'echo x > docs/tasks/$B/progress.md' | bash" "$R")" deny
d "shell: SC-AK-1820 — копия в папку задачи без косой черты отказана" "$(shell_input "cp $S0/progress.md docs/tasks/$B" "$R")" deny
d "shell: SC-AK-1820 — запись в подстановке процесса отказана" "$(shell_input "echo x | tee >(cat > docs/tasks/$B/progress.md)" "$R")" deny
d "shell: SC-AK-1820 — dd of= отказан" "$(shell_input "dd if=$S0/x of=docs/tasks/$B/progress.md" "$R")" deny
d "shell: SC-AK-1820 — tee за nice -n 10 отказан" "$(shell_input "echo x | nice -n 10 tee docs/tasks/$B/progress.md" "$R")" deny
d "shell: SC-AK-1820 — запись после cd /tmp; cd - отказана" "$(shell_input "cd /tmp; cd -; echo x > docs/tasks/$B/progress.md" "$R")" deny
d "shell: SC-AK-1820 — sed -i по пути из переменной той же команды отказан" "$(shell_input "P=docs/tasks/$B/progress.md; sed -i '' 's/a/b/' \$P" "$R")" deny
d "shell: SC-AK-1820 — перенаправление >! отказано" "$(shell_input "echo x >! docs/tasks/$B/progress.md" "$R")" deny
# Разбор папки задачи по паттерну task-flow-archive и папка из шаблона проходят; запись внутрь — нет.
C10="$(sc <<CMD
cat docs/tasks/$B/grill.md > docs/archive/probe-decision.md
rm -r docs/tasks/$B
test ! -e docs/tasks/$B/plan.md
CMD
)"
d "shell: SC-AK-1819 — разбор папки задачи командой паттерна проходит" "$(shell_input "$C10" "$R")" PASS
d "shell: SC-AK-1819 — папка новой задачи из шаблона проходит" "$(shell_input "cp -r docs/tasks/_template docs/tasks/RT-9-new && ls docs/tasks/RT-9-new/progress.md" "$R")" PASS
d "shell: SC-AK-1819 — xxd по ходу работы проходит" "$(shell_input "xxd docs/tasks/$B/progress.md | head -3" "$R")" PASS
d "shell: SC-AK-1819 — sys.stdout.write плана проходит" "$(shell_input "python3 -c \"import sys; sys.stdout.write(open('docs/tasks/$B/plan.md').read())\"" "$R")" PASS
d "shell: SC-AK-1819 — сценарий, пишущий во временный файл, проходит" "$(shell_input "node -e \"const fs=require('fs'); fs.writeFileSync('/tmp/out.txt', fs.readFileSync('docs/tasks/$B/plan.md'))\"" "$R")" PASS
d "shell: SC-AK-1819 — find -exec ls по меткам проходит" "$(shell_input "find .git/rt-kit -name '*.json' -exec ls -l {} +" "$R")" PASS
d "shell: SC-AK-1820 — sed -i в подстановке \$(…) отказан" "$(shell_input "echo \"\$(sed -i '' s/a/b/ docs/tasks/$B/progress.md)\"" "$R")" deny
d "shell: SC-AK-1820 — rm в подстановке присваивания отказан" "$(shell_input "X=\$(rm -f docs/tasks/$B/progress.md)" "$R")" deny
d "shell: SC-AK-1820 — awk print > в ход работы отказан" "$(shell_input "awk '{print > \"docs/tasks/$B/progress.md\"}' /tmp/x" "$R")" deny
d "shell: SC-AK-1820 — os.replace в ход работы отказан" "$(shell_input "python3 -c \"import os; os.replace('/tmp/x','docs/tasks/$B/progress.md')\"" "$R")" deny
C11="$(sc <<CMD
tee /tmp/w.sh >/dev/null <<'EOF'
echo x > docs/tasks/$B/progress.md
EOF
bash /tmp/w.sh
CMD
)"
d "shell: SC-AK-1820 — сценарий, записанный tee и запущенный той же командой, отказан" "$(shell_input "$C11" "$R")" deny
d "shell: SC-AK-1820 — find -exec sed -i по папке задачи отказан" "$(shell_input "find docs/tasks/$B -name progress.md -exec sed -i '' s/a/b/ {} +" "$R")" deny
expect_reason "shell: SC-AK-1820 — отказ называет путь не буквой" "$GUARD" "$(shell_input "F=\$(ls -t ~/Downloads/*.md | head -1); cp \"\$F\" docs/tasks/$B/ && head -3 docs/tasks/$B/progress.md" "$R")" 'write the path as a literal'

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

# SC-AK-1746 — строку «шаг владельца» ставить нельзя: шаг делает исполнитель; снятие пометки проходит
d "window: SC-AK-1746 — «шаг владельца» в строке плана эпика — отказ" "$(edit_input Edit "$E" '| RT-5 | в работе |' '| RT-5 | шаг владельца |' "$R" "$(said 'дальше')")" deny
printf '# Эпик\n\n| Задача | Состояние |\n| --- | --- |\n| RT-5 | шаг владельца |\n' > "$E"
d "window: SC-AK-1746 — строка уходит из шага владельца — без окна" "$(edit_input Edit "$E" '| RT-5 | шаг владельца |' '| RT-5 | в работе |' "$R" "$(said 'дальше')")" PASS
printf '# Эпик\n\n| Задача | Состояние |\n| --- | --- |\n| RT-5 — проба | шаг владельца |\n' > "$E"
d "window: SC-AK-1746 — другая ячейка старой строки правится без отказа" "$(edit_input Edit "$E" '| RT-5 — проба | шаг владельца |' '| RT-5 — проба два | шаг владельца |' "$R" "$(said 'дальше')")" PASS
d "window: SC-AK-1746 — фраза в прозе вне ячейки состояния не отказана" "$(edit_input Edit "$E" '# Эпик' '# Эпик

Пометка «шаг владельца» снята.' "$R" "$(said 'дальше')")" PASS
printf '# Эпик\n\n| Задача | Состояние |\n| --- | --- |\n| RT-5 | в работе |\n| RT-6 | отложено |\n' > "$E"

# SC-AK-1745 — строку замены проверки владелец подтверждает в окне; удаление окна не требует
progress_text 'этап-идёт' '>' ' ' > "$P"
printf '\n## Decisions along the way\n\n- **Check of step 1.1 replaced:** `echo ok` → `ok`\n' >> "$P"
d "window: SC-AK-1745 — строка замены удаляется — без окна" "$(edit_input Edit "$P" '- **Check of step 1.1 replaced:** `echo ok` → `ok`' '' "$R")" PASS
d "window: SC-AK-1745 — строка замены меняется — окно" "$(edit_input Edit "$P" '`echo ok` → `ok`' '`echo да` → `да`' "$R")" ask
progress_text 'этап-идёт' '>' ' ' > "$P"
d "window: SC-AK-1745 — строка замены добавляется — окно" "$(edit_input Edit "$P" '- [ ] 1.2' '- [ ] 1.2

- **Check of step 1.2 replaced:** `echo ok` → `ok`' "$R")" ask

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
d "protect: SC-AK-1708 — одобрение, найденное на месте в записи, пропускает правку движка" "$(edit_input Edit "$F5" '({})' '({ })' "$R5")" PASS

# SC-AK-1874 — одобрение вторым вопросом окна: ответы окна не склеиваются
approve "$R5" "$B5"
jq -cn '{type:"user",uuid:"a1",toolUseResult:{answers:{"Граница дня?":"До 18:00","Одобряешь план RT-9?":"Одобряю план RT-9"}}}' > "$(records_dir "$R5")/session.jsonl"
d "protect: SC-AK-1874 — одобрение вторым ответом окна пропускает правку движка" "$(edit_input Edit "$F5" '({})' '({ })' "$R5")" PASS
jq -cn '{type:"user",uuid:"a1",message:{role:"user",content:"одобряю план RT-9"}}' > "$(records_dir "$R5")/session.jsonl"
d "protect: SC-AK-1874 — набранное строчными одобрение пропускает правку движка" "$(edit_input Edit "$F5" '({})' '({ })' "$R5")" PASS
jq -cn '{type:"user",uuid:"a1",toolUseResult:{answers:{"Одобряешь?":"Одобряю plan.md RT-7"}}}' > "$(records_dir "$R5")/session.jsonl"
d "protect: SC-AK-1874 — «plan.md» с номером другой задачи — отказ" "$(edit_input Edit "$F5" '({})' '({ })' "$R5")" deny

approve "$R5" "$B5" 'Переделай этап 1'
d "protect: SC-AK-1709 — на месте не одобряющий ответ — отказ" "$(edit_input Edit "$F5" '({})' '({ })' "$R5")" deny
expect_reason "protect: SC-AK-1709 — отказ называет, что на месте нет одобрения" "$GUARD" "$(edit_input Edit "$F5" '({})' '({ })' "$R5")" 'no approving answer of the owner'

approve "$R5" "$B5" '' a2
d "protect: SC-AK-1710 — запись без записи с этим uuid — отказ" "$(edit_input Edit "$F5" '({})' '({ })' "$R5")" deny
expect_reason "protect: SC-AK-1710 — отказ называет ход: plan-red" "$GUARD" "$(edit_input Edit "$F5" '({})' '({ })' "$R5")" "it finds the owner's answer in the record"
# SC-AK-1875 — отказ велит запустить plan-red и не велит переспрашивать владельца
expect_reason "protect: SC-AK-1875 — отказ ведёт к plan-red, владельца спрашивают, только если ответа нет" "$GUARD" "$(edit_input Edit "$F5" '({})' '({ })' "$R5")" 'ask the owner only when it finds none'
expect_no_reason "protect: SC-AK-1875 — в отказе нет совета переспросить" "$GUARD" "$(edit_input Edit "$F5" '({})' '({ })' "$R5")" 'ask the owner again'

approve "$R5" "$B5"
rm -f "$(records_dir "$R5")/session.jsonl"
d "protect: SC-AK-1730 — запись, снятая очисткой хозяина, — отказ" "$(edit_input Edit "$F5" '({})' '({ })' "$R5")" deny
expect_reason "protect: SC-AK-1730 — отказ называет ход" "$GUARD" "$(edit_input Edit "$F5" '({})' '({ })' "$R5")" "it finds the owner's answer in the record"

OUTSIDE="$(mktemp -d)"
TMPS+=("$OUTSIDE")
approve "$R5" "$B5" '' a1 "$OUTSIDE/session.jsonl"
d "protect: SC-AK-1720 — запись вне каталогов записей одобрения не даёт" "$(edit_input Edit "$F5" '({})' '({ })' "$R5")" deny

# Метка без места — как до этой работы: вне закрытого списка не одобрение.
printf '{"answer":"Одобряю план RT-9"}\n' > "$R5/.git/rt-kit/approval/$B5.json"
d "protect: SC-AK-1728 — метка без места вне закрытого списка — отказ" "$(edit_input Edit "$F5" '({})' '({ })' "$R5")" deny

# Ветка переписана: план добавляет другой коммит, метка называет прежний.
approve "$R5" "$B5"
git -C "$R5" -c user.name=t -c user.email=t@t commit -q --amend -m 'docs: план заново'
d "protect: SC-AK-1721 — одобрение другого коммита плана — отказ" "$(edit_input Edit "$F5" '({})' '({ })' "$R5")" deny
expect_reason "protect: SC-AK-1721 — отказ называет ход" "$GUARD" "$(edit_input Edit "$F5" '({})' '({ })' "$R5")" "it finds the owner's answer in the record"

# Одобрение дано в другой рабочей копии: его запись лежит в каталоге записей той копии.
approve "$R5" "$B5"
COPY5="$R5-copy"
git -C "$R5" worktree add -q --detach "$COPY5" >/dev/null 2>&1
TMPS+=("$COPY5")
mkdir -p "$(records_dir "$COPY5")"
mv "$(records_dir "$R5")/session.jsonl" "$(records_dir "$COPY5")/session.jsonl"
jq -c --arg r "$(records_dir "$COPY5")/session.jsonl" '.place.record = $r' "$R5/.git/rt-kit/approval/$B5.json" > "$R5/approval.tmp"
mv "$R5/approval.tmp" "$R5/.git/rt-kit/approval/$B5.json"
d "protect: SC-AK-1734 — одобрение из записи другой копии пропускает правку" "$(edit_input Edit "$F5" '({})' '({ })' "$R5")" PASS
approve "$R5" "$B5"

# Записи разговоров пишет только хозяин; память рядом с ними пишется как прежде.
REC5="$(records_dir "$R5")/session.jsonl"
d "guard: SC-AK-1735 — дозапись оболочкой в запись разговора отказана" "$(shell_input "printf 'x' >> '$REC5'" "$R5")" deny
d "guard: SC-AK-1735 — Write записи разговора отказан" "$(edit_input Write "$(records_dir "$R5")/other.jsonl" '' 'x' "$R5")" deny
d "guard: SC-AK-1737 — запись в память рядом с записями проходит" "$(edit_input Write "$(records_dir "$R5")/memory/note.md" '' 'x' "$R5")" PASS

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
d "protect: SC-AK-1728 — ветка закрытого списка без метки с местом — правка проходит" "$(edit_input Edit "$F6" '({})' '({ })' "$R6")" PASS

# --- ход, названный отказом, спрошен у соседних проверок ----------------------------------------
# Отказ записи оболочкой называет правку хода работы, а её держит гейт, пока правило задач не
# загружено: слово о правиле стоит перед вердиктом движка.
mkdir -p "$R/.claude/skills/task-flow"
printf -- '---\nname: task-flow\nkind: rule\n---\n' > "$R/.claude/skills/task-flow/SKILL.md"
# Правило длиннее предела хозяина: гейт не кладёт его в заход сам и держит ход до загрузки.
printf '%010000d\n' 0 >> "$R/.claude/skills/task-flow/SKILL.md"
gate_session_reset
CLAUDE_PROJECT_DIR="$R" expect_reason "правку хода работы держит гейт — отказ называет правило" "$GUARD" \
    "$(shell_input "printf 'x' >> docs/tasks/$B/progress.md" "$R")" 'load the rule «task-flow» by the tool Skill first. Then: the progress'
gate_session_load task-flow
CLAUDE_PROJECT_DIR="$R" expect_no_reason "правило загружено — назван один вердикт" "$GUARD" \
    "$(shell_input "printf 'x' >> docs/tasks/$B/progress.md" "$R")" 'held by the rules gate'
gate_session_cleanup
unset TMPDIR
rm -rf "$R/.claude/skills/task-flow"

# --- ограничитель времени: страж судит и без `timeout` -----------------------------------------
# Каталог команд случая — ссылки на всё из PATH, кроме `timeout`, `gtimeout` и perl; ограничитель
# вида кладётся заглушкой, которая пишет свои доводы в отметку и передаёт ход дальше.
REAL_PERL="$(command -v perl)"
LIMIT_BASE="$(mktemp -d)"
TMPS+=("$LIMIT_BASE")
( IFS=:; for dir in $PATH; do for f in "$dir"/*; do n="${f##*/}"
    case "$n" in timeout | gtimeout | perl) continue ;; esac
    [ -x "$f" ] && [ ! -e "$LIMIT_BASE/$n" ] && ln -s "$f" "$LIMIT_BASE/$n"; done; done )
# Каталог вида: $1 — имя переменной для пути, дальше — заглушки вида: gtimeout, perl или ни одной.
# Каталог заводится в этой оболочке, а не в подстановке: иначе его не видит уборка по выходу.
limit_bin() {
    local var="$1" bin
    shift
    bin="$(mktemp -d)/bin"
    TMPS+=("${bin%/bin}")
    cp -RP "$LIMIT_BASE" "$bin"
    for stub in "$@"; do
        case "$stub" in
            timeout | gtimeout) printf '#!/bin/sh\necho "%s $*" >> "%s"\nshift\nexec "$@"\n' "$stub" "${bin%/bin}/mark" > "$bin/$stub" ;;
            # Ограничитель без права на запуск: bash 3.2 всё равно называет его в `command -v`.
            noexec-gtimeout) printf '#!/bin/sh\necho "gtimeout $*" >> "%s"\n' "${bin%/bin}/mark" > "$bin/gtimeout"; continue ;;
            perl) printf '#!/bin/sh\necho "perl $*" >> "%s"\nexec "%s" "$@"\n' "${bin%/bin}/mark" "$REAL_PERL" > "$bin/perl" ;;
        esac
        chmod +x "$bin/$stub"
    done
    printf -v "$var" '%s' "$bin"
}
B8=RT-11-limits
R8="$(task_repo "$B8")"
TMPS+=("$R8")
P8="$R8/docs/tasks/$B8/progress.md"
progress_text 'этап-идёт' '>' ' ' > "$P8"
limit_bin K1 gtimeout
limit_bin K2 perl
limit_bin K3
limit_bin K4 gtimeout perl
limit_bin K5 noexec-gtimeout perl
limit_bin K6 timeout gtimeout perl
PATH_KEEP="$PATH"
PLAN8="$(printf '# Plan\n\n## Decision\n\nNo decision: probe fixture\n\n## Stages\n\n### 1. Этап\n\n- **Steps:**\n    1. Первый шаг\n       Check: `cat a.txt | tail -1` → `готово`\n')"

PATH="$K1"
d "guard: SC-AK-2004 — только gtimeout: [x] рукой отказан" "$(edit_input Edit "$P8" '- [>] 1.1' '- [x] 1.1' "$R8")" deny
expect_reason "guard: SC-AK-2004 — только gtimeout: отказ называет команду шага" "$GUARD" "$(edit_input Edit "$P8" '- [>] 1.1' '- [x] 1.1' "$R8")" 'task-flow-script.mjs step 1.1'
d "guard: SC-AK-2004 — только gtimeout: законная правка проходит" "$(edit_input Edit "$P8" '# Ход работы' '# Ход работы.' "$R8")" PASS
d "guard: SC-AK-2004 — только gtimeout: запись плана со скрытой проверкой отказана" "$(edit_input Write "$R8/docs/tasks/$B8/plan.md" '' "$PLAN8" "$R8")" deny
PATH="$PATH_KEEP"
report "guard: SC-AK-2004 — только gtimeout: отметка вызова записи плана под пределом" "$(grep -q '^gtimeout 60 node .*flow-plan.mjs written' "${K1%/bin}/mark" 2>/dev/null && echo есть || echo нет)" есть
report "guard: SC-AK-2004 — только gtimeout: отметка вызова с пределом 60" "$(grep -q '^gtimeout 60 node ' "${K1%/bin}/mark" 2>/dev/null && echo есть || echo нет)" есть

PATH="$K2"
d "guard: SC-AK-2004 — только perl: [x] рукой отказан" "$(edit_input Edit "$P8" '- [>] 1.1' '- [x] 1.1' "$R8")" deny
d "guard: SC-AK-2004 — только perl: запись плана со скрытой проверкой отказана" "$(edit_input Write "$R8/docs/tasks/$B8/plan.md" '' "$PLAN8" "$R8")" deny
expect_reason "guard: SC-AK-2004 — только perl: отказ записи плана называет трубу" "$GUARD" "$(edit_input Write "$R8/docs/tasks/$B8/plan.md" '' "$PLAN8" "$R8")" 'a pipe without'
expect_reason "guard: SC-AK-2004 — только perl: отказ называет команду шага" "$GUARD" "$(edit_input Edit "$P8" '- [>] 1.1' '- [x] 1.1' "$R8")" 'task-flow-script.mjs step 1.1'
d "guard: SC-AK-2004 — только perl: законная правка проходит" "$(edit_input Edit "$P8" '# Ход работы' '# Ход работы.' "$R8")" PASS
PATH="$PATH_KEEP"
report "guard: SC-AK-2004 — только perl: отметка вызова с alarm и пределом 60" "$(grep -q '^perl -e alarm shift; exec @ARGV 60 node ' "${K2%/bin}/mark" 2>/dev/null && echo есть || echo нет)" есть
report "guard: SC-AK-2004 — только perl: отметка вызова записи плана под пределом" "$(grep -q '^perl -e alarm shift; exec @ARGV 60 node .*flow-plan.mjs written' "${K2%/bin}/mark" 2>/dev/null && echo есть || echo нет)" есть

PATH="$K3"
d "guard: SC-AK-2004 — без ограничителя: [x] рукой отказан" "$(edit_input Edit "$P8" '- [>] 1.1' '- [x] 1.1' "$R8")" deny
expect_reason "guard: SC-AK-2004 — без ограничителя: отказ называет команду шага" "$GUARD" "$(edit_input Edit "$P8" '- [>] 1.1' '- [x] 1.1' "$R8")" 'task-flow-script.mjs step 1.1'
d "guard: SC-AK-2004 — без ограничителя: законная правка проходит" "$(edit_input Edit "$P8" '# Ход работы' '# Ход работы.' "$R8")" PASS
d "guard: SC-AK-2004 — без ограничителя: запись плана со скрытой проверкой отказана" "$(edit_input Write "$R8/docs/tasks/$B8/plan.md" '' "$PLAN8" "$R8")" deny
expect_reason "guard: SC-AK-2004 — без ограничителя: отказ записи плана называет трубу" "$GUARD" "$(edit_input Write "$R8/docs/tasks/$B8/plan.md" '' "$PLAN8" "$R8")" 'a pipe without'
PATH="$PATH_KEEP"

# gtimeout и perl рядом: берётся первый по порядку, perl не зовётся.
PATH="$K4"
d "guard: SC-AK-2004 — gtimeout и perl: [x] рукой отказан" "$(edit_input Edit "$P8" '- [>] 1.1' '- [x] 1.1' "$R8")" deny
PATH="$PATH_KEEP"
report "guard: SC-AK-2004 — gtimeout и perl: отметка только у gtimeout" "$(grep -q '^gtimeout 60 ' "${K4%/bin}/mark" 2>/dev/null && ! grep -q '^perl ' "${K4%/bin}/mark" && echo да || echo нет)" да

# gtimeout без права на запуск не выбирается: зовётся perl.
PATH="$K5"
d "guard: SC-AK-2004 — gtimeout без права на запуск: [x] рукой отказан" "$(edit_input Edit "$P8" '- [>] 1.1' '- [x] 1.1' "$R8")" deny
PATH="$PATH_KEEP"
report "guard: SC-AK-2004 — gtimeout без права на запуск: отметка только у perl" "$(grep -q '^perl -e alarm' "${K5%/bin}/mark" 2>/dev/null && ! grep -q '^gtimeout ' "${K5%/bin}/mark" && echo да || echo нет)" да

# timeout рядом с gtimeout и perl: берётся timeout.
PATH="$K6"
d "guard: SC-AK-2004 — timeout, gtimeout и perl: [x] рукой отказан" "$(edit_input Edit "$P8" '- [>] 1.1' '- [x] 1.1' "$R8")" deny
PATH="$PATH_KEEP"
report "guard: SC-AK-2004 — timeout, gtimeout и perl: отметка только у timeout" "$(grep -q '^timeout 60 node ' "${K6%/bin}/mark" 2>/dev/null && ! grep -qE '^(gtimeout|perl) ' "${K6%/bin}/mark" && echo да || echo нет)" да

# --- чужие правки страж не судит ---------------------------------------------------------------
d "обычный файл правится без стража" "$(edit_input Edit "$R/README.md" 'a' 'b' "$R")" PASS
d "обычная команда проходит" "$(shell_input "git status --short" "$R")" PASS

suite_result "страж хода работы"
