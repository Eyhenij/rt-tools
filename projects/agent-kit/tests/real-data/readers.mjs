#!/usr/bin/env node
/**
 * The readers of real data in the package and whether a suite runs them on saved data.
 *
 *   node readers.mjs <assets dir> <tests dir>
 *
 * A reader of the conversation record is a file whose code names the record and opens a file:
 * `readFileSync`, `jq -s` or `tail -n` next to `transcript`, `RT_FLOW_TRANSCRIPT` or `readRecord`.
 * A reader of the hosting is a file whose code calls the hosting client: `ghJson(`, `graphql(`,
 * `gh([`, or a shell `gh api|pr|issue|run|project`. Comments do not count: a file that only speaks
 * of `gh pr merge` calls nothing.
 *
 * A reader is run on saved data when the code of a suite that reads `fixtures/real-` — or of a
 * helper under `real-data/` — names it: a suite keeps the path in a variable and calls the variable,
 * so the call line itself names nothing. A file such a run imports is run with it. The name of a laid-out file is matched too: `checks/check-board.github.mjs`
 * runs as `tools/check-board.mjs`, `hooks/x.sh` as `.claude/hooks/x.sh`.
 *
 * Prints `no run on saved data: <file>` for each reader without a run, then
 * `real data: N of M readers`; exits 1 when one is missing.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';

const code = (text) =>
    text
        .split('\n')
        .filter((line) => !/^\s*(#|\*|\/\/|\/\*)/.test(line))
        .join('\n');

const RECORD_NAME = /RT_FLOW_TRANSCRIPT|transcript|readRecord/;
// The sign errs towards firing: a reader it misses is never seen, one it names needlessly is seen at
// once. A file is opened by a read call in a script or by a reading tool in a shell hook.
const RECORD_OPEN = /readFileSync|readFile\(|createReadStream|\bjq\b|\btail -n|\bgrep\b|\bcat\b/;
const HOST_CALL =
    /ghJson\(|graphql\(|\bgh\(\[|(execFileSync|spawnSync|execFile|spawn)\(\s*['"]gh['"]|api\.github\.com|(^|[;&|(]|\$\()\s*("?\$\{?GH[A-Z_]*\}?"?|gh) (api|pr|issue|run|project) /m;

/**
 * readers.mjs — what does not count as a reader without a run of its own: a command that writes to
 * the hosting and asks it only on the way to the write, and a file that hands the record to readers
 * run on the cut. Every entry names its reason and the task that added it; an entry no reader
 * answers refuses.
 */
const EXCEPTIONS = [
    {
        file: 'task-new.github.mjs',
        reason: 'creates a task card on the hosting and has no run without the write; it is a command, not a check',
        task: 'RT-3277',
    },
    {
        file: 'task-flow-script.mjs',
        reason: 'hands the record to readRecord of flow-plan.mjs and to the owner and session sources; each runs on the cut',
        task: 'RT-3277',
    },
];

const filesOf = (dir, ext) =>
    existsSync(dir)
        ? readdirSync(dir)
              .filter((f) => f.endsWith(ext))
              .map((f) => join(dir, f))
        : [];

/** The readers under an assets directory: `{ file, reads }`, `reads` one of `record`, `hosting`. */
export function readersOf(assets) {
    const out = [];
    const files = [
        ...filesOf(join(assets, 'hooks'), '.sh'),
        ...filesOf(join(assets, 'checks'), '.mjs'),
        ...filesOf(join(assets, 'task-flow', 'source'), '.mjs'),
    ];
    for (const file of files) {
        // A hook that hands the record path to the facts of `facts.sh` only, or tests the file is
        // there, reads nothing itself: `facts.sh` is the reader then.
        const body = code(readFileSync(file, 'utf8'))
            .split('\n')
            .filter((line) => !(file.endsWith('.sh') && (/rt_fact_/.test(line) || /^\s*\[ -[fzn] /.test(line))))
            .join('\n');
        const reads = [RECORD_NAME.test(body) && RECORD_OPEN.test(body) && 'record', HOST_CALL.test(body) && 'hosting'].filter(Boolean);
        if (reads.length > 0) out.push({ file, reads: reads.join(', ') });
    }
    return out;
}

/** The names a file is called by: its own, and the laid-out one. */
const namesOf = (file) => {
    const name = basename(file);
    return [...new Set([name, name.replace('.github.', '.')])];
};

/** The files a script imports, by relative path. */
const importsOf = (file) =>
    [...readFileSync(file, 'utf8').matchAll(/(?:from|import\()\s*['"](\.{1,2}\/[^'"]+)['"]/g)].map((m) => resolve(dirname(file), m[1]));

/**
 * The runs on saved data: the code of the suites that read `fixtures/real-` and of their helpers, and
 * the files those import. A name is looked for only in the code of the suites and the helpers: a
 * package file a helper imports may name another reader in a path, and that names no run.
 */
export function runsOf(tests) {
    const root = resolve(tests);
    // By the code, not the comments: a suite that only speaks of saved data runs nothing on them.
    const suites = filesOf(tests, '.test.sh').filter((file) => /fixtures\/real-/.test(code(readFileSync(file, 'utf8'))));
    const helpers = filesOf(join(tests, 'real-data'), '.mjs').concat(filesOf(join(tests, 'real-data'), '.sh'));
    const calls = [];
    const seen = new Set();
    const queue = [...suites, ...helpers];
    while (queue.length > 0) {
        const file = queue.shift();
        if (seen.has(file) || !existsSync(file)) continue;
        seen.add(file);
        // The whole code of the file, not only its call lines: a suite keeps the path of a reader in a
        // variable and calls the variable, and the call line names no file.
        if (resolve(file).startsWith(root)) calls.push(code(readFileSync(file, 'utf8')));
        if (file.endsWith('.mjs')) queue.push(...importsOf(file));
    }
    return { calls: calls.join('\n'), files: seen };
}

/** A name stands in code as a name: after a path separator, a quote or a space, not inside a longer one. */
const named = (text, name) => new RegExp(`(^|[\\s/'"\`=])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'm').test(text);

export function judge(assets, tests) {
    const readers = readersOf(assets);
    const { calls, files } = runsOf(tests);
    // A reader imported by a run is run with it; the imports of a laid-out file are followed in
    // the package, where the reader lies.
    const imported = new Set();
    const queue = readers
        .filter((r) => namesOf(r.file).some((n) => named(calls, n)) || files.has(resolve(r.file)))
        .map((r) => resolve(r.file));
    while (queue.length > 0) {
        const file = queue.shift();
        if (imported.has(file)) continue;
        imported.add(file);
        for (const next of importsOf(file)) {
            const candidates = [next, next.replace(/\.mjs$/, '.github.mjs')];
            for (const candidate of candidates) if (existsSync(candidate)) queue.push(candidate);
        }
    }
    const written = new Set(EXCEPTIONS.map((w) => w.file));
    const missing = readers.filter((r) => !imported.has(resolve(r.file)) && !written.has(basename(r.file)));
    const dead = EXCEPTIONS.filter((w) => !readers.some((r) => basename(r.file) === w.file)).map((w) => w.file);
    const counted = readers.filter((r) => !written.has(basename(r.file)));
    return { readers: counted, missing, dead };
}

if (import.meta.url === `file://${process.argv[1]}`) {
    const [assets, tests] = process.argv.slice(2);
    const { readers, missing, dead } = judge(assets, tests);
    for (const reader of missing) console.log(`no run on saved data: ${basename(reader.file)} (${reader.reads})`);
    for (const file of dead) console.log(`an exception entry nothing answers: ${file}`);
    console.log(`real data: ${readers.length - missing.length} of ${readers.length} readers`);
    process.exit(missing.length > 0 || dead.length > 0 ? 1 : 0);
}
