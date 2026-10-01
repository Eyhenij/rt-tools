#!/usr/bin/env bash
# Сценарии проверки пропуска хуков гита: коммит и отправка с ключом, который глушит хуки, с
# путём хуков в другом месте и с выключенным запускателем хуков отбиваются; те же команды без
# пропуска, сухой прогон отправки и сообщение, где этот ключ назван текстом, проходят.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверка пропуска хуков гита"

REPO="$(fixture_repo RT-7-probe)"
export CLAUDE_PROJECT_DIR="$REPO"
cleanup() { rm -rf "$REPO"; }
trap cleanup EXIT

g() { expect_decision "$1" git-guard-no-verify.sh "$(input_cmd "$2" "${3:-Bash}" "$REPO")" "$4"; }

# --- SC-AK-1170. Коммит и отправка в обход хуков отбиваются ------------------------------------
g "SC-AK-1170 — коммит с полным ключом" 'git commit --no-verify -m fix' Bash deny
g "SC-AK-1170 — правка последнего коммита с ключом" 'git commit --amend --no-verify -F msg.txt' Bash deny
g "SC-AK-1170 — сокращение ключа" 'git commit --no-verif -m fix' Bash deny
g "SC-AK-1170 — короткий ключ у коммита" 'git commit -n -m fix' Bash deny
g "SC-AK-1170 — короткий ключ в связке" 'git commit -anm fix' Bash deny
g "SC-AK-1170 — отправка с ключом" 'git push --no-verify origin RT-7-probe' Bash deny
g "SC-AK-1170 — путь хуков в другом месте" 'git -c core.hooksPath=/dev/null commit -m fix' Bash deny
g "SC-AK-1170 — запускатель хуков выключен" 'HUSKY=0 git push origin RT-7-probe' Bash deny
g "SC-AK-1170 — полный путь к git" '/usr/bin/git commit --no-verify -m fix' Bash deny
g "SC-AK-1170 — ключ между git и глаголом" 'git -C . commit --no-verify -m fix' Bash deny
g "SC-AK-1170 — составная команда" 'git add a.txt && git commit --no-verify -m fix' Bash deny
g "SC-AK-1170 — из терминала среды" 'git push --no-verify' mcp__webstorm__execute_terminal_command deny
g "SC-AK-1170 — вложенный вызов" 'execute_terminal_command --command "git commit --no-verify -m fix"' mcp__webstorm__execute_tool deny

# --- SC-AK-1171. Отказ называет форму пропуска и обхода не предлагает ---------------------------
out="$(input_cmd 'git commit --amend --no-verify -m fix' Bash "$REPO" | "$HOOKS/git-guard-no-verify.sh" 2>/dev/null)"
text="$(printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecisionReason' 2>/dev/null)"
printf '%s' "$text" | grep -q 'git commit --no-verify' \
    && report "SC-AK-1171 — отказ называет форму пропуска" deny deny \
    || report "SC-AK-1171 — отказ называет форму пропуска" PASS deny
printf '%s' "$text" | grep -q 'There is no lawful form of bypass' \
    && report "SC-AK-1171 — законного обхода нет" deny deny \
    || report "SC-AK-1171 — законного обхода нет" PASS deny

# --- SC-AK-1172. Что проходит -------------------------------------------------------------------
g "SC-AK-1172 — коммит без пропуска" 'git commit -m fix' Bash PASS
g "SC-AK-1172 — правка последнего коммита без пропуска" 'git commit --amend -F msg.txt' Bash PASS
g "SC-AK-1172 — сухой прогон отправки" 'git push -n origin RT-7-probe' Bash PASS
g "SC-AK-1172 — ключ назван в сообщении" "git commit -m 'хук запрещает --no-verify'" Bash PASS
g "SC-AK-1172 — буква n в тексте сообщения" 'git commit -m -n' Bash PASS
g "SC-AK-1172 — чтение истории с ключом" "git log --grep '--no-verify' --oneline" Bash PASS
g "SC-AK-1172 — другой глагол с тем же ключом" 'git am --no-verify patch.mbox' Bash PASS
g "SC-AK-1172 — чужая настройка у git" 'git -c commit.gpgsign=false commit -q -F msg.txt' Bash PASS
g "SC-AK-1172 — сборка проверке безразлична" 'pnpm exec nx build site' Bash PASS

# --- Ломаный вход — пропуск --------------------------------------------------------------------
printf '' | "$HOOKS/git-guard-no-verify.sh" >/dev/null 2>&1
report "пустой вход пропускается" "код:$?" "код:0"

suite_result "проверка пропуска хуков гита"
