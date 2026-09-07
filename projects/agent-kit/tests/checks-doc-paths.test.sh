#!/usr/bin/env bash
# Сценарии сверки адресов: голое имя, каталог, дерево у системы контроля версий и полнота
# указателя каталога.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: адреса"

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
report "SC-AK-47 — голое имя, которого нет, названо" "$(docs_says 'no file .missing\.ts')" 1
report "SC-AK-47 — голое имя, которое есть, молчит" "$(docs_says 'no file .index\.ts')" 0

# SC-AK-48 — каталог судится наравне с путём
doc b.md 'Каталог `projects/kit/src` есть, а `projects/kit/nowhere` нет.'
report "SC-AK-48 — каталога нет — назван" "$(docs_says 'no file .projects/kit/nowhere')" 1
report "SC-AK-48 — каталог есть — молчит" "$(docs_says 'no file .projects/kit/src')" 0

# SC-AK-49 — дерево берётся у системы контроля версий: обход не видит каталогов с точкой
doc c.md 'Гард `.claude/hooks/some-guard.sh` лежит в дереве.'
report "SC-AK-49 — путь под каталогом с точкой найден" "$(docs_says 'no file .\.claude/hooks')" 0

# SC-AK-50 — папка задачи из сверки выведена, как архив
printf 'Снятый `docs/tasks/nowhere.md` тут назван.\n' > "$DOC_TREE/docs/tasks/RT-1-x/progress.md"
printf 'Снятый `docs/archive/nowhere.md` тут назван.\n' > "$DOC_TREE/docs/archive/old.md"
git -C "$DOC_TREE" add -A
report "SC-AK-50 — ход работы не судится" "$(docs_says 'no file .docs/tasks/nowhere')" 0
report "SC-AK-50 — архив не судится" "$(docs_says 'no file .docs/archive/nowhere')" 0

# SC-AK-51 и SC-AK-52 — полнота указателя каталога сверяется обеими сторонами
printf '# Архив\n\n| Запись | О чём |\n| --- | --- |\n' > "$DOC_TREE/docs/archive/README.md"
git -C "$DOC_TREE" add -A
report "SC-AK-51 — запись без строки названа" "$(docs_says 'lies in the directory and is not named in the table')" 1
printf '# Архив\n\n| Запись | О чём |\n| --- | --- |\n| `old.md` | о старом |\n| `gone.md` | о снятом |\n' \
    > "$DOC_TREE/docs/archive/README.md"
git -C "$DOC_TREE" add -A
report "SC-AK-51 — названная запись молчит" "$(docs_says 'lies in the directory and is not named in the table')" 0
report "SC-AK-52 — строка без записи названа" "$(docs_says 'is named in the table, and there is no record in the directory')" 1

# SC-AK-53 — дерево, не назвавшее ни одного указателя, сверки указателя не получает
mkdir -p "$DOC_TREE/.claude/rt-kit"
printf '{"indexedDirs":[]}\n' > "$DOC_TREE/.claude/rt-kit/checks.json"
git -C "$DOC_TREE" add -A
report "SC-AK-53 — без объявленных указателей сверки нет" "$(docs_says 'the index diverged from the directory')" 0

# SC-AK-54 — разложенный текст выведен из сверки по своей шапке
doc laid.md '<!-- rt-kit v0.5.0 · rules/some.md · 0123456789ab · правится надстройкой, не здесь -->
Правило зовёт `libs/common/util`, которого в этом дереве нет.'
report "SC-AK-54 — адрес разложенного текста не судится" "$(docs_says 'no file .libs/common/util')" 0
doc own.md 'Свой текст зовёт `libs/common/util`, которого нет.'
report "SC-AK-54 — адрес своего текста судится" "$(docs_says 'no file .libs/common/util')" 1

# SC-AK-55 — исходник переносимого текста выведен по каталогу из настройки
mkdir -p "$DOC_TREE/assets/rules"
printf 'Исходник правила зовёт `prisma/schema.prisma`, которого нет.\n' > "$DOC_TREE/assets/rules/some.md"
git -C "$DOC_TREE" add -A
report "SC-AK-55 — неназванный каталог исходников судится" "$(docs_says 'no file .prisma/schema\.prisma')" 1
printf '{"indexedDirs":[],"portableDirs":["assets"]}\n' > "$DOC_TREE/.claude/rt-kit/checks.json"
git -C "$DOC_TREE" add -A
report "SC-AK-55 — названный каталог исходников не судится" "$(docs_says 'no file .prisma/schema\.prisma')" 0

rm -rf "$DOC_TREE"

suite_result "проверки: адреса"
