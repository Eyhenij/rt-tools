#!/usr/bin/env bash
# Что инструмент перестановки импортов делает с объявлением каждого рода.
#
# Инструмент стоит в дереве, а не в пакете: таблица имён — имена двух пакетов этого репозитория, и
# у дерева, которое их не ставит, предмета нет вовсе. Судится он деревом-фикстурой, а не своим
# кодом: правка идёт по тексту файла, и утверждение о ней проверяется тем же текстом после прогона.
#
# Печатает строку на случай: ожидание против полученного. Ненулевой код — хоть один разошёлся.
set -u

root="$(cd "$(dirname "$0")/../../.." && pwd)"
tool="$root/tools/migrate-utils-imports.mjs"
ok=0
bad=0

tree="$(mktemp -d)"
cleanup() { rm -rf "$tree"; }
trap cleanup EXIT

# Дерево-фикстура заново: каждый случай судит прогон с начала, а инструмент правит файлы на месте.
seed() {
    rm -rf "${tree:?}/src" "${tree:?}/node_modules"
    mkdir -p "$tree/src/nested" "$tree/node_modules"

    printf "%s\n" "import { RtIconOutlinedDirective, BreakpointService } from '@rt-tools/utils';" > "$tree/src/moved.ts"
    printf "%s\n" "import { isNil, POSITION_ENUM, type IBreakpoints, Nullable } from '@rt-tools/utils';" > "$tree/src/mixed.ts"
    printf "%s\n" "import { isNil, isEmail } from '@rt-tools/utils';" > "$tree/src/nested/pure.ts"
    printf "%s\n%s\n" "import { MessageBus } from '@rt-tools/core';" "import { isNil, SanitizePipe } from '@rt-tools/utils';" > "$tree/src/merge.ts"
    printf "%s\n" "import { POSITION_ENUM as Pos, checkIsMatchingValues } from '@rt-tools/utils';" > "$tree/src/alias.ts"
    printf "%s\n" "import * as utils from '@rt-tools/utils';" > "$tree/src/whole.ts"
    cp "$tree/src/moved.ts" "$tree/node_modules/installed.ts"
}

# Случай: имя, ожидание, полученное.
probe() {
    if [ "$2" = "$3" ]; then
        ok=$((ok + 1))
        [ -n "${VERBOSE:-}" ] && printf '  ok   %-56s %s\n' "$1" "$3"
    else
        bad=$((bad + 1))
        printf '  FAIL %-56s получили %s, ждали %s\n' "$1" "$3" "$2"
    fi
    return 0
}

# Есть ли такая строка в файле дерева: «да» или «нет».
has() {
    if grep -qF "$2" "$tree/$1"; then printf 'да'; else printf 'нет'; fi
}

echo "перестановка импортов переехавшего"

seed
node "$tool" "$tree" > /dev/null

probe 'адрес заменён, когда переехало всё объявление' 'да' \
    "$(has src/moved.ts "import { RtIconOutlinedDirective, BreakpointService } from '@rt-tools/core';")"

probe 'смешанное объявление оставило в прежнем пакете своё' 'да' \
    "$(has src/mixed.ts "import { isNil, Nullable } from '@rt-tools/utils';")"

probe 'и завело второе — на переехавшее' 'да' \
    "$(has src/mixed.ts "from '@rt-tools/core';")"

probe 'переименованное приезжает под прежним именем' 'да' \
    "$(has src/mixed.ts 'EPosition as POSITION_ENUM')"

probe 'модификатор типа переезжает вместе с именем' 'да' \
    "$(has src/mixed.ts 'type IBreakpoints')"

probe 'своё имя потребителя остаётся своим' 'да' \
    "$(has src/alias.ts "import { EPosition as Pos, checkIsMatchingValues } from '@rt-tools/core';")"

probe 'объявление без переехавших имён не тронуто' 'да' \
    "$(has src/nested/pure.ts "import { isNil, isEmail } from '@rt-tools/utils';")"

probe 'имена дописаны в стоящий импорт нового пакета' 'да' \
    "$(has src/merge.ts "import { MessageBus, SanitizePipe } from '@rt-tools/core';")"

probe 'второго объявления того же адреса не заведено' '1' \
    "$(grep -cF "from '@rt-tools/core'" "$tree/src/merge.ts")"

probe 'установленное не обойдено' 'да' \
    "$(has node_modules/installed.ts "from '@rt-tools/utils';")"

probe 'импорт пакета целиком не тронут' 'да' \
    "$(has src/whole.ts "import * as utils from '@rt-tools/utils';")"

probe 'и назван отдельно' 'да' \
    "$(seed; node "$tool" "$tree" | grep -qF 'split only by hand' && printf 'да' || printf 'нет')"

probe 'повторный прогон не меняет ничего' 'files 0, declarations moved 0, split 0' \
    "$(node "$tool" "$tree" | tail -1)"

seed
dry="$(node "$tool" "$tree" --dry | tail -1)"

probe 'сухой прогон называет то же, что сделал бы' 'a dry run: files 4, declarations moved 2, split 2' "$dry"

probe 'и ничего не записывает' 'да' \
    "$(has src/moved.ts "from '@rt-tools/utils';")"

probe 'без каталога инструмент отказывает' '1' \
    "$(node "$tool" > /dev/null 2>&1; printf '%s' "$?")"

probe 'слово о доводах отдаётся нулём' '0' \
    "$(node "$tool" --help > /dev/null 2>&1; printf '%s' "$?")"

printf '\nсошлось: %d, разошлось: %d\n' "$ok" "$bad"
[ "$bad" -eq 0 ]
