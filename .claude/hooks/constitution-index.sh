#!/usr/bin/env bash
# SessionStart entrance for the law layer laid out by @rt-tools/agent-kit.
#
# A law file in docs/constitution/ pulls nothing into context on its own — it is read only when
# someone goes for it. This hook emits the index (file name + its H1) once per session so the
# layer is known to exist and can be opened when a decision touches it.
#
# The index is READ FROM THE DIRECTORY, never hardcoded: a hand-written list would drift from
# what `agent-kit sync` actually laid out, and nothing would report the gap.
#
# FAIL-OPEN: on any error the session starts with no extra context (exit 0). A broken entrance
# must never wedge a session.

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
ЗАКОНЫ ПРОЕКТА (слой @rt-tools/agent-kit, разложен в docs/constitution/).

Закон говорит, ЧТО должно быть верно, и не знает ни путей, ни имён файлов. Правило — чем это
названо в этом дереве — живёт в .claude/skills/. Закон не отменяет скилл и не заменяется им:
перед решением, которое закон задевает, читается закон целиком, скилл — как обычно.

${index}
Разложенные файлы правятся не руками, а надстройкой в .claude/rt-kit/overrides/<ресурс>:
правка на месте теряется на следующем \`agent-kit sync\`, и он на неё отказывает. Сверить
разложенное с пакетом: \`pnpm run agent-kit:check\`.
EOF

jq -n --arg c "$context" '{hookSpecificOutput:{hookEventName:"SessionStart",additionalContext:$c}}' 2>/dev/null || exit 0

exit 0
