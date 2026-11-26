#!/usr/bin/env node
/**
 * The owner's touches per task, read from the observations of this tree. A touch is an answer in a
 * question window (`record-menu`) or a message the owner typed (`record-word`): between turns or while a
 * turn was going on. The question windows themselves are no touch: a touch is counted by its answer.
 *
 *   node tools/owner-touches.mjs [--since <ISO>] [--until <ISO>] [--dir <observations>] [--json]
 *
 * Every distinct line is read once. A touch at the same moment of the same task, event and kind is one,
 * whatever session wrote it: a resumed session copies the record under a new sign. Records of one
 * message collapse further by task, session, event, kind and second: the record of a session repeated
 * one message up to five times in one second. The tasks are those taken in the window (`task-taken`)
 * and those with a touch, the branches of epics included; a task with none counts with zero, and the
 * command prints how many such tasks there are. The median of an even count is the mean of the two
 * middle ones. A touch without a task `RT-` is not in the median and is printed apart; a line that does
 * not parse is skipped and counted.
 *
 * The windows of permission a hook opened (`guard-ask`) carry no task: they are counted apart. The kinds
 * of typed messages come from the field `about` the counter writes since RT-3696: older lines carry none
 * and stay out of the table.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** The kinds the counter writes today; a kind it adds later is counted under its own name. */
const KINDS = ['correction', 'order', 'other', 'status'];
/** A moment after every observation: the window with no upper bound. */
const END = String.fromCharCode(0xffff);
const TOUCH = new Set(['record-menu', 'record-word']);
const isTask = (task) => typeof task === 'string' && /^RT-\d+$/.test(task);

const median = (sorted) => {
    if (sorted.length === 0) return 0;
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/** The count of touches over the raw lines of observation files, within [since, until). */
function countTouches(lines, { since = '', until = END } = {}) {
    let broken = 0;
    let windows = 0;
    let offTask = 0;
    const touches = new Map();
    const taken = new Set();
    const moments = new Set();
    const kinds = Object.fromEntries(KINDS.map((kind) => [kind, 0]));
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
        if (o.ev === 'guard-ask') windows += 1;
        if (o.ev === 'task-taken' && isTask(o.task)) taken.add(o.task);
        if (!TOUCH.has(o.ev)) continue;
        // A resumed session copies the record under a new sign and on its own branch: the same moment of
        // the same event is one touch, and it stays with the task of the line read first.
        const moment = [o.ev, o.kind, t].join('|');
        if (moments.has(moment)) continue;
        moments.add(moment);
        const key = [o.task, o.sid, o.ev, o.kind, t.slice(0, 19)].join('|');
        const own = touches.get(isTask(o.task) ? o.task : null) ?? new Set();
        if (own.has(key)) continue;
        own.add(key);
        touches.set(isTask(o.task) ? o.task : null, own);
        if (o.ev === 'record-word' && typeof o.about === 'string') kinds[o.about] = (kinds[o.about] ?? 0) + 1;
        if (!isTask(o.task)) offTask += 1;
    }
    touches.delete(null);
    const tasks = [...new Set([...taken, ...touches.keys()])].sort();
    const perTask = Object.fromEntries(tasks.map((task) => [task, touches.get(task)?.size ?? 0]));
    const counts = Object.values(perTask).sort((a, b) => a - b);
    const marked = Object.values(kinds).reduce((sum, n) => sum + n, 0);
    return {
        tasks: tasks.length,
        total: counts.reduce((sum, n) => sum + n, 0),
        median: median(counts),
        windows,
        offTask,
        zeroTasks: counts.filter((n) => n === 0).length,
        medianTouched: median(counts.filter((n) => n > 0)),
        kinds,
        otherShare: marked === 0 ? null : Math.round((kinds.other / marked) * 100) / 100,
        perTask,
        broken,
    };
}

/** The value after a flag; a flag with no value, or with another flag after it, is refused. */
const option = (argv, name) => {
    const at = argv.indexOf(name);
    if (at < 0) return undefined;
    const value = argv[at + 1];
    if (value === undefined || value.startsWith('--')) throw new Error(`${name} needs a value`);
    return value;
};

const NAMES = { correction: 'поправка', status: '«где стоим»', order: 'новый приказ', other: 'прочее' };

function table(result) {
    const rows = [
        `Задач: ${result.tasks}, обращений: ${result.total}, медиана на задачу: ${result.median}`,
        `Задач без обращений: ${result.zeroTasks}; медиана задач с обращениями: ${result.medianTouched}; обращений вне задач: ${result.offTask}`,
        `Окна разрешений от хуков: ${result.windows}`,
        'Набранные сообщения по видам:',
        ...Object.keys(result.kinds).map((kind) => `  ${NAMES[kind] ?? kind}: ${result.kinds[kind]}`),
        `  доля прочего: ${result.otherShare === null ? 'нет размеченных строк' : `${Math.round(result.otherShare * 100)}%`}`,
    ];
    if (result.broken > 0) rows.push(`Битых строк пропущено: ${result.broken}`);
    return `${rows.join('\n')}\n`;
}

function main(argv) {
    let dir;
    let bounds;
    try {
        dir = option(argv, '--dir') ?? join(process.cwd(), '.claude/rt-kit/observations');
        bounds = { since: option(argv, '--since') ?? '', until: option(argv, '--until') ?? END };
    } catch (error) {
        process.stderr.write(`owner-touches: ${error.message}\n`);
        return 2;
    }
    const lines = existsSync(dir)
        ? readdirSync(dir)
              .filter((name) => name.endsWith('.jsonl'))
              .flatMap((name) => readFileSync(join(dir, name), 'utf8').split('\n'))
        : [];
    const result = countTouches(lines, bounds);
    process.stdout.write(argv.includes('--json') ? `${JSON.stringify(result)}\n` : table(result));
    return 0;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) process.exit(main(process.argv.slice(2)));
