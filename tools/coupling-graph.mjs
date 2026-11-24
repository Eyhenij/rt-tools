// rt-kit v0.39.1 · checks/coupling-graph.mjs · ee9385540a17 · правится надстройкой, не здесь
/**
 * The import graph of a tree, built from texts.
 *
 * A module is a file. Nothing here reads a disk or a repository: the texts arrive as a map from a
 * path to its text, and the same function judges the working tree, a revision and a test fixture.
 *
 * What is read in code: `import … from`, `export … from`, `import '…'`, `import('…')` and `require('…')`
 * with a literal path — relative or by a path alias. In a script: a file joined by `.` or `source` or
 * started by `bash`, `sh` or `node` — its name a literal, whatever folder a variable or a nested call
 * names before it; the file is looked for by the path, beside the script, then by the only such name of
 * the tree. Not seen: a name that lies in a variable, a path assembled by `join`, a start from code.
 *
 * The sources of a package may call a neighbour by the name of its laid-out copy: `board.mjs` is the
 * file `board.github.mjs` of the same folder. A missing file is looked for by that form last. An import of
 * a laid-out copy is a link to its source where the tree holds the source.
 */
import { posix } from 'node:path';

const SCRIPT = /\.sh$/;
const CODE_EXTENSIONS = ['.ts', '.tsx', '.mts', '.cts', '.mjs', '.cjs', '.js', '.jsx'];

/** Comments go first: a sample in a description is not an import. A string is kept: `'src/*.ts'` opens none. */
const withoutComments = (text) =>
    text.replace(
        /("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|\/\*[\s\S]*?\*\/|\/\/.*$/gm,
        (part, string) => string ?? ''
    );

const CALLED = /\b(?:import|require)\(\s*(?:'([^'\n]+)'|"([^"\n]+)"|`([^`$\n]+)`)\s*[,)]/g;
const SPECIFIERS = [
    /(?:^|[\n;])\s*(?:import|export)\b[^'"`;]*?\bfrom\s*['"]([^'"]+)['"]/g,
    /(?:^|[\n;])\s*import\s*['"]([^'"]+)['"]/g,
    CALLED,
];

const SCRIPT_CALL =
    /(?:^|[;&|(){!]|\b(?:then|do|else|if|elif|while|exec|time)\s)\s*(?:(?:env|nohup|timeout\s+\S+|[A-Za-z_]\w*=\S*)\s+)*(?:\.|source|bash|sh|node)\s+/g;
/** The constant tail of a script address: after the last variable or nested call, quotes apart. */
const SCRIPT_TAIL = /^["']?(.*[)}]\/|.*\$\w+\/)?((?:[\w.-]+\/)*[\w.-]+\.(?:sh|mjs|cjs|js))["']?$/;

const SHOWN_DECLARED =
    /^export\s+(?:default\s+)?(?:declare\s+)?(?:abstract\s+)?(?:async\s+)?(?:const\s+enum|enum|class|interface|type|const|let|var|namespace|function\*?)\s+([A-Za-z_$][\w$]*)/gm;
const SHOWN_LISTED = /^export\s+(?:type\s+)?\{([^}]*)\}\s*(from\b)?/gm;
const SHOWN_FUNCTION = /^([A-Za-z_][\w]*)\s*\(\)\s*\{/gm;
const TAKEN_LISTED =
    /(?:^|[\n;])\s*(?:import|export)\s+(?:type\s+)?(?:[\w$]+\s*,\s*)?\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g;
const TAKEN_WHOLE =
    /(?:^|[\n;])\s*(?:import\s+(?:type\s+)?(?:\*|[A-Za-z_$][\w$]*(?=\s*,|\s+from\b))|export\s+\*)[^'"`;]*?from\s*['"]([^'"]+)['"]/g;

const listed = (list, side) =>
    list
        .split(',')
        .map((part) =>
            part
                .replace(/^\s*type\s+/, '')
                .trim()
                .split(/\s+as\s+/)
                .at(side)
                .trim()
        )
        .filter(Boolean);

/** The source of a laid-out copy: the module of the tree whose path ends with the name of the resource. */
function sourcesOf(files, copies) {
    const resources = new Set(copies.values());
    const sources = new Map();
    for (const path of files.keys()) {
        for (let at = path.indexOf('/'); at >= 0; at = path.indexOf('/', at + 1)) {
            if (resources.has(path.slice(at + 1))) {
                sources.set(path.slice(at + 1), path);
            }
        }
    }
    return (copy) => sources.get(copies.get(copy));
}

/** A resolver of one tree: from an importer and a specifier to a path of the tree, or null. */
function resolverOf(files, { aliases = {}, entryNames = [], copies = new Map() } = {}) {
    const sourceOf = sourcesOf(files, copies);
    const variants = new Map();
    for (const path of files.keys()) {
        const form = /^(.*)\.[a-z]+(\.(?:mjs|cjs|js|sh))$/.exec(path);
        if (form && !variants.has(form[1] + form[2])) {
            variants.set(form[1] + form[2], path);
        }
    }

    const fileOf = (base) => {
        const bare = base.replace(/\.[mc]?jsx?$/, '');
        const candidates = [
            base,
            ...CODE_EXTENSIONS.map((extension) => bare + extension),
            ...CODE_EXTENSIONS.map((extension) => base + extension),
            ...entryNames.map((name) => `${base}/${name}`),
        ];
        const copy = () => sourceOf(candidates.find((path) => copies.has(path)));
        return candidates.find((path) => files.has(path)) ?? variants.get(base) ?? copy() ?? null;
    };

    const byAlias = (specifier, alias, target) => {
        if (alias === specifier) {
            return fileOf(target);
        }
        const whole = alias.endsWith('/*') && specifier.startsWith(alias.slice(0, -1));
        return whole ? fileOf(target.replace('*', specifier.slice(alias.length - 1))) : null;
    };

    return (from, specifier) => {
        if (specifier.startsWith('.')) {
            return fileOf(posix.join(posix.dirname(from), specifier));
        }
        for (const [alias, targets] of Object.entries(aliases)) {
            for (const target of targets) {
                const found = byAlias(specifier, alias, target.replace(/^\.\//, ''));
                if (found) {
                    return found;
                }
            }
        }
        return null;
    };
}

/** The only file of the tree by its bare name; several — nobody knows which one is meant. */
function soleNames(files) {
    const sole = new Map();
    for (const path of files.keys()) {
        const bare = posix.basename(path);
        for (const name of new Set([bare, bare.replace(/\.[a-z]+(\.(?:mjs|cjs|js|sh))$/, '$1')])) {
            sole.set(name, sole.has(name) ? null : path);
        }
    }
    return sole;
}

/** One word of a shell line: quotes and `$(…)` nest, and a space inside them does not end the word. */
function wordAt(line, from) {
    const open = [];
    let at = from;
    for (; at < line.length; at++) {
        const sign = line[at];
        const top = open.at(-1);
        if (sign === '$' && line[at + 1] === '(') {
            open.push(')');
            at++;
        } else if (sign === top) {
            open.pop();
        } else if (sign === '"' || (sign === "'" && top !== '"')) {
            open.push(sign);
        } else if (open.length === 0 && /[\s;&|)]/.test(sign)) {
            break;
        }
    }
    return line.slice(from, at);
}

/** The script a call starts: the first word after the options, by its path, beside, by the only name. */
function calledScript(path, line, from, { files, sole }) {
    let at = from;
    let word = wordAt(line, at);
    while (word.startsWith('-')) {
        at += word.length;
        at += line.slice(at).length - line.slice(at).trimStart().length;
        word = wordAt(line, at);
    }
    const [, variable, tail] = SCRIPT_TAIL.exec(word) ?? [];
    if (!tail) {
        return null;
    }
    const beside = posix.join(posix.dirname(path), tail);
    const places = variable ? [beside] : [tail, beside];
    return places.find((place) => files.has(place)) ?? sole.get(posix.basename(tail)) ?? null;
}

function scriptOf(path, text, names) {
    const links = new Set();
    for (const line of text.split('\n')) {
        if (/^\s*#/.test(line)) {
            continue;
        }
        for (const call of line.matchAll(SCRIPT_CALL)) {
            const target = calledScript(path, line, call.index + call[0].length, names);
            if (target && target !== path) {
                links.add(target);
            }
        }
    }
    return {
        links,
        shown: new Set([...text.matchAll(SHOWN_FUNCTION)].map((match) => match[1])),
        taken: new Map(),
        words: new Set(text.match(/[A-Za-z_]\w*/g) ?? []),
    };
}

function moduleOf(path, raw, resolve) {
    const text = withoutComments(raw);
    const links = new Set();
    const taken = new Map();
    const take = (specifier, names) => {
        const target = resolve(path, specifier);
        if (!target || target === path) {
            return;
        }
        links.add(target);
        const known = taken.get(target) ?? new Set();
        names.forEach((name) => known.add(name));
        taken.set(target, known);
    };

    for (const pattern of SPECIFIERS) {
        for (const match of text.matchAll(pattern)) {
            take(match[1] ?? match[2] ?? match[3], pattern === CALLED ? ['*'] : []);
        }
    }
    for (const match of text.matchAll(TAKEN_LISTED)) {
        take(match[2], listed(match[1], 0));
    }
    for (const match of text.matchAll(TAKEN_WHOLE)) {
        take(match[1], ['*']);
    }

    const shown = new Set([...text.matchAll(SHOWN_DECLARED)].map((match) => match[1]));
    for (const match of text.matchAll(SHOWN_LISTED)) {
        if (!match[2]) {
            listed(match[1], -1).forEach((name) => shown.add(name));
        }
    }
    return { links, shown, taken, words: null };
}

/** The graph of the past under the paths of today: `renames` is the new path → the old one. */
export function underNewPaths(graph, renames) {
    const names = new Map([...renames].map(([now, was]) => [was, now]));
    const now = (path) => names.get(path) ?? path;
    const moved = ({ links, taken, ...module }) => ({
        ...module,
        links: new Set([...links].map(now)),
        taken: new Map([...taken].map(([to, list]) => [now(to), list])),
    });
    return new Map([...graph].map(([path, module]) => [now(path), moved(module)]));
}

/** The graph: a path → what it imports (`links`), shows (`shown`) and takes by name (`taken`). */
export function graphOf(files, settings = {}) {
    const resolve = resolverOf(files, settings);
    const names = { files, sole: soleNames(files) };
    const graph = new Map();
    for (const [path, text] of files) {
        graph.set(path, SCRIPT.test(path) ? scriptOf(path, text, names) : moduleOf(path, text, resolve));
    }
    return graph;
}
