#!/usr/bin/env bash
# Сценарии готовности к поставке: несошедшееся называется разом, колонка очереди работ, условия
# начала работы и снятие черновика.
#
# Отделено от набора о форме имени ветки и разборе папки задачи: тот перерос предел длины файла,
# а делить его по точкам гарда — единственный способ, при котором соседний сценарий не приходится
# искать чтением всего набора.
#
# Ярусы, требующие сети, здесь не ходят никуда: состояние задачи и состояние заявки подставляются
# надстройкой профиля в дереве фикстуры. Живая очередь работ меняется каждым пушем, и набор,
# спросивший её, отвечал бы по-разному на одной и той же правке.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "готовность к поставке"

# Почта машинной записи и её логин выдуманные: набор проверяет механику, а не карту дерева, в
# котором его запустили. Домен взят несуществующим намеренно — по нему видно, что ни в какой
# хостинг набор не ходит.
BOT_MAIL='424242+probe-bot@users.noreply.example'

# --- готовность к поставке одним ответом ---------------------------------------------------------
#
# Гард зовётся с корнем дерева фикстуры и его же рабочим каталогом: профиль, имена колонок и
# почту машинной записи он ищет от корня. Набор, положившийся на общий корень, читал бы профиль
# того дерева, в котором его запустили, и зеленел бы от чужой настройки.
dlv() {
    local label="$1" dir="$2" cmd="$3" want="$4" out
    out="$(CLAUDE_PROJECT_DIR="$dir" input_cmd "$cmd" Bash "$dir" \
        | CLAUDE_PROJECT_DIR="$dir" "$HOOKS/git-guard-delivery.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.permissionDecision // "PASS"' 2>/dev/null)"
    report "$label" "${out:-PASS}" "$want"
}

# Чем именно гард отбил, при своём корне дерева.
dlv_reason() {
    local label="$1" dir="$2" cmd="$3" pattern="$4" got
    if CLAUDE_PROJECT_DIR="$dir" input_cmd "$cmd" Bash "$dir" \
        | CLAUDE_PROJECT_DIR="$dir" "$HOOKS/git-guard-delivery.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.permissionDecisionReason // ""' 2>/dev/null \
        | grep -qE "$pattern"; then got="есть"; else got="нет"; fi
    report "$label" "$got" "есть"
}

# Отказ по первому промаху заставляет чинить условия по одному: правишь заголовок, повторяешь
# вызов, упираешься в основание, правишь основание, упираешься в задачу — и цена отказа растёт
# на каждом круге, хотя всё несошедшееся было известно уже на первом. Готовность к поставке —
# одно состояние, и в отказе стоят все несошедшиеся условия сразу.
BOTH="$(fixture_repo_branched main RT-90-both)"
git -C "$BOTH" checkout -q main 2>/dev/null
fixture_commit "$BOTH" docs/чужое.md 'правка соседней ветки' 'docs: чужая правка'
git -C "$BOTH" update-ref refs/remotes/origin/main main 2>/dev/null
git -C "$BOTH" checkout -q RT-90-both 2>/dev/null
BOTH_CMD='gh pr create --title "Сделано" --body x'
dlv "SC-AK-366 — заявка с двумя несошедшимися условиями отбита" "$BOTH" "$BOTH_CMD" deny
dlv_reason "SC-AK-366 — отказ начинается с неготовности к поставке" "$BOTH" "$BOTH_CMD" \
    'работа к поставке не готова'
dlv_reason "SC-AK-366 — в том же отказе стоит заголовок заявки" "$BOTH" "$BOTH_CMD" \
    'заголовок заявки не начинается с номера задачи'
dlv_reason "SC-AK-366 — и в нём же влитость главной ветки" "$BOTH" "$BOTH_CMD" \
    'ушла вперёд на 1'
rm -rf "$BOTH"

# --- колонка очереди работ ------------------------------------------------------------------------
#
# Колонку ответ очереди отдавал давно, и не читал её никто. Задача, оставшаяся в первой колонке,
# читается по очереди как невзятая — а работа по ней сделана и выложена.
#
# Состояние задачи подставляется надстройкой профиля: сети у набора нет, а живая очередь
# меняется каждым пушем.
task_repo() {
    local dir
    dir="$(fixture_repo_branched main RT-91-column)"
    git -C "$dir" update-ref refs/remotes/origin/main main 2>/dev/null
    mkdir -p "$dir/.claude/rt-kit"
    cat > "$dir/.claude/rt-kit/project.sh" <<EOF
RT_BOARD_BACKLOG="$2"
rt_task_state() {
    printf '%s' '{"exists":true,"open":true,"onBoard":true,"assigned":true,"numbered":true,"status":"$1"}'
}
EOF
    printf '%s' "$dir"
}

COLUMN_CMD='gh pr create --title "[RT-91] Сделано" --body x'

BACKLOG="$(task_repo 'Backlog' 'Backlog')"
dlv "SC-AK-367 — задача, оставшаяся в первой колонке, отбивает заявку" "$BACKLOG" "$COLUMN_CMD" deny
dlv_reason "SC-AK-367 — отказ называет колонку" "$BACKLOG" "$COLUMN_CMD" 'стоит в колонке «Backlog»'
dlv_reason "SC-AK-367 — и чем её переставить" "$BACKLOG" "$COLUMN_CMD" 'npm run task:move'
rm -rf "$BACKLOG"

TAKEN="$(task_repo 'In progress' 'Backlog')"
dlv "SC-AK-368 — задача, взятая в работу, заявку не задерживает" "$TAKEN" "$COLUMN_CMD" PASS
rm -rf "$TAKEN"

# Дерево, не назвавшее первой колонки, требования не получает: имена колонок у каждой очереди
# свои, и выдуманное имя не совпало бы ни с чем — проверка молча выключилась бы.
UNNAMED="$(task_repo 'Backlog' '')"
dlv "SC-AK-369 — без имени первой колонки колонка не судится" "$UNNAMED" "$COLUMN_CMD" PASS
rm -rf "$UNNAMED"

# --- условия, известные в начале работы ------------------------------------------------------------
#
# Основание и подпись прежде спрашивались на пуше и на открытии заявки, то есть после того, как
# работа сделана: основание чинится мержем с разбором конфликта, подпись — переписыванием всей
# ветки. В начале работы обе стоят одну команду.

BEHIND="$(fixture_repo_branched main RT-92-behind)"
git -C "$BEHIND" checkout -q main 2>/dev/null
fixture_commit "$BEHIND" docs/чужое.md 'правка соседней ветки' 'docs: чужая правка'
git -C "$BEHIND" update-ref refs/remotes/origin/main main 2>/dev/null
git -C "$BEHIND" checkout -q RT-92-behind 2>/dev/null
dlv "SC-AK-370 — ветка от основания без вершины главной отбита" "$BEHIND" \
    'git checkout -b RT-93-new' deny
dlv "SC-AK-370 — то же через switch" "$BEHIND" 'git switch -c RT-93-new' deny
dlv_reason "SC-AK-370 — отказ называет отставание числом" "$BEHIND" 'git checkout -b RT-93-new' \
    'нет вершины «main».*вперёд на 1'
dlv_reason "SC-AK-370 — и чем берётся свежее основание" "$BEHIND" 'git checkout -b RT-93-new' \
    'git fetch origin'
# Ветка под пробу без номера этого требования не получает: она живёт локально, и заявка с неё
# не откроется.
dlv "SC-AK-370 — беззадачная ветка основания не спрашивает" "$BEHIND" \
    'git checkout -b probe-idea' PASS
rm -rf "$BEHIND"

FRESH_BASE="$(fixture_repo_branched main RT-94-fresh)"
git -C "$FRESH_BASE" update-ref refs/remotes/origin/main main 2>/dev/null
dlv "SC-AK-371 — ветка от свежего основания заводится" "$FRESH_BASE" \
    'git checkout -b RT-95-new' PASS
rm -rf "$FRESH_BASE"

# Почта: рабочая копия подписывает коммиты не тем адресом, что объявило дерево. Вершины главной
# ветки здесь нет вовсе — иначе к отказу примешалось бы основание, и не было бы видно, чем
# именно гард отбил.
MAIL="$(fixture_repo_branched main RT-96-mail)"
git -C "$MAIL" config user.email 'owner@example.com' 2>/dev/null
mkdir -p "$MAIL/.claude/rt-kit"
printf 'RT_COMMIT_EMAIL="%s"\n' "$BOT_MAIL" > "$MAIL/.claude/rt-kit/project.sh"
dlv "SC-AK-372 — чужая почта рабочей копии отбивает заведение ветки" "$MAIL" \
    'git checkout -b RT-97-new' deny
dlv_reason "SC-AK-372 — отказ называет почту рабочей копии" "$MAIL" 'git checkout -b RT-97-new' \
    'как «owner@example.com»'
dlv_reason "SC-AK-372 — и объявленную деревом" "$MAIL" 'git checkout -b RT-97-new' \
    'машинной записи «424242'

printf 'RT_COMMIT_EMAIL=""\n' > "$MAIL/.claude/rt-kit/project.sh"
dlv "SC-AK-373 — дерево, не назвавшее почты, заведение ветки не судит" "$MAIL" \
    'git checkout -b RT-97-new' PASS

printf 'RT_COMMIT_EMAIL="%s"\n' "$BOT_MAIL" > "$MAIL/.claude/rt-kit/project.sh"
git -C "$MAIL" config user.email "$BOT_MAIL" 2>/dev/null
dlv "SC-AK-373 — совпавшая почта заведение ветки не задерживает" "$MAIL" \
    'git checkout -b RT-97-new' PASS
rm -rf "$MAIL"

# --- снятие черновика --------------------------------------------------------------------------------
#
# Ревьювера не спрашивал никто: запрос разбора на самого себя хостинг принимает молча и не
# создаёт — разбор при этом выглядит запрошенным. Раньше снятия черновика спросить негде: до
# открытия заявки ревьювера нет вовсе, а само снятие и есть тот ход, которым работа объявляется
# готовой.
#
# Состояние заявки подставляется надстройкой профиля — по той же причине, что и состояние задачи.
ready_repo() {
    local dir
    dir="$(fixture_repo RT-98-ready)"
    mkdir -p "$dir/.claude/rt-kit"
    cat > "$dir/.claude/rt-kit/project.sh" <<EOF
rt_pull_state() { $1 }
EOF
    printf '%s' "$dir"
}

NO_REVIEW="$(ready_repo "printf '%s' '{\"exists\":true,\"draft\":true,\"reviewed\":false}';")"
dlv "SC-AK-374 — заявка без разбора черновик не снимает" "$NO_REVIEW" 'gh pr ready 917' deny
dlv_reason "SC-AK-374 — отказ называет заявку и нехватку разбора" "$NO_REVIEW" 'gh pr ready 917' \
    'у заявки #917 нет разбора'
dlv "SC-AK-374 — тот же отказ у второго клиента хостинга" "$NO_REVIEW" \
    'glab mr update 917 --ready' deny
# Прочие команды клиента снятием черновика не являются.
dlv "SC-AK-374 — чтение заявки снятием не считается" "$NO_REVIEW" 'gh pr view 917' PASS
rm -rf "$NO_REVIEW"

REVIEWED="$(ready_repo "printf '%s' '{\"exists\":true,\"draft\":true,\"reviewed\":true}';")"
dlv "SC-AK-375 — заявка с разбором черновик снимает" "$REVIEWED" 'gh pr ready 917' PASS
rm -rf "$REVIEWED"

# Помощник очереди работ молчит — нет сети, нет токена, нет узла. Ярус сетевой, и молчание
# работу не отбивает: проверка, падающая в самолёте, стоит дороже промаха, который она ловит.
SILENT="$(ready_repo 'return 1;')"
dlv "SC-AK-376 — молчание помощника снятие черновика не задерживает" "$SILENT" \
    'gh pr ready 917' PASS
rm -rf "$SILENT"

# Заявки с таким номером нет вовсе — судить нечего.
MISSING="$(ready_repo "printf '%s' '{\"exists\":false}';")"
dlv "SC-AK-376 — неизвестная заявка снятие не задерживает" "$MISSING" 'gh pr ready 917' PASS
rm -rf "$MISSING"

# --- заявка, названная не номером или не названная вовсе -----------------------------------------
#
# Ссылка на заявку у клиента необязательна: без неё он берёт заявку текущей ветки. Пока гард
# требовал номер, всё требование о разборе снималось одним пробелом — `gh pr ready` проходил
# мимо него молча, а это самая короткая и самая обычная форма вызова.
BARE="$(ready_repo "printf '%s' '{\"exists\":true,\"number\":917,\"draft\":true,\"reviewed\":false}';")"
dlv "SC-AK-383 — снятие черновика без ссылки на заявку отбито" "$BARE" 'gh pr ready' deny
dlv_reason "SC-AK-383 — отказ тот же, что и с номером" "$BARE" 'gh pr ready' \
    'у заявки #917 нет разбора'
dlv "SC-AK-383 — то же у второго клиента хостинга" "$BARE" 'glab mr update --ready' deny

# Заявку называют адресом и именем ветки не реже, чем номером: разбирать их — работа клиента,
# а гарду довод передаётся как есть.
dlv "SC-AK-384 — заявка, названная адресом, судится наравне с номером" "$BARE" \
    'gh pr ready https://github.com/o/r/pull/917' deny
dlv "SC-AK-384 — и заявка, названная именем ветки" "$BARE" 'gh pr ready RT-98-ready' deny
dlv_reason "SC-AK-384 — номер в отказе берётся из ответа, а не из команды" "$BARE" \
    'gh pr ready RT-98-ready' 'у заявки #917 нет разбора'

# Возврат в черновик делает ровно то, чего гард добивается, — снимает с работы вид готовой.
dlv "SC-AK-385 — возврат заявки в черновик проходит" "$BARE" 'gh pr ready 917 --undo' PASS
dlv "SC-AK-385 — и возврат без ссылки тоже" "$BARE" 'gh pr ready --undo' PASS
rm -rf "$BARE"

# Номера в ответе нет — в отказ идёт то, чем заявку назвали в команде: без этого заявка,
# названная веткой, в отказе становится безымянной. Решётка при этом стоит только у числа:
# перед именем ветки или адресом она читается как опечатка.
NAMELESS="$(ready_repo "printf '%s' '{\"exists\":true,\"draft\":true,\"reviewed\":false}';")"
dlv_reason "SC-AK-384 — без номера в ответе в отказ идёт довод команды" "$NAMELESS" \
    'gh pr ready RT-98-ready' 'у заявки «RT-98-ready» нет разбора'
rm -rf "$NAMELESS"

# --- основание, названное в самой команде ---------------------------------------------------------
#
# Судится названное основание, а не вершина рабочей копии: `git checkout -b <ветка> origin/main` —
# это и есть команда, которой основание берут свежим, и отбивать её наравне с веткой от вчерашнего
# дерева значит отбивать починку вместе с промахом.
NAMED="$(fixture_repo_branched main RT-100-named)"
git -C "$NAMED" checkout -q main 2>/dev/null
fixture_commit "$NAMED" docs/чужое.md 'правка соседней ветки' 'docs: чужая правка'
git -C "$NAMED" update-ref refs/remotes/origin/main main 2>/dev/null
git -C "$NAMED" checkout -q RT-100-named 2>/dev/null

dlv "SC-AK-386 — ветка от названного свежего основания заводится" "$NAMED" \
    'git checkout -b RT-101-new origin/main' PASS
dlv "SC-AK-386 — то же через switch" "$NAMED" 'git switch -c RT-101-new origin/main' PASS
# Без названного основания судится вершина рабочей копии, и она отстала.
dlv "SC-AK-387 — ветка от вершины рабочей копии отбита" "$NAMED" \
    'git checkout -b RT-101-new' deny
# Названное основание тоже бывает вчерашним: отставшая ветка названа явно.
dlv "SC-AK-387 — названное вчерашнее основание отбито" "$NAMED" \
    'git checkout -b RT-101-new RT-100-named' deny
dlv_reason "SC-AK-387 — отказ зовёт взять основание от главной ветки" "$NAMED" \
    'git checkout -b RT-101-new RT-100-named' 'git checkout -b RT-101-new origin/main'
# Основания, которого в дереве нет вовсе, судить нечем: гард молчит, а не выдумывает отказ.
dlv "SC-AK-387 — неизвестное основание гард не судит" "$NAMED" \
    'git checkout -b RT-101-new origin/нет-такой-ветки' PASS
rm -rf "$NAMED"

# --- второй ярус: локальная ссылка сама протухла ----------------------------------------------------
#
# Первый ярус читает то, что лежит в дереве, и его молчание значит «основание не старше моей
# ссылки», а не «основание свежее». Без второго яруса ветка от вчерашнего дерева заводилась бы
# молча — и увидел бы это владелец на открытии заявки.
#
# Состояние собирается откатом самой ссылки: протухшая ссылка при ушедшем вперёд удалённом — это
# ровно оно, и второе рабочее дерево ничего к сценарию не добавляет. Удалённый набирает ветку
# сам, забирая её из фикстуры: своих проверок у голого репозитория нет, и отдача туда завела бы
# набор в гард гейта.
STALE_REF="$(fixture_repo_branched main RT-102-stale)"
BARE_REMOTE="$(mktemp -d)"
git init -q --bare "$BARE_REMOTE/o.git" 2>/dev/null
git -C "$STALE_REF" remote add origin "$BARE_REMOTE/o.git" 2>/dev/null
git -C "$BARE_REMOTE/o.git" fetch -q "$STALE_REF" RT-102-stale:refs/heads/main 2>/dev/null
git -C "$STALE_REF" fetch -q origin 2>/dev/null
WAS_REF="$(git -C "$STALE_REF" rev-parse refs/remotes/origin/main 2>/dev/null)"
git -C "$STALE_REF" -c user.email=p@p -c user.name=p -c commit.gpgsign=false \
    commit -q --allow-empty -m 'чужая правка' 2>/dev/null
git -C "$BARE_REMOTE/o.git" fetch -q "$STALE_REF" RT-102-stale:refs/heads/main 2>/dev/null
git -C "$STALE_REF" update-ref refs/remotes/origin/main "$WAS_REF" 2>/dev/null

dlv "SC-AK-388 — отставшая локальная ссылка отбивает заведение ветки" "$STALE_REF" \
    'git checkout -b RT-103-new' deny
dlv_reason "SC-AK-388 — отказ называет обе стороны расхождения" "$STALE_REF" \
    'git checkout -b RT-103-new' 'ссылка origin/main отстала от удалённой'
dlv_reason "SC-AK-388 — и чем она подтягивается" "$STALE_REF" \
    'git checkout -b RT-103-new' 'git fetch origin'
rm -rf "$STALE_REF" "$BARE_REMOTE"

# Удалённого нет вовсе — спросить некого, и ярус молчит: проверка, падающая в самолёте, работу
# не отбивает.
NO_ANSWER="$(fixture_repo_branched main RT-104-alone)"
git -C "$NO_ANSWER" update-ref refs/remotes/origin/main main 2>/dev/null
dlv "SC-AK-389 — молчание опроса заведение ветки не задерживает" "$NO_ANSWER" \
    'git checkout -b RT-105-new' PASS
rm -rf "$NO_ANSWER"

# --- колонка спрашивается там, где её уже должны были переставить -------------------------------------
#
# На заведении ветки задача ещё стоит в первой колонке: её переставляют следующей командой. Пока
# колонку судили и здесь, гард отбивал первую же команду работы — вместе с той, которая его
# требование и снимает.
COLUMN_BOTH="$(task_repo 'Backlog' 'Backlog')"
dlv "SC-AK-390 — задача в первой колонке заведению ветки не мешает" "$COLUMN_BOTH" \
    'git checkout -b RT-91-column' PASS
dlv "SC-AK-390 — а открытие заявки той же задачей отбивается" "$COLUMN_BOTH" \
    'gh pr create --title "[RT-91] Сделано" --body x' deny
dlv_reason "SC-AK-390 — и отбивается именно колонкой" "$COLUMN_BOTH" \
    'gh pr create --title "[RT-91] Сделано" --body x' 'стоит в колонке «Backlog»'
rm -rf "$COLUMN_BOTH"

suite_result "готовность к поставке"
