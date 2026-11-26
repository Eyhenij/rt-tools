// rt-kit v0.40.0 · checks/flow-plan.mjs · dd251d073eab · правится надстройкой, не здесь
/**
 * The approval of a plan and the forms of its checks — the engine commands `plan-check` and
 * `plan-red`.
 *
 * `plan-check <plan.md>` judges a plan before it is written: every step carries a check line, its
 * expected result is in a form of `expect`, no check is a command of the work, and no check hides its
 * result — a pipe without `pipefail`, an absence counted by `grep -c`. A guard of the plan write,
 * where one is laid out, calls it and refuses the write on any problem.
 *
 * `plan-red` writes the approval mark of the plan of the branch when all of it holds: every check of
 * the plan, run now, does not match — a check green before the work measures nothing; the record of
 * the conversation holds calls of the roles `product-strategist` and `goal-critic`; and after the last
 * of them the owner approved the plan of the branch — a menu option or a typed message, judged by
 * `approvalOf` of the engine, the same rule the mark check uses. Another answer gives no mark. A tree
 * that names `planRolesCommand` in its check settings is asked whose voices the plan needs: the command
 * gets the path of the plan text, and the answer `none` lifts the roles — the approval must then be
 * later than the plan commit. The record counts only when it
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
import { existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { compareExpected, isWriteCommand } from './flow-data.mjs';
import { decisionProblems } from './flow-decision.mjs';
import { callOf } from './flow-guard-run.mjs';
import { textAfter } from './flow-guard.mjs';
import { STEP_LIMIT_MS, StepRefused, openRecords, planOfBranch, runCheck } from './flow-step.mjs';
import { stepsOfPlan } from './work-steps-lib.mjs';

// The rule of an approving answer lies with the engine: next to it where it is laid out, one level up in the package.
const HERE = dirname(fileURLToPath(import.meta.url));
const OWNER = [join(HERE, 'task-flow/source/owner.mjs'), join(HERE, '../task-flow/source/owner.mjs')].find((path) => existsSync(path));
if (!OWNER) throw new Error(`flow-plan: the engine source task-flow/source/owner.mjs is not laid out next to ${HERE}`);
const { approvalOf, wordOf } = await import(pathToFileURL(OWNER).href);

/** The roles whose verdicts precede the approval. */
export const ROLES = ['product-strategist', 'goal-critic'];

/** The limit of the tree's command that names the roles, in milliseconds. */
const ROLES_LIMIT_MS = 60_000;

/**
 * The roles that read the plan before its approval: none where the command `planRolesCommand` of the
 * tree at `root` answers `none` for the plan text, both in every other case — no settings, no command,
 * a command that failed or ran out of time, any other answer.
 */
export function rolesOfPlan(root, text) {
    let holder = null;
    try {
        const command = JSON.parse(readFileSync(join(root, '.claude/rt-kit/checks.json'), 'utf8')).planRolesCommand;
        if (typeof command !== 'string' || command === '') return ROLES;
        holder = mkdtempSync(join(tmpdir(), 'rt-plan-roles-'));
        writeFileSync(join(holder, 'plan.md'), text);
        const run = spawnSync('sh', ['-c', `${command} "$1"`, 'sh', join(holder, 'plan.md')], { cwd: root, encoding: 'utf8', timeout: ROLES_LIMIT_MS });
        return run.status === 0 && run.stdout.trim() === 'none' ? [] : ROLES;
    } catch {
        // Settings that do not read give no word about the roles, and no word is both of them.
        return ROLES;
    } finally {
        if (holder) rmSync(holder, { recursive: true, force: true });
    }
}

/** The refusal of a plan whose decision is not complete: all it lacks in one line. An empty list — it is complete. */
const decisionRefusal = (text) =>
    [decisionProblems(text).join('; ')].filter(Boolean).map((lacks) =>
        `the decision of the plan is not complete: ${lacks}. A change without new symbols writes one line under the heading instead of the table: «Решения нет: <reason>» («No decision: <reason>»)`);

/** Whether the plan of a commit answers for its decision: one written before the engine read it does not. */
const answersForDecision = (sha) => {
    const own = relative(gitOut(['rev-parse', '--show-toplevel']).stdout.trim(), join(HERE, 'flow-decision.mjs'));
    const holds = (rev) => gitOut(['cat-file', '-e', `${rev}:${own}`]).status === 0;
    return own.startsWith('..') || !holds('HEAD') || holds(sha);
};

/**
 * What is wrong with a plan text; an empty list means it may be written. `forms: false` leaves out the
 * forms that hide a result and `decision: false` the decision: an approved plan keeps what it has.
 */
export function planProblems(text, steps, model, { forms = true, decision = true } = {}) {
    const problems = [...(forms ? formProblems(steps.ofPlan(text)) : []), ...(decision ? decisionRefusal(text) : [])];
    for (const step of steps.ofPlan(text)) {
        if (step.command === null) problems.push(`step ${step.number} has no check line`);
        else if (isWriteCommand(step.command, model.words)) problems.push(`the check of step ${step.number} is a command of the work: ${step.command}`);
        else if (compareExpected(model.expect, step.expected, 0, '') === null) problems.push(`the expected result of step ${step.number} is in no form: ${step.expected}`);
    }
    return problems;
}

/**
 * The command without its quoted strings, escaped characters and substitutions: what is left is the
 * shell's own. The verdict of a substitution is not the verdict of the command. The code of `bash -c`
 * stands in quotes and is not judged.
 */
const bare = (command) => {
    let text = command
        .replace(/\\./g, ' ')
        .replace(/'[^']*'/g, "''")
        .replace(/"[^"$`]*"/g, "''")
        .replace(/`[^`]*`/g, ' ')
        .replace(/\$\{[^}]*\}/g, ' ');
    for (let before = ''; before !== text; ) {
        before = text;
        text = text.replace(/[$<]\([^()]*\)/g, ' ');
    }
    return text
        .replace(/"[^"]*"/g, "''")
        .replace(/\[\[.*?\]\]/g, ' ')
        .replace(/\bcase\b.*?\besac\b/g, ' ')
        .replace(/>\|/g, '>');
};

/** Whether the command is a pipe whose verdict the last part alone decides. */
const isBarePipe = (command) => {
    const pipe = bare(command).replace(/\|\|/g, '  ').indexOf('|');
    return pipe >= 0 && !/\bset\b[^;&|]*\bpipefail\b/.test(bare(command).slice(0, pipe));
};

/** Whether the command counts by `grep -c`, or by `grep | wc -l`, and the expected result is nothing found. */
const isCountedAbsence = (command, expected) => {
    const text = bare(command);
    const counts = /\b([ef]?grep|rg)\b[^|;&]*\s(-[A-Za-z]*c[A-Za-z]*|--count)(?=\s|$)/.test(text) || /\b([ef]?grep|rg)\b[^;&]*\|\s*wc\s+-l/.test(text);
    return counts && !/\|\|\s*(true|:)/.test(text) && /^(==?\s*0|<=?\s*0|`0`|<\s*1|\/\^0\$\/)$/.test(expected.trim());
};

/**
 * The checks of a list of plan steps whose form hides the result. They are asked when the plan is
 * written, not by `plan-red`: a plan approved before this was asked keeps its checks.
 */
export function formProblems(planSteps) {
    const problems = [];
    for (const step of planSteps) {
        if (step.command === null) continue;
        if (isBarePipe(step.command))
            problems.push(`the check of step ${step.number} is a pipe without «set -o pipefail;»: the last part alone decides: ${step.command}`);
        if (isCountedAbsence(step.command, step.expected))
            problems.push(
                `the check of step ${step.number} counts an absence by «grep -c»: without a match grep exits 1 and the check never matches. Write «grep -q … → exit 1»: ${step.command}`
            );
    }
    return problems;
}

/**
 * The first problem of the plan of the branch the hook input writes, or null: another file, a shell command
 * and an approved plan are not judged, and a template filled in by edits has no decision yet. The step guard asks it.
 */
export function writtenPlanProblem(input) {
    const root = gitOut(['rev-parse', '--show-toplevel']).stdout.trim();
    const branch = gitOut(['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();
    const call = callOf(input, root);
    if (!call?.path || call.path !== `${process.env.RT_FLOW_TASKS_DIR || 'docs/tasks'}/${branch}/plan.md`) return null;
    const common = gitOut(['rev-parse', '--path-format=absolute', '--git-common-dir']).stdout.trim();
    if (existsSync(join(common, 'rt-kit/approval', `${branch}.json`))) return null;
    const file = join(root, call.path);
    const after = textAfter(call, existsSync(file) ? readFileSync(file, 'utf8') : null);
    const filling = call.edits && stepsOfPlan(after).some(({ name }) => /^<.+>$/.test(name));
    return formProblems(stepsOfPlan(after))[0] ?? (filling ? null : (decisionRefusal(after)[0] ?? null));
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
 * The latest approving answer of the owner with `roles` called before it: a menu option or a typed
 * message that approves the plan of the task by `approvalOf`. The roles called again in a review
 * round later do not hide it. With no roles to wait for, the answer counts only when it is not
 * earlier than `since`, the moment of the plan commit in milliseconds. Null when there is none.
 */
export function approvingEntry(entries, task, roles = ROLES, since = null) {
    const called = new Set();
    let found = null;
    for (const entry of entries) {
        for (const role of roleCalls(entry)) if (roles.includes(role)) called.add(role);
        if (roles.some((role) => !called.has(role))) continue;
        if (roles.length === 0 && !(Date.parse(entry.timestamp ?? '') >= (since ?? Infinity))) continue;
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
    const problems = planProblems(plan.text, steps, model, { forms: false, decision: !marks.approval(plan.branch) && answersForDecision(plan.sha) });
    if (problems.length > 0) {
        console.log(problems.map((p) => `plan-red: ${p}`).join('\n'));
        console.log(`plan-red: the plan is read from the commit that added it, ${plan.sha.slice(0, 9)}: the fix goes into that commit before the push`);
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
    const root = gitOut(['rev-parse', '--show-toplevel']).stdout.trim();
    const roles = rolesOfPlan(root, plan.text);
    const since = Number(gitOut(['show', '-s', '--format=%ct', plan.sha]).stdout.trim()) * 1000;
    const found = approvingEntry(record, task, roles, since);
    if (found === null || !found.uuid) {
        const word = uncounted(record);
        const after = roles.length > 0 ? `the calls of ${roles.join(' and ')}` : `the plan commit ${plan.sha.slice(0, 9)}`;
        console.log(
            `plan-red: no approving answer of the owner after ${after} — a menu option or a typed message with «Одобряю» naming ${task} and no condition${word ? `; the last word with «одобр», not counted: «${word}»` : ''}; ask the owner one menu question naming ${task} and its plan, never ask them to type a phrase; no mark`
        );
        return 1;
    }
    const { answer } = found;
    marks.writeApproval(plan.branch, { answer, plan: plan.sha, fingerprint: plan.fingerprint, red, place: { record: file, uuid: found.uuid } });
    console.log(`plan-red: the approval mark is written — «${answer}»`);
    return 0;
}

// `node flow-plan.mjs written` with the hook input on stdin prints the problem of the plan being written.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1] && process.argv[2] === 'written') {
    console.log(writtenPlanProblem(JSON.parse(readFileSync(0, 'utf8') || '{}')) ?? '');
}
