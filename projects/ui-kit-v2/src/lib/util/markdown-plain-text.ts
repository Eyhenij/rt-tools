import { parseMarkdown } from './markdown-parse';
import { ERtMarkdownBlock, ERtMarkdownInline, IRtMarkdownBlockNode, IRtMarkdownInlineNode, IRtMarkdownListItem } from './markdown.model';

/** Между блоками — пустая строка, как между абзацами на экране. */
const BLOCK_SEPARATOR: string = '\n\n';

/** Между ячейками строки таблицы — табуляция: так таблицу понимают редакторы и таблицы при вставке. */
const CELL_SEPARATOR: string = '\t';

function inlineText(nodes: readonly IRtMarkdownInlineNode[]): string {
    return nodes
        .map((node: IRtMarkdownInlineNode): string => {
            if (node.kind === ERtMarkdownInline.Break) {
                return '\n';
            }

            return node.children.length > 0 ? inlineText(node.children) : node.text;
        })
        .join('');
}

function tableRow(cells: readonly (readonly IRtMarkdownInlineNode[])[]): string {
    return cells.map((cell: readonly IRtMarkdownInlineNode[]): string => inlineText(cell)).join(CELL_SEPARATOR);
}

function blockText(block: IRtMarkdownBlockNode): string {
    switch (block.kind) {
        case ERtMarkdownBlock.List:
            return block.items.map((item: IRtMarkdownListItem): string => inlineText(item.content)).join('\n');
        case ERtMarkdownBlock.Code:
            return block.code;
        case ERtMarkdownBlock.Table:
            return [block.head, ...block.rows].map(tableRow).join('\n');
        default:
            return inlineText(block.content);
    }
}

/**
 * Видимый текст разметки без её знаков: то, что `rt-markdown-text` показывает читателю.
 *
 * Строится по тому же дереву узлов, что рисует компонент, поэтому `##`, `**`, маркеры списков и
 * черта таблицы в вывод не попадают, а то, что разборщик оставил текстом, остаётся текстом.
 *
 * @param source Текст в разметке. Пустота и отсутствие значения дают пустую строку.
 * @returns Блоки через пустую строку, пункты списка и строки таблицы — построчно, ячейки — через табуляцию.
 */
export function markdownToPlainText(source: string | null | undefined): string {
    return parseMarkdown(source).map(blockText).join(BLOCK_SEPARATOR);
}
