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

# Тело heredoc — данные команды, а не сама команда. Строка разметки с угловой скобкой внутри тела
# читалась как перенаправление, и правка, ничего в дерево не писавшая, запрещалась путём из цитаты.
QUOTED="$(printf 'cat > docs/a.md <<MD\n> docs/чужое.md\nMD\n')"
report "SC-AK-1140 — цитата внутри тела целью не считается" \
    "$(names "$QUOTED" 'docs/чужое.md')" 0
report "SC-AK-1140 — цель перед телом названа по-прежнему" \
    "$(names "$QUOTED" 'docs/a.md')" 1

# Путь внутри строки, которую скрипт пишет или подставляет, — содержимое записи, а не её цель.
# Скрипт правил файл хода работы, и в новой строке стояло имя разложенной копии образца: строка
# `replace(` читалась записью, и команду отбивала копия, которой скрипт не касался.
REPLACED="$(printf "python3 - <<'PY'\np = 'docs/tasks/x/progress.md'\ns = open(p).read()\ns = s.replace('old', 'new line with .claude/skills/doc-style-human/SKILL.md')\nopen(p, 'w').write(s)\nPY\n")"
report "SC-AK-1209 — подставляемый текст путей не отдаёт" \
    "$(names "$REPLACED" '.claude/skills/doc-style-human/SKILL.md')" 0
report "SC-AK-1209 — путь записи через переменную назван по-прежнему" \
    "$(names "$REPLACED" 'docs/tasks/x/progress.md')" 1
WRITTEN="$(printf "python3 - <<'PY'\nf = open('docs/a.md', 'w')\nf.write('see tools/other.md')\nPY\n")"
report "SC-AK-1209 — записываемая строка путей не отдаёт" \
    "$(names "$WRITTEN" 'tools/other.md')" 0
report "SC-AK-1209 — путь открытия назван по-прежнему" \
    "$(names "$WRITTEN" 'docs/a.md')" 1
report "SC-AK-1209 — данные записи в коде аргумента путей не отдают" \
    "$(names 'node -e '"'"'require("fs").writeFileSync("docs/a.md", "see tools/other.md")'"'"'' 'tools/other.md')" 0
report "SC-AK-1209 — путь вызова записи в коде аргумента назван" \
    "$(names 'node -e '"'"'require("fs").writeFileSync("docs/a.md", "see tools/other.md")'"'"'' 'docs/a.md')" 1
PATHLIB="$(printf "python3 - <<'PY'\nfrom pathlib import Path\nPath('docs/a.md').write_text('x')\nPY\n")"
report "SC-AK-1209 — путь перед write_text назван по-прежнему" \
    "$(names "$PATHLIB" 'docs/a.md')" 1
OSREPLACE="$(printf "python3 - <<'PY'\nimport os\nos.replace('docs/a.tmp', 'docs/a.md')\nPY\n")"
report "SC-AK-1209 — os.replace целью называет конец переноса" \
    "$(names "$OSREPLACE" 'docs/a.md')" 1

# Сравнение внутри кода толкователя ничего не пишет, и путь в той же строке — проверка, которую
# команда запускает, а не цель записи.
report "SC-AK-1251 — process.exit(a>b?1:0) рядом с запуском проверки путей не отдаёт" \
    "$(count 'node -e "process.exit(a>b?1:0)" && node tools/check-specs.mjs')" 0
COMPARED="$(printf "node - <<'JS'\nif (rows.length > limit.max) console.log(readFileSync('docs/a.md'))\nif (w > h/2) console.log('tools/b.mjs')\nJS\n")"
report "SC-AK-1251 — сравнение с пробелами в теле heredoc путей не отдаёт" "$(count "$COMPARED")" 0
PERLED="$(printf "perl - <<'PL'\nopen(my \$f, '>docs/a.md');\nPL\n")"
report "SC-AK-1251 — перенаправление в строке толкователя называет путь" "$(names "$PERLED" 'docs/a.md')" 1
INSHELL="$(printf "python3 - <<'PY'\nimport os\nos.system('echo x > docs/a.md')\nPY\n")"
report "SC-AK-1251 — перенаправление внутри os.system называет путь" "$(names "$INSHELL" 'docs/a.md')" 1
TIGHT="$(printf "python3 - <<'PY'\nimport os\nos.system('cat y>docs/2026.md')\nPY\n")"
report "SC-AK-1251 — перенаправление без пробела слева называет путь" "$(names "$TIGHT" 'docs/2026.md')" 1
SHELLVAR="$(printf "python3 - <<'PY'\nimport os\nos.system('F=docs/a.md; echo x >>\$F')\nPY\n")"
report "SC-AK-1251 — перенаправление в переменную оболочки называет путь" "$(names "$SHELLVAR" 'docs/a.md')" 1
LOCKED="$(printf "python3 - <<'PY'\nimport os\nos.system('cat y>docs/a.lock')\nPY\n")"
report "SC-AK-1251 — файл замка называется целью" "$(names "$LOCKED" 'docs/a.lock')" 1
ARROWED="$(printf "node - <<'JS'\nconst f = (w) => w/2\nif (w>h/2 || w > h/c) console.log('tools/b.mjs')\nJS\n")"
report "SC-AK-1251 — деление справа от сравнения и стрелки путей не отдаёт" "$(count "$ARROWED")" 0

report "SC-AK-1251 — стрелка в двойных кавычках путей не отдаёт" \
    "$(count 'echo "a->b"')" 0
report "SC-AK-1251 — стрелочная функция в коде node -e путей не отдаёт" \
    "$(count 'node -e "[1].map(x => x)"')" 0
report "SC-AK-1251 — стрелка в одинарных и обратных кавычках путей не отдаёт" \
    "$(count "echo 'a > b' \`echo c > d\`")" 0
report "SC-AK-1251 — перенаправление после кавычек называет путь" \
    "$(names 'echo "a->b" > out' 'out')" 1
report "SC-AK-1251 — экранированная кавычка не открывает строку" \
    "$(names 'echo \" > out' 'out')" 1

suite_result "разбор путей записи из текста команды"
