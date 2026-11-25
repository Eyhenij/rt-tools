#!/usr/bin/env node
/**
 * The record of the closed work, built from the task folder and the body of the PR.
 *
 *   npm run task:archive -- <body of the PR> --title '<title of the PR>'
 *
 * The grill is taken word for word, all but what it says of the tree and of the rules; from the progress
 * come its decisions and every item that quotes someone by the owner's side; the approvals of the kit stand
 * first. The answer that approved the plan comes from the approval mark. The body gives what confirms
 * the work and what is left; the rest of it lives on the hosting.
 *
 * The folder leaves the disk and the index, the record goes into the index, and the commit is left to
 * the executor. A refusal writes and removes nothing, and all refusals stand before the first write.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REQUEST = ['Просьба владельца', 'The owner request'];
const DECISIONS = ['Решения', 'Decisions'];
const ALONG = ['Решения по ходу', 'Decisions along the way'];
/** What the grill says of the code and of the rules: the code and the rules answer it later. */
const OF_TREE = ['Что уже есть в дереве', 'What the tree already has'];
const OF_RULES = ['Что говорят правила', 'What the rules already say'];
const CONFIRMED = ['Чем подтверждено'];
const LEFT = ['Оставшийся шаг'];
const OWN = ['grill.md', 'plan.md', 'progress.md', 'approvals.md'];
/** What the executor says in the decisions of the progress, the command cannot know it. */
const SAID = ['Цена', 'Отменено из разбора'];
const QUOTE = /«[^«»]*(?:«[^«»]*»[^«»]*)*»|“[^”]+”|"[^"]+"/g;
const OWNER_WORD = /recommended|владел|одобряю|меню|the owner/i;
/** The lines of the place of work that say where the executor stands. */
const PLACE = /^\s*-\s+\*\*(?:State|Stage|Next step|PR|Состояние|Этап|Следующий шаг):?\*\*/;
/** A quote no longer than this may be the answer to another question: «Да» said twice is two answers. */
const SHORT = 20;
/** Lines of the body that speak to the hosting and to the checks, not to whoever reads the record. */
const SERVICE = /^\s*(?:Closes #\d|🤖|E2E-skip:)/;

class Refused extends Error {}

/** The lines of a text with the mark of a code block: `{ line, code }`, and whether a block is left open. */
function coded(lines) {
    let fence = null;
    const out = lines.map((line) => {
        const mark = line.match(/^\s*(`{3,}|~{3,})/)?.[1];
        const code = fence !== null || Boolean(mark);
        if (mark && fence === null) fence = mark;
        else if (mark && mark[0] === fence[0] && mark.length >= fence.length) fence = null;
        return { line, code };
    });
    return { lines: out, open: fence !== null };
}

/** The sections of a text in their order: `{ name, lines }`, split by `## ` outside code blocks. */
export function sectionsOf(text) {
    const sections = [{ name: null, lines: [] }];
    for (const { line, code } of coded(text.split('\n')).lines) {
        const name = code ? undefined : line.match(/^## (.*\S)\s*$/)?.[1];
        if (name !== undefined) sections.push({ name, lines: [] });
        else sections.at(-1).lines.push(line);
    }
    return sections;
}

const withoutNotes = (text) => text.replace(/<!--[\s\S]*?-->/g, '');
/** The text with the comments and the hints of the sample taken out: what a person wrote there. */
const written = (text) =>
    withoutNotes(text)
        .replace(/<[^<>]*>/g, '')
        .replace(/[>\s]/g, '');

/** The text of every section under one of the names, or null when there is none or they say nothing. */
export function sectionOf(text, names) {
    const found = sectionsOf(text).filter(({ name }) => names.includes(name));
    const body = found
        .map(({ lines }) => lines.join('\n').trim())
        .filter(Boolean)
        .join('\n\n');
    return written(body) === '' ? null : body;
}

const withoutFences = (lines) =>
    coded(lines)
        .lines.filter(({ code }) => !code)
        .map(({ line }) => line);

const indentOf = (line) => line.match(/^\s*/)[0].length;
const isItem = (line) => /^\s*(?:[-*+]|\d+\.)\s/.test(line);
const isQuoted = (line) => /^\s*>/.test(line);
/** The next line that is not empty, from `i`. */
const nextOf = (lines, i) => lines.slice(i).find((line) => line.trim() !== '');

/**
 * The items of lists with all that hangs on them, the rows of tables, the headings and the paragraphs, each whole.
 * What a line ending with a colon announces goes with it: a quote, and a list where the line names the owner.
 */
export function unitsOf(lines) {
    const units = [];
    const text = withoutFences(lines);
    for (let i = 0; i < text.length;) {
        const first = text[i];
        i++;
        if (first.trim() === '') continue;
        const alone = /^(?:\s*\||#+ )/.test(first);
        const unit = [first];
        const depth = indentOf(first);
        let announced = false;
        for (; i < text.length && !alone; i++) {
            const line = text[i];
            const last = unit.findLast((l) => l.trim() !== '');
            const next = nextOf(text, i);
            if (next === undefined || /^#+ /.test(line)) break;
            if (/:\s*$/.test(last) && (isQuoted(next) || (!isItem(first) && isItem(next) && OWNER_WORD.test(unit.join(' ')))))
                announced = true;
            const hangs = announced
                ? isQuoted(next) || (!isItem(first) && isItem(next)) || indentOf(next) > depth
                : isItem(first) && indentOf(next) > depth;
            if (line.trim() === '' ? !hangs : isItem(line) && !hangs) break;
            unit.push(line);
        }
        units.push(unit.join('\n').trimEnd());
    }
    return units;
}

const flat = (text) =>
    text
        .replace(/^\s*>\s?/gm, '')
        .replace(/\s+/g, ' ')
        .trim();

/** The quotes of an item: in quotation marks, and each quoted block whole. */
function quotesOf(unit) {
    const blocks = unit.match(/(?:^\s*>.*\n?)+/gm) ?? [];
    return [...(flat(unit.replace(/`[^`]*`/g, (code) => code.replace(/"/g, ''))).match(QUOTE) ?? []), ...blocks.map(flat)];
}

/** The items that quote the owner and whose quotes the record does not hold yet. */
export function ownerWords(lines, record) {
    const known = flat(record);
    return unitsOf(lines).filter((unit) => {
        const quotes = quotesOf(unit);
        const ofOwner = OWNER_WORD.test(unit) || unit.split('\n').some(isQuoted);
        return (
            ofOwner &&
            !PLACE.test(unit) &&
            !quotes.every((quote) => quote.length > SHORT && known.includes(quote.replace(/^[«“"]|[»”"]$/g, '')))
        );
    });
}

/** What the decisions say under the label, or null for an empty item, a hint and a stub. */
export function saidOf(along, label) {
    const text = withoutNotes(withoutFences(along.split('\n')).join('\n'));
    const said = text.match(new RegExp(`^\\s*-\\s+\\*\\*${label}:\\*\\*[ \\t]*(?:\\n[ \\t]+)?(\\S.*)$`, 'm'))?.[1] ?? '';
    return /\p{L}{2}/u.test(said.replace(/<[^<>]*>/g, '')) && !/^\W*TODO/i.test(said) ? said : null;
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

/** The text of a file with its headings two levels lower, so that they do not end the sections. */
const lowered = (text) =>
    coded(text.trim().split('\n'))
        .lines.map(({ line, code }) => (!code && /^#+ /.test(line) ? `##${line}` : line))
        .join('\n');

/** The grill in the order it was written: `[name, text]`, without what the tree and the rules answer. */
function grillParts(grill) {
    const heading = (name) => (name === null ? 'Шапка разбора' : DECISIONS.includes(name) ? 'Решения разбора' : name);
    return sectionsOf(grill)
        .filter(({ name }) => !OF_TREE.includes(name) && !OF_RULES.includes(name))
        .map(({ name, lines }) => [
            name,
            lines
                .filter((line) => name !== null || !/^# /.test(line))
                .join('\n')
                .trim(),
        ])
        .map(([name, text]) => [
            heading(name),
            name === null
                ? withoutNotes(text)
                      .replace(/^<[^<>]*>/gm, '')
                      .trim()
                : text,
        ]);
}

/** The text of the record. */
export function recordOf({ task, branch, title, date, epic, grill, progress, approvals, approval, body }) {
    for (const [name, text] of Object.entries({ grill, progress, body }))
        if (coded(text.split('\n')).open) throw new Refused(`the ${name} holds a code block that does not end`);
    if (sectionOf(grill, REQUEST) === null) throw new Refused('the grill holds no request of the owner');
    const along = sectionOf(progress, ALONG);
    if (along === null) throw new Refused('the progress holds no decisions along the way: name them there, the price among them');
    for (const label of SAID)
        if (saidOf(along, label) === null)
            throw new Refused(`the decisions of the progress do not say «${label}»: add the item \`- **${label}:** …\``);
    const confirmed = bodySection(body, CONFIRMED);
    const left = bodySection(body, LEFT);
    if (confirmed === null) throw new Refused(`the body holds no section «${CONFIRMED[0]}»`);
    if (left === null) throw new Refused(`the body holds no section «${LEFT[0]}»`);
    const of = epic === null ? '' : ` эпика ${epic}`;
    const parts = [`# ${task} — ${title}`, `Задача ${task}${of}, запись от ${date}. Прежний адрес: \`docs/tasks/${branch}/\`.`];
    const add = (name, text) => text && parts.push(`## ${name}`, text);
    // `check-kit-approval` reads the first line of each kind in the record: the approvals stand before any text.
    add('Согласия владельца по киту', approvals && lowered(approvals));
    for (const [name, text] of grillParts(grill)) add(name, text);
    add('Решения по ходу', along);
    const rest = (text, names) =>
        sectionsOf(text)
            .filter(({ name }) => names(name))
            .flatMap(({ lines }) => [...lines, '']);
    const scattered = [...rest(grill, (name) => OF_TREE.includes(name)), ...rest(progress, (name) => !ALONG.includes(name))];
    add('Цитаты из разбора и хода работы', ownerWords(scattered, [...parts, approval].join('\n\n')).join('\n\n'));
    add('Одобрение плана', approval);
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

/** Writes the record of the branch, takes the folder out and returns the lines to print. */
export function archive({ bodyPath, title, root, date }) {
    const [, of, name] = title.match(/^\s*(?:\[(RT-\d+)\])?\s*(.*\S)?\s*$/);
    if (!name || name.startsWith('--')) throw new Refused("the title of the PR is empty: --title '<title>'");
    if (!bodyPath || !statSync(bodyPath, { throwIfNoEntry: false })?.isFile())
        throw new Refused(`the body of the PR is not on disk: ${bodyPath ?? 'no path given'}`);
    const body = readFileSync(bodyPath, 'utf8');
    const branch = git(['branch', '--show-current'], root).trim();
    const task = branch.match(/^(RT-\d+)-/)?.[1];
    if (!task) throw new Refused(`the branch carries no task number: ${branch || 'no branch is checked out'}`);
    if (of && of !== task) throw new Refused(`the title names ${of}, the branch is of ${task}`);
    const closes = [...body.matchAll(/^Closes #(\d+)/gm)].map(([, number]) => `RT-${number}`);
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
    mkdirSync(join(root, 'docs/archive'), { recursive: true });
    writeFileSync(join(root, record), text);
    try {
        git(['add', '--', record], root);
        git(['rm', '-r', '-q', '--', folder], root);
    } catch (error) {
        answers(['rm', '--cached', '-q', '-f', '--', record], root);
        rmSync(join(root, record), { force: true });
        throw new Refused(`git did not take the folder out, nothing is written: ${String(error.stderr).trim()}`);
    }
    // Every file of the folder was in the commit: only empty directories are left of it.
    rmSync(join(root, folder), { recursive: true, force: true });
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
