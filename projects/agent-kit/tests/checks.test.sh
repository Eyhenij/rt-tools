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

rm -rf "$SPEC_TREE"

suite_result "проверки"
