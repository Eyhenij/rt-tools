#!/usr/bin/env bash
# A run of all the sets over this tree's checks:
# `bash tools/tests/run.sh` (with VERBOSE=1 — with every scenario).
cd "$(dirname "${BASH_SOURCE[0]}")" || exit 1

failed=0
for suite in *.test.sh; do
    bash "$suite" || failed=$((failed + 1))
    echo
done

if [ "$failed" -eq 0 ]; then
    echo "ALL SETS ARE GREEN"
    exit 0
fi

echo "SETS WITH FAILURES: $failed"
exit 1
