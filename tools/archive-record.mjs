#!/usr/bin/env node
/**
 * The record of the closed work, built from the task folder and the body of the PR.
 *
 *   npm run task:archive -- <body of the PR> --title '<title of the PR>'
 *
 * The owner's side is taken from the folder word for word: the request, the answers, the decisions of
 * the grill and of the progress, the approvals of the kit and every item of the progress that quotes
 * the owner. The answer that approved the plan comes from the approval mark. The body gives what
 * confirms the work and what is left; the rest of it lives on the hosting.
 *
 * The folder leaves the disk and the index, the record goes into the index, and the commit is left to
 * the executor. A refusal writes and removes nothing, and all refusals stand before the first write.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REQUEST = ['Просьба владельца', 'The owner request'];
const ANSWERS = ['Вопросы и ответы', 'Questions and answers'];
const DECISIONS = ['Решения', 'Decisions'];
const ALONG = ['Решения по ходу', 'Decisions along the way'];
const CONFIRMED = ['Чем подтверждено'];
const LEFT = ['Оставшийся шаг'];
const OWN = ['grill.md', 'plan.md', 'progress.md', 'approvals.md'];
const PRICE = /^\s*-\s+\*\*Цена:\*\*[ \t]*(?:\n[ \t]+)?\S/m;
const QUOTE = /«[^«»]*(?:«[^«»]*»[^«»]*)*»/g;
const OWNER_WORD = /recommended|владел|одобряю|the owner/i;
/** Lines of the body that speak to the hosting and to the checks, not to whoever reads the record. */
const SERVICE = /^\s*(?:Closes\b|🤖|E2E-skip:)/;

class Refused extends Error {}

/** The sections of a text in their order: `{ name, lines }`, split by `## ` outside code blocks. */
export function sectionsOf(text) {
    const sections = [{ name: null, lines: [] }];
    let fence = null;
    for (const line of text.split('\n')) {
        const mark = line.match(/^\s*(`{3,}|~{3,})/)?.[1];
        if (mark && fence === null) fence = mark;
        else if (mark && fence !== null && mark[0] === fence[0] && mark.length >= fence.length) fence = null;
        const name = fence === null && !mark ? line.match(/^## (.*\S)\s*$/)?.[1] : undefined;
        if (name !== undefined) sections.push({ name, lines: [] });
        else sections.at(-1).lines.push(line);
    }
    return sections;
}

/** The text of the first section under one of the names, or null when there is none or it says nothing. */
export function sectionOf(text, names) {
    const found = sectionsOf(text).find(({ name }) => names.includes(name));
    const body = found?.lines.join('\n').trim() ?? '';
    return body.replace(/<!--[\s\S]*?-->/g, '').trim() === '' ? null : body;
}

const withoutFences = (lines) => {
    let fence = null;
    return lines.filter((line) => {
        const mark = line.match(/^\s*(`{3,}|~{3,})/)?.[1];
        if (mark && fence === null) fence = mark;
        else if (mark && mark[0] === fence[0] && mark.length >= fence.length) fence = null;
        else return fence === null;
        return false;
    });
};

const indentOf = (line) => line.match(/^\s*/)[0].length;
const isItem = (line) => /^\s*(?:[-*+]|\d+\.)\s/.test(line);

/** The items of lists with all that hangs on them, the rows of tables and the paragraphs, each whole. */
export function unitsOf(lines) {
    const units = [];
    const text = withoutFences(lines);
    for (let i = 0; i < text.length;) {
        const first = text[i];
        if (first.trim() === '' || /^#/.test(first)) {
            i++;
            continue;
        }
        const unit = [first];
        const depth = indentOf(first);
        i++;
        if (/^\s*\|/.test(first)) {
            units.push(first);
            continue;
        }
        for (; i < text.length; i++) {
            const line = text[i];
            if (/^#/.test(line)) break;
            if (line.trim() === '') {
                const next = text.slice(i).find((l) => l.trim() !== '');
                if (!isItem(first) || next === undefined || indentOf(next) <= depth) break;
            } else if (isItem(line) && (!isItem(first) || indentOf(line) <= depth)) break;
            unit.push(line);
        }
        units.push(unit.join('\n').trimEnd());
    }
    return units;
}

const flat = (text) => text.replace(/^\s*>\s?/gm, '').replace(/\s+/g, ' ');

/** The items of the progress that quote the owner and whose quotes the record does not hold yet. */
export function ownerWords(progress, record) {
    const known = flat(record);
    const place = ({ name }) => !/^(?:Where we stand|Где мы|Handover)/.test(name ?? '');
    return sectionsOf(progress)
        .filter(place)
        .flatMap(({ lines }) => unitsOf(lines))
        .filter((unit) => {
            const quotes = flat(unit).match(QUOTE) ?? [];
            return OWNER_WORD.test(unit) && !quotes.every((quote) => known.includes(quote));
        });
}

/** The epic whose plan holds the row of the task, or null when no plan or more than one does. */
export function epicOf(plans, task) {
    const row = new RegExp(`^\\|[^|]*\\|\\s*${task}\\s+—`, 'm');
    const epics = plans.filter((text) => row.test(text)).map((text) => text.match(/^\*\*Эпик:\*\*\s+(RT-\d+)/m)?.[1]);
    return epics.length === 1 ? (epics[0] ?? null) : null;
}

/** A section of the body without its service lines, or null. */
function bodySection(body, names) {
    const text = sectionOf(body, names);
    const kept = text
        ?.split('\n')
        .filter((line) => !SERVICE.test(line))
        .join('\n')
        .trim();
    return kept || null;
}

/** The text of the record. */
export function recordOf({ task, branch, title, date, epic, grill, progress, approvals, answer, body }) {
    const request = sectionOf(grill, REQUEST);
    if (request === null) throw new Refused('the grill holds no request of the owner');
    const along = sectionOf(progress, ALONG);
    if (along === null) throw new Refused('the progress holds no decisions along the way: name them there, the price among them');
    if (!PRICE.test(along)) throw new Refused('the decisions of the progress name no price: add the item `- **Цена:** …`');
    const confirmed = bodySection(body, CONFIRMED);
    const left = bodySection(body, LEFT);
    for (const [text, [name]] of [
        [confirmed, CONFIRMED],
        [left, LEFT],
    ])
        if (text === null) throw new Refused(`the body holds no section «${name}»`);
    const of = epic === null ? '' : ` эпика ${epic}`;
    const parts = [`# ${task} — ${title}`, `Задача ${task}${of}, запись от ${date}. Прежний адрес: \`docs/tasks/${branch}/\`.`];
    const add = (name, text) => text && parts.push(`## ${name}`, text);
    add('Просьба владельца', request);
    add('Вопросы и ответы', sectionOf(grill, ANSWERS));
    add('Решения разбора', sectionOf(grill, DECISIONS));
    add('Решения по ходу', along);
    add('Согласия владельца по киту', approvals?.trim().replace(/^(#+ )/gm, '##$1'));
    add('Слова владельца в ходе работы', ownerWords(progress, parts.join('\n\n')).join('\n\n'));
    add('Одобрение плана', answer ? `«${answer}»` : 'Метки одобрения плана у ветки нет.');
    add('Чем подтверждено', confirmed);
    add('Оставшийся шаг', left);
    return `${parts.join('\n\n')}\n`;
}

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
    return { files, scripts: foreign };
}

/** Writes the record of the branch, takes the folder out and returns the lines to print. */
export function archive({ bodyPath, title, root, date }) {
    if (!title) throw new Refused("the title of the PR is empty: --title '<title>'");
    if (!bodyPath || !existsSync(bodyPath)) throw new Refused(`the body of the PR is not on disk: ${bodyPath ?? 'no path given'}`);
    const body = readFileSync(bodyPath, 'utf8');
    const branch = git(['branch', '--show-current'], root).trim();
    const task = branch.match(/^(RT-\d+)-/)?.[1];
    if (!task) throw new Refused(`the branch carries no task number: ${branch || 'no branch is checked out'}`);
    const folder = `docs/tasks/${branch}`;
    const record = `docs/archive/${branch}.md`;
    if (existsSync(join(root, record)) || answers(['cat-file', '-e', `HEAD:${record}`], root))
        throw new Refused(`the record already stands: ${record}`);
    const { files, scripts } = folderFiles(root, folder);
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
        title,
        date,
        epic: epicOf(plans, task),
        grill: read('grill.md'),
        progress: read('progress.md'),
        approvals: files.includes(`${folder}/approvals.md`) ? read('approvals.md') : null,
        answer: existsSync(mark) ? JSON.parse(readFileSync(mark, 'utf8')).answer : null,
        body,
    });
    mkdirSync(join(root, 'docs/archive'), { recursive: true });
    writeFileSync(join(root, record), text);
    try {
        git(['add', '--', record], root);
        git(['rm', '-r', '-q', '--', folder], root);
    } catch (error) {
        answers(['rm', '--cached', '-q', '-f', '--', record], root);
        rmSync(join(root, record), { force: true });
        throw error;
    }
    return [
        ...scripts.map((path) => `left with the folder, the commit of the plan holds it: ${path}`),
        `written ${record}: ${[...text].length} characters; ${folder} is out of the disk and the index, the commit is yours`,
    ];
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const args = process.argv.slice(2);
    const at = args.indexOf('--title');
    const title = (at < 0 ? '' : (args[at + 1] ?? '')).replace(/^\s*\[RT-\d+\]/, '').trim();
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
