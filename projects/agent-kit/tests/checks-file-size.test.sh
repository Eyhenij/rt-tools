#!/usr/bin/env bash
# Сценарии проверки длины файла: предел, принятое, долг и то, что считается новой строкой
# сверх принятого.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: длина"

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
printf '{"accepted":{},"debt":{}}\n' > "$SIZE_TREE/tools/file-size-allowlist.json"
size_file short.md 5
git -C "$SIZE_TREE" add -A
report "длина: короткий файл проходит" "$(size_code)" 0

# SC-AK-103 — файл длиннее предела отбивается, и отказ называет путь, длину и предел
size_file long.md 20
report "SC-AK-103 — длинный файл отбит" "$(size_code)" 1
report "SC-AK-103 — отказ называет путь и предел" "$(size_says 'long\.md: 21 строк, предел кода 10')" 1

# SC-AK-108 — длина считается как у линтера: число разрывов плюс один
# Файл из двадцати строк, кончающийся переводом, весит двадцать одну — на строку больше `wc -l`.
report "SC-AK-108 — длина равна числу разрывов плюс один" "$(size_says ': 21 строк')" 1

# SC-AK-104 — накопленное названо и не отбивает
printf '{"accepted":{"long.md":{"reason":"фикстура набора","task":"RT-900"}},"debt":{}}\n' > "$SIZE_TREE/tools/file-size-allowlist.json"
git -C "$SIZE_TREE" add -A
report "SC-AK-104 — принятое не отбивает" "$(size_code)" 0
report "SC-AK-104 — сводка называет принятое" "$(size_says 'принято 1')" 1

# SC-AK-105 — долг назван отдельно от принятого
size_file debt.md 20
printf '{"accepted":{"long.md":{"reason":"фикстура набора","task":"RT-900"}},"debt":{"debt.md":{"reason":"фикстура набора","task":"RT-900"}}}\n' > "$SIZE_TREE/tools/file-size-allowlist.json"
git -C "$SIZE_TREE" add -A
report "SC-AK-105 — долг не отбивает" "$(size_code)" 0
report "SC-AK-105 — долг назван своим числом" "$(size_says 'принято 1, долг 1')" 1

# SC-AK-106 — строка перечня, у которой нет файла, отбивает
printf '{"accepted":{"long.md":{"reason":"фикстура набора","task":"RT-900"},"gone.md":{"reason":"фикстура набора","task":"RT-900"}},"debt":{"debt.md":{"reason":"фикстура набора","task":"RT-900"}}}\n' > "$SIZE_TREE/tools/file-size-allowlist.json"
report "SC-AK-106 — устаревшая строка отбита" "$(size_code)" 1
report "SC-AK-106 — отказ говорит, что файла нет" "$(size_says 'gone\.md: строка .* устарела')" 1

# Поделённый файл строку в перечне не сохраняет: иначе перечень перестаёт отвечать за состав.
printf '{"accepted":{"long.md":{"reason":"фикстура набора","task":"RT-900"},"short.md":{"reason":"фикстура набора","task":"RT-900"}},"debt":{"debt.md":{"reason":"фикстура набора","task":"RT-900"}}}\n' > "$SIZE_TREE/tools/file-size-allowlist.json"
report "длина: поделённый файл требует снять строку" "$(size_says 'short\.md: значится .* короче предела')" 1

# SC-AK-107 — данные, описание прошлого, папка задачи и сгенерированное не судятся
printf '{"accepted":{"long.md":{"reason":"фикстура набора","task":"RT-900"}},"debt":{"debt.md":{"reason":"фикстура набора","task":"RT-900"}}}\n' > "$SIZE_TREE/tools/file-size-allowlist.json"
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

# --- SC-AK-513, SC-AK-514 — два предела ---------------------------------------------------------
#
# Тексту порог нужен раньше, чем коду, поэтому пределов два. Фикстура берёт файл, который длиннее
# предела текста и короче предела кода: под одним пределом он законен, под двумя — нет.
printf '{"fileSizeLimit":40,"proseSizeLimit":10,"proseRoots":["prose/"],"allowlistDir":"tools","archiveDir":"docs/archive/","tasksDir":"docs/tasks","generatedDirs":["gen/","tools/"]}\n' \
    > "$SIZE_TREE/.claude/rt-kit/checks.json"
printf '{"accepted":{},"debt":{}}\n' > "$SIZE_TREE/tools/file-size-allowlist.json"
rm -rf "${SIZE_TREE:?}/long.md" "${SIZE_TREE:?}/debt.md" "${SIZE_TREE:?}/locale.json" "${SIZE_TREE:?}/docs" "${SIZE_TREE:?}/gen"
size_file prose/rule.md 20
size_file code/tool.mjs 20
git -C "$SIZE_TREE" add -A
report "SC-AK-513 — текст судится своим пределом" "$(size_says 'prose/rule\.md: 21 строк, предел текста 10')" 1
report "SC-AK-513 — код тем же числом не судится" "$(size_says 'code/tool\.mjs')" 0

# Дерево, корней текста не назвавшее, работает как прежде: одно число и одна строка в сводке.
printf '{"fileSizeLimit":40,"allowlistDir":"tools","archiveDir":"docs/archive/","tasksDir":"docs/tasks","generatedDirs":["gen/","tools/"]}\n' \
    > "$SIZE_TREE/.claude/rt-kit/checks.json"
report "SC-AK-514 — без корней текста предел один" "$(size_code)" 0
report "SC-AK-514 — сводка называет одно число" "$(size_says 'предел 40, длиннее предела 0')" 1

rm -rf "$SIZE_TREE"

suite_result "проверки: длина"
