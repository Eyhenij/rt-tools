/**
 * Whether a `Monitor` call wakes the turn on every step of a command whose end comes as a notice anyway.
 *
 * A monitor prints a line for every step when it follows a file (`tail -f`) or prints inside a loop on
 * every round. Such a monitor over the output of a live own background task — or over a file that task's
 * command writes — doubles the notice of its end and fills the queue with lines: on 24 November 2026 14
 * of them woke the turns after the owner's stop. The decision reads no disk: the record events, the
 * environment and the working directory come as arguments.
 */
import { basename } from 'node:path';

const LOOP_OPEN = new Set(['while', 'until', 'for', 'select']);
const LEADING = new Set(['if', 'then', 'else', 'elif', 'do', 'while', 'until', '!', '{', '(', 'time']);
const PRINTERS = new Set(['echo', 'printf', 'cat', 'head', 'tail', 'awk', 'sed', 'grep', 'egrep', 'cut', 'jq', 'sort', 'uniq', 'comm', 'tr', 'wc', 'column', 'diff']);
const LEAVES = new Set(['break', 'exit', 'return']);

/** The command with every `$(…)` and backquoted part taken out: what they print is a value, not an event. */
const withoutSubstitutions = (command) => {
    let text = command.replace(/`[^`]*`/g, ' ');
    for (let before = ''; before !== text; ) {
        before = text;
        text = text.replace(/\$\([^()]*\)/g, ' ');
    }
    return text;
};

/** Statements as lists of pipeline segments, split on unquoted `;`, `&`, `&&`, `||`, new lines and `|`. */
function statementsOf(command) {
    const statements = [];
    let segments = [];
    let word = '';
    let quote = null;
    const cut = () => {
        segments.push(word.trim());
        word = '';
    };
    const end = () => {
        cut();
        if (segments.some(Boolean)) statements.push(segments.filter(Boolean));
        segments = [];
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
            end();
            i++;
        } else if (c === '&' && command[i - 1] !== '>' && command[i + 1] !== '>') end();
        else if (c === '|' && command[i - 1] !== '>') cut();
        else word += c;
    }
    end();
    return statements;
}

const wordsOf = (segment) => segment.match(/'[^']*'|"(?:\\.|[^"])*"|\S+/g) ?? [];

/** The words of a segment past the shell keywords and braces that only open it. */
function bare(segment) {
    const words = wordsOf(segment);
    while (words.length > 1 && (LEADING.has(words[0]) || words[0] === '}')) words.shift();
    return words;
}

const follows = (words) => words[0] === 'tail' && words.slice(1).some((w) => /^-[a-zA-Z]*[fF][a-zA-Z]*$|^--follow(=|$)/.test(w));
const oneLine = (words) => (words[0] === 'grep' && words.some((w) => /^-(?:[a-zA-Z]*[qm]|-quiet|-max-count)/.test(w))) || (words[0] === 'head' && words.some((w, i) => /^-1$|^-n1$/.test(w) || (w === '-n' && words[i + 1] === '1')));

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
 * Whether the command prints a line on every step: it follows a file with no one-line stop after it in
 * its pipeline, or a print stands in a loop body and the next statement does not leave the loop.
 */
export function linesPerStep(command) {
    const statements = statementsOf(withoutSubstitutions(String(command ?? '')));
    let depth = 0;
    for (const [index, segments] of statements.entries()) {
        const first = wordsOf(segments[0]);
        const tailAt = segments.findIndex((segment) => follows(bare(segment)));
        if (tailAt >= 0 && !segments.slice(tailAt + 1).some((segment) => oneLine(bare(segment)))) return true;
        if (LOOP_OPEN.has(first[0])) depth++;
        const closes = first[0] === 'done' || first.includes('done');
        if (depth > 0 && !closes && prints(segments)) {
            const next = statements[index + 1] ? bare(statements[index + 1][0]) : [];
            if (!LEAVES.has(next[0])) return true;
        }
        if (closes) depth = Math.max(0, depth - 1);
    }
    return false;
}

/** The command with its own assignments, `TMPDIR`, `PWD` and `$(basename "$PWD")` put in, and no quotes. */
export function expanded(command, env = {}, cwd = '') {
    const values = { TMPDIR: env.TMPDIR ?? '', PWD: cwd };
    let text = String(command ?? '').replace(/\$\(\s*basename\s+["']?\$\{?PWD\}?["']?\s*\)/g, basename(cwd || '.'));
    const put = (value) =>
        value.replace(/\$\{(\w+):-([^}]*)\}|\$\{(\w+)\}|\$(\w+)/g, (all, a, fallback, b, c) => {
            const name = a ?? b ?? c;
            const known = values[name];
            return known ? known : a !== undefined ? fallback : all;
        });
    for (const [, name, value] of text.matchAll(/(?:^|[;&|\s(])([A-Za-z_]\w*)=("[^"]*"|'[^']*'|[^\s;&|]*)/g)) {
        if (!(name in values) || name === 'TMPDIR') values[name] = put(value.replace(/^["']|["']$/g, ''));
    }
    text = put(text);
    return text.replace(/["']/g, '').replace(/\/{2,}/g, '/');
}

/** The files a command writes: the targets of `>`, `>>`, `&>` and `tee`. */
const writes = (text) =>
    [...text.matchAll(/(?:^|[^\d&<>])&?>{1,2}\s*([^\s;&|<>()]+)|\btee\s+(?:-a\s+)?([^\s;&|<>()]+)/g)]
        .map((m) => m[1] ?? m[2])
        .filter((file) => file && !file.startsWith('/dev/') && !file.startsWith('&'));

/**
 * The live own background task the command follows, `{ task, file }` or null: a Bash task with no end and
 * a Bash call in the background with no result yet, whose output file or written file the command names.
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
    const text = expanded(command, env, cwd);
    for (const task of tasks.reverse()) {
        if (ended.has(task.task) || (task.task === task.id && started.has(task.id))) continue;
        const files = [task.output, ...writes(expanded(task.command, env, cwd))].filter(Boolean).map((f) => f.replace(/\/{2,}/g, '/'));
        const file = files.find((f) => text.includes(f));
        if (file) return { task: task.task, file };
    }
    return null;
}

/** The verdict on a `Monitor` call: `{ refuse, task, file }`. */
export function monitorVerdict(command, events, env = {}, cwd = '') {
    const followed = linesPerStep(command) ? followedTask(command, events, env, cwd) : null;
    return { refuse: followed !== null, task: followed?.task ?? null, file: followed?.file ?? null };
}
