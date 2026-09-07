#!/usr/bin/env node
/**
 * Does the publication pipeline rebuild the dependency lock after publishing and open a request with it.
 *
 * Why this exists. The publication pipeline raises the package's version and the versions by which
 * the packages name one another, and left the lock as it was. The divergence stays silent until the
 * next publication: it installs the dependencies from the frozen lock, sees the former versions there
 * and falls — and the release that falls is not the one that created the divergence. A whole series
 * of releases stopped that way, and each was unblocked by a lock rebuilt by hand.
 *
 * Where the rebuild stands is judged too. Put before the publication, it asks the registry for the
 * version the raise has just written into the dependent packages — and the registry does not hold it
 * yet, and the very first release of the core stopped on that. So the rebuild goes after the
 * publication step, and behind it stands a request step of its own: without it the rebuilt lock stays
 * on the runner.
 *
 * The pipeline files themselves are judged rather than a run: a run happens once in several weeks and
 * only at the owner's, while a pipeline is created as a copy of a neighbouring one — and the seventh
 * will silently fall out of the six that were fixed.
 *
 * A non-zero exit code and a list of the pipelines with a divergence.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** The pipelines directory is overridden by a variable: the probe set judges a fixture tree, not its own. */
const DIR = process.env.RT_WORKFLOWS_DIR || join(ROOT, '.github/workflows');

/** The sign of a publishing pipeline: it raises the package's version by a script of its own. */
const RAISES_VERSION = /^\s*node update-version[\w-]*\.cjs /m;

/** The lock rebuild. It has one call shape, and there is nothing to find it by a script name. */
const RESYNC = /^\s*pnpm install --lockfile-only\b/m;

/** The publication step: the package-packing command is the only thing that calls the registry for writing. */
const PUBLISHES = /^\s*run: pnpm run packagr[\w:-]*\s*$/m;

/** The step that opens a request. Each one is looked for: a pipeline has two — about the version and about the lock. */
const COMMITS = /^\s*- uses: EndBug\/add-and-commit/gm;

const problems = [];
const files = readdirSync(DIR)
    .filter((name) => name.endsWith('.yml') || name.endsWith('.yaml'))
    .sort();

let judged = 0;

for (const name of files) {
    const text = readFileSync(join(DIR, name), 'utf8');

    if (!RAISES_VERSION.test(text)) {
        continue;
    }

    judged += 1;

    const resync = RESYNC.exec(text);

    if (!resync) {
        problems.push(`${name}: it raises the version and does not rebuild the dependency lock — the next publication will stop on a frozen install`);
        continue;
    }

    const publish = PUBLISHES.exec(text);

    if (publish && resync.index < publish.index) {
        problems.push(`${name}: the lock is rebuilt before the publication — the version written into the dependent packages is not in the registry yet, and there is nothing to resolve it by`);
        continue;
    }

    const commitsAfter = [...text.matchAll(COMMITS)].filter((match) => match.index > resync.index);

    if (commitsAfter.length === 0) {
        problems.push(`${name}: after the lock rebuild there is no step opening a request — the rebuilt lock will stay on the runner`);
    }
}

if (judged === 0) {
    console.error(`check-publish-lockfile: «${DIR}» holds not one pipeline raising a version — there is nothing to judge`);
    process.exit(1);
}

if (problems.length === 0) {
    console.log(`check-publish-lockfile: publishing pipelines ${judged}, all rebuild the lock after the publication and open a request with it`);
    process.exit(0);
}

console.error(`check-publish-lockfile: publishing pipelines ${judged}, with a divergence ${problems.length}\n`);
problems.forEach((line) => console.error(line));
process.exit(1);
