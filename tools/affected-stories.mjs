#!/usr/bin/env node
/**
 * Which showcase stories the branch has touched: everything, a list of story files, or none.
 *
 * The snapshot step of a branch shoots what this command names; the whole set goes once, by the
 * pipeline's step on a PR into `main`. The first line is the answer — `снять: всё`,
 * `снять: <N> из <M>` or `снять: нечего`; below it are the reasons of `всё` or the story files, one
 * per line.
 *
 * The diff is taken from the point where the branch left the base. With `--head` the files are read
 * from that commit, without it — from the working copy, uncommitted edits included.
 *
 * The rules go top-down and the first one that matches a file decides it; what no rule recognised is
 * everything, and so is a base or a diff that did not read: a set that found nothing to match against
 * is not a green one. The agreement is `docs/specs/ui-kit-v2/snapshots/`.
 *
 *   node tools/affected-stories.mjs --base <ref> [--head <ref>]
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { storyGraph, storyTitle } from './story-graph.mjs';

const KIT = 'projects/ui-kit-v2/';
const SHOWCASE = `${KIT}.storybook/`;
const REFERENCES = `${SHOWCASE}__snapshots__/`;

/** Every story is drawn inside these: what they reach changes every frame. */
const SHOWCASE_ROOTS = ['preview.ts', 'test-runner.ts', 'main.ts', 'storybook.scss', 'vendor.scss'].map((name) => SHOWCASE + name);

/** The label sets: a line added to one is read only by a component the same branch edits. */
const LABELS = new Set([`${KIT}src/lib/i18n/rt-kit-labels.en.ts`, `${SHOWCASE}showcase-labels.ru.ts`]);
const ADDED_LABEL = /^\+\s+(\w+): '(?:[^'\\]|\\.)*',$/;
const VERSION_LINE = /^[+-]\s*"version": "[^"]*",?$/;

/** The scripts of the snapshot step itself: an edit of one is checked by the whole set. */
const STEP_SCRIPTS =
    /^tools\/(visual-gate|visual-snapshots-v2|affected-stories|story-graph|shot-[\w-]+|showcase-probe|serve-static|snapshot-[\w-]+-probe)\.mjs$/;

const NO_STORY = [
    /\.spec\.ts$/,
    /\.mdx?$/,
    /(^|\/)graphify-out\//,
    /(^|\/)(ng-package|tsconfig\.spec|tsconfig\.lib[^/]*)\.json$/,
    /^(docs|\.claude|apps|libs|prisma|deploy|\.github|eslint)\//,
    /^\.husky\//,
    /^(\.gitattributes|\.prettierignore|commitlint\.config\.cjs|eslint\.config\.mjs|angular-doctor\.config\.json|knip\.json|docker-compose\.yml)$/,
];

const PACKAGE_SOURCE = /^projects\/[^/]+\/.*\.(ts|scss|html)$/;
const SHARED_STYLES = /^projects\/[^/]+\/src\/styles\//;

/** The diff the same on every machine: no settings and no outside program. */
const DIFF = ['diff', '--no-ext-diff', '--no-textconv', '--no-renames', '--no-color'];

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 1 << 29, stdio: ['ignore', 'pipe', 'ignore'] });
const lines = (text, by = '\n') => text.split(by).filter(Boolean);

/** The working copy: tracked and new files, as they lie on the disk. */
function diskSource() {
    const files = new Set(
        lines(git('ls-files', '-z', '--cached', '--others', '--exclude-standard'), '\0').filter(
            (path) => existsSync(path) && statSync(path).isFile()
        )
    );

    return { files, has: (path) => files.has(path), read: (path) => readFileSync(path, 'utf8') };
}

/** The tree of a commit; its texts are read by one call, a call per file would take a minute. */
function commitSource(ref) {
    const files = new Set(lines(git('ls-tree', '-r', '-z', '--name-only', ref), '\0'));
    const wanted = [...files].filter((path) => /^projects\/.*\.(ts|js|scss|css|html)$|^(tsconfig\.base|package)\.json$/.test(path));
    const packed = execFileSync('git', ['cat-file', '--batch'], {
        input: wanted.map((path) => `${ref}:${path}\n`).join(''),
        maxBuffer: 1 << 29,
        stdio: ['pipe', 'pipe', 'ignore'],
    });
    const texts = new Map();
    let at = 0;

    for (const path of wanted) {
        const end = packed.indexOf(10, at);
        const size = Number(packed.toString('utf8', at, end).split(' ')[2]);

        texts.set(path, packed.toString('utf8', end + 1, end + 1 + size));
        at = end + 1 + size + 1;
    }

    return { files, has: (path) => files.has(path), read: (path) => texts.get(path) ?? git('show', `${ref}:${path}`) };
}

/** The changed files with their status, and the way to ask for the changed lines of one. */
function changesOf(base, head) {
    const from = git('merge-base', base, head ?? 'HEAD').trim();
    const range = head ? [from, head] : [from];
    const raw = lines(git(...DIFF, '--name-status', '-z', ...range), '\0');
    const rows = [];

    for (let at = 0; at + 1 < raw.length; at += 2) {
        rows.push({ status: raw[at], path: raw[at + 1] });
    }

    if (!head) {
        lines(git('ls-files', '-z', '--others', '--exclude-standard'), '\0').forEach((path) => rows.push({ status: 'A', path }));
    }

    const linesOf = (path) => lines(git(...DIFF, '--unified=0', ...range, '--', path)).filter((line) => /^[+-](?![+-]{2} )/.test(line));

    return { rows, linesOf };
}

/** The part of a story id the title gives, as the showcase makes it. */
function titleId(title) {
    return title
        .toLowerCase()
        .replace(/[ ’–—―′¿'`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/** The file an import of a deleted one falls to: `foo.ts` next to a live `foo/index.ts`, a partial of the same name. */
function heirOf(source, path) {
    const [, dir, name, kind] = path.match(/^(.*\/)?(?:_(?=[^/]+\.s?css$))?([^/]+)\.(ts|s?css)$/) ?? [];

    if (kind === undefined) {
        return undefined;
    }

    const at = `${dir ?? ''}${name}`;
    const partial = `${dir ?? ''}_${name}`;

    return (
        kind === 'ts'
            ? [`${at}/index.ts`, `${at}.d.ts`]
            : [`${at}.scss`, `${partial}.scss`, `${at}/_index.scss`, `${at}/index.scss`, `${at}.css`]
    ).find((heir) => heir !== path && source.has(heir));
}

/** Whether only new labels were added: every changed line is one, and its key stood nowhere before. */
function onlyAddsLabels(text, changed) {
    return (
        changed.length > 0 &&
        changed.every((line) => {
            const key = line.match(ADDED_LABEL)?.[1];

            return key !== undefined && text.match(new RegExp(`^\\s*['"]?${key}['"]?:`, 'gm'))?.length === 1;
        })
    );
}

/**
 * The answer about a set of changed files.
 *
 * `all` — the reasons to shoot everything, `files` — the touched story files, `total` — how many of
 * them the tree holds.
 */
export function judge(source, { rows, linesOf }) {
    const graph = storyGraph(source);
    const stories = [...source.files].filter((path) => path.startsWith(KIT) && path.endsWith('.stories.ts')).sort();
    const lost = new Set();
    const reachOf = (path) => {
        const reached = graph.reach(path);

        reached.lost.forEach((one) => lost.add(one));

        return reached.files;
    };
    const shared = new Set(SHOWCASE_ROOTS.filter((path) => source.has(path)).flatMap((path) => [...reachOf(path)]));
    const readers = new Map();
    const byTitle = new Map();

    for (const story of stories) {
        for (const file of reachOf(story)) {
            readers.set(file, [...(readers.get(file) ?? []), story]);
        }

        const title = storyTitle(source.read(story));

        if (title !== null) {
            byTitle.set(titleId(title), [...(byTitle.get(titleId(title)) ?? []), story]);
        }
    }

    const packagesShown = new Set([...shared, ...readers.keys()].map((path) => path.split('/').slice(0, 2).join('/')));
    const all = [...lost].map((one) => `импорт не разрешился — ${one}`);

    if (stories.length === 0) {
        all.push('в дереве нет файлов историй');
    }
    const touched = new Set();

    for (const { status, path } of rows) {
        const drawn = (status === 'D' ? heirOf(source, path) : undefined) ?? path;
        const outside = /^projects\/[^/]+\//.test(path) && !packagesShown.has(path.split('/').slice(0, 2).join('/'));

        if (LABELS.has(path) && status === 'M' && onlyAddsLabels(source.read(path), linesOf(path))) {
            continue;
        }

        if (shared.has(drawn)) {
            all.push(`доходит до каждой истории — ${path}`);
        } else if (path.startsWith(REFERENCES) && path.endsWith('.png')) {
            const named = byTitle.get(path.slice(REFERENCES.length).split('--')[0]);

            if (named) {
                named.forEach((story) => touched.add(story));
            } else {
                all.push(`эталон без файла историй — ${path}`);
            }
        } else if (path.startsWith(SHOWCASE)) {
            all.push(`настройка витрины — ${path}`);
        } else if (status === 'D' && path.endsWith('.stories.ts')) {
            all.push(`удалён файл историй — ${path}`);
        } else if (readers.has(drawn)) {
            readers.get(drawn).forEach((story) => touched.add(story));
        } else if (NO_STORY.some((sign) => sign.test(path)) || outside || (path.startsWith('tools/') && !STEP_SCRIPTS.test(path))) {
            continue;
        } else if (
            /^projects\/[^/]+\/package\.json$/.test(path) &&
            status === 'M' &&
            linesOf(path).length > 0 &&
            linesOf(path).every((line) => VERSION_LINE.test(line))
        ) {
            continue;
        } else if (PACKAGE_SOURCE.test(path) && !SHARED_STYLES.test(path)) {
            continue;
        } else {
            all.push(`не узнан — ${path}`);
        }
    }

    return { all, files: [...touched].sort(), total: stories.length };
}

/** The answer about the branch; what did not read is everything. */
export function affectedStories(base, head) {
    try {
        if (!base) {
            throw new Error('нет базы');
        }

        // The paths of git go from the root of the tree, wherever the call stands.
        process.chdir(git('rev-parse', '--show-toplevel').trim());

        return judge(head ? commitSource(head) : diskSource(), changesOf(base, head));
    } catch (failure) {
        return { all: [`разница не прочлась — ${String(failure.message ?? failure).split('\n')[0]}`], files: [], total: 0 };
    }
}

/** The first line of the answer. */
export function verdictLine({ all, files, total }) {
    if (all.length > 0) {
        return 'снять: всё';
    }

    return files.length > 0 ? `снять: ${files.length} из ${total}` : 'снять: нечего';
}

/** The script is also imported by the snapshot step for the part above; the print goes only on a call. */
const calledDirectly = process.argv[1] !== undefined && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (calledDirectly) {
    const args = process.argv.slice(2);
    const named = {};

    for (let at = 0; at < args.length; at += 2) {
        if (!['--base', '--head'].includes(args[at]) || args[at + 1] === undefined) {
            console.error(`affected-stories: незнакомый или неполный довод ${args[at]}; вызов — --base <ссылка> [--head <ссылка>]`);
            process.exit(2);
        }

        named[args[at].slice(2)] = args[at + 1];
    }

    const answer = affectedStories(named.base, named.head);

    console.log([verdictLine(answer), ...(answer.all.length > 0 ? answer.all : answer.files)].join('\n'));
}
