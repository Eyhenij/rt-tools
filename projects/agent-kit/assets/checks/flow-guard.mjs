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
 * One edit it names as the owner's decision, and the decision table answers it with the window: a
 * replacement line of the progress added or changed. The engine reads no quote after that: the
 * allowed edit is the owner's word. «шаг владельца» set on a row of the epic plan is refused outright.
 *
 * A plan without a single check line, and the plan of a branch in `words.legacyBranches`, keep the
 * done marks of the progress as they are: their steps were never measured by the engine.
 *
 * The decisions are pure: the context brings the files, the marks, the owner's last word and the
 * measured state. A shell command is refused only when it writes to a guarded file: a read, a run of
 * the engine and a file name inside the text of a message pass. A write to a literal path is judged
 * by the path; a write whose target is not a literal path — a variable, a substitution, a directory
 * that holds guarded files, a script with a write call — is refused when the command names the file.
 */
import { posix } from 'node:path';

import { stepsOfPlan, stepsOfProgress } from './work-steps-lib.mjs';

/** The word that defers a task in the epic plan. */
const DEFERRED = 'отложено';

/** The words an epic plan row carried for a task handed to the owner: a row is no longer marked so. */
const OWNER_STEP = 'шаг владельца';

/** The opening of a replacement line of the progress, with the number of the step. */
const REPLACEMENT_START = /^-\s+\*\*(?:Проверка шага|Check of step)\s+(\d+\.\d+)\s+(?:заменена|replaced):\*\*/u;

/** The mark of a footprint row the task edits. */
const EDITED_ROW = '(правится)';

/** The state line of the progress. */
const STATE_LINE = /^-\s+\*\*(?:State|Состояние):\*\*\s+`([^`]+)`/mu;

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** A literal path under the temporary directories: a scratch copy, never a file of the tree. */
const TEMP = /^\/(?:private\/)?(?:tmp|var\/folders)(?:\/|$)/;
/** A word the shell still expands: a variable, a substitution, a glob or a brace list. */
const DYNAMIC = /[$`*?[{]/;
/** The words before a command that only run it. */
const PREFIXES = new Set(['if', 'then', 'else', 'elif', 'do', 'while', 'until', '!', '{', 'time', 'nohup', 'command', 'exec', 'sudo', 'nice', 'env', 'timeout', 'xargs']);
/** A call of a script that writes a file. `open` writes by its mode, which is read in the text itself. */
const WRITE_CALL =
    /\b(?:writeFileSync|appendFileSync|writeFile|appendFile|createWriteStream|copyFileSync|copyFile|cpSync|renameSync|rmSync|unlinkSync|truncateSync|symlinkSync|fs\.(?:promises\.)?(?:rm|unlink|truncate|cp|rename)|os\.(?:rename|replace|remove|unlink)|shutil\.\w+|File\.write)\s*\(|\.write_(?:text|bytes)\s*\(/;
/** A script file run by its interpreter: the file it runs is not named by the command. */
const RUN = /\b(node|python[\d.]*|bash|sh|zsh)\s+((?:-[-\w=]+\s+)*)[^\s;|&'"]+\.(?:mjs|cjs|js|py|sh)\b/g;

/** The index of the bracket that closes the one at `at`, quotes skipped. */
function closing(text, at) {
    let depth = 0;
    for (let i = at; i < text.length; i++) {
        if (text[i] === '\\') i++;
        else if ("'\"`".includes(text[i])) i = text.indexOf(text[i], i + 1) < 0 ? text.length : text.indexOf(text[i], i + 1);
        else if (text[i] === '(') depth++;
        else if (text[i] === ')' && --depth === 0) return i;
    }
    return text.length;
}

/**
 * The simple commands of a shell text, quotes taken off: { words, redirects, stdin }. A word keeps
 * `$NAME` and `$(…)` as written; a here-document and a here-string are the stdin of their command.
 */
export function shellCommands(text) {
    const commands = [];
    const docs = [];
    let cmd = { words: [], redirects: [], stdin: null };
    let word = null;
    let pending = null;
    const endWord = () => {
        if (word === null) return;
        if (pending === '<<' || pending === '<<-') docs.push({ delim: word, strip: pending === '<<-', cmd });
        else if (pending === '<<<') cmd.stdin = word;
        else if (pending === '>') cmd.redirects.push(word);
        else if (pending !== '<') cmd.words.push(word);
        [pending, word] = [null, null];
    };
    const endCommand = () => {
        endWord();
        if (cmd.words.length || cmd.redirects.length) commands.push(cmd);
        cmd = { words: [], redirects: [], stdin: null };
    };
    for (let i = 0; i < text.length; ) {
        const c = text[i];
        if (c === '\\') {
            if (text[i + 1] !== '\n') word = (word ?? '') + (text[i + 1] ?? '');
            i += 2;
        } else if (c === "'" || c === '"' || (c === '$' && text[i + 1] === "'")) {
            // A double-quoted `$(…)` is kept whole: its own quotes do not end the word.
            const from = c === '$' ? i + 2 : i + 1;
            let j = from;
            while (j < text.length && text[j] !== text[from - 1]) j = c === '"' && text[j] === '\\' ? j + 2 : c === '"' && text.startsWith('$(', j) ? closing(text, j + 1) + 1 : j + 1;
            word = (word ?? '') + (c === '"' ? text.slice(from, j).replace(/\\(["\\$`])/g, '$1') : text.slice(from, j));
            i = j + 1;
        } else if (text.startsWith('$(', i) || c === '`') {
            const end = c === '`' ? text.indexOf('`', i + 1) : closing(text, i + 1);
            word = (word ?? '') + text.slice(i, end < 0 ? text.length : end + 1);
            i = end < 0 ? text.length : end + 1;
        } else if (c === '#' && word === null) {
            while (i < text.length && text[i] !== '\n') i++;
        } else if (c === '\n') {
            endCommand();
            i++;
            for (const doc of docs.splice(0)) {
                const end = new RegExp(`^${doc.strip ? '\\t*' : ''}${escape(doc.delim)}$`, 'm').exec(text.slice(i)) ?? { index: text.length - i, 0: '' };
                doc.cmd.stdin = text.slice(i, i + end.index).replace(/\n$/, '');
                i += end.index + end[0].length + 1;
            }
        } else if (c === ' ' || c === '\t') {
            endWord();
            i++;
        } else if (';|&()'.includes(c) && !(c === '&' && text[i + 1] === '>')) {
            endCommand();
            i += text[i + 1] === c && c !== '(' && c !== ')' ? 2 : 1;
        } else if (c === '>' || c === '<' || c === '&') {
            if (word !== null && /^\d+$/.test(word)) word = null;
            endWord();
            const op = text.slice(i).match(/^(?:<<<|<<-|<<|<|&?>>|&?>\|?)/)[0];
            i += op.length;
            if (text[i] === '(') i = closing(text, i) + 1;
            else if (op.endsWith('>') && text[i] === '&') for (i++; /[\d-]/.test(text[i] ?? ''); ) i++;
            else pending = op.includes('>') ? '>' : op;
        } else {
            word = (word ?? '') + c;
            i++;
        }
    }
    endCommand();
    return commands;
}

/** The script has a call that writes a file, its string literals blanked so a quoted call is not one. */
function scriptWrites(script) {
    const code = script.replace(/'''[\s\S]*?'''|"""[\s\S]*?"""|`(?:\\[\s\S]|[^\\`])*`|'(?:\\.|[^\\'\n])*'|"(?:\\.|[^\\"\n])*"/g, (text) => text.replace(/[^\n]/g, ' '));
    if (WRITE_CALL.test(code)) return true;
    // `open(p, 'w')` of Python and Node, `open(F, '>…')` of Perl: the mode stands on the line of the call.
    return [...code.matchAll(/(?<![\w.])open(?:Sync)?\s*\(/g)].some((call) => /,\s*(?:mode\s*=\s*)?['"][^'"]*[wax+>]/.test(script.slice(call.index).split('\n')[0]));
}

/** The text a runner runs: an inline script, its stdin, or a file the same command wrote; null otherwise. */
function scriptOf(args, command, state) {
    for (let k = 0; k < args.length; k++) {
        if (['-c', '-e', '--eval', '-p', '--print'].includes(args[k])) return args[k + 1] ?? '';
        if (args[k] === '-m') return null;
        if (['-W', '-X', '-r', '--require', '--import', '--loader'].includes(args[k])) k++;
        else if (args[k] === '-') return command.stdin ?? '';
        else if (!args[k].startsWith('-')) return state.written.get(args[k]) ?? null;
    }
    return command.stdin;
}

/** The files one command of the shell writes, by its name. */
function commandTargets(words, command, state, out, depth) {
    while (words.length > 0 && (PREFIXES.has(words[0]) || /^\w+=/.test(words[0]))) {
        if (words.shift() === 'timeout') words.splice(0, words.findIndex((word) => !word.startsWith('-')) + 1);
        while (words[0]?.startsWith('-')) words.shift();
    }
    const [head = '', ...args] = words;
    const name = posix.basename(head);
    const operands = args.filter((arg) => !arg.startsWith('-'));
    const recursive = args.some((arg) => /^-[a-zA-Z]*[rRa]|^--(?:recursive|archive)$/.test(arg));
    // A relative path after a `cd` into a temporary directory lies there too.
    const add = (word, dir = false) => {
        if (DYNAMIC.test(word)) out.push({ built: word });
        else if (!state.away || word.startsWith('/')) out.push(dir ? { dir: posix.normalize(word) } : { path: posix.normalize(word) });
    };
    for (const word of command.redirects) {
        add(word);
        if (command.stdin !== null) state.written.set(word, command.stdin);
    }
    if (name === 'cd' || name === 'pushd') {
        if (/^\/[^$`*?[{]*$/.test(operands[0] ?? '')) state.away = TEMP.test(operands[0]);
    } else if (/^(?:g?sed|perl|ruby|g?awk)$/.test(name) && args.some((arg) => /^-[a-zA-Z0-9]*i|^--in-place|^inplace$/.test(arg))) {
        // An in-place edit writes the files after its script: the value of `-e` or the first operand.
        const files = args.filter((arg, k) => arg !== '' && arg !== 'inplace' && !arg.startsWith('-') && !['-e', '-f'].includes(args[k - 1]));
        (args.includes('-e') || args.includes('-f') ? files : files.slice(1)).forEach((word) => add(word));
    } else if (['cp', 'mv', 'install', 'ln', 'rsync'].includes(name) && operands.length > 1) {
        const dest = operands.at(-1);
        const sources = operands.slice(0, -1);
        if (name === 'mv') sources.forEach((word) => add(word));
        if (recursive || name === 'rsync') add(dest, true);
        if (dest.endsWith('/') || sources.length > 1) sources.forEach((word) => add(`${dest.replace(/\/$/, '')}/${posix.basename(word)}`));
        else add(dest);
    } else if (['tee', 'rm', 'unlink', 'truncate', 'touch', 'shred', 'rmdir'].includes(name)) {
        operands.forEach((word) => add(word) || (recursive && add(word, true)));
    } else if (name === 'git') {
        let k = 0;
        while (args[k]?.startsWith('-')) k += args[k] === '-C' || args[k] === '-c' ? 2 : 1;
        const [sub, ...rest] = args.slice(k);
        const paths = rest.includes('--') ? rest.slice(rest.indexOf('--') + 1) : rest.filter((arg, j) => !arg.startsWith('-') && !['-s', '--source', '-b', '-B', '-m', '-F'].includes(rest[j - 1]));
        const staged = rest.some((arg) => arg === '--staged' || arg === '-S') && !rest.some((arg) => arg === '--worktree' || arg === '-W');
        if ((sub === 'checkout' && !rest.some((arg) => /^-[bB]$|^--orphan$/.test(arg))) || (sub === 'restore' && !staged)) paths.forEach((word) => add(word));
        else if ((sub === 'rm' && !rest.includes('--cached')) || sub === 'mv') commandTargets([sub, ...rest], { ...command, redirects: [] }, state, out, depth);
    } else if (/^(?:python[\d.]*|node|nodejs|ruby|perl|deno|bun|bash|sh|zsh|eval)$/.test(name) && depth < 3) {
        const script = name === 'eval' ? args.join(' ') : scriptOf(args, command, state);
        if (script !== null && /^(?:bash|sh|zsh|eval)$/.test(name)) out.push(...shellTargets(script, depth + 1, state));
        else if (script !== null && !state.away && scriptWrites(script)) out.push({ built: `a script of ${name}` });
    }
}

/** What a shell text writes: `{ path }` literal, `{ dir }` a directory written under, `{ built }` anything else. */
export function shellTargets(text, depth = 0, state = { written: new Map(), away: false }) {
    const out = [];
    for (const command of shellCommands(text)) commandTargets(command.words.slice(), command, state, out, depth);
    return out;
}

/** Every tail of a path after a slash: a path of the tree may be written from any directory above it. */
const tails = (path) => path.split('/').map((_, k, parts) => parts.slice(k).join('/')).filter(Boolean);

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

/** The lines of the text after the edit that match the sign and did not stand in the text before. */
const newLines = (before, after, sign) => {
    const was = new Set((before ?? '').split('\n').map((line) => line.trim()));
    return (after ?? '').split('\n').filter((line) => sign(line) && !was.has(line.trim()));
};

/**
 * The step numbers whose replacement line the edit adds or changes. A removed line is not counted:
 * dropping a replacement gives the check of the plan back and needs no word of the owner.
 */
export function replacementChanges(before, after) {
    return [...new Set(newLines(before, after, (line) => REPLACEMENT_START.test(line)).map((line) => line.match(REPLACEMENT_START)[1]))];
}

/**
 * The task numbers of the epic plan rows the edit marks «шаг владельца». The mark is refused: the
 * step is the executor's. A row that leaves the mark is not counted: the task goes back to the work.
 */
export function ownerRowChanges(before, after, key) {
    const marked = (text) => new RegExp(`\\|\\s*${OWNER_STEP}[^|]*\\|?\\s*$`, 'u').test(text);
    const numbers = (line) => [...line.matchAll(new RegExp(`${escape(key)}-(\\d+)`, 'g'))].map((match) => match[1]);
    // A row that carried the mark before the edit is a legacy row: its other cells may be edited.
    const legacy = new Set((before ?? '').split('\n').filter(marked).flatMap(numbers));
    const tasks = new Set();
    for (const line of newLines(before, after, marked)) {
        for (const task of numbers(line)) if (!legacy.has(task)) tasks.add(task);
    }
    return [...tasks];
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

    if (call.tool === 'Bash') return judgeShell(call.command ?? '', ctx);

    const path = call.path ?? '';
    if (path.startsWith(`${ctx.marksDir}/`) || path === ctx.marksDir) return 'the marks of the steps and of the approval are written only by the engine `task-flow-script.mjs`';
    if (ctx.isRecord && ctx.isRecord(path)) return 'the session records are written only by the harness: an approval is read from them, and a hand write would forge it';
    if (path === progressPath) return judgeProgress(call, ctx, planPath);
    if (path.startsWith(`${ctx.plansDir}/`) && path.endsWith('.md')) return judgeDefer(call, ctx);
    if (path === ctx.overridePath) return judgeOverride(call, ctx);
    if (ctx.protectedPaths.some((source) => new RegExp(source).test(path))) return judgeProtected(path, ctx, planPath);
    return null;
}

/** The guarded files of a shell command: the tail of a path that is one, their directories, the sign of their name. */
function shellGuards(ctx) {
    const marks = posix.normalize(ctx.marksDir);
    const engine = (tail) => ctx.protectedPaths.some((source) => new RegExp(source).test(tail));
    const inTree = (test) => (path) => (TEMP.test(path) ? null : (tails(path).find(test) ?? null));
    const shell = 'by the edit tool, not by a shell command';
    return [
        [
            inTree((tail) => tail.startsWith(`${marks}/`) || /^rt-kit\/(?:steps|approval)(?:\/|$)/.test(tail)),
            [marks],
            (text) => new RegExp(`rt-kit/(?:steps|approval)|${escape(marks)}`).test(text),
            () => 'the marks of the steps and of the approval are written only by the engine `task-flow-script.mjs`, never by a shell command',
        ],
        [
            (path) => (/\.claude\/projects\/.*\.jsonl$/.test(path) ? path : null),
            [],
            (text) => /\.claude\/projects\//.test(text) && /\.jsonl\b/.test(text),
            () => 'the session records are written only by the harness, never by a shell command: an approval is read from them',
        ],
        [
            inTree((tail) => /^(?:progress|plan)\.md$/.test(tail)),
            [ctx.tasksDir],
            (text) => /(?:^|[^\w.-])(?:progress|plan)\.md(?![\w.-])/.test(text),
            () => `the progress and the plan are edited ${shell}: the guard judges an edit, and a shell write passes it unseen`,
        ],
        [
            inTree((tail) => tail.startsWith(`${ctx.plansDir}/`)),
            [ctx.plansDir],
            (text) => new RegExp(`(?:^|[^\\w.-])${escape(ctx.plansDir)}/`).test(text),
            () => `the epic plan is edited ${shell}: «отложено» in it needs the owner's word, and a shell write passes it unseen`,
        ],
        [
            inTree(engine),
            ctx.protectedPaths.map((source) => source.replace(/^\^|^\(\?:\^\|\/\)/, '').match(/^[\w./-]*/)[0].replace(/\/?[^/]*$/, '')),
            (text) => text.split(/[\s;|&<>'"()=,`{}]+/).flatMap((token) => tails(token.replace(/^\.\//, ''))).find(engine),
            (path) => judgeProtected(path, ctx, `${ctx.tasksDir}/${ctx.branch}/plan.md`),
        ],
        [
            inTree((tail) => tail === ctx.overridePath),
            [posix.dirname(ctx.overridePath)],
            (text) => text.includes(ctx.overridePath),
            () => `the override of the description is edited ${shell}, and only by the owner's word naming the key`,
        ],
    ];
}

/**
 * A shell command is refused only when it writes to a guarded file: a literal target by its path, any
 * other by the command naming a guarded file — the script file an interpreter runs is not such a name.
 */
function judgeShell(command, ctx) {
    const targets = shellTargets(command);
    const text = command.replace(RUN, '$1 $2');
    const under = (dir, area) => area === '' || dir === '.' || tails(dir).some((tail) => tail === area || tail.startsWith(`${area}/`) || area.startsWith(`${tail}/`));
    for (const [holds, areas, names, reason] of shellGuards(ctx)) {
        const hit = targets.map((target) => (target.path === undefined ? null : holds(target.path))).find(Boolean);
        if (hit) return reason(hit);
        const loose = targets.some((target) => target.built !== undefined || (target.dir !== undefined && !TEMP.test(target.dir) && areas.some((area) => under(target.dir, area))));
        const named = loose && names(text);
        if (named) return reason(named);
    }
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
    const replaced = replacementChanges(before, after);
    if (replaced.length > 0) {
        return `the replacement of the check of step ${replaced.join(', ')} is the owner's decision: the owner allows or forbids this edit in the window`;
    }
    return null;
}

function judgeDefer(call, ctx) {
    const before = ctx.read(call.path);
    const after = textAfter(call, before);
    const changed = deferChanges(before, after, ctx.key);
    if (changed.length === 0) {
        const steps = ownerRowChanges(before, after, ctx.key);
        if (steps.length === 0) return null;
        return `«${OWNER_STEP}» for ${steps.map((task) => `${ctx.key}-${task}`).join(', ')} is not written into a row: the step is the executor's, and only the owner's word naming the task puts it off as «${DEFERRED}»`;
    }
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
    const fault = ctx.legacy.includes(ctx.branch) ? null : ctx.approvalFault ? ctx.approvalFault() : ctx.approved() ? null : 'there is no approval mark';
    if (!fault && namedBy(path, editedPaths(ctx.read(planPath)))) return null;
    const why = fault ? ` — ${fault}: ask the owner again and run \`node tools/task-flow-script.mjs plan-red\`` : '';
    return `${path} belongs to the description of the task flow and its engine: it is edited only in a task whose approved plan names it in a footprint row marked «${EDITED_ROW}»${why}`;
}
