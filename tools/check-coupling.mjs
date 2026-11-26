#!/usr/bin/env node
// rt-kit v0.41.1 · checks/check-coupling.mjs · 4411340a4420 · правится надстройкой, не здесь
/**
 * The coupling of the modules: a new cycle of modules or of blocks, a new import past an entry and
 * outgoing links grown past what the plan of the branch named are refused.
 *
 *   node check-coupling.mjs                        the tree against the list of the accepted
 *   node check-coupling.mjs --base=<revision>      the branch against the base: «was → now», the growth
 *   node check-coupling.mjs --base=… --at=<rev>    a past revision instead of the working tree
 *   node check-coupling.mjs --module=<path>        one module or folder: its numbers and its links
 *   node check-coupling.mjs --baseline             the list as it would be written
 *
 * With a base the list does not lift what the branch added, unless the owner's words stand in the reason
 * of the line; such a line is printed. The settings of the base are in force together with those of the
 * branch: a branch does not loosen the check it is judged by.
 *
 * Growth is judged by the own commits of the branch against the first version of its plan. A number named
 * later — in the plan, among the decisions of the progress or in the text of a commit, with its reason —
 * is accepted and printed as an overrun.
 *
 * What is judged — `coupling-judge.mjs`, what is counted — `coupling-numbers.mjs`, which imports are
 * seen — `coupling-graph.mjs`. A non-zero exit code and a line per violation.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { graphOf, underNewPaths } from './coupling-graph.mjs';
import { countsOf, growthOf, keysOf, newBlockLinks, placesOf, structureOf } from './coupling-judge.mjs';
import { entriesOf, isHarness, numbersOf, outsideOf } from './coupling-numbers.mjs';
import { decisionsOf, namedOf } from './coupling-plan.mjs';
import {
    RevisionMissing,
    aliasesFrom,
    forkOf,
    ownMessages,
    ownPaths,
    ownVersions,
    renamesOf,
    revisionFiles,
    textAt,
    treeFiles,
} from './coupling-read.mjs';
import { CONFIG, CONFIG_PATH, ROOT, allowlistOf, baselineOf, configFrom, parseAllowlist, skipUnless } from './rt-kit-checks.config.mjs';

const OWNER_WORDS = /^\s*(?:слово владельца|the owner['’]s words?)\s+(?:\d{2}\.\d{2}(?:\.\d{4})?|\d{4}-\d{2}-\d{2})(?![^:]*\s(?:не|нет|not|no)\s)[^:«"“]{0,60}:\s*[«"“][^»"”]+[»"”]/iu;

function stop(text) {
    console.error(`check-coupling: ${text}`);
    process.exit(1);
}

function refuse(problems, hint) {
    console.error(`\ncheck-coupling: violations ${problems.length}\n`);
    problems.forEach((line) => console.error(`  ${line}`));
    console.error(`\n${hint}`);
    process.exit(1);
}

const given = new Map();
for (const arg of process.argv.slice(2)) {
    const [, name, value] = /^--(?:(base|at|module)=(.+)|baseline)$/.exec(arg) ?? stop(`the argument «${arg}» is not known or is empty`);
    given.set(name ?? 'baseline', value ?? true);
}
const [base, at, one] = ['base', 'at', 'module'].map((name) => given.get(name) ?? null);

/** The point the branch left the base at; null — no base is named. */
function forkOrExit() {
    try {
        return base || at ? forkOf(ROOT, base ?? 'HEAD', at ?? 'HEAD') : null;
    } catch (error) {
        if (!(error instanceof RevisionMissing)) {
            throw error;
        }
        return stop(error.message);
    }
}

const fork = forkOrExit();
const stood = fork ? configFrom(textAt(ROOT, fork, CONFIG_PATH)) : CONFIG;
const rootsOf = (config) => [...config.sourceRoots, ...config.coupling.extraRoots];
const scope = {
    roots: [...new Set([...rootsOf(CONFIG), ...rootsOf(stood)])],
    skipped: CONFIG.skippedDirs.filter((dir) => stood.skippedDirs.includes(dir)),
};

function aliasesAt(revision, { coupling: { aliasesFile } }) {
    const path = join(ROOT, aliasesFile);
    const text = revision ? textAt(ROOT, revision, aliasesFile) : existsSync(path) && readFileSync(path, 'utf8');
    const aliases = text ? aliasesFrom(text) : {};
    if (aliases === null) {
        console.log(`check-coupling: ${aliasesFile} does not parse, imports by an alias are not seen`);
    }
    return aliases ?? {};
}

const settingsOf = (config, aliases) => ({
    aliases,
    entryNames: config.barrelFiles,
    entries: config.coupling.entries,
    blocks: config.coupling.blocks,
    harness: config.coupling.harness,
    harnessRoots: config.e2eRoots,
});

const settings = settingsOf(CONFIG, aliasesAt(at, CONFIG));
const baseSettings = fork ? settingsOf(stood, aliasesAt(fork, stood)) : settings;
/** An import is resolved by both settings: an alias or a barrel name the branch dropped hides no link. */
const graphBy = ({ files, copies }, first, second) =>
    graphOf(files, { aliases: { ...second.aliases, ...first.aliases }, entryNames: [...new Set([...first.entryNames, ...second.entryNames])], copies });
const read = at ? revisionFiles(ROOT, at, scope) : treeFiles(ROOT, scope);
const graph = graphBy(read, settings, baseSettings);
skipUnless(graph.size > 0, `code under the roots ${scope.roots.join(', ')}`);

function printFolder(folder) {
    console.log(`${folder}: outgoing ${outsideOf(graph, folder, settings).size}`);
    outsideOf(graph, folder, settings).forEach((to) => console.log(`  imports ${to}`));
}

function printOne() {
    const folder = one.endsWith('/') ? one : `${one}/`;
    if (!graph.has(one) && [...graph.keys()].some((path) => path.startsWith(folder))) {
        printFolder(folder);
        return;
    }
    const copy = read.copies.has(one) ? `: it is a copy laid out from ${read.copies.get(one) ?? 'a package'}, its source is judged` : '';
    const { incoming, outgoing, past, shown, untaken } =
        numbersOf(graph, settings).get(one) ?? stop(`the module «${one}» is not among ${graph.size} read${copy}`);
    console.log(`${one}: incoming ${incoming}, outgoing ${outgoing}, past an entry ${past}, shown ${shown}, taken by nobody ${untaken}`);
    graph.get(one).links.forEach((to) => console.log(`  imports ${to}`));
    [...graph].filter(([, { links }]) => links.has(one)).forEach(([from]) => console.log(`  imported by ${from}`));
}

if (one) {
    if (base) {
        stop('«--module» prints what is now; «was → now» of every module is printed by «--base» alone');
    }
    printOne();
    process.exit(0);
}

const list = parseAllowlist('coupling');
const keys = keysOf(graph, settings);
if (given.has('baseline')) {
    console.log(baselineOf(keys, list));
    process.exit(0);
}

const linksOf = (read) => [...read.values()].reduce((sum, module) => sum + module.links.size, 0);
const counts = Object.entries(countsOf(keys));
const unlisted = keys.filter((key) => !list.keys.has(key));
// A past revision is judged by the history alone: the list of today says nothing about it.
const gone = at ? [] : [...list.keys].filter((key) => !keys.includes(key));
const renamed = unlisted.length > 0 ? `, or write it by the new name: ${unlisted.slice(0, 3).join('; ')}` : '';
const dead = gone.map((key) => `${key}: listed in ${allowlistOf('coupling')}, and the violation is gone — remove the line${renamed}`);

if (!base) {
    console.log(`check-coupling: modules ${graph.size}, links ${linksOf(graph)}, ${counts.map(([name, number]) => `${name} ${number}`).join(', ')}`);
    const problems = [...structureOf(graph, settings, { accepted: list.keys }), ...dead];
    if (problems.length > 0) {
        refuse(problems, 'A cycle is broken by moving the shared part out; an import goes through the entry.');
    }
    process.exit(0);
}

const nowBy = (renames) => {
    const names = new Map([...renames].map(([now, was]) => [was, now]));
    return (path) => names.get(path.replace(/^\.\//, '')) ?? path;
};

/** The graph and the settings of the base, its files named by `renames`. */
function renamedBase(raw, renames) {
    const now = nowBy(renames);
    const aliases = Object.fromEntries(Object.entries(baseSettings.aliases).map(([alias, targets]) => [alias, targets.map(now)]));
    return { graph: underNewPaths(raw, renames), settings: { ...baseSettings, aliases, entries: baseSettings.entries.map(now) } };
}

/** The base. A harness file that became a module, or back, is another file. */
function baseOf() {
    const renames = new Map([...renamesOf(ROOT, fork, at)].filter(([now, was]) => isHarness(now, settings) === isHarness(was, baseSettings)));
    const raw = graphBy(revisionFiles(ROOT, fork, scope), baseSettings, settings);
    const places = placesOf(raw, graph, renames);
    return {
        ...renamedBase(raw, renames),
        placed: renamedBase(raw, places.kept),
        placeName: (path) => (places.kept.has(path) ? path : (renames.get(path) ?? path)),
        nowName: nowBy(renames),
        closed: [...entriesOf(raw, baseSettings).folders.keys()].map(places.today),
        paths: [...raw.keys()],
        keys: keysOf(raw, baseSettings),
    };
}

const before = baseOf();

function printNumbers() {
    const now = numbersOf(graph, settings);
    const was = numbersOf(before.graph, before.settings);
    for (const [path, current] of [...now].sort(([a], [b]) => a.localeCompare(b))) {
        const old = was.get(path);
        if (!old || Object.keys(current).some((field) => old[field] !== current[field])) {
            const pair = (field) => `${old?.[field] ?? 0} → ${current[field]}`;
            console.log(
                `  ${path}: incoming ${pair('incoming')}, outgoing ${pair('outgoing')}, past an entry ${pair('past')}, ` +
                    `taken by nobody ${pair('untaken')} of ${current.shown}`
            );
        }
    }
    [...was].filter(([path]) => !now.has(path)).forEach(([path, { outgoing }]) => console.log(`  ${path}: removed, outgoing was ${outgoing}`));
    newBlockLinks(graph, settings, before).forEach((link) => console.log(`  a new link of blocks: ${link}`));
}

/** Growth nobody named; what was named after the plan is printed and accepted. */
function growthLeft() {
    const plans = ownVersions(ROOT, fork, stood.tasksDir, 'plan.md', at);
    const progress = ownVersions(ROOT, fork, stood.tasksDir, 'progress.md', at);
    const decisions = [...progress.first, ...progress.later].map(decisionsOf);
    // A root named as a folder would answer for the whole tree.
    const withoutRoots = (named) => new Map([...named].filter(([path]) => !scope.roots.some((root) => `${root}/`.startsWith(path))));
    const planned = withoutRoots(namedOf(plans.first.join('\n'), graph));
    const written = [...plans.later, ...decisions, ownMessages(ROOT, fork, at)].join('\n\n');
    const later = withoutRoots(namedOf(written, graph, { overrun: true }));
    const unmarked = withoutRoots(namedOf(written, graph));
    const named = new Map(planned);
    later.forEach((number, path) => named.set(path, Math.max(named.get(path) ?? 0, number)));

    const own = ownPaths(ROOT, fork, at);
    const grown = growthOf(graph, settings, { base: before, own, named, unmarked });
    growthOf(graph, settings, { base: before, own, named: planned })
        .filter(({ path }) => !grown.some((left) => left.path === path))
        .forEach(({ text }) => console.log(`  overrun, named after the plan: ${text}`));
    if (plans.first.length > 0 || existsSync(join(ROOT, stood.tasksDir))) {
        return grown.map(({ text }) => text);
    }
    grown.forEach(({ text }) => console.log(`  grown, the tree keeps no plans: ${text}`));
    return [];
}

/** New cycles and imports past an entry by the settings of the branch and of the base. */
function structureLeft() {
    const byOwner = at ? [] : [...list.accepted, ...list.debt].filter(([, { reason }]) => OWNER_WORDS.test(reason));
    byOwner.forEach(([key, { reason }]) => console.log(`  accepted by the owner: ${key} — ${reason}`));
    // An alias the branch adds frees no file that stood in the base; a new file with an alias is a new entry.
    const isNew = (target) => !before.graph.has(target.replace(/^\.\//, ''));
    const fresh = Object.entries(settings.aliases).filter(([, targets]) => targets.every(isNew));
    const strict = { ...before.settings, aliases: { ...Object.fromEntries(fresh), ...before.settings.aliases } };
    const options = { base: before, accepted: new Set(byOwner.map(([key]) => key)) };
    return [...new Set([settings, strict].flatMap((by) => structureOf(graph, by, options)))];
}

/** What stood in the base and is missing from the list; a tree without a list gets the number alone. */
function printUnlisted() {
    if (list.keys.size === 0 && unlisted.length > 0) {
        console.log(`  not in ${allowlistOf('coupling')}: ${unlisted.length}, the tree keeps no list`);
        return;
    }
    unlisted.forEach((key) => console.log(`  not in ${allowlistOf('coupling')}: ${key}`));
}

printNumbers();
const growth = growthLeft();
const structure = structureLeft();
printUnlisted();
const old = countsOf(before.keys);
console.log(
    `check-coupling: modules ${before.graph.size} → ${graph.size}, links ${linksOf(before.graph)} → ${linksOf(graph)}, ` +
        `${counts.map(([name, number]) => `${name} ${old[name]} → ${number}`).join(', ')}, against ${base}`
);

const problems = [...structure, ...growth, ...dead];
if (problems.length > 0) {
    refuse(
        problems,
        'A cycle is broken by moving the shared part out; an import goes through the entry. Growth is planned, that of the part ' +
            'moved out too: the line of the plan is `path` outgoing N → M. An overrun is the same line with the word «overrun» or ' +
            '«превышение» and the reason after the numbers — among the decisions of the progress or, when the folder of the task ' +
            'is taken apart, in the text of a commit. A line of the list lifts a new violation only when its reason begins with ' +
            'the words of the owner: the owner’s words <date>: «…».'
    );
}
