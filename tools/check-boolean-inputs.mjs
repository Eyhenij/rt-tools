#!/usr/bin/env node
/**
 * The check that a boolean input of the second kit accepts the bare attribute as truth.
 *
 * A boolean input declared without coercion takes the bare attribute as an empty string, and an
 * empty string is false. So `<rt-bottom-sheet open>` leaves the sheet closed while the markup reads
 * as correct — and nothing says otherwise: neither the build, nor the typecheck, nor the linter
 * looks at the value an attribute carries. Four showings of the sheet drew empty boxes because of
 * exactly this, and the defect was found by eye.
 *
 * The agreement is `docs/specs/ui-kit-v2/proposed/boolean-input-attribute`; the check holds its
 * fourth rule and is what the scenario `SC-UKV-136` is about.
 *
 * What the check judges:
 *
 * 1. An input whose declared value type is `boolean` carries `transform: booleanAttribute`.
 * 2. An input whose declared type is a union holding `boolean` is boolean only by that type — a
 *    tri-state carries a third value, and coercion would collapse it into false. Such an input is
 *    named in `accepted` with a reason rather than coerced by the sweep.
 * 3. An entry of the list that nothing answers to any more fails the run: the list only shrinks.
 *
 * The sign of coercion is the framework's own `booleanAttribute` and nothing else. A transform of
 * the kit's own would differ from the framework's on the value `"false"`, and that difference would
 * live where nobody looks for it; a transform named by a variable cannot be read from the text at
 * all. Both are refused as no coercion — the refusal names the input, and an input that legitimately
 * needs its own transform goes into the list by name.
 *
 * What the check does not judge:
 *
 * - A two-way input — `model()`. The framework gives it no transform at all, so a refusal there
 *   would have no lawful fix. The kit holds none today; the day one appears, the trap returns and
 *   the answer to it is written anew rather than guessed here.
 * - The showings and the first kit. The stories lie outside `src/lib`, and the first kit is read as
 *   a sample and is not edited.
 * - An input that is not boolean. A number taken from an attribute carries the same trap and its own
 *   answer.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { allowlistOf, baselineOf, parseAllowlist, ROOT, skipUnless } from './rt-kit-checks.config.mjs';

const KIT = 'projects/ui-kit-v2/src/lib';
/** The second entry of the package keeps its components apart. */
const SECOND_ENTRY = 'projects/ui-kit-v2/src/rich-editor/lib';
const ALLOWLIST = allowlistOf('boolean-inputs');
/** The framework's own coercion; the kit is held to it and to no other. */
const COERCION = /\btransform\s*:\s*booleanAttribute\b/;

skipUnless(existsSync(join(ROOT, KIT)), `the directory ${KIT}`);

/** Every `.ts` of a directory, to any depth: a family keeps its code in subdirectories. */
function sourcesOf(dir) {
    const found = [];
    for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) {
            found.push(...sourcesOf(path));
            continue;
        }
        if (entry.endsWith('.ts') && !entry.endsWith('.spec.ts')) {
            found.push(path);
        }
    }

    return found;
}

/**
 * The first type argument of a generic, read by bracket depth rather than by the nearest comma.
 *
 * A nested generic holds commas of its own — `InputSignalWithTransform<boolean, Foo<A, B>>` — and a
 * split at the first comma cuts the wrong place. It is returned together with the position the
 * generic closes at, so the caller reads the rest of the declaration from there.
 */
function firstTypeArgument(text, open) {
    let depth = 0;
    let split = -1;
    for (let at = open; at < text.length; at += 1) {
        const sign = text[at];
        if (sign === '<') {
            depth += 1;
            continue;
        }
        if (sign === '>') {
            depth -= 1;
            if (depth === 0) {
                return { value: text.slice(open + 1, split === -1 ? at : split).trim(), end: at };
            }
            continue;
        }
        if (sign === ',' && depth === 1 && split === -1) {
            split = at;
        }
    }

    return null;
}

/**
 * The input declarations of one file.
 *
 * The declaration is read up to the semicolon that ends it: the object literal inside holds no
 * semicolon of its own, so the boundary is unambiguous. What is looked for is the declared type of
 * the signal — the value the consumer sees — rather than the call that creates it: `input()`,
 * `input.required()` and a field assigned from a helper all declare the same type, and the type is
 * the one thing every form of them has.
 */
function inputsOf(path) {
    const text = readFileSync(path, 'utf8');
    const declaration = /(?:readonly\s+)?(#?[A-Za-z_$][\w$]*)\s*:\s*(?:InputSignalWithTransform|InputSignal)\s*</g;
    const found = [];
    let match = declaration.exec(text);
    while (match !== null) {
        const generic = firstTypeArgument(text, match.index + match[0].length - 1);
        if (generic !== null) {
            const semicolon = text.indexOf(';', generic.end);
            found.push({
                name: match[1],
                type: generic.value,
                body: text.slice(match.index, semicolon === -1 ? text.length : semicolon),
            });
        }
        match = declaration.exec(text);
    }

    return found;
}

const files = [...sourcesOf(join(ROOT, KIT)), ...(existsSync(join(ROOT, SECOND_ENTRY)) ? sourcesOf(join(ROOT, SECOND_ENTRY)) : [])];
const list = parseAllowlist('boolean-inputs');

const bare = [];
const byUnion = [];
let coerced = 0;

for (const path of files) {
    for (const input of inputsOf(path)) {
        if (!/\bboolean\b/.test(input.type)) {
            continue;
        }
        const entry = `${relative(ROOT, path)}:${input.name}`;
        if (input.type !== 'boolean') {
            byUnion.push(entry);
            continue;
        }
        if (COERCION.test(input.body)) {
            coerced += 1;
            continue;
        }
        bare.push(entry);
    }
}

if (process.argv.includes('--baseline')) {
    console.log(baselineOf(bare.sort(), list));
    process.exit(0);
}

const problems = [
    ...bare
        .filter((entry) => !list.debt.has(entry))
        .map(
            (entry) =>
                `${entry}: a boolean input without coercion — the bare attribute gives it an empty string, and that is false. ` +
                `Add «transform: booleanAttribute» to the declaration`,
        ),
    ...byUnion
        .filter((entry) => !list.accepted.has(entry))
        .map(
            (entry) =>
                `${entry}: the declared type holds boolean among others — coercion would collapse the third value into false. ` +
                `Name it in «accepted» of ${ALLOWLIST} with a reason, or declare the input plainly boolean`,
        ),
    ...[...list.debt.keys()]
        .filter((entry) => !bare.includes(entry))
        .map((entry) => `${entry}: it stands in the debt of ${ALLOWLIST}, and the input already carries coercion or is gone — remove the line`),
    ...[...list.accepted.keys()]
        .filter((entry) => !byUnion.includes(entry))
        .map((entry) => `${entry}: it stands in «accepted» of ${ALLOWLIST}, and the input is no longer boolean by type alone — remove the line`),
];

if (problems.length > 0) {
    console.error(`check-boolean-inputs: divergences ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    console.error(`\nThe agreement about this is docs/specs/ui-kit-v2/proposed/boolean-input-attribute.`);
    process.exit(1);
}

console.log(
    `check-boolean-inputs: files ${files.length}; boolean inputs ${coerced + bare.length}, of them coerced ${coerced} ` +
        `and awaiting their turn ${bare.length}; boolean by declared type alone and named with a reason ${byUnion.length}`,
);
