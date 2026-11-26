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
const WRAPPERS = new Set(['timeout', 'stdbuf', 'exec', 'command', 'nice', 'env', 'nohup']);
const PRINTERS = new Set(['echo', 'printf', 'cat', 'head', 'tail', 'awk', 'sed', 'grep', 'egrep', 'cut', 'jq', 'sort', 'uniq', 'comm', 'tr', 'wc', 'column', 'diff', 'ls', 'stat', 'date', 'du']);
const LEAVES = new Set(['break', 'exit', 'return']);

/** The command with the body of `sh -c '…'` put in its place. */
const unwrapped = (command) => String(command ?? '').replace(/\b(?:ba|z)?sh\s+-c\s+(?:'([^']*)'|"((?:\\.|[^"])*)")/g, (all, one, two) => `; ${one ?? two} ;`);

/** The unwrapped command with `$(…)` and backquoted parts taken out: what they print is a value, not an event. */
const flattened = (command) => {
    let text = unwrapped(command).replace(/`[^`]*`/g, ' ');
    for (let before = ''; before !== text; ) {
        before = text;
        text = text.replace(/\$\([^()]*\)/g, ' ');
    }
    return text;
};

/** Statements as lists of pipeline segments, split on unquoted `;`, `&`, `&&`, `||`, new lines and `|`; `cond` — after `&&` or `||`. */
function statementsOf(command) {
    const statements = [];
    let segments = [];
    let word = '';
    let quote = null;
    let cond = false;
    const cut = () => {
        segments.push(word.trim());
        word = '';
    };
    const end = (next = false) => {
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
        else if (c === ';' || c === '\n') end();
        else if ((c === '&' || c === '|') && command[i + 1] === c) {
            end(true);
            i++;
        } else if (c === '&' && command[i - 1] !== '>' && command[i + 1] !== '>') end();
        else if (c === '|' && command[i - 1] !== '>') cut();
        else word += c;
    }
    end();
    return statements;
}

/** The words of a segment; a `(` or `{` stuck to the first word stands apart. */
const wordsOf = (segment) => (segment.match(/'[^']*'|"(?:\\.|[^"])*"|\S+/g) ?? []).flatMap((w, i) => (i === 0 && /^[({]./.test(w) ? [w[0], w.slice(1)] : [w]));
/** The first word past the keywords that only open a statement: `while` of `then while`, `done` of `} done`. */
const headOf = (segment) => wordsOf(segment ?? '').find((w) => !OPENERS.has(w)) ?? '';

/** The words of the command a segment runs: past the keywords, the loop words and the wrappers with their options. */
function bare(segment) {
    const words = wordsOf(segment);
    while (words.length > 1 && (OPENERS.has(words[0]) || LOOP_OPEN.has(words[0]))) words.shift();
    while (words.length > 1 && WRAPPERS.has(words[0])) {
        words.shift();
        while (words.length > 1 && /^-|^\d+(?:\.\d+)?[smhd]?$|^\w+=/.test(words[0])) words.shift();
    }
    return words;
}

const follows = (words) => words[0] === 'tail' && words.slice(1).some((w) => /^-[a-zA-Z0-9]*[fF][a-zA-Z0-9]*$|^--follow(=|$)/.test(w));
const oneLine = (words) =>
    (words[0] === 'grep' && words.some((w, i) => /^-[a-zA-Z]*q[a-zA-Z]*$|^--quiet$|^-[a-zA-Z]*m1$|^--max-count=1$/.test(w) || (/^-[a-zA-Z]*m$/.test(w) && words[i + 1] === '1'))) ||
    (words[0] === 'head' && words.some((w, i) => /^-1$|^-n1$/.test(w) || (w === '-n' && words[i + 1] === '1')));

/** Whether the last segment of a pipeline prints to the event stream. */
function prints(segments) {
    const words = bare(segments[segments.length - 1]);
    const name = words[0] ?? '';
    if (!PRINTERS.has(name)) return false;
    if (words.some((w) => /^\d?>{1,2}(?!&)/.test(w) && !/^\d?>{1,2}&?\/dev\/stderr$/.test(w))) return false;
    if ((name === 'grep' || name === 'egrep') && words.some((w) => /^-[a-zA-Z]*q|^--quiet$/.test(w))) return false;
    if (name === 'sed' && words.some((w) => /^-[a-zA-Z]*i/.test(w))) return false;
    return true;
}

/**
 * Whether the branch of a print leaves the loop: a `break`, `exit` or `return` stands after it before the branch
 * closes, unconditional or chained to the print itself; nested `if`, loops and `case` are stepped over.
 */
function leavesAfter(statements, index) {
    let nest = 0;
    for (let j = index + 1; j < statements.length; j++) {
        for (const word of wordsOf(statements[j][0])) {
            if (word === 'if' || word === 'case' || word === '{' || word === '(' || LOOP_OPEN.has(word)) nest++;
            else if (/^(?:fi|done|esac|\}|\))[)}]*$/.test(word)) {
                if (nest-- === 0) return false;
            } else if (word === 'else' || word === 'elif') {
                if (nest === 0) return false;
            } else if (!OPENERS.has(word)) {
                if (nest === 0 && LEAVES.has(word)) return !statements[j].cond || j === index + 1;
                break;
            }
        }
    }
    return false;
}

/**
 * Whether the command prints a line on every step: it follows a file with no one-line stop after it in
 * its pipeline, or a print stands in a loop body and its branch does not leave the loop.
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
        if (depth > 0 && !closes && prints(segments) && !leavesAfter(statements, index)) return true;
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

/** A word as a path in one form: `~` put in, relative to `dir`, `/private` and `/./` taken out; null for no path. */
function pathOf(word, dir, home) {
    let path = String(word).replace(/^["']|["']$/g, '').replace(/^~(?=\/|$)/, home || '~');
    if (!path || path.includes('$') || path.startsWith('-') || path.startsWith('~')) return null;
    if (!isAbsolute(path)) {
        if (!dir) return null;
        path = join(dir, path);
    }
    return normalize(path).replace(/^\/private(?=\/(?:tmp|var|etc)\/)/, '').replace(/\/+$/, '');
}

/** The directory relative words of a command stand in: a leading `cd` moves it, any other `cd` leaves it unknown. */
function dirOf(text, cwd, home) {
    const lead = text.match(/^\s*cd\s+("[^"]*"|'[^']*'|[^\s;&|]+)\s*(?:&&|;)([\s\S]*)$/);
    if (lead) return /\bcd\s/.test(lead[2]) ? null : pathOf(lead[1], cwd, home);
    return /(?:^|[\s;&|(])cd\s/.test(text) ? null : cwd || null;
}

/** The files a task command writes: the targets of `>`, `>>`, `2>`, `&>` and `tee`, past heredoc bodies and `'…'`. */
function writes(command, env, cwd) {
    const text = substituted(String(command ?? '').replace(/<<-?\s*(['"]?)(\w+)\1([^\n]*)\n[\s\S]*?\n[ \t]*\2[ \t]*(?=\n|$)/g, ' $3').replace(/'[^']*'/g, ' '), env, cwd);
    const dir = dirOf(text, cwd, env.HOME);
    return [...text.matchAll(/(?:^|[^=<>&\-\w])(?:\d|&)?>{1,2}(?![&>])\s*("[^"]*"|[^\s;&|<>()"]+)|\btee\s+(?:-\w+\s+)*("[^"]*"|[^\s;&|<>()"]+)/g)]
        .map((m) => (m[1] ?? m[2]).replace(/^"|"$/g, ''))
        .filter((file) => !file.startsWith('/dev/') && (file.includes('/') || /\.\w+$/.test(file)))
        .map((file) => pathOf(file, dir, env.HOME));
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
