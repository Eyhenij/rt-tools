#!/usr/bin/env bash
# Сценарии проверки разрушительных команд гита: `reset --hard`, `checkout --`, `restore` и
# `clean -f` при непустом рабочем дереве отбиваются с перечнем файлов; чистое дерево, `--soft`,
# чтение истории и команда с названной причиной проходят.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверка разрушительных команд гита"

# Два дерева: чистое и с незакоммиченной правкой отслеживаемого файла. Третье — с одним
# неотслеживаемым файлом: `clean` теряет именно его, а `reset --hard` его не трогает.
CLEAN="$(fixture_repo RT-7-probe)"
git -C "$CLEAN" add package.json && git -C "$CLEAN" -c user.name=t -c user.email=t@x commit -q -m init
DIRTY="$(fixture_repo RT-7-probe)"
git -C "$DIRTY" add package.json && git -C "$DIRTY" -c user.name=t -c user.email=t@x commit -q -m init
printf '{"name":"probe","edited":true}\n' > "$DIRTY/package.json"
UNTRACKED="$(fixture_repo RT-7-probe)"
git -C "$UNTRACKED" add package.json && git -C "$UNTRACKED" -c user.name=t -c user.email=t@x commit -q -m init
printf 'draft\n' > "$UNTRACKED/notes.txt"
export CLAUDE_PROJECT_DIR="$DIRTY"
cleanup() { rm -rf "$CLEAN" "$DIRTY" "$UNTRACKED"; }
trap cleanup EXIT

g() { expect_decision "$1" git-guard-discard.sh "$(input_cmd "$3" "${4:-Bash}" "$2")" "$5"; }

# --- SC-AK-1094. Разрушительная команда при непустом дереве отбивается --------------------------
g "SC-AK-1094 — reset --hard на грязном дереве" "$DIRTY" 'git reset --hard HEAD~1' Bash deny
g "SC-AK-1094 — reset --hard на sha" "$DIRTY" 'git reset --hard 2869e2b6c' Bash deny
g "SC-AK-1094 — checkout -- путь" "$DIRTY" 'git checkout -- package.json' Bash deny
g "SC-AK-1094 — checkout точки" "$DIRTY" 'git checkout .' Bash deny
g "SC-AK-1094 — restore пути" "$DIRTY" 'git restore package.json' Bash deny
g "SC-AK-1094 — из терминала среды" "$DIRTY" 'git reset --hard HEAD' mcp__webstorm__execute_terminal_command deny
g "SC-AK-1094 — вложенный вызов" "$DIRTY" 'execute_terminal_command --command "git reset --hard HEAD"' mcp__webstorm__execute_tool deny
g "SC-AK-1094 — ключ между git и глаголом" "$DIRTY" 'git -C . reset --hard HEAD' Bash deny
g "SC-AK-1094 — составная команда" "$DIRTY" 'git fetch && git reset --hard origin/main' Bash deny

# --- SC-AK-1095. Отказ называет файлы -----------------------------------------------------------
out="$(input_cmd 'git reset --hard HEAD' Bash "$DIRTY" | "$HOOKS/git-guard-discard.sh" 2>/dev/null)"
printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecisionReason' | grep -q 'package.json' \
    && report "SC-AK-1095 — отказ называет изменённый файл" deny deny \
    || report "SC-AK-1095 — отказ называет изменённый файл" PASS deny

# --- SC-AK-1096. clean судит неотслеживаемое, reset — нет --------------------------------------
g "SC-AK-1096 — clean -f при неотслеживаемом файле" "$UNTRACKED" 'git clean -f' Bash deny
g "SC-AK-1096 — clean -fd тоже" "$UNTRACKED" 'git clean -fd' Bash deny
g "SC-AK-1096 — reset --hard неотслеживаемого не трогает" "$UNTRACKED" 'git reset --hard HEAD' Bash PASS
g "SC-AK-1096 — clean без -f ничего не сносит" "$UNTRACKED" 'git clean -n' Bash PASS

# --- SC-AK-1097. Что проходит -----------------------------------------------------------------
g "SC-AK-1097 — чистое дерево" "$CLEAN" 'git reset --hard HEAD~1' Bash PASS
g "SC-AK-1097 — reset --soft правок не трогает" "$DIRTY" 'git reset --soft HEAD~1' Bash PASS
g "SC-AK-1097 — restore --staged только снимает с индекса" "$DIRTY" 'git restore --staged package.json' Bash PASS
g "SC-AK-1097 — checkout ветки" "$DIRTY" 'git checkout -b RT-9-probe' Bash PASS
g "SC-AK-1097 — чтение истории со словом hard" "$DIRTY" "git log --grep 'reset --hard' --oneline" Bash PASS
g "SC-AK-1097 — сборка гарду безразлична" "$DIRTY" 'pnpm exec nx build site' Bash PASS

# --- SC-AK-1098. Обход — причина в команде ------------------------------------------------------
g "SC-AK-1098 — причина строкой проходит" "$DIRTY" 'git reset --hard HEAD # discard: package.json — моя проба, не нужна' Bash PASS
g "SC-AK-1098 — пустая причина обходом не считается" "$DIRTY" 'git reset --hard HEAD # discard:' Bash deny

# --- Ломаный вход и не репозиторий — пропуск ---------------------------------------------------
printf '' | "$HOOKS/git-guard-discard.sh" >/dev/null 2>&1
report "пустой вход пропускается" "код:$?" "код:0"
BARE="$(mktemp -d)"
out="$(input_cmd 'git reset --hard HEAD' Bash "$BARE" | "$HOOKS/git-guard-discard.sh" 2>/dev/null)"
[ -z "$out" ] && report "вне репозитория пропускается" PASS PASS || report "вне репозитория пропускается" deny PASS
rm -rf "$BARE"

suite_result "проверка разрушительных команд гита"
