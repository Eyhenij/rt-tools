#!/usr/bin/env node
/**
 * Builds the code graphs of the tree: one for the whole repository at its root and one for every
 * project directory under `projects/`, `apps/` and `libs/`.
 *
 * The graphs are built by `graphify update`, which reads the syntax of the code and asks no
 * language model, so the same head gives the same graph on any machine. Only `graph.json` of each
 * graph lies in history; the cache, the report and the HTML view are rebuilt by this same command
 * and are ignored.
 *
 * A graph is fresh when its `built_at_commit` is the head it was built from. The pattern
 * `task-flow-graph` reads that field before the first exploration of a turn and names what changed
 * since.
 *
 * Usage: `npm run graph:build` — all graphs; `npm run graph:build -- projects/utils apps/x` — only
 * the named directories.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const PROJECT_PARENTS = ['projects', 'apps', 'libs'];

function projectDirs() {
    return PROJECT_PARENTS.flatMap((parent) => {
        const dir = join(ROOT, parent);
        if (!existsSync(dir)) {
            return [];
        }
        return readdirSync(dir)
            .filter((name) => !name.startsWith('.') && statSync(join(dir, name)).isDirectory())
            .sort()
            .map((name) => `${parent}/${name}`);
    });
}

function stampHead(target) {
    const file = join(ROOT, target, 'graphify-out', 'graph.json');
    const head = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).stdout.trim();
    const text = readFileSync(file, 'utf8');
    writeFileSync(file, text.replace(/"built_at_commit": "[0-9a-f]*"/, `"built_at_commit": "${head}"`));
}

function build(target) {
    const started = Date.now();
    const run = spawnSync('graphify', ['update', target, '--force'], { cwd: ROOT, encoding: 'utf8' });
    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    if (run.error) {
        console.error(`graphs-build: graphify is not installed — ${run.error.message}`);
        process.exit(1);
    }
    const said = `${run.stdout}${run.stderr}`;
    // graphify leaves a graph whose topology did not change untouched, and its `built_at_commit`
    // then names an older head. The graph is proven equal to this head, so the field is moved to
    // it: otherwise the freshness check reads a stale commit and asks for a rebuild that changes
    // nothing.
    if (run.status === 0 && /No code-graph topology changes/.test(said)) {
        stampHead(target);
        console.log(`= ${target}: unchanged, stamped with the head in ${seconds}s`);
        return true;
    }
    const rebuilt = /Rebuilt: ([^\n]+)/.exec(said);
    if (run.status !== 0 || !rebuilt) {
        console.error(`graphs-build: ${target} failed in ${seconds}s\n${run.stdout}${run.stderr}`);
        return false;
    }
    console.log(`+ ${target}: ${rebuilt[1]} in ${seconds}s`);
    return true;
}

const named = process.argv.slice(2);
const targets = named.length > 0 ? named : ['.', ...projectDirs()];
const failed = targets.filter((target) => !build(target));

if (failed.length > 0) {
    console.error(`graphs-build: ${failed.length} of ${targets.length} graphs failed: ${failed.join(', ')}`);
    process.exit(1);
}
console.log(`graphs-build: ${targets.length} graphs built`);
