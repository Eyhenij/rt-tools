#!/usr/bin/env bash
# Сценарии гарда поставки: вызов подставляет токен машинной записи, а хостинг отвечает другой
# записью. Прежде это была строка в потоке ошибок, и заявка выходила от человека.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард поставки: запись за подстановкой токена"

TA_REPO="$(fixture_repo RT-1941-token)"
trap 'rm -rf "$TA_REPO"' EXIT
mkdir -p "$TA_REPO/.claude/rt-kit"
cat > "$TA_REPO/.claude/rt-kit/project.sh" <<'PROFILE'
RT_TASK_BOT="${TA_BOT-машинная}"
RT_PULL_TOKEN_VAR=GH_TOKEN
RT_PULL_TOKEN_HINT='GH_TOKEN="$(cat ~/.config/token)"'
rt_pull_token_login() { printf '%s' "$TA_LOGIN"; }
PROFILE

# Решение и довод: «deny · <слова>», пусто — прошло.
ta() {
    input_cmd "$2 --title \"[RT-1941] Сделано\" --reviewer третий --body x" Bash "$TA_REPO" \
        | CLAUDE_PROJECT_DIR="$TA_REPO" TA_LOGIN="$1" "$HOOKS/git-guard-delivery.sh" 2>/dev/null \
        | jq -r '"\(.hookSpecificOutput.permissionDecision) · \(.hookSpecificOutput.permissionDecisionReason)"' 2>/dev/null | tr '\n' ' '
}
OPEN='gh pr'' create'

got="$(ta владелец "GH_TOKEN=\$(cat ~/.config/token) $OPEN")"
report "SC-AK-1938 — подстановка есть, ответила чужая запись — отказ" "$(printf '%s' "$got" | grep -c '^deny · ')" 1
report "SC-AK-1938 — отказ называет обе записи и готовую подстановку" \
    "$(printf '%s' "$got" | grep -c '«владелец».*«машинная».*GH_TOKEN="$(cat ~/.config/token)"')" 1
report "SC-AK-1938 — ответила машинная запись — заявка проходит" "$(ta машинная "GH_TOKEN=\$(cat ~/.config/token) $OPEN")" ''
report "SC-AK-1938 — без подстановки чужая запись проходит, как прежде" "$(ta владелец "$OPEN")" ''
report "SC-AK-1938 — подстановка за проверкой файла читается так же" \
    "$(ta владелец "test -s ~/.config/token && GH_TOKEN=\"\$(cat ~/.config/token)\" $OPEN" | grep -c '^deny · ')" 1
report "SC-AK-1938 — дерево без машинной записи не судится" \
    "$(TA_BOT='' ta владелец "GH_TOKEN=\$(cat ~/.config/token) $OPEN")" ''

suite_result "запись за подстановкой токена"
