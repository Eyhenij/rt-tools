#!/usr/bin/env node
// rt-kit v0.40.0 · checks/decide.mjs · 3966a05905a9 · правится надстройкой, не здесь
/**
 * The decider: one answer for a hook, an action and the facts of the state — the decision, the
 * move the refusal names and its text — taken from the decision table.
 *
 *   node decide.mjs '<json>'   the query {hook, action, facts, params}; prints {decision, move, text,
 *                              tail} or nothing when no row refuses; `tail` says the common closing
 *                              words of a refusal follow the text
 *
 * The rows that say «this comes first» are not stored: a hook that refuses and names a move asks its
 * neighbours whether that move is refused in the same state, and their first refusal goes into its
 * text. The decider computes that from the rows of the neighbours, so a rule edited in one row
 * reaches every refusal that names its action.
 *
 * How a refusal is composed:
 *   - only a hook whose entry carries `asks` composes; `asks` names the action its neighbours are
 *     asked about — an action of the table, or «own» for the move its own refusal names;
 *   - the neighbours are asked in the order of `ORDER`, to the depth of three; the first refusal
 *     wins, and the rules gate answers from the rule the hook's own row names;
 *   - the neighbour's text goes after the hook's own words and before its closing «The rule is X.»;
 *     a row that already carries such a word has it recomputed in place;
 *   - a hook's own row is looked for by the facts exactly; when none fits, the facts another hook
 *     owns (`OWNED`) are let go — the row was written for the state where that neighbour allows.
 *
 * `{name}` in a text is filled from `params`; a slot with no param stays as written.
 *
 * A query with no action and with the hook input (`input`) gets its action from `action-of.mjs`: the
 * first class of the call the hook has a row for, or the hook's own `fallback` when no class fits. A
 * guard that judges every edit names no action of its own, and its rows that differ only by the
 * action are told apart by the call.
 *
 * Mutation: under the test harness (`RT_KIT_TEST`) the row whose key is `RT_DECISION_FLIP` decides
 * «allow». It proves that a hook takes its decision from here: the sweep `--mutate` of
 * decision-table.mjs flips each row in turn.
 *
 * FAIL-OPEN: no table, a table that does not parse, a query that does not parse, any error — the
 * decider prints nothing and exits 0, and the hook lets the action through. A broken decider has no
 * right to jam the work.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { actionOf, knownActionsOf } from './action-of.mjs';

const JOIN = 'The named move is refused right now, and this comes first — ';
const GATE_RE = /The named move is held by the rules gate: load the rule «([^»]+)» by the tool Skill first\./;
const MARK_RE = /The named move is (?:refused right now|held by the rules gate)/;
const TWO = ' Two moves from here:';

/** The neighbours a composing hook asks, in this order; `@gate` is the rules gate. */
export const ORDER = [
    'window-fill-guard.sh',
    'exam-guard.sh',
    '@gate',
    'handoff-entry-guard.sh',
    'task-flow-guard.sh',
    'task-flow-draft-guard.sh',
    'flow-step-guard.sh',
    'docs-guard.sh',
];

/** A fact one hook owns: another hook's row is found without it. */
export const OWNED = { window_over_stop: 'window-fill-guard.sh', exam: 'exam-guard.sh', doc_pair: 'docs-guard.sh' };

const vals = (v) => [v].flat();
const fitsFact = (rowValue, stateValue) => stateValue !== undefined && vals(stateValue).every((x) => vals(rowValue).includes(x));
const fits = (row, facts, skip = () => false) => Object.entries(row.when ?? {}).every(([k, v]) => skip(k) || fitsFact(v, facts[k]));
const specificity = (row) => Object.keys(row.when ?? {}).length;

/**
 * A fact a neighbour reads under another name. The rows of the window and of the handover entry call
 * the rule of the course of work `rule_loaded`, while the gate calls so the rule of the move; asked as
 * a neighbour, such a hook reads its own rule from `task_flow_loaded` when the asking hook gave it.
 */
export const ALIASES = {
    'window-fill-guard.sh': { rule_loaded: 'task_flow_loaded' },
    'handoff-entry-guard.sh': { rule_loaded: 'task_flow_loaded' },
};
const asNeighbour = (hook, facts) => {
    const alias = ALIASES[hook];
    if (!alias) return facts;
    const out = { ...facts };
    for (const [fact, from] of Object.entries(alias)) if (facts[from] !== undefined) out[fact] = facts[from];
    return out;
};

/** The key of a row — the same as `rowKey` of decision-table.mjs. */
export const keyOf = (row) =>
    `${row.area}|${row.hook}|${row.action}|${JSON.stringify(Object.fromEntries(Object.entries(row.when ?? {}).sort()))}`;

/** A row's text split into the hook's own words, the gate rule it names and its closing words. */
function parse(text, hook, ctx) {
    let suffix = '';
    let t = text;
    const two = text.indexOf(TWO);
    if (two >= 0) {
        suffix = text.slice(two);
        t = text.slice(0, two);
    }
    const rule = ctx.ruleOf[hook];
    if (rule && t.endsWith(rule)) {
        suffix = rule + suffix;
        t = t.slice(0, -rule.length);
    }
    const gate = t.match(GATE_RE)?.[1] ?? null;
    if (hook === 'flow-step-guard.sh') {
        const head = 'BLOCKED by flow-step-guard: ';
        let core = t.slice(head.length);
        const m = core.match(MARK_RE);
        if (m && m.index === 0) core = core.slice(core.indexOf(' Then: ') + ' Then: '.length);
        return { form: 'flow', head, core, suffix, gate };
    }
    const m = t.match(MARK_RE);
    const core = m ? t.slice(0, m.index).replace(/ $/, '') : t;
    return { form: 'tail', core, suffix, gate };
}

/** A row's key without the facts its neighbours own: the state a composed row was written for. */
const bareKey = (r) =>
    `${r.hook}\u0000${r.action}\u0000${JSON.stringify(Object.fromEntries(Object.entries(r.when ?? {}).filter(([k]) => !OWNED[k] || OWNED[k] === r.hook).sort()))}`;

function context(table) {
    const rows = table.rows ?? [];
    const asks = Object.fromEntries((table.hooks ?? []).filter((h) => h.asks).map((h) => [h.file, h.asks]));
    const ctx = { rows, asks, ruleOf: {}, ownMove: new Map() };
    for (const r of rows) {
        if (MARK_RE.test(r.text ?? '')) continue;
        const m = (r.text ?? '').replace(/ Two moves from here:.*$/s, '').match(/ The rule is [^.]+\.$/);
        if (m) ctx.ruleOf[r.hook] = m[0];
    }
    // The move a hook's own words name: from a row of the same hook with the same words and no word
    // about a neighbour.
    for (const r of rows) {
        if (MARK_RE.test(r.text ?? '')) continue;
        const core = parse(r.text ?? '', r.hook, ctx).core;
        ctx.ownMove.set(`${r.hook}\u0000${core}`, r.move);
        // A hook whose words are a slot says the same words for every action: the action tells them apart.
        ctx.ownMove.set(`${r.hook}\u0000${r.action}\u0000${core}`, r.move);
        // A text with slots says the same words for many states: the facts tell them apart.
        ctx.ownMove.set(bareKey(r), r.move);
    }
    return ctx;
}

function ownRow(ctx, hook, action, facts) {
    const rows = ctx.rows.filter((r) => r.hook === hook && r.action === action);
    let found = rows.filter((r) => fits(r, facts));
    if (found.length === 0) found = rows.filter((r) => fits(r, facts, (k) => OWNED[k] && OWNED[k] !== hook));
    found.sort((a, b) => specificity(b) - specificity(a));
    return found[0];
}

/** What a composing hook says first about the action it asks: the first neighbour that refuses it. */
function firstFor(ctx, hook, action, gate, facts, depth, opts) {
    for (const h of ORDER) {
        if (h === '@gate') {
            if (gate && facts.rule_loaded !== 'yes') {
                // The rule the gate waits for is the hook's fact when it gave one; the row names the
                // rule of the probe it was written by.
                return { first: `The named move is held by the rules gate: load the rule «${facts.gate_rule || gate}» by the tool Skill first.`, move: 'load_rule' };
            }
            continue;
        }
        if (h === hook) continue;
        const n = run(ctx, h, action, asNeighbour(h, facts), depth + 1, opts);
        if (n && n.decision === 'deny') return { first: JOIN + n.text.replace(/ Two moves from here:.*$/s, ''), move: n.move };
    }
    return { first: '', move: null };
}

function run(ctx, hook, action, facts, depth, opts) {
    const row = ownRow(ctx, hook, action, facts);
    if (!row) return null;
    if (opts.flip && keyOf(row) === opts.flip) return { decision: 'allow', move: null, text: '', hook };
    const tail = Boolean(row.tail);
    if (row.decision !== 'deny' || !ctx.asks[hook] || depth >= 3) return { decision: row.decision, move: row.move ?? null, text: row.text ?? '', hook, tail };
    const p = parse(row.text ?? '', hook, ctx);
    // A row with no word of a neighbour names its own move; a composed row finds it at the row of the
    // same state without the neighbours' facts, or at the row with the same words.
    const own = !MARK_RE.test(row.text ?? '')
        ? row.move
        : (ctx.ownMove.get(bareKey(row)) ?? ctx.ownMove.get(`${hook}\u0000${row.action}\u0000${p.core}`) ?? ctx.ownMove.get(`${hook}\u0000${p.core}`) ?? row.move);
    const asked = ctx.asks[hook] === 'own' ? own : ctx.asks[hook];
    const now = firstFor(ctx, hook, asked, p.gate, facts, depth, opts);
    const move = now.move ?? own;
    // A row that already says something first has that word recomputed in place: what the hook says
    // after it — more faults, the closing words — stays where it stood.
    const m = (row.text ?? '').match(MARK_RE);
    if (m) {
        const was = firstFor(ctx, hook, asked, p.gate, row.when ?? {}, depth, {});
        if (was.first && row.text.startsWith(was.first, m.index)) {
            const before = row.text.slice(0, m.index);
            const after = row.text.slice(m.index + was.first.length);
            const text =
                p.form === 'flow'
                    ? before + (now.first ? now.first + after : after.replace(/^ Then: /, ''))
                    : (now.first ? before + now.first : before.replace(/ $/, '')) + after;
            return { decision: row.decision, move, text, hook, tail, first: now.first };
        }
    }
    const text =
        p.form === 'flow'
            ? p.head + (now.first ? `${now.first} Then: ` : '') + p.core + p.suffix
            : p.core + (now.first ? ` ${now.first}` : '') + p.suffix;
    return { decision: row.decision, move, text, hook, tail, first: now.first };
}

/**
 * A hook whose words name several misses marks with `{first}` the miss the named move belongs to: the
 * word of the neighbour goes there, not after the last miss. No mark — the word stays where it stood.
 */
const placeFirst = (text, first) => {
    if (!text.includes('{first}')) return text;
    const said = first ? ` ${first}` : '';
    const at = said ? text.lastIndexOf(said) : -1;
    const rest = at >= 0 ? text.slice(0, at) + text.slice(at + said.length) : text;
    return rest.replace('{first}', said);
};

/** Fills `{name}` from the params; a slot with no param stays as written. */
export const fill = (text, params = {}) => text.replace(/\{([a-z_]+)\}/g, (slot, name) => (name in params ? String(params[name]) : slot));

const contexts = new WeakMap();

/**
 * The answer for a query, or null when no row of the hook and action fits the facts. `opts.flip` is
 * the key of a row to decide «allow» — the mutation sweep.
 */
export function decide(table, { hook, action, facts = {}, params = {}, input, fallback, base }, opts = {}) {
    if (!contexts.has(table)) contexts.set(table, context(table));
    const ctx = contexts.get(table);
    const known = new Set(ctx.rows.filter((r) => r.hook === hook).map((r) => r.action));
    // The class of the call when the decider recognises it, else the action the hook names as its
    // own: a write by a shell command into code is known to the hook's parse, not to the classes.
    const named = action || (input ? actionOf(input, known) : null) || (known.has(fallback) ? fallback : null);
    if (!named) return null;
    // One call may fit two classes the table names apart — creating a task is `task_new` in delivery
    // and `new_task` in the course of work. A flip of either is the flip of this call.
    const namedClasses = action ? [action] : [...knownActionsOf(input, known), named];
    // A class of the call together with a miss of the state may have no row of its own: the table
    // writes a class with every fact lawful. Then the plain action the hook names as `base` decides,
    // and only then: a row of the class that fits — a flipped one too — is the decision.
    const own = run(ctx, hook, named, facts, 0, opts);
    const plain = !own && base && base !== named && known.has(base);
    const classes = plain ? [base] : namedClasses;
    // A flipped row or state decides «allow» wherever its facts hold. The area is left out of the
    // match: twin rows of two areas are one decision of the hook, and the decider picks one of them.
    if (opts.flip) {
        const bare = (key) => key.slice(key.indexOf('|') + 1);
        const flipped = [...ctx.rows, ...(table.states ?? [])].some(
            (r) =>
                r.hook === hook &&
                classes.includes(r.action) &&
                bare(keyOf(r)) === bare(opts.flip) &&
                // A state was written with the facts its neighbours read; `rule_loaded` there may be the
                // window's own rule.
                (fits(r, facts) || Object.keys(ALIASES).some((h) => fits(r, asNeighbour(h, facts)))),
        );
        if (flipped) return { decision: 'allow', move: null, text: '', hook, tail: false };
    }
    const answer = plain ? run(ctx, hook, base, facts, 0, opts) : own;
    if (!answer) return null;
    const { first, ...rest } = answer;
    return { ...rest, text: placeFirst(fill(answer.text, params), first ? fill(first, params) : '') };
}

export function loadTable(path = process.env.RT_DECISION_TABLE ?? join(dirname(fileURLToPath(import.meta.url)), 'decision-table.json')) {
    // The copy laid out in a tree carries the layout header on its first line.
    return JSON.parse(readFileSync(path, 'utf8').replace(/^#[^\n]*\n/, ''));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    try {
        const query = JSON.parse(process.argv[2] ?? '{}');
        const flip = process.env.RT_KIT_TEST === '1' ? process.env.RT_DECISION_FLIP : undefined;
        const answer = decide(loadTable(), query, { flip });
        if (answer && answer.decision !== 'allow') {
            process.stdout.write(`${JSON.stringify({ decision: answer.decision, move: answer.move, text: answer.text, tail: answer.tail })}\n`);
        }
    } catch {
        // FAIL-OPEN: see the header.
    }
    process.exit(0);
}
