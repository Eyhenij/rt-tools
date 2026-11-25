#!/usr/bin/env node
/**
 * The rework of a task: the lines its first review round changed and the files the branch touched
 * outside the footprint of its plan.
 *
 *   node tools/task-rework.mjs RT-<number>         one task
 *   node tools/task-rework.mjs --last=<count>      the last merged tasks, with the coupling of each merge
 *   node tools/task-rework.mjs --since=<revision>  the tasks merged after the revision, the same way
 *
 * The commits of a task are those whose subject names it, merges left out. The commit of the first round
 * is the one the delivery loop names «после первого круга ревью». The footprint is read from the first
 * version of the plan, the way the course of work reads it, masks opened. The task folder, the archive,
 * the plans and the laid-out copies count neither in the lines of the round nor outside: no plan lists
 * them, and a copy changes with its source.
 *
 * A task with no plan in the history is said so in words, not shown as a zero; a merge whose task has no
 * plan — the merge of an epic — is skipped. A task without a commit of the round stays out of the median
 * and is named apart.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { footprintRows, touches } from './task-flow/measure/text.mjs';

const ROUND = /после первого круга ревью \(RT-\d+\)$/;
const REQUEST = /^\[(RT-\d+)\] .*\(#\d+\)$/;
const OWN_PLACES = /^docs\/(?:tasks|archive|plans)\/|^\.claude\/rt-kit\/assignments\.md$/;
// The header of a laid-out copy on its first line, after a shebang or the front matter: a mention further down is a source.
const STAMP = /^(?:#!.*\n)?(?:---\n(?:.*\n)*?---\n)?(?:\/\/|#|<!--|\/\*\*?) rt-kit v\d/;
const BUFFER = 64 * 1024 * 1024;

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: BUFFER });
const rowsOf = (text) =>
    text
        .split('\n')
        .filter(Boolean)
        .map((line) => [line.slice(0, line.indexOf('\t')), line.slice(line.indexOf('\t') + 1)]);

/** The files no row of the plan names. */
function strayOf(files, plan) {
    const paths = footprintRows(plan).flatMap((row) => row.paths);
    return files.filter((file) => !paths.some((path) => touches(file, path)));
}

/** The middle of the numbers; none — nothing to take it from. */
function median(numbers) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const half = Math.floor(sorted.length / 2);
    if (!sorted.length) {
        return null;
    }
    return sorted.length % 2 ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2;
}

/** The own commits of a task, newest first: a subject that ends with a task in brackets is that task's alone. */
function commitsOf(task) {
    const ownOf = (subject) => /\((RT-\d+)\)"?$/.exec(subject)?.[1] ?? (new RegExp(`\\b${task}(?!\\d)`).test(subject) ? task : null);
    return rowsOf(git('log', '--no-merges', '--format=%H%x09%s', `--grep=${task}`, 'HEAD'))
        .map(([sha, subject]) => ({ sha, subject }))
        .filter(({ subject }) => ownOf(subject) === task);
}

const filesOf = (sha) => git('show', '--no-renames', '--name-only', '--format=', sha).split('\n').filter(Boolean);

/** A file of the commit that is a laid-out copy: its text carries the header of the layout. */
function isCopy(sha, file) {
    const shown = spawnSync('git', ['show', `${sha}:${file}`], { encoding: 'utf8', maxBuffer: BUFFER });
    return shown.status === 0 && STAMP.test(shown.stdout.slice(0, 4000));
}

/** The added and removed lines of a commit, its own places and copies left out; a binary file adds none. */
function linesOf(sha) {
    return git('show', '--no-renames', '--numstat', '--format=', sha)
        .split('\n')
        .filter(Boolean)
        .map((line) => line.split('\t'))
        .filter(([, , file]) => !OWN_PLACES.test(file) && !isCopy(sha, file))
        .reduce((sum, [added, removed]) => sum + (Number(added) || 0) + (Number(removed) || 0), 0);
}

/** The first version of the plan of the task: what the branch promised before the code. */
function planOf(task, commits) {
    for (const { sha } of [...commits].reverse()) {
        const path = filesOf(sha).find((file) => new RegExp(`^docs/tasks/${task}-[^/]+/plan\\.md$`).test(file));
        const shown = path && spawnSync('git', ['show', `${sha}:${path}`], { encoding: 'utf8' });
        if (shown?.status === 0) {
            return shown.stdout;
        }
    }
    return null;
}

/** The numbers of one task; `null` in a field — there is nothing to count it from. */
function reworkOf(task) {
    const commits = commitsOf(task);
    const round = [...commits].reverse().find(({ subject }) => ROUND.test(subject)) ?? null;
    const plan = planOf(task, commits);
    const touched = new Map();
    for (const { sha } of [...commits].reverse()) {
        filesOf(sha).forEach((file) => touched.set(file, sha));
    }
    const files = [...touched.keys()].filter((file) => !OWN_PLACES.test(file) && !isCopy(touched.get(file), file));
    return {
        task,
        commits: commits.length,
        round: round && { sha: round.sha, lines: linesOf(round.sha) },
        outside: plan === null ? null : strayOf(files, plan),
    };
}

const roundText = ({ round }) =>
    round ? `${round.lines} line${round.lines === 1 ? '' : 's'} (${round.sha.slice(0, 9)})` : 'no commit of the first round';
const outsideText = ({ outside }) =>
    outside === null ? 'no plan in the history' : `${outside.length} file${outside.length === 1 ? '' : 's'} outside the footprint`;

/** The merged requests of tasks after the revision, the newest first, up to the count. */
function mergesOf({ count = Infinity, since = null }) {
    const merges = rowsOf(git('log', '--merges', '--format=%H%x09%s', since ? `${since}..HEAD` : 'HEAD'))
        .map(([sha, subject]) => ({ sha, task: REQUEST.exec(subject)?.[1] }))
        .filter(({ task }) => task);
    const found = [];
    const seen = new Set();
    for (const { sha, task } of merges) {
        if (seen.has(task)) {
            continue;
        }
        seen.add(task);
        const result = reworkOf(task);
        if (result.outside !== null) {
            found.push({ sha, result });
        }
        if (found.length === count) {
            break;
        }
    }
    return found;
}

/**
 * What the coupling check says of the branch of a merge: the totals «was → now» and the overruns. The tip
 * of the branch is asked: at the merge itself the branch has no commits of its own.
 */
function couplingOf(sha) {
    const check = join(dirname(fileURLToPath(import.meta.url)), 'check-coupling.mjs');
    const { stdout, stderr } = spawnSync('node', [check, `--base=${sha}^1`, `--at=${sha}^2`], { encoding: 'utf8', maxBuffer: BUFFER });
    const text = `${stdout}${stderr}`;
    const totals = text.split('\n').find((line) => line.startsWith('check-coupling: modules')) ?? '';
    const grown = (name) => {
        const found = new RegExp(`${name} (\\d+) → (\\d+)`).exec(totals);
        return found ? Number(found[2]) - Number(found[1]) : null;
    };
    return {
        cycles: grown('cycles'),
        past: grown('past the entry'),
        overruns: totals ? (text.match(/the branch named \d+|nobody named a number for it/g) ?? []).length : null,
    };
}

function report(rows) {
    const signed = (value) => (value === null ? 'not counted' : value > 0 ? `+${value}` : String(value));
    rows.forEach((row) =>
        console.log(
            `${row.task}: first round ${roundText(row)}; ${outsideText(row)}; cycles ${signed(row.cycles)}, past an entry ${signed(row.past)}, overruns ${row.overruns ?? 'not counted'}`
        )
    );
    // A merge the check did not count leaves the total uncounted: a zero would read as «nothing new».
    const grown = (key) =>
        rows.some((row) => row[key] === null) ? 'not counted' : rows.reduce((sum, row) => sum + Math.max(0, row[key]), 0);
    const rounds = rows.filter((row) => row.round).map((row) => row.round.lines);
    const without = rows.filter((row) => !row.round).map((row) => row.task);
    console.log(
        `tasks ${rows.length}: new cycles ${grown('cycles')}, new imports past an entry ${grown('past')}, overruns ${grown('overruns')}; ` +
            `first round in ${rounds.length}, median ${median(rounds) ?? 'none'} lines; without a round: ${without.join(', ') || 'none'}`
    );
}

function main(argv) {
    const [word] = argv;
    const last = /^--last=([1-9]\d*)$/.exec(word ?? '');
    const since = /^--since=(.+)$/.exec(word ?? '');
    if (argv.length !== 1 || (!last && !since && !/^RT-\d+$/.test(word))) {
        console.error('task-rework: give one argument, RT-<number>, --last=<count> or --since=<revision>');
        return 2;
    }
    if (since && spawnSync('git', ['rev-parse', '--verify', '--quiet', `${since[1]}^{commit}`]).status !== 0) {
        console.error(`task-rework: no revision ${since[1]} in this history`);
        return 2;
    }
    if (last || since) {
        report(
            mergesOf(last ? { count: Number(last[1]) } : { since: since[1] }).map(({ sha, result }) => ({ ...result, ...couplingOf(sha) }))
        );
        return 0;
    }
    const result = reworkOf(word);
    if (!result.commits) {
        console.error(`task-rework: no commit of ${word} in this history`);
        return 1;
    }
    console.log(`${result.task}: first round ${roundText(result)}; ${outsideText(result)}`);
    (result.outside ?? []).forEach((file) => console.log(`  ${file}`));
    return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    process.exit(main(process.argv.slice(2)));
}
