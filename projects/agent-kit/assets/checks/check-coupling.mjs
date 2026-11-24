#!/usr/bin/env node
/**
 * The coupling of the modules: a new cycle of modules or of blocks, a new import past an entry and
 * outgoing links grown past what the plan of the branch named are refused.
 *
 *   node check-coupling.mjs                        the tree against the list of the accepted
 *   node check-coupling.mjs --base=<revision>      the branch against the base: «was → now», the growth
 *   node check-coupling.mjs --base=… --at=<rev>    a past revision instead of the working tree
 *   node check-coupling.mjs --module=<path>        the numbers of one module — the «now» of a plan
 *   node check-coupling.mjs --baseline             the list as it would be written
 *
 * With a base the list does not lift what the branch added, unless the owner's words stand in the reason
 * of the line; such a line is printed. The settings of the base are in force together with those of the
 * branch: a branch does not loosen the check it is judged by.
 *
 * Growth is judged by the own commits of the branch against the first version of its plan. A number named
 * later — in the plan or in the progress, with its reason — is accepted and printed as an overrun.
 *
 * What is judged — `coupling-judge.mjs`, what is counted — `coupling-numbers.mjs`, which imports are
 * seen — `coupling-graph.mjs`. A non-zero exit code and a line per violation.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { graphOf } from './coupling-graph.mjs';
import { countsOf, growthOf, keysOf, newBlockLinks, structureOf } from './coupling-judge.mjs';
import { numbersOf } from './coupling-numbers.mjs';
import { namedOf } from './coupling-plan.mjs';
import {
    RevisionMissing,
    aliasesFrom,
    forkOf,
    ownPaths,
    ownVersions,
    renamesOf,
    revisionFiles,
    textAt,
    treeFiles,
} from './coupling-read.mjs';
import { CONFIG, CONFIG_PATH, ROOT, allowlistOf, baselineOf, configFrom, parseAllowlist, skipUnless } from './rt-kit-checks.config.mjs';

const OWNER_WORDS = /(?:слов\p{L}* владельца|owner's words?)[^«"]*\d{2}\.\d{2}[^«"]*[«"][^»"]+[»"]/iu;
const argument = (name) => process.argv.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3) ?? null;

function refuse(problems, hint) {
    console.error(`\ncheck-coupling: violations ${problems.length}\n`);
    problems.forEach((line) => console.error(`  ${line}`));
    console.error(`\n${hint}`);
    process.exit(1);
}

const base = argument('base');
const at = argument('at');

/** The point the branch left the base at; null — no base is named. */
function forkOrExit() {
    try {
        return base || at ? forkOf(ROOT, base ?? 'HEAD', at ?? 'HEAD') : null;
    } catch (error) {
        if (!(error instanceof RevisionMissing)) {
            throw error;
        }
        console.error(`check-coupling: ${error.message}`);
        return process.exit(1);
    }
}

const fork = forkOrExit();
const stood = fork ? configFrom(textAt(ROOT, fork, CONFIG_PATH)) : CONFIG;
const rootsOf = (config) => [...config.sourceRoots, ...config.coupling.extraRoots];
const scope = {
    roots: [...new Set([...rootsOf(CONFIG), ...rootsOf(stood)])],
    skipped: CONFIG.skippedDirs.filter((dir) => stood.skippedDirs.includes(dir)),
};

function aliasesAt(revision) {
    const path = join(ROOT, CONFIG.coupling.aliasesFile);
    const text = revision ? textAt(ROOT, revision, CONFIG.coupling.aliasesFile) : existsSync(path) && readFileSync(path, 'utf8');
    const aliases = text ? aliasesFrom(text) : {};
    if (aliases === null) {
        console.log(`check-coupling: ${CONFIG.coupling.aliasesFile} does not parse, imports by an alias are not seen`);
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

const settings = settingsOf(CONFIG, aliasesAt(at));
const graph = graphOf(at ? revisionFiles(ROOT, at, scope) : treeFiles(ROOT, scope), settings);
skipUnless(graph.size > 0, `code under the roots ${scope.roots.join(', ')}`);

const one = argument('module');
if (one) {
    const numbers = numbersOf(graph, settings).get(one);
    if (!numbers) {
        console.error(`check-coupling: the module «${one}» is not among ${graph.size} read`);
        process.exit(1);
    }
    const { incoming, outgoing, past, shown, untaken } = numbers;
    console.log(`${one}: incoming ${incoming}, outgoing ${outgoing}, past an entry ${past}, shown ${shown}, taken by nobody ${untaken}`);
    process.exit(0);
}

const list = parseAllowlist('coupling');
const keys = keysOf(graph, settings);
if (process.argv.includes('--baseline')) {
    console.log(baselineOf(keys, list));
    process.exit(0);
}

const linksOf = (given) => [...given.values()].reduce((sum, module) => sum + module.links.size, 0);
const counts = Object.entries(countsOf(keys));
// A past revision is judged by the history alone: the list of today says nothing about it.
const gone = at ? [] : [...list.keys].filter((key) => !keys.includes(key));
const dead = gone.map((key) => `${key}: listed in ${allowlistOf('coupling')}, and the violation is gone — remove the line`);

if (!base) {
    console.log(`check-coupling: modules ${graph.size}, links ${linksOf(graph)}, ${counts.map(([name, number]) => `${name} ${number}`).join(', ')}`);
    const problems = [...structureOf(graph, settings, { accepted: list.keys }), ...dead];
    if (problems.length > 0) {
        refuse(problems, 'A cycle is broken by moving the shared part out; an import goes through the entry.');
    }
    process.exit(0);
}

const baseSettings = settingsOf(stood, aliasesAt(fork));
const before = {
    settings: baseSettings,
    graph: graphOf(revisionFiles(ROOT, fork, scope), baseSettings),
    renames: renamesOf(ROOT, fork, at),
};
const wasName = (path) => before.renames.get(path) ?? path;

function printNumbers() {
    const now = numbersOf(graph, settings);
    const was = numbersOf(before.graph, baseSettings);
    for (const [path, current] of [...now].sort(([a], [b]) => a.localeCompare(b))) {
        const old = was.get(wasName(path));
        if (!old || Object.keys(current).some((field) => old[field] !== current[field])) {
            const pair = (field) => `${old?.[field] ?? 0} → ${current[field]}`;
            console.log(
                `  ${path}: incoming ${pair('incoming')}, outgoing ${pair('outgoing')}, past an entry ${pair('past')}, ` +
                    `taken by nobody ${pair('untaken')} of ${current.shown}`
            );
        }
    }
    newBlockLinks(graph, settings, before).forEach((link) => console.log(`  a new link of blocks: ${link}`));
}

/** Growth nobody named; what was named after the plan is printed and accepted. */
function growthLeft() {
    const plans = ownVersions(ROOT, fork, stood.tasksDir, 'plan.md', at);
    const progress = ownVersions(ROOT, fork, stood.tasksDir, 'progress.md', at);
    // A root named as a folder would answer for the whole tree.
    const withoutRoots = (named) => new Map([...named].filter(([path]) => !scope.roots.some((root) => `${root}/`.startsWith(path))));
    const planned = withoutRoots(namedOf(plans.first.join('\n'), graph));
    const later = withoutRoots(namedOf([...plans.later, ...progress.first, ...progress.later].join('\n'), graph, { reasoned: true }));
    const named = new Map(planned);
    later.forEach((number, path) => named.set(path, Math.max(named.get(path) ?? 0, number)));

    const own = ownPaths(ROOT, fork, at);
    const grown = growthOf(graph, settings, { base: before, own, named });
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
    const isNew = (target) => !before.graph.has(wasName(target.replace(/^\.\//, '')));
    const fresh = Object.entries(settings.aliases).filter(([, targets]) => targets.every(isNew));
    const strict = { ...baseSettings, aliases: { ...Object.fromEntries(fresh), ...baseSettings.aliases } };
    const options = { base: before, accepted: new Set(byOwner.map(([key]) => key)) };
    return [...new Set([settings, strict].flatMap((given) => structureOf(graph, given, options)))];
}

printNumbers();
const growth = growthLeft();
const structure = structureLeft();
if (structure.length === 0 && list.keys.size > 0) {
    keys.filter((key) => !list.keys.has(key)).forEach((key) => console.log(`  old, not in ${allowlistOf('coupling')}: ${key}`));
}
const old = countsOf(keysOf(before.graph, baseSettings));
console.log(
    `check-coupling: modules ${before.graph.size} → ${graph.size}, links ${linksOf(before.graph)} → ${linksOf(graph)}, ` +
        `${counts.map(([name, number]) => `${name} ${old[name]} → ${number}`).join(', ')}, against ${base}`
);

const problems = [...structure, ...growth, ...dead];
if (problems.length > 0) {
    refuse(
        problems,
        'A cycle is broken by moving the shared part out; an import goes through the entry. Growth is planned: the line of ' +
            'the plan is `path` outgoing N → M, and an overrun is the same line among the decisions of the progress, with its ' +
            'reason after the numbers.'
    );
}
