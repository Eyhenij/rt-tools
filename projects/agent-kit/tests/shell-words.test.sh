#!/usr/bin/env bash
# Сценарии разбора команды на слова: что пишет вызов, что он только читает и что пишет целиком.
#
# Что пишет команда, решают границы слов: кавычка, разделитель, перенос. Форма названа в имени
# случая, ответ сравнивается целиком — лишняя цель такой же провал, как потерянная.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "разбор команды на слова"

# shellcheck disable=SC1090
. "$HOOKS/write-targets.sh"
targets() { printf '%s' "$1" | rt_write_targets; }
all() { targets "$1" | tr '\n' ' ' | sed 's/ $//'; }
wrote() { report "SC-AK-1962 — $1" "$(all "$2")" "$3"; }
beside() { report "SC-AK-1963 — $1" "$(all "$2")" "${3:-}"; }
whole() {
    report "SC-AK-1964 — $1" "$(printf '%s' "$2" | rt_overwrite_targets | tr '\n' ' ' | sed 's/ $//')" "${3:-}"
}

# Перенаправление.
wrote "'>' с чертой" "printf x >| a/b.sh" "a/b.sh"
wrote "'>' без пробелов" "printf x>a/b.sh" "a/b.sh"
wrote "'>' после заглушённого потока" "printf x 2>/dev/null >a/b.sh" "a/b.sh"
wrote "'&>' оба потока" "echo x &> a/b.log" "a/b.log"
wrote "'>&имя' оба потока" "echo x >& a/b.log" "a/b.log"
wrote "'>>' дописывание" "echo x >> a/b.sh" "a/b.sh"
wrote "'1>' с номером потока и слиянием следом" "echo x 1>a/b.sh 2>&1" "a/b.sh"
wrote "'>&2' рядом с настоящей записью" "echo x >&2 > a/b.sh" "a/b.sh"
wrote "две записи через точку с запятой" "echo x > a/b.sh; echo y > c/d.sh" "a/b.sh c/d.sh"
wrote "запись после закрытой кавычки" "echo \"it's\" > a/b.sh" "a/b.sh"
wrote "запись после строки \$'…' с кавычкой внутри" "echo \$'it\\'s' > a/b.sh; cp x c/d.sh" "a/b.sh c/d.sh"
wrote "запись после экранированного пробела" "echo a\\ b > c/d.sh" "c/d.sh"
wrote "запись после знака сравнения в кавычках" "jq '.a > 1' x.json > a/b.json" "a/b.json"
wrote "вывод одной правки записан другой" "echo 'a' | sed 's/a/b/' > c/d.sh" "c/d.sh"
wrote "запись кода толкователя в файл" "node -e 'x' > a/out.txt" "a/out.txt"

# tee, копии, переносы.
wrote "tee на два файла" "cat a | tee -a b/c.md d/e.md" "b/c.md d/e.md"
wrote "tee после --" "tee -- a/b.sh" "a/b.sh"
wrote "tee рядом с подстановкой вывода" "tee a/b.sh > >(wc -l)" "a/b.sh"
wrote "cp с перенаправлением ошибок" "cp a/x.sh b/y.sh 2>/dev/null" "b/y.sh"
wrote "cp двух файлов в папку" "cp a/x.sh b/z.sh dir/" "dir/x.sh dir/z.sh"
wrote "cp -t папка" "cp -t dir a/x.sh" "dir/x.sh"
wrote "cp --target-directory" "cp x.sh --target-directory=a/b" "a/b/x.sh"
wrote "cp -r папки" "cp -r a/x b/y" "b/y"
wrote "cp -S с суффиксом" "cp -S .bak x.sh a/b.sh" "a/b.sh"
wrote "cp по пути с ./" "cp a/x.sh ./b/y.sh" "b/y.sh"
wrote "mv" "mv a/x.sh b/y.sh" "b/y.sh"
wrote "install -m" "install -m 644 x.sh a/b.sh" "a/b.sh"
wrote "install -Dm слитно" "install -Dm 644 x a/b.sh" "a/b.sh"
wrote "git mv" "git mv a/x.sh a/b.sh" "a/b.sh"
wrote "git -C mv" "git -C sub mv a/x.sh a/b.sh" "a/b.sh"
wrote "docker cp" "docker cp c:/x a/b.sh" "a/b.sh"

# Правка на месте.
wrote "sed -E -i" "sed -E -i '' 's/a/b/' a/b.sh" "a/b.sh"
wrote "sed с ';' в выражении и запуск следом" "sed -i '' 's/a;b/c/' a/b.sh && node x.mjs" "a/b.sh"
wrote "sed с флагом после выражения" "sed 's/a/b/' -i a/b.sh" "a/b.sh"
wrote "sed -i.bak на два файла" "sed -i.bak s/a/b/ f.sh g.sh" "f.sh g.sh"
wrote "sed --in-place=.bak по пути с пробелом" "x=1 sed --in-place=.bak s/a/b/ 'dir with/f.sh'" "dir with/f.sh"
wrote "sed с комментарием в конце" "sed -i -e 's/a/b/' a/b.sh # note" "a/b.sh"
wrote "sed с подстановкой в выражении" "sed -i '' s/a/\$(date +%s)/ a/b.sh" "a/b.sh"
wrote "perl -pi" "perl -pi -e 's/a/b/' a/b.sh" "a/b.sh"
wrote "perl -i.bak на два файла" "perl -i.bak -pe 's/a/b/' a/b.sh c/d.sh" "a/b.sh c/d.sh"
wrote "ruby -i" "ruby -i -pe 'gsub(/a/, 1)' a/b.sh" "a/b.sh"

# Код оболочки.
wrote "bash -c" "bash -c 'printf x > a/b.sh'" "a/b.sh"
wrote "bash -c на двух строках" "bash -c 'cd a
printf x > b/c.sh'" "a/b/c.sh"
wrote "bash -lc с правкой на месте" "bash -lc \"sed -i '' 's/a/b/' a/b.sh\"" "a/b.sh"
wrote "bash -euo pipefail -c" "bash -euo pipefail -c 'cp x a/b.sh'" "a/b.sh"
wrote "bash -o pipefail -c" "bash -o pipefail -c \"sed -i '' s/a/b/ a/b.sh\"" "a/b.sh"
wrote "heredoc внутри bash -c" "bash -c 'cat <<E > a/b.md
it > c/d.md
E'" "a/b.md"
wrote "heredoc оболочке" "bash <<'E'
printf x > a/b.sh
E" "a/b.sh"
wrote "heredoc оболочке с -euo pipefail" "bash -euo pipefail <<'E'
cp x a/b.sh
E" "a/b.sh"
wrote "heredoc через трубу оболочке" "cat <<'E' | bash
printf x > a/b.sh
E" "a/b.sh"

# Вокруг имени команды.
wrote "sudo" "sudo tee a/b.sh < in.txt" "a/b.sh"
wrote "sudo -u" "sudo -u root tee a/b.sh" "a/b.sh"
wrote "env -i с присваиванием" "env -i A=1 tee a/b.sh" "a/b.sh"
wrote "env -u" "env -u X tee a/b.sh" "a/b.sh"
wrote "timeout" "timeout 5 sed -i '' s/a/b/ a/b.sh" "a/b.sh"
wrote "timeout -s" "timeout -s KILL 5 cp x a/b.sh" "a/b.sh"
wrote "timeout со значением из переменной" "timeout \"\$T\" cp x a/b.sh" "a/b.sh"
wrote "nice -n" "nice -n 5 cp x a/b.sh" "a/b.sh"
wrote "time" "time cp x a/b.sh" "a/b.sh"
wrote "coproc" "coproc cp x a/b.sh" "a/b.sh"
wrote "stdbuf" "echo x | stdbuf -oL tee a/b.sh" "a/b.sh"
wrote "xargs с флагом и значением" "ls | xargs -I {} cp {} a/b.sh" "a/b.sh"
wrote "tee посреди трубы" "echo x | tee a/b.sh | wc -l" "a/b.sh"
wrote "if … then" "if true; then printf x > a/b.sh; fi" "a/b.sh"
wrote "for … do с переменной" "for f in a b; do cp x \"\$f/c.sh\"; done" "a/c.sh b/c.sh"
wrote "for по подстановке" "for f in \$(ls); do cp \"\$f\" a/; done" "a/\$f"
wrote "case" "case \$x in a) cp x a/b.sh;; esac" "a/b.sh"
wrote "тело функции" "f() { printf x > a/b.sh; }" "a/b.sh"
wrote "скобки" "(cd x && printf a > y/z.sh)" "y/z.sh"
wrote "двойные скобки из двух подоболочек" "((cd x && echo y) && echo z) ; printf x > a/b.sh" "a/b.sh"
wrote "подстановка в присваивании" "x=\$(printf a > y/z.sh)" "y/z.sh"
wrote "подстановка в кавычках" "echo \"\$(printf a > y/z.sh)\"" "y/z.sh"
wrote "подстановка перед целью" "cp \$(ls -t x | head -1) a/b.sh" "a/b.sh"
wrote "подстановка со скобкой в кавычках" "echo \"a \$(echo ')' ) b\" > a/b.sh" "a/b.sh"
wrote "подстановка с кавычкой в tr, запись следующей строкой" "V=\"\$(grep v f | tr -d '\"')\"
cp x.sh a/b.sh
echo 'see > c/d.md'" "a/b.sh"
wrote "подстановка процесса источником" "cp <(echo x) a/b.sh" "a/b.sh"
wrote "подстановка процесса и запись" "diff <(sort a.txt) <(sort b.txt) > out/c.txt" "out/c.txt"
wrote "кавычка внутри \${…}" "x=\"\${y//'\"'/}\"; cp x a/b.sh" "a/b.sh"
wrote "перенос строки" "cp a \\
 b/c.sh" "b/c.sh"
wrote "тело документа с апострофом" "cat > a/b.md <<'E'
it's a > b/c.md
E" "a/b.md"
wrote "метка тела через обратную косую" "cat <<\\EOF > a/b.md
it's
EOF
cp x c/d.sh" "a/b.md c/d.sh"
wrote "тело с отступом через трубу" "cat <<-E | tee a/b.sh
	x > c/d.sh
	E" "a/b.sh"

# Кто читает тело, решает тот же вопрос, что и «кто стоит первым в вызове».
wrote "heredoc толкователю в теле for" "for f in a; do python3 - <<'E'
open('c/d.py','w').write('')
E
done" "c/d.py"
wrote "heredoc толкователю после then" "if true; then python3 - <<'E'
open('c/d.py','w').write('')
E
fi" "c/d.py"
wrote "heredoc толкователю в фигурных скобках" "{ python3 - <<'E'
open('c/d.py','w').write('')
E
}" "c/d.py"
wrote "heredoc толкователю под timeout" "timeout 10 python3 - <<'E'
open('c/d.py','w').write('')
E" "c/d.py"
wrote "heredoc толкователю под sudo -u" "sudo -u x python3 <<'E'
open('c/d.py','w').write('')
E" "c/d.py"
wrote "heredoc толкователю под env -u" "env -u X python3 <<'E'
open('c/d.py','w').write('')
E" "c/d.py"
wrote "heredoc толкователю после присваивания с пробелом" "A=\"x y\" python3 <<'E'
open('c/d.py','w').write('')
E" "c/d.py"
wrote "heredoc через трубу толкователю под timeout" "cat <<'E' | timeout 5 python3
open('c/d.py','w').write('')
E" "c/d.py"
wrote "heredoc оболочке после do" "for f in a; do bash <<'E'
cp x a/b.sh
E
done" "a/b.sh"
wrote "heredoc толкователю внутри bash -c" "bash -c \"python3 - <<'E'
open('c/d.py','w').write('')
E\"" "c/d.py"
wrote "heredoc толкователю в подстановке" "x=\"\$(python3 - <<'E'
open('c/d.py','w').write('')
E
)\"" "c/d.py"
wrote "два heredoc одной строки" "cat <<'A' > a/b.md; python3 - <<'B'
it's > x/y.md
A
open('c/d.py','w').write('')
B" "a/b.md c/d.py"
wrote "heredoc с трубой, продолженной после тела" "cat <<'E' |
open('c/d.py','w').write('')
E
python3" "c/d.py"
wrote "timeout --kill-after" "timeout --kill-after 5 10 cp x a/b.sh" "a/b.sh"
wrote "sudo --user" "sudo --user root cp x a/b.sh" "a/b.sh"
wrote "eval" "eval \"cp x a/b.sh\"" "a/b.sh"
wrote "gtimeout" "gtimeout 5 cp x a/b.sh" "a/b.sh"
wrote "caffeinate" "caffeinate -i cp x a/b.sh" "a/b.sh"
wrote "pnpm exec" "pnpm exec node -e 'require(\"fs\").writeFileSync(\"a/b.js\",1)'" "a/b.js"
wrote "имя обёртки с путём" "/usr/bin/env cp x a/b.sh" "a/b.sh"
wrote "os.replace в коде" "python3 -c 'import os; os.replace(\"a/b.tmp\", \"a/b.md\")'" "a/b.md a/b.tmp"
wrote "запись оболочкой из кода толкователя" "python3 -c 'import os; os.system(\"echo x > a/b.sh\")'" "a/b.sh"
DIR="$(mktemp -d)"
mkdir -p "$DIR/sub/hooks"
export CLAUDE_PROJECT_DIR="$DIR"
wrote "cp в папку дерева без косой черты" "cp a/x.sh sub/hooks" "sub/hooks/x.sh"
wrote "git mv в папку дерева без косой черты" "git mv a/x.sh sub/hooks" "sub/hooks/x.sh"
unset CLAUDE_PROJECT_DIR
wrote "cp в папку с полным путём" "cp a/x.sh $DIR/sub/hooks" "$DIR/sub/hooks/x.sh"
rm -rf "$DIR"

# Буква из двух байт вне кавычек: awk одной из систем на ней останавливается.
wrote "русское слово без кавычек" "echo готово && printf x > a/b.sh" "a/b.sh"
wrote "русское имя файла" "cat ночь.md; sed -i '' s/a/b/ a/b.sh" "a/b.sh"
wrote "русское имя цели" "echo x >файл/а.md" "файл/а.md"
wrote "комментарий в скобках" "( set -e # strict
sed -i '' s/a/b/ e/f.sh
)" "e/f.sh"
wrote "комментарий в подстановке" "x=\$(cp a b/c.sh # note
cp d e/f.sh)" "b/c.sh e/f.sh"
wrote "heredoc толкователю из подстановки после -c" "python3 -c \"\$(cat <<'E'
open('c/d.py','w').write('')
E
)\"" "c/d.py"
wrote "heredoc толкователю из подстановки процесса" "python3 <(cat <<'E'
open('c/d.py','w').write('')
E
)" "c/d.py"
wrote "bash -c внутри bash -c" "bash -c 'bash -c \"cp x a/b.sh\"'" "a/b.sh"
wrote "bash -c после --" "bash -c -- 'cp x a/b.sh'" "a/b.sh"
wrote "строка <<< оболочке" "bash <<< 'cp x a/b.sh'" "a/b.sh"
wrote "pnpm -s exec" "pnpm -s exec cp x a/b.sh" "a/b.sh"
wrote "xargs --max-args" "ls | xargs --max-args 1 cp x a/b.sh" "a/b.sh"
wrote "stdbuf --output" "echo x | stdbuf --output L tee a/b.sh" "a/b.sh"
wrote "env -S" "env -S 'cp x a/b.sh'" "a/b.sh"
wrote "node --input-type отдельным словом" "node --input-type module -e 'import fs from \"fs\"; fs.writeFileSync(\"a/b.js\",1)'" "a/b.js"
wrote "install --mode" "install --mode 644 x a/b.sh" "a/b.sh"
wrote "слово function" "function f { cp x a/b.sh; }" "a/b.sh"
wrote "eval со строкой" "eval 'printf x > a/b.sh'" "a/b.sh"
wrote "команда записи строкой в коде" "node -e 'require(\"child_process\").execSync(\"cp x.sh a/b.sh\")'" "a/b.sh"

# Флаги со значением и путь через переменную команды.
wrote "pnpm exec --filter со значением" "pnpm exec --filter x cp a b/c.sh" "b/c.sh"
wrote "pnpm --filter перед exec" "pnpm --filter x exec cp a b/c.sh" "b/c.sh"
wrote "pnpm -C перед exec" "pnpm -C apps/x exec cp a b/c.sh" "b/c.sh"
wrote "find -exec" "find . -name '*.md' -exec cp a b/c.sh \\;" "b/c.sh"
wrote "find -exec с плюсом" "find . -name '*.md' -exec sed -i '' s/a/b/ b/c.sh +" "b/c.sh"
wrote "копия файла из переменной в папку" "F=a/b.sh; cp \"\$F\" c/" "c/b.sh"
wrote "копия в папку из переменной" "D=c; cp a/b.sh \"\$D/\"" "c/b.sh"
wrote "переменная в коде оболочки" "bash -c 'F=a/b.sh; printf x > \$F'" "a/b.sh"
wrote "цикл по двум файлам в папку" "for f in a/b.sh a/c.sh; do cp \"\$f\" d/; done" "d/b.sh d/c.sh"

# Слово в кавычках, незнакомый запускающий, сценарий из той же строки.
wrote "слово [[ в кавычках перед перенаправлением" "grep -F '[[' x.sh > a/b.txt" "a/b.txt"
wrote "слово [[ в кавычках перед копией" "grep -F '[[' x.sh && cp a/x.sh a/b.sh" "a/b.sh"
wrote "heredoc толкователю за uv run" "uv run python - <<'E'
open('a/b.py','w')
E" "a/b.py"
wrote "код толкователя за pnpm" "pnpm node -e \"require('fs').writeFileSync('a/b.ts','x')\"" "a/b.ts"
wrote "bash -c за op run" "op run -- bash -c 'echo x > a/b.sh'" "a/b.sh"
wrote "bash -c за arch" "arch -arm64 bash -c 'echo x > a/b.sh'" "a/b.sh"
wrote "копия за op run" "op run -- cp x a/b.sh" "a/b.sh"
wrote "tee за doas" "doas tee a/b.sh < x" "a/b.sh"
wrote "сценарий записан и запущен одной строкой" "cat > /tmp/zz-x.py <<'E' && python3 /tmp/zz-x.py
open('a/b.py','w').write('x')
E" "/tmp/zz-x.py a/b.py"
wrote "сценарий записан и запущен следующей строкой" "cat <<'E' > /tmp/zz-y.sh
cp x a/b.sh
E
bash /tmp/zz-y.sh" "/tmp/zz-y.sh a/b.sh"
wrote "команда строкой в коде за sudo" "python3 - <<'E'
import os
os.system(\"sudo cp a/x.sh a/b.sh\")
E" "a/b.sh"
wrote "команда в переменной кода" "python3 - <<'E'
cmd = 'cp a/x.sh a/b.sh'
os.system(cmd)
E" "a/b.sh"
wrote "renames в коде" "python3 -c 'os.renames(\"a/b.py\", \"c/d.py\")'" "a/b.py c/d.py"
wrote "replace без os" "python3 - <<'E'
from os import replace
replace('a/b.py', 'c/d.py')
E" "a/b.py c/d.py"
wrote "replace у пути с одним доводом" "python3 - <<'E'
for p in [Path('a/b.py')]: p.replace('c/d.py')
E" "a/b.py c/d.py"
wrote "ruby -r перед кодом" "ruby -r json -e \"File.open('a/b.rb','w')\"" "a/b.rb"
wrote "perl -I перед кодом" "perl -I lib -e 'open(F, \">a/b.sh\")'" "a/b.sh"
wrote "node с длинным флагом и значением" "node --title foo -e \"require('fs').writeFileSync('a/b.ts','x')\"" "a/b.ts"
wrote "копия в обратных кавычках" "x=\`cp a/x.sh a/b.sh\`; echo \$x" "a/b.sh"
wrote "подстановка внутри \${…}" "echo \${x:-\$(cp a/x.sh a/b.sh)}" "a/b.sh"
wrote "метка heredoc не с буквы" "cat <<'---' > a/b.md
text > a/c.sh
cp q/w e/r.sh
---
cp y c/d.sh" "a/b.md c/d.sh"
wrote "путь от \$PWD" "printf x > \$PWD/a/b.sh" "a/b.sh"
wrote "путь от \${CLAUDE_PROJECT_DIR}" "cp x \"\${CLAUDE_PROJECT_DIR}/a/b.sh\"" "a/b.sh"
wrote "копия в текущую папку" "cp a/x.sh ./" "x.sh"
wrote "копия содержимого папки" "cp -R src/. a/b/" "a/b"
wrote "xargs cp -t" "ls | xargs -0 cp -t c" "c"
wrote "труба с ошибками в толкователь" "cat <<'E' |& python3
open('a/b.py','w')
E" "a/b.py"
wrote "копия файла кодом называет, куда" "node -e 'require(\"fs\").copyFileSync(\"a/b.sh\",\"c/d.sh\")'" "c/d.sh"
wrote "перенос кодом называет оба конца" "python3 -c \"import shutil; shutil.move('a/b.sh','c/d.sh')\"" "a/b.sh c/d.sh"

# Граница слова: ]] вплотную, кавычка внутри ${…}, текст кода рядом с записью.
wrote "]] вплотную к &&" "[[ -f x ]]&&cp x a/b.sh" "a/b.sh"
wrote "]] вплотную к || и перенаправление" "[[ -f x ]]|| printf x > a/b.sh" "a/b.sh"
wrote "]] вплотную к скобке" "([[ -n \"\$x\" ]]) && echo z > y/q.sh" "y/q.sh"
wrote "скобка в кавычках внутри \${…}" "x=\${y%'}'}; cp q c/d.sh" "c/d.sh"
wrote "скобка в двойных кавычках внутри \${…}" "x=\"\${line%\"}\"}\"; cp q c/d.sh" "c/d.sh"
wrote "подстановка со скобкой внутри \${…}" "echo \"\${x:-\$(echo \"}\")}\" ; cp y c/d.sh" "c/d.sh"
wrote "апостроф внутри \${…}" "echo \"\${x:-it's}\"; cp q c/d.sh" "c/d.sh"
wrote "строка \$'…' с переносом внутри bash -c" "bash -c \$'printf x > a/b.sh\\ncp y c/d.sh'" "a/b.sh c/d.sh"
wrote "аргументы после кода bash -c" "bash -c 'cp \"\$0\" \"\$1\"' /tmp/x a/b.sh" "a/b.sh"
wrote "все аргументы после кода bash -c" "bash -c 'cp \"\$@\"' _ /tmp/x a/b.sh" "a/b.sh"
wrote "cd в папку внутри bash -c" "bash -c 'cd a && printf x > b/c.sh'" "a/b/c.sh"
wrote "'>!' оболочки zsh" "echo x >! a/b.sh" "a/b.sh"
wrote "source записанного сценария" "cat > /tmp/zz-q.sh <<'E'
cp x a/b.sh
E
source /tmp/zz-q.sh" "/tmp/zz-q.sh a/b.sh"
wrote "слово run в строке кода перед записью" "node -e \"const fs=require('fs'); console.log('run '+name); fs.writeFileSync('a/b.js', s)\"" "a/b.js"
wrote "слово run в конце строки кода" "python3 -c \"print('dry run '); open('a/b.py','w').close()\"" "a/b.py"
wrote "команда в обратных кавычках внутри текста правки" "python3 - <<'E'
s=s.replace('old', 'Before the push run \`cp a/x.sh tools/b.sh\` and commit')
open('docs/x.md','w').write(s)
E" "docs/x.md"

# Чтение, запуск, текст — и запись рядом с ними.
beside "стрелка в кавычках" "echo 'a -> b/c.ts'"
beside "экранированная стрелка" "echo a \\> b/c.sh"
beside "sed -n читает" "sed -n '1,3p' a/b.sh"
beside "perl -ne читает" "perl -ne 'print if /a/' a/b.sh"
beside "perl -ne слитно с кодом" "perl -ne'print if /x/' a/b.sh"
beside "ruby -r с библиотекой" "ruby -rdigest -e 'puts Digest' a/b.sh"
beside "grep -e рядом с node" "grep -e x a.sh && node y.mjs"
beside "слово записи в образце поиска" "node x.mjs && grep -e 'mkdir a/b.sh' c.sh"
beside "код без записи и чтение следом" "node -e 'console.log(1)' && cat a/b.js"
beside "python3 -c читает" "python3 -c 'print(open(\"a/b.py\").read())'"
beside "скрипт со своим -e" "node script.mjs -e prod/x.js"
beside "скрипт со своим -p" "python3 tools/x.py -p a/writeFile.js"
beside "[[ сравнение" "[[ \$a > b/c.sh ]] && echo"
beside "[[ в условии" "if [[ \$a > b/c.sh ]]; then echo; fi"
beside "[[ после отрицания" "if ! [[ a > b/c.sh ]]; then :; fi"
beside "[[ и запись следом" "[[ a ]] && printf x > a/b.sh" "a/b.sh"
beside "[[ с подстановкой и запись" "[[ -n \$(cat a) ]] > a/b.sh" "a/b.sh"
beside "[[ с && внутри" "[[ \$a == x && \$b > c/d.sh ]] && cp x a/b.sh" "a/b.sh"
beside "[[ со скобками внутри" "[[ ( -n \$a ) && \$b =~ ^(x|y)\$ ]] && cp x a/b.sh" "a/b.sh"
beside "(( сравнение" "(( a > b/c.sh ))"
beside "(( в подстановке" "x=\$(( a > b ))"
beside "(( и запись следом" "((a > b/c.sh)) && cp x a/b.sh" "a/b.sh"
beside "(( с && внутри" "(( a > 1 && b > c/d.sh )) && cp x a/b.sh" "a/b.sh"
beside "(( с командой внутри и запись следом" "x=\$(( \$(wc -l < f) > 3 )); cp x a/b.sh" "a/b.sh"
beside "<<< строка на вход" "cat <<< 'x > a/b.sh'"
beside "< чтение из файла" "cat < a/b.sh"
beside ">& с номером" "echo x >& 2"
beside ">& с переменной" "echo e >&\$fd"
beside "сообщение фиксации" "git commit -m 'a > b/c.sh'"
beside "слово mv в сообщении" "git commit -m mv -- a/b.sh"
beside "тело запроса" "gh pr create --body 'see > a/b.md'"
beside "заглушённый список" "ls > /dev/null 2>&1"
beside "awk со своей записью" "awk '{print > \"a/b.sh\"}' x"
beside "образец поиска со стрелкой" "grep -c '>' a/b.sh"
beside "документ рядом с node" "node x.mjs && cat > n.md <<'E'
- mkdir a/b.sh
E" "n.md"
beside "документ с кодом рядом с node -p" "node -p '1' && cat <<'E' > n.md
fs.writeFileSync('a/b.sh')
E" "n.md"
beside "ssh на чужой машине" "ssh host bash -s <<'E'
cp x a/b.sh
E"
beside "docker exec в чужом месте" "docker exec -i c sh <<'E'
cp x a/b.sh
E"
beside "чтение с функцией-стрелкой" "node -e 'console.log(require(\"fs\").readFileSync(\"a/b.sh\",\"utf8\").split(\"x\").filter(x => x.length))'"
beside "чтение со сравнением" "node -e 'const s = require(\"fs\").readFileSync(\"a/b.sh\",\"utf8\"); if (s.length > max) console.log(1)'"
beside "чтение с replace строки" "node -e 'console.log(require(\"fs\").readFileSync(\"a/b.json\",\"utf8\").replace(/x/, 1))'"
beside "тело скрипта — его данные" "node tools/x.mjs <<'E'
mkdir a/b.sh
E"
beside "тело модуля толкователя — его данные" "python3 -m json.tool <<'E'
{\"a\": \"mkdir a/b.sh\"}
E"
beside "метка тела в кавычках поиска" "grep '<<E' f && cp x a/b.sh" "a/b.sh"
beside "тело, за которым труба не ведёт" "cat <<'E' ; python3 x.py
open('a/b.py','w')
E"
beside "чтение со словом mkdir в строке" "python3 -c \"print([l for l in open('a/b.sh') if 'mkdir' in l])\""
beside "чтение со словом rename в строке" "node -e 'console.log(require(\"fs\").readFileSync(\"a/b.sh\",\"utf8\").includes(\"rename\"))'"
beside "чтение со словом writeFile в строке" "node -e 'console.log(require(\"fs\").readFileSync(\"a/b.sh\",\"utf8\").includes(\"writeFile\"))'"
beside "текст подстановки данными скрипту" "python3 x.py \"\$(cat <<'E'
open('c/d.py','w').write('')
E
)\""
beside "русское слово в чтении" "grep -n готово a/b.sh"
beside "find без -exec" "find . -name '*.md' -newer a/b.sh"
beside "pnpm со скриптом" "pnpm --filter x run cp a b/c.sh"
beside "чтение кодом рядом с записью" "node -e 'const fs=require(\"fs\"); const p=\"a/b.sh\"; const s=fs.readFileSync(p,\"utf8\"); fs.writeFileSync(\"/tmp/o.txt\", s.length)'" "/tmp/o.txt"
beside "запуск кодом рядом с записью" "node -e 'const o=require(\"child_process\").execFileSync(\"bash\",[\"a/b.sh\"]); require(\"fs\").writeFileSync(\"/tmp/o.txt\", o)'" "/tmp/o.txt"
beside "поиск строкой в коде с выводом в файл" "node -e 'require(\"child_process\").execSync(\"grep -n x a/b.sh > /tmp/o.txt\")'" "/tmp/o.txt"
beside "копия наружу кодом" "python3 -c \"import shutil; shutil.copy('a/b.sh','/tmp/x.sh')\"" "/tmp/x.sh"
beside "папка создана, файл прочитан" "python3 -c \"import os; os.makedirs('/tmp/z',exist_ok=True); print(os.path.getsize('a/b.sh'))\""
beside "строка со словом touch" "python3 -c \"print('touch targets', 'a/b.scss')\""
beside "строка со словом install" "python3 - <<'E'
for p in ['a/b.py', 'c/d.py']: print('install order', p)
E"
beside "фильтр perl со стрелкой" "perl -ne 'print if m{> docs/a.md}' x/y.md"
beside "слово толкователя доводом чужой команды" "grep -rn node -e 'fs.writeFileSync(\"a/b.ts\")' src"
beside "cp доводом чужой команды" "man cp a/b.sh; npm run cp a/b.sh"
beside "проверка синтаксиса тела" "bash -n <<'E'
cp x a/b.sh
E"
beside "сценарий во временной папке, записанный и запущенный" "cat > /tmp/zz-run.sh <<'E'
cd \"\$(mktemp -d)\"
echo x > a/b.sh
E
bash /tmp/zz-run.sh" "/tmp/zz-run.sh"
beside "тело оболочки во временной папке" "bash <<'E'
cd \"\$(mktemp -d)\"
echo x > a/b.sh
E"
beside "bash -n записанного сценария" "cat > /tmp/zz-n.sh <<'E'
cp x a/b.sh
E
bash -n /tmp/zz-n.sh" "/tmp/zz-n.sh"
beside "node --check записанного сценария" "cat > /tmp/zz-n.mjs <<'E'
fs.writeFileSync('a/b.sh', 1)
E
node --check /tmp/zz-n.mjs" "/tmp/zz-n.mjs"
beside "элементы массива" "names=(cp a/x.sh b/y.sh); echo \"\${names[@]}\""
beside "command -v" "command -v tee a/x.sh"
beside "kubectl exec в чужом месте" "kubectl exec pod -- bash -c 'cp x a/b.sh'"
beside "[[ на двух строках" "[[ a &&
\$b > c/d.sh ]]"

# Запись целиком заменяет содержимое; дописывание и правка на месте его хранят.
whole "'>'" "printf x > o/a.md" "o/a.md"
whole "'>>'" "printf x >> o/a.md"
whole "'>' с чертой" "printf x >| o/a.md" "o/a.md"
whole "tee" "cat b | tee o/a.md" "o/a.md"
whole "tee -a" "cat b | tee -a o/a.md"
whole "tee --append" "cat b | tee --append o/a.md"
whole "cp" "cp b o/a.md" "o/a.md"
whole "cp в папку" "cp b/a.md o/" "o/a.md"
whole "sed -i" "sed -i '' s/a/b/ o/a.md"
whole "perl -pi" "perl -pi -e s/a/b/ o/a.md"
whole "чтение" "cat o/a.md"
whole "тело документа" "cat > o/a.md <<'E'
> o/b.md
E" "o/a.md"
whole "bash -c" "bash -c 'cp b o/a.md'" "o/a.md"
whole "русское слово без кавычек" "echo готово; cp b o/a.md" "o/a.md"
whole "запись целиком через переменную" "F=o/a.md; cp b \"\$F\"" "o/a.md"
whole "код в строке команды пишет целиком" "node -e \"require('child_process').execSync('echo x > o/a.md')\"" "o/a.md"
whole "код толкователя пишет целиком" "python3 -c \"open('o/a.md','w').write('x')\"" "o/a.md"
whole "код толкователя дописывает" "python3 -c \"open('o/a.md','a').write('x')\""
whole "код читает и пишет рядом" "node -e 'const p=\"o/a.md\"; const s=require(\"fs\").readFileSync(p); require(\"fs\").writeFileSync(\"/tmp/o\", s)'" ""
whole "'<>' читает и пишет" "exec 3<> o/a.md"

# Длинная команда читается быстро: проверка стоит перед каждым вызовом.
quick() {
    local at
    at="$(date +%s)"
    beside "$1 прочитаны, запись рядом названа" "$2" "a/b.sh"
    report "SC-AK-1963 — $1 прочитаны за пять секунд" "$([ $(($(date +%s) - at)) -le 5 ] && echo да || echo нет)" да
}
quick "40 КБ одного слова" "$(printf 'printf x > a/b.sh; echo "%s"' "$(head -c 40000 /dev/zero | tr '\0' 'x')")"
quick "четыре тысячи подстановок" "$(printf 'echo'; for i in $(seq 1 4000); do printf ' $(a%s)' "$i"; done; printf '; cp x a/b.sh')"
quick "сорок килобайт сравнений" "$(printf '[[ a'; for i in $(seq 1 3000); do printf ' && $b == %s' "$i"; done; printf ' ]]; cp x a/b.sh')"

suite_result "разбор команды на слова"
