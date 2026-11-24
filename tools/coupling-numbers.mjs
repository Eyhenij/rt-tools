// rt-kit v0.39.1 · checks/coupling-numbers.mjs · 9da679d178aa · правится надстройкой, не здесь
/**
 * The numbers of the import graph: cycles, imports past an entry, links between blocks, and by module —
 * incoming and outgoing links, names shown and taken by nobody.
 *
 * Pure: the graph and the settings arrive as arguments. What of it is a violation — `coupling-judge.mjs`.
 *
 * The settings: `aliases` — the path aliases of the tree; `entryNames` — what a barrel is called;
 * `entries` — files declared entries of their folder by name; `blocks` — folders that are blocks without
 * an entry; `harness` — the folder names, `harnessRoots` — the paths where only tests and harness lie.
 */
import { posix } from 'node:path';

const HARNESS_FILE = /\.(spec|test|stories|cy|e2e-spec|mock|fixture)\./;

/** Tests, showings and harness: they call the insides of a module lawfully and have no links to count. */
export const isHarness = (path, { harness = [], harnessRoots = [] } = {}) =>
    HARNESS_FILE.test(path) ||
    path
        .split('/')
        .slice(0, -1)
        .some((part) => harness.includes(part)) ||
    harnessRoots.some((root) => path === root || path.startsWith(`${root}/`));

/** The entries: the barrels by name, the files a path alias names, the declared ones. */
export function entriesOf(graph, { aliases = {}, entryNames = [], entries: named = [] } = {}) {
    const names = new Set(entryNames);
    const own = new Set(named);
    const targets = new Set(
        Object.values(aliases)
            .flat()
            .map((target) => target.replace(/^\.\//, ''))
    );
    const entries = new Set();
    const folders = new Map();
    for (const path of graph.keys()) {
        const closes = names.has(posix.basename(path)) || own.has(path);
        if (closes || targets.has(path)) {
            entries.add(path);
        }
        // A file an alias alone names is a lawful target; it closes no folder: its neighbours are not behind it.
        if (closes) {
            const folder = posix.dirname(path);
            folders.set(folder, [...(folders.get(folder) ?? []), path]);
        }
    }
    return { entries, folders };
}

/** Every strongly connected part of more than one node, its members sorted. */
export function cyclesOf(graph) {
    const index = new Map();
    const low = new Map();
    const stack = [];
    const onStack = new Set();
    const cycles = [];
    const enter = (node, work) => {
        index.set(node, index.size);
        low.set(node, index.get(node));
        stack.push(node);
        onStack.add(node);
        work.push({ node, next: [...(graph.get(node)?.links ?? [])], at: 0 });
    };
    const step = (frame, work) => {
        const to = frame.next[frame.at++];
        if (!index.has(to)) {
            enter(to, work);
        } else if (onStack.has(to)) {
            low.set(frame.node, Math.min(low.get(frame.node), index.get(to)));
        }
    };
    const leave = ({ node }, parent) => {
        if (parent) {
            low.set(parent.node, Math.min(low.get(parent.node), low.get(node)));
        }
        if (low.get(node) !== index.get(node)) {
            return;
        }
        const members = stack.splice(stack.indexOf(node));
        members.forEach((member) => onStack.delete(member));
        if (members.length > 1) {
            cycles.push(members.sort());
        }
    };

    for (const start of graph.keys()) {
        const work = [];
        if (!index.has(start)) {
            enter(start, work);
        }
        while (work.length > 0) {
            const frame = work.at(-1);
            if (frame.at < frame.next.length) {
                step(frame, work);
            } else {
                work.pop();
                leave(frame, work.at(-1));
            }
        }
    }
    return cycles;
}

function reachOf(graph) {
    const memo = new Map();
    return (from) => {
        if (!memo.has(from)) {
            const seen = new Set();
            const queue = [from];
            while (queue.length > 0) {
                for (const to of graph.get(queue.pop())?.links ?? []) {
                    if (!seen.has(to)) {
                        seen.add(to);
                        queue.push(to);
                    }
                }
            }
            memo.set(from, seen);
        }
        return memo.get(from);
    };
}

const foldersUp = (path) => {
    const found = [];
    for (let folder = posix.dirname(path); folder !== '.' && folder !== '/'; folder = posix.dirname(folder)) {
        found.push(folder);
    }
    return found;
};

/**
 * Imports from outside a folder past its entry. Lawful: the target is an entry of its own, the importer
 * is harness, the entry reaches the importer — through it the import would close a cycle.
 */
export function bypassesOf(graph, settings = {}) {
    const { entries, folders } = entriesOf(graph, settings);
    const reach = reachOf(graph);
    const found = [];
    for (const [from, module] of graph) {
        if (isHarness(from, settings)) {
            continue;
        }
        for (const to of module.links) {
            if (entries.has(to) || isHarness(to, settings)) {
                continue;
            }
            const passed = foldersUp(to)
                .filter((folder) => folders.has(folder) && !from.startsWith(`${folder}/`))
                .at(-1);
            if (passed && !folders.get(passed).some((entry) => reach(entry).has(from))) {
                found.push({ from, to, entry: folders.get(passed)[0] });
            }
        }
    }
    return found;
}

/**
 * The graph of blocks: a block is a folder with an entry or a declared one, a link is an import between
 * two blocks that do not hold each other — the outermost pair the two paths part at.
 */
export function blocksOf(graph, settings = {}) {
    const blocks = new Set([...entriesOf(graph, settings).folders.keys(), ...(settings.blocks ?? [])]);
    const chain = (path) =>
        foldersUp(path)
            .filter((folder) => blocks.has(folder))
            .reverse();
    const found = new Map([...blocks].map((block) => [block, { links: new Set() }]));
    for (const [from, module] of graph) {
        if (isHarness(from, settings)) {
            continue;
        }
        const ours = chain(from);
        for (const to of module.links) {
            const theirs = isHarness(to, settings) ? [] : chain(to);
            const part = ours.findIndex((block, at) => block !== theirs[at]);
            if (part >= 0 && theirs[part]) {
                found.get(ours[part]).links.add(theirs[part]);
            }
        }
    }
    return found;
}

/** What a folder imports from outside itself, harness apart: the outgoing links of a block. */
export function outsideOf(graph, folder, settings = {}) {
    const found = new Set();
    for (const [from, module] of graph) {
        if (from.startsWith(folder) && !isHarness(from, settings)) {
            [...module.links].filter((to) => !to.startsWith(folder)).forEach((to) => found.add(to));
        }
    }
    return found.size;
}

/** Incoming by module: who imports it, harness apart. */
function incomingOf(graph, settings) {
    const incoming = new Map();
    for (const [from, module] of graph) {
        if (!isHarness(from, settings)) {
            module.links.forEach((to) => incoming.set(to, (incoming.get(to) ?? 0) + 1));
        }
    }
    return incoming;
}

/** Names a module shows and no other module takes; an entry shows outside the tree and is not counted. */
function untakenOf(graph, settings) {
    const { entries } = entriesOf(graph, settings);
    const taken = new Map();
    const words = [];
    for (const [from, module] of graph) {
        for (const [to, names] of module.taken) {
            const known = taken.get(to) ?? new Set();
            names.forEach((name) => known.add(name));
            taken.set(to, known);
        }
        if (module.words) {
            words.push([from, module.words]);
        }
    }
    // A script shows functions and takes none by name: a word of another script is what takes one.
    const inScript = (path) => (name) => words.some(([from, list]) => from !== path && list.has(name));
    const inCode = (path) => (name) => taken.get(path)?.has('*') || taken.get(path)?.has(name);
    const untaken = new Map();
    for (const [path, module] of graph) {
        if (!entries.has(path) && !isHarness(path, settings)) {
            const isTaken = module.words ? inScript(path) : inCode(path);
            untaken.set(path, { shown: module.shown.size, left: [...module.shown].filter((name) => !isTaken(name)).length });
        }
    }
    return untaken;
}

/** The numbers of every module at once: `{ incoming, outgoing, past, shown, untaken }` by path. */
export function numbersOf(graph, settings = {}) {
    const incoming = incomingOf(graph, settings);
    const untaken = untakenOf(graph, settings);
    const past = new Map();
    for (const { from } of bypassesOf(graph, settings)) {
        past.set(from, (past.get(from) ?? 0) + 1);
    }
    const numbers = new Map();
    for (const [path, module] of graph) {
        numbers.set(path, {
            incoming: incoming.get(path) ?? 0,
            outgoing: module.links.size,
            past: past.get(path) ?? 0,
            shown: untaken.get(path)?.shown ?? 0,
            untaken: untaken.get(path)?.left ?? 0,
        });
    }
    return numbers;
}
