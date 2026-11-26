/**
 * Keeps fast-glob out of the dot directories. Loaded by `node --import` before Angular Doctor, it
 * does so for every list of the tool; the pass of the check takes `listNoDotDirs` for its own lists.
 *
 * The tool lists its files with `dot: false`, so no file of a dot directory comes into its answer.
 * But the same option judges its ignore list: the one of `node_modules` does not match a path through
 * a dot directory, and fast-glob walks the packages of a working copy lying there, with every link of
 * them — 359–426 seconds against 6–8. A dot directory below the root reads as empty here, which drops
 * the walk and no file. An ignore pattern would not do: none of fast-glob covers `.a/.b` as a directory.
 *
 * The file system is replaced inside fast-glob, so a version without that place stops the run by name.
 * The mark named by `NGDOCTOR_DOT_DIRS_MARK` says that the tool did list its files this way: the
 * variable is set by the check alone, and without it the module does nothing.
 */
import { realpathSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** The methods of `fs` by which fast-glob lists a directory, for its asynchronous and synchronous lists. */
const LISTINGS = { readdir: (...args) => args.at(-1)(null, []), readdirSync: () => [] };

/** The file system `fs` whose dot directories below `root` are empty; `used` is told of every listing. */
export function listNoDotDirs(root, fs, used) {
    const guarded = Object.entries(LISTINGS).map(([method, empty]) => [
        method,
        (dir, ...rest) => {
            used();
            const inside = relative(root, String(dir))
                .split(sep)
                .some((name) => name.startsWith('.') && name !== '..');
            return inside ? empty(dir, ...rest) : fs[method](dir, ...rest);
        },
    ]);
    return { ...fs, ...Object.fromEntries(guarded) };
}

/** Replaces the file system of every list of the tool's fast-glob; returns the reason it could not. */
function keepOut(mark) {
    const tool = createRequire(realpathSync(join(ROOT, 'node_modules', '@abiramcodes', 'angular-doctor', 'package.json')));
    const tasks = tool(join(dirname(tool.resolve('fast-glob/package.json')), 'out', 'managers', 'tasks.js'));
    const generate = tasks.generate;
    if (typeof generate !== 'function') return 'its module of tasks has no function «generate»';
    tasks.generate = (patterns, settings) => {
        settings.fs = listNoDotDirs(settings.cwd, settings.fs, () => writeFileSync(mark, ''));
        return generate(patterns, settings);
    };
    return null;
}

if (process.env.NGDOCTOR_DOT_DIRS_MARK) {
    let why;
    try {
        why = keepOut(process.env.NGDOCTOR_DOT_DIRS_MARK);
    } catch (error) {
        why = error.message.split('\n')[0];
    }
    if (why) {
        console.error(`ngdoctor-dot-dirs: the fast-glob of angular-doctor does not skip the dot directories: ${why}`);
        process.exit(1);
    }
}
