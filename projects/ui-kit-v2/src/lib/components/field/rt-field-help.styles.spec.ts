import { join } from 'node:path';

import * as sass from 'sass';

/**
 * Значок «?» у подписи поля не даёт строке подписи своей высоты. Раскладки в jsdom нет, поэтому
 * спрашиваются собранные правила; высоты строк измерены в витрине анатомии поля.
 */

const CSS: string = sass.compile(join(__dirname, 'rt-field.component.scss')).css.replace(/\s+/g, ' ');

function ruleBody(selector: string): string | undefined {
    const at: number = CSS.indexOf(`${selector} {`);

    if (at < 0) {
        return undefined;
    }
    const open: number = CSS.indexOf('{', at);

    return CSS.slice(open + 1, CSS.indexOf('}', open)).trim();
}

describe('значок подсказки у подписи поля', (): void => {
    it('SC-UKV-1636 — кнопка тянется на строку подписи, а не задаёт ей высоту', (): void => {
        const help: string | undefined = ruleBody('.rt-field__help');

        expect(help).toBeDefined();
        expect(help).toContain('align-self: stretch');
        expect(help).toContain('position: relative');
        expect(help).not.toContain('block-size');
    });

    it('SC-UKV-1636 — значок стоит в кнопке абсолютно, по середине строки', (): void => {
        const icon: string | undefined = ruleBody('.rt-field__help > .rt-icon');

        expect(icon).toContain('position: absolute');
        expect(icon).toContain('inset-block-start: 50%');
        expect(icon).toContain('translate: 0 -50%');
    });
});
