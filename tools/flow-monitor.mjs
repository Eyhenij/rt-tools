// rt-kit v0.41.1 · checks/flow-monitor.mjs · b00b80a84a22 · правится надстройкой, не здесь
/**
 * Whether a `Monitor` call wakes the turn on every step of a command whose end comes as a notice anyway.
 *
 * A monitor prints a line for every step when it follows a file (`tail -f`) or prints inside a loop on
 * every round. Such a monitor over the output of a live own background task — or over a file that task's
 * command writes — doubles the notice of its end and fills the queue with lines: on 24 November 2026 14
 * of them woke the turns after the owner's stop. The decision reads no disk: the record events, the
 * environment and the working directory come as arguments.
 */
import { basename, isAbsolute, join, normalize } from 'node:path';

const LOOP_OPEN = new Set(['while', 'until', 'for', 'select']);
const OPENERS = new Set(['if', 'then', 'else', 'elif', 'do', '!', '{', '(', '}', ')', 'time']);
const WRAPPERS = new Set(['timeout', 'gtimeout', 'stdbuf', 'exec', 'command', 'nice', 'env', 'nohup', 'caffeinate']);
const PRINTERS = new Set(['echo', 'printf', 'cat', 'head', 'tail', 'awk', 'sed', 'grep', 'egrep', 'rg', 'cut', 'jq', 'sort', 'uniq', 'comm', 'tr', 'wc', 'column', 'diff', 'ls', 'stat', 'date', 'du', 'nl', 'tee', 'perl']);
const LEAVES = new Set(['break', 'exit', 'return']);
const CLOSERS = { fi: 'if', esac: 'case', done: 'loop', '}': '{', ')': '(' };

/** The command with the body of `sh -c '…'` and of `<(…)` put in their place. */
const unwrapped = (command) =>
    String(command ?? '')
        .replace(/\b(?:ba|z)?sh\s+-[a-z]*c\s+(?:'([^']*)'|"((?:\\.|[^"])*)")/g, (all, one, two) => `; ${one ?? two.replace(/\\(["\\$`])/g, '$1')} ;`)
        .replace(/<\(([^()]*)\)/g, '; $1 ;');

/** The unwrapped command with `$(…)` and backquoted parts taken out: what they print is a value, not an event. */
const flattened = (command) => {
    let text = unwrapped(command).replace(/`[^`]*`/g, ' ');
    for (let before = ''; before !== text; ) {
        before = text;
        text = text.replace(/\$\([^()]*\)/g, ' ');
    }
    return text;
};

/** Statements as lists of pipeline segments, split on unquoted `;`, `&`, `&&`, `||`, new lines and `|`; `cond` — `and` or `or` before it. */
function statementsOf(command) {
    const statements = [];
    let segments = [];
    let word = '';
    let quote = null;
    let cond = null;
    const cut = () => {
        segments.push(word.trim());
        word = '';
    };
    const end = (next = null) => {
        cut();
        if (segments.some(Boolean)) statements.push(Object.assign(segments.filter(Boolean), { cond }));
        segments = [];
        cond = next;
    };
    for (let i = 0; i < command.length; i++) {
        const c = command[i];
        if (quote) {
            if (c === quote) quote = null;
            word += c;
        } else if (c === "'" || c === '"') {
            quote = c;
            word += c;
        } else if (c === '\\') word += c + (command[++i] ?? '');
        else if (c === '#' && /(?:^|\s)$/.test(word)) while (i + 1 < command.length && command[i + 1] !== '\n') i++;
        else if (c === ';' || c === '\n') end();
        else if ((c === '&' || c === '|') && command[i + 1] === c) {
            end(c === '&' ? 'and' : 'or');
            i++;
        } else if (c === '&' && command[i - 1] !== '>' && command[i + 1] !== '>') end();
        else if (c === '|' && command[i - 1] !== '>') cut();
        else word += c;
    }
    end();
    return statements;
}

/** The words of a segment; a `(` or `{` stuck to the first word stands apart, `((` of arithmetic does not. */
const wordsOf = (segment) => (segment.match(/'[^']*'|"(?:\\.|[^"])*"|\S+/g) ?? []).flatMap((w, i) => (i === 0 && /^[({][^(]/.test(w) ? [w[0], w.slice(1)] : [w]));
/** The first word past the keywords that only open a statement: `while` of `then while`, `done` of `} done`. */
const headOf = (segment) => wordsOf(segment ?? '').find((w) => !OPENERS.has(w)) ?? '';

/** The words of the command a segment runs: past keywords, loop words, assignments and wrappers; a path to it by its name. */
function bare(segment) {
    const words = wordsOf(segment);
    while (words.length > 1 && (OPENERS.has(words[0]) || LOOP_OPEN.has(words[0]) || /^\w+=/.test(words[0]))) words.shift();
    while (words.length > 1 && WRAPPERS.has(words[0])) {
        words.shift();
        while (words.length > 1 && /^-|^\d+(?:\.\d+)?[smhd]?$|^\w+=/.test(words[0])) words.shift();
    }
    if (words[0]?.startsWith('/')) words[0] = basename(words[0]);
    return words;
}

const follows = (words) => words[0] === 'tail' && words.slice(1).some((w) => /^-[a-zA-Z0-9]*[fF][a-zA-Z0-9]*$|^--follow(=|$)/.test(w));
/** A command in a pipeline that stops it after one line: `grep -q`/`-m 1`, `head -1`, `sed …q`, `awk …exit`. */
const oneLine = ([name, ...words]) =>
    (name === 'grep' && words.some((w, i) => /^-[a-zA-Z]*q[a-zA-Z]*$|^--quiet$|^-[a-zA-Z]*m1$|^--max-count=1$/.test(w) || (/^-[a-zA-Z]*m$|^--max-count$/.test(w) && words[i + 1] === '1'))) ||
    (name === 'head' && words.some((w, i) => /^-1$|^-n1$|^--lines=1$/.test(w) || (w === '-n' && words[i + 1] === '1'))) ||
    (name === 'sed' && words.some((w) => /(?:^['"]?|[;{}/\s])q(?:[;}\s'"]|$)/.test(w))) ||
    (name === 'awk' && words.some((w) => /[;{\s]exit\b/.test(w)));

/** Whether the last segment of a pipeline prints to the event stream: `2>` leaves the output, `>`, `1>` and `&>` take it. */
function prints(segments) {
    const words = bare(segments[segments.length - 1]);
    const name = words[0] ?? '';
    if (!PRINTERS.has(name)) return false;
    if (words.some((w) => /^(?:1?|&)>{1,2}(?!&)/.test(w) && !/^1?>{1,2}\/dev\/stderr$/.test(w))) return false;
    if ((name === 'grep' || name === 'egrep') && words.some((w) => /^-[a-zA-Z]*q|^--quiet$/.test(w))) return false;
    if (name === 'sed' && words.some((w) => /^-[a-zA-Z]*i/.test(w))) return false;
    return true;
}

/**
 * Whether the round of a print leaves the loop: a `break`, `exit` or `return` follows it before the round ends —
 * unconditional, or chained to the print by `&&`. The other branch of its `if` is skipped, nested blocks are
 * stepped over, and `continue` or the `done` of the loop end the round.
 */
function leavesAfter(statements, index) {
    const open = [];
    let skip = 0;
    for (let j = index + 1; j < statements.length; j++) {
        let command = true;
        for (const word of wordsOf(statements[j][0])) {
            const closer = (command ? CLOSERS[word] : null) ?? (open.at(-1) === '(' && word.endsWith(')') && !word.endsWith('))') ? ')' : null);
            if (closer) {
                if (open.length > 0) open.pop();
                else if (closer === 'done') return false;
                else if (closer === 'if') skip = 0;
            } else if (command && (word === 'if' || word === 'case' || word === '{' || word === '(' || LOOP_OPEN.has(word))) open.push(LOOP_OPEN.has(word) ? 'loop' : word);
            else if (command && open.length === 0 && (word === 'else' || word === 'elif')) skip = 1;
            else if (command && OPENERS.has(word)) continue;
            else if (command) {
                command = false;
                if (open.length > 0 || skip) continue;
                if (word === 'continue') return false;
                if (LEAVES.has(word)) return !statements[j].cond || (statements[j].cond === 'and' && j === index + 1);
            }
        }
    }
    return false;
}

/**
 * Whether the command prints a line on every step: it follows a file with no one-line stop after it in
 * its pipeline, or a print stands in a loop body and its round does not leave the loop. The condition of
 * `until` prints once, when it holds.
 */
export function linesPerStep(command) {
    const statements = statementsOf(flattened(String(command ?? '')));
    let depth = 0;
    for (const [index, segments] of statements.entries()) {
        const head = headOf(segments[0]);
        const tailAt = segments.findIndex((segment) => follows(bare(segment)));
        if (tailAt >= 0 && !segments.slice(tailAt + 1).some((segment) => oneLine(bare(segment)))) return true;
        if (LOOP_OPEN.has(head)) depth++;
        const closes = /^done[)}]*$/.test(head);
        if (depth > 0 && !closes && head !== 'until' && prints(segments) && !leavesAfter(statements, index)) return true;
        if (closes) depth = Math.max(0, depth - 1);
    }
    return false;
}

/** The command with its own assignments, `TMPDIR`, `PWD` and `$(basename "$PWD")` put in; the quotes stay. */
function substituted(command, env, cwd) {
    const values = { TMPDIR: env.TMPDIR ?? '', PWD: cwd, HOME: env.HOME ?? '' };
    const text = String(command ?? '').replace(/\$\(\s*basename\s+["']?\$\{?PWD\}?["']?\s*\)/g, basename(cwd || '.'));
    const put = (value) =>
        value.replace(/\$\{(\w+):-([^}]*)\}|\$\{(\w+)\}|\$(\w+)/g, (all, a, fallback, b, c) => {
            const known = values[a ?? b ?? c];
            return known ? known : a !== undefined ? fallback : all;
        });
    for (const [, name, value] of text.matchAll(/(?:^|[;&|\s(])([A-Za-z_]\w*)=("[^"]*"|'[^']*'|[^\s;&|]*)/g)) {
        if (!(name in values) || name === 'TMPDIR') values[name] = put(value.replace(/^["']|["']$/g, ''));
    }
    return put(text);
}

/** A word that names a file: a slash or an extension that starts with a letter. */
const pathLike = (word) => word.includes('/') || /\.[A-Za-z]\w*$/.test(word);

/** A word as a path in one form: `~` put in, relative to `dir`, `/private` and `/./` taken out; null for no path. */
function pathOf(word, dir, home) {
    let path = String(word).replace(/^["']|["']$/g, '').replace(/^~(?=\/|$)/, home || '~');
    if (!path || path.includes('$') || path.startsWith('-') || path.startsWith('~') || !pathLike(path)) return null;
    if (!isAbsolute(path)) {
        if (!dir) return null;
        path = join(dir, path);
    }
    return normalize(path).replace(/^\/private(?=\/(?:tmp|var|etc)\/)/, '').replace(/\/+$/, '');
}

/** The directory relative words of a command stand in: a leading `cd` moves it, any other `cd` leaves it unknown. */
function dirOf(text, cwd, home) {
    const lead = text.match(/^\s*cd\s+("[^"]*"|'[^']*'|[^\s;&|]+)\s*(?:&&|;)([\s\S]*)$/);
    if (lead) return /\bcd\s/.test(lead[2]) ? null : pathOf(`${lead[1].replace(/^["']|["']$/g, '')}/`, cwd, home);
    return /(?:^|[\s;&|(])cd\s/.test(text) ? null : cwd || null;
}

const TARGET = String.raw`"[^"]*"|'[^']*'|[^\s;&|<>()"']+`;

/** The files a task command writes: the targets of `>`, `>>`, `2>`, `&>` and of every file of `tee`, past heredoc bodies and quoted code. */
function writes(command, env, cwd) {
    const code = unwrapped(command)
        .replace(/<<-?\s*(['"]?)(\w+)\1([^\n]*)\n[\s\S]*?\n[ \t]*\2[ \t]*(?=\n|$)/g, ' $3')
        .replace(/'[^']*'/g, (quoted) => (/[\s{}();]/.test(quoted) ? ' ' : quoted));
    const text = substituted(code, env, cwd);
    const dir = dirOf(text, cwd, env.HOME);
    const redirects = [...text.matchAll(new RegExp(String.raw`(?:^|[^=<>&\-])(?:\d|&)?>{1,2}(?![&>])\s*(${TARGET})`, 'g'))].map((m) => m[1]);
    const tees = [...text.matchAll(new RegExp(String.raw`\btee((?:\s+(?:${TARGET}))+)`, 'g'))].flatMap((m) => m[1].match(new RegExp(TARGET, 'g')).filter((w) => !w.startsWith('-')));
    return [...redirects, ...tees].filter((file) => !/^["']?\/dev\//.test(file)).map((file) => pathOf(file, dir, env.HOME));
}

/**
 * The live own background task the command follows, `{ task, file }` or null: a Bash task with no end and
 * a Bash call in the background with no result yet, whose output file or written file the command names
 * as a whole path.
 */
export function followedTask(command, events, env = {}, cwd = '') {
    const ended = new Set();
    const tasks = [];
    for (const event of events ?? []) {
        if (event.kind === 'backgroundEnd' && event.task) ended.add(String(event.task));
        else if (event.kind === 'background' && !event.agent && event.task) tasks.push({ task: String(event.task), output: event.output, command: event.command, id: event.id });
        else if (event.kind === 'call' && event.name === 'Bash' && event.input?.run_in_background && event.doneAt === undefined) tasks.push({ task: event.id, output: null, command: event.input.command, id: event.id });
    }
    const started = new Set(tasks.filter((t) => t.task !== t.id).map((t) => t.id));
    const text = substituted(unwrapped(command), env, cwd);
    const dir = dirOf(text, cwd, env.HOME);
    const named = new Set((text.match(/"[^"]*"|'[^']*'|[^\s;&|<>()]+/g) ?? []).map((word) => pathOf(word.replace(/^[-\w]*=/, ''), dir, env.HOME)).filter(Boolean));
    for (const task of tasks.reverse()) {
        if (ended.has(task.task) || (task.task === task.id && started.has(task.id))) continue;
        const files = [task.output ? pathOf(task.output, cwd, env.HOME) : null, ...writes(task.command, env, cwd)].filter(Boolean);
        const file = files.find((f) => named.has(f));
        if (file) return { task: task.task, file };
    }
    return null;
}

/** The verdict on a `Monitor` call: `{ refuse, task, file }`. */
export function monitorVerdict(command, events, env = {}, cwd = '') {
    const followed = linesPerStep(command) ? followedTask(command, events, env, cwd) : null;
    return { refuse: followed !== null, task: followed?.task ?? null, file: followed?.file ?? null };
}
