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

failed=0
for suite in *.test.sh; do
    bash "$suite" || failed=$((failed + 1))
    echo
done

if [ "$failed" -eq 0 ]; then
    echo "ВСЕ НАБОРЫ ЗЕЛЁНЫЕ"
    exit 0
fi

echo "НАБОРОВ С ПРОВАЛАМИ: $failed"
exit 1
