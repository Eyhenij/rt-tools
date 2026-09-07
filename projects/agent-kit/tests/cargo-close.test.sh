#!/usr/bin/env bash
# Сценарии команды закрытия груза: ею издатель редакции закрывает чужие записи, и всё, что можно
# отбить до сети, она отбивает до сети.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: закрытие груза издателем"

TREE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
CLOSE="$TREE_ROOT/tools/cargo-close.mjs"

# Пара учётной записи задаётся окружением: набор не читает файла владельца и в настоящий приём
# не ходит ни одним сценарием.
export RT_ACCOUNT_NAME=publisher
export RT_ACCOUNT_PASSWORD=secret

# Что напечатало закрытие. Оно отвечает строками, а не кодом на каждую.
close_says() {
    (cd "$TREE_ROOT" && node "$CLOSE" "$@" 2>&1) | grep -cE "$CLOSE_PATTERN"
}

# Код возврата закрытия: ненулевой у всего, что не легло.
close_code() {
    (cd "$TREE_ROOT" && node "$CLOSE" "$@" >/dev/null 2>&1)
    echo $?
}

# SC-MB-276 — состояние вне двух последних шагов отбивается до сети
CLOSE_PATTERN='is not set by closing'
report "SC-MB-276 — негодное состояние названо" "$(close_says --state in_work --proposal id-1)" 1
report "SC-MB-276 — код возврата ненулевой" "$(close_code --state in_work --proposal id-1)" 1
CLOSE_PATTERN='they close into: fixed, released'
report "SC-MB-276 — названо, чем закрывают" "$(close_says --state in_work --proposal id-1)" 1

# SC-MB-277 — вызов без записей отбивается до сети
CLOSE_PATTERN='there is nothing to close'
report "SC-MB-277 — пустой вызов назван" "$(close_says --state fixed)" 1
report "SC-MB-277 — код возврата ненулевой" "$(close_code --state fixed)" 1
CLOSE_PATTERN='the sign is printed by the cargo read'
report "SC-MB-277 — названо, откуда берётся признак записи" "$(close_says --state fixed)" 1

# SC-MB-278 — сухой прогон показывает собранный пакет и никуда не стучится
CLOSE_PATTERN='^A DRY RUN — nothing left outward'
report "SC-MB-278 — сухой прогон назван первой строкой" \
    "$(close_says --state fixed --proposal id-1 --fix 'статьёй правила' --dry-run)" 1
CLOSE_PATTERN='analyses 1, proposals 2'
report "SC-MB-278 — пакет разобран по родам" \
    "$(close_says --state fixed --postmortem id-1 --proposal id-2 --proposal id-3 --fix 'статьёй правила' --dry-run)" 1
report "SC-MB-278 — код возврата нулевой" \
    "$(close_code --state fixed --proposal id-1 --fix 'статьёй правила' --dry-run)" 0

# SC-MB-279 — без пары учётной записи службы команда отказывает до сети
#
# Дерево тут пустое: настоящее несёт пару в настройке, и вызов из него взял бы её оттуда — а
# сценарий проверяет как раз тот случай, когда взять её неоткуда.
BARE_TREE="$(mktemp -d)"
mkdir -p "$BARE_TREE/.claude"
echo '{}' > "$BARE_TREE/.claude/rt-kit.json"

CLOSE_PATTERN='there is no service account pair'
report "SC-MB-279 — отсутствие пары названо" \
    "$( (cd "$BARE_TREE" && RT_ACCOUNT_NAME='' RT_ACCOUNT_PASSWORD='' RT_INTAKE='http://127.0.0.1:1' \
        node "$CLOSE" --state fixed --proposal id-1 --fix x 2>&1) | grep -cE "$CLOSE_PATTERN")" 1

rm -rf "$BARE_TREE"

# SC-MB-280 — отбитая приёмом строка печатается и даёт ненулевой код
#
# Приём тут свой, поднятый рядом: он принимает вход и отвечает счётом с одной отбитой строкой.
# Настоящий для этого не нужен, а двойник вызова изнутри команды подставить нечем — она зовётся
# строкой.
FAKE_PORT_FILE="$(mktemp)"
node -e "
const http = require('node:http');
const fs = require('node:fs');
http.createServer((req, res) => {
    if (req.url.endsWith('/login')) {
        res.writeHead(200, { 'content-type': 'application/json', 'set-cookie': 'message_bus_session=live; Path=/' });
        res.end('{}');
        return;
    }
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ changed: 1, same: 0, denied: [{ at: 1, kind: 'proposal', key: 'id-2', denial: 'missing' }] }));
}).listen(0, '127.0.0.1', function () {
    fs.writeFileSync(process.argv[1], String(this.address().port));
});
" "$FAKE_PORT_FILE" &
FAKE_PID=$!
FAKE_PORT="$(wait_for_port "$FAKE_PORT_FILE")" || {
    echo "двойник приёма не поднялся"
    exit 1
}

CLOSE_PATTERN='moved 1, already stood 0, refused 1'
report "SC-MB-280 — счёт назван строкой" \
    "$(RT_INTAKE=http://127.0.0.1:$FAKE_PORT close_says --state fixed --proposal id-1 --proposal id-2 --fix 'статьёй правила')" 1

CLOSE_PATTERN='proposal id-2 — the intake has no record with such a sign'
report "SC-MB-280 — отбитая строка названа признаком и причиной" \
    "$(RT_INTAKE=http://127.0.0.1:$FAKE_PORT close_says --state fixed --proposal id-1 --proposal id-2 --fix 'статьёй правила')" 1

report "SC-MB-280 — код возврата ненулевой" \
    "$(RT_INTAKE=http://127.0.0.1:$FAKE_PORT close_code --state fixed --proposal id-1 --proposal id-2 --fix 'статьёй правила')" 1

kill "$FAKE_PID" 2>/dev/null
wait "$FAKE_PID" 2>/dev/null
rm -f "$FAKE_PORT_FILE"

suite_result "проверки: закрытие груза издателем"
