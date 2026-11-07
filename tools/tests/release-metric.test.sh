#!/usr/bin/env bash
# The scenarios of the metric of a package release: the release does not start without one.
#
# Covers SC-AK-1332 of the spec `docs/specs/agent-kit/metrics`.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the metric of a package release"

WORK="$(fixture_tree)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

cp "$TOOLS/release-metric.mjs" "$WORK/tools/"
JOURNAL="$WORK/CHANGELOG.md"

journal() {
    printf '# [1.2.0](https://example.invalid/compare) (2026-11-08)\n\n### Bug Fixes\n\n- fix one\n\n## [1.1.0](https://example.invalid/compare) (2026-10-10)\n\n- fix two\n' > "$JOURNAL"
}

# Runs the command and prints its exit code.
metric() {
    (cd "$WORK" && node tools/release-metric.mjs "$JOURNAL" "$1" >/dev/null 2>&1; echo $?)
}

journal
report "SC-AK-1332 — метрика и направление проходят" "$(metric 'доля пустых отказов: вниз')" 0
report "SC-AK-1332 — строка встаёт сразу под заголовком новой версии" "$(sed -n 3p "$JOURNAL")" "**Метрика выпуска:** доля пустых отказов, вниз"
report "SC-AK-1332 — заголовок старой версии строку не получает" "$(grep -c 'Метрика выпуска' "$JOURNAL")" 1

journal
report "SC-AK-1332 — выпуск без такой правки называет причину" "$(metric 'нет: только починки')" 0
report "SC-AK-1332 — причина попадает в журнал" "$(sed -n 3p "$JOURNAL")" "**Метрика выпуска:** нет. только починки"

journal
report "SC-AK-1332 — пустое поле отказано" "$(metric '')" 1
report "SC-AK-1332 — поле из пробелов отказано" "$(metric '   ')" 1
report "SC-AK-1332 — метрика без направления отказана" "$(metric 'доля пустых отказов')" 1
report "SC-AK-1332 — чужое направление отказано" "$(metric 'доля пустых отказов: лучше')" 1
report "SC-AK-1332 — «нет» без причины отказано" "$(metric 'нет:')" 1
report "SC-AK-1332 — отказ журнал не трогает" "$(grep -c 'Метрика выпуска' "$JOURNAL")" 0

suite_result "the metric of a package release"
[ "$FAILED" -eq 0 ]
