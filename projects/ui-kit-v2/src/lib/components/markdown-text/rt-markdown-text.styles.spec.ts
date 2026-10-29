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
    it('SC-UKV-1066 — текст разметки переносит длинное слово и адрес', (): void => {
        expect(ruleBody(sass.compile(MARKDOWN).css, '.rt-markdown-text')).toContain('overflow-wrap: anywhere');
    });

    it('SC-UKV-1066 — ответ сужается до места в ленте', (): void => {
        expect(ruleBody(sass.compile(ANSWER).css, '.rt-ai-chat-answer')).toContain('min-width: 0');
    });
});
