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

# Пишущее слово — команда только в начале своего куска.
for read in "grep -n 'cp -r' docs/a.md | head" "rg 'sed -i' docs/a.md | head" "grep -n 'sed -i' docs/a.md; ls" "git log --grep 'install deps' -- docs/a.md && echo x"; do
    report "SC-AK-1942 — «$read» читает" "$(targets "$read")" ''
done
for write in 'x=1 sudo cp b docs/a.md' 'git mv b docs/a.md' '/bin/cp b docs/a.md' 'if true; then cp b docs/a.md; fi' 'x=$(cp b docs/a.md)' '(cd x && cp b docs/a.md)' "bash -c 'true && cp b docs/a.md'" 'ls | xargs -n1 sed -i "" s/a/b/ docs/a.md'; do
    report "SC-AK-1942 — «$write» пишет" "$(targets "$write")" 'docs/a.md'
done

# Кавычки через строки, русские буквы и две записи одной переменной.
report "SC-AK-1942 — код «bash -c» в несколько строк судится" "$(targets "bash -c '
cd .
echo x > docs/a.md
'")" 'docs/a.md'
report "SC-AK-1942 — апостроф внутри \$'…' кавычку не закрывает" "$(targets "git commit -m \$'it\\'s done'
echo x > docs/a.md")" 'docs/a.md'
report "SC-AK-1942 — комментарий сразу за «;»" "$(targets "echo a;# don't
echo x > docs/a.md")" 'docs/a.md'
report "SC-AK-1942 — решётка за русской буквой разбора не роняет" "$(targets 'echo задача#5; echo x > docs/a.md')" 'docs/a.md'
report "SC-AK-1942 — переменная с двумя значениями места не называет" "$(targets 'F=/tmp/a; echo x > $F; F=docs/a.md; cat $F')" '$F'

suite_result "места записи в составной команде"
