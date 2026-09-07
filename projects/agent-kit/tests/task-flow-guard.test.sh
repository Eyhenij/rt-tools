#!/usr/bin/env bash
# Сценарии гарда замысла: код не пишется раньше замысла.
#
# Гард требует три вещи и ровно их — папку задачи по имени ветки, замысел в ней и объявленное в
# ходе работы состояние из тех, в которых код правится. Полноту написанного он не судит, и набор
# тоже: проверяется, что каждое из трёх требований отбивает своё и ни одно не отбивает чужое.
# Договорённость о продукте требует соседний гард, и её сценарии лежат в его наборе.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард замысла"

REPO="$(fixture_repo RT-1-probe)"
export CLAUDE_PROJECT_DIR="$REPO"
cleanup() { rm -rf "$REPO"; }
trap cleanup EXIT

TASK="$REPO/docs/tasks/RT-1-probe"
mkdir -p "$TASK" "$REPO/libs/site/x/ui/src/lib" "$REPO/docs/specs/x/proposed/y"
# Спек домена: второй вид записи договорённости — дерево без каталога «предложено» пишет её сюда.
printf '# Домен x\n' > "$REPO/docs/specs/x/spec.md"
CODE="$REPO/libs/site/x/ui/src/lib/a.component.ts"

# Состояние работы объявляется строкой в ходе работы. Ярус ниже судит замысел, и без объявленного
# состояния он отбивался бы не своей причиной.
state_is() { printf '# Ход работы\n\n## Где стоим\n\n- **Состояние:** `%s`\n' "$1" > "$TASK/progress.md"; }
state_is 'этап-идёт'

# Вход правки с рабочим каталогом: ветку гард смотрит там, где пойдёт правка.
edit_in() {
    jq -n --arg f "$1" --arg d "$REPO" --arg t "${2:-Edit}" \
        '{session_id:"tests",tool_name:$t,tool_input:{file_path:$f},cwd:$d}'
}

t() { expect_decision "$1" task-flow-guard.sh "$(edit_in "$2" "${4:-Edit}")" "$3"; }

# --- признак «правка меняет поведение» — путь ------------------------------------------
# Правила, тексты, обвязка и зависимости под требование не попадают: иначе разбор задачи нельзя
# было бы вести до заведения ветки.
t "текст проекта правится без замысла" "$REPO/docs/adr/0001-x.md" PASS
t "обвязка правится без замысла" "$REPO/tools/check-x.mjs" PASS
t "код приложения без замысла отбивается" "$CODE" deny

# SC-AK-710 — разложенный слой правил судится наравне с кодом приложения. Путями кода он не
# покрыт нигде, и полторы сотни его файлов ложились без единого отклика гарда.
mkdir -p "$REPO/tools"
LAID_OUT="$REPO/tools/check-laid-out.mjs"
printf '%s\n' '#!/usr/bin/env node' '// rt-kit v0.16.1 · checks/check-laid-out.mjs · abc123 · правится надстройкой, не здесь' > "$LAID_OUT"
t "SC-AK-710 — разложенный файл без замысла отбивается" "$LAID_OUT" deny
# Тот же путь без шапки раскладки остаётся обвязкой и требования не получает.
printf '%s\n' '#!/usr/bin/env node' '// своя проверка дерева' > "$LAID_OUT"
t "SC-AK-710 — та же обвязка без шапки правится без замысла" "$LAID_OUT" PASS
rm -f "$LAID_OUT"

# --- состояние работы -------------------------------------------------------------------
# Артефакт на диске не говорит, дошла ли работа до правки кода: пустой замысел, положенный ради
# снятия отказа, лежит так же, как написанный. Судится объявленный переход.
printf '# Замысел\n\n**Поведение:** не меняется — правка обвязки. Подтверждено владельцем.\n' > "$TASK/plan.md"

rm -f "$TASK/progress.md"
t "SC-AK-295 — папка без хода работы правку не пропускает" "$CODE" deny
expect_reason "и отбивается именно за ход работы" task-flow-guard.sh "$(edit_in "$CODE")" 'there is no progress'

printf '# Ход работы\n\n## Где стоим\n\n- **Этап:** 1 из 2\n' > "$TASK/progress.md"
t "SC-AK-288 — состояние не объявлено, и артефакт отказ не снимает" "$CODE" deny
expect_reason "и отбивается именно за необъявленное состояние" task-flow-guard.sh "$(edit_in "$CODE")" 'no state of the work is declared'

# Замысел, лежащий на диске, требования дойти до правки кода не снимает: судится объявленный
# переход, а не наличие файлов.
state_is 'замысел-записан'
t "SC-AK-294 — обход договорённости требования о состоянии не снимает" "$CODE" deny
expect_reason "SC-AK-289 — отказ называет обязательное действие состояния" task-flow-guard.sh \
    "$(edit_in "$CODE")" 'do the first stage'

state_is 'влито'
t "SC-AK-292 — состояние закрытой работы отбивается" "$CODE" deny

state_is 'работа-сделана-как-то-так'
t "SC-AK-293 — имя вне перечня состоянием не считается" "$CODE" deny
expect_reason "и отбивается именно за имя вне перечня" task-flow-guard.sh "$(edit_in "$CODE")" 'there is no such name in the list'

state_is 'этап-идёт'
t "SC-AK-290 — в состоянии идущего этапа правка проходит" "$CODE" PASS

# Прогон бывает красным, а разбор — с замечаниями: починка идёт в ту же ветку, и правка кода
# после отдачи работы законна.
state_is 'работа-отдана'
t "SC-AK-291 — правка по замечаниям в отданной работе проходит" "$CODE" PASS

state_is 'этап-идёт'

# --- замысел на диске -------------------------------------------------------------------
# Договорённость о продукте — требование соседнего гарда, `task-flow-draft-guard`, и этот про
# неё не спрашивает вовсе: иначе отказ от одного требования снимал бы второе.
printf '# Замысел\n\nбез шапки\n' > "$TASK/plan.md"
t "SC-AK-742 — замысел без договорённости этим гардом не судится" "$CODE" PASS

rm -f "$TASK/plan.md"
t "замысла нет — правка отбивается" "$CODE" deny
expect_reason "и отбивается именно за замысел" task-flow-guard.sh "$(edit_in "$CODE")" 'there is no plan'

printf '# Замысел\n\n**Поведение:** не меняется — переезд слоя. Подтверждено владельцем.\n' > "$TASK/plan.md"
t "замысел на месте — правка проходит" "$CODE" PASS

# Первый коммит фикстуры заводит историю, и с этой минуты гард спрашивает у неё папку задачи.
# До него истории нет вовсе, и требование молчит: спросить нечем.
git -C "$REPO" add docs/tasks/RT-1-probe >/dev/null 2>&1
git -C "$REPO" -c user.name=probe -c user.email=probe@example.com -c commit.gpgsign=false \
    commit -q -m 'docs: папка задачи заведена' >/dev/null 2>&1

# --- имя ветки ---------------------------------------------------------------------------
git -C "$REPO" checkout -q -b probe-without-number 2>/dev/null
t "ветка без номера задачи отбивается" "$CODE" deny
expect_reason "и отбивается именно за имя ветки" task-flow-guard.sh "$(edit_in "$CODE")" 'the current branch is'

# Приставка рода правки с номером имя ветки проходит: дальше гард спрашивает уже про замысел, и
# отказ обязан говорить про него, а не про ветку. Иначе исполнитель чинит не то.
git -C "$REPO" checkout -q -b fix/2-probe 2>/dev/null
expect_reason "имя ветки принято — спрос идёт про замысел" task-flow-guard.sh "$(edit_in "$CODE")" 'there is no plan'
git -C "$REPO" checkout -q RT-1-probe 2>/dev/null

# --- вторая дверь: та же правка командой оболочки ------------------------------------------
# Гард, подписанный на инструмент правки, обходится сменой способа записи. Отбитая правка
# дважды за один заход легла командой — разбор `2026-08-15-guard-denied-shell-wrote-anyway.md`.
rm -f "$TASK/plan.md"

bash_in() {
    jq -n --arg c "$1" --arg d "$REPO" \
        '{session_id:"tests",tool_name:"Bash",tool_input:{command:$c},cwd:$d}'
}
b() { expect_decision "$1" task-flow-guard.sh "$(bash_in "$2")" "$3"; }

b "перенаправление в код отбивается" "echo x > libs/site/x/ui/src/lib/a.component.ts" deny
b "дописывание в код отбивается" "echo x >> libs/site/x/ui/src/lib/a.component.ts" deny
b "правка на месте отбивается" "sed -i '' 's/a/b/' libs/site/x/ui/src/lib/a.component.ts" deny
b "запись через tee отбивается" "cat f | tee libs/site/x/ui/src/lib/a.component.ts" deny
b "интерпретатор с путём в heredoc отбивается" \
    "python3 - <<'PY'
import pathlib
pathlib.Path('libs/site/x/ui/src/lib/a.component.ts').write_text('x')
PY" deny
b "копирование поверх кода отбивается" "cp /tmp/a libs/site/x/ui/src/lib/a.component.ts" deny
b "возврат версии из истории отбивается" "git checkout HEAD -- libs/site/x/ui/src/lib/a.component.ts" deny
b "абсолютный путь отбивается" "echo x > $CODE" deny

# Снятие своего временного каталога под корнем приложений правкой продукта не бывает: в истории
# его нет вовсе. Снятие отслеживаемого файла кода судится по-прежнему.
mkdir -p "$REPO/libs/site/x/tmp-probe"
: > "$REPO/libs/site/x/tmp-probe/scratch.ts"
b "SC-AK-740 — снятие неотслеживаемого каталога проходит" "rm -rf libs/site/x/tmp-probe" PASS
# Файл кода в индексе: гард обязан судить его снятие наравне с правкой. Фикстура кладёт путь,
# а не файл, — для этой проверки он заводится и заносится в индекс.
: > "$CODE"
git -C "$REPO" add "$CODE" >/dev/null 2>&1
b "SC-AK-740 — снятие файла кода из истории отбивается" "rm libs/site/x/ui/src/lib/a.component.ts" deny
git -C "$REPO" rm --cached -q "libs/site/x/ui/src/lib/a.component.ts" >/dev/null 2>&1
rm -rf "$REPO/libs/site/x/tmp-probe"

# SC-AK-737 — команда заведения задачи гардом не судится
# Она пишет папку задачи и карточку в очереди, а её текст несёт тело задачи целиком: цитата со
# знаком «больше» подходит под признак записи, путь к коду в прозе тела — под признак пути.
# Отбитая, она отбивается тем гардом, который сам же печатает её в тексте своего отказа.
b "SC-AK-737 — заведение задачи проходит" \
    "npm run task:new -- --title 'Панель теряет фокус' --slug panel << 'BODY'
> Панель теряет фокус, см. libs/site/x/ui/src/lib/a.component.ts
BODY" PASS

# Правку кода та же оболочка по-прежнему не проводит: снято требование с одной команды, а не с
# рода вызова.
b "SC-AK-737 — правка кода рядом с ней отбивается" "echo x > libs/site/x/ui/src/lib/a.component.ts" deny

# SC-AK-879 — снятие перестоявших записей о законченных работах гардом не судится
# Записи стареют по календарю, и проверка срока краснеет сама, без правки в ветке. В ветке, куда
# работу привозят слияниями, папки задачи нет и не должно быть: без вывода из-под гарда заявка
# остаётся красной, и выхода из этой пары у исполнителя нет.
mkdir -p "$REPO/.claude/rt-kit"
printf 'RT_ARCHIVE_PRUNE_CMD="node tools/archive-prune.mjs --apply"
' > "$REPO/.claude/rt-kit/project.sh"
b "SC-AK-879 — снятие перестоявших записей проходит" "node tools/archive-prune.mjs --apply" PASS
b "SC-AK-879 — правка кода той же оболочкой отбивается по-прежнему" \
    "echo x > libs/site/x/ui/src/lib/a.component.ts" deny
# Сверяется вся команда, а не вхождение: связка через `&&` рядом со снятием провела бы что
# угодно, и вывод стал бы дырой шириной в оболочку.
b "SC-AK-879 — снятие в связке с правкой кода отбивается" \
    "node tools/archive-prune.mjs --apply && echo x > libs/site/x/ui/src/lib/a.component.ts" deny

# Дерево, не назвавшее команду, ведёт себя как прежде: вывод объявляется профилем, а не угадан.
printf '\n' > "$REPO/.claude/rt-kit/project.sh"
b "SC-AK-879 — без объявления команды вывода нет" \
    "node tools/archive-prune.mjs --apply && echo x > libs/site/x/ui/src/lib/a.component.ts" deny
rm -rf "$REPO/.claude/rt-kit"

# Терминал среды исполняет ту же командную строку и кладёт её в то же поле. Пока гард на него не
# звался, объявление называло его, а тело пропускало: снаружи это выглядит закрытым.
ide_in() {
    jq -n --arg c "$1" --arg d "$REPO" --arg t "$2" \
        '{session_id:"tests",tool_name:$t,tool_input:{command:$c},cwd:$d}'
}

expect_decision "SC-AK-251 — та же запись из терминала среды отбивается" task-flow-guard.sh \
    "$(ide_in "echo x > libs/site/x/ui/src/lib/a.component.ts" mcp__webstorm__execute_terminal_command)" deny
expect_decision "SC-AK-252 — вложенная запись универсального исполнителя отбивается" task-flow-guard.sh \
    "$(ide_in "execute_terminal_command --command \"echo x > libs/site/x/ui/src/lib/a.component.ts\"" mcp__webstorm__execute_tool)" deny

# Чтение и поиск не отбиваются: гард судит запись, а не всякое упоминание пути.
b "чтение кода пропускается" "cat libs/site/x/ui/src/lib/a.component.ts" PASS
b "поиск по коду пропускается" "grep -rn xyz libs/site/x/ui/src/lib/" PASS
# Пустое устройство и поток ошибок файла не пишут: так глушат вывод команды чтения.
b "поиск с заглушённым потоком ошибок пропускается" \
    "grep -rn xyz libs/site/x/ui/src/lib/ 2>/dev/null" PASS
b "чтение с выводом в пустое устройство пропускается" \
    "cat libs/site/x/ui/src/lib/a.component.ts > /dev/null" PASS
b "сведение потоков при чтении пропускается" \
    "cat libs/site/x/ui/src/lib/a.component.ts 2>&1" PASS
# Настоящая запись рядом с заглушённым потоком остаётся видной.
b "запись рядом с пустым устройством отбивается" \
    "echo x > libs/site/x/ui/src/lib/a.component.ts 2>/dev/null" deny
# Текст под требование не подпадает — ни инструментом, ни командой.
b "запись в текст проекта пропускается" "echo x > docs/adr/0001-x.md" PASS
# Тело документа на месте — текст, а не команда: путь, названный в нём словами, правила под
# запись не требует. Путь, куда команда пишет, стоит в её заголовке и судится по-прежнему.
b "чужой путь в теле документа на месте правила не требует" \
    "cat > docs/adr/0002-x.md <<'MD'
Компонент лежит в libs/site/x/ui/src/lib/a.component.ts
MD" PASS
b "путь в заголовке команды с документом на месте отбивается" \
    "cat > libs/site/x/ui/src/lib/a.component.ts <<'TS'
export class A {}
TS" deny

# SC-AK-668…669 — признак интерпретатора читается у заголовка heredoc, а не у всей команды.
# Прежде он читался у всего текста разом, и слово из документа отключало вырезание тела целиком:
# строка «Чем проверяется: `bash projects/…`» в замысле делала запись `plan.md` правкой кода.
# Гард отбивал тем самым запись того файла, отсутствием которого он же и отказывает.
b "SC-AK-668 — слово интерпретатора в теле документа тела не открывает" \
    "cat > docs/adr/0003-x.md <<'MD'
Проверяется: bash libs/site/x/ui/src/lib/a.component.ts
MD" PASS
# Обратная сторона: интерпретатор, названный заголовком, тело сохраняет — путь записи там.
b "SC-AK-669 — интерпретатор в заголовке тело по-прежнему открывает" \
    "python3 - <<'PY'
open('libs/site/x/ui/src/lib/a.component.ts','w').write('x')
PY" deny

# Замысел на месте — обе двери открыты одинаково.
printf '# Замысел\n\n**Поведение:** не меняется — переезд слоя. Подтверждено владельцем.\n' > "$TASK/plan.md"
b "с замыслом команда оболочки пропускается" "echo x > libs/site/x/ui/src/lib/a.component.ts" PASS
t "с замыслом инструмент правки пропускается" "$CODE" PASS

# --- папка, разобранная коммитом ветки ------------------------------------------------------
# Уборка стоит до открытия заявки, и замысла с этой минуты на диске нет намеренно. Правка
# после неё — правка по замечаниям разбора: требовать под неё замысел значило бы запирать
# ветку собственным порядком. Признак берётся из истории ветки, а не с диска.
COMP='libs/site/x/ui/src/lib/a.component.ts'
# Признак «правка кода приложения» считается от корня дерева, поэтому корнем на время вызова
# объявляется сама фикстура: иначе путь под её каталогом не совпадёт ни с одним образцом и
# гард пропустит правку, ничего не сказав.
edit_at() {
    local out
    out="$(CLAUDE_PROJECT_DIR="$1" jq -n --arg f "$1/$COMP" --arg d "$1" \
        '{session_id:"tests",tool_name:"Edit",tool_input:{file_path:$f},cwd:$d}' \
        | CLAUDE_PROJECT_DIR="$1" "$HOOKS/task-flow-guard.sh" 2>/dev/null)"
    [ -z "$out" ] && { printf 'PASS'; return 0; }
    printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecision // "PASS"' 2>/dev/null
}

ARCHIVED="$(fixture_repo_branched main RT-46-probe)"
fixture_commit "$ARCHIVED" docs/tasks/RT-46-probe/plan.md 'замысел' 'docs: замысел'
fixture_commit "$ARCHIVED" "$COMP" 'export class A {}' 'feat: правка'
report "SC-AK-529 — папка на месте, а состояние не объявлено: правка отбивается" "$(edit_at "$ARCHIVED")" deny
fixture_remove "$ARCHIVED" docs/tasks/RT-46-probe 'docs: папка разобрана'
report "SC-AK-529 — после разбора папки правка проходит" "$(edit_at "$ARCHIVED")" PASS

# Снос без коммита отданной работы не означает: судится история ветки, а не рабочее дерево.
NOT_COMMITTED="$(fixture_repo_branched main RT-47-probe)"
fixture_commit "$NOT_COMMITTED" docs/tasks/RT-47-probe/plan.md 'замысел' 'docs: замысел'
fixture_commit "$NOT_COMMITTED" "$COMP" 'export class A {}' 'feat: правка'
rm -rf "$NOT_COMMITTED/docs/tasks/RT-47-probe"
report "SC-AK-530 — снос без коммита правку не пропускает" "$(edit_at "$NOT_COMMITTED")" deny
rm -rf "$ARCHIVED" "$NOT_COMMITTED"

# --- SC-AK-665…667 — папка задачи заводится в историю ветки --------------------------------
#
# Три требования выше смотрят диск, и папка, ни разу не закоммиченная, проходит их все без
# единого отказа. Признак отданной работы гард берёт из истории — там её нет, и отказ приходит
# в последней точке, на открытии заявки, когда папка уже разобрана своими руками.

# Полная папка задачи в рабочем дереве: замысел и объявленное состояние. Всё, чего требуют ярусы
# выше, на месте — не хватает только коммита.
task_folder_at() {
    mkdir -p "$1/docs/tasks/$2"
    printf '# Замысел\n\n**Поведение:** не меняется — правка обвязки. Подтверждено владельцем.\n' \
        > "$1/docs/tasks/$2/plan.md"
    printf '# Ход работы\n\n## Где стоим\n\n- **Состояние:** `этап-идёт`\n' \
        > "$1/docs/tasks/$2/progress.md"
}

edit_json_at() {
    jq -n --arg f "$1/$COMP" --arg d "$1" \
        '{session_id:"tests",tool_name:"Edit",tool_input:{file_path:$f},cwd:$d}'
}

IN_TREE_ONLY="$(fixture_repo_branched main RT-48-probe)"
fixture_commit "$IN_TREE_ONLY" "$COMP" 'export class A {}' 'feat: правка'
task_folder_at "$IN_TREE_ONLY" RT-48-probe
report "SC-AK-665 — папка задачи только в рабочем дереве правку не пропускает" \
    "$(edit_at "$IN_TREE_ONLY")" deny
CLAUDE_PROJECT_DIR="$IN_TREE_ONLY" expect_reason "SC-AK-666 — отказ называет команду, которой снимается" \
    task-flow-guard.sh "$(edit_json_at "$IN_TREE_ONLY")" 'git add docs/tasks/RT-48-probe'

# Та же папка, заведённая в историю: правка проходит.
git -C "$IN_TREE_ONLY" add docs/tasks/RT-48-probe >/dev/null 2>&1
git -C "$IN_TREE_ONLY" -c user.name=probe -c user.email=probe@example.com -c commit.gpgsign=false \
    commit -q -m 'docs: папка задачи заведена' >/dev/null 2>&1
report "SC-AK-667 — папка, заведённая в историю, правку пропускает" \
    "$(edit_at "$IN_TREE_ONLY")" PASS
rm -rf "$IN_TREE_ONLY"

# --- отказ в пользу работы ----------------------------------------------------------------
# Сломанный гард не должен мешать работать: любой неразобранный вход пропускается.
exit_code_of() {
    printf '%s' "$2" | "$HOOKS/task-flow-guard.sh" >/dev/null 2>&1
    report "$1" "код:$?" "код:0"
}
exit_code_of "пустой вход пропускается" ''
exit_code_of "неразбираемый вход пропускается" 'не json'
exit_code_of "чтение файла гарду безразлично" "$(jq -n --arg d "$REPO" '{session_id:"tests",tool_name:"Read",tool_input:{file_path:"a.ts"},cwd:$d}')"

# SC-AK-908 — ключи папки задачи читаются под английским именем: образец пакета английский,
# папки дерева до перевода — русские, и гард принимает оба.
printf '# Progress\n\n## Where we stand\n\n- **State:** `этап-идёт`\n' > "$TASK/progress.md"
t "SC-AK-908 — английский ключ состояния читается" "$CODE" PASS
printf '# Progress\n\n## Where we stand\n\n- **State:** `задача-взята`\n' > "$TASK/progress.md"
t "SC-AK-908 — и состояние вне правки кода отбивается по нему же" "$CODE" deny
state_is 'этап-идёт'

# Не репозиторий вовсе — пропуск: гард судит по ветке, а её тут нет.
BARE="$(mktemp -d)"
mkdir -p "$BARE/libs/site/x/ui/src/lib"
out="$(jq -n --arg f "$BARE/libs/site/x/ui/src/lib/a.component.ts" --arg d "$BARE" \
    '{session_id:"tests",tool_name:"Edit",tool_input:{file_path:$f},cwd:$d}' | "$HOOKS/task-flow-guard.sh" 2>/dev/null)"
[ -z "$out" ] && report "вне репозитория пропускается" PASS PASS || report "вне репозитория пропускается" deny PASS
rm -rf "$BARE"

suite_result "гард замысла"
