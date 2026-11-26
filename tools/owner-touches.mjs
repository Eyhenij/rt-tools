#!/usr/bin/env node
/**
 * The owner's touches per task, read from the observations of this tree. A touch is an answer in a
 * question window (`record-menu`) or a message the owner typed (`record-word`): between turns or while a
 * turn was going on. The question windows themselves are no touch: a touch is counted by its answer.
 *
 *   node tools/owner-touches.mjs [--since <ISO>] [--until <ISO>] [--dir <observations>] [--json]
 *
 * Every distinct line is read once. Records of one message collapse by task, session, event, kind and
 * second: the record of a session repeated one message up to five times in one second. The tasks are
 * those taken in the window (`task-taken`) and those with a touch; a task with none counts with zero.
 * The median of an even count is the mean of the two middle ones. A line without a task `RT-` is not in
 * the median; a line that does not parse is skipped and counted.
 *
 * The windows of permission a hook opened (`guard-ask`) carry no task: they are counted apart. The kinds
 * of typed messages come from the field `about` the counter writes since RT-3696: older lines carry none
 * and stay out of the table.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const KINDS = ['correction', 'order', 'other', 'status'];
const TOUCH = new Set(['record-menu', 'record-word']);
const isTask = (task) => typeof task === 'string' && /^RT-\d+$/.test(task);

const median = (sorted) => {
    if (sorted.length === 0) return 0;
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/** The count of touches over the raw lines of observation files, within [since, until). */
export function countTouches(lines, { since = '', until = '￿' } = {}) {
    let broken = 0;
    const touches = new Map();
    const taken = new Set();
    const windows = new Set();
    const kinds = Object.fromEntries(KINDS.map((kind) => [kind, 0]));
    const seenKind = new Set();
    for (const raw of new Set(lines.filter((line) => line.trim()))) {
        let o;
        try {
            o = JSON.parse(raw);
        } catch {
            broken += 1;
            continue;
        }
        const t = String(o?.t ?? '');
        if (!(t >= since && t < until)) continue;
        if (o.ev === 'guard-ask') windows.add(raw);
        if (o.ev === 'task-taken' && isTask(o.task)) taken.add(o.task);
        if (!TOUCH.has(o.ev) || !isTask(o.task)) continue;
        const key = [o.task, o.sid, o.ev, o.kind, t.slice(0, 19)].join('|');
        if (!touches.has(o.task)) touches.set(o.task, new Set());
        touches.get(o.task).add(key);
        if (o.ev === 'record-word' && KINDS.includes(o.about) && !seenKind.has(key)) {
            seenKind.add(key);
            kinds[o.about] += 1;
        }
    }
    const tasks = [...new Set([...taken, ...touches.keys()])].sort();
    const perTask = Object.fromEntries(tasks.map((task) => [task, touches.get(task)?.size ?? 0]));
    const counts = Object.values(perTask).sort((a, b) => a - b);
    const marked = KINDS.reduce((sum, kind) => sum + kinds[kind], 0);
    return {
        tasks: tasks.length,
        total: counts.reduce((sum, n) => sum + n, 0),
        median: median(counts),
        windows: windows.size,
        kinds,
        otherShare: marked === 0 ? null : Math.round((kinds.other / marked) * 100) / 100,
        perTask,
        broken,
    };
}

const option = (argv, name) => {
    const at = argv.indexOf(name);
    return at >= 0 ? argv[at + 1] : undefined;
};

const NAMES = { correction: 'поправка', status: '«где стоим»', order: 'новый приказ', other: 'прочее' };

function table(result) {
    const rows = [
        `Задач: ${result.tasks}, обращений: ${result.total}, медиана на задачу: ${result.median}`,
        `Окна разрешений от хуков: ${result.windows}`,
        'Набранные сообщения по видам:',
        ...KINDS.map((kind) => `  ${NAMES[kind]}: ${result.kinds[kind]}`),
        `  доля прочего: ${result.otherShare === null ? 'нет размеченных строк' : `${Math.round(result.otherShare * 100)}%`}`,
    ];
    if (result.broken > 0) rows.push(`Битых строк пропущено: ${result.broken}`);
    return `${rows.join('\n')}\n`;
}

function main(argv) {
    const dir = option(argv, '--dir') ?? join(process.cwd(), '.claude/rt-kit/observations');
    const lines = existsSync(dir)
        ? readdirSync(dir)
              .filter((name) => name.endsWith('.jsonl'))
              .flatMap((name) => readFileSync(join(dir, name), 'utf8').split('\n'))
        : [];
    const result = countTouches(lines, { since: option(argv, '--since') ?? '', until: option(argv, '--until') ?? '￿' });
    process.stdout.write(argv.includes('--json') ? `${JSON.stringify(result)}\n` : table(result));
    return 0;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) process.exit(main(process.argv.slice(2)));
