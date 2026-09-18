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

# Токен дерева ставит сам сценарий, а не берёт с машины. Отметка отбивает его отсутствие до
# сети — раньше сухого прогона, — а лежит он файлом за пределами дерева: на машине без записи в
# приёме восемь проверок этого набора краснели там, где ни отметка, ни набор не при чём, и
# зелёными они были ровно на той машине, где кто-то однажды записался. Сценарий про сам отказ
# ставит пустое значение так же явно.

# SC-AK-430 — незнакомое состояние отбивается до сети
MARK_PATTERN='there is no state'
report "SC-AK-430 — незнакомое состояние названо" "$(mark_says --state nowhere --postmortem x.md)" 1
report "SC-AK-430 — код возврата ненулевой" "$(mark_code --state nowhere --postmortem x.md)" 1

# SC-AK-558 — признак дерева считается тем же приёмом, что на отправке
#
# Своя копия счёта уже разошлась с пакетной: она брала последнее слово адреса, а отправка — адрес
# целиком и в нижнем регистре. Сценарий сверяет напечатанный признак с тем, что даёт сам пакет.
# Эталон берётся из модуля, где функция объявлена. Сначала положительная проверка: пустой эталон
# совпадал с пустым признаком отметки, и тест был зелёным, пока приём отказывал каждой записи.
PACKAGE_SLUG="$(cd "$TREE_ROOT" && node -e "
import('./dist/agent-kit/lib/tree-mark.js').then((m) => {
    const remote = require('node:child_process').execFileSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
    process.stdout.write(m.treeSlugOf(remote, ''));
});
" 2>/dev/null)"
report "SC-AK-558 — признак дерева не пуст: двенадцать шестнадцатеричных знаков" \
    "$(printf '%s' "$PACKAGE_SLUG" | grep -cE '^[0-9a-f]{12}$')" 1
MARK_PATTERN="tree ${PACKAGE_SLUG}:"
report "SC-AK-558 — отметка называет тот же признак, что отправка" \
    "$(RT_TREE_TOKEN=x mark_says --state new --postmortem x.md --dry-run)" 1

# SC-AK-1130 — пустой признак дерева отклоняется до сети
#
# Признак считается собранным пакетом; без модуля он пуст, и отправленный пустым он возвращается
# от приёма отказом «чужое дерево», который читается как неверный ключ. Модуль прячется на время
# вызова, и отказ приходит до сети с названной причиной.
TREE_MARK_MODULE="$TREE_ROOT/dist/agent-kit/lib/tree-mark.js"
mv "$TREE_MARK_MODULE" "$TREE_MARK_MODULE.hidden"
MARK_PATTERN="the sign of the tree could not be counted"
report "SC-AK-1130 — пустой признак назван причиной отказа" \
    "$(RT_TREE_TOKEN=x mark_says --state new --postmortem x.md --dry-run)" 1
report "SC-AK-1130 — код возврата ненулевой" \
    "$(RT_TREE_TOKEN=x mark_code --state new --postmortem x.md --dry-run)" 1
mv "$TREE_MARK_MODULE.hidden" "$TREE_MARK_MODULE"

# SC-AK-431 — вызов без записей отбивается до сети
MARK_PATTERN='there is nothing to mark'
report "SC-AK-431 — пустой вызов назван" "$(mark_says --state new)" 1
report "SC-AK-431 — код возврата ненулевой" "$(mark_code --state new)" 1

# SC-AK-428 — сухой прогон показывает собранный пакет и никуда не стучится
MARK_PATTERN='it would have gone to'
report "SC-AK-428 — сухой прогон называет адрес" "$(RT_TREE_TOKEN=x mark_says --state new --postmortem x.md --dry-run)" 1
MARK_PATTERN='analyses 1, proposals 0'
report "SC-AK-428 — пакет разобран по родам" "$(RT_TREE_TOKEN=x mark_says --state new --postmortem x.md --dry-run)" 1
report "SC-AK-428 — код возврата нулевой" "$(RT_TREE_TOKEN=x mark_code --state new --postmortem x.md --dry-run)" 0

# SC-AK-544 — сухой прогон объявляется первой строкой, а не окончанием глагола
MARK_PATTERN='^A DRY RUN — nothing left outward'
report "SC-AK-544 — сухой прогон назван первой строкой" \
    "$(RT_TREE_TOKEN=x mark_says --state new --postmortem x.md --dry-run)" 1
MARK_PATTERN='without `--dry-run`'
report "SC-AK-544 — назван и вызов, которым это отмечают" \
    "$(RT_TREE_TOKEN=x mark_says --state new --postmortem x.md --dry-run)" 1

# SC-AK-427 — записи разных родов едут одним вызовом
MARK_PATTERN='analyses 2, proposals 1'
report "SC-AK-427 — пачка собрана целиком" \
    "$(RT_TREE_TOKEN=x mark_says --state new --postmortem a.md --postmortem b.md --proposal c --dry-run)" 1

# SC-AK-427 — приложенное значение едет полем строки, а не своим вызовом
MARK_PATTERN='into «fixed»'
report "SC-AK-427 — переход в починку собран" \
    "$(RT_TREE_TOKEN=x mark_says --state fixed --postmortem a.md --fix 'статья правила' --dry-run)" 1

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

# SC-MB-317 — команда строки запуска несёт причину карантина доводом
MARK_PATTERN='"quarantineNote":"спорно: правило говорит обратное"'
report "SC-MB-317 — причина карантина легла полем строки" \
    "$(RT_TREE_TOKEN=x mark_body --state quarantined --proposal ключ --quarantine-note 'спорно: правило говорит обратное')" 1
MARK_PATTERN='quarantineNote'
report "SC-MB-317 — без довода поля нет" \
    "$(RT_TREE_TOKEN=x mark_body --state quarantined --proposal ключ)" 0
MARK_PATTERN='into «quarantined»'
report "SC-MB-317 — карантин знаком набору состояний" \
    "$(RT_TREE_TOKEN=x mark_says --state quarantined --proposal ключ --quarantine-note 'спорно' --dry-run)" 1

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

# --- SC-AK-948…952 — сверка предложения со спекой стоит до работы --------------------------
#
# Отказы идут до сети: токен здесь ставится, чтобы проверялась именно сверка, а не его отсутствие.

spec_says() {
    (cd "$TREE_ROOT" && RT_TREE_TOKEN=x node "$MARK" "$@" 2>&1) | grep -cE "$SPEC_PATTERN"
}

spec_code() {
    (cd "$TREE_ROOT" && RT_TREE_TOKEN=x node "$MARK" "$@" >/dev/null 2>&1)
    echo $?
}

LIVE_SPEC="docs/specs/agent-kit/proposal-verdict/spec.md"

SPEC_PATTERN='while the spec it is compared with is not named'
report "SC-AK-948 — предложение без спеки в работу не идёт" \
    "$(spec_says --state in_work --proposal ключ --dry-run)" 1
report "SC-AK-948 — код возврата ненулевой" "$(spec_code --state in_work --proposal ключ --dry-run)" 1

SPEC_PATTERN='npm run specs:for'
report "SC-AK-948 — отказ называет, чем спека находится" \
    "$(spec_says --state in_work --proposal ключ --dry-run)" 1

SPEC_PATTERN='the question goes to the person'
report "SC-AK-948 — и называет исход, когда спеки нет вовсе" \
    "$(spec_says --state in_work --proposal ключ --dry-run)" 1

SPEC_PATTERN='the named spec is checked before the network'
report "SC-AK-949 — выдуманный путь отбивается до сети" \
    "$(spec_says --state in_work --proposal ключ --spec docs/specs/нет-такой/spec.md --dry-run)" 1
report "SC-AK-949 — код возврата ненулевой" \
    "$(spec_code --state in_work --proposal ключ --spec docs/specs/нет-такой/spec.md --dry-run)" 1

SPEC_PATTERN='A DRY RUN'
report "SC-AK-950 — с названной спекой ход прежний" \
    "$(spec_says --state in_work --proposal ключ --spec "$LIVE_SPEC" --dry-run)" 1
report "SC-AK-950 — код нулевой" \
    "$(spec_code --state in_work --proposal ключ --spec "$LIVE_SPEC" --dry-run)" 0

report "SC-AK-951 — разбор происшествия спеки не требует" \
    "$(spec_says --state in_work --postmortem 2026-01-01-имя.md --dry-run)" 1
report "SC-AK-951 — код нулевой" "$(spec_code --state in_work --postmortem 2026-01-01-имя.md --dry-run)" 0

report "SC-AK-952 — переход в починку спеки не требует" \
    "$(spec_says --state fixed --proposal ключ --fix 'статья правила' --dry-run)" 1
report "SC-AK-952 — код нулевой" \
    "$(spec_code --state fixed --proposal ключ --fix 'статья правила' --dry-run)" 0

# Итог набора и его код возврата. Без этой строки набор кончался снятием двойника — то есть
# всегда нулём: провалившаяся проверка печаталась строкой и на цвет прогона не влияла никак,
# а общий прогон считал набор зелёным всегда.
suite_result "проверки: отметка груза"

