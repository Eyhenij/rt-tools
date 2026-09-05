#!/usr/bin/env bash
# Прогон всех наборов по проверкам этого дерева:
# `bash tools/tests/run.sh` (с VERBOSE=1 — с каждым сценарием).
cd "$(dirname "${BASH_SOURCE[0]}")" || exit 1

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
