#!/usr/bin/env bash
# Сценарии гарда поставки: пять промахов самого вызова заявки отказаны и у задачи эпика.
#
# Строки таблицы решений об этих промахах стояли на «задача не в эпике», и гард молчал о плохом
# заголовке, чужом номере, себе-рецензенте, черновике без прогона и теле без раздела у каждой
# задачи эпика. В хостинг набор не ходит: состояние задачи отвечает профиль фикстуры.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард поставки: пять классов заявки у задачи эпика"

DC_REPO="$(fixture_repo_branched main RT-1921-epic)"
trap 'rm -rf "$DC_REPO"' EXIT
fixture_commit "$DC_REPO" "docs/plans/epic.md" "план эпика" "docs: план эпика"
git -C "$DC_REPO" update-ref refs/remotes/origin/main "$(git -C "$DC_REPO" rev-parse main)"
git -C "$DC_REPO" update-ref refs/remotes/origin/RT-1921-epic "$(git -C "$DC_REPO" rev-parse HEAD)"
git -C "$DC_REPO" checkout -q -b RT-1925-work
mkdir -p "$DC_REPO/.claude/rt-kit" "$DC_REPO/.github"
cat > "$DC_REPO/.claude/rt-kit/project.sh" <<'PROFILE'
rt_task_state() { printf '%s' "$DC_TASK_STATE"; }
rt_pull_token_login() { printf '%s' "$DC_LOGIN"; }
rt_conflicting_pulls() { :; }
RT_PULL_TOKEN_VAR=GH_TOKEN
RT_PULL_BODY_SECTION='^## Оставшийся шаг$'
RT_TASK_BOT=bot
PROFILE
printf '{"pushGate":{"pipelineFile":".github/ci.yml"}}\n' > "$DC_REPO/.claude/rt-kit/checks.json"
printf 'on:\n  pull_request:\n    branches: [main]\n' > "$DC_REPO/.github/ci.yml"

DC_EPIC='{"exists":true,"open":true,"onBoard":true,"assigned":true,"numbered":true,"epic":"1921"}'
DC_ALONE='{"exists":true,"open":true,"onBoard":true,"assigned":true,"numbered":true,"epic":null}'

# Решение гарда и его довод одной строкой: «deny · <слова>» или «прошло».
#   dc <состояние задачи> <логин> <хвост вызова после gh pr create>
dc() {
    jq -n --arg c "GH_TOKEN=\$T gh pr create $3" --arg d "$DC_REPO" \
        '{session_id:"tests",tool_name:"Bash",tool_input:{command:$c},cwd:$d}' \
        | (cd "$DC_REPO" && CLAUDE_PROJECT_DIR="$DC_REPO" DC_TASK_STATE="$1" DC_LOGIN="$2" \
            "$HOOKS/git-guard-delivery.sh" 2>/dev/null) \
        | jq -r '"\(.hookSpecificOutput.permissionDecision) · \(.hookSpecificOutput.permissionDecisionReason)"' 2>/dev/null \
        | tr '\n' ' '
}
says() { printf '%s' "$1" | grep -qF "deny · " && printf '%s' "$1" | grep -qF "$2" && echo отказ || echo "${1:-прошло}"; }

BODY="--body 'тело
## Оставшийся шаг
не осталось'"
for kind in эпик вне; do
    if [ "$kind" = эпик ]; then state="$DC_EPIC" base="--base RT-1921-epic"; else state="$DC_ALONE" base="--base main"; fi
    report "SC-AK-1937 — $kind: верная заявка проходит" "$(dc "$state" bot "$base --title '[RT-1925] Что-то' $BODY")" ''
    report "SC-AK-1937 — $kind: заголовок без номера отказан" \
        "$(says "$(dc "$state" bot "$base --title 'Что-то' $BODY")" 'does not start with the number')" отказ
    report "SC-AK-1937 — $kind: чужой номер отказан" \
        "$(says "$(dc "$state" bot "$base --title '[RT-7] Что-то' $BODY")" 'carries the number 7')" отказ
    report "SC-AK-1937 — $kind: автор рецензентом отказан" \
        "$(says "$(dc "$state" bot "$base --title '[RT-1925] Что-то' --reviewer bot $BODY")" 'the same one is named as its reviewer')" отказ
    report "SC-AK-1937 — $kind: тело без раздела отказано" \
        "$(says "$(dc "$state" bot "$base --title '[RT-1925] Что-то' --body 'тело'")" 'no section about the remaining step')" отказ
done
report "SC-AK-1937 — эпик: черновик в базу без прогона отказан" \
    "$(says "$(dc "$DC_EPIC" bot "--draft --base RT-1921-epic --title '[RT-1925] Что-то' $BODY")" 'the draft will wait for nothing')" отказ

# Отставшая ветка эпика вместе с плохим заголовком: отказ один и называет оба промаха.
git -C "$DC_REPO" checkout -q RT-1921-epic
fixture_commit "$DC_REPO" "docs/plans/more.md" "эпик ушёл вперёд" "docs: эпик ушёл вперёд"
git -C "$DC_REPO" update-ref refs/remotes/origin/RT-1921-epic "$(git -C "$DC_REPO" rev-parse HEAD)"
git -C "$DC_REPO" checkout -q RT-1925-work
got="$(dc "$DC_EPIC" bot "--base RT-1921-epic --title 'Что-то' $BODY")"
report "SC-AK-1937 — отставшая база эпика и заголовок названы одним отказом" \
    "$(says "$got" 'does not start with the number')/$(says "$got" 'has moved ahead by')" 'отказ/отказ'

suite_result "пять классов заявки у задачи эпика"
