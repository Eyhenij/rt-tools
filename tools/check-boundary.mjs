#!/usr/bin/env node
/**
 * The check that the rules package carries a consumer only what the consumer can carry out.
 *
 * The package is installed by foreign trees. A resource that has no subject in a foreign tree, or
 * nobody there to call it, reads there like any other: the same header, the same law above, the same
 * place in the list. The executor takes it into work and runs into an empty companion — and that is
 * the best outcome; the worst is that they fill the companion with a guess.
 *
 * The sign is two questions to the resource, and both are looked for by samples in its text:
 *   there is no subject — the resource speaks of the cargo intake, its admin panel or the sorting
 *   out of what arrived;
 *   there is nobody to call it — the resource itself writes that it is called in the package's
 *   repository.
 *
 * The sending side does not fall under the sign: the shape of the cargo, the send and the proposal
 * command are what the package is installed for. The word «intake» stands at them as an address the
 * cargo goes to, so the samples catch phrases about the receiving side's work rather than the word
 * itself.
 *
 * The list of what is cancelled this check does not read: a line in it lifts the layout here and
 * leaves the carrying to everybody else, while what is judged here is the package's content.
 *
 * FAIL-OPEN: there are no package resources in the tree — there is nothing to match, a zero code.
 *
 * A non-zero exit code and a list of the resources: one per line, with the reason.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(process.argv[2] ?? 'projects/agent-kit');

/**
 * The known debt: resources not for carrying that still lie in the package and move by a task of
 * their own. It is held by a list rather than by the check's silence: without the list the check
 * would stay red until the move is over and would refuse the push of every branch, including those
 * that make the move. Every line names where the resource will go, and is struck out by the same
 * change that moves it.
 */
const DEBT = join(resolve('tools'), 'boundary-debt.json');

/**
 * What the layout carries is judged: the resources and the code. The package's description and its
 * changelog do not travel to a consumer and speak of the package's tree lawfully — that is their subject.
 */
const CARRIED = ['assets', 'src'];
const SKIP = new Set(['node_modules', 'dist', 'coverage']);

/**
 * The samples of the sign. The left is what is looked for in a resource's text, the right is which of
 * the two questions answered «no». A sample is taken long on purpose: a short one catches the sending
 * side, which speaks of the intake too — as of an address rather than as of its own work.
 *
 * Every sample stands under two names, English and Russian: the package resources are written in
 * English, and a text not yet translated is judged by the same sign.
 */
const MARKS = [
    ["the intake's admin panel", 'there is no subject: a consumer has no intake admin panel'],
    ['админка приёма', 'there is no subject: a consumer has no intake admin panel'],
    ['the cargo receiver', 'there is no subject: the receiver lives in one tree of the workshop'],
    ['приёмник груза', 'there is no subject: the receiver lives in one tree of the workshop'],
    ['sorting out the arrived cargo', 'there is no subject: the cargo is sorted out by the receiving side'],
    ['разбор приехавшего груза', 'there is no subject: the cargo is sorted out by the receiving side'],
    ['the cargo that arrived in the intake is sorted out', 'there is no subject: the cargo is sorted out by the receiving side'],
    ['разбирается груз, приехавший в приём', 'there is no subject: the cargo is sorted out by the receiving side'],
    ['the mark command', 'there is no subject: the marks are set by the receiving side'],
    ['команда отметки', 'there is no subject: the marks are set by the receiving side'],
    ['The cargo state mark', 'there is no subject: the marks are set by the receiving side'],
    ['Отметка состояния груза', 'there is no subject: the marks are set by the receiving side'],
    ['Called **in the repository of the package itself**', "there is nobody to call it: the resource declared itself the work of the package tree"],
    ['Зовётся **в репозитории самого пакета**', "there is nobody to call it: the resource declared itself the work of the package tree"],
    ['in a foreign tree the command is meaningless', 'there is nobody to call it: the resource declared that itself'],
    ['в чужом дереве команда бессмысленна', 'there is nobody to call it: the resource declared that itself'],
    ['is meaningless in a foreign tree', 'there is nobody to call it: the resource declared that itself'],
    ['в чужом дереве бессмысленна', 'there is nobody to call it: the resource declared that itself'],
];

/** All the package's resource and code files: judged on a par — one layout carries them. */
function filesOf(dir) {
    const found = [];

    for (const entry of readdirSync(dir)) {
        if (SKIP.has(entry)) {
            continue;
        }

        const full = join(dir, entry);

        if (statSync(full).isDirectory()) {
            found.push(...filesOf(full));
            continue;
        }

        if (/\.(md|ts|mjs|sh|json)$/.test(entry)) {
            found.push(full);
        }
    }

    return found;
}

if (!existsSync(ROOT)) {
    process.exit(0);
}

const debt = existsSync(DEBT) ? (JSON.parse(readFileSync(DEBT, 'utf8')).accepted ?? {}) : {};
const problems = [];
const carried = [];

for (const file of CARRIED.flatMap((dir) => (existsSync(join(ROOT, dir)) ? filesOf(join(ROOT, dir)) : []))) {
    const text = readFileSync(file, 'utf8');
    const hit = MARKS.find(([mark]) => text.includes(mark));

    if (hit) {
        const where = relative(process.cwd(), file);

        (Object.hasOwn(debt, where) ? carried : problems).push(`  ${where} — ${hit[1]}`);
    }
}

/**
 * A pattern inherits the fate of its rule: it is wholly about how that rule is carried out, and it
 * is not always caught by the samples — ready-made calls happen to be shorter than any reservation.
 */
const namesOfRules = new Set(
    [...problems, ...carried]
        .map((line) => /assets\/rules\/([\w-]+)\.md/.exec(line))
        .filter(Boolean)
        .map((found) => found[1])
);

if (namesOfRules.size > 0) {
    const patterns = join(ROOT, 'assets/patterns');

    if (existsSync(patterns)) {
        for (const file of filesOf(patterns)) {
            const rule = /^rule:\s*([\w-]+)\s*$/m.exec(readFileSync(file, 'utf8'));

            if (rule && namesOfRules.has(rule[1])) {
                const where = relative(process.cwd(), file);

                (Object.hasOwn(debt, where) ? carried : problems).push(
                    `  ${where} — a pattern of the rule \`${rule[1]}\`, which is not for carrying`
                );
            }
        }
    }
}

if (carried.length > 0) {
    console.log(`check-boundary: known debt ${carried.length} — moving by tasks of its own\n`);
    carried.forEach((line) => console.log(line));
    console.log('');
}

if (problems.length === 0) {
    console.log('check-boundary: there is no new resource that is not for carrying');
    process.exit(0);
}

console.log(`check-boundary: resources not for carrying ${problems.length}\n`);
problems.forEach((line) => console.log(line));
console.log("\nSuch a resource lives as the tree's own resource rather than being cancelled by a list. The rule is the skill `agent-kit`.");
process.exit(1);
