import { ERtMarkdownInline, IRtMarkdownInlineNode } from './markdown.model';

/**
 * Разбор строки на куски: жирный, курсив, зачёркнутый, код и ссылка.
 *
 * Всё, чего в этом перечне нет, остаётся текстом — включая угловые скобки, разметку картинки и
 * ссылку чужой схемы. Вычистки здесь нет и быть не может: разборщик не строит узла, которого не
 * знает, и присланное показывается ровно так, как приехало.
 */

/** Схемы, при которых адрес становится ссылкой. Любая другая ссылкой не становится. */
const ALLOWED_SCHEMES: readonly string[] = ['http://', 'https://', 'mailto:'];

/** Парная разметка: открывающая строка, её род и то, разбираются ли куски внутри. */
interface IPairedMark {
    readonly mark: string;
    readonly kind: ERtMarkdownInline;
    readonly nested: boolean;
}

/**
 * Порядок важен: длинные строки стоят раньше коротких, иначе `**` разберётся двумя `*`.
 * Код стоит первым — внутри него разметка не действует.
 */
const PAIRED_MARKS: readonly IPairedMark[] = [
    { mark: '`', kind: ERtMarkdownInline.Code, nested: false },
    { mark: '**', kind: ERtMarkdownInline.Strong, nested: true },
    { mark: '__', kind: ERtMarkdownInline.Strong, nested: true },
    { mark: '~~', kind: ERtMarkdownInline.Strike, nested: true },
    { mark: '*', kind: ERtMarkdownInline.Emphasis, nested: true },
    { mark: '_', kind: ERtMarkdownInline.Emphasis, nested: true },
];

/**
 * Прочитанный кусок: сколько знаков он занял и каким узлом стал.
 *
 * Пустой узел означает, что знаки остаются видимым текстом: так уходят разметка картинки,
 * ссылка чужой схемы и непарные знаки разметки.
 */
interface ITaken {
    readonly length: number;
    readonly node: IRtMarkdownInlineNode | null;
}

/** Разбор вложенного куска. Передаётся доводом, чтобы файл читался сверху вниз. */
type TNested = (source: string) => IRtMarkdownInlineNode[];

/** Кусок текста. */
function textNode(value: string): IRtMarkdownInlineNode {
    return { kind: ERtMarkdownInline.Text, text: value, children: [], href: null };
}

/** Перенос строки внутри абзаца: одиночный перенос остаётся переносом. */
export function breakNode(): IRtMarkdownInlineNode {
    return { kind: ERtMarkdownInline.Break, text: '', children: [], href: null };
}

/** Адрес, который годится в ссылку. Всё прочее ссылкой не становится. */
function isAllowedHref(value: string): boolean {
    const lowered: string = value.toLowerCase();

    return ALLOWED_SCHEMES.some((scheme: string): boolean => lowered.startsWith(scheme));
}

/** Разметка картинки узлом не становится и остаётся текстом целиком. */
function readImage(source: string, start: number): ITaken | null {
    if (source[start] !== '!' || source[start + 1] !== '[') {
        return null;
    }

    const close: number = source.indexOf(']', start + 2);

    if (close === -1 || source[close + 1] !== '(') {
        return null;
    }

    const end: number = source.indexOf(')', close + 2);

    return end === -1 ? null : { length: end - start + 1, node: null };
}

/** Читает `[текст](адрес)`, начиная с открывающей скобки. */
function readLink(source: string, start: number, nested: TNested): ITaken | null {
    if (source[start] !== '[') {
        return null;
    }

    const close: number = source.indexOf(']', start + 1);

    if (close === -1 || source[close + 1] !== '(') {
        return null;
    }

    const end: number = source.indexOf(')', close + 2);

    if (end === -1) {
        return null;
    }

    const address: string = source.slice(close + 2, end).trim();

    if (!isAllowedHref(address)) {
        return null;
    }

    const label: string = source.slice(start + 1, close);

    return {
        length: end - start + 1,
        node: { kind: ERtMarkdownInline.Link, text: label, children: nested(label), href: address },
    };
}

/** Читает парную разметку, начиная с её открывающей строки. */
function readPaired(source: string, start: number, nested: TNested): ITaken | null {
    const pair: IPairedMark | undefined = PAIRED_MARKS.find((candidate: IPairedMark): boolean => source.startsWith(candidate.mark, start));

    if (pair === undefined) {
        return null;
    }

    const from: number = start + pair.mark.length;
    const close: number = source.indexOf(pair.mark, from);

    if (close === -1 || close === from) {
        return null;
    }

    const inner: string = source.slice(from, close);

    return {
        length: close - start + pair.mark.length,
        node: {
            kind: pair.kind,
            text: pair.nested ? '' : inner,
            children: pair.nested ? nested(inner) : [],
            href: null,
        },
    };
}

/** Кусок, начинающийся в этом месте строки. Пустой узел — знаки остаются текстом. */
function readAt(source: string, index: number, nested: TNested): ITaken {
    const taken: ITaken | null = readImage(source, index) ?? readLink(source, index, nested) ?? readPaired(source, index, nested);

    return taken ?? { length: 1, node: null };
}

/**
 * Разбирает строку на куски показа.
 *
 * @param source Строка без переносов.
 * @returns Куски строки по порядку; у строки без разметки — один кусок текста.
 */
export function parseInline(source: string): IRtMarkdownInlineNode[] {
    const nodes: IRtMarkdownInlineNode[] = [];
    let plain: string = '';
    let index: number = 0;

    const flush: () => void = (): void => {
        if (plain !== '') {
            nodes.push(textNode(plain));
            plain = '';
        }
    };

    while (index < source.length) {
        const taken: ITaken = readAt(source, index, parseInline);

        if (taken.node === null) {
            plain += source.slice(index, index + taken.length);
        } else {
            flush();
            nodes.push(taken.node);
        }

        index += taken.length;
    }

    flush();

    return nodes;
}
