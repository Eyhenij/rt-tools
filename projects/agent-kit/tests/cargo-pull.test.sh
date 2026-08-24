#!/usr/bin/env bash
# Сценарии команды чтения груза: она живёт в дереве, а не в пакете, и всё, что можно отбить до
# сети, отбивает до сети.
#
# Приём поднимается свой: настоящий отвечает по-разному в разные дни, а сценарии судят разбор
# ответа и состав запроса. Двойник печатает то, что у него спросили, и отвечает заготовленным.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: чтение груза"

TREE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
PULL="$TREE_ROOT/tools/cargo-pull.mjs"
PORT=8919
INTAKE="http://127.0.0.1:$PORT"

ASKED="$(mktemp)"
FAKE_HOME="$(mktemp -d)"
cleanup() { rm -rf "$ASKED" "$FAKE_HOME"; }
trap cleanup EXIT

# Пара учётной записи: две строки файла вне дерева — так же, как её кладёт настоящее дерево.
mkdir -p "$FAKE_HOME/.config"
printf 'служба\nпароль\n' > "$FAKE_HOME/.config/message-bus-cargo-account"

# Двойник приёма: принимает вход, отдаёт страницу и записи, а пути запросов пишет в файл.
#
# Текст записи назван так, чтобы его признак считался сценарием тем же приёмом, что командой:
# сойдясь, они доказывают, что ключ отметки из чтения годен как есть.
serve() {
    node -e "
const http = require('node:http');
const fs = require('node:fs');
const asked = process.argv[1];
const empty = process.argv[2] === 'empty';
const TEXT = 'первая строка текста\nвторая строка';
const row = (id) => ({ id, tree: { slug: 'своё-дерево' }, resource: 'rules/probe.md', address: 'пакет', state: 'new', arrivedAt: '2026-08-24' });
const post = (id) => ({ ...row(id), file: '2026-08-24-probe.md', text: TEXT });
const server = http.createServer((req, res) => {
    fs.appendFileSync(asked, req.url + '\n');
    res.setHeader('content-type', 'application/json');
    if (req.url === '/api/auth/login') {
        res.setHeader('set-cookie', 'message_bus_session=probe-value; Path=/; HttpOnly');
        res.end(JSON.stringify({ name: 'служба' }));
        return;
    }
    if (req.url.includes('?')) {
        res.end(JSON.stringify({ rows: empty ? [] : [row('id-1')], total: empty ? 0 : 1, page: 1, size: 20 }));
        return;
    }
    res.end(JSON.stringify(post('id-1')));
});
server.listen($PORT, '127.0.0.1');
setTimeout(() => server.close(), 20000);
" "$ASKED" "$1" &
    SERVER_PID=$!
    sleep 1
}

stop() {
    kill "$SERVER_PID" 2>/dev/null
    wait "$SERVER_PID" 2>/dev/null
    : > "$ASKED"
}

# Что напечатало чтение: строк, совпавших с образцом.
pull_says() {
    local pattern="$1"
    shift
    (cd "$TREE_ROOT" && HOME="$FAKE_HOME" RT_INTAKE="$INTAKE" node "$PULL" "$@" 2>&1) | grep -cE "$pattern"
}

# Чем кончилось чтение: код возврата.
pull_code() {
    (cd "$TREE_ROOT" && HOME="$FAKE_HOME" RT_INTAKE="$INTAKE" node "$PULL" "$@" >/dev/null 2>&1)
    printf 'код:%s' "$?"
}

# Признак текста, посчитанный сценарием: команда обязана назвать тот же.
DIGEST="$(node -e "console.log(require('node:crypto').createHash('sha256').update('первая строка текста\nвторая строка', 'utf8').digest('hex'))")"

# --- отбой до сети -------------------------------------------------------------------------
#
# Двойник ещё не поднят: отбитый вызов до него не доходит, и это часть проверки.

report "SC-AK-549 — незнакомый род отбивается" \
    "$(pull_code --kind сводка)" "код:1"
report "SC-AK-549 — отказ перечисляет знакомые роды" \
    "$(pull_says 'proposal, postmortem' --kind сводка)" 1

report "SC-AK-550 — без пары вызов не идёт" \
    "$(HOME=/nonexistent pull_code --kind proposal)" "код:1"
report "SC-AK-550 — отказ называет, где лежит пара" \
    "$(cd "$TREE_ROOT" && HOME=/nonexistent RT_INTAKE="$INTAKE" node "$PULL" --kind proposal 2>&1 | grep -cE '`account`')" 1
report "SC-AK-550 — и чем заводится сама запись" \
    "$(cd "$TREE_ROOT" && HOME=/nonexistent RT_INTAKE="$INTAKE" node "$PULL" --kind proposal 2>&1 | grep -cE 'account:add')" 1

report "SC-AK-551 — непринятый вход отбивает чтение" \
    "$(pull_code --kind proposal)" "код:1"

# --- чтение груза --------------------------------------------------------------------------

serve

report "SC-AK-552 — рядом с предложением стоит признак его текста" \
    "$(pull_says "$DIGEST" --kind proposal --state new)" 1
report "SC-AK-552 — и он тот же, которым запись отмечают" \
    "$(cd "$TREE_ROOT" && HOME="$FAKE_HOME" RT_INTAKE="$INTAKE" node "$PULL" --kind proposal --state new 2>&1 | grep -cE "^  ${DIGEST}$")" 1

report "SC-AK-553 — у разбора происшествия ключом служит имя файла" \
    "$(pull_says '^  2026-08-24-probe\.md$' --kind postmortem)" 1
report "SC-AK-553 — второй раз имя файла не повторяется" \
    "$(pull_says '2026-08-24-probe\.md · 2026-08-24-probe\.md' --kind postmortem)" 0

report "SC-AK-554 — состояние уезжает строкой запроса" \
    "$(: > "$ASKED"; pull_says 'ЧТЕНИЕ' --kind proposal --state new >/dev/null; grep -cE 'state=new' "$ASKED")" 1
report "SC-AK-554 — и дерево тоже" \
    "$(: > "$ASKED"; pull_says 'ЧТЕНИЕ' --kind proposal --tree своё >/dev/null; grep -cE 'tree=' "$ASKED")" 1

report "SC-AK-555 — обзор без текстов ключа не даёт" \
    "$(pull_says "$DIGEST" --kind proposal --brief)" 0
report "SC-AK-555 — и говорит, почему его нет" \
    "$(pull_says 'brief' --kind proposal --brief)" 1

report "SC-AK-556 — тексты целиком печатаются по своему доводу" \
    "$(pull_says 'вторая строка' --kind proposal --text)" 1
report "SC-AK-556 — без него запись выходит одной строкой" \
    "$(pull_says 'вторая строка' --kind proposal)" 0

report "SC-AK-557 — прочитанный груз кончается нулём" \
    "$(pull_code --kind proposal --state new)" "код:0"

stop

# Пустая выборка: приём ответил, записей нет. Это не отказ.
serve empty

report "SC-AK-557 — пустая выборка отказом не считается" \
    "$(pull_code --kind proposal --state released)" "код:0"
report "SC-AK-557 — и счёт она печатает" \
    "$(pull_says 'всего 0' --kind proposal --state released)" 1

stop

suite_result "чтение груза"
