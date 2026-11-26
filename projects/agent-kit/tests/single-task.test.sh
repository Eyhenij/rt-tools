#!/usr/bin/env bash
# Сценарии единственной задачи разбора: `task:new --single` и строка в уже заведённой карточке.
#
# В хостинг набор не ходит: помощник подменён двойником, который складывает вызовы в журнал. Судится
# то, что решает команда: отказ до карточки и его порядок, строка тела и база напечатанной ветки.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "команда: единственная задача разбора"

ST_TREE="$(mktemp -d)"
mkdir -p "$ST_TREE/tools/task-flow/measure" "$ST_TREE/.claude/rt-kit" "$ST_TREE/docs/plans"
for ST_NAME in board board-runs board-gh board-epic-link board-epic-plan board-task-dirs task-new task-new-queue task-new-epic task-new-single; do
    cp "$CHECKS/$ST_NAME.github.mjs" "$ST_TREE/tools/$ST_NAME.mjs"
done
cp "$CHECKS/rt-kit-checks.config.mjs" "$CHECKS/tree-assignment.mjs" "$ST_TREE/tools/"
cp "$CHECKS/../task-flow/measure/text.mjs" "$ST_TREE/tools/task-flow/measure/"

cat > "$ST_TREE/.claude/rt-kit/checks.json" <<'CFG'
{
    "plansDir": "docs/plans",
    "treeNameFile": ".claude/rt-kit/tree-name",
    "assignmentsFile": "docs/assignments.md",
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

# Двойник хостинга: карточки лежат файлами по номеру, записи — в журнале.
cat > "$ST_TREE/gh" <<'STUB'
#!/usr/bin/env bash
all="$*"
case "$all" in
    *"issue create"*) printf '%s\n' "$all" > "$ST_DIR/created"; printf 'https://github.com/o/r/issues/4242\n' ;;
    *"-X PATCH"*"body="*) printf '%s\n' "$all" > "$ST_DIR/patched" ;;
    *addProjectV2ItemById*) printf '{"data":{"addProjectV2ItemById":{"item":{"id":"IT_1"}}}}\n' ;;
    *projectItems*)
        printf '%s\n' '{"data":{"repository":{"issue":{"projectItems":{"nodes":[{"id":"IT_1","project":{"id":"PVT_x"},"status":{"name":"Backlog"}}]}}}}}'
        ;;
    "issue view 4242"*)
        printf '%s\n' '{"number":4242,"title":"[RT-4242] Одна","state":"OPEN","assignees":[{"login":"bot"}],"labels":[],"body":""}'
        ;;
    "issue view "*)
        [ -z "${ST_OFFLINE:-}" ] || { printf 'dial tcp: lookup api.github.com\n' >&2; exit 1; }
        cat "$ST_DIR/issue-$(printf '%s' "$all" | cut -d' ' -f3).json" 2>/dev/null || { printf 'not found\n' >&2; exit 1; }
        ;;
    *node_id*) printf '{"id":"I_node"}\n' ;;
    *) printf '{"data":{}}\n' ;;
esac
STUB
chmod +x "$ST_TREE/gh"
export ST_DIR="$ST_TREE"

# Разбор: слова владельца, ответ и строка числа, которую даёт довод.
st_grill() {
    mkdir -p "$ST_TREE/docs/tasks/$1"
    printf '%s\n' '# Grill' '' '## The owner request' '' '> Письма не уходят' '' "${@:2}" '' '## Questions and answers' '' '**Что делать?**' 'Починить.' \
        > "$ST_TREE/docs/tasks/$1/grill.md"
}
# Чистое дерево: ни папок, ни строк назначений, ни записанных вызовов.
st_reset() {
    rm -rf "$ST_TREE/docs/tasks" "$ST_TREE/docs/assignments.md" "$ST_TREE/.claude/rt-kit/tree-name"
    rm -f "$ST_TREE"/created "$ST_TREE"/patched "$ST_TREE"/issue-*.json
    mkdir -p "$ST_TREE/docs/tasks"
}
# Копия, которой назначен номер.
st_assigned() {
    printf 'own\n' > "$ST_TREE/.claude/rt-kit/tree-name"
    printf '%s\n' '| Копия | Эпик | План | Выдано |' '| --- | --- | --- | --- |' "| own | RT-$1 | docs/plans/p.md | 25.11 |" > "$ST_TREE/docs/assignments.md"
}
st_new() {
    ( cd "$ST_TREE" && printf '%s' "${ST_BODY-}" | GH_BIN="$ST_TREE/gh" RT_GH_RETRY_MS=1 RT_TASK_NEW_PAUSES_MS=1 \
        node tools/task-new.mjs --title 'Письма не уходят' "$@" 2>&1 )
}
st_card() {
    ( cd "$ST_TREE" && GH_BIN="$ST_TREE/gh" RT_GH_RETRY_MS=1 node tools/task-new-single.mjs "$@" 2>&1 )
}
# Отказ: слова на месте и карточки нет. Первый довод — чего ждём, остальные — вызов.
st_refused() {
    local want="$1" out
    shift
    out="$(st_new "$@")"
    printf '%s|%s' "$(printf '%s' "$out" | grep -c -e "$want")" "$([ -f "$ST_TREE/created" ] && echo создана || echo нет)"
}
ONE='**Задач в разборе:** 1'

# --- SC-AK-1988 — отказы до карточки, в названном порядке ---------------------------------------
st_reset
for ST_NEAR in --epic '--epic-of 7' '--outside-epic слово'; do
    # shellcheck disable=SC2086
    report "SC-AK-1988 — single refused: соседство с «${ST_NEAR}» раньше черновика" "$(st_refused '--single goes with none' --single --slug mail $ST_NEAR)" '1|нет'
done
report "SC-AK-1988 — single refused: без короткого имени" "$(st_refused 'required for --single' --single)" '1|нет'
report "SC-AK-1988 — single refused: черновика нет" "$(st_refused 'there is no grill: docs/tasks/_draft-mail/grill.md' --single --slug mail)" '1|нет'
st_grill _draft-mail "$ONE"
printf '## The owner request\n\n> <verbatim>\n\n**Задач в разборе:** 2\n' > "$ST_TREE/docs/tasks/_draft-mail/grill.md"
report "SC-AK-1988 — single refused: неотвеченный разбор раньше числа" "$(st_refused 'is not answered' --single --slug mail)" '1|нет'
st_grill _draft-mail
report "SC-AK-1988 — single refused: строки числа нет" "$(st_refused 'no line «\*\*Задач в разборе' --single --slug mail)" '1|нет'
st_grill _draft-mail '**Задач в разборе:** <число>'
report "SC-AK-1988 — single refused: число не написано" "$(st_refused 'is not a number' --single --slug mail)" '1|нет'
st_grill _draft-mail "$ONE" '**Tasks of the grill:** 1'
report "SC-AK-1988 — single refused: двух строк числа" "$(st_refused '2 lines of the count' --single --slug mail)" '1|нет'
# Число раньше эпика в теле и раньше эпика копии: разбор из двух задач всегда ведёт к эпику.
st_grill _draft-mail '**Задач в разборе:** 2'
st_assigned 7
printf '{"state":"OPEN","labels":[{"name":"epic"}]}\n' > "$ST_TREE/issue-7.json"
report "SC-AK-1988 — single refused: из двух назван --epic, раньше эпика тела и копии" \
    "$(ST_BODY='Задача эпика #7, план — docs/plans/p.md' st_refused 'Задач в разборе:\*\* 2.*--epic,' --single --slug mail)" '1|нет'
st_grill _draft-mail "$ONE"
report "SC-AK-1988 — single refused: тело называет эпик, раньше эпика копии" \
    "$(ST_BODY='Задача эпика #7, план — docs/plans/p.md' st_refused 'already names the epic #7' --single --slug mail)" '1|нет'
report "SC-AK-1988 — single refused: у копии открытый эпик, названы оба выхода" \
    "$(st_refused 'leads the open epic RT-7.*--epic-of 7.*--outside-epic' --single --slug mail)" '1|нет'
report "SC-AK-1988 — single refused: хостинг молчит об эпике копии" "$(ST_OFFLINE=1 st_refused '^task-new: .*dial tcp' --single --slug mail)" '1|нет'
report "SC-AK-1988 — single refused: слова команды, набранные доводом владельца" \
    "$(st_refused 'these words are written by --single' --outside-epic 'разбор дал одну задачу')" '1|нет'
report "SC-AK-1988 — single refused: те же слова с другой буквы и с хвостом на новой строке" \
    "$(st_refused 'these words are written by --single' --outside-epic $'Разбор дал одну задачу\nещё')" '1|нет'
report "SC-AK-1988 — single refused: те же слова строкой тела при доводе владельца" \
    "$(ST_BODY='Работа вне эпика — разбор дал одну задачу' st_refused 'these words are written by --single' --outside-epic слово)" '1|нет'
st_reset
st_grill _draft-mail "$ONE"
report "SC-AK-1988 — single refused: тело уже стоит вне эпика словом владельца" \
    "$(ST_BODY='Работа вне эпика — слово' st_refused 'already stands outside an epic by «слово»' --single --slug mail)" '1|нет'
st_grill _draft-mail '**Tasks of the grill:** 2'
report "SC-AK-1988 — single refused: названа строка, которая стоит в разборе" "$(st_refused 'says «\*\*Tasks of the grill:\*\* 2»' --single --slug mail)" '1|нет'
mv "$ST_TREE/tools/tree-assignment.mjs" "$ST_TREE/aside.mjs"
report "SC-AK-1988 — single refused: без модуля назначений отказ словами" "$(st_refused '^task-new: .*tree-assignment' --single --slug mail)" '1|нет'
mv "$ST_TREE/aside.mjs" "$ST_TREE/tools/tree-assignment.mjs"

# --- SC-AK-1989 — задача заведена ----------------------------------------------------------------
st_reset
st_grill _draft-mail "$ONE"
ST_OUT="$(ST_BODY='Описание.' st_new --single --slug mail)"
report "SC-AK-1989 — single created: тело несёт строку" "$(grep -c '^Работа вне эпика — разбор дал одну задачу' "$ST_TREE/created" 2>/dev/null)" 1
report "SC-AK-1989 — single created: ветка от главной" "$(printf '%s' "$ST_OUT" | grep -c 'git checkout -b RT-4242-mail origin/main$')" 1
report "SC-AK-1989 — single created: черновик стал папкой ветки" "$([ -f "$ST_TREE/docs/tasks/RT-4242-mail/grill.md" ] && echo есть)" есть
st_reset
st_grill _draft-mail '**Tasks of the grill:** 1'
st_new --single --slug mail > /dev/null
report "SC-AK-1989 — single created: английская строка числа" "$(grep -c '^Работа вне эпика — разбор дал одну задачу\|--body Работа вне эпика — разбор дал одну задачу' "$ST_TREE/created" 2>/dev/null)" 1
# Эпик копии закрыт, или её строка держит номер обычной задачи: живого эпика у неё нет.
for ST_LIVE in '{"state":"CLOSED","labels":[{"name":"epic"}]}' '{"state":"OPEN","labels":[{"name":"bug"}]}'; do
    st_reset
    st_grill _draft-mail "$ONE"
    st_assigned 7
    printf '%s\n' "$ST_LIVE" > "$ST_TREE/issue-7.json"
    st_new --single --slug mail > /dev/null
    report "SC-AK-1989 — single created: строка копии не живой эпик $ST_LIVE" "$([ -f "$ST_TREE/created" ] && echo создана)" создана
done

# --- SC-AK-1990 — строка в уже заведённой карточке -----------------------------------------------
st_reset
st_grill RT-55-mail "$ONE"
# Строка копии держит номер самой задачи, и это не эпик.
st_assigned 55
printf '{"body":"Описание.","labels":[],"state":"OPEN"}\n' > "$ST_TREE/issue-55.json"
ST_OUT="$(st_card 55 --slug mail)"
report "SC-AK-1990 — single card: строка дописана после тела" \
    "$(tr '\n' ' ' < "$ST_TREE/patched" 2>/dev/null | grep -c 'issues/55 -f body=Описание\.  Работа вне эпика — разбор дал одну задачу')" 1
report "SC-AK-1990 — single card: напечатана ветка от главной" "$(printf '%s' "$ST_OUT" | grep -c 'git checkout -b RT-55-mail origin/main')" 1
rm -f "$ST_TREE/patched"
printf '{"body":"Описание.\\n\\nРабота вне эпика — слово владельца","labels":[],"state":"OPEN"}\n' > "$ST_TREE/issue-55.json"
report "SC-AK-1990 — single card: вторая строка не пишется" \
    "$(st_card 55 --slug mail | grep -c 'already stands outside an epic: «слово владельца»')|$([ -f "$ST_TREE/patched" ] && echo писал)" '1|'
printf '{"body":"Задача эпика #7, план — docs/plans/p.md","labels":[],"state":"OPEN"}\n' > "$ST_TREE/issue-55.json"
report "SC-AK-1990 — single card: карточка с эпиком не тронута" "$(st_card 55 --slug mail | grep -c 'already names the epic #7')|$([ -f "$ST_TREE/patched" ] && echo писал)" '1|'
printf '{"body":"Описание.","labels":[{"name":"epic"}],"state":"OPEN"}\n' > "$ST_TREE/issue-55.json"
report "SC-AK-1990 — single card: карточка самого эпика не тронута" "$(st_card 55 --slug mail | grep -c '#55 is an epic')|$([ -f "$ST_TREE/patched" ] && echo писал)" '1|'
st_grill RT-55-mail '**Задач в разборе:** 2'
printf '{"body":"Описание.","labels":[],"state":"OPEN"}\n' > "$ST_TREE/issue-55.json"
report "SC-AK-1990 — single card: из двух задач карточка не тронута" "$(st_card 55 --slug mail | grep -c -e '--epic,')|$([ -f "$ST_TREE/patched" ] && echo писал)" '1|'
# Папки ветки ещё нет, разбор лежит черновиком: он становится её папкой и на вторую карточку не годится.
rm -rf "$ST_TREE/docs/tasks/RT-55-mail"
st_grill _draft-mail "$ONE"
report "SC-AK-1990 — single card: черновик стал папкой ветки" \
    "$(st_card 55 --slug mail | grep -c 'docs/tasks/_draft-mail/ → docs/tasks/RT-55-mail/')|$(ls "$ST_TREE/docs/tasks")" '1|RT-55-mail'
rm -f "$ST_TREE/patched"
printf '{"body":"Вторая.","labels":[],"state":"OPEN"}\n' > "$ST_TREE/issue-56.json"
report "SC-AK-1990 — single card: вторая карточка по тому же разбору отбита" \
    "$(st_card 56 --slug mail | grep -c 'there is no grill')|$([ -f "$ST_TREE/patched" ] && echo писал)" '1|'
printf '{"body":"Описание.","labels":[],"state":"CLOSED"}\n' > "$ST_TREE/issue-55.json"
report "SC-AK-1990 — single card: закрытая карточка не тронута" "$(st_card 55 --slug mail | grep -c '#55 is closed')|$([ -f "$ST_TREE/patched" ] && echo писал)" '1|'
report "SC-AK-1990 — single card: вызов без номера называет свой вид" "$(st_card --slug mail | grep -c 'task-new-single.mjs <number> --slug <slug>')" 1

printf '{"body":"Описание.","labels":[],"state":"OPEN"}\n' > "$ST_TREE/issue-55.json"
st_grill _draft-mail "$ONE"
report "SC-AK-1990 — single card: папка ветки рядом с черновиком — отказ" \
    "$(st_card 55 --slug mail | grep -c 'both stand: one grill answers for one card')|$([ -f "$ST_TREE/patched" ] && echo писал)" '1|'

# --- SC-AK-939 — довод владельца читается с карточки ----------------------------------------------
st_reset
report "SC-AK-939 — довод-образец в скобках отбит" "$(st_refused 'the reason stands on one line' --outside-epic '<слово владельца>')" '1|нет'
report "SC-AK-939 — довод на второй строке отбит" "$(st_refused 'the reason stands on one line' --outside-epic $'\nслово')" '1|нет'
report "SC-AK-939 — флаг вместо довода отбит" "$(st_refused 'takes a text, and «--single» is a flag' --outside-epic --single --slug mail)" '1|нет'

# --- SC-AK-1986 — строка читается на своём месте одной функцией ----------------------------------
st_outside() {
    ( cd "$ST_TREE" && ST_TEXT="$1" node --input-type=module -e "
        import { outsideReasonOf } from './tools/board-epic-link.mjs';
        process.stdout.write(outsideReasonOf(process.env.ST_TEXT) ?? 'нет');" )
}
report "SC-AK-1986 — outside line: CRLF и перечень" "$(st_outside $'Описание.\r\n- Работа вне эпика — слово\r\n')" слово
report "SC-AK-1986 — outside line: пустой довод не берёт следующую строку" "$(st_outside $'Работа вне эпика —\n\n## Дальше')" нет
report "SC-AK-1986 — outside line: слова через перевод строки не строка" "$(st_outside $'Работа\nвне эпика — слово')" нет
report "SC-AK-1986 — outside line: образец в скобках не слово" "$(st_outside 'Работа вне эпика — <слово владельца>')" нет
report "SC-AK-1986 — outside line: ограда кода и комментарий не строка" "$(st_outside $'```\nРабота вне эпика — а\n```\n<!--\nРабота вне эпика — б\n-->')" нет

# --- SC-AK-1985 — число разбора: пробелы, CRLF, ограда ---------------------------------------------
st_count() {
    ( cd "$ST_TREE" && ST_TEXT="$1" node --input-type=module -e "
        import { tasksOfGrill } from './tools/task-flow/measure/text.mjs';
        process.stdout.write(String(tasksOfGrill(process.env.ST_TEXT).count ?? 'нет'));" )
}
report "SC-AK-1985 — число с хвостовыми пробелами и CRLF" "$(st_count $'**Задач в разборе:** 1  \r\n')" 1
report "SC-AK-1985 — пример в ограде рядом с настоящей строкой" "$(st_count $'```\n**Задач в разборе:** 2\n```\n**Задач в разборе:** 1\n')" 1
report "SC-AK-1985 — непарная ограда в цитате строки не съедает" "$(st_count $'> вот ``` так\n\n**Задач в разборе:** 1\n\n> и ``` так')" 1
report "SC-AK-1985 — три знака посреди строки ограды не открывают" "$(st_count $'вот ``` так\n\n**Задач в разборе:** 1\n\n```\nкод\n```')" 1
report "SC-AK-1985 — ограда из четырёх и из тильд" "$(st_count $'````\n```\n**Задач в разборе:** 2\n```\n````\n~~~\n**Задач в разборе:** 3\n~~~\n**Задач в разборе:** 1\n')" 1
report "SC-AK-1985 — число за комментарием своей строки не открывает" "$(st_count '<!-- образец -->**Задач в разборе:** 1')" нет
report "SC-AK-1985 — одна ограда и комментарий числом не считаются" "$(st_count $'```\n**Задач в разборе:** 1\n```\n<!-- \n**Задач в разборе:** 1\n-->')" нет

# --- SC-AK-1984 — движок читает карточку с хостинга, а не двойник порта ----------------------------
cp -R "$CHECKS/../task-flow/." "$ST_TREE/tools/task-flow/"
git -C "$ST_TREE" -c init.defaultBranch=main init -q
st_issue() {
    ( cd "$ST_TREE" && GH_BIN="$ST_TREE/gh" RT_GH_RETRY_MS=1 node --input-type=module -e "
        import { open } from './tools/task-flow/source/host.mjs';
        const card = open().issue($1);
        process.stdout.write([card.epic ?? 'нет', card.outside ?? 'нет', card.isEpic].join('|'));" 2>&1 )
}
printf '{"number":61,"title":"[RT-61] Одна","body":"Работа вне эпика — разбор дал одну задачу","labels":[],"assignees":[],"state":"OPEN"}\n' > "$ST_TREE/issue-61.json"
report "SC-AK-1984 — outside an epic: источник хостинга отдаёт слова строки" "$(st_issue 61)" 'нет|разбор дал одну задачу|false'
printf '{"number":62,"title":"[RT-62] Эпик","body":"Описание.","labels":[{"name":"epic"}],"assignees":[],"state":"OPEN"}\n' > "$ST_TREE/issue-62.json"
report "SC-AK-1985 — outside an epic: источник хостинга узнаёт эпик по метке" "$(st_issue 62)" 'нет|нет|true'

rm -rf "$ST_TREE"

suite_result "команда: единственная задача разбора"
