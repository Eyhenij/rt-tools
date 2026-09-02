#!/usr/bin/env bash
# Сценарии личности вызова: чьей учётной записью открывается заявка и по какому признаку гард
# вообще узнаёт в команде своё дело.
#
# Отделено от набора о форме имени ветки и разборе папки задачи: тот перерос предел длины файла.
# Делить его по точкам гарда — единственный способ, при котором соседний сценарий не приходится
# искать чтением всего набора, а личность вызова точка отдельная и самодостаточная.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "личность вызова"

# --- личность вызова, открывающего заявку -------------------------------------------------------
# Клиент хостинга держит две записи сразу, и какая откроет заявку, из текста команды видно только
# по явной подстановке токена. Промах всплывает шагом позже — на назначении ревьювера, — и чинится
# переоткрытием: автора у заявки не сменить.
#
# Команда собирается переменной, а не пишется строкой: набор читает тот же гард поставки, и
# написанная целиком, она отбивает правку этого файла как настоящее открытие заявки.
OPEN='gh pr'' create'

TOKEN_PR="$(fixture_repo RT-74-token)"
mkdir -p "$TOKEN_PR/.claude/rt-kit"
printf 'RT_PULL_TOKEN_VAR="GH_TOKEN"\nRT_PULL_TOKEN_HINT="GH_TOKEN=$(cat ~/.config/token)"\n' \
    > "$TOKEN_PR/.claude/rt-kit/project.sh"

pr_token() {
    local label="$1" cmd="$2" want="$3" out
    out="$(CLAUDE_PROJECT_DIR="$TOKEN_PR" input_cmd "$cmd" Bash "$TOKEN_PR" \
        | CLAUDE_PROJECT_DIR="$TOKEN_PR" "$HOOKS/git-guard-delivery.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.permissionDecision // "PASS"' 2>/dev/null)"
    report "$label" "${out:-PASS}" "$want"
}

pr_token "SC-AK-480 — заявка без подстановки токена отбивается" \
    "$OPEN --title \"[RT-74] Сделано\" --body x" deny
pr_token "SC-AK-481 — заявка с подстановкой токена проходит" \
    "GH_TOKEN=\$TOKEN $OPEN --title \"[RT-74] Сделано\" --body x" PASS
pr_token "SC-AK-482 — токен, выставленный отдельной строкой, засчитывается" \
    "export GH_TOKEN=\$(cat ~/.config/token); $OPEN --title \"[RT-74] Сделано\" --body x" PASS

CLAUDE_PROJECT_DIR="$TOKEN_PR" expect_reason "SC-AK-483 — отказ называет переменную токена" \
    git-guard-delivery.sh \
    "$(input_cmd "$OPEN --title \"[RT-74] Сделано\" --body x" Bash "$TOKEN_PR")" \
    'GH_TOKEN'
rm -rf "$TOKEN_PR"

# --- SC-AK-842. Второй ярус: кто придёт по токену на самом деле --------------------------------
# Подстановка в команде говорит о намерении, а не об исходе: она читает файл, а файла на машине
# может не быть — тогда клиент отвечает от залогиненной записи, и заявка выходит от владельца при
# верной с виду команде. Дерево спрашивает это у хостинга само: пакет ни клиента, ни пути к
# токену не знает.
ASK_PR="$(fixture_repo RT-1695-ask)"
mkdir -p "$ASK_PR/.claude/rt-kit"

ask_profile() {
    {
        printf 'RT_TASK_BOT="машинная"\n'
        printf 'RT_PULL_TOKEN_VAR="GH_TOKEN"\n'
        printf 'RT_PULL_TOKEN_HINT="GH_TOKEN=$(cat ~/.config/token)"\n'
        printf 'rt_pull_token_login() { printf "%%s" "%s"; }\n' "$1"
    } > "$ASK_PR/.claude/rt-kit/project.sh"
}
ask_pr() {
    local label="$1" want="$2" out
    out="$(CLAUDE_PROJECT_DIR="$ASK_PR" input_cmd "GH_TOKEN=\$TOKEN $OPEN --title \"[RT-1695] Сделано\" --body x" Bash "$ASK_PR" \
        | CLAUDE_PROJECT_DIR="$ASK_PR" "$HOOKS/git-guard-delivery.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.permissionDecision // "PASS"' 2>/dev/null)"
    report "$label" "${out:-PASS}" "$want"
}

ask_profile "машинная"
ask_pr "SC-AK-842 — логин машинной записи вызов пропускает" PASS

ask_profile "владелец"
ask_pr "SC-AK-842 — чужой логин вызов отбивает" deny
CLAUDE_PROJECT_DIR="$ASK_PR" expect_reason "SC-AK-842 — отказ называет обе записи" \
    git-guard-delivery.sh \
    "$(input_cmd "GH_TOKEN=\$TOKEN $OPEN --title \"[RT-1695] Сделано\" --body x" Bash "$ASK_PR")" \
    'владелец.*машинная'

# Спросить не удалось — вызов проходит, и гард говорит об этом вслух: молчаливый пропуск здесь
# неотличим от сошедшейся сверки.
ask_profile ""
ask_pr "SC-AK-843 — пустой ответ работу не заклинивает" PASS
said="$(CLAUDE_PROJECT_DIR="$ASK_PR" input_cmd "GH_TOKEN=\$TOKEN $OPEN --title \"[RT-1695] Сделано\" --body x" Bash "$ASK_PR" \
    | CLAUDE_PROJECT_DIR="$ASK_PR" "$HOOKS/git-guard-delivery.sh" 2>&1 >/dev/null)"
case "$said" in
    *'спросить не удалось'*) report "SC-AK-843 — пропуск назван вслух" да да ;;
    *) report "SC-AK-843 — пропуск назван вслух" "$said" да ;;
esac

# Дерево без машинной записи второго яруса не получает: сверять ответ не с чем.
{
    printf 'RT_PULL_TOKEN_VAR="GH_TOKEN"\n'
    printf 'rt_pull_token_login() { printf "%%s" "владелец"; }\n'
} > "$ASK_PR/.claude/rt-kit/project.sh"
ask_pr "SC-AK-843 — без машинной записи ярус молчит" PASS
rm -rf "$ASK_PR"

# Дерево без машинной записи требования не получает: у него личность вызова ничего не значит.
NO_TOKEN_PR="$(fixture_repo RT-75-notoken)"
mkdir -p "$NO_TOKEN_PR/.claude/rt-kit"
printf 'RT_PULL_TOKEN_VAR=""\n' > "$NO_TOKEN_PR/.claude/rt-kit/project.sh"
out="$(CLAUDE_PROJECT_DIR="$NO_TOKEN_PR" input_cmd "$OPEN --title \"[RT-75] Сделано\" --body x" Bash "$NO_TOKEN_PR" \
    | CLAUDE_PROJECT_DIR="$NO_TOKEN_PR" "$HOOKS/git-guard-delivery.sh" 2>/dev/null \
    | jq -r '.hookSpecificOutput.permissionDecision // "PASS"' 2>/dev/null)"
report "SC-AK-484 — дерево без машинной записи автора не судит" "${out:-PASS}" PASS
rm -rf "$NO_TOKEN_PR"

# Второй ярус: автора заявки называет хостинг, и спрашивается он на снятии черновика — последнем
# ходе, где промах ещё исправим. Сети набор не знает, поэтому состояние заявки подменяется
# профилем дерева-пробы: судится решение гарда, а не работа клиента хостинга.
AUTHOR_PR="$(fixture_repo RT-76-author)"
mkdir -p "$AUTHOR_PR/.claude/rt-kit"
author_profile() {
    printf 'RT_TASK_BOT="bot"\nRT_PULL_TOKEN_HINT="GH_TOKEN=$(cat ~/.config/token)"\n' \
        > "$AUTHOR_PR/.claude/rt-kit/project.sh"
    printf 'rt_pull_state() { printf "%%s" %s; }\n' "'{\"exists\":true,\"number\":9,\"draft\":true,\"reviewed\":true,\"conflicting\":false,\"author\":\"$1\"}'" \
        >> "$AUTHOR_PR/.claude/rt-kit/project.sh"
}

ready_author() {
    local label="$1" want="$2" out
    out="$(CLAUDE_PROJECT_DIR="$AUTHOR_PR" input_cmd 'gh pr ready 9' Bash "$AUTHOR_PR" \
        | CLAUDE_PROJECT_DIR="$AUTHOR_PR" "$HOOKS/git-guard-delivery.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.permissionDecision // "PASS"' 2>/dev/null)"
    report "$label" "${out:-PASS}" "$want"
}

author_profile owner
ready_author "SC-AK-485 — черновик не снимается с заявки, открытой не машинной записью" deny
CLAUDE_PROJECT_DIR="$AUTHOR_PR" expect_reason "SC-AK-486 — отказ называет обе записи и переоткрытие" \
    git-guard-delivery.sh \
    "$(input_cmd 'gh pr ready 9' Bash "$AUTHOR_PR")" \
    'открой заново'

author_profile bot
ready_author "SC-AK-487 — заявка машинной записи черновик снимает" PASS
rm -rf "$AUTHOR_PR"

suite_result "личность вызова"
