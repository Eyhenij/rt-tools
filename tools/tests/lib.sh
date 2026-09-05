#!/usr/bin/env bash
# Общая обвязка наборов по проверкам этого дерева. Подключается через
# `. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"`.
#
# Зачем наборы существуют: проверки дерева читают его файлы и отвечают кодом возврата, а
# прогоняются они на самом дереве — то есть на одном наборе входов, который сегодня зелёный.
# Что проверка ловит на входе, которого в дереве нет, не знает никто: сломанная строка в ней
# молчит ровно до того дня, когда такой вход появится.
#
# Проверяется здесь МЕХАНИКА проверки на одноразовом дереве, а не состояние этого репозитория.

TOOLS="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

PASSED=0
FAILED=0

report() {
    if [ "$2" = "$3" ]; then
        PASSED=$((PASSED + 1))
        [ -n "$VERBOSE" ] && printf '  ok   %-58s %s\n' "$1" "$2"
    else
        FAILED=$((FAILED + 1))
        printf '  FAIL %-58s получили %s, ждали %s\n' "$1" "$2" "$3"
    fi
    return 0
}

# Одноразовое дерево с проверками этого репозитория: сами проверки читают корень от своего
# файла, поэтому в фикстуру они копируются, а не зовутся отсюда. Печатает путь.
fixture_tree() {
    local dir
    dir="$(mktemp -d)"
    mkdir -p "$dir/tools" "$dir/.claude/rt-kit"
    cp "$TOOLS/rt-kit-checks.config.mjs" "$dir/tools/"
    printf '{\n  "accepted": {}\n}\n' > "$dir/tools/cascade-layer-allowlist.json"
    printf '%s' "$dir"
}

suite_result() {
    printf '%s: %d ok, %d провалов\n' "$1" "$PASSED" "$FAILED"
    [ "$FAILED" -eq 0 ]
}
