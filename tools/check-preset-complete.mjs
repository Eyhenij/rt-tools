#!/usr/bin/env node
/**
 * The check that the material preset of the second kit answers for every colour assignment of the
 * base set — either by an override of its own, or by a named reason why the colour is shared.
 *
 * The preset is a second layer of assignments over the base one: a name it does not mention keeps
 * the base colour. That is lawful for most names and a defect for some, and the two look exactly
 * alike in the source — silence. A forgotten colour is then found not by a run but by a person at
 * a showing, on the one screen they happened to open.
 *
 * The reason is not demanded of every silent name, because most of them do not need one. An
 * assignment whose whole value is a reference to another name follows the preset through that
 * reference: the preset rewrites the name it points at, and the colour changes with it. Such a
 * name is silent because there is nothing to say, and demanding a hand-written mark of it would
 * make the mark lie at the first edit — the reference gets replaced with a colour, the mark stays.
 * So «follows through a reference» is derived here rather than written by hand, and the reference
 * is followed to the end: a chain of two links resolves the same as one.
 *
 * What is left after that answers with the field `presetShared` next to the name in the source.
 * The check reads it in both directions: silence without a reason is a divergence, and a reason on
 * a name that no longer needs one — the preset started rewriting it, or a reference appeared — is
 * a divergence too. A mark nobody checks outlives what it explained and starts telling the reader
 * the opposite of the truth.
 *
 * There is no accepted list here on purpose: the whole set is nine names, and every one of them is
 * answered on the day the check is created. A list is started where the debt cannot be closed at
 * once, and that is not the case here.
 *
 * A non-zero exit code and a list of the divergences.
 */
import { light, material } from '../projects/ui-kit-v2/src/styles/tokens.source.mjs';

/** The prefix the check judges. Metrics, shadows and rounding carry no colour and no contrast. */
const COLOUR = /^--rt-color-/;

/** A value that is a reference and nothing besides: `var(--name)`, with no fallback and no maths. */
const WHOLE_REFERENCE = /^var\((--[a-z0-9-]+)\)$/;

const overridden = new Set(material.map((node) => node.name));
const base = new Map(light.map((node) => [node.name, node]));

/**
 * Does the assignment follow the preset through a reference. A whole-value reference is resolved
 * to the end: the name it points at may itself be silent and follow the preset one link further.
 * The walked names are remembered — a source with a cycle must refuse rather than hang.
 */
function followsPreset(name, walked = new Set()) {
    if (walked.has(name)) {
        return false;
    }
    walked.add(name);

    const target = base.get(name)?.value.match(WHOLE_REFERENCE)?.[1];

    if (!target) {
        return false;
    }

    return overridden.has(target) || followsPreset(target, walked);
}

const problems = [];
let follows = 0;
let named = 0;

for (const node of light) {
    if (!COLOUR.test(node.name)) {
        continue;
    }

    const reason = typeof node.presetShared === 'string' ? node.presetShared.trim() : '';

    if (overridden.has(node.name)) {
        if (reason) {
            problems.push(`${node.name}: the reason for a shared colour stands next to it, and the preset rewrites the name — remove the field \`presetShared\``);
        }
        continue;
    }

    if (followsPreset(node.name)) {
        follows += 1;
        if (reason) {
            problems.push(`${node.name}: the reason for a shared colour stands next to it, and the value follows the preset through the reference \`${node.value}\` — remove the field \`presetShared\``);
        }
        continue;
    }

    if (!reason) {
        problems.push(`${node.name}: the preset leaves it the base colour \`${node.value}\` and says nothing — either an override in \`tokens.material.mjs\`, or the reason in the field \`presetShared\` next to the name`);
        continue;
    }

    named += 1;
}

if (problems.length > 0) {
    console.error(`check-preset-complete: divergences ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    process.exit(1);
}

console.log(
    `check-preset-complete: colour assignments of the base set ${[...base.values()].filter((node) => COLOUR.test(node.name)).length}, the preset rewrites ${[...overridden].filter((name) => COLOUR.test(name)).length}, ${follows} follow it through a reference, ${named} are shared with a named reason`,
);
