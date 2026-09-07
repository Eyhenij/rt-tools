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

# --- SC-AK-832. Глагол ищется в позиции команды, а не подстрокой -----------------------------
# Голый поиск «git commit» промахивался в обе стороны: мимо уходил вызов с ключом между `git` и
# глаголом — им коммитят машинной учётной записью, — а чтение истории со словом `commit` в
# доводе отбивалось зря.
m "SC-AK-832 — ключ между командой и глаголом гарда не обходит" "$REPO_MAIN" \
    'git -c user.name=bot -c user.email=bot@x commit -m "chore: x"' Bash deny
m "SC-AK-832 — и указание чужого дерева тоже" "$REPO_MAIN" 'git -C . commit --amend --no-edit' Bash deny
m "SC-AK-832 — слово commit в доводе чтения истории не отбивается" "$REPO_MAIN" \
    "git log --grep 'git commit' --oneline" Bash PASS
m "SC-AK-832 — поиск по дереву коммитом не считается" "$REPO_MAIN" 'grep -rn "git commit" docs/' Bash PASS

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
# SC-AK-872. Флаг между глаголом и `-b` — та же форма заведения ветки: ветки в дереве заводят
# и так, а гард судил только форму без флага.
d "SC-AK-872 — флаг между checkout и -b форму имени не обходит" 'git checkout -q -b RT-9-GuestToken' deny
d "SC-AK-872 — та же форма с верным именем проходит" 'git checkout -q -b RT-9-guest-token' PASS
d "SC-AK-872 — то же через switch с флагом" 'git switch -q -c RT-9-GuestToken' deny
# Имя без номера законно, пока ветка живёт локально: заявка с неё не откроется.
d "ветка под пробу без номера" 'git checkout -b probe-idea' PASS

# --- SC-AK-830. Приставкой имени бывает не только ключ задач --------------------------------
# Номер вынимает профиль: пока разбор был зашит в гард одной формой, такая ветка номера не
# давала вовсе, и форма её не проверялась.
d "SC-AK-830 — ветка с родом правки в приставке проходит" 'git checkout -b feat/88-add-select-button' PASS
d "SC-AK-830 — и заглавные буквы в её хвосте отбиты" 'git checkout -b feat/88-AddSelectButton' deny
d "SC-AK-830 — ветка одним номером проходит" 'git checkout -b 88-add-select-button' PASS
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
    "$(input_cmd 'gh pr create --title "[RT-8] Сделано" --body x' Bash "$REPO_WORK")" 'number 8.*the branch'

# --- SC-AK-830. Та же сверка на ветке, где приставкой стоит род правки ----------------------
# Прежде блок пропускался молча: номер ветки выходил пустым, а сверка выглядела сошедшейся.
REPO_KIND="$(fixture_repo feat/88-add-select-button)"
kind() {
    local label="$1" cmd="$2" want="$3" out
    out="$(input_cmd "$cmd" Bash "$REPO_KIND" | "$HOOKS/git-guard-delivery.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.permissionDecision // "PASS"' 2>/dev/null)"
    report "$label" "${out:-PASS}" "$want"
}

kind "SC-AK-830 — заявка с совпавшим номером проходит" 'gh pr create --title "[RT-88] Готово" --body x' PASS
kind "SC-AK-830 — заявка с чужим номером отбита" 'gh pr create --title "[RT-89] Готово" --body x' deny
expect_reason "SC-AK-830 — отказ называет оба номера" git-guard-delivery.sh \
    "$(input_cmd 'gh pr create --title "[RT-89] Готово" --body x' Bash "$REPO_KIND")" 'number 89.*the branch — 88'
rm -rf "$REPO_KIND"

# SC-AK-763. Номер вынимается из той части заголовка, которую признала сама форма. Дерево,
# замостившее форму своей, получало пустой номер: сверка с номером ветки молча не выполнялась
# вовсе и выглядела при этом сошедшейся.
OWN_FORM='^[A-Za-z]+-[0-9]+[[:space:]]+[a-z]+(\([a-z0-9-]+\))?:[[:space:]]+[^[:space:]]'
RT_TASK_TITLE_RE="$OWN_FORM" \
    expect_decision "SC-AK-763 — замещённая форма с номером ветки проходит" git-guard-delivery.sh \
    "$(input_cmd 'gh pr create --title "RT-7 fix: сделано" --body x' Bash "$REPO_WORK")" PASS
RT_TASK_TITLE_RE="$OWN_FORM" \
    expect_decision "SC-AK-763 — чужой номер в замещённой форме отбивается" git-guard-delivery.sh \
    "$(input_cmd 'gh pr create --title "RT-8 fix: сделано" --body x' Bash "$REPO_WORK")" deny
RT_TASK_TITLE_RE="$OWN_FORM" \
    expect_reason "SC-AK-763 — и отказ называет оба номера" git-guard-delivery.sh \
    "$(input_cmd 'gh pr create --title "RT-8 fix: сделано" --body x' Bash "$REPO_WORK")" 'number 8.*the branch'

# --- свежесть локальной ссылки на главную ветку ------------------------------------------------
#
# Первый ярус читает локальную ссылку и молчит, пока она не старше ветки; второй спрашивает
# удалённую. Без второго молчание гарда значит «ссылка не старше ветки», а читается как
# «главная ветка влита» — так открытый PR и оказался конфликтующим.
#
# Состояние собирается откатом самой ссылки, а не вторым рабочим деревом: протухшая ссылка при
# ушедшем вперёд удалённом — это ровно оно, и лишний клон ничего к сценарию не добавляет.
STALE="$(fixture_repo_branched main RT-77-probe)"
BARE_DIR="$(mktemp -d)"
git init -q --bare "$BARE_DIR/o.git" 2>/dev/null
git -C "$STALE" remote add origin "$BARE_DIR/o.git" 2>/dev/null
git -C "$STALE" push -q origin RT-77-probe:main 2>/dev/null
git -C "$STALE" fetch -q origin 2>/dev/null
WAS="$(git -C "$STALE" rev-parse refs/remotes/origin/main 2>/dev/null)"
git -C "$STALE" -c user.email=p@p -c user.name=p -c commit.gpgsign=false commit -q --allow-empty -m 'чужая правка' 2>/dev/null
git -C "$STALE" push -q origin RT-77-probe:main 2>/dev/null
git -C "$STALE" update-ref refs/remotes/origin/main "$WAS" 2>/dev/null

expect_decision "SC-AK-178 — отставшая локальная ссылка отбивает открытие PR" git-guard-delivery.sh \
    "$(input_cmd 'gh pr create --title "[RT-77] Сделано" --body x' Bash "$STALE")" deny
expect_reason "SC-AK-178 — отказ называет обе стороны расхождения" git-guard-delivery.sh \
    "$(input_cmd 'gh pr create --title "[RT-77] Сделано" --body x' Bash "$STALE")" 'lags behind the remote one'

# Удалённого нет вовсе — ярус молчит: проверка, падающая в самолёте, работу не отбивает.
NO_REMOTE="$(fixture_repo_branched main RT-78-probe)"
expect_decision "SC-AK-179 — недоступный удалённый ярус не отбивает" git-guard-delivery.sh \
    "$(input_cmd 'gh pr create --title "[RT-78] Сделано" --body x' Bash "$NO_REMOTE")" PASS
rm -rf "$STALE" "$NO_REMOTE" "$BARE_DIR"

# --- разобранная папка задачи как условие поставки ---------------------------------------------
#
# Требование стоит на открытии заявки и остаётся вторым рубежом на слиянии. Прежде оно стояло
# только на слиянии: считалось, что до одобрения папка ещё нужна — правка по замечаниям идёт в
# ту же ветку. Но кнопку слияния нажимает человек на хостинге, и туда гард не достаёт: трижды
# подряд папка уехала в главную неразобранной. Судится содержимое ветки: снесённая, но не
# закоммиченная папка въехала бы вместе с ней.
mg() { expect_decision "$1" git-guard-delivery.sh "$(input_cmd "$3" Bash "$2")" "$4"; }

# Папка задачи лежит в ветке и уедет в главную.
LYING="$(fixture_repo_branched main RT-42-probe)"
fixture_commit "$LYING" docs/tasks/RT-42-probe/plan.md 'замысел' 'docs: замысел'
mg "SC-AK-12 — слияние с лежащей папкой задачи" "$LYING" 'gh pr merge 42 --merge' deny
expect_reason "SC-AK-12 — отказ называет саму папку" git-guard-delivery.sh \
    "$(input_cmd 'gh pr merge 42 --merge' Bash "$LYING")" 'docs/tasks/RT-42-probe'
# Открытие заявки той же папкой отбивается: уборка стоит до заявки, а не после одобрения.
mg "SC-AK-526 — открытие заявки с лежащей папкой" "$LYING" 'gh pr create --title "[RT-42] Сделано" --body x' deny
expect_reason "SC-AK-526 — отказ называет саму папку" git-guard-delivery.sh \
    "$(input_cmd 'gh pr create --title "[RT-42] Сделано" --body x' Bash "$LYING")" 'docs/tasks/RT-42-probe'
mg "SC-AK-527 — обход с причиной действует и на открытии" "$LYING" \
    'gh pr create --title "[RT-42] Сделано" --body x # Task-folder-skip: работа вливается частями' PASS
# Клиента хостинга зовут с подстановкой токена — иначе из команды не видно, кто её делает.
# Признак, не знавший о присваиваниях, снимал этой формой и запрет слияния, и уборку папки.
mg "SC-AK-559 — слияние с подстановкой токена судится наравне с голым" "$LYING" \
    'GH_TOKEN="$TOKEN" gh pr merge 42 --merge' deny
mg "SC-AK-559 — открытие заявки с подстановкой токена судится наравне" "$LYING" \
    'GH_TOKEN="$TOKEN" gh pr create --title "[RT-42] Сделано" --body x' deny
# Клиент, названный путём, — та же команда. Признак, знавший только голое имя, не узнавал вызов
# вовсе и выходил нулём: молчание гарда неотличимо от разрешения, и заявки уезжали открытыми не
# машинной записью. Путь тут не украшение — под своим именем клиент бывает псевдонимом оболочки.
mg "SC-AK-831 — открытие заявки полным путём судится наравне с голым именем" "$LYING" \
    '/opt/homebrew/bin/gh pr create --title "[RT-42] Сделано" --body x' deny
mg "SC-AK-831 — открытие заявки относительным путём судится наравне" "$LYING" \
    './gh pr create --title "[RT-42] Сделано" --body x' deny
mg "SC-AK-831 — слияние полным путём судится наравне" "$LYING" \
    '/opt/homebrew/bin/gh pr merge 42 --merge' deny
# Обратная сторона: упоминание имени в кавычках командой не было и не становится.
mg "SC-AK-831 — имя команды внутри строки командой не считается" "$LYING" \
    'echo "как открыть: gh pr create --title x"' PASS
# Обход из текста команды действует и тогда, когда очередь работ спросить некого.
mg "SC-AK-17 — обход с причиной в тексте команды" "$LYING" 'gh pr merge 42 --merge # Task-folder-skip: работа вливается частями' PASS
mg "SC-AK-18 — обход без причины обходом не считается" "$LYING" 'gh pr merge 42 --merge # Task-folder-skip:' deny
# Текст, который ОБЪЯСНЯЕТ обход, от самого обхода отличается двумя признаками: он не начинает
# ни строки, ни комментария, а причина у него — подстановка. Без обоих условий требование
# снимала строка-пример: та самая, которую гард печатает в собственном отказе.
mg "SC-AK-194 — упоминание обхода посреди строки обходом не считается" "$LYING" \
    'gh pr merge 42 --merge # поставь строку Task-folder-skip: причина в тело PR' deny
mg "SC-AK-195 — подстановка вместо причины обходом не считается" "$LYING" \
    'gh pr merge 42 --merge # Task-folder-skip: <причина>' deny
# SC-AK-711 — снятие черновика той же папкой отбивается: рубеж между открытием и слиянием.
# Снятый черновик читается владельцем как приглашение влить, и кнопку он нажимает, не дожидаясь
# коммита уборки.
mg "SC-AK-711 — снятие черновика с лежащей папкой" "$LYING" 'gh pr ready 42' deny
expect_reason "SC-AK-711 — отказ называет саму папку" git-guard-delivery.sh \
    "$(input_cmd 'gh pr ready 42' Bash "$LYING")" 'docs/tasks/RT-42-probe'
mg "SC-AK-712 — обход с причиной действует и на снятии черновика" "$LYING" \
    'gh pr ready 42 # Task-folder-skip: работа вливается частями' PASS

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
mg "SC-AK-528 — снос без записи в архив отбивает и открытие заявки" "$WIPED" \
    'gh pr create --title "[RT-44] Сделано" --body x' deny
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
    "$(input_cmd 'gh pr create --title "[RT-12] Сделано" --body x' Bash "$STALE")" 'ahead by 1 commit'
expect_reason "SC-AK-83 — отказ называет, чем снимается" git-guard-delivery.sh \
    "$(input_cmd 'gh pr create --title "[RT-12] Сделано" --body x' Bash "$STALE")" 'git merge origin/main'
rm -rf "$STALE"

# Вершины главной ветки в дереве нет вовсе — судить не по чему, и гард не выдумывает отказа.
NO_REMOTE="$(fixture_repo_branched main RT-13-alone)"
expect_decision "заявки без вершины главной ветки гард не судит" git-guard-delivery.sh \
    "$(input_cmd 'gh pr create --title "[RT-13] Сделано" --body x' Bash "$NO_REMOTE")" PASS
rm -rf "$NO_REMOTE"

# --- подпись машинного коммита -------------------------------------------------------------------
#
# Логин и почта здесь выдуманные: набор проверяет механику, а не карту дерева, в котором его
# запустили. Домен служебного адреса взят несуществующим намеренно — по нему видно, что ни в
# какой хостинг набор не ходит.

BOT_LOGIN='probe-bot'
BOT_MAIL="424242+${BOT_LOGIN}@users.noreply.example"
STRANGER_MAIL="111111+${BOT_LOGIN}@users.noreply.example"

# Репозиторий с объявленной машинной записью: вершина главной ветки есть, профиль называет
# почту. Логин гард читает из неё же.
sig_repo() {
    local dir
    dir="$(fixture_repo_branched main RT-70-signature)"
    git -C "$dir" update-ref refs/remotes/origin/main main 2>/dev/null
    mkdir -p "$dir/.claude/rt-kit"
    printf 'RT_COMMIT_EMAIL="%s"\n' "$BOT_MAIL" \
        > "$dir/.claude/rt-kit/project.sh"
    printf '%s' "$dir"
}

# Гард зовётся с корнем дерева фикстуры: профиль он ищет от него, а не от рабочего дерева.
sig() {
    local label="$1" dir="$2" cmd="$3" want="$4" out
    out="$(CLAUDE_PROJECT_DIR="$dir" input_cmd "$cmd" Bash "$dir" \
        | CLAUDE_PROJECT_DIR="$dir" "$HOOKS/git-guard-delivery.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.permissionDecision // "PASS"' 2>/dev/null)"
    report "$label" "${out:-PASS}" "$want"
}

WRONG_SIG="$(sig_repo)"
fixture_commit_as "$WRONG_SIG" "$BOT_LOGIN" "$STRANGER_MAIL" src/probe.ts 'export const x = 1;' 'feat: правка'
sig "SC-AK-178 — чужая почта у машинного имени отбивает пуш" "$WRONG_SIG" 'git push origin RT-70-signature' deny
# Настоящий пуш идёт с ключами между `git` и `push`: помощник учётных данных и заголовок
# запроса. Подстрокой «git push» такую команду не поймать.
sig "пуш с ключами между командой и подкомандой узнаётся" "$WRONG_SIG" \
    'git -c credential.helper= -c http.extraheader="AUTHORIZATION: basic x" push -u origin RT-70-signature' deny
sig "SC-AK-184 — пробный пуш подписи не судит" "$WRONG_SIG" 'git push --dry-run origin RT-70-signature' PASS
sig "чтение истории пушем не считается" "$WRONG_SIG" 'git log --oneline -5' PASS
# Пуш набирают с подстановкой токена — этого требует соседняя проверка того же гарда. Признак,
# считавший вызовом только команду в начале строки, пропускал ровно ту форму, ради которой
# подпись и судится: коммит с чужим числом уехал в главную ветку мимо этого отказа.
sig "SC-AK-559 — вызов с подстановкой переменной судится наравне с голым" "$WRONG_SIG" \
    'GH_TOKEN="$TOKEN" git push origin RT-70-signature' deny
sig "SC-AK-559 — несколько присваиваний подряд вызова не скрывают" "$WRONG_SIG" \
    'TOKEN=x GH_TOKEN="$TOKEN" git push origin RT-70-signature' deny
sig "SC-AK-559 — присваивание без команды за ним вызовом не считается" "$WRONG_SIG" \
    'GH_TOKEN="$TOKEN"' PASS
sig "SC-AK-559 — упоминание команды в кавычках вызовом не становится" "$WRONG_SIG" \
    'echo "git push origin RT-70-signature"' PASS

CLAUDE_PROJECT_DIR="$WRONG_SIG" expect_reason "SC-AK-179 — отказ называет коммит и найденную почту" \
    git-guard-delivery.sh "$(input_cmd 'git push origin RT-70-signature' Bash "$WRONG_SIG")" \
    'Diverging: [0-9a-f]{7,} <111111'
CLAUDE_PROJECT_DIR="$WRONG_SIG" expect_reason "SC-AK-179 — отказ называет объявленную почту" \
    git-guard-delivery.sh "$(input_cmd 'git push origin RT-70-signature' Bash "$WRONG_SIG")" \
    'Declared: 424242'

# Дерево, не назвавшее почты, требования не получает: тот же коммит, профиль без объявления.
printf 'RT_COMMIT_EMAIL=""\n' > "$WRONG_SIG/.claude/rt-kit/project.sh"
sig "SC-AK-183 — дерево, не назвавшее почты, требования не получает" "$WRONG_SIG" \
    'git push origin RT-70-signature' PASS
printf 'RT_COMMIT_EMAIL="%s"\n' "$BOT_MAIL" > "$WRONG_SIG/.claude/rt-kit/project.sh"

# SC-AK-753 — подпись судится и на коммите, а не только на отправке
# Промах делается на коммите и до отправки успевает лечь в несколько коммитов подряд: каждый
# следующий берёт адрес у предыдущего. Судится при этом вклад, уже лежащий в ветке, а не текст
# команды: почта задаётся её переменными.
sig "SC-AK-753 — коммит поверх испорченного вклада отбивается" "$WRONG_SIG" \
    'git commit -m "feat: следующая правка"' deny
sig "SC-AK-753 — переписывание последнего коммита судится так же" "$WRONG_SIG" \
    'git commit --amend --no-edit' deny
sig "SC-AK-753 — слово команды внутри строки коммитом не считается" "$WRONG_SIG" \
    'echo "git commit -m x"' PASS
rm -rf "$WRONG_SIG"

RIGHT_SIG="$(sig_repo)"
fixture_commit_as "$RIGHT_SIG" "$BOT_LOGIN" "$BOT_MAIL" src/probe.ts 'export const x = 1;' 'feat: правка'
sig "SC-AK-180 — верная подпись пуш не задерживает" "$RIGHT_SIG" 'git push origin RT-70-signature' PASS
sig "SC-AK-753 — верная подпись коммит не задерживает" "$RIGHT_SIG" 'git commit -m "feat: ещё"' PASS
rm -rf "$RIGHT_SIG"

# Коммит, назвавшийся человеком, гард не судит: чужая работа своими руками в том же дереве.
HUMAN_SIG="$(sig_repo)"
fixture_commit_as "$HUMAN_SIG" 'Хозяин дерева' 'owner@example.com' src/probe.ts 'export const x = 1;' 'feat: правка'
sig "SC-AK-181 — коммит, назвавшийся человеком, не судится" "$HUMAN_SIG" 'git push origin RT-70-signature' PASS
rm -rf "$HUMAN_SIG"

# SC-AK-882 — коммит под записью, которой дерево не объявляло
# Прежде помощник судил только коммит, назвавшийся машинной записью: пять коммитов подряд под
# чужим логином в это условие не попадали вовсе. Вторая половина включается объявлением почт
# людей — без него требовать известной подписи от каждого коммита значило бы отбивать работу,
# сделанную человеком своими руками.
UNKNOWN_SIG="$(sig_repo)"
fixture_commit_as "$UNKNOWN_SIG" 'Кто-то ещё' 'someone@example.com' src/probe.ts 'export const x = 1;' 'feat: правка'
sig "SC-AK-882 — без объявленных почт людей чужая запись проходит" "$UNKNOWN_SIG" \
    'git push origin RT-70-signature' PASS
printf 'RT_COMMIT_EMAIL="%s"\nRT_HUMAN_EMAILS="owner@example.com"\n' "$BOT_MAIL" \
    > "$UNKNOWN_SIG/.claude/rt-kit/project.sh"
sig "SC-AK-882 — с объявленными почтами неизвестная запись отбивается" "$UNKNOWN_SIG" \
    'git push origin RT-70-signature' deny
CLAUDE_PROJECT_DIR="$UNKNOWN_SIG" expect_reason "SC-AK-882 — отказ называет коммит и его почту" \
    git-guard-delivery.sh "$(input_cmd 'git push origin RT-70-signature' Bash "$UNKNOWN_SIG")" \
    'Diverging: [0-9a-f]{7,} <someone@example.com>'
rm -rf "$UNKNOWN_SIG"

KNOWN_SIG="$(sig_repo)"
fixture_commit_as "$KNOWN_SIG" 'Хозяин дерева' 'owner@example.com' src/probe.ts 'export const x = 1;' 'feat: правка'
printf 'RT_COMMIT_EMAIL="%s"\nRT_HUMAN_EMAILS="owner@example.com"\n' "$BOT_MAIL" \
    > "$KNOWN_SIG/.claude/rt-kit/project.sh"
sig "SC-AK-882 — объявленная почта человека проходит" "$KNOWN_SIG" \
    'git push origin RT-70-signature' PASS
rm -rf "$KNOWN_SIG"

# Влитое в главную этой веткой уже не чинится: судится вклад ветки.
MERGED_SIG="$(fixture_repo_branched main RT-71-merged)"
git -C "$MERGED_SIG" checkout -q main 2>/dev/null
fixture_commit_as "$MERGED_SIG" "$BOT_LOGIN" "$STRANGER_MAIL" src/old.ts 'export const y = 2;' 'feat: старое'
git -C "$MERGED_SIG" update-ref refs/remotes/origin/main main 2>/dev/null
git -C "$MERGED_SIG" checkout -q RT-71-merged 2>/dev/null
git -C "$MERGED_SIG" merge -q main 2>/dev/null
mkdir -p "$MERGED_SIG/.claude/rt-kit"
printf 'RT_TASK_BOT="%s"\nRT_COMMIT_EMAIL="%s"\n' "$BOT_LOGIN" "$BOT_MAIL" \
    > "$MERGED_SIG/.claude/rt-kit/project.sh"
fixture_commit_as "$MERGED_SIG" "$BOT_LOGIN" "$BOT_MAIL" src/new.ts 'export const z = 3;' 'feat: новое'
sig "SC-AK-182 — судится вклад ветки, а не вся история" "$MERGED_SIG" 'git push origin RT-71-merged' PASS
rm -rf "$MERGED_SIG"

# --- раздел об оставшемся шаге в теле заявки ----------------------------------------------------
#
# Кнопку слияния нажимает человек на хостинге, куда гард не достаёт: требование разбора папки
# держится там разделом на странице. Стоя прозой, оно не сработало — заявку влили без раздела.
#
# Образец называет дерево — заголовок пишется языком заявки. Не названный, он не судится вовсе,
# и сценарии выше это и проверяют: они идут без переменной и про раздел молчат.
body_section() {
    # Переменная ставится вызову гарда, а не первому звену конвейера: приставка перед командой
    # действует на неё одну, и хук получил бы пустое значение, то есть «требования нет».
    out="$(input_cmd "$2" Bash "$REPO_WORK" \
        | RT_PULL_BODY_SECTION='^##[[:space:]]+Оставшийся шаг[[:space:]]*$' "$HOOKS/git-guard-delivery.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.permissionDecisionReason // ""' 2>/dev/null \
        | grep -c 'the remaining step')"
    report "$1" "упоминаний:${out:-0}" "упоминаний:$3"
}

body_section "SC-AK-685 — тело без раздела об оставшемся шаге отбивает открытие заявки" \
    'gh pr create --title "[RT-7] Сделано" --body "Тело без раздела."' 1
body_section "SC-AK-686 — тело с разделом про него молчит" \
    'gh pr create --title "[RT-7] Сделано" --body "Тело.

## Оставшийся шаг

Осталось дождаться прогона."' 0

# Тело, переданное файлом, судится наравне с телом в доводе: иначе обход появился бы сам собой.
BODY_FILE="$(mktemp)"
printf 'Тело из файла без раздела.\n' > "$BODY_FILE"
body_section "SC-AK-687 — тело, переданное файлом, судится наравне с доводом" \
    "gh pr create --title \"[RT-7] Сделано\" --body-file $BODY_FILE" 1
printf 'Тело из файла.\n\n## Оставшийся шаг\n\nНе осталось.\n' > "$BODY_FILE"
body_section "SC-AK-687 — раздел в файле принимается так же" \
    "gh pr create --title \"[RT-7] Сделано\" --body-file $BODY_FILE" 0

# SC-AK-884. Флаг тела узнаётся только отдельным словом: хвост имени ветки `-b` в доводе
# основания читался как `-b`, и телом становилось следующее слово команды — `--head`, `2>&1`.
body_section "SC-AK-884 — имя ветки на -b в доводе основания телом не считается" \
    "gh pr create --title \"[RT-7] Сделано\" --body-file $BODY_FILE --base RT-6-before-b --head RT-7-probe 2>&1" 0
body_section "SC-AK-884 — то же с именем последним словом" \
    "gh pr create --title \"[RT-7] Сделано\" --body-file $BODY_FILE --base RT-6-before-b" 0
printf 'Тело из файла без раздела.\n' > "$BODY_FILE"
body_section "SC-AK-884 — файл без раздела при таком имени по-прежнему отбит" \
    "gh pr create --title \"[RT-7] Сделано\" --body-file $BODY_FILE --base RT-6-before-b --head RT-7-probe" 1
rm -f "$BODY_FILE"

# Дерево, не назвавшее образца, требования не получает: чужих слов пакет не знает.
out="$(input_cmd 'gh pr create --title "[RT-7] Сделано" --body "Тело без раздела."' Bash "$REPO_WORK" \
    | "$HOOKS/git-guard-delivery.sh" 2>/dev/null \
    | jq -r '.hookSpecificOutput.permissionDecisionReason // ""' 2>/dev/null | grep -c 'the remaining step')"
report "неназванный образец раздела не судится вовсе" "упоминаний:${out:-0}" "упоминаний:0"

# --- отказ в пользу работы ---------------------------------------------------------------------
for hook in git-guard-main.sh git-guard-delivery.sh git-guard-push-tests.sh; do
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
