#!/usr/bin/env bash
# Сценарии команды отметки груза: она живёт в дереве, а не в пакете, и всё, что можно отбить до
# сети, отбивает до сети.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: отметка груза"

# --- отметка груза ------------------------------------------------------------------------------
#
# Разбор доводов и сборка тела проверяются вызовом самой команды: двойник запроса ей не нужен —
# сухой прогон до сети не доходит вовсе.

TREE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
MARK="$TREE_ROOT/tools/cargo-mark.mjs"

# Что напечатала отметка. Она отвечает строками, а не кодом на каждую.
mark_says() {
    (cd "$TREE_ROOT" && node "$MARK" "$@" 2>&1) | grep -cE "$MARK_PATTERN"
}

# Тело, которое команда отправила: свой приём рядом печатает его и сразу отвечает счётом.
mark_body() {
    # Порт берётся у системы: назначенный числом занят ровно тогда, когда рядом идёт второй
    # прогон, и сервер падает с отказом «адрес занят» вместе со всеми проверками этого набора.
    : > "$BODY_PORT"
    node -e "
const http = require('node:http');
const fs = require('node:fs');
const server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (part) => { raw += part; });
    req.on('end', () => {
        process.stdout.write(raw);
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ changed: 1, same: 0, denied: [] }));
        server.close();
    });
});
server.listen(0, '127.0.0.1', () => {
    fs.writeFileSync(process.argv[1], String(server.address().port));
});
" "$BODY_PORT" > "$BODY_SEEN" &
    local pid=$!
    local port
    port="$(wait_for_port "$BODY_PORT")" || { echo "двойник приёма не поднялся"; return 1; }
    (cd "$TREE_ROOT" && RT_INTAKE="http://127.0.0.1:$port" node "$MARK" "$@" >/dev/null 2>&1)
    # Тело ждётся признаком, а не отсчётом: под нагрузкой секунды не хватает, и четыре проверки
    # набора краснели там, где ни отметка, ни двойник не при чём. Двойник печатает тело и сразу
    # закрывается — непустой файл вывода и означает, что печатать он уже кончил.
    local left=50
    while [ "$left" -gt 0 ] && [ ! -s "$BODY_SEEN" ]; do
        sleep 0.1
        left=$((left - 1))
    done
    kill "$pid" 2>/dev/null
    grep -cE "$MARK_PATTERN" "$BODY_SEEN"
}

BODY_SEEN="$(mktemp)"
BODY_PORT="$(mktemp)"

# Код возврата отметки: ненулевой у всего, что не легло.
mark_code() {
    (cd "$TREE_ROOT" && node "$MARK" "$@" >/dev/null 2>&1)
    echo $?
}

# SC-AK-430 — незнакомое состояние отбивается до сети
MARK_PATTERN='there is no state'
report "SC-AK-430 — незнакомое состояние названо" "$(mark_says --state nowhere --postmortem x.md)" 1
report "SC-AK-430 — код возврата ненулевой" "$(mark_code --state nowhere --postmortem x.md)" 1

# SC-AK-558 — признак дерева считается тем же приёмом, что на отправке
#
# Своя копия счёта уже разошлась с пакетной: она брала последнее слово адреса, а отправка — адрес
# целиком и в нижнем регистре. Сценарий сверяет напечатанный признак с тем, что даёт сам пакет.
PACKAGE_SLUG="$(cd "$TREE_ROOT" && node -e "
import('./dist/agent-kit/lib/shipment.js').then((m) => {
    const remote = require('node:child_process').execFileSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
    process.stdout.write(m.treeSlugOf(remote, ''));
});
" 2>/dev/null)"
MARK_PATTERN="tree ${PACKAGE_SLUG}:"
report "SC-AK-558 — отметка называет тот же признак, что отправка" \
    "$(mark_says --state new --postmortem x.md --dry-run)" 1

# SC-AK-431 — вызов без записей отбивается до сети
MARK_PATTERN='there is nothing to mark'
report "SC-AK-431 — пустой вызов назван" "$(mark_says --state new)" 1
report "SC-AK-431 — код возврата ненулевой" "$(mark_code --state new)" 1

# SC-AK-428 — сухой прогон показывает собранный пакет и никуда не стучится
MARK_PATTERN='it would have gone to'
report "SC-AK-428 — сухой прогон называет адрес" "$(mark_says --state new --postmortem x.md --dry-run)" 1
MARK_PATTERN='analyses 1, proposals 0'
report "SC-AK-428 — пакет разобран по родам" "$(mark_says --state new --postmortem x.md --dry-run)" 1
report "SC-AK-428 — код возврата нулевой" "$(mark_code --state new --postmortem x.md --dry-run)" 0

# SC-AK-544 — сухой прогон объявляется первой строкой, а не окончанием глагола
MARK_PATTERN='^A DRY RUN — nothing left outward'
report "SC-AK-544 — сухой прогон назван первой строкой" \
    "$(mark_says --state new --postmortem x.md --dry-run)" 1
MARK_PATTERN='without `--dry-run`'
report "SC-AK-544 — назван и вызов, которым это отмечают" \
    "$(mark_says --state new --postmortem x.md --dry-run)" 1

# SC-AK-427 — записи разных родов едут одним вызовом
MARK_PATTERN='analyses 2, proposals 1'
report "SC-AK-427 — пачка собрана целиком" \
    "$(mark_says --state new --postmortem a.md --postmortem b.md --proposal c --dry-run)" 1

# SC-AK-427 — приложенное значение едет полем строки, а не своим вызовом
MARK_PATTERN='into «fixed»'
report "SC-AK-427 — переход в починку собран" \
    "$(mark_says --state fixed --postmortem a.md --fix 'статья правила' --dry-run)" 1

# SC-MB-191 — команда строки запуска несёт текст починки доводом
MARK_PATTERN='"fixNote":"статья правила"'
report "SC-MB-191 — текст починки лёг полем строки" \
    "$(RT_TREE_TOKEN=x mark_body --state fixed --postmortem a.md --fix 'статья правила')" 1
MARK_PATTERN='fixNote'
report "SC-MB-191 — без довода поля нет" \
    "$(RT_TREE_TOKEN=x mark_body --state fixed --postmortem a.md)" 0

# SC-MB-207 — команда строки запуска несёт версию выпуска доводом
MARK_PATTERN='"releaseVersion":"rt-agent-kit@0.11.0"'
report "SC-MB-207 — версия выпуска легла полем строки" \
    "$(RT_TREE_TOKEN=x mark_body --state released --postmortem a.md --release 'rt-agent-kit@0.11.0')" 1

# SC-AK-429 — без токена дерева отметка отказывает до сети
MARK_PATTERN='there is no tree token'
report "SC-AK-429 — отсутствие токена названо" \
    "$(RT_TREE_TOKEN='' RT_INTAKE='http://127.0.0.1:1' mark_says --state new --postmortem a.md)" 1

# SC-AK-432 — отбитая приёмом запись печатается и даёт ненулевой код
#
# Приём тут свой, поднятый рядом: он отвечает счётом и одной отбитой строкой. Настоящий для
# этого не нужен, а двойник вызова изнутри команды подставить нечем — она зовётся строкой.
FAKE_PORT_FILE="$(mktemp)"
node -e "
const http = require('node:http');
const fs = require('node:fs');
http.createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ changed: 1, same: 0, denied: [{ at: 1, kind: 'postmortem', key: 'b.md', denial: 'forbidden' }] }));
}).listen(0, '127.0.0.1', function () {
    fs.writeFileSync(process.argv[1], String(this.address().port));
});
" "$FAKE_PORT_FILE" &
FAKE_PID=$!
FAKE_PORT="$(wait_for_port "$FAKE_PORT_FILE")" || { echo "двойник приёма не поднялся"; exit 1; }

MARK_PATTERN='moved 1, already stood 0, refused 1'
report "SC-AK-432 — счёт назван строкой" \
    "$(RT_INTAKE=http://127.0.0.1:$FAKE_PORT RT_TREE_TOKEN=x mark_says --state in_work --postmortem a.md --postmortem b.md)" 1

MARK_PATTERN='analysis b.md — the move is not allowed by the order'
report "SC-AK-432 — отбитая строка названа ключом и причиной" \
    "$(RT_INTAKE=http://127.0.0.1:$FAKE_PORT RT_TREE_TOKEN=x mark_says --state in_work --postmortem a.md --postmortem b.md)" 1

report "SC-AK-432 — код возврата ненулевой" \
    "$(RT_INTAKE=http://127.0.0.1:$FAKE_PORT RT_TREE_TOKEN=x mark_code --state in_work --postmortem a.md --postmortem b.md)" 1

kill "$FAKE_PID" 2>/dev/null
wait "$FAKE_PID" 2>/dev/null
rm -f "$FAKE_PORT_FILE" "$BODY_PORT"

# Итог набора и его код возврата. Без этой строки набор кончался снятием двойника — то есть
# всегда нулём: провалившаяся проверка печаталась строкой и на цвет прогона не влияла никак,
# а общий прогон считал набор зелёным всегда.
suite_result "проверки: отметка груза"

