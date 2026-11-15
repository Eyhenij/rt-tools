#!/usr/bin/env bash
# Сценарии движка task flow: выходы состояний по измерителям описания пакета.
#
# Измеритель зовётся с двойниками источников из `flow-doubles.mjs`: история ветки, рабочая копия и
# метки пишутся в случае, а читатель получает слова и формы описания пакета. Источник `steps` —
# настоящий: он только разбирает текст. Метки в общем каталоге git проверяются на настоящем
# репозитории с двумя рабочими копиями.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "сценарий task flow"

TESTS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TF_DIR="$(mktemp -d)"

# Случаи группы: JS печатает строки `метка|получено|ожидалось`, каждая идёт в report.
tf_run() {
    local out label got want
    out="$(cd "$TESTS" && node --input-type=module 2>&1)"
    while IFS='|' read -r label got want; do
        [ -n "$label" ] || continue
        report "$label" "$got" "$want"
    done <<< "$out"
}

# --- Локальные выходы 1, 3, 5–9 --------------------------------------------------------------------
tf_run <<'JS'
import { gitDouble, treeDouble, marksDouble } from './flow-doubles.mjs';
import { buildModel } from '../assets/checks/flow-model.mjs';
import { open as openSteps } from '../assets/task-flow/source/steps.mjs';
import * as grill from '../assets/task-flow/measure/grill.mjs';
import * as agreement from '../assets/task-flow/measure/agreement.mjs';
import * as plan from '../assets/task-flow/measure/plan.mjs';
import * as progress from '../assets/task-flow/measure/progress.mjs';
import * as footprint from '../assets/task-flow/measure/footprint.mjs';
import * as folder from '../assets/task-flow/measure/folder.mjs';

const model = buildModel(new URL('../assets/task-flow/flow.js', import.meta.url).pathname);
const data = { words: model.words, expect: model.expect };
const steps = openSteps();
const B = 'RT-1-x';
const F = `docs/tasks/${B}`;
const run = (cap, spec) => String(cap({ git: gitDouble({ branch: B, ...spec }), tree: treeDouble(spec.tree), marks: marksDouble({ branch: B, ...spec }), steps })(data));
const out = (label, got, want) => console.log(`${label}|${got}|${want}`);

const GRILL = '# Разбор\n\n## Просьба владельца\n\n> сделай сценарий\n\n## Вопросы и ответы\n\n**Как?**\nСкриптом.\n';
const TEMPLATE = '# Grill\n\n## The owner request\n\n> <verbatim>\n\n## Questions and answers\n\n**<question>**\n<the answer>\n';
const PLAN = (head, footprintRows, withChecks = true) => [
    '# План', '', head, '', '## След задачи', '', '| Что | Где |', '| --- | --- |', ...footprintRows, '',
    '## Этапы', '', '### 1. Первый', '', '- **Шаги:**',
    '    1. Сделать раз', ...(withChecks ? ['       Проверка: `echo 1` → `1`'] : []),
    '    2. Сделать два', ...(withChecks ? ['       Проверка: `true` → exit 0'] : []), '',
].join('\n');
const HEAD = `**Task:** RT-1 · **Branch:** ${B}\n**Behaviour:** unchanged — правка правил`;
const ROWS = ['| Rules (правится) | `docs/rules/a.md` |', '| Laws | `docs/laws/b.md` |'];
const PROGRESS = (m1, m2) => `# Ход работы\n\n## Шаги\n\n- [${m1}] 1.1 Сделать раз\n- [${m2}] 1.2 Сделать два\n`;

// SC-AK-1365 — выход 1 по grill.md ветки
out('local: SC-AK-1365 — выход 1 по grill.md ветки', run(grill.written, { tree: { [`${F}/grill.md`]: GRILL } }), 'true');
out('local: SC-AK-1365 — выход 1 из истории после разбора папки', run(grill.written, { commits: [{ sha: 'a', files: { [`${F}/grill.md`]: GRILL } }, { sha: 'b', files: { [`${F}/grill.md`]: null } }] }), 'true');
out('local: SC-AK-1365 — заготовка без цитаты не выход', run(grill.written, { tree: { [`${F}/grill.md`]: TEMPLATE } }), 'false');

// SC-AK-1366 — выход 1 по черновику
out('local: SC-AK-1366 — выход 1 по черновику _draft-<slug>', String(grill.written({ git: gitDouble({ branch: 'main' }), tree: treeDouble({ 'docs/tasks/_draft-flow/grill.md': GRILL }) })()), 'true');
out('local: SC-AK-1366 — пустой черновик не выход', String(grill.written({ git: gitDouble({ branch: 'main' }), tree: treeDouble({ 'docs/tasks/_draft-flow/plan.md': 'x' }) })()), 'false');

// SC-AK-1367 — выход 3: каталог proposed/ из истории
const DRAFT = `**Task:** RT-1 · **Branch:** ${B}\n**Draft:** \`docs/specs/a/proposed/f/\``;
out('local: SC-AK-1367 — каталог договорённости из истории', run(agreement.named, { tree: { [`${F}/plan.md`]: PLAN(DRAFT, ROWS) }, main: ['docs/specs/a/proposed/f/spec.md'] }), 'true');
out('local: SC-AK-1367 — каталог, которого не было, не выход', run(agreement.named, { tree: { [`${F}/plan.md`]: PLAN(DRAFT, ROWS) } }), 'false');

// SC-AK-1368 — выход 3: «не нужно — причина»
out('local: SC-AK-1368 — Behaviour: unchanged с причиной', run(agreement.named, { tree: { [`${F}/plan.md`]: PLAN(HEAD, ROWS) } }), 'true');
out('local: SC-AK-1368 — «не нужно — причина» в разборе', run(agreement.named, { tree: { [`${F}/grill.md`]: `${GRILL}\n**Описание фичи:** не нужно — правка правил\n` } }), 'true');
out('local: SC-AK-1368 — причина-заготовка не выход', run(agreement.named, { tree: { [`${F}/plan.md`]: '**Behaviour:** unchanged — <the reason>\n' } }), 'false');

// SC-AK-1369…1372 — выход 5: метка одобрения
const planned = { commits: [{ sha: 'p', files: { [`${F}/plan.md`]: PLAN(HEAD, ROWS) } }] };
out('local: SC-AK-1369 — метка одобрения есть', run(plan.approved, { ...planned, approval: { answer: 'Одобряю план RT-1', plan: 'p' } }), 'true');
out('local: SC-AK-1370 — метки нет — выход 5 не выполнен', run(plan.approved, planned), 'false');
out('local: SC-AK-1372 — ответ «переделай» метку не даёт', run(plan.approved, { ...planned, approval: { answer: 'Переделай этап 2' } }), 'false');
out('local: SC-AK-1369 — проверка неизвестной формы не одобряется', run(plan.approved, { commits: [{ sha: 'p', files: { [`${F}/plan.md`]: PLAN(HEAD, ROWS).replace('→ exit 0', '→ примерно ноль') } }], approval: { answer: 'Одобряю' } }), 'false');

// SC-AK-1373 — выход 6: ровно один [>]
const mirror = (text) => ({ commits: [{ sha: 'p', files: { [`${F}/plan.md`]: PLAN(HEAD, ROWS), [`${F}/progress.md`]: text } }] });
out('local: SC-AK-1373 — ровно один [>]', run(progress.mirrors, mirror(PROGRESS('>', ' '))), 'true');
out('local: SC-AK-1373 — два [>] не выход', run(progress.mirrors, mirror(PROGRESS('>', '>'))), 'false');
out('local: SC-AK-1373 — переименованный шаг не выход', run(progress.mirrors, mirror(PROGRESS('>', ' ').replace('Сделать два', 'Сделать 2'))), 'false');

// SC-AK-1374 — выход 7: [x] без метки не считается
const doneTree = (planText) => ({ tree: { [`${F}/plan.md`]: planText, [`${F}/progress.md`]: PROGRESS('x', 'x') } });
out('local: SC-AK-1374 — [x] без метки не считается', run(progress.done, { ...doneTree(PLAN(HEAD, ROWS)), steps: { '1.1': { matched: true } } }), 'false');
out('local: SC-AK-1374 — [x] с зелёными метками — выход', run(progress.done, { ...doneTree(PLAN(HEAD, ROWS)), steps: { '1.1': { matched: true }, '1.2': { matched: true } } }), 'true');

// SC-AK-1375 — выход 7: план без строк проверки судится по [x]
out('local: SC-AK-1375 — план без строк проверки судится по [x]', run(progress.done, doneTree(PLAN(HEAD, ROWS, false))), 'true');

// SC-AK-1376, SC-AK-1377 — выход 8: след задачи
const after = (rows, changed) => ({ commits: [{ sha: 'p', files: { [`${F}/plan.md`]: PLAN(HEAD, rows) } }, { sha: 'c', files: changed }] });
out('local: SC-AK-1376 — меряются только строки «(правится)»', run(footprint.touched, after(ROWS, { 'docs/rules/a.md': 'новое' })), 'true');
out('local: SC-AK-1376 — строка «(правится)» без правки не выход', run(footprint.touched, after(ROWS, { 'docs/laws/b.md': 'новое' })), 'false');
out('local: SC-AK-1377 — план без пометок, Rules без правок — выход', run(footprint.touched, after(['| Rules | `docs/rules/a.md` |'], { 'x.md': 'y' })), 'true');
out('local: SC-AK-1377 — каталог proposed/ в вершине держит выход', run(footprint.touched, { commits: [{ sha: 'p', files: { [`${F}/plan.md`]: PLAN(DRAFT, ['| Rules | `docs/rules/a.md` |']), 'docs/specs/a/proposed/f/spec.md': 's' } }] }), 'false');

// SC-AK-1378 — выход 9: запись в архиве
const archive = (files) => ({ commits: [{ sha: 'a', files: { [`${F}/plan.md`]: 'p' } }, { sha: 'b', files }] });
out('local: SC-AK-1378 — папка удалена и запись в архиве одним коммитом', run(folder.archived, archive({ [`${F}/plan.md`]: null, 'docs/archive/rt-1.md': 'r' })), 'true');
out('local: SC-AK-1378 — папка удалена без записи не выход', run(folder.archived, archive({ [`${F}/plan.md`]: null })), 'false');
JS

# --- Выходы хостинга 2, 4, 10–13 -------------------------------------------------------------------
tf_run <<'JS'
import { gitDouble, treeDouble, hostDouble, ownerDouble } from './flow-doubles.mjs';
import { buildModel } from '../assets/checks/flow-model.mjs';
import { measureStates } from '../assets/checks/task-flow-script.mjs';
import { attempt, createStore, timedRead } from '../assets/task-flow/source/host.mjs';
import * as epic from '../assets/task-flow/measure/epic.mjs';
import * as task from '../assets/task-flow/measure/task.mjs';
import * as pr from '../assets/task-flow/measure/pr.mjs';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const model = buildModel(new URL('../assets/task-flow/flow.js', import.meta.url).pathname);
const out = (label, got, want) => console.log(`${label}|${got}|${want}`);
const B = 'RT-12-flow';
const E = 'RT-10-epic';
const PLAN = (rows) => [
    '# Эпик', '', `**Эпик:** RT-10 · **Ветка эпика:** \`${E}\``, '', '| # | Задача | Состояние |', '| --- | --- | --- |',
    ...rows.map(([n, task, state]) => `| ${n} | RT-${task} — задача | ${state} |`), '',
].join('\n');
const ROWS = [['1', 11, 'влито'], ['2', 12, 'идёт'], ['3', 13, 'впереди']];
const tree = (rows = ROWS) => treeDouble({ 'docs/plans/epic.md': PLAN(rows) });
const card = { 12: { open: true, status: 'in-progress', epic: '10' } };
const run = (cap, { branch = B, commits = [], local = [], host = {}, rows, owner = [] } = {}) =>
    String(cap({ git: gitDouble({ branch, commits, local }), host: hostDouble({ ...host, issues: { ...card, ...(host.issues ?? {}) } }), tree: tree(rows), owner: ownerDouble(owner) })());

// SC-AK-1379, SC-AK-1380 — выход 2
const epicCard = (status, open = true) => ({ issues: { 10: { open, status, epic: null } } });
out('host: SC-AK-1379 — ветка эпика на сервере, карточка в работе', run(epic.declared, { host: { ...epicCard('in-progress'), remote: [{ name: E, sha: 'e1' }] } }), 'true');
out('host: SC-AK-1379 — карточка эпика в первой колонке не выход', run(epic.declared, { host: { ...epicCard('backlog'), remote: [{ name: E, sha: 'e1' }] } }), 'false');
out('host: SC-AK-1380 — эпик влит в main, ветка удалена', run(epic.declared, { host: { ...epicCard('done', false), pulls: { [E]: [{ number: 5, state: 'MERGED', base: 'main', reviewers: [] }] } } }), 'true');
out('host: SC-AK-1380 — ветки нет и PR эпика не влит — не выход', run(epic.declared, { host: { ...epicCard('in-progress') } }), 'false');

// SC-AK-1381 — кэш выходов 2 и 4 переживает коммит
const folder = [{ sha: 'a', files: { [`docs/tasks/${B}/grill.md`]: 'g' } }];
out('host: SC-AK-1381 — выход 4: задача взята, папка в ветке', run(task.taken, { commits: folder }), 'true');
out('host: SC-AK-1381 — выход 4 держится памятью, когда карточку не прочесть', run(task.taken, { commits: [...folder, { sha: 'b', files: { x: 'y' } }], host: { issues: { 12: null }, met: [`exit4:${B}`] } }), 'true');
out('host: SC-AK-1381 — выход 2 держится памятью после коммита', run(epic.declared, { commits: [{ sha: 'b', files: { x: 'y' } }], host: { met: ['exit2:10'] } }), 'true');
out('host: SC-AK-1381 — задача в первой колонке — выход 4 не выполнен', run(task.taken, { commits: folder, host: { issues: { 12: { open: true, status: 'backlog', epic: '10' } } } }), 'false');

// SC-AK-1382, SC-AK-1383 — ответы по часам и их сброс
const store = createStore(join(mkdtempSync(join(tmpdir(), 'tf-')), 'answers.json'));
let calls = 0;
const ask = (now) => timedRead(store, 'pulls:x', () => ++calls, now);
ask(1000);
ask(1030);
out('host: SC-AK-1382 — ответ моложе 60 с не читается заново', String(calls), '1');
ask(1061);
out('host: SC-AK-1382 — ответ старше 60 с читается заново', String(calls), '2');
store.reset();
ask(1062);
out('host: SC-AK-1383 — сброс после вызова gh читает ответ заново', String(calls), '3');

// SC-AK-1384 — хостинг не ответил раз, повтор удался
let tries = 0;
const flaky = () => {
    tries += 1;
    if (tries === 1) throw new Error('timeout');
    return 'ответ';
};
let silent = false;
out('host: SC-AK-1384 — повтор чтения удался', attempt(flaky, () => (silent = true)), 'ответ');
out('host: SC-AK-1384 — хостинг не помечен молчащим', String(silent), 'false');
let twice = '';
try {
    attempt(() => {
        throw new Error('timeout');
    }, () => (silent = true));
} catch (error) {
    twice = error.name;
}
out('host: SC-AK-1384 — два отказа подряд — HostSilent', `${twice} ${silent}`, 'HostSilent true');

// SC-AK-1385, SC-AK-1386 — хостинг не ответил дважды
const silentError = () => {
    const error = new Error('silent');
    error.name = 'HostSilent';
    throw error;
};
const HOSTED = new Set(['measure.epic.declared', 'measure.task.taken', 'measure.pr.handed', 'measure.epic.nextTaken', 'measure.epic.mergedMarked', 'measure.epic.finished', 'measure.copy.outsideEpic']);
const localUnmet = measureStates(model, (name) => (HOSTED.has(name) ? silentError() : name !== 'measure.agreement.named'));
out('host: SC-AK-1385 — первый невыполненный выход локальный — меряется он', `${localUnmet.state} ${localUnmet.reason}`, 'разбор-закрыт null');
const hostUnmet = measureStates(model, (name) => (HOSTED.has(name) ? silentError() : true));
out('host: SC-AK-1386 — выход хостинга без ответа — ход отпущен с причиной', `${hostUnmet.state} · ${hostUnmet.reason}`, 'эпик-заведён · the hosting did not answer twice');

// SC-AK-1387 — выход 10
const archived = [{ sha: 'a', files: { [`docs/tasks/${B}/plan.md`]: 'p' } }, { sha: 'z', files: { [`docs/tasks/${B}/plan.md`]: null, 'docs/archive/rt-12.md': 'r' } }];
const handedHost = (reviewers, contains = ['z']) => ({ contains, issues: { 12: { open: true, status: 'in-review', epic: '10' } }, pulls: { [B]: [{ number: 7, state: 'CLOSED', base: E, reviewers }] } });
out('host: SC-AK-1387 — PR в любом состоянии, с ревьюером', run(pr.handed, { commits: archived, host: handedHost(['owner']) }), 'true');
out('host: SC-AK-1387 — PR без ревьюера не выход', run(pr.handed, { commits: archived, host: handedHost([]) }), 'false');
out('host: SC-AK-1387 — коммит разбора папки не на сервере — не выход', run(pr.handed, { commits: archived, host: handedHost(['owner'], []) }), 'false');

// SC-AK-1388…1390 — выход 11
out('host: SC-AK-1388 — ветка следующей задачи есть на сервере', run(epic.nextTaken, { host: { remote: [{ name: 'RT-13-next', sha: 'n' }] } }), 'true');
out('host: SC-AK-1388 — ветки следующей задачи нет — не выход', run(epic.nextTaken, {}), 'false');
out('host: SC-AK-1388 — следующей задачи нет — выход выполнен', run(epic.nextTaken, { rows: [['1', 11, 'влито'], ['2', 12, 'идёт']] }), 'true');
const ownerRows = [['1', 11, 'влито'], ['2', 12, 'идёт'], ['3', 13, 'шаг владельца «сделаю сам RT-13»'], ['4', 14, 'впереди']];
out('host: SC-AK-1389 — задача с шагом владельца пропускается', run(epic.nextTaken, { rows: ownerRows, owner: ['сделаю сам RT-13'], local: [{ name: 'RT-14-more', sha: 'm' }] }), 'true');
out('host: SC-AK-1389 — шаг без слова владельца не пропускается', run(epic.nextTaken, { rows: ownerRows, local: [{ name: 'RT-14-more', sha: 'm' }] }), 'false');
const deferred = [['1', 11, 'влито'], ['2', 12, 'идёт'], ['—', 13, 'отложено'], ['3', 14, 'впереди']];
out('host: SC-AK-1390 — отложенная задача пропускается', run(epic.nextTaken, { rows: deferred, local: [{ name: 'RT-14-more', sha: 'm' }] }), 'true');
const ownRow = [['1', 11, 'влито'], ['2', 12, 'шаг владельца «проверю сам»'], ['3', 13, 'впереди']];
out('host: SC-AK-1441 — строка задачи называет шаг владельца — шаг владельца', run(epic.ownerStep, { rows: ownRow }), 'true');
out('host: SC-AK-1441 — владелец сказал цитату — шаг уже не его', run(epic.ownerStep, { rows: ownRow, owner: ['проверю сам'] }), 'false');
out('host: SC-AK-1441 — обычная строка задачи — не шаг владельца', run(epic.ownerStep, {}), 'false');

// SC-AK-1391 — выход 12
const mergedPull = (task, sha) => ({ number: task, head: `RT-${task}-x`, headRefOid: sha, base: E });
out('host: SC-AK-1391 — влитые задачи отмечены', run(epic.mergedMarked, { host: { merged: [mergedPull(11, 's11')] } }), 'true');
out('host: SC-AK-1391 — влитая задача не отмечена — не выход', run(epic.mergedMarked, { host: { merged: [mergedPull(11, 's11'), mergedPull(12, 's12')] } }), 'false');

// SC-AK-1392…1394, SC-AK-1466 — выход 13
const two = [['1', 11, 'влито'], ['2', 12, 'влито']];
const epicPull = { [E]: [{ number: 9, state: 'OPEN', base: 'main', reviewers: [] }] };
const tips = [{ name: 'RT-11-a', sha: 's11' }, { name: 'RT-12-flow', sha: 's12' }];
out('host: SC-AK-1392 — каскад: PR задачи влит в ветку предыдущей, обе в эпике', run(epic.finished, { rows: two, local: tips, host: { landed: { [E]: ['s11', 's12'] }, pulls: epicPull } }), 'true');
out('host: SC-AK-1392 — каскад: предыдущая ещё не в эпике — не выход', run(epic.finished, { rows: two, local: tips, host: { landed: { [E]: ['s11'], 'RT-11-a': ['s12'] }, pulls: epicPull } }), 'false');
out('host: SC-AK-1393 — PR эпика влит — выход выполнен', run(epic.finished, { rows: two, local: tips, host: { landed: { main: ['s11', 's12'] }, pulls: { [E]: [{ number: 9, state: 'MERGED', base: 'main', reviewers: [] }] } } }), 'true');
out('host: SC-AK-1393 — PR эпика нет — не выход', run(epic.finished, { rows: two, local: tips, host: { landed: { [E]: ['s11', 's12'] } } }), 'false');
out('host: SC-AK-1394 — отложенные задачи не считаются', run(epic.finished, { rows: [...two, ['—', 13, 'отложено']], local: tips, host: { landed: { [E]: ['s11', 's12'] }, pulls: epicPull } }), 'true');
out('host: SC-AK-1466 — ветка задачи удалена после слияния — вершина из headRefOid PR', run(epic.finished, { rows: two, local: [tips[1]], host: { merged: [mergedPull(11, 's11')], landed: { [E]: ['s11', 's12'] }, pulls: epicPull } }), 'true');
JS

# --- Ветка без номера задачи, эпик копии, черновик ------------------------------------------------
tf_run <<'JS'
import { gitDouble, treeDouble, hostDouble, ownerDouble } from './flow-doubles.mjs';
import { buildModel } from '../assets/checks/flow-model.mjs';
import { measureStates } from '../assets/checks/task-flow-script.mjs';
import { open as openSteps } from '../assets/task-flow/source/steps.mjs';
import * as copy from '../assets/task-flow/measure/copy.mjs';
import * as epic from '../assets/task-flow/measure/epic.mjs';

const model = buildModel(new URL('../assets/task-flow/flow.js', import.meta.url).pathname);
const out = (label, got, want) => console.log(`${label}|${got}|${want}`);
const E = 'RT-10-epic';
const PLAN = `# Эпик\n\n**Эпик:** RT-10 · **Ветка эпика:** \`${E}\`\n\n| # | Задача | Состояние |\n| --- | --- | --- |\n| 1 | RT-11 — задача | идёт |\n`;
const GRILL = '# Разбор\n\n## Просьба владельца\n\n> сделай\n\n## Вопросы и ответы\n\n**Как?**\nТак.\n';
const sources = ({ branch, files = {}, copyEpic = null, host = {} }) => ({
    git: gitDouble({ branch }),
    tree: treeDouble({ 'docs/plans/epic.md': PLAN, ...files }, copyEpic),
    host: hostDouble(host),
    owner: ownerDouble([]),
    steps: openSteps(),
    marks: { approval: () => null, step: () => null },
});
const liveEpic = { issues: { 10: { open: true, status: 'in-progress', epic: null } }, remote: [{ name: E, sha: 'e' }] };

// SC-AK-1395 — ветка без номера читает эпик копии
out('copy: SC-AK-1395 — ветка эпика читает эпик копии', String(copy.outsideEpic(sources({ branch: E, copyEpic: 10, host: liveEpic }))()), 'false');
out('copy: SC-AK-1395 — выход 2 по эпику копии на ветке без номера', String(epic.declared(sources({ branch: 'main', copyEpic: 10, host: liveEpic }))()), 'true');

// SC-AK-1396 — main со строкой назначения на влитый эпик — вне сценария
const mergedEpic = { issues: { 10: { open: true, status: 'done', epic: null } }, pulls: { [E]: [{ number: 3, state: 'MERGED', base: 'main', reviewers: [] }] } };
out('copy: SC-AK-1396 — назначение на влитый эпик — вне сценария', String(copy.outOfScenario(sources({ branch: 'main', copyEpic: 10, host: mergedEpic }))()), 'true');

// SC-AK-1397 — эпик с закрытой карточкой считается отсутствующим
const closedEpic = { issues: { 10: { open: false, status: 'done', epic: null } } };
out('copy: SC-AK-1397 — эпик с закрытой карточкой отсутствует', String(copy.outsideEpic(sources({ branch: 'main', copyEpic: 10, host: closedEpic }))()), 'true');

// SC-AK-1398 — черновик в состояниях 1–4
const draft = sources({ branch: 'main', files: { 'docs/tasks/_draft-flow/grill.md': GRILL } });
out('copy: SC-AK-1398 — черновик держит копию в сценарии', String(copy.outOfScenario(draft)()), 'false');
const caps = {};
for (const m of model.measures) caps[`measure.${m.entry}`] = m;
const mods = {};
for (const m of model.measures) mods[`measure.${m.entry}`] = await import(`../assets/task-flow/${m.file}`);
const read = (src) => (name) => {
    const [, entry, cap] = name.split('.');
    const ports = Object.fromEntries(Object.keys(caps[`measure.${entry}`].caps[cap]).map((p) => [p, src[p]]));
    return mods[`measure.${entry}`][cap](ports)({ words: model.words, expect: model.expect });
};
const measured = measureStates(model, read(draft));
out('copy: SC-AK-1398 — черновик с разбором меряется состоянием 2', `${measured.index} ${measured.state}`, '2 эпик-заведён');

// SC-AK-1399 — ветка без номера и без эпика — вне сценария
out('copy: SC-AK-1399 — ветка без номера и без эпика — вне сценария', String(copy.outOfScenario(sources({ branch: 'feat/try' }))()), 'true');
out('copy: SC-AK-1399 — ветка задачи в сценарии', String(copy.outOfScenario(sources({ branch: 'RT-11-task', host: { issues: { 11: { open: true, status: 'in-progress', epic: '10' } } } }))()), 'false');
JS

# --- Монотонность: дерево после состояния N не меряется ниже N ------------------------------------
tf_run <<'JS'
import { gitDouble, treeDouble, hostDouble, ownerDouble, marksDouble } from './flow-doubles.mjs';
import { buildModel } from '../assets/checks/flow-model.mjs';
import { measureStates, openReaders } from '../assets/checks/task-flow-script.mjs';
import { open as openSteps } from '../assets/task-flow/source/steps.mjs';
import { dirname } from 'node:path';

const path = new URL('../assets/task-flow/flow.js', import.meta.url).pathname;
const model = buildModel(path);
const out = (label, got, want) => console.log(`${label}|${got}|${want}`);
const B = 'RT-12-flow';
const E = 'RT-10-epic';
const F = `docs/tasks/${B}`;
const EPIC = (state) => `# Эпик\n\n**Эпик:** RT-10 · **Ветка эпика:** \`${E}\`\n\n| # | Задача | Состояние |\n| --- | --- | --- |\n| 1 | RT-12 — задача | ${state} |\n`;
const GRILL = '# Разбор\n\n## Просьба владельца\n\n> сделай\n\n## Вопросы и ответы\n\n**Как?**\nТак.\n';
const PLAN = [
    '# План', '', `**Task:** RT-12 · **Branch:** ${B}`, '**Behaviour:** unchanged — правка правил', '',
    '## След задачи', '', '| Что | Где |', '| --- | --- |', '| Rules (правится) | `docs/rules/a.md` |', '',
    '## Этапы', '', '### 1. Первый', '', '- **Шаги:**', '    1. Сделать раз', '       Проверка: `true` → exit 0', '',
].join('\n');
const progress = (mark) => `# Ход работы\n\n## Шаги\n\n- [${mark}] 1.1 Сделать раз\n`;

/** A task whose folder is taken apart: every local exit through 9 lies in its history, none in the copy. */
const history = [
    { sha: 'g', files: { [`${F}/grill.md`]: GRILL } },
    { sha: 'p', files: { [`${F}/plan.md`]: PLAN, [`${F}/progress.md`]: progress('>') } },
    { sha: 'w', files: { 'docs/rules/a.md': 'правка', [`${F}/progress.md`]: progress('x') } },
    { sha: 'z', files: { [`${F}/grill.md`]: null, [`${F}/plan.md`]: null, [`${F}/progress.md`]: null, 'docs/archive/rt-12.md': 'запись' } },
];
const epicCard = { open: true, status: 'in-progress', epic: null };
const taskCard = { open: true, status: 'in-review', epic: '10' };
const measure = async ({ host, row = 'идёт' }) => {
    const given = {
        git: gitDouble({ branch: B, commits: history, local: [{ name: B, sha: 'z' }] }),
        tree: treeDouble({ 'docs/plans/epic.md': EPIC(row) }),
        host: hostDouble(host),
        owner: ownerDouble([]),
        steps: openSteps(),
        marks: marksDouble({ branch: B, approval: { answer: 'Одобряю план RT-12', plan: 'p' }, steps: { '1.1': { matched: true } } }),
    };
    return measureStates(model, await openReaders(model, dirname(path), given));
};

// SC-AK-1400 — после разбора папки выходы 1–9 читаются из истории
const taken = await measure({ host: { issues: { 10: epicCard, 12: taskCard }, remote: [{ name: E, sha: 'e1' }] } });
out('monotone: SC-AK-1400 — после разбора папки состояние не ниже 10', `${taken.index} ${taken.state}`, '10 папка-разобрана');
out('monotone: SC-AK-1400 — выходы 1–9 выполнены по истории', String(Object.values(taken.exits).slice(0, 9).every((v) => v === true)), 'true');

// SC-AK-1401 — эпик влит в main: сценарий кончен
const mergedEpic = {
    issues: { 10: { open: false, status: 'done', epic: null }, 12: { open: false, status: 'done', epic: '10' } },
    contains: ['z'],
    pulls: { [B]: [{ number: 7, state: 'MERGED', base: E, reviewers: ['owner'] }], [E]: [{ number: 9, state: 'MERGED', base: 'main', reviewers: ['owner'] }] },
    merged: [{ number: 7, head: B, headRefOid: 'z', base: E }],
    landed: { main: ['z'] },
};
const over = await measure({ host: mergedEpic, row: 'влито' });
out('monotone: SC-AK-1401 — после слияния эпика в main — конец сценария', `${over.index} ${over.reason}`, '14 the end of the scenario');

// SC-AK-1402 — ветка эпика удалена на сервере: выход 2 держится памятью
const removed = { issues: { 10: epicCard, 12: taskCard } };
const kept = await measure({ host: { ...removed, met: ['exit2:10'] } });
out('monotone: SC-AK-1402 — ветка эпика удалена, выход 2 из памяти — состояние не ниже 10', `${kept.index} ${kept.exits.epic}`, '10 true');
const forgotten = await measure({ host: removed });
out('monotone: SC-AK-1402 — без памяти та же ветка мерилась бы на выходе 2', `${forgotten.index} ${forgotten.state}`, '2 эпик-заведён');
JS

# --- SC-AK-1381 — память выполненного выхода на настоящем источнике переживает коммит ------------
(
    cd "$TF_DIR" || exit 1
    git -c init.defaultBranch=main init -q cache-repo
    cd cache-repo || exit 1
    git -c user.name=t -c user.email=t@example.test -c commit.gpgsign=false commit -q --allow-empty -m start
)
(cd "$TF_DIR/cache-repo" && node --input-type=module -e "
import { open } from '$TESTS/../assets/task-flow/source/host.mjs';
open().remember('exit2:10');
" 2>&1)
(cd "$TF_DIR/cache-repo" && git -c user.name=t -c user.email=t@example.test -c commit.gpgsign=false commit -q --allow-empty -m next)
got="$(cd "$TF_DIR/cache-repo" && node --input-type=module -e "
import { open } from '$TESTS/../assets/task-flow/source/host.mjs';
console.log(String(open().recalled('exit2:10')) + ' ' + String(open().recalled('exit4:other')));
" 2>&1)"
report "host: SC-AK-1381 — память выхода 2 на настоящем источнике переживает коммит" "$got" 'true false'

# --- SC-AK-1371 — выход 5: одобрение дано в другой копии дерева -----------------------------------
(
    cd "$TF_DIR" || exit 1
    git -c init.defaultBranch=main init -q copy-a
    cd copy-a || exit 1
    git -c user.name=t -c user.email=t@example.test -c commit.gpgsign=false commit -q --allow-empty -m start
    git worktree add -q -b RT-1-x ../copy-b
    mkdir -p .git/rt-kit/approval
    printf '{"answer":"Одобряю план RT-1"}' > .git/rt-kit/approval/RT-1-x.json
)
got="$(cd "$TF_DIR/copy-b" && node --input-type=module -e "
import { open } from '$TESTS/../assets/task-flow/source/marks.mjs';
console.log(String(open().approval('RT-1-x')?.answer?.startsWith('Одобряю') === true));
" 2>&1)"
report "local: SC-AK-1371 — одобрение из другой копии дерева видно" "$got" 'true'
printf 'не json' > "$TF_DIR/copy-a/.git/rt-kit/approval/RT-1-x.json"
got="$(cd "$TF_DIR/copy-b" && node --input-type=module -e "
import { open } from '$TESTS/../assets/task-flow/source/marks.mjs';
console.log(String(open().approval('RT-1-x')));
" 2>&1)"
report "local: SC-AK-1371 — метка не JSON читается отсутствующей" "$got" 'null'

# --- Шаг плана и одобрение плана — в подключаемом файле -----------------------------------------
. "$TESTS/task-flow-script-steps.test.sh"

# --- Прогноз отказов по записям разговоров ---------------------------------------------------------
tf_run <<'JS'
import { dirname } from 'node:path';
import { buildModel } from '../assets/checks/flow-model.mjs';
import { openReaders } from '../assets/checks/task-flow-script.mjs';
import { forecastCopies, perMille } from '../assets/checks/flow-forecast.mjs';
import * as sessionSource from '../assets/task-flow/source/session.mjs';
import { wordOf } from '../assets/task-flow/source/owner.mjs';

const out = (label, got, want) => console.log(`${label}|${got}|${want}`);
const flow = new URL('../assets/task-flow/flow.js', import.meta.url).pathname;
const model = buildModel(flow);
const settings = { tasksDir: 'docs/tasks', plansDir: 'docs/plans', overridePath: 'o.js', protectedPaths: ['^projects/agent-kit/assets/task-flow/'] };
const window = { from: Date.parse('2026-11-01T00:00:00Z'), to: Date.parse('2026-11-08T00:00:00Z') };
let n = 0;
const at = () => `2026-11-02T10:00:${String(n++).padStart(2, '0')}Z`;
const meta = (branch) => ({ uuid: `u${n}`, gitBranch: branch, cwd: '/t', timestamp: at() });
const owner = (branch, text) => ({ ...meta(branch), type: 'user', message: { content: text } });
const use = (branch, name, input) => ({ ...meta(branch), type: 'assistant', message: { content: [{ type: 'tool_use', id: `t${n}`, name, input }] } });
const stop = (branch) => ({ ...meta(branch), type: 'system', subtype: 'stop_hook_summary' });
const say = (branch) => ({ ...meta(branch), type: 'assistant', message: { content: [{ type: 'text', text: 'done' }] } });
const run = async (entries) =>
    forecastCopies({ copies: [{ name: 'c', sessions: [{ id: 's', entries }] }], window, model, base: dirname(flow), openReaders, sessionSource, wordOf, tree: '/t', settings });

const B = 'RT-7-x';
const held = await run([owner(B, 'делай RT-7'), use(B, 'Edit', { file_path: '/t/a.md', old_string: 'a', new_string: 'b' }), say(B), stop(B), say(B), owner(B, 'стоп'), say(B), stop(B)]);
out('forecast: SC-AK-1549 — остановка после записи держится, «стоп» отпускает', `${held.stops} ${held.held}`, '2 1');
out('forecast: SC-AK-1549 — на тысячу вызовов', perMille(held, false), '1000.0');
const quiet = await run([owner('main-x', 'спасибо'), say('main-x'), stop('main-x')]);
out('forecast: SC-AK-1549 — сессия без записи отпущена', `${quiet.stops} ${quiet.held}`, '1 0');
const shell = await run([owner(B, 'делай RT-7'), use(B, 'Bash', { command: 'echo x > docs/tasks/RT-7-x/progress.md' }), use(B, 'Edit', { file_path: '/t/a.md', old_string: 'a', new_string: 'b' })]);
out('forecast: SC-AK-1549 — запись оболочкой в ход работы — отказ стража', `${shell.judged} ${shell.refused}`, '2 1');
out('forecast: SC-AK-1549 — отказы стража входят с --guard', perMille({ ...shell, held: 0 }, true), '500.0');

const feedback = (branch) => ({ ...meta(branch), type: 'user', message: { content: 'Stop hook feedback:\nBLOCKED by turn-exit-guard: the scenario is not over' } });
const loop = await run([owner(B, 'делай RT-7'), use(B, 'Edit', { file_path: '/t/a.md', old_string: 'a', new_string: 'b' }), say(B), stop(B), feedback(B), say(B), stop(B), feedback(B), say(B), stop(B), feedback(B)]);
out('forecast: SC-AK-1550 — меню простоя обрывает петлю остановок', `${loop.stops} ${loop.held}`, '2 2');
const resumed = await run([owner(B, 'делай RT-7'), use(B, 'Edit', { file_path: '/t/a.md', old_string: 'a', new_string: 'b' }), say(B), stop(B), feedback(B), say(B), stop(B), feedback(B), use(B, 'Read', { file_path: '/t/a.md' }), say(B), stop(B)]);
out('forecast: SC-AK-1550 — вызов после меню снова считает остановки', `${resumed.stops} ${resumed.held}`, '3 3');
JS

rm -rf "$TF_DIR"
suite_result "сценарий task flow"
