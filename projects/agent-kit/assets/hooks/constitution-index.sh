#!/usr/bin/env bash
# rt-hook: SessionStart startup|resume|compact|clear
# Вход в слой законов. SessionStart.
#
# Файл закона сам по себе не приносит в контекст ничего — его читают, только когда за ним
# пошли. Хук печатает указатель (имя файла и его заголовок) один раз за сессию: слой известен,
# что существует, и открывается, когда решение его задевает.
#
# Указатель ЧИТАЕТСЯ ИЗ КАТАЛОГА, а не выписан руками: выписанный разошёлся бы с тем, что
# разложено на самом деле, и сказать об этом было бы нечем.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: любая ошибка начинает сессию без добавленного контекста (exit 0).
# Сломанный вход не имеет права остановить сессию.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

dir="${CLAUDE_PROJECT_DIR:-.}/docs/constitution"
[ -d "$dir" ] || exit 0

index=""
for law in "$dir"/*.md; do
    [ -f "$law" ] || continue
    title="$(grep -m1 '^# ' "$law" 2>/dev/null | sed 's/^# //')"
    [ -z "$title" ] && continue
    index="${index}  docs/constitution/$(basename "$law") — ${title}"$'\n'
done
[ -z "$index" ] && exit 0

read -r -d '' context <<EOF
PROJECT LAWS (the @rt-tools/agent-kit layer, laid out in docs/constitution/).

A law says WHAT must be true and knows neither paths nor file names. A rule — by which
technique it is done — lives in .claude/skills/, and the names of this tree next to it are in
implementation.md alongside. A law does not cancel a rule and is not replaced by it: before a
decision the law touches, the law is read in full, the rule as usual.

${index}
Laid-out files are edited not by hand but through the override in .claude/rt-kit/overrides/<resource>:
an in-place edit is lost on the next \`agent-kit sync\`, and sync refuses it. Check the laid-out
files against the package: \`agent-kit sync --check\`.
EOF

jq -n --arg c "$context" '{hookSpecificOutput:{hookEventName:"SessionStart",additionalContext:$c}}' 2>/dev/null || exit 0

exit 0
