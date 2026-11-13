#!/usr/bin/env node
/**
 * The read recorder of a push set step. It is loaded into a step by `--import` and writes down what
 * the step really reads: every file whose content it opens, every path whose existence it probes,
 * every directory it walks and every process it starts. The step itself is not changed.
 *
 * The record is the input of `push-inputs.mjs`: from it the set learns which steps a change can
 * reach. A list of inputs written by hand checks itself and goes stale silently; a record taken
 * from the step's own calls does not depend on whoever writes the list.
 *
 * A child `node` inherits `NODE_OPTIONS` and is recorded into a file of its own. Each start carries
 * its mark `<pid>:<index>` in the environment, and the child names it as `via`: so a start of `npm`
 * or `npx` is known to be followed even through a shell between them. A start no record names is
 * only named: its reads are not seen, and the step that starts it runs always.
 *
 * FAIL-OPEN: without `RT_PUSH_TRACE_OUT` the module does nothing; an error of its own is swallowed,
 * so the step runs as it would without it.
 */
import fs from 'node:fs';
import cp from 'node:child_process';
import { registerHooks, syncBuiltinESMExports } from 'node:module';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = process.env.RT_PUSH_TRACE_OUT ?? '';

if (OUT) {
    const reads = new Set();
    const probes = new Set();
    const walks = new Set();
    const spawns = [];
    // The nearest traced ancestor: a shell between two node processes keeps the environment, not the pid.
    const parent = Number(process.env.RT_PUSH_TRACE_PARENT) || 0;
    const via = process.env.RT_PUSH_TRACE_SPAWN ?? '';
    process.env.RT_PUSH_TRACE_PARENT = String(process.pid);
    const writeFile = fs.writeFileSync;
    const mkdir = fs.mkdirSync;

    const pathOf = (value) => {
        try {
            if (typeof value === 'string') return resolve(value);
            if (value instanceof URL) return fileURLToPath(value);
            if (Buffer.isBuffer(value)) return resolve(value.toString());
        } catch {
            // An argument that is no path is not recorded.
        }
        return '';
    };
    const writing = (flags) => typeof flags === 'string' && /[wa+]/.test(flags);

    const wrap = (target, name, note) => {
        const original = target[name];
        if (typeof original !== 'function') return;
        target[name] = function traced(...args) {
            try {
                note(args);
            } catch {
                // The recorder never breaks the step.
            }
            return original.apply(this, args);
        };
    };
    const read = (args) => {
        const path = pathOf(args[0]);
        if (path) reads.add(path);
    };
    const probe = (args) => {
        const path = pathOf(args[0]);
        if (path) probes.add(path);
    };
    const open = (args) => {
        if (!writing(typeof args[1] === 'object' ? args[1]?.flags : args[1])) read(args);
    };
    const walk = (args) => {
        const path = pathOf(args[0]);
        if (path) walks.add(path);
    };
    // The directory a process starts in is kept: `git` in a scratch repository of the step does not
    // read this tree's history.
    // The mark of a start goes into the environment the child gets: an explicit `env` is copied with
    // it, an absent one is the process environment, read at the moment of the call.
    const mark = (args, at) => {
        const tag = `${process.pid}:${spawns.length - 1}`;
        process.env.RT_PUSH_TRACE_SPAWN = tag;
        const options = args[at];
        if (options && typeof options === 'object' && options.env) {
            args[at] = { ...options, env: { ...options.env, RT_PUSH_TRACE_SPAWN: tag, RT_PUSH_TRACE_PARENT: String(process.pid) } };
        }
    };
    const spawn = (args) => {
        const [command, rest, options] = args;
        if (typeof command !== 'string') return;
        const list = Array.isArray(rest) ? rest.map(String) : [];
        const where = (Array.isArray(rest) ? options : rest)?.cwd;
        spawns.push({ cwd: pathOf(where ?? process.cwd()), command: [command, ...list] });
        mark(args, Array.isArray(rest) ? 2 : 1);
    };

    // A copy reads its source: the package build carries its resources over by copying, not reading.
    for (const name of ['readFileSync', 'readFile', 'createReadStream', 'copyFileSync', 'copyFile', 'cpSync', 'cp']) wrap(fs, name, read);
    for (const name of ['existsSync', 'statSync', 'lstatSync', 'accessSync', 'stat', 'lstat', 'access']) wrap(fs, name, probe);
    wrap(fs, 'openSync', open);
    wrap(fs, 'open', open);
    for (const name of ['readdirSync', 'readdir', 'opendirSync', 'opendir']) wrap(fs, name, walk);
    for (const name of ['readFile', 'copyFile', 'cp']) wrap(fs.promises, name, read);
    for (const name of ['stat', 'lstat', 'access']) wrap(fs.promises, name, probe);
    wrap(fs.promises, 'open', open);
    for (const name of ['readdir', 'opendir']) wrap(fs.promises, name, walk);
    for (const name of ['execFileSync', 'execFile', 'spawnSync', 'spawn']) wrap(cp, name, spawn);
    for (const name of ['execSync', 'exec']) {
        wrap(cp, name, (args) => {
            if (typeof args[0] !== 'string') return;
            spawns.push({ cwd: pathOf(args[1]?.cwd ?? process.cwd()), command: ['sh', '-c', args[0]] });
            mark(args, 1);
        });
    }
    syncBuiltinESMExports();

    // A module the process loads is a file it reads, and the loader goes past the patched calls:
    // a plugin of the builder taken by `require` from the tree is seen only here.
    try {
        registerHooks?.({
            load(url, context, nextLoad) {
                if (url.startsWith('file:')) reads.add(fileURLToPath(url));
                return nextLoad(url, context);
            },
        });
    } catch {
        // FAIL-OPEN: an older runtime without the hooks records what the patched calls see.
    }

    process.on('exit', () => {
        try {
            mkdir(OUT, { recursive: true });
            writeFile(
                join(OUT, `${process.pid}.json`),
                JSON.stringify({ pid: process.pid, parent, via, cwd: process.cwd(), argv: process.argv.slice(1), reads: [...reads], probes: [...probes], walks: [...walks], spawns }),
            );
        } catch {
            // A record that could not be written leaves the step without inputs: it runs always.
        }
    });
}
