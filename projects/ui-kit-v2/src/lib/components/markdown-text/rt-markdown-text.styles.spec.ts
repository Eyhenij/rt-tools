import { join } from 'node:path';

import * as sass from 'sass';

/**
 * Перенос длинного слова объявлен стилем: поднять его спекой не на чем, кроме собранного CSS.
 *
 * Без переноса адрес в ответе ассистента шире своего места, и лента на телефоне едет вбок. Ни
 * сборка, ни линтер стилей этого не видят.
 */

const MARKDOWN: string = join(__dirname, 'rt-markdown-text.component.scss');
const ANSWER: string = join(__dirname, '../../../rich-editor/lib/components/ai-chat/answer/rt-ai-chat-answer.component.scss');

/** Тело правила с таким селектором, без вложенных в него правил. */
function ruleBody(css: string, selector: string): string {
    const at: number = css.indexOf(`${selector} {`);
    if (at < 0) {
        return '';
    }

    const opened: number = css.indexOf('{', at);

    return css.slice(opened + 1, css.indexOf('}', opened));
}

describe('стили переноса в ответе', (): void => {
    it('SC-UKV-1075 — текст разметки переносит длинное слово и адрес', (): void => {
        expect(ruleBody(sass.compile(MARKDOWN).css, '.rt-markdown-text')).toContain('overflow-wrap: anywhere');
    });

    it('SC-UKV-1075 — ответ сужается до места в ленте', (): void => {
        expect(ruleBody(sass.compile(ANSWER).css, '.rt-ai-chat-answer')).toContain('min-width: 0');
    });
});

describe('стили таблицы markdown', (): void => {
    const css: string = sass.compile(MARKDOWN).css;

    it('SC-UKV-1417 — таблица в виде блока: нижние границы, шапка на поверхности, без предела высоты и закрепления', (): void => {
        const cell: string = ruleBody(css, '.rt-markdown-text__head-cell, .rt-markdown-text__cell');

        expect(cell).toContain('height: 27px');
        expect(cell).toContain('border-bottom:');
        expect(cell).not.toContain('border: ');
        expect(ruleBody(css, '.rt-markdown-text__head-cell')).toContain('background: var(--rt-color-bg-surface)');
        expect(ruleBody(css, '.rt-markdown-text__table-scroll')).toContain('overflow-x: auto');
        expect(css).not.toContain('max-height');
        expect(css).not.toContain('position: sticky');
    });

    it('SC-UKV-1416 — края столбца по разделителю логические', (): void => {
        expect(ruleBody(css, '.rt-markdown-text__head-cell--end, .rt-markdown-text__cell--end')).toContain('text-align: end');
        expect(ruleBody(css, '.rt-markdown-text__head-cell--center, .rt-markdown-text__cell--center')).toContain('text-align: center');
    });
});
