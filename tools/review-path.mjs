#!/usr/bin/env node
/**
 * Which review path a change takes: light — a short plan, no reading of the plan by the roles, one
 * round of `qa-engineer` and `goal-critic`; full — the whole course. The rule is `task-delivery-loop`,
 * the signs lie in `review-path-signs.mjs`.
 *
 *   node tools/review-path.mjs [--base <ref>] [--head <ref>]   the path of the branch by its diff
 *   node tools/review-path.mjs --plan <plan.md>                the path by the plan, before the code
 *   node tools/review-path.mjs --roles <plan.md>               `none`, or the roles that read the plan
 *   node tools/review-path.mjs --round-two [--serious <N>] [--since <ref>] [--base <ref>]
 *                                                              whether the second round is due
 *   node tools/review-path.mjs --check [--base <ref>]          code 1: the plan says light, the diff full
 *
 * The base is the branch the work is pushed against, not always `main`: a branch of a chain is judged
 * from the previous one. A branch whose plan does not call itself light is on the full path whatever
 * its diff; a named `--head` is judged by the diff alone. What cannot be read — a base, a diff, a plan,
 * the name of the branch — is the full path, and for `--check` the code 1.
 *
 * `--check` reads the plans in the commits of the branch that added them, so a folder taken apart or a
 * renamed branch does not hide one. Its refusal is lifted by the round the full path would have had: a
 * commit of the branch itself named «…после второго круга ревью (RT-N)», not empty and with no code
 * after it.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

import { parseApprovals } from './check-kit-approval.mjs';
import { isCode, isLightPlan, isRecord, judgeDiff, judgePlan, riskOf, signsOfFile } from './review-path-signs.mjs';

const ROLES = 'product-strategist goal-critic';
const FLAGS = new Set(['--base', '--head', '--plan', '--roles', '--serious', '--since']);
const COMMANDS = new Set(['--round-two', '--check']);
/** The diff the same on every machine: no settings, no attributes and no outside program. */
const DIFF = [
    '-c',
    'core.quotePath=false',
    'diff',
    '--no-ext-diff',
    '--no-textconv',
    '--text',
    '--no-renames',
    '--no-color',
    '--src-prefix=a/',
    '--dst-prefix=b/',
];

function parseArgs(argv) {
    const args = {};

    for (let i = 0; i < argv.length; i += 1) {
        if (COMMANDS.has(argv[i])) args[argv[i].slice(2)] = true;
        else if (FLAGS.has(argv[i]) && argv[i + 1] !== undefined) args[argv[i].slice(2)] = argv[(i += 1)];
        else throw new Error(`unknown or incomplete argument ${argv[i]}`);
    }

    return args;
}

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] });
const tryGit = (...args) => {
    try {
        return git(...args);
    } catch {
        return null;
    }
};
const linesOf = (text) => (text ?? '').split('\n').filter(Boolean);

/** The changed lines of every file of the range, with their sign, in the order git prints the files. */
function changedLines(from, to) {
    const files = [];
    let inHunk = false;

    for (const line of git(...DIFF, '--unified=0', from, to).split('\n')) {
        if (line.startsWith('diff --git ')) {
            files.push([]);
            inHunk = false;
        } else if (line.startsWith('@@ ')) inHunk = true;
        else if (inHunk && /^[+-]/.test(line)) files.at(-1).push(line);
    }

    return files;
}

/** The changed files between the two commits, or null when git does not give them whole. */
function filesBetween(from, to) {
    try {
        const changes = changedLines(from, to);
        const paths = git(...DIFF, '--name-only', '-z', from, to)
            .split('\0')
            .filter(Boolean);

        if (paths.length !== changes.length) return null;

        return paths.map((path, index) => {
            const file = { path, before: tryGit('show', `${from}:${path}`), after: tryGit('show', `${to}:${path}`) };

            if (file.before === null && file.after === null) throw new Error(path);

            const added = changes[index].filter((line) => line.startsWith('+')).length;

            return {
                ...file,
                added,
                removed: changes[index].length - added,
                lines: changes[index].map((line) => line.slice(1)),
            };
        });
    } catch {
        return null;
    }
}

const mergeBase = (base, head) => tryGit('merge-base', base, head)?.trim() ?? null;

/** The files the branch changed since it left the base. */
function filesOfBranch(base, head) {
    const from = mergeBase(base, head);

    return from ? filesBetween(from, head) : null;
}

/** Whether the record the branch added — approvals or archive — says the look is not touched. */
function saysInvisible(files) {
    const records = files.filter(
        ({ path, before }) => before === null && /^docs\/(tasks\/[^/]+\/approvals\.md|archive\/[^/]+\.md)$/.test(path)
    );

    return records.length > 0 && records.every(({ after }) => parseApprovals(after ?? '').invisible !== null);
}

function judgeBranch(base, head) {
    const files = filesOfBranch(base, head);

    return { files, verdict: judgeDiff(files, { invisible: files !== null && saysInvisible(files) }) };
}

/**
 * The plans of the checked-out branch, as the commits that added them hold them: `{ branch, plans }`, or
 * null when the base or the name of the branch cannot be read. A plan the base already holds is found by
 * the name of the branch.
 */
function plansOfBranch(base) {
    const branch = tryGit('symbolic-ref', '--short', 'HEAD')?.trim();
    const from = mergeBase(base, 'HEAD');

    if (!branch || !from) return null;

    const added = (range, path) => linesOf(tryGit('log', '--diff-filter=A', '--format=%H', ...range, '--', path)).at(-1) ?? null;
    const paths = linesOf(tryGit('log', '--diff-filter=A', '--format=', '--name-only', `${from}..HEAD`, '--', 'docs/tasks/*/plan.md'));
    const own = `docs/tasks/${branch}/plan.md`;
    const plans = [...new Set([own, ...paths])].map((path) => {
        const sha = added([`${from}..HEAD`], path) ?? (path === own ? added(['HEAD'], path) : null);

        return sha ? tryGit('show', `${sha}:${path}`) : null;
    });

    return { branch, plans: plans.filter((text) => text !== null) };
}

const printPath = ({ light, reasons }) =>
    console.log([`путь: ${light ? 'лёгкий' : 'полный'}`, ...reasons.map((reason) => `  ${reason}`)].join('\n'));

const readText = (path) => {
    try {
        return readFileSync(path, 'utf8');
    } catch {
        return null;
    }
};

function readPlan(path) {
    const text = readText(path);

    return text === null ? { light: false, reasons: [`план нельзя прочесть: ${path}`] } : judgePlan(text, readText);
}

/** The path of the branch: its diff, and the word of its plan where the checked-out branch is judged. */
function pathOfBranch(base, head) {
    const { verdict } = judgeBranch(base, head ?? 'HEAD');
    const own = head === undefined ? plansOfBranch(base) : null;

    if (own === null || own.plans.length === 0 || own.plans.some(isLightPlan)) return verdict;

    return { light: false, reasons: ['план ветки не назван лёгким', ...verdict.reasons] };
}

/** The answer about the second round, a line; the decision is in the rule `task-delivery-loop`. */
function roundTwo({ base, serious, since }) {
    const { files, verdict } = judgeBranch(base, 'HEAD');
    const planned = plansOfBranch(base)?.plans.some(isLightPlan) ?? false;

    if (planned && verdict.light) return 'второй круг: не нужен — путь лёгкий';
    if (planned) return `второй круг: нужен — план лёгкий, а разница полная (${verdict.reasons[0]}); вся ветка, три роли`;
    if (!/^\d+$/.test(serious ?? '')) return 'второй круг: нужен — число серьёзных находок первого круга не названо';
    if (Number(serious) > 0) return `второй круг: нужен — серьёзных находок первого круга ${serious}`;

    const risky = files === null ? 'разницу нельзя прочесть' : riskOf(files);

    if (risky === null) return 'второй круг: не нужен — серьёзных находок нет, кит, защиты и безопасность не тронуты';
    if (linesOf(tryGit('status', '--porcelain', '--untracked-files=no')).length > 0) {
        return 'второй круг: нужен — в копии лежат незакоммиченные правки';
    }

    const fixes = since === undefined ? null : filesBetween(since, 'HEAD');

    if (fixes !== null && fixes.every(({ path }) => isRecord(path))) return 'второй круг: не нужен — читать нечего';

    return `второй круг: нужен — ${risky}`;
}

/** Whether a commit of the branch itself closes the second round and no code came after it. */
function readBySecondRound(base, task) {
    for (const row of linesOf(tryGit('log', '--first-parent', '--format=%H %P%x09%s', `${base}..HEAD`))) {
        const [ids, subject] = row.split('\t');
        const [sha, parent, merged] = ids.split(' ');

        // A merge of the base brings what its own branch has read.
        if (merged) continue;

        const files = parent ? filesBetween(parent, sha) : null;

        if (files === null) return false;
        if (subject.endsWith(`после второго круга ревью (${task})`)) return files.length > 0;
        if (files.some((file) => isCode(file.path) || signsOfFile(file).length > 0)) return false;
    }

    return false;
}

function refuse(reasons, task) {
    console.error('review-path: the plan of the branch is light, and its diff is full\n');
    reasons.forEach((reason) => console.error(`  ${reason}`));
    console.error(
        `\nThe full path has not read this change: run the second round over the whole branch by qa-engineer, product-strategist and goal-critic, and close it by a commit «…после второго круга ревью (${task ?? 'RT-N'})» that is not empty and has no code after it. A round without findings closes by its record in progress.md, committed under that name.`
    );

    return 1;
}

/** Code 1 when the plan of the branch is light and its diff is full without the round that answers for it. */
function check(base) {
    const own = plansOfBranch(base);

    if (own === null) {
        console.error(`review-path: the base «${base}» or the name of the branch cannot be read, and the path is not known`);

        return 1;
    }
    if (!own.plans.some(isLightPlan)) {
        console.log('review-path: no plan of the branch is light, nothing to compare');

        return 0;
    }

    const { verdict } = judgeBranch(base, 'HEAD');

    if (verdict.light) {
        console.log('review-path: the plan is light and so is the diff');

        return 0;
    }

    const task = /^([A-Z]+-\d+)-/.exec(own.branch)?.[1];

    if (task && readBySecondRound(base, task)) {
        console.log('review-path: the plan is light, the diff is full, and the second round has read it');

        return 0;
    }

    return refuse(verdict.reasons, task);
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const base = args.base ?? 'origin/main';

    if (args.roles !== undefined) console.log(readPlan(args.roles).light ? 'none' : ROLES);
    else if (args.plan !== undefined) printPath(readPlan(args.plan));
    else if (args['round-two']) console.log(roundTwo({ base, serious: args.serious, since: args.since }));
    else if (args.check) process.exitCode = check(base);
    else printPath(pathOfBranch(base, args.head));
}

try {
    main();
} catch (error) {
    console.error(`review-path: ${error.message}`);
    process.exitCode = 2;
}
