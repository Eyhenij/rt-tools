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
    local out label got want code
    out="$(cd "$TESTS" && node --input-type=module 2>&1)"
    code=$?
    report "блок случаев отработал без ошибки" "$code" 0
    [ "$code" -eq 0 ] || printf '%s\n' "$out" | grep -v '|' | head -5 >&2
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
import { releaseCase, holdReason, menuCause, menuOptions } from '../assets/checks/flow-verdict.mjs';
import { judgeCall } from '../assets/checks/flow-guard.mjs';
import { wordOf as sourceWordOf } from '../assets/task-flow/source/owner.mjs';
import { epicPlan } from '../assets/task-flow/measure/epic-text.mjs';
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
out('end: SC-AK-1555 — коммит с переменными впереди — запись', wrote([{ name: 'Bash', input: { command: 'GIT_AUTHOR_NAME=x GIT_AUTHOR_EMAIL="a b" git commit -m x' } }]), 'true');
out('end: SC-AK-1555 — коммит с параметрами git — запись', wrote([{ name: 'Bash', input: { command: 'git -c commit.gpgsign=false -C /t commit -q -F m.txt' } }]), 'true');
out('end: SC-AK-1555 — правка файла через sed -i — запись', wrote([{ name: 'Bash', input: { command: "sed -i '' 's/a/b/' x.md" } }]), 'true');
out('end: SC-AK-1555 — sed без -i — не запись', wrote([{ name: 'Bash', input: { command: "sed -n 1,5p x.md" } }]), 'false');
out('end: SC-AK-1556 — «хватит спрашивать, иди дальше» — держится', stop('хватит спрашивать, иди дальше'), 'false');
out('end: SC-AK-1556 — «не сейчас про это, сначала тесты» — держится', stop('не сейчас про это, сначала тесты'), 'false');
out('end: SC-AK-1556 — «stop asking me» — держится', stop('stop asking me'), 'false');
out('end: SC-AK-1556 — «стоп» — отпущен по-прежнему', stop('стоп'), 'true');
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

// --- меню владельцу: шаг владельца или шаг, который запрещает другая проверка ---------------------
const HOLD_MENU = { cause: null, task: '7' };
const forbiddenBy = (name) => (name === 'measure.session.forbidden' ? 'git-guard-delivery' : false);
const checkMenu = holdReason(model, stage, null, { ...HOLD_MENU, cause: menuCause(forbiddenBy) });
const ownerMenu = checkMenu;
out('menu: SC-AK-1744 — строка шага владельца меню не называет', String(holdReason(model, stage, null, { ...HOLD_MENU, cause: menuCause((name) => name === 'measure.epic.ownerStep') }).includes("owner's menu")), 'false');
out('menu: SC-AK-1442 — шаг запрещает другая проверка — меню об этой проверке', String(checkMenu.includes('`git-guard-delivery` refused the same step twice') && checkMenu.includes("owner's menu")), 'true');
const blockedBy = (by, reason) => ({ kind: 'blocked', by, reason });
const called = (name, input = {}, blocked = false) => ({ kind: 'call', name, input, blocked });
const forbids = (list) => String(session.forbidden(events(list))(data));
const PUSH = called('Bash', { command: 'git push' }, true);
out('menu: SC-AK-1442 — два отказа одной проверки подряд — шаг запрещён', forbids([PUSH, blockedBy('git-guard-delivery', 'no task'), PUSH, blockedBy('git-guard-delivery', 'no task')]), 'git-guard-delivery');
out('menu: SC-AK-1442 — запись между отказами снимает счёт', forbids([blockedBy('x', 'r'), called('Edit'), blockedBy('x', 'r')]), 'false');
out('menu: SC-AK-1442 — другая причина — не запрет', forbids([blockedBy('x', 'r1'), blockedBy('x', 'r2')]), 'false');

const refused = { kind: 'refusal', text: 'Stop hook feedback:\nBLOCKED by turn-exit-guard: x' };
const idles = (list) => String(session.idle(events(list))(data));
out('menu: SC-AK-1701 — остановка без вызова после отказа — простой', idles([called('Edit'), refused]), 'true');
out('menu: SC-AK-1701 — вызов после отказа — не простой', idles([refused, called('Read')]), 'false');
out('menu: SC-AK-1701 — первая остановка — не простой', idles([called('Edit')]), 'false');
const idleMenu = holdReason(model, stage, null, { ...HOLD_MENU, cause: menuCause((name) => name === 'measure.session.idle') });
out('menu: SC-AK-1701 — простой называет меню владельцу', String(idleMenu.includes('no call followed it') && idleMenu.includes("owner's menu")), 'true');

// --- ожидание своей фоновой задачи -----------------------------------------------------------------
const NOW = Date.parse('2026-11-19T12:00:00Z');
const minutesAgo = (m) => NOW - m * 60_000;
const timed = (list) => ({ session: { events: () => list, now: () => NOW } });
const waits = (list) => String(session.waiting(timed(list))(data));
const started = (id, m) => ({ kind: 'background', id, task: `task-${id}`, at: minutesAgo(m) });
const over = (id) => ({ kind: 'backgroundEnd', id, task: `task-${id}` });
const ended = { kind: 'ended' };
const BG = called('Bash', { command: 'pnpm test', run_in_background: true });
const WAITING = { ...WROTE, 'measure.session.waiting': true };
out('end: SC-AK-1761 — фоновая задача идёт — сессия ждёт', waits([called('Edit'), BG, started('a', 3)]), 'true');
out('end: SC-AK-1761 — задача кончилась — не ждёт', waits([BG, started('a', 3), over('a')]), 'false');
out('end: SC-AK-1761 — конец по номеру задачи без номера вызова', waits([BG, started('a', 3), { kind: 'backgroundEnd', id: null, task: 'task-a' }]), 'false');
out('end: SC-AK-1761 — одна из двух задач ещё идёт — ждёт', waits([BG, started('a', 9), BG, started('b', 2), over('a')]), 'true');
out('end: SC-AK-1761 — без фоновых задач — не ждёт', waits([called('Edit'), refused]), 'false');
out('end: SC-AK-1761 — ожидающий ход отпущен своим случаем', released(WAITING), 'a background task of the session runs');
out('end: SC-AK-1761 — слово остановки спрашивается раньше', released({ ...WAITING, 'measure.owner.saidStop': true }), 'a stop word of the owner');
out('end: SC-AK-1762 — задача старше границы — не ждёт', waits([BG, started('a', 21)]), 'false');
out('end: SC-AK-1762 — задача моложе границы — ждёт', waits([BG, started('a', 19)]), 'true');
out('end: SC-AK-1762 — граница — двадцать минут', String(session.BACKGROUND_BOUND), '20');
out('end: SC-AK-1762 — задача без времени начала — не ждёт', waits([BG, { kind: 'background', id: 'a', task: 't', at: NaN }]), 'false');
out('end: SC-AK-1762 — второй конец хода на той же задаче без вызова — не ждёт', waits([BG, started('a', 5), ended]), 'false');
out('end: SC-AK-1762 — вызов после конца хода — снова ждёт', waits([BG, started('a', 5), ended, called('Read')]), 'true');
out('end: SC-AK-1762 — отказ конца хода задачу не тратит', waits([BG, started('a', 5), refused]), 'true');
out('end: SC-AK-1762 — без ожидания ход с записью держится', released(WROTE), 'held');
const idlesAt = (list) => String(session.idle(timed(list))(data));
out('menu: SC-AK-1763 — остановка после отказа при идущей задаче — не простой', idlesAt([BG, started('a', 4), refused]), 'false');
out('menu: SC-AK-1763 — задача кончилась — простой, как раньше', idlesAt([BG, started('a', 4), over('a'), refused]), 'true');
out('menu: SC-AK-1763 — задача старше границы — простой', idlesAt([BG, started('a', 30), refused]), 'true');
out('menu: SC-AK-1763 — потраченная задача меню тоже не зовёт', idlesAt([BG, started('a', 4), ended, refused]), 'false');
out('menu: SC-AK-1763 — ожидание меню владельцу не называет', String(menuCause((name) => (name === 'measure.session.idle' ? session.idle(timed([BG, started('a', 4), refused]))(data) : false)) === null), 'true');
out('end: SC-AK-1764 — в состоянии «работа-отдана» ожидание не отпускает', released({ ...WAITING, 'measure.pr.handed': true }), 'held');
out('end: SC-AK-1764 — молчащий хостинг на вопросе о PR ожидание не держит', releaseCase(model, (name) => { if (name === 'measure.pr.handed') throw Object.assign(new Error('silent'), { name: 'HostSilent' }); return WAITING[name] ?? false; }, held)?.log ?? 'held', 'a background task of the session runs');

out('menu: SC-AK-1443 — заблокированная задача — берётся следующая незаблокированная', String(ownerMenu.includes('takes the next unblocked task') && ownerMenu.includes('takes the next;')), 'true');

out('menu: SC-AK-1445 — меню отказа несёт «отложить RT-N», «сделаю сам» и «стоп»', String(['«отложить RT-7»', '«сделаю сам»', '«стоп»'].every((option) => ownerMenu.includes(option))), 'true');
out('menu: SC-AK-1445 — без номера задачи вариант остаётся «отложить RT-N»', menuOptions(model.words, null).join(', '), 'отложить RT-N, сделаю сам, стоп');

const answered = (option) => sourceWordOf({ type: 'user', toolUseResult: { answers: { 'Что делать?': option } }, message: { content: [] } });
out('menu: SC-AK-1467 — вариант «стоп» меню отказа — слово владельца', answered('стоп'), 'стоп');
out('menu: SC-AK-1467 — вариант «стоп» меню отказа — отпущен', stop(answered('стоп')), 'true');

const plan = '# Эпик\n\n| # | Задача | Состояние |\n| --- | --- | --- |\n| 1 | RT-7 — проба | идёт |\n| 2 | RT-8 — дальше | впереди |\n';
const ctx = { tasksDir: 'docs/tasks', branch: 'RT-7-x', marksDir: '.git/rt-kit', plansDir: 'docs/plans', overridePath: 'o', protectedPaths: [], key: 'RT', read: () => plan };
const defer = (word) => judgeCall({ tool: 'Edit', path: 'docs/plans/epic.md', edits: [{ oldString: '| RT-7 — проба | идёт |', newString: '| RT-7 — проба | отложено |' }] }, { ...ctx, ownerLast: () => word });
out('menu: SC-AK-1468 — вариант «отложить RT-N» ставит отметку «отложено»', String(defer(answered('отложить RT-7'))), 'null');
out('menu: SC-AK-1468 — без варианта отметка отказана', String(defer('ок') !== null), 'true');

const own = judgeCall({ tool: 'Edit', path: 'docs/plans/epic.md', edits: [{ oldString: '| RT-7 — проба | идёт |', newString: '| RT-7 — проба | шаг владельца «сделаю сам» |' }] }, { ...ctx, ownerLast: () => answered('сделаю сам') });
out('menu: SC-AK-1469 — вариант «сделаю сам» блокирует задачу шагом владельца', String(own), 'null');
out('menu: SC-AK-1469 — строка шага владельца — задача заблокирована', String(epicPlan(plan.replace('| идёт |', '| шаг владельца «сделаю сам» |')).rows[0].ownerQuote), 'сделаю сам');
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

# Следующий ход начинается строкой о сбое: диспетчер на UserPromptSubmit читает журнал один раз.
# Диспетчер зовётся из своего каталога, без соседних хуков: его ветки здесь не нужны.
DISPATCH_ONLY="$(mktemp -d)"
cp "$HOOKS/dispatch.sh" "$HOOKS/hook-input.sh" "$HOOKS/utf8.sh" "$DISPATCH_ONLY/" 2>/dev/null
next_prompt() { jq -n --arg d "$REPO" '{session_id:"tests",prompt:"дальше",cwd:$d}' | CLAUDE_PROJECT_DIR="$REPO" bash "$DISPATCH_ONLY/dispatch.sh" UserPromptSubmit 2>/dev/null; }
report "end: SC-AK-1464 — после сбоя движка следующий ход начинается строкой о сбое" "$(next_prompt | grep -c 'released by a failure of the exit check')" "1"
report "end: SC-AK-1464 — строка о сбое приходит один раз" "$(next_prompt | grep -c 'released by a failure of the exit check')" "0"
rm -rf "$DISPATCH_ONLY"

rm -f "$REPO/.git/rt-kit/refusals-in-row"
for _ in 1 2 3 4 5 6 7 8; do
    printf '%s' "$(input_stop "$(transcript "$(say 'делай')" "$(edited)")")" | "$HOOKS/turn-exit-guard.sh" >/dev/null 2>&1
done
report "end: SC-AK-1439 — восьмой отказ подряд пишется в журнал" "$(grep -c 'eighth refusal in a row' "$JOURNAL" 2>/dev/null)" "1"

# Сессия в рабочей копии: движок мерит копию из поля cwd, а не главную копию проекта.
input_stop_in() {
    jq -n --arg p "$2" --arg d "$1" '{session_id:"tests",transcript_path:$p,cwd:$d,stop_hook_active:false}'
}
COPIES="$(mktemp -d)"
git -C "$REPO" worktree add -q -b feat-side "$COPIES/side" >/dev/null 2>&1
mkdir -p "$COPIES/side/tools" && : > "$COPIES/side/tools/task-flow-script.mjs"
expect_stop "end: SC-AK-1554 — копия вне сценария отпускает ход, хотя главная копия держит" \
    "$(input_stop_in "$COPIES/side" "$(transcript "$(say 'делай')" "$(edited)")")" PASS
git -C "$REPO" worktree add -q -b RT-2-other "$COPIES/bare" >/dev/null 2>&1
lines_before="$(wc -l < "$JOURNAL" 2>/dev/null | tr -d ' ')"
expect_stop "end: SC-AK-1554 — копия, чья ветка не несёт движка, не судится" \
    "$(input_stop_in "$COPIES/bare" "$(transcript "$(say 'делай')" "$(edited)")")" PASS
report "end: SC-AK-1554 — такая копия журнал не пишет" "$(wc -l < "$JOURNAL" 2>/dev/null | tr -d ' ')" "$lines_before"
mkdir -p "$COPIES/side/.claude/agents"
printf -- '---\nname: side-reader\ntools: Read\n---\nроль\n' > "$COPIES/side/.claude/agents/side-reader.md"
expect_stop "end: SC-AK-1554 — роль читается в копии сессии" \
    "$(jq -n --arg p "$(transcript "$(say 'разбери')" "$(edited)")" --arg d "$COPIES/side" '{session_id:"tests",transcript_path:$p,cwd:$d,stop_hook_active:false,agent_type:"side-reader"}')" PASS
expect_stop "end: SC-AK-1554 — главная копия держит ход по-прежнему" \
    "$(input_stop "$(transcript "$(say 'делай')" "$(edited)")")" BLOCK
git -C "$REPO" worktree remove --force "$COPIES/side" >/dev/null 2>&1
git -C "$REPO" worktree remove --force "$COPIES/bare" >/dev/null 2>&1
rm -rf "$COPIES"

# Сессия роли: роль без инструмента правки кончает ход своим отчётом.
mkdir -p "$REPO/.claude/agents"
printf -- '---\nname: reader\ntools: Read, Grep\n---\nроль\n' > "$REPO/.claude/agents/reader.md"
expect_stop "end: SC-AK-1434 — сессия роли отпускает ход через хук" \
    "$(input_role reader "$(transcript "$(say 'разбери')" "$(edited)")")" PASS

suite_result "проверка выхода из хода"
