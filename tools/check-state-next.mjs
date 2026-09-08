#!/usr/bin/env node
// rt-kit v0.26.0 · checks/check-state-next.mjs · a7ea24371009 · правится надстройкой, не здесь
/**
 * The check that the section of a state names the next move.
 *
 * A section breaking off at the last step reads as the end of the work: the executor brings the
 * mandatory action to the end, reads the section through, finds no next move in it — and hands the
 * turn over with a report of what was done. Two turns ended that way: one on a written plan, the
 * second on a closed grill. The check of the states does not see this: it compares the names of the
 * sections with the list and does not look inside.
 *
 * Four texts are read:
 *   the list     — the table of states in the rule of work conduct: the name and the leading pattern;
 *   the sections — headings of the form «State `name`» or «Состояние `имя`» in those patterns;
 *   the rule     — the same one: the statement about the boundary of a state stands in it;
 *   the map and the law — the same statement stands there, if the tree has laid them out.
 *
 * The line of the next move is recognised by its opening and names its own: one word-for-word line
 * reads as a template and stops being noticed by the third section. That is why a repeated tail
 * counts as a discrepancy on a par with its absence.
 *
 * FAIL-OPEN: there is no rule of work conduct in the tree — nothing to check, a zero code. An empty
 * table of states counts as a refusal: it means not «there is nothing to check» but «the list is
 * broken». A leading pattern that is not in the tree is not judged here — it is named by the check
 * of the states, and two refusals about one miss read as two claims.
 *
 * A non-zero exit code and the list of discrepancies.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const RULE = join(ROOT, '.claude/skills/task-flow/SKILL.md');
/**
 * The rule of the conduct of a turn: the boundary of a state lives there, not in the rule of work
 * conduct. They split apart when the rule of work conduct went past the length limit: the course of
 * the work stayed in one, the exits of a turn moved into the other. A tree where only the first is
 * laid out is judged by it alone — it has no second file.
 */
const TURN_RULE = join(ROOT, '.claude/skills/turn-conduct/SKILL.md');
const SKILLS = join(ROOT, '.claude/skills');
const MAP = join(ROOT, '.claude/rt-kit/defaults/turn-map.md');
const LAW = join(ROOT, 'docs/constitution/work-conduct.md');

/**
 * The opening of the line: by it the line is found, while the tail of every section is its own.
 * There are two names: the English one is brought by the package, the Russian one is held by a
 * pattern of the tree that is not translated yet.
 */
const MARKERS = ['**Next move:**', '**Следующее движение:**'];
const MARKER = MARKERS[0];
const markerOf = (line) => MARKERS.find((one) => line.startsWith(one));

/** The statement about the boundary of a state. Stands in the rule, the map and the law in the same words. */
/**
 * The line about the boundary of a state. There are two names: the English one is brought by the
 * package, the Russian one is held by the rule, the map and the law of the tree, which are not
 * translated yet. Either of the two is enough.
 */
const BOUNDARIES = ['A transition from state to state', 'Переход из состояния в состояние'];
const BOUNDARY = BOUNDARIES[0];
const hasBoundary = (text) => BOUNDARIES.some((one) => text.includes(one));

/** Shorter than this the tail names no move: an opening without a move is the same emptiness. */
const MIN_TAIL = 20;

/** The name of the state and the pattern that leads it — from the table of the rule. */
function statesFromRule(text) {
    const states = [];

    for (const line of text.split('\n')) {
        if (!line.startsWith('|')) {
            continue;
        }

        const cells = line
            .split('|')
            .slice(1, -1)
            .map((cell) => cell.trim());

        if (cells.length < 4) {
            continue;
        }

        const name = cells[0].match(/^`([^`]+)`$/);
        const pattern = cells[3].match(/^`([^`]+)`$/);

        if (name && pattern) {
            states.push({ name: name[1], pattern: pattern[1] });
        }
    }

    return states;
}

/** The state sections of a pattern: the name, the whole heading and the move lines found in the section. */
function sectionsOf(pattern) {
    const file = join(SKILLS, pattern, 'SKILL.md');

    if (!existsSync(file)) {
        return null;
    }

    const sections = [];
    let current = null;

    for (const line of readFileSync(file, 'utf8').split('\n')) {
        const heading = line.match(/^#+\s+(?:State|Состояние)\s+`([^`]+)`/);

        if (heading) {
            current = { name: heading[1], heading: line.replace(/^#+\s+/, ''), moves: [] };
            sections.push(current);
            continue;
        }

        const marker = current ? markerOf(line) : undefined;

        if (marker) {
            current.moves.push(line.slice(marker.length).trim());
        }
    }

    return sections;
}

if (!existsSync(RULE)) {
    console.log('check-state-next: the tree has no rule of work conduct — there is nothing to check');
    process.exit(0);
}

const ruleText = readFileSync(RULE, 'utf8');
const states = statesFromRule(ruleText);

if (states.length === 0) {
    console.error('check-state-next: the rule of work conduct carries no table of states');
    process.exit(1);
}

const problems = [];
const patterns = new Map();
const tails = new Map();
let counted = 0;

for (const state of states) {
    if (!patterns.has(state.pattern)) {
        patterns.set(state.pattern, sectionsOf(state.pattern));
    }
}

for (const [pattern, sections] of patterns) {
    if (sections === null) {
        continue;
    }

    for (const section of sections) {
        counted += 1;

        const where = `\`${section.name}\` in the pattern \`${pattern}\``;

        if (section.moves.length === 0) {
            problems.push(`${where}: the section «${section.heading}» carries neither the line «${MARKER}» nor «${MARKERS[1]}»`);
            continue;
        }

        if (section.moves.length > 1) {
            problems.push(`${where}: the section «${section.heading}» carries ${section.moves.length} such lines, and the move is one`);
            continue;
        }

        const tail = section.moves[0];

        if (tail.length < MIN_TAIL) {
            problems.push(`${where}: the opening is there, and no move is named after it`);
            continue;
        }

        const twin = tails.get(tail);

        if (twin) {
            problems.push(`${where}: the move is word for word the same as at ${twin}`);
            continue;
        }

        tails.set(tail, `\`${section.name}\` in the pattern \`${pattern}\``);
    }
}

if (counted === 0) {
    problems.push('not a single state section was found: the patterns are not laid out or their headings are different');
}

const turnText = existsSync(TURN_RULE) ? readFileSync(TURN_RULE, 'utf8') : '';
if (!hasBoundary(ruleText) && !hasBoundary(turnText)) {
    problems.push(`the rule of turn conduct says nothing about the boundary of a state: it carries no line «${BOUNDARY}»`);
}

for (const [file, what] of [
    [MAP, 'the turn map'],
    [LAW, 'the law on work conduct'],
]) {
    if (existsSync(file) && !hasBoundary(readFileSync(file, 'utf8'))) {
        problems.push(`${what} says nothing about the boundary of a state: it carries no line «${BOUNDARY}»`);
    }
}

if (problems.length > 0) {
    console.error(`check-state-next: divergences ${problems.length}`);

    for (const problem of problems) {
        console.error(`  ${problem}`);
    }

    console.error('\nThe line of the next move stands in every state section: the opening is shared, the move is its own.');
    process.exit(1);
}

console.log(`check-state-next: state sections ${counted}, each names its next move`);
