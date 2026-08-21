import { parseMarkdown } from './markdown-parse';
import { ERtMarkdownBlock, ERtMarkdownInline, IRtMarkdownBlockNode, IRtMarkdownInlineNode } from './markdown.model';

/**
 * Разборщик — чистая функция: спека зовёт её и читает дерево узлов, никого не поднимая.
 *
 * Проверяются обе стороны перечня: что каждый его пункт становится своим узлом и что всё, чего в
 * перечне нет, узлом не становится и остаётся текстом. Одной первой стороны мало — тест,
 * утверждающий отсутствие, зелен и тогда, когда ищет не то.
 */

/** Первый блок разбора: у всех этих примеров он единственный. */
function firstBlock(source: string): IRtMarkdownBlockNode {
    return parseMarkdown(source)[0];
}

/** Весь видимый текст дерева кусков — без разметки, одной строкой. */
function plainText(nodes: readonly IRtMarkdownInlineNode[]): string {
    return nodes.map((node: IRtMarkdownInlineNode): string => (node.children.length > 0 ? plainText(node.children) : node.text)).join('');
}

/** Роды кусков по порядку — так видно, что разобралось, а что осталось текстом. */
function kinds(nodes: readonly IRtMarkdownInlineNode[]): ERtMarkdownInline[] {
    return nodes.map((node: IRtMarkdownInlineNode): ERtMarkdownInline => node.kind);
}

describe('parseMarkdown', (): void => {
    describe('пустой текст', (): void => {
        it('пустая строка даёт пустой список блоков', (): void => {
            expect(parseMarkdown('')).toEqual([]);
        });

        it('строка из одних пробелов даёт пустой список блоков', (): void => {
            expect(parseMarkdown('   \n  \n')).toEqual([]);
        });

        it('отсутствие значения даёт пустой список блоков', (): void => {
            expect(parseMarkdown(null)).toEqual([]);
            expect(parseMarkdown(undefined)).toEqual([]);
        });
    });

    describe('перечень разметки', (): void => {
        it('заголовок становится заголовком своего уровня, а решётки в текст не попадают', (): void => {
            const block: IRtMarkdownBlockNode = firstBlock('### Разбор с разметкой');

            expect(block.kind).toBe(ERtMarkdownBlock.Heading);
            expect(block.level).toBe(3);
            expect(plainText(block.content)).toBe('Разбор с разметкой');
        });

        it('жирный, курсив и зачёркнутый становятся своими кусками', (): void => {
            const block: IRtMarkdownBlockNode = firstBlock('**жирно** и *косо* и ~~вычеркнуто~~');

            expect(kinds(block.content)).toEqual([
                ERtMarkdownInline.Strong,
                ERtMarkdownInline.Text,
                ERtMarkdownInline.Emphasis,
                ERtMarkdownInline.Text,
                ERtMarkdownInline.Strike,
            ]);
            expect(plainText(block.content)).toBe('жирно и косо и вычеркнуто');
        });

        it('код строкой становится куском кода, а разметка внутри него не действует', (): void => {
            const block: IRtMarkdownBlockNode = firstBlock('зовётся `**не жирным**`');

            expect(kinds(block.content)).toEqual([ERtMarkdownInline.Text, ERtMarkdownInline.Code]);
            expect(block.content[1].text).toBe('**не жирным**');
        });

        it('простой список становится списком с пунктами', (): void => {
            const block: IRtMarkdownBlockNode = firstBlock('- первое\n- второе\n- третье');

            expect(block.kind).toBe(ERtMarkdownBlock.List);
            expect(block.ordered).toBe(false);
            expect(block.items.length).toBe(3);
            expect(plainText(block.items[1].content)).toBe('второе');
        });

        it('нумерованный список отличается от простого признаком, а не видом пунктов', (): void => {
            const block: IRtMarkdownBlockNode = firstBlock('1. первое\n2. второе');

            expect(block.kind).toBe(ERtMarkdownBlock.List);
            expect(block.ordered).toBe(true);
            expect(block.items.length).toBe(2);
        });

        it('отступ пункта становится уровнем вложенности', (): void => {
            const block: IRtMarkdownBlockNode = firstBlock('- первое\n  - вложенное\n    - глубже');

            expect(block.items.map((item: { readonly level: number }): number => item.level)).toEqual([0, 1, 2]);
        });

        it('таблица становится таблицей с шапкой и строками', (): void => {
            const block: IRtMarkdownBlockNode = firstBlock('| Что | Где |\n| --- | --- |\n| разбор | дерево |\n| груз | приём |');

            expect(block.kind).toBe(ERtMarkdownBlock.Table);
            expect(block.head.length).toBe(2);
            expect(plainText(block.head[0])).toBe('Что');
            expect(block.rows.length).toBe(2);
            expect(plainText(block.rows[1][1])).toBe('приём');
        });

        it('блок кода несёт своё содержимое как есть и слово языка отдельно', (): void => {
            const block: IRtMarkdownBlockNode = firstBlock('```bash\nnpm run check:all\n# и второй строкой\n```');

            expect(block.kind).toBe(ERtMarkdownBlock.Code);
            expect(block.language).toBe('bash');
            expect(block.code).toBe('npm run check:all\n# и второй строкой');
        });

        it('блок кода без ограды снизу читается до конца текста', (): void => {
            const block: IRtMarkdownBlockNode = firstBlock('```\nодна строка');

            expect(block.kind).toBe(ERtMarkdownBlock.Code);
            expect(block.code).toBe('одна строка');
            expect(block.language).toBeNull();
        });

        it('цитата собирает подряд идущие строки в один блок', (): void => {
            const block: IRtMarkdownBlockNode = firstBlock('> первая\n> вторая');

            expect(block.kind).toBe(ERtMarkdownBlock.Quote);
            expect(kinds(block.content)).toEqual([ERtMarkdownInline.Text, ERtMarkdownInline.Break, ERtMarkdownInline.Text]);
            expect(plainText(block.content)).toBe('перваявторая');
        });

        it('ссылка на внешний адрес становится ссылкой', (): void => {
            const block: IRtMarkdownBlockNode = firstBlock('см. [разбор](https://example.test/one)');

            expect(kinds(block.content)).toEqual([ERtMarkdownInline.Text, ERtMarkdownInline.Link]);
            expect(block.content[1].href).toBe('https://example.test/one');
            expect(plainText([block.content[1]])).toBe('разбор');
        });

        it('почтовый адрес ссылкой становится тоже', (): void => {
            const block: IRtMarkdownBlockNode = firstBlock('[почта](mailto:owner@example.test)');

            expect(block.content[0].kind).toBe(ERtMarkdownInline.Link);
            expect(block.content[0].href).toBe('mailto:owner@example.test');
        });
    });

    describe('то, чего в перечне нет', (): void => {
        it('строка скрипта остаётся текстом целиком', (): void => {
            const block: IRtMarkdownBlockNode = firstBlock('<script>window.ran = true;</script>');

            expect(block.kind).toBe(ERtMarkdownBlock.Paragraph);
            expect(kinds(block.content)).toEqual([ERtMarkdownInline.Text]);
            expect(plainText(block.content)).toBe('<script>window.ran = true;</script>');
        });

        it('парный тег начертания остаётся текстом вместе со скобками', (): void => {
            const block: IRtMarkdownBlockNode = firstBlock('<b>жирным это не становится</b>');

            expect(kinds(block.content)).toEqual([ERtMarkdownInline.Text]);
            expect(plainText(block.content)).toBe('<b>жирным это не становится</b>');
        });

        it('картинка узлом не становится и остаётся текстом', (): void => {
            const block: IRtMarkdownBlockNode = firstBlock('![подпись](https://example.test/one.png)');

            expect(kinds(block.content)).toEqual([ERtMarkdownInline.Text]);
            expect(plainText(block.content)).toBe('![подпись](https://example.test/one.png)');
        });

        it('ссылка чужой схемы ссылкой не становится', (): void => {
            const block: IRtMarkdownBlockNode = firstBlock('[нажми](javascript:alert)');

            expect(kinds(block.content)).toEqual([ERtMarkdownInline.Text]);
            expect(plainText(block.content)).toBe('[нажми](javascript:alert)');
        });

        it('относительный адрес ссылкой не становится', (): void => {
            const block: IRtMarkdownBlockNode = firstBlock('[сюда](/api/postmortems)');

            expect(kinds(block.content)).toEqual([ERtMarkdownInline.Text]);
            expect(plainText(block.content)).toBe('[сюда](/api/postmortems)');
        });

        it('непарный знак разметки остаётся текстом', (): void => {
            const block: IRtMarkdownBlockNode = firstBlock('ставка **пять процентов');

            expect(kinds(block.content)).toEqual([ERtMarkdownInline.Text]);
            expect(plainText(block.content)).toBe('ставка **пять процентов');
        });
    });

    describe('строки и абзацы', (): void => {
        it('одиночный перенос строки остаётся переносом', (): void => {
            const block: IRtMarkdownBlockNode = firstBlock('Дано разбор приехал\nКогда владелец открыл\nТогда он видит');

            expect(block.kind).toBe(ERtMarkdownBlock.Paragraph);
            expect(kinds(block.content)).toEqual([
                ERtMarkdownInline.Text,
                ERtMarkdownInline.Break,
                ERtMarkdownInline.Text,
                ERtMarkdownInline.Break,
                ERtMarkdownInline.Text,
            ]);
        });

        it('пустая строка делит текст на два абзаца', (): void => {
            const blocks: IRtMarkdownBlockNode[] = parseMarkdown('первый абзац\n\nвторой абзац');

            expect(blocks.length).toBe(2);
            expect(plainText(blocks[0].content)).toBe('первый абзац');
            expect(plainText(blocks[1].content)).toBe('второй абзац');
        });

        it('текст без единого знака разметки остаётся одним абзацем', (): void => {
            const blocks: IRtMarkdownBlockNode[] = parseMarkdown('Правило списка не называет, чем меряется пустота.');

            expect(blocks.length).toBe(1);
            expect(blocks[0].kind).toBe(ERtMarkdownBlock.Paragraph);
            expect(plainText(blocks[0].content)).toBe('Правило списка не называет, чем меряется пустота.');
        });

        it('разбор целиком читает блоки по порядку', (): void => {
            const blocks: IRtMarkdownBlockNode[] = parseMarkdown('# Заголовок\n\nабзац\n\n- пункт\n\n> цитата\n\n```\nкод\n```');

            expect(blocks.map((block: IRtMarkdownBlockNode): ERtMarkdownBlock => block.kind)).toEqual([
                ERtMarkdownBlock.Heading,
                ERtMarkdownBlock.Paragraph,
                ERtMarkdownBlock.List,
                ERtMarkdownBlock.Quote,
                ERtMarkdownBlock.Code,
            ]);
        });
    });
});
