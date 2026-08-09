#!/usr/bin/env bash
# Сценарии гардов поставки: коммит в главную ветку и заведение ветки с заявкой на слияние.
#
# Ярус состояния задачи здесь не проверяется: он требует сети и помощника очереди работ, а
# набор обязан идти одинаково на любой машине. Проверяется то, что читается из текста команды:
# разбор командной строки, вложенные вызовы, форма имени ветки и совпадение номеров.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гарды поставки"

# Два репозитория — на главной ветке и на рабочей: гард смотрит ветку в каталоге, откуда пойдёт
# команда, и без своих репозиториев ожидания зависели бы от ветки рабочего дерева.
REPO_MAIN="$(fixture_repo main)"
REPO_WORK="$(fixture_repo RT-7-probe)"
export CLAUDE_PROJECT_DIR="$REPO_WORK"
cleanup() { rm -rf "$REPO_MAIN" "$REPO_WORK"; }
trap cleanup EXIT

m() { expect_decision "$1" git-guard-main.sh "$(input_cmd "$3" "${4:-Bash}" "$2")" "$5"; }

# --- коммит в главную ветку ---------------------------------------------------------------
m "коммит на главной" "$REPO_MAIN" 'git commit -m "chore: x"' Bash deny
m "коммит на главной из терминала среды" "$REPO_MAIN" 'git commit -m "chore: x"' mcp__webstorm__execute_terminal_command deny
m "коммит на рабочей ветке" "$REPO_WORK" 'git commit -m "chore: x"' Bash PASS
m "сборка гарду безразлична" "$REPO_MAIN" 'pnpm exec nx build site' Bash PASS
m "чтение истории на главной" "$REPO_MAIN" 'git log --oneline -5' Bash PASS

# Составная команда отклоняется целиком: ветки в ней ещё нет на момент разбора, и «завести и
# сразу коммитить» прошло бы мимо гарда, оставаясь коммитом в главную.
m "составная команда с заведением ветки" "$REPO_MAIN" 'git checkout -b RT-8-x && git commit -m "x"' Bash deny

# Универсальный исполнитель прячет настоящую команду во вложенной строке.
m "вложенный вызов в кавычках" "$REPO_MAIN" 'execute_terminal_command --command "git commit -m x"' mcp__webstorm__execute_tool deny
m "вложенный вызов в одинарных кавычках" "$REPO_MAIN" "execute_terminal_command --command 'git commit -m x'" mcp__webstorm__execute_tool deny

# --- форма имени ветки ---------------------------------------------------------------------
d() { expect_decision "$1" git-guard-delivery.sh "$(input_cmd "$2" "${4:-Bash}" "$REPO_WORK")" "$3"; }

d "ветка с ключом и номером" 'git checkout -b RT-9-guest-token' PASS
d "то же через switch" 'git switch -c RT-9-guest-token' PASS
d "заглавные буквы в хвосте" 'git checkout -b RT-9-GuestToken' deny
d "пробел вместо дефиса после номера" 'git checkout -b RT-9_guest' deny
# Имя без номера законно, пока ветка живёт локально: заявка с неё не откроется.
d "ветка под пробу без номера" 'git checkout -b probe-idea' PASS
d "переключение на существующую ветку" 'git checkout main' PASS

# --- заявка на слияние -----------------------------------------------------------------------
# Заявка с беззадачной ветки — единственное место, где локальная ветка без номера упирается.
NO_TASK="$(fixture_repo probe-idea)"
out="$(input_cmd 'gh pr create --title "[RT-9] Готово" --body x' Bash "$NO_TASK" | "$HOOKS/git-guard-delivery.sh" 2>/dev/null \
    | jq -r '.hookSpecificOutput.permissionDecision // "PASS"' 2>/dev/null)"
report "заявка с ветки без задачи" "${out:-PASS}" deny
rm -rf "$NO_TASK"

d "заявка с номером, совпавшим с веткой" 'gh pr create --title "[RT-7] Сделано" --body x' PASS
d "заявка с чужим номером в заголовке" 'gh pr create --title "[RT-8] Сделано" --body x' deny
d "заявка без номера в заголовке" 'gh pr create --title "Сделано" --body x' deny
expect_reason "и отказ называет расхождение номеров" git-guard-delivery.sh \
    "$(input_cmd 'gh pr create --title "[RT-8] Сделано" --body x' Bash "$REPO_WORK")" 'номер 8.*у ветки'

# --- отказ в пользу работы ---------------------------------------------------------------------
for hook in git-guard-main.sh git-guard-delivery.sh; do
    printf '' | "$HOOKS/$hook" >/dev/null 2>&1
    report "пустой вход пропускается: $hook" "код:$?" "код:0"
    printf 'не json' | "$HOOKS/$hook" >/dev/null 2>&1
    report "неразбираемый вход пропускается: $hook" "код:$?" "код:0"
done

# Не репозиторий вовсе — пропуск: судить по ветке нечем.
BARE="$(mktemp -d)"
out="$(input_cmd 'git commit -m x' Bash "$BARE" | "$HOOKS/git-guard-main.sh" 2>/dev/null)"
[ -z "$out" ] && report "вне репозитория пропускается" PASS PASS || report "вне репозитория пропускается" deny PASS
rm -rf "$BARE"

suite_result "гарды поставки"
