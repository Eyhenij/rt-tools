#!/usr/bin/env bash
# Сценарии таблицы задач эпика: состав берётся из замысла, состояние — у хостинга.
#
# Сеть здесь не трогается: помощник хостинга подставляется через `GH_BIN` и отвечает тем, что
# сценарий положил рядом. Иначе набор судил бы очередь работ дерева, в котором его запустили.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: таблица задач эпика"

ET_TREE="$(mktemp -d)"
mkdir -p "$ET_TREE/tools" "$ET_TREE/.claude/rt-kit" "$ET_TREE/docs/plans" "$ET_TREE/answers"
cp "$CHECKS/rt-kit-checks.config.mjs" "$ET_TREE/tools/"
cp "$CHECKS/board.github.mjs" "$ET_TREE/tools/board.mjs"
cp "$CHECKS/board-gh.github.mjs" "$ET_TREE/tools/board-gh.mjs"
cp "$CHECKS/board-runs.github.mjs" "$ET_TREE/tools/board-runs.mjs"
cp "$CHECKS/board-epics.github.mjs" "$ET_TREE/tools/board-epics.mjs"
cp "$CHECKS/epic-table.github.mjs" "$ET_TREE/tools/epic-table.mjs"

git -C "$ET_TREE" init -q 2>/dev/null
git -C "$ET_TREE" config commit.gpgsign false 2>/dev/null
# Первый коммит нужен ради возвратов на ветку: у дерева без коммитов ветки нет как ссылки, и
# `checkout` обратно молча не срабатывает — следом краснеет половина сценариев.
git -C "$ET_TREE" -c user.email=probe@probe -c user.name=probe commit -q --allow-empty -m probe 2>/dev/null
git -C "$ET_TREE" checkout -q -b RT-902-probe 2>/dev/null

HEAD_SHA='0123456789abcdef0123456789abcdef01234567'

# Карточки лежат файлами по номеру: имя переменной окружения на номер задачи собиралось бы в
# помощнике, и опечатка в нём молча давала бы «задачи нет».
cat > "$ET_TREE/gh" <<'STUB'
#!/usr/bin/env bash
args="$*"
case "$args" in
    "issue view "*)
        # shellcheck disable=SC2086
        set -- $args
        file="$STUB_DIR/issue-$3.json"
        if [ -n "$STUB_OFFLINE" ]; then printf 'dial tcp: lookup api.github.com\n' >&2; exit 1; fi
        if [ -f "$file" ]; then cat "$file"; else printf 'not found\n' >&2; exit 1; fi ;;
    *graphql*) printf '%s' "$STUB_BOARD" ;;
    "pr list"*) printf '%s' "$STUB_PULLS" ;;
    *actions/runs*per_page=20*) printf '%s\n' "${STUB_VERDICT:-none}" ;;
    *) printf 'неожиданный вызов: %s\n' "$args" >&2; exit 1 ;;
esac
STUB
chmod +x "$ET_TREE/gh"
export STUB_DIR="$ET_TREE/answers"

printf '%s\n' '{"tasksDir":"docs/tasks","board":{"owner":"probe","repo":"tree","projectId":"P","statusFieldId":"F","statusOptions":{"in-progress":{"id":"p","name":"In progress"}},"taskKey":"RT","epicLabel":"epic","bot":"probe-bot","tokenPath":"","reviewer":"probe"}}' \
    > "$ET_TREE/.claude/rt-kit/checks.json"

cat > "$ET_TREE/docs/plans/probe.md" <<'PLAN'
# Эпик RT-900 — проба

## Зачем

Первая фраза замысла. Вторая фраза, в абзац не идущая.

## Порядок задач

| Порядок | Задача | О чём              |
| ------- | ------ | ------------------ |
| 1       | RT-903 | Третья по номеру   |
| 2       | RT-901 | Первая по номеру   |
| 3       | RT-902 | Вторая по номеру   |
| 4       | RT-904 | Заведена не будет  |
PLAN

epic_body() {
    printf '{"number":900,"title":"[RT-900] Эпик пробы","state":"OPEN","labels":[{"name":"epic"}],"body":%s}' "$1"
}
epic_body '"Порядок задач лежит в `docs/plans/probe.md`."' > "$ET_TREE/answers/issue-900.json"
printf '%s\n' '{"number":901,"title":"[RT-901] Первая по номеру","state":"CLOSED","labels":[],"body":"Задача эпика #900."}' > "$ET_TREE/answers/issue-901.json"
printf '%s\n' '{"number":902,"title":"[RT-902] Вторая по номеру","state":"OPEN","labels":[],"body":"Задача эпика #900."}' > "$ET_TREE/answers/issue-902.json"
printf '%s\n' '{"number":903,"title":"[RT-903] Третья по номеру","state":"OPEN","labels":[],"body":"Задача эпика #900."}' > "$ET_TREE/answers/issue-903.json"

export STUB_BOARD='{"data":{"node":{"items":{"pageInfo":{"hasNextPage":false,"endCursor":null},"nodes":[{"id":"item-3","status":{"name":"In progress","optionId":"p"},"content":{"__typename":"Issue","number":903}}]}}}}'
export STUB_PULLS="$(printf '[{"number":950,"title":"[RT-902] Правка","headRefName":"RT-902-probe","headRefOid":"%s","isDraft":true,"body":"Closes #902"}]' "$HEAD_SHA")"
export STUB_VERDICT=success

et_run() {
    (cd "$ET_TREE" && GH_BIN="$ET_TREE/gh" node tools/epic-table.mjs "$@" 2>&1)
}
et_code() {
    (cd "$ET_TREE" && GH_BIN="$ET_TREE/gh" node tools/epic-table.mjs "$@" > /dev/null 2>&1)
    printf '%s' "$?"
}
et_says() {
    local pattern="$1"
    shift
    et_run "$@" | grep -cE "$pattern"
}

# --- SC-AK-969 — эпик берётся из текущей ветки ---------------------------------------------
report "SC-AK-969 — код нулевой" "$(et_code)" 0
report "SC-AK-969 — назван эпик ветки" "$(et_says 'Эпик «Эпик пробы» \(RT-900\)')" 1
report "SC-AK-969 — сказано, сколько задач" "$(et_says 'Задач 4')" 1
report "SC-AK-969 — первая фраза замысла в абзаце" "$(et_says 'Первая фраза замысла\.')" 1
report "SC-AK-969 — вторая фраза в абзац не идёт" "$(et_says 'Вторая фраза')" 0

# --- SC-AK-970 — довод называет эпик, и ветка не спрашивается -------------------------------
# Ветка называет задачу, карточки которой у хостинга нет: без довода отсюда идёт отказ, и
# собранная таблица доказывает, что довод взят раньше ветки.
git -C "$ET_TREE" checkout -q -b RT-999-probe 2>/dev/null
report "SC-AK-970 — без довода отсюда отказ" "$(et_code)" 1
report "SC-AK-970 — по доводу таблица собрана" "$(et_code 900)" 0
report "SC-AK-970 — назван эпик довода" "$(et_says 'Эпик «Эпик пробы» \(RT-900\)' 900)" 1
git -C "$ET_TREE" checkout -q RT-902-probe 2>/dev/null

# --- SC-AK-971 — строки идут в порядке замысла ---------------------------------------------
report "SC-AK-971 — первой стоит третья по номеру" "$(et_run | grep -c '^| 1 | Третья по номеру | RT-903')" 1
report "SC-AK-971 — второй стоит первая по номеру" "$(et_run | grep -c '^| 2 | Первая по номеру | RT-901')" 1

# --- SC-AK-972 — задача замысла без карточки стоит своей строкой ----------------------------
report "SC-AK-972 — строка незаведённой на месте" "$(et_run | grep -c '^| 4 | — | RT-904 |')" 1
report "SC-AK-972 — сказано, что не заведена" "$(et_says 'RT-904 \|.*\| не заведена \|')" 1

# --- SC-AK-973 — состояние несёт номер заявки и итог прогона на её вершине ------------------
report "SC-AK-973 — назван номер заявки" "$(et_says 'заявка #950 черновик')" 1
report "SC-AK-973 — назван итог прогона" "$(et_says 'прогон на вершине зелёный')" 1
export STUB_VERDICT=failure
report "SC-AK-973 — красный прогон назван красным" "$(et_says 'прогон на вершине красный')" 1
export STUB_VERDICT=success

# --- SC-AK-974 — закрытая задача названа влитой --------------------------------------------
report "SC-AK-974 — закрытая названа влитой" "$(et_says 'RT-901 \|.*\| влито \|')" 1

# --- SC-AK-975 — ветка без задачи кончается отказом ----------------------------------------
git -C "$ET_TREE" checkout -q -b probe-without-number 2>/dev/null
report "SC-AK-975 — код единица" "$(et_code)" 1
report "SC-AK-975 — назван довод" "$(et_says 'назовите эпик доводом')" 1
report "SC-AK-975 — таблица не печатается" "$(et_says '^\| № \|')" 0
git -C "$ET_TREE" checkout -q RT-902-probe 2>/dev/null

# --- SC-AK-976 — карточка эпика без замысла кончается отказом ------------------------------
epic_body '"Замысла карточка не называет."' > "$ET_TREE/answers/issue-900.json"
report "SC-AK-976 — код единица" "$(et_code 900)" 1
report "SC-AK-976 — названа карточка" "$(et_says 'карточка эпика #900' 900)" 1
report "SC-AK-976 — сказано, что пути нет" "$(et_says 'names no path to the plan' 900)" 1
epic_body '"Порядок задач лежит в `docs/plans/probe.md`."' > "$ET_TREE/answers/issue-900.json"

# --- SC-AK-977 — недоступный хостинг не даёт пустой таблицы --------------------------------
export STUB_OFFLINE=1
report "SC-AK-977 — код единица" "$(et_code 900)" 1
report "SC-AK-977 — сказано, что состояние неизвестно" "$(et_says 'состояние спросить нечем' 900)" 1
report "SC-AK-977 — таблица не печатается" "$(et_says '^\| № \|' 900)" 0
unset STUB_OFFLINE

rm -rf "$ET_TREE"

suite_result "проверки: таблица задач эпика"
