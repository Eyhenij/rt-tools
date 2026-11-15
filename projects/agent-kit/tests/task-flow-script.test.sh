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

rm -rf "$TF_DIR"
suite_result "сценарий task flow"
