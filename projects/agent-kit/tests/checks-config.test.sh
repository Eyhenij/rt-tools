#!/usr/bin/env bash
# Сценарии проверок: настройка, которую они читают все разом, — умолчания пакета, надстройка
# дерева, обход папок задач и ответ очереди работ о заведённой задаче.
#
# Проверки везёт пакет, а корни и имена — своё у каждого дерева. Всё, что здесь проверяется,
# про эту границу: что берётся из настройки, что остаётся умолчанием и что происходит с
# надстройкой, назвавшей один ключ вложенного объекта.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: настройка"

# Настройки читаются относительно каталога, где лежит сам файл настроек, — поэтому фикстура
# повторяет раскладку дерева: `tools/` с проверками и `.claude/rt-kit/` с надстройкой.
TREE="$(mktemp -d)"
mkdir -p "$TREE/tools" "$TREE/.claude/rt-kit"
cp "$CHECKS/rt-kit-checks.config.mjs" "$TREE/tools/"
cleanup() { rm -rf "$TREE"; }
trap cleanup EXIT

# Значение ключа настроек как его увидит проверка. Путь ключа — через точку.
value_of() {
    node --input-type=module -e "
        import { CONFIG } from '${TREE}/tools/rt-kit-checks.config.mjs';
        const path = process.argv[1].split('.');
        let found = CONFIG;
        for (const key of path) { found = found?.[key]; }
        console.log(JSON.stringify(found));
    " "$1" 2>/dev/null
}

# --- без надстройки действуют умолчания -------------------------------------------------
report "умолчание: корни исходников" "$(value_of sourceRoots)" '["apps","libs"]'
report "умолчание: ключ задач пуст" "$(value_of board.taskKey)" '""'

# --- надстройка ложится поверх ------------------------------------------------------------
printf '{"sourceRoots":["projects"]}\n' > "$TREE/.claude/rt-kit/checks.json"
report "надстройка: свои корни" "$(value_of sourceRoots)" '["projects"]'
# Назвав корни, дерево не теряет остального: иначе надстройка обязана была бы повторить весь
# конфиг, и любое умолчание, добавленное пакетом позже, до неё бы не доехало.
report "надстройка: соседний ключ цел" "$(value_of docsDir)" '"docs"'

# --- вложенный объект сливается по ключам ---------------------------------------------------
# Дерево, назвавшее один ключ борды, теряло остальные и видело это отказом «нет токена бота» —
# то есть читало неполный конфиг как неполадку машины.
printf '{"board":{"taskKey":"RT"}}\n' > "$TREE/.claude/rt-kit/checks.json"
report "вложенное: названный ключ пришёл" "$(value_of board.taskKey)" '"RT"'
report "вложенное: соседние ключи целы" "$(value_of board.bot)" '""'
report "вложенное: сам объект не пропал" "$(value_of board.reviewer)" '""'

# --- обход папок задач ---------------------------------------------------------------------
#
# Папка задачи повторяет имя ветки буквально, вместе с косой, поэтому под формой с родом правки
# впереди она лежит вложенным каталогом. Обход только по верхнему уровню её не видел вовсе:
# невидимую нашли грепом, а не сверкой. Сеть здесь не нужна — потому обход и живёт в модуле
# борды отдельно от запросов к ней.
printf '{"board":{"taskKey":"RT"},"tasksDir":"docs/tasks"}\n' > "$TREE/.claude/rt-kit/checks.json"
cp "$CHECKS/board.github.mjs" "$TREE/tools/board.mjs"
mkdir -p "$TREE/docs/tasks/RT-40-plain" "$TREE/docs/tasks/chore/41-nested" \
    "$TREE/docs/tasks/_template" "$TREE/docs/tasks/_draft-idea" "$TREE/docs/tasks/archive/2026"

dirs_seen() {
    node --input-type=module -e "
        import { taskDirs } from '${TREE}/tools/board.mjs';
        console.log(taskDirs().sort().join(' '));
    " 2>/dev/null
}

report "SC-AK-20 — обход: папка верхнего уровня" "$(dirs_seen | grep -o 'RT-40-plain')" 'RT-40-plain'
report "SC-AK-20 — обход: вложенная папка старой формы" "$(dirs_seen | grep -o 'chore/41-nested')" 'chore/41-nested'
report "обход: черновик разбора виден" "$(dirs_seen | grep -o '_draft-idea')" '_draft-idea'
report "SC-AK-20 — обход: образец не считается папкой задачи" "$(dirs_seen | grep -c '_template')" '0'
# Каталог, не назвавшийся ни номером, ни черновиком, папкой задачи не бывает: внутрь него
# сверка спускается, но сам он в перечень не идёт — иначе туда попал бы и архив.
report "обход: промежуточный каталог не папка задачи" "$(dirs_seen | grep -cE '(^| )chore( |$)')" '0'
report "SC-AK-20 — обход: архив внутри каталога задач не задет" "$(dirs_seen | grep -c 'archive')" '0'

num_of() {
    node --input-type=module -e "
        import { numberFromTaskDir } from '${TREE}/tools/board.mjs';
        console.log(JSON.stringify(numberFromTaskDir(process.argv[1])));
    " "$1" 2>/dev/null
}

report "номер: ключ впереди" "$(num_of RT-336-guard-folder)" '336'
# Форма с родом правки впереди законна, и папка под ней зовётся голым числом.
report "SC-AK-20 — номер: голое число" "$(num_of 312-sync-agent-kit)" '312'
report "номер: имя без номера" "$(num_of chore)" 'null'

rm -rf "$TREE/docs" "$TREE/tools/board.mjs"

# --- ответ очереди работ о заведённой задаче ---------------------------------------------------
#
# Заведение кончается ответом очереди, а не выводом команды: шестнадцать заведений подряд
# напечатали номер со ссылкой, и ни одно не попало в очередь. Решение о том, что сказать и чем
# кончиться, вынесено из вызовов сети — иначе оно проверяется только живой бордой.
printf '{"board":{"taskKey":"RT"}}\n' > "$TREE/.claude/rt-kit/checks.json"
cp "$CHECKS/board.github.mjs" "$TREE/tools/board.mjs"

answer_for() {
    node --input-type=module -e "
        import { describeTaskState } from '${TREE}/tools/board.mjs';
        const answer = describeTaskState(565, JSON.parse(process.argv[1]));
        console.log([answer.ok ? 'ok' : 'нет', ...answer.lines].join(' | '));
    " "$1" 2>/dev/null
}

ON_BOARD='{"exists":true,"onBoard":true,"status":"Backlog","assigned":true,"assignees":["bot"]}'
report "SC-AK-152 — ответ очереди: задача в очереди" "$(answer_for "$ON_BOARD" | cut -d' ' -f1)" 'ok'
report "SC-AK-152 — ответ очереди: названа колонка" "$(answer_for "$ON_BOARD" | grep -c 'колонка «Backlog»')" '1'
report "SC-AK-152 — ответ очереди: назван исполнитель" "$(answer_for "$ON_BOARD" | grep -c 'исполнитель bot')" '1'

OFF_BOARD='{"exists":true,"onBoard":false,"status":null,"assigned":true,"assignees":["bot"]}'
report "SC-AK-153 — задача вне очереди: приговор" "$(answer_for "$OFF_BOARD" | cut -d' ' -f1)" 'нет'
report "SC-AK-153 — задача вне очереди: сказано вслух" "$(answer_for "$OFF_BOARD" | grep -c 'в очереди работ: НЕТ')" '1'

NO_ASSIGNEE='{"exists":true,"onBoard":true,"status":"Backlog","assigned":false,"assignees":[]}'
report "SC-AK-154 — задача без исполнителя: приговор" "$(answer_for "$NO_ASSIGNEE" | cut -d' ' -f1)" 'нет'
report "SC-AK-154 — задача без исполнителя: сказано вслух" "$(answer_for "$NO_ASSIGNEE" | grep -c 'исполнителя нет')" '1'

report "SC-AK-155 — очередь не спрошена: приговор" "$(answer_for '{"offline":"нет связи"}' | cut -d' ' -f1)" 'нет'
report "SC-AK-155 — очередь не спрошена: причина названа" "$(answer_for '{"offline":"нет связи"}' | grep -c 'нет связи')" '1'
report "SC-AK-155 — задачи нет вовсе" "$(answer_for '{"exists":false}' | grep -c 'заведение не состоялось')" '1'

rm -f "$TREE/tools/board.mjs"

# --- список замещается целиком ----------------------------------------------------------------
# Дописывать в список нельзя: убрать из него стало бы невозможно вовсе.
printf '{"skippedDirs":["dist"]}\n' > "$TREE/.claude/rt-kit/checks.json"
report "список: замещается целиком" "$(value_of skippedDirs)" '["dist"]'

# --- битая надстройка называется, а не проглатывается -------------------------------------------
printf 'не json\n' > "$TREE/.claude/rt-kit/checks.json"
broken="$(node --input-type=module -e "import('${TREE}/tools/rt-kit-checks.config.mjs')" 2>&1 | grep -c 'не разбирается как JSON')"
report "битая надстройка названа" "$broken" 1
rm -f "$TREE/.claude/rt-kit/checks.json"

# --- корни проверок берутся из настройки, а не из кода ---------------------------------------------
# Дерево, где либы лежат не по умолчанию пакета, получало проверку, которая ходит мимо кода и
# зеленеет на пустом обходе.
for check in "$CHECKS"/*.mjs; do
    name="${check##*/}"
    [ "$name" = 'rt-kit-checks.config.mjs' ] && continue
    if grep -qE "^[^*/]*['\"\`][^'\"\`]*\b(libs|apps)(/|['\"\`])" "$check"; then
        report "без зашитых корней: $name" FAIL PASS
    else
        report "без зашитых корней: $name" PASS PASS
    fi
done

suite_result "проверки: настройка"
