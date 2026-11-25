/**
 * The text of the record of the closed work: what is taken from the task folder and from the body of the
 * PR. Nothing here touches the disk or git — the command `archive-record.mjs` reads and writes.
 */

const REQUEST = ['Просьба владельца', 'The owner request'];
const DECISIONS = ['Решения', 'Decisions'];
const ALONG = ['Решения по ходу', 'Decisions along the way'];
/** What the grill says of the code and of the rules: the code and the rules answer it later. */
const OF_TREE = ['Что уже есть в дереве', 'What the tree already has'];
const OF_RULES = ['Что говорят правила', 'What the rules already say'];
/** The sections of the progress that tell the course of the work: of them only the quotes are taken. */
const COURSE = /^(?:Where we stand|Где мы|Steps|Шаги|Sessions|Заходы|Handover.*)$/;
const CONFIRMED = ['Чем подтверждено'];
const LEFT = ['Оставшийся шаг'];
/** What the executor says in the decisions of the progress, the command cannot know it. */
const SAID = ['Цена', 'Отменено'];
const QUOTE = /«[^«»]*(?:«[^«»]*»[^«»]*)*»|[“„][^“”„]+[“”]|"[^"]+"/g;
const OWNER_WORD = /recommended|владел|пользовател|одобряю|меню|на вопрос|ответ(?:ил|:)|the owner/i;
/** A quote no longer than this may be the answer to another question: «Да» said twice is two answers. */
const SHORT = 20;
/** Lines of the body that speak to the hosting and to the checks, not to whoever reads the record. */
const SERVICE = /^\s*(?:Closes #\d|🤖|[A-Z]\w*-skip:)/;

export class Refused extends Error {}

/** The lines of a text with the mark of a code block: `{ line, code }`, and whether a block is left open. */
export function coded(lines) {
    let fence = null;
    const out = lines.map((line) => {
        // A fence of backticks carries none after it: ```a``` on one line is a code span.
        const mark =
            fence === null
                ? (line.match(/^\s*(`{3,})[^`]*$/)?.[1] ?? line.match(/^\s*(~{3,})/)?.[1])
                : line.match(/^\s*(`{3,}|~{3,})\s*$/)?.[1];
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

const indentOf = (line) => line.match(/^\s*/)[0].length;
const isItem = (line) => /^\s*(?:[-*+]|\d+\.)\s/.test(line);

/**
 * The blocks of a text in their order: `{ kind, text }` — a heading, an item of a list with all that hangs
 * on it but its code, a row of a table, a code block and a paragraph, each whole.
 */
export function blocksOf(lines) {
    const all = coded(lines).lines;
    const blocks = [];
    const gather = (from, kind, goes) => {
        let to = from + 1;
        while (to < all.length && goes(all[to], to)) to++;
        const text = all.slice(from, to).filter(({ code }) => code === (kind === 'code'));
        blocks.push({
            kind,
            text: text
                .map(({ line }) => line)
                .join('\n')
                .trimEnd(),
        });
        return to;
    };
    const heading = ({ line, code }) => !code && /^#+ /.test(line);
    for (let i = 0; i < all.length;) {
        const { line, code } = all[i];
        const depth = indentOf(line);
        const next = (at) => all.slice(at).find((l) => l.line.trim() !== '')?.line ?? '';
        if (line.trim() === '') i++;
        else if (code) i = gather(i, 'code', (l) => l.code);
        else if (heading(all[i])) i = gather(i, 'heading', () => false);
        else if (/^\s*\|/.test(line)) i = gather(i, 'row', () => false);
        else if (isItem(line))
            i = gather(i, 'item', (l, at) => {
                if (l.line.trim() === '' || l.code || isItem(l.line)) return indentOf(l.code ? l.line : next(at)) > depth;
                return !heading(l);
            });
        else i = gather(i, 'text', (l) => l.line.trim() !== '' && !l.code && !heading(l) && !isItem(l.line));
    }
    return blocks;
}

const flat = (text) =>
    text
        .replace(/^\s*>\s?/gm, '')
        .replace(/\s+/g, ' ')
        .trim();
const bare = (quote) => quote.replace(/^[«“„"]|[»“”"]$/g, '');

/** The quotes of a block: in quotation marks, and each quoted block whole. */
function quotesOf(text) {
    const blocks = text.match(/(?:^\s*>.*\n?)+/gm) ?? [];
    const plain = flat(text.replace(/`[^`]*`/g, (code) => code.replace(/"/g, '')));
    return [...(plain.match(QUOTE) ?? []).map(bare), ...blocks.map(flat)];
}

/** The words of an item around its quotes: «Владелец: «…»» says no more than its quote. */
const around = (text) =>
    flat(text)
        .replace(QUOTE, '')
        .match(/\p{L}+/gu) ?? [];

const isQuoted = (text) => text.split('\n').some((line) => /^\s*>/.test(line));

/**
 * What the lines quote of the owner and the record does not hold yet: a block that names the owner or
 * stands as a quote and carries one, what a line naming the owner announces by a colon, all under
 * a heading that names the owner, and a table whose header does.
 */
export function ownerWords(lines, record) {
    const known = new Set(record.split(/\n\s*\n/).flatMap(quotesOf));
    const taken = [];
    let under = 0;
    let announced = null;
    let before = null;
    for (const block of blocksOf(lines)) {
        const { kind, text } = block;
        const named = OWNER_WORD.test(text);
        const level = kind === 'heading' ? text.match(/^#+/)[0].length : 0;
        if (level > 0 && (under === 0 || level <= under)) under = named ? level : 0;
        if (level > 0) announced = null;
        // A list or a table announced goes to its end, any other block goes alone.
        const goes = under > 0 || announced === 'next' || announced === kind;
        announced = goes && under === 0 && ['item', 'row'].includes(kind) ? kind : null;
        const quotes = quotesOf(text);
        const repeated = quotes.every((quote) => quote.length > SHORT && known.has(quote)) && around(text).length <= 2;
        const own = kind !== 'code' && (named || isQuoted(text)) && quotes.length > 0 && !repeated;
        const lead = named && /:[*_\s]*$/.test(text);
        if (lead) announced = 'next';
        else if (named && kind === 'row' && before !== 'row') announced = 'row';
        if ((goes || own || lead || announced === 'row') && !taken.includes(text)) taken.push(text);
        before = kind;
    }
    return taken;
}

/** What the decisions say under the label, or null for an empty item, a hint and a stub. */
export function saidOf(along, label) {
    const lines = coded(along.split('\n')).lines.filter(({ code }) => !code);
    const text = withoutNotes(lines.map(({ line }) => line).join('\n'));
    const items = text.matchAll(new RegExp(`^\\s*-\\s+\\*\\*${label}:\\*\\*[ \\t]*(?:\\n[ \\t]+)?(\\S.*)$`, 'gm'));
    const says = (said) => /[\p{L}\d]/u.test(said.replace(/<[^<>]*>/g, '')) && !/^(?:\W*TODO|-\s+\*\*)/i.test(said);
    return [...items].map(([, said]) => said).find(says) ?? null;
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
    const heading = (name) => (DECISIONS.includes(name) ? 'Решения разбора' : name);
    // The hint of the sample is a sentence in angle brackets; an address or a key in them is not one.
    const head = (lines) =>
        withoutNotes(lines.filter((line) => !/^# /.test(line)).join('\n'))
            .replace(/^<[^<>]*\s[^<>]*>/gm, '')
            .trim();
    return sectionsOf(grill)
        .filter(({ name }) => !OF_TREE.includes(name) && !OF_RULES.includes(name))
        .map(({ name, lines }) => (name === null ? ['Шапка разбора', head(lines)] : [heading(name), lines.join('\n').trim()]));
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
    add('Решения по ходу', withoutNotes(along).trim());
    const ofProgress = sectionsOf(progress);
    const course = (name) => name === null || COURSE.test(name);
    for (const { name, lines } of ofProgress) if (!course(name) && !ALONG.includes(name)) add(name, withoutNotes(lines.join('\n')).trim());
    const scattered = [...sectionsOf(grill).filter(({ name }) => OF_TREE.includes(name)), ...ofProgress.filter(({ name }) => course(name))];
    const quoted = ownerWords(
        scattered.flatMap(({ name, lines }) => [`## ${name ?? ''}`, ...lines, '']),
        [...parts, approval].join('\n\n')
    );
    add('Цитаты из разбора и хода работы', quoted.join('\n\n'));
    add('Одобрение плана', approval);
    add('Чем подтверждено', confirmed);
    add('Оставшийся шаг', left);
    return `${parts.join('\n\n')}\n`;
}
