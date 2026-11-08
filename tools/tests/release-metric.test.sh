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
report "SC-AK-1332 — метрика и направление проходят" "$(metric 'пустые отказы git-guard-push: вниз')" 0
report "SC-AK-1332 — строка встаёт сразу под заголовком новой версии" "$(sed -n 3p "$JOURNAL")" "**Метрика выпуска:** пустые отказы git-guard-push, вниз"
report "SC-AK-1332 — заголовок старой версии строку не получает" "$(grep -c 'Метрика выпуска' "$JOURNAL")" 1

journal
report "SC-AK-1332 — выпуск без такой правки называет причину" "$(metric 'нет: только починки')" 0
report "SC-AK-1332 — причина попадает в журнал" "$(sed -n 3p "$JOURNAL")" "**Метрика выпуска:** нет. только починки"

journal
report "SC-AK-1332 — пустое поле отказано" "$(metric '')" 1
report "SC-AK-1332 — поле из пробелов отказано" "$(metric '   ')" 1
report "SC-AK-1332 — метрика без направления отказана" "$(metric 'пустые отказы')" 1
report "SC-AK-1332 — чужое направление отказано" "$(metric 'пустые отказы: лучше')" 1
report "SC-AK-1332 — метрика, которой нет в отчётах, отказана" "$(metric 'настроение: вверх')" 1
report "SC-AK-1332 — знак вместо метрики отказан" "$(metric '?: вверх')" 1
report "SC-AK-1332 — слова после имени отказаны" "$(metric 'потери бессмыслица: вверх')" 1
report "SC-AK-1332 — фраза после имени отказана" "$(metric 'вес входа в рай: вниз')" 1
report "SC-AK-1332 — «нет» без причины отказано" "$(metric 'нет:')" 1
report "SC-AK-1332 — точка вместо причины отказана" "$(metric 'нет: .')" 1
report "SC-AK-1332 — отказ журнал не трогает" "$(grep -c 'Метрика выпуска' "$JOURNAL")" 0

# A heading without a link: the line goes under the newest version, not under the first with a link.
printf '## 1.3.0 (2026-11-08)\n\n- fix three\n\n# [1.2.0](https://example.invalid/compare) (2026-11-07)\n' > "$JOURNAL"
report "SC-AK-1332 — заголовок без ссылки узнаётся" "$(metric 'потери: вниз')" 0
report "SC-AK-1332 — строка встаёт под заголовком без ссылки" "$(sed -n 3p "$JOURNAL")" "**Метрика выпуска:** потери, вниз"

# The names as the columns show them.
journal
report "SC-AK-1332 — столбец «Минут впустую» проходит" "$(metric 'Минут впустую: вниз')" 0
journal
report "SC-AK-1332 — столбец «Отказов после загрузки» проходит" "$(metric 'Отказов после загрузки: вниз')" 0

# The release run itself cannot be run without publishing, so its text is what is read here.
WORKFLOW="$TOOLS/../.github/workflows/publish-agent-kit.yml"
FIELD="$(grep -A3 '^ *metric:$' "$WORKFLOW")"
CALL="$(grep -n 'node tools/release-metric.mjs' "$WORKFLOW" | head -1 | cut -d: -f1)"
BUILD="$(grep -n 'name: Build agent-kit' "$WORKFLOW" | head -1 | cut -d: -f1)"
report "SC-AK-1332 — поле запуска обязательно" "$(printf '%s\n' "$FIELD" | grep -c 'required: true')" 1
report "SC-AK-1332 — у поля нет значения по умолчанию" "$(printf '%s\n' "$FIELD" | grep -c 'default:')" 0
report "SC-AK-1332 — команда стоит до сборки" "$([ "${CALL:-999}" -lt "${BUILD:-0}" ] && echo yes)" yes

suite_result "the metric of a package release"
[ "$FAILED" -eq 0 ]
