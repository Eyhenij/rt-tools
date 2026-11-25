#!/usr/bin/env node
/**
 * The record of the closed work, built from the task folder and the body of the PR.
 *
 *   npm run task:archive -- <body of the PR> --title '<title of the PR>'
 *
 * The text is put together by `archive-record-text.mjs`: the grill, all but what it says of the tree and of
 * the rules, the decisions of the progress, what the rest of the progress quotes of the owner, the answer of
 * the approval mark and two sections of the body; the rest of the body lives on the hosting.
 *
 * The folder leaves the disk and the index, the record goes into the index, and the commit is left to
 * the executor. The refusals stand before the first write; what git refuses after it is put back.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Refused, epicOf, recordOf } from './archive-record-text.mjs';

const OWN = ['grill.md', 'plan.md', 'progress.md', 'approvals.md'];

const git = (args, cwd) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const answers = (args, cwd) => {
    try {
        git(args, cwd);
        return true;
    } catch {
        return false;
    }
};

/** The files of the folder at the head; a refusal names the first reason the folder cannot leave. */
function folderFiles(root, folder) {
    const files = git(['ls-tree', '-r', '-z', '--name-only', 'HEAD', '--', `${folder}/`], root)
        .split('\0')
        .filter(Boolean);
    for (const name of ['grill.md', 'plan.md', 'progress.md'])
        if (!files.includes(`${folder}/${name}`)) throw new Refused(`the commit holds no ${folder}/${name}`);
    const states = git(
        ['status', '--porcelain=v1', '-z', '--no-renames', '--untracked-files=all', '--ignored=matching', '--', `${folder}/`],
        root
    )
        .split('\0')
        .filter(Boolean);
    const named = (test) => states.filter((line) => test(line.slice(0, 2))).map((line) => line.slice(3));
    const loose = named((state) => state === '??' || state === '!!');
    if (loose.length > 0) throw new Refused(`the folder holds untracked files: ${loose.join(', ')}`);
    const edited = named(() => true);
    if (edited.length > 0) throw new Refused(`the folder holds edits past the commit: ${edited.join(', ')}`);
    const planned = git(['log', '--diff-filter=A', '--format=%H', '--', `${folder}/plan.md`], root)
        .trim()
        .split('\n')
        .at(-1);
    const foreign = files.filter((path) => !OWN.includes(path.slice(folder.length + 1)));
    // A script of the plan is frozen by the engine and cannot leave by a commit of its own.
    const ofPlan = (path) => !path.endsWith('.md') && answers(['cat-file', '-e', `${planned}:${path}`], root);
    const left = foreign.filter((path) => !ofPlan(path));
    if (left.length > 0) throw new Refused(`the folder holds files the record does not take: ${left.join(', ')}`);
    return { files, scripts: foreign, planned };
}

/** The answer that approved the plan, by the mark of the branch; a mark of another plan approves nothing. */
function approvalOf(path, planned) {
    let mark = null;
    try {
        mark = JSON.parse(readFileSync(path, 'utf8'));
    } catch {
        // No mark, or one that does not parse: the engine reads both as no approval.
    }
    if (typeof mark?.answer !== 'string') return 'Метки одобрения плана у ветки нет.';
    return mark.plan === planned ? `«${mark.answer}»` : 'Метка одобрения стоит на другом коммите плана и одобрением не считается.';
}

/** Puts the folder and the index back after a failed removal; says what came of it. */
function putBack(root, folder, record, made) {
    // The folder matched the head before the first write: its files come from there.
    answers(['reset', '-q', '--', record, folder], root);
    answers(['checkout', '-q', 'HEAD', '--', folder], root);
    rmSync(join(root, record), { force: true });
    if (made) rmSync(made, { recursive: true, force: true });
    const clean = git(['status', '--porcelain', '--', record, folder], root) === '';
    return clean
        ? 'the folder could not be taken out, everything is put back'
        : 'the folder could not be taken out and is not put back, read git status';
}

/** Writes the record of the branch, takes the folder out and returns the lines to print. */
export function archive({ bodyPath, title, root, date }) {
    const [, of, name] = title
        .replace(/\s+/g, ' ')
        .trim()
        .match(/^(?:\[?(RT-\d+)\]?[\s:—-]*)?(.*)$/i);
    if (!name || name.startsWith('--')) throw new Refused("the title of the PR is empty: --title '<title>'");
    if (!bodyPath || !statSync(bodyPath, { throwIfNoEntry: false })?.isFile())
        throw new Refused(`the body of the PR is not on disk: ${bodyPath ?? 'no path given'}`);
    const body = readFileSync(bodyPath, 'utf8');
    const branch = git(['branch', '--show-current'], root).trim();
    const task = branch.match(/^(RT-\d+)-/)?.[1];
    if (!task) throw new Refused(`the branch carries no task number: ${branch || 'no branch is checked out'}`);
    if (of && of.toUpperCase() !== task) throw new Refused(`the title names ${of}, the branch is of ${task}`);
    // The hosting closes by these words alike, wherever they stand in the body.
    const closes = [...body.matchAll(/\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?):?\s+#(\d+)/gi)].map(([, number]) => `RT-${number}`);
    if (closes.length > 0 && !closes.includes(task)) throw new Refused(`the body closes ${closes.join(', ')}, the branch is of ${task}`);
    const folder = `docs/tasks/${branch}`;
    const record = `docs/archive/${branch}.md`;
    if (existsSync(join(root, record)) || answers(['cat-file', '-e', `HEAD:${record}`], root))
        throw new Refused(`the record already stands: ${record}`);
    const { files, scripts, planned } = folderFiles(root, folder);
    const read = (name) => readFileSync(join(root, folder, name), 'utf8');
    const plansDir = join(root, 'docs/plans');
    const plans = existsSync(plansDir)
        ? readdirSync(plansDir)
              .filter((name) => name.endsWith('.md'))
              .map((name) => readFileSync(join(plansDir, name), 'utf8'))
        : [];
    const mark = join(resolve(root, git(['rev-parse', '--git-common-dir'], root).trim()), 'rt-kit/approval', `${branch}.json`);
    const text = recordOf({
        task,
        branch,
        title: name,
        date,
        epic: epicOf(plans, task),
        grill: read('grill.md'),
        progress: read('progress.md'),
        approvals: files.includes(`${folder}/approvals.md`) ? read('approvals.md') : null,
        approval: approvalOf(mark, planned),
        body,
    });
    const made = mkdirSync(join(root, 'docs/archive'), { recursive: true });
    writeFileSync(join(root, record), text);
    try {
        git(['add', '--', record], root);
        git(['rm', '-r', '-q', '--', folder], root);
        // Every file of the folder was in the commit: only empty directories are left of it.
        rmSync(join(root, folder), { recursive: true, force: true });
    } catch (error) {
        throw new Refused(`${putBack(root, folder, record, made)}: ${String(error.stderr || error.message).trim()}`);
    }
    return [
        ...scripts.map((path) => `left with the folder, the commit of the plan holds it: ${path}`),
        `written ${record}: ${[...text].length} characters; ${folder} is out of the disk and the index, the commit is yours`,
    ];
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const args = process.argv.slice(2);
    const at = args.indexOf('--title');
    const title = at < 0 ? '' : (args[at + 1] ?? '');
    const bodyPath = args.find((arg, i) => !arg.startsWith('--') && (at < 0 || i !== at + 1));
    try {
        const root = git(['rev-parse', '--show-toplevel'], process.cwd()).trim();
        for (const line of archive({ bodyPath, title, root, date: new Date().toLocaleDateString('sv-SE') }))
            console.log(`archive-record: ${line}`);
    } catch (error) {
        if (!(error instanceof Refused)) throw error;
        console.error(`archive-record: ${error.message}`);
        process.exit(1);
    }
}
