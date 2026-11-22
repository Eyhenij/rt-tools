/**
 * The guard of the course of work — the engine command `guard`, called by the hook
 * `flow-step-guard.sh` before Edit, Write, MultiEdit and a shell command.
 *
 * It refuses what would move the scenario by a declaration instead of a measurement: a step marked
 * done without the green mark the engine wrote for it; done and current marks out of order; the state
 * line ahead of the measured state; a shell write into the progress, the plan, the epic plan, the
 * marks, the session records, the description or the engine; «отложено» set or lifted in the epic
 * plan without the owner's last word naming the task; an edit of the tree override without the
 * owner's last word naming the key; an edit of the description or the engine outside a task whose
 * approved plan names the path in a footprint row marked «(правится)». A replacement line of the
 * progress is the owner's decision, answered with the window; «шаг владельца» on a row is refused.
 * A plan with no check line, and a branch in `words.legacyBranches`, keep their done marks as they are.
 *
 * The decisions are pure: the context brings the files, the marks, the owner's last word and the
 * measured state. A shell command is judged by a list of readers: a simple command whose text names
 * a guarded file passes only when it reads; a copy, a move or a removal into a directory of the
 * guarded files is refused even when it names no file.
 */
import { posix } from 'node:path';

import { stepsOfPlan, stepsOfProgress } from './work-steps-lib.mjs';

/** The word that defers a task in the epic plan; the words a row carried for a task handed to the owner. */
const DEFERRED = 'отложено';
const OWNER_STEP = 'шаг владельца';
/** The opening of a replacement line of the progress, with the number of the step. */
const REPLACEMENT_START = /^-\s+\*\*(?:Проверка шага|Check of step)\s+(\d+\.\d+)\s+(?:заменена|replaced):\*\*/u;
/** The mark of a footprint row the task edits; the state line of the progress. */
const EDITED_ROW = '(правится)';
const STATE_LINE = /^-\s+\*\*(?:State|Состояние):\*\*\s+`([^`]+)`/mu;
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** A path under the temporary directories or a device: never a file of the tree. */
const TEMP = /^\/(?:private\/)?(?:tmp|var\/folders)(?:\/|$)|^\/dev\//;
/** A word the shell still expands: a variable, a substitution, a glob or a brace list. */
const DYNAMIC = /[$`*?[]|\{[^}"':\s]*(?:,|\.\.)[^}"':\s]*\}/;
/** The commands that only read what they name; echo and printf name nothing but their redirects. */
const READERS = new Set('cat head tail less wc grep rg egrep fgrep jq diff cmp ls stat file test [ [[ echo printf awk sed sort cut tr nl uniq column find gh mkdir cd pushd popd export local declare readonly for read true false : basename dirname realpath readlink pwd shasum md5 du tree chmod pgrep sleep which type date tsc'.split(' '));
const GIT_READERS = new Set('diff log show status add blame ls-files ls-tree grep rev-parse rev-list cat-file commit merge-base check-ignore diff-tree for-each-ref show-ref branch reflog shortlog describe'.split(' '));
const COPIES = new Set(['cp', 'mv', 'install', 'ln', 'rsync', 'tar', 'unzip']);
/** The words before a command that only run it, with their options that take a value. */
const PREFIXES = { nice: ['-n'], sudo: ['-u', '-g'], timeout: ['-s', '-k'], env: ['-u'], stdbuf: ['-o', '-e', '-i'], xargs: ['-n', '-I', '-L', '-P', '-d', '-s'], npx: ['-p'] };
for (const word of 'command exec time nohup builtin if then else elif do while until ! {'.split(' ')) PREFIXES[word] = [];
/** The inside of the string literals of a script: not code. */
const STRINGS = /'''[\s\S]*?'''|"""[\s\S]*?"""|`(?:\\[\s\S]|[^\\`])*`|'(?:\\.|[^\\'\n])*'|"(?:\\.|[^\\"\n])*"/g;
/** A call of a script that runs a command: then all its text is read, not only its paths. */
const RUNS = /(?<!\.)\bexec\w*\s*\(|\b(?:system|popen|spawn\w*)\s*\(|child_process|subprocess/;
/** A call of a script that writes a file or runs a command, read in its code. */
const WIDE = new RegExp(`${RUNS.source}|\\b(?:writeFile|appendFile|createWriteStream)\\w*\\b|(?<!read(?:File|dir|link)?|exists|stat|lstat|realpath|access)Sync\\s*\\(|\\b(?:write|rename|unlink|remove|copy|move|truncate|rmdir|rm|cp|symlink)\\w*\\s*\\(|\\bopen\\s+(?:my\\s+)?[$\\w]+\\s*,`);
/** A call of a script that copies, moves or removes a whole directory. */
const TREE_CALL = /\b(?:cp|copy|rename|rm|move|rmdir)\w*\s*\(|copytree|rmtree/;

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
 * The simple commands of a shell text, quotes taken off: { words, redirects, stdin, subs, piped,
 * depth }. A here-document and a here-string are the stdin; `<(…)` and `>(…)` are the subs.
 */
export function shellCommands(text) {
    const commands = [];
    const docs = [];
    let [cmd, word, pending, piped, depth] = [null, null, null, false, 0];
    const fresh = () => (cmd = { words: [], redirects: [], stdin: null, subs: [], piped, depth });
    const endWord = () => {
        if (word === null) return;
        if (pending === '<<' || pending === '<<-') docs.push({ delim: word, strip: pending === '<<-', cmd });
        else if (pending === '<<<') cmd.stdin = word;
        else if (pending === '>') cmd.redirects.push(word);
        else if (pending !== '<') cmd.words.push(word);
        [pending, word] = [null, null];
    };
    const endCommand = (pipe) => {
        endWord();
        if (cmd.words.length || cmd.redirects.length || cmd.subs.length) commands.push(cmd);
        piped = pipe;
        fresh();
    };
    fresh();
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
        } else if (c === '#' && word === null) while (i < text.length && text[i] !== '\n') i++;
        else if (c === '\n') {
            endCommand(false);
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
            const pair = text[i + 1] === c && c !== '(' && c !== ')';
            endCommand(c === '|' && !pair);
            depth = Math.max(0, depth + (c === '(' ? 1 : c === ')' ? -1 : 0));
            cmd.depth = depth;
            i += pair ? 2 : 1;
        } else if (c === '>' || c === '<' || c === '&') {
            if (word !== null && /^\d+$/.test(word)) word = null;
            endWord();
            const op = text.slice(i).match(/^(?:<<<|<<-|<<|<>|<|&?>>|&?>\|?)/)[0];
            i += op.length;
            if (text[i] === '(') {
                cmd.subs.push(text.slice(i + 1, closing(text, i)));
                i = closing(text, i) + 1;
            } else if (op.endsWith('>') && text[i] === '&' && /[\d-]/.test(text[i + 1] ?? '')) for (i++; /[\d-]/.test(text[i] ?? ''); ) i++;
            else {
                if (text[i] === '&' || text[i] === '!') i++;
                pending = op.includes('>') ? '>' : op;
            }
        } else word = (word ?? '') + text[i++];
    }
    endCommand(false);
    return commands;
}

/** A script writes: a call of a write or of a command in its code, or `open` in a mode other than reading. */
function scriptWrites(script) {
    const code = script.replace(STRINGS, (literal) => literal.replace(/[^\n]/g, ' '));
    if (WIDE.test(code) || RUNS.test(script) || /shutil|\bIO\.|\bFile\.(?:open|write)/.test(script)) return true;
    return [...code.matchAll(/(\.?)\bopen\s*\(/g)].some((call) => {
        const from = call.index + call[0].length;
        const end = closing(code, from - 1);
        let [k, depth] = [from, 0];
        for (; k < end && !(code[k] === ',' && depth === 0); k++) depth += '([{'.includes(code[k]) ? 1 : ')]}'.includes(code[k]) ? -1 : 0;
        // A method takes the mode first: `Path(p).open('w')`; a function second: `open(p, 'w')`.
        const mode = (call[1] ? script.slice(from, k) : script.slice(k + 1, end)).trim();
        return !(mode === '' || /^(?:['"][rbtU]*['"]|encoding\s*=|errors\s*=|newline\s*=)/.test(mode)) || /mode\s*=\s*['"][^'"]*[wax+]/.test(script.slice(from, end));
    });
}

/** The word with the variables of the command put in; `mktemp` and `$TMPDIR` are a temporary directory. */
const expand = (word, vars) =>
    word
        .replace(/\$\(mktemp\b[^)]*\)/g, '/tmp/mktemp')
        .replace(/^~(?=\/|$)/, '/HOME')
        .replace(/\$(?:\{(\w+)[^}]*\}|(\w+))/g, (all, braced, bare) => ({ TMPDIR: '/tmp', HOME: '/HOME' })[braced ?? bare] ?? vars.get(braced ?? bare) ?? all);

/** Every tail of a path after a slash: a path of the tree may be written from any directory above it. */
const tails = (path) => path.split('/').map((_, k, parts) => parts.slice(k).join('/')).filter(Boolean);

/**
 * A path lies in a directory of the guarded files: the directory itself or below it when the area
 * ends with a slash, or above it when `up` — a removal or a tree copy reaches the files under it.
 */
const inArea = (path, area, up) => {
    const dir = area.replace(/\/$/, '');
    const deep = dir !== area;
    return (up && path === '.') || tails(path).some((tail) => (tail === dir && (deep || up)) || (up && dir.startsWith(`${tail}/`)) || (deep && tail.startsWith(`${dir}/`)));
};

/** The guarded files of a shell command: the sign of their name in a text, their directories, the reason. */
function shellGuards(ctx) {
    const marks = posix.normalize(ctx.marksDir);
    const engine = (tail) => ctx.protectedPaths.some((source) => new RegExp(source).test(tail));
    const shell = 'by the edit tool, not by a shell command';
    const name = (text) => text.split(/[\s;|&<>'"()=,`{}]+/).flatMap((token) => tails(token.replace(/^\.\//, ''))).find(engine);
    // The directory of a pattern: all of it when the pattern ends with a slash, else only its own files.
    const head = (source) => source.replace(/^\^|^\(\?:\^\|\/\)/, '').match(/^[\w./-]*/)[0];
    const area = (source) => (head(source).endsWith('/') ? head(source) : head(source).replace(/\/?[^/]*$/, ''));
    return [
        [new RegExp(`rt-kit/(?:steps|approval)|${escape(marks)}`), [`${marks}/`, 'rt-kit/steps/', 'rt-kit/approval/'], () => 'the marks of the steps and of the approval are written only by the engine `task-flow-script.mjs`, never by a shell command'],
        [/\.claude\/projects\/\S*(?:\.jsonl\b|\*)/, ['.claude/projects/'], () => 'the session records are written only by the harness, never by a shell command: an approval is read from them'],
        [new RegExp(`(?:^|[^\\w.-])(?:progress|plan)\\.md(?![\\w.-])|${escape(ctx.tasksDir)}/\\S*[*?[]`), [`${ctx.tasksDir}/`], () => `the progress and the plan are edited ${shell}: the guard judges an edit, and a shell write passes it unseen`],
        [new RegExp(`(?:^|[^\\w.-])${escape(ctx.plansDir)}/`), [`${ctx.plansDir}/`], () => `the epic plan is edited ${shell}: «отложено» in it needs the owner's word, and a shell write passes it unseen`],
        [{ exec: (text) => (name(text) ? [name(text)] : null) }, ctx.protectedPaths.map(area).filter(Boolean), (path) => judgeProtected(path, ctx, `${ctx.tasksDir}/${ctx.branch}/plan.md`)],
        [new RegExp(`${escape(posix.dirname(ctx.overridePath))}/`), [`${posix.dirname(ctx.overridePath)}/`], () => `the override of the description is edited ${shell}, and only by the owner's word naming the key`],
    ];
}

/** The paths a script names: its string literals with no space in them, its globs only when it globs. */
const literals = (script) =>
    (script.match(STRINGS) ?? [])
        .map((literal) => literal.replace(/^('''|"""|['"`])([\s\S]*)\1$/, '$2'))
        .filter((literal) => literal && !/\s/.test(literal) && (!/[*?[]/.test(literal) || /glob|readdir|listdir|walk|scandir|Dir\[/.test(script)))
        .join(' ');

/**
 * The verdict on a shell command. Each simple command is read with its words, its redirects and, for
 * a runner, its script: inline, a here-document, the words piped into it or a file the same command
 * wrote. Variables set in the command are put in; a word under a temporary directory names nothing.
 * A script the command did not write is code of the tree, run by its path: it reads.
 */
function judgeShell(command, ctx, level = 0, vars = new Map(), cwd = '.') {
    const guards = shellGuards(ctx);
    const written = new Map();
    const cwds = [cwd];
    let pipeline = '';
    for (const unit of shellCommands(command)) {
        cwds.length = Math.min(cwds.length, unit.depth + 1);
        while (cwds.length <= unit.depth) cwds.push(cwds.at(-1));
        // The path of a word; of a word the shell still expands, the literal directory before it.
        let base = cwds[unit.depth];
        const at = (word) => {
            const text = expand(word, vars);
            const cut = text.search(DYNAMIC);
            if (cut >= 0 && (text.includes('..') || !text.slice(0, cut).includes('/'))) return null;
            const path = cut < 0 ? text : text.slice(0, text.lastIndexOf('/', cut) + 1);
            return path.startsWith('/') || base !== null ? posix.normalize(posix.join(path.startsWith('/') ? '/' : base, path)).replace(/(.)\/$/, '$1') : null;
        };
        // A temporary path names nothing, save a session record: the records of a session may lie there.
        const spared = (word) => at(word) !== null && TEMP.test(at(word)) && !guards[1][0].test(expand(word, vars));
        let words = unit.words.map((word) => expand(word, vars));
        for (const word of words) {
            const set = word.match(/^(\w+)=([\s\S]*)$/);
            if (set) vars.set(set[1], set[2]);
            else if (!['export', 'local', 'declare', 'readonly'].includes(word)) break;
        }
        if (words[0] === 'for' && words[2] === 'in') vars.set(words[1], words.slice(3).join(' '));
        let fed = false;
        while (words.length > 0 && (Object.hasOwn(PREFIXES, words[0]) || /^\w+=/.test(words[0]) || (/^p?npm$/.test(words[0]) && /^(?:exec|dlx)$/.test(words[1])))) {
            const head = words.shift();
            if (/^p?npm$/.test(head)) words.shift();
            while (words[0]?.startsWith('-')) if ((PREFIXES[head] ?? []).includes(words.shift())) words.shift();
            if (head === 'timeout') words.shift();
            fed ||= head === 'xargs';
        }
        const name = posix.basename(words[0] ?? '');
        const args = words.slice(1);
        const operands = args.filter((arg) => !arg.startsWith('-'));
        const fromPipe = unit.piped ? pipeline : '';
        pipeline = `${unit.piped ? `${pipeline} ` : ''}${args.join(' ')} ${unit.stdin ?? ''}`;
        if (name === 'cd' || name === 'pushd' || name === 'popd') cwds[unit.depth] = name === 'popd' || operands[0] === '-' ? null : at(operands[0] ?? '~');
        if (name === 'git' && args.includes('-C')) base = at(args[args.indexOf('-C') + 1] ?? '');
        const flag = (sign) => args.some((arg) => sign.test(arg));
        // A runner: the script inline, from a here-document, a pipe or a file this command wrote.
        const runsWritten = written.has(at(words[0] ?? '') ?? '');
        const shellRunner = /^(?:bash|sh|zsh|source|\.|eval)$/.test(name) || runsWritten;
        const interpreter = /^(?:python[\d.]*|node|nodejs|ruby|perl|deno|bun)$/.test(name);
        const argv = [...args];
        let [script, trusted, params] = [null, false, []];
        if (shellRunner || interpreter) {
            const inline = args.findIndex((arg) => /^-[a-zA-Z]*[ce]$/.test(arg) || ['--eval', '-p', '--print'].includes(arg));
            const file = runsWritten ? words[0] : operands[0];
            if (name === 'eval') script = args.join(' ');
            else if (inline >= 0) script = argv.splice(inline + 1, 1)[0] ?? '';
            else if (file && file !== '-') [script, trusted, params] = [written.get(at(file)) ?? null, !written.has(at(file)), runsWritten ? operands : operands.slice(1)];
            else script = unit.stdin ?? (unit.piped ? fromPipe : null);
        }
        // A shell script is judged as a command of its own, its positional parameters put in.
        for (const inner of [...unit.subs, ...(shellRunner && script !== null && level < 3 ? [script] : [])]) {
            const verdict = judgeShell(inner, ctx, level + 1, new Map([...vars, ...params.map((value, k) => [String(k + 1), value])]), base);
            if (verdict) return verdict;
        }
        const data = name === 'echo' || name === 'printf';
        const content = unit.stdin ?? (data ? args.join(' ') : null);
        for (const target of unit.redirects) if (content !== null && at(target) !== null) written.set(at(target), content);
        // The names: the words, the redirects, the names a copy lands in its target, the script — of a
        // script that runs no command only the paths it names — and the words piped into xargs. A
        // here-document of a command that is not a runner is the text it writes, not a name; so are
        // the words of echo and printf.
        const shown = interpreter && script !== null && !RUNS.test(script) ? literals(script) : script;
        const target = args.find((arg, k) => ['-t', '-C', '-d', '--target-directory'].includes(args[k - 1])) ?? args.find((arg) => arg.startsWith('--target-directory='))?.slice(19);
        const into = target ?? (operands.length > 1 && !['tar', 'unzip'].includes(name) ? operands.at(-1) : null);
        const landed = COPIES.has(name) && into ? operands.filter((word) => word !== into).map((word) => posix.join(into, posix.basename(word))) : [];
        const pieces = [...(data ? [] : argv), ...landed, ...unit.redirects.map((word) => expand(word, vars)), trusted ? '' : (shown ?? ''), fed ? fromPipe : ''];
        const tokens = pieces.join(' ').split(/\s+/).filter(Boolean);
        const text = tokens.flatMap((token) => (spared(token) ? [] : at(token) !== null && at(token) !== token && !token.startsWith('/') ? [token, at(token)] : [token])).join(' ');
        const named = guards.filter(([sign]) => sign.exec(text));
        // A write whose target is not a literal path is named in the refusal: the target first, then the rest.
        const loose = [...unit.redirects, into ?? '', ...argv.filter((arg) => !arg.startsWith('-'))].map((word) => expand(word, vars)).find((word) => DYNAMIC.test(word));
        const refuse = (by, path) => {
            const reason = by[2](path ?? by[0].exec(text)?.[0]);
            return reason && loose ? `${reason} — \`${loose}\` is not a literal path: write the path as a literal` : reason;
        };
        // The directories a copy, a move, a removal or a checkout writes into, and whether it reaches below.
        // A copy of named files is judged by the names it lands; a tree, or a source the shell expands, by its target.
        const sub = name === 'git' ? args.find((arg, k) => !arg.startsWith('-') && !['-C', '-c'].includes(args[k - 1])) : null;
        const staged = flag(/^(?:--staged|-S)$/) && !flag(/^(?:--worktree|-W)$/);
        const recursive = flag(/^-[a-zA-Z]*[rRa]|^--(?:recursive|archive)$/) || ['rsync', 'tar', 'unzip'].includes(name);
        const dirs = [];
        const unnamed = recursive || operands.slice(0, -1).some((word) => DYNAMIC.test(word)) || into === null;
        if (COPIES.has(name) && unnamed && (name !== 'tar' || flag(/^-?[a-zA-Z]*x/))) dirs.push([into ?? (['tar', 'unzip'].includes(name) ? '.' : null), recursive]);
        const folder = (word) => !/\.\w+$/.test(word);
        if (name === 'mv') dirs.push(...operands.slice(0, -1).filter(folder).map((word) => [word, true]));
        if (name === 'rm' && recursive) dirs.push(...operands.map((word) => [word, true]));
        if (sub === 'checkout' || (sub === 'restore' && !staged)) dirs.push(...operands.slice(operands.indexOf(sub) + 1).filter((arg) => (!/^[\w.~^@{}-]+$/.test(arg) || arg === '.') && folder(arg)).map((word) => [word, true]));
        // A script that copies or removes a directory and names a task folder itself writes into the folder.
        if (interpreter && script !== null && TREE_CALL.test(script.replace(STRINGS, '""'))) dirs.push(...(text.match(new RegExp(`${escape(ctx.tasksDir)}/[^/\\s'"]+(?=/?['"\\s]|/?$)`, 'g')) ?? []).map((word) => [word, false]));
        // An in-place edit of sed, awk, perl or ruby writes the files it names, not its expression.
        const inPlace = /^(?:g?sed|g?awk|perl|ruby)$/.test(name) && flag(/^-[a-zA-Z0-9]*i|^--in-place|^inplace$/);
        const expressions = args.filter((arg, k) => /^-[a-zA-Z]*e$|^--expression$/.test(args[k - 1] ?? ''));
        const edited = [...operands.filter((arg) => arg && arg !== 'inplace' && !expressions.includes(arg)).slice(expressions.length || interpreter ? 0 : 1), ...(fed ? fromPipe.split(/\s+/).filter(Boolean) : [])];
        const reads = READERS.has(name) ? !(name === 'sort' && flag(/^-o|^--output/)) && !(name === 'find' && flag(/^-(?:delete|exec|ok|fprint)/))
            : name === 'git' ? GIT_READERS.has(sub) || (sub === 'restore' && staged) || (sub === 'reset' && !flag(/^--(?:hard|merge|keep)$/))
            : ['cp', 'install', 'ln', 'rsync'].includes(name) ? into !== null && spared(into)
            : name === 'prettier' || name === 'eslint' ? !flag(/^(?:-w|--write|--fix\b.*)$/)
            : shellRunner || interpreter ? trusted || (script !== null && (shellRunner || !scriptWrites(script)))
            : name === '';
        const reader = unit.redirects.every(spared) && (inPlace ? edited.every(spared) : reads);
        if (fed && !reader) dirs.push(...fromPipe.split(/\s+/).filter(Boolean).map((word) => [word, true]));
        const why = reader ? null : named.map((by) => refuse(by)).find(Boolean);
        if (why) return why;
        for (const [dir, up] of dirs) {
            const path = dir === null ? null : at(dir);
            const areas = path === null ? named : TEMP.test(path) ? [] : guards.filter(([, list]) => list.some((one) => inArea(path, one, up)));
            const refused = areas.map((by) => refuse(by, path ?? undefined)).find(Boolean);
            if (refused) return refused;
        }
    }
    return null;
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
    const numbers = (line) => [...line.matchAll(new RegExp(`${escape(key)}-(\\d+)`, 'g'))].map((match) => match[1]);
    const deferredTasks = (text) => new Set((text ?? '').split('\n').filter((line) => line.includes(DEFERRED)).flatMap(numbers));
    const [was, now] = [deferredTasks(before), deferredTasks(after)];
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
    return [...new Set(newLines(before, after, marked).flatMap(numbers))].filter((task) => !legacy.has(task));
}

/** The keys an edit of the override changes: `key:` of every line that differs. */
export function changedKeys(before, after) {
    const lines = (text) => new Set((text ?? '').split('\n').map((line) => line.trim()).filter(Boolean));
    const [was, now] = [lines(before), lines(after)];
    const changed = [...[...now].filter((line) => !was.has(line)), ...[...was].filter((line) => !now.has(line))];
    const keys = new Set(changed.map((line) => line.match(/^['"]?([A-Za-z_][\w-]*)['"]?\s*:/)?.[1]).filter((key) => key && key !== 'reason'));
    return { keys: [...keys], reasons: changed.filter((line) => now.has(line)).map((line) => line.match(/^reason\s*:\s*['"](.+)['"],?$/)?.[1]).filter(Boolean) };
}

/** The paths of the footprint rows marked «(правится)»: every path in backticks of such a row. */
export function editedPaths(plan) {
    const rows = (plan ?? '').split('\n').filter((line) => line.startsWith('|') && line.split('|')[1]?.includes(EDITED_ROW));
    return rows.flatMap((line) => [...line.matchAll(/`([^`\s]+)`/g)].map((match) => match[1]));
}

/**
 * The path is named by a footprint path: the same file, a directory that holds it, or a bare file
 * name equal to its last part — a footprint row lists the files of one directory by name.
 */
export const namedBy = (path, paths) =>
    paths.some((named) => path === named || (named.endsWith('/') && path.startsWith(named)) || (!named.includes('/') && path.split('/').pop() === named));

/**
 * The verdict on one call: the reason of a refusal, or null. `call` — { tool, path, content, edits,
 * command }, `path` relative to the root of the tree. `ctx`: `branch` and `key` of the tree;
 * `tasksDir` and `plansDir` relative to the root; `marksDir` relative or absolute; `protectedPaths`,
 * the patterns of the description and the engine; `overridePath`; `legacy`, `words.legacyBranches`;
 * `read(path)`, a file of the working copy or null; `stepMark(number)`; `approved()`, the approval
 * mark of the plan; `ownerLast()`, the owner's typed message or chosen options; `stateIndex(name)`,
 * the place of a state or -1; `measured()`, the index of the measured state or null.
 */
export function judgeCall(call, ctx) {
    const [progressPath, planPath] = ['progress', 'plan'].map((name) => `${ctx.tasksDir}/${ctx.branch}/${name}.md`);
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

function judgeProgress(call, ctx, planPath) {
    const before = ctx.read(call.path);
    const after = textAfter(call, before);
    const order = marksOutOfOrder(after);
    if (order) return `${order}: done steps go first, and the one current step right after them`;
    // The plan as the commit that added it wrote it: a plan stripped of its checks in the working copy
    // lifts nothing. Before that commit there is no approved plan, and the working copy is all there is.
    const plan = (ctx.committed ? ctx.committed(planPath) : null) ?? ctx.read(planPath);
    const legacy = ctx.legacy.includes(ctx.branch) || stepsOfPlan(plan ?? '').every((step) => step.command === null);
    const marked = legacy ? [] : newlyDone(before, after);
    if (marked.length > 0) return `step ${marked.join(', ')} is marked done after its check matched, by \`node tools/task-flow-script.mjs step ${marked[0]}\` itself: a hand mark is refused whatever mark lies on disk`;
    const state = declaredState(after);
    const [declared, measured] = state && state !== declaredState(before) ? [ctx.stateIndex(state), ctx.measured()] : [-1, null];
    if (declared >= 0 && measured !== null && declared > measured) {
        return `the state \`${state}\` is ahead of the measured one: the engine measures the branch below it — \`node tools/task-flow-script.mjs measure\` names the exit that is not met`;
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
