#!/usr/bin/env bash
# Сценарии набора гейта пуша против набора конвейера, очереди работ без токена машинной записи
# и внешних наборов, которые ищутся разрешением модуля.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: гейт пуша"

# --- SC-AK-114…118 — набор гейта пуша против набора конвейера --------------------------------
#
# Файл конвейера машиной не толкуется: проверка берёт оттуда только имена шагов, а чем каждое
# закрыто, объявляет дерево. Профиль здесь настоящий — тот же, который зовёт гард пуша.

GATE_TREE="$(mktemp -d)"
mkdir -p "$GATE_TREE/tools" "$GATE_TREE/.claude/rt-kit" "$GATE_TREE/.github/workflows"
cp "$CHECKS/rt-kit-checks.config.mjs" "$CHECKS/check-push-gate.mjs" "$GATE_TREE/tools/"

printf '%s\n' 'jobs:' '    check:' '        steps:' \
    '            - name: Lint' '              run: npm run lint' \
    '            - name: Build' '              run: npm run build' > "$GATE_TREE/.github/workflows/ci.yml"

# Профиль дерева печатает набор гейта — проверка спрашивает его же оболочкой, а не переписывает
# список себе: два списка одного набора расходятся молча.
gate_profile() {
    printf '%s\n' 'rt_push_checks() {' "    printf '%s\\n' \"$1\"" '}' > "$GATE_TREE/.claude/rt-kit/project.sh"
}
gate_config() {
    printf '%s\n' "$1" > "$GATE_TREE/.claude/rt-kit/checks.json"
}
gate_says() {
    (cd "$GATE_TREE" && node tools/check-push-gate.mjs 2>&1) | grep -cE "$1"
}
gate_code() {
    (cd "$GATE_TREE" && node tools/check-push-gate.mjs >/dev/null 2>&1)
    printf '%s' "$?"
}

gate_profile 'npm run lint'

# SC-AK-118 — дерево без файла конвейера сверку не получает
gate_config '{"pushGate":{"pipelineFile":".github/workflows/nope.yml"}}'
report "SC-AK-118 — конвейера нет: проверка молчит" "$(gate_code)" 0
report "SC-AK-118 — сказано, почему пропущено" "$(gate_says 'the tree has no pipeline file')" 1

# SC-AK-114 — необъявленный шаг конвейера отбивает пуш
gate_config '{"pushGate":{"pipelineFile":".github/workflows/ci.yml","steps":{"Lint":"npm run lint"}}}'
report "SC-AK-114 — необъявленный шаг отбит" "$(gate_code)" 1
report "SC-AK-114 — отказ называет шаг" "$(gate_says 'the pipeline step «Build» is not declared')" 1

# SC-AK-115 — объявленное исключение пуш не отбивает
gate_config '{"pushGate":{"pipelineFile":".github/workflows/ci.yml","steps":{"Lint":"npm run lint","Build":{"skip":"дольше секунд, гоняется конвейером"}}}}'
report "SC-AK-115 — исключение с причиной не отбивает" "$(gate_code)" 0
report "SC-AK-115 — исключение сосчитано" "$(gate_says 'declared as exclusions 1')" 1

# SC-AK-116 — исключение без причины расхождением остаётся
gate_config '{"pushGate":{"pipelineFile":".github/workflows/ci.yml","steps":{"Lint":"npm run lint","Build":{"skip":"  "}}}}'
report "SC-AK-116 — пустая причина отбита" "$(gate_code)" 1
report "SC-AK-116 — отказ требует причину" "$(gate_says 'an exclusion without a reason')" 1

# SC-AK-117 — объявленная строка, которой нет в наборе, краснеет
gate_config '{"pushGate":{"pipelineFile":".github/workflows/ci.yml","steps":{"Lint":"npm run lint","Build":"npm run build"}}}'
report "SC-AK-117 — строка вне набора отбита" "$(gate_code)" 1
report "SC-AK-117 — отказ называет строку" "$(gate_says 'the gate set does not print it')" 1

# Та же настройка при наборе, который эту строку печатает, расхождением не является.
gate_profile 'npm run lint
    npm run build'
report "SC-AK-117 — строка в наборе принята" "$(gate_code)" 0

# Объявление шага, которого в конвейере нет, — устаревшее: иначе список копит мёртвое.
gate_config '{"pushGate":{"pipelineFile":".github/workflows/ci.yml","steps":{"Lint":"npm run lint","Build":"npm run build","Gone":"npm run gone"}}}'
report "гейт: устаревшее объявление названо" "$(gate_says 'the declaration «Gone» is stale')" 1

# --- SC-AK-707…709 — живость задачи, названной причиной исключения ---------------------------
#
# Причина, называющая задачу сроком, читается как отсрочка с назначенным концом. Очередь работ
# ищется разрешением модуля: дерева на другом хостинге у неё нет, и оно судится как прежде.
gate_profile 'npm run lint
    npm run build'
gate_config '{"board":{"taskKey":"RT"},"pushGate":{"pipelineFile":".github/workflows/ci.yml","steps":{"Lint":"npm run lint","Build":{"skip":"до RT-663"}}}}'

# SC-AK-709 — очереди работ у дерева нет: проверка судит как прежде
report "SC-AK-709 — без очереди работ проверка молчит" "$(gate_code)" 0

# Подставная очередь: живой номер один, остальные не заведены.
printf '%s\n' 'export function taskState(number) {' '    return { exists: number === 663 };' '}' > "$GATE_TREE/tools/board.mjs"

# SC-AK-707 — живой номер отсрочку не отбивает
report "SC-AK-707 — живая задача в причине проходит" "$(gate_code)" 0

# SC-AK-708 — мёртвый номер делает отсрочку бессрочной
gate_config '{"board":{"taskKey":"RT"},"pushGate":{"pipelineFile":".github/workflows/ci.yml","steps":{"Lint":"npm run lint","Build":{"skip":"до RT-664"}}}}'
report "SC-AK-708 — мёртвая задача в причине отбита" "$(gate_code)" 1
report "SC-AK-708 — отказ называет номер" "$(gate_says 'postponed until the task RT-664')" 1

# Отказ очереди работ проверку не роняет: гоняют её и без сети.
printf '%s\n' 'export function taskState() {' "    throw new Error('нет сети');" '}' > "$GATE_TREE/tools/board.mjs"
report "SC-AK-709 — отказ очереди работ проверку не роняет" "$(gate_code)" 0

rm -rf "$GATE_TREE"

# --- SC-AK-198 — очередь работ обходится без токена машинной записи -----------------------
#
# Хостинг спрашивается подставным клиентом: он записывает, пришёл ли к нему свой токен, и
# отвечает отказом. Проверяется не ответ борды, а то, докуда дошёл вызов: прежде он кончался
# на требовании токена и до хостинга не доходил вовсе.
BOARD_TREE="$(mktemp -d)"
mkdir -p "$BOARD_TREE/tools" "$BOARD_TREE/.claude/rt-kit" "$BOARD_TREE/bin"
cp "$CHECKS/rt-kit-checks.config.mjs" "$CHECKS/board.github.mjs" "$CHECKS/board-gh.github.mjs" "$BOARD_TREE/tools/"
cp "$CHECKS/board-epic-link.github.mjs" "$BOARD_TREE/tools/board-epic-link.mjs"
cp "$CHECKS/board-task-dirs.github.mjs" "$BOARD_TREE/tools/board-task-dirs.mjs"
mv "$BOARD_TREE/tools/board.github.mjs" "$BOARD_TREE/tools/board.mjs"
mv "$BOARD_TREE/tools/board-gh.github.mjs" "$BOARD_TREE/tools/board-gh.mjs"

printf '%s\n' '#!/usr/bin/env bash' \
    'if [ -n "${GH_TOKEN:-}" ]; then echo "свой" > "$GH_SEEN"; else echo "залогиненный" > "$GH_SEEN"; fi' \
    'echo "нет доступа" >&2' \
    'exit 1' > "$BOARD_TREE/bin/gh"
chmod +x "$BOARD_TREE/bin/gh"

printf '%s\n' '{"board":{"owner":"o","repo":"r","projectId":"P","statusFieldId":"F","statusOptions":{"in-progress":{"id":"i","name":"In progress"}},"taskKey":"RT"}}' \
    > "$BOARD_TREE/.claude/rt-kit/checks.json"

# Токен машинной записи снимается с окружения на время вызова: проба судит настройку фикстуры, а
# не машину. Живой заход держит его в окружении, и без снятия проба читала бы чужой токен своим.
board_move() {
    (cd "$BOARD_TREE" && env -u GH_TOKEN -u GITHUB_TOKEN GH_BIN="$BOARD_TREE/bin/gh" \
        GH_SEEN="$BOARD_TREE/seen" node tools/board.mjs move 1 in-progress 2>&1)
}

BOARD_SAID="$(board_move)"
report "SC-AK-198 — токена не требует" "$(printf '%s' "$BOARD_SAID" | grep -c 'нет токена бота')" 0
report "SC-AK-198 — хостинг спрошен" "$(cat "$BOARD_TREE/seen" 2>/dev/null)" 'залогиненный'

rm -rf "$BOARD_TREE"

# --- SC-AK-244 и SC-AK-245 — внешние наборы ищутся разрешением модуля ------------------------
#
# Пакет, объявленный зависимостью подпроекта, в корневом `node_modules` не лежит вовсе: менеджер
# держит его в своём хранилище, и зашитый путь на такой раскладке верным не бывает никогда. До
# правки проверка кончалась отказом чтения каталога, не дойдя до сверки ни разу.

DUPES_TREE="$(mktemp -d)"
mkdir -p "$DUPES_TREE/tools" "$DUPES_TREE/.claude/rt-kit" \
    "$DUPES_TREE/projects/kit/src" "$DUPES_TREE/projects/kit/node_modules/@ext/sets/decl"
cp "$CHECKS/rt-kit-checks.config.mjs" "$CHECKS/check-dupes.mjs" "$DUPES_TREE/tools/"
printf '{"accepted":{},"debt":{}}\n' > "$DUPES_TREE/tools/dupes-allowlist.json"
printf '{"sourceRoots":["projects"],"externalEnums":[{"package":"@ext/sets","dir":"decl"}]}\n' \
    > "$DUPES_TREE/.claude/rt-kit/checks.json"

# Пакет объявлен подпроектом и лежит внутри него — в корне дерева его нет.
printf '{"name":"kit","dependencies":{"@ext/sets":"^1.0.0"}}\n' > "$DUPES_TREE/projects/kit/package.json"
printf '{"name":"@ext/sets","version":"1.0.0"}\n' \
    > "$DUPES_TREE/projects/kit/node_modules/@ext/sets/package.json"
printf 'export declare enum Direction { ASC = "asc", DESC = "desc" }\n' \
    > "$DUPES_TREE/projects/kit/node_modules/@ext/sets/decl/order.d.ts"
# Своё перечисление под тем же набором членов — та же копия, что и между двумя либами.
printf 'export enum SortWay {\n    Asc = "asc",\n    Desc = "desc",\n}\n' \
    > "$DUPES_TREE/projects/kit/src/sort.ts"

dupes_says() {
    (cd "$DUPES_TREE" && node tools/check-dupes.mjs 2>&1)
}

report "SC-AK-244 — набор из пакета подпроекта найден" "$(dupes_says | grep -c 'one set of members')" 1
report "SC-AK-244 — отказа чтения каталога нет" "$(dupes_says | grep -c 'ENOENT')" 0

# SC-AK-245 — пакета нет вовсе: сверка своих повторов идёт, отказа нет.
rm -rf "$DUPES_TREE/projects/kit/node_modules"
report "SC-AK-245 — без пакета проверка не падает" "$(dupes_says | grep -c 'ENOENT')" 0
(cd "$DUPES_TREE" && node tools/check-dupes.mjs >/dev/null 2>&1)
report "SC-AK-245 — без пакета код нулевой" "$?" 0

rm -rf "$DUPES_TREE"

suite_result "проверки: гейт пуша"
