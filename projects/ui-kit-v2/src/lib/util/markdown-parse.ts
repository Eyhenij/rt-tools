import { breakNode, parseInline } from './markdown-inline';
import { ERtMarkdownBlock, IRtMarkdownBlockNode, IRtMarkdownInlineNode, IRtMarkdownListItem } from './markdown.model';

/**
 * Разбор текста, написанного разметкой, в дерево узлов показа.
 *
 * Перечень закрыт: заголовки, абзацы, списки, цитаты, код строкой и блоком, таблицы, жирный,
 * курсив, зачёркнутый и ссылка. Всё прочее — сырой HTML, картинки, ссылки чужих схем — узлом не
 * становится и остаётся видимым текстом: вычищать нечего, потому что строить такой узел
 * разборщик не умеет.
 *
 * Одиночный перенос строки внутри абзаца остаётся переносом: тексты пишут деревья, и перенос
 * там ставят осмысленно.
 */

/** Ограда блока кода. */
const FENCE: string = '```';

/** Заголовок: от одной до шести решёток и пробел. */
const HEADING_LINE: RegExp = /^(#{1,6}) (.*)$/;

/** Строка цитаты. */
const QUOTE_LINE: RegExp = /^ {0,3}> ?(.*)$/;

/** Пункт простого списка: отступ задаёт уровень вложенности. */
const BULLET_LINE: RegExp = /^( *)[-*+] (.*)$/;

/** Пункт нумерованного списка. */
const ORDERED_LINE: RegExp = /^( *)\d+[.)] (.*)$/;

/** Знаки, из которых состоит строка-разделитель под шапкой таблицы. */
const DIVIDER_CHARS: readonly string[] = ['|', '-', ':', ' '];

/** Сколько пробелов отступа даёт один уровень вложенности списка. */
const SPACES_PER_LEVEL: number = 2;

/** Ширина отступа, которой заменяется знак табуляции. */
const TAB_WIDTH: string = '  ';

/** Прочитанный блок и место, с которого читать дальше. */
interface IReadBlock {
    readonly next: number;
    readonly block: IRtMarkdownBlockNode;
}

/** Читатель блока: разбирает своё, а на чужом отвечает пустотой. */
type TBlockReader = (lines: readonly string[], start: number) => IReadBlock | null;

/** Блок с пустыми полями: род и то, что этому роду нужно, дописывает читающий. */
function makeBlock(kind: ERtMarkdownBlock, patch: Partial<IRtMarkdownBlockNode>): IRtMarkdownBlockNode {
    return {
        kind,
        level: 0,
        levelName: '',
        content: [],
        items: [],
        ordered: false,
        code: '',
        language: null,
        head: [],
        rows: [],
        ...patch,
    };
}

/** Ячейки строки таблицы: крайние палки не считаются столбцами. */
function tableCells(line: string): IRtMarkdownInlineNode[][] {
    const trimmed: string = line.trim().replace(/^\|/, '').replace(/\|$/, '');

    return trimmed.split('|').map((cell: string): IRtMarkdownInlineNode[] => parseInline(cell.trim()));
}

/** Строка-разделитель под шапкой таблицы. */
function isTableDivider(line: string): boolean {
    const trimmed: string = line.trim();

    return trimmed.includes('-') && [...trimmed].every((char: string): boolean => DIVIDER_CHARS.includes(char));
}

/** Куски нескольких строк подряд, разделённые переносом. */
function joinLines(lines: readonly string[]): IRtMarkdownInlineNode[] {
    const nodes: IRtMarkdownInlineNode[] = [];

    lines.forEach((line: string, index: number): void => {
        if (index > 0) {
            nodes.push(breakNode());
        }

        nodes.push(...parseInline(line));
    });

    return nodes;
}

/** Пункт списка, если эта строка им является. */
function listItemOf(line: string, ordered: boolean): IRtMarkdownListItem | null {
    const match: RegExpExecArray | null = (ordered ? ORDERED_LINE : BULLET_LINE).exec(line);

    if (match === null) {
        return null;
    }

    const level: number = Math.floor(match[1].length / SPACES_PER_LEVEL);

    return { level, levelName: String(level), content: parseInline(match[2]) };
}

/** Блок кода: от ограды до ограды либо до конца текста. */
function readCode(lines: readonly string[], start: number): IReadBlock | null {
    if (!lines[start].startsWith(FENCE)) {
        return null;
    }

    const language: string = lines[start].slice(FENCE.length).trim();
    let end: number = start + 1;

    while (end < lines.length && !lines[end].startsWith(FENCE)) {
        end += 1;
    }

    return {
        next: end < lines.length ? end + 1 : end,
        block: makeBlock(ERtMarkdownBlock.Code, {
            code: lines.slice(start + 1, end).join('\n'),
            language: language === '' ? null : language,
        }),
    };
}

/** Заголовок. */
function readHeading(lines: readonly string[], start: number): IReadBlock | null {
    const match: RegExpExecArray | null = HEADING_LINE.exec(lines[start]);

    if (match === null) {
        return null;
    }

    return {
        next: start + 1,
        block: makeBlock(ERtMarkdownBlock.Heading, {
            level: match[1].length,
            levelName: String(match[1].length),
            content: parseInline(match[2]),
        }),
    };
}

/** Цитата: подряд идущие строки со знаком цитаты. */
function readQuote(lines: readonly string[], start: number): IReadBlock | null {
    if (!QUOTE_LINE.test(lines[start])) {
        return null;
    }

    const taken: string[] = [];
    let end: number = start;

    while (end < lines.length && QUOTE_LINE.test(lines[end])) {
        const match: RegExpExecArray | null = QUOTE_LINE.exec(lines[end]);

        taken.push(match === null ? '' : match[1]);
        end += 1;
    }

    return { next: end, block: makeBlock(ERtMarkdownBlock.Quote, { content: joinLines(taken) }) };
}

/** Список: подряд идущие пункты одного рода. */
function readList(lines: readonly string[], start: number): IReadBlock | null {
    const ordered: boolean = ORDERED_LINE.test(lines[start]);

    if (!ordered && !BULLET_LINE.test(lines[start])) {
        return null;
    }

    const items: IRtMarkdownListItem[] = [];
    let end: number = start;
    let item: IRtMarkdownListItem | null = listItemOf(lines[end], ordered);

    while (item !== null) {
        items.push(item);
        end += 1;
        item = end < lines.length ? listItemOf(lines[end], ordered) : null;
    }

    return { next: end, block: makeBlock(ERtMarkdownBlock.List, { items, ordered }) };
}

/** Таблица: строка шапки, разделитель под ней и строки значений. */
function readTable(lines: readonly string[], start: number): IReadBlock | null {
    const hasDivider: boolean = start + 1 < lines.length && isTableDivider(lines[start + 1]);

    if (!lines[start].includes('|') || !hasDivider) {
        return null;
    }

    const rows: IRtMarkdownInlineNode[][][] = [];
    let end: number = start + 2;

    while (end < lines.length && lines[end].includes('|')) {
        rows.push(tableCells(lines[end]));
        end += 1;
    }

    return { next: end, block: makeBlock(ERtMarkdownBlock.Table, { head: tableCells(lines[start]), rows }) };
}

/** Строки, по которым видно, что абзац кончился и начался блок другого рода. */
const BLOCK_STARTS: readonly RegExp[] = [HEADING_LINE, QUOTE_LINE, BULLET_LINE, ORDERED_LINE];

/** Признак того, что строка начинает блок другого рода. */
function startsOtherBlock(line: string): boolean {
    if (line.trim() === '' || line.startsWith(FENCE)) {
        return true;
    }

    return BLOCK_STARTS.some((start: RegExp): boolean => start.test(line));
}

/** Абзац: строки до пустой строки или до начала блока другого рода. */
function readParagraph(lines: readonly string[], start: number): IReadBlock {
    const taken: string[] = [];
    let end: number = start;

    while (end < lines.length && !startsOtherBlock(lines[end])) {
        taken.push(lines[end]);
        end += 1;
    }

    return { next: end, block: makeBlock(ERtMarkdownBlock.Paragraph, { content: joinLines(taken) }) };
}

/** Порядок читателей: первым отвечает тот, чью разметку строка несёт. */
const BLOCK_READERS: readonly TBlockReader[] = [readCode, readHeading, readTable, readQuote, readList];

/** Блок, начинающийся на этой строке. Ничей — значит абзац. */
function readBlockAt(lines: readonly string[], start: number): IReadBlock {
    for (const reader of BLOCK_READERS) {
        const read: IReadBlock | null = reader(lines, start);

        if (read !== null) {
            return read;
        }
    }

    return readParagraph(lines, start);
}

/**
 * Разбирает текст груза в дерево узлов показа.
 *
 * @param source Текст записи. Пустота и отсутствие значения дают пустой список блоков.
 * @returns Блоки показа по порядку.
 */
export function parseMarkdown(source: string | null | undefined): IRtMarkdownBlockNode[] {
    if (source === null || source === undefined || source.trim() === '') {
        return [];
    }

    const lines: string[] = source
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map((line: string): string => line.replace(/\t/g, TAB_WIDTH));
    const blocks: IRtMarkdownBlockNode[] = [];
    let index: number = 0;

    while (index < lines.length) {
        const read: IReadBlock | null = lines[index].trim() === '' ? null : readBlockAt(lines, index);

        if (read === null) {
            index += 1;
        } else {
            blocks.push(read.block);
            index = read.next;
        }
    }

    return blocks;
}
