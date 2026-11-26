#!/usr/bin/env node
// rt-kit v0.41.1 · checks/flow-scaffold.mjs · f45c8ee1488f · правится надстройкой, не здесь
/**
 * The generator of stubs for the task flow description: a new measurer or source named by the
 * description gets its file and a stub case of its test, and nothing that is already written is
 * touched.
 *
 * A stub is the form every unwritten factory has: one function per capability with the ports of
 * the description as its signature, and a body that throws `Not implemented: <component>`. An exit
 * read through a stub therefore never counts as met, and the model accepts the stub, since its
 * signature equals its ports. The stub case lies in the suite directory as
 * `flow-<section>-<entry>.test.sh` and stays red until the factory stops throwing.
 *
 * A file that exists is never rewritten. Instead three warnings name what drifted:
 *
 *   CONTRACT_CHANGED     the ports of the description differ from the signature in the file, or the
 *                        file exports no such capability;
 *   UNREACHABLE_MEASURE  a measurer capability no state exit, release case or port names;
 *   MEASURE_REMOVED      a file of `measure/` or `source/` the description does not name and no
 *                        neighbour imports — the file stays, the warning says so.
 *
 * Usage: node flow-scaffold.mjs [--flow <flow.js>] [--override <flow.js>] [--tests <dir>]. The
 * description lies next to the generator as `task-flow/flow.js` where it is laid out, and as
 * `../task-flow/flow.js` in the package. The suite directory is the package's `tests/`, or
 * `tests/` next to the description. Prints `created <path>` and `warning <CODE> <what>` lines, the
 * paths relative to the directory of the description, and
 * `flow scaffold: <n> created, <m> warnings`; exits 1 only when the description does not parse.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { FlowModelError, signatureOf } from './flow-model.mjs';
import { mergeOverride } from './flow-override.mjs';
import { FlowSyntaxError, Ref, parse } from './flow-syntax.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
/** The sections whose entries are files. */
const COMPONENT_SECTIONS = ['source', 'measure'];
const KIND = { source: 'source', measure: 'measurer' };

const plain = (value) => value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Ref);

/** The text of a stub component: one throwing factory per capability. */
export function stubText(section, entry, caps) {
    const head = [
        '/**',
        ` * The ${KIND[section]} «${section}.${entry}» of the task flow description. A factory named by a`,
        ' * capability takes its ports and returns the reader; until the step that writes it, the factory',
        ' * throws, so an unmeasured exit is never read as met.',
        ' */',
        '',
    ];
    const bodies = Object.entries(caps).map(([cap, ports]) => {
        const names = Object.keys(ports);
        const params = names.length > 0 ? `{ ${names.join(', ')} }` : '';
        const what = `${section}.${entry}.${cap}${names.length > 0 ? ` (${names.join(', ')})` : ''}`;
        return [`export function ${cap}(${params}) {`, `    throw new Error('Not implemented: ${what}');`, '}'].join('\n');
    });
    return `${head.join('\n')}\n${bodies.join('\n\n')}\n`;
}

/** The text of a stub case: red while any factory of the component throws `Not implemented`. */
export function stubCase(section, entry, caps, component) {
    const name = `${section}.${entry}`;
    return `#!/usr/bin/env bash
# The case of «${name}» written by flow-scaffold.mjs: red while a factory of it throws
# «Not implemented». Replace it with the cases of the component, its sources stood in by doubles.
HERE="$(dirname "\${BASH_SOURCE[0]}")"
if [ -f "$HERE/lib.sh" ]; then
    . "$HERE/lib.sh"
else
    PASSED=0
    FAILED=0
    report() { if [ "$2" = "$3" ]; then PASSED=$((PASSED + 1)); else FAILED=$((FAILED + 1)); printf '  FAIL %s got %s, expected %s\\n' "$1" "$2" "$3"; fi; }
    suite_result() { printf '%s: %d ok, %d failed\\n' "$1" "$PASSED" "$FAILED"; [ "$FAILED" -eq 0 ]; }
fi

echo "${name}"
for cap in ${Object.keys(caps).join(' ')}; do
    got="$(node --input-type=module -e "
import { pathToFileURL } from 'node:url';
const m = await import(pathToFileURL(process.argv[1]).href);
try { m[process.argv[2]]({}); console.log('written'); } catch (e) { console.log(String(e.message).startsWith('Not implemented') ? e.message : 'written'); }
" "$HERE/${component}" "$cap" 2>&1)"
    report "${section}: ${name}.$cap — the factory is written" "$got" 'written'
done
suite_result "${name}"
`;
}

/** The measurer capabilities a condition names. */
function namedBy(value, into) {
    if (value instanceof Ref) into.add(value.path.join('.'));
    else if (plain(value)) for (const part of Object.values(value)) namedBy(part, into);
    else if (Array.isArray(value)) for (const part of value) namedBy(part, into);
    return into;
}

/** The files a directory's modules import from their neighbours. */
function neighbours(dir) {
    const used = new Set();
    for (const name of readdirSync(dir).filter((f) => f.endsWith('.mjs'))) {
        for (const m of readFileSync(join(dir, name), 'utf8').matchAll(/\bfrom\s+['"]\.\/([^'"/]+)['"]/g)) used.add(m[1]);
    }
    return used;
}

/** Scaffolds a description. Returns `{ created, warnings }`, the paths and the warning lines. */
export function scaffold(flow, { override, tests } = {}) {
    const base = dirname(flow);
    let description = parse(readFileSync(flow, 'utf8'));
    let origins = new Map();
    const fail = (what) => {
        throw new FlowModelError(what);
    };
    if (override) ({ description, origins } = mergeOverride(description, parse(readFileSync(override, 'utf8')), dirname(override), fail));
    const created = [];
    const warnings = [];
    const reached = new Set();
    for (const s of Object.values(description.state ?? {})) if (plain(s)) namedBy(s.exit, reached);
    for (const r of Object.values(description.release ?? {})) if (plain(r)) namedBy(r.when, reached);

    const dirs = new Map();
    for (const section of COMPONENT_SECTIONS) {
        for (const [entry, caps] of Object.entries(description[section] ?? {})) {
            if (!plain(caps)) continue;
            for (const ports of Object.values(caps)) {
                for (const ref of Object.values(plain(ports) ? ports : {})) if (ref instanceof Ref) reached.add(ref.path.slice(0, 2).join('.'));
            }
            const dir = join(origins.get(`${section}.${entry}`) ?? base, section);
            dirs.set(dir, section);
            const file = join(dir, `${entry}.mjs`);
            if (!existsSync(file)) {
                mkdirSync(dir, { recursive: true });
                writeFileSync(file, stubText(section, entry, caps));
                created.push(file);
                if (tests) {
                    const testFile = join(tests, `flow-${section}-${entry}.test.sh`);
                    if (!existsSync(testFile)) {
                        mkdirSync(tests, { recursive: true });
                        writeFileSync(testFile, stubCase(section, entry, caps, relative(tests, file)));
                        created.push(testFile);
                    }
                }
                continue;
            }
            const text = readFileSync(file, 'utf8');
            for (const [cap, ports] of Object.entries(caps)) {
                const named = Object.keys(plain(ports) ? ports : {});
                let signature;
                try {
                    signature = signatureOf(text, cap, `${section}.${entry}`);
                } catch (error) {
                    if (!(error instanceof FlowModelError)) throw error;
                    warnings.push(`CONTRACT_CHANGED ${error.message}`);
                    continue;
                }
                if (named.length !== signature.length || named.some((p) => !signature.includes(p))) {
                    warnings.push(`CONTRACT_CHANGED ${section}.${entry}.${cap}: the ports {${named.join(', ')}} are not the signature ({ ${signature.join(', ')} }) — the file is not rewritten`);
                }
            }
        }
    }

    for (const [entry, caps] of Object.entries(description.measure ?? {})) {
        if (!plain(caps) || reached.has(`measure.${entry}`)) continue;
        for (const cap of Object.keys(caps)) {
            if (!reached.has(`measure.${entry}.${cap}`)) warnings.push(`UNREACHABLE_MEASURE measure.${entry}.${cap}: no state exit, release case or port names it`);
        }
    }

    for (const section of COMPONENT_SECTIONS) {
        if (!dirs.has(join(base, section))) dirs.set(join(base, section), section);
    }
    for (const [dir, section] of dirs) {
        if (!existsSync(dir)) continue;
        const used = neighbours(dir);
        for (const name of readdirSync(dir).filter((f) => f.endsWith('.mjs'))) {
            const entry = name.slice(0, -'.mjs'.length);
            if (entry in (description[section] ?? {}) || used.has(name)) continue;
            warnings.push(`MEASURE_REMOVED ${relative(base, join(dir, name))}: the description names no ${section}.${entry} — the file stays`);
        }
    }
    return { created, warnings };
}

/** Where the description lies: next to the laid-out generator, or in the package. */
function flowPath(given) {
    if (given) return given;
    const laid = join(HERE, 'task-flow', 'flow.js');
    return existsSync(laid) ? laid : join(HERE, '..', 'task-flow', 'flow.js');
}

/** The suite directory: the one named, the package's `tests/`, or `tests/` next to the description. */
function testsDir(given, flow) {
    if (given) return given;
    const kit = join(dirname(flow), '..', '..', 'tests');
    return existsSync(join(kit, 'lib.sh')) ? kit : join(dirname(flow), 'tests');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const args = process.argv.slice(2);
    const take = (flag) => {
        const at = args.indexOf(flag);
        return at >= 0 ? args.splice(at, 2)[1] : undefined;
    };
    const flow = flowPath(take('--flow'));
    const override = take('--override');
    const tests = testsDir(take('--tests'), flow);
    if (args.length > 0) {
        console.error('usage: node flow-scaffold.mjs [--flow <flow.js>] [--override <flow.js>] [--tests <dir>]');
        process.exit(2);
    }
    try {
        const { created, warnings } = scaffold(flow, { override, tests });
        for (const path of created) console.log(`created ${relative(dirname(flow), path)}`);
        for (const line of warnings) console.log(`warning ${line}`);
        console.log(`flow scaffold: ${created.length} created, ${warnings.length} warnings`);
    } catch (error) {
        if (!(error instanceof FlowSyntaxError) && !(error instanceof FlowModelError)) throw error;
        console.log(`flow scaffold: ${error.message}`);
        process.exit(1);
    }
}
