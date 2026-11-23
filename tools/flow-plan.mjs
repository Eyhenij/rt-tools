// rt-kit v0.39.0 · checks/flow-plan.mjs · efc1d55fba68 · правится надстройкой, не здесь
/**
 * The approval of a plan and the forms of its checks — the engine commands `plan-check` and
 * `plan-red`.
 *
 * `plan-check <plan.md>` judges a plan before it is written: every step carries a check line, its
 * expected result is in a form of `expect`, and no check is a command of the work. A guard of the
 * plan write, where one is laid out, calls it and refuses the write on any problem.
 *
 * `plan-red` writes the approval mark of the plan of the branch when all of it holds: every check of
 * the plan, run now, does not match — a check green before the work measures nothing; the record of
 * the conversation holds calls of the roles `product-strategist` and `goal-critic`; and after the last
 * of them the owner approved the plan of the branch — a menu option or a typed message, judged by
 * `approvalOf` of the engine, the same rule the mark check uses. Another answer gives no mark. The record counts only when it
 * is a session record of this repository. The mark carries the answer, the place of the answer — the
 * record and the uuid of its entry — the commit of the plan, its fingerprint and the red output of
 * every step.
 *
 * The checks are measured on the tree of the plan commit: red is a statement about that tree, not
 * about the current one. At the plan commit with no tracked file changed they run in place; past it,
 * or with an uncommitted edit, in a detached worktree of the plan commit under the system temporary
 * directory, with every `node_modules` of the repository linked at its place. The worktree is removed
 * after the run whatever its end; a worktree that cannot be made is a refusal, and nothing runs.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { compareExpected, isWriteCommand } from './flow-data.mjs';
import { STEP_LIMIT_MS, StepRefused, openRecords, planOfBranch, runCheck } from './flow-step.mjs';

// The rule of an approving answer lies with the engine: next to it where it is laid out, one level up in the package.
const HERE = dirname(fileURLToPath(import.meta.url));
const OWNER = [join(HERE, 'task-flow/source/owner.mjs'), join(HERE, '../task-flow/source/owner.mjs')].find((path) => existsSync(path));
if (!OWNER) throw new Error(`flow-plan: the engine source task-flow/source/owner.mjs is not laid out next to ${HERE}`);
const { approvalOf, wordOf } = await import(pathToFileURL(OWNER).href);

/** The roles whose verdicts precede the approval. */
export const ROLES = ['product-strategist', 'goal-critic'];

/** What is wrong with the checks of a plan text; an empty list means it may be written. */
export function planProblems(text, steps, model) {
    const problems = [];
    for (const step of steps.ofPlan(text)) {
        if (step.command === null) problems.push(`step ${step.number} has no check line`);
        else if (isWriteCommand(step.command, model.words)) problems.push(`the check of step ${step.number} is a command of the work: ${step.command}`);
        else if (compareExpected(model.expect, step.expected, 0, '') === null) problems.push(`the expected result of step ${step.number} is in no form: ${step.expected}`);
    }
    return problems;
}

/** The record of the conversation as entries, oldest first; a line that does not parse is skipped. */
export function readRecord(file) {
    if (!file || !existsSync(file)) return [];
    const entries = [];
    for (const line of readFileSync(file, 'utf8').split('\n')) {
        if (!line.trim()) continue;
        try {
            entries.push(JSON.parse(line));
        } catch {
            // A broken line is no entry.
        }
    }
    return entries;
}

const roleCalls = (entry) =>
    entry.type === 'assistant' && Array.isArray(entry.message?.content)
        ? entry.message.content.filter((part) => part?.type === 'tool_use' && part.name === 'Agent').map((part) => part.input?.subagent_type)
        : [];

/**
 * The latest approving answer of the owner with both roles called before it: a menu option or a
 * typed message that approves the plan of the task by `approvalOf`. The roles called again in a
 * review round later do not hide it. Null when there is none.
 */
export function approvingEntry(entries, task) {
    const called = new Set();
    let found = null;
    for (const entry of entries) {
        for (const role of roleCalls(entry)) if (ROLES.includes(role)) called.add(role);
        if (ROLES.some((role) => !called.has(role))) continue;
        const answer = approvalOf(entry, task);
        if (answer) found = { answer, uuid: entry.uuid ?? null };
    }
    return found;
}

/** The last word of the owner holding «одобр» that the rule did not count, for the refusal to quote. */
const uncounted = (entries) => {
    for (let index = entries.length - 1; index >= 0; index -= 1) {
        const word = wordOf(entries[index]);
        if (word && /одобр/iu.test(word)) return word.replace(/\s+/g, ' ').trim().slice(0, 160);
    }
    return null;
};

/** The text of the approving answer, or null — the same test as `approvingEntry`. */
export const approvingAnswer = (entries, task) => approvingEntry(entries, task)?.answer ?? null;

const gitOut = (args, cwd) => spawnSync('git', args, { cwd, encoding: 'utf8' });

/**
 * Where the checks of the plan commit `sha` run: `{ cwd, place, remove }`. In place when HEAD is the
 * plan commit and no tracked file differs; otherwise a detached worktree of the commit with every
 * existing `node_modules` linked. Throws `StepRefused` when the worktree cannot be made.
 */
export function planTree(sha, base = tmpdir()) {
    const root = gitOut(['rev-parse', '--show-toplevel']).stdout.trim();
    const head = gitOut(['rev-parse', 'HEAD'], root).stdout.trim();
    const dirty = gitOut(['status', '--porcelain', '--untracked-files=no'], root).stdout.trim();
    if (head === sha && dirty === '') return { cwd: root, place: 'in place, at the plan commit', remove: () => {} };
    let holder = null;
    let tree = null;
    const remove = () => {
        if (tree) gitOut(['worktree', 'remove', '--force', tree], root);
        if (holder) rmSync(holder, { recursive: true, force: true });
        gitOut(['worktree', 'prune'], root);
    };
    try {
        gitOut(['worktree', 'prune'], root);
        holder = mkdtempSync(join(base, 'rt-plan-red-'));
        const made = gitOut(['worktree', 'add', '--detach', '-q', join(holder, 'tree'), sha], root);
        if (made.status !== 0) throw new Error((made.stderr || `git worktree add exited ${made.status}`).trim());
        tree = join(holder, 'tree');
        const dirs = gitOut(['ls-tree', '-d', '-r', '--name-only', sha], root).stdout.split('\n').filter(Boolean);
        for (const dir of ['', ...dirs]) {
            const own = join(root, dir, 'node_modules');
            if (existsSync(own) && existsSync(join(tree, dir)) && !existsSync(join(tree, dir, 'node_modules'))) symlinkSync(own, join(tree, dir, 'node_modules'));
        }
    } catch (error) {
        remove();
        throw new StepRefused(`the tree of the plan commit could not be made: ${error.message}`);
    }
    return { cwd: tree, place: `on the tree of the plan commit ${sha.slice(0, 9)}, in a temporary worktree`, remove };
}

/** Runs every check of the plan and writes the approval mark when the plan holds; returns the code. */
export function runPlanRed({ git, steps, marks }, model, record, limitMs = STEP_LIMIT_MS) {
    let plan;
    try {
        plan = planOfBranch(git, model.words);
    } catch (error) {
        if (!(error instanceof StepRefused)) throw error;
        console.log(`plan-red: ${error.message}`);
        return 1;
    }
    const problems = planProblems(plan.text, steps, model);
    if (problems.length > 0) {
        console.log(problems.map((p) => `plan-red: ${p}`).join('\n'));
        return 1;
    }
    const red = {};
    let green = false;
    const planSteps = steps.ofPlan(plan.text);
    // A plan in progress is approved again by the red output its own mark holds: its checks are green
    // by now, and the mark of the same commit and fingerprint was written by the engine alone.
    const prior = marks.approval(plan.branch);
    const same = prior && prior.plan === plan.sha && prior.fingerprint === plan.fingerprint && prior.red;
    if (same && planSteps.every((step) => typeof prior.red[step.number] === 'string')) {
        for (const step of planSteps) red[step.number] = prior.red[step.number];
        console.log('plan-red: the checks were red by the mark of this plan commit; no check runs');
    }
    if (Object.keys(red).length === 0) {
        let tree;
        try {
            tree = planTree(plan.sha);
        } catch (error) {
            if (!(error instanceof StepRefused)) throw error;
            console.log(`plan-red: ${error.message}; no check runs, no mark`);
            return 1;
        }
        console.log(`plan-red: the checks run ${tree.place}`);
        try {
            for (const step of planSteps) {
                const run = runCheck(step.command, limitMs, tree.cwd);
                const verdict = run.timedOut ? { matched: false } : compareExpected(model.expect, step.expected, run.code, run.output);
                const line = run.timedOut ? 'the limit ran out' : `exit ${run.code}, ${run.output.trim().split('\n').pop() ?? ''}`;
                red[step.number] = line;
                console.log(`${step.number} ${verdict.matched ? 'green before the work' : 'red'} · ${line}`);
                if (verdict.matched) green = true;
            }
        } finally {
            tree.remove();
        }
    }
    if (green) {
        console.log('plan-red: a check is green before the work and measures nothing; no mark');
        return 1;
    }
    const task = plan.branch.match(/^([A-Z]+-\d+)-/)?.[1] ?? plan.branch;
    // The record counts only when it is a session record of this repository: a file a caller names
    // anywhere else costs as much to write as the mark itself.
    const file = process.env.RT_FLOW_TRANSCRIPT ?? '';
    if (!openRecords().holds(file)) {
        console.log(`plan-red: the record «${file}» is not a session record of this repository; no mark`);
        return 1;
    }
    const found = approvingEntry(record, task);
    if (found === null || !found.uuid) {
        const word = uncounted(record);
        console.log(
            `plan-red: no approving answer of the owner after the calls of ${ROLES.join(' and ')} — a menu option or a typed message with «Одобряю» naming ${task} and no condition${word ? `; the last word with «одобр», not counted: «${word}»` : ''}; ask the owner one menu question naming ${task} and its plan, never ask them to type a phrase; no mark`
        );
        return 1;
    }
    const { answer } = found;
    marks.writeApproval(plan.branch, { answer, plan: plan.sha, fingerprint: plan.fingerprint, red, place: { record: file, uuid: found.uuid } });
    console.log(`plan-red: the approval mark is written — «${answer}»`);
    return 0;
}
