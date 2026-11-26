#!/usr/bin/env bash
# Сценарии измерения зацепления: какие импорты видны, что считается циклом и обходом входного файла,
# как рост сравнивается с базой и с планом ветки.
#
# Судится настоящий git-репозиторий-заготовка: чтение ревизии и истории планов — часть команды.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: зацепление модулей"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# Новое дерево с командой, настройкой и пустым списком.
fresh_tree() {
    T="$WORK/$1"
    mkdir -p "$T/tools" "$T/.claude/rt-kit" "$T/libs"
    cp "$CHECKS"/check-coupling.mjs "$CHECKS"/coupling-*.mjs "$CHECKS/rt-kit-checks.config.mjs" "$T/tools/"
    config '"tasksDir":"docs/tasks","e2eRoots":["libs/site-e2e"],"coupling":{"blocks":["libs/d1","libs/d2"],"entries":["libs/named/main.mjs"]}'
    g init -q -b main
    g config user.email t@example.com
    g config user.name t
    g config commit.gpgsign false
}
g() { git -C "$T" "$@"; }
# Настройка дерева: общие ключи и те, что названы; корни можно назвать вторым доводом.
config() { printf '{"sourceRoots":["%s"],"barrelFiles":["index.ts"],"board":{"taskKey":"RT"}%s}\n' "${2:-libs}" "${1:+,$1}" > "$T/.claude/rt-kit/checks.json"; }
put() { mkdir -p "$T/$(dirname "$1")" && printf '%b' "$2" > "$T/$1"; }
save() { g add -A && g commit -q -m "$1"; }
aliases() { printf '{"compilerOptions":{"paths":{%s}}}\n' "$1" > "$T/tsconfig.base.json"; }
run() { (cd "$T" && node tools/check-coupling.mjs "$@" 2>&1); }
code() { (cd "$T" && node tools/check-coupling.mjs "$@" > /dev/null 2>&1; echo $?); }
module() { run --module="$1" | head -1 | sed -E 's/^[^:]*: //'; }
outgoing() { module "$1" | sed -E 's/.*outgoing ([0-9]+).*/\1/'; }
lines_of() { run "${@:2}" | grep -cF -- "$1"; }

# --- SC-AK-1953 — какие импорты видны ---------------------------------------------------------------
fresh_tree forms
printf '{\n  // путь\n  "compilerOptions": { "paths": { "@x/b": ["libs/b/index.ts"], "@x/p/*": ["libs/p/*"], } }\n}\n' > "$T/tsconfig.base.json"
put libs/b/index.ts 'export const b = 1;\n'
put libs/p/q.ts 'export const q = 1;\n'
put libs/n.ts 'export const n = 1;\n'
put libs/m.mjs 'export const m = 1;\n'
put libs/v.github.mjs 'export const v = 1;\n'
put libs/h.sh 'helper() {\n  :\n}\n'
put libs/far/only.sh 'only() {\n  :\n}\n'
form() { put "libs/$2" "$3"; report "SC-AK-1953 — $1" "$(outgoing "libs/$2")" "$4"; }
form "импорт имени" a1.ts "import { n } from './n';\nexport const x = n;\n" 1
form "импорт в несколько строк" a2.ts "import {\n    n,\n} from './n';\n" 1
form "переотдача" a3.ts "export { n } from './n';\n" 1
form "импорт без имени" a4.ts "import './n';\n" 1
form "импорт вызовом" a5.mjs "const n = await import('./m.mjs');\n" 1
form "require" a6.cjs "const m = require('./m.mjs');\n" 1
form "псевдоним целиком" a7.ts "import { b } from '@x/b';\n" 1
form "псевдоним с хвостом" a8.ts "import { q } from '@x/p/q';\n" 1
form "имя разложенной копии" a9.mjs "import { v } from './v.mjs';\n" 1
form "расширение .js у файла .ts" a10.ts "import { n } from './n.js';\n" 1
form "подключение с переменной перед именем" b1.sh '. "$here/h.sh"\n' 1
form "подключение внутри условия" b2.sh '[ -f "$here/h.sh" ] && . "$here/h.sh" 2>/dev/null\n' 1
form "подключение через вложенный вызов" b3.sh '. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/h.sh" 2>/dev/null || true\n' 1
form "подключение из другой папки по единственному имени" b4.sh '. "$root/far/only.sh"\n' 1
form "запуск bash с ключом" b5.sh 'out="$(bash -x "$here/h.sh" 1)"\n' 1
form "запуск node" b6.sh 'if node "$here/m.mjs"; then :; fi\n' 1
form "запуск с переменной окружения" b7.sh 'A=1 bash libs/h.sh\n' 1
form "подключение словом source" b11.sh 'source "$here/h.sh"\n' 1
form "запуск sh" b12.sh 'sh "$here/h.sh"\n' 1
put libs/kit/t/same.sh ':\n' && put libs/same.sh ':\n'
form "постоянный путь целиком, а не сосед с тем же именем" b13.sh 'bash libs/kit/t/same.sh\n' 1
report "SC-AK-1953 — связь идёт по пути, а не по имени" "$(module libs/kit/t/same.sh | grep -c 'incoming 1'):$(module libs/same.sh | grep -c 'incoming 0')" "1:1"
form "звёздочка в строке не открывает комментарий" a13.ts "const mask = 'src/*.ts';\nconst n = await import('./n');\nconst end = '*/';\n" 1
form "импорт в комментарии не связь" a11.ts "// import { n } from './n';\n/* import './n'; */\nexport const y = 1;\n" 0
form "подключение в комментарии не связь" b8.sh '# . "$here/h.sh"\n' 0
form "имя в переменной не видно" b9.sh '. "$file"\n' 0
form "имя скрипта в тексте не связь" b10.sh 'echo "запусти h.sh"\n' 0
form "чужой пакет не связь" a12.ts "import { z } from 'node:path';\n" 0
put libs/copy.mjs "// rt-kit v0.1 · checks/copy.mjs · 1\nimport './m.mjs';\n"
report "SC-AK-1953 — разложенная копия не модуль" "$(lines_of 'is not among' --module=libs/copy.mjs)" 1
put libs/pk/checks/copy.mjs 'export const c = 1;\n'
form "импорт разложенной копии — связь с её исходником" a14.mjs "import './copy.mjs';\n" 1
report "SC-AK-1953 — назван исходник, а не копия" "$(run --module=libs/a14.mjs | grep -c 'imports libs/pk/checks/copy.mjs')" 1
form "импорт вызовом с обратными кавычками и доводом" a15.mjs 'await import(`./m.mjs`);\nawait import("./n.ts", { with: {} });\n' 2
form "обратные кавычки с подстановкой не видно" a16.mjs 'await import(`./${name}.mjs`);\n' 0
form "запуск через env и в ветке case" b14.sh 'case "$1" in a) bash "$here/h.sh" ;; esac\nenv A=1 timeout 5 node "$here/m.mjs"\n' 2
put libs/two/x/amb.sh ':\n' && put libs/two/y/amb.sh ':\n'
form "имя, которое носят два файла, не связь" b15.sh '. "$root/z/amb.sh"\n' 0
put libs/dist/d.ts "import '../n';\n"
report "SC-AK-1953 — собранное не модуль" "$(lines_of 'is not among' --module=libs/dist/d.ts)" 1

# --- SC-AK-1954 — цикл в любом виде файлов и цикл блоков --------------------------------------------
cycle_of() { fresh_tree "$1"; put "libs/a.$2" "$3"; put "libs/b.$2" "$4"; report "SC-AK-1954 — $5" "$(lines_of 'a new cycle')" "$6"; }
cycle_of c1 ts "import './b';\n" "import './a';\n" "цикл двух .ts" 1
cycle_of c2 mjs "import './b.mjs';\n" "import './a.mjs';\n" "цикл двух .mjs" 1
cycle_of c3 sh '. "$d/b.sh"\n' '. "$d/a.sh"\n' "цикл двух скриптов" 1
cycle_of c4 spec.ts "import './b.spec';\n" "import './a.spec';\n" "цикл тестов" 1
cycle_of c5 ts "import './b';\n" "export const b = 1;\n" "связь в одну сторону не цикл" 0
fresh_tree c6
put libs/a.ts "import './b';\n" && put libs/b.ts "import './c';\n" && put libs/c.ts "import './a';\n"
report "SC-AK-1954 — цикл трёх назван одной строкой" "$(lines_of 'a new cycle: libs/a.ts → libs/b.ts → libs/c.ts → libs/a.ts')" 1
put libs/a.ts "import './c';\n" && put libs/c.ts "import './b';\n" && put libs/b.ts "import './a';\n"
report "SC-AK-1954 — цикл назван путём, а не по алфавиту" "$(lines_of 'a new cycle: libs/a.ts → libs/c.ts → libs/b.ts → libs/a.ts')" 1
fresh_tree c7
put libs/d1/a.ts "import '../d2/b';\n" && put libs/d1/z.ts 'export const z = 1;\n' && put libs/d2/b.ts 'export const b = 1;\n'
report "SC-AK-1954 — связь блоков в одну сторону не цикл" "$(code)" 0
put libs/d2/y.ts "import '../d1/z';\n"
report "SC-AK-1954 — цикл блоков без цикла файлов, названы его импорты" "$(lines_of 'a new cycle of blocks: libs/d1 → libs/d2 → libs/d1 (libs/d1/a.ts imports libs/d2/b.ts; libs/d2/y.ts imports libs/d1/z.ts)')" 1
put libs/d2/y.ts 'export const y = 1;\n' && put libs/d2/y.spec.ts "import '../d1/z';\n"
report "SC-AK-1954 — тест цикла блоков не создаёт" "$(code)" 0

# --- SC-AK-1955 — обход входного файла ---------------------------------------------------------------
fresh_tree past
aliases '"@x/deep":["libs/box/deep.ts"]'
put libs/box/index.ts "export { in1 } from './in1';\n"
put libs/box/in1.ts 'export const in1 = 1;\n'
put libs/box/deep.ts 'export const deep = 1;\n'
put libs/box/own.ts "import { in1 } from './in1';\n"
past_of() { put "libs/$2" "$3"; report "SC-AK-1955 — $1" "$(lines_of "libs/$2 imports")" "$4"; }
past_of "импорт внутреннего файла снаружи — обход" out1.ts "import { in1 } from './box/in1';\n" 1
past_of "импорт через вход — не обход" out2.ts "import { in1 } from './box';\n" 0
past_of "цель пути tsconfig — свой вход" out3.ts "import { deep } from '@x/deep';\n" 0
past_of "тест зовёт внутренний файл" out4.spec.ts "import { in1 } from './box/in1';\n" 0
past_of "стори зовёт внутренний файл" out5.stories.ts "import { in1 } from './box/in1';\n" 0
past_of "файл под корнем сквозных тестов зовёт внутренний" site-e2e/out9.ts "import { in1 } from '../box/in1';\n" 0
report "SC-AK-1955 — сосед внутри папки — не обход" "$(lines_of 'libs/box/own.ts imports')" 0
put libs/needs.ts "import { in1 } from './box/in1';\n"
put libs/box/uses.ts "import '../needs';\n"
put libs/box/index.ts "export { in1 } from './in1';\nexport * from './uses';\n"
report "SC-AK-1955 — обход, без которого замкнулся бы цикл, — не нарушение" "$(lines_of 'libs/needs.ts imports')" 0
put libs/lone/x.ts 'export const x = 1;\n'
past_of "папка без входа не закрыта" out6.ts "import { x } from './lone/x';\n" 0
put libs/named/main.mjs 'export const main = 1;\n' && put libs/named/part.mjs 'export const part = 1;\n'
past_of "объявленный вход закрывает папку скриптов" out7.mjs "import './named/part.mjs';\n" 1
past_of "через объявленный вход — не обход" out8.mjs "import './named/main.mjs';\n" 0

# --- SC-AK-1956 — числа одного модуля ----------------------------------------------------------------
fresh_tree numbers
put libs/a.ts "import { used } from './b';\nimport { c } from './c';\n"
put libs/d.ts "import { used } from './b';\n"
put libs/b.ts 'export const used = 1;\nexport const spare = 2;\nexport interface Seen { x: 1 }\n'
put libs/c.ts 'export const c = 1;\n'
put libs/t.spec.ts "import { used } from './b';\n"
report "SC-AK-1956 — входящие без тестов, исходящих нет, двое отданных без потребителя" "$(module libs/b.ts)" "incoming 2, outgoing 0, past an entry 0, shown 3, taken by nobody 2"
report "SC-AK-1956 — исходящие" "$(outgoing libs/a.ts)" 2
put libs/w.ts "import * as all from './b';\n"
report "SC-AK-1956 — импорт целиком берёт все имена" "$(module libs/b.ts | grep -c 'taken by nobody 0')" 1
put libs/s.sh 'known() {\n  :\n}\nspare() {\n  :\n}\n'
put libs/u.sh '. "$d/s.sh"\nknown\n'
report "SC-AK-1956 — функция скрипта, которую никто не зовёт" "$(module libs/s.sh | grep -c 'shown 2, taken by nobody 1')" 1
report "SC-AK-1956 — модуля нет — отказ" "$(code --module=libs/none.ts)" 1
report "SC-AK-1956 — названы те, кого модуль импортирует и кто импортирует его" "$(run --module=libs/b.ts | grep -c 'imported by libs/a.ts'):$(run --module=libs/a.ts | grep -c '  imports libs/b.ts')" "1:1"
put libs/fold/x.ts "import '../b';\nimport './y';\n" && put libs/fold/y.ts 'export const y = 1;\n'
report "SC-AK-1956 — у папки печатаются связи наружу и их цели" "$(run --module=libs/fold/ | tr '\n' ';')" "libs/fold/: outgoing 1;  imports libs/b.ts;"
report "SC-AK-1956 — папка без косой черты — та же папка" "$(run --module=libs/fold | head -1)" "libs/fold/: outgoing 1"
report "SC-AK-1956 — папки без модулей нет — отказ" "$(code --module=libs/nothing/)" 1
put libs/copy.mjs '// rt-kit v1.0 · checks/copy.mjs · abc\nexport const c = 1;\n'
report "SC-AK-1956 — разложенная копия названа копией" "$(lines_of 'it is a copy laid out from checks/copy.mjs' --module=libs/copy.mjs):$(code --module=libs/copy.mjs)" "1:1"
report "SC-AK-1956 — модуль вместе с базой — отказ" "$(code --module=libs/b.ts --base=main)" 1
put libs/cls.ts 'export default class Foo {}\n' && put libs/f.ts "import Foo from './cls';\n"
report "SC-AK-1956 — умолчание взято соседом" "$(module libs/cls.ts | grep -c 'taken by nobody 0')" 1
report "SC-AK-1956 — неизвестный ключ и пустая база — отказ" "$(code --bsae=main):$(code --base=):$(code main)" "1:1:1"

# --- SC-AK-1957 — с базой печатается «было → стало» --------------------------------------------------
fresh_tree base
put libs/a.ts 'export const a = 1;\n' && put libs/b.ts 'export const b = 1;\n' && put libs/q.ts 'export const q = 1;\n'
save base
g checkout -q -b RT-1-x
put libs/a.ts "import { b } from './b';\nexport const a = b;\n"
save work
report "SC-AK-1957 — исходящие тронутого модуля" "$(lines_of 'libs/a.ts: incoming 0 → 0, outgoing 0 → 1' --base=main)" 1
report "SC-AK-1957 — входящие соседа" "$(lines_of 'libs/b.ts: incoming 0 → 1' --base=main)" 1
report "SC-AK-1957 — нетронутый модуль не печатается" "$(lines_of 'libs/q.ts' --base=main)" 0
put libs/q.ts "import './b';\n"
report "SC-AK-1957 — незакоммиченная правка видна" "$(lines_of 'libs/q.ts: incoming 0 → 0, outgoing 0 → 1' --base=main)" 1
report "SC-AK-1957 — числа дерева целиком" "$(lines_of 'cycles 0 → 0, cycles of blocks 0 → 0, past the entry 0 → 0' --base=main)" 1
put libs/d1/q.ts 'export const q = 1;\n' && put libs/d2/q.ts "import '../d1/q';\n"
report "SC-AK-1957 — новая связь блоков печатается" "$(lines_of 'a new link of blocks: libs/d2 → libs/d1' --base=main)" 1
report "SC-AK-1957 — число связей дерева было и стало" "$(lines_of 'links 0 → 3' --base=main)" 1
report "SC-AK-1957 — прошлая ревизия вместо дерева" "$(lines_of 'libs/q.ts' --base=main --at=RT-1-x)" 0
printf '{ не разобрать\n' > "$T/tsconfig.base.json"
report "SC-AK-1957 — неразобранный файл псевдонимов назван" "$(lines_of 'tsconfig.base.json does not parse' --base=main)" 1
rm "$T/tsconfig.base.json"
g checkout -q main && put libs/d3/q.ts 'export const q = 1;\n' && put libs/d4/q.ts "import '../d3/q';\n" && save blocks && g checkout -q -b RT-2-x
config '"coupling":{"blocks":["libs/d3","libs/d4"]}'
report "SC-AK-1957 — блок, объявленный над старой связью, новой связи не даёт" "$(lines_of 'a new link of blocks' --base=main)" 0
put libs/d3/r.ts "import '../d4/q';\n"
report "SC-AK-1957 — новая связь объявленного блока печатается" "$(lines_of 'a new link of blocks: libs/d3 → libs/d4' --base=main)" 1
report "SC-AK-1957 — базы нет — отказ с её именем" "$(lines_of 'the revision «origin/none» is not in this repository' --base=origin/none)" 1
report "SC-AK-1957 — отказ без базы — ненулевой код" "$(code --base=origin/none)" 1

# --- SC-AK-1958 — новый цикл отказан, старый пропущен -------------------------------------------------
fresh_tree cyc
put libs/a.ts "import './b';\n" && put libs/b.ts "import './a';\n" && put libs/c.ts 'export const c = 1;\n' && put libs/d.ts "import './c';\n"
put libs/d1/a.ts 'export const a = 1;\n' && put libs/d2/b.ts "import '../d1/a';\n" && put libs/d2/e.ts 'export const e = 1;\n'
save base
g checkout -q -b RT-1-x
put libs/e.ts 'export const e = 1;\n'
save work
report "SC-AK-1958 — старый цикл пропущен" "$(code --base=main)" 0
g mv libs/b.ts libs/renamed.ts && put libs/a.ts "import './renamed';\n"
report "SC-AK-1958 — переименование участника не делает старый цикл новым" "$(code --base=main)" 0
g reset -q --hard
put libs/c.ts "import './d';\n"
report "SC-AK-1958 — новый цикл отказан" "$(code --base=main)" 1
report "SC-AK-1958 — назван только новый" "$(lines_of 'a new cycle' --base=main)" 1
put libs/c.ts "import './a';\n" && put libs/b.ts "import './a';\nimport './c';\n"
report "SC-AK-1958 — старый цикл, в который вошёл новый модуль, отказан и назван им" "$(run --base=main | grep 'a new cycle:' | grep -c 'libs/c.ts'):$(code --base=main)" "1:1"
put libs/b.ts "import './a';\n" && put libs/c.ts 'export const c = 1;\n' && put libs/d1/f.ts "import '../d2/e';\n"
report "SC-AK-1958 — новый цикл блоков отказан" "$(lines_of 'a new cycle of blocks: libs/d1 → libs/d2 → libs/d1' --base=main)" 1
config '"coupling":{"blocks":[]}'
report "SC-AK-1958 — блок, снятый веткой с настройки, судится настройкой базы" "$(code --base=main)" 1
put libs/d1/f.ts 'export const f = 1;\n'
config '' apps
put libs/c.ts "import './d';\n"
report "SC-AK-1958 — корень, снятый веткой с настройки, читается по настройке базы" "$(code --base=main)" 1
fresh_tree cycblocks
put libs/e1/a.ts "import '../e2/b';\n" && put libs/e1/z.ts 'export const z = 1;\n' && put libs/e2/b.ts 'export const b = 1;\n' && put libs/e2/y.ts "import '../e1/z';\n"
save base
g checkout -q -b RT-1-x
config '"coupling":{"blocks":["libs/e1","libs/e2"]}'
report "SC-AK-1958 — блок, объявленный веткой над старыми связями, не новый цикл" "$(code --base=main)" 0
put libs/e1/w.ts "import '../e3/b';\n" && put libs/e3/b.ts 'export const b = 1;\n' && put libs/e3/y.ts "import '../e1/z';\n"
config '"coupling":{"blocks":["libs/e1","libs/e3"]}'
report "SC-AK-1958 — новый цикл блока, объявленного самой веткой, отказан" "$(lines_of 'a new cycle of blocks: libs/e1 → libs/e3 → libs/e1' --base=main)" 1
g reset -q --hard && g clean -fdq
put libs/e1/index.ts "export * from './z';\n" && put libs/e2/index.ts "export * from './b';\n"
report "SC-AK-1958 — новый вход над старыми связями не новый цикл блоков" "$(code --base=main)" 0
save "входы" && g checkout -q -B main && g checkout -q -b RT-2-x && g mv libs/e2 libs/e9 && put libs/e1/a.ts "import '../e9/b';\n"
report "SC-AK-1958 — переименование папки-блока не делает старый цикл новым" "$(code --base=main)" 0
g reset -q --hard && g rm -q libs/e2/index.ts && put libs/e2/new.ts "import '../e1';\n"
report "SC-AK-1958 — снятый вход не снимает блока" "$(lines_of 'a new link of blocks' --base=main):$(code --base=main)" "0:0"
g reset -q --hard && g clean -fdq && put libs/e5/index.ts "import '../e1';\n" && put libs/e1/z.ts "import '../e5';\n"
report "SC-AK-1958 — блок, вошедший в старый цикл блоков, назван" "$(run --base=main | grep 'a new cycle of blocks:' | grep -c 'libs/e1 → libs/e5\|libs/e5 → libs/e1')" 1
g reset -q --hard && g clean -fdq && g checkout -q -B main && long() { printf '// строка %s\n' 1 2 3 4 5 6 7 8; }
put libs/g1/index.ts "export const g = 1;\n" && put libs/g1/far.ts "$(long)\nimport '../g3';\n" && put libs/g2/index.ts 'export const g = 1;\n' && put libs/g3/index.ts "import '../g2';\n"
save "блоки в одну сторону" && g checkout -q -b RT-5-x && g mv libs/g1/far.ts libs/g2/far.ts
report "SC-AK-1958 — перенос файла, замкнувший блоки, — новый цикл блоков" "$(run --base=main | grep -c 'a new cycle of blocks: libs/g2 → libs/g3 → libs/g2')" 1
report "SC-AK-1958 — связь, созданная переносом, печатается" "$(lines_of 'a new link of blocks: libs/g2 → libs/g3' --base=main)" 1
g checkout -q -f main && g clean -fdq && put libs/y1.ts "import './y2';\n" && put libs/y2.ts 'export const y = 1;\n' && save y && put libs/y2.ts "import './y1';\n" && save "цикл в базе"
g checkout -q -f -b RT-3-x main~1 && put libs/n.ts 'export const n = 1;\n' && save work
report "SC-AK-1958 — судится точка отхода, а не вершина базы" "$(lines_of 'cycles 0 → 0' --base=main)" 1

# --- SC-AK-1959 — новый обход отказан, старый пропущен -------------------------------------------------
fresh_tree byp
put libs/box/index.ts "export { i } from './i';\n" && put libs/box/i.ts 'export const i = 1;\n' && put libs/old.ts "import { i } from './box/i';\n"
put libs/bare/x.ts 'export const x = 1;\n' && put libs/takes.ts "import { x } from './bare/x';\n"
put libs/ring/index.ts "export * from './uses';\nexport * from './in';\n" && put libs/ring/uses.ts "import '../needs';\n" && put libs/ring/in.ts 'export const r = 1;\n'
put libs/needs.ts "import { r } from './ring/in';\n"
save base
g checkout -q -b RT-1-x
put libs/n.ts 'export const n = 1;\n'
report "SC-AK-1959 — старый обход пропущен" "$(code --base=main)" 0
put libs/n.ts "import { i } from './box/i';\n"
report "SC-AK-1959 — новый обход отказан" "$(code --base=main)" 1
aliases '"@x/i":["libs/box/i.ts"]'
report "SC-AK-1959 — псевдоним, добавленный веткой, обход не снимает" "$(code --base=main)" 1
rm "$T/tsconfig.base.json"
config '"coupling":{"harness":["libs"]}'
report "SC-AK-1959 — обвязка, добавленная веткой, обход не снимает" "$(code --base=main)" 1
g checkout -q -- .claude
put libs/n.ts 'export const n = 1;\n' && put libs/bare/index.ts "export { x } from './x';\n"
report "SC-AK-1959 — новый вход не делает старый импорт новым" "$(code --base=main)" 0
put libs/ring/uses.ts 'export const u = 1;\n'
report "SC-AK-1959 — ушедшая связь входа не делает старый импорт новым" "$(code --base=main)" 0
put libs/takes.ts "import { x } from './bare/x';\nimport { i } from './box/i';\n"
report "SC-AK-1959 — новый обход из файла, который был в базе, отказан" "$(lines_of 'libs/takes.ts imports libs/box/i.ts past' --base=main)" 1
put libs/old.ts 'export const o = 1;\n'
report "SC-AK-1959 — обход, переехавший от соседа той же папки, не новый" "$(code --base=main)" 0
put libs/third.ts "import { i } from './box/i';\n"
report "SC-AK-1959 — ушедший обход отвечает за один новый" "$(lines_of 'past the entry libs/box/index.ts' --base=main)" 1
rm "$T/libs/third.ts" && g checkout -q -- libs/takes.ts && put libs/else/third.ts "import { i } from '../box/i';\n"
report "SC-AK-1959 — обход, переехавший в другую папку, новый" "$(code --base=main)" 1
rm -r "$T/libs/else" && g checkout -q -- libs/old.ts
g rm -q libs/box/index.ts && put libs/n.ts "import { i } from './box/i';\n"
report "SC-AK-1959 — снятый веткой вход папки не открывает" "$(lines_of 'libs/n.ts imports libs/box/i.ts past the entry of libs/box, which the branch removed' --base=main)" 1
g reset -q --hard && g clean -fdq
put libs/box/second.ts 'export const s = 1;\n' && put libs/n.ts "import { s } from '@x/second';\n"
aliases '"@x/second":["libs/box/second.ts"]'
report "SC-AK-1959 — новый файл со своим псевдонимом — новый вход" "$(code --base=main)" 0
rm "$T/tsconfig.base.json" "$T/libs/box/second.ts" && put libs/n.ts 'export const n = 1;\n'
g reset -q --hard && g clean -fdq
g checkout -q -B main && put libs/box/near.ts "$(long)\nimport { i } from './i';\n" && put libs/out/in.ts "$(long)\nexport const inner = 1;\n" && put libs/by.ts "import './out/in';\n" && save near && g checkout -q -b RT-5-x
g mv libs/box/near.ts libs/near.ts && put libs/near.ts "$(long)\nimport { i } from './box/i';\n"
report "SC-AK-1959 — файл, вынесенный из закрытой папки, обходит её вход" "$(lines_of 'libs/near.ts imports libs/box/i.ts past' --base=main)" 1
g reset -q --hard && g mv libs/out/in.ts libs/box/in.ts && put libs/by.ts "import './box/in';\n"
report "SC-AK-1959 — цель, перенесённая в закрытую папку, делает импорт обходом" "$(lines_of 'libs/by.ts imports libs/box/in.ts past' --base=main)" 1
g reset -q --hard && g mv libs/box/index.ts libs/index.ts && put libs/n.ts "import { i } from './box/i';\n"
report "SC-AK-1959 — вход, перенесённый веткой, прежней папки не открывает" "$(lines_of 'libs/n.ts imports libs/box/i.ts past the entry of libs/box' --base=main)" 1
g reset -q --hard && g mv libs/box libs/crate && put libs/old.ts "import { i } from './crate/i';\n"
report "SC-AK-1959 — папка, переименованная целиком, старого обхода новым не делает" "$(code --base=main)" 0
g reset -q --hard && g clean -fdq
g checkout -q -B main && put libs/long.ts "$(long)\nimport { i } from './box/i';\n" && save long && g checkout -q -b RT-4-x
mkdir -p "$T/libs/far" && g mv libs/long.ts libs/far/moved.ts && put libs/far/moved.ts "$(long)\nimport { i } from '../box/i';\n"
report "SC-AK-1959 — перенос файла в другую папку не делает старый обход новым" "$(code --base=main)" 0
g reset -q --hard && g clean -fdq
g checkout -q main && put libs/box/core.ts 'export const c = 1;\n' && aliases '"@x/core":["libs/box/core.ts"]' && put libs/h.spec.ts "import { i } from './box/i';\n" && save "псевдоним"
g checkout -q -b RT-2-x && g mv libs/box/core.ts libs/box/heart.ts && aliases '"@x/core":["libs/box/heart.ts"]' && put libs/n.ts "import { c } from '@x/core';\n"
report "SC-AK-1959 — переименованная цель псевдонима остаётся входом" "$(code --base=main)" 0
g mv libs/h.spec.ts libs/h.ts
report "SC-AK-1959 — тест, ставший модулем, старого импорта не имеет" "$(lines_of 'libs/h.ts imports libs/box/i.ts past' --base=main)" 1

# --- SC-AK-1960 — рост исходящих сверх плана -----------------------------------------------------------
fresh_tree grow
for n in 1 2 3 4 5 6; do put "libs/t$n.ts" "export const t$n = 1;\n"; done
put libs/a.ts "import './t1';\n" && put libs/index.ts "import './t1';\n" && put libs/a.spec.ts "import './t1';\n" && put libs/side.ts "import './t1';\n" && put libs/long.ts "$(long)\nimport './t1';\n"
save base
g checkout -q -b RT-1-x
links() { local n out=""; for n in $(seq 1 "$1"); do out="${out}import './t$n';\n"; done; printf '%s' "$out"; }
plan() { put "docs/tasks/${2:-RT-1-x}/plan.md" "$1\n"; }
progress() { put docs/tasks/RT-1-x/progress.md "# Ход работы\n\n## ${2:-Decisions along the way}\n\n$1\n\n## Sessions\n"; }
put libs/a.ts "$(links 2)"
report "SC-AK-1960 — в дереве без планов рост печатается и не отказан" "$(lines_of 'grown, the tree keeps no plans: `libs/a.ts` outgoing 1 → 2' --base=main):$(code --base=main)" "1:0"
plan '`libs/a.ts` исходящие 1 → 9' _template
report "SC-AK-1960 — без своего плана в дереве с планами рост отказан, образец не читается" "$(code --base=main)" 1
plan 'без чисел'
report "SC-AK-1960 — неназванный рост отказан" "$(lines_of 'outgoing 1 → 2; nobody named a number for it' --base=main):$(code --base=main)" "1:1"
plan '| Зацепление | `libs/a.ts` исходящие 1 → 2 |'
report "SC-AK-1960 — названный рост проходит" "$(code --base=main)" 0
put libs/a.ts "$(links 3)"
report "SC-AK-1960 — рост сверх названного отказан" "$(lines_of 'the branch named 2' --base=main)" 1
plan '`libs/a.ts:fn` — входящие 0 → 1; исходящие: 1 → 3; циклов нет'
report "SC-AK-1960 — символ, точка с запятой и двоеточие читаются" "$(code --base=main)" 0
plan '`a.ts` outgoing 1 -> 3'
report "SC-AK-1960 — короткий путь единственного файла" "$(code --base=main)" 0
plan '- `libs/a.ts:Reader.read()` исходящие\n  **1** → **3**'
report "SC-AK-1960 — метод класса, перенос строки и жирные числа читаются" "$(code --base=main)" 0
plan '`libs/a.ts` исходящие без изменений, входящие 1 → 9'
report "SC-AK-1960 — число входящих не читается исходящими" "$(code --base=main)" 1
plan '`libs/side.ts` и `libs/a.ts` исходящие 1 → 3'
report "SC-AK-1960 — число относится к ближайшему пути" "$(code --base=main)" 0
save work
rm -rf "$T/docs" && save archive
report "SC-AK-1960 — план читается из истории после разбора папки" "$(code --base=main)" 0
put libs/new.ts "$(links 1)"
report "SC-AK-1960 — неназванный новый модуль отказан" "$(lines_of '`libs/new.ts` outgoing 0 → 1; nobody named' --base=main)" 1
progress '- `libs/new.ts` исходящие 0 → 1.'
report "SC-AK-1960 — строка хода работы без причины не снимает отказ" "$(code --base=main)" 1
progress '- Превышение: `libs/new.ts` исходящие 0 → 1: помощник.'
report "SC-AK-1960 — одного слова мало для причины" "$(code --base=main)" 1
progress '- `libs/new.ts` outgoing 0 → 1; nobody named a number for it'
report "SC-AK-1960 — текст самого отказа причиной не служит" "$(code --base=main)" 1
progress '- `libs/new.ts` исходящие 0 → 1: общий помощник двух страниц.'
report "SC-AK-1960 — число после плана без слова о превышении не снимает отказ и названо" "$(lines_of 'the number after the plan has no word of an overrun' --base=main):$(code --base=main)" "1:1"
progress "- $(run --base=main | grep -F 'libs/new.ts` outgoing 0 → 1; nobody' | sed 's/^ *//')"
report "SC-AK-1960 — новый текст отказа причиной не служит" "$(code --base=main)" 1
progress '- Превышение: `libs/new.ts` исходящие 0 → 1, входящие 0 → 2.'
report "SC-AK-1960 — другие числа причиной не служат" "$(code --base=main)" 1
progress '- Превышение: `libs/new.ts` исходящие 0 → 1, `libs/b.ts` исходящие 0 → 1: общий помощник.'
report "SC-AK-1960 — причина соседнего модуля чужой не служит" "$(code --base=main)" 1
progress '- Превышение: `libs/new.ts` исходящие 0 → 1: общий помощник.' 'Live check'
report "SC-AK-1960 — число вне раздела решений не снимает отказ" "$(code --base=main)" 1
rm -rf "$T/docs" && g add -A && g commit -q -m "правка" -m 'Превышение: `libs/new.ts` исходящие 0 → 1: помощник по замечанию.'
report "SC-AK-1960 — превышение, названное текстом коммита после разбора папки" "$(lines_of 'overrun, named after the plan: `libs/new.ts`' --base=main):$(code --base=main)" "1:0"
g reset -q --soft HEAD~1 && g commit -q -m "правка" -m 'Превышение: `libs/new.ts` исходящие 0 → 1' -m 'Co-Authored-By: Some Body <some@body.example>'
report "SC-AK-1960 — имя соавтора причиной не служит" "$(code --base=main)" 1
g reset -q --soft HEAD~1 && g reset -q
progress '- `libs/new.ts` исходящие 0 → 1 — превышение:\n  общий помощник.'
report "SC-AK-1960 — названное в ходе работы с причиной проходит и печатается" "$(lines_of 'overrun, named after the plan: `libs/new.ts` outgoing 0 → 1' --base=main):$(code --base=main)" "1:0"
rm -rf "$T/docs"
plan '`libs/new.ts` исходящие 0 → 1, overrun: дописано после кода'
report "SC-AK-1960 — число, дописанное в план позже, печатается превышением" "$(lines_of 'overrun, named after the plan: `libs/new.ts`' --base=main)" 1
rm -rf "$T/docs" "$T/libs/new.ts"
put libs/fold/x.ts "import '../t1';\nimport './y';\n" && put libs/fold/y.ts "import '../t2';\n"
progress '`libs/fold/` исходящие 0 → 2, превышение: новая папка помощника'
report "SC-AK-1960 — новая папка названа числом связей наружу" "$(code --base=main)" 0
g mv libs/long.ts libs/fold/long.ts && put libs/fold/long.ts "$(long)\nimport '../t1';\nimport '../t2';\n"
report "SC-AK-1960 — за модуль, перенесённый в новую папку, она не отвечает" "$(lines_of '`libs/fold/long.ts` outgoing 1 → 2; nobody named' --base=main)" 1
g reset -q -- libs && g checkout -q -- libs/long.ts && rm "$T/libs/fold/long.ts"
put libs/fold/y.ts "import '../t2';\nimport '../t3';\n"
report "SC-AK-1960 — папка выросла сверх названного" "$(lines_of '`libs/fold/` outgoing 0 → 3; the branch named 2' --base=main)" 1
progress '`libs/` исходящие 0 → 9, превышение: корень дерева целиком'
report "SC-AK-1960 — корень дерева папкой не принимается" "$(code --base=main)" 1
rm -rf "$T/docs" "$T/libs/fold"
g checkout -q main && put libs/old/m.ts "import '../t1';\n" && save "прежняя папка" && g checkout -q -b RT-3-z
put libs/old/m.ts "import '../t1';\nimport './n';\n" && put libs/old/n.ts "import '../t1';\n" && put 'libs/файл.ts' "import './t1';\n"
plan '`libs/old/` исходящие 1 → 1' RT-3-z
report "SC-AK-1960 — папка не отвечает за модуль, который был в базе" "$(lines_of '`libs/old/m.ts` outgoing 1 → 2; nobody named' --base=main)" 1
report "SC-AK-1960 — прежняя папка не отвечает и за новый модуль" "$(lines_of '`libs/old/n.ts` outgoing 0 → 1; nobody named' --base=main)" 1
report "SC-AK-1960 — путь не латиницей судится" "$(lines_of '`libs/файл.ts` outgoing 0 → 1; nobody named' --base=main)" 1
g reset -q --hard && g clean -fdq && g checkout -q RT-1-x && g merge -q --no-edit main
put libs/index.ts "$(links 6)" && put libs/a.spec.ts "$(links 6)"
report "SC-AK-1960 — вход и тест не судятся" "$(code --base=main)" 0
put libs/t6.ts "import './t1';\n"
config '"tasksDir":"none","coupling":{"harness":["libs"]}'
report "SC-AK-1960 — обвязка, добавленная веткой, роста не снимает" "$(lines_of '`libs/t6.ts` outgoing 0 → 1; nobody named' --base=main):$(code --base=main)" "1:1"
g checkout -q -- .claude
aliases '"@x/t6":["libs/t6.ts"]'
report "SC-AK-1960 — псевдоним, добавленный веткой, роста не снимает" "$(code --base=main)" 1
rm "$T/tsconfig.base.json" && g checkout -q -- libs/t6.ts
g mv libs/side.ts libs/moved.ts
report "SC-AK-1960 — переименованный модуль не новый" "$(code --base=main)" 0
put libs/moved.ts "$(links 2)"
report "SC-AK-1960 — рост переименованного сравнивается со старым именем" "$(lines_of '`libs/moved.ts` outgoing 1 → 2' --base=main)" 1
g reset -q --hard && g clean -fdq
g checkout -q main && put libs/t1.ts "import './t2';\n" && save "чужая работа"
g checkout -q RT-1-x && g merge -q --no-edit main
report "SC-AK-1960 — рост, приехавший слиянием базы, не судится" "$(code --base="$(g rev-parse main~1)")" 0
g checkout -q main && plan 'образец' _template && save "образец задачи"
g checkout -q -b RT-2-y main && plan 'без чисел' RT-2-y && put libs/t3.ts "import './t2';\n" && save work
g checkout -q -b RT-9-epic main && g merge -q --no-ff --no-edit RT-2-y
report "SC-AK-1960 — рост влитой задачи в ветке эпика не судится" "$(code --base=main)" 0
g checkout -q -b RT-8-n main && plan '`libs/t5.ts` исходящие 0 → 1' RT-8-n && put libs/t5.ts "import './t1';\n" && save work
g checkout -q RT-9-epic && g merge -q --no-ff --no-edit RT-8-n && put libs/t5.ts "import './t1';\n// опечатка\n" && save "правка в эпике"
report "SC-AK-1960 — число плана влитой задачи отвечает за правку в ветке эпика" "$(code --base=main)" 0
g checkout -q -b RT-10-m main && plan 'без чисел' RT-10-m && put libs/t6.ts "import './t1';\n" && g add -A && g commit -q -m work -m 'Превышение: `libs/t6.ts` исходящие 0 → 1: помощник по замечанию.'
g checkout -q RT-9-epic && g merge -q --no-ff --no-edit RT-10-m && put libs/t6.ts "import './t1';\n// опечатка\n" && save "правка в эпике"
report "SC-AK-1960 — превышение из коммита влитой задачи отвечает за правку в ветке эпика" "$(code --base=main)" 0
g checkout -q RT-2-y
report "SC-AK-1960 — тот же рост в ветке задачи отказан" "$(code --base=main)" 1
plan '| `libs/t3.ts` | исходящие 0 → 1 |' RT-5-second && save "план чужой папки после своего"
report "SC-AK-1960 — план чужой папки, записанный после своего, без причины не снимает" "$(code --base=main)" 1
plan '| `libs/t3.ts` | исходящие 0 → 1, превышение, общий помощник |' RT-5-second && save "с причиной"
report "SC-AK-1960 — с причиной он печатается превышением" "$(lines_of 'overrun, named after the plan: `libs/t3.ts`' --base=main):$(code --base=main)" "1:0"
g checkout -q -b RT-6-low main && plan '| `libs/t4.ts` | исходящие 0 → 1 |' RT-6-low && put libs/t4.ts "import './t1';\n" && save low
g checkout -q -b RT-7-top && plan 'без чисел' RT-7-top && save top
report "SC-AK-1960 — план нижней ветки стопки, число в соседней ячейке" "$(code --base=main)" 0
g checkout -q --detach
report "SC-AK-1960 — ревизия без имени ветки судится так же" "$(code --base=main):$(code --base=main --at="$(g rev-parse RT-7-top)")" "0:0"
g checkout -q main && plan '- **A:** <где стоит>\n- **B:** <что увидит человек>' _template && save "образец с пробелами"
g checkout -q -b RT-11-d && plan '- **A:** <где стоит>\n- **B:** <что увидит человек>' RT-11-d && save "разбор с образцом плана"
plan '| `libs/t4.ts` | исходящие 0 → 1 |' RT-11-d && put libs/t4.ts "import './t1';\n" && save "план"
report "SC-AK-1960 — незаполненный образец первым планом не считается" "$(code --base=main)" 0
g checkout -q main && plan '`libs/t4.ts` исходящие 0 → 1' RT-4-w && save "план в базе"
g checkout -q -b RT-4-w && rm -rf "$T/docs/tasks/RT-4-w" && put libs/t4.ts "import './t1';\n" && save work
report "SC-AK-1960 — план ветки, пришедший с базой, читается" "$(code --base=main)" 0
sample="$(grep -oE '\| Coupling \| [^|]*' "$ASSETS/patterns/code-design-choose.md" | head -1)"
report "SC-AK-1960 — строка примера паттерна читается командой" "$(cd "$T/tools" && SAMPLE="$sample" node -e 'import("./coupling-plan.mjs").then(({ namedOf }) => console.log([...namedOf(process.env.SAMPLE)].join(";")))')" "mail/reader.ts,3"

# --- SC-AK-1961 — список принятого и место в наборе перед отправкой --------------------------------------
fresh_tree debt
put libs/a.ts "import './b';\n" && put libs/b.ts 'export const b = 1;\n'
save base
g checkout -q -b RT-1-x
put libs/b.ts "import './a';\n"
debt() { printf '{"accepted":{},"debt":{%s}}\n' "$1" > "$T/tools/coupling-allowlist.json"; }
old_cycle='"libs/a.ts | libs/b.ts":{"reason":"старый цикл","task":"RT-1"}'
debt "$old_cycle"
report "SC-AK-1961 — принятый цикл проходит без базы" "$(code)" 0
report "SC-AK-1961 — своя запись не снимает отказ с базой" "$(code --base=main)" 1
debt '"libs/a.ts | libs/b.ts":{"reason":"слово владельца 24.11: «пусть будет»","task":"RT-1"}'
report "SC-AK-1961 — запись со словом владельца снимает и печатается" "$(lines_of 'accepted by the owner: libs/a.ts | libs/b.ts' --base=main):$(code --base=main)" "1:0"
debt '"libs/a.ts | libs/b.ts":{"reason":"слово владельца 24.11 в меню о цикле: «пусть будет»","task":"RT-1"}'
report "SC-AK-1961 — слово владельца с пояснением перед цитатой снимает" "$(code --base=main)" 0
debt '"libs/a.ts | libs/b.ts":{"reason":"слово владельца 24.11 ещё не получено: «пусть будет»","task":"RT-1"}'
report "SC-AK-1961 — дата у слова, которого нет, не снимает" "$(code --base=main)" 1
report "SC-AK-1961 — отказ называет, что снимает новое нарушение" "$(lines_of 'A line of the list lifts a new violation only when its reason begins' --base=main)" 1
debt '"libs/a.ts | libs/b.ts":{"reason":"версия 10.20 «как было»","task":"RT-1"}'
report "SC-AK-1961 — дата и кавычки без слов владельца не снимают" "$(code --base=main)" 1
debt '"libs/a.ts | libs/b.ts":{"reason":"слово владельца ещё не получено, как в 10.20: «временно»","task":"RT-1"}'
report "SC-AK-1961 — слово владельца, которого нет, не снимает" "$(code --base=main)" 1
debt '"libs/a.ts | libs/b.ts":{"reason":"","task":"RT-1"}'
report "SC-AK-1961 — запись без причины отказана" "$(lines_of 'has an empty reason')" 1
debt "$old_cycle,\"libs/a.ts -> libs/z.ts\":{\"reason\":\"ушло\",\"task\":\"RT-1\"}"
report "SC-AK-1961 — запись без нарушения отказана" "$(lines_of 'the violation is gone — remove the line')" 1
debt "$old_cycle"
save "ветка с циклом и записью"
g checkout -q --detach main && g merge -q --no-ff --no-edit RT-1-x
report "SC-AK-1961 — слияние ветки с новым циклом отказано с базой, запись не снимает" "$(code --base=main)" 1
g checkout -q RT-1-x && put libs/c.ts "import './d';\n" && put libs/d.ts "import './c';\n" && save "ещё цикл"
report "SC-AK-1961 — старое, чего нет в списке, печатается с базой" "$(lines_of 'not in tools/coupling-allowlist.json: libs/c.ts | libs/d.ts' --base=HEAD):$(code --base=HEAD)" "1:0"
debt '"libs/a.ts | libs/z.ts":{"reason":"старое имя","task":"RT-1"}'
report "SC-AK-1961 — отказ за ушедшую запись называет новый ключ" "$(lines_of 'remove the line, or write it by the new name: libs/a.ts | libs/b.ts; libs/c.ts | libs/d.ts' --base=HEAD)" 1
debt ''
report "SC-AK-1961 — дерево без списка печатает одно число" "$(lines_of 'not in tools/coupling-allowlist.json: 2, the tree keeps no list' --base=HEAD)" 1
report "SC-AK-1961 — снимок списка называет ключ" "$(run --baseline 2> /dev/null | grep -c 'libs/a.ts | libs/b.ts')" 1
fresh_tree empty
report "SC-AK-1961 — дерево без кода пропущено" "$(code)" 0
push_lines() { (cd "$T" && . "$DEFAULTS/push.sh" && RT_CHECKS_DIR=tools CLAUDE_PROJECT_DIR="$T" rt_push_checks_default "$1" 2> /dev/null | grep check-coupling); }
report "SC-AK-1961 — набор перед отправкой зовёт команду с базой один раз" "$(push_lines origin/main)" "node tools/check-coupling.mjs --base=origin/main"
report "SC-AK-1961 — без базы набор зовёт команду без неё" "$(push_lines '')" "node tools/check-coupling.mjs"

suite_result "проверки: зацепление модулей"
