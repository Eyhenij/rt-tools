#!/usr/bin/env node
// rt-kit v0.37.0 · checks/flow-model.mjs · 6dba1f2a69d3 · правится надстройкой, не здесь
/**
 * The model of the task flow description: what the parsed description means, checked against the
 * files it names, before any of them is run.
 *
 * The description has exactly six sections. `source` and `measure` name components: the key of an
 * entry is a file — `measure.plan` is `measure/plan.mjs` next to the description — and every key
 * under it is a capability, a named export of that file. The value under a capability is its ports:
 * an object whose keys are the names the factory takes and whose values are references to other
 * components. The ports equal the signature of the factory exactly — `()` or `({ a, b })` without
 * defaults, renaming or nested patterns: a port the factory does not take is a wire to nowhere, and
 * a default hides a missing wire. A missing capability is an error, never a substitute.
 *
 * A measurer gets its data only through its ports. So every file of `measure/` — the measurer and
 * any neighbour it imports — imports only files of the same directory, by a path starting with
 * `./`, and holds no `import()`, `require`, `createRequire`, `process` or `globalThis`. The files
 * are read as text, not run: a measurer that reached for the disk would be refused before the
 * engine ever loads it.
 *
 * `state` lists the states in the order they are written; a title is unique. The exit of a state
 * and the `when` of a release case are conditions over the measurers of the description — a
 * reference or `all`, `any`, `not` over them, see `flow-condition.mjs`. `words`, `expect` and the
 * order of the release cases are checked by `flow-data.mjs`; `release` comes out as a list in its
 * order. References between
 * components form no cycle. Usage: node flow-model.mjs <flow.js> — prints the model as JSON, or
 * `flow model: <what>` and exits 1. With `--exit <state> <results.json>` it prints `true` or
 * `false` for the exit of that state, the results mapping `measure.<entry>.<capability>` to a
 * boolean; a result that is absent or not `true` counts as unmet.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { evaluateCondition, validateCondition } from './flow-condition.mjs';
import { checkExpect, checkWords, releaseOrder } from './flow-data.mjs';
import { Call, FlowSyntaxError, Ref, SECTIONS, parse } from './flow-syntax.mjs';

/** A name of an entry, a capability or a port. */
const NAME = /^[A-Za-z][A-Za-z0-9]*$/;
/** The sections whose entries are files. */
const COMPONENT_SECTIONS = ['source', 'measure'];
/** What a file of `measure/` may not hold: a way to data past the ports. */
const MEASURE_BANS = [
    [/\bimport\s*\(/, 'import()'],
    [/\bcreateRequire\b/, 'createRequire'],
    [/\brequire\s*\(/, 'require'],
    [/\bprocess\b/, 'process'],
    [/\bglobalThis\b/, 'globalThis'],
];

/** A refusal of the model: what is wrong, naming the component. */
export class FlowModelError extends Error {}

const fail = (what) => {
    throw new FlowModelError(what);
};

/** The text of a module without its comments: a ban word in an explanation is not code. */
function code(text) {
    return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/**
 * The ports a capability's factory takes, read from its declaration. `()` gives none, `({ a, b })`
 * gives a and b; anything else — a default, a renaming, a nested pattern, a bare parameter — is
 * refused, naming the component.
 */
function signatureOf(text, cap, where) {
    const body = code(text);
    const fn = new RegExp(`export\\s+(?:async\\s+)?function\\s+${cap}\\s*\\(([^)]*)\\)`).exec(body);
    const arrow = new RegExp(`export\\s+const\\s+${cap}\\s*=\\s*(?:async\\s*)?\\(([^)]*)\\)\\s*=>`).exec(body);
    const match = fn ?? arrow;
    if (!match) fail(`${where}: the file exports no capability «${cap}»`);
    const params = match[1].trim();
    if (params === '') return [];
    const pattern = /^\{\s*([^{}]*?)\s*,?\s*\}$/.exec(params);
    if (!pattern) fail(`${where}: the signature of «${cap}» is not «()» or «({ a, b })»: (${params})`);
    const names = pattern[1].split(',').map((s) => s.trim()).filter(Boolean);
    for (const name of names) {
        if (!NAME.test(name)) fail(`${where}: the port «${name}» of «${cap}» carries a default, a renaming or a pattern`);
    }
    return names;
}

/** Every file of `measure/` imports only its neighbours and reaches no data past the ports. */
function checkMeasureDir(dir) {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir).filter((f) => f.endsWith('.mjs') || f.endsWith('.js'))) {
        const body = code(readFileSync(join(dir, name), 'utf8'));
        for (const [ban, label] of MEASURE_BANS) {
            if (ban.test(body)) fail(`measure/${name}: «${label}» is not allowed — a measurer gets its data through its ports`);
        }
        for (const m of body.matchAll(/\bimport\s+(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]/g)) {
            const spec = m[1];
            if (!spec.startsWith('./') || spec.slice(2).includes('/')) {
                fail(`measure/${name}: the import «${spec}» leaves the directory — only «./<file>» is allowed`);
            }
        }
    }
}

/** The component a reference points at, and the capability if it names one. */
function target(ref, components, where) {
    const [section, entry, cap, ...rest] = ref.path;
    if (!COMPONENT_SECTIONS.includes(section)) return null;
    const component = components.get(`${section}.${entry}`);
    if (!component) fail(`${where}: «${ref.path.join('.')}» points at no component`);
    if (cap !== undefined && !(cap in component.caps)) fail(`${where}: «${ref.path.join('.')}» names no capability of ${section}.${entry}`);
    if (rest.length > 0) fail(`${where}: «${ref.path.join('.')}» goes deeper than a capability`);
    return component;
}

/** Builds the model of a description file. Throws `FlowModelError` or `FlowSyntaxError`. */
export function buildModel(path) {
    const description = parse(readFileSync(path, 'utf8'));
    const base = dirname(path);

    const keys = Object.keys(description);
    const extra = keys.filter((k) => !SECTIONS.includes(k));
    const missing = SECTIONS.filter((k) => !keys.includes(k));
    if (extra.length > 0) fail(`the description has exactly six sections — «${extra.join('», «')}» is not one of them`);
    if (missing.length > 0) fail(`the description has exactly six sections — «${missing.join('», «')}» is missing`);

    for (const section of SECTIONS) {
        const value = description[section];
        if (value === null || typeof value !== 'object' || Array.isArray(value) || value instanceof Ref || value instanceof Call) {
            fail(`the section «${section}» is an object of entries`);
        }
        for (const entry of Object.keys(value)) {
            if (!NAME.test(entry)) fail(`${section}: the name «${entry}» is outside [A-Za-z][A-Za-z0-9]*`);
        }
    }

    checkMeasureDir(join(base, 'measure'));

    const components = new Map();
    for (const section of COMPONENT_SECTIONS) {
        for (const [entry, caps] of Object.entries(description[section])) {
            const where = `${section}.${entry}`;
            const file = join(base, section, `${entry}.mjs`);
            if (caps === null || typeof caps !== 'object' || Array.isArray(caps) || caps instanceof Ref || caps instanceof Call) {
                fail(`${where}: an entry is an object of capabilities`);
            }
            if (!existsSync(file)) fail(`${where}: the file ${section}/${entry}.mjs is absent`);
            const text = readFileSync(file, 'utf8');
            const component = { section, entry, file: `${section}/${entry}.mjs`, caps: {} };
            for (const [cap, ports] of Object.entries(caps)) {
                if (!NAME.test(cap)) fail(`${where}: the name «${cap}» is outside [A-Za-z][A-Za-z0-9]*`);
                if (ports === null || typeof ports !== 'object' || Array.isArray(ports) || ports instanceof Ref || ports instanceof Call) {
                    fail(`${where}.${cap}: the ports are an object, «{}» when there are none`);
                }
                const signature = signatureOf(text, cap, where);
                const named = Object.keys(ports);
                const lacking = signature.filter((p) => !named.includes(p));
                const surplus = named.filter((p) => !signature.includes(p));
                if (lacking.length > 0 || surplus.length > 0) {
                    fail(`${where}.${cap}: the ports {${named.join(', ')}} are not the signature ({ ${signature.join(', ')} })`);
                }
                component.caps[cap] = ports;
            }
            components.set(where, component);
        }
    }

    // The wires: every port points at an existing component, and the components form no cycle.
    const edges = new Map();
    for (const [where, component] of components) {
        const to = new Set();
        for (const [cap, ports] of Object.entries(component.caps)) {
            for (const [port, value] of Object.entries(ports)) {
                if (!(value instanceof Ref)) fail(`${where}.${cap}: the port «${port}» is a reference to a component`);
                const t = target(value, components, `${where}.${cap}`);
                if (!t) fail(`${where}.${cap}: the port «${port}» points outside source and measure`);
                to.add(`${t.section}.${t.entry}`);
            }
        }
        edges.set(where, to);
    }
    const state = new Map();
    const visit = (node, trail) => {
        if (state.get(node) === 'done') return;
        if (state.get(node) === 'open') fail(`the references form a cycle: ${[...trail, node].join(' → ')}`);
        state.set(node, 'open');
        for (const next of edges.get(node) ?? []) visit(next, [...trail, node]);
        state.set(node, 'done');
    };
    for (const node of edges.keys()) visit(node, []);

    const measures = new Map(
        [...components.values()].filter((c) => c.section === 'measure').map((c) => [`measure.${c.entry}`, new Set(Object.keys(c.caps))]),
    );
    const titles = new Set();
    const states = Object.entries(description.state).map(([key, s]) => {
        if (s === null || typeof s !== 'object' || Array.isArray(s)) fail(`state.${key}: a state is an object`);
        if (typeof s.title !== 'string' || s.title === '') fail(`state.${key}: the title is a string`);
        if (titles.has(s.title)) fail(`state.${key}: the title «${s.title}» repeats`);
        titles.add(s.title);
        if (!('exit' in s)) fail(`state.${key}: the exit is missing — a measurer reference or a condition`);
        validateCondition(s.exit, measures, `state.${key}.exit`, fail);
        return { key, ...s };
    });

    for (const [key, r] of Object.entries(description.release)) {
        if (r === null || typeof r !== 'object' || Array.isArray(r) || r instanceof Ref || r instanceof Call) {
            fail(`release.${key}: a release case is an object`);
        }
        if (!('when' in r)) fail(`release.${key}: the when is missing — a measurer reference or a condition`);
        validateCondition(r.when, measures, `release.${key}.when`, fail);
    }
    const release = releaseOrder(description.release, fail);
    checkWords(description.words, fail);
    checkExpect(description.expect, fail);

    return {
        sources: [...components.values()].filter((c) => c.section === 'source'),
        measures: [...components.values()].filter((c) => c.section === 'measure'),
        states,
        release,
        words: description.words,
        expect: description.expect,
    };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const [file, flag, key, results] = process.argv.slice(2);
    if (!file || (flag !== undefined && (flag !== '--exit' || !key || !results))) {
        console.error('usage: node flow-model.mjs <flow.js> [--exit <state> <results.json>]');
        process.exit(2);
    }
    try {
        const model = buildModel(file);
        if (flag === undefined) {
            console.log(JSON.stringify(model));
            process.exit(0);
        }
        const state = model.states.find((s) => s.key === key);
        if (!state) fail(`no state «${key}»`);
        const values = JSON.parse(readFileSync(results, 'utf8'));
        console.log(String(evaluateCondition(state.exit, (name) => values[name])));
    } catch (error) {
        if (error instanceof FlowSyntaxError) {
            console.log(`flow syntax: ${error.message}`);
            process.exit(1);
        }
        if (!(error instanceof FlowModelError)) throw error;
        console.log(`flow model: ${error.message}`);
        process.exit(1);
    }
}
