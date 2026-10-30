import { join } from 'node:path';

import * as sass from 'sass';

/**
 * Перенос кнопок подвала и окна о несохранённых правках объявлен стилями: компонентной спекой
 * его не спросить, jsdom раскладку не считает. Поэтому спека компилирует оба файла и читает
 * собранный CSS. Ни сборка, ни линтер стилей вернувшийся перенос не видят.
 */

const FOOTER: string = join(__dirname, 'footer', 'rt-aside-footer.component.scss');
const UNSAVED: string = join(__dirname, 'unsaved-dialog', 'rt-aside-unsaved-dialog.component.scss');

function compile(path: string): string {
    return sass.compile(path, { style: 'expanded' }).css;
}

/** Тело первого правила с ровно таким селектором. */
function ruleBody(css: string, selector: string): string {
    const start: number = css.indexOf(`${selector} {`);
    if (start === -1) {
        return '';
    }
    const open: number = css.indexOf('{', start);

    return css.slice(open + 1, css.indexOf('}', open));
}

describe('кнопки подвала панели и окна о несохранённых правках', (): void => {
    it('SC-UKV-1042 — кнопки подвала стоят в одну строку на любой ширине', (): void => {
        const css: string = compile(FOOTER);
        const content: string = ruleBody(css, '.rt-aside-footer__content');

        expect(content).toContain('display: flex');
        expect(content).toContain('flex-wrap: nowrap');
        expect(css).not.toContain('flex-wrap: wrap');
    });

    it('SC-UKV-1043 — кнопки окна стоят в строку, а на телефоне встают столбиком во всю ширину', (): void => {
        const css: string = compile(UNSAVED);
        const footer: string = ruleBody(css, '.rt-aside-unsaved-dialog__footer');
        const phone: number = css.indexOf('@media (width <= 480px)');

        expect(footer).toContain('flex-wrap: nowrap');
        expect(phone).toBeGreaterThan(-1);

        const narrow: string = ruleBody(css.slice(phone), '.rt-aside-unsaved-dialog__footer');
        expect(narrow).toContain('flex-direction: column');
        expect(narrow).toContain('align-items: stretch');
    });
});
