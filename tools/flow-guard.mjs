// rt-kit v0.40.0 · checks/flow-guard.mjs · 8bc0c725669f · правится надстройкой, не здесь
/**
 * The guard of the course of work — the engine command `guard`, called by the hook `flow-step-guard.sh`
 * before Edit, Write, MultiEdit and a shell command. It refuses what would move the scenario by a
 * declaration instead of a measurement: a step marked done without the engine's green mark; marks out
 * of order; the state line ahead of the measured state; a shell write into the progress, the plan, the
 * epic plan, the marks, the session records, the description or the engine; «отложено» set or lifted,
 * or an edit of the tree override, without the owner's last word naming the task or the key; an edit
 * of the description or the engine outside a task whose approved plan names the path in a footprint
 * row marked «(правится)». A replacement line of the progress is the owner's decision; «шаг владельца»
 * on a row is refused. A plan with no check line, and a legacy branch, keep their done marks. The
 * decisions are pure: the context brings the files, the marks, the owner's last word and the state.
 */
import { posix } from 'node:path';

import { stepsOfPlan, stepsOfProgress } from './work-steps-lib.mjs';

/** The word that defers a task in the epic plan; the words a row carried for a task handed to the owner. */
const [DEFERRED, OWNER_STEP] = ['отложено', 'шаг владельца'];
/** The opening of a replacement line of the progress; the mark of an edited footprint row; the state line. */
const REPLACEMENT_START = /^-\s+\*\*(?:Проверка шага|Check of step)\s+(\d+\.\d+)\s+(?:заменена|replaced):\*\*/u;
const EDITED_ROW = '(правится)';
const STATE_LINE = /^-\s+\*\*(?:State|Состояние):\*\*\s+`([^`]+)`/mu;
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** A path under the temporary directories or a device; a word the shell still expands. */
const TEMP = /^\/(?:private\/)?(?:tmp|var\/folders)(?:\/|$)|^\/dev\//;
const DYNAMIC = /[$`*?[]|\{[^}"':\s]*(?:,|\.\.)[^}"':\s]*\}/;
/** The commands that only read what they name; echo and printf name nothing but their redirects. */
const READERS = new Set('cat head tail less wc grep rg egrep fgrep jq diff cmp ls stat file test [ [[ echo printf awk gawk sed sort cut tr nl uniq column find gh mkdir cd pushd popd export local declare readonly for read true false : basename dirname realpath readlink pwd shasum sha256sum md5 md5sum xxd od cspell du tree chmod pgrep sleep which type date tsc'.split(' '));
const GIT_READERS = new Set('diff log show status add blame ls-files ls-tree grep rev-parse rev-list cat-file commit merge-base check-ignore diff-tree for-each-ref show-ref branch reflog shortlog describe'.split(' '));
const COPIES = new Set(['cp', 'mv', 'install', 'ln', 'rsync', 'tar', 'unzip']);
/** The words before a command that only run it, with their options that take a value. */
const PREFIXES = { nice: ['-n'], sudo: ['-u', '-g'], timeout: ['-s', '-k'], env: ['-u'], stdbuf: ['-o', '-e', '-i'], xargs: ['-n', '-I', '-L', '-P', '-d', '-s'], npx: ['-p'] };
for (const word of 'command exec time nohup builtin if then else elif do while until ! {'.split(' ')) PREFIXES[word] = [];
/** The inside of the string literals of a script: not code. */
const STRINGS = /'''[\s\S]*?'''|"""[\s\S]*?"""|`(?:\\[\s\S]|[^\\`])*`|'(?:\\.|[^\\'\n])*'|"(?:\\.|[^\\"\n])*"/g;
/** A call of a script that runs a command: then all its text is read, not only its paths. */
const RUNS = /(?<!\.)\bexec\w*\s*\(|\b(?:system|popen|spawn\w*)\s*\(|child_process|subprocess/;
/** A write or a command run in the code of a script; not a write to stdout, nor `.copy()` of a list. */
const WIDE = new RegExp(
    `${RUNS.source}|\\b(?:writeFile|appendFile|createWriteStream)\\w*\\b|(?<!read(?:File|dir|link)?|exists|stat|lstat|realpath|access)Sync\\s*\\(|(?<!std(?:out|err)\\.)\\bwrite\\w*\\s*\\(|(?:\\b(?:os|shutil|fs|fsp|promises)\\.|(?<![.\\w]))(?:rename|unlink|remove|copy|move|truncate|rmdir|rm|cp|symlink|link|replace)\\w*\\s*\\(|\\bPath\\([^)]*\\)\\.(?:replace|rename|unlink|write_\\w+|\\w+_to)\\s*\\(|\\.touch\\s*\\(|\\bgetattr\\s*\\(|\\bopen\\s+(?:my\\s+)?[$\\w]+\\s*,`
);
/** A write call with a literal first argument under a temporary directory, and its handle: no file of the tree. */
const TEMP_PATH = `\\s*\\(\\s*(?<q>['"])\\/(?:private\\/)?(?:tmp|var\\/folders)\\/[^'"]*\\k<q>`;
const TEMP_WRITE = new RegExp(`\\b(?:open|writeFile\\w*|appendFile\\w*|createWriteStream)${TEMP_PATH}[^()]*(?:\\((?:[^()]|\\([^()]*\\))*\\)[^()]*)*\\)(?:\\.write\\w*)?`, 'g');
const TEMP_HANDLE = new RegExp(`(?:(\\w+)\\s*=\\s*|with\\s+)open${TEMP_PATH}[^)]*\\)(?:\\s+as\\s+(\\w+))?`, 'g');
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
 * depth }. A here-document and a here-string are the stdin; `<(…)`, `>(…)`, `$(…)` and backticks the subs.
 */
export function shellCommands(text) {
    const [commands, docs] = [[], []];
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
            // A substitution in double quotes is a command of its own: it goes to the subs.
            let j = from;
            while (j < text.length && text[j] !== text[from - 1]) {
                const end = c !== '"' ? -1 : text.startsWith('$(', j) ? closing(text, j + 1) : text[j] === '`' ? text.indexOf('`', j + 1) : -1;
                if (end > j) cmd.subs.push(text.slice(j + (text[j] === '`' ? 1 : 2), end));
                j = c === '"' && text[j] === '\\' ? j + 2 : end > j ? end + 1 : j + 1;
            }
            word = (word ?? '') + (c === '"' ? text.slice(from, j).replace(/\\(["\\$`])/g, '$1') : text.slice(from, j));
            i = j + 1;
        } else if (text.startsWith('$(', i) || c === '`') {
            const end = c === '`' ? text.indexOf('`', i + 1) : closing(text, i + 1);
            if (end > i) cmd.subs.push(text.slice(i + (c === '`' ? 1 : 2), end));
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
function scriptWrites(text) {
    const handles = [...text.matchAll(TEMP_HANDLE)].map((match) => match[1] ?? match[3]).filter(Boolean);
    const script = text.replace(TEMP_WRITE, 'read()').replace(handles.length ? new RegExp(`\\b(?:${handles.join('|')})\\.write\\w*\\s*\\(`, 'g') : /^\b$/, 'read(');
    const code = script.replace(STRINGS, (literal) => literal.replace(/[^\n]/g, ' '));
    if (WIDE.test(code) || RUNS.test(script) || /shutil|\bIO\.|\bFile\.(?:open|write)|\[\s*['"]\w*(?:write|append|rename|unlink|rm|cp|copy|truncate|link)\w*['"]\s*\]/i.test(script)) return true;
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
    word.replace(/\$\(mktemp\b[^)]*\)/g, '/tmp/mktemp').replace(/^~(?=\/|$)/, '/HOME').replace(/\$(?:\{(\w+)[^}]*\}|(\w+))/g, (all, braced, bare) => ({ TMPDIR: '/tmp', HOME: '/HOME' })[braced ?? bare] ?? vars.get(braced ?? bare) ?? all);

/** Every tail of a path after a slash: a path of the tree may be written from any directory above it. */
const tails = (path) => path.split('/').map((_, k, parts) => parts.slice(k).join('/')).filter(Boolean);

/**
 * A path lies in a guarded directory: in it, below it when the area ends with a slash, above it when
 * `up`. A relative path counts from the root; an absolute one by a tail, only on an area of two parts.
 */
const inArea = (path, area, up) => {
    const [dir, deep] = [area.replace(/\/$/, ''), area.endsWith('/')];
    const here = (tail) => (tail === dir && (deep || up)) || (deep && tail.startsWith(`${dir}/`));
    return path.startsWith('/') ? dir.includes('/') && tails(path).some(here) : here(path) || (up && (path === '.' || dir.startsWith(`${path}/`)));
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
        [new RegExp(`(?:^|[^\\w.-])(?:progress|plan)\\.md(?![\\w.-])|${escape(ctx.tasksDir)}/\\S*[*?[]`, 'i'),[`${ctx.tasksDir}/`], () => `the progress and the plan are edited ${shell}: the guard judges an edit, and a shell write passes it unseen`],
        [new RegExp(`(?:^|[^\\w.-])${escape(ctx.plansDir)}/`), [`${ctx.plansDir}/`], () => `the epic plan is edited ${shell}: «отложено» in it needs the owner's word, and a shell write passes it unseen`],
        [{ exec: (text) => (name(text) ? [name(text)] : null) }, ctx.protectedPaths.map(area).filter(Boolean), (path) => judgeProtected(path, ctx, `${ctx.tasksDir}/${ctx.branch}/plan.md`)],
        [new RegExp(`${escape(posix.dirname(ctx.overridePath))}/`), [`${posix.dirname(ctx.overridePath)}/`], () => `the override of the description is edited ${shell}, and only by the owner's word naming the key`],
    ];
}

/** The paths a script names: its literals with no space in them but what it imports, its globs when it globs. */
const literals = (script) =>
    (script.replace(/\b(?:from|import\s*\(|require\s*\()\s*(['"`])[^'"`]*\1/g, '').match(STRINGS) ?? []).map((literal) => literal.replace(/^('''|"""|['"`])([\s\S]*)\1$/, '$2')).filter((literal) => literal && !/\s/.test(literal) && (!/[*?[]/.test(literal) || /glob|readdir|listdir|walk|scandir|Dir\[/.test(script))).join(' ');

/**
 * The verdict on a shell command, simple command by simple command, variables of the command put in; a
 * script the command wrote is judged, a script it did not write is code of the tree and reads.
 */
function judgeShell(command, ctx, level = 0, vars = new Map(), cwd = '.') {
    const guards = shellGuards(ctx);
    const written = new Map();
    // A function the command defines runs its body, and the body is judged as commands of its own.
    const defined = new Set([...command.matchAll(/(?:^|[\s;&|({])(?:function\s+)?([\w-]+)\s*\(\)\s*\{/g)].map((match) => match[1]));
    const cwds = [cwd];
    let pipeline = '';
    for (const unit of shellCommands(command)) {
        cwds.length = Math.min(cwds.length, unit.depth + 1);
        while (cwds.length <= unit.depth) cwds.push(cwds.at(-1));
        // The path of a word; of a word the shell expands, the directory before it — none after an unknown variable.
        let base = cwds[unit.depth];
        const at = (word) => {
            const text = expand(word, vars);
            const cut = text.search(DYNAMIC);
            const slash = text.lastIndexOf('/', cut);
            if (cut >= 0 && (text.includes('..') || (slash < 0 && /[$`]/.test(text[cut])))) return null;
            const path = cut < 0 ? text : text.slice(0, slash + 1);
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
        while (words.length > 0 && (Object.hasOwn(PREFIXES, posix.basename(words[0])) || /^\w+=/.test(words[0]) || (/^p?npm$/.test(words[0]) && /^(?:exec|dlx)$/.test(words[1])))) {
            const head = posix.basename(words.shift());
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
            else if (inline >= 0) [script, params] = [(argv.splice(inline + 1, 1)[0] ?? '').replaceAll('{}', fed ? fromPipe.trim() : '{}'),shellRunner ? args.slice(inline + 2) : []];
            else if (file && file !== '-') [script, trusted, params] = [written.get(at(file)) ?? null, !written.has(at(file)) && !flag(/^-m$/), runsWritten ? [words[0], ...operands] : operands];
            else script = unit.stdin ?? (unit.piped ? fromPipe : null);
        }
        // A shell script is a command of its own, its positional parameters put in; so is what find runs.
        const [option, exec] = [args.findIndex((arg) => /^[-(!]/.test(arg)), name === 'find' ? args.findIndex((arg) => /^-(?:exec|execdir|ok|okdir)$/.test(arg)) : -1];
        const [starts, quote] = [option < 0 ? args : args.slice(0, option), (arg) => (/^[\w./=@%+:,-]*$/.test(arg) ? arg : `'${arg.replaceAll("'", `'\\''`)}'`)];
        const found = exec < 0 ? [] : [args.slice(exec + 1).filter((arg, k, list) => !list.slice(0, k + 1).some((one) => one === ';' || one === '+')).map((arg) => quote(arg.replaceAll('{}', starts.map((start) => `${start}/*`).join(' ')))).join(' ')];
        for (const inner of [...unit.subs, ...found, ...(shellRunner && script !== null && level < 3 ? [script] : [])]) {
            const verdict = judgeShell(inner, ctx, level + 1, new Map([...vars, ...params.map((value, k) => [String(k), value])]), base);
            if (verdict) return verdict;
        }
        const data = name === 'echo' || name === 'printf';
        const content = unit.stdin ?? (data ? args.join(' ') : null);
        for (const target of [...unit.redirects, ...(name === 'tee' ? operands : [])]) if (at(target) !== null) written.set(at(target), content ?? fromPipe);
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
        // A whole task folder is removed or moved away as the taking-apart does, and made from the template
        // when it does not stand yet; a write into a standing folder from anything else is judged below.
        const [taskFolder, template] = [`(?!_template$)[^/]+$`, '_template(?:/|$)'].map((tail) => (word) => new RegExp(`(?:^|/)${escape(ctx.tasksDir)}/${tail}`).test((DYNAMIC.test(expand(word, vars)) ? expand(word, vars) : at(word)) ?? ''));
        const sources = operands.filter((word) => word !== into);
        if (name === 'cp' && into && taskFolder(into) && sources.every(template) && !ctx.read?.(`${at(into)}/progress.md`)) continue;
        const sub = name === 'git' ? args.find((arg, k) => !arg.startsWith('-') && !['-C', '-c'].includes(args[k - 1])) : null;
        const staged = flag(/^(?:--staged|-S)$/) && !flag(/^(?:--worktree|-W)$/);
        const recursive = flag(/^-[a-zA-Z]*[rRa]|^--(?:recursive|archive)$/) || ['rsync', 'tar', 'unzip'].includes(name);
        const mode = name === 'tar' ? args.filter((arg, k) => /^-[a-zA-Z]+$/.test(arg) || (k === 0 && /^[a-zA-Z]+$/.test(arg))).join('') : '';
        const listing = (name === 'tar' && /[tO]/.test(mode)) || (name === 'unzip' && flag(/^-[lpvZ]/));
        const dirs = [];
        const folder = (word) => !/\.\w+$/.test(word);
        const unnamed = recursive || sources.some((word) => DYNAMIC.test(word) || (name === 'mv' && folder(word))) || into === null;
        const moved = name === 'mv' && sources.length > 0 && sources.every(taskFolder);
        if (COPIES.has(name) && unnamed && !listing && !moved && (name !== 'tar' || /x/.test(mode))) dirs.push([into ?? (['tar', 'unzip'].includes(name) ? '.' : null), recursive]);
        if (name === 'mv') dirs.push(...sources.filter((word) => folder(word) && !taskFolder(word)).map((word) => [word, true]));
        if (name === 'rm' && recursive) dirs.push(...operands.filter((word) => !taskFolder(word)).map((word) => [word, true]));
        if (name === 'find' && flag(/^-(?:delete|fprint)/)) dirs.push(...starts.map((word) => [word, true]));
        // A git path: every word after `--`; before it, a word with a slash or one that holds a guarded directory.
        const dash = args.indexOf('--');
        const gitPaths = dash >= 0 ? args.slice(dash + 1) : operands.slice(operands.indexOf(sub) + 1).filter((arg) => !/^[\w.~^@{}-]+$/.test(arg) || arg === '.' || guards.some(([, list]) => list.some((one) => inArea(at(arg) ?? '', one, true))));
        if (sub === 'checkout' || (sub === 'restore' && !staged) || sub === 'clean') dirs.push(...(gitPaths.length || sub !== 'clean' ? gitPaths : ['.']).filter(folder).map((word) => [word, true]));
        // A script that copies or removes a directory and names a task folder itself writes into the folder.
        if (interpreter && script !== null && TREE_CALL.test(script.replace(STRINGS, '""'))) dirs.push(...(text.match(new RegExp(`${escape(ctx.tasksDir)}/[^/\\s'"]+(?=/?['"\\s]|/?$)`, 'g')) ?? []).map((word) => [word, false]));
        // An in-place edit of sed, awk, perl or ruby writes the files it names, not its expression.
        const inPlace = /^(?:g?sed|g?awk|perl|ruby)$/.test(name) && flag(/^-[a-zA-Z0-9]*i|^--in-place|^inplace$/);
        const expressions = args.filter((arg, k) => /^-[a-zA-Z]*e$|^--expression$/.test(args[k - 1] ?? ''));
        const edited = [...operands.filter((arg) => arg && arg !== 'inplace' && !expressions.includes(arg)).slice(expressions.length || interpreter ? 0 : 1), ...(fed ? fromPipe.split(/\s+/).filter(Boolean) : [])];
        // A write target the shell still expands is judged by the directory it lies in.
        dirs.push(...[...unit.redirects, ...(inPlace ? edited : []), ...(name === 'rm' ? operands : [])].filter((word) => DYNAMIC.test(expand(word, vars))).map((word) => [word, false]));
        // awk that prints into a file or runs a command, and sed with a `w` command, write.
        const scripted = (/^g?awk$/.test(name) && flag(/printf?[^;}]*>|system\s*\(|\|\s*"/)) || (/^g?sed$/.test(name) && flag(/(?:^|[;{}\n]|\/[gpiIme0-9]*)\s*w\s+\S/));
        const archive = args[args.findIndex((arg) => /^-?[a-zA-Z]*f$/.test(arg)) + 1] ?? '';
        const reads = READERS.has(name) ? !scripted && !(name === 'sort' && flag(/^-o|^--output/)) && !(name === 'find' && flag(/^-(?:delete|fprint)/))
            : name === 'git' ? GIT_READERS.has(sub) || (sub === 'restore' && staged) || (sub === 'reset' && !flag(/^--(?:hard|merge|keep)$/))
            : ['cp', 'install', 'ln', 'rsync'].includes(name) ? into !== null && spared(into)
            : name === 'tar' || name === 'unzip' ? listing || (/c/.test(mode) && spared(archive))
            : ['prettier', 'eslint', 'markdownlint', 'markdownlint-cli2', 'iconv'].includes(name) ? !flag(/^(?:-w|--write|--fix\b.*|-o|--output\b.*)$/)
            : shellRunner || interpreter ? trusted || (script !== null && (shellRunner || !scriptWrites(script)))
            : name === '' || defined.has(name);
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
    const apply = (text, edit) => (edit.replaceAll ? text.split(edit.oldString).join(edit.newString) : text.replace(edit.oldString, () => edit.newString));
    return (call.edits ?? []).reduce(apply, before ?? '');
}

/** The done and current marks of the progress are in order: done steps first, the current right after. */
export function marksOutOfOrder(progress) {
    const { steps } = stepsOfProgress(progress);
    let open = false;
    for (const step of steps) {
        if (open && (step.mark === 'x' || step.mark === '>')) return `step ${step.number} is marked ${step.mark === 'x' ? 'done' : 'current'} after a step that is not done`;
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
const newLines = (before, after, sign) => ((was) => (after ?? '').split('\n').filter((line) => sign(line) && !was.has(line.trim())))(new Set((before ?? '').split('\n').map((line) => line.trim())));

/** The step numbers whose replacement line the edit adds or changes; dropping one needs no owner's word. */
export const replacementChanges = (before, after) => [...new Set(newLines(before, after, (line) => REPLACEMENT_START.test(line)).map((line) => line.match(REPLACEMENT_START)[1]))];

/** The tasks of the epic plan rows the edit marks «шаг владельца» (refused: the step is the executor's). */
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

/** The path is named by a footprint path: the same file, a directory that holds it, or its bare file name. */
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
    const why = fault ? ` — ${fault}: run \`node tools/task-flow-script.mjs plan-red\`, it finds the owner's answer in the record; ask the owner only when it finds none` : '';
    return `${path} belongs to the description of the task flow and its engine: it is edited only in a task whose approved plan names it in a footprint row marked «${EDITED_ROW}»${why}`;
}
