#!/usr/bin/env bash
# Сценарии снятия шапки с копий образца папки задачи.
#
# Судится функция общего модуля команд, а не сама команда заведения: та ходит в сеть первым же
# действием, и сценарий на неё проверял бы доступность хостинга, а не сборку папки.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: шапка в копии образца папки задачи"

TREE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
BOARD="$TREE_ROOT/tools/board.mjs"

FOLDER="$(mktemp -d)"
cleanup() { rm -rf "$FOLDER"; }
trap cleanup EXIT

# Копия образца ровно в том виде, в каком её кладёт раскладка: шапка первой строкой.
printf '%s\n' '<!-- rt-kit v0.12.0 · samples/tasks/_template/grill.md · bbcf7332ef07 · правится надстройкой, не здесь -->' \
    '# Разбор просьбы' '' 'Текст.' > "$FOLDER/grill.md"
printf '%s\n' '<!-- rt-kit v0.12.0 · samples/tasks/_template/plan.md · 80a52949c90f · правится надстройкой, не здесь -->' \
    '# Замысел' > "$FOLDER/plan.md"
# Свой файл проекта: шапки не несёт и трогать его нечего.
printf '%s\n' '# Ход работы' > "$FOLDER/progress.md"
# Не разметка: снятие её не касается.
printf '%s\n' 'x' > "$FOLDER/note.txt"

# Позвать снятие на каталоге и напечатать, что оно вернуло.
strip_says() {
    node --input-type=module -e "
import { unstampFolder } from '$BOARD';
process.stdout.write(unstampFolder('$FOLDER').sort().join(','));
" 2>&1
}

first_line() {
    head -1 "$FOLDER/$1"
}

report "SC-AK-573 — снятие называет файлы, с которых шапка ушла" \
    "$(strip_says)" "grill.md,plan.md"
report "SC-AK-573 — в разборе просьбы первой строкой стоит заголовок" \
    "$(first_line grill.md)" '# Разбор просьбы'
report "SC-AK-573 — и в замысле тоже" \
    "$(first_line plan.md)" '# Замысел'
report "SC-AK-570 — свой файл проекта не тронут" \
    "$(first_line progress.md)" '# Ход работы'
report "SC-AK-570 — повторный вызов не находит ничего: снимать больше нечего" \
    "$(strip_says)" ""
report "SC-AK-571 — каталога нет — снятие молчит, а не падает" \
    "$(node --input-type=module -e "
import { unstampFolder } from '$BOARD';
process.stdout.write(String(unstampFolder('$FOLDER/нет-такого').length));
" 2>&1)" "0"

# Сам образец шапку несёт: снятие в копии имеет смысл ровно потому, что в образце она стоит.
report "SC-AK-572 — образец папки задачи шапку несёт" \
    "$(head -1 "$TREE_ROOT/docs/tasks/_template/grill.md" | grep -c 'rt-kit v')" 1

suite_result "шапка в копии образца папки задачи"
