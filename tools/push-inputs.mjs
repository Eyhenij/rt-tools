#!/usr/bin/env node
// rt-kit v0.37.0 · checks/push-inputs.mjs · 18549edec93d · правится надстройкой, не здесь
/**
 * Which steps of the push set a change can reach. A step runs when the change touches what it
 * reads; a step the change cannot reach is not started.
 *
 *   node tools/push-inputs.mjs record          the steps on stdin, or the profile set when stdin is
 *                                               empty: each runs once under `push-trace.mjs`, and the
 *                                               table of what it read is written
 *   node tools/push-inputs.mjs select <base>   the steps on stdin; the ones to run go to stdout, a
 *                                               line per step with its reason to stderr
 *   node tools/push-inputs.mjs verify          the table steps are recorded again; a read the table
 *                                               does not cover is a refusal
 *
 * What a step reads is taken from a record of its own calls, not from a list someone wrote: such a
 * list checks itself and goes stale silently. The table is generated and is not edited by hand.
 *
 * A step runs when the change:
 *   - edits a file whose content it read, or a file with an extension it read inside a directory it
 *     walked;
 *   - adds, removes or renames a file inside a directory it walked, or a path whose existence it
 *     probed — an existence probe does not depend on what the file holds;
 *   - touches the step itself — its file and what that file imports.
 * A step runs always when it reads the history (`git diff`, `git log` and the like): its answer
 * changes without a change of the tree; when it starts a process of another kind, whose reads the
 * recorder does not see; and when it is not in the table at all.
 *
 * FAIL-OPEN: no table, no base, a change list that cannot be read — every step runs, as before.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { BASH_RECORDER, redirectsInput, shellLine } from './push-shell.mjs';

const ROOT = process.cwd();
const HERE = dirname(fileURLToPath(import.meta.url));
const TRACER = join(HERE, 'push-trace.mjs');
const TABLE_DEFAULT = '.claude/rt-kit/push-inputs.json';
const IGNORED = /^(node_modules|\.git|dist|\.nx|\.angular|tmp|coverage)(\/|$)|\/node_modules\//;
const TRACEABLE = /^(node\s+\S+\.m?js|pnpm run [\w:.-]+)(\s|$)/;
const HEAVY = /(^|\s)nx\s|docker |playwright|e2e|visual-gate|serve:/;
const LISTING = new Set(['ls-files', 'ls-tree', 'check-ignore', 'check-attr', 'status', 'config', 'hash-object', 'var']);
const VERIFY = /push-inputs\.mjs verify/;
const HISTORY_OF_PATHS = new Set(['log', 'diff', 'show', 'rev-list', 'blame']);

const args = process.argv.slice(2);
const option = (name) => {
    const at = args.indexOf(name);
    return at >= 0 ? args[at + 1] : undefined;
};
const tablePath = resolve(ROOT, option('--table') ?? TABLE_DEFAULT);

const rel = (path) => relative(ROOT, path).split(sep).join('/');
const inside = (path) => {
    const r = rel(path);
    return r !== '' && !r.startsWith('..') && !IGNORED.test(r);
};
const extOf = (path) => extname(path) || basename(path);
const covers = (dir, path) => dir === '.' || path === dir || path.startsWith(`${dir}/`);
const parentOf = (path) => (path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '.');
// A walk without `deep` comes from a table written before the walks were told apart: read as deep.
const reaches = (walk, path) => (walk.deep === false ? parentOf(path) === walk.dir : covers(walk.dir, path));

/** The directories of the tree as version control knows them, the root included. */
let treeDirs = null;
function dirsOfTree() {
    if (treeDirs) return treeDirs;
    const listed = spawnSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 }).stdout ?? '';
    treeDirs = new Set(['.']);
    for (const file of listed.split('\n').filter(Boolean)) {
        for (let dir = parentOf(file); dir !== '.'; dir = parentOf(dir)) treeDirs.add(dir);
    }
    return treeDirs;
}

/** The paths among these that version control ignores; a tracked file is never among them. */
function ignoredOf(paths) {
    if (!paths.length) return [];
    const run = spawnSync('git', ['check-ignore', '--stdin', '-z'], { cwd: ROOT, input: paths.join('\0'), encoding: 'utf8' });
    return (run.stdout ?? '').split('\0').filter(Boolean);
}

function readStdin() {
    try {
        return readFileSync(0, 'utf8');
    } catch {
        return '';
    }
}

function stepsOf(text) {
    return text.split('\n').map((line) => line.trim()).filter(Boolean);
}

function profileSteps() {
    const profiles = ['.claude/rt-kit/defaults/project.sh', '.claude/rt-kit/project.sh'].filter((p) => existsSync(join(ROOT, p)));
    const script = `${profiles.map((p) => `. "${p}"`).join('; ')}; rt_push_checks ''`;
    const run = spawnSync('bash', ['-c', script], { cwd: ROOT, encoding: 'utf8' });
    return stepsOf(run.stdout ?? '');
}

const traceable = (step) => TRACEABLE.test(step) && !HEAVY.test(step);

/** The step's own files: the script it starts and what that script imports, by relative paths. */
function selfOf(step) {
    const own = new Set();
    const script = step.match(/^node\s+(\S+\.m?js)/)?.[1];
    if (script) {
        const queue = [resolve(ROOT, script)];
        while (queue.length) {
            const file = queue.pop();
            if (own.has(rel(file)) || !existsSync(file)) continue;
            own.add(rel(file));
            const text = readFileSync(file, 'utf8');
            for (const m of text.matchAll(/(?:from\s+|import\s*\(\s*|import\s+|require\(\s*)['"](\.{1,2}\/[^'"]+)['"]/g)) {
                queue.push(resolve(dirname(file), m[1]));
            }
        }
    }
    if (/^pnpm run /.test(step)) own.add('package.json');
    return [...own].sort();
}

const scriptOf = (step) => step.match(/^node\s+(\S+\.m?js)/)?.[1];

/**
 * What the step's own script declares about its reads. `PUSH_EVERY_CHANGE` names why the step runs on
 * any change — it depends on the calendar, not on files. `pushReadsChange` is the very function the
 * step filters the list of the change by: the selection calls it instead of a list written apart.
 */
function declaredOf(step) {
    const script = scriptOf(step);
    const text = script && existsSync(join(ROOT, script)) ? readFileSync(join(ROOT, script), 'utf8') : '';
    return {
        always: text.match(/export const PUSH_EVERY_CHANGE\s*=\s*['"`]([^'"`]+)['"`]/)?.[1] ?? '',
        change: /export function pushReadsChange\b/.test(text),
    };
}

/** The git calls by which a step reads the list of the change itself. */
const CHANGE_LIST = new Set(['git diff', 'git merge-base', 'git rev-parse']);

/** What a started process means for the step: nothing, a read of the history, or an unseen read. */
function spawnKind(spawned) {
    const command = Array.isArray(spawned) ? spawned : spawned.command;
    const cwd = Array.isArray(spawned) ? ROOT : spawned.cwd || ROOT;
    const shell = basename(String(command[0] ?? ''));
    let [name, ...rest] = command;
    if ((shell === 'sh' || shell === 'bash') && rest[0] === '-c') {
        [name, ...rest] = String(rest[1] ?? '').trim().split(/\s+/);
    }
    const tool = basename(String(name ?? ''));
    if (tool === 'node' || name === process.execPath) return 'traced';
    // The process table is no file of the tree: the package manager asks it on start.
    if (tool === 'ps') return 'traced';
    if (tool !== 'git') return `untraced:${/^[\w.-]+$/.test(tool) && tool !== '.' ? tool : shell}`;
    const words = [...rest];
    let where = cwd;
    while (words.length && words[0].startsWith('-')) {
        const flag = words.shift();
        if (flag === '-C') where = resolve(where, words.shift() ?? '');
        else if (flag === '-c') words.shift();
    }
    // A scratch repository of the step is not this tree: its history is the step's own.
    if (relative(ROOT, where).startsWith('..')) return 'traced';
    const sub = words[0] ?? '';
    if (LISTING.has(sub)) return 'listing';
    // The history of named paths changes only by a commit that touches them, that is, by a change of them.
    const fence = words.indexOf('--');
    const named = fence < 0 ? [] : words.slice(fence + 1).map((p) => rel(resolve(where, p))).filter((p) => p && !p.startsWith('..'));
    if (HISTORY_OF_PATHS.has(sub) && named.length) return named.map((p) => `log:${p}`);
    if (sub === 'rev-parse' && words.slice(1).every((w) => /^--(show-toplevel|show-prefix|git-dir|git-common-dir|is-inside-work-tree|show-cdup)$/.test(w))) {
        return 'traced';
    }
    return `history:git ${sub}`;
}

/**
 * A start no record follows. A binary of an installed package, started by a followed child — the
 * schema engine under `prisma` — reads what that child hands it: the child's reads are recorded.
 * Started by the step itself, the same binary stays unseen: nothing recorded its inputs.
 */
function startKind(record, spawned) {
    const program = String(spawned.command?.[0] ?? '');
    if (record.via && program.startsWith(`${join(ROOT, 'node_modules')}/`)) return 'traced';
    return spawnKind(spawned);
}

/** One run of a step under the recorder: the raw reads, walks and process kinds. */
function trace(step) {
    const out = mkdtempSync(join(tmpdir(), 'rt-push-trace-'));
    writeFileSync(join(out, 'bash-env.sh'), BASH_RECORDER);
    const started = Date.now();
    const run = spawnSync('bash', ['-c', step], {
        cwd: ROOT,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
            ...process.env,
            NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --import ${TRACER}`.trim(),
            RT_PUSH_TRACE_OUT: out,
            BASH_ENV: join(out, 'bash-env.sh'),
            NX_DAEMON: 'false',
            // The builder loads its plugins only when it builds the project graph anew: from a cached
            // graph the same step reads fewer files, and the table check turned red on a cache miss.
            NX_CACHE_PROJECT_GRAPH: 'false',
        },
    });
    const seconds = Math.round((Date.now() - started) / 1000);
    const reads = new Set();
    const probes = new Set();
    const walks = new Set();
    const kinds = new Set();
    const names = readdirSync(out);
    const records = names.filter((n) => n.endsWith('.json')).map((name) => JSON.parse(readFileSync(join(out, name), 'utf8')));
    // A start some record names as its `via` is followed: its reads are already among the records.
    const followed = new Set(records.map((r) => r.via).filter(Boolean));
    const sink = { reads, probes, walks, kinds };
    const sources = new Set();
    for (const name of names.filter((n) => n.endsWith('.trace'))) {
        for (const line of readFileSync(join(out, name), 'utf8').split('\n').filter(Boolean)) {
            const [tag, source] = line.split('\t');
            if (tag) followed.add(tag);
            if (source) sources.add(resolve(ROOT, source));
            shellLine(line, sink, { root: ROOT, inside, rel, gitKind: spawnKind });
        }
    }
    for (const file of sources) if (existsSync(file) && redirectsInput(readFileSync(file, 'utf8'))) kinds.add('untraced:bash <');
    for (const record of records) {
        for (const p of record.reads) if (inside(p)) reads.add(rel(p));
        for (const p of record.probes ?? []) if (inside(p)) probes.add(rel(p));
        for (const p of record.walks) {
            if (resolve(p) === ROOT) walks.add('.');
            else if (inside(p)) walks.add(rel(p));
        }
        record.spawns.forEach((s, i) => [followed.has(`${record.pid}:${i}`) ? 'traced' : startKind(record, s)].flat().forEach((k) => kinds.add(k)));
    }
    rmSync(out, { recursive: true, force: true });
    // A path version control ignores never lands in a change: such a read can neither start the step
    // nor hide an input from it. Marks and caches written beside the tree differed from run to run.
    for (const p of ignoredOf([...reads, ...probes, ...walks])) [reads, probes, walks].forEach((set) => set.delete(p));
    // A listing of version control names every file of the tree: it walks every directory at once.
    if (kinds.has('listing')) for (const dir of dirsOfTree()) walks.add(dir);
    return { seconds, exit: run.status ?? 1, reads, probes, walks, kinds, self: selfOf(step), declared: declaredOf(step) };
}

/**
 * The walks of a step as the table keeps them. A walk lists one directory, not the tree under it: a
 * directory is written deep only when every directory of the tree under it was walked too, otherwise
 * it is written as its own listing. Read as deep, a listing of the root the package manager takes on
 * start made a step reachable by any file of the tree.
 */
function walksOf(walked) {
    // A directory of the tree left unwalked leaves every directory above it short of deep.
    const short = new Set();
    for (const dir of dirsOfTree()) {
        if (walked.has(dir)) continue;
        for (let up = dir; up !== '.'; ) {
            up = parentOf(up);
            short.add(up);
        }
    }
    const full = (dir) => walked.has(dir) && !short.has(dir);
    const out = [];
    for (const dir of [...walked].sort()) {
        if (out.some((w) => w.deep && covers(w.dir, dir))) continue;
        out.push({ dir, deep: full(dir) });
    }
    return out;
}

/** The table entry: the walks, each with the extensions read where it reaches. */
function entryOf(raw) {
    const all = [...raw.reads, ...raw.self];
    const walks = walksOf(raw.walks).map((w) => ({ ...w, exts: [...new Set(all.filter((p) => reaches(w, p)).map(extOf))].sort() }));
    const files = [...raw.reads].filter((p) => !walks.some((w) => reaches(w, p) && w.exts.includes(extOf(p)))).sort();
    const probes = [...raw.probes].filter((p) => !raw.reads.has(p) && !raw.self.includes(p) && !walks.some((w) => reaches(w, p))).sort();
    const kinds = [...raw.kinds];
    return {
        seconds: raw.seconds,
        ...(raw.declared?.always ? { always: raw.declared.always } : {}),
        ...(raw.declared?.change ? { change: true } : {}),
        history: kinds
            .filter((k) => k.startsWith('history:'))
            .map((k) => k.slice(8))
            .filter((h) => !(raw.declared?.change && CHANGE_LIST.has(h)))
            .sort(),
        untraced: kinds.filter((k) => k.startsWith('untraced:')).map((k) => k.slice(9)).sort(),
        logs: kinds.filter((k) => k.startsWith('log:')).map((k) => k.slice(4)).sort(),
        self: raw.self,
        walks,
        files,
        probes,
    };
}

function loadTable() {
    try {
        return JSON.parse(readFileSync(tablePath, 'utf8'));
    } catch {
        return null;
    }
}

/** Why a change reaches a step; an empty answer — it does not. */
/**
 * Whether an added or removed path changes the listing of a directory walked alone: it does when the
 * entry it stands under there is new or gone — a new migration directory under a listed one. Asked
 * against the base for an addition and against the tree for a removal; a base git cannot read
 * counts every entry as new.
 */
function listingOf(base) {
    const known = new Map();
    return (dir, path, kind) => {
        const rest = dir === '.' ? path : path.slice(dir.length + 1);
        const entry = dir === '.' ? rest.split('/')[0] : `${dir}/${rest.split('/')[0]}`;
        const key = `${kind}:${entry}`;
        if (!known.has(key)) {
            const was = kind === 'A' ? spawnSync('git', ['cat-file', '-e', `${base}:${entry}`], { cwd: ROOT }).status === 0 : !existsSync(join(ROOT, entry));
            known.set(key, !was);
        }
        return known.get(key);
    };
}

function reasonOf(entry, changes, inChange = '', listed = () => true) {
    if (entry.always) return entry.always;
    if (entry.history.length) return `reads the history (${entry.history.join(', ')})`;
    if (entry.untraced.length) return `starts ${entry.untraced.join(', ')}, whose reads are not seen`;
    if (inChange) return `${inChange} is in the change it reads`;
    for (const { kind, path } of changes) {
        if (entry.self.includes(path)) return `${path} is the step itself`;
        if (entry.files.includes(path)) return `${path} is read by it`;
        const logged = (entry.logs ?? []).find((p) => covers(p, path));
        if (logged) return `${path} is in the history of ${logged} it reads`;
        const ext = extOf(path);
        if (kind === 'M' && entry.walks.some((w) => reaches(w, path) && w.exts.includes(ext))) return `${path} lies where it reads ${ext}`;
        if (kind !== 'M' && entry.walks.some((w) => reaches(w, path) || (w.deep === false && covers(w.dir, path) && listed(w.dir, path, kind)))) return `${path} is ${kind === 'A' ? 'added to' : 'removed from'} a directory it walks`;
        if (kind !== 'M' && (entry.probes ?? []).some((f) => covers(f, path))) return `${path} is ${kind === 'A' ? 'added at' : 'removed from'} a path it probes`;
    }
    return '';
}

function changesOf(base) {
    const file = option('--changes');
    const text = file
        ? readFileSync(file, 'utf8')
        : spawnSync('git', ['diff', '--name-status', '-M', `${base}...HEAD`], { cwd: ROOT, encoding: 'utf8' }).stdout;
    if (text == null) return null;
    const changes = [];
    for (const line of text.split('\n').filter(Boolean)) {
        const [status, a, b] = line.split('\t');
        if (status.startsWith('R') || status.startsWith('C')) {
            if (status.startsWith('R')) changes.push({ kind: 'D', path: a });
            changes.push({ kind: 'A', path: b });
        } else {
            changes.push({ kind: status === 'A' || status === 'D' ? status : 'M', path: a });
        }
    }
    return changes;
}

/**
 * The first changed path the step's own filter takes, or an empty answer. A filter that fails to
 * load or throws names the first change: the step runs, as a step without a record would.
 */
async function inChangeOf(step, changes) {
    try {
        const { pushReadsChange } = await import(pathToFileURL(join(ROOT, scriptOf(step))).href);
        return changes.find((c) => pushReadsChange(c.path))?.path ?? '';
    } catch {
        return changes[0]?.path ?? '';
    }
}

async function select(base) {
    const steps = stepsOf(readStdin());
    const table = loadTable();
    const changes = base ? changesOf(base) : null;
    if (!table || !changes) {
        process.stdout.write(steps.map((s) => `${s}\n`).join(''));
        return 0;
    }
    const listed = listingOf(base);
    const verifyInputs = new Set([rel(tablePath), rel(TRACER), rel(join(HERE, 'push-shell.mjs')), rel(fileURLToPath(import.meta.url))]);
    for (const entry of Object.values(table.steps)) for (const p of entry.self) verifyInputs.add(p);
    for (const step of steps) {
        let reason;
        if (VERIFY.test(step)) {
            const hit = changes.find((c) => verifyInputs.has(c.path));
            reason = hit ? `${hit.path} is a step or the table` : '';
        } else if (!table.steps[step]) {
            reason = traceable(step) ? 'it is not in the table' : 'its reads are not recorded';
        } else {
            const entry = table.steps[step];
            reason = reasonOf(entry, changes, entry.change ? await inChangeOf(step, changes) : '', listed);
        }
        if (reason) {
            process.stdout.write(`${step}\n`);
            process.stderr.write(`→ ${step}: ${reason}\n`);
        } else {
            process.stderr.write(`· not run: ${step} — the change touches nothing it reads\n`);
        }
    }
    return 0;
}

function write(table) {
    writeFileSync(tablePath, `${JSON.stringify(table, null, 4)}\n`);
}

function record() {
    let steps = stepsOf(readStdin());
    if (!steps.length) steps = profileSteps();
    const table = { note: 'Generated by `node tools/push-inputs.mjs record`; not edited by hand.', steps: {} };
    for (const step of steps.filter(traceable)) {
        if (VERIFY.test(step)) continue;
        table.steps[step] = entryOf(trace(step));
        process.stderr.write(`recorded in ${table.steps[step].seconds}s: ${step}\n`);
    }
    write(table);
    process.stderr.write(`push inputs: ${Object.keys(table.steps).length} steps written to ${rel(tablePath)}\n`);
    return 0;
}

function verify() {
    const table = loadTable();
    if (!table) return 0;
    const misses = [];
    for (const [step, entry] of Object.entries(table.steps)) {
        const raw = trace(step);
        const now = entryOf(raw);
        for (const h of now.history) if (!entry.history.includes(h)) misses.push(`${step}: now reads the history (${h})`);
        for (const u of now.untraced) if (!entry.untraced.includes(u)) misses.push(`${step}: now starts ${u}`);
        if (entry.history.length || entry.untraced.length) continue;
        for (const p of [...raw.reads, ...raw.self]) {
            if (!reasonOf(entry, [{ kind: 'M', path: p }])) misses.push(`${step}: reads ${p}`);
        }
        for (const p of raw.probes) {
            if (!reasonOf(entry, [{ kind: 'A', path: p }])) misses.push(`${step}: probes ${p}`);
        }
        for (const d of raw.walks) {
            if (!entry.walks.some((w) => w.dir === d || (w.deep !== false && covers(w.dir, d)))) misses.push(`${step}: walks ${d}`);
        }
        for (const p of now.logs) if (!(entry.logs ?? []).includes(p)) misses.push(`${step}: now reads the history of ${p}`);
    }
    if (!misses.length) {
        process.stdout.write(`push inputs: the table covers what all ${Object.keys(table.steps).length} steps read\n`);
        return 0;
    }
    process.stdout.write(
        `push inputs: the table does not cover what the steps read now — a change there would not start them.\n` +
            `${misses.map((m) => `  ${m}`).join('\n')}\n` +
            `Record the table again: node tools/push-inputs.mjs record\n`,
    );
    return 1;
}

const command = args[0];
const code = command === 'record' ? record() : command === 'verify' ? verify() : command === 'select' ? await select(args[1]) : 2;
if (code === 2) process.stderr.write('usage: push-inputs.mjs record | select <base> | verify\n');
process.exit(code);
