#!/usr/bin/env bash
# Прогон всех наборов по исполняемым ресурсам пакета:
# `bash projects/agent-kit/tests/run.sh` (с VERBOSE=1 — с каждым сценарием).
#
# Гонять ЦЕЛИКОМ после правки любого ресурса из `assets/`: гарды угадывают намерение по тексту
# команды, и уточнение шаблона смещает границу, а не сужает её — проверка одного затронутого
# края пропускает соседний, который эта же правка и открыла.
cd "$(dirname "${BASH_SOURCE[0]}")" || exit 1

command -v jq >/dev/null 2>&1 || {
    echo "нужен jq"
    exit 1
}

# Та же причина, что и в обвязке: прогон бывает запущен изнутри живого захода, и набор обязан
# судить фикстуру, а не ввод той сессии.
unset RT_HOOK_INPUT RT_HOOK_TOOL RT_HOOK_CMD RT_HOOK_FILE RT_HOOK_CWD RT_HOOK_PARSED

# Where the push names its base and the package change against it is scenario files alone, only
# those files run: nothing they judge changed. Any other path of the package runs every suite.
suites="$(ls *.test.sh)"
if [ -n "${RT_SUITES_BASE:-}" ]; then
    changed="$(git diff --name-only --no-renames "$RT_SUITES_BASE...HEAD" -- .. 2>/dev/null)"
    if [ -n "$changed" ] && ! printf '%s\n' "$changed" | grep -qv '^projects/agent-kit/tests/[^/]*\.test\.sh$'; then
        suites="$(printf '%s\n' "$changed" | sed 's#^projects/agent-kit/tests/##' | while read -r f; do [ -f "$f" ] && printf '%s\n' "$f"; done)"
        echo "only the changed scenario files against $RT_SUITES_BASE: $(printf '%s ' $suites)"
    fi
fi

# The suites are independent and run side by side: one after another they took 1018 seconds on
# 13.11.2026, the longest step of the push set. Each writes into a file of its own, and the verdict
# is read in the former order.
jobs="${RT_SUITES_JOBS:-8}"
outdir="$(mktemp -d)"
trap 'rm -rf "$outdir"' EXIT
printf '%s\n' $suites | xargs -P "$jobs" -I{} bash -c 'bash "$1" > "$2/$1.out" 2>&1; echo $? > "$2/$1.code"' _ {} "$outdir"

failed=0
red=""
lines=""
for suite in $suites; do
    # Вывод набора идёт и на экран, и в память: строки провалов печатаются ещё раз в конце.
    out="$(cat "$outdir/$suite.out" 2>/dev/null)"
    [ "$(cat "$outdir/$suite.code" 2>/dev/null)" = 0 ] || {
        failed=$((failed + 1))
        red="$red $suite"
        lines="$lines
  $suite
$(printf '%s\n' "$out" | grep -E '^\s+FAIL ')"
    }
    printf '%s\n\n' "$out"
done

if [ "$failed" -eq 0 ]; then
    echo "ВСЕ НАБОРЫ ЗЕЛЁНЫЕ"
    exit 0
fi

# Имена красных печатаются последней строкой. Гейт пуша показывает хвост вывода, и без этой
# строки отказ называл число наборов, но не их: искать красный приходилось прогоном заново.
echo "НАБОРОВ С ПРОВАЛАМИ: $failed —$red"

# Сами провалы печатаются следом. Гейт пуша показывает только хвост вывода, а строки провала
# стоят в середине, за сотнями зелёных: без повтора отказ называл набор, но не сценарий, и
# разбор начинался с прогона заново — в окружении, где красного и нет.
echo "ПРОВАЛЫ ПО СЦЕНАРИЯМ:$lines"
exit 1
