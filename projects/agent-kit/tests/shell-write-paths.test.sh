#!/usr/bin/env bash
# Сценарии общего помощника разбора путей записи: `rt_write_targets` берёт из текста команды те
# пути, в которые команда пишет, и молчит на чтении.
#
# Помощник до этого проверялся только через гарды, которые его зовут: набор гарда краснел на своей
# фикстуре, и по такому провалу не видно, промах в разборе или в самом гарде. Здесь судится один
# разбор — без дерева, без заголовка раскладки и без решения о правке.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "разбор путей записи из текста команды"

# shellcheck disable=SC1090
. "$HOOKS/write-targets.sh"

# Пути помощник печатает по одному в строке: набор ищет строку целиком, чтобы `docs/a.md` не
# считался найденным внутри более длинного имени.
targets() { printf '%s' "$1" | rt_write_targets; }
names() { targets "$1" | grep -cxF "$2"; }
count() { targets "$1" | grep -c .; }

report "SC-AK-924 — перенаправление называет путь" \
    "$(names 'printf x > docs/a.md' 'docs/a.md')" 1
report "SC-AK-924 — дописывание в конец называет путь" \
    "$(names 'printf x >> docs/a.md' 'docs/a.md')" 1
report "SC-AK-924 — отдача через tee называет путь" \
    "$(names 'printf x | tee docs/a.md' 'docs/a.md')" 1
report "SC-AK-924 — правка на месте через sed -i называет путь" \
    "$(names 'sed -i "" -e s/a/b/ docs/a.md' 'docs/a.md')" 1
report "SC-AK-924 — копирование поверх называет цель" \
    "$(names 'cp docs/b.md docs/a.md' 'docs/a.md')" 1
report "SC-AK-924 — источник копирования целью не считается" \
    "$(names 'cp docs/b.md docs/a.md' 'docs/b.md')" 0

# Тело толкователя: путь записи стоит внутри кода, и снаружи команда выглядит запуском, а не
# записью.
HEREDOC="$(printf 'python3 <<PY\nopen("docs/a.md", "w").write("x")\nPY\n')"
report "SC-AK-925 — путь записи из тела heredoc" \
    "$(names "$HEREDOC" 'docs/a.md')" 1
report "SC-AK-925 — путь записи из кода в аргументе" \
    "$(names 'node -e '"'"'require("fs").writeFileSync("docs/a.md", "x")'"'"'' 'docs/a.md')" 1

READONLY="$(printf 'python3 <<PY\nprint(open("docs/a.md").read())\nPY\n')"
report "SC-AK-925 — тело без единой записи путей не отдаёт" \
    "$(count "$READONLY")" 0

# Чтение записью не считается: гард, который мешает читать, выключают в первый же день.
report "SC-AK-926 — чтение файла путей не отдаёт" \
    "$(count 'cat docs/a.md')" 0
report "SC-AK-926 — поиск по дереву путей не отдаёт" \
    "$(count 'grep -rn text docs/a.md')" 0
report "SC-AK-926 — чтение через sed -n записью не считается" \
    "$(count 'sed -n 1,20p docs/a.md')" 0

# Заглушённый вывод признаком записи не бывает: иначе запуск проверки рядом с правкой запрещал бы
# путь этой проверки.
report "SC-AK-927 — заглушённый вывод путей не отдаёт" \
    "$(count 'bash tools/probe.sh > /dev/null 2>&1')" 0
report "SC-AK-927 — рядом с заглушённым выводом настоящая запись видна" \
    "$(names 'printf x > docs/a.md 2>/dev/null' 'docs/a.md')" 1

suite_result "разбор путей записи из текста команды"
