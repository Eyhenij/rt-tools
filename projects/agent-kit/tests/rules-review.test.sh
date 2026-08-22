#!/usr/bin/env bash
# Сценарии полноты и связности текстов пакета.
#
# Целостность сверяет ссылки шапок: у паттерна есть правило, у правила — закон. Набор текстов
# стережёт адресность. Между ними была дыра: ресурс, описанный наполовину, и правило, у которого
# нет ни одного паттерна, проходили обе проверки зелёными — и уезжали ко всем потребителям разом.
#
# Здесь считается только то, что считается и повторяется от запуска к запуску. Смысловое
# расхождение двух текстов ищется чтением, и в этот набор оно не входит.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "полнота текстов"

# --- наборы разделов на род -------------------------------------------------------------------
#
# Набор объявлен здесь, а не выводится из образца рода: образец — черновик для того, кто заводит
# ресурс, и стареет он первым. Сегодня образец правила объявляет раздел «Когда берётся», которого
# нет ни в одном файле правил, а все правила несут три раздела, о которых образец молчит: набор,
# выведенный из образца, объявил бы расхождением весь корпус разом.
#
# Разделитель — перевод строки: в заголовках есть пробелы.
sections_for() {
    case "$1" in
        laws) printf '## Статьи\n' ;;
        rules)
            printf '## Как это называется здесь\n## Где это лежит\n## Ход\n'
            printf '## Как закон применяется здесь\n## Чего из закона здесь нет\n## Паттерны\n'
            ;;
        pitfalls) printf '## Ловушки\n' ;;
        patterns) printf '## Когда брать\n' ;;
        skills) printf '## Когда брать\n' ;;
    esac
}

# Роды, у которых набора нет вовсе: гарды, умолчания, проверки, роли, команды, конвейеры,
# шаблоны, образцы и документы. Требований к их разделам не формулировал никто, и проверка о них
# молчит — красная проверка на несформулированном гасится списком исключений, а список исключений
# через месяц становится рабочим путём.
KINDS_WITH_SECTIONS='laws rules pitfalls patterns skills'
KINDS_WITHOUT_SECTIONS='hooks defaults checks agents commands workflows templates samples docs'

# Ресурсы рода, у которых нет объявленного раздела. Доводы: корень набора и род. Печатает строки
# «имя ресурса :: недостающий заголовок» — по строке на пропуск.
missing_sections() {
    local root="$1" kind="$2" file want
    [ -d "$root/$kind" ] || return 0
    while IFS= read -r want; do
        [ -n "$want" ] || continue
        for file in "$root/$kind"/*.md; do
            [ -e "$file" ] || continue
            grep -qxF "$want" "$file" || printf '%s :: %s\n' "${file##*/}" "$want"
        done
    done <<< "$(sections_for "$kind")"
}

# Завершающий раздел паттерна о промахах: два законных имени, и оба означают одно.
missing_pitfalls() {
    local root="$1" file
    for file in "$root"/patterns/*.md; do
        [ -e "$file" ] || continue
        grep -qxE '## (Частые промахи|Ловушки)' "$file" || printf '%s :: раздел о промахах\n' "${file##*/}"
    done
}

# --- SC-AK-211, SC-AK-226 — набор разделов ------------------------------------------------------
gaps=''
for kind in $KINDS_WITH_SECTIONS; do
    gaps="$gaps$(missing_sections "$ASSETS" "$kind")"
done
gaps="$gaps$(missing_pitfalls "$ASSETS")"
if [ -z "$gaps" ]; then
    report "SC-AK-211 — у каждого ресурса разделы его рода" PASS PASS
else
    report "SC-AK-211 — у каждого ресурса разделы его рода" "$(printf '%s' "$gaps" | tr '\n' ' ')" PASS
fi

# Граф хода спрашивается у всех правил, а не у ветвящихся: раздел стоит в наборе рода, и его
# отсутствие набор называет строкой на файл — тем же обходом, что и остальные разделы.
report "SC-AK-230 — граф хода стоит в наборе разделов правила" \
    "$(sections_for rules | grep -c '^## Ход$')" 1

# Образец рода корпусу не хозяин: раздел, который объявляет он один, расхождением не считается.
report "SC-AK-226 — раздел из образца в наборе не спрашивается" \
    "$(sections_for rules | grep -c '^## Когда берётся$')" 0

# Обратная сторона: сам образец обязан нести объявленный набор. Заводят по нему, и образец,
# разошедшийся с набором, отдаёт новое правило сразу расхождением — так и вышло: он объявлял
# раздел, которого нет ни в одном правиле, и молчал о трёх, которые несут все.
template_gaps=''
while IFS= read -r want; do
    [ -n "$want" ] || continue
    grep -qxF "$want" "$ASSETS/templates/rule.md" || template_gaps="$template_gaps $want"
done <<< "$(sections_for rules)"
if [ -z "${template_gaps// /}" ]; then
    report "SC-AK-226 — образец правила несёт объявленный набор" PASS PASS
else
    report "SC-AK-226 — образец правила несёт объявленный набор" "$template_gaps" PASS
fi

# Образец паттерна судится тем же: у него свой набор.
report "SC-AK-226 — образец паттерна несёт «Когда брать»" \
    "$(grep -cxF '## Когда брать' "$ASSETS/templates/pattern.md")" 1

# --- SC-AK-227 — род без объявленного набора молчит ---------------------------------------------
noisy=0
for kind in $KINDS_WITHOUT_SECTIONS; do
    [ -n "$(sections_for "$kind")" ] && noisy=$((noisy + 1))
done
report "SC-AK-227 — роды без набора разделов молчат" "$noisy" 0
report "SC-AK-227 — родов с набором пять из четырнадцати" \
    "$(printf '%s %s' "$KINDS_WITH_SECTIONS" "$KINDS_WITHOUT_SECTIONS" | wc -w | tr -d ' ')" 14

# --- SC-AK-213 — невыбранный вид судится наравне с выбранным ------------------------------------
#
# Дерево раскладывает одну редакцию правила о поставке, остальные не читает никто. Проверка
# обходит файлы, а не выбранные ресурсы: три редакции расходились бы между собой молча.
walked="$(for kind in $KINDS_WITH_SECTIONS; do ls "$ASSETS/$kind"/*.md 2>/dev/null; done | wc -l | tr -d ' ')"
on_disk="$(find "$ASSETS/laws" "$ASSETS/rules" "$ASSETS/pitfalls" "$ASSETS/patterns" "$ASSETS/skills" \
    -maxdepth 1 -name '*.md' | wc -l | tr -d ' ')"
report "SC-AK-213 — обойдены все файлы, включая невыбранные виды" "$walked" "$on_disk"

variants="$(ls "$ASSETS"/rules/git-workflow.*.md 2>/dev/null | wc -l | tr -d ' ')"
report "SC-AK-213 — у правила о поставке три редакции" "$variants" 3

# --- SC-AK-212, SC-AK-229 — правило без паттерна ------------------------------------------------
#
# Связь снизу вверх пакет сверяет целостностью: у паттерна есть правило. Обратная сторона не
# сверялась ни разу, а правило без готового кода исполняется пересказом.

# Правила, на которые не ссылается ни один паттерн. Довод — корень набора.
rules_without_pattern() {
    local root="$1" ruled rule name
    ruled="$(grep -h '^rule:' "$root"/patterns/*.md 2>/dev/null | sed 's/^rule:[[:space:]]*//' | sort -u)"
    for rule in "$root"/rules/*.md; do
        [ -e "$rule" ] || continue
        name="${rule##*/}"
        name="${name%.md}"
        # Вид отрезается: паттерн стоит при ресурсе, а не при его редакции под хостинг.
        printf '%s\n' "$ruled" | grep -qx "${name%%.*}" || printf '%s\n' "$name"
    done
}

orphans="$(rules_without_pattern "$ASSETS" | tr '\n' ' ')"
checked="$(ls "$ASSETS"/rules/*.md | wc -l | tr -d ' ')"
if [ -z "${orphans// /}" ]; then
    report "SC-AK-212 — у каждого правила есть паттерн" PASS PASS
else
    report "SC-AK-212 — у каждого правила есть паттерн" "$orphans" PASS
fi

# Проверка, которой нечего сказать, неотличима от проверки, которая ничего не искала: число
# проверенного называется вслух и здесь же сверяется с тем, что лежит на диске.
report "SC-AK-229 — нулевой долг назван числом проверенных правил" \
    "$checked" "$(ls "$ASSETS"/rules/*.md | wc -l | tr -d ' ')"

# --- SC-AK-214 — имя соседа, названное прозой -------------------------------------------------
#
# Правила ссылаются друг на друга именами в тексте, а не только ссылками шапок. Снятый или
# переименованный ресурс оставляет такую фразу верной на вид и ведущей в пустоту.
#
# Список известного именной и объясняет себя сам: `sonarjs` — набор правил линтера, и стоит он
# после того же слова «правила», что и имя ресурса. Отличить их машине нечем.
KNOWN_NOT_RESOURCES='sonarjs'

# Имена соседей из прозы, которых в наборе нет. Довод — корень набора.
unknown_neighbours() {
    local root="$1" known name
    known="$(for kind in rules patterns skills; do
        ls "$root/$kind"/*.md 2>/dev/null | sed 's#.*/##; s/\.md$//; s/\..*$//'
    done | sort -u)"
    for name in $(grep -rhoE '(правил[а-я]*|паттерн[а-я]*|скил[а-я]*)[[:space:]]+`[a-z][a-z0-9-]+`' \
        "$root"/rules "$root"/patterns "$root"/skills 2>/dev/null \
        | grep -oE '`[a-z][a-z0-9-]+`' | tr -d '`' | sort -u); do
        printf '%s\n' "$KNOWN_NOT_RESOURCES" | tr ' ' '\n' | grep -qx "$name" && continue
        printf '%s\n' "$known" | grep -qx "$name" || printf '%s\n' "$name"
    done
}

unknown="$(unknown_neighbours "$ASSETS" | tr '\n' ' ')"
if [ -z "${unknown// /}" ]; then
    report "SC-AK-214 — имена соседей из прозы отвечают набору" PASS PASS
else
    report "SC-AK-214 — имена соседей из прозы отвечают набору" "$unknown" PASS
fi

# --- SC-AK-217 — подставленный ресурс краснеет --------------------------------------------------
#
# Набор, зелёный на своём же корпусе, проверяет собственное послушание: он зелен и тогда, когда
# ищет не там. Поэтому раздел снимается в копии, и проверка обязана его недосчитаться.
probe="$(mktemp -d)"
mkdir -p "$probe/rules" "$probe/pitfalls" "$probe/patterns"
cp "$ASSETS/rules/doc-style.md" "$probe/rules/doc-style.md"
cp "$ASSETS/pitfalls/doc-style.md" "$probe/pitfalls/doc-style.md"
cp "$ASSETS/patterns/doc-style-write.md" "$probe/patterns/doc-style-write.md"

grep -vxF '## Ловушки' "$ASSETS/pitfalls/doc-style.md" > "$probe/pitfalls/doc-style.md"
report "SC-AK-217 — снятый раздел холодной части найден" \
    "$(missing_sections "$probe" pitfalls | grep -c 'Ловушки')" 1

grep -vxF '## Частые промахи' "$ASSETS/patterns/doc-style-write.md" > "$probe/patterns/doc-style-write.md"
report "SC-AK-217 — снятый раздел о промахах найден" \
    "$(missing_pitfalls "$probe" | grep -c 'промахах')" 1

cp "$ASSETS/pitfalls/doc-style.md" "$probe/pitfalls/doc-style.md"
cp "$ASSETS/patterns/doc-style-write.md" "$probe/patterns/doc-style-write.md"
report "SC-AK-218 — возвращённый раздел расхождением не считается" \
    "$(missing_sections "$probe" pitfalls | grep -c 'Ловушки')" 0

# Правило без паттерна: в копии лежит правило, на которое не ссылается ни один паттерн.
cp "$ASSETS/rules/task-flow.md" "$probe/rules/task-flow.md"
report "SC-AK-212 — правило без паттерна найдено" \
    "$(rules_without_pattern "$probe" | grep -cx 'task-flow')" 1

# Имя соседа, которого в наборе нет: строка дописывается в копию правила.
printf '\nПодробности — правило `no-such-rule`.\n' >> "$probe/rules/doc-style.md"
report "SC-AK-214 — имя снятого соседа найдено" \
    "$(unknown_neighbours "$probe" | grep -cx 'no-such-rule')" 1

rm -rf "$probe"

suite_result "полнота текстов"
