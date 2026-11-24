/**
 * Which numbers of the import graph are violations.
 *
 * Pure: the graphs, the numbers named in the plan and the accepted keys arrive as arguments. Four
 * violations: a cycle of modules, a cycle of blocks, an import past an entry, outgoing links grown past
 * what the branch named. What stood in the base is not judged. Incoming links are printed and not
 * judged: they grow by reuse, and refusing that teaches to write copies.
 */
import { posix } from 'node:path';

import { blocksOf, bypassesOf, cyclesOf, entriesOf, isHarness, outsideOf } from './coupling-numbers.mjs';

const BLOCKS = 'blocks: ';
const cycleKey = (members) => members.join(' | ');
const pastKey = ({ from, to }) => `${from} -> ${to}`;

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

/** A cycle is known when a known one holds every member of it: a cycle that lost a member is no new one. */
const known = (members, list) => list.some((old) => members.every((member) => old.includes(member)));

const acceptedCycles = (accepted, blocks) =>
    [...accepted]
        .filter((key) => key.includes(' | ') && key.startsWith(BLOCKS) === blocks)
        .map((key) => key.slice(blocks ? BLOCKS.length : 0).split(' | '));

const namesOf = (renames) => {
    const newNames = new Map([...renames].map(([now, was]) => [was, now]));
    return { wasName: (path) => renames.get(path) ?? path, nowName: (path) => newNames.get(path) ?? path };
};

/** New cycles of one graph: `graphFor` builds it from the import graph. */
function newCycles(graph, settings, { base, accepted }, { graphFor, label, blocks }) {
    const { nowName } = namesOf(base?.renames ?? new Map());
    // Both settings read the base: a block the branch declares over old links makes no new cycle.
    const stood = base ? [base.settings, settings].flatMap((given) => cyclesOf(graphFor(base.graph, given))) : [];
    const old = [...stood.map((members) => members.map(nowName)), ...acceptedCycles(accepted, blocks)];
    return cyclesOf(graphFor(graph, settings))
        .filter((members) => !known(members, old))
        .map((members) => `${label}: ${members.join(' → ')} → ${members[0]}`);
}

/**
 * New imports past an entry. An import that stood in the base is old even where the base did not yet call
 * it a bypass: an entry added to its folder, or an entry that stopped reaching the importer, is no edit of
 * the import. Neither is one that moved over from a neighbour of the same folder: a file was split.
 */
function newBypasses(graph, settings, { base, accepted }) {
    const { wasName, nowName } = namesOf(base?.renames ?? new Map());
    const stoodThen = ({ from, to }) => base?.graph.get(wasName(from))?.links.has(wasName(to));
    const moved = ({ from, to }) =>
        [...(base?.graph ?? [])].some(
            ([path, module]) =>
                posix.dirname(path) === posix.dirname(wasName(from)) &&
                module.links.has(wasName(to)) &&
                !graph.get(nowName(path))?.links.has(to)
        );
    return bypassesOf(graph, settings)
        .filter((bypass) => !stoodThen(bypass) && !accepted.has(pastKey(bypass)) && !moved(bypass))
        .map(({ from, to, entry }) => `${from} imports ${to} past the entry ${entry}`);
}

/** New cycles and imports past an entry. `base` is `{ graph, settings, renames }` of the fork, or null. */
export function structureOf(graph, settings, { base = null, accepted = new Set() } = {}) {
    const known = { base, accepted };
    return [
        ...newCycles(graph, settings, known, { graphFor: (given) => given, label: 'a new cycle', blocks: false }),
        ...newCycles(graph, settings, known, { graphFor: blocksOf, label: 'a new cycle of blocks', blocks: true }),
        ...newBypasses(graph, settings, known),
    ];
}

/** Links between blocks the base did not have by either settings: printed, since one way is no cycle. */
export function newBlockLinks(graph, settings, base) {
    const old = [base.settings, settings].map((given) => blocksOf(base.graph, given));
    const stood = (from, to) => old.some((blocks) => blocks.get(from)?.links.has(to));
    return [...blocksOf(graph, settings)].flatMap(([from, { links }]) =>
        [...links].filter((to) => !stood(from, to)).map((to) => `${from} → ${to}`)
    );
}

/**
 * Outgoing links that grew past what the branch named: `{ path, text }`. `own` holds the paths the branch
 * itself touched, `named` — a path to the number of the plan or of the progress; a path with a slash at
 * the end is a folder, and its number is what the folder imports from outside. A folder answers for its
 * new modules alone: one that stood in the base is named by itself. Harness and entries are free where
 * both settings call them so, the one of the base and the one of the branch.
 */
export function growthOf(graph, settings, { base, own, named }) {
    const { wasName } = namesOf(base.renames);
    const entries = [settings, base.settings].map((given) => entriesOf(graph, given).entries);
    const free = (path) => [settings, base.settings].every((given, at) => isHarness(path, given) || entries[at].has(path));
    const folders = [...named.keys()].filter((path) => path.endsWith('/'));
    const answered = (path) => !base.graph.has(wasName(path)) && folders.some((folder) => path.startsWith(folder));
    const modules = [...graph]
        .filter(([path]) => own.has(path) && (named.has(path) || !(free(path) || answered(path))))
        .map(([path, module]) => ({ path, was: base.graph.get(wasName(path))?.links.size ?? 0, now: module.links.size }));
    const whole = folders
        .filter((folder) => [...own].some((path) => path.startsWith(folder)))
        .map((path) => ({ path, was: outsideOf(base.graph, path, base.settings), now: outsideOf(graph, path, settings) }));

    return [...modules, ...whole]
        .filter(({ path, was, now }) => now > was && now > (named.get(path) ?? was))
        .map(({ path, was, now }) => {
            const limit = named.has(path) ? `the branch named ${named.get(path)}` : 'nobody named a number for it';
            return { path, text: `\`${path}\` outgoing ${was} → ${now}; ${limit}` };
        });
}
