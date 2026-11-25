/**
 * Loaded by `node --import` before Angular Doctor: keeps its fast-glob out of the dot directories.
 *
 * The tool lists its files with `dot: false`, so no file of a dot directory comes into its answer.
 * But the same option judges its ignore list: the one of `node_modules` does not match a path through a
 * dot directory, and fast-glob walks the packages of a working copy lying there, with every link of
 * them — 359–426 seconds against 6–8. The ignore added here drops the walk and no file.
 *
 * The place it is added at is inside fast-glob, so a version without it stops the run by name: a
 * run that is only slow again would say nothing.
 */
import { realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { DOT_DIRS } from './check-ngdoctor-pass.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Adds the ignore to every task of the tool's fast-glob; returns the reason it could not. */
function keepOut() {
    const tool = createRequire(realpathSync(join(ROOT, 'node_modules', '@abiramcodes', 'angular-doctor', 'package.json')));
    const tasks = tool(join(dirname(tool.resolve('fast-glob/package.json')), 'out', 'managers', 'tasks.js'));
    const generate = tasks.generate;
    if (typeof generate !== 'function') return 'its module of tasks has no function «generate»';
    tasks.generate = (patterns, settings) => {
        settings.ignore = [...settings.ignore, DOT_DIRS];
        return generate(patterns, settings);
    };
    return null;
}

let why;
try {
    why = keepOut();
} catch (error) {
    why = error.message.split('\n')[0];
}
if (why) {
    console.error(`ngdoctor-dot-dirs: the fast-glob of angular-doctor takes no ignore of the dot directories: ${why}`);
    process.exit(1);
}
