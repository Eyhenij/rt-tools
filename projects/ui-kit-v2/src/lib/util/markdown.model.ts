/**
 * Дерево узлов показа разметки: то, во что разборщик переводит присланный текст.
 *
 * Перечень узлов закрыт. Разборщик не умеет строить ничего, кроме перечисленного здесь, —
 * поэтому сырой HTML, картинки и адреса чужих схем в вывод не попадают вовсе: для них тут
 * просто нет узла, и они остаются видимым текстом.
 */

/** Род блока — то, чем текст разделён по вертикали. */
export enum ERtMarkdownBlock {
    Heading = 'heading',
    Paragraph = 'paragraph',
    List = 'list',
    Quote = 'quote',
    Code = 'code',
    Table = 'table',
}

/** Род куска строки — то, чем текст размечен внутри абзаца. */
export enum ERtMarkdownInline {
    Text = 'text',
    Strong = 'strong',
    Emphasis = 'emphasis',
    Strike = 'strike',
    Code = 'code',
    Link = 'link',
    Break = 'break',
}

/** Кусок строки: либо сам текст, либо разметка вокруг вложенных кусков. */
export interface IRtMarkdownInlineNode {
    readonly kind: ERtMarkdownInline;
    /** Текст куска. У разметки вокруг вложенного — пустая строка. */
    readonly text: string;
    /** Вложенные куски у жирного, курсива и зачёркнутого; у остальных пусто. */
    readonly children: readonly IRtMarkdownInlineNode[];
    /** Адрес ссылки. Стоит только у ссылки и только разрешённой схемы. */
    readonly href: string | null;
}

/** Пункт списка: свои куски строки и уровень вложенности, считая от нуля. */
export interface IRtMarkdownListItem {
    readonly level: number;
    readonly content: readonly IRtMarkdownInlineNode[];
}

/** Блок показа. Поля, которых у этого рода нет, стоят пустыми. */
export interface IRtMarkdownBlockNode {
    readonly kind: ERtMarkdownBlock;
    /** Уровень заголовка, от 1 до 6. У остальных родов — 0. */
    readonly level: number;
    /** Куски строки у заголовка, абзаца и цитаты. */
    readonly content: readonly IRtMarkdownInlineNode[];
    /** Пункты списка. */
    readonly items: readonly IRtMarkdownListItem[];
    /** Признак нумерованного списка. */
    readonly ordered: boolean;
    /** Текст блока кода как есть, без разбора разметки внутри. */
    readonly code: string;
    /** Слово языка у ограды блока кода. Разбирается, но на вид не влияет. */
    readonly language: string | null;
    /** Строка заголовка таблицы: ячейка — свои куски строки. */
    readonly head: readonly (readonly IRtMarkdownInlineNode[])[];
    /** Прочие строки таблицы. */
    readonly rows: readonly (readonly (readonly IRtMarkdownInlineNode[])[])[];
}
