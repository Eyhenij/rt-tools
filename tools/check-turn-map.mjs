#!/usr/bin/env node
// rt-kit v0.29.0 · checks/check-turn-map.mjs · b1a4ec3ca7e6 · правится надстройкой, не здесь
/**
 * The check of the turn map: its size and its completeness.
 *
 * The map is put into the context by the hook of entry into the session — whole, before the first
 * reply. That is what tells it from a rule: a rule the executor reads himself and pays a turn for
 * it, the map comes for free. For free — while it is short: a map grown to the size of a rule eats
 * the very window it was started for, and there is nothing to notice that with — it keeps coming
 * and keeps being right.
 *
 * The second thing that is not seen without the check: a state started in the rule and forgotten in
 * the map. The session then gets the map, does not find its state in it and goes to read the rule —
 * that is, the map works exactly up to the first new state.
 *
 * Three things are checked:
 *   the size   — the bytes of the laid-out map against the declared limit;
 *   the states — the names from the table of the rule against the names in the map, both ways;
 *   the exits  — all four exits of a turn are named.
 *
 * FAIL-OPEN: there is no map in the tree — nothing to check, a zero code. The tree may leave it
 * unlaid. An empty table of states in the map counts as a refusal: that is not «there is nothing
 * to check» but «the map is broken».
 *
 * A non-zero exit code and the list of discrepancies.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const MAP = join(ROOT, '.claude/rt-kit/defaults/turn-map.md');
const RULE = join(ROOT, '.claude/skills/task-flow/SKILL.md');

/**
 * The size limit of the map in bytes.
 *
 * The number is one and lives here: the map comes into every session whole, and the limit for it is
 * a property of the technique, not of the tree. Six kilobytes are taken by measurement, not by eye:
 * on the day it was started the map weighs 4495 bytes, and the rule it is squeezed out of 63803.
 * The spare of a kilobyte and a half is two or three new states; going past it, the map stops being
 * a squeeze, and then it is to be split, not the limit raised.
 */
const LIMIT_BYTES = 6144;

/**
 * The names of the states: a row of a table whose first cell stands in backticks — and for the turn
 * map a list line «- `имя` — действие; ведёт `паттерн`» as well. In the rule a list is not read this
 * way: patterns are written there in the same form, and they would get into the states.
 * whose first cell stands in backticks.
 *
 * Both forms are read on purpose. A list is a third cheaper than a table — the formatter pads the
 * columns with spaces up to a common width, and those spaces travel into the context of every
 * session meaning nothing; the table meanwhile stays lawful, and a tree that has not rewritten it
 * works as before.
 */
function statesOf(text, { listed: readListed = false } = {}) {
    const states = [];

    for (const line of text.split('\n')) {
        const listed = readListed && line.match(/^-\s+`([^`]+)`\s+—\s+(.+)$/);

        if (listed) {
            states.push({ name: listed[1], rest: listed[2].split(';').map((part) => part.trim()) });
            continue;
        }

        if (!line.startsWith('|')) {
            continue;
        }

        const cells = line
            .split('|')
            .slice(1, -1)
            .map((cell) => cell.trim());

        if (cells.length < 2) {
            continue;
        }

        const name = cells[0].match(/^`([^`]+)`$/);

        if (name) {
            states.push({ name: name[1], rest: cells.slice(1) });
        }
    }

    return states;
}

/**
 * The exits of a turn named by the law. Each has two names: the English one is brought by the
 * package, the Russian one is held by a tree whose map is still its own. Either of the two is enough.
 */
const EXITS = [
    ['a question to the owner', 'вопрос владельцу'],
    ['a guard refusal', 'отказ гарда'],
    ['the window filled', 'заполненное окно'],
    ['work handed over', 'работа отдана'],
];

function main() {
    if (!existsSync(MAP)) {
        console.log('check-turn-map: the tree has no turn map — there is nothing to check');

        return 0;
    }

    const text = readFileSync(MAP, 'utf8');
    const bytes = statSync(MAP).size;
    const faults = [];

    if (bytes > LIMIT_BYTES) {
        faults.push(`the map has grown: ${bytes} bytes at a limit of ${LIMIT_BYTES}`);
    }

    const inMap = statesOf(text, { listed: true });

    if (inMap.length === 0) {
        faults.push('the map carries no state at all — the table is broken');
    }

    for (const state of inMap) {
        if (!state.rest[0]) {
            faults.push(`${state.name}: the map carries no mandatory action`);
        }
    }

    if (existsSync(RULE)) {
        const inRule = statesOf(readFileSync(RULE, 'utf8'));
        const mapNames = new Set(inMap.map((state) => state.name));
        const ruleNames = new Set(inRule.map((state) => state.name));

        for (const state of ruleNames) {
            if (!mapNames.has(state)) {
                faults.push(`${state}: the state is declared by the rule and forgotten in the map`);
            }
        }

        for (const state of mapNames) {
            if (!ruleNames.has(state)) {
                faults.push(`${state}: the state stands in the map, and the rule does not declare it`);
            }
        }
    }

    for (const names of EXITS) {
        if (!names.some((name) => text.includes(name))) {
            faults.push(`the turn exit «${names[0]}» is not named in the map`);
        }
    }

    if (faults.length > 0) {
        console.log(`check-turn-map: divergences ${faults.length}, size ${bytes} bytes at a limit of ${LIMIT_BYTES}\n`);

        for (const fault of faults) {
            console.log(`  ${fault}`);
        }

        console.log('\nThe map is shorter than the rule — that is what makes it useful. Grown, it eats the very');
        console.log('window it is put into the context for. It is edited in the package resource, not in the laid-out copy.');

        return 1;
    }

    console.log(
        `check-turn-map: ${inMap.length} states, ${EXITS.length} turn exits, ` + `${bytes} bytes at a limit of ${LIMIT_BYTES} — it matches`
    );

    return 0;
}

process.exit(main());
