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
import { buildModel } from '../assets/checks/flow-model.mjs';
import { isWriteCommand } from '../assets/checks/flow-data.mjs';
import { releaseCase, holdReason, menuCause, menuOptions, decide } from '../assets/checks/flow-verdict.mjs';
import * as ci from '../assets/task-flow/measure/ci.mjs';
import { judgeCall } from '../assets/checks/flow-guard.mjs';
import { wordOf as sourceWordOf } from '../assets/task-flow/source/owner.mjs';
import { eventsOf } from '../assets/task-flow/source/session.mjs';
import { epicPlan } from '../assets/task-flow/measure/epic-text.mjs';
import * as owner from '../assets/task-flow/measure/owner.mjs';
import * as session from '../assets/task-flow/measure/session.mjs';
import * as host from '../assets/task-flow/measure/host.mjs';

const path = new URL('../assets/task-flow/flow.js', import.meta.url).pathname;
const model = buildModel(path);
const data = { words: model.words, expect: model.expect, rules: { isWriteCommand } };
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
const esc = (word) => String(owner.interrupted(last(word))(data));
out('end: SC-AK-1839 — отметка Esc — прерывание', esc('[Request interrupted by user]'), 'true');
out('end: SC-AK-1839 — отметка Esc во время вызова — прерывание', esc('[Request interrupted by user for tool use]'), 'true');
for (const word of ['стоп', 'Стоп, на сегодня хватит', 'не сейчас', 'подожди']) out(`end: SC-AK-1839 — «${word}» — не прерывание`, esc(word), 'false');
out('end: SC-AK-1839 — случай отпуска по Esc', released({ ...WROTE, 'measure.owner.interrupted': true }), 'the owner interrupted the turn');
const ownerReader = (word) => (name) => (name === 'measure.owner.interrupted' ? owner.interrupted(last(word))(data) : (WROTE[name] ?? false));
out('end: SC-AK-1839 — «стоп» в «этап-идёт» с несделанным шагом держит ход', String(decide(model, ownerReader('стоп'), { state: 'этап-идёт', index: 7, reason: null })), 'null');

const uses = (list) => ({ session: { toolUses: () => list } });
const wrote = (list) => String(session.wrote(uses(list))(data));
out('end: SC-AK-1432 — чтение не запись', wrote([{ name: 'Read', input: {} }, { name: 'Bash', input: { command: 'git status' } }]), 'false');
out('end: SC-AK-1432 — правка файла — запись', wrote([{ name: 'Edit', input: {} }]), 'true');
out('end: SC-AK-1432 — коммит — запись', wrote([{ name: 'Bash', input: { command: 'git add a && git commit -m x' } }]), 'true');
out('end: SC-AK-1555 — коммит с переменными впереди — запись', wrote([{ name: 'Bash', input: { command: 'GIT_AUTHOR_NAME=x GIT_AUTHOR_EMAIL="a b" git commit -m x' } }]), 'true');
out('end: SC-AK-1555 — коммит с параметрами git — запись', wrote([{ name: 'Bash', input: { command: 'git -c commit.gpgsign=false -C /t commit -q -F m.txt' } }]), 'true');
out('end: SC-AK-1555 — правка файла через sed -i — запись', wrote([{ name: 'Bash', input: { command: "sed -i '' 's/a/b/' x.md" } }]), 'true');
out('end: SC-AK-1555 — sed без -i — не запись', wrote([{ name: 'Bash', input: { command: "sed -n 1,5p x.md" } }]), 'false');
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


const events = (list) => ({ session: { events: () => list } });
const MENU = 'Ask the owner: «отложить RT-7», «подскажу путь».';
const lost = (list) => String(session.menuLost(events(list))(data));
out('menu: SC-AK-1444 — меню не дошло второй раз подряд', lost([{ kind: 'refusal', text: MENU }, { kind: 'menu', answered: false }, { kind: 'refusal', text: MENU }, { kind: 'menu', answered: false }]), 'true');
out('menu: SC-AK-1444 — меню не дошло один раз — не потеряно', lost([{ kind: 'refusal', text: MENU }, { kind: 'menu', answered: false }]), 'false');
out('menu: SC-AK-1444 — отвеченное меню снимает счёт', lost([{ kind: 'refusal', text: MENU }, { kind: 'menu', answered: false }, { kind: 'refusal', text: MENU }, { kind: 'menu', answered: true }]), 'false');
out('menu: SC-AK-1444 — меню отказа не дошло до владельца второй раз подряд — отпущен', released({ ...WROTE, 'measure.session.menuLost': true }), 'the menu did not reach the owner');

const stage = { state: 'этап-идёт', index: 7, reason: null };
out('удержанный ход в этапе называет шаг и команду', String(holdReason(model, stage, { number: '3.6', name: 'Перевести' }).includes('task-flow-script.mjs step 3.6')), 'true');
out('удержанный ход до этапа называет действие состояния', String(holdReason(model, held, null).includes('explore the tree')), 'true');

// --- меню владельцу: шаг, который запрещает другая проверка, или простой -------------------------
const HOLD_MENU = { cause: null, task: '7' };
const forbiddenBy = (name) => (name === 'measure.session.forbidden' ? 'git-guard-delivery' : false);
const checkMenu = holdReason(model, stage, null, { ...HOLD_MENU, cause: menuCause(forbiddenBy) });
const ownerMenu = checkMenu;
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
out('end: SC-AK-1761 — Esc спрашивается раньше ожидания', released({ ...WAITING, 'measure.owner.interrupted': true }), 'the owner interrupted the turn');
out('end: SC-AK-1762 — задача старше границы — не ждёт', waits([BG, started('a', 91)]), 'false');
out('end: SC-AK-1762 — задача моложе границы — ждёт', waits([BG, started('a', 58)]), 'true');
out('end: SC-AK-1762 — граница — девяносто минут', String(session.BACKGROUND_BOUND), '90');
out('end: SC-AK-1762 — задача без времени начала — не ждёт', waits([BG, { kind: 'background', id: 'a', task: 't', at: NaN }]), 'false');
out('end: SC-AK-1762 — второй конец хода на той же задаче без вызова — не ждёт', waits([BG, started('a', 5), ended]), 'false');
out('end: SC-AK-1762 — вызов после конца хода — снова ждёт', waits([BG, started('a', 5), ended, called('Read')]), 'true');
out('end: SC-AK-1762 — отказ конца хода задачу не тратит', waits([BG, started('a', 5), refused]), 'true');
out('end: SC-AK-1762 — без ожидания ход с записью держится', released(WROTE), 'held');
out('end: SC-AK-1762 — две задачи отпускают два конца хода', waits([BG, started('a', 5), BG, started('b', 4), ended, ended]) + ' ' + waits([BG, started('a', 5), BG, started('b', 4), ended]), 'false true');
out('end: SC-AK-1762 — конец одной из двух задач возвращает её конец хода', waits([BG, started('a', 5), BG, started('b', 4), ended, ended, over('a')]) + ' ' + waits([BG, started('a', 5), BG, started('b', 4), ended, over('a')]), 'false true');
out('end: SC-AK-1762 — задача с началом из будущего — не ждёт', waits([BG, started('a', -60)]), 'false');
out('end: SC-AK-1761 — конец записан раньше начала — задача не идёт', waits([over('a'), started('a', 1)]), 'false');
const resumedRun = [started('a', 9), over('a'), { kind: 'background', id: 'm', task: 'task-a', at: minutesAgo(2) }];
out('end: SC-AK-1761 — поздняя копия уведомления прежнего запуска возобновлённого агента не кончает', waits([...resumedRun, over('a')]), 'true');
out('end: SC-AK-1761 — уведомление без номера вызова кончает задачу по её номеру', waits([...resumedRun, { kind: 'backgroundEnd', id: null, task: 'task-a' }]), 'false');
const idlesAt = (list) => String(session.idle(timed(list))(data));
out('menu: SC-AK-1763 — остановка после отказа при идущей задаче — не простой', idlesAt([BG, started('a', 4), refused]), 'false');
out('menu: SC-AK-1763 — потраченная задача меню тоже не зовёт', idlesAt([BG, started('a', 4), ended, refused]), 'false');
out('menu: SC-AK-1763 — ожидание меню владельцу не называет', String(menuCause((name) => (name === 'measure.session.idle' ? session.idle(timed([BG, started('a', 4), refused]))(data) : false)) === null), 'true');
// SC-AK-1797: задача кончилась после последнего вызова — её уведомление читается, меню не предлагается.
const OUT = '/tmp/tasks/task-a.output';
const withOut = (id, m) => ({ ...started(id, m), output: OUT });
const unreadAt = (list) => session.unread(timed(list))(data);
const unreadOf = (list) => JSON.stringify(unreadAt(list));
out('menu: SC-AK-1797 — задача кончилась после последнего вызова — не простой', idlesAt([BG, started('a', 4), over('a'), refused]), 'false');
out('menu: SC-AK-1797 — задача кончилась после последнего вызова — названа непрочитанной', unreadAt([BG, withOut('a', 4), over('a'), refused]).task, 'task-a');
const unreadVerdict = holdReason(model, stage, { number: '1.1', name: 'x', left: 3 }, { ...HOLD_MENU, cause: menuCause((name) => (name === 'measure.session.unread' ? unreadAt([BG, withOut('a', 4), over('a'), refused]) : false)) });
out('menu: SC-AK-1797 — отказ называет задачу, её вывод и не предлагает меню', String(unreadVerdict.includes('`task-a`') && unreadVerdict.includes(OUT) && !unreadVerdict.includes('«стоп»')), 'true');
const agentVerdict = holdReason(model, stage, null, { ...HOLD_MENU, cause: { unread: { task: 'a1', output: '/t/a1.output', agent: true } } });
out('menu: SC-AK-1797 — отказ называет агента и его отчёт в уведомлении, не файл стенограммы', String(agentVerdict.includes('`a1`') && agentVerdict.includes('report from the notice') && !agentVerdict.includes('/t/a1.output')), 'true');
out('menu: SC-AK-1797 — отказ о задаче не прячет следующий шаг', String(unreadVerdict.includes('The next move is step 1.1')), 'true');
out('menu: SC-AK-1797 — прочитано: вызов после уведомления — уведомление дошло', unreadOf([BG, withOut('a', 4), over('a'), called('Edit', { file_path: 'b.md' }), refused]), 'false');
out('menu: SC-AK-1797 — прочитано: меню после уведомления — уведомление дошло', unreadOf([BG, withOut('a', 4), over('a'), { kind: 'menu', answered: false }, refused]), 'false');
out('menu: SC-AK-1797 — прочитано: поздняя копия уведомления снова не держит', unreadOf([BG, withOut('a', 4), over('a'), called('Read', { file_path: OUT }), over('a'), refused]), 'false');
out('menu: SC-AK-1797 — прочитано: задача, кончившаяся давно, без вызова после — названа', unreadAt([BG, withOut('a', 400), over('a'), refused]).task, 'task-a');
out('menu: SC-AK-1797 — не своя или снятая: снятая самой сессией задача прочитана', unreadOf([BG, started('a', 4), called('TaskStop', { task_id: 'task-a' }), { kind: 'backgroundEnd', id: null, task: 'task-a', output: null, stopped: true }, over('a'), refused]), 'false');
out('menu: SC-AK-1797 — не своя или снятая: задача, которую убил харнесс, не держит', unreadOf([BG, started('a', 4), { kind: 'backgroundEnd', id: 'a', task: 'task-a', output: null, status: 'killed' }, refused]), 'false');
const resumed = [BG, started('a', 9), over('a'), called('Read'), { kind: 'background', id: 'm', task: 'task-a', at: minutesAgo(2) }];
out('menu: SC-AK-1797 — не своя или снятая: поздняя копия уведомления прежнего запуска не кончает возобновлённый', unreadOf([...resumed, over('a'), refused]), 'false');
out('menu: SC-AK-1797 — возобновлённый агент кончился — назван', unreadAt([...resumed, { kind: 'backgroundEnd', id: 'm', task: 'task-a' }, refused]).task, 'task-a');
out('menu: SC-AK-1797 — не своя или снятая: конец задачи без её начала не держит', unreadOf([called('Read'), { kind: 'backgroundEnd', id: null, task: 'task-z', output: null }, refused]), 'false');
const forbiddenOverUnread = menuCause((name) => (name === 'measure.session.unread' ? unreadAt([BG, withOut('a', 4), over('a')]) : forbiddenBy(name)));
out('menu: SC-AK-1797 — запрет другой проверки над непрочитанной задачей меню не зовёт', String(Boolean(forbiddenOverUnread?.unread) && !forbiddenOverUnread.by), 'true');
out('menu: SC-AK-1797 — запрет другой проверки после прочтения снова зовёт меню', String(session.forbidden(timed([BG, started('a', 4), over('a'), called('Read'), blockedBy('git-guard-delivery', 'r'), blockedBy('git-guard-delivery', 'r')]))(data)), 'git-guard-delivery');
out('menu: SC-AK-1797 — старше предела: идущая задача не названа, простой как прежде', `${unreadOf([BG, withOut('a', 95), refused])} ${idlesAt([BG, started('a', 95), refused])}`, 'false true');
out('menu: SC-AK-1797 — простой без кончившейся задачи по-прежнему зовёт меню', `${idlesAt([called('Edit'), refused])} ${unreadOf([called('Edit'), refused])}`, 'true false');
out('end: SC-AK-1764 — в состоянии «работа-отдана» ожидание не отпускает', released({ ...WAITING, 'measure.pr.handed': true }), 'held');
out('end: SC-AK-1764 — молчащий хостинг на вопросе о PR ожидание не держит', releaseCase(model, (name) => { if (name === 'measure.pr.handed') throw Object.assign(new Error('silent'), { name: 'HostSilent' }); return WAITING[name] ?? false; }, held)?.log ?? 'held', 'a background task of the session runs');

out('menu: SC-AK-1443 — заблокированная задача — берётся следующая незаблокированная', String(ownerMenu.includes('takes the next unblocked task')), 'true');

out('menu: SC-AK-1842 — меню отказа несёт «отложить RT-N» и «подскажу путь», без «стоп»', String(['«отложить RT-7»', '«подскажу путь»'].every((option) => ownerMenu.includes(option)) && !ownerMenu.includes('«стоп»')), 'true');
out('menu: SC-AK-1842 — без номера задачи вариант остаётся «отложить RT-N»', menuOptions(model.words, null).join(', '), 'отложить RT-N, подскажу путь');
out('menu: SC-AK-1842 — удержание просит путь в свободном поле того же меню', String(ownerMenu.includes('the way goes into its free field') && ownerMenu.includes('A bare «подскажу путь»')), 'true');

const answered = (option) => sourceWordOf({ type: 'user', toolUseResult: { answers: { 'Что делать?': option } }, message: { content: [] } });
out('menu: SC-AK-1467 — вариант меню отказа — слово владельца', answered('подскажу путь'), 'подскажу путь');
out('menu: SC-AK-1467 — вариант меню отказа ход не отпускает', String(owner.interrupted(last(answered('подскажу путь')))(data)), 'false');

const plan = '# Эпик\n\n| # | Задача | Состояние |\n| --- | --- | --- |\n| 1 | RT-7 — проба | идёт |\n| 2 | RT-8 — дальше | впереди |\n';
const ctx = { tasksDir: 'docs/tasks', branch: 'RT-7-x', marksDir: '.git/rt-kit', plansDir: 'docs/plans', overridePath: 'o', protectedPaths: [], key: 'RT', read: () => plan };
const defer = (word) => judgeCall({ tool: 'Edit', path: 'docs/plans/epic.md', edits: [{ oldString: '| RT-7 — проба | идёт |', newString: '| RT-7 — проба | отложено |' }] }, { ...ctx, ownerLast: () => word });
out('menu: SC-AK-1468 — вариант «отложить RT-N» ставит отметку «отложено»', String(defer(answered('отложить RT-7'))), 'null');
out('menu: SC-AK-1468 — без варианта отметка отказана', String(defer('ок') !== null), 'true');

// SC-AK-1800 — событие вызова несёт время и ветку записи, событие фоновой задачи — команду вызова
const watchCall = { type: 'assistant', timestamp: '2026-11-21T11:04:00Z', gitBranch: 'RT-7-x', message: { stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 'w1', name: 'Bash', input: { command: 'gh run watch 41 --exit-status', run_in_background: true } }] } };
const watchStarted = { type: 'user', timestamp: '2026-11-21T11:04:01Z', toolUseResult: { backgroundTaskId: 'b1' }, message: { content: [{ type: 'tool_result', tool_use_id: 'w1', content: 'Command running in background with ID: b1.' }] } };
const watchEvents = eventsOf([watchCall, watchStarted]);
out('end: SC-AK-1800 — вызов несёт время и ветку своей записи', `${watchEvents[0].at} ${watchEvents[0].branch}`, `${Date.parse('2026-11-21T11:04:00Z')} RT-7-x`);
out('end: SC-AK-1800 — фоновая задача несёт команду своего вызова', watchEvents.find((e) => e.kind === 'background')?.command, 'gh run watch 41 --exit-status');
out('end: SC-AK-1800 — запись без ветки даёт ветку null', String(eventsOf([{ ...watchCall, gitBranch: undefined }])[0].branch), 'null');
const attached = { type: 'attachment', timestamp: '2026-11-21T11:30:00Z', attachment: { type: 'queued_command', prompt: '<task-notification>\n<task-id>b1</task-id>\n<tool-use-id>w1</tool-use-id>\n<status>completed</status>\n</task-notification>' } };
out('end: SC-AK-1800 — уведомление в виде attachment кончает фоновую задачу', JSON.stringify(eventsOf([watchCall, watchStarted, attached]).filter((e) => e.kind === 'backgroundEnd').map((e) => [e.id, e.at])), JSON.stringify([['w1', Date.parse('2026-11-21T11:30:00Z')]]));

// --- удержание хода по CI: двойники хостинга и сессии -------------------------------------------
const T0 = Date.parse('2026-11-21T08:15:50Z');
const END = Date.parse('2026-11-21T08:23:09Z');
const RUN = 44884048830;
const PR = { number: 3472, head: 'RT-3302-checks', headRefOid: '0483969abcdef0', base: 'main', createdAt: T0 - 3_600_000 };
const silentErr = () => { throw Object.assign(new Error('silent'), { name: 'HostSilent' }); };
const ciHost = ({ pulls = [PR], runs = {}, bases = ['main'], silent = false, issues = {} } = {}) => {
    const ans = (v) => (silent ? silentErr() : v);
    return { issue: (n) => ans(issues[n] ?? null), pulls: () => ans([]), openPulls: () => ans(pulls), runs: (sha) => ans(runs[sha] ?? []), pipeline: () => ({ file: '.github/workflows/ci.yml', bases }) };
};
const EPIC_PLAN = '# Эпик\n\n**Эпик:** RT-3471\n**Ветка эпика:** `RT-3471-rework`\n\n| # | Задача | Состояние |\n| --- | --- | --- |\n| 1 | RT-3467 — CI | идёт |\n';
const ciTree = (plans = {}) => ({ copyEpic: () => null, list: () => Object.keys(plans), read: (p) => plans[p.split('/').pop()] ?? null });
const holdOf = ({ branch = PR.head, host = ciHost(), events = [], now = END + 60_000, word = null, plans = {} } = {}) =>
    ci.hold({ git: { branch: () => branch }, host, tree: ciTree(plans), session: { events: () => events, now: () => now }, owner: { last: () => word } })(data);
const kindOf = (h) => (h ? `${h.kind} ${h.run?.id ?? '-'}` : 'none');
const runOf = (over) => ({ id: RUN, attempt: 1, status: 'completed', conclusion: 'failure', endedAt: END, ...over });
const goingRun = runOf({ status: 'in_progress', conclusion: null, endedAt: null });
const redRun = runOf({});
const onHead = (run) => ciHost({ runs: { [PR.headRefOid]: [run] } });
const bash = (command, at, over = {}) => ({ kind: 'call', name: 'Bash', input: { command }, blocked: false, at, branch: PR.head, ...over });
const bgStart = (id, command, at) => ({ kind: 'background', id, task: `b-${id}`, at, output: `/tmp/${id}.output`, agent: false, command });
const bgEnd = (id) => ({ kind: 'backgroundEnd', id, task: `b-${id}`, output: null });
const stageState = { state: 'этап-идёт', index: 7, reason: null };
const ciReader = (answers) => (name) => (typeof answers[name] === 'function' ? answers[name]() : answers[name] ?? false);

// SC-AK-1801 — идущий запуск без слежения держит ход с номером
const goingHold = holdOf({ host: onHead(goingRun), now: T0 + 120_000 });
out('end: SC-AK-1801 — идущий запуск без слежения держит ход', kindOf(goingHold), `running ${RUN}`);
out('end: SC-AK-1801 — отказ называет номер и команду слежения', String(decide(model, ciReader({ 'measure.ci.hold': goingHold }), stageState)?.block?.includes(`gh run watch ${RUN} --exit-status`)), 'true');

// SC-AK-1802 — фоновое слежение снимает удержание, дальше решает сценарий
const watching = [bgStart('w1', `/opt/homebrew/bin/gh run watch ${RUN} --exit-status`, T0 + 10_000)];
out('end: SC-AK-1802 — слежение за номером снимает удержание', kindOf(holdOf({ host: onHead(goingRun), events: watching, now: T0 + 120_000 })), 'none');
out('end: SC-AK-1802 — слежение старше 20 минут снимает удержание, пока запуск идёт', kindOf(holdOf({ host: onHead(goingRun), events: watching, now: T0 + 41 * 60_000 })), 'none');
out('end: SC-AK-1802 — слежение за номером PR тоже слежение', kindOf(holdOf({ host: onHead(goingRun), events: [bgStart('w2', 'gh pr checks 3472 --watch', T0)], now: T0 + 120_000 })), 'none');
out('end: SC-AK-1802 — фоновая задача с номером PR в имени журнала — не слежение', kindOf(holdOf({ host: onHead(goingRun), events: [bgStart('w3', 'pnpm run check:all > /tmp/pr-3472.log 2>&1', T0)], now: T0 + 120_000 })), `running ${RUN}`);
out('end: SC-AK-1802 — фоновый вызов клиента без watch — не слежение', kindOf(holdOf({ host: onHead(goingRun), events: [bgStart('w4', 'gh pr comment 3472 --body ok', T0)], now: T0 + 120_000 })), `running ${RUN}`);
out('end: SC-AK-1802 — слежение по имени ветки PR — слежение', kindOf(holdOf({ host: onHead(goingRun), events: [bgStart('w5', `id=$(gh run list --branch ${PR.head} --limit 1 --json databaseId --jq '.[0].databaseId'); gh run watch "$id" --exit-status`, T0)], now: T0 + 120_000 })), 'none');
out('end: SC-AK-1840 — слежение за CI отпускает остановку как ожидание', String(session.waiting({ session: { events: () => watching, now: () => T0 + 120_000 } })()), 'true');
out('end: SC-AK-1802 — снятое удержание не отпускает ход в «работа-отдана»', String(decide(model, ciReader({ ...WROTE, 'measure.session.waiting': true, 'measure.pr.handed': true }), stageState)), 'null');

// SC-AK-1803 — красный непрочитанный запуск держит ход с номером
const redHold = holdOf({ host: onHead(redRun) });
out('end: SC-AK-1803 — красный без чтения держит ход', kindOf(redHold), `red ${RUN}`);
out('end: SC-AK-1803 — отказ называет номер и команду чтения', String(ciHoldReasonHas(redHold, `gh run view ${RUN} --log-failed`)), 'true');
function ciHoldReasonHas(hold, text) { return decide(model, ciReader({ 'measure.ci.hold': hold }), stageState).block.includes(text); }

// SC-AK-1804 — красный прочитан после конца — удержание снято
out('end: SC-AK-1804 — вызов с номером после конца — прочитан', kindOf(holdOf({ host: onHead(redRun), events: [bash(`gh run view ${RUN} --log-failed`, END + 5_000)] })), 'none');
out('end: SC-AK-1804 — чтение вывода слежения после конца — прочитан', kindOf(holdOf({ host: onHead(redRun), events: [...watching, bgEnd('w1'), { kind: 'call', name: 'Read', input: { file_path: '/tmp/w1.output' }, blocked: false, at: END + 5_000 }] })), 'none');
out('end: SC-AK-1804 — чтение вывода слежения через cat — прочитан', kindOf(holdOf({ host: onHead(redRun), events: [...watching, bgEnd('w1'), bash('cat /tmp/w1.output | tail -40', END + 5_000)] })), 'none');
out('end: SC-AK-1804 — отказанный вызов с номером не чтение', kindOf(holdOf({ host: onHead(redRun), events: [bash(`gh run view ${RUN} --log-failed`, END + 5_000, { blocked: true })] })), `red ${RUN}`);
out('end: SC-AK-1804 — упавший вызов с номером не чтение', kindOf(holdOf({ host: onHead(redRun), events: [bash(`gh run view ${RUN} --log-failed`, END + 5_000, { failed: true })] })), `red ${RUN}`);
out('end: SC-AK-1804 — правка текста с номером запуска не чтение', kindOf(holdOf({ host: onHead(redRun), events: [{ kind: 'call', name: 'Edit', input: { file_path: 'notes.md', new_string: `run ${RUN} red` }, blocked: false, at: END + 5_000 }] })), `red ${RUN}`);

// SC-AK-1805 — вызов слежения до конца запуска не чтение
out('end: SC-AK-1805 — слежение до конца, чтения после — нет: держит', kindOf(holdOf({ host: onHead(redRun), events: [bash(`gh run watch ${RUN} --exit-status`, T0 + 10_000), ...watching, bgEnd('w1')] })), `red ${RUN}`);
out('end: SC-AK-1805 — номер внутри другого числа не называет запуск', kindOf(holdOf({ host: onHead(redRun), events: [bash(`echo 9${RUN}1`, END + 5_000)] })), `red ${RUN}`);
out('end: SC-AK-1805 — команда без клиента хостинга с номером — не чтение', kindOf(holdOf({ host: onHead(redRun), events: [bash(`echo ${RUN}`, END + 5_000)] })), `red ${RUN}`);

// SC-AK-1806 — зелёный и пропущенный запуски ход не держат
out('end: SC-AK-1806 — зелёный запуск не держит', kindOf(holdOf({ host: onHead(runOf({ conclusion: 'success' })) })), 'none');
out('end: SC-AK-1806 — пропущенный запуск не держит', kindOf(holdOf({ host: onHead(runOf({ conclusion: 'skipped' })) })), 'none');
out('end: SC-AK-1806 — конвейер без pull_request ничего не держит', kindOf(holdOf({ host: ciHost({ runs: { [PR.headRefOid]: [redRun] }, bases: [] }) })), 'none');

// SC-AK-1807 — молчащий хостинг снимает удержание, ход решают случаи отпуска
let silentHold = 'held';
try { holdOf({ host: ciHost({ silent: true }) }); } catch (error) { silentHold = error.name; }
out('end: SC-AK-1807 — мера на молчащем хостинге бросает HostSilent', silentHold, 'HostSilent');
out('end: SC-AK-1807 — вердикт на молчащем хостинге отпускает по концу сценария', decide(model, ciReader({ 'measure.ci.hold': silentErr, 'measure.epic.finished': true }), stageState)?.release ?? 'held', 'the end of the scenario');

// SC-AK-1808 — конец эпика не отпускает идущий запуск его PR
const epicEnd = decide(model, ciReader({ 'measure.ci.hold': goingHold, 'measure.epic.finished': true }), { state: null, index: 14, reason: null });
out('end: SC-AK-1808 — конец эпика при идущем запуске — отказ с номером', String(Boolean(epicEnd?.block?.includes(String(RUN)))), 'true');
out('end: SC-AK-1808 — вне эпика с отданным PR — тоже отказ', String(Boolean(decide(model, ciReader({ 'measure.ci.hold': redHold, ...WROTE, 'measure.copy.outsideEpic': true, 'measure.pr.handed': true }), stageState)?.block)), 'true');

// SC-AK-1809 — вершину сдвинула отправка или слияние в ветку эпика, сессия ушла на другую ветку
out('end: SC-AK-1809 — отправленная ветка держит ход после перехода', kindOf(holdOf({ branch: 'RT-3493-next', host: onHead(goingRun), events: [bash(`git push -u origin ${PR.head}`, T0 - 5_000)], now: T0 + 120_000 })), `running ${RUN}`);
out('end: SC-AK-1809 — перенаправление вывода отправки не прячет ветку', JSON.stringify([...ci.pushedHeads([bash(`git push -u origin ${PR.head} > /tmp/push.log 2>&1`, T0)]).keys()]), JSON.stringify([PR.head]));
out('end: SC-AK-1809 — ветка в кавычках', JSON.stringify([...ci.pushedHeads([bash('git push -u origin "RT-1-a"', END)]).keys()]), '["RT-1-a"]');
out('end: SC-AK-1809 — строка, продолженная обратной чертой', JSON.stringify([...ci.pushedHeads([bash('git push -u origin \\\nRT-1-a', END)]).keys()]), '["RT-1-a"]');
out('end: SC-AK-1809 — адрес с подстановкой и конвейером внутри', JSON.stringify([...ci.pushedHeads([bash('git push -q "https://x-access-token:$(cat ~/t)@github.com/$(git remote get-url origin | sed s#x##).git" RT-3326-a', END)]).keys()]), '["RT-3326-a"]');
out('end: SC-AK-1809 — помощник учётных данных в кавычках перед push', JSON.stringify([...ci.pushedHeads([bash(`git -c credential.helper= -c credential.helper='!f() { echo username=x-access-token; echo "password=$(cat ~/t)"; }; f' push origin RT-3347-a 2>&1 | tail -5`, END)]).keys()]), '["RT-3347-a"]');
out('end: SC-AK-1809 — `--head` с владельцем ветки', JSON.stringify([...ci.pushedHeads([bash('gh pr create --head Eyhenij:RT-1-a --base main', END)]).keys()]), '["RT-1-a"]');
out('end: SC-AK-1809 — отправка HEAD берёт ветку записи', JSON.stringify([...ci.pushedHeads([bash('git push origin HEAD', T0)]).keys()]), JSON.stringify([PR.head]));
out('end: SC-AK-1809 — две ветки одной отправки и ключ -H', JSON.stringify([...ci.pushedHeads([bash('git push origin RT-1-a RT-2-b', T0), bash('gh pr create -H RT-3-c --base main', T0)]).keys()]), JSON.stringify(['RT-1-a', 'RT-2-b', 'RT-3-c']));
out('end: SC-AK-1809 — checkout -b и отправка HEAD в одной команде', JSON.stringify([...ci.pushedHeads([bash('git checkout -b RT-9-new && git push -u origin HEAD', T0)]).keys()]), JSON.stringify(['RT-9-new']));
const epicPr = { ...PR, number: 3500, head: 'RT-3471-rework' };
const epicHost = ciHost({ pulls: [epicPr], runs: { [PR.headRefOid]: [goingRun] }, issues: { 3467: { open: true, status: 'in-progress', epic: '3471' } } });
out('end: SC-AK-1809 — ветка эпика текущей задачи держит ход без отправки', kindOf(holdOf({ branch: 'RT-3467-ci', host: epicHost, plans: { 'e.md': EPIC_PLAN }, now: T0 + 120_000 })), `running ${RUN}`);
out('end: SC-AK-1809 — чужая ветка не держит', kindOf(holdOf({ branch: 'RT-3493-next', host: onHead(goingRun), now: T0 + 120_000 })), 'none');

// SC-AK-1810 — свежая вершина без запуска держит ход две минуты, только для базы конвейера
const pushedNow = [bash(`git push origin ${PR.head}`, END)];
out('end: SC-AK-1810 — вершина моложе двух минут без запуска держит', kindOf(holdOf({ events: pushedNow, now: END + 60_000 })), 'fresh -');
out('end: SC-AK-1810 — старше двух минут не держит', kindOf(holdOf({ events: pushedNow, now: END + 3 * 60_000 })), 'none');
out('end: SC-AK-1810 — окно считается от конца отправки, не от начала', kindOf(holdOf({ events: [bash(`git push origin ${PR.head}`, END - 200_000, { doneAt: END })], now: END + 60_000 })), 'fresh -');
out('end: SC-AK-1810 — фоновая отправка: окно от уведомления о её конце', kindOf(holdOf({ events: [{ ...bash(`git push origin ${PR.head}`, END - 300_000), id: 'p1', input: { command: `git push origin ${PR.head}`, run_in_background: true }, doneAt: END - 299_000 }, { kind: 'backgroundEnd', id: 'p1', task: 'b-p1', at: END }], now: END + 60_000 })), 'fresh -');
out('end: SC-AK-1810 — база вне конвейера не держит', kindOf(holdOf({ host: ciHost({ pulls: [{ ...PR, base: 'RT-3471-rework' }] }), events: pushedNow, now: END + 60_000 })), 'none');
out('end: SC-AK-1810 — база по маске конвейера держит', kindOf(holdOf({ host: ciHost({ pulls: [{ ...PR, base: 'release-1' }], bases: ['release-*'] }), events: pushedNow, now: END + 60_000 })), 'fresh -');

// SC-AK-1811 — три остановки на одном красном запуске дают один отказ, когда после него было чтение
const stops = [[], [bash(`gh run view ${RUN} --log-failed`, END + 5_000)], [bash(`gh run view ${RUN} --log-failed`, END + 5_000), bash('git status', END + 9_000)]];
out('end: SC-AK-1811 — три остановки — один отказ', String(stops.filter((events) => holdOf({ host: onHead(redRun), events })).length), '1');

// SC-AK-1812 — вторая остановка без вызова называет запуск, не меню
const second = decide(model, ciReader({ 'measure.ci.hold': redHold, 'measure.session.idle': true }), stageState)?.block ?? '';
out('end: SC-AK-1812 — вторая остановка без вызова называет запуск, не меню', `${second.startsWith(`The CI run ${RUN}`)} ${second.includes("The one move is the owner's menu")}`, 'true false');

// SC-AK-1839 — слово владельца удержание CI не снимает
out('end: SC-AK-1839 — «стоп» не снимает свежую вершину без запуска', kindOf(holdOf({ events: [bash(`git push origin ${PR.head}`, END)], word: 'стоп', now: END + 60_000 })), 'fresh -');
const ESC = '[Request interrupted by user]';
const queuedEntry = (prompt, kind = 'human') => ({ type: 'attachment', attachment: { type: 'queued_command', prompt, origin: { kind } } });
out('end: SC-AK-1839 — сообщение, набранное во время хода, — слово владельца', String(sourceWordOf(queuedEntry('нет, продолжай шаг 2'))), 'нет, продолжай шаг 2');
out('end: SC-AK-1839 — уведомление задачи в очереди — не слово владельца', String(sourceWordOf(queuedEntry('<task-notification>x</task-notification>', 'task-notification'))), 'null');
out('end: SC-AK-1839 — обёртка в очереди от человека — не слово', String(sourceWordOf(queuedEntry('<command-name>/x</command-name>'))), 'null');
out('end: SC-AK-1839 — после Esc красный запуск ход не держит', kindOf(holdOf({ host: onHead(redRun), word: ESC })), 'none');
out('end: SC-AK-1839 — после Esc идущий запуск без слежения ход не держит', kindOf(holdOf({ host: onHead(goingRun), word: ESC, now: T0 + 120_000 })), 'none');
out('end: SC-AK-1839 — после нового слова владельца красный снова держит', kindOf(holdOf({ host: onHead(redRun), word: 'продолжай' })), `red ${RUN}`);

JS

# --- сам хук на дереве фикстуры ---------------------------------------------------------------------
# Движку нужна история ветки: дерево фикстуры получает главную ветку с коммитом и ветку задачи.
git -C "$REPO" -c user.name=t -c user.email=t@t -c commit.gpgsign=false commit -q --allow-empty -m 'основание' >/dev/null 2>&1
# Ветка без разбора меряется первым состоянием: сессия, которая писала, держится.
expect_stop "удержанный ход: сессия писала, сценарий не кончен" \
    "$(input_stop "$(transcript "$(say 'делай')" "$(edited)")")" BLOCK
expect_reason "отказ называет измеренное состояние" \
    "$(input_stop "$(transcript "$(say 'делай')" "$(edited)")")" 'просьба-не-разобрана'
expect_stop "end: SC-AK-1839 — «стоп» ход через хук не отпускает" \
    "$(input_stop "$(transcript "$(edited)" "$(say 'Стоп, хватит')")")" BLOCK
expect_stop "end: SC-AK-1839 — «не сейчас» ход через хук не отпускает" \
    "$(input_stop "$(transcript "$(edited)" "$(say 'не сейчас')")")" BLOCK
expect_stop "end: SC-AK-1839 — Esc отпускает ход через хук" \
    "$(input_stop "$(transcript "$(edited)" "$(say '[Request interrupted by user]')")")" PASS
queued() { jq -c -n --arg t "$1" '{type:"attachment",attachment:{type:"queued_command",prompt:$t,origin:{kind:"human"}}}'; }
said_at() { jq -c -n --arg t "$1" --arg at "$2" '{type:"user",timestamp:$at,message:{content:[{type:"text",text:$t}]}}'; }
expect_stop "end: SC-AK-1839 — Esc через полторы секунды после поручения останавливает и его — ход отпущен" \
    "$(input_stop "$(transcript "$(edited)" "$(said_at 'делай задачу' 2026-11-16T00:27:54.000Z)" "$(said_at '[Request interrupted by user]' 2026-11-16T00:27:55.500Z)")")" PASS
expect_stop "end: SC-AK-1839 — вставленный текст в очереди после Esc — слово, ход держится" \
    "$(input_stop "$(transcript "$(edited)" "$(say '[Request interrupted by user]')" "$(queued '<pasted_content id="p1">разбор: делай шаг 2</pasted_content>')")")" BLOCK
expect_stop "end: SC-AK-1839 — обёртка команды оболочки после Esc — не слово, ход отпущен" \
    "$(input_stop "$(transcript "$(edited)" "$(say '[Request interrupted by user]')" "$(say '<bash-input>git status</bash-input>')")")" PASS
expect_stop "end: SC-AK-1839 — Esc через минуту после поручения — остановка, ход отпущен" \
    "$(input_stop "$(transcript "$(edited)" "$(said_at 'делай задачу' 2026-11-16T00:27:54.000Z)" "$(said_at '[Request interrupted by user]' 2026-11-16T00:28:54.000Z)")")" PASS
expect_stop "end: SC-AK-1839 — слово, набранное после Esc во время хода, снова держит ход" \
    "$(input_stop "$(transcript "$(edited)" "$(say '[Request interrupted by user]')" "$(queued 'нет, продолжай шаг 2')")")" BLOCK
expect_stop "end: SC-AK-1432 — сессия без записи отпускает ход через хук" \
    "$(input_stop "$(transcript "$(say 'расскажи, что в ветке')" "$(reply)")")" PASS

# Фоновая задача сессии: запуск с ответом, который несёт номер задачи и время записи.
bg_run() {
    jq -c -n '{type:"assistant",message:{content:[{type:"tool_use",id:"bg1",name:"Bash",input:{command:"pnpm test",run_in_background:true}}]}}'
}
bg_started() {
    jq -c -n --arg t "$(node -e "console.log(new Date(Date.now() - $1 * 60000).toISOString())")" \
        '{type:"user",timestamp:$t,toolUseResult:{backgroundTaskId:"b1"},message:{content:[{type:"tool_result",tool_use_id:"bg1",content:"Command running in background with ID: b1. Output is being written to: /tmp/tasks/b1.output. You will be notified."}]}}'
}
bg_over() {
    jq -c -n '{type:"queue-operation",operation:"enqueue",content:"<task-notification>\n<task-id>b1</task-id>\n<tool-use-id>bg1</tool-use-id>\n<status>completed</status>\n</task-notification>"}'
}
expect_stop "end: SC-AK-1761 — фоновая задача идёт — ход отпущен через хук" \
    "$(input_stop "$(transcript "$(say 'делай')" "$(edited)" "$(bg_run)" "$(bg_started 2)")")" PASS
report "end: SC-AK-1761 — отпуск на ожидании пишется в журнал" "$(grep -c 'ход отпущен на ожидании' "$REPO/.git/rt-kit/turn-exit.log" 2>/dev/null)" "1"
expect_stop "end: SC-AK-1761 — задача кончилась — ход держится через хук" \
    "$(input_stop "$(transcript "$(say 'делай')" "$(edited)" "$(bg_run)" "$(bg_started 2)" "$(bg_over)")")" BLOCK
expect_stop "end: SC-AK-1762 — задача старше границы — ход держится через хук" \
    "$(input_stop "$(transcript "$(say 'делай')" "$(edited)" "$(bg_run)" "$(bg_started 95)")")" BLOCK

# Стенограмма вида 21.11: набор в фоне, правка, отказ остановки другой проверки, конец набора.
bg_refused() { jq -c -n '{type:"user",message:{content:"Stop hook feedback:\nBLOCKED by git-guard-draft-ready: снять черновик"}}'; }
NIGHT="$(input_stop "$(transcript "$(say 'делай')" "$(bg_run)" "$(bg_started 2)" "$(edited)" "$(bg_refused)" "$(bg_over)")")"
expect_stop "menu: SC-AK-1797 — стенограмма 21.11 держит остановку через хук" "$NIGHT" BLOCK
expect_reason "menu: SC-AK-1797 — стенограмма 21.11 называет задачу, не меню" "$NIGHT" 'The background task `b1` ended after the last call'
expect_reason "menu: SC-AK-1797 — стенограмма 21.11 называет файл вывода" "$NIGHT" 'its output is `/tmp/tasks/b1.output`'

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

. "$TESTS/turn-exit-guard-foreign.test.sh"
. "$TESTS/turn-exit-guard-wait.test.sh"

suite_result "проверка выхода из хода"
