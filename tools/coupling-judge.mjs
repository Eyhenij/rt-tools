// rt-kit v0.42.0 · checks/coupling-judge.mjs · a363b9702328 · правится надстройкой, не здесь
/**
 * Which numbers of the import graph are violations.
 *
 * Pure: the graphs, the numbers named in the plan and the accepted keys arrive as arguments. Four
 * violations: a cycle of modules, a cycle of blocks, an import past an entry, outgoing links grown past
 * what the branch named. What stood in the base is not judged. Incoming links are printed and not
 * judged: they grow by reuse, and refusing that teaches to write copies.
 *
 * The base is `{ graph, settings }` of the fork under the paths of today: a renamed file keeps its past,
 * and the two graphs are compared path by path.
 */
import { posix } from 'node:path';

import { blockFolders, blocksOf, bypassesOf, cycleWay, cyclesOf, entriesOf, foldersUp, importBetween, isHarness, outsideOf } from './coupling-numbers.mjs';

const BLOCKS = 'blocks: ';
const cycleKey = (members) => members.join(' | ');
const pastKey = ({ from, to }) => `${from} -> ${to}`;
const leftFrom = ({ from, to }) => `${posix.dirname(from)} -> ${to}`;

/** Every key of the tree that may stand in the list of the accepted. */
export const keysOf = (graph, settings) =>
    [
        ...cyclesOf(graph).map(cycleKey),
        ...cyclesOf(blocksOf(graph, settings)).map((members) => BLOCKS + cycleKey(members)),
        ...bypassesOf(graph, settings).map(pastKey),
    ].sort();

/** How many of the keys are cycles, cycles of blocks and imports past an entry. */
export const countsOf = (keys) => {
    const blocks = keys.filter((key) => key.startsWith(BLOCKS)).length;
    return {
        cycles: keys.filter((key) => key.includes(' | ')).length - blocks,
        'cycles of blocks': blocks,
        'past the entry': keys.filter((key) => key.includes(' -> ')).length,
    };
};

/**
 * Where a folder of the base stands today, and the renames that keep the place: within one folder or with
 * a folder moved whole. Any other rename carries a file over a border, and the base keeps its old path.
 */
export function placesOf(raw, graph, renames) {
    const names = new Map([...renames].map(([now, was]) => [was, now]));
    const within = (paths, folder) => [...paths].filter((path) => path.startsWith(`${folder}/`));
    const found = new Map();
    const search = (folder) => {
        const moved = within(names.keys(), folder);
        const same = moved.filter((path) => names.get(path).endsWith(path.slice(folder.length)));
        const heads = new Set(same.map((path) => names.get(path).slice(0, folder.length - path.length)));
        const [head] = heads;
        const whole = heads.size === 1 && moved.every((path) => names.get(path).startsWith(`${head}/`));
        return whole && within(graph.keys(), folder).length === 0 && within(raw.keys(), head).length === 0 ? head : folder;
    };
    const today = (folder) => found.get(folder) ?? found.set(folder, search(folder)).get(folder);
    const keeps = ([now, was]) =>
        posix.dirname(now) === posix.dirname(was) || foldersUp(was).some((folder) => today(folder) !== folder && now.startsWith(`${today(folder)}/`));
    return { today, kept: new Map([...renames].filter(keeps)) };
}

/**
 * The settings with the blocks of both graphs by both settings: the two are compared over the same
 * folders. A block declared over old links makes no new cycle, and one whose entry is gone stays a block.
 */
function overCommonBlocks(graph, settings, base) {
    const given = base ? [settings, base.placed.settings] : [settings];
    const graphs = base ? [graph, base.placed.graph] : [graph];
    return { ...settings, blocks: [...new Set(given.flatMap((one) => graphs.flatMap((each) => [...blockFolders(each, one)])))] };
}

/** A cycle is known when a known one holds every member of it: a cycle that lost a member is no new one. */
const known = (members, list) => list.some((old) => members.every((member) => old.includes(member)));

const acceptedCycles = (accepted, blocks) =>
    [...accepted]
        .filter((key) => key.includes(' | ') && key.startsWith(BLOCKS) === blocks)
        .map((key) => key.slice(blocks ? BLOCKS.length : 0).split(' | '));

/** The new cycles as ways: over a link that no old cycle holds, since an old part of a cycle names nothing. */
function newCycles(now, stood, accepted) {
    const old = [...(stood ? cyclesOf(stood) : []), ...accepted];
    const entered = (members) =>
        members
            .flatMap((from) => [...now.get(from).links].map((to) => [from, to]))
            .find(([from, to]) => members.includes(to) && !stood?.get(from)?.links.has(to) && !known([from, to], old));
    return cyclesOf(now)
        .filter((members) => !known(members, old))
        .map((members) => cycleWay(now, members, entered(members)))
        .map((way) => [...way, way[0]]);
}

/** The imports that hold a cycle of blocks: the name of a folder says nothing about the link to break. */
function heldBy(graph, settings, way) {
    return way
        .slice(1)
        .map((block, at) => importBetween(graph, settings, way[at], block))
        .map(({ from, to }) => `${from} imports ${to}`)
        .join('; ');
}

/** The bypasses of the base that left, under the paths of today, by the folder they left and their target. */
function goneBypasses(graph, given, { placed, nowName }) {
    const old = [given, placed.settings].flatMap((one) => bypassesOf(placed.graph, one)).map(({ from, to }) => ({ from: nowName(from), to: nowName(to) }));
    const gone = new Map();
    for (const [key, bypass] of new Map(old.map((one) => [pastKey(one), one]))) {
        if (!graph.get(bypass.from)?.links.has(bypass.to)) {
            gone.set(leftFrom(bypass), [...(gone.get(leftFrom(bypass)) ?? []), key]);
        }
    }
    return gone;
}

/**
 * New imports past an entry. An import that stood in the base over the same border is old even where the
 * base did not yet call it a bypass: an entry added to its folder, or an entry that stopped reaching the
 * importer, is no edit of the import; a file moved over the border is one. A folder stays closed when its
 * entry is gone. A bypass that left a file of the same folder answers for one new: a file was split.
 */
function newBypasses(graph, settings, { base, accepted }) {
    const given = { ...settings, closed: base?.closed ?? [] };
    const gone = base ? goneBypasses(graph, given, base) : new Map();
    const stood = ({ from, to, folder }) => {
        const [was, target] = [from, to].map(base.placeName);
        return base.placed.graph.get(was)?.links.has(target) && target.startsWith(`${folder}/`) && !was.startsWith(`${folder}/`);
    };
    return bypassesOf(graph, given)
        .filter((bypass) => !base || !stood(bypass))
        .filter((bypass) => !accepted.has(pastKey(bypass)) && !gone.get(leftFrom(bypass))?.pop())
        .map(({ from, to, entry, folder }) => `${from} imports ${to} past the entry ${entry ?? `of ${folder}, which the branch removed`}`);
}

/**
 * New cycles and imports past an entry. `base` is null or the fork: `graph` under the paths of today,
 * `placed` — `{ graph, settings }` where a file moved over a border of folders keeps its old path,
 * `placeName` — the path of today to the one of `placed`, `nowName` — the reverse, `closed` — the folders
 * that had an entry, `paths` — the paths the fork itself had.
 */
export function structureOf(graph, settings, { base = null, accepted = new Set() } = {}) {
    const common = overCommonBlocks(graph, settings, base);
    const blocks = blocksOf(graph, common);
    const cycles = newCycles(graph, base?.graph, acceptedCycles(accepted, false));
    const blockCycles = newCycles(blocks, base && blocksOf(base.placed.graph, common), acceptedCycles(accepted, true));
    return [
        ...cycles.map((way) => `a new cycle: ${way.join(' → ')}`),
        ...blockCycles.map((way) => `a new cycle of blocks: ${way.join(' → ')} (${heldBy(graph, common, way)})`),
        ...newBypasses(graph, settings, { base, accepted }),
    ];
}

/** Links between blocks the base did not have: printed, since one way is no cycle. */
export function newBlockLinks(graph, settings, base) {
    const common = overCommonBlocks(graph, settings, base);
    const old = blocksOf(base.placed.graph, common);
    return [...blocksOf(graph, common)].flatMap(([from, { links }]) =>
        [...links].filter((to) => !old.get(from)?.links.has(to)).map((to) => `${from} → ${to}`)
    );
}

/**
 * Outgoing links that grew past what the branch named: `{ path, text }`. `own` holds the paths the branch
 * itself touched, `named` — a path to the number of the plan or of the progress; a path with a slash at
 * the end is a folder, and its number is what the folder imports from outside. A folder the base did not
 * have answers for its new modules; in an older one, and where a module came from elsewhere, the module is
 * named by itself. Harness and entries are free where both settings call them so, the one of the base and
 * the one of the branch. `unmarked` — the paths named after the plan without the mark or the reason.
 */
export function growthOf(graph, settings, { base, own, named, unmarked = new Map() }) {
    const entries = [settings, base.settings].map((given) => entriesOf(graph, given).entries);
    const free = (path) => [settings, base.settings].every((given, at) => isHarness(path, given) || entries[at].has(path));
    const folders = [...named.keys()].filter((path) => path.endsWith('/'));
    const fresh = folders.filter((folder) => !base.paths.some((path) => path.startsWith(folder)));
    const answered = (path) => !base.graph.has(path) && fresh.some((folder) => path.startsWith(folder));
    const modules = [...graph]
        .filter(([path]) => own.has(path) && (named.has(path) || !(free(path) || answered(path))))
        .map(([path, module]) => ({ path, was: base.graph.get(path)?.links.size ?? 0, now: module.links.size }));
    const whole = folders
        .filter((folder) => [...own].some((path) => path.startsWith(folder)))
        .map((path) => ({ path, was: outsideOf(base.graph, path, base.settings).size, now: outsideOf(graph, path, settings).size }));

    return [...modules, ...whole]
        .filter(({ path, was, now }) => now > was && now > (named.get(path) ?? was))
        .map(({ path, was, now }) => {
            const limit = named.has(path) ? `the branch named ${named.get(path)}` : 'nobody named a number for it';
            const late = unmarked.get(path) >= now ? '; the number after the plan has no word of an overrun or no reason beside it' : '';
            return { path, text: `\`${path}\` outgoing ${was} → ${now}; ${limit}${late}` };
        });
}
