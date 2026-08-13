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

# --- разобранная папка задачи как условие слияния ----------------------------------------------
#
# Требование стоит на слиянии, а не на открытии заявки: до слияния папка ещё нужна — правка по
# замечаниям разбора идёт в ту же ветку, и без замысла на диске её отбивает гард хода работы.
# Судится содержимое ветки: снесённая, но не закоммиченная папка въехала бы вместе с ней.
mg() { expect_decision "$1" git-guard-delivery.sh "$(input_cmd "$3" Bash "$2")" "$4"; }

# Папка задачи лежит в ветке и уедет в главную.
LYING="$(fixture_repo_branched main RT-42-probe)"
fixture_commit "$LYING" docs/tasks/RT-42-probe/plan.md 'замысел' 'docs: замысел'
mg "SC-AK-12 — слияние с лежащей папкой задачи" "$LYING" 'gh pr merge 42 --merge' deny
expect_reason "SC-AK-12 — отказ называет саму папку" git-guard-delivery.sh \
    "$(input_cmd 'gh pr merge 42 --merge' Bash "$LYING")" 'docs/tasks/RT-42-probe'
# Открытие заявки той же папкой не отбивается — там ей ещё рано.
expect_hint "SC-AK-16 — открытие заявки папкой не отбивается" git-guard-delivery.sh \
    "$(input_cmd 'gh pr create --title "[RT-42] Сделано" --body x' Bash "$LYING")" 'docs/tasks/RT-42-probe'
# Обход из текста команды действует и тогда, когда очередь работ спросить некого.
mg "SC-AK-17 — обход с причиной в тексте команды" "$LYING" 'gh pr merge 42 --merge # Task-folder-skip: работа вливается частями' PASS
mg "SC-AK-18 — обход без причины обходом не считается" "$LYING" 'gh pr merge 42 --merge # Task-folder-skip:' deny
# Рабочее дерево гарду не указ: судится то, что уедет.
rm -rf "$LYING/docs/tasks/RT-42-probe"
mg "SC-AK-14 — удаление без коммита требование не проходит" "$LYING" 'gh pr merge 42 --merge' deny
rm -rf "$LYING"

# Упоминание команды в тексте командой не является. Гард сработал на правке этого же файла:
# в тексте стояло `gh pr merge`, и он выдал напоминание там, где никто ничего не сливал.
UNRELATED="$(fixture_repo_branched main RT-48-probe)"
fixture_commit "$UNRELATED" docs/tasks/RT-48-probe/plan.md 'замысел' 'docs: замысел'
mg "упоминание команды внутри строки не считается слиянием" "$UNRELATED" \
    "printf '%s' 'в правиле написано: gh pr merge отбивается, пока папка лежит'" PASS
mg "имя файла, похожее на команду, не считается слиянием" "$UNRELATED" 'cat docs/gh-pr-merge-notes.md' PASS
rm -rf "$UNRELATED"

# Папка разобрана: снята веткой, и в архив что-то приехало.
DONE="$(fixture_repo_branched main RT-43-probe)"
fixture_commit "$DONE" docs/tasks/RT-43-probe/plan.md 'замысел' 'docs: замысел'
fixture_commit "$DONE" docs/archive/razbor.md 'что решали' 'docs: разбор в архив'
fixture_remove "$DONE" docs/tasks/RT-43-probe 'docs: папка разобрана'
mg "SC-AK-13 — слияние после разбора папки" "$DONE" 'gh pr merge 43 --merge' PASS
rm -rf "$DONE"

# Снос без прибыли в архиве: первым уходит разбор просьбы владельца.
WIPED="$(fixture_repo_branched main RT-44-probe)"
fixture_commit "$WIPED" docs/tasks/RT-44-probe/grill.md 'слова владельца' 'docs: разбор просьбы'
fixture_remove "$WIPED" docs/tasks/RT-44-probe 'docs: папка снесена'
mg "SC-AK-15 — папка удалена, а в архиве пусто" "$WIPED" 'gh pr merge 44 --merge' deny
expect_reason "SC-AK-15 — отказ называет каталог архива" git-guard-delivery.sh \
    "$(input_cmd 'gh pr merge 44 --merge' Bash "$WIPED")" 'docs/archive'
rm -rf "$WIPED"

# Работа, у которой папки не было вовсе, прибыли в архиве не должна.
BARE_TASK="$(fixture_repo_branched main RT-45-probe)"
fixture_commit "$BARE_TASK" src/probe.ts 'export const x = 1;' 'feat: правка'
mg "SC-AK-15 — ветка без папки задачи требования не получает" "$BARE_TASK" 'gh pr merge 45 --merge' PASS
rm -rf "$BARE_TASK"

# Форма имени ветки с косой: папка лежит вложенным каталогом, и находится она целиком.
NESTED="$(fixture_repo_branched main chore/46-probe)"
fixture_commit "$NESTED" docs/tasks/chore/46-probe/plan.md 'замысел' 'docs: замысел'
mg "SC-AK-19 — вложенная папка старой формы имени" "$NESTED" 'gh pr merge 46 --merge' deny
expect_reason "SC-AK-19 — отказ называет вложенный путь целиком" git-guard-delivery.sh \
    "$(input_cmd 'gh pr merge 46 --merge' Bash "$NESTED")" 'docs/tasks/chore/46-probe'
rm -rf "$NESTED"

# Дерево, не назвавшее каталога задач, требования не получает: ведение работы папкой —
# свойство дерева, а не пакета. Снимается это надстройкой профиля, а не переменной окружения:
# умолчание пакета подставляется через `:-` и пустое значение из окружения перебивает.
NO_TASKS_DIR="$(fixture_repo_branched main RT-47-probe)"
fixture_commit "$NO_TASKS_DIR" docs/tasks/RT-47-probe/plan.md 'замысел' 'docs: замысел'
mkdir -p "$NO_TASKS_DIR/.claude/rt-kit"
printf 'RT_TASKS_DIR=""\n' > "$NO_TASKS_DIR/.claude/rt-kit/project.sh"
out="$(CLAUDE_PROJECT_DIR="$NO_TASKS_DIR" input_cmd 'gh pr merge 47 --merge' Bash "$NO_TASKS_DIR" \
    | CLAUDE_PROJECT_DIR="$NO_TASKS_DIR" "$HOOKS/git-guard-delivery.sh" 2>/dev/null \
    | jq -r '.hookSpecificOutput.permissionDecision // "PASS"' 2>/dev/null)"
report "SC-AK-21 — дерево без каталога задач требования не получает" "${out:-PASS}" PASS
rm -rf "$NO_TASKS_DIR"

# --- главная ветка влита до открытия заявки ------------------------------------------------------
# Судится локальная вершина главной ветки: сети у гарда нет. Поэтому фикстура заводит
# `refs/remotes/origin/main` сама — ровно то, что видел бы гард после `git fetch`.

FRESH="$(fixture_repo_branched main RT-11-fresh)"
git -C "$FRESH" update-ref refs/remotes/origin/main main 2>/dev/null
expect_decision "SC-AK-84 — влитая главная ветка заявку пропускает" git-guard-delivery.sh \
    "$(input_cmd 'gh pr create --title "[RT-11] Сделано" --body x' Bash "$FRESH")" PASS
rm -rf "$FRESH"

STALE="$(fixture_repo_branched main RT-12-stale)"
git -C "$STALE" checkout -q main 2>/dev/null
fixture_commit "$STALE" docs/чужое.md 'правка соседней ветки' 'docs: чужая правка'
git -C "$STALE" update-ref refs/remotes/origin/main main 2>/dev/null
git -C "$STALE" checkout -q RT-12-stale 2>/dev/null
expect_decision "SC-AK-83 — заявка от разошедшейся ветки отбита" git-guard-delivery.sh \
    "$(input_cmd 'gh pr create --title "[RT-12] Сделано" --body x' Bash "$STALE")" deny
expect_reason "SC-AK-83 — отказ называет расхождение числом" git-guard-delivery.sh \
    "$(input_cmd 'gh pr create --title "[RT-12] Сделано" --body x' Bash "$STALE")" 'вперёд на 1 коммит'
expect_reason "SC-AK-83 — отказ называет, чем снимается" git-guard-delivery.sh \
    "$(input_cmd 'gh pr create --title "[RT-12] Сделано" --body x' Bash "$STALE")" 'git merge origin/main'
rm -rf "$STALE"

# Вершины главной ветки в дереве нет вовсе — судить не по чему, и гард не выдумывает отказа.
NO_REMOTE="$(fixture_repo_branched main RT-13-alone)"
expect_decision "заявки без вершины главной ветки гард не судит" git-guard-delivery.sh \
    "$(input_cmd 'gh pr create --title "[RT-13] Сделано" --body x' Bash "$NO_REMOTE")" PASS
rm -rf "$NO_REMOTE"

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
