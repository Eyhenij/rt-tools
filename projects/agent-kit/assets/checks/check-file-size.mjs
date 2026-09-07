#!/usr/bin/env node
/**
 * The check that a file is no longer than the limit.
 *
 * A file that does not fit on the screen whole is read in parts, and an edit in it is made without
 * having seen the rest. For code the linter watches the length; here is everything it does not
 * reach: prose, styles, templates, the development harness and the guards themselves.
 *
 * Judged are `.md`, `.scss`, `.html`, `.js`, `.mjs` and `.sh`. Data is not judged at all: a locale
 * dictionary and a build setting are read by search, not in a row, and there is nothing to split
 * them into. Code in a language where the linter watches the length is not judged either — two
 * refusals on one file read as two different claims.
 *
 * All lines are counted, empty ones and comments included, and the same way the linter counts
 * them: by the number of breaks plus one. A file ending with a line break therefore weighs one
 * line more than `wc -l` shows — but both checks of the tree have one notion of length.
 *
 * The archive is taken out of the count: by its make-up it lists what is no longer in the tree,
 * and a task folder dies with the merge. What is generated is taken out by directory: the
 * generator rewrites it whole, and there is no one there to argue with it about length.
 *
 * What piled up by the moment the check was started lies in the known list and does not count as a
 * refusal: the gate falls on a NEW long file, while the old stays a visible number in the digest.
 * Accepted and debt differ there: what is accepted the tree is not going to split, for a debt work
 * has been started. A line is removed together with the splitting of its file, and the check
 * itself says which line it is time to take away.
 *
 * A non-zero exit code and the list of discrepancies.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { allowlistOf, baselineOf, CONFIG, ROOT, parseAllowlist } from './rt-kit-checks.config.mjs';

const ALLOWLIST = allowlistOf('file-size');
/** There are two limits: code and the text of the rules layer; each refusal line names which one. */
const LIMIT = CONFIG.fileSizeLimit;
const PROSE_LIMIT = CONFIG.proseSizeLimit ?? CONFIG.fileSizeLimit;
/**
 * The second limit of text is in characters. Lines measure how much text fits on the screen, but do
 * not measure the weight at all: the rule about PRs takes 282 lines at 13 595 characters, and the
 * delivery rule 272 lines at 21 508. Squeezing the layer cuts characters and leaves the number of
 * breaks as it was, so the line limit does not fix what has been reached. A tree that has not named
 * this number is judged by lines alone, as before.
 */
const PROSE_CHARS = CONFIG.proseCharLimit ?? 0;
/** The roots of the rules-layer text; a tree that has not named them is judged by one limit. */
const PROSE_ROOTS = CONFIG.proseRoots ?? [];

/** The limit for a file and its name for a refusal: by root, not by extension — code lies in `.md` too. */
function limitOf(path) {
    return PROSE_ROOTS.some((root) => root && path.startsWith(root))
        ? { limit: PROSE_LIMIT, title: 'предел текста' }
        : { limit: LIMIT, title: 'предел кода' };
}

/** The kinds of files the linter does not read. Code stays with it. */
const JUDGED = ['.md', '.scss', '.html', '.js', '.mjs', '.sh'];

/** The archive, the task folder and what the generator rewrites. */
const SKIPPED_PREFIXES = [CONFIG.archiveDir, `${CONFIG.tasksDir}/`, ...CONFIG.generatedDirs];

/**
 * The tree is asked of the version control system: otherwise directories with a dot are not seen,
 * while the build is.
 *
 * What was taken out of the working tree is sifted out here, not in the counters: version control
 * remembers a file until the removal is entered into the history, and there is nothing to read it
 * with — the check fell with an `ENOENT` trace and read as broken, though only the unrecorded
 * removal was broken. There are two counters, and the protection at each of them would diverge.
 */
function trackedFiles() {
    return execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1024 * 1024 * 32 })
        .split('\n')
        .filter(Boolean)
        .filter((path) => existsSync(join(ROOT, path)));
}

function judged(path) {
    if (SKIPPED_PREFIXES.some((prefix) => prefix && path.startsWith(prefix))) {
        return false;
    }

    return JUDGED.some((extension) => path.endsWith(extension));
}

/** The same way the linter counts: the number of breaks plus one. */
function lineCount(path) {
    return readFileSync(join(ROOT, path), 'utf8').split('\n').length;
}

/** A companion is a table of links, not prose: the companion of a rule and the scenario list of a spec. */
function companion(path) {
    return path.endsWith('/implementation.md') || path.endsWith('/scenarios.md');
}

/** Characters, not bytes: Cyrillic weighs two bytes, and a byte count would judge the language, not the text. */
function charCount(path) {
    return readFileSync(join(ROOT, path), 'utf8').length;
}

/**
 * The known list is read apart from the common reader: this check has no file — that is not an
 * empty list but an unreadable setting, and staying silent about it is not allowed. An empty list
 * is lawful exactly once — in a tree where there are no long files at all.
 */
const allowlist = parseAllowlist('file-size');
const { accepted, debt } = allowlist;
const known = new Map([...[...accepted.keys()].map((path) => [path, 'принято']), ...[...debt.keys()].map((path) => [path, 'долг'])]);

const tooLong = new Map();
const tracked = trackedFiles().filter(judged);

const overweight = new Map();

for (const path of tracked) {
    const lines = lineCount(path);
    if (lines > limitOf(path).limit) {
        tooLong.set(path, lines);
    }

    // Weight is judged only for the text of the rules layer and only where the tree has named the
    // number: for code the length is watched by the linter as well, and for prose by these two
    // limits alone.
    //
    // Companions are taken out of the weight count. The companion of a rule and the scenario list
    // are tables of links: the heading of a binding repeats the statement word for word, because
    // the link goes by its text, and there is nothing to cut there without tearing the link itself.
    // The weight of such a file grows with the number of statements, not with wordiness: the
    // delivery rule has seventy-six bindings at 24 326 characters, of which the explanations are
    // only 5 729. The line limit on them stays — it catches something else.
    if (PROSE_CHARS > 0 && PROSE_ROOTS.length > 0 && limitOf(path).title === 'предел текста' && !companion(path)) {
        const chars = charCount(path);
        if (chars > PROSE_CHARS) {
            overweight.set(path, chars);
        }
    }
}

if (process.argv.includes('--baseline')) {
    console.log(baselineOf([...new Set([...tooLong.keys(), ...overweight.keys()])].sort(), allowlist));
    process.exit(0);
}

const fresh = [...tooLong].filter(([path]) => !known.has(path));
/** A line about a file that is not in the tree is stale: otherwise the list piles up the dead. */
const gone = [...known.keys()].filter((path) => !existsSync(join(ROOT, path)));
/**
 * The file was split and the line was left: the list would stop answering for what stands in it.
 * A file heavy by characters does not fall under the line limit, and without the second check its
 * record would read as stale — a debt could be neither written down nor left.
 */
const shrunk = [...known.keys()].filter(
    (path) => !tooLong.has(path) && !overweight.has(path) && existsSync(join(ROOT, path))
);

/** What is heavy by characters is judged by the same known list: one debt per file, not two. */
const heavy = [...overweight].filter(([path]) => !known.has(path) && !tooLong.has(path));

const problems = [
    ...heavy.map(([path, chars]) => `${path}: ${chars} знаков, предел веса текста ${PROSE_CHARS} — резать довод, а не дописывать строку в ${ALLOWLIST}`),
    ...fresh.map(([path, lines]) => {
        const { limit, title } = limitOf(path);
        return `${path}: ${lines} строк, ${title} ${limit} — делить, а не дописывать строку в ${ALLOWLIST}`;
    }),
    ...gone.map((path) => `${path}: строка в ${ALLOWLIST} устарела — файла в дереве нет`),
    ...shrunk.map((path) => `${path}: значится в ${ALLOWLIST}, но уже короче предела — строку убрать`),
];

if (problems.length > 0) {
    console.error(`check-file-size: расхождений ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    console.error('\nПредел длины файла — правило о языке для кода и правило о текстах для прозы.');
    process.exit(1);
}

const limits = PROSE_ROOTS.length > 0 ? `предел кода ${LIMIT}, предел текста ${PROSE_LIMIT}` : `предел ${LIMIT}`;
/**
 * The weight limit is named only where the tree has set both the number and the roots of the text:
 * weight is judged for the prose of the rules layer, and a tree that has not named its roots is
 * judged by the number of lines alone — a second figure in the digest would speak of a check that
 * does not work there.
 */
const weight = PROSE_CHARS > 0 && PROSE_ROOTS.length > 0 ? `, предел веса текста ${PROSE_CHARS} знаков` : '';

console.log(
    `check-file-size: проверено ${tracked.length} файлов, ${limits}${weight}, длиннее предела ${tooLong.size}, ` +
        `из них принято ${accepted.size}, долг ${debt.size} — новых нет`
);
