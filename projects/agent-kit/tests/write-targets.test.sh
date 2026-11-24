#!/usr/bin/env bash
# Сценарии разбора мест записи на составной команде: ключ своего интерпретатора, правка на месте не
# переходит через границу команды, переменная с литералом из той же команды раскрыта.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "места записи в составной команде"

# shellcheck disable=SC1090
. "$HOOKS/write-targets.sh"
targets() { printf '%s' "$1" | rt_write_targets | tr '\n' ' ' | sed 's/ $//'; }

# Ключ ищется у своего интерпретатора.
report "SC-AK-1942 — -c чужой команды рядом с запуском скрипта — не код" \
    "$(targets 'grep -c "open(w)" docs/a.md && node tools/check-specs.mjs --write docs/b.md > /dev/null')" ''
report "SC-AK-1942 — код интерпретатора называет своё место" \
    "$(targets "grep -c x docs/a.md; node -e 'require(\"fs\").writeFileSync(\"docs/b.md\", \"x\")'")" 'docs/b.md'
report "SC-AK-1942 — код кончается своей кавычкой: запуск после него — не запись" \
    "$(targets "node -e 'require(\"fs\").writeFileSync(\"docs/b.md\", \"x\")' && node tools/check-specs.mjs docs/c.md")" 'docs/b.md'

# Правка на месте не переходит через границу команды.
report "SC-AK-1942 — sed -i до «&&» называет свой файл" "$(targets 'sed -i "" s/a/b/ docs/a.md && cat docs/b.md')" 'docs/a.md'
report "SC-AK-1942 — sed -i до «;» называет свой файл" "$(targets "sed -i '' 's/a/b/;s/c/d/' docs/a.md; grep -n x docs/b.md")" 'docs/a.md'
report "SC-AK-1942 — sed -E -i называет файл" "$(targets 'sed -E -i.bak s/a/b/ docs/a.md')" 'docs/a.md'
report "SC-AK-1942 — sed -n записью не считается" "$(targets 'sed -n -e 1,5p docs/a.md && true')" ''

# Переменная с литералом из той же команды.
report "SC-AK-1942 — перенаправление в переменную раскрыто" "$(targets 'F=docs/a.md; echo x > "$F"')" 'docs/a.md'
report "SC-AK-1942 — переменная каталога раскрыта внутри пути" "$(targets 'D="docs/x" && echo x >> ${D}/a.md')" 'docs/x/a.md'
report "SC-AK-1942 — переменная цикла раскрыта каждым словом" \
    "$(targets 'for f in docs/a.md docs/b.md; do sed -i "" s/a/b/ "$f"; done')" 'docs/a.md docs/b.md'
report "SC-AK-1942 — неизвестная переменная остаётся как есть" "$(targets 'echo x > "$OUT"')" '$OUT'

report "SC-AK-1942 — две переменные одного пути раскрыты обе" "$(targets 'D=docs; F=a.md; echo x > $D/$F')" 'docs/a.md'

# Формы, которые находило ревью.
report "SC-AK-1942 — ключ -i после выражения" "$(targets "sed -e s/a/b/ -i.bak docs/a.md && ls")" 'docs/a.md'
report "SC-AK-1942 — код из склеенных кавычек — одно слово" "$(targets "python3 -c 'open(\"'docs/a.md'\",\"w\").write(1)'")" 'docs/a.md'
report "SC-AK-1942 — ключ в кавычках перед кодом" \
    "$(targets "node --import \"tsx\" -e 'require(\"fs\").writeFileSync(\"docs/a.md\",\"\")'")" 'docs/a.md'
report "SC-AK-1942 — сообщение в несколько строк — не команда" \
    "$(targets "git commit -m 'первая строка
run sed -i s/a/b/ docs/a.md && ok'" | grep -c 'docs/a.md')" 0
report "SC-AK-1942 — комментарий конца строки не закрывает чужую кавычку" "$(targets "echo x > docs/a.md # don't")" 'docs/a.md'
report "SC-AK-1942 — чтение на строке записи места не называет" \
    "$(targets "python3 -c 's = open(\"docs/a.md\").read(); open(\"docs/b.md\",\"w\").write(s)'")" 'docs/b.md'

suite_result "места записи в составной команде"
