#!/usr/bin/env node
/**
 * The decision table of the package hooks: the facts of the tree and an action give «allow»,
 * «deny» or «ask». Every hook is described here by rows or by a mark, and five modes read it.
 *
 *   --validate   the table parses: every row names a known area, facts, values and action
 *   --coverage   every file of the hooks directory has a row or a mark: `deciding K of K, helpers M`
 *   --conform    every row with a probe matches the hook run on that probe: `rows N, mismatch M`
 *   --walk       every state of every area keeps an allowed action, and every refusal names an
 *                action allowed in the same state: `states N, ask-only A`, then `dead D, unnamed U`
 *   --chains     the pairs where the named move of one row is an action another row may deny, each
 *                with its scenario: `derived N, scenarios S, uncovered U`
 *   --mutate     each refusal row turned to «allow» for one probe run; a hook that decides by the
 *                table allows: `rows N, followed F`
 *   --reverse    the named move of each refusal asked of every hook that judges that action, in the
 *                state of the refusal: none may refuse it — `moves N, refused R`
 *   --snapshot-save <file>, --snapshot-compare <file>
 *                the answers of all probes saved before a change of the hooks and compared after
 *                it: `saved N`, then `rows N, changed C`
 *
 * A state is one combination of the values of the facts of one area. Areas judge disjoint facts,
 * so the walk goes area by area: the product over all hooks has no end, the product inside an area
 * does.
 *
 * The decision of an action in a state: «deny» when any row denies it, otherwise «ask» when any
 * row asks, otherwise «allow». An action decided «ask» is lawful — the owner decides in the window.
 * A state whose only lawful action is the question to the owner is ask-only, named apart.
 *
 * FAIL-OPEN: no hooks directory — coverage has nothing to count and says so; no test harness next
 * to the package — conformance has nothing to run with and says so. Both exit zero.
 *
 * Exit: 0 when the mode found nothing, 1 when it found a defect, 2 when the table does not parse.
 */
import { spawn } from 'node:child_process';
import { availableParallelism } from 'node:os';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { decide } from './decide.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const TABLE = process.env.RT_DECISION_TABLE ?? join(HERE, 'decision-table.json');
const HOOKS = process.env.RT_DECISION_HOOKS ?? [join(HERE, '../hooks'), join(process.cwd(), '.claude/hooks')].find(existsSync);
const HARNESS = join(HERE, '../../tests/lib.sh');
const SCENARIOS = process.env.RT_DECISION_SCENARIOS ?? join(process.cwd(), 'docs/specs/agent-kit/decision-table/scenarios.md');

const DECISIONS = new Set(['allow', 'deny', 'ask']);
const KINDS = new Set(['guard', 'helper', 'model']);

function load() {
    try {
        // The copy laid out in a tree carries the layout header on its first line.
        return JSON.parse(readFileSync(TABLE, 'utf8').replace(/^#[^\n]*\n/, ''));
    } catch (error) {
        console.error(`decision-table: the table does not parse — ${error.message}`);
        process.exit(2);
    }
}

/** Every problem of the table's shape, one line each. */
export function problemsOf(table) {
    const problems = [];
    const areas = table.areas ?? {};
    const hooks = new Map((table.hooks ?? []).map((h) => [h.file, h]));
    for (const [file, hook] of hooks) {
        if (!KINDS.has(hook.kind)) problems.push(`${file}: unknown kind «${hook.kind}»`);
        if (hook.kind !== 'guard' && !hook.reason) problems.push(`${file}: a ${hook.kind} mark carries no reason`);
    }
    for (const [name, area] of Object.entries(areas)) {
        if (area.ask && !area.actions.includes(area.ask)) problems.push(`area ${name}: the question «${area.ask}» is not its action`);
    }
    (table.rows ?? []).forEach((row, index) => {
        const at = `row ${index + 1} (${row.hook ?? '?'})`;
        const area = areas[row.area];
        if (!hooks.has(row.hook)) problems.push(`${at}: the hook has no entry`);
        else if (hooks.get(row.hook).kind !== 'guard') problems.push(`${at}: a ${hooks.get(row.hook).kind} has a row`);
        if (!area) return problems.push(`${at}: unknown area «${row.area}»`);
        if (!area.actions.includes(row.action)) problems.push(`${at}: the area has no action «${row.action}»`);
        if (!DECISIONS.has(row.decision)) problems.push(`${at}: unknown decision «${row.decision}»`);
        // A refusal may name a move of another area: the action names are one across the table.
        if (row.decision === 'deny' && !Object.values(table.areas).some((a) => a.actions.includes(row.move))) {
            problems.push(`${at}: a refusal names no action of any area`);
        }
        for (const [fact, value] of Object.entries(row.when ?? {})) {
            const values = area.facts[fact];
            if (!values) problems.push(`${at}: the area has no fact «${fact}»`);
            else if ([value].flat().some((v) => !values.includes(v))) problems.push(`${at}: «${fact}» has no value «${value}»`);
        }
    });
    (table.states ?? []).forEach((state, index) => {
        const at = `state ${index + 1} (${state.hook ?? '?'})`;
        const area = areas[state.area];
        if (!hooks.has(state.hook)) problems.push(`${at}: the hook has no entry`);
        else if (!hooks.get(state.hook).asks) problems.push(`${at}: the hook asks no neighbour, so it composes nothing`);
        if (!area) return problems.push(`${at}: unknown area «${state.area}»`);
        if (!area.actions.includes(state.action)) problems.push(`${at}: the area has no action «${state.action}»`);
        if (!state.probe) problems.push(`${at}: a state carries no probe`);
        for (const [fact, value] of Object.entries(state.when ?? {})) {
            const values = area.facts[fact];
            if (!values) problems.push(`${at}: the area has no fact «${fact}»`);
            else if ([value].flat().some((v) => !values.includes(v))) problems.push(`${at}: «${fact}» has no value «${value}»`);
        }
    });
    return problems;
}

/** The condition of a row as a map of fact to the set of values it admits. */
const condition = (row) => Object.fromEntries(Object.entries(row.when ?? {}).map(([fact, value]) => [fact, [value].flat()]));

/** Two conditions meet in some state: every fact they share admits a common value. */
export function meet(a, b) {
    const merged = { ...a };
    for (const [fact, values] of Object.entries(b)) {
        if (!merged[fact]) merged[fact] = values;
        else {
            merged[fact] = merged[fact].filter((v) => values.includes(v));
            if (merged[fact].length === 0) return null;
        }
    }
    return merged;
}

/**
 * A state inside a condition where every listed action is denied, or null. Search with backtracking;
 * the actions with the fewest deny rows go first, so an action nothing denies ends the search at once
 * instead of after every combination of the others.
 */
function cover(denyRows, actions, start) {
    const count = (action) => denyRows.filter((r) => r.action === action).length;
    return coverOrdered(denyRows, [...actions].sort((a, b) => count(a) - count(b)), start);
}

function coverOrdered(denyRows, actions, start) {
    if (actions.length === 0) return start;
    const [action, ...rest] = actions;
    for (const row of denyRows.filter((r) => r.action === action)) {
        const merged = meet(start, condition(row));
        if (!merged) continue;
        const found = coverOrdered(denyRows, rest, merged);
        if (found) return found;
    }
    return null;
}

/**
 * The walk of one table. The states of an area are counted, not enumerated: an area of forty-eight
 * facts has no end. A refusal is a defect when another row of the area may deny its named move in
 * a state where the refusal itself fires — their conditions meet. A dead state is a condition where
 * every action is denied; an ask-only one is where every action but the question is denied and no
 * row may deny the question.
 */
export function walk(table) {
    const result = { states: 0n, askOnly: 0, dead: [], unnamed: [] };
    const allDeny = table.rows.filter((row) => row.decision === 'deny');
    for (const [name, area] of Object.entries(table.areas)) {
        result.states += Object.values(area.facts).reduce((n, values) => n * BigInt(values.length), 1n);
        const deny = table.rows.filter((row) => row.area === name && row.decision === 'deny');
        const dead = cover(deny, area.actions, {});
        if (dead) result.dead.push({ area: name, state: dead });
        if (area.ask) {
            const others = area.actions.filter((action) => action !== area.ask);
            const state = cover(deny, others, {});
            if (state && !deny.some((row) => row.action === area.ask && meet(state, condition(row)))) result.askOnly += 1;
        }
        // The named move is looked for in every area, not only in the refusal's own: an action
        // name and a fact name mean one thing across the table, and a refusal of one area may name
        // a move a hook of another area denies.
        for (const row of deny) {
            const by = allDeny.filter((other) => other !== row && other.action === row.move && meet(condition(row), condition(other)));
            if (by.length > 0) result.unnamed.push({ area: name, state: meet(condition(row), condition(by[0])), row, by });
        }
    }
    return result;
}

export const rowId = (row) => `${row.hook}:${row.action}:${row.decision}`;

/**
 * The pairs where the named move of a refusal is an action another row of any area may deny. Two
 * rows of one hook and action differ by their conditions, so every pair of rows is its own chain,
 * even when its id repeats another's.
 */
export function chainsOf(table) {
    const pairs = [];
    for (const row of table.rows.filter((r) => r.decision === 'deny')) {
        for (const other of table.rows) {
            if (other === row || other.decision !== 'deny' || other.action !== row.move) continue;
            pairs.push({ id: `${rowId(row)} → ${rowId(other)}`, row, other });
        }
    }
    return pairs;
}

/**
 * The items of a scenarios file: a line starting with «- » and the lines indented under it. A chain
 * stands in an item that starts with its refusal and names the row denying its move.
 */
export function chainItems(text) {
    return text.split(/\n(?! {2})/).filter((item) => item.startsWith('- `'));
}

export const chainWritten = (items, chain) =>
    items.some((item) => item.startsWith(`- \`${rowId(chain.row)}\``) && item.includes(`\`${rowId(chain.other)}\``));

function hookFiles() {
    if (!HOOKS) return null;
    return readdirSync(HOOKS).filter((file) => /\.(sh|md)$/.test(file)).sort();
}

/**
 * One probe run through the test harness: the decision — «allow», «ask» or «deny» — and the text
 * the hook gave with it. A refusal comes two ways: exit 2 with the reason on stderr, or JSON with a
 * decision and its reason.
 */
/**
 * Runs the hook of a row on the fixture of its facts. Each probe keeps its stderr in a file of its
 * own: the probes run side by side, and a shared file would hand one probe the text of another.
 */
function runProbe(row, extraEnv = {}) {
    const script = [
        `. "${HARNESS}"`,
        // The harness drops every RT_ variable of the environment; the flipped row comes under another name.
        '[ -n "${PROBE_FLIP:-}" ] && export RT_DECISION_FLIP="$PROBE_FLIP"',
        // A rule within the host limit the gate puts into the session itself, and the fact of a
        // loaded rule counts it. The table speaks of the rule the session has not got: the probes
        // run under a limit nothing fits, and the delivery is held by the suites of the gate.
        'export RT_GATE_CONTEXT_LIMIT=1',
        'probe_err="$(mktemp)"',
        row.probe.setup ?? '',
        `json="$(${row.probe.input})"`,
        `out="$(printf '%s' "$json" | "$HOOKS/${row.hook}" 2>"$probe_err")"; code=$?`,
        `if [ "$code" = 2 ]; then echo deny; elif [ -z "$out" ]; then echo allow; else printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecision // .decision // "allow"' | sed 's/^block$/deny/'; fi`,
        `printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecisionReason // .reason // empty' 2>/dev/null | tr '\\n' ' '`,
        `tr '\\n' ' ' < "$probe_err"; rm -f "$probe_err"`,
    ].join('\n');
    const env = { ...process.env, HOOKS_OVERRIDE: HOOKS, TMPDIR: process.env.TMPDIR ?? '/tmp', ...extraEnv };
    // The table speaks of the session's calls. A hook that passes everything on the pipeline would
    // answer a sweep run there otherwise than it answers the session.
    delete env.CI;
    delete env.GITHUB_ACTIONS;
    return new Promise((resolve) => {
        const child = spawn('bash', ['-c', script], { env, stdio: ['ignore', 'pipe', 'ignore'] });
        let stdout = '';
        child.stdout.on('data', (chunk) => (stdout += chunk));
        child.on('close', () => {
            const lines = stdout.split('\n');
            resolve({ decision: lines[0]?.trim() || 'allow', text: lines.slice(1).join(' ') });
        });
    });
}

/** Maps the items through an async function, as many at once as the machine has cores. */
async function pool(items, fn) {
    const results = new Array(items.length);
    let next = 0;
    const worker = async () => {
        while (next < items.length) {
            const index = next++;
            results[index] = await fn(items[index]);
        }
    };
    await Promise.all(Array.from({ length: Math.max(1, availableParallelism()) }, worker));
    return results;
}

function coverage(table) {
    const files = hookFiles();
    if (!files) return console.log('no hooks directory: nothing to count'), 0;
    const known = new Map(table.hooks.map((h) => [h.file, h]));
    const missing = files.filter((f) => !known.has(f));
    // In the package an entry with no file is a dead entry; in a tree that installs the package it
    // is a hook the tree dropped by its skip list, and that is lawful.
    const source = HOOKS === join(HERE, '../hooks') && !process.env.RT_DECISION_TREE;
    const absent = [...known.keys()].filter((f) => !files.includes(f));
    const stale = source ? absent : [];
    missing.forEach((f) => console.log(`no row or mark: ${f}`));
    stale.forEach((f) => console.log(`an entry with no file: ${f}`));
    if (!source && absent.length > 0) console.log(`skipped by the tree: ${absent.length}`);
    const guards = files.filter((f) => known.get(f)?.kind === 'guard');
    const helpers = files.filter((f) => known.has(f) && known.get(f).kind !== 'guard');
    const deciding = guards.filter((f) => table.rows.some((r) => r.hook === f));
    guards.filter((f) => !deciding.includes(f)).forEach((f) => console.log(`a guard with no row: ${f}`));
    console.log(`deciding ${deciding.length} of ${guards.length}, helpers ${helpers.length}`);
    return missing.length + stale.length + guards.length - deciding.length === 0 ? 0 : 1;
}

async function conform(table) {
    if (!existsSync(HARNESS)) return console.log('no test harness next to the package: nothing to run with'), 0;
    const probed = table.rows.filter((row) => row.probe);
    const results = await pool(probed, runProbe);
    // A refusal row names its move by `says` — a pattern its text must carry; a decision alone
    // would let the hook name any move at all.
    const mismatch = probed.filter((row, index) => {
        const got = results[index];
        // The hook's own text goes with a mismatch: the row id alone does not say which fact the hook read otherwise.
        const said = got.text.trim().slice(0, 300);
        if (got.decision !== row.decision) return console.log(`${rowId(row)}: the hook decided «${got.decision}»: ${said}`), true;
        if (row.says && !new RegExp(row.says).test(got.text)) return console.log(`${rowId(row)}: the refusal does not say /${row.says}/: ${said}`), true;
        if (row.decision === 'deny' && !row.says) return console.log(`${rowId(row)}: a refusal row carries no «says»`), true;
        return false;
    });
    const unprobed = table.rows.filter((row) => !row.probe);
    unprobed.forEach((row) => console.log(`no probe: ${rowId(row)}`));
    // A helper mark claims the file refuses nothing: one subscribed to an agent event is run on a
    // plain command in a bare tree. A sourced helper is not run: some of them run whole check sets
    // when called by hand.
    const plain = { setup: 'T=$(fixture_tree); export CLAUDE_PROJECT_DIR="$T" TMPDIR="$T"', input: `jq -n '{session_id:"p",hook_event_name:"PreToolUse",tool_name:"Bash",tool_input:{command:"true"},cwd:"/"}'` };
    const helpers = table.hooks.filter((h) => h.kind === 'helper' && h.event && existsSync(join(HOOKS, h.file)));
    const helperRuns = await pool(helpers, (h) => runProbe({ hook: h.file, probe: plain }));
    const refusing = helpers.filter((h, index) => helperRuns[index].decision === 'deny');
    refusing.forEach((h) => console.log(`${h.file}: a helper refused a plain command`));
    const total = mismatch.length + unprobed.length + refusing.length;
    console.log(`rows ${probed.length}, mismatch ${total}`);
    return total === 0 ? 0 : 1;
}

/**
 * The key of a row: its area, hook, action and conditions. Unique across the table — two rows with
 * one key would be one decision written twice.
 */
export const rowKey = (row) =>
    `${row.area}|${row.hook}|${row.action}|${JSON.stringify(Object.fromEntries(Object.entries(row.when ?? {}).sort()))}`;

/**
 * The text of a hook as the snapshot keeps it: the paths, the commit hashes and the ports of the
 * fixture differ from run to run, and a refusal that names one would read as changed on every run.
 */
export const steadyText = (text) =>
    text
        .replace(/\/(?:private\/)?(?:var\/folders|tmp)\/[^\s'"»),;]*/g, '<tmp>')
        .replace(/\b(?=[0-9a-f]*\d)[0-9a-f]{7,40}\b/g, '<sha>')
        // A hash of letters only is told from a word by its place: after «commit» or a dash, before «<».
        .replace(/(\bcommit\s+|—\s)[a-f]{7,40}(?=\s<|\s|$)/g, '$1<sha>')
        .replace(/\b(port|:)\s?\d{4,5}\b/g, '$1<port>')
        // A message of the shell names the line of the hook, and every edit of the hook moves it.
        .replace(/\bline \d+:/g, 'line <n>:')
        .replace(/\s+/g, ' ')
        .trim();

/** The answer of every probe: the decision and the steady text, by the key of its row. */
async function probeAnswers(table) {
    const probed = table.rows.filter((row) => row.probe);
    const results = await pool(probed, (row) => runProbe(row));
    return Object.fromEntries(probed.map((row, index) => [rowKey(row), { decision: results[index].decision, text: steadyText(results[index].text) }]));
}

/**
 * `--snapshot-save <file>`: the answers of all probes before a change of the hooks, to compare with
 * after it. The snapshot judges the hooks apart from the table: a hook that prints its text from the
 * table is compared with what it printed before, not with the table itself.
 */
async function snapshotSave(table, file) {
    const answers = await probeAnswers(table);
    writeFileSync(file, `${JSON.stringify(answers, null, 1)}\n`);
    console.log(`saved ${Object.keys(answers).length}`);
    return 0;
}

/** `--snapshot-compare <file>`: every probe answers as the snapshot says. */
async function snapshotCompare(table, file) {
    const before = JSON.parse(readFileSync(file, 'utf8'));
    const now = await probeAnswers(table);
    const changed = Object.keys(before).filter((key) => {
        // The snapshot is read through the same steadying as the run: a rule added to it later applies
        // to a snapshot taken before the rule.
        const was = { ...before[key], text: steadyText(before[key].text ?? '') };
        const is = now[key];
        if (is && is.decision === was.decision && is.text === was.text) return false;
        // The first place the two texts part, so the reader sees what moved without a diff.
        const at = [...(was.text ?? '')].findIndex((ch, i) => ch !== (is?.text ?? '')[i]);
        const near = (text) => (text ?? '').slice(Math.max(0, at - 40), at + 60);
        console.log(`changed: ${key}: ${was.decision} → ${is?.decision ?? 'no row'}`);
        if (is && at >= 0) console.log(`  was «${near(was.text)}»\n  now «${near(is.text)}»`);
        return true;
    });
    console.log(`rows ${Object.keys(before).length}, changed ${changed.length}`);
    return changed.length === 0 ? 0 : 1;
}

/**
 * `--mutate`: each refusal row is turned to «allow» for one run of its probe, by the key in
 * `RT_DECISION_FLIP`; a hook that takes its decision from the table then allows. The decider honours
 * the key only under the test harness, which marks its runs with `RT_KIT_TEST`.
 */
async function mutate(table) {
    const rows = table.rows.filter((row) => row.probe && row.decision !== 'allow');
    const results = await pool(rows, (row) => runProbe(row, { PROBE_FLIP: rowKey(row) }));
    const followed = rows.filter((row, index) => results[index].decision === 'allow');
    // The rows a hook did not follow, named by hook: a long list is cut, the count stays whole.
    const missed = rows.filter((row, index) => results[index].decision !== 'allow');
    if (process.argv.includes('--verbose')) missed.forEach((row) => console.log(`not followed: ${rowId(row)} ${JSON.stringify(row.when ?? {})}`));
    console.log(`rows ${rows.length}, followed ${followed.length}`);
    return followed.length === rows.length ? 0 : 1;
}

/**
 * `--reverse`: a refusal is lawful only when its named move goes through in the same state. Each
 * refusal row — stored or computed by the decider — names a move; every hook that has rows for that
 * action is asked in the facts of the refusal. The hooks take their decision from the table, and the
 * sweep `--mutate` proves it row by row, so the hook's answer is the decider's answer: asking the
 * decider is asking the hook without a probe for each pair. A move no hook judges is free.
 */
function reverse(table) {
    const stored = load();
    const judges = new Map();
    for (const row of stored.rows ?? []) {
        if (!judges.has(row.action)) judges.set(row.action, new Set());
        judges.get(row.action).add(row.hook);
    }
    let moves = 0;
    let refused = 0;
    for (const row of table.rows) {
        if (row.decision !== 'deny' || !row.move || !judges.has(row.move)) continue;
        for (const hook of judges.get(row.move)) {
            moves += 1;
            const answer = decide(stored, { hook, action: row.move, facts: row.when ?? {} });
            if (answer?.decision !== 'deny') continue;
            refused += 1;
            console.log(`refused: ${rowId(row)} names ${row.move}, and ${hook} denies it in ${JSON.stringify(row.when ?? {})}`);
        }
    }
    console.log(`moves ${moves}, refused ${refused}`);
    return refused === 0 ? 0 : 1;
}

function walkMode(table) {
    const result = walk(table);
    for (const { area, state } of result.dead.slice(0, 20)) console.log(`dead: ${area} ${JSON.stringify(state)}`);
    for (const { area, state, row, by } of result.unnamed.slice(0, 20)) {
        console.log(`unnamed: ${area} ${JSON.stringify(state)} ${rowId(row)} names «${row.move}», denied by ${by.map(rowId).join(', ')}`);
    }
    console.log(`states ${result.states.toString()}, ask-only ${result.askOnly}`);
    console.log(`dead ${result.dead.length}, unnamed ${result.unnamed.length}`);
    return result.dead.length + result.unnamed.length === 0 ? 0 : 1;
}

function chainsMode(table) {
    const chains = chainsOf(table);
    const text = existsSync(SCENARIOS) ? readFileSync(SCENARIOS, 'utf8') : '';
    const items = chainItems(text);
    const uncovered = chains.filter((chain) => !chainWritten(items, chain));
    uncovered.forEach((chain) => console.log(`no scenario: ${chain.id}`));
    // `--decided` names in the line that the pairs were counted over the rows the decider computed.
    const decided = process.argv.includes('--decided') ? ' decided' : '';
    console.log(`derived ${chains.length}${decided}, scenarios ${chains.length - uncovered.length}, uncovered ${uncovered.length}`);
    return uncovered.length === 0 ? 0 : 1;
}

const MODES = {
    '--coverage': coverage,
    '--conform': conform,
    '--walk': walkMode,
    '--chains': chainsMode,
    '--mutate': mutate,
    '--reverse': reverse,
    '--snapshot-save': (table) => snapshotSave(table, process.argv[3]),
    '--snapshot-compare': (table) => snapshotCompare(table, process.argv[3]),
};

/**
 * The table as the hooks meet it: the stored rows, and a row the decider computes for every state of
 * `states`. A state is a combination of facts where a refusal is composed with the refusal of a
 * neighbour; it keeps its probe and the pattern its text must carry, and nothing else — the
 * decision, the move and the text come from the rows of the hook and its neighbours.
 */
export function withDecided(table) {
    const decided = (table.states ?? []).map((state) => {
        const answer = decide(table, { hook: state.hook, action: state.action, facts: state.when ?? {} });
        return { ...state, decision: answer?.decision ?? 'allow', move: answer?.move ?? undefined, text: answer?.text ?? '', decided: true };
    });
    return { ...table, rows: [...(table.rows ?? []), ...decided] };
}

async function main(mode) {
    const stored = load();
    const problems = problemsOf(stored);
    if (mode === '--validate') {
        problems.forEach((p) => console.log(p));
        console.log(`rows ${(stored.rows ?? []).length}, problems ${problems.length}`);
        return problems.length === 0 ? 0 : 1;
    }
    const table = withDecided(stored);
    if (!MODES[mode]) {
        console.error('decision-table: name a mode — --validate, --coverage, --conform, --walk, --chains, --mutate, --reverse, --snapshot-save <file> or --snapshot-compare <file>');
        return 2;
    }
    if (problems.length > 0) {
        console.error(`decision-table: ${problems.length} problems — run --validate`);
        return 2;
    }
    return MODES[mode](table);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exit(await main(process.argv[2]));
