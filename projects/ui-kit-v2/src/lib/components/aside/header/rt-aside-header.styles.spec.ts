import { join } from 'node:path';

import * as sass from 'sass';

/**
 * Колонка заголовка шапки встаёт на линию стрелки стилями: jsdom раскладку не считает, поэтому
 * спека компилирует файл и читает собранный CSS. Ни сборка, ни линтер стилей вернувшуюся колонку
 * без высоты не видят.
 */

const HEADER: string = join(__dirname, 'rt-aside-header.component.scss');

/** Тело первого правила с ровно таким селектором. */
function ruleBody(css: string, selector: string): string {
    const start: number = css.indexOf(`${selector} {`);
    if (start === -1) {
        return '';
    }
    const open: number = css.indexOf('{', start);

    return css.slice(open + 1, css.indexOf('}', open));
}

describe('колонка заголовка шапки панели', (): void => {
    it('SC-UKV-1091 — колонка не ниже кнопки возврата и держит заголовок посередине', (): void => {
        const css: string = sass.compile(HEADER, { style: 'expanded' }).css;
        const heading: string = ruleBody(css, '.rt-aside-header__heading');
        const back: string = ruleBody(css, '.rt-aside-header .rt-aside-header__back .rt-icon-button');

        expect(heading).toContain('min-height: var(--rt-aside-header-back-size, var(--rt-control-height-sm))');
        expect(heading).toContain('justify-content: center');
        expect(back).toContain('var(--rt-aside-header-back-size, var(--rt-control-height-sm))');
    });
});
