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

# --- SC-AK-940 — объявление эпика читается одним видом ---------------------------------
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

report "SC-AK-940 — номер эпика прочитан из тела задачи" \
    "$(GE_BODY='Задача эпика #1921, замысел — docs/plans/work-by-epics.md' ge_read)" 1921
report "SC-AK-940 — ключ задачи вместо решётки читается так же" "$(GE_BODY='Задача эпика RT-1921' ge_read)" 1921
report "SC-AK-940 — падеж «задачи эпика» читается так же" "$(GE_BODY='Первая задачи эпика #7' ge_read)" 7

# Голое упоминание номера — не объявление: номер стоит в рассуждении, в цитате отказа и в списке
# того, чего работа не делает.
report "SC-AK-940 — голое упоминание номера не считается объявлением" "$(GE_BODY='Похоже на #1921, но это не эпик' ge_read)" 'нет'
report "SC-AK-940 — пустое тело не даёт эпика" "$(GE_BODY='' ge_read)" 'нет'

# --- SC-AK-941 — состояние задачи несёт номер эпика ------------------------------------
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

report "SC-AK-941 — состояние задачи несёт номер её эпика" "$(ge_state '"Задача эпика #1921"')" 1921
report "SC-AK-941 — у задачи вне эпика поле пустое" "$(ge_state '"Работа вне эпика — владелец попросил отдельно"')" 'нет'

rm -rf "$GE_TREE"
suite_result "гард поставки: эпик задачи"
