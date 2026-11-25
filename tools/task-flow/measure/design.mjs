// rt-kit v0.39.1 · task-flow/measure/design.mjs · cfc0d8f2f141 · правится надстройкой, не здесь
/**
 * The measurer «measure.design» — exit 8 beside the footprint: the code of the head holds what the
 * decision of the plan promised, the plan as its first commit wrote it. `gaps` is the list of the
 * mismatches, `held` — that it is empty.
 *
 * Judged are the places, the suites, the new files, the outgoing links and the budget. A line of the
 * decisions of the progress, or of an own commit once the folder is taken apart, lifts a mismatch when it
 * names its path, place or symbol, the word and the reason; a line of outgoing links lifts only a mismatch
 * of links. A refusal of the coupling command is lifted only as the command lifts it. What was not read is
 * not judged: a plan without the decision, a binary file, a command that did not answer or count.
 *
 * The reading of the decision, the history and the answer of the coupling command come through ports.
 */
import { footprintRows, taskFolder } from './text.mjs';

const CODE = /\.(?:[mc]?[jt]sx?|sh|py)$/;
const COPY = /^(?:#!.*\n)?(?:\/\/|#|<!--|\/\*\*?) rt-kit v\d/;
const PLACES = /^(?:модул|modul|паттерн|pattern)/iu;
const MODULES = /^(?:модул|modul)/iu;
const INPUT = /^(?:данны|input)/iu;
const COUPLING = /^(?:зацеплен|coupling)/iu;
const LIFT = /(?<!\p{L})(?:превышени[ея]|отказ от|overruns?|waived)(?!\p{L})/iu;
/** A line of links lifts a mismatch of links, any other line — the rest: a budget line does not drop a decrease. */
const LINKS = /(?:исходящ|outgoing)\D*\d+[*\s]*(?:→|->)[*\s]*\d+/iu;

// --- The names a text of code declares ---------------------------------------------------------------

const NAME = '[\\p{L}_$][\\p{L}\\p{N}_$]*';
const WORDS = '(?:@[\\p{L}_$][\\p{L}\\p{N}_$.]*(?:\\([^)\\n]*\\))?\\s+)*(?:(?:export|default|declare|public|private|protected|static|readonly|async|override|abstract|get|set)\\s+)*';
const ARGS = '\\((?:[^()]|\\((?:[^()]|\\([^()]*\\))*\\))*\\)';
const escaped = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const bareOf = (text) =>
    text
        .replace(/^[ \t]*(?:\/\*[^]*?\*\/|<!--[^]*?-->)/gm, '')
        .replace(/^[ \t]*(?:\/\/|#(?=[\s!])|\*(?=\s)).*$/gm, '')
        .replace(/\s(?:\/\/|#) .*$/gm, '');

/** The forms a script declares the name in: a word before it, a key, a field, a method, a re-export. */
const scriptForms = (name) => [
    `^[ \\t]*${WORDS}(?:function\\*?|class|const|let|var|type|interface|enum|namespace)\\s+${name}`,
    `^[ \\t]*${WORDS}(?:const|let|var)\\s*[\\[{][^=]*(?<![\\p{L}\\p{N}_$.])${name}[^=]*=`,
    `^[ \\t]*export\\s*\\{[^}]*(?<![\\p{L}\\p{N}_$])${name}`,
    `(?:^[ \\t]*|[{,]\\s*)${WORDS}[*#]?['"]?${name}['"]?[?!]?\\s*(?::|=(?![=>]))`,
    `(?:^[ \\t]*|[{,]\\s*)${WORDS}[*#]?${name}\\s*(?:<[^>]*>)?${ARGS}\\s*(?::[^;={]*)?\\{`,
    `^[ \\t]*(?:abstract|public|private|protected|static|get|set)\\s+${WORDS}#?${name}\\s*[(<;]`,
];
const shellForms = (name) => [`^[ \\t]*(?:function\\s+)?${name}\\s*\\(\\)`, `^[ \\t]*function\\s+${name}`, `(?:^|[;&|\\s])${name}\\+?=`];
const pythonForms = (name) => [`^[ \\t]*(?:async\\s+)?(?:def|class)\\s+${name}`, `^${name}\\s*(?::[^=\\n]*)?=(?!=)`];
/** A class is written whole or as the tail of its parent: `&__elem`, `&--mod`. */
const styleForms = (symbol) =>
    [escaped(symbol), ...[...symbol.matchAll(/(?:__|--)(?=\p{L})/gu)].map(({ index }) => `&${escaped(symbol.slice(index))}`)].map((form) => `${form}(?![\\p{L}\\p{N}_-])`);

/** Whether the text of the file declares the symbol; in a language not known here — names it outside a comment. */
function declares(text, path, symbol) {
    const name = `${escaped(symbol.replace(/^.*[\p{L}\p{N}_$][.#](?=[\p{L}_$#])/u, '').replace(/^#/, ''))}(?![\\p{L}\\p{N}_$])`;
    const word = `(?<![\\p{L}\\p{N}_-])${escaped(symbol)}(?![\\p{L}\\p{N}_-])`;
    const forms = /\.[mc]?[jt]sx?$/.test(path) ? scriptForms(name) : /\.sh$/.test(path) ? shellForms(name) : /\.py$/.test(path) ? pythonForms(name) : /\.(?:s?css|less)$/.test(path) ? styleForms(symbol) : [word];
    return forms.some((form) => new RegExp(form, 'mu').test(bareOf(text)));
}

const SHOWN = new RegExp(`^[ \\t]*${WORDS}(?:function\\*?|class)\\s+(${NAME})|^export\\s+${WORDS}(?:const|let|var|type|interface|enum)\\s+(${NAME})|^(?:const|let|var)\\s+(${NAME})[^=\\n]*=\\s*(?:async\\s*)?(?:function\\b|\\([^\\n]*\\)[^=\\n]*=>|${NAME}\\s*=>)`, 'gmu');
const EXPORTS = /^[ \t]*export\s*\{([^}]*)\}|^[ \t]*export\s+(default)\b/gmu;
const SHELL_NAME = /^[ \t]*(?:function\s+([\p{L}_][\p{L}\p{N}_-]*)|([\p{L}_][\p{L}\p{N}_-]*)\s*\(\))/gmu;
const PYTHON_NAME = /^[ \t]*(?:async\s+)?(?:def|class)\s+([\p{L}_][\p{L}\p{N}_]*)/gmu;

/** The functions, the classes and the exports a text of code declares; a list of exports gives each name. */
function declaredNames(text, path) {
    const bare = bareOf(text);
    const named = (pattern) => [...bare.matchAll(pattern)].map(([, ...names]) => names.find(Boolean));
    if (/\.sh$/.test(path)) return named(SHELL_NAME);
    if (/\.py$/.test(path)) return named(PYTHON_NAME);
    return [...named(SHOWN), ...named(EXPORTS).flatMap((list) => list.split(',').map((part) => part.trim().split(/\s+/).pop()).filter(Boolean))];
}

// --- The head of the branch --------------------------------------------------------------------------

const linesOf = (text) => text.split('\n').length - (text.endsWith('\n') ? 1 : 0);

/** The head, the own commits after the plan and the files they changed. */
function headOf(git, sha) {
    const own = git.commits().filter((commit) => commit.own);
    const after = own.slice(own.findIndex((commit) => commit.sha === sha) + 1);
    const head = git.head();
    const texts = new Map();
    const text = (path, at = head) => {
        const key = `${at}:${path}`;
        if (!texts.has(key)) texts.set(key, git.versionAt(path, at));
        return texts.get(key);
    };
    const files = git.filesAt('.', head);
    const [now, then] = [new Set(files), new Set(git.filesAt('.', sha))];
    const isCopy = (path) => COPY.test(text(path) ?? '');
    const standing = (pick) => [...new Set(after.flatMap(pick))].filter((path) => now.has(path));
    return {
        after, text, files, isCopy,
        touched: standing((commit) => [...commit.added, ...commit.modified]),
        added: standing((commit) => commit.added).filter((path) => !then.has(path)),
        /** The names own commits brought into a file of the head: those of each commit its parent did not have. */
        brought: (path, read) =>
            [...new Set(after.filter((commit) => commit.added.includes(path) || commit.modified.includes(path)).flatMap((commit) => {
                const old = new Set(read(text(path, `${commit.sha}^`) ?? '', path));
                return read(text(path, commit.sha) ?? '', path).filter((name) => !old.has(name));
            }))].filter((name) => read(text(path) ?? '', path).includes(name)),
        /** The files a written path names: itself, or those that end with it and are no laid-out copy. */
        named: (path) => (files.includes(path) ? [path] : files.filter((file) => file.endsWith(`/${path}`) && !isCopy(file))),
    };
}

// --- The mismatches ----------------------------------------------------------------------------------

const gap = (text, ...keys) => ({ text, keys });
const rowsBy = (rows, name) => rows.filter((row) => name.test(row.name));

/** A place promised is declared, and a place that goes away is not. */
function placeGaps(rows, head) {
    const places = new Map(rowsBy(rows, PLACES).flatMap((row) => row.symbols).map((place) => [`${place.path}:${place.symbol}:${place.fate}`, place]));
    return [...places.values()].filter(({ fate }) => fate === '' || fate === 'removed').flatMap(({ path, symbol, fate }) => {
        const stands = head.named(path).some((file) => declares(head.text(file) ?? '', file, symbol));
        if (stands === (fate === '')) return [];
        return [gap(`\`${path}:${symbol}\` ${fate === '' ? 'is not declared in the code' : 'was to be removed and is declared'}`, `${path}:${symbol}`, symbol)];
    });
}

/** A suite of an input row stands, carries a scenario number of its row and was touched or carried it before. */
function suiteGaps(rows, head, sha) {
    return rowsBy(rows, INPUT).flatMap(({ suites, scenarios }) => suites.flatMap((suite) => {
        const files = head.named(suite);
        const carries = (file, at) => scenarios.length === 0 || scenarios.some((number) => new RegExp(`${escaped(number)}(?!\\d)`).test(head.text(file, at) ?? ''));
        if (files.length === 0) return [gap(`the suite \`${suite}\` is not there`, suite)];
        if (!files.some((file) => carries(file))) return [gap(`the suite \`${suite}\` does not carry ${scenarios.join(', ')}`, suite)];
        const met = files.some((file) => carries(file) && (head.touched.includes(file) || (scenarios.length > 0 && carries(file, sha) && head.text(file, sha) !== null)));
        return met ? [] : [gap(`the suite \`${suite}\` was not touched by the branch`, suite)];
    }));
}

/** New code files nobody named: neither a module of the decision nor an exact path of the footprint. */
function fileGaps(rows, head, plan, design) {
    const suites = design.suites(head.added);
    const places = rowsBy(rows, MODULES).flatMap((row) => row.symbols).filter(({ fate }) => fate !== 'dropped').map(({ path }) => path);
    const paths = [...places, ...footprintRows(plan).flatMap((row) => row.paths)];
    return newCode(head)
        .filter((file) => !suites.includes(file) && !paths.some((path) => file === path || file.endsWith(`/${path}`)))
        .map((file) => gap(`the new file \`${file}\` is named neither by the modules nor by the footprint`, file));
}
const newCode = (head) => head.added.filter((file) => CODE.test(file) && !head.isCopy(file));

/** «No decision» beside a new file of code, a new suite among them, and a new function, class or export outside a suite. */
function noneGaps(head, design) {
    const files = newCode(head);
    const suites = design.suites(head.touched);
    const old = head.touched.filter((file) => CODE.test(file) && !files.includes(file) && !suites.includes(file) && !head.isCopy(file));
    return [
        ...files.map((file) => gap(`«No decision», and the branch added \`${file}\``, file)),
        ...old.flatMap((file) => head.brought(file, declaredNames).map((name) => gap(`«No decision», and the branch declared \`${file}:${name}\``, `${file}:${name}`, name))),
    ];
}

const dependencies = (text) => {
    try {
        return Object.entries(JSON.parse(text)).filter(([key]) => /^(?:dev|peer|optional)?dependencies$/i.test(key)).flatMap(([, group]) => Object.keys(group ?? {}));
    } catch {
        return [];
    }
};

function budgetGaps(rows, head, sha) {
    const limits = rows.flatMap((row) => row.limits).flatMap(({ path, grows, lines }) =>
        head.named(path).map((file) => ({ path, grows, lines, text: head.text(file) ?? '', old: () => head.text(file, sha) ?? '' })));
    const long = limits.filter(({ text }) => !text.includes('\0')).flatMap(({ path, grows, lines, text, old }) => {
        const grown = linesOf(text) - (grows ? (old() === '' ? 0 : linesOf(old())) : 0);
        return grown > lines ? [gap(`\`${path}\` ${grows ? 'grew by' : 'holds'} ${grown} lines, the budget is ${lines}`, path)] : [];
    });
    const files = newCode(head).length;
    const packages = head.touched.filter((file) => /(?:^|\/)package\.json$/.test(file));
    const fresh = new Set(packages.flatMap((file) => head.brought(file, dependencies))).size;
    const counted = rows.flatMap(({ newFiles, newDependencies }) => [
        ...(newFiles !== null && files > newFiles ? [gap(`new code files ${files}, the budget is ${newFiles}`, 'новых файлов кода', 'new code files')] : []),
        ...(newDependencies !== null && fresh > newDependencies ? [gap(`new dependencies ${fresh}, the budget is ${newDependencies}`, 'новых зависимостей', 'new dependencies')] : []),
    ]);
    return [...long, ...counted];
}

/**
 * What the coupling command refuses — lifted only as the command itself lifts it, or the push refuses it later — and the
 * promised decrease it does not judge. A short path is the one module of the head that is no copy; a module the branch
 * touched and the command did not print is one it does not count, and is not judged.
 */
function couplingGaps(rows, head, { answered, problems, now }, design) {
    if (!answered) return [];
    const refused = problems.map((text) => ({ text, keys: [], hard: true }));
    const promised = [...design.links(rowsBy(rows, COUPLING).map((row) => row.text).join('\n\n'), head.files)];
    const kept = promised.filter(([, link]) => link.now < link.was).flatMap(([written, link]) => {
        const [path, ...more] = head.named(written);
        if (!path || more.length > 0 || (!now.has(path) && head.touched.includes(path))) return [];
        const text = now.has(path) ? (now.get(path) > link.now ? `it is ${now.get(path)}` : null) : 'and the branch did not touch it';
        return text ? [{ ...gap(`\`${path}\` outgoing was to be ${link.now}, ${text}`, path, written), links: true }] : [];
    });
    return [...refused, ...kept];
}

/** The lines that may lift: the items of the decisions of the progress and, once the folder is taken apart, of the own commits. */
function liftsOf(git, head, design, folder) {
    const items = (text) => text.split(/\n\s*\n|\n(?=\s*[-*]\s)/).map((item) => item.replace(/\s+/g, ' '));
    const progress = design.decisions(git.lastVersion(`${folder}/progress.md`) ?? '');
    const commits = head.files.includes(`${folder}/progress.md`) ? [] : head.after.map((commit) => commit.text ?? '');
    return [progress, ...commits].flatMap(items).filter((item) => {
        const reason = item.replace(/`[^`]*`/g, '').replace(new RegExp(LIFT, 'giu'), '').replace(/\d+/g, '');
        return LIFT.test(item) && (reason.match(/\p{L}{2,}/gu) ?? []).length >= 2;
    });
}
/** A line names the key whole or by its tail after a `/`: a full path of the plan, a short one of the progress. */
const lifts = (item, key) => new RegExp(`(?:^|[\\s\`(«])(?:${key.split('/').map((_, at, parts) => escaped(parts.slice(at).join('/'))).join('|')})(?=[\\s\`),.;:»]|$)`, 'iu').test(item);

/** The mismatches of one history port, counted once per head: the engine asks `held` and then `gaps`. */
const known = new WeakMap();

/** The mismatches of the code with the decision of the plan, each as one line. */
export function gaps({ git, design, coupling }) {
    return () => {
        const at = git.head();
        if (known.get(git)?.at !== at) known.set(git, { at, list: listOf(git, design, coupling) });
        return known.get(git).list;
    };
}

function listOf(git, design, coupling) {
    const branch = git.branch();
    const folder = taskFolder(branch);
    const sha = branch ? git.addedBy(`${folder}/plan.md`) : null;
    const plan = sha ? git.versionAt(`${folder}/plan.md`, sha) : null;
    const { state, rows } = plan === null ? { state: 'absent', rows: [] } : design.rows(plan);
    if (state !== 'table' && state !== 'none') return [];
    const head = headOf(git, sha);
    const found = state === 'none' ? noneGaps(head, design) : [
        ...placeGaps(rows, head), ...suiteGaps(rows, head, sha), ...fileGaps(rows, head, plan, design),
        ...budgetGaps(rows, head, sha), ...couplingGaps(rows, head, coupling.from(sha), design),
    ];
    const items = found.length > 0 ? liftsOf(git, head, design, folder) : [];
    const left = found.filter(({ keys, hard, links = false }) => hard || !keys.some((key) => items.some((item) => LINKS.test(item) === links && lifts(item, key))));
    return [...new Set(left.map(({ text }) => text))];
}

/** The code holds what the decision promised. */
export function held({ git, design, coupling }) {
    return (data) => gaps({ git, design, coupling })(data).length === 0;
}
