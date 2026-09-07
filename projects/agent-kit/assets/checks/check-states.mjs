#!/usr/bin/env node
/**
 * The audit of the list of work states against the pattern sections that lead them.
 *
 * A state without a leading text reads as the end of the work: the executor reads the
 * pattern down to the last section, there is no next motion in it, and the turn ends
 * with a report. That is how the state "the plan is written" stood — it occurred once,
 * as a table cell, and the hole was found by an incident, not by a check. The analysis
 * is the record "2026-08-21-turn-ended-at-the-written-plan" in the intake.
 *
 * Two sets are checked against each other in both directions:
 *   the list — the table of states in the work-conduct rule: the name and the leading pattern;
 *   sections — headings of the form "State `name`", in English or in the Russian wording: the
 *              English name is carried by the package, the Russian one is held by a tree
 *              pattern that has not been translated yet.
 *
 * A state without a section is a discrepancy. A section about a state outside the list
 * is one too: otherwise a renamed state leaves its former section behind, and that one
 * looks current.
 *
 * The leading pattern is taken from the table itself, not from file names: a section
 * lying in a pattern other than the assigned one does not bring the reader to itself —
 * the reader opens the assigned one.
 *
 * FAIL-OPEN: there is no work-conduct rule in the tree — nothing to check, zero code.
 * An empty table of states counts as a refusal: it means not "nothing to check" but
 * "the list is broken".
 *
 * A non-zero exit code and the list of discrepancies.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const RULE = join(ROOT, '.claude/skills/task-flow/SKILL.md');
const SKILLS = join(ROOT, '.claude/skills');

/** The state name and the pattern that leads it — from the table of the rule. */
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

/** The states a pattern has a section about. A heading of any level. */
function sectionsOf(pattern) {
    const file = join(SKILLS, pattern, 'SKILL.md');

    if (!existsSync(file)) {
        return null;
    }

    const found = new Set();

    for (const line of readFileSync(file, 'utf8').split('\n')) {
        const heading = line.match(/^#+\s+(?:State|Состояние)\s+`([^`]+)`/);

        if (heading) {
            found.add(heading[1]);
        }
    }

    return found;
}

if (!existsSync(RULE)) {
    console.log('check-states: the tree has no rule of work conduct — there is nothing to check');
    process.exit(0);
}

const states = statesFromRule(readFileSync(RULE, 'utf8'));

if (states.length === 0) {
    console.error('check-states: the rule of work conduct carries no table of states');
    process.exit(1);
}

const known = new Set(states.map((state) => state.name));
const problems = [];
const seen = new Map();

for (const state of states) {
    if (!seen.has(state.pattern)) {
        seen.set(state.pattern, sectionsOf(state.pattern));
    }

    const sections = seen.get(state.pattern);

    if (sections === null) {
        problems.push(`the state \`${state.name}\`: the leading pattern \`${state.pattern}\` is not laid out in the tree`);
        continue;
    }

    if (!sections.has(state.name)) {
        problems.push(`the state \`${state.name}\`: the pattern \`${state.pattern}\` carries neither the section «State \`${state.name}\`» nor «Состояние \`${state.name}\`»`);
    }
}

for (const [pattern, sections] of seen) {
    if (sections === null) {
        continue;
    }

    for (const name of sections) {
        if (!known.has(name)) {
            problems.push(`the pattern \`${pattern}\`: a section about \`${name}\`, and there is no such state in the list`);
        }
    }
}

if (problems.length > 0) {
    console.error(`check-states: divergences ${problems.length}`);

    for (const problem of problems) {
        console.error(`  ${problem}`);
    }

    console.error('\nThe list of states is the rule `task-flow`, the sections are the patterns next to it.');
    process.exit(1);
}

console.log(`check-states: states ${states.length}, each has a section in its leading pattern`);
