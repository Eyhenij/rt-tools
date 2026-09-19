#!/usr/bin/env node
// rt-kit v0.29.0 · checks/check-descriptions.mjs · 451cb99f968b · правится надстройкой, не здесь
/**
 * The audit of the length of rule and pattern descriptions.
 *
 * A description travels into the system prompt of every session — all of them, as many as
 * the tree has — and that session pays for them whatever it is doing. That is how it differs
 * from the body of the rule: the body the executor reads itself and pays for it with a turn,
 * while the description comes free. Free — as long as it is short.
 *
 * It grows by itself: a description is written after the rule and retells its content.
 * No check counted the length, and in the tree where this audit was created forty
 * descriptions out of seventy-four had outgrown the limit.
 *
 * A description answers one question — take this rule or not. Everything that answers the
 * question "and what is inside" comes a second time together with the rule itself.
 *
 * FAIL-OPEN: there is no skills directory in the tree — nothing to check, zero code.
 *
 * A description longer than the limit, left deliberately, is named in the list of accepted
 * debt next to it — by the skill name, with a reason. A silent excess and a deliberate one
 * look the same, so the second is named in a list.
 *
 * A non-zero exit code and the list of those over the limit with the numbers.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SKILLS = join(ROOT, '.claude/skills');
const DEBT = join(ROOT, '.claude/rt-kit/description-debt.json');

/**
 * The limit of a description length in characters.
 *
 * Characters are counted, not bytes: a byte says nothing about the cost of the window, and
 * Cyrillic makes it one and a half times bigger than a character. Three hundred is the owner's
 * number, set from the first measurement.
 */
const LIMIT = 300;

/** The description from the header: the `description:` line up to the end of the line. */
function descriptionOf(text) {
    const match = /^description:\s*(.+)$/m.exec(text);

    return match === null ? null : match[1].trim();
}

/** The list of accepted debt: skill name → reason. No file — no debt. */
function debt() {
    if (!existsSync(DEBT)) {
        return {};
    }

    try {
        return JSON.parse(readFileSync(DEBT, 'utf8'));
    } catch {
        return {};
    }
}

function main() {
    if (!existsSync(SKILLS)) {
        console.log('check-descriptions: there is no directory of rules — there is nothing to check');

        return 0;
    }

    const accepted = debt();
    const over = [];
    const owed = [];
    let counted = 0;

    for (const name of readdirSync(SKILLS)) {
        const file = join(SKILLS, name, 'SKILL.md');

        if (!existsSync(file)) {
            continue;
        }

        const description = descriptionOf(readFileSync(file, 'utf8'));

        if (description === null) {
            continue;
        }

        counted += 1;

        if (description.length <= LIMIT) {
            continue;
        }

        if (Object.hasOwn(accepted, name)) {
            owed.push(`${name}: ${description.length} characters — ${accepted[name]}`);
            continue;
        }

        over.push({ name, length: description.length });
    }

    for (const line of owed) {
        console.log(`  debt ${line}`);
    }

    if (over.length > 0) {
        over.sort((first, second) => second.length - first.length);
        console.log(`check-descriptions: longer than the limit ${over.length} of ${counted}, the limit is ${LIMIT} characters\n`);

        for (const item of over) {
            console.log(`  ${item.name}: ${item.length} characters, ${item.length - LIMIT} over`);
        }

        console.log('\nA description answers one question — load this rule or not. A list of sections');
        console.log('and a retelling of the articles arrive a second time together with the rule itself.');
        console.log('What is left longer on purpose is named in .claude/rt-kit/description-debt.json with a reason.');

        return 1;
    }

    console.log(`check-descriptions: descriptions ${counted}, all within the limit of ${LIMIT} characters` + (owed.length > 0 ? `, accepted debt ${owed.length}` : ''));

    return 0;
}

process.exit(main());
