#!/usr/bin/env bash
# Сценарии гарда замысла: код не пишется раньше замысла.
#
# Гард требует четыре вещи и ровно их — папку задачи по имени ветки, замысел в ней, объявленное
# в ходе работы состояние из тех, в которых код правится, и названную в замысле договорённость о
# продукте. Полноту написанного он не судит, и набор тоже: проверяется, что каждое из четырёх
# требований отбивает своё и ни одно не отбивает чужое.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард замысла"

REPO="$(fixture_repo RT-1-probe)"
export CLAUDE_PROJECT_DIR="$REPO"
cleanup() { rm -rf "$REPO"; }
trap cleanup EXIT

TASK="$REPO/docs/tasks/RT-1-probe"
mkdir -p "$TASK" "$REPO/libs/site/x/ui/src/lib" "$REPO/docs/specs/x/proposed/y"
CODE="$REPO/libs/site/x/ui/src/lib/a.component.ts"

# Состояние работы объявляется строкой в ходе работы. Ярусы ниже судят замысел и договорённость,
# и без объявленного состояния каждый из них отбивался бы не своей причиной.
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

# --- состояние работы -------------------------------------------------------------------
# Артефакт на диске не говорит, дошла ли работа до правки кода: пустой замысел, положенный ради
# снятия отказа, лежит так же, как написанный. Судится объявленный переход.
printf '# Замысел\n\n**Поведение:** не меняется — правка обвязки. Подтверждено владельцем.\n' > "$TASK/plan.md"

rm -f "$TASK/progress.md"
t "SC-AK-295 — папка без хода работы правку не пропускает" "$CODE" deny
expect_reason "и отбивается именно за ход работы" task-flow-guard.sh "$(edit_in "$CODE")" 'нет хода работы'

printf '# Ход работы\n\n## Где стоим\n\n- **Этап:** 1 из 2\n' > "$TASK/progress.md"
t "SC-AK-288 — состояние не объявлено, и артефакт отказ не снимает" "$CODE" deny
expect_reason "и отбивается именно за необъявленное состояние" task-flow-guard.sh "$(edit_in "$CODE")" 'не объявлено состояние'

# Обход договорённости снимает требование договорённости, а не требование дойти до правки кода:
# в замысле выше как раз стоит строка о неизменном поведении.
state_is 'замысел-записан'
t "SC-AK-294 — обход договорённости требования о состоянии не снимает" "$CODE" deny
expect_reason "SC-AK-289 — отказ называет обязательное действие состояния" task-flow-guard.sh \
    "$(edit_in "$CODE")" 'делать первый этап'

state_is 'влито'
t "SC-AK-292 — состояние закрытой работы отбивается" "$CODE" deny

state_is 'работа-сделана-как-то-так'
t "SC-AK-293 — имя вне перечня состоянием не считается" "$CODE" deny
expect_reason "и отбивается именно за имя вне перечня" task-flow-guard.sh "$(edit_in "$CODE")" 'такого в перечне нет'

state_is 'этап-идёт'
t "SC-AK-290 — в состоянии идущего этапа правка проходит" "$CODE" PASS

# Прогон бывает красным, а разбор — с замечаниями: починка идёт в ту же ветку, и правка кода
# после отдачи работы законна.
state_is 'работа-отдана'
t "SC-AK-291 — правка по замечаниям в отданной работе проходит" "$CODE" PASS

state_is 'этап-идёт'

# --- замысел на диске -------------------------------------------------------------------
printf '# Замысел\n\nбез шапки\n' > "$TASK/plan.md"
t "замысел без договорённости отбивается" "$CODE" deny

# Пустая причина обхода не принимается: без неё обход становится умолчанием.
printf '# Замысел\n\n**Поведение:** не меняется —\n' > "$TASK/plan.md"
t "обход с пустой причиной отбивается" "$CODE" deny

printf '# Замысел\n\n**Поведение:** не меняется — переезд слоя. Подтверждено владельцем.\n' > "$TASK/plan.md"
t "обход с причиной пропускает" "$CODE" PASS

# Названная договорённость обязана существовать на диске: путь в шапке устаревает молча.
printf '# Замысел\n\n**Драфт:** `docs/specs/x/proposed/нет-такой/`\n' > "$TASK/plan.md"
t "договорённость названа, но её нет" "$CODE" deny

printf '# Замысел\n\n**Драфт:** `docs/specs/x/proposed/y/`\n' > "$TASK/plan.md"
t "договорённость названа и лежит" "$CODE" PASS

# Влитая договорённость с диска уходит, а замысел на неё ссылается до конца работы: без этой
# развилки последний коммит PR запирал бы ветку — ни правки по замечаниям разбора, ни
# записи в журнал изменений после вливания. Влитое от незаведённого отличает история ветки.
fixture_commit "$REPO" 'docs/specs/x/proposed/merged/spec.md' '# Договорённость' 'docs: договорённость'
printf '# Замысел\n\n**Драфт:** `docs/specs/x/proposed/merged/`\n' > "$TASK/plan.md"
fixture_remove "$REPO" 'docs/specs/x/proposed/merged' 'docs: договорённость влита'
t "SC-AK-31 — влитая договорённость ветку не запирает" "$CODE" PASS

printf '# Замысел\n\n**Драфт:** `docs/specs/x/proposed/никогда-не-было/`\n' > "$TASK/plan.md"
t "SC-AK-32 — договорённости не было ни на диске, ни в истории" "$CODE" deny

# --- имя ветки ---------------------------------------------------------------------------
git -C "$REPO" checkout -q -b probe-without-number 2>/dev/null
t "ветка без номера задачи отбивается" "$CODE" deny
expect_reason "и отбивается именно за имя ветки" task-flow-guard.sh "$(edit_in "$CODE")" 'текущая ветка'

# Приставка рода правки с номером имя ветки проходит: дальше гард спрашивает уже про замысел, и
# отказ обязан говорить про него, а не про ветку. Иначе исполнитель чинит не то.
git -C "$REPO" checkout -q -b fix/2-probe 2>/dev/null
expect_reason "имя ветки принято — спрос идёт про замысел" task-flow-guard.sh "$(edit_in "$CODE")" 'нет замысла'
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
b "SC-AK-433 — поиск с заглушённым потоком ошибок пропускается" \
    "grep -rn xyz libs/site/x/ui/src/lib/ 2>/dev/null" PASS
b "SC-AK-434 — чтение с выводом в пустое устройство пропускается" \
    "cat libs/site/x/ui/src/lib/a.component.ts > /dev/null" PASS
b "SC-AK-435 — сведение потоков при чтении пропускается" \
    "cat libs/site/x/ui/src/lib/a.component.ts 2>&1" PASS
# Настоящая запись рядом с заглушённым потоком остаётся видной.
b "SC-AK-436 — запись рядом с пустым устройством отбивается" \
    "echo x > libs/site/x/ui/src/lib/a.component.ts 2>/dev/null" deny
# Текст под требование не подпадает — ни инструментом, ни командой.
b "запись в текст проекта пропускается" "echo x > docs/adr/0001-x.md" PASS
# Тело документа на месте — текст, а не команда: путь, названный в нём словами, правила под
# запись не требует. Путь, куда команда пишет, стоит в её заголовке и судится по-прежнему.
b "SC-AK-437 — чужой путь в теле документа на месте правила не требует" \
    "cat > docs/adr/0002-x.md <<'MD'
Компонент лежит в libs/site/x/ui/src/lib/a.component.ts
MD" PASS
b "SC-AK-438 — путь в заголовке команды с документом на месте отбивается" \
    "cat > libs/site/x/ui/src/lib/a.component.ts <<'TS'
export class A {}
TS" deny

# Замысел на месте — обе двери открыты одинаково.
printf '# Замысел\n\n**Поведение:** не меняется — переезд слоя. Подтверждено владельцем.\n' > "$TASK/plan.md"
b "с замыслом команда оболочки пропускается" "echo x > libs/site/x/ui/src/lib/a.component.ts" PASS
t "с замыслом инструмент правки пропускается" "$CODE" PASS

# --- отказ в пользу работы ----------------------------------------------------------------
# Сломанный гард не должен мешать работать: любой неразобранный вход пропускается.
exit_code_of() {
    printf '%s' "$2" | "$HOOKS/task-flow-guard.sh" >/dev/null 2>&1
    report "$1" "код:$?" "код:0"
}
exit_code_of "пустой вход пропускается" ''
exit_code_of "неразбираемый вход пропускается" 'не json'
exit_code_of "чтение файла гарду безразлично" "$(jq -n --arg d "$REPO" '{session_id:"tests",tool_name:"Read",tool_input:{file_path:"a.ts"},cwd:$d}')"

# Не репозиторий вовсе — пропуск: гард судит по ветке, а её тут нет.
BARE="$(mktemp -d)"
mkdir -p "$BARE/libs/site/x/ui/src/lib"
out="$(jq -n --arg f "$BARE/libs/site/x/ui/src/lib/a.component.ts" --arg d "$BARE" \
    '{session_id:"tests",tool_name:"Edit",tool_input:{file_path:$f},cwd:$d}' | "$HOOKS/task-flow-guard.sh" 2>/dev/null)"
[ -z "$out" ] && report "вне репозитория пропускается" PASS PASS || report "вне репозитория пропускается" deny PASS
rm -rf "$BARE"

suite_result "гард замысла"
