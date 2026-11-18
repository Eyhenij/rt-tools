// rt-kit v0.37.0 · checks/flow-guard.mjs · b9eb00981527 · правится надстройкой, не здесь
/**
 * The guard of the course of work — the engine command `guard`, called by the hook
 * `flow-step-guard.sh` before Edit, Write, MultiEdit and a shell command.
 *
 * It refuses what would move the scenario by a declaration instead of a measurement:
 *
 *   - a step marked done in the progress without the green mark the engine wrote for it;
 *   - done and current marks out of order: done steps first, the current one right after them;
 *   - the state line of the progress ahead of the state the engine measured;
 *   - a shell write into the progress, the plan, the epic plan or the directory of the marks, and
 *     an edit of that directory by any tool other than the engine;
 *   - «отложено» set or lifted in the epic plan without the owner's last word naming the task;
 *   - an edit of the tree override of the description without the owner's last word naming the key;
 *   - an edit of the description, its measurers and sources or the engine outside a task whose
 *     approved plan names the path in a footprint row marked «(правится)».
 *
 * A plan without a single check line, and the plan of a branch in `words.legacyBranches`, keep the
 * done marks of the progress as they are: their steps were never measured by the engine.
 *
 * The decisions are pure: the context brings the files, the marks, the owner's last word and the
 * measured state. A shell command is judged by its text, so a script that computes the path itself
 * is not seen.
 */
import { stepsOfPlan, stepsOfProgress } from './work-steps-lib.mjs';

/** The word that defers a task in the epic plan. */
const DEFERRED = 'отложено';

/** The mark of a footprint row the task edits. */
const EDITED_ROW = '(правится)';

/** The state line of the progress. */
const STATE_LINE = /^-\s+\*\*(?:State|Состояние):\*\*\s+`([^`]+)`/mu;

/** A shell command that writes: a redirect, a tee, an in-place edit, a copy, a move, a removal or an inline script. */
const WRITE_SIGNS = [
    (path) => new RegExp(`>{1,2}\\s*["']?[^\\s;|&"']*${path}`),
    (path) => new RegExp(`\\btee\\b[^;|&]*${path}`),
    (path) => new RegExp(`\\b(?:sed|perl|awk|gawk)\\b[^;|&]*\\s-i[^;|&]*${path}`),
    (path) => new RegExp(`\\b(?:cp|mv|rm|install|rsync|truncate|touch|dd|ln)\\b[^;|&]*${path}`),
    (path) => new RegExp(`\\bgit\\s+(?:checkout|restore)\\b[^;|&]*${path}`),
    (path) => new RegExp(`\\b(?:python3?|node|ruby|perl)\\b[^;|&]*(?:\\s-[ce]\\b|\\s--eval\\b|\\s-\\s*<<)[\\s\\S]*${path}`),
];

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The shell command writes into a path matching the pattern (a regular expression source). */
export function shellWrites(command, pathSource) {
    return WRITE_SIGNS.some((sign) => sign(pathSource).test(command));
}

/** The text an edit leaves: Write gives it whole, Edit and MultiEdit replace in the text before. */
export function textAfter(call, before) {
    if (call.tool === 'Write') return call.content ?? '';
    let text = before ?? '';
    for (const edit of call.edits ?? []) {
        if (edit.replaceAll) text = text.split(edit.oldString).join(edit.newString);
        else text = text.replace(edit.oldString, () => edit.newString);
    }
    return text;
}

/** The done and current marks of the progress are in order: done steps first, the current right after. */
export function marksOutOfOrder(progress) {
    const { steps } = stepsOfProgress(progress);
    let open = false;
    for (const step of steps) {
        if (step.mark === 'x' && open) return `step ${step.number} is marked done after a step that is not done`;
        if (step.mark === '>' && open) return `step ${step.number} is marked current after a step that is not done`;
        if (step.mark !== 'x') open = true;
    }
    return null;
}

/** The steps the edit marks done that were not done before. */
export function newlyDone(before, after) {
    const was = new Set(stepsOfProgress(before ?? '').steps.filter((s) => s.mark === 'x').map((s) => s.number));
    return stepsOfProgress(after).steps.filter((s) => s.mark === 'x' && !was.has(s.number)).map((s) => s.number);
}

/** The state the progress declares, or null. */
export const declaredState = (text) => text?.match(STATE_LINE)?.[1] ?? null;

/** The task numbers of the epic plan lines whose «отложено» the edit sets or lifts. */
export function deferChanges(before, after, key) {
    const deferredTasks = (text) => {
        const tasks = new Set();
        for (const line of (text ?? '').split('\n')) {
            if (!line.includes(DEFERRED)) continue;
            for (const match of line.matchAll(new RegExp(`${escape(key)}-(\\d+)`, 'g'))) tasks.add(match[1]);
        }
        return tasks;
    };
    const was = deferredTasks(before);
    const now = deferredTasks(after);
    return [...new Set([...was, ...now])].filter((task) => was.has(task) !== now.has(task));
}

/** The keys an edit of the override changes: `key:` of every line that differs. */
export function changedKeys(before, after) {
    const lines = (text) => new Set((text ?? '').split('\n').map((line) => line.trim()).filter(Boolean));
    const was = lines(before);
    const now = lines(after);
    const changed = [...[...now].filter((line) => !was.has(line)), ...[...was].filter((line) => !now.has(line))];
    const keys = new Set();
    for (const line of changed) {
        const key = line.match(/^['"]?([A-Za-z_][\w-]*)['"]?\s*:/)?.[1];
        if (key && key !== 'reason') keys.add(key);
    }
    return { keys: [...keys], reasons: changed.filter((line) => now.has(line)).map((line) => line.match(/^reason\s*:\s*['"](.+)['"],?$/)?.[1]).filter(Boolean) };
}

/** The paths of the footprint rows marked «(правится)»: every path in backticks of such a row. */
export function editedPaths(plan) {
    const paths = [];
    for (const line of (plan ?? '').split('\n')) {
        if (!line.startsWith('|') || !line.split('|')[1]?.includes(EDITED_ROW)) continue;
        for (const match of line.matchAll(/`([^`\s]+)`/g)) paths.push(match[1]);
    }
    return paths;
}

/**
 * The path is named by a footprint path: the same file, a directory that holds it, or a bare file
 * name equal to its last part — a footprint row lists the files of one directory by name.
 */
export const namedBy = (path, paths) =>
    paths.some((named) => path === named || (named.endsWith('/') && path.startsWith(named)) || (!named.includes('/') && path.split('/').pop() === named));

/**
 * The verdict on one call: the reason of a refusal, or null.
 *
 * `call` — { tool, path, content, edits, command } with `path` relative to the root of the tree.
 * `ctx`:
 *   branch, key            the checked-out branch and the task key of the tree
 *   tasksDir, plansDir     where the task folders and the epic plans lie, relative to the root
 *   marksDir               the directory of the marks relative to the root, or an absolute path
 *   protectedPaths         patterns (regular expression sources) of the description and the engine
 *   overridePath           the tree override of the description, relative to the root
 *   legacy                 `words.legacyBranches`
 *   read(path)             the text of a file of the working copy, or null
 *   stepMark(number)       the mark of a step of the branch, or null
 *   approved()             the plan of the branch carries the approval mark
 *   ownerLast()            the owner's last word: a typed message or the chosen options of a menu
 *   stateIndex(name)       the place of a state in the scenario, or -1
 *   measured()             the index of the measured state, or null when it cannot be measured
 */
export function judgeCall(call, ctx) {
    const folder = `${ctx.tasksDir}/${ctx.branch}`;
    const progressPath = `${folder}/progress.md`;
    const planPath = `${folder}/plan.md`;
    const marks = escape(ctx.marksDir);

    if (call.tool === 'Bash') return judgeShell(call.command ?? '', ctx, marks);

    const path = call.path ?? '';
    if (path.startsWith(`${ctx.marksDir}/`) || path === ctx.marksDir) return 'the marks of the steps and of the approval are written only by the engine `task-flow-script.mjs`';
    if (path === progressPath) return judgeProgress(call, ctx, planPath);
    if (path.startsWith(`${ctx.plansDir}/`) && path.endsWith('.md')) return judgeDefer(call, ctx);
    if (path === ctx.overridePath) return judgeOverride(call, ctx);
    if (ctx.protectedPaths.some((source) => new RegExp(source).test(path))) return judgeProtected(path, ctx, planPath);
    return null;
}

function judgeShell(command, ctx, marks) {
    const engine = /task-flow-script\.mjs/.test(command);
    if (!engine && (shellWrites(command, marks) || shellWrites(command, 'rt-kit/(?:steps|approval)/'))) {
        return 'the marks of the steps and of the approval are written only by the engine `task-flow-script.mjs`, never by a shell command';
    }
    if (shellWrites(command, `${escape(ctx.tasksDir)}/[^\\s;|&]*(?:progress|plan)\\.md`) || shellWrites(command, '(?:^|[\\s/"\'])(?:progress|plan)\\.md')) {
        return 'the progress and the plan are edited by the edit tool, not by a shell command: the guard judges an edit, and a shell write passes it unseen';
    }
    if (shellWrites(command, `${escape(ctx.plansDir)}/`)) {
        return 'the epic plan is edited by the edit tool, not by a shell command: «отложено» in it needs the owner\'s word, and a shell write passes it unseen';
    }
    const written = command
        .split(/[\s;|&<>'"]+/)
        .map((token) => token.replace(/^\.\//, ''))
        .find((token) => ctx.protectedPaths.some((source) => new RegExp(source).test(token)) && shellWrites(command, escape(token)));
    if (written) return judgeProtected(written, ctx, `${ctx.tasksDir}/${ctx.branch}/plan.md`);
    if (shellWrites(command, escape(ctx.overridePath))) return 'the override of the description is edited by the edit tool, and only by the owner\'s word naming the key';
    return null;
}

function judgeProgress(call, ctx, planPath) {
    const before = ctx.read(call.path);
    const after = textAfter(call, before);
    const order = marksOutOfOrder(after);
    if (order) return `${order}: done steps go first, and the one current step right after them`;

    // The plan as the commit that added it wrote it: a plan stripped of its checks in the working copy
    // lifts nothing. Before that commit there is no approved plan, and the working copy is all there is.
    const plan = (ctx.committed ? ctx.committed(planPath) : null) ?? ctx.read(planPath);
    const legacy = ctx.legacy.includes(ctx.branch) || stepsOfPlan(plan ?? '').every((step) => step.command === null);
    if (!legacy) {
        const marked = newlyDone(before, after);
        if (marked.length > 0) {
            return `step ${marked.join(', ')} is marked done after its check matched, by \`node tools/task-flow-script.mjs step ${marked[0]}\` itself: a hand mark is refused whatever mark lies on disk`;
        }
    }

    const state = declaredState(after);
    if (state && state !== declaredState(before)) {
        const declared = ctx.stateIndex(state);
        const measured = ctx.measured();
        if (declared >= 0 && measured !== null && declared > measured) {
            return `the state \`${state}\` is ahead of the measured one: the engine measures the branch below it — \`node tools/task-flow-script.mjs measure\` names the exit that is not met`;
        }
    }
    return null;
}

function judgeDefer(call, ctx) {
    const before = ctx.read(call.path);
    const changed = deferChanges(before, textAfter(call, before), ctx.key);
    if (changed.length === 0) return null;
    const word = ctx.ownerLast() ?? '';
    const missing = changed.filter((task) => !new RegExp(`${escape(ctx.key)}-${task}(?!\\d)`).test(word));
    if (missing.length === 0) return null;
    return `«${DEFERRED}» for ${missing.map((task) => `${ctx.key}-${task}`).join(', ')} is set and lifted only by the owner's last word naming that task`;
}

function judgeOverride(call, ctx) {
    const before = ctx.read(call.path);
    const { keys, reasons } = changedKeys(before, textAfter(call, before));
    const word = ctx.ownerLast() ?? '';
    const unnamed = keys.filter((key) => !word.includes(key));
    if (keys.length === 0 || unnamed.length > 0) {
        return `the override of the description is edited only by the owner's last word naming the key it changes${unnamed.length ? `: ${unnamed.join(', ')}` : ''}`;
    }
    const unquoted = reasons.filter((reason) => !word.includes(reason));
    if (unquoted.length > 0) return `the reason of a removed key is a quote of the owner's last word: «${unquoted[0]}» is not in it`;
    return null;
}

function judgeProtected(path, ctx, planPath) {
    const approved = ctx.legacy.includes(ctx.branch) || ctx.approved();
    if (approved && namedBy(path, editedPaths(ctx.read(planPath)))) return null;
    return `${path} belongs to the description of the task flow and its engine: it is edited only in a task whose approved plan names it in a footprint row marked «${EDITED_ROW}»`;
}
