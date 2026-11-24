#!/usr/bin/env bash
# Сценарии записи кодом: что пишет, что только читает и что пишет целиком код, отданный толкователю.
#
# Адрес записи стоит внутри кода, а команда, которую код запускает, читается как команда оболочки.
# Ответ сравнивается целиком — лишняя цель такой же провал, как потерянная.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "запись кодом толкователя"

# shellcheck disable=SC1090
. "$HOOKS/write-targets.sh"
targets() { printf '%s' "$1" | rt_write_targets; }
all() { targets "$1" | tr '\n' ' ' | sed 's/ $//'; }
wrote() { report "SC-AK-1962 — $1" "$(all "$2")" "$3"; }
beside() { report "SC-AK-1963 — $1" "$(all "$2")" "${3:-}"; }
whole() {
    report "SC-AK-1964 — $1" "$(printf '%s' "$2" | rt_overwrite_targets | tr '\n' ' ' | sed 's/ $//')" "${3:-}"
}

# Код толкователя.
wrote "node -e" "node -e 'require(\"fs\").writeFileSync(\"a/b.js\",1)'" "a/b.js"
wrote "node -r перед -e" "node -r ./x.js -e 'require(\"fs\").writeFileSync(\"a/b.js\",1)'" "a/b.js"
wrote "node --eval=" "node --eval='require(\"fs\").writeFileSync(\"a/b.js\",1)'" "a/b.js"
wrote "node --input-type перед -e" \
    "node --input-type=module -e 'import fs from \"fs\"; fs.writeFileSync(\"a/b.js\",1)'" "a/b.js"
wrote "python3 -c" "python3 -c 'open(\"a/b.py\",\"w\").write(\"x\")'" "a/b.py"
wrote "python3 -c слитно" "python3 -c'open(\"a/b.py\",\"w\").write(1)'" "a/b.py"
wrote "python3 -c с переменной и путём в данных" "python3 -c \"
p = 'a/b.py'
open(p, 'w').write('see c/d.py')
\"" "a/b.py"
wrote "второй путь той же переменной" "python3 - <<'E'
p = 'a/b.md'; s = open(p).read(); open(p, 'w').write(s)
p = 'a/c.md'; s = open(p).read(); open(p, 'w').write(s)
E" "a/b.md a/c.md"
wrote "heredoc после cd" "cd x && python3 - <<'E'
open('a/b.py', 'w').write('x')
E" "a/b.py"
wrote "heredoc через трубу толкователю" "cat <<'E' | python3
open('a/b.py', 'w').write('x')
E" "a/b.py"

# Команда, которую запускает код: строкой, списком слов, без скобок.
wrote "незакрытая кавычка одной команды кода не гасит соседней" "python3 -c \"import os; os.system('echo it')\"; bash -c 'cp x a/b.sh'" "a/b.sh"
wrote "экранированная кавычка в команде кода" "python3 - <<'E'
os.system(\"cd q && cp \\\"x y\\\" a/b.sh\")
E" "q/a/b.sh"
wrote "вторая команда кода после экранированной кавычки" "python3 - <<'E'
os.system('sed -i \"\" \"s/it\\'s/its/\" a/b.sh')
os.system(\"cp x c/d.sh\")
E" "a/b.sh c/d.sh"
wrote "команда кода списком слов" "python3 -c \"import subprocess; subprocess.run(['cp','x','a/b.sh'])\"" "a/b.sh"
wrote "команда кода списком после имени" "node -e \"require('child_process').execFileSync('cp',['x','a/b.sh'])\"" "a/b.sh"
wrote "bash -c списком слов" "python3 -c \"import subprocess; subprocess.run(['bash','-c','echo x > a/b.sh'])\"" "a/b.sh"
wrote "system без скобок" "perl -e 'system \"cp x a/b.sh\"'" "a/b.sh"

# Адрес записи кодом: вторым доводом, списком, через поле.
wrote "копия кодом через переменную" "python3 - <<'E'
dst = 'a/b.py'
shutil.copyfile('x/y.py', dst)
E" "a/b.py"
wrote "перенос кодом через переменные" "python3 - <<'E'
path='a/b.json'; tmp='/tmp/b.json'; open(tmp,'w').write('x'); os.replace(tmp, path)
E" "/tmp/b.json a/b.json"
wrote "цикл по списку одной строкой" "node -e \"const fs=require('fs'); for (const f of ['a/b.sh','c/d.sh']) { let s=fs.readFileSync(f,'utf8'); fs.writeFileSync(f,s); }\"" "a/b.sh c/d.sh"
wrote "список в переменной и цикл" "node -e \"const files=['a/b.sh']; for (const f of files) fs.writeFileSync(f,'x')\"" "a/b.sh"
wrote "цикл python на двух строках" "python3 - <<'E'
for p in ['a/b.sh', 'c/d.sh']:
    open(p, 'w').write('x')
E" "a/b.sh c/d.sh"
wrote "forEach по списку" "node -e \"['a/b.sh'].forEach(f => { let s=fs.readFileSync(f,'utf8'); fs.writeFileSync(f,s) })\"" "a/b.sh"
wrote "путь через resolve" "node -e \"const p = require('path').resolve('a/b.sh'); fs.writeFileSync(p,'x')\"" "a/b.sh"
wrote "путь шаблонной строкой" "node -e 'const p = \`a/b.sh\`; fs.writeFileSync(p, 1)'" "a/b.sh"
wrote "путь в поле объекта" "node -e \"const o={p:'a/b.sh'}; fs.writeFileSync(o.p,'x')\"" "a/b.sh"
wrote "две переменные одной строкой" "node -e \"const a='a/b.sh', b='c/d.sh'; writeFileSync(a); writeFileSync(b)\"" "a/b.sh c/d.sh"
wrote "режим wb и запись следующей строкой" "python3 - <<'E'
with open('a/b.sh', 'wb') as f:
    f.write(b'x')
E" "a/b.sh"
wrote "режим x" "python3 -c \"open('a/b.sh','x').write('x')\"" "a/b.sh"

# Код читает, запускает, печатает — и пишет рядом.
beside "команда в комментарии кода" "python3 - <<'E'
# run(\"sed -i s/a/b/ a/b.sh\") by hand
print(1)
E"
beside "команда в строке кода" "node -e \"console.log('run(\\\"cp a/x.sh b/c.sh\\\") first')\""
beside "exec образца поиска" "node -e \"const text = 'cp a/x.sh docs/a.md'; console.log(/x/.exec(text))\""
beside "запуск списком с выводом в файл" "python3 - <<'E'
subprocess.run(['bash','a/b.sh'], stdout=open('/tmp/o.txt','w'))
E" "/tmp/o.txt"
beside "чтение с кодировкой рядом с записью" "python3 - <<'E'
with open('a/b.sh', encoding='utf-8') as f, open('/tmp/o.txt','w') as g: g.write(f.read())
E" "/tmp/o.txt"
beside "чтение с кодировкой в поток" "python3 -c \"import sys; sys.stdout.write(open('a/b.sh', encoding='utf-8').read())\""
beside "имена в поток" "node -e \"for (const p of ['a/b.sh','c/d.sh']) process.stdout.write(p)\""
beside "replace с одним доводом у строки" "node -e 'console.log(\"a/b.sh\".replace(\"x\"))'"
beside "replace с именем довода" "python3 -c \"print('docs/a.md', datetime.now().replace(microsecond=0))\""

# Код пишет файл целиком; файл, который код прочёл, он правит на месте.
whole "слово append в тексте записи" "python3 -c \"open('o/a.md','w').write('appended')\"" "o/a.md"
whole "буква a в тексте записи" "python3 -c \"open('o/a.md','w').write('a')\"" "o/a.md"
whole "буква a ключом данных" "python3 -c \"json.dump({'a': 1}, open('o/a.md','w'))\"" "o/a.md"
whole "слово appendix в тексте записи node" "node -e \"fs.writeFileSync('o/a.md', 'appendix')\"" "o/a.md"
whole "копия кодом через переменную" "python3 - <<'E'
dst='o/a.md'
shutil.copyfile('x/y.md', dst)
E" "o/a.md"
whole "правка на месте кодом" "python3 - <<'E'
p='o/a.md'
t=open(p).read()
open(p,'w').write(t + 'more')
E"
whole "правка на месте через write_text" "python3 - <<'E'
p=Path('o/a.md')
p.write_text(p.read_text().replace('x','y'))
E"
whole "правка на месте кодом node" "node -e \"const p='o/a.md'; fs.writeFileSync(p, fs.readFileSync(p,'utf8').replace(1,2))\""
whole "режим r+" "python3 -c \"open('o/a.md','r+').write('x')\""
whole "perl дописывает" "perl -e 'open(F, \">>o/a.md\")'"

suite_result "запись кодом толкователя"
