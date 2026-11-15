#!/usr/bin/env bash
# Сценарии проверки выхода из хода: ход кончается вместе со сценарием task flow или по случаю
# отпуска из описания.
#
# Решение принимает движок: `task-flow-script.mjs verdict` меряет ветку и случаи отпуска. Первая
# часть набора зовёт случаи и измерители движка напрямую, над двойниками источников: так каждый
# случай отпуска проверяется отдельно от состояния ветки. Вторая часть зовёт сам хук на дереве
# фикстуры: удержанный ход, роль и сбой движка с записью в журнал. Строка случая начинается с
# группы плана — `end:` или `menu:`, по ней случаи считает проверка шага.
. "$(dirname "${BASH_SOURCE[0]}")/turn-exit-lib.sh"

echo "проверка выхода из хода"

TESTS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

te_run() {
    local out label got want
    out="$(cd "$TESTS" && node --input-type=module 2>&1)"
    while IFS='|' read -r label got want; do
        [ -n "$label" ] || continue
        report "$label" "$got" "$want"
    done <<< "$out"
}

# --- случаи отпуска и измерители, над двойниками --------------------------------------------------
te_run <<'JS'
import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildModel } from '../assets/checks/flow-model.mjs';
import { isWriteCommand, saysStop } from '../assets/checks/flow-data.mjs';
import { releaseCase, holdReason } from '../assets/checks/flow-verdict.mjs';
import * as owner from '../assets/task-flow/measure/owner.mjs';
import * as session from '../assets/task-flow/measure/session.mjs';
import * as host from '../assets/task-flow/measure/host.mjs';

const path = new URL('../assets/task-flow/flow.js', import.meta.url).pathname;
const model = buildModel(path);
const data = { words: model.words, expect: model.expect, rules: { saysStop, isWriteCommand } };
const out = (label, got, want) => console.log(`${label}|${got}|${want}`);

// Ответы измерителей по ссылкам; всё неназванное — «нет».
const reader = (answers) => (name) => answers[name] ?? false;
const held = { state: 'просьба-не-разобрана', index: 1, reason: null };
const released = (answers, result = held) => releaseCase(model, reader(answers), result)?.log ?? 'held';
const WROTE = { 'measure.session.wrote': true };

out('end: SC-AK-1427 — конец сценария — отпущен', released({ 'measure.epic.finished': true }), 'the end of the scenario');
out('end: SC-AK-1428 — вне эпика выход 10 — отпущен', released({ ...WROTE, 'measure.copy.outsideEpic': true, 'measure.pr.handed': true }), 'the end of the scenario');
out('end: SC-AK-1428 — вне эпика без PR — держится', released({ ...WROTE, 'measure.copy.outsideEpic': true }), 'held');

const last = (word) => ({ owner: { last: () => word } });
const stop = (word) => String(owner.saidStop(last(word))(data));
out('end: SC-AK-1429 — слово остановки — отпущен', stop('Стоп, на сегодня хватит'), 'true');
out('end: SC-AK-1430 — «хватит останавливаться, продолжай» — держится', stop('хватит останавливаться, продолжай'), 'false');
out('end: SC-AK-1431 — «Стой, не туда — делай RT-N» — держится', stop('Стой, не туда — делай RT-12'), 'false');
out('end: SC-AK-1463 — «Стоп, не делай этого» — отпущен', stop('Стоп, не делай этого'), 'true');
out('end: SC-AK-1429 — случай отпуска по слову остановки', released({ ...WROTE, 'measure.owner.saidStop': true }), 'a stop word of the owner');

const uses = (list) => ({ session: { toolUses: () => list } });
const wrote = (list) => String(session.wrote(uses(list))(data));
out('end: SC-AK-1432 — чтение не запись', wrote([{ name: 'Read', input: {} }, { name: 'Bash', input: { command: 'git status' } }]), 'false');
out('end: SC-AK-1432 — правка файла — запись', wrote([{ name: 'Edit', input: {} }]), 'true');
out('end: SC-AK-1432 — коммит — запись', wrote([{ name: 'Bash', input: { command: 'git add a && git commit -m x' } }]), 'true');
out('end: SC-AK-1432 — сессия без записи — отпущена', released({}), 'no write to the tree, or a branch outside the scenario');
const nudged = (word) => String(owner.nudged(last(word))(data));
out('end: SC-AK-1433 — «ну что там?» — подталкивание', nudged('ну что там?'), 'true');
out('end: SC-AK-1433 — сессия без записи после «ну что там?» — держится', released({ 'measure.owner.nudged': true }), 'held');
out('end: SC-AK-1440 — ветка вне сценария — отпущена', released({ ...WROTE, 'measure.copy.outOfScenario': true }), 'no write to the tree, or a branch outside the scenario');
out('end: SC-AK-1465 — ветка вне сценария после подталкивания — отпущена', released({ 'measure.owner.nudged': true, 'measure.copy.outOfScenario': true }), 'no write to the tree, or a branch outside the scenario');

const role = (tools) => String(session.role({ session: { agent: () => 'reader', roleTools: () => tools } })(data));
out('end: SC-AK-1434 — роль без инструмента правки — сессия роли', role('Read, Grep, Bash'), 'true');
out('end: SC-AK-1434 — роль с правкой — не сессия роли', role('Read, Edit'), 'false');
out('end: SC-AK-1434 — сессия роли — отпущена', released({ ...WROTE, 'measure.session.role': true }), 'a role session');

const silentHost = { host: { silent: () => true } };
out('end: SC-AK-1435 — хостинг молчит — измеритель', String(host.silent(silentHost)(data)), 'true');
const onSilence = { state: 'договорённость-записана', index: 4, reason: 'the hosting did not answer twice' };
out('end: SC-AK-1435 — хостинг дважды на выходе хостинга — отпущен с причиной', released({ ...WROTE, 'measure.host.silent': true }, onSilence), 'the host did not answer twice');
out('end: SC-AK-1435 — молчание хостинга при невыполненном местном выходе — держится', released({ ...WROTE, 'measure.host.silent': true }), 'held');

// Слово, добавленное в копию описания, отпускает ход без правки движка: копия лежит во временном
// каталоге рядом со ссылками на измерители и источники пакета.
const dir = mkdtempSync(join(tmpdir(), 'flow-'));
const kit = new URL('../assets/task-flow/', import.meta.url).pathname;
for (const sub of ['measure', 'source']) symlinkSync(join(kit, sub), join(dir, sub));
writeFileSync(join(dir, 'flow.js'), readFileSync(path, 'utf8').replace("'стоп', ", "'шабаш', 'стоп', "));
const copied = buildModel(join(dir, 'flow.js'));
rmSync(dir, { recursive: true, force: true });
const copiedData = { ...data, words: copied.words };
out('end: SC-AK-1505 — слово остановки, добавленное в описание, отпускает ход без правки движка', String(owner.saidStop(last('Шабаш, на сегодня всё'))(copiedData)), 'true');
out('end: SC-AK-1505 — пакетное описание этого слова не знает', stop('Шабаш, на сегодня всё'), 'false');

const events = (list) => ({ session: { events: () => list } });
const MENU = 'Ask the owner: «отложить RT-7», «сделаю сам», «стоп».';
const lost = (list) => String(session.menuLost(events(list))(data));
out('menu: SC-AK-1444 — меню не дошло второй раз подряд', lost([{ kind: 'refusal', text: MENU }, { kind: 'menu', answered: false }, { kind: 'refusal', text: MENU }, { kind: 'menu', answered: false }]), 'true');
out('menu: SC-AK-1444 — меню не дошло один раз — не потеряно', lost([{ kind: 'refusal', text: MENU }, { kind: 'menu', answered: false }]), 'false');
out('menu: SC-AK-1444 — отвеченное меню снимает счёт', lost([{ kind: 'refusal', text: MENU }, { kind: 'menu', answered: false }, { kind: 'refusal', text: MENU }, { kind: 'menu', answered: true }]), 'false');
out('menu: SC-AK-1444 — меню отказа не дошло до владельца второй раз подряд — отпущен', released({ ...WROTE, 'measure.session.menuLost': true }), 'the menu did not reach the owner');

const stage = { state: 'этап-идёт', index: 7, reason: null };
out('удержанный ход в этапе называет шаг и команду', String(holdReason(model, stage, { number: '3.6', name: 'Перевести' }).includes('task-flow-script.mjs step 3.6')), 'true');
out('удержанный ход до этапа называет действие состояния', String(holdReason(model, held, null).includes('explore the tree')), 'true');
JS

# --- сам хук на дереве фикстуры ---------------------------------------------------------------------
# Движку нужна история ветки: дерево фикстуры получает главную ветку с коммитом и ветку задачи.
git -C "$REPO" -c user.name=t -c user.email=t@t -c commit.gpgsign=false commit -q --allow-empty -m 'основание' >/dev/null 2>&1
# Ветка без разбора меряется первым состоянием: сессия, которая писала, держится.
expect_stop "удержанный ход: сессия писала, сценарий не кончен" \
    "$(input_stop "$(transcript "$(say 'делай')" "$(edited)")")" BLOCK
expect_reason "отказ называет измеренное состояние" \
    "$(input_stop "$(transcript "$(say 'делай')" "$(edited)")")" 'просьба-не-разобрана'
expect_stop "end: SC-AK-1429 — слово остановки отпускает ход через хук" \
    "$(input_stop "$(transcript "$(edited)" "$(say 'Стоп, хватит')")")" PASS
expect_stop "end: SC-AK-1432 — сессия без записи отпускает ход через хук" \
    "$(input_stop "$(transcript "$(say 'расскажи, что в ветке')" "$(reply)")")" PASS

JOURNAL="$REPO/.git/rt-kit/turn-exit.log"
BROKEN="$TURNS/broken-engine.mjs"
printf 'process.exit(3);\n' > "$BROKEN"
SLOW="$TURNS/slow-engine.mjs"
printf 'setTimeout(() => {}, 5000);\n' > "$SLOW"
rm -f "$JOURNAL"
RT_FLOW_ENGINE="$BROKEN" expect_stop "end: SC-AK-1436 — движок упал — ход отпущен" \
    "$(input_stop "$(transcript "$(say 'делай')" "$(edited)")")" PASS
report "end: SC-AK-1436 — движок упал — исход «движок упал» в журнале" "$(grep -c 'движок упал' "$JOURNAL" 2>/dev/null)" "1"
RT_FLOW_ENGINE="$SLOW" RT_FLOW_VERDICT_LIMIT=1 expect_stop "end: SC-AK-1437 — движок вышел за предел — ход отпущен" \
    "$(input_stop "$(transcript "$(say 'делай')" "$(edited)")")" PASS
report "end: SC-AK-1437 — движок вышел за предел — тот же исход" "$(grep -c 'движок упал' "$JOURNAL" 2>/dev/null)" "2"
RT_FLOW_ENGINE="$TURNS/none.mjs" expect_stop "end: SC-AK-1438 — движок не вызван — ход отпущен" \
    "$(input_stop "$(transcript "$(say 'делай')" "$(edited)")")" PASS
report "end: SC-AK-1438 — движок не вызван — тот же исход" "$(grep -c 'движок упал' "$JOURNAL" 2>/dev/null)" "3"

rm -f "$REPO/.git/rt-kit/refusals-in-row"
for _ in 1 2 3 4 5 6 7 8; do
    printf '%s' "$(input_stop "$(transcript "$(say 'делай')" "$(edited)")")" | "$HOOKS/turn-exit-guard.sh" >/dev/null 2>&1
done
report "end: SC-AK-1439 — восьмой отказ подряд пишется в журнал" "$(grep -c 'eighth refusal in a row' "$JOURNAL" 2>/dev/null)" "1"

# Сессия роли: роль без инструмента правки кончает ход своим отчётом.
mkdir -p "$REPO/.claude/agents"
printf -- '---\nname: reader\ntools: Read, Grep\n---\nроль\n' > "$REPO/.claude/agents/reader.md"
expect_stop "end: SC-AK-1434 — сессия роли отпускает ход через хук" \
    "$(input_role reader "$(transcript "$(say 'разбери')" "$(edited)")")" PASS

suite_result "проверка выхода из хода"
