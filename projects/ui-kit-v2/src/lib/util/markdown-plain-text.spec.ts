import { markdownToPlainText } from './markdown-plain-text';

/**
 * Перевод — чистая функция над деревом разбора: спека зовёт её и читает строку, никого не поднимая.
 */
describe('markdownToPlainText', (): void => {
    it('пустота и отсутствие значения дают пустую строку', (): void => {
        expect(markdownToPlainText('')).toBe('');
        expect(markdownToPlainText(null)).toBe('');
        expect(markdownToPlainText(undefined)).toBe('');
    });

    it('заголовок и разметка строки теряют свои знаки, блоки идут через пустую строку', (): void => {
        expect(markdownToPlainText('## Heading\n\nSome **bold**, _italic_, ~~gone~~ and `code`.')).toBe(
            'Heading\n\nSome bold, italic, gone and code.'
        );
    });

    it('ссылка даёт свой видимый текст без адреса', (): void => {
        expect(markdownToPlainText('See [the report](https://example.com/r).')).toBe('See the report.');
    });

    it('пункты списка идут построчно без маркеров', (): void => {
        expect(markdownToPlainText('- one\n- **two**\n  - nested\n\n1. first\n2. second')).toBe('one\ntwo\nnested\n\nfirst\nsecond');
    });

    it('строки таблицы идут построчно, ячейки — через табуляцию, без черты', (): void => {
        expect(markdownToPlainText('| Hotel | Rooms |\n| --- | --- |\n| North | 12 |')).toBe('Hotel\tRooms\nNorth\t12');
    });

    it('цитата теряет знак, блок кода остаётся как есть', (): void => {
        expect(markdownToPlainText('> quoted\n\n```ts\nconst a = 1;\n```')).toBe('quoted\n\nconst a = 1;');
    });

    it('перенос строки внутри абзаца остаётся переносом', (): void => {
        expect(markdownToPlainText('line one\nline two')).toBe('line one\nline two');
    });
});
