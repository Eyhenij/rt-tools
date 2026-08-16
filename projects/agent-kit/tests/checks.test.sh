#!/usr/bin/env bash
# Сценарии проверок: настройки, которые они читают, и границы, которые они держат.
#
# Проверки везёт пакет, а корни и имена — своё у каждого дерева. Всё, что здесь проверяется,
# про эту границу: что берётся из настройки, что остаётся умолчанием и что происходит с
# надстройкой, назвавшей один ключ вложенного объекта.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки"

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

# --- сверка спеков: поддомены, предложенный закон, префикс по дереву -------------------------
#
# Фикстура повторяет раскладку дерева: проверки лежат в `tools/`, а тексты — там, где их ищет
# настройка. Сверка запускается целиком и судится по строкам, которые напечатала: она отвечает
# перечнем расхождений, а не кодом на каждое из них.

SPEC_TREE="$(mktemp -d)"
mkdir -p "$SPEC_TREE/tools" "$SPEC_TREE/docs/constitution" "$SPEC_TREE/.claude/skills"
cp "$CHECKS/rt-kit-checks.config.mjs" "$CHECKS/check-specs.mjs" "$SPEC_TREE/tools/"

# Заготовка спека: все обязательные разделы на месте, чтобы в выводе оставалось только то,
# ради чего сценарий заведён.
spec_body() {
    printf '# %s\n\n**Статус:** действует · **Префикс сценариев:** `SC-%s`\n**Законы:** нет\n**Процедуры:** нет\n\n' "$1" "$2"
    for heading in '## Зачем' '## Терминология' '### Как это называется в интерфейсе' '## Правила' \
        '## Что не входит' '## Контракт' '### Коды отказов' '## Данные' '## Экраны и состояния' \
        '## Сквозные требования' '### Локали' '### SEO' '### Мобильная раскладка' '### Мультиобъектность' \
        '## Решения' '## Открытые вопросы' '## История изменений'; do
        printf '%s\n\nНе применимо.\n\n' "$heading"
    done
}

spec_dir() {
    mkdir -p "$SPEC_TREE/$1"
    spec_body "$2" "$3" > "$SPEC_TREE/$1/spec.md"
    printf '# Сценарии\n\n### SC-%s-01 — первый\n\nДано раз\nКогда два\nТогда три\n' "$3" > "$SPEC_TREE/$1/scenarios.md"
    printf '# Привязка\n\n| Правило | Где исполняется |\n| --- | --- |\n' > "$SPEC_TREE/$1/implementation.md"
}

specs_says() {
    (cd "$SPEC_TREE" && node tools/check-specs.mjs 2>&1) | grep -cE "$1"
}

spec_dir docs/specs/alpha 'Альфа' AL

# SC-AK-27 — поддомен без обязательного раздела виден сверке
mkdir -p "$SPEC_TREE/docs/specs/alpha/inner"
report "SC-AK-27 — пустой поддомен назван" "$(specs_says 'поддомен описан наполовину')" 2
spec_dir docs/specs/alpha/inner 'Альфа изнутри' IN
report "SC-AK-27 — описанный поддомен молчит" "$(specs_says 'поддомен описан наполовину')" 0
report "SC-AK-27 — свой префикс поддомену законен" "$(specs_says 'больше одного префикса')" 0

# SC-AK-29 — префикс, занятый чужим спеком, — расхождение
spec_dir docs/specs/beta 'Бета' AL
report "SC-AK-29 — занятый префикс назван" "$(specs_says 'префикс .* уже занят')" 1
rm -rf "$SPEC_TREE/docs/specs/beta"

# SC-AK-30 — договорённость префикс своего домена не занимает
mkdir -p "$SPEC_TREE/docs/specs/alpha/proposed/feature"
spec_body 'Договорённость' AL > "$SPEC_TREE/docs/specs/alpha/proposed/feature/spec.md"
# Идентификатор собирается из частей: написанный литералом, он читался бы сверкой этого дерева
# как ссылка на сценарий, которого здесь нет.
printf '# Сценарии\n\n### SC-%s-09 — предложенный\n\nДано раз\nКогда два\nТогда три\n' AL \
    > "$SPEC_TREE/docs/specs/alpha/proposed/feature/scenarios.md"
report "SC-AK-30 — договорённость префикс не занимает" "$(specs_says 'префикс .* уже занят')" 0
rm -rf "$SPEC_TREE/docs/specs/alpha/proposed"

# SC-AK-28 — предложенный закон правила не требует
printf '# Закон\n\n**Статус:** действует\n\n## Статьи\n\n- **Раз.** Два.\n' \
    > "$SPEC_TREE/docs/constitution/acting.md"
report "SC-AK-28 — действующий закон без правила назван" "$(specs_says 'нет ни одного правила')" 1
printf '# Закон\n\n**Статус:** предложено\n\n## Статьи\n\n- **Раз.** Два.\n' \
    > "$SPEC_TREE/docs/constitution/acting.md"
report "SC-AK-28 — предложенный закон правила не требует" "$(specs_says 'нет ни одного правила')" 0

# --- SC-AK-56…58 — привязками считается одна таблица компаньона ------------------------------
#
# У правила компаньон держит три таблицы, и привязки — только в разделе «Где исполняются
# статьи». Фикстура кладёт в описательную таблицу строку той же формы, что и настоящая привязка.

mkdir -p "$SPEC_TREE/.claude/skills/acting-rule"
printf -- '---\nname: acting-rule\nkind: rule\nlaw: acting\n---\n\n# Правило\n\n## Как закон применяется здесь\n\n- **Раз.** Два.\n' \
    > "$SPEC_TREE/.claude/skills/acting-rule/SKILL.md"

# Компаньон целиком: описательная таблица, потом таблица привязок.
companion() {
    {
        printf '# Компаньон\n\n## Где это лежит\n\n| Что | Где |\n| --- | --- |\n| механизм | `tools/check-specs.mjs` |\n\n'
        [ "$1" = 'без раздела' ] ||
            printf '## Где исполняются статьи\n\n| Статья | Где исполняется |\n| --- | --- |\n| Раз. | `tools/check-specs.mjs:sectionOf` |\n'
    } > "$SPEC_TREE/.claude/skills/acting-rule/implementation.md"
}

companion 'с разделом'
report "SC-AK-56 — строка описательной таблицы привязкой не считается" "$(specs_says 'привязка без пункта: «механизм')" 0
report "SC-AK-56 — привязка из таблицы привязок читается" "$(specs_says 'правило без привязки: «Раз')" 0

# SC-AK-57 — компаньон правила без раздела привязок отбивается
companion 'без раздела'
report "SC-AK-57 — отсутствие раздела названо" "$(specs_says 'нет раздела .*Где исполняются статьи')" 1
report "SC-AK-57 — строка описательной таблицы привязкой всё равно не стала" "$(specs_says 'привязка без пункта: «механизм')" 0

# SC-AK-58 — у компаньона спека домена раздел не требуется: там таблица одна
rm -rf "$SPEC_TREE/.claude/skills/acting-rule"
printf '# Привязка\n\n| Правило | Где исполняется |\n| --- | --- |\n| Не применимо. | `tools/check-specs.mjs:sectionOf` |\n' \
    > "$SPEC_TREE/docs/specs/alpha/implementation.md"
report "SC-AK-58 — компаньон спека без раздела читается" "$(specs_says 'нет раздела .*Где исполняются статьи')" 0
report "SC-AK-58 — его привязка нашлась" "$(specs_says 'правило без привязки')" 0

# --- SC-AK-242 и SC-AK-243 — вердикт вместо адреса ------------------------------------------
#
# Статье, которой в дереве исполняться негде, адрес можно поставить только в файл, который её
# не исполняет. Поэтому вместо адреса принимается вердикт — но с причиной: без неё он закрывает
# любую строку разом. Слово вердикта кириллическое, и конец его ищется просмотром, а не `\b`:
# границей слова JavaScript знает одну латиницу.

mkdir -p "$SPEC_TREE/.claude/skills/verdict-rule"
printf -- '---\nname: verdict-rule\nkind: rule\nlaw: acting\n---\n\n# Правило\n\n## Как закон применяется здесь\n\n- **Раз.** Два.\n' \
    > "$SPEC_TREE/.claude/skills/verdict-rule/SKILL.md"

verdict_row() {
    printf '# Компаньон\n\n## Где исполняются статьи\n\n| Статья | Где исполняется |\n| --- | --- |\n| Раз. | %s |\n' "$1" \
        > "$SPEC_TREE/.claude/skills/verdict-rule/implementation.md"
}

verdict_row '**Не исполняется.** Службы, о которой говорит статья, дерево не держит вовсе.'
report "SC-AK-242 — вердикт с причиной принят" "$(specs_says 'пустая привязка')" 0

verdict_row '**Не исполняется.**'
report "SC-AK-243 — вердикт без причины не принят" "$(specs_says 'пустая привязка')" 1

rm -rf "$SPEC_TREE/.claude/skills/verdict-rule"

# --- SC-AK-241 — паттерн, пропущенный деревом, правило не краснит ----------------------------
#
# Пропуск объявлен в настройке проекта и означает выбор дерева: правило о процедурах бэкенда
# ложится и туда, где бэкенда нет вовсе. Требовать там паттерн значит требовать файл, которому
# нечего сказать, и единственным способом позеленеть становится снятие пропуска.

mkdir -p "$SPEC_TREE/.claude/skills/skipped-rule"
printf -- '---\nname: skipped-rule\nkind: rule\nlaw: acting\n---\n\n# Правило\n\n## Как закон применяется здесь\n\n- **Раз.** Два.\n\n## Паттерны\n\n- `skipped-rule-do` — готовый код.\n' \
    > "$SPEC_TREE/.claude/skills/skipped-rule/SKILL.md"
printf '# Компаньон\n\n## Где исполняются статьи\n\n| Статья | Где исполняется |\n| --- | --- |\n| Раз. | `tools/check-specs.mjs:sectionOf` |\n' \
    > "$SPEC_TREE/.claude/skills/skipped-rule/implementation.md"
report "SC-AK-241 — правило без паттерна названо" "$(specs_says 'нет ни одного паттерна')" 1

printf '{ "skip": ["patterns/skipped-rule-do.md"] }\n' > "$SPEC_TREE/.claude/rt-kit.json"
report "SC-AK-241 — пропущенный паттерн правило не краснит" "$(specs_says 'нет ни одного паттерна')" 0

rm -rf "$SPEC_TREE/.claude/skills/skipped-rule" "$SPEC_TREE/.claude/rt-kit.json"
# --- SC-AK-238…240 — символом якоря считается любая буква ------------------------------------
#
# Тексты, которые исполняет модель, написаны своим языком, и латиницей в них называется ровно
# то, что утверждения не держит: имя поля шапки, имя инструмента. Разбор, знающий один алфавит,
# оставлял бы автору выбор между привязкой к ничего не держащему имени и красной сверкой.
# Сузить его обратно — значит уронить эти три строки: узкий разбор виден только отсюда.

mkdir -p "$SPEC_TREE/.claude/skills/reading-rule"
printf -- '---\nname: reading-rule\nkind: rule\nlaw: acting\n---\n\n# Правило\n\n## Как закон применяется здесь\n\n- **Три.** Четыре.\n' \
    > "$SPEC_TREE/.claude/skills/reading-rule/SKILL.md"
printf '# Роль\n\nНаходка называет два места дословно, а не пересказом.\n' \
    > "$SPEC_TREE/.claude/skills/reading-rule/role.md"

# Привязка на слово самого текста, а не на имя поля его шапки.
printf '# Компаньон\n\n## Где исполняются статьи\n\n| Статья | Где исполняется |\n| --- | --- |\n| Три. | `.claude/skills/reading-rule/role.md:дословно` |\n' \
    > "$SPEC_TREE/.claude/skills/reading-rule/implementation.md"
report "SC-AK-238, SC-AK-239 — якорь на русском слове читается как привязка" \
    "$(specs_says 'у правила «Три')" 0
report "SC-AK-238 — правило с таким якорем непривязанным не считается" \
    "$(specs_says 'правило без привязки: «Три')" 0
# Слово в файле стоит первой же строкой: жалоба на его отсутствие означает, что искали
# границами `\b`, которые кириллицу не видят.
report "SC-AK-238 — слово якоря в файле находится" \
    "$(specs_says 'привязка не сходится')" 0

# Символ с дефисом: разбор символа не должен ронять сверку целиком — под строгим флагом лишнее
# экранирование дефиса само по себе отказ, и падает при этом весь прогон, а не одна строка.
printf '# Роль\n\nПравило task-flow ведёт ход работы.\n' > "$SPEC_TREE/.claude/skills/reading-rule/role.md"
printf '# Компаньон\n\n## Где исполняются статьи\n\n| Статья | Где исполняется |\n| --- | --- |\n| Три. | `.claude/skills/reading-rule/role.md:task-flow` |\n' \
    > "$SPEC_TREE/.claude/skills/reading-rule/implementation.md"
report "SC-AK-238 — символ с дефисом сверку не роняет" "$(specs_says 'у правила «Три')" 0
report "SC-AK-238 — символ с дефисом в файле находится" "$(specs_says 'привязка не сходится')" 0

# SC-AK-240 — путь остаётся латинским: он адрес в дереве, а не слово текста.
printf '# Компаньон\n\n## Где исполняются статьи\n\n| Статья | Где исполняется |\n| --- | --- |\n| Три. | `.claude/skills/reading-rule/роль.md:дословно` |\n' \
    > "$SPEC_TREE/.claude/skills/reading-rule/implementation.md"
report "SC-AK-240 — путь не латиницей парой не считается" "$(specs_says 'у правила «Три')" 1

rm -rf "$SPEC_TREE/.claude/skills/reading-rule"

# --- SC-AK-65 и SC-AK-66 — номер сценария из одной цифры виден сверке ------------------------
#
# Идентификаторы фикстуры собираются из частей — и в самой фикстуре, и в строке, по которой
# судится вывод: написанные литералом, они читались бы сверкой этого дерева как ссылки на
# сценарии, которых здесь нет.

printf '# Сценарии\n\n### SC-%s-1 — однозначный\n\nДано раз\nКогда два\nТогда три\n' AL \
    > "$SPEC_TREE/docs/specs/alpha/scenarios.md"
one_digit="$(printf 'SC-%s-1 не упомянут' AL)"
report "SC-AK-65 — сценарий с однозначным номером виден сверке" "$(specs_says "$one_digit")" 1

mkdir -p "$SPEC_TREE/libs/alpha"
printf "describe('альфа', () => {\n    it('SC-%s-1 — однозначный', () => {});\n});\n" AL \
    > "$SPEC_TREE/libs/alpha/alpha.spec.ts"
report "SC-AK-66 — ссылка с однозначным номером засчитана покрытием" "$(specs_says "$one_digit")" 0

rm -rf "$SPEC_TREE"

# --- сверка адресов: голое имя, каталог, дерево у git и полнота указателя ---------------------
#
# Фикстура — настоящий репозиторий: проверка спрашивает дерево у системы контроля версий, и на
# каталоге без неё судить было бы нечем.

DOC_TREE="$(mktemp -d)"
mkdir -p "$DOC_TREE/tools" "$DOC_TREE/docs/archive" "$DOC_TREE/docs/tasks/RT-1-x" "$DOC_TREE/.claude/hooks" "$DOC_TREE/projects/kit/src"
cp "$CHECKS/rt-kit-checks.config.mjs" "$CHECKS/check-doc-paths.mjs" "$DOC_TREE/tools/"
printf 'echo\n' > "$DOC_TREE/.claude/hooks/some-guard.sh"
printf 'export const x = 1;\n' > "$DOC_TREE/projects/kit/src/index.ts"
git -C "$DOC_TREE" init -q
git -C "$DOC_TREE" add -A

# Что напечатала сверка адресов. Она отвечает перечнем, а не кодом на каждое расхождение.
docs_says() {
    (cd "$DOC_TREE" && node tools/check-doc-paths.mjs 2>&1) | grep -cE "$1"
}
doc() { printf '%s\n' "$2" > "$DOC_TREE/docs/$1"; git -C "$DOC_TREE" add -A; }

# SC-AK-47 — голое имя файла судится наравне с путём
doc a.md 'Файл `index.ts` есть, а `missing.ts` нет.'
report "SC-AK-47 — голое имя, которого нет, названо" "$(docs_says 'нет файла .missing\.ts')" 1
report "SC-AK-47 — голое имя, которое есть, молчит" "$(docs_says 'нет файла .index\.ts')" 0

# SC-AK-48 — каталог судится наравне с путём
doc b.md 'Каталог `projects/kit/src` есть, а `projects/kit/nowhere` нет.'
report "SC-AK-48 — каталога нет — назван" "$(docs_says 'нет файла .projects/kit/nowhere')" 1
report "SC-AK-48 — каталог есть — молчит" "$(docs_says 'нет файла .projects/kit/src')" 0

# SC-AK-49 — дерево берётся у системы контроля версий: обход не видит каталогов с точкой
doc c.md 'Гард `.claude/hooks/some-guard.sh` лежит в дереве.'
report "SC-AK-49 — путь под каталогом с точкой найден" "$(docs_says 'нет файла .\.claude/hooks')" 0

# SC-AK-50 — папка задачи из сверки выведена, как архив
printf 'Снятый `docs/tasks/nowhere.md` тут назван.\n' > "$DOC_TREE/docs/tasks/RT-1-x/progress.md"
printf 'Снятый `docs/archive/nowhere.md` тут назван.\n' > "$DOC_TREE/docs/archive/old.md"
git -C "$DOC_TREE" add -A
report "SC-AK-50 — ход работы не судится" "$(docs_says 'нет файла .docs/tasks/nowhere')" 0
report "SC-AK-50 — архив не судится" "$(docs_says 'нет файла .docs/archive/nowhere')" 0

# SC-AK-51 и SC-AK-52 — полнота указателя каталога сверяется обеими сторонами
printf '# Архив\n\n| Запись | О чём |\n| --- | --- |\n' > "$DOC_TREE/docs/archive/README.md"
git -C "$DOC_TREE" add -A
report "SC-AK-51 — запись без строки названа" "$(docs_says 'лежит в каталоге, но в таблице не названа')" 1
printf '# Архив\n\n| Запись | О чём |\n| --- | --- |\n| `old.md` | о старом |\n| `gone.md` | о снятом |\n' \
    > "$DOC_TREE/docs/archive/README.md"
git -C "$DOC_TREE" add -A
report "SC-AK-51 — названная запись молчит" "$(docs_says 'лежит в каталоге, но в таблице не названа')" 0
report "SC-AK-52 — строка без записи названа" "$(docs_says 'названа в таблице, но записи в каталоге нет')" 1

# SC-AK-53 — дерево, не назвавшее ни одного указателя, сверки указателя не получает
mkdir -p "$DOC_TREE/.claude/rt-kit"
printf '{"indexedDirs":[]}\n' > "$DOC_TREE/.claude/rt-kit/checks.json"
git -C "$DOC_TREE" add -A
report "SC-AK-53 — без объявленных указателей сверки нет" "$(docs_says 'указатель разошёлся с каталогом')" 0

# SC-AK-54 — разложенный текст выведен из сверки по своей шапке
doc laid.md '<!-- rt-kit v0.5.0 · rules/some.md · 0123456789ab · правится надстройкой, не здесь -->
Правило зовёт `libs/common/util`, которого в этом дереве нет.'
report "SC-AK-54 — адрес разложенного текста не судится" "$(docs_says 'нет файла .libs/common/util')" 0
doc own.md 'Свой текст зовёт `libs/common/util`, которого нет.'
report "SC-AK-54 — адрес своего текста судится" "$(docs_says 'нет файла .libs/common/util')" 1

# SC-AK-55 — исходник переносимого текста выведен по каталогу из настройки
mkdir -p "$DOC_TREE/assets/rules"
printf 'Исходник правила зовёт `prisma/schema.prisma`, которого нет.\n' > "$DOC_TREE/assets/rules/some.md"
git -C "$DOC_TREE" add -A
report "SC-AK-55 — неназванный каталог исходников судится" "$(docs_says 'нет файла .prisma/schema\.prisma')" 1
printf '{"indexedDirs":[],"portableDirs":["assets"]}\n' > "$DOC_TREE/.claude/rt-kit/checks.json"
git -C "$DOC_TREE" add -A
report "SC-AK-55 — названный каталог исходников не судится" "$(docs_says 'нет файла .prisma/schema\.prisma')" 0

rm -rf "$DOC_TREE"

# --- длина файла ----------------------------------------------------------------------------
#
# Дерево спрашивается у системы контроля версий, поэтому фикстура — репозиторий: без него
# проверка не увидит ни одного файла и зазеленеет на пустом обходе.

SIZE_TREE="$(mktemp -d)"
mkdir -p "$SIZE_TREE/tools" "$SIZE_TREE/.claude/rt-kit"
cp "$CHECKS/rt-kit-checks.config.mjs" "$CHECKS/check-file-size.mjs" "$SIZE_TREE/tools/"
git -C "$SIZE_TREE" init -q 2>/dev/null
git -C "$SIZE_TREE" config user.email t@t && git -C "$SIZE_TREE" config user.name t

# Файл заданной длины: имя, число строк.
size_file() {
    mkdir -p "$(dirname "$SIZE_TREE/$1")"
    : > "$SIZE_TREE/$1"
    local i=1
    while [ "$i" -le "$2" ]; do
        printf 'строка %s\n' "$i" >> "$SIZE_TREE/$1"
        i=$((i + 1))
    done
    git -C "$SIZE_TREE" add -A 2>/dev/null
}

size_says() {
    (cd "$SIZE_TREE" && node tools/check-file-size.mjs 2>&1) | grep -cE "$1"
}
size_code() {
    (cd "$SIZE_TREE" && node tools/check-file-size.mjs >/dev/null 2>&1)
    printf '%s' "$?"
}

# Сама проверка и её настройки лежат в фикстуре рядом и под предел не подпадают: судится то,
# что кладут сценарии, а не обвязка, которой они запускаются.
printf '{"fileSizeLimit":10,"allowlistDir":"tools","archiveDir":"docs/archive/","tasksDir":"docs/tasks","generatedDirs":["gen/","tools/"]}\n' \
    > "$SIZE_TREE/.claude/rt-kit/checks.json"
printf '{"accepted":[],"debt":[]}\n' > "$SIZE_TREE/tools/file-size-allowlist.json"
size_file short.md 5
git -C "$SIZE_TREE" add -A
report "длина: короткий файл проходит" "$(size_code)" 0

# SC-AK-103 — файл длиннее предела отбивается, и отказ называет путь, длину и предел
size_file long.md 20
report "SC-AK-103 — длинный файл отбит" "$(size_code)" 1
report "SC-AK-103 — отказ называет путь и предел" "$(size_says 'long\.md: 21 строк, предел 10')" 1

# SC-AK-108 — длина считается как у линтера: число разрывов плюс один
# Файл из двадцати строк, кончающийся переводом, весит двадцать одну — на строку больше `wc -l`.
report "SC-AK-108 — длина равна числу разрывов плюс один" "$(size_says ': 21 строк')" 1

# SC-AK-104 — накопленное названо и не отбивает
printf '{"accepted":["long.md"],"debt":[]}\n' > "$SIZE_TREE/tools/file-size-allowlist.json"
git -C "$SIZE_TREE" add -A
report "SC-AK-104 — принятое не отбивает" "$(size_code)" 0
report "SC-AK-104 — сводка называет принятое" "$(size_says 'принято 1')" 1

# SC-AK-105 — долг назван отдельно от принятого
size_file debt.md 20
printf '{"accepted":["long.md"],"debt":["debt.md"]}\n' > "$SIZE_TREE/tools/file-size-allowlist.json"
git -C "$SIZE_TREE" add -A
report "SC-AK-105 — долг не отбивает" "$(size_code)" 0
report "SC-AK-105 — долг назван своим числом" "$(size_says 'принято 1, долг 1')" 1

# SC-AK-106 — строка перечня, у которой нет файла, отбивает
printf '{"accepted":["long.md","gone.md"],"debt":["debt.md"]}\n' > "$SIZE_TREE/tools/file-size-allowlist.json"
report "SC-AK-106 — устаревшая строка отбита" "$(size_code)" 1
report "SC-AK-106 — отказ говорит, что файла нет" "$(size_says 'gone\.md: строка .* устарела')" 1

# Поделённый файл строку в перечне не сохраняет: иначе перечень перестаёт отвечать за состав.
printf '{"accepted":["long.md","short.md"],"debt":["debt.md"]}\n' > "$SIZE_TREE/tools/file-size-allowlist.json"
report "длина: поделённый файл требует снять строку" "$(size_says 'short\.md: значится .* короче предела')" 1

# SC-AK-107 — данные, описание прошлого, папка задачи и сгенерированное не судятся
printf '{"accepted":["long.md"],"debt":["debt.md"]}\n' > "$SIZE_TREE/tools/file-size-allowlist.json"
size_file locale.json 40
size_file docs/archive/old.md 40
size_file docs/tasks/RT-1-work/progress.md 40
size_file gen/contract.js 40
git -C "$SIZE_TREE" add -A
report "SC-AK-107 — данные и описание прошлого не судятся" "$(size_code)" 0

# Перечня нет — это не пустой список: проверка молчать о нечитаемой настройке не вправе.
printf 'не JSON\n' > "$SIZE_TREE/tools/file-size-allowlist.json"
report "длина: нечитаемый перечень отбивает" "$(size_code)" 1
report "длина: отказ называет, где перечень" "$(size_says 'список известного не прочитан')" 1

rm -rf "$SIZE_TREE"

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
report "SC-AK-118 — сказано, почему пропущено" "$(gate_says 'файла конвейера в дереве нет')" 1

# SC-AK-114 — необъявленный шаг конвейера отбивает пуш
gate_config '{"pushGate":{"pipelineFile":".github/workflows/ci.yml","steps":{"Lint":"npm run lint"}}}'
report "SC-AK-114 — необъявленный шаг отбит" "$(gate_code)" 1
report "SC-AK-114 — отказ называет шаг" "$(gate_says 'шаг конвейера «Build» не объявлен')" 1

# SC-AK-115 — объявленное исключение пуш не отбивает
gate_config '{"pushGate":{"pipelineFile":".github/workflows/ci.yml","steps":{"Lint":"npm run lint","Build":{"skip":"дольше секунд, гоняется конвейером"}}}}'
report "SC-AK-115 — исключение с причиной не отбивает" "$(gate_code)" 0
report "SC-AK-115 — исключение сосчитано" "$(gate_says 'объявлено исключениями 1')" 1

# SC-AK-116 — исключение без причины расхождением остаётся
gate_config '{"pushGate":{"pipelineFile":".github/workflows/ci.yml","steps":{"Lint":"npm run lint","Build":{"skip":"  "}}}}'
report "SC-AK-116 — пустая причина отбита" "$(gate_code)" 1
report "SC-AK-116 — отказ требует причину" "$(gate_says 'исключением без причины')" 1

# SC-AK-117 — объявленная строка, которой нет в наборе, краснеет
gate_config '{"pushGate":{"pipelineFile":".github/workflows/ci.yml","steps":{"Lint":"npm run lint","Build":"npm run build"}}}'
report "SC-AK-117 — строка вне набора отбита" "$(gate_code)" 1
report "SC-AK-117 — отказ называет строку" "$(gate_says 'набор гейта её не печатает')" 1

# Та же настройка при наборе, который эту строку печатает, расхождением не является.
gate_profile 'npm run lint
    npm run build'
report "SC-AK-117 — строка в наборе принята" "$(gate_code)" 0

# Объявление шага, которого в конвейере нет, — устаревшее: иначе список копит мёртвое.
gate_config '{"pushGate":{"pipelineFile":".github/workflows/ci.yml","steps":{"Lint":"npm run lint","Build":"npm run build","Gone":"npm run gone"}}}'
report "гейт: устаревшее объявление названо" "$(gate_says 'объявление «Gone» устарело')" 1

rm -rf "$GATE_TREE"

# --- SC-AK-198 — очередь работ обходится без токена машинной записи -----------------------
#
# Хостинг спрашивается подставным клиентом: он записывает, пришёл ли к нему свой токен, и
# отвечает отказом. Проверяется не ответ борды, а то, докуда дошёл вызов: прежде он кончался
# на требовании токена и до хостинга не доходил вовсе.
BOARD_TREE="$(mktemp -d)"
mkdir -p "$BOARD_TREE/tools" "$BOARD_TREE/.claude/rt-kit" "$BOARD_TREE/bin"
cp "$CHECKS/rt-kit-checks.config.mjs" "$CHECKS/board.github.mjs" "$BOARD_TREE/tools/"
mv "$BOARD_TREE/tools/board.github.mjs" "$BOARD_TREE/tools/board.mjs"

printf '%s\n' '#!/usr/bin/env bash' \
    'if [ -n "${GH_TOKEN:-}" ]; then echo "свой" > "$GH_SEEN"; else echo "залогиненный" > "$GH_SEEN"; fi' \
    'echo "нет доступа" >&2' \
    'exit 1' > "$BOARD_TREE/bin/gh"
chmod +x "$BOARD_TREE/bin/gh"

printf '%s\n' '{"board":{"owner":"o","repo":"r","projectId":"P","statusFieldId":"F","statusOptions":{"in-progress":{"id":"i","name":"In progress"}},"taskKey":"RT"}}' \
    > "$BOARD_TREE/.claude/rt-kit/checks.json"

board_move() {
    (cd "$BOARD_TREE" && GH_BIN="$BOARD_TREE/bin/gh" GH_SEEN="$BOARD_TREE/seen" \
        node tools/board.mjs move 1 in-progress 2>&1)
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
printf '{"accepted":[],"debt":[]}\n' > "$DUPES_TREE/tools/dupes-allowlist.json"
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

report "SC-AK-244 — набор из пакета подпроекта найден" "$(dupes_says | grep -c 'один набор членов')" 1
report "SC-AK-244 — отказа чтения каталога нет" "$(dupes_says | grep -c 'ENOENT')" 0

# SC-AK-245 — пакета нет вовсе: сверка своих повторов идёт, отказа нет.
rm -rf "$DUPES_TREE/projects/kit/node_modules"
report "SC-AK-245 — без пакета проверка не падает" "$(dupes_says | grep -c 'ENOENT')" 0
(cd "$DUPES_TREE" && node tools/check-dupes.mjs >/dev/null 2>&1)
report "SC-AK-245 — без пакета код нулевой" "$?" 0

rm -rf "$DUPES_TREE"

suite_result "проверки"
