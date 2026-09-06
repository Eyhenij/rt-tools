#!/usr/bin/env bash
# Сценарии сверки спеков: поддомены, предложенный закон, префикс по дереву, привязки
# компаньона, вердикт вместо адреса, пропущенный деревом паттерн, символ якоря и номер сценария
# из одной цифры.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: спеки"

# --- сверка спеков: поддомены, предложенный закон, префикс по дереву -------------------------
#
# Фикстура повторяет раскладку дерева: проверки лежат в `tools/`, а тексты — там, где их ищет
# настройка. Сверка запускается целиком и судится по строкам, которые напечатала: она отвечает
# перечнем расхождений, а не кодом на каждое из них.

SPEC_TREE="$(mktemp -d)"
mkdir -p "$SPEC_TREE/tools" "$SPEC_TREE/docs/constitution" "$SPEC_TREE/.claude/skills"
cp "$CHECKS/rt-kit-checks.config.mjs" "$CHECKS/check-specs.mjs" \
    "$CHECKS/spec-common.mjs" "$CHECKS/spec-anchors.mjs" "$CHECKS/spec-contract.mjs" "$CHECKS/spec-scenarios.mjs" "$CHECKS/spec-proposed.mjs" \
    "$SPEC_TREE/tools/"

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
            printf '## Где исполняются статьи\n\n| Статья | Где исполняется |\n| --- | --- |\n| Раз. | `tools/check-specs.mjs:checkSpecHeadings` |\n'
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
printf '# Привязка\n\n| Правило | Где исполняется |\n| --- | --- |\n| Не применимо. | `tools/check-specs.mjs:checkSpecHeadings` |\n' \
    > "$SPEC_TREE/docs/specs/alpha/implementation.md"
report "SC-AK-58 — компаньон спека без раздела читается" "$(specs_says 'нет раздела .*Где исполняются статьи')" 0
report "SC-AK-58 — его привязка нашлась" "$(specs_says 'правило без привязки')" 0

# --- SC-AK-662…664 — привязка списком ---------------------------------------------------------
#
# Треть веса компаньона составляли пробелы, которыми форматтер добивает столбцы таблицы до общей
# ширины: в спутниках дерева это 191 820 знаков. Список их не имеет, а связь идёт по тексту
# утверждения — форма строки её не задаёт.

mkdir -p "$SPEC_TREE/.claude/skills/acting-rule"
printf -- '---\nname: acting-rule\nkind: rule\nlaw: acting\n---\n\n# Правило\n\n## Как закон применяется здесь\n\n- **Раз.** Два.\n- **Три.** Четыре.\n' \
    > "$SPEC_TREE/.claude/skills/acting-rule/SKILL.md"

# Обе статьи привязаны строками списка.
printf '# Компаньон\n\n## Где исполняются статьи\n\n- **Раз.** — `tools/check-specs.mjs:checkSpecHeadings`\n- **Три.** — `tools/spec-common.mjs:REQUIRED_HEADINGS`\n' \
    > "$SPEC_TREE/.claude/skills/acting-rule/implementation.md"
report "SC-AK-662 — привязка строкой списка читается" "$(specs_says 'правило без привязки')" 0
report "SC-AK-662 — лишней привязки при этом не появилось" "$(specs_says 'привязка без пункта')" 0

# Смешанный компаньон: одна статья таблицей, другая списком. Перевод идёт файл за файлом, и
# половина дерева какое-то время стоит в прежней форме.
printf '# Компаньон\n\n## Где исполняются статьи\n\n| Статья | Где исполняется |\n| --- | --- |\n| Раз. | `tools/check-specs.mjs:checkSpecHeadings` |\n\n- **Три.** — `tools/spec-common.mjs:REQUIRED_HEADINGS`\n' \
    > "$SPEC_TREE/.claude/skills/acting-rule/implementation.md"
report "SC-AK-663 — смешанный компаньон читается целиком" "$(specs_says 'правило без привязки')" 0

# Строка списка без якоря судится как пустая клетка таблицы: связь есть, адреса нет.
printf '# Компаньон\n\n## Где исполняются статьи\n\n- **Раз.** — просто слова\n- **Три.** — `tools/spec-common.mjs:REQUIRED_HEADINGS`\n' \
    > "$SPEC_TREE/.claude/skills/acting-rule/implementation.md"
report "SC-AK-664 — строка списка без якоря названа пустой привязкой" "$(specs_says 'у правила «Раз.*пустая привязка')" 1
rm -rf "$SPEC_TREE/.claude/skills/acting-rule"

# --- SC-AK-612 — приватное имя в якоре ------------------------------------------------------
#
# Приватное поле класса объявлено с решёткой, и якорь на него записывается так же. Прежде
# образец решётки не разбирал вовсе, и строка привязки читалась как пустая.

mkdir -p "$SPEC_TREE/.claude/skills/acting-rule"
printf -- '---\nname: acting-rule\nkind: rule\nlaw: acting\n---\n\n# Правило\n\n## Как закон применяется здесь\n\n- **Раз.** Два.\n' \
    > "$SPEC_TREE/.claude/skills/acting-rule/SKILL.md"
printf '# Компаньон\n\n## Где исполняются статьи\n\n| Статья | Где исполняется |\n| --- | --- |\n| Раз. | `tools/check-specs.mjs:#hidden` |\n' \
    > "$SPEC_TREE/.claude/skills/acting-rule/implementation.md"
report "SC-AK-612 — якорь с решёткой пустым не считается" "$(specs_says 'правило без привязки: «Раз')" 0
rm -rf "$SPEC_TREE/.claude/skills/acting-rule"

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
printf '# Компаньон\n\n## Где исполняются статьи\n\n| Статья | Где исполняется |\n| --- | --- |\n| Раз. | `tools/check-specs.mjs:checkSpecHeadings` |\n' \
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

# --- SC-AK-688 — таблица кодов отказа процедурой не считается --------------------------------
#
# Раздел «Контракта» держит две разные таблицы: список процедур с правами и список кодов отказа
# с поводами. По форме строки они неотличимы — обе несут значение в кавычках первой ячейкой, — и
# разбор брал любую. Спек, объявивший процедуры, получал из-за этого свою таблицу кодов
# прочитанной как список процедур: каждая её строка становилась процедурой, которой в домене нет.
spec_dir docs/specs/codes 'Коды' CD
printf '%s\n' \
    '# Коды' \
    '' \
    '**Статус:** действует · **Префикс сценариев:** `SC-CD`' \
    '**Законы:** нет' \
    '**Процедуры:** `libs/codes`' \
    '' \
    '## Контракт' \
    '' \
    '| Когда | Код | Что говорит |' \
    '| --- | --- | --- |' \
    '| `токена нет` | `401` | что нужен токен |' \
    '| `поля нет` | `400` | какого поля не хватает |' \
    '' > "$SPEC_TREE/docs/specs/codes/spec.md"

report "SC-AK-688 — строка с кодом отказа процедурой не считается" \
    "$(specs_says 'токена нет')" 0

# --- SC-AK-866 — человек, названный в обещании местоимением ---------------------------------
#
# Обещание пишут связной речью: человека называют в «Дано», а в «Тогда» о нём говорят
# местоимением. Признак экрана человека тогда не видел, и сценарий уходил в покрытые юнитом
# молча. Имя человека ищется по телу сценария целиком, а местоимение — подлежащим при самом
# глаголе восприятия: свободная связка засчитала бы «он» о запросе и счётчике.

spec_dir docs/specs/screen 'Экран' SR
mkdir -p "$SPEC_TREE/libs/screen"

screen_scenario() {
    printf '# Сценарии\n\n### SC-%s-01 — первый\n\n%s\n' SR "$1" > "$SPEC_TREE/docs/specs/screen/scenarios.md"
    printf "describe('экран', () => {\n    it('SC-%s-01 — первый', () => {});\n});\n" SR \
        > "$SPEC_TREE/libs/screen/screen.spec.ts"
}

screen_promise="$(printf 'SC-%s-01 обещает то, что человек видит' SR)"

screen_scenario 'Дано гость открыл список
Когда приходит отказ
Тогда он видит сообщение об отказе'
report "SC-AK-866 — обещание местоимением судится наравне с именем" "$(specs_says "$screen_promise")" 1

screen_scenario 'Дано домен решает, есть ли тревога
Когда идёт разбор
Тогда он смотрит на прошлый час'
report "SC-AK-866 — местоимение без человека в теле экрана не обещает" "$(specs_says "$screen_promise")" 0

screen_scenario 'Дано гость открыл список
Когда приходит отказ
Тогда он получает отказ записью в журнале'
report "SC-AK-866 — человек без восприятия экрана не обещает" "$(specs_says "$screen_promise")" 0

rm -rf "$SPEC_TREE/docs/specs/screen" "$SPEC_TREE/libs/screen"

# --- SC-AK-867 — номер строки и имя класса в якоре ------------------------------------------
#
# В разметке и стилях привязываться больше не к чему: ни метода, ни поля у элемента нет. Прежде
# такая привязка образцу не совпадала, и сверка говорила, что привязки нет вовсе, — заход уходил
# на то, чтобы переписать верную таблицу.

mkdir -p "$SPEC_TREE/.claude/skills/anchor-rule"
printf -- '---\nname: anchor-rule\nkind: rule\nlaw: acting\n---\n\n# Правило\n\n## Как закон применяется здесь\n\n- **Раз.** Два.\n- **Три.** Четыре.\n' \
    > "$SPEC_TREE/.claude/skills/anchor-rule/SKILL.md"
printf '<div class="rt-badge">\n    <span>метка</span>\n</div>\n' > "$SPEC_TREE/.claude/skills/anchor-rule/view.html"
printf '.rt-badge {\n    display: flex;\n}\n' > "$SPEC_TREE/.claude/skills/anchor-rule/view.scss"
printf '# Компаньон\n\n## Где исполняются статьи\n\n| Статья | Где исполняется |\n| --- | --- |\n| Раз. | `.claude/skills/anchor-rule/view.scss:.rt-badge` |\n| Три. | `.claude/skills/anchor-rule/view.html:1` |\n' \
    > "$SPEC_TREE/.claude/skills/anchor-rule/implementation.md"
report "SC-AK-867 — якорь именем класса пустым не считается" "$(specs_says 'правило без привязки: «Раз')" 0
report "SC-AK-867 — якорь номером строки пустым не считается" "$(specs_says 'правило без привязки: «Три')" 0
report "SC-AK-867 — обе привязки сходятся" "$(specs_says 'привязка не сходится')" 0
rm -rf "$SPEC_TREE/.claude/skills/anchor-rule"

# --- SC-AK-807, SC-AK-808 — договорённость, ждущая своего домена дольше месяца ---------------
#
# Привязка в договорённости стареет молча: объявление, на которое она показывает, переезжает
# вместе с соседней работой, а сверять договорённость с кодом никто не станет, пока она не
# вольётся. Возраст читается из истории — время файла на диске не годится, свежий чекаут делает
# все каталоги одновременными, — поэтому фикстуре нужен репозиторий с назначенной датой коммита.
AGE_TREE="$(mktemp -d)"
mkdir -p "$AGE_TREE/tools"
cp "$CHECKS/rt-kit-checks.config.mjs" "$CHECKS/check-specs.mjs" \
    "$CHECKS/spec-common.mjs" "$CHECKS/spec-anchors.mjs" "$CHECKS/spec-contract.mjs" "$CHECKS/spec-scenarios.mjs" "$CHECKS/spec-proposed.mjs" \
    "$AGE_TREE/tools/"

git init -q "$AGE_TREE" 2>/dev/null

age_says() {
    (cd "$AGE_TREE" && node tools/check-specs.mjs 2>&1) | grep -cE "$1"
}

# Фикстура здесь нужна чистая: раздел про возраст печатается после перечня расхождений, а на
# расхождении сверка выходит раньше него. Поэтому у спека есть правило, а у правила — привязка
# в живой символ.
printf 'export function probe() {\n    return 1;\n}\n\nprobe();\n' > "$AGE_TREE/tools/probe.mjs"

age_spec_body() {
    printf '# %s\n\n**Статус:** действует · **Префикс сценариев:** `SC-%s`\n**Законы:** нет\n**Процедуры:** нет\n\n' "$1" "$2"
    printf '## Правила\n\n- **Раз.** Два.\n\n'
    for heading in '## Зачем' '## Терминология' '### Как это называется в интерфейсе' \
        '## Что не входит' '## Контракт' '### Коды отказов' '## Данные' '## Экраны и состояния' \
        '## Сквозные требования' '### Локали' '### SEO' '### Мобильная раскладка' '### Мультиобъектность' \
        '## Решения' '## Открытые вопросы' '## История изменений'; do
        printf '%s\n\nНе применимо.\n\n' "$heading"
    done
}

age_proposed() {
    mkdir -p "$AGE_TREE/docs/specs/$1/proposed/$2"
    age_spec_body 'Договорённость' "$3" > "$AGE_TREE/docs/specs/$1/proposed/$2/spec.md"
    printf '# Сценарии\n\n### SC-%s-09 — предложенный\n\nДано раз\nКогда два\nТогда три\n\nНе покрыто: проба.\n' "$3" \
        > "$AGE_TREE/docs/specs/$1/proposed/$2/scenarios.md"
    printf '# Привязка\n\n- **Раз.** — `tools/probe.mjs:probe` — проба\n' \
        > "$AGE_TREE/docs/specs/$1/proposed/$2/implementation.md"
}

age_commit() {
    git -C "$AGE_TREE" add -A 2>/dev/null
    GIT_AUTHOR_DATE="$1" GIT_COMMITTER_DATE="$1" \
        git -C "$AGE_TREE" -c user.email=p@p -c user.name=p -c commit.gpgsign=false \
        commit -q -m "$2" 2>/dev/null
}

spec_dir_at() {
    mkdir -p "$AGE_TREE/$1"
    age_spec_body "$2" "$3" > "$AGE_TREE/$1/spec.md"
    printf '# Сценарии\n\n### SC-%s-01 — первый\n\nДано раз\nКогда два\nТогда три\n\nНе покрыто: проба.\n' "$3" > "$AGE_TREE/$1/scenarios.md"
    printf '# Привязка\n\n- **Раз.** — `tools/probe.mjs:probe` — проба\n' > "$AGE_TREE/$1/implementation.md"
}

spec_dir_at docs/specs/old 'Старый' OL
age_proposed old ancient OL
age_commit '2026-01-01T12:00:00 +0000' 'договорённость лежит с зимы'

report "SC-AK-807 — договорённость старше месяца названа" "$(age_says 'Ждёт дольше месяца')" 1
report "SC-AK-807 — назван её каталог" "$(age_says 'docs/specs/old/proposed/ancient — [0-9]+ суток')" 1

spec_dir_at docs/specs/fresh 'Свежий' FR
age_proposed fresh recent FR
age_commit "$(date -u '+%Y-%m-%dT%H:%M:%S +0000')" 'свежая договорённость'

report "SC-AK-808 — свежая договорённость в раздел не попадает" "$(age_says 'docs/specs/fresh/proposed/recent — [0-9]+ суток')" 0
report "SC-AK-808 — старая по-прежнему названа" "$(age_says 'docs/specs/old/proposed/ancient — [0-9]+ суток')" 1

rm -rf "$AGE_TREE"

# --- пункты раздела: подзаголовок список не кончает, таблица кончает и называется ------------
#
# Раздел уже отрезан по уровню заголовка, и строка `#` в нём всегда глубже — ею спек большого
# домена группирует правила. Таблица список кончает по-прежнему, и отказ называет её строку.

rules_of() {
    spec_dir "docs/specs/$1" "$2" "$3"
    # Содержимое раздела едет окружением, а не текстом программы: скобки и черта таблицы в
    # строке программы читаются perl как её синтаксис.
    RULES="$(printf '%b' "$4")" perl -0pi -e 's/## Правила\n\nНе применимо\.\n/## Правила\n\n$ENV{RULES}\n/' "$SPEC_TREE/docs/specs/$1/spec.md"
    printf '# Привязка\n\n- **Раз.** — `tools/check-specs.mjs:checkSpecHeadings`\n' > "$SPEC_TREE/docs/specs/$1/implementation.md"
}

# SC-AK-889 — подзаголовок внутри раздела список правил не кончает
rules_of gamma 'Гамма' GA '### Первая группа\n\n- **Раз.** Два.\n\n### Вторая группа\n\n- **Три.** Четыре.\n'
report "SC-AK-889 — раздел с подзаголовками не назван пустым" "$(specs_says 'gamma/spec.md: в разделе .*Правила.* нет ни одного пункта')" 0
report "SC-AK-889 — пункт после подзаголовка прочитан" "$(specs_says 'gamma/implementation.md: правило без привязки: «Три')" 1

# SC-AK-890 — таблица кончает список, и отказ называет, что стоит вместо пунктов
rules_of delta 'Дельта' DE '| Поддомен | О чём |\n| --- | --- |\n| [Раз](raz/spec.md) | два |\n\n- **Раз.** Два.\n'
report "SC-AK-890 — таблица перед списком названа в отказе" "$(specs_says 'delta/spec.md: в разделе .*Правила.* нет ни одного пункта, список кончился на строке .\| Поддомен')" 1
report "SC-AK-890 — раздел без пунктов называет первую строку" "$(specs_says 'alpha/spec.md: в разделе .*Правила.* нет ни одного пункта, первым стоит .Не применимо')" 1

rm -rf "$SPEC_TREE"

suite_result "проверки: спеки"
