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
 * from the previous one. A diff or a plan that cannot be read is the full path.
 *
 * `--check` finds the plan in the commit of the branch that added it, so a folder taken apart does not
 * hide it. Its refusal is lifted by the round the full path would have had: a commit of the branch
 * named «…после второго круга ревью (RT-N)».
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

import { parseApprovals } from './check-kit-approval.mjs';
import { isLightPlan, judgeDiff, judgePlan, riskOf } from './review-path-signs.mjs';

const ROLES = 'product-strategist goal-critic';
const FLAGS = new Set(['--base', '--head', '--plan', '--roles', '--serious', '--since']);
const COMMANDS = new Set(['--round-two', '--check']);

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

/** The changed lines of every file of the range, without their sign. */
function changedLines(from, to) {
    const byFile = new Map();
    let current = null;

    for (const line of git('-c', 'core.quotePath=false', 'diff', '--no-renames', '--unified=0', '--no-color', from, to).split('\n')) {
        if (line.startsWith('diff --git ')) {
            current = [];
            byFile.set(line.slice(line.lastIndexOf(' b/') + 3), current);
        } else if (/^[+-](?![+-]{2} )/.test(line)) current?.push(line.slice(1));
    }

    return byFile;
}

/** The changed files between the two commits, or null when git does not give them. */
function filesBetween(from, to) {
    try {
        const lines = changedLines(from, to);

        return git('-c', 'core.quotePath=false', 'diff', '--no-renames', '--numstat', from, to)
            .split('\n')
            .filter(Boolean)
            .map((row) => {
                const [added, removed, path] = row.split('\t');

                return {
                    path,
                    added: Number(added) || 0,
                    removed: Number(removed) || 0,
                    before: tryGit('show', `${from}:${path}`),
                    after: tryGit('show', `${to}:${path}`),
                    lines: lines.get(path) ?? [],
                };
            });
    } catch {
        return null;
    }
}

/** The files the branch changed since it left the base. */
function filesOfBranch(base, head) {
    const from = tryGit('merge-base', base, head)?.trim();

    return from ? filesBetween(from, head) : null;
}

/** Whether a record of the branch — in the task folder or in the archive — says the look is not touched. */
function saysInvisible(files) {
    return files.some(
        ({ path, after }) =>
            /^docs\/(tasks\/[^/]+\/approvals\.md|archive\/[^/]+\.md)$/.test(path) &&
            after !== null &&
            parseApprovals(after).invisible !== null
    );
}

function judgeBranch(base, head) {
    const files = filesOfBranch(base, head);

    return { files, verdict: judgeDiff(files, { invisible: files !== null && saysInvisible(files) }) };
}

/** The plan of the checked-out branch as the commit that added it holds it, or null. */
function planOfBranch(base) {
    const branch = tryGit('rev-parse', '--abbrev-ref', 'HEAD')?.trim();
    const from = tryGit('merge-base', base, 'HEAD')?.trim();
    const path = `docs/tasks/${branch}/plan.md`;
    const added = from ? tryGit('log', '--diff-filter=A', '--format=%H', `${from}..HEAD`, '--', path) : null;
    const sha = added?.trim().split('\n').filter(Boolean).at(-1);

    return sha ? { branch, text: tryGit('show', `${sha}:${path}`) } : null;
}

const printPath = ({ light, reasons }) =>
    console.log([`путь: ${light ? 'лёгкий' : 'полный'}`, ...reasons.map((reason) => `  ${reason}`)].join('\n'));

function readPlan(path) {
    try {
        return judgePlan(readFileSync(path, 'utf8'));
    } catch {
        return { light: false, reasons: [`план нельзя прочесть: ${path}`] };
    }
}

/** The answer about the second round, a line; the decision is in the rule `task-delivery-loop`. */
function roundTwo({ base, serious, since }) {
    const { files, verdict } = judgeBranch(base, 'HEAD');
    const plan = planOfBranch(base);
    const planned = plan !== null && isLightPlan(plan.text);

    if (planned && verdict.light) return 'второй круг: не нужен — путь лёгкий';
    if (planned) return `второй круг: нужен — план лёгкий, а разница полная (${verdict.reasons[0]}); вся ветка, три роли`;
    if (!/^\d+$/.test(serious ?? '')) return 'второй круг: нужен — число серьёзных находок первого круга не названо';
    if (Number(serious) > 0) return `второй круг: нужен — серьёзных находок первого круга ${serious}`;

    const risky = files === null ? 'разницу нельзя прочесть' : riskOf(files);

    if (risky === null) return 'второй круг: не нужен — серьёзных находок нет, кит, защиты и безопасность не тронуты';

    const fixes = since === undefined ? null : filesBetween(since, 'HEAD');

    if (fixes !== null && fixes.length === 0) return 'второй круг: не нужен — читать нечего';

    return `второй круг: нужен — ${risky}`;
}

/** Code 1 when the plan of the branch is light and its diff is full without the round that answers for it. */
function check(base) {
    const plan = planOfBranch(base);

    if (plan === null || !isLightPlan(plan.text)) {
        console.log('review-path: the plan of the branch is not light, nothing to compare');

        return 0;
    }

    const { verdict } = judgeBranch(base, 'HEAD');

    if (verdict.light) {
        console.log('review-path: the plan is light and so is the diff');

        return 0;
    }

    const task = /^([A-Z]+-\d+)-/.exec(plan.branch)?.[1];
    const subjects = tryGit('log', '--format=%s', `${base}..HEAD`)?.split('\n') ?? [];

    if (task && subjects.some((subject) => subject.endsWith(`после второго круга ревью (${task})`))) {
        console.log('review-path: the plan is light, the diff is full, and the second round has read it');

        return 0;
    }

    console.error('review-path: the plan of the branch is light, and its diff is full\n');
    verdict.reasons.forEach((reason) => console.error(`  ${reason}`));
    console.error(
        `\nThe full path has not read this change: run the second round over the whole branch by qa-engineer, product-strategist and goal-critic, and close it by a commit «…после второго круга ревью (${task ?? 'RT-N'})»; a round without findings closes by the record in progress.md.`
    );

    return 1;
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const base = args.base ?? 'origin/main';

    if (args.roles !== undefined) console.log(readPlan(args.roles).light ? 'none' : ROLES);
    else if (args.plan !== undefined) printPath(readPlan(args.plan));
    else if (args['round-two']) console.log(roundTwo({ base, serious: args.serious, since: args.since }));
    else if (args.check) process.exitCode = check(base);
    else printPath(judgeBranch(base, args.head ?? 'HEAD').verdict);
}

try {
    main();
} catch (error) {
    console.error(`review-path: ${error.message}`);
    process.exitCode = 2;
}
