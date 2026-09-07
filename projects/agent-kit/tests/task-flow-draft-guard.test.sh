#!/usr/bin/env bash
# Сценарии гарда договорённости: код не пишется раньше договорённости о продукте.
#
# Гард требует одно и ровно одно — замысел называет договорённость строкой `**Драфт:**`, и
# названное существует на диске либо было в истории ветки. Папка задачи, сам замысел и
# объявленное состояние — требования соседнего гарда, и здесь проверяется, что чужого этот гард
# не отбивает: замысла нет — он молчит.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард договорённости"

REPO="$(fixture_repo RT-1-probe)"
export CLAUDE_PROJECT_DIR="$REPO"
cleanup() { rm -rf "$REPO"; }
trap cleanup EXIT

TASK="$REPO/docs/tasks/RT-1-probe"
mkdir -p "$TASK" "$REPO/libs/site/x/ui/src/lib" "$REPO/docs/specs/x/proposed/y"
printf '# Домен x\n' > "$REPO/docs/specs/x/spec.md"
CODE="$REPO/libs/site/x/ui/src/lib/a.component.ts"

# Вход правки с рабочим каталогом: ветку гард смотрит там, где пойдёт правка.
edit_in() {
    jq -n --arg f "$1" --arg d "$REPO" --arg t "${2:-Edit}" \
        '{session_id:"tests",tool_name:$t,tool_input:{file_path:$f},cwd:$d}'
}

t() { expect_decision "$1" task-flow-draft-guard.sh "$(edit_in "$2" "${4:-Edit}")" "$3"; }

# --- чужого не отбивает -------------------------------------------------------------------
# Состояние работы, ход работы и наличие папки этот гард не судит вовсе: отказ о них печатает
# соседний, и второй отказ о том же говорил бы исполнителю чинить дважды одно.
t "SC-AK-743 — замысла нет, и гард договорённости молчит" "$CODE" PASS

# Признак «правка меняет поведение» — путь: тексты и обвязка под требование не попадают.
printf '# Замысел\n\nбез шапки\n' > "$TASK/plan.md"
t "текст проекта правится без договорённости" "$REPO/docs/adr/0001-x.md" PASS
t "обвязка правится без договорённости" "$REPO/tools/check-x.mjs" PASS

# --- договорённость в замысле --------------------------------------------------------------
t "замысел без договорённости отбивается" "$CODE" deny
expect_reason "и отбивается именно за договорённость" task-flow-draft-guard.sh \
    "$(edit_in "$CODE")" 'no product agreement is named'

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

# SC-AK-736 — договорённость называется и спеком домена
# Дерево, у которого каталога «предложено» нет, пишет договорённость прямо в спек: требовать один
# вид записи значит навязывать способ вместе с проверкой того, что работа идёт по замыслу — и
# такое дерево отказывается от гарда целиком.
printf '# Замысел\n\n**Спек:** `docs/specs/x/spec.md`\n' > "$TASK/plan.md"
t "SC-AK-736 — спек домена назван договорённостью" "$CODE" PASS

printf '# Замысел\n\n**Спек:** `docs/specs/x/нет-такого.md`\n' > "$TASK/plan.md"
t "SC-AK-736 — названный спек обязан существовать" "$CODE" deny

printf '# Замысел\n\nни одной строки о договорённости\n' > "$TASK/plan.md"
t "SC-AK-736 — без обеих строк отказ прежний" "$CODE" deny

# Влитая договорённость с диска уходит, а замысел на неё ссылается до конца работы: без этой
# развилки последний коммит PR запирал бы ветку — ни правки по замечаниям разбора, ни
# записи в журнал изменений после вливания. Влитое от незаведённого отличает история ветки.
fixture_commit "$REPO" 'docs/specs/x/proposed/merged/spec.md' '# Договорённость' 'docs: договорённость'
printf '# Замысел\n\n**Драфт:** `docs/specs/x/proposed/merged/`\n' > "$TASK/plan.md"
fixture_remove "$REPO" 'docs/specs/x/proposed/merged' 'docs: договорённость влита'
t "SC-AK-31 — влитая договорённость ветку не запирает" "$CODE" PASS

printf '# Замысел\n\n**Драфт:** `docs/specs/x/proposed/никогда-не-было/`\n' > "$TASK/plan.md"
t "SC-AK-32 — договорённости не было ни на диске, ни в истории" "$CODE" deny

# SC-AK-755 — вливание, бывшее первым коммитом пути, ветку не запирает
# Черновик писали, не коммитя: в историю уехал уже спек домена, и истории у названного пути нет
# вовсе. Работа при этом сделана ровно так, как велит паттерн закрытия.
mkdir -p "$REPO/docs/specs/x/merged-first"
printf '# Спек домена\n\nФича `влитая-сразу` описана здесь.\n' > "$REPO/docs/specs/x/merged-first/spec.md"
printf '# Замысел\n\n**Драфт:** `docs/specs/x/proposed/влитая-сразу/`\n' > "$TASK/plan.md"
t "SC-AK-755 — спек домена с именем фичи снимает отказ" "$CODE" PASS
rm -rf "$REPO/docs/specs/x/merged-first"
printf '# Замысел\n\n**Драфт:** `docs/specs/x/proposed/влитая-сразу/`\n' > "$TASK/plan.md"
t "SC-AK-755 — без такого спека отказ остаётся" "$CODE" deny

# --- вторая дверь: та же правка командой оболочки ------------------------------------------
# Гард, подписанный на инструмент правки, обходится сменой способа записи.
bash_in() {
    jq -n --arg c "$1" --arg d "$REPO" \
        '{session_id:"tests",tool_name:"Bash",tool_input:{command:$c},cwd:$d}'
}
b() { expect_decision "$1" task-flow-draft-guard.sh "$(bash_in "$2")" "$3"; }

printf '# Замысел\n\nбез шапки\n' > "$TASK/plan.md"
b "SC-AK-744 — запись командой оболочки отбивается и здесь" \
    "echo x > libs/site/x/ui/src/lib/a.component.ts" deny
b "чтение кода пропускается" "cat libs/site/x/ui/src/lib/a.component.ts" PASS

printf '# Замысел\n\n**Драфт:** `docs/specs/x/proposed/y/`\n' > "$TASK/plan.md"
b "с договорённостью команда оболочки пропускается" \
    "echo x > libs/site/x/ui/src/lib/a.component.ts" PASS

# --- отказ в пользу работы ----------------------------------------------------------------
# Сломанный гард не должен мешать работать: любой неразобранный вход пропускается.
exit_code_of() {
    printf '%s' "$2" | "$HOOKS/task-flow-draft-guard.sh" >/dev/null 2>&1
    report "$1" "код:$?" "код:0"
}
exit_code_of "пустой вход пропускается" ''
exit_code_of "неразбираемый вход пропускается" 'не json'
exit_code_of "чтение файла гарду безразлично" "$(jq -n --arg d "$REPO" '{session_id:"tests",tool_name:"Read",tool_input:{file_path:"a.ts"},cwd:$d}')"

# SC-AK-908 — строки замысла читаются под английским именем наравне с русским: образцы папки
# задачи в пакете английские, а папки дерева до перевода остаются русскими.
printf '# Plan\n\n**Behaviour:** unchanged — a move of the rules layer. Confirmed by the owner.\n' > "$TASK/plan.md"
t "SC-AK-908 — английская строка о неизменном поведении принята" "$CODE" PASS
printf '# Plan\n\n**Draft:** `docs/specs/x/proposed/y/`\n' > "$TASK/plan.md"
t "SC-AK-908 — английская строка договорённости принята" "$CODE" PASS

# Не репозиторий вовсе — пропуск: гард судит по ветке, а её тут нет.
BARE="$(mktemp -d)"
mkdir -p "$BARE/libs/site/x/ui/src/lib"
out="$(jq -n --arg f "$BARE/libs/site/x/ui/src/lib/a.component.ts" --arg d "$BARE" \
    '{session_id:"tests",tool_name:"Edit",tool_input:{file_path:$f},cwd:$d}' | "$HOOKS/task-flow-draft-guard.sh" 2>/dev/null)"
[ -z "$out" ] && report "вне репозитория пропускается" PASS PASS || report "вне репозитория пропускается" deny PASS
rm -rf "$BARE"

suite_result "гард договорённости"
