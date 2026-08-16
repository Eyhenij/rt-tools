#!/usr/bin/env bash
# Сценарии гарда замысла: код не пишется раньше замысла.
#
# Гард требует три вещи и ровно их — папку задачи по имени ветки, замысел в ней и названную в
# замысле договорённость о продукте. Полноту написанного он не судит, и набор тоже: проверяется,
# что каждое из трёх требований отбивает своё и ни одно не отбивает чужое.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард замысла"

REPO="$(fixture_repo RT-1-probe)"
export CLAUDE_PROJECT_DIR="$REPO"
cleanup() { rm -rf "$REPO"; }
trap cleanup EXIT

TASK="$REPO/docs/tasks/RT-1-probe"
mkdir -p "$TASK" "$REPO/libs/site/x/ui/src/lib" "$REPO/docs/specs/x/proposed/y"
CODE="$REPO/libs/site/x/ui/src/lib/a.component.ts"

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
# Текст под требование не подпадает — ни инструментом, ни командой.
b "запись в текст проекта пропускается" "echo x > docs/adr/0001-x.md" PASS

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
