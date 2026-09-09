#!/usr/bin/env bash
# Сценарии состояния заявки в очереди работ: разбор у неё есть или нет, кто её читает.
#
# Сеть здесь не трогается: помощник хостинга подставляется через `GH_BIN` и отвечает тем, что
# положил сценарий. Набор отделён от сверки очереди работ: та выросла за предел длины файла.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "состояние заявки"

# --- SC-AK-377…346 — состояние заявки: разбор у неё есть или нет ------------------------------
# Запрос разбора на самого себя хостинг принимает молча и не создаёт; ревьювера читает гард
# поставки на снятии черновика, ответ ему собирает эта функция. Дерево своё, одноразовое:
# помощник ищет настройки от своего каталога, и общий стенд проверял бы чужие подстановки.
pull_tree() {
    local dir
    dir="$(mktemp -d)"
    mkdir -p "$dir/tools" "$dir/.claude/rt-kit"
    cp "$CHECKS/rt-kit-checks.config.mjs" "$dir/tools/"
    cp "$CHECKS/board.github.mjs" "$dir/tools/board.mjs"
    cp "$CHECKS/board-epic-link.github.mjs" "$dir/tools/board-epic-link.mjs"
    cp "$CHECKS/board-task-dirs.github.mjs" "$dir/tools/board-task-dirs.mjs"
    cp "$CHECKS/board-gh.github.mjs" "$dir/tools/board-gh.mjs"
    printf '%s\n' '{"board":{"owner":"probe","repo":"tree","taskKey":"RT","tokenPath":""}}' \
        > "$dir/.claude/rt-kit/checks.json"
    # Помощник хостинга: отдаёт то, что положил сценарий, а с непустой жалобой — отказывает.
    # Заодно записывает свои доводы: ссылка на заявку необязательна, и то, что при её нехватке
    # клиент зовётся вовсе без довода, из одного ответа не видно.
    cat > "$dir/gh" <<'STUB'
#!/usr/bin/env bash
printf '%s' "$*" > "${STUB_ARGS:-/dev/null}"
if [ -n "$STUB_PULL_ERR" ]; then
    printf '%s\n' "$STUB_PULL_ERR" >&2
    exit 1
fi
printf '%s' "$STUB_PULL"
STUB
    chmod +x "$dir/gh"
    printf '%s' "$dir"
}

# Состояние заявки одной строкой JSON: дерево, ответ хостинга, жалоба вместо ответа, ссылка на
# заявку. Ссылка передаётся всегда, в том числе пустой строкой: профиль зовёт помощника именно
# так, и вызов без четвёртого довода проверял бы не ту форму.
pull_state() {
    (cd "$1" && GH_BIN="$1/gh" STUB_PULL="$2" STUB_PULL_ERR="$3" STUB_ARGS="$1/доводы" \
        node tools/board.mjs pr "${4-701}" 2>/dev/null)
}
# Чем позвали клиента хостинга в последний раз.
pull_args() {
    cat "$1/доводы" 2>/dev/null
}

PULL_TREE="$(pull_tree)"

# Разбором считается и запрошенный ревьювер, и уже оставленный отзыв: до слияния годится любой
# из двух, а запрошенный после отзыва из списка запросов пропадает.
BOTH_SIDES='{"number":701,"isDraft":true,"author":{"login":"probe-bot"},"reviewRequests":[{"login":"alice"}],"latestReviews":[{"author":{"login":"bob"}}]}'
report "SC-AK-377 — разбор есть" \
    "$(pull_state "$PULL_TREE" "$BOTH_SIDES" | jq -r '.reviewed')" true
report "SC-AK-377 — запрошенный ревьювер в списке" \
    "$(pull_state "$PULL_TREE" "$BOTH_SIDES" | jq -r '.reviewers | index("alice") != null')" true
report "SC-AK-377 — оставивший отзыв в том же списке" \
    "$(pull_state "$PULL_TREE" "$BOTH_SIDES" | jq -r '.reviewers | index("bob") != null')" true
report "SC-AK-377 — заявка найдена" \
    "$(pull_state "$PULL_TREE" "$BOTH_SIDES" | jq -r '.exists')" true

# --- SC-AK-873. Чьими глазами снято состояние -----------------------------------------------
# Заявку читают без токена, задачу — с токеном машинной записи; по одному выводу это
# неразличимо, и дерево с ограниченной записью принимало картину человека за проверенную.
report "SC-AK-873 — чтение заявки идёт от клиента без токена" \
    "$(pull_state "$PULL_TREE" "$BOTH_SIDES" | jq -r '.viewer')" client
task_state() {
    (cd "$1" && GH_BIN="$1/gh" STUB_PULL_ERR='нет' node tools/board.mjs task 700 2>/dev/null)
}
report "SC-AK-873 — чтение задачи без токена в дереве тоже от клиента" \
    "$(task_state "$PULL_TREE" | jq -r '.viewer')" client
printf 'probe-token\n' > "$PULL_TREE/token"
printf '%s\n' "{\"board\":{\"owner\":\"probe\",\"repo\":\"tree\",\"taskKey\":\"RT\",\"tokenPath\":\"$PULL_TREE/token\"}}" \
    > "$PULL_TREE/.claude/rt-kit/checks.json"
report "SC-AK-873 — чтение задачи с токеном — от машинной записи" \
    "$(task_state "$PULL_TREE" | jq -r '.viewer')" machine
report "SC-AK-873 — а заявка и с токеном в дереве читается клиентом" \
    "$(pull_state "$PULL_TREE" "$BOTH_SIDES" | jq -r '.viewer')" client
printf '%s\n' '{"board":{"owner":"probe","repo":"tree","taskKey":"RT","tokenPath":""}}' \
    > "$PULL_TREE/.claude/rt-kit/checks.json"

# Отзыв самого автора разбором не считается: заявку, разобранную ею же написавшим, не разбирал
# никто, а снятый черновик читается как «можно вливать».
SELF_REVIEW='{"number":701,"isDraft":true,"author":{"login":"probe-bot"},"reviewRequests":[],"latestReviews":[{"author":{"login":"probe-bot"}}]}'
report "SC-AK-378 — отзыв автора разбором не считается" \
    "$(pull_state "$PULL_TREE" "$SELF_REVIEW" | jq -r '.reviewed')" false
# Сам он при этом из списка не исчезает: список говорит, кто трогал заявку, а приговор — отдельно.
report "SC-AK-378 — автор из списка не пропадает" \
    "$(pull_state "$PULL_TREE" "$SELF_REVIEW" | jq -r '.reviewers | index("probe-bot") != null')" true

# Заявки с таким номером нет — это ответ по существу, а не молчание.
report "SC-AK-378 — неизвестная заявка отвечает отсутствием" \
    "$(pull_state "$PULL_TREE" '' 'no pull requests found for branch' | jq -r '.exists')" false

# Сети нет, токена нет, клиента нет — спросить некого. Такой ответ не смеет читаться как «разбора
# нет»: по нему заявку без ревьювера не отличить от заявки, о которой не спросили.
report "SC-AK-379 — офлайн назван офлайном" \
    "$(pull_state "$PULL_TREE" '' 'dial tcp 140.82.121.5:443: connect: network is unreachable' | jq -r '.offline')" true
report "SC-AK-379 — и приговора о разборе в таком ответе нет" \
    "$(pull_state "$PULL_TREE" '' 'dial tcp 140.82.121.5:443: connect: network is unreachable' | jq -r 'has("reviewed")')" false
# Отказ входа сетевым тоже считается: проверить нечем, и работу это не отбивает.
report "SC-AK-379 — отказ входа считается офлайном" \
    "$(pull_state "$PULL_TREE" '' 'gh: Bad credentials (HTTP 401)' | jq -r '.offline')" true

# --- SC-AK-391…359 — заявка называется чем угодно, а то и не называется вовсе -----------------
# Ссылка на заявку необязательна: без неё клиент берёт заявку текущей ветки. Пока помощник
# требовал номер, `gh pr ready` без довода проходил мимо гарда.
NUMBERED='{"number":701,"isDraft":true,"author":{"login":"probe-bot"},"reviewRequests":[],"latestReviews":[]}'

report "SC-AK-391 — без ссылки клиент зовётся вовсе без довода" \
    "$(pull_state "$PULL_TREE" "$NUMBERED" '' '' >/dev/null; pull_args "$PULL_TREE")" \
    'pr view --json number,isDraft,reviewRequests,latestReviews,author,mergeable'
report "SC-AK-391 — и заявка при этом найдена" \
    "$(pull_state "$PULL_TREE" "$NUMBERED" '' '' | jq -r '.exists')" true
# Номер приходит из ответа: заявку, названную не номером, в отказе гарда узнают по нему.
report "SC-AK-391 — номер берётся из ответа хостинга" \
    "$(pull_state "$PULL_TREE" "$NUMBERED" '' '' | jq -r '.number')" 701

# Ссылка любого рода уходит клиенту как есть: разбирать адрес и имя ветки — его работа, не наша.
report "SC-AK-392 — имя ветки уходит клиенту доводом" \
    "$(pull_state "$PULL_TREE" "$NUMBERED" '' 'RT-700-probe' >/dev/null; pull_args "$PULL_TREE")" \
    'pr view RT-700-probe --json number,isDraft,reviewRequests,latestReviews,author,mergeable'
report "SC-AK-392 — и адрес заявки тоже" \
    "$(pull_state "$PULL_TREE" "$NUMBERED" '' 'https://example.invalid/o/r/pull/701' >/dev/null; pull_args "$PULL_TREE")" \
    'pr view https://example.invalid/o/r/pull/701 --json number,isDraft,reviewRequests,latestReviews,author,mergeable'
report "SC-AK-392 — по имени ветки заявка тоже находится" \
    "$(pull_state "$PULL_TREE" "$NUMBERED" '' 'RT-700-probe' | jq -r '.exists')" true

rm -rf "$PULL_TREE"

suite_result "состояние заявки"
