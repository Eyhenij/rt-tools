#!/usr/bin/env bash
# Что проверка говорит о конвейере публикации, оставившем замок зависимостей прежним.
#
# Проверка стоит в дереве, а не в пакете: имена скриптов подъёма версии и шага, кладущего заявку,
# — имена этого репозитория. Судится она деревом-фикстурой: настоящий каталог конвейеров один и
# зелёный, а случаев несколько, и второго каталога у дерева нет.
#
# Печатает строку на случай: ожидание против полученного. Ненулевой код — хоть один разошёлся.
set -u

root="$(cd "$(dirname "$0")/../../.." && pwd)"
check="$root/tools/check-publish-lockfile.mjs"
ok=0
bad=0

dir="$(mktemp -d)"
cleanup() { rm -rf "$dir"; }
trap cleanup EXIT

# Конвейер: имя файла, что стоит между подъёмом версии и заявкой.
workflow() {
    {
        printf 'name: Publish\njobs:\n    publish:\n        steps:\n'
        printf '            - name: Update version\n              run: |\n'
        printf '                  node update-version-%s.cjs patch\n' "$2"
        [ -n "$3" ] && printf '                  %s\n' "$3"
        printf '            - uses: EndBug/add-and-commit@v10\n'
        [ -n "${4:-}" ] && printf '              run: |\n                  %s\n' "$4"
    } > "$dir/$1"
}

# Что проверка отвечает на такой каталог: строка вывода и код возврата.
says() { RT_WORKFLOWS_DIR="$dir" node "$check" 2>&1; }
code() {
    RT_WORKFLOWS_DIR="$dir" node "$check" > /dev/null 2>&1
    printf '%s' "$?"
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

# Есть ли такая строка в ответе: «да» или «нет».
said() {
    if says | grep -qF "$1"; then printf 'да'; else printf 'нет'; fi
}

echo "проверки: замок в конвейере публикации"

rm -f "$dir"/*.yml
workflow publish-core.yml core 'pnpm install --lockfile-only'
workflow publish-store.yml store 'pnpm install --lockfile-only'

probe 'пересобирающие замок расхождением не считаются' '0' "$(code)"
probe 'число проверенных конвейеров названо' 'да' "$(said 'конвейеров публикации 2')"

workflow publish-utils.yml utils ''

probe 'конвейер без пересборки отбит' '1' "$(code)"
probe 'и назван по имени файла' 'да' "$(said 'publish-utils.yml')"
probe 'причиной названа следующая публикация' 'да' "$(said 'следующая публикация')"

rm -f "$dir"/*.yml
workflow publish-core.yml core '' 'pnpm install --lockfile-only'

probe 'пересборка после шага заявки отбита' '1' "$(code)"
probe 'и сказано, что в заявку она не попадёт' 'да' "$(said 'в неё он уже не попадёт')"

rm -f "$dir"/*.yml
printf 'name: CI\njobs:\n    build:\n        steps:\n            - run: pnpm test\n' > "$dir/ci.yml"

probe 'конвейер, не поднимающий версии, не судится' '1' "$(code)"
probe 'и сказано, что судить нечего' 'да' "$(said 'судить нечего')"

printf '\nсошлось: %d, разошлось: %d\n' "$ok" "$bad"
[ "$bad" -eq 0 ]
