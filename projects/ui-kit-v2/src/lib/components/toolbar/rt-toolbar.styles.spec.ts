import { join } from 'node:path';

import * as sass from 'sass';

/**
 * Ширина отборов в строке объявлена стилями: компонентной спекой её не спросить, jsdom раскладку
 * не считает. Спека компилирует файл полосы и читает собранный CSS; кадр витрины InRowAt1080
 * показывает то же на деле.
 */

const TOOLBAR: string = join(__dirname, 'rt-toolbar.component.scss');

/** Тело первого правила с ровно таким селектором. */
function ruleBody(css: string, selector: string): string {
    const start: number = css.indexOf(`${selector} {`);
    if (start === -1) {
        return '';
    }
    const open: number = css.indexOf('{', start);

    return css.slice(open + 1, css.indexOf('}', open));
}

describe('ширина отборов в строке полосы', (): void => {
    it('SC-UKV-1779 — отбор в левой части шириной по своему содержимому, а не 100% части', (): void => {
        const css: string = sass.compile(TOOLBAR, { style: 'expanded' }).css;
        const select: string = ruleBody(css, '.rt-toolbar__bar--left > rt-select');

        expect(select).toContain('width: auto');
        expect(select).toContain('max-width: 100%');
    });
});
