#!/usr/bin/env bash
# Сценарии гарда поставки об эпике: чем гард узнаёт эпик задачи и что он с этим делает.
#
# В хостинг набор не ходит: помощник подменён двойником, который отвечает по содержимому вызова.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард поставки: эпик задачи"

GE_TREE="$(mktemp -d)"
mkdir -p "$GE_TREE/tools" "$GE_TREE/.claude/rt-kit"
cp "$CHECKS/rt-kit-checks.config.mjs" "$GE_TREE/tools/"
cp "$CHECKS/board.github.mjs" "$GE_TREE/tools/board.mjs"
cp "$CHECKS/board-gh.github.mjs" "$GE_TREE/tools/board-gh.mjs"
cp "$CHECKS/board-epic-link.github.mjs" "$GE_TREE/tools/board-epic-link.mjs"
cp "$CHECKS/board-task-dirs.github.mjs" "$GE_TREE/tools/board-task-dirs.mjs"

cat > "$GE_TREE/.claude/rt-kit/checks.json" <<'CFG'
{
    "board": {
        "owner": "o",
        "repo": "r",
        "projectId": "PVT_x",
        "statusFieldId": "PVTSSF_x",
        "statusOptions": { "backlog": { "id": "bb", "name": "Backlog" } },
        "taskKey": "RT",
        "bot": "bot",
        "epicLabel": "epic"
    }
}
CFG

# --- SC-AK-971 — объявление эпика читается одним видом ---------------------------------
#
# Вид строки читают трое: команда заведения пишет её, сверка очереди судит связь в обе стороны,
# гард поставки берёт по ней основание ветки. Прочитанный в двух местах, один вид расходится
# молча: одна сторона требует того, чего другая не видит.
ge_read() {
    ( cd "$GE_TREE" && node --input-type=module -e "
        import { declaredEpicOf } from './tools/board-epic-link.mjs';
        process.stdout.write(String(declaredEpicOf(process.env.GE_BODY) ?? 'нет'));
    " 2>/dev/null )
}

report "SC-AK-971 — номер эпика прочитан из тела задачи" \
    "$(GE_BODY='Задача эпика #1921, замысел — docs/plans/work-by-epics.md' ge_read)" 1921
report "SC-AK-971 — ключ задачи вместо решётки читается так же" "$(GE_BODY='Задача эпика RT-1921' ge_read)" 1921
report "SC-AK-971 — падеж «задачи эпика» читается так же" "$(GE_BODY='Первая задачи эпика #7' ge_read)" 7

# Голое упоминание номера — не объявление: номер стоит в рассуждении, в цитате отказа и в списке
# того, чего работа не делает.
report "SC-AK-971 — голое упоминание номера не считается объявлением" "$(GE_BODY='Похоже на #1921, но это не эпик' ge_read)" 'нет'
report "SC-AK-971 — пустое тело не даёт эпика" "$(GE_BODY='' ge_read)" 'нет'

# --- SC-AK-972 — состояние задачи несёт номер эпика ------------------------------------
#
# Гарду больше неоткуда взять эпик: очередь не хранит ни веток, ни родства карточек. Второй заход
# за телом задачи стоил бы лишнего вызова и разошёлся бы с первым.
cat > "$GE_TREE/gh" <<'STUB'
#!/usr/bin/env bash
all="$*"
case "$all" in
    *"issue view"*)
        printf '%s' '{"number":42,"title":"[RT-42] Что-то не так","state":"OPEN","assignees":[{"login":"bot"}],"labels":[],"body":'
        printf '%s' "$GE_ISSUE_BODY"
        printf '%s\n' '}'
        ;;
    *'node(id:'*)
        printf '%s' '{"data":{"node":{"items":{"pageInfo":{"hasNextPage":false,"endCursor":null},'
        printf '%s\n' '"nodes":[{"id":"IT_1","status":{"name":"Backlog"},"content":{"__typename":"Issue","number":42}}]}}}}'
        ;;
    *) printf '{"data":{}}\n' ;;
esac
STUB
chmod +x "$GE_TREE/gh"

ge_state() {
    ( cd "$GE_TREE" && GE_ISSUE_BODY="$1" GH_BIN="$GE_TREE/gh" RT_GH_RETRY_MS=1 \
        node tools/board.mjs task 42 2>/dev/null | jq -r '.epic // "нет"' )
}

report "SC-AK-972 — состояние задачи несёт номер её эпика" "$(ge_state '"Задача эпика #1921"')" 1921
report "SC-AK-972 — у задачи вне эпика поле пустое" "$(ge_state '"Работа вне эпика — владелец попросил отдельно"')" 'нет'

# --- SC-AK-973 — ветка задачи берётся от ветки эпика ------------------------------------
#
# Гард судил основание только по главной и ветку задачи, отведённую от главной вместо ветки эпика,
# пропускал молча. Такая ветка оставляет эпик наполовину влитым до того, как сделана его последняя
# задача: слияние эпика не несёт из неё ничего.
GE_REPO="$(fixture_repo_branched main RT-1921-work-by-epics)"
mkdir -p "$GE_REPO/.claude/rt-kit"
printf '{"board":{"taskKey":"RT","owner":"o","repo":"r"}}\n' > "$GE_REPO/.claude/rt-kit/checks.json"
# Двойник помощника очереди: отвечает состоянием задачи, которое набор задаёт окружением.
printf 'rt_task_state() { printf %%s "$GE_TASK_STATE"; }\nRT_BOARD_EPIC_LABEL=epic\nRT_TASKS_DIR=docs/tasks\n' > "$GE_REPO/.claude/rt-kit/project.sh"
# У ветки эпика есть свой коммит — иначе главная её содержит, и судить нечего.
fixture_commit "$GE_REPO" "docs/plans/work-by-epics.md" "план эпика" "docs: план эпика"
# Удалённые ссылки заводятся руками: гард смотрит только на них — ветка, живущая на одной машине,
# основание, которого нет ни у кого другого.
git -C "$GE_REPO" update-ref refs/remotes/origin/main "$(git -C "$GE_REPO" rev-parse main)"
git -C "$GE_REPO" update-ref refs/remotes/origin/RT-1921-work-by-epics "$(git -C "$GE_REPO" rev-parse HEAD)"

# Двойник хостинга ставится и здесь. Гард поставки судит не только эпик: он спрашивает хостинг о
# своих конфликтующих заявках и отбивает заведение ветки, пока такая стоит. Без двойника вердикт
# зависел от того, что в очереди работ сегодня, — набор краснел изнутри гейта пуша и был зелёным
# при прямом запуске, потому что в гейт он входит ровно тогда, когда заявка и конфликтует.
ge_decision() {
    jq -n --arg c "git checkout -b RT-1925-guard-judges-epic-base $2" --arg d "$GE_REPO" \
        '{session_id:"tests",tool_name:"Bash",tool_input:{command:$c},cwd:$d}' \
        | ( cd "$GE_REPO" && GE_TASK_STATE="$1" GH_BIN="$GE_TREE/gh" RT_GH_RETRY_MS=1 \
            "$HOOKS/git-guard-delivery.sh" 2>/dev/null )
}

# Три сценария ниже ждут, что гард промолчит. Не дождавшись, они называют его первую строку, а не
# слово «отбито»: гейт пуша показывает только хвост вывода, и без этой строки разбор начинался с
# догадок о том, на что гард отбил на самом деле.
ge_silent() {
    local out="$1"
    if [ -z "$out" ]; then
        printf 'прошло'
    else
        printf '%s' "$out" | head -c 160 | tr '\n' ' '
    fi
}

GE_WITH_EPIC='{"exists":true,"open":true,"onBoard":true,"assigned":true,"numbered":true,"epic":"1921"}'
GE_NO_EPIC='{"exists":true,"open":true,"onBoard":true,"assigned":true,"numbered":true,"epic":null}'

GE_OUT="$(ge_decision "$GE_WITH_EPIC" origin/main)"
if [ -n "$GE_OUT" ]; then got="отбито"; else got="прошло"; fi
report "SC-AK-973 — ветка задачи от главной отбита" "$got" "отбито"

if printf '%s' "$GE_OUT" | grep -q 'RT-1921-work-by-epics'; then got="есть"; else got="нет"; fi
report "SC-AK-973 — отказ называет ветку эпика" "$got" "есть"

if [ -z "$(ge_decision "$GE_WITH_EPIC" origin/RT-1921-work-by-epics)" ]; then got="прошло"; else got="отбито"; fi
report "SC-AK-973 — ветка от ветки эпика проходит" "$got" "прошло"

got="$(ge_silent "$(ge_decision "$GE_NO_EPIC" origin/main)")"
report "SC-AK-973 — у задачи без эпика основание судится по главной, как прежде" "$got" "прошло"


# --- SC-AK-974 — заявка задачи идёт в ветку эпика ---------------------------------------
#
# Гард пропускал любое основание и требовал только влитой главной. Заявка в главную уносит задачу
# мимо её эпика: эпик отдаётся без неё, а обозреватель видит правку рядом со всем, что лежит в
# главной и не лежит в эпике.
git -C "$GE_REPO" checkout -q -b RT-1925-guard-judges-epic-base 2>/dev/null
git -C "$GE_REPO" update-ref refs/remotes/origin/RT-1921-work-by-epics "$(git -C "$GE_REPO" rev-parse HEAD)"

ge_pull() {
    jq -n --arg c "$2" --arg d "$GE_REPO" \
        '{session_id:"tests",tool_name:"Bash",tool_input:{command:$c},cwd:$d}' \
        | ( cd "$GE_REPO" && GE_TASK_STATE="$1" GH_BIN="$GE_TREE/gh" RT_GH_RETRY_MS=1 \
            "$HOOKS/git-guard-delivery.sh" 2>/dev/null )
}

GE_PR_MAIN="gh pr create --base main --title '[RT-1925] Что-то' --body 'тело
## Оставшийся шаг
не осталось'"
GE_PR_EPIC="gh pr create --base RT-1921-work-by-epics --title '[RT-1925] Что-то' --body 'тело
## Оставшийся шаг
не осталось'"

GE_OUT="$(ge_pull "$GE_WITH_EPIC" "$GE_PR_MAIN")"
if printf '%s' "$GE_OUT" | grep -q 'RT-1921-work-by-epics'; then got="отбито"; else got="прошло"; fi
report "SC-AK-974 — заявка с основанием «главная» отбита и названа ветка эпика" "$got" "отбито"

GE_OUT="$(ge_pull "$GE_WITH_EPIC" "$GE_PR_EPIC")"
if printf '%s' "$GE_OUT" | grep -q 'базе\|base here\|--base'; then got="отбито"; else got="прошло"; fi
report "SC-AK-974 — заявка с основанием ветки эпика по основанию не отбита" "$got" "прошло"

GE_OUT="$(ge_pull "$GE_NO_EPIC" "$GE_PR_MAIN")"
if printf '%s' "$GE_OUT" | grep -q 'RT-1921-work-by-epics'; then got="$(ge_silent "$GE_OUT")"; else got="прошло"; fi
report "SC-AK-974 — у задачи без эпика основание заявки не судится" "$got" "прошло"


# --- SC-AK-975 — заявка эпика ждёт разбора папок его задач ------------------------------
#
# Гард папок читает папку одной задачи — по имени ветки, — а у ветки эпика своей нет: всякая
# лежащая там папка принадлежит задаче эпика, работа по которой не закрыта. Влитый как есть, эпик
# уносит папки незаконченных работ в главную.
git -C "$GE_REPO" checkout -q RT-1921-work-by-epics 2>/dev/null
fixture_commit "$GE_REPO" "docs/tasks/RT-1930-something/plan.md" "замысел" "docs: папка задачи"

GE_EPIC_CARD='{"exists":true,"open":true,"onBoard":true,"assigned":true,"numbered":true,"labels":["epic"]}'
GE_EPIC_PR="gh pr create --base main --title '[RT-1921] Работа ведётся эпиками' --body 'тело
## Оставшийся шаг
не осталось'"

GE_OUT="$(ge_pull "$GE_EPIC_CARD" "$GE_EPIC_PR")"
if printf '%s' "$GE_OUT" | grep -q 'RT-1930-something'; then got="отбито"; else got="прошло"; fi
report "SC-AK-975 — заявка эпика с папкой задачи отбита и папка названа" "$got" "отбито"

fixture_remove "$GE_REPO" "docs/tasks/RT-1930-something" "docs: папка задачи разобрана"
GE_OUT="$(ge_pull "$GE_EPIC_CARD" "$GE_EPIC_PR")"
if printf '%s' "$GE_OUT" | grep -q 'папк\|folders of its tasks'; then got="$(ge_silent "$GE_OUT")"; else got="прошло"; fi
report "SC-AK-975 — без папок заявка эпика по этому условию не отбита" "$got" "прошло"

# Карточка без метки эпика — обычная задача, и это условие её не касается.
fixture_commit "$GE_REPO" "docs/tasks/RT-1930-something/plan.md" "замысел" "docs: папка задачи снова"
GE_OUT="$(ge_pull "$GE_NO_EPIC" "$GE_EPIC_PR")"
if printf '%s' "$GE_OUT" | grep -q 'RT-1930-something'; then got="$(ge_silent "$GE_OUT")"; else got="прошло"; fi
report "SC-AK-975 — у карточки без метки эпика это условие не судится" "$got" "прошло"

rm -rf "$GE_REPO"
rm -rf "$GE_TREE"
suite_result "гард поставки: эпик задачи"
