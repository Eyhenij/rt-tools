#!/usr/bin/env bash
# Сценарии пятого шага заведения задачи: подтверждение очередью работ.
#
# В хостинг набор не ходит: помощник подменён двойником, который отвечает по содержимому вызова,
# а вызовы складывает в журнал. Судится то, что решает сама команда: каким запросом читается
# карточка, сколько ждётся появления и что печатается после окна.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "команда: подтверждение заведённой задачи очередью"

TQ_TREE="$(mktemp -d)"
mkdir -p "$TQ_TREE/tools" "$TQ_TREE/.claude/rt-kit"
cp "$CHECKS/rt-kit-checks.config.mjs" "$TQ_TREE/tools/"
cp "$CHECKS/board.github.mjs" "$TQ_TREE/tools/board.mjs"
cp "$CHECKS/board-gh.github.mjs" "$TQ_TREE/tools/board-gh.mjs"
cp "$CHECKS/board-epic-link.github.mjs" "$TQ_TREE/tools/board-epic-link.mjs"
cp "$CHECKS/board-epic-plan.github.mjs" "$TQ_TREE/tools/board-epic-plan.mjs"
cp "$CHECKS/board-task-dirs.github.mjs" "$TQ_TREE/tools/board-task-dirs.mjs"
cp "$CHECKS/task-new.github.mjs" "$TQ_TREE/tools/task-new.mjs"
cp "$CHECKS/task-new-queue.github.mjs" "$TQ_TREE/tools/task-new-queue.mjs"

cat > "$TQ_TREE/.claude/rt-kit/checks.json" <<'CFG'
{
    "plansDir": "docs/plans",
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

# Двойник хостинга. Прямой запрос к карточке отвечает пустым списком, пока не пришёл его номер
# `TQ_APPEAR_AT`: так очередь «не отдаёт карточку сразу». Чтение всего списка борды тоже есть, но
# его вызов попадает в журнал, и набор следит, что команда им не пользуется.
cat > "$TQ_TREE/gh" <<'STUB'
#!/usr/bin/env bash
all="$*"
printf '%s\n' "$all" >> "$TQ_LOG"
case "$all" in
    *"issue create"*) printf 'https://github.com/o/r/issues/4242\n' ;;
    *"addProjectV2ItemById"*) printf '{"data":{"addProjectV2ItemById":{"item":{"id":"IT_1"}}}}\n' ;;
    *projectItems*)
        count=$(( $(cat "$TQ_COUNT" 2>/dev/null || echo 0) + 1 ))
        printf '%s' "$count" > "$TQ_COUNT"
        if [ "$count" -ge "${TQ_APPEAR_AT:-1}" ]; then
            printf '%s\n' '{"data":{"repository":{"issue":{"projectItems":{"nodes":[{"id":"IT_1","project":{"id":"PVT_x"},"status":{"name":"Backlog"}}]}}}}}'
        else
            printf '%s\n' '{"data":{"repository":{"issue":{"projectItems":{"nodes":[]}}}}}'
        fi
        ;;
    *'node(id:'*)
        printf '%s' '{"data":{"node":{"items":{"pageInfo":{"hasNextPage":false,"endCursor":null},'
        printf '%s\n' '"nodes":[{"id":"IT_1","status":{"name":"Backlog"},"content":{"__typename":"Issue","number":4242}}]}}}}'
        ;;
    *"issue view"*)
        printf '%s\n' '{"number":4242,"title":"[RT-4242] Письма владельцу не уходят","state":"OPEN","assignees":[{"login":"bot"}],"labels":[],"body":""}'
        ;;
    *node_id*) printf '{"id":"I_node"}\n' ;;
    *) printf '{"data":{}}\n' ;;
esac
STUB
chmod +x "$TQ_TREE/gh"

TQ_LOG="$TQ_TREE/calls.log"
TQ_COUNT="$TQ_TREE/direct.count"

# Вызов команды: паузы окна задаются списком в миллисекундах, чтобы набор не ждал тридцать секунд.
# Последняя строка вывода — код выхода.
tq_run() {
    rm -f "$TQ_LOG" "$TQ_COUNT"
    ( cd "$TQ_TREE" && TQ_LOG="$TQ_LOG" TQ_COUNT="$TQ_COUNT" TQ_APPEAR_AT="$1" RT_TASK_NEW_PAUSES_MS="$2" \
        GH_BIN="$TQ_TREE/gh" RT_GH_RETRY_MS=1 \
        node tools/task-new.mjs --outside-epic 'владелец попросил отдельно' --title 'Письма владельцу не уходят' --slug mail-silence \
        < /dev/null 2>&1; printf 'exit=%s\n' "$?" )
}

# --- SC-AK-1214 — карточка читается прямым запросом, весь список борды не читается -------------
#
# Чтение всего списка занимало около трёх секунд на двухстах карточках, и три таких чтения давали
# окно в двенадцать секунд. Прямой запрос по самой задаче отвечает меньше секунды.
TQ_OUT="$(tq_run 1 '100,100')"
if printf '%s' "$TQ_OUT" | grep -q 'in the work queue: the column «Backlog», assignee bot'; then got="есть"; else got="нет"; fi
report "SC-AK-1214 — столбец карточки назван из прямого ответа" "$got" "есть"
report "SC-AK-1214 — весь список борды не читается" "$(grep -c 'node(id:' "$TQ_LOG")" 0
report "SC-AK-1214 — карточка спрошена с первого раза один раз" "$(cat "$TQ_COUNT")" 1
if printf '%s' "$TQ_OUT" | grep -q 'exit=0'; then got="нуль"; else got="не нуль"; fi
report "SC-AK-1214 — вызов кончается нулём" "$got" "нуль"

# --- SC-AK-1215 — «NO» не печатается, пока идёт окно ожидания ----------------------------------
#
# Карточка появилась на третьем чтении. До этого очередь отвечала пусто, и это не «нет на борде».
TQ_OUT="$(tq_run 3 '100,100')"
if printf '%s' "$TQ_OUT" | grep -q 'in the work queue: NO'; then got="напечатано"; else got="нет"; fi
report "SC-AK-1215 — «NO» внутри окна не печатается" "$got" "нет"
report "SC-AK-1215 — карточка спрошена трижды" "$(cat "$TQ_COUNT")" 3
if printf '%s' "$TQ_OUT" | grep -q 'exit=0'; then got="нуль"; else got="не нуль"; fi
report "SC-AK-1215 — вызов кончается нулём" "$got" "нуль"

# --- SC-AK-1216 — после окна печатается «NO» с числом секунд ожидания --------------------------
TQ_OUT="$(tq_run 99 '100,100')"
if printf '%s' "$TQ_OUT" | grep -q 'in the work queue: NO — not seen in 0.2 s of waiting'; then got="есть"; else got="нет"; fi
report "SC-AK-1216 — строка ответа называет, сколько секунд ждали" "$got" "есть"
report "SC-AK-1216 — карточка спрошена по числу пауз плюс один" "$(cat "$TQ_COUNT")" 3
if printf '%s' "$TQ_OUT" | grep -q 'exit=1'; then got="один"; else got="иначе"; fi
report "SC-AK-1216 — вызов кончается кодом один" "$got" "один"

rm -rf "$TQ_TREE"

suite_result "команда: подтверждение заведённой задачи очередью"
