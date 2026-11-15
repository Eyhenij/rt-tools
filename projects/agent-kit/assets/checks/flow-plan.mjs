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
 * of them the owner chose in a menu an option that begins with «Одобряю» and names `plan.md` or the
 * task of the branch. Another answer to the same menu gives no mark. The mark carries the answer, the
 * commit of the plan, its fingerprint and the red output of every step.
 */
import { existsSync, readFileSync } from 'node:fs';

import { compareExpected, isWriteCommand } from './flow-data.mjs';
import { STEP_LIMIT_MS, StepRefused, planOfBranch, runCheck } from './flow-step.mjs';

/** The roles whose verdicts precede the approval. */
export const ROLES = ['product-strategist', 'goal-critic'];

/** The word an approving menu option begins with. */
const APPROVE = /^Одобряю(?![\p{L}])/u;

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

const menuAnswers = (entry) => (entry.type === 'user' && entry.toolUseResult?.answers ? Object.values(entry.toolUseResult.answers) : []);

/**
 * The approving answer of the owner: an option chosen in a menu after the last call of the roles,
 * which begins with «Одобряю» and names `plan.md` or the task — `<KEY>-<number>`. Null when there is
 * none or a role was never called.
 */
export function approvingAnswer(entries, task) {
    let lastRole = -1;
    const called = new Set();
    entries.forEach((entry, index) => {
        for (const role of roleCalls(entry)) {
            if (ROLES.includes(role)) {
                called.add(role);
                lastRole = index;
            }
        }
    });
    if (ROLES.some((role) => !called.has(role))) return null;
    const names = new RegExp(`plan\\.md|${task}(?!\\d)`);
    for (const entry of entries.slice(lastRole + 1)) {
        const answer = menuAnswers(entry).find((text) => APPROVE.test(text) && names.test(text));
        if (answer) return answer;
    }
    return null;
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
    for (const step of steps.ofPlan(plan.text)) {
        const run = runCheck(step.command, limitMs);
        const verdict = run.timedOut ? { matched: false } : compareExpected(model.expect, step.expected, run.code, run.output);
        const line = run.timedOut ? 'the limit ran out' : `exit ${run.code}, ${run.output.trim().split('\n').pop() ?? ''}`;
        red[step.number] = line;
        console.log(`${step.number} ${verdict.matched ? 'green before the work' : 'red'} · ${line}`);
        if (verdict.matched) green = true;
    }
    if (green) {
        console.log('plan-red: a check is green before the work and measures nothing; no mark');
        return 1;
    }
    const task = plan.branch.match(/^([A-Z]+-\d+)-/)?.[1] ?? plan.branch;
    const answer = approvingAnswer(record, task);
    if (answer === null) {
        console.log(`plan-red: no menu answer «Одобряю …» naming plan.md or ${task} after the calls of ${ROLES.join(' and ')}; no mark`);
        return 1;
    }
    marks.writeApproval(plan.branch, { answer, plan: plan.sha, fingerprint: plan.fingerprint, red });
    console.log(`plan-red: the approval mark is written — «${answer}»`);
    return 0;
}
