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
module() { run --module="$1" | sed -E 's/^[^:]*: //'; }
outgoing() { module "$1" | sed -E 's/.*outgoing ([0-9]+).*/\1/'; }
lines_of() { run "${@:2}" | grep -cF -- "$1"; }

# --- SC-AK-1933 — какие импорты видны ---------------------------------------------------------------
fresh_tree forms
printf '{\n  // путь\n  "compilerOptions": { "paths": { "@x/b": ["libs/b/index.ts"], "@x/p/*": ["libs/p/*"], } }\n}\n' > "$T/tsconfig.base.json"
put libs/b/index.ts 'export const b = 1;\n'
put libs/p/q.ts 'export const q = 1;\n'
put libs/n.ts 'export const n = 1;\n'
put libs/m.mjs 'export const m = 1;\n'
put libs/v.github.mjs 'export const v = 1;\n'
put libs/h.sh 'helper() {\n  :\n}\n'
put libs/far/only.sh 'only() {\n  :\n}\n'
form() { put "libs/$2" "$3"; report "SC-AK-1933 — $1" "$(outgoing "libs/$2")" "$4"; }
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
report "SC-AK-1933 — связь идёт по пути, а не по имени" "$(module libs/kit/t/same.sh | grep -c 'incoming 1'):$(module libs/same.sh | grep -c 'incoming 0')" "1:1"
form "звёздочка в строке не открывает комментарий" a13.ts "const mask = 'src/*.ts';\nconst n = await import('./n');\nconst end = '*/';\n" 1
form "импорт в комментарии не связь" a11.ts "// import { n } from './n';\n/* import './n'; */\nexport const y = 1;\n" 0
form "подключение в комментарии не связь" b8.sh '# . "$here/h.sh"\n' 0
form "имя в переменной не видно" b9.sh '. "$file"\n' 0
form "имя скрипта в тексте не связь" b10.sh 'echo "запусти h.sh"\n' 0
form "чужой пакет не связь" a12.ts "import { z } from 'node:path';\n" 0
put libs/copy.mjs "// rt-kit v0.1 · checks/copy.mjs · 1\nimport './m.mjs';\n"
report "SC-AK-1933 — разложенная копия не модуль" "$(lines_of 'is not among' --module=libs/copy.mjs)" 1
put libs/dist/d.ts "import '../n';\n"
report "SC-AK-1933 — собранное не модуль" "$(lines_of 'is not among' --module=libs/dist/d.ts)" 1

# --- SC-AK-1934 — цикл в любом виде файлов и цикл блоков --------------------------------------------
cycle_of() { fresh_tree "$1"; put "libs/a.$2" "$3"; put "libs/b.$2" "$4"; report "SC-AK-1934 — $5" "$(lines_of 'a new cycle')" "$6"; }
cycle_of c1 ts "import './b';\n" "import './a';\n" "цикл двух .ts" 1
cycle_of c2 mjs "import './b.mjs';\n" "import './a.mjs';\n" "цикл двух .mjs" 1
cycle_of c3 sh '. "$d/b.sh"\n' '. "$d/a.sh"\n' "цикл двух скриптов" 1
cycle_of c4 spec.ts "import './b.spec';\n" "import './a.spec';\n" "цикл тестов" 1
cycle_of c5 ts "import './b';\n" "export const b = 1;\n" "связь в одну сторону не цикл" 0
fresh_tree c6
put libs/a.ts "import './b';\n" && put libs/b.ts "import './c';\n" && put libs/c.ts "import './a';\n"
report "SC-AK-1934 — цикл трёх назван одной строкой" "$(lines_of 'a new cycle: libs/a.ts → libs/b.ts → libs/c.ts → libs/a.ts')" 1
fresh_tree c7
put libs/d1/a.ts "import '../d2/b';\n" && put libs/d1/z.ts 'export const z = 1;\n' && put libs/d2/b.ts 'export const b = 1;\n'
report "SC-AK-1934 — связь блоков в одну сторону не цикл" "$(code)" 0
put libs/d2/y.ts "import '../d1/z';\n"
report "SC-AK-1934 — цикл блоков без цикла файлов" "$(lines_of 'a new cycle of blocks: libs/d1 → libs/d2 → libs/d1')" 1
put libs/d2/y.ts 'export const y = 1;\n' && put libs/d2/y.spec.ts "import '../d1/z';\n"
report "SC-AK-1934 — тест цикла блоков не создаёт" "$(code)" 0

# --- SC-AK-1935 — обход входного файла ---------------------------------------------------------------
fresh_tree past
aliases '"@x/deep":["libs/box/deep.ts"]'
put libs/box/index.ts "export { in1 } from './in1';\n"
put libs/box/in1.ts 'export const in1 = 1;\n'
put libs/box/deep.ts 'export const deep = 1;\n'
put libs/box/own.ts "import { in1 } from './in1';\n"
past_of() { put "libs/$2" "$3"; report "SC-AK-1935 — $1" "$(lines_of "libs/$2 imports")" "$4"; }
past_of "импорт внутреннего файла снаружи — обход" out1.ts "import { in1 } from './box/in1';\n" 1
past_of "импорт через вход — не обход" out2.ts "import { in1 } from './box';\n" 0
past_of "цель пути tsconfig — свой вход" out3.ts "import { deep } from '@x/deep';\n" 0
past_of "тест зовёт внутренний файл" out4.spec.ts "import { in1 } from './box/in1';\n" 0
past_of "стори зовёт внутренний файл" out5.stories.ts "import { in1 } from './box/in1';\n" 0
past_of "файл под корнем сквозных тестов зовёт внутренний" site-e2e/out9.ts "import { in1 } from '../box/in1';\n" 0
report "SC-AK-1935 — сосед внутри папки — не обход" "$(lines_of 'libs/box/own.ts imports')" 0
put libs/needs.ts "import { in1 } from './box/in1';\n"
put libs/box/uses.ts "import '../needs';\n"
put libs/box/index.ts "export { in1 } from './in1';\nexport * from './uses';\n"
report "SC-AK-1935 — обход, без которого замкнулся бы цикл, — не нарушение" "$(lines_of 'libs/needs.ts imports')" 0
put libs/lone/x.ts 'export const x = 1;\n'
past_of "папка без входа не закрыта" out6.ts "import { x } from './lone/x';\n" 0
put libs/named/main.mjs 'export const main = 1;\n' && put libs/named/part.mjs 'export const part = 1;\n'
past_of "объявленный вход закрывает папку скриптов" out7.mjs "import './named/part.mjs';\n" 1
past_of "через объявленный вход — не обход" out8.mjs "import './named/main.mjs';\n" 0

# --- SC-AK-1936 — числа одного модуля ----------------------------------------------------------------
fresh_tree numbers
put libs/a.ts "import { used } from './b';\nimport { c } from './c';\n"
put libs/d.ts "import { used } from './b';\n"
put libs/b.ts 'export const used = 1;\nexport const spare = 2;\nexport interface Seen { x: 1 }\n'
put libs/c.ts 'export const c = 1;\n'
put libs/t.spec.ts "import { used } from './b';\n"
report "SC-AK-1936 — входящие без тестов, исходящих нет, двое отданных без потребителя" "$(module libs/b.ts)" "incoming 2, outgoing 0, past an entry 0, shown 3, taken by nobody 2"
report "SC-AK-1936 — исходящие" "$(outgoing libs/a.ts)" 2
put libs/w.ts "import * as all from './b';\n"
report "SC-AK-1936 — импорт целиком берёт все имена" "$(module libs/b.ts | grep -c 'taken by nobody 0')" 1
put libs/s.sh 'known() {\n  :\n}\nspare() {\n  :\n}\n'
put libs/u.sh '. "$d/s.sh"\nknown\n'
report "SC-AK-1936 — функция скрипта, которую никто не зовёт" "$(module libs/s.sh | grep -c 'shown 2, taken by nobody 1')" 1
report "SC-AK-1936 — модуля нет — отказ" "$(code --module=libs/none.ts)" 1

# --- SC-AK-1937 — с базой печатается «было → стало» --------------------------------------------------
fresh_tree base
put libs/a.ts 'export const a = 1;\n' && put libs/b.ts 'export const b = 1;\n' && put libs/q.ts 'export const q = 1;\n'
save base
g checkout -q -b RT-1-x
put libs/a.ts "import { b } from './b';\nexport const a = b;\n"
save work
report "SC-AK-1937 — исходящие тронутого модуля" "$(lines_of 'libs/a.ts: incoming 0 → 0, outgoing 0 → 1' --base=main)" 1
report "SC-AK-1937 — входящие соседа" "$(lines_of 'libs/b.ts: incoming 0 → 1' --base=main)" 1
report "SC-AK-1937 — нетронутый модуль не печатается" "$(lines_of 'libs/q.ts' --base=main)" 0
put libs/q.ts "import './b';\n"
report "SC-AK-1937 — незакоммиченная правка видна" "$(lines_of 'libs/q.ts: incoming 0 → 0, outgoing 0 → 1' --base=main)" 1
report "SC-AK-1937 — числа дерева целиком" "$(lines_of 'cycles 0 → 0, cycles of blocks 0 → 0, past the entry 0 → 0' --base=main)" 1
put libs/d1/q.ts 'export const q = 1;\n' && put libs/d2/q.ts "import '../d1/q';\n"
report "SC-AK-1937 — новая связь блоков печатается" "$(lines_of 'a new link of blocks: libs/d2 → libs/d1' --base=main)" 1
report "SC-AK-1937 — число связей дерева было и стало" "$(lines_of 'links 0 → 3' --base=main)" 1
report "SC-AK-1937 — прошлая ревизия вместо дерева" "$(lines_of 'libs/q.ts' --base=main --at=RT-1-x)" 0
printf '{ не разобрать\n' > "$T/tsconfig.base.json"
report "SC-AK-1937 — неразобранный файл псевдонимов назван" "$(lines_of 'tsconfig.base.json does not parse' --base=main)" 1
rm "$T/tsconfig.base.json"
g checkout -q main && put libs/d3/q.ts 'export const q = 1;\n' && put libs/d4/q.ts "import '../d3/q';\n" && save blocks && g checkout -q -b RT-2-x
config '"coupling":{"blocks":["libs/d3","libs/d4"]}'
report "SC-AK-1937 — блок, объявленный над старой связью, новой связи не даёт" "$(lines_of 'a new link of blocks' --base=main)" 0
put libs/d3/r.ts "import '../d4/q';\n"
report "SC-AK-1937 — новая связь объявленного блока печатается" "$(lines_of 'a new link of blocks: libs/d3 → libs/d4' --base=main)" 1
report "SC-AK-1937 — базы нет — отказ с её именем" "$(lines_of 'the revision «origin/none» is not in this repository' --base=origin/none)" 1
report "SC-AK-1937 — отказ без базы — ненулевой код" "$(code --base=origin/none)" 1

# --- SC-AK-1938 — новый цикл отказан, старый пропущен -------------------------------------------------
fresh_tree cyc
put libs/a.ts "import './b';\n" && put libs/b.ts "import './a';\n" && put libs/c.ts 'export const c = 1;\n' && put libs/d.ts "import './c';\n"
put libs/d1/a.ts 'export const a = 1;\n' && put libs/d2/b.ts "import '../d1/a';\n" && put libs/d2/e.ts 'export const e = 1;\n'
save base
g checkout -q -b RT-1-x
put libs/e.ts 'export const e = 1;\n'
save work
report "SC-AK-1938 — старый цикл пропущен" "$(code --base=main)" 0
g mv libs/b.ts libs/renamed.ts && put libs/a.ts "import './renamed';\n"
report "SC-AK-1938 — переименование участника не делает старый цикл новым" "$(code --base=main)" 0
g reset -q --hard
put libs/c.ts "import './d';\n"
report "SC-AK-1938 — новый цикл отказан" "$(code --base=main)" 1
report "SC-AK-1938 — назван только новый" "$(lines_of 'a new cycle' --base=main)" 1
put libs/c.ts "import './a';\n" && put libs/b.ts "import './a';\nimport './c';\n"
report "SC-AK-1938 — старый цикл, в который вошёл новый модуль, отказан" "$(code --base=main)" 1
put libs/b.ts "import './a';\n" && put libs/c.ts 'export const c = 1;\n' && put libs/d1/f.ts "import '../d2/e';\n"
report "SC-AK-1938 — новый цикл блоков отказан" "$(lines_of 'a new cycle of blocks: libs/d1 → libs/d2 → libs/d1' --base=main)" 1
config '"coupling":{"blocks":[]}'
report "SC-AK-1938 — блок, снятый веткой с настройки, судится настройкой базы" "$(code --base=main)" 1
put libs/d1/f.ts 'export const f = 1;\n'
config '' apps
put libs/c.ts "import './d';\n"
report "SC-AK-1938 — корень, снятый веткой с настройки, читается по настройке базы" "$(code --base=main)" 1
fresh_tree cycblocks
put libs/e1/a.ts "import '../e2/b';\n" && put libs/e1/z.ts 'export const z = 1;\n' && put libs/e2/b.ts 'export const b = 1;\n' && put libs/e2/y.ts "import '../e1/z';\n"
save base
g checkout -q -b RT-1-x
config '"coupling":{"blocks":["libs/e1","libs/e2"]}'
report "SC-AK-1938 — блок, объявленный веткой над старыми связями, не новый цикл" "$(code --base=main)" 0

# --- SC-AK-1939 — новый обход отказан, старый пропущен -------------------------------------------------
fresh_tree byp
put libs/box/index.ts "export { i } from './i';\n" && put libs/box/i.ts 'export const i = 1;\n' && put libs/old.ts "import { i } from './box/i';\n"
put libs/bare/x.ts 'export const x = 1;\n' && put libs/takes.ts "import { x } from './bare/x';\n"
put libs/ring/index.ts "export * from './uses';\nexport * from './in';\n" && put libs/ring/uses.ts "import '../needs';\n" && put libs/ring/in.ts 'export const r = 1;\n'
put libs/needs.ts "import { r } from './ring/in';\n"
save base
g checkout -q -b RT-1-x
put libs/n.ts 'export const n = 1;\n'
report "SC-AK-1939 — старый обход пропущен" "$(code --base=main)" 0
put libs/n.ts "import { i } from './box/i';\n"
report "SC-AK-1939 — новый обход отказан" "$(code --base=main)" 1
aliases '"@x/i":["libs/box/i.ts"]'
report "SC-AK-1939 — псевдоним, добавленный веткой, обход не снимает" "$(code --base=main)" 1
rm "$T/tsconfig.base.json"
config '"coupling":{"harness":["libs"]}'
report "SC-AK-1939 — обвязка, добавленная веткой, обход не снимает" "$(code --base=main)" 1
g checkout -q -- .claude
put libs/n.ts 'export const n = 1;\n' && put libs/bare/index.ts "export { x } from './x';\n"
report "SC-AK-1939 — новый вход не делает старый импорт новым" "$(code --base=main)" 0
put libs/ring/uses.ts 'export const u = 1;\n'
report "SC-AK-1939 — ушедшая связь входа не делает старый импорт новым" "$(code --base=main)" 0
put libs/takes.ts "import { x } from './bare/x';\nimport { i } from './box/i';\n"
report "SC-AK-1939 — новый обход из файла, который был в базе, отказан" "$(lines_of 'libs/takes.ts imports libs/box/i.ts past' --base=main)" 1
put libs/old.ts 'export const o = 1;\n'
report "SC-AK-1939 — обход, переехавший от соседа той же папки, не новый" "$(code --base=main)" 0
g checkout -q -- libs/old.ts libs/takes.ts
put libs/box/second.ts 'export const s = 1;\n' && put libs/n.ts "import { s } from '@x/second';\n"
aliases '"@x/second":["libs/box/second.ts"]'
report "SC-AK-1939 — новый файл со своим псевдонимом — новый вход" "$(code --base=main)" 0
rm "$T/tsconfig.base.json" "$T/libs/box/second.ts" && put libs/n.ts 'export const n = 1;\n'
g mv libs/old.ts libs/moved.ts
report "SC-AK-1939 — переименование не делает старый обход новым" "$(code --base=main)" 0

# --- SC-AK-1940 — рост исходящих сверх плана -----------------------------------------------------------
fresh_tree grow
for n in 1 2 3 4 5 6; do put "libs/t$n.ts" "export const t$n = 1;\n"; done
put libs/a.ts "import './t1';\n" && put libs/index.ts "import './t1';\n" && put libs/a.spec.ts "import './t1';\n" && put libs/side.ts "import './t1';\n"
save base
g checkout -q -b RT-1-x
links() { local n out=""; for n in $(seq 1 "$1"); do out="${out}import './t$n';\n"; done; printf '%s' "$out"; }
plan() { put "docs/tasks/${2:-RT-1-x}/plan.md" "$1\n"; }
progress() { put docs/tasks/RT-1-x/progress.md "$1\n"; }
put libs/a.ts "$(links 2)"
report "SC-AK-1940 — в дереве без планов рост печатается и не отказан" "$(lines_of 'grown, the tree keeps no plans: `libs/a.ts` outgoing 1 → 2' --base=main):$(code --base=main)" "1:0"
plan '`libs/a.ts` исходящие 1 → 9' _template
report "SC-AK-1940 — без своего плана в дереве с планами рост отказан, образец не читается" "$(code --base=main)" 1
plan 'без чисел'
report "SC-AK-1940 — неназванный рост отказан" "$(lines_of 'outgoing 1 → 2; nobody named a number for it' --base=main):$(code --base=main)" "1:1"
plan '| Зацепление | `libs/a.ts` исходящие 1 → 2 |'
report "SC-AK-1940 — названный рост проходит" "$(code --base=main)" 0
put libs/a.ts "$(links 3)"
report "SC-AK-1940 — рост сверх названного отказан" "$(lines_of 'the branch named 2' --base=main)" 1
plan '`libs/a.ts:fn` — входящие 0 → 1; исходящие: 1 → 3; циклов нет'
report "SC-AK-1940 — символ, точка с запятой и двоеточие читаются" "$(code --base=main)" 0
plan '`a.ts` outgoing 1 -> 3'
report "SC-AK-1940 — короткий путь единственного файла" "$(code --base=main)" 0
plan '`libs/side.ts` и `libs/a.ts` исходящие 1 → 3'
report "SC-AK-1940 — число относится к ближайшему пути" "$(code --base=main)" 0
save work
rm -rf "$T/docs" && save archive
report "SC-AK-1940 — план читается из истории после разбора папки" "$(code --base=main)" 0
put libs/new.ts "$(links 1)"
report "SC-AK-1940 — неназванный новый модуль отказан" "$(lines_of '`libs/new.ts` outgoing 0 → 1; nobody named' --base=main)" 1
progress '- `libs/new.ts` исходящие 0 → 1.'
report "SC-AK-1940 — строка хода работы без причины не снимает отказ" "$(code --base=main)" 1
progress '- `libs/new.ts` исходящие 0 → 1: общий помощник.'
report "SC-AK-1940 — названное в ходе работы с причиной проходит и печатается" "$(lines_of 'overrun, named after the plan: `libs/new.ts` outgoing 0 → 1' --base=main):$(code --base=main)" "1:0"
rm -rf "$T/docs"
plan '`libs/new.ts` исходящие 0 → 1: дописано после кода'
report "SC-AK-1940 — число, дописанное в план позже, печатается превышением" "$(lines_of 'overrun, named after the plan: `libs/new.ts`' --base=main)" 1
rm -rf "$T/docs" "$T/libs/new.ts"
put libs/fold/x.ts "import '../t1';\nimport './y';\n" && put libs/fold/y.ts "import '../t2';\n"
progress '`libs/fold/` исходящие 0 → 2: новая папка помощника'
report "SC-AK-1940 — новая папка названа числом связей наружу" "$(code --base=main)" 0
put libs/fold/y.ts "import '../t2';\nimport '../t3';\n"
report "SC-AK-1940 — папка выросла сверх названного" "$(lines_of '`libs/fold/` outgoing 0 → 3; the branch named 2' --base=main)" 1
progress '`libs/` исходящие 0 → 9: корень дерева целиком'
report "SC-AK-1940 — корень дерева папкой не принимается" "$(code --base=main)" 1
rm -rf "$T/docs" "$T/libs/fold"
g checkout -q main && put libs/old/m.ts "import '../t1';\n" && save "прежняя папка" && g checkout -q -b RT-3-z
put libs/old/m.ts "import '../t1';\nimport './n';\n" && put libs/old/n.ts 'export const n = 1;\n'
plan '`libs/old/` исходящие 1 → 1' RT-3-z
report "SC-AK-1940 — папка не отвечает за модуль, который был в базе" "$(lines_of '`libs/old/m.ts` outgoing 1 → 2; nobody named' --base=main)" 1
g reset -q --hard && g clean -fdq && g checkout -q RT-1-x && g merge -q --no-edit main
put libs/index.ts "$(links 6)" && put libs/a.spec.ts "$(links 6)"
report "SC-AK-1940 — вход и тест не судятся" "$(code --base=main)" 0
put libs/t6.ts "import './t1';\n"
config '"tasksDir":"none","coupling":{"harness":["libs"]}'
report "SC-AK-1940 — обвязка, добавленная веткой, роста не снимает" "$(lines_of '`libs/t6.ts` outgoing 0 → 1; nobody named' --base=main):$(code --base=main)" "1:1"
g checkout -q -- .claude
aliases '"@x/t6":["libs/t6.ts"]'
report "SC-AK-1940 — псевдоним, добавленный веткой, роста не снимает" "$(code --base=main)" 1
rm "$T/tsconfig.base.json" && g checkout -q -- libs/t6.ts
g mv libs/side.ts libs/moved.ts
report "SC-AK-1940 — переименованный модуль не новый" "$(code --base=main)" 0
put libs/moved.ts "$(links 2)"
report "SC-AK-1940 — рост переименованного сравнивается со старым именем" "$(lines_of '`libs/moved.ts` outgoing 1 → 2' --base=main)" 1
g reset -q --hard && g clean -fdq
g checkout -q main && put libs/t1.ts "import './t2';\n" && save "чужая работа"
g checkout -q RT-1-x && g merge -q --no-edit main
report "SC-AK-1940 — рост, приехавший слиянием базы, не судится" "$(code --base="$(g rev-parse main~1)")" 0
g checkout -q main && plan 'образец' _template && save "образец задачи"
g checkout -q -b RT-2-y main && plan 'без чисел' RT-2-y && put libs/t3.ts "import './t2';\n" && save work
g checkout -q -b RT-9-epic main && g merge -q --no-ff --no-edit RT-2-y
report "SC-AK-1940 — рост влитой задачи в ветке эпика не судится" "$(code --base=main)" 0
g checkout -q RT-2-y
report "SC-AK-1940 — тот же рост в ветке задачи отказан" "$(code --base=main)" 1
plan '| `libs/t3.ts` | исходящие 0 → 1 |' RT-5-second && save "план чужой папки после своего"
report "SC-AK-1940 — план чужой папки, записанный после своего, без причины не снимает" "$(code --base=main)" 1
plan '| `libs/t3.ts` | исходящие 0 → 1, общий помощник |' RT-5-second && save "с причиной"
report "SC-AK-1940 — с причиной он печатается превышением" "$(lines_of 'overrun, named after the plan: `libs/t3.ts`' --base=main):$(code --base=main)" "1:0"
g checkout -q -b RT-6-low main && plan '| `libs/t4.ts` | исходящие 0 → 1 |' RT-6-low && put libs/t4.ts "import './t1';\n" && save low
g checkout -q -b RT-7-top && plan 'без чисел' RT-7-top && save top
report "SC-AK-1940 — план нижней ветки стопки, число в соседней ячейке" "$(code --base=main)" 0
g checkout -q main && plan '`libs/t4.ts` исходящие 0 → 1' RT-4-w && save "план в базе"
g checkout -q -b RT-4-w && rm -rf "$T/docs/tasks/RT-4-w" && put libs/t4.ts "import './t1';\n" && save work
report "SC-AK-1940 — план ветки, пришедший с базой, читается" "$(code --base=main)" 0
sample="$(grep -oE '\| Coupling \| [^|]*' "$ASSETS/patterns/code-design-choose.md" | head -1)"
report "SC-AK-1940 — строка примера паттерна читается командой" "$(cd "$T/tools" && SAMPLE="$sample" node -e 'import("./coupling-plan.mjs").then(({ namedOf }) => console.log([...namedOf(process.env.SAMPLE)].join(";")))')" "mail/reader.ts,3"

# --- SC-AK-1941 — список принятого и место в наборе перед отправкой --------------------------------------
fresh_tree debt
put libs/a.ts "import './b';\n" && put libs/b.ts 'export const b = 1;\n'
save base
g checkout -q -b RT-1-x
put libs/b.ts "import './a';\n"
debt() { printf '{"accepted":{},"debt":{%s}}\n' "$1" > "$T/tools/coupling-allowlist.json"; }
old_cycle='"libs/a.ts | libs/b.ts":{"reason":"старый цикл","task":"RT-1"}'
debt "$old_cycle"
report "SC-AK-1941 — принятый цикл проходит без базы" "$(code)" 0
report "SC-AK-1941 — своя запись не снимает отказ с базой" "$(code --base=main)" 1
debt '"libs/a.ts | libs/b.ts":{"reason":"слово владельца 24.11: «пусть будет»","task":"RT-1"}'
report "SC-AK-1941 — запись со словом владельца снимает и печатается" "$(lines_of 'accepted by the owner: libs/a.ts | libs/b.ts' --base=main):$(code --base=main)" "1:0"
debt '"libs/a.ts | libs/b.ts":{"reason":"версия 10.20 «как было»","task":"RT-1"}'
report "SC-AK-1941 — дата и кавычки без слов владельца не снимают" "$(code --base=main)" 1
debt '"libs/a.ts | libs/b.ts":{"reason":"","task":"RT-1"}'
report "SC-AK-1941 — запись без причины отказана" "$(lines_of 'has an empty reason')" 1
debt "$old_cycle,\"libs/a.ts -> libs/z.ts\":{\"reason\":\"ушло\",\"task\":\"RT-1\"}"
report "SC-AK-1941 — запись без нарушения отказана" "$(lines_of 'the violation is gone — remove the line')" 1
debt "$old_cycle"
save "ветка с циклом и записью"
g checkout -q --detach main && g merge -q --no-ff --no-edit RT-1-x
report "SC-AK-1941 — слияние ветки с новым циклом отказано с базой, запись не снимает" "$(code --base=main)" 1
g checkout -q RT-1-x && put libs/c.ts "import './d';\n" && put libs/d.ts "import './c';\n" && save "ещё цикл"
report "SC-AK-1941 — старое, чего нет в списке, печатается с базой" "$(lines_of 'old, not in tools/coupling-allowlist.json: libs/c.ts | libs/d.ts' --base=HEAD):$(code --base=HEAD)" "1:0"
debt ''
report "SC-AK-1941 — снимок списка называет ключ" "$(run --baseline 2> /dev/null | grep -c 'libs/a.ts | libs/b.ts')" 1
fresh_tree empty
report "SC-AK-1941 — дерево без кода пропущено" "$(code)" 0
push_lines() { (cd "$T" && . "$DEFAULTS/push.sh" && RT_CHECKS_DIR=tools CLAUDE_PROJECT_DIR="$T" rt_push_checks_default "$1" 2> /dev/null | grep check-coupling); }
report "SC-AK-1941 — набор перед отправкой зовёт команду с базой один раз" "$(push_lines origin/main)" "node tools/check-coupling.mjs --base=origin/main"
report "SC-AK-1941 — без базы набор зовёт команду без неё" "$(push_lines '')" "node tools/check-coupling.mjs"

suite_result "проверки: зацепление модулей"
