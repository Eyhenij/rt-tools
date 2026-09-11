#!/usr/bin/env node
// rt-kit v0.27.0 · checks/check-glossary.mjs · f86dfe121701 · правится надстройкой, не здесь
/**
 * The words not written here: the section «Not written here» of the glossary against the tree.
 *
 * The section lay without a single check, and exactly for that the divergence grew for years: the
 * glossary called a service by one word, the tree by another, and both sides looked to be in force.
 * The rule plainly orders to take the word from the glossary or to start it there, and nothing
 * turned red — the address check reads paths, the spec check reads scenarios, and nobody reads the
 * glossary.
 *
 * The check travels with the package and is not written by the tree: the section «Not written here»
 * is brought by the same package, and a tree that got the glossary and has no check over it lives
 * with exactly the hole the check was started for. The words meanwhile belong to the glossary: the
 * package does not list them but reads them from the section. What is common to the checks — the
 * parsing of the known list and the list of skipped directories — arrives as the module of the
 * check settings and is not written here anew.
 *
 * The left column of the pairs «forbidden on the left — accepted on the right» is searched for, and
 * not all of it: a word with a bracketed clarification («приём (о службе)») is not judged by search
 * at all. The clarification means exactly that one meaning of two is forbidden, and a machine has
 * nothing to tell them apart in a line with: «операция приёма» is lawful and «приём принимает груз»
 * is not, and both lines are the same for the search. Such a word stays a demand on the reader; the
 * check says it out loud, so that silence is not read as coverage.
 *
 * The glossary itself is taken out of the search: a forbidden word stands in it for the cause —
 * that is what the left column lives by. The archive is taken out too: by its make-up it names what
 * is no longer in the tree.
 *
 * A non-zero exit code and the list of places; what piled up by the day the check was started is
 * listed by name, with a reason and the number of a task.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

import { CONFIG, ROOT, baselineOf, parseAllowlist } from './rt-kit-checks.config.mjs';

const GLOSSARY = 'docs/GLOSSARY.md';
/**
 * The section of forbidden words. There are two names: the English one is brought by the package,
 * the Russian one is held by a tree whose glossary is its own and not translated yet. A new edition
 * of the package is not entitled to leave such a tree without the check.
 */
const SECTIONS = ['## Not written here', '## Так не пишем'];
/** A pair of the glossary: `- **left** — right`. On the left there may be several words by comma. */
const PAIR = /^-\s+\*\*(.+?)\*\*\s+—/;
/**
 * The same pair written as a table row: `| left | right |`. The form is the tree's to choose, and a
 * section set as a table used to read as empty — the check then declared a skip and stood in the
 * gate next to the passed ones without judging a single word. The header row and the delimiter row
 * are sifted out by the same expression: neither holds a word in bold or in backticks.
 */
const ROW = /^\|\s*(?:\*\*(.+?)\*\*|`(.+?)`)\s*\|/;
/** A bracketed clarification at a word: one meaning of two is forbidden, and search cannot part them. */
const HINT = /\([^)]*\)\s*$/;

/**
 * What the check does not read.
 *
 * Every glossary — the local one, its override and the source in the package — is taken out for the
 * cause: the left column lives by naming the forbidden word out loud. The archive and the task
 * folders are taken out by their make-up: the first lists what is no longer in the tree, the second
 * dies with the merge.
 */
const UNREAD = ['docs/archive/', 'docs/tasks/', 'CHANGELOG'];
const GLOSSARY_NAME = /(^|\/)GLOSSARY\.md$/;

/** The left column of the section of forbidden words: the words that must not be in the tree. */
function forbiddenWords(text) {
    const lines = text.split('\n');
    const from = lines.findIndex((line) => SECTIONS.includes(line.trim()));
    if (from < 0) {
        return { words: [], byReader: [] };
    }

    const words = [];
    const byReader = [];
    for (const line of lines.slice(from + 1)) {
        if (line.startsWith('## ')) {
            break;
        }
        const found = PAIR.exec(line) ?? ROW.exec(line);
        if (!found) {
            continue;
        }
        const left = found[1] ?? found[2] ?? found[3];
        for (const part of left.split(',')) {
            const word = part.trim();
            if (!word) {
                continue;
            }
            if (HINT.test(word)) {
                byReader.push(word);
                continue;
            }
            words.push(word);
        }
    }

    return { words, byReader };
}

/** The files of the tree the check reads. The list is taken from the version control system. */
function readableFiles() {
    const listed = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
        cwd: ROOT,
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
    });
    if (listed.status !== 0) {
        return [];
    }

    const skip = CONFIG.skipDirs ?? [];

    return listed.stdout
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((file) => file.endsWith('.md'))
        .filter((file) => !GLOSSARY_NAME.test(file))
        .filter((file) => !UNREAD.some((where) => file === where || file.startsWith(where) || file.includes(`/${where}`)))
        .filter((file) => !skip.some((where) => file.includes(`/${where}/`) || file.startsWith(`${where}/`)));
}

function main() {
    let glossary;
    try {
        glossary = readFileSync(join(ROOT, GLOSSARY), 'utf8');
    } catch {
        console.log(`check-glossary: there is no glossary at ${GLOSSARY} — there is nothing to check with`);

        return Number(process.env.RT_SKIP_CODE ?? 7);
    }

    const { words, byReader } = forbiddenWords(glossary);
    if (!words.length && !byReader.length) {
        console.log('check-glossary: the glossary carries no section of banned words — there is nothing to check with');

        return Number(process.env.RT_SKIP_CODE ?? 7);
    }

    const parsed = parseAllowlist('glossary');
    const found = [];
    for (const file of readableFiles()) {
        let text;
        try {
            text = readFileSync(join(ROOT, file), 'utf8');
        } catch {
            continue;
        }
        for (const [index, line] of text.split('\n').entries()) {
            for (const word of words) {
                if (!new RegExp(`(^|[^\\p{L}])${word}([^\\p{L}]|$)`, 'iu').test(line)) {
                    continue;
                }
                found.push({ key: `${file}:${word}`, file, line: index + 1, word });
            }
        }
    }

    const fresh = baselineOf(
        found.map((one) => one.key),
        parsed,
    );
    const news = found.filter((one) => fresh.includes(one.key));

    if (news.length) {
        console.error(`check-glossary: divergences ${news.length}`);
        for (const one of news) {
            console.error(`  ${one.file}:${one.line} — «${one.word}»: the word stands in the section of banned words of the glossary`);
        }
        console.error('  either the word is changed to the one accepted here, or the glossary stops banning it');

        return 1;
    }

    console.log(`check-glossary: banned words ${words.length}, documents read ${readableFiles().length}, no divergences`);
    if (byReader.length) {
        // Silence about a search that cannot be done would read as coverage: nothing judges these.
        console.log(`  not judged by search, they stay a requirement to the reader: ${byReader.join(', ')}`);
    }

    return 0;
}

process.exit(main());
