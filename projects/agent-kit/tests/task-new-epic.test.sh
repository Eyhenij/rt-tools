#!/usr/bin/env bash
# Сценарии заведения эпика командой: что она создаёт и на чём отбивает вызов.
#
# В хостинг набор не ходит: помощник подменён двойником, который отвечает по содержимому вызова.
# Судится то, что решает сама команда, — метка на карточке, заготовка плана, строка ветки от
# главной и отказ до создания карточки.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "команда: заведение эпика"

TN_TREE="$(mktemp -d)"
mkdir -p "$TN_TREE/tools" "$TN_TREE/.claude/rt-kit"
cp "$CHECKS/rt-kit-checks.config.mjs" "$TN_TREE/tools/"
cp "$CHECKS/board.github.mjs" "$TN_TREE/tools/board.mjs"
cp "$CHECKS/board-gh.github.mjs" "$TN_TREE/tools/board-gh.mjs"
cp "$CHECKS/task-new.github.mjs" "$TN_TREE/tools/task-new.mjs"

# Настройки дерева-фикстуры: своя очередь работ, своя метка эпика, свой каталог планов.
tn_config() {
    cat > "$TN_TREE/.claude/rt-kit/checks.json" <<CFG
{
    "plansDir": "${1-docs/plans}",
    "board": {
        "owner": "o",
        "repo": "r",
        "projectId": "PVT_x",
        "statusFieldId": "PVTSSF_x",
        "statusOptions": { "backlog": { "id": "bb", "name": "Backlog" } },
        "taskKey": "RT",
        "bot": "bot",
        "epicLabel": "${2-epic}"
    }
}
CFG
}

# Двойник хостинга: отвечает по содержимому вызова, а созданную карточку кладёт в файл.
cat > "$TN_TREE/gh" <<'STUB'
#!/usr/bin/env bash
all="$*"
case "$all" in
    *"issue create"*)
        printf '%s\n' "$all" > "$TN_CREATED"
        printf 'https://github.com/o/r/issues/4242\n'
        ;;
    *"addProjectV2ItemById"*) printf '{"data":{"addProjectV2ItemById":{"item":{"id":"IT_1"}}}}\n' ;;
    *'node(id:'*)
        printf '%s' '{"data":{"node":{"items":{"pageInfo":{"hasNextPage":false,"endCursor":null},'
        printf '%s\n' '"nodes":[{"id":"IT_1","status":{"name":"Backlog"},"content":{"__typename":"Issue","number":4242}}]}}}}'
        ;;
    *"issue view 1921"*)
        printf '%s' '{"number":1921,"title":"[RT-1921] Поставка идёт эпиками","labels":['
        printf '%s' "$TN_EPIC_LABELS"
        printf '%s\n' '],"body":"Замысел эпика — docs/plans/work-by-epics.md"}'
        ;;
    *"issue view"*)
        printf '%s\n' '{"number":4242,"title":"[RT-4242] Поставка идёт эпиками","state":"OPEN","assignees":[{"login":"bot"}],"labels":[{"name":"epic"}]}'
        ;;
    *node_id*) printf '{"id":"I_node"}\n' ;;
    *) printf '{"data":{}}\n' ;;
esac
STUB
chmod +x "$TN_TREE/gh"

TN_CREATED="$TN_TREE/created"

# Вызов команды из дерева-фикстуры. Ввод пустой: тело заявки набор не проверяет.
tn_run() {
    rm -rf "$TN_TREE/docs" "$TN_CREATED"
    ( cd "$TN_TREE" && TN_CREATED="$TN_CREATED" TN_EPIC_LABELS="${TN_EPIC_LABELS-{\"name\":\"epic\"}}" \
        GH_BIN="$TN_TREE/gh" RT_GH_RETRY_MS=1 \
        node tools/task-new.mjs "$@" < /dev/null 2>&1 )
}

# --- SC-AK-932 — команда заводит эпик -------------------------------------------------
#
# Эпик до этого заводился руками: карточка, метка, план и ветка — четыре шага, и промах на любом
# давал эпик, невидимый сверке очереди. Метка не поставлена — сверка считает карточку обычной
# задачей; плана нет — карточка указывает в пустоту.
tn_config
TN_OUT="$(tn_run --epic --title 'Поставка идёт эпиками' --slug work-by-epics)"

if printf '%s' "$(cat "$TN_CREATED" 2>/dev/null)" | grep -q -- '--label epic'; then got="есть"; else got="нет"; fi
report "SC-AK-932 — карточка создана с меткой эпика" "$got" "есть"

if [ -f "$TN_TREE/docs/plans/work-by-epics.md" ]; then got="есть"; else got="нет"; fi
report "SC-AK-932 — заготовка плана легла в каталог планов" "$got" "есть"

if grep -q 'Замысел эпика — docs/plans/work-by-epics.md' "$TN_CREATED" 2>/dev/null; then got="есть"; else got="нет"; fi
report "SC-AK-932 — тело карточки называет путь к плану" "$got" "есть"

if grep -q 'RT-4242 · \*\*Ветка эпика:\*\* `RT-4242-work-by-epics`' "$TN_TREE/docs/plans/work-by-epics.md" 2>/dev/null; then
    got="есть"
else got="нет"; fi
report "SC-AK-932 — в плане проставлены номер и ветка эпика" "$got" "есть"

if printf '%s' "$TN_OUT" | grep -q 'git checkout -b RT-4242-work-by-epics origin/main'; then got="есть"; else got="нет"; fi
report "SC-AK-932 — напечатана строка ветки эпика от главной" "$got" "есть"

# Состав эпика читается сверкой как таблица со столбцом задач: без неё карточка указывает на
# документ, который состава не несёт, и все задачи эпика читаются как чужие.
if grep -q '| Задача' "$TN_TREE/docs/plans/work-by-epics.md" 2>/dev/null; then got="есть"; else got="нет"; fi
report "SC-AK-932 — в заготовке стоит таблица состава" "$got" "есть"

# Обычная задача от эпика не отличается ничем, кроме довода: ни метки, ни плана, ни базы у ветки.
TN_OUT="$(tn_run --outside-epic 'владелец попросил отдельно' --title 'Письма владельцу не уходят' --slug mail-silence)"
if printf '%s' "$TN_OUT" | grep -q 'git checkout -b RT-4242-mail-silence$'; then got="есть"; else got="нет"; fi
report "SC-AK-932 — у обычной задачи база ветки не печатается" "$got" "есть"

# --- SC-AK-933 — вызов отбивается до создания карточки --------------------------------
#
# Карточку с доски снимает только администратор: отказ после создания оставил бы эпик без метки и
# без плана — то есть невидимый сверке именно как эпик.
tn_config 'docs/plans' ''
TN_OUT="$(tn_run --epic --title 'Поставка идёт эпиками' --slug work-by-epics)"
if [ -f "$TN_CREATED" ]; then got="создана"; else got="нет"; fi
report "SC-AK-933 — без метки эпика карточка не создаётся" "$got" "нет"
if printf '%s' "$TN_OUT" | grep -q 'board.epicLabel'; then got="есть"; else got="нет"; fi
report "SC-AK-933 — отказ называет ключ настройки метки" "$got" "есть"

tn_config '' 'epic'
TN_OUT="$(tn_run --epic --title 'Поставка идёт эпиками' --slug work-by-epics)"
if [ -f "$TN_CREATED" ]; then got="создана"; else got="нет"; fi
report "SC-AK-933 — без каталога планов карточка не создаётся" "$got" "нет"
if printf '%s' "$TN_OUT" | grep -q 'plansDir'; then got="есть"; else got="нет"; fi
report "SC-AK-933 — отказ называет ключ каталога планов" "$got" "есть"

tn_config
TN_OUT="$(tn_run --epic --title 'Поставка идёт эпиками')"
if [ -f "$TN_CREATED" ]; then got="создана"; else got="нет"; fi
report "SC-AK-933 — без короткого имени карточка не создаётся" "$got" "нет"
if printf '%s' "$TN_OUT" | grep -q -- '--slug'; then got="есть"; else got="нет"; fi
report "SC-AK-933 — отказ называет недостающий довод" "$got" "есть"

# --- SC-AK-934 — задача заводится под эпиком ------------------------------------------
#
# Связь задачи с эпиком читается сверкой в одном виде, и написанная рукой строка выходит своим
# видом через раз: сверка тогда говорит, что задача не принадлежит эпику, а исполнитель видит эпик
# названным в теле. База ветки при этом бралась из рабочей копии — то есть какая была отведена.
tn_config

# План эпика лежит на диске: из него читается ветка эпика.
tn_epic_plan() {
    mkdir -p "$TN_TREE/docs/plans"
    printf '# Поставка идёт эпиками\n\n**Эпик:** RT-1921 · **Ветка эпика:** `RT-1921-work-by-epics`\n' \
        > "$TN_TREE/docs/plans/work-by-epics.md"
}

# Вызов под эпиком: план эпика кладётся после уборки, иначе ветку эпика прочитать неоткуда.
tn_run_under_epic() {
    rm -rf "$TN_TREE/docs" "$TN_CREATED"
    tn_epic_plan
    ( cd "$TN_TREE" && TN_CREATED="$TN_CREATED" TN_EPIC_LABELS="$1" GH_BIN="$TN_TREE/gh" RT_GH_RETRY_MS=1 \
        node tools/task-new.mjs --epic-of 1921 --title 'Команда заводит эпик' --slug command-creates-epic \
        < /dev/null 2>&1 )
}

TN_OUT="$(tn_run_under_epic '{"name":"epic"}')"

if grep -q 'Задача эпика #1921, замысел — docs/plans/work-by-epics.md' "$TN_CREATED" 2>/dev/null; then
    got="есть"
else got="нет"; fi
report "SC-AK-934 — тело задачи объявляет эпик в читаемом сверкой виде" "$got" "есть"

if printf '%s' "$TN_OUT" | grep -q 'git checkout -b RT-4242-command-creates-epic RT-1921-work-by-epics'; then
    got="есть"
else got="нет"; fi
report "SC-AK-934 — строка ветки задачи названа от ветки эпика" "$got" "есть"

# Метки эпика на карточке нет — это обычная задача, и вешать на неё задачи нечего.
TN_OUT="$(tn_run_under_epic '{"name":"bug"}')"
if [ -f "$TN_CREATED" ]; then got="создана"; else got="нет"; fi
report "SC-AK-934 — под карточкой без метки эпика задача не заводится" "$got" "нет"
if printf '%s' "$TN_OUT" | grep -q 'не эпик\|is not an epic'; then got="есть"; else got="нет"; fi
report "SC-AK-934 — отказ называет, что карточка не эпик" "$got" "есть"

# Эпик и задача эпика разом — вид, которого этот порядок не знает.
TN_OUT="$(tn_run --epic --epic-of 1921 --title 'Поставка идёт эпиками' --slug work-by-epics)"
if [ -f "$TN_CREATED" ]; then got="создана"; else got="нет"; fi
report "SC-AK-934 — эпик и задача эпика разом не заводятся" "$got" "нет"
if printf '%s' "$TN_OUT" | grep -q -- '--epic and --epic-of'; then got="есть"; else got="нет"; fi
report "SC-AK-934 — отказ называет оба довода" "$got" "есть"

# --- SC-AK-935 — без эпика задача не заводится ----------------------------------------
#
# Задача вне эпика читается очередью как обычная, и то, что за ней ничего не стоит, видно только
# сверке — то есть после того, как работа сделана. Отказ печатается до создания карточки: снять её
# с доски может только администратор.
tn_config
TN_OUT="$(tn_run --title 'Письма владельцу не уходят' --slug mail-silence)"
if [ -f "$TN_CREATED" ]; then got="создана"; else got="нет"; fi
report "SC-AK-935 — без эпика карточка не создаётся" "$got" "нет"

# Отказ в виде «назови эпик» читается как «выхода нет» и обходится вызовом мимо команды: оба
# законных выхода стоят в одном отказе.
if printf '%s' "$TN_OUT" | grep -q -- '--epic-of'; then got="есть"; else got="нет"; fi
report "SC-AK-935 — отказ называет первый выход: назвать эпик" "$got" "есть"
if printf '%s' "$TN_OUT" | grep -q -- '--outside-epic'; then got="есть"; else got="нет"; fi
report "SC-AK-935 — отказ называет второй выход: слово владельца" "$got" "есть"

# Пустой довод неотличим от флага, набранного ради обхода отказа.
TN_OUT="$(tn_run --outside-epic '' --title 'Письма владельцу не уходят' --slug mail-silence)"
if [ -f "$TN_CREATED" ]; then got="создана"; else got="нет"; fi
report "SC-AK-935 — с пустым доводом карточка не создаётся" "$got" "нет"

# Слово владельца уезжает в тело: сказанное только в вызове следующий читатель не найдёт.
TN_OUT="$(tn_run --outside-epic 'владелец попросил отдельно' --title 'Письма владельцу не уходят' --slug mail-silence)"
if grep -q 'Работа вне эпика — владелец попросил отдельно' "$TN_CREATED" 2>/dev/null; then
    got="есть"
else got="нет"; fi
report "SC-AK-935 — довод владельца записан в тело задачи" "$got" "есть"

# Дерево, не назвавшее метку эпика, эпиков не знает вовсе: требовать их с каждой задачи значило бы
# остановить его работу в день установки.
tn_config 'docs/plans' ''
TN_OUT="$(tn_run --title 'Письма владельцу не уходят' --slug mail-silence)"
if [ -f "$TN_CREATED" ]; then got="создана"; else got="нет"; fi
report "SC-AK-935 — без метки эпика в дереве задача заводится как прежде" "$got" "создана"

rm -rf "$TN_TREE"
suite_result "заведение эпика"
