/**
 * It clears the hot update leftovers out of the showcase build cache before the showcase starts.
 *
 * Why it exists. The showcase keeps its build in `node_modules/.cache/storybook`, and every hot
 * update writes a pair of files there named by the build hash. Nobody removes them: 5860 of them
 * had piled up in this tree by the day this was written. A showcase started over such a cache
 * serves a runtime asking for an update of a hash that is gone, the request answers 404 forty to
 * sixty times per page, and every story hangs at preparing for ever — while the story index is
 * whole and answers 200. Neither a page reload nor a restart of the showcase cures it: the
 * leftovers outlive both.
 *
 * So they are removed at the start, and only they: the compiled bundles next to them are what
 * makes the second start faster than the first, and removing those would cost minutes on every
 * raising of the showcase.
 */
import { readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Where the showcase keeps its build between runs. */
const CACHE_ROOT = join(process.cwd(), 'node_modules/.cache/storybook');

/** The mark of a hot update file: the build hash stands between the name and the extension. */
const LEFTOVER = /hot-update/;

/** Everything under the directory, as paths; a directory that is not there gives nothing. */
function filesUnder(directory) {
    let entries = [];

    try {
        entries = readdirSync(directory);
    } catch {
        return [];
    }

    return entries.flatMap((entry) => {
        const path = join(directory, entry);

        try {
            return statSync(path).isDirectory() ? filesUnder(path) : [path];
        } catch {
            return [];
        }
    });
}

const leftovers = filesUnder(CACHE_ROOT).filter((path) => LEFTOVER.test(path));

for (const path of leftovers) {
    try {
        rmSync(path);
    } catch {
        // A file somebody removed in between is already what this call wanted.
    }
}

console.log(`showcase-cache-clean: hot update leftovers removed ${leftovers.length}`);
