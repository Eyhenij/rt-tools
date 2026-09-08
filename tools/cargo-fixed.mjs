#!/usr/bin/env node
/**
 * The selection of cargo records whose edit already stands in the tree.
 *
 * It lives in the tree rather than in the package: a tree that only consumes the package has no
 * resource sources at all — there is nowhere to look for an article there.
 *
 * A proposal carries a quote of the proposed article, and an article has a heading. The heading
 * either stands in the package sources or it does not: the first means the edit arrived with an
 * edition and the record has long been ready, the second that the record waits for its task.
 * Otherwise such a record hangs in «new» and is sorted out anew by every session: the proposal is
 * read, the resource opened, the article found standing.
 *
 * One heading is judged and nothing beyond it. A record whose proposal landed in the tree in other
 * words is not found by the command and stays new — that is its boundary, and it is named in the
 * output.
 *
 * The second selection is the records taken into work: the mark «done» is set by the state step
 * `влито`, and the turn about the task does not always end, so the edit lies in the main branch
 * with the record's state as before. There are two signs there — the same heading in the sources or
 * the full key named in a description of the past: the second catches what landed in the tree in
 * other words.
 *
 * The command writes nothing outward: it reads the cargo and prints the mark call. The mark is set
 * by `cargo:mark`, and it is set by the person who read the list.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { accountOf, login, read, withTexts } from './cargo-pull.mjs';

const REFUSED = 1;
const PAGE_SIZE = 100;
const PAGES_MAX = 20;

const ROOT = resolve(process.cwd());
const CONFIG = join(ROOT, '.claude/rt-kit.json');
const SOURCES = join(ROOT, 'projects/agent-kit/assets');
const SHIPMENT = join(ROOT, 'dist/agent-kit/lib/shipment.js');

/**
 * The tree's sign: the same one the cargo was sent under, and it is taken from the package rather
 * than counted here. A count of its own has already diverged from the package one silently — the
 * tree sent the cargo under one sign and marked it under another, and not one record was marked.
 */
async function treeSlug() {
    try {
        const { treeSlugOf } = await import(SHIPMENT);
        const remote = execFileSync('git', ['remote', 'get-url', 'origin'], { cwd: ROOT, encoding: 'utf8' }).trim();

        return treeSlugOf(remote, '');
    } catch {
        return '';
    }
}

/** The article's heading from a proposal's quote: the first bold inside the quoted block. */
export function titleOf(text) {
    const quote = String(text ?? '')
        .split('\n')
        .filter((line) => line.startsWith('>'))
        .map((line) => line.replace(/^>\s?/, ''))
        .join('\n');
    const bold = /\*\*(.+?)\*\*/s.exec(quote);

    return bold ? bold[1].replace(/\s+/g, ' ').trim() : '';
}

/** All the package source texts as one string: looking for a heading in them is cheaper than calling grep. */
function sourcesText(dir) {
    if (!existsSync(dir)) {
        return '';
    }

    let all = '';

    for (const name of readdirSync(dir)) {
        const path = join(dir, name);

        all += statSync(path).isDirectory() ? sourcesText(path) : `\n${readFileSync(path, 'utf8')}`;
    }

    return all;
}

/** The heading stands in the sources: the comparison goes by one line — the line breaks in a quote are its own. */
export function standsIn(title, text) {
    return Boolean(title) && text.replace(/\s+/g, ' ').includes(title);
}

/** The reading of one page of records: what was found, what was not and what had no quote at all. */
export function sift(rows, text) {
    const found = [];
    const waiting = [];
    const mute = [];

    for (const row of rows) {
        const title = titleOf(row.text);

        if (!title) {
            mute.push({ row, title });
        } else if (standsIn(title, text)) {
            found.push({ row, title });
        } else {
            waiting.push({ row, title });
        }
    }

    return { found, waiting, mute };
}

/**
 * The full keys of the records named in the descriptions of the past.
 *
 * The second sign of done work, besides a heading in the sources: a proposal that landed in the
 * tree in other words is not found by the heading, while a key in a description of the past speaks
 * of it outright — the record was named by the work that closed it. The key is judged in full:
 * eight characters are not enough for the mark command, and a short one does not count here at all.
 */
export function archiveKeys(dir) {
    if (!existsSync(dir)) {
        return new Set();
    }

    const found = new Set();

    for (const name of readdirSync(dir)) {
        const path = join(dir, name);

        if (statSync(path).isDirectory()) {
            archiveKeys(path).forEach((key) => found.add(key));
            continue;
        }

        for (const key of readFileSync(path, 'utf8').match(/[0-9a-f]{64}/g) ?? []) {
            found.add(key);
        }
    }

    return found;
}

/** All one's own proposals of the named state: the pages are read to the end rather than to the first. */
async function everything(intake, cookie, tree, fetchOne, fetchTexts, state = 'new') {
    const all = [];

    for (let page = 1; page <= PAGES_MAX; page += 1) {
        const got = await fetchOne(
            intake,
            cookie,
            `proposals?page=${page}&size=${PAGE_SIZE}&sort=arrivedAt&dir=asc&state=${state}&tree=${encodeURIComponent(tree)}`
        );

        if (!got.ok || !got.body) {
            return { ok: false, said: got.said, status: got.status, rows: all };
        }

        const rows = Array.isArray(got.body.rows) ? got.body.rows : [];

        all.push(...(await fetchTexts(intake, cookie, 'proposal', rows)));

        if (all.length >= Number(got.body.total ?? all.length) || !rows.length) {
            break;
        }
    }

    return { ok: true, said: '', status: 200, rows: all };
}

/**
 * A proposal's mark key is the sign of its text, the same one the intake counts when it puts the record.
 * The record's identifier is no good here: the mark does not accept it and answers «there is no such record».
 */
const keyOf = (row) => (typeof row.text === 'string' ? createHash('sha256').update(row.text, 'utf8').digest('hex') : '');

/** The keys of the selected records as arguments of the mark command: it accepts as many as you like per call. */
const keys = (rows) => rows.map((one) => `--proposal ${keyOf(one.row)}`).join(' ');

/**
 * The records taken into work whose work is already over.
 *
 * The mark «done» is set by the work state `влито`, and the turn about the task does not always
 * end by then: forty-six records stood in «in work» with the edit lying in the main branch. There
 * are two signs and either is taken — the article's heading stands in the sources, or the full key
 * is named in a description of the past.
 */
export function stalled(rows, text, archived = new Set()) {
    return rows
        .map((row) => ({ row, title: titleOf(row.text), key: keyOf(row) }))
        .filter(({ title, key }) => standsIn(title, text) || archived.has(key));
}

/** Take one's own new records and sort them into the ready and the waiting. */
export async function fixed(options) {
    if (!options.intake || !options.tree) {
        return { code: REFUSED, lines: ['there is no intake address or tree sign: there is nothing to select'] };
    }

    const entered = await options.enter(options.intake, options.account);

    if (!entered.ok || !entered.cookie) {
        return { code: REFUSED, lines: [`${options.intake} did not accept the sign-in: ${entered.status || 'silence'} — ${entered.said}`] };
    }

    const got = await everything(options.intake, entered.cookie, options.tree, options.fetchOne, options.fetchTexts);

    if (!got.ok) {
        return { code: REFUSED, lines: [`${options.intake} answered ${got.status || 'with silence'} — ${got.said}`] };
    }

    const { found, waiting, mute } = options.sift(got.rows, options.sources);
    const taken = await everything(options.intake, entered.cookie, options.tree, options.fetchOne, options.fetchTexts, 'in_work');
    const late = taken.ok ? stalled(taken.rows, options.sources, options.archived) : [];

    return {
        code: 0,
        lines: [
            `THE SELECTION — ${options.intake}, tree ${options.tree}, state «new»`,
            `  own records ${got.rows.length}: the article already stands at ${found.length}, waiting for a task ${waiting.length}, without a quote ${mute.length}`,
            '',
            ...(late.length
                ? [
                      `taken into work with the edit ready ${late.length} — the mark fell behind the merge:`,
                      ...late.flatMap(({ row, title, key }) => [
                          `  ${key}`,
                          `    ${row.resource ?? '?'} · ${title || 'by the key from a description of the past'}`,
                      ]),
                      `  node tools/cargo-mark.mjs --state fixed --fix '<what it is fixed by>' ${late.map(({ key }) => `--proposal ${key}`).join(' ')}`,
                      '',
                  ]
                : []),
            ...found.flatMap(({ row, title }) => [`  ${keyOf(row)}`, `    ${row.resource ?? '?'} · ${title}`]),
            '',
            ...(found.length
                ? [
                      // The order of the states cannot be jumped over: from «new» straight into «done»
                      // the intake refuses every line with the words «the move is not allowed by the
                      // order». So there are two calls, and both are printed — otherwise the first is refused whole.
                      `to mark them, two calls in a row:`,
                      `  node tools/cargo-mark.mjs --state in_work ${keys(found)}`,
                      `  node tools/cargo-mark.mjs --state fixed --fix '<what it is fixed by>' ${keys(found)}`,
                  ]
                : ["there is nothing to mark: not one article proposed by one's own new records stands in the sources"]),
            'one article heading is judged: a record whose proposal landed in other words is not found here',
        ],
    };
}

async function main() {
    const config = existsSync(CONFIG) ? JSON.parse(readFileSync(CONFIG, 'utf8')) : {};
    const named = accountOf(config.account ?? '');
    const outcome = await fixed({
        intake: process.env.RT_INTAKE || (config.intake ?? ''),
        tree: process.env.RT_TREE_SLUG || (await treeSlug()),
        account: {
            name: process.env.RT_ACCOUNT_NAME || named.name,
            password: process.env.RT_ACCOUNT_PASSWORD || named.password,
        },
        sources: sourcesText(SOURCES),
        archived: archiveKeys(join(ROOT, 'docs/archive')),
        enter: login,
        fetchOne: read,
        fetchTexts: withTexts,
        sift,
    });

    outcome.lines.forEach((line) => console.log(line));

    return outcome.code;
}

if (process.argv[1] && process.argv[1].endsWith('cargo-fixed.mjs')) {
    main().then((code) => process.exit(code));
}
