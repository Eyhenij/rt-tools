#!/usr/bin/env node
// rt-kit v0.37.0 · checks/push-inputs.mjs · f5146097e9ae · правится надстройкой, не здесь
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
import { fileURLToPath } from 'node:url';

const ROOT = process.cwd();
const HERE = dirname(fileURLToPath(import.meta.url));
const TRACER = join(HERE, 'push-trace.mjs');
const TABLE_DEFAULT = '.claude/rt-kit/push-inputs.json';
const IGNORED = /^(node_modules|\.git|dist|\.nx|\.angular|tmp|coverage)(\/|$)|\/node_modules\//;
const TRACEABLE = /^(node\s+\S+\.m?js|pnpm run [\w:.-]+)(\s|$)/;
const HEAVY = /(^|\s)nx\s|docker |playwright|e2e|visual-gate|serve:/;
const LISTING = new Set(['ls-files', 'ls-tree', 'check-ignore', 'check-attr', 'status', 'config', 'hash-object', 'var']);
const VERIFY = /push-inputs\.mjs verify/;

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
    if (sub === 'rev-parse' && words.slice(1).every((w) => /^--(show-toplevel|show-prefix|git-dir|git-common-dir|is-inside-work-tree|show-cdup)$/.test(w))) {
        return 'traced';
    }
    return `history:git ${sub}`;
}

/** One run of a step under the recorder: the raw reads, walks and process kinds. */
function trace(step) {
    const out = mkdtempSync(join(tmpdir(), 'rt-push-trace-'));
    const started = Date.now();
    const run = spawnSync('bash', ['-c', step], {
        cwd: ROOT,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
            ...process.env,
            NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --import ${TRACER}`.trim(),
            RT_PUSH_TRACE_OUT: out,
            NX_DAEMON: 'false',
        },
    });
    const seconds = Math.round((Date.now() - started) / 1000);
    const reads = new Set();
    const probes = new Set();
    const walks = new Set();
    const kinds = new Set();
    for (const name of readdirSync(out)) {
        const record = JSON.parse(readFileSync(join(out, name), 'utf8'));
        for (const p of record.reads) if (inside(p)) reads.add(rel(p));
        for (const p of record.probes ?? []) if (inside(p)) probes.add(rel(p));
        for (const p of record.walks) {
            if (resolve(p) === ROOT) walks.add('.');
            else if (inside(p)) walks.add(rel(p));
        }
        for (const s of record.spawns) kinds.add(spawnKind(s));
    }
    rmSync(out, { recursive: true, force: true });
    if (kinds.has('listing')) walks.add('.');
    return { seconds, exit: run.status ?? 1, reads, probes, walks, kinds, self: selfOf(step) };
}

/** The table entry: only the topmost walked directories, each with the extensions read under it. */
function entryOf(raw) {
    const dirs = [...raw.walks].sort();
    const top = dirs.filter((d) => !dirs.some((o) => o !== d && covers(o, d)));
    const all = [...raw.reads, ...raw.self];
    const walks = top.map((dir) => ({ dir, exts: [...new Set(all.filter((p) => covers(dir, p)).map(extOf))].sort() }));
    const files = [...raw.reads].filter((p) => !walks.some((w) => covers(w.dir, p) && w.exts.includes(extOf(p)))).sort();
    const probes = [...raw.probes].filter((p) => !raw.reads.has(p) && !raw.self.includes(p) && !walks.some((w) => covers(w.dir, p))).sort();
    const kinds = [...raw.kinds];
    return {
        seconds: raw.seconds,
        history: kinds.filter((k) => k.startsWith('history:')).map((k) => k.slice(8)).sort(),
        untraced: kinds.filter((k) => k.startsWith('untraced:')).map((k) => k.slice(9)).sort(),
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
function reasonOf(entry, changes) {
    if (entry.history.length) return `reads the history (${entry.history.join(', ')})`;
    if (entry.untraced.length) return `starts ${entry.untraced.join(', ')}, whose reads are not seen`;
    for (const { kind, path } of changes) {
        if (entry.self.includes(path)) return `${path} is the step itself`;
        if (entry.files.includes(path)) return `${path} is read by it`;
        const ext = extOf(path);
        if (kind === 'M' && entry.walks.some((w) => covers(w.dir, path) && w.exts.includes(ext))) return `${path} lies where it reads ${ext}`;
        if (kind !== 'M' && entry.walks.some((w) => covers(w.dir, path))) return `${path} is ${kind === 'A' ? 'added to' : 'removed from'} a directory it walks`;
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

function select(base) {
    const steps = stepsOf(readStdin());
    const table = loadTable();
    const changes = base ? changesOf(base) : null;
    if (!table || !changes) {
        process.stdout.write(steps.map((s) => `${s}\n`).join(''));
        return 0;
    }
    const verifyInputs = new Set([rel(tablePath), rel(TRACER), rel(fileURLToPath(import.meta.url))]);
    for (const entry of Object.values(table.steps)) for (const p of entry.self) verifyInputs.add(p);
    for (const step of steps) {
        let reason;
        if (VERIFY.test(step)) {
            const hit = changes.find((c) => verifyInputs.has(c.path));
            reason = hit ? `${hit.path} is a step or the table` : '';
        } else if (!table.steps[step]) {
            reason = traceable(step) ? 'it is not in the table' : 'its reads are not recorded';
        } else {
            reason = reasonOf(table.steps[step], changes);
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
            if (!entry.walks.some((w) => covers(w.dir, d))) misses.push(`${step}: walks ${d}`);
        }
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
const code = command === 'record' ? record() : command === 'verify' ? verify() : command === 'select' ? select(args[1]) : 2;
if (code === 2) process.stderr.write('usage: push-inputs.mjs record | select <base> | verify\n');
process.exit(code);
