#!/usr/bin/env node
// rt-kit v0.37.1 · checks/flow-sync.mjs · 4414ee375719 · правится надстройкой, не здесь
/**
 * The generator of the texts the task flow description is told by. Five views are written from the
 * description of the package, each between the markers `<!-- flow:<view> -->` and
 * `<!-- /flow:<view> -->`, and `flow.md` next to the description is written whole:
 *
 *   description  `flow.md` — the whole description in tables;
 *   states       the table «Work states» of the rule `task-flow`;
 *   map          the states of the turn map;
 *   turn-end     the release cases in the rule `turn-conduct`;
 *   expect       the table of expected forms in the plan template.
 *
 * A text told by hand drifts from the scenario the engine measures, and nothing notices: so the
 * text between the markers is the description's, and a hand edit there is refused by `--check`,
 * which compares each file with its generation as text.
 *
 * In the package the five views are written into its sources. In a tree where the package is laid
 * out the five are only compared: a laid-out file is rewritten by the layout, never here. The tree
 * override, when it lies in the tree, is told by a sixth view `tree` — what it adds, replaces and
 * removes, and the states of the merged scenario — in the companion `implementation.md` of the rule
 * `task-flow`; the laid-out rule does not see the override and is not changed.
 *
 * Usage: node flow-sync.mjs [--check] [--flow <flow.js>] [--override <flow.js>] [--root <dir>].
 * The description lies next to the generator as `task-flow/flow.js` where it is laid out, and as
 * `../task-flow/flow.js` in the package. The root of the tree is `--root`, else the top of the git
 * working copy, else the current directory; the layout is read from its `.claude/rt-kit.json`.
 * `--check` prints `flow sync: <n> views match`, or a line per differing view and exits 1; without
 * it every writable view is written and `flow sync: <k> of <n> views written` is printed.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { FlowModelError, buildModel } from './flow-model.mjs';
import { OVERRIDE_PATH } from './flow-override.mjs';
import { FlowSyntaxError, Ref } from './flow-syntax.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

/** What each way of comparison of an expected form means, for the plan template. */
const COMPARE_TEXT = {
    exit: 'the command exits with the code of the first group; the output is not compared',
    line: 'the code is 0 and the last non-empty line of the output equals the first group',
    regex: 'the code is 0 and the last non-empty line matches the first group',
    number: 'the code is 0, the last non-empty line is an integer, and its comparison by the first group with the second holds',
};

/** A code span that holds any text, backticks included. */
const code = (text) => (String(text).includes('`') ? `\`\` ${text} \`\`` : `\`${text}\``);
/** A table cell: a pipe would split it. */
const cell = (text) => String(text ?? '').replace(/\|/g, '\\|');

/** A condition in one line: a reference, or `all(…)`, `any(…)`, `not(…)` over its parts. */
export function conditionText(value) {
    if (value instanceof Ref) return value.path.join('.');
    const [op] = Object.keys(value);
    if (op === 'not') return `not(${conditionText(value.not)})`;
    return `${op}(${value[op].map(conditionText).join(', ')})`;
}

const portsText = (ports) => {
    const refs = Object.values(ports).map((ref) => code(ref.path.join('.')));
    return refs.length > 0 ? refs.join(', ') : 'none';
};

function statesTable(model) {
    return [
        '| State | Exit | Mandatory action | Pattern |',
        '| --- | --- | --- | --- |',
        ...model.states.map((s) => `| ${code(s.title)} | ${cell(code(conditionText(s.exit)))} | ${cell(s.action)} | ${s.pattern ? code(s.pattern) : ''} |`),
    ].join('\n');
}

function expectTable(model) {
    return [
        '| Form | Expected text | It matches when |',
        '| --- | --- | --- |',
        ...Object.entries(model.expect).map(([key, f]) => `| ${code(key)} | ${cell(code(f.pattern))} | ${COMPARE_TEXT[f.compare]} |`),
    ].join('\n');
}

function releaseTable(model) {
    return [
        '| Order | Case | When | Log |',
        '| --- | --- | --- | --- |',
        ...model.release.map((r) => `| ${r.order} | ${code(r.key)} | ${cell(code(conditionText(r.when)))} | ${cell(r.log)} |`),
    ].join('\n');
}

function componentTable(head, components) {
    const rows = components.flatMap((c) => Object.entries(c.caps).map(([cap, ports]) => `| ${code(`${c.section}.${c.entry}.${cap}`)} | ${portsText(ports)} |`));
    return [`| ${head} | Ports |`, '| --- | --- |', ...rows].join('\n');
}

function wordsTable(model) {
    const rows = Object.entries(model.words).map(([key, value]) => `| ${code(key)} | ${cell(Array.isArray(value) ? value.join(', ') : code(value))} |`);
    return ['| Key | Words |', '| --- | --- |', ...rows].join('\n');
}

/** The body of every view of the package description, by view name. */
export function packageViews(model) {
    return {
        description: [
            '## States',
            '',
            statesTable(model),
            '',
            '## Release cases',
            '',
            'The engine asks the cases in this order, and a met case lets the turn end before the scenario does.',
            '',
            releaseTable(model),
            '',
            '## Measurers',
            '',
            componentTable('Measurer', model.measures),
            '',
            '## Sources',
            '',
            componentTable('Source', model.sources),
            '',
            '## Words',
            '',
            wordsTable(model),
            '',
            '## Expected forms',
            '',
            expectTable(model),
        ].join('\n'),
        states: statesTable(model),
        map: model.states.map((s) => `- ${code(s.title)} — ${s.action ?? ''}; leads ${code(s.pattern ?? '')}`).join('\n'),
        'turn-end': [
            'The engine lets a turn end before the scenario does when a case is met, asked in this order:',
            '',
            ...model.release.map((r) => `- **${r.order}** · ${r.log ?? r.key} — ${code(conditionText(r.when))}`),
        ].join('\n'),
        expect: expectTable(model),
    };
}

/** The body of the view of the tree override: what it changes and the merged states. */
export function treeView(model, overridePath) {
    const line = (c) => {
        if (c.kind === 'removed') return `- removes ${code(c.key)} — ${c.reason}`;
        return `- ${c.kind === 'added' ? 'adds' : 'replaces'} ${code(c.key)}${c.after ? ` after ${code(`state.${c.after}`)}` : ''}`;
    };
    return [
        `The override ${code(overridePath)} changes the task flow of the package in this tree:`,
        '',
        ...model.changes.map(line),
        '',
        'The states of the merged scenario:',
        '',
        statesTable(model),
    ].join('\n');
}

/** The whole text of `flow.md`. */
function flowMd(body) {
    return [
        '# The task flow',
        '',
        'Generated by `flow-sync.mjs` from `flow.js` next to it. `flow-sync.mjs --check` refuses a hand edit:',
        'the description is edited, and the generator is run.',
        '',
        '<!-- flow:description -->',
        body,
        '<!-- /flow:description -->',
        '',
    ].join('\n');
}

/** The text of a file with the view between its markers, or null when the markers are absent. */
export function withView(text, name, body) {
    const open = `<!-- flow:${name} -->`;
    const close = `<!-- /flow:${name} -->`;
    const start = text.indexOf(open);
    const end = text.indexOf(close);
    if (start < 0 || end < start) return null;
    return `${text.slice(0, start + open.length)}\n${body}\n${text.slice(end)}`;
}

/** The layout of the tree: where rules, defaults and samples lie. */
function layoutOf(root) {
    const file = join(root, '.claude', 'rt-kit.json');
    const layout = existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')).layout ?? {}) : {};
    return {
        rules: layout.rules ?? '.claude/skills',
        defaults: layout.defaults ?? '.claude/rt-kit/defaults',
        samples: layout.samples ?? 'docs',
    };
}

/**
 * The views to sync: `{ name, path, body, whole, writable }`. The description is in the package
 * when the package sources lie next to its directory.
 */
export function viewsOf({ flow, override, root }) {
    const flowDir = dirname(flow);
    const assets = dirname(flowDir);
    const inPackage = existsSync(join(assets, 'rules', 'task-flow.md'));
    const layout = layoutOf(root);
    const at = inPackage
        ? { states: join(assets, 'rules', 'task-flow.md'), map: join(assets, 'defaults', 'turn-map.md'), 'turn-end': join(assets, 'rules', 'turn-conduct.md'), expect: join(assets, 'samples', 'tasks', '_template', 'plan.md') }
        : {
              states: join(root, layout.rules, 'task-flow', 'SKILL.md'),
              map: join(root, layout.defaults, 'turn-map.md'),
              'turn-end': join(root, layout.rules, 'turn-conduct', 'SKILL.md'),
              expect: join(root, layout.samples, 'tasks', '_template', 'plan.md'),
          };
    const bodies = packageViews(buildModel(flow));
    const views = [{ name: 'description', path: join(flowDir, 'flow.md'), body: bodies.description, whole: true, writable: inPackage }];
    for (const name of ['states', 'map', 'turn-end', 'expect']) views.push({ name, path: at[name], body: bodies[name], whole: false, writable: inPackage });
    if (override) {
        const merged = buildModel(flow, { override });
        views.push({ name: 'tree', path: join(root, layout.rules, 'task-flow', 'implementation.md'), body: treeView(merged, relative(root, override)), whole: false, writable: true, append: true });
    }
    return { views, base: inPackage ? assets : root };
}

/** The text a view's file must have, or `{ reason }` when it cannot be made. */
function expected(view) {
    if (view.whole) return { text: flowMd(view.body) };
    const now = existsSync(view.path) ? readFileSync(view.path, 'utf8') : null;
    if (now === null && !view.append) return { reason: 'the file is absent' };
    const text = withView(now ?? '', view.name, view.body);
    if (text !== null) return { text, now };
    if (view.append) return { text: `${now ?? ''}${now && !now.endsWith('\n') ? '\n' : ''}\n<!-- flow:${view.name} -->\n${view.body}\n<!-- /flow:${view.name} -->\n`, now, unmarked: true };
    return { reason: `it has no markers <!-- flow:${view.name} --> … <!-- /flow:${view.name} -->` };
}

/** Compares or writes the views. Returns the lines to print and the exit code. */
export function sync(options, { check }) {
    const { views, base } = viewsOf(options);
    const lines = [];
    let differ = 0;
    let written = 0;
    for (const view of views) {
        const where = relative(base, view.path);
        const want = expected(view);
        const now = existsSync(view.path) ? readFileSync(view.path, 'utf8') : null;
        if (want.text !== undefined && want.text === now) continue;
        if (check || !view.writable || want.text === undefined) {
            differ += 1;
            const reason = want.reason ?? (now === null ? 'the file is absent' : want.unmarked ? 'it has no markers yet' : 'it differs from its generation — a hand edit between the markers, or a description edited without a run');
            const fix = view.writable ? 'run flow-sync.mjs' : 'the package writes it, and the layout brings it';
            lines.push(`flow sync: ${view.name} in ${where}: ${reason}; ${fix}`);
            continue;
        }
        mkdirSync(dirname(view.path), { recursive: true });
        writeFileSync(view.path, want.text);
        written += 1;
        lines.push(`wrote ${view.name} in ${where}`);
    }
    if (differ > 0) {
        lines.push(`flow sync: ${differ} of ${views.length} views differ`);
        return { lines, code: 1 };
    }
    lines.push(check ? `flow sync: ${views.length} views match` : `flow sync: ${written} of ${views.length} views written`);
    return { lines, code: 0 };
}

/** Where the description lies: next to the laid-out generator, or in the package. */
function flowPath(given) {
    if (given) return given;
    const laid = join(HERE, 'task-flow', 'flow.js');
    return existsSync(laid) ? laid : join(HERE, '..', 'task-flow', 'flow.js');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const args = process.argv.slice(2);
    const take = (flag) => {
        const at = args.indexOf(flag);
        return at >= 0 ? args.splice(at, 2)[1] : undefined;
    };
    const check = args.includes('--check');
    const flow = flowPath(take('--flow'));
    const given = take('--override');
    const root = take('--root') ?? (spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).stdout?.trim() || process.cwd());
    if (args.some((a) => a !== '--check')) {
        console.error('usage: node flow-sync.mjs [--check] [--flow <flow.js>] [--override <flow.js>] [--root <dir>]');
        process.exit(2);
    }
    const override = given ?? (existsSync(join(root, OVERRIDE_PATH)) ? join(root, OVERRIDE_PATH) : undefined);
    try {
        const { lines, code: exit } = sync({ flow, override, root }, { check });
        console.log(lines.join('\n'));
        process.exit(exit);
    } catch (error) {
        if (error instanceof FlowSyntaxError) console.log(`flow syntax: ${error.message}`);
        else if (error instanceof FlowModelError) console.log(`flow model: ${error.message}`);
        else throw error;
        process.exit(1);
    }
}
