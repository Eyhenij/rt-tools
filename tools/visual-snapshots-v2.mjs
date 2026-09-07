#!/usr/bin/env node
/**
 * The snapshot run of the second kit's showcase.
 *
 * Three things `test-storybook` itself does not do and cannot do:
 *
 * 1. **It recognises the showcase by the address.** The showcases of the two kits are both
 *    storybooks, told apart only by their content. A run pointed at a foreign one or at one left
 *    from last time gives either a heap of stories not found or, worse, a matching of foreign frames
 *    against the second kit's references — and the reason is looked for in the harness while it is
 *    in the port.
 * 2. **It catches orphaned references.** A story is renamed and its frame stays: such a reference is
 *    eternally green, because the run does not open it. After several waves the directory stops
 *    answering the question what is checked, while the weight grows from files nobody matches.
 * 3. **It keeps a pointed re-take apart from a re-take of the whole directory.** A re-take of
 *    everything at once erases the divergence that was not expected as well, so it is a separate
 *    command with an explicit sign rather than the default.
 *
 * The agreement is `docs/specs/ui-kit-v2/`.
 *
 *   node tools/visual-snapshots-v2.mjs                      # matching against the references
 *   node tools/visual-snapshots-v2.mjs --update '<file>'    # a re-take of the named story files
 *   node tools/visual-snapshots-v2.mjs --update-all         # a re-take of the whole directory
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** The address of an already raised showcase: the run raises none of its own. */
const URL = process.env.STORYBOOK_URL ?? 'http://localhost:6007';

/** The second kit's showcase settings are its own, there are none shared with the first kit. */
const CONFIG_DIR = 'projects/ui-kit-v2/.storybook';

/** The references directory lies next to the showcase: they are read together with the stories. */
const SNAPSHOT_DIR = `${CONFIG_DIR}/__snapshots__`;

/** By this path in the showcase's stories it is recognised that the address holds the second kit. */
const OWN_IMPORT_MARKER = 'projects/ui-kit-v2/';

function fail(message) {
    console.error(`\n  ${message}\n`);
    process.exit(1);
}

/**
 * It recognises the showcase by its story index.
 *
 * The sign is the source path: at the second kit every story lies under `projects/ui-kit-v2/`.
 * Titles are no good for this — `Components/Button` exists at both kits.
 */
async function requireOwnShowcase() {
    let index;

    try {
        const response = await fetch(`${URL}/index.json`);
        if (!response.ok) {
            fail(`At the address ${URL} the showcase gave no story index (${response.status}). Raise it: pnpm run storybook:ui-kit-v2`);
        }
        index = await response.json();
    } catch (error) {
        fail(`At the address ${URL} nobody answers (${error.message}). Raise the showcase: pnpm run storybook:ui-kit-v2`);
    }

    const entries = Object.values(index.entries ?? {});
    if (entries.length === 0) {
        fail(`At the address ${URL} the showcase has not one story — there is nothing to match.`);
    }

    const own = entries.filter((entry) => (entry.importPath ?? '').includes(OWN_IMPORT_MARKER));
    if (own.length === 0) {
        const sample = entries[0]?.importPath ?? '—';
        fail(
            `At the address ${URL} it is not the second kit's showcase that answers: the stories come from «${sample}», and were expected from «${OWN_IMPORT_MARKER}».`
        );
    }

    return own.length;
}

/**
 * It matches the references directory against the registry of what was taken.
 *
 * The registry is written by the harness on every taken frame; everything lying in the directory and
 * not named in the registry was matched by nothing.
 */
function requireNoOrphans(registryPath) {
    if (!existsSync(SNAPSHOT_DIR)) {
        return 0;
    }

    const taken = new Set(
        existsSync(registryPath)
            ? readFileSync(registryPath, 'utf8')
                  .split('\n')
                  .map((line) => line.trim())
                  .filter((line) => line !== '')
            : []
    );

    const stored = readdirSync(SNAPSHOT_DIR).filter((name) => name.endsWith('.png'));
    const orphans = stored.filter((name) => !taken.has(name.replace(/\.png$/, '')));

    if (orphans.length > 0) {
        fail(
            `References that have no story (${orphans.length}):\n    ${orphans.join('\n    ')}\n\n` +
                `  They are eternally green — the run does not open them. Remove them or bring back the story they belonged to.`
        );
    }

    return stored.length;
}

const args = process.argv.slice(2);
const updateAll = args.includes('--update-all');
const updateIndex = args.indexOf('--update');
const updateOne = updateIndex >= 0 ? args[updateIndex + 1] : undefined;

if (updateIndex >= 0 && (updateOne === undefined || updateOne.startsWith('--'))) {
    fail(
        `The re-take goes by the named story file: --update '<path sample>'. A re-take of the whole directory is a separate command --update-all.`
    );
}

const own = await requireOwnShowcase();
console.log(`The second kit's showcase on ${URL}: stories ${own}.`);

const registryDir = mkdtempSync(join(tmpdir(), 'rt-snapshots-'));
const registryPath = join(registryDir, 'taken.txt');
writeFileSync(registryPath, '');

/**
 * How many stories are opened at once.
 *
 * There is one showcase at the address, and Jest's default — a thread per core — outruns it: the
 * story's application does not manage to come up, the readiness wait inside the showcase builder
 * ends empty, and the story falls with «no elements in sequence». On this machine six threads gave
 * from two to nine such refusals per session, four gave one, two gave none over three sessions in a row.
 *
 * A retry does not cure this on purpose: a retry turns a flickering story green on the second
 * attempt, and the rule about a frame's determinacy becomes uncheckable. It is cured by ceasing to
 * overload the showcase.
 */
const MAX_WORKERS = '2';

const runnerArgs = ['test-storybook', '--config-dir', CONFIG_DIR, '--url', URL, '--maxWorkers', MAX_WORKERS];

if (updateAll) {
    runnerArgs.push('--', '-u');
} else if (updateOne !== undefined) {
    // The sample selects story files by path rather than by story name. A selection by name (`-t`)
    // is no good here at all: with it the run's environment creates no page, and all the files fall
    // with `Cannot read properties of undefined (reading 'goto')` — the same at the first kit.
    // Checked flag by flag: `-u` works, `-t` breaks.
    runnerArgs.push('--', '-u', updateOne);
}

const run = spawnSync('pnpm', ['exec', ...runnerArgs], {
    stdio: 'inherit',
    env: {
        ...process.env,
        RT_SNAPSHOT_REGISTRY: registryPath,
        // The showcase settings the run reads in Node, and the states addon does not load in Node: it
        // touches `Element` at the top level. Without this sign the import falls, the environment is
        // left without a page, and all the stories fall with `undefined (reading 'goto')`.
        // The showcase itself is not affected — it is raised apart and with all the addons.
        RT_SNAPSHOT_RUN: '1',
        // A reference appears on the disk only in a re-take session: in an ordinary run a missing
        // reference is a refusal, not a reason to append it.
        RT_SNAPSHOT_UPDATE: updateAll || updateOne !== undefined ? '1' : '0',
    },
});

// The orphaned are looked for after a red run too: otherwise they are learned of only when
// everything else matches, that is, last of all.
let stored = 0;
try {
    // A pointed re-take opens not the whole directory, and everything it did not touch would look
    // orphaned. The directory is matched only on a full session.
    if (updateOne === undefined) {
        stored = requireNoOrphans(registryPath);
    }
} finally {
    rmSync(registryDir, { recursive: true, force: true });
}

if (run.status !== 0) {
    process.exit(run.status ?? 1);
}

console.log(`References in the directory: ${stored}. There are no orphaned ones.`);
