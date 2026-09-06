#!/usr/bin/env bash
# Что проверка говорит об импортах из соседних пакетов: есть ли импортированный символ у той
# версии соседа, которая опубликована под диапазон манифеста.
#
# Проверка стоит в дереве, а не в пакете: область `@rt-tools/*`, каталог `projects/` и формы
# типов опубликованных пакетов — этого репозитория. Судится она деревом-фикстурой: каталог
# пакетов и каталог распакованных версий подставляются переменными, и в сеть проба не ходит.
#
# Печатает строку на случай: ожидание против полученного. Ненулевой код — хоть один разошёлся.
set -u

root="$(cd "$(dirname "$0")/../../.." && pwd)"
check="$root/tools/check-package-imports.mjs"
ok=0
bad=0

dir="$(mktemp -d)"
cleanup() { rm -rf "$dir"; }
trap cleanup EXIT

projects="$dir/projects"
published="$dir/published"

# Опубликованная версия соседа: имя, версия, файл типов из манифеста и его содержимое.
neighbour() {
    local pkg="$published/$1/$2/package"
    mkdir -p "$pkg/$(dirname "$3")"
    printf '{"name":"%s","version":"%s","typings":"%s"}\n' "$1" "$2" "$3" > "$pkg/package.json"
    printf '%b' "$4" > "$pkg/$3"
}

# Файл рядом с типами соседа — для цепочки `export * from`.
neighbour_file() {
    local pkg="$published/$1/$2/package"
    mkdir -p "$pkg/$(dirname "$3")"
    printf '%b' "$4" > "$pkg/$3"
}

# Пакет дерева: имя каталога, имя пакета, зависимости манифеста (JSON-тело), исходник.
package() {
    mkdir -p "$projects/$1/src"
    printf '{"name":"%s","version":"0.1.0","dependencies":{%s}}\n' "$2" "$3" > "$projects/$1/package.json"
    printf '%b' "$4" > "$projects/$1/src/$5"
}

reset() {
    rm -rf "$projects" "$published"
    mkdir -p "$projects" "$published"
}

says() { RT_PROJECTS_DIR="$projects" RT_PUBLISHED_DIR="$published" node "$check" 2>&1; }
code() {
    RT_PROJECTS_DIR="$projects" RT_PUBLISHED_DIR="$published" node "$check" > /dev/null 2>&1
    printf '%s' "$?"
}

probe() {
    if [ "$2" = "$3" ]; then
        ok=$((ok + 1))
    else
        bad=$((bad + 1))
        printf '  FAIL %s: получили «%s», ждали «%s»\n' "$1" "$2" "$3"
    fi
}

contains() {
    case "$1" in
        *"$2"*) printf 'есть' ;;
        *) printf 'нет' ;;
    esac
}

echo "проверка импортов из соседей"

# --- SC-AK-893 — символ есть у опубликованного соседа: зелёная -----------------------------------
reset
neighbour '@rt-tools/utils' '0.4.0' 'esm/index.d.ts' 'export declare function debounce(): void;\nexport interface IPageModel { page: number; }\n'
package 'kit' '@rt-tools/kit' '"@rt-tools/utils":"^0.4.0"' "import { debounce, IPageModel } from '@rt-tools/utils';\n" 'a.ts'
probe "SC-AK-893 — сошедшиеся импорты проходят" "$(code)" 0
probe "SC-AK-893 — итог называет пары с соседом" "$(contains "$(says)" 'пар с соседом 1')" 'есть'

# --- SC-AK-894 — символа у опубликованного соседа нет: красная, с именами -----------------------
reset
neighbour '@rt-tools/utils' '0.3.2' 'esm/index.d.ts' 'export declare function debounce(): void;\n'
neighbour '@rt-tools/utils' '0.4.0' 'esm/index.d.ts' 'export declare function debounce(): void;\n'
package 'kit' '@rt-tools/kit' '"@rt-tools/utils":"^0.4.0"' "import { EListSortOrder, debounce } from '@rt-tools/utils';\n" 'a.ts'
out="$(says)"
probe "SC-AK-894 — недостающий символ отбивается" "$(code)" 1
probe "SC-AK-894 — отказ называет пакет, символ и версию соседа" "$(contains "$out" '@rt-tools/kit: импортирует EListSortOrder из @rt-tools/utils')" 'есть'
probe "SC-AK-894 — версия соседа — наибольшая под диапазон" "$(contains "$out" '@rt-tools/utils@0.4.0 его нет')" 'есть'
probe "SC-AK-894 — имеющийся символ не называется" "$(contains "$out" 'импортирует debounce')" 'нет'

# --- SC-AK-895 — многострочный импорт, `type` и `as` читаются по имени у соседа ------------------
reset
neighbour '@rt-tools/core' '0.4.0' 'types/rt-tools-core.d.ts' 'declare class Bus {}\ndeclare enum EPosition { top = 0 }\nexport { Bus as MessageBus, EPosition };\n'
package 'kit' '@rt-tools/kit' '"@rt-tools/core":"^0.4.0"' "import type {\n    EPosition,\n    MessageBus as Bus,\n} from '@rt-tools/core';\nimport { type EPosition as Pos } from '@rt-tools/core';\n" 'a.ts'
probe "SC-AK-895 — многострочный импорт с type и as сходится" "$(code)" 0

# --- SC-AK-896 — цепочка export * читается до конца ---------------------------------------------
reset
neighbour '@rt-tools/utils' '0.4.0' 'esm/index.d.ts' "export * from './lib/functions/index.js';\n"
neighbour_file '@rt-tools/utils' '0.4.0' 'esm/lib/functions/index.d.ts' "export * from './debounce/debounce.js';\nexport type { TNullable } from './types.js';\n"
neighbour_file '@rt-tools/utils' '0.4.0' 'esm/lib/functions/debounce/debounce.d.ts' 'export declare function debounce(): void;\n'
neighbour_file '@rt-tools/utils' '0.4.0' 'esm/lib/functions/types.d.ts' 'export type TNullable<T> = T | null;\n'
package 'kit' '@rt-tools/kit' '"@rt-tools/utils":"^0.4.0"' "import { debounce, TNullable } from '@rt-tools/utils';\n" 'a.ts'
probe "SC-AK-896 — символ из цепочки export * находится" "$(code)" 0

# --- SC-AK-897 — пробы и истории витрины не судятся ---------------------------------------------
reset
neighbour '@rt-tools/utils' '0.4.0' 'esm/index.d.ts' 'export declare function debounce(): void;\n'
package 'kit' '@rt-tools/kit' '"@rt-tools/utils":"^0.4.0"' "import { debounce } from '@rt-tools/utils';\n" 'a.ts'
printf "import { Missing } from '@rt-tools/utils';\n" > "$projects/kit/src/a.spec.ts"
printf "import { Missing } from '@rt-tools/utils';\n" > "$projects/kit/src/a.stories.ts"
probe "SC-AK-897 — импорт в пробе и истории не судится" "$(code)" 0

# --- SC-AK-898 — под диапазон нет ни одной версии, либо сосед не назван в манифесте -------------
reset
neighbour '@rt-tools/utils' '0.3.2' 'esm/index.d.ts' 'export declare function debounce(): void;\n'
package 'kit' '@rt-tools/kit' '"@rt-tools/utils":"^0.4.0"' "import { debounce } from '@rt-tools/utils';\n" 'a.ts'
out="$(says)"
probe "SC-AK-898 — диапазон без версии в реестре отбивается" "$(code)" 1
probe "SC-AK-898 — отказ называет диапазон" "$(contains "$out" 'под диапазон @rt-tools/utils@^0.4.0 в реестре нет ни одной версии')" 'есть'
reset
neighbour '@rt-tools/utils' '0.4.0' 'esm/index.d.ts' 'export declare function debounce(): void;\n'
package 'kit' '@rt-tools/kit' '' "import { debounce } from '@rt-tools/utils';\n" 'a.ts'
out="$(says)"
probe "SC-AK-898 — сосед не назван в манифесте — отбивается" "$(code)" 1
probe "SC-AK-898 — отказ называет пропажу в манифесте" "$(contains "$out" 'в манифесте соседа не называет')" 'есть'

# --- SC-AK-899 — реестр не ответил: проверка проходит и говорит об этом -------------------------
reset
package 'kit' '@rt-tools/kit' '"@rt-tools/utils":"^0.4.0"' "import { debounce } from '@rt-tools/utils';\n" 'a.ts'
fake="$dir/bin"
mkdir -p "$fake"
printf '#!/usr/bin/env bash\necho "npm ERR! network request failed" >&2\nexit 1\n' > "$fake/npm"
chmod +x "$fake/npm"
out="$(RT_PROJECTS_DIR="$projects" PATH="$fake:$PATH" node "$check" 2>&1)"
RT_PROJECTS_DIR="$projects" PATH="$fake:$PATH" node "$check" > /dev/null 2>&1
probe "SC-AK-899 — без ответа реестра проверка проходит" "$?" 0
probe "SC-AK-899 — о пропуске сказано" "$(contains "$out" 'реестр не ответил')" 'есть'

# --- SC-AK-900 — символ ждёт публикации соседа: гейт терпит, конвейер публикации — нет ---------
reset
neighbour '@rt-tools/core' '0.4.0' 'types/rt-tools-core.d.ts' 'declare class Bus {}\nexport { Bus };\n'
package 'core' '@rt-tools/core' '' "export * from './lib/inputs';\n" 'index.ts'
mkdir -p "$projects/core/src/lib" && printf 'export function setInputs(): void {}\n' > "$projects/core/src/lib/inputs.ts"
package 'kit' '@rt-tools/kit' '"@rt-tools/core":"^0.4.0"' "import { Bus, setInputs } from '@rt-tools/core';\n" 'a.ts'
out="$(says)"
probe "SC-AK-900 — символ из исходников соседа проверку не роняет" "$(code)" 0
probe "SC-AK-900 — о нём сказано, что он ждёт публикации соседа" "$(contains "$out" 'setInputs из @rt-tools/core')" 'есть'
probe "SC-AK-900 — итог считает ждущих" "$(contains "$out" 'ждут публикации соседа 1')" 'есть'
RT_PROJECTS_DIR="$projects" RT_PUBLISHED_DIR="$published" node "$check" --strict > /dev/null 2>&1
probe "SC-AK-900 — в строгом режиме тот же символ отбивается" "$?" 1
out="$(RT_PROJECTS_DIR="$projects" RT_PUBLISHED_DIR="$published" node "$check" --strict --package @rt-tools/kit 2>&1)"
probe "SC-AK-900 — строгий отказ называет символ" "$(contains "$out" 'импортирует setInputs из @rt-tools/core')" 'есть'

# --- SC-AK-901 — суд одного пакета и импорт в комментарии ------------------------------------
reset
neighbour '@rt-tools/utils' '0.4.0' 'esm/index.d.ts' 'export declare function debounce(): void;\n'
package 'kit' '@rt-tools/kit' '"@rt-tools/utils":"^0.4.0"' "import { Missing } from '@rt-tools/utils';\n" 'a.ts'
package 'other' '@rt-tools/other' '"@rt-tools/utils":"^0.4.0"' "/**\n * import { Missing } from '@rt-tools/utils';\n */\n// import { Missing } from '@rt-tools/utils';\nimport { debounce } from '@rt-tools/utils';\n" 'a.ts'
RT_PROJECTS_DIR="$projects" RT_PUBLISHED_DIR="$published" node "$check" --package @rt-tools/other > /dev/null 2>&1
probe "SC-AK-901 — суд одного пакета не видит соседний" "$?" 0
probe "SC-AK-901 — импорт в комментарии не судится" "$(contains "$(RT_PROJECTS_DIR="$projects" RT_PUBLISHED_DIR="$published" node "$check" --package @rt-tools/other 2>&1)" 'Missing')" 'нет'
RT_PROJECTS_DIR="$projects" RT_PUBLISHED_DIR="$published" node "$check" --package @rt-tools/none > /dev/null 2>&1
probe "SC-AK-901 — неизвестный пакет отбивается" "$?" 1

printf 'проверка импортов из соседей: сошлось: %s, разошлось: %s\n' "$ok" "$bad"
[ "$bad" -eq 0 ]
