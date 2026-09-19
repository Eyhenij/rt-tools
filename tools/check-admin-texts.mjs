#!/usr/bin/env node
/**
 * A word for a person written past the dictionary of the admin application.
 *
 * Every label of the admin application comes from the dictionary by a key: two sets lie next to each
 * other, the choice of the language serves both, and a key without a text does not compile. Nothing
 * held the other side of that — a label written straight into the markup or into a string of the
 * code lives in one language, is found neither by a search for the key nor by whoever translates the
 * set, and stays Russian at the English choice. Neither the linter nor the build sees it: for them
 * it is an ordinary string.
 *
 * The sign is Cyrillic: the dictionary is the only place in the admin application where a Russian
 * word is lawful, and everything else about this application is written in keys. The check is
 * therefore about the admin application alone — the receiver answers a refusal by a code, and its
 * Russian sentence for the trees in the field is left there deliberately.
 *
 * What is not judged and why:
 *   comments — they are written in the language of the tree and never reach a person's screen;
 *   the label sets — the Cyrillic in them is the dictionary itself;
 *   the specs — the words a test waits for are the promise of the test, not a label of a screen.
 *
 * What had accumulated by the day the check was started is named by name in the accepted list, with
 * a reason and the number of a task; an entry that answers to nothing any more is a refusal of its
 * own, so the list only shrinks.
 *
 * A non-zero exit code and the list of places. With `--record` it prints the draft of the list
 * instead of judging: the reasons in it are empty on purpose — silencing is the owner's word, and it
 * is written by a hand.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

import { ROOT, baselineOf, parseAllowlist } from './rt-kit-checks.config.mjs';

/** The name of the list of what is accepted; the file lies next to the other lists of the tree. */
const LIST = 'admin-texts';

/** Where the words for a person live: the libraries of the admin application and the application itself. */
const ROOTS = ['libs/message-bus-admin', 'apps/message-bus-admin'];

/** The sign of a word for a person. The dictionary is the only place where it is lawful. */
const CYRILLIC = /[А-Яа-яЁё]/;

/** The dictionary itself: the Cyrillic in these two files is the set of the labels, not a stray label. */
const DICTIONARY = /admin-labels(-en)?\.ts$/;

/** A comment of the markup: the language of the tree, and it does not reach the screen. */
const HTML_COMMENT = /<!--[\s\S]*?-->/g;

/** A block comment and a line comment of the code, taken out for the same reason. */
const TS_BLOCK_COMMENT = /\/\*[\s\S]*?\*\//g;
const TS_LINE_COMMENT = /(^|[^:'"`\\])\/\/[^\n]*/g;

/** A string of the code in all three forms: what a person can be shown lives in one of them. */
const TS_STRING = /'([^'\\\n]*(?:\\.[^'\\\n]*)*)'|"([^"\\\n]*(?:\\.[^"\\\n]*)*)"|`([^`\\]*(?:\\.[^`\\]*)*)`/g;

/** A fragment of the markup between the angle brackets: a text node as well as the value of an attribute. */
const HTML_FRAGMENT = /[^<>]+/g;

/** The files of the roots, asked from version control: a file outside it reaches no branch. */
function filesOf() {
    const printed = execFileSync('git', ['ls-files', ...ROOTS], { cwd: ROOT, encoding: 'utf8' });

    return printed
        .split('\n')
        .map((one) => one.trim())
        .filter((one) => one !== '');
}

/** Whether the file is judged at all: the dictionary and the specs are out of the count. */
function judged(file) {
    if (DICTIONARY.test(file) || file.endsWith('.spec.ts')) {
        return false;
    }

    return file.endsWith('.html') || file.endsWith('.ts');
}

/** The words of the markup: the comments are cut out, the rest is taken by fragments. */
function wordsOfMarkup(source) {
    return [...source.replace(HTML_COMMENT, '').matchAll(HTML_FRAGMENT)]
        .map((found) => found[0].trim())
        .filter((one) => CYRILLIC.test(one));
}

/** The words of the code: the comments are cut out, and what is left is judged inside strings alone. */
function wordsOfCode(source) {
    const bare = source.replace(TS_BLOCK_COMMENT, '').replace(TS_LINE_COMMENT, '$1');

    return [...bare.matchAll(TS_STRING)]
        .map((found) => (found[1] ?? found[2] ?? found[3] ?? '').trim())
        .filter((one) => CYRILLIC.test(one));
}

/** The places of a word for a person, one key per word: the file and the word itself. */
function placesOf() {
    const places = [];

    for (const file of filesOf().filter(judged)) {
        const source = readFileSync(join(ROOT, file), 'utf8');
        const words = file.endsWith('.html') ? wordsOfMarkup(source) : wordsOfCode(source);

        for (const word of words) {
            places.push(`${file} «${word}»`);
        }
    }

    return [...new Set(places)].sort();
}

const places = placesOf();

if (process.argv.includes('--record')) {
    console.log(baselineOf(places, parseAllowlist(LIST, ['accepted']), 'accepted'));
    process.exit(0);
}

const parsed = parseAllowlist(LIST, ['accepted']);
const fresh = places.filter((place) => !parsed.accepted.has(place));
// An entry that answers to nothing any more silently allows what the tree does not have, and the
// next reader takes it for a current explanation.
const dead = [...parsed.accepted.keys()].filter((place) => !places.includes(place));

for (const place of fresh) {
    console.error(`a word for a person past the dictionary: ${place}`);
}

for (const place of dead) {
    console.error(`the accepted entry answers to nothing any more and is removed: ${place}`);
}

if (fresh.length > 0 || dead.length > 0) {
    console.error(
        'A label of a screen comes from the dictionary by a key: the sets lie in ' +
            'libs/message-bus-admin/common/core/util/src/lib/admin-labels.ts and admin-labels-en.ts next to it. ' +
            `What cannot be taken there is named in tools/${LIST}-allowlist.json with a reason and the number of a task.`,
    );
    process.exit(1);
}

console.log(`check-admin-texts: files read ${filesOf().filter(judged).length}, words past the dictionary none, accepted ${parsed.accepted.size}`);
