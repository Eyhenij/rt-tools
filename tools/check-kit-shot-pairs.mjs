#!/usr/bin/env node
/**
 * The list that pairs a shot of the first kit with a shot of the second.
 *
 * Why it exists. The two kits keep their references apart: different story names, different
 * windows, different thresholds. After a family moves, nobody knows which frame of the second kit
 * to put next to which frame of the first — and the divergence of the looks is then seen only by
 * whoever remembers how it was. The list says what to look at with what; the looking is a person's.
 *
 * What it judges. Every name in the list exists among the references of its kit. A family whose
 * pair in the second kit is not there yet stands with a reason, not silently. A reason at a family
 * that already has its pair is a leftover and is refused too.
 *
 *   node tools/check-kit-shot-pairs.mjs
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

/** The list itself: written by hand, read by the machine. */
const LIST = 'tools/kit-shot-pairs.json';

/** Where the references of each kit lie. */
const SHOTS = {
    one: 'projects/ui-kit/.storybook/__snapshots__',
    two: 'projects/ui-kit-v2/.storybook/__snapshots__',
};

function shotsOf(dir) {
    return new Set(readdirSync(join(ROOT, dir)).map((name) => name.replace(/\.png$/, '')));
}

const list = JSON.parse(readFileSync(join(ROOT, LIST), 'utf8'));
const one = shotsOf(SHOTS.one);
const two = shotsOf(SHOTS.two);

const problems = [];
let paired = 0;
let awaiting = 0;

for (const family of list.families) {
    for (const name of family.kitOne) {
        if (!one.has(name)) {
            problems.push(`«${family.family}»: the first kit has no shot «${name}»`);
        }
    }

    for (const name of family.kitTwo) {
        if (!two.has(name)) {
            problems.push(`«${family.family}»: the second kit has no shot «${name}»`);
        }
    }

    if (family.kitOne.length === 0) {
        problems.push(`«${family.family}»: not a single shot of the first kit — there is nothing to compare with`);
    }

    if (family.kitTwo.length === 0) {
        awaiting += 1;
        if (!family.reason) {
            problems.push(`«${family.family}»: no pair in the second kit and no reason — a silent gap looks exactly like a pair`);
        }
    } else {
        paired += 1;
        if (family.reason) {
            problems.push(`«${family.family}»: the pair is in place, and the reason for its absence is still written — remove it`);
        }
    }
}

if (problems.length > 0) {
    console.error(`\ncheck-kit-shot-pairs: divergences ${problems.length}\n`);
    for (const problem of problems) {
        console.error(`  ${problem}`);
    }
    console.error('\nThe list is `tools/kit-shot-pairs.json`. A family without a pair stands with a reason, not empty.\n');
    process.exit(1);
}

console.log(
    `check-kit-shot-pairs: families ${list.families.length}, shots of the first kit ` +
        `${list.families.reduce((sum, family) => sum + family.kitOne.length, 0)}; ` +
        `paired ${paired}, awaiting their move and named with a reason ${awaiting}`
);
